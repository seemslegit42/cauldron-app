/**
 * Inference Metrics
 * 
 * This module provides utilities for benchmarking and monitoring AI inference operations,
 * including latency tracking, token budget management, and throughput monitoring.
 */

import { GROQ_CONFIG } from '../shared/config/ai-config';
import { LoggingService } from '../shared/services/logging';
import { prisma } from 'wasp/server';
import { calculateTotalTokens, estimateTokenCount } from '../shared/utils/tokenUtils';

// Interface for latency benchmark results
export interface LatencyBenchmarkResult {
  modelName: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  tokensPerSecond: number;
  category: string;
  timestamp: Date;
}

// Interface for token budget tracking
export interface TokenBudgetStatus {
  userId: string;
  requestType: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  promptBudget: number;
  completionBudget: number;
  totalBudget: number;
  promptUsagePercent: number;
  completionUsagePercent: number;
  totalUsagePercent: number;
  isWithinBudget: boolean;
}

// Interface for throughput metrics
export interface ThroughputMetrics {
  requestsPerMinute: number;
  tokensPerMinute: number;
  requestLimit: number;
  tokenLimit: number;
  requestUsagePercent: number;
  tokenUsagePercent: number;
  isWithinLimits: boolean;
}

// In-memory storage for throughput tracking
const throughputTracker = {
  requests: [] as { timestamp: number }[],
  tokens: [] as { timestamp: number; count: number }[],
};

/**
 * Benchmarks inference latency for a specific model and prompt
 * 
 * @param modelName The name of the model to benchmark
 * @param prompt The prompt to use for benchmarking
 * @param options Additional options for the benchmark
 * @returns The benchmark results
 */
export async function benchmarkLatency(
  modelName: string,
  prompt: string,
  options: {
    maxTokens?: number;
    temperature?: number;
    userId?: string;
    runs?: number;
  } = {}
): Promise<LatencyBenchmarkResult> {
  const runs = options.runs || 1;
  let totalLatency = 0;
  let totalPromptTokens = 0;
  let totalCompletionTokens = 0;
  
  // Import dynamically to avoid circular dependencies
  const { groqInference } = await import('./groq');
  
  // Run the benchmark multiple times if requested
  for (let i = 0; i < runs; i++) {
    const startTime = Date.now();
    
    const result = await groqInference(
      {
        prompt,
        model: modelName,
        maxTokens: options.maxTokens || 100,
        temperature: options.temperature || 0.7,
        stream: false,
      },
      { user: { id: options.userId } }
    );
    
    const latency = Date.now() - startTime;
    totalLatency += latency;
    
    // Extract token usage
    const promptTokens = result.usage?.prompt_tokens || estimateTokenCount(prompt);
    const completionTokens = result.usage?.completion_tokens || estimateTokenCount(result.choices[0]?.text || '');
    
    totalPromptTokens += promptTokens;
    totalCompletionTokens += completionTokens;
  }
  
  // Calculate averages
  const avgLatency = totalLatency / runs;
  const avgPromptTokens = totalPromptTokens / runs;
  const avgCompletionTokens = totalCompletionTokens / runs;
  const avgTotalTokens = avgPromptTokens + avgCompletionTokens;
  
  // Calculate tokens per second
  const tokensPerSecond = avgTotalTokens / (avgLatency / 1000);
  
  // Categorize the latency
  const category = categorizeLatency(avgLatency);
  
  // Create the result
  const result: LatencyBenchmarkResult = {
    modelName,
    promptTokens: avgPromptTokens,
    completionTokens: avgCompletionTokens,
    totalTokens: avgTotalTokens,
    latencyMs: avgLatency,
    tokensPerSecond,
    category,
    timestamp: new Date(),
  };
  
  // Log the benchmark result
  await LoggingService.logSystemEvent({
    message: `Benchmark: ${modelName} - ${avgLatency.toFixed(2)}ms (${category})`,
    level: 'INFO',
    category: 'AI_BENCHMARK',
    source: 'inference-metrics',
    userId: options.userId,
    tags: ['ai', 'benchmark', 'latency', category, modelName],
    metadata: {
      modelName,
      promptTokens: avgPromptTokens,
      completionTokens: avgCompletionTokens,
      totalTokens: avgTotalTokens,
      latencyMs: avgLatency,
      tokensPerSecond,
      category,
      runs,
    },
  });
  
  // Store the benchmark result in the database if available
  try {
    await prisma.aIBenchmark.create({
      data: {
        modelName,
        promptTokens: avgPromptTokens,
        completionTokens: avgCompletionTokens,
        totalTokens: avgTotalTokens,
        latencyMs: avgLatency,
        tokensPerSecond,
        category,
        metadata: {
          runs,
          temperature: options.temperature || 0.7,
          maxTokens: options.maxTokens || 100,
          promptLength: prompt.length,
        },
        userId: options.userId,
      },
    });
  } catch (error) {
    console.error('Failed to store benchmark result:', error);
  }
  
  return result;
}

