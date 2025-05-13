/**
 * Prompt-to-Query Service
 *
 * This service converts natural language prompts to safe Prisma queries.
 * It uses AI to generate queries and validates them against schema maps.
 */

import { prisma } from 'wasp/server';
import { HttpError } from 'wasp/server';
import { LoggingService } from '../../shared/services/logging';
import { QuerySandboxService } from './querySandboxService';
import { SentientQueryService } from './sentientQueryService';
import { QueryPerformanceService } from './queryPerformanceService';
import {
  QueryPermissionLevel,
  QueryApprovalStatus,
  AgentQueryRequest
} from '../../shared/types/entities/agentQuery';
import { generateGroqCompletion } from '../../ai-services/groq';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

// Define the schema for prompt-to-query options
const promptToQueryOptionsSchema = z.object({
  maxTokens: z.number().optional().default(1000),
  temperature: z.number().optional().default(0.2),
  autoApprove: z.boolean().optional().default(false),
  useTemplates: z.boolean().optional().default(true),
  useSandbox: z.boolean().optional().default(true),
  includeMetadata: z.boolean().optional().default(true),
  includeFieldDescriptions: z.boolean().optional().default(true),
  model: z.string().optional().default('llama3-70b-8192'),
  maxRetries: z.number().int().min(0).max(3).optional().default(1),
});

// Define the type for prompt-to-query options
type PromptToQueryOptions = z.infer<typeof promptToQueryOptionsSchema>;

/**
 * Prompt-to-Query Service
 */
export class PromptToQueryService {
  /**
   * Convert a natural language prompt to a Prisma query
   */
  static async promptToQuery(
    agentId: string,
    userId: string,
    sessionId: string | undefined,
    prompt: string,
    options: PromptToQueryOptions = {}
  ): Promise<{
    success: boolean;
    queryRequestId?: string;
    error?: string;
    status?: QueryApprovalStatus;
  }> {
    try {
      // Merge options with defaults
      const mergedOptions = promptToQueryOptionsSchema.parse(options);

      // Get the agent
      const agent = await prisma.aI_Agent.findUnique({
        where: { id: agentId },
        include: {
          queryPermissions: {
            include: {
              schemaMap: true,
            },
          },
        },
      });

      if (!agent) {
        return { success: false, error: 'Agent not found' };
      }

      // Check if the agent has query permissions
      if (agent.queryPermissions.length === 0) {
        return { success: false, error: 'Agent has no query permissions' };
      }

      // Get the schema maps for the agent
      const schemaMaps = agent.queryPermissions.map(permission => permission.schemaMap);

      // Check if any schema maps are active
      if (!schemaMaps.some(schemaMap => schemaMap.isActive)) {
        return { success: false, error: 'No active schema maps found for the agent' };
      }

      // Check if the agent has reached the daily query limit
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const queryCount = await prisma.agentQueryRequest.count({
        where: {
          agentId,
          createdAt: {
            gte: today,
          },
        },
      });

      const maxQueriesPerDay = Math.min(
        ...agent.queryPermissions.map(permission => permission.maxQueriesPerDay)
      );

      if (queryCount >= maxQueriesPerDay) {
        return { success: false, error: 'Daily query limit reached' };
      }

      // Check if we should use templates
      let generatedQuery = '';
      let targetModel = '';
      let action = '';
      let queryParams = {};

      if (mergedOptions.useTemplates) {
        // Try to match the prompt to a template
        const templateMatch = await this.matchPromptToTemplate(prompt);

        if (templateMatch.success) {
          generatedQuery = templateMatch.query;
          targetModel = templateMatch.targetModel;
          action = templateMatch.action;
          queryParams = templateMatch.params;
        } else {
          // If no template match, generate a query using AI
          const aiGenerated = await this.generateQueryWithAI(
            prompt,
            schemaMaps,
            mergedOptions
          );

          if (!aiGenerated.success) {
            return { success: false, error: aiGenerated.error };
          }

          generatedQuery = aiGenerated.query;
          targetModel = aiGenerated.targetModel;
          action = aiGenerated.action;
          queryParams = aiGenerated.params;
        }
      } else {
        // Generate a query using AI
        const aiGenerated = await this.generateQueryWithAI(
          prompt,
          schemaMaps,
          mergedOptions
        );

        if (!aiGenerated.success) {
          return { success: false, error: aiGenerated.error };
        }

        generatedQuery = aiGenerated.query;
        targetModel = aiGenerated.targetModel;
        action = aiGenerated.action;
        queryParams = aiGenerated.params;
      }

      // Validate the generated query
      const validation = await QuerySandboxService.validateQuery(
        agentId,
        targetModel,
        action,
        queryParams
      );

      if (!validation.valid) {
        return {
          success: false,
          error: `Query validation failed: ${validation.errors?.join(', ')}`
        };
      }

      // Determine if the query requires approval
      const requiresApproval = agent.queryPermissions.some(permission =>
        permission.allowedModels.includes(targetModel) &&
        permission.requiresApproval
      );

      // Determine if the query is complex and should be escalated
      const isComplexQuery = this.isComplexQuery(targetModel, action, queryParams);

      // Create the query request
      const queryRequest = await prisma.agentQueryRequest.create({
        data: {
          agentId,
          userId,
          sessionId,
          prompt,
          generatedQuery,
          targetModel,
          action,
          queryParams,
          status: mergedOptions.autoApprove && !requiresApproval && !isComplexQuery
            ? QueryApprovalStatus.AUTO_APPROVED
            : QueryApprovalStatus.PENDING,
          validationResults: validation,
          metadata: {
            isComplexQuery,
            requiresSentientLoop: requiresApproval || isComplexQuery,
            generatedAt: new Date().toISOString(),
            generationModel: options.model,
          },
        },
      });

      // If the query requires approval or is complex, process it through Sentient Loop™
      if (requiresApproval || isComplexQuery) {
        // Process the query through Sentient Loop™
        const sentientResult = await SentientQueryService.processQueryThroughSentientLoop(queryRequest.id);

        if (!sentientResult.success) {
          LoggingService.error({
            message: 'Failed to process query through Sentient Loop™',
            category: 'AGENT_QUERY',
            metadata: {
              queryRequestId: queryRequest.id,
              error: sentientResult.error,
            },
          });

          // Continue without Sentient Loop™ integration if it fails
          // The query will still be in PENDING status and can be approved manually
        } else {
          // Update the query request with the Sentient Loop™ checkpoint ID
          await prisma.agentQueryRequest.update({
            where: { id: queryRequest.id },
            data: {
              metadata: {
                ...(queryRequest.metadata as any || {}),
                sentientCheckpointId: sentientResult.checkpointId,
              },
            },
          });
        }
      } else if (mergedOptions.autoApprove) {
        // If auto-approved, execute the query
        await QuerySandboxService.executeQuery(queryRequest.id);
      }

      return {
        success: true,
        queryRequestId: queryRequest.id,
        status: queryRequest.status as QueryApprovalStatus,
        requiresApproval: requiresApproval || isComplexQuery,
      };
    } catch (error) {
      console.error('Error converting prompt to query:', error);
      return { success: false, error: 'Internal error converting prompt to query' };
    }
  }

