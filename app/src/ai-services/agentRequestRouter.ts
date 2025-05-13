/**
 * Agent Request Router
 *
 * This module provides intelligent routing of AI requests to the appropriate models,
 * with support for load balancing, fallbacks, and parallel processing.
 */

import { GROQ_CONFIG, GEMINI_CONFIG } from '../shared/config/ai-config';
import { groqInference, GroqInferenceOptions } from './groq';
import { geminiInference, GeminiInferenceInput } from './gemini';
import { trackedGroqInference, TrackedGroqInferenceOptions } from './trackedGroqInference';
import { LoggingService } from '../shared/services/logging';
import { HttpError } from 'wasp/server';

// Model tier types
export type ModelTier = 'fast' | 'standard' | 'premium';

// Request priority types
export type RequestPriority = 'high' | 'medium' | 'low';

// Request type for categorization
export type RequestType = 'chat' | 'summarization' | 'contentGeneration' | 'embedding' | 'default';

// Interface for router options
export interface RouterOptions {
  // The module making the request
  module: string;

  // The type of request being made
  requestType?: RequestType;

  // The priority of the request
  priority?: RequestPriority;

  // Whether to use parallel processing for this request
  useParallelProcessing?: boolean;

  // Whether to track this request for analytics
  trackRequest?: boolean;

  // The model tier to use
  modelTier?: ModelTier;

  // Whether to use fallbacks if the primary model fails
  useFallbacks?: boolean;

  // Maximum latency allowed for this request in milliseconds
  maxLatencyMs?: number;

  // User ID for tracking
  userId?: string;

  // Session ID for tracking
  sessionId?: string;

  // Agent ID for tracking
  agentId?: string;

  // Whether to use caching for this request
  useCache?: boolean;
  
  // The AI provider to use (groq or gemini)
  provider?: 'groq' | 'gemini';
}

/**
 * Routes an AI request to the appropriate model based on the request characteristics
 *
 * @param options The inference options
 * @param routerOptions The router options
 * @param context The request context
 * @returns The inference result
 */
