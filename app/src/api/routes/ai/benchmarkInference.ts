/**
 * API route for benchmarking AI inference
 */
import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import { withErrorHandling } from '../../middleware';
import { validateRequest } from '../../middleware/validation';
import { requirePermission } from '../../middleware/rbac';
import { z } from 'zod';
import { benchmarkLatency } from '../../../ai-services/inferenceMetrics';
import { GROQ_CONFIG } from '../../../shared/config/ai-config';

// Define the schema for the benchmark request
const benchmarkRequestSchema = z.object({
  modelName: z.string().min(1, 'Model name is required'),
  prompt: z.string().min(1, 'Prompt is required'),
  maxTokens: z.number().positive().default(100),
  temperature: z.number().min(0).max(1).default(0.7),
  runs: z.number().positive().max(10).default(3),
});

/**
 * Runs a benchmark for AI inference latency
 */
export const runBenchmark = withErrorHandling(async (args, context) => {
  // Validate request arguments
  const validatedArgs = validateRequest(args, benchmarkRequestSchema);

  // Apply RBAC middleware - require 'ai:benchmark' permission
  const user = await requirePermission({
    resource: 'ai',
    action: 'benchmark',
    adminOverride: true,
    auditRejection: true,
  })(context);

  // Run the benchmark
  const result = await benchmarkLatency(
    validatedArgs.modelName,
    validatedArgs.prompt,
    {
      maxTokens: validatedArgs.maxTokens,
      temperature: validatedArgs.temperature,
      userId: user.id,
      runs: validatedArgs.runs,
    }
  );

  return result;
});

// Define the schema for the benchmark history request
const benchmarkHistoryRequestSchema = z.object({
  modelName: z.string().optional(),
  limit: z.number().positive().max(100).default(20),
  offset: z.number().min(0).default(0),
  sortBy: z.enum(['timestamp', 'latencyMs', 'tokensPerSecond']).default('timestamp'),
  sortDirection: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Gets the benchmark history
 */
export const getBenchmarkHistory = withErrorHandling(async (args, context) => {
  // Validate request arguments
  const validatedArgs = validateRequest(args, benchmarkHistoryRequestSchema);

  // Apply RBAC middleware - require 'ai:view-benchmarks' permission
  const user = await requirePermission({
    resource: 'ai',
    action: 'view-benchmarks',
    adminOverride: true,
    auditRejection: true,
  })(context);

  // Build the query
  const query: any = {};
  if (validatedArgs.modelName) {
    query.modelName = validatedArgs.modelName;
  }

  // Get the benchmark history
  const benchmarks = await prisma.aIBenchmark.findMany({
    where: query,
    orderBy: {
      [validatedArgs.sortBy]: validatedArgs.sortDirection,
    },
    skip: validatedArgs.offset,
    take: validatedArgs.limit,
  });

  // Get the total count
  const totalCount = await prisma.aIBenchmark.count({
    where: query,
  });

  // Calculate aggregate statistics
  const aggregateStats = await prisma.aIBenchmark.groupBy({
    by: ['modelName'],
    _avg: {
      latencyMs: true,
      tokensPerSecond: true,
    },
    _min: {
      latencyMs: true,
    },
    _max: {
      latencyMs: true,
      tokensPerSecond: true,
    },
    where: query,
  });

  // Get available models for filtering
  const availableModels = await prisma.aIBenchmark.groupBy({
    by: ['modelName'],
  });

  return {
    benchmarks,
    totalCount,
    aggregateStats,
    availableModels: availableModels.map(m => m.modelName),
    pagination: {
      limit: validatedArgs.limit,
      offset: validatedArgs.offset,
      hasMore: validatedArgs.offset + benchmarks.length < totalCount,
    },
  };
});

// Define the schema for the performance metrics request
const performanceMetricsRequestSchema = z.object({
  period: z.enum(['day', 'week', 'month']).default('day'),
});

/**
 * Gets the performance metrics for AI operations
 */
export const getPerformanceMetrics = withErrorHandling(async (args, context) => {
  // Validate request arguments
  const validatedArgs = validateRequest(args, performanceMetricsRequestSchema);

  // Apply RBAC middleware - require 'ai:view-metrics' permission
  const user = await requirePermission({
    resource: 'ai',
    action: 'view-metrics',
    adminOverride: true,
    auditRejection: true,
  })(context);

  // Calculate the start date based on the period
  const now = new Date();
  let startDate: Date;
  
  switch (validatedArgs.period) {
    case 'day':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 1);
      break;
    case 'week':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      break;
  }

  // Get token usage metrics
  const tokenUsage = await prisma.userTokenUsage.findMany({
    where: {
      date: {
        gte: startDate.toISOString().split('T')[0],
      },
    },
    orderBy: {
      date: 'asc',
    },
  });

  // Get latency metrics
  const latencyMetrics = await prisma.aIBenchmark.findMany({
    where: {
      timestamp: {
        gte: startDate,
      },
    },
    orderBy: {
      timestamp: 'asc',
    },
  });

  // Get throughput metrics from logs
  const throughputLogs = await prisma.systemLog.findMany({
    where: {
      category: 'AI_THROUGHPUT',
      timestamp: {
        gte: startDate,
      },
    },
    orderBy: {
      timestamp: 'asc',
    },
  });

  // Extract throughput data from logs
  const throughputData = throughputLogs.map(log => ({
    timestamp: log.timestamp,
    requestsPerMinute: log.metadata?.requestsPerMinute || 0,
    tokensPerMinute: log.metadata?.tokensPerMinute || 0,
  }));

  // Return the metrics
  return {
    tokenUsage,
    latencyMetrics,
    throughputData,
    config: {
      latencyThresholds: GROQ_CONFIG.performance.latencyThresholds,
      tokenBudgets: GROQ_CONFIG.performance.tokenBudgets,
      throughputLimits: GROQ_CONFIG.performance.throughputLimits,
    },
  };
});
