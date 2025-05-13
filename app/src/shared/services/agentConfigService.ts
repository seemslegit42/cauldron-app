/**
 * Agent Configuration Service
 * 
 * This service provides functions for managing agent configurations across modules.
 * It handles fetching, updating, and previewing agent configurations.
 */

import { prisma } from 'wasp/server';
import { HttpError } from 'wasp/server';
import type { AgentConfig } from '../components/ai/AgentConfigPanel';

/**
 * Get agent configuration for a module
 * 
 * @param userId - User ID
 * @param moduleId - Module ID
 * @param agentName - Agent name
 * @returns Agent configuration
 */
export const getAgentConfig = async (
  userId: string,
  moduleId: string,
  agentName: string
): Promise<AgentConfig> => {
  try {
    // First check for user-specific override
    const userConfig = await prisma.moduleConfig.findFirst({
      where: {
        userId,
        moduleId,
        name: `agent-config-${agentName}`,
        isActive: true,
      },
    });

    if (userConfig) {
      return userConfig.config as AgentConfig;
    }

    // If no user config, check for organization config
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });

    if (user?.organizationId) {
      const orgConfig = await prisma.moduleConfig.findFirst({
        where: {
          organizationId: user.organizationId,
          moduleId,
          name: `agent-config-${agentName}`,
          isActive: true,
        },
      });

      if (orgConfig) {
        return orgConfig.config as AgentConfig;
      }
    }

    // If no config found, get the agent's default config
    const agent = await prisma.aI_Agent.findFirst({
      where: {
        name: agentName,
      },
    });

    if (agent) {
      return agent.configuration as unknown as AgentConfig;
    }

    // If no agent found, return default config
    return getDefaultAgentConfig(moduleId, agentName);
  } catch (error) {
    console.error(`Error getting agent config for ${moduleId}/${agentName}:`, error);
    throw new HttpError(500, `Failed to get agent configuration: ${error.message}`);
  }
};

/**
 * Update agent configuration
 * 
 * @param userId - User ID
 * @param moduleId - Module ID
 * @param agentName - Agent name
 * @param config - New configuration
 * @param isUserOverride - Whether this is a user override (vs. organization default)
 * @returns Updated agent configuration
 */
export const updateAgentConfig = async (
  userId: string,
  moduleId: string,
  agentName: string,
  config: AgentConfig,
  isUserOverride: boolean = false
): Promise<AgentConfig> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });

    if (isUserOverride) {
      // Update or create user-specific config
      const updatedConfig = await prisma.moduleConfig.upsert({
        where: {
          moduleId_name_userId: {
            moduleId,
            name: `agent-config-${agentName}`,
            userId,
          },
        },
        update: {
          config: config as any,
          isActive: true,
        },
        create: {
          moduleId,
          name: `agent-config-${agentName}`,
          userId,
          config: config as any,
          isActive: true,
        },
      });

      return updatedConfig.config as AgentConfig;
    } else if (user?.organizationId) {
      // Update or create organization config
      const updatedConfig = await prisma.moduleConfig.upsert({
        where: {
          moduleId_name_organizationId: {
            moduleId,
            name: `agent-config-${agentName}`,
            organizationId: user.organizationId,
          },
        },
        update: {
          config: config as any,
          isActive: true,
        },
        create: {
          moduleId,
          name: `agent-config-${agentName}`,
          organizationId: user.organizationId,
          config: config as any,
          isActive: true,
        },
      });

      return updatedConfig.config as AgentConfig;
    } else {
      throw new HttpError(400, 'User must belong to an organization to update organization-level config');
    }
  } catch (error) {
    console.error(`Error updating agent config for ${moduleId}/${agentName}:`, error);
    throw new HttpError(500, `Failed to update agent configuration: ${error.message}`);
  }
};

/**
 * Generate a preview of agent response with given configuration
 * 
 * @param moduleId - Module ID
 * @param agentName - Agent name
 * @param config - Agent configuration to preview
 * @param prompt - Prompt to use for preview
 * @returns Preview response
 */
export const previewAgentConfig = async (
  moduleId: string,
  agentName: string,
  config: AgentConfig,
  prompt: string
): Promise<string> => {
  try {
    // This would typically call the AI service with the given configuration
    // For now, we'll simulate a response based on the configuration
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let response = `[Preview of ${agentName} with temperature=${config.temperature}, verbosity=${config.verbosity}]\n\n`;
    
    // Adjust response based on personality
    switch (config.personality) {
      case 'professional':
        response += "I've analyzed the data and prepared a concise summary for your review.";
        break;
      case 'friendly':
        response += "Hey there! I took a look at this and thought you might find these insights helpful!";
        break;
      case 'technical':
        response += "Analysis complete. The following data points indicate significant patterns that warrant attention.";
        break;
      case 'creative':
        response += "Imagine your business as a ship navigating through changing waters. Here's what I see on the horizon...";
        break;
    }
    
    // Adjust response based on verbosity
    if (config.verbosity === 'minimal') {
      response += "\n\n• Key point 1\n• Key point 2\n• Key point 3";
    } else if (config.verbosity === 'moderate') {
      response += "\n\n1. First insight with brief explanation\n2. Second insight with context\n3. Third insight with recommendations";
    } else {
      response += "\n\n## Detailed Analysis\n\nThe data shows several important trends:\n\n1. First trend with comprehensive explanation and supporting evidence\n2. Second trend with historical context and future implications\n3. Third trend with multiple action items and strategic considerations";
    }
    
    return response;
  } catch (error) {
    console.error(`Error previewing agent config for ${moduleId}/${agentName}:`, error);
    throw new HttpError(500, `Failed to preview agent configuration: ${error.message}`);
  }
};

/**
 * Get default agent configuration for a module
 * 
 * @param moduleId - Module ID
 * @param agentName - Agent name
 * @returns Default agent configuration
 */
export const getDefaultAgentConfig = (moduleId: string, agentName: string): AgentConfig => {
  // Default configuration
  const defaultConfig: AgentConfig = {
    temperature: 0.7,
    verbosity: 'moderate',
    personality: 'professional',
    requireApproval: true,
    approvalThreshold: 'medium',
    autoApproveLevel: 'low',
    alertingEnabled: true,
    alertThresholds: {
      latency: 3000, // 3 seconds
      errorRate: 5, // 5%
      tokenUsage: 80, // 80% of budget
    },
    maxTokens: 1000,
    topP: 0.95,
    presencePenalty: 0,
    frequencyPenalty: 0,
    model: 'llama3-70b-8192',
    provider: 'GROQ',
  };

  // Customize based on module and agent
  switch (moduleId) {
    case 'arcana':
      return {
        ...defaultConfig,
        personality: 'professional',
        verbosity: 'moderate',
      };
    case 'phantom':
      return {
        ...defaultConfig,
        personality: 'technical',
        verbosity: 'detailed',
        requireApproval: true,
        approvalThreshold: 'high',
      };
    case 'athena':
      return {
        ...defaultConfig,
        personality: 'professional',
        verbosity: 'detailed',
        temperature: 0.5,
      };
    case 'forgeflow':
      return {
        ...defaultConfig,
        personality: 'technical',
        verbosity: 'moderate',
      };
    case 'manifold':
      return {
        ...defaultConfig,
        personality: 'creative',
        verbosity: 'detailed',
        temperature: 0.8,
      };
    case 'sentinel':
      return {
        ...defaultConfig,
        personality: 'technical',
        verbosity: 'minimal',
        temperature: 0.3,
        requireApproval: true,
        approvalThreshold: 'critical',
      };
    default:
      return defaultConfig;
  }
};
