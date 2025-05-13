/**
 * Prompt Tracking Utilities
 *
 * This module provides utilities for tracking AI prompts, reasoning chains,
 * and response trees during AI operations.
 */

import { prisma } from 'wasp/server';
import { PromptReasoningService } from './promptReasoningService';
import { estimateTokenCount } from '../shared/utils/tokenUtils';

/**
 * Interface for tracking AI operations
 */
export interface AIOperationTracking {
  sessionId: string;
  promptId?: string;
  systemPromptId?: string;
  agentId?: string;
  userId: string;
  module: string;
  sessionType: string;
}

/**
 * Interface for AI operation results
 */
export interface AIOperationResult {
  rawOutput: string;
  parsedOutput?: any;
  steps?: any[];
  model: string;
  temperature: number;
  maxTokens?: number;
  totalTokens?: number;
  promptTokens?: number;
  completionTokens?: number;
  latencyMs?: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * Interface for response node data
 */
export interface ResponseNodeData {
  content: string;
  type: string;
  order: number;
  parentId?: string;
  metadata?: Record<string, any>;
  confidence?: number;
}

/**
 * Create a new AI session for tracking
 */
export async function createAITrackingSession(
  userId: string,
  module: string,
  sessionType: string,
  agentId?: string,
  metadata?: Record<string, any>
): Promise<string> {
  const session = await PromptReasoningService.createSession({
    userId,
    agentId,
    module,
    sessionType,
    status: 'active',
    metadata,
  });

  return session.id;
}

/**
 * Store a prompt for tracking
 */
export async function storePromptForTracking(
  userId: string,
  content: string,
  module: string,
  type: string,
  options: {
    name?: string;
    description?: string;
    version?: string;
    category?: string;
    tags?: string[];
    templateVariables?: Record<string, any>;
    organizationId?: string;
    context?: any;
  } = {}
): Promise<string> {
  // Estimate token count
  const estimatedTokens = estimateTokenCount(content);

  // Calculate safety score using the enhanced service
  const safetyScore = await calculateSafetyScore(content, options.context, userId, module);

  const prompt = await PromptReasoningService.createPrompt(userId, {
    content,
    name: options.name,
    description: options.description,
    version: options.version || '1.0.0',
    type,
    module,
    category: options.category,
    tags: options.tags || [],
    templateVariables: options.templateVariables,
    safetyScore,
    estimatedTokens,
    organizationId: options.organizationId,
  });

  // If safety score is low, log a warning
  if (safetyScore < 0.5) {
    console.warn(`Low safety score (${safetyScore}) detected for prompt: ${prompt.id}`);

    // In a real implementation, this would trigger additional review or alerts
    try {
      await prisma.systemLog.create({
        data: {
          level: 'WARN',
          message: `Low safety score (${safetyScore}) detected for prompt`,
          category: 'SAFETY',
          userId,
          metadata: {
            promptId: prompt.id,
            safetyScore,
            module,
            type,
          },
        },
      });
    } catch (error) {
      console.error('Error logging low safety score:', error);
    }
  }

  return prompt.id;
}

/**
 * Store a system prompt for tracking
 */
export async function storeSystemPromptForTracking(
  userId: string,
  content: string,
  name: string,
  module: string,
  model: string,
  options: {
    description?: string;
    version?: string;
    isDefault?: boolean;
    promptId?: string;
    organizationId?: string;
  } = {}
): Promise<string> {
  const systemPrompt = await PromptReasoningService.createSystemPrompt(userId, {
    content,
    name,
    description: options.description,
    version: options.version || '1.0.0',
    module,
    model,
    isDefault: options.isDefault || false,
    promptId: options.promptId,
    organizationId: options.organizationId,
  });

  return systemPrompt.id;
}

/**
 * Track an AI operation
 */
export async function trackAIOperation(
  tracking: AIOperationTracking,
  result: AIOperationResult
): Promise<string> {
  // Store the reasoning chain
  const reasoning = await PromptReasoningService.storeReasoning(tracking.userId, {
    sessionId: tracking.sessionId,
    promptId: tracking.promptId || '',
    systemPromptId: tracking.systemPromptId,
    agentId: tracking.agentId,
    steps: result.steps || [],
    rawOutput: result.rawOutput,
    parsedOutput: result.parsedOutput,
    model: result.model,
    temperature: result.temperature,
    maxTokens: result.maxTokens,
    totalTokens: result.totalTokens,
    promptTokens: result.promptTokens,
    completionTokens: result.completionTokens,
    latencyMs: result.latencyMs,
    success: result.success,
    error: result.error,
    metadata: result.metadata,
  });

  return reasoning.id;
}

/**
 * Store response nodes for a reasoning chain
 */
export async function storeResponseNodes(
  reasoningId: string,
  nodes: ResponseNodeData[]
): Promise<void> {
  // Store each node
  for (const node of nodes) {
    await PromptReasoningService.storeResponseNode({
      reasoningId,
      parentId: node.parentId,
      content: node.content,
      type: node.type,
      order: node.order,
      metadata: node.metadata,
      confidence: node.confidence,
    });
  }
}

/**
 * Complete an AI tracking session
 */
export async function completeAITrackingSession(
  sessionId: string,
  feedback?: any,
  totalTokens?: number,
  totalLatencyMs?: number
): Promise<void> {
  await PromptReasoningService.completeSession(sessionId, feedback, totalTokens, totalLatencyMs);
}

/**
 * Calculate a safety score for a prompt using the SafetyScoringService
 */
async function calculateSafetyScore(
  content: string,
  context: any = null,
  userId: string | null = null,
  module: string | null = null
): Promise<number> {
  try {
    // Import the SafetyScoringService
    const { SafetyScoringService } = await import('./safetyScoringService');

    // Score the content
    const result = await SafetyScoringService.scoreContent(
      {
        content,
        contentType: 'prompt',
        module: module || undefined,
        userId: userId || undefined,
        context: context ? JSON.stringify(context) : undefined,
      },
      {}
    );

    // Return the overall score
    return result.overallScore;
  } catch (error) {
    console.error('Error calculating safety score:', error);

    // Fallback to basic scoring if the service fails
    return calculateBasicSafetyScore(content);
  }
}

/**
 * Basic safety scoring as a fallback
 */
function calculateBasicSafetyScore(content: string): number {
  // This is a very basic implementation
  // Used as a fallback when the main service fails
  const lowerContent = content.toLowerCase();

  // List of potentially problematic terms (this is just an example)
  const problematicTerms = [
    'hack',
    'exploit',
    'vulnerability',
    'bypass',
    'illegal',
    'attack',
    'steal',
    'malware',
    'virus',
    'trojan',
    'phishing',
    'credentials',
    'password',
    'credit card',
    'social security',
    'address',
    'phone number',
    'sql injection',
    'xss',
    'cross site',
    'script',
    'drop table',
    'hate',
    'racial',
    'racist',
    'suicide',
    'kill',
    'murder',
    'weapon',
    'fraud',
    'scam',
    'counterfeit',
    'phishing',
  ];

  // Count occurrences of problematic terms
  let problematicCount = 0;
  for (const term of problematicTerms) {
    if (lowerContent.includes(term)) {
      problematicCount++;
    }
  }

  // Calculate safety score (1.0 is safest, 0.0 is least safe)
  const baseScore = 1.0;
  const penaltyPerTerm = 0.1;
  const safetyScore = Math.max(0, baseScore - problematicCount * penaltyPerTerm);

  return safetyScore;
}