export async function routeRequest(
  options: GroqInferenceOptions,
  routerOptions: RouterOptions,
  context: any
) {
  // Start timing the request
  const startTime = Date.now();

  // Determine the model tier to use
  const modelTier = routerOptions.modelTier || determineModelTier(options, routerOptions);

  // Determine the provider to use
  const provider = routerOptions.provider || determineProvider(options.model);

  // Get the model configuration for this tier based on provider
  const modelConfig = provider === 'gemini' 
    ? GEMINI_CONFIG.models[modelTier] 
    : GROQ_CONFIG.models[modelTier];

  // Apply model configuration to options if not explicitly set
  const inferenceOptions = {
    ...options,
    model: options.model || modelConfig.name,
    temperature: options.temperature ?? modelConfig.temperature,
    maxTokens: options.maxTokens || modelConfig.maxTokens,
    topP: options.topP || modelConfig.topP,
  };

  try {
    // Log the request routing decision
    await LoggingService.logSystemEvent({
      message: `Routing ${routerOptions.requestType || 'default'} request to ${inferenceOptions.model} (${modelTier} tier)`,
      level: 'INFO',
      category: 'AI_ROUTING',
      source: 'agent-request-router',
      userId: routerOptions.userId,
      tags: ['ai', 'routing', modelTier, inferenceOptions.model],
      metadata: {
        module: routerOptions.module,
        requestType: routerOptions.requestType || 'default',
        priority: routerOptions.priority || modelConfig.priority,
        modelTier,
        model: inferenceOptions.model,
        useParallelProcessing: routerOptions.useParallelProcessing || false,
      },
    });

    // Check if we should use caching
    const useCache =
      routerOptions.useCache !== false &&
      GROQ_CONFIG.performance.cache?.enabled !== false &&
      inferenceOptions.temperature <= 0.3; // Only cache deterministic responses

    // If caching is enabled, try to get from cache first
    if (useCache && inferenceOptions.prompt) {
      // Import cache utilities dynamically to avoid circular dependencies
      const { generateCacheKey, getCachedResponse, cacheResponse } = await import(
        './aiResponseCache'
      );

      // Generate cache key
      const cacheKey = generateCacheKey(inferenceOptions.prompt, inferenceOptions.model, {
        temperature: inferenceOptions.temperature,
        maxTokens: inferenceOptions.maxTokens,
        userId: routerOptions.userId,
        module: routerOptions.module,
        requestType: routerOptions.requestType,
        systemPrompt: inferenceOptions.systemPrompt,
      });

      // Try to get from cache
      const cachedResponse = await getCachedResponse(cacheKey);

      if (cachedResponse) {
        // Log cache hit
        const cacheTime = Date.now() - startTime;
        await LoggingService.logSystemEvent({
          message: `Cache hit for ${inferenceOptions.model} (${cacheTime}ms)`,
          level: 'INFO',
          category: 'AI_CACHE',
          source: 'agent-request-router',
          userId: routerOptions.userId,
          duration: cacheTime,
          tags: ['ai', 'cache', 'hit', modelTier, inferenceOptions.model],
          metadata: {
            module: routerOptions.module,
            requestType: routerOptions.requestType || 'default',
            cacheTimeMs: cacheTime,
            modelTier,
            model: inferenceOptions.model,
          },
        });

        return cachedResponse;
      }

      // If not in cache, proceed with inference and cache the result afterward
      let result;

      // If tracking is enabled, use tracked inference
      if (routerOptions.trackRequest && routerOptions.userId) {
        const trackedOptions: TrackedGroqInferenceOptions = {
          ...inferenceOptions,
          userId: routerOptions.userId,
          module: routerOptions.module,
          sessionType: routerOptions.requestType || 'default',
          agentId: routerOptions.agentId,
          trackingSessionId: routerOptions.sessionId,
        };

        result = await trackedGroqInference(trackedOptions, context);
      } else {
        // Otherwise use standard inference
        result = await groqInference(inferenceOptions, context);
      }

      // Cache the result
      await cacheResponse(cacheKey, result, {
        prompt: inferenceOptions.prompt,
        model: inferenceOptions.model,
        userId: routerOptions.userId,
        module: routerOptions.module,
        requestType: routerOptions.requestType,
      });

      return result;
    }

    // If not using cache, proceed with normal inference

    // Determine which provider to use
    const provider = routerOptions.provider || determineProvider(inferenceOptions.model);

    // If tracking is enabled and using Groq, use tracked inference
    if (provider === 'groq' && routerOptions.trackRequest && routerOptions.userId) {
      const trackedOptions: TrackedGroqInferenceOptions = {
        ...inferenceOptions,
        userId: routerOptions.userId,
        module: routerOptions.module,
        sessionType: routerOptions.requestType || 'default',
        agentId: routerOptions.agentId,
        trackingSessionId: routerOptions.sessionId,
      };

      return await trackedGroqInference(trackedOptions, context);
    }
    
    // Use the appropriate provider
    if (provider === 'gemini') {
      return await geminiInference(inferenceOptions, context);
    } else {
      // Otherwise use standard Groq inference
      return await groqInference(inferenceOptions, context);
    }
  } catch (error) {
    // If fallbacks are enabled, try fallback models
    if (routerOptions.useFallbacks !== false && GROQ_CONFIG.fallbacks) {
      return await handleFallbacks(error, inferenceOptions, routerOptions, modelTier, context);
    }

    // Otherwise, rethrow the error
    throw error;
  } finally {
    // Log the total request time
    const totalTime = Date.now() - startTime;

    // Categorize the latency
    const latencyCategory = categorizeLatency(totalTime);

    // Log the latency
    await LoggingService.logSystemEvent({
      message: `AI request completed in ${totalTime}ms (${latencyCategory})`,
      level: 'INFO',
      category: 'AI_PERFORMANCE',
      source: 'agent-request-router',
      userId: routerOptions.userId,
      duration: totalTime,
      tags: ['ai', 'latency', latencyCategory, modelTier, inferenceOptions.model],
      metadata: {
        module: routerOptions.module,
        requestType: routerOptions.requestType || 'default',
        latencyMs: totalTime,
        latencyCategory,
        modelTier,
        model: inferenceOptions.model,
      },
    });
  }
}

/**
 * Determines the appropriate provider based on the model name
 */
function determineProvider(model?: string): 'groq' | 'gemini' {
  if (!model) return 'groq'; // Default to Groq if no model specified
  
  // Check if the model is a Gemini model
  if (model.startsWith('gemini-')) {
    return 'gemini';
  }
  
  // Default to Groq for all other models
  return 'groq';
}

/**
 * Determines the appropriate model tier based on the request characteristics
 */