  /**
   * Match a prompt to a query template
   */
  private static async matchPromptToTemplate(prompt: string): Promise<{
    success: boolean;
    query?: string;
    targetModel?: string;
    action?: string;
    params?: Record<string, any>;
    error?: string;
  }> {
    try {
      // Get all active templates
      const templates = await prisma.queryTemplate.findMany({
        where: {
          isActive: true,
        },
      });

      if (templates.length === 0) {
        return { success: false, error: 'No active templates found' };
      }

      // Use AI to match the prompt to a template
      const systemPrompt = `
        You are a query template matcher. Your task is to match a user's natural language query to one of the available templates.
        If there's a good match, extract the parameters from the user's query and fill in the template.
        If there's no good match, respond with "NO_MATCH".

        Available templates:
        ${templates.map(template => `
          Template ID: ${template.id}
          Name: ${template.name}
          Description: ${template.description || 'No description'}
          Target Model: ${template.targetModel}
          Action: ${template.action}
          Template: ${template.template}
          Parameter Schema: ${JSON.stringify(template.parameterSchema)}
        `).join('\n\n')}
      `;

      const userPrompt = `Match this query: "${prompt}"`;

      const completion = await generateGroqCompletion({
        systemPrompt,
        prompt: userPrompt,
        maxTokens: 1000,
        temperature: 0.2,
        model: 'llama3-70b-8192',
      });

      if (completion.includes('NO_MATCH')) {
        return { success: false, error: 'No matching template found' };
      }

      // Parse the completion to extract the template ID and parameters
      const templateIdMatch = completion.match(/Template ID: ([a-f0-9-]+)/i);
      const paramsMatch = completion.match(/Parameters:\s*({[\s\S]*})/);

      if (!templateIdMatch || !paramsMatch) {
        return { success: false, error: 'Failed to parse template match' };
      }

      const templateId = templateIdMatch[1];
      let params;

      try {
        params = JSON.parse(paramsMatch[1]);
      } catch (error) {
        return { success: false, error: 'Failed to parse template parameters' };
      }

      // Get the template
      const template = templates.find(t => t.id === templateId);

      if (!template) {
        return { success: false, error: 'Template not found' };
      }

      // Fill in the template with the parameters
      let query = template.template;

      for (const [key, value] of Object.entries(params)) {
        query = query.replace(`{{${key}}}`, JSON.stringify(value));
      }

      return {
        success: true,
        query,
        targetModel: template.targetModel,
        action: template.action,
        params,
      };
    } catch (error) {
      console.error('Error matching prompt to template:', error);
      return { success: false, error: 'Internal error matching prompt to template' };
    }
  }

