import { prisma } from 'wasp/server';
import type {
  AgentSession,
  ModuleState,
  AI_Agent,
  InteractionMemory
} from '@prisma/client';

/**
 * Schema Enhancement Utilities
 *
 * This utility provides methods for migrating existing data to the enhanced schema.
 */
export class SchemaEnhancementUtils {
  /**
   * Migrate existing agent sessions to the enhanced schema
   * This will add default values for new fields
   */
  static async migrateAgentSessions(): Promise<number> {
    const sessions = await prisma.agentSession.findMany();
    let migratedCount = 0;

    for (const session of sessions) {
      try {
        // Extract session purpose from context if available
        let sessionPurpose: string | undefined;
        let sessionTags: string[] = [];

        if (session.context) {
          const context = session.context as Record<string, any>;
          sessionPurpose = context.purpose || context.intent || context.goal;

          if (context.tags && Array.isArray(context.tags)) {
            sessionTags = context.tags;
          } else if (context.categories && Array.isArray(context.categories)) {
            sessionTags = context.categories;
          }
        }

        // Update the session with new fields
        await prisma.agentSession.update({
          where: { id: session.id },
          data: {
            sessionPurpose,
            sessionTags,
            sessionSource: 'user', // Default assumption
            qualityScore: null,
            userSatisfaction: null,
            learningOutcomes: null
          }
        });

        migratedCount++;
      } catch (error) {
        console.error(`Error migrating session ${session.id}:`, error);
      }
    }

    return migratedCount;
  }

  /**
   * Migrate existing module states to the enhanced schema
   * This will add default values for new fields
   */
  static async migrateModuleStates(): Promise<number> {
    const states = await prisma.moduleState.findMany();
    let migratedCount = 0;

    for (const state of states) {
      try {
        // Generate a hash of the state for quick comparison
        const stateHash = Buffer.from(JSON.stringify(state.state)).toString('base64');

        // Update the state with new fields
        await prisma.moduleState.update({
          where: { id: state.id },
          data: {
            stateHash,
            stateType: 'module_state', // Default type
            isSnapshot: false,
            snapshotReason: null,
            expiresAt: null
          }
        });

        migratedCount++;
      } catch (error) {
        console.error(`Error migrating state ${state.id}:`, error);
      }
    }

    return migratedCount;
  }

  /**
   * Migrate existing AI agents to the enhanced schema
   * This will add default values for new fields
   */
  static async migrateAgents(): Promise<number> {
    const agents = await prisma.aI_Agent.findMany();
    let migratedCount = 0;

    for (const agent of agents) {
      try {
        // Extract specializations from capabilities if available
        let specializations: string[] = [];

        if (agent.capabilities && Array.isArray(agent.capabilities)) {
          specializations = agent.capabilities;
        }

        // Update the agent with new fields
        await prisma.aI_Agent.update({
          where: { id: agent.id },
          data: {
            lastActiveAt: agent.updatedAt,
            totalSessions: 0, // Will be updated later
            successRate: null,
            specializations,
            learningMode: 'passive', // Default mode
            trainingStatus: 'initial', // Default status
            versionHistory: null
          }
        });

        // Create an initial agent version
        await prisma.agentVersion.create({
          data: {
            agentId: agent.id,
            versionNumber: '1.0.0',
            changes: {
              initialVersion: true,
              configuration: agent.configuration
            },
            createdById: agent.userId,
            isActive: true,
            activatedAt: agent.createdAt
          }
        });

        migratedCount++;
      } catch (error) {
        console.error(`Error migrating agent ${agent.id}:`, error);
      }
    }

    return migratedCount;
  }

  /**
   * Migrate existing interaction memories to the enhanced schema
   * This will add default values for new fields
   */
  static async migrateMemories(): Promise<number> {
    const memories = await prisma.interactionMemory.findMany();
    let migratedCount = 0;

    for (const memory of memories) {
      try {
        // Determine memory type based on existing type field
        let memoryType: string | undefined;

        switch (memory.type.toLowerCase()) {
          case 'fact':
          case 'knowledge':
            memoryType = 'fact';
            break;
          case 'preference':
          case 'setting':
            memoryType = 'preference';
            break;
          case 'interaction':
          case 'conversation':
            memoryType = 'interaction';
            break;
          default:
            memoryType = undefined;
        }

        // Update the memory with new fields
        await prisma.interactionMemory.update({
          where: { id: memory.id },
          data: {
            memoryType,
            confidence: memory.importance, // Use importance as initial confidence
            lastAccessedAt: memory.createdAt,
            accessCount: 0,
            sourceType: 'user_input', // Default assumption
            verificationStatus: 'unverified',
            relatedMemories: null
          }
        });

        migratedCount++;
      } catch (error) {
        console.error(`Error migrating memory ${memory.id}:`, error);
      }
    }

    return migratedCount;
  }

