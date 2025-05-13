/**
 * Tracked Groq Inference
 * 
 * This module provides a wrapper around the Groq inference function that
 * automatically tracks prompts, reasoning chains, and response trees.
 */

import { groqInference, GroqInferenceOptions } from './groq';
import {
  createAITrackingSession,
  storePromptForTracking,
  storeSystemPromptForTracking,
  trackAIOperation,
  storeResponseNodes,
  completeAITrackingSession,
  AIOperationTracking,
} from './promptTrackingUtils';
import { calculateTotalTokens } from '../shared/utils/tokenUtils';

/**
 * Options for tracked Groq inference
 */
export interface TrackedGroqInferenceOptions extends GroqInferenceOptions {
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
}

/**
 * Perform Groq inference with automatic tracking of prompts and reasoning
 */
export async function trackedGroqInference(options: TrackedGroqInferenceOptions, context: any) {
  const startTime = Date.now();
  let sessionId = options.trackingSessionId;
  let promptId: string | undefined;
  let systemPromptId: string | undefined;
  
  try {
    // Create a session if one doesn't exist
    if (!sessionId) {
      sessionId = await createAITrackingSession(
        options.userId,
        options.module,
        options.sessionType || 'inference',
        options.agentId,
        { source: 'trackedGroqInference' }
      );
    }
    
    // Store the prompt
    promptId = await storePromptForTracking(
      options.userId,
      options.prompt,
      options.module,
      'user',
      {
        name: options.promptName,
        description: options.promptDescription,
        category: options.promptCategory,
        tags: options.promptTags,
        organizationId: options.organizationId,
      }
    );
    
    // Store the system prompt if provided
    if (options.systemPrompt) {
      systemPromptId = await storeSystemPromptForTracking(
        options.userId,
        options.systemPrompt,
        options.systemPromptName || `${options.module} System Prompt`,
        options.module,
        options.model || 'llama3-8b-8192',
        {
          description: options.systemPromptDescription,
          organizationId: options.organizationId,
        }
      );
    }
    
    // Perform the inference
    const inferenceResult = await groqInference(options, context);
    
    // Calculate latency
    const latencyMs = Date.now() - startTime;
    
    // Extract token usage
    const tokenUsage = inferenceResult.usage || {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    };
    
    // Create tracking info
    const tracking: AIOperationTracking = {
      sessionId,
      promptId,
      systemPromptId,
      agentId: options.agentId,
      userId: options.userId,
      module: options.module,
      sessionType: options.sessionType || 'inference',
    };
    
    // Track the operation
    const reasoningId = await trackAIOperation(tracking, {
      rawOutput: inferenceResult.choices[0]?.text || '',
      model: options.model || 'llama3-8b-8192',
      temperature: options.temperature || 0.7,
      maxTokens: options.maxTokens,
      totalTokens: tokenUsage.total_tokens,
      promptTokens: tokenUsage.prompt_tokens,
      completionTokens: tokenUsage.completion_tokens,
      latencyMs,
      success: true,
      metadata: {
        inferenceId: inferenceResult.id,
        created: inferenceResult.created,
        model: inferenceResult.model,
      },
    });
    
    // Extract reasoning steps if available
    if (inferenceResult.reasoning) {
      const reasoningSteps = Array.isArray(inferenceResult.reasoning)
        ? inferenceResult.reasoning
        : [inferenceResult.reasoning];
      
      // Store response nodes for the reasoning steps
      await storeResponseNodes(
        reasoningId,
        reasoningSteps.map((step, index) => ({
          content: typeof step === 'string' ? step : JSON.stringify(step),
          type: 'reasoning',
          order: index,
          metadata: { step: index + 1 },
        }))
      );
    }
    
    // Store the final response as a node
    await storeResponseNodes(reasoningId, [
      {
        content: inferenceResult.choices[0]?.text || '',
        type: 'response',
        order: 1000, // High order to ensure it's last
        metadata: { final: true },
      },
    ]);
    
    return inferenceResult;
  } catch (error) {
    // Track the error if we have a session
    if (sessionId && promptId) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Create tracking info
      const tracking: AIOperationTracking = {
        sessionId,
        promptId,
        systemPromptId,
        agentId: options.agentId,
        userId: options.userId,
        module: options.module,
        sessionType: options.sessionType || 'inference',
      };
      
      // Track the failed operation
      await trackAIOperation(tracking, {
        rawOutput: errorMessage,
        model: options.model || 'llama3-8b-8192',
        temperature: options.temperature || 0.7,
        maxTokens: options.maxTokens,
        latencyMs: Date.now() - startTime,
        success: false,
        error: errorMessage,
      });
    }
    
    // Re-throw the error
    throw error;
  }
}

/**
 * Complete a tracked Groq inference session
 */
export async function completeTrackedGroqSession(
  sessionId: string,
  feedback?: any,
  totalTokens?: number,
  totalLatencyMs?: number
): Promise<void> {
  await completeAITrackingSession(
    sessionId,
    feedback,
    totalTokens,
    totalLatencyMs
  );
}