  /**
   * Generate a query using AI
   */
  private static async generateQueryWithAI(
    prompt: string,
    schemaMaps: any[],
    options: PromptToQueryOptions
  ): Promise<{
    success: boolean;
    query?: string;
    targetModel?: string;
    action?: string;
    params?: Record<string, any>;
    error?: string;
  }> {
    try {
      // Create a detailed schema map for the AI
      const schemaMapString = schemaMaps
        .filter(schemaMap => schemaMap.isActive)
        .map(schemaMap => {
          return `Schema Map: ${schemaMap.name} (${schemaMap.description || 'No description'})
            ${Object.entries(schemaMap.schema).map(([model, schema]) => {
              const modelSchema = schema as any;

              // Build field descriptions if enabled
              let fieldDescriptions = '';
              if (options.includeFieldDescriptions && modelSchema.fieldTypes) {
                fieldDescriptions = `\nField Types:\n${
                  Object.entries(modelSchema.fieldTypes)
                    .map(([field, type]) => `  - ${field}: ${type}`)
                    .join('\n')
                }`;
              }

              // Build relations if available
              let relations = '';
              if (modelSchema.relations) {
                relations = `\nRelations:\n${
                  Object.entries(modelSchema.relations)
                    .map(([field, relation]) => {
                      const rel = relation as any;
                      return `  - ${field}: ${rel.type} relation to ${rel.model} via ${rel.foreignKey}`;
                    })
                    .join('\n')
                }`;
              }

              // Build constraints if available
              let constraints = '';
              if (modelSchema.constraints) {
                constraints = `\nConstraints:\n${
                  Object.entries(modelSchema.constraints)
                    .map(([constraintType, constraint]) => {
                      if (Array.isArray(constraint)) {
                        return `  - ${constraintType}: ${JSON.stringify(constraint)}`;
                      }
                      return `  - ${constraintType}: ${constraint}`;
                    })
                    .join('\n')
                }`;
              }

              return `Model: ${model}
                Actions: ${modelSchema.actions?.join(', ') || 'None'}
                Allowed Fields: ${modelSchema.allowedFields?.join(', ') || 'None'}
                Required Fields: ${modelSchema.requiredFields?.join(', ') || 'None'}${fieldDescriptions}${relations}${constraints}
              `;
            }).join('\n\n')}
          `;
        })
        .join('\n\n');

      // Create a system prompt for the AI with examples and guidelines
      const systemPrompt = `
        You are a query generator that converts natural language prompts to Prisma queries.
        Your task is to generate a valid Prisma query based on the user's prompt and the available schema maps.

        AVAILABLE SCHEMA MAPS:
        ${schemaMapString}

        GUIDELINES:
        1. Only use models and fields that are explicitly listed in the schema maps.
        2. Respect the allowed actions for each model.
        3. Include required fields in create operations.
        4. Use appropriate filters based on the user's intent.
        5. For security reasons, limit the number of results to 100 by default unless specified otherwise.
        6. Use appropriate sorting and pagination when relevant.
        7. For relations, use the correct syntax (e.g., include, connect, create).
        8. Avoid complex nested queries unless necessary.

        EXAMPLES:

        Example 1:
        User prompt: "Show me the latest 5 system logs"
        Response:
        {
          "targetModel": "SystemLog",
          "action": "findMany",
          "params": {
            "take": 5,
            "orderBy": {
              "timestamp": "desc"
            }
          }
        }

        Example 2:
        User prompt: "Count how many active users we have"
        Response:
        {
          "targetModel": "User",
          "action": "count",
          "params": {
            "where": {
              "isActive": true
            }
          }
        }

        YOUR RESPONSE FORMAT:
        {
          "targetModel": "The Prisma model to query",
          "action": "The Prisma action to perform (findMany, findUnique, etc.)",
          "params": {
            // The query parameters as a JSON object
          }
        }

        Only respond with valid JSON. Do not include any other text in your response.
      `;

      // Generate the query with retry logic
      let completion = '';
      let retryCount = 0;
      let success = false;

      while (retryCount <= options.maxRetries && !success) {
        try {
          // Generate the query
          completion = await generateGroqCompletion({
            systemPrompt,
            prompt,
            maxTokens: options.maxTokens,
            temperature: options.temperature + (retryCount * 0.05), // Slightly increase temperature on retries
            model: options.model,
          });

          // Try to parse the completion
          const jsonMatch = completion.match(/({[\s\S]*})/);
          if (jsonMatch) {
            JSON.parse(jsonMatch[1]); // Just to validate it's parseable
            success = true;
          } else {
            retryCount++;
          }
        } catch (error) {
          console.warn(`Retry ${retryCount} failed:`, error);
          retryCount++;
        }
      }

      if (!success) {
        return { success: false, error: 'Failed to generate a valid query after multiple attempts' };
      }

      // Parse the completion as JSON
      let parsedCompletion;

      try {
        // Extract JSON from the completion (in case there's any extra text)
        const jsonMatch = completion.match(/({[\s\S]*})/);

        if (!jsonMatch) {
          return { success: false, error: 'Failed to extract JSON from AI response' };
        }

        parsedCompletion = JSON.parse(jsonMatch[1]);
      } catch (error) {
        return { success: false, error: 'Failed to parse AI response as JSON' };
      }

      // Validate the parsed completion
      if (!parsedCompletion.targetModel || !parsedCompletion.action || !parsedCompletion.params) {
        return { success: false, error: 'AI response is missing required fields' };
      }

      // Validate that the model exists in the schema maps
      const modelExists = schemaMaps.some(schemaMap =>
        Object.keys(schemaMap.schema).includes(parsedCompletion.targetModel)
      );

      if (!modelExists) {
        return { success: false, error: `Model '${parsedCompletion.targetModel}' does not exist in the schema maps` };
      }

      // Generate the query string
      const query = `prisma.${parsedCompletion.targetModel.toLowerCase()}.${parsedCompletion.action}(${JSON.stringify(parsedCompletion.params, null, 2)})`;

      // Log the successful query generation
      LoggingService.debug({
        message: 'Successfully generated query from prompt',
        category: 'AGENT_QUERY',
        metadata: {
          prompt,
          targetModel: parsedCompletion.targetModel,
          action: parsedCompletion.action,
          generatedQuery: query
        }
      });

      return {
        success: true,
        query,
        targetModel: parsedCompletion.targetModel,
        action: parsedCompletion.action,
        params: parsedCompletion.params,
      };
    } catch (error) {
      console.error('Error generating query with AI:', error);
      return { success: false, error: 'Internal error generating query with AI' };
    }
  }