function determineModelTier(
  options: any,
  routerOptions: RouterOptions
): ModelTier {
  // Determine the provider
  const provider = routerOptions.provider || determineProvider(options.model);
  
  // Get the appropriate config based on provider
  const config = provider === 'gemini' ? GEMINI_CONFIG : GROQ_CONFIG;
  
  // If a specific model is requested, determine its tier
  if (options.model) {
    if (options.model === config.models.fast.name) return 'fast';
    if (options.model === config.models.standard.name) return 'standard';
    if (options.model === config.models.premium.name) return 'premium';
    // For Gemini, check vision model
    if (provider === 'gemini' && options.model === GEMINI_CONFIG.models.vision?.name) return 'standard';
  }

  // If a max latency is specified, choose the appropriate tier
  if (routerOptions.maxLatencyMs) {
    if (routerOptions.maxLatencyMs <= 100) return 'fast';
    if (routerOptions.maxLatencyMs <= 1000) return 'standard';
    return 'premium';
  }

  // Choose based on request type
  switch (routerOptions.requestType) {
    case 'chat':
      return 'standard';
    case 'summarization':
      return 'premium';
    case 'contentGeneration':
      return 'premium';
    case 'embedding':
      return 'fast';
    default:
      return 'standard';
  }
}

/**
 * Handles fallback logic when a model fails
 */
async function handleFallbacks(
  error: any,
  options: any,
  routerOptions: RouterOptions,
  modelTier: ModelTier,
  context: any
) {
  // Determine the provider
  const provider = routerOptions.provider || determineProvider(options.model);
  
  // Get the fallback models for this tier based on provider
  const fallbacks = provider === 'gemini' 
    ? GEMINI_CONFIG.fallbacks[modelTier] 
    : GROQ_CONFIG.fallbacks[modelTier];

  if (!fallbacks || fallbacks.length === 0) {
    throw error;
  }

  // Log the fallback attempt
  await LoggingService.logSystemEvent({
    message: `Primary model ${options.model} failed, attempting fallbacks`,
    level: 'WARN',
    category: 'AI_FALLBACK',
    source: 'agent-request-router',
    userId: routerOptions.userId,
    tags: ['ai', 'fallback', modelTier, options.model],
    metadata: {
      module: routerOptions.module,
      requestType: routerOptions.requestType || 'default',
      primaryModel: options.model,
      fallbackModels: fallbacks,
      error: error.message,
    },
  });

  // Try each fallback model in order
  let lastError = error;

  for (const fallbackModel of fallbacks) {
    try {
      // Skip if this is the model that just failed
      if (fallbackModel === options.model) continue;

      // Create new options with the fallback model
      const fallbackOptions = {
        ...options,
        model: fallbackModel,
      };

      // Log the fallback attempt
      await LoggingService.logSystemEvent({
        message: `Attempting fallback to ${fallbackModel}`,
        level: 'INFO',
        category: 'AI_FALLBACK',
        source: 'agent-request-router',
        userId: routerOptions.userId,
        tags: ['ai', 'fallback', modelTier, fallbackModel],
        metadata: {
          module: routerOptions.module,
          requestType: routerOptions.requestType || 'default',
          primaryModel: options.model,
          fallbackModel,
        },
      });

      // Determine the provider for the fallback model
      const fallbackProvider = determineProvider(fallbackModel);
      
      // Try the fallback model with the appropriate provider
      if (fallbackProvider === 'gemini') {
        return await geminiInference(fallbackOptions, context);
      } else {
        return await groqInference(fallbackOptions, context);
      }
    } catch (fallbackError) {
      lastError = fallbackError;

      // Log the fallback failure
      await LoggingService.logSystemEvent({
        message: `Fallback to ${fallbackModel} failed`,
        level: 'ERROR',
        category: 'AI_FALLBACK',
        source: 'agent-request-router',
        userId: routerOptions.userId,
        tags: ['ai', 'fallback', 'error', modelTier, fallbackModel],
        metadata: {
          module: routerOptions.module,
          requestType: routerOptions.requestType || 'default',
          primaryModel: options.model,
          fallbackModel,
          error: fallbackError.message,
        },
      });
    }
  }

  // If all fallbacks failed, throw the last error
  throw new HttpError(
    503,
    `All models failed for ${routerOptions.requestType || 'default'} request: ${lastError.message}`
  );
}

/**
 * Categorizes latency based on thresholds
 */
function categorizeLatency(latencyMs: number): string {
  const thresholds = GROQ_CONFIG.performance.latencyThresholds;

  if (latencyMs <= thresholds.excellent) return 'excellent';
  if (latencyMs <= thresholds.good) return 'good';
  if (latencyMs <= thresholds.acceptable) return 'acceptable';
  if (latencyMs <= thresholds.poor) return 'poor';
  return 'critical';
}
