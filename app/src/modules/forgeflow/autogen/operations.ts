/**
 * AutoGen Studio Operations
 * 
 * This file provides API operations for AutoGen Studio integration.
 */

import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import { z } from 'zod';
import { ensureArgsSchemaOrThrowHttpError } from '@src/server/validation';
import { LoggingService } from '@src/shared/services/logging';
import { requirePermission } from '@src/api/middleware/rbac';
import { workflowTemplates, agentTemplates } from './templates';
import { simulateStudioWorkflowExecution } from './autogenStudio';

/**
 * Get AutoGen Studio agent templates
 */
export const getAutoGenAgentTemplates = async (args: any, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to access agent templates');
  }
  
  // Apply RBAC
  requirePermission(context.user, 'forgeflow:read');
  
  try {
    // Convert the templates to an array with IDs
    const templates = Object.entries(agentTemplates).map(([key, template]) => ({
      id: key,
      ...template,
    }));
    
    return templates;
  } catch (error) {
    LoggingService.error({
      message: 'Error getting AutoGen agent templates',
      module: 'forgeflow',
      category: 'AUTOGEN_STUDIO',
      error,
      metadata: {
        userId: context.user.id,
      },
    });
    
    throw new HttpError(500, 'Failed to get agent templates');
  }
};

/**
 * Get AutoGen Studio workflow templates
 */
export const getAutoGenWorkflowTemplates = async (args: any, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to access workflow templates');
  }
  
  // Apply RBAC
  requirePermission(context.user, 'forgeflow:read');
  
  try {
    // Convert the templates to an array with IDs
    const templates = Object.entries(workflowTemplates).map(([key, template]) => ({
      id: key,
      ...template,
    }));
    
    return templates;
  } catch (error) {
    LoggingService.error({
      message: 'Error getting AutoGen workflow templates',
      module: 'forgeflow',
      category: 'AUTOGEN_STUDIO',
      error,
      metadata: {
        userId: context.user.id,
      },
    });
    
    throw new HttpError(500, 'Failed to get workflow templates');
  }
};

/**
 * Create an AutoGen Studio workflow
 */
export const createAutoGenWorkflow = async (args: any, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to create a workflow');
  }
  
  // Apply RBAC
  requirePermission(context.user, 'forgeflow:create');
  
  const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().min(1, 'Description is required'),
    templateId: z.string().optional(),
    agents: z.array(z.object({
      id: z.string().optional(),
      templateId: z.string().optional(),
      name: z.string().min(1, 'Agent name is required'),
      role: z.string().min(1, 'Agent role is required'),
      description: z.string().min(1, 'Agent description is required'),
      systemMessage: z.string().min(1, 'System message is required'),
      model: z.object({
        provider: z.enum(['openai', 'groq', 'gemini']),
        name: z.string().min(1, 'Model name is required'),
        temperature: z.number().min(0).max(1),
        maxTokens: z.number().optional(),
      }),
      tools: z.array(z.object({
        name: z.string().min(1, 'Tool name is required'),
        description: z.string().min(1, 'Tool description is required'),
        parameters: z.object({
          type: z.literal('object'),
          properties: z.record(z.object({
            type: z.string(),
            description: z.string(),
            enum: z.array(z.string()).optional(),
          })),
          required: z.array(z.string()),
        }),
      })).optional(),
      isHuman: z.boolean().optional(),
    })).min(1, 'At least one agent is required'),
    config: z.object({
      maxRounds: z.number().min(1),
      maxMessages: z.number().min(1),
      memoryType: z.enum(['none', 'basic', 'advanced']),
      humanInTheLoop: z.boolean(),
    }),
    tasks: z.array(z.object({
      id: z.string().optional(),
      name: z.string().min(1, 'Task name is required'),
      description: z.string().min(1, 'Task description is required'),
      agentId: z.string().min(1, 'Agent ID is required'),
      input: z.string().min(1, 'Input is required'),
      expectedOutput: z.string().optional(),
      dependsOn: z.array(z.string()).optional(),
    })).optional(),
    visualization: z.object({
      layout: z.enum(['circular', 'force', 'grid']),
      showMessages: z.boolean(),
      showAgentStatus: z.boolean(),
    }),
  });
  
  const validatedArgs = ensureArgsSchemaOrThrowHttpError(schema, args);
  
  try {
    // Create the workflow in the database
    const workflow = await prisma.autoGenWorkflow.create({
      data: {
        name: validatedArgs.name,
        description: validatedArgs.description,
        userId: context.user.id,
        templateId: validatedArgs.templateId,
        config: validatedArgs.config,
        agents: validatedArgs.agents,
        tasks: validatedArgs.tasks || [],
        visualization: validatedArgs.visualization,
      },
    });
    
    LoggingService.info({
      message: `Created AutoGen workflow: ${workflow.name}`,
      userId: context.user.id,
      module: 'forgeflow',
      category: 'AUTOGEN_STUDIO',
      metadata: {
        workflowId: workflow.id,
        workflowName: workflow.name,
        agentCount: validatedArgs.agents.length,
        taskCount: validatedArgs.tasks?.length || 0,
      },
    });
    
    return workflow;
  } catch (error) {
    LoggingService.error({
      message: 'Error creating AutoGen workflow',
      userId: context.user.id,
      module: 'forgeflow',
      category: 'AUTOGEN_STUDIO',
      error,
      metadata: {
        workflowName: validatedArgs.name,
      },
    });
    
    throw new HttpError(500, 'Failed to create workflow');
  }
};

