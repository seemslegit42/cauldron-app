/**
 * Agent Configuration API Operations
 * 
 * This file defines the API operations for managing agent configurations.
 */

import { z } from 'zod';
import { HttpError } from 'wasp/server';
import { 
  getAgentConfig, 
  updateAgentConfig, 
  previewAgentConfig 
} from '../services/agentConfigService';

// Schema for agent configuration
export const agentConfigSchema = z.object({
  // Basic settings
  temperature: z.number().min(0).max(1),
  verbosity: z.enum(['minimal', 'moderate', 'detailed']),
  personality: z.enum(['professional', 'friendly', 'technical', 'creative']),
  
  // Approval workflow settings
  requireApproval: z.boolean(),
  approvalThreshold: z.enum(['low', 'medium', 'high', 'critical']),
  autoApproveLevel: z.enum(['none', 'low', 'medium', 'high']),
  
  // Alert settings
  alertingEnabled: z.boolean(),
  alertThresholds: z.object({
    latency: z.number().min(100).max(10000),
    errorRate: z.number().min(1).max(100),
    tokenUsage: z.number().min(1).max(100),
  }),
  
  // Advanced settings
  maxTokens: z.number().min(10).max(8192),
  topP: z.number().min(0.1).max(1),
  presencePenalty: z.number().min(-2).max(2),
  frequencyPenalty: z.number().min(-2).max(2),
  
  // Model settings
  model: z.string(),
  provider: z.enum(['OPENAI', 'GROQ', 'ANTHROPIC', 'OTHER']),
});

// Get agent configuration
export const getAgentConfigOperation = async ({ moduleId, agentName }, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authorized');
  }

  return getAgentConfig(context.user.id, moduleId, agentName);
};

// Update agent configuration
export const updateAgentConfigOperation = async ({ moduleId, agentName, config, isUserOverride }, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authorized');
  }

  // Validate config
  try {
    agentConfigSchema.parse(config);
  } catch (error) {
    throw new HttpError(400, `Invalid configuration: ${error.message}`);
  }

  return updateAgentConfig(context.user.id, moduleId, agentName, config, isUserOverride);
};

// Preview agent configuration
export const previewAgentConfigOperation = async ({ moduleId, agentName, config, prompt }, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authorized');
  }

  // Validate config
  try {
    agentConfigSchema.parse(config);
  } catch (error) {
    throw new HttpError(400, `Invalid configuration: ${error.message}`);
  }

  return previewAgentConfig(moduleId, agentName, config, prompt);
};

// Reset agent configuration to defaults
export const resetAgentConfigOperation = async ({ moduleId, agentName, isUserOverride }, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authorized');
  }

  // Get default config
  const defaultConfig = await getAgentConfig(context.user.id, moduleId, agentName);

  // Update with default config
  return updateAgentConfig(context.user.id, moduleId, agentName, defaultConfig, isUserOverride);
};
