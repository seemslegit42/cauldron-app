/**
 * Enhanced Tracked Groq Inference
 *
 * This module provides utilities for tracking Groq inference with enhanced
 * reasoning chain and prompt history tracking.
 */

import { groqInference, GroqInferenceOptions } from './groq';
import { EnhancedReasoningService } from './enhancedReasoningService';
import { LoggingService } from '../shared/services/logging';
import { prisma } from 'wasp/server';
import { calculateTotalTokens } from '../shared/utils/tokenUtils';

/**
 * Options for enhanced tracked Groq inference
 */
export interface EnhancedTrackedGroqInferenceOptions extends GroqInferenceOptions {
  userId: string;
  module: string;
  sessionType?: string;
  agentId?: string;
  trackingSessionId?: string;
  promptName?: string;
  promptDescription?: string;
  promptCategory?: string;
  promptTags?: string[];
  systemPromptName?: string;
  systemPromptDescription?: string;
  organizationId?: string;
  trackSteps?: boolean;
  trackContext?: boolean;
  contextItems?: Array<{
    contextType: string;
    content: string;
    source: string;
    relevanceScore?: number;
    metadata?: any;
  }>;
}

/**
 * Enhanced tracked Groq inference result
 */
export interface EnhancedTrackedGroqInferenceResult {
  sessionId: string;
  promptId: string;
  systemPromptId?: string;
  reasoningId: string;
  result: any;
  totalTokens?: number;
  promptTokens?: number;
  completionTokens?: number;
  latencyMs?: number;
}

/**
 * Track Groq inference with enhanced reasoning chain tracking
 */
export async function enhancedTrackedGroqInference(
  options: EnhancedTrackedGroqInferenceOptions,
  context: any
): Promise<EnhancedTrackedGroqInferenceResult> {
  const startTime = Date.now();
  let sessionId = options.trackingSessionId;
  let promptId: string;
  let systemPromptId: string | undefined;
  let reasoningId: string;
  
  try {
    // Create or get session
    if (!sessionId) {
      const session = await prisma.aISession.create({
        data: {
          userId: options.userId,
          agentId: options.agentId,
          module: options.module,
          sessionType: options.sessionType || 'default',
          status: 'active',
          sessionPurpose: options.metadata?.purpose,
          businessContext: options.metadata?.businessContext,
          sessionTags: options.metadata?.tags || [],
          metadata: options.metadata,
        },
      });
      sessionId = session.id;
    }
    
    // Create prompt
    const prompt = await prisma.aIPrompt.create({
      data: {
        content: typeof options.prompt === 'string' ? options.prompt : JSON.stringify(options.prompt),
        name: options.promptName,
        description: options.promptDescription,
        version: '1.0.0',
        type: typeof options.prompt === 'string' ? 'text' : 'json',
        module: options.module,
        category: options.promptCategory,
        tags: options.promptTags || [],
        promptHash: calculateHash(options.prompt),
        createdById: options.userId,
        organizationId: options.organizationId,
      },
    });
    promptId = prompt.id;
    
    // Create system prompt if provided
    if (options.systemPrompt) {
      const systemPrompt = await prisma.aISystemPrompt.create({
        data: {
          content: options.systemPrompt,
          name: options.systemPromptName || `${options.module} System Prompt`,
          description: options.systemPromptDescription,
          version: '1.0.0',
          module: options.module,
          model: options.model || 'llama3-70b-8192',
          createdById: options.userId,
          organizationId: options.organizationId,
          promptId: promptId,
        },
      });
      systemPromptId = systemPrompt.id;
    }
    
    // Call Groq inference
    const inferenceStartTime = Date.now();
    const result = await groqInference(options, context);
    const inferenceEndTime = Date.now();
    const latencyMs = inferenceEndTime - inferenceStartTime;
    
    // Calculate tokens
    const totalTokens = calculateTotalTokens(options.prompt, result);
    const promptTokens = calculatePromptTokens(options.prompt);
    const completionTokens = totalTokens - promptTokens;
    
    // Extract reasoning steps if enabled
    const reasoningSteps = options.trackSteps ? extractReasoningSteps(result) : [];
    
    // Create reasoning record with enhanced tracking
    const reasoning = await EnhancedReasoningService.trackReasoningChain(
      options.userId,
      sessionId,
      promptId,
      options.model || 'llama3-70b-8192',
      options.temperature || 0.7,
      typeof result === 'string' ? result : JSON.stringify(result),
      {
        agentId: options.agentId,
        systemPromptId: systemPromptId,
        steps: reasoningSteps,
        contextItems: options.trackContext ? options.contextItems : [],
        reasoningChain: extractReasoningChain(result),
        confidenceScore: extractConfidenceScore(result),
        parsedOutput: typeof result === 'string' ? undefined : result,
        maxTokens: options.maxTokens,
        totalTokens,
        promptTokens,
        completionTokens,
        latencyMs,
        metadata: options.metadata,
      }
    );
    reasoningId = reasoning.id;
    
    // Log the operation
    LoggingService.info({
      message: 'Enhanced tracked Groq inference completed',
      module: options.module,
      category: 'AI_INFERENCE',
      metadata: {
        sessionId,
        promptId,
        systemPromptId,
        reasoningId,
        model: options.model,
        totalTokens,
        latencyMs,
      },
    });
    
    return {
      sessionId,
      promptId,
      systemPromptId,
      reasoningId,
      result,
      totalTokens,
      promptTokens,
      completionTokens,
      latencyMs,
    };
  } catch (error) {
    LoggingService.error({
      message: 'Error in enhanced tracked Groq inference',
      module: options.module,
      category: 'AI_INFERENCE',
      error,
      metadata: {
        sessionId,
        model: options.model,
      },
    });
    throw error;
  }
}