/**
 * Execute an AutoGen Studio workflow
 */
export const executeAutoGenWorkflow = async (args: any, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to execute a workflow');
  }
  
  // Apply RBAC
  requirePermission(context.user, 'forgeflow:execute');
  
  const schema = z.object({
    workflowId: z.string().min(1, 'Workflow ID is required'),
    input: z.string().min(1, 'Input is required'),
    options: z.object({
      maxRounds: z.number().optional(),
      humanFeedback: z.boolean().optional(),
    }).optional(),
  });
  
  const validatedArgs = ensureArgsSchemaOrThrowHttpError(schema, args);
  
  try {
    // Get the workflow from the database
    const workflow = await prisma.autoGenWorkflow.findUnique({
      where: {
        id: validatedArgs.workflowId,
        userId: context.user.id,
      },
    });
    
    if (!workflow) {
      throw new HttpError(404, 'Workflow not found');
    }
    
    // Create a workflow execution record
    const workflowExecution = await prisma.autoGenWorkflowExecution.create({
      data: {
        workflowId: workflow.id,
        status: 'running',
        input: validatedArgs.input,
        options: validatedArgs.options || {},
      },
    });
    
    try {
      // Execute the workflow
      const result = await simulateStudioWorkflowExecution(
        workflow as any,
        validatedArgs.input,
        {
          userId: context.user.id,
          maxRounds: validatedArgs.options?.maxRounds || workflow.config.maxRounds,
        }
      );
      
      // Update the workflow execution record
      await prisma.autoGenWorkflowExecution.update({
        where: {
          id: workflowExecution.id,
        },
        data: {
          status: 'completed',
          completedAt: new Date(),
          output: result.output,
          messages: result.messages,
          executionTime: result.executionTime,
        },
      });
      
      // Log successful execution
      LoggingService.info({
        message: `Workflow execution completed: ${workflow.name}`,
        userId: context.user.id,
        module: 'forgeflow',
        category: 'AUTOGEN_STUDIO',
        metadata: {
          workflowId: workflow.id,
          executionId: workflowExecution.id,
          status: 'completed',
          executionTime: result.executionTime,
          messageCount: result.messages.length,
        },
      });
      
      return {
        executionId: workflowExecution.id,
        result,
      };
    } catch (error) {
      // Update the workflow execution record with the error
      await prisma.autoGenWorkflowExecution.update({
        where: {
          id: workflowExecution.id,
        },
        data: {
          status: 'failed',
          completedAt: new Date(),
          error: error.message,
        },
      });
      
      throw error;
    }
  } catch (error) {
    LoggingService.error({
      message: 'Error executing AutoGen workflow',
      userId: context.user.id,
      module: 'forgeflow',
      category: 'AUTOGEN_STUDIO',
      error,
      metadata: {
        workflowId: validatedArgs.workflowId,
        input: validatedArgs.input.substring(0, 100) + (validatedArgs.input.length > 100 ? '...' : ''),
      },
    });
    
    throw new HttpError(500, 'Failed to execute workflow');
  }
};