  /**
   * Update agent session counts
   * This will count the number of sessions for each agent and update the totalSessions field
   */
  static async updateAgentSessionCounts(): Promise<number> {
    const agents = await prisma.aI_Agent.findMany({
      select: { id: true }
    });
    let updatedCount = 0;

    for (const agent of agents) {
      try {
        // Count sessions for this agent
        const sessionCount = await prisma.agentSession.count({
          where: { agentId: agent.id }
        });

        // Update the agent with the session count
        await prisma.aI_Agent.update({
          where: { id: agent.id },
          data: {
            totalSessions: sessionCount
          }
        });

        updatedCount++;
      } catch (error) {
        console.error(`Error updating session count for agent ${agent.id}:`, error);
      }
    }

    return updatedCount;
  }

  /**
   * Migrate existing AI reasonings to the enhanced schema
   * This will add default values for new fields
   */
  static async migrateAIReasonings(): Promise<number> {
    const reasonings = await prisma.aIReasoning.findMany({
      take: 100, // Process in batches to avoid memory issues
      orderBy: { createdAt: 'desc' }
    });
    let migratedCount = 0;

    for (const reasoning of reasonings) {
      try {
        // Extract reasoning steps from the steps field
        const steps = reasoning.steps as any[];

        // Create reasoning steps
        if (steps && Array.isArray(steps)) {
          for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            await prisma.aIReasoningStep.create({
              data: {
                reasoningId: reasoning.id,
                stepNumber: i + 1,
                stepType: step.type || 'thought',
                content: step.content || JSON.stringify(step),
                tokens: step.tokens,
                duration: step.duration,
                metadata: step.metadata
              }
            });
          }
        }

        // Extract reasoning chain from metadata if available
        let reasoningChain: any = undefined;
        if (reasoning.metadata) {
          const metadata = reasoning.metadata as Record<string, any>;
          reasoningChain = metadata.reasoningChain || metadata.chain_of_thought;
        }

        // Create reasoning context
        if (reasoningChain) {
          await prisma.aIReasoningContext.create({
            data: {
              reasoningId: reasoning.id,
              contextType: 'reasoning_chain',
              content: typeof reasoningChain === 'string' ? reasoningChain : JSON.stringify(reasoningChain),
              source: 'ai_reasoning',
              relevanceScore: 1.0
            }
          });
        }

        migratedCount++;
      } catch (error) {
        console.error(`Error migrating reasoning ${reasoning.id}:`, error);
      }
    }

    return migratedCount;
  }

  /**
   * Migrate existing AI prompts to the enhanced schema
   * This will add default values for new fields and create templates
   */
  static async migrateAIPrompts(): Promise<number> {
    const prompts = await prisma.aIPrompt.findMany({
      take: 100, // Process in batches to avoid memory issues
      orderBy: { createdAt: 'desc' }
    });
    let migratedCount = 0;

    for (const prompt of prompts) {
      try {
        // Check if this prompt has template variables
        if (prompt.templateVariables) {
          // Create a template from this prompt
          const template = await prisma.aIPromptTemplate.create({
            data: {
              name: prompt.name || `Template for ${prompt.id}`,
              description: prompt.description,
              version: prompt.version,
              content: prompt.content,
              placeholders: Object.keys(prompt.templateVariables as Record<string, any>),
              exampleValues: prompt.templateVariables,
              module: prompt.module,
              category: prompt.category,
              tags: prompt.tags,
              isActive: prompt.isActive,
              safetyScore: prompt.safetyScore,
              estimatedTokens: prompt.estimatedTokens,
              createdById: prompt.createdById,
              organizationId: prompt.organizationId
            }
          });

          // Update the prompt to link to the template
          await prisma.aIPrompt.update({
            where: { id: prompt.id },
            data: {
              templateId: template.id,
              templateValues: prompt.templateVariables
            }
          });
        }

        migratedCount++;
      } catch (error) {
        console.error(`Error migrating prompt ${prompt.id}:`, error);
      }
    }

    return migratedCount;
  }

  /**
   * Create model versions for existing reasonings
   */
  static async createModelVersions(): Promise<number> {
    // Get distinct models used in reasonings
    const models = await prisma.aIReasoning.findMany({
      select: {
        model: true
      },
      distinct: ['model']
    });

    let createdCount = 0;

    for (const { model } of models) {
      try {
        if (!model) continue;

        // Parse model name and provider
        const modelParts = model.split('-');
        const modelName = modelParts[0];
        const provider = model.includes('llama') ? 'groq' :
                        model.includes('gpt') ? 'openai' :
                        model.includes('claude') ? 'anthropic' : 'unknown';

        // Create model version
        await prisma.aIModelVersion.create({
          data: {
            modelName,
            provider,
            version: model,
            capabilities: [],
            isActive: true
          }
        });

        createdCount++;
      } catch (error) {
        console.error(`Error creating model version for ${model}:`, error);
      }
    }

    return createdCount;
  }

  /**
   * Run all migration utilities
   */
  static async migrateAll(): Promise<Record<string, number>> {
    const results = {
      sessions: await this.migrateAgentSessions(),
      states: await this.migrateModuleStates(),
      agents: await this.migrateAgents(),
      memories: await this.migrateMemories(),
      sessionCounts: await this.updateAgentSessionCounts(),
      reasonings: await this.migrateAIReasonings(),
      prompts: await this.migrateAIPrompts(),
      modelVersions: await this.createModelVersions()
    };

    return results;
  }
}

export default SchemaEnhancementUtils;