  /**
   * Determine if a query is complex and should be escalated
   *
   * @param targetModel The target model
   * @param action The query action
   * @param params The query parameters
   * @returns Whether the query is complex
   */
  private static isComplexQuery(
    targetModel: string,
    action: string,
    params: Record<string, any>
  ): boolean {
    // Check if the model is sensitive
    const sensitiveModels = [
      'User', 'Organization', 'APIKey', 'CredentialStore', 'SentientLoopApiKey',
      'Subscription', 'SubscriptionInvoice'
    ];

    if (sensitiveModels.includes(targetModel)) {
      // All write operations on sensitive models are complex
      if (['create', 'update', 'delete', 'upsert'].includes(action)) {
        return true;
      }

      // Read operations on sensitive models with no filters are complex
      if (['findMany', 'count'].includes(action) &&
          (!params.where || Object.keys(params.where).length === 0)) {
        return true;
      }
    }

    // All bulk operations are complex
    if (['updateMany', 'deleteMany'].includes(action)) {
      return true;
    }

    // Check for complex nested queries
    if (params.include) {
      const includeCount = Object.keys(params.include).length;
      if (includeCount > 2) {
        return true;
      }

      // Check for nested includes (includes within includes)
      for (const key in params.include) {
        if (params.include[key] && typeof params.include[key] === 'object' && params.include[key].include) {
          return true;
        }
      }
    }

    // Check for complex where clauses
    if (params.where) {
      // Check for OR conditions
      if (params.where.OR && Array.isArray(params.where.OR) && params.where.OR.length > 1) {
        return true;
      }

      // Check for NOT conditions
      if (params.where.NOT) {
        return true;
      }

      // Check for complex nested where clauses
      const whereKeys = Object.keys(params.where);
      if (whereKeys.length > 5) {
        return true;
      }

      // Check for relational filters
      for (const key in params.where) {
        if (
          params.where[key] &&
          typeof params.where[key] === 'object' &&
          (params.where[key].some || params.where[key].every || params.where[key].none)
        ) {
          return true;
        }
      }
    }

    // Check for complex ordering
    if (params.orderBy && Array.isArray(params.orderBy) && params.orderBy.length > 2) {
      return true;
    }

    return false;
  }
}