/**
 * Complete an enhanced tracked Groq inference session
 */
export async function completeEnhancedTrackedGroqSession(
  sessionId: string,
  feedback?: any,
  totalTokens?: number,
  totalLatencyMs?: number,
  qualityScore?: number,
  userSatisfaction?: number,
  learningOutcomes?: any
): Promise<void> {
  try {
    await prisma.aISession.update({
      where: { id: sessionId },
      data: {
        status: 'completed',
        completedAt: new Date(),
        feedback,
        totalTokens,
        totalLatencyMs,
        qualityScore,
        userSatisfaction,
        learningOutcomes,
      },
    });
    
    LoggingService.info({
      message: 'Enhanced tracked Groq session completed',
      category: 'AI_INFERENCE',
      metadata: {
        sessionId,
        totalTokens,
        totalLatencyMs,
      },
    });
  } catch (error) {
    LoggingService.error({
      message: 'Error completing enhanced tracked Groq session',
      category: 'AI_INFERENCE',
      error,
      metadata: {
        sessionId,
      },
    });
    throw error;
  }
}

/**
 * Calculate a hash for a prompt
 */
function calculateHash(prompt: any): string {
  const content = typeof prompt === 'string' ? prompt : JSON.stringify(prompt);
  return require('crypto').createHash('sha256').update(content).digest('hex');
}

/**
 * Calculate tokens for a prompt
 */
function calculatePromptTokens(prompt: any): number {
  const content = typeof prompt === 'string' ? prompt : JSON.stringify(prompt);
  // Simple estimation: 1 token ≈ 4 characters
  return Math.ceil(content.length / 4);
}

/**
 * Extract reasoning steps from a result
 */
function extractReasoningSteps(result: any): Array<{
  stepNumber: number;
  stepType: string;
  content: string;
  tokens?: number;
  duration?: number;
  metadata?: any;
}> {
  // If result is a string, try to extract reasoning steps using regex
  if (typeof result === 'string') {
    const steps: Array<{
      stepNumber: number;
      stepType: string;
      content: string;
      tokens?: number;
      metadata?: any;
    }> = [];
    
    // Look for patterns like "Step 1: [Thought] I need to analyze..."
    const stepPattern = /Step (\d+):\s*\[([^\]]+)\]\s*(.*?)(?=Step \d+:|$)/gs;
    let match;
    while ((match = stepPattern.exec(result)) !== null) {
      steps.push({
        stepNumber: parseInt(match[1]),
        stepType: match[2].toLowerCase(),
        content: match[3].trim(),
        tokens: Math.ceil(match[3].trim().length / 4),
      });
    }
    
    // If no steps found with the pattern, try to identify thought processes
    if (steps.length === 0) {
      const thoughtPattern = /(I think|Let me|I need to|First,|Next,|Finally,|In conclusion,)(.*?)(?=I think|Let me|I need to|First,|Next,|Finally,|In conclusion,|$)/gs;
      let stepNumber = 1;
      while ((match = thoughtPattern.exec(result)) !== null) {
        steps.push({
          stepNumber: stepNumber++,
          stepType: 'thought',
          content: (match[1] + match[2]).trim(),
          tokens: Math.ceil((match[1] + match[2]).trim().length / 4),
        });
      }
    }
    
    return steps;
  }
  
  // If result is an object, check if it has a reasoning_steps field
  if (result && typeof result === 'object' && Array.isArray(result.reasoning_steps)) {
    return result.reasoning_steps.map((step: any, index: number) => ({
      stepNumber: index + 1,
      stepType: step.type || 'thought',
      content: step.content,
      tokens: step.tokens,
      duration: step.duration,
      metadata: step.metadata,
    }));
  }
  
  return [];
}

/**
 * Extract reasoning chain from a result
 */
function extractReasoningChain(result: any): any {
  // If result is an object, check if it has a reasoning_chain field
  if (result && typeof result === 'object' && result.reasoning_chain) {
    return result.reasoning_chain;
  }
  
  return undefined;
}

/**
 * Extract confidence score from a result
 */
function extractConfidenceScore(result: any): number | undefined {
  // If result is an object, check if it has a confidence field
  if (result && typeof result === 'object') {
    if (typeof result.confidence === 'number') {
      return result.confidence;
    }
    
    if (result.metadata && typeof result.metadata.confidence === 'number') {
      return result.metadata.confidence;
    }
  }
  
  return undefined;
}