/**
 * Tracks token usage for a user and checks against budgets
 * 
 * @param userId The user ID
 * @param promptTokens The number of prompt tokens used
 * @param completionTokens The number of completion tokens used
 * @param requestType The type of request
 * @returns The token budget status
 */
export async function trackTokenBudget(
  userId: string,
  promptTokens: number,
  completionTokens: number,
  requestType: string = 'default'
): Promise<TokenBudgetStatus> {
  // Get the token budget for this request type
  const budget = GROQ_CONFIG.performance.tokenBudgets[requestType] || 
                 GROQ_CONFIG.performance.tokenBudgets.default;
  
  // Calculate total tokens
  const totalTokens = calculateTotalTokens(promptTokens, completionTokens);
  const totalBudget = budget.prompt + budget.completion;
  
  // Calculate usage percentages
  const promptUsagePercent = (promptTokens / budget.prompt) * 100;
  const completionUsagePercent = (completionTokens / budget.completion) * 100;
  const totalUsagePercent = (totalTokens / totalBudget) * 100;
  
  // Check if within budget
  const isWithinBudget = promptTokens <= budget.prompt && 
                         completionTokens <= budget.completion;
  
  // Create the status
  const status: TokenBudgetStatus = {
    userId,
    requestType,
    promptTokens,
    completionTokens,
    totalTokens,
    promptBudget: budget.prompt,
    completionBudget: budget.completion,
    totalBudget,
    promptUsagePercent,
    completionUsagePercent,
    totalUsagePercent,
    isWithinBudget,
  };
  
  // Log the token usage
  await LoggingService.logSystemEvent({
    message: `Token usage: ${totalTokens} tokens (${totalUsagePercent.toFixed(2)}% of budget)`,
    level: isWithinBudget ? 'INFO' : 'WARN',
    category: 'AI_TOKEN_USAGE',
    source: 'inference-metrics',
    userId,
    tags: ['ai', 'tokens', requestType, isWithinBudget ? 'within-budget' : 'over-budget'],
    metadata: {
      userId,
      requestType,
      promptTokens,
      completionTokens,
      totalTokens,
      promptBudget: budget.prompt,
      completionBudget: budget.completion,
      totalBudget,
      promptUsagePercent,
      completionUsagePercent,
      totalUsagePercent,
      isWithinBudget,
    },
  });
  
  // Update the user's token usage in the database if available
  try {
    await prisma.userTokenUsage.upsert({
      where: {
        userId_date: {
          userId,
          date: new Date().toISOString().split('T')[0],
        },
      },
      update: {
        promptTokens: { increment: promptTokens },
        completionTokens: { increment: completionTokens },
        totalTokens: { increment: totalTokens },
      },
      create: {
        userId,
        date: new Date().toISOString().split('T')[0],
        promptTokens,
        completionTokens,
        totalTokens,
      },
    });
  } catch (error) {
    console.error('Failed to update token usage:', error);
  }
  
  return status;
}

/**
 * Tracks throughput and checks against limits
 * 
 * @param tokenCount The number of tokens used in this request
 * @returns The throughput metrics
 */
export async function trackThroughput(tokenCount: number): Promise<ThroughputMetrics> {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;
  
  // Add this request to the tracker
  throughputTracker.requests.push({ timestamp: now });
  throughputTracker.tokens.push({ timestamp: now, count: tokenCount });
  
  // Remove old entries
  throughputTracker.requests = throughputTracker.requests.filter(r => r.timestamp >= oneMinuteAgo);
  throughputTracker.tokens = throughputTracker.tokens.filter(t => t.timestamp >= oneMinuteAgo);
  
  // Calculate current throughput
  const requestsPerMinute = throughputTracker.requests.length;
  const tokensPerMinute = throughputTracker.tokens.reduce((sum, t) => sum + t.count, 0);
  
  // Get limits
  const { requestsPerMinute: requestLimit, tokensPerMinute: tokenLimit } = 
    GROQ_CONFIG.performance.throughputLimits;
  
  // Calculate usage percentages
  const requestUsagePercent = (requestsPerMinute / requestLimit) * 100;
  const tokenUsagePercent = (tokensPerMinute / tokenLimit) * 100;
  
  // Check if within limits
  const isWithinLimits = requestsPerMinute <= requestLimit && 
                         tokensPerMinute <= tokenLimit;
  
  // Create the metrics
  const metrics: ThroughputMetrics = {
    requestsPerMinute,
    tokensPerMinute,
    requestLimit,
    tokenLimit,
    requestUsagePercent,
    tokenUsagePercent,
    isWithinLimits,
  };
  
  // Log the throughput
  await LoggingService.logSystemEvent({
    message: `Throughput: ${requestsPerMinute} req/min, ${tokensPerMinute} tokens/min`,
    level: isWithinLimits ? 'INFO' : 'WARN',
    category: 'AI_THROUGHPUT',
    source: 'inference-metrics',
    tags: ['ai', 'throughput', isWithinLimits ? 'within-limits' : 'over-limits'],
    metadata: metrics,
  });
  
  return metrics;
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
