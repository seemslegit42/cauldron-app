/**
 * Prisma Query Middleware
 * 
 * This middleware intercepts Prisma queries to monitor performance,
 * log slow queries, and collect execution statistics.
 */

import { PrismaClient } from '@prisma/client';
import { LoggingService } from '../../shared/services/logging';
import { v4 as uuidv4 } from 'uuid';

// Configuration interface
export interface QueryMonitoringConfig {
  // Threshold in milliseconds for slow query detection
  slowQueryThreshold: number;
  // Whether to log all queries or only slow ones
  logAllQueries: boolean;
  // Whether to store execution plans for slow queries
  storeExecutionPlans: boolean;
  // Maximum number of parameters to log
  maxParamsLength: number;
  // Maximum result size to log
  maxResultSize: number;
  // Whether to enable query monitoring
  enabled: boolean;
}

// Default configuration
const defaultConfig: QueryMonitoringConfig = {
  slowQueryThreshold: 500, // ms
  logAllQueries: false,
  storeExecutionPlans: true,
  maxParamsLength: 10000, // characters
  maxResultSize: 5000, // characters
  enabled: true
};

/**
 * Apply query monitoring middleware to Prisma client
 */
export function applyQueryMonitoringMiddleware(
  prisma: PrismaClient,
  config: Partial<QueryMonitoringConfig> = {}
): PrismaClient {
  // Merge with default config
  const mergedConfig: QueryMonitoringConfig = { ...defaultConfig, ...config };
  
  // Skip if disabled
  if (!mergedConfig.enabled) {
    return prisma;
  }

  // Apply middleware
  prisma.$use(async (params, next) => {
    // Generate unique query ID
    const queryId = uuidv4();
    
    // Start timing
    const startTime = performance.now();
    
    // Extract query information
    const { model, action, args } = params;
    
    try {
      // Execute the query
      const result = await next(params);
      
      // Calculate duration
      const duration = performance.now() - startTime;
      
      // Check if this is a slow query
      const isSlow = duration >= mergedConfig.slowQueryThreshold;
      
      // Log the query if it's slow or if we're logging all queries
      if (isSlow || mergedConfig.logAllQueries) {
        await logQuery({
          queryId,
          model,
          action,
          args,
          duration,
          isSlow,
          result,
          error: null,
          config: mergedConfig
        });
        
        // Store execution plan for slow queries if enabled
        if (isSlow && mergedConfig.storeExecutionPlans) {
          await storeExecutionPlan(queryId, model, action, args);
        }
      }
      
      return result;
    } catch (error) {
      // Calculate duration even for failed queries
      const duration = performance.now() - startTime;
      
      // Always log failed queries
      await logQuery({
        queryId,
        model,
        action,
        args,
        duration,
        isSlow: false,
        result: null,
        error,
        config: mergedConfig
      });
      
      // Re-throw the error
      throw error;
    }
  });
  
  return prisma;
}

/**
 * Log a query to the database
 */
async function logQuery({
  queryId,
  model,
  action,
  args,
  duration,
  isSlow,
  result,
  error,
  config
}: {
  queryId: string;
  model: string | undefined;
  action: string;
  args: any;
  duration: number;
  isSlow: boolean;
  result: any;
  error: any;
  config: QueryMonitoringConfig;
}) {
  try {
    // Prepare parameters for logging
    const params = args ? JSON.stringify(args).substring(0, config.maxParamsLength) : null;
    
    // Prepare result for logging (only for successful queries)
    const resultStr = result ? JSON.stringify(result).substring(0, config.maxResultSize) : null;
    
    // Prepare error for logging (only for failed queries)
    const errorStr = error ? {
      message: error.message,
      code: error.code,
      meta: error.meta
    } : null;
    
    // Log to the database
    await LoggingService.logQueryExecution({
      queryId,
      timestamp: new Date(),
      model: model || 'unknown',
      action,
      params,
      duration,
      status: error ? 'error' : 'success',
      isSlow,
      resultSize: result ? JSON.stringify(result).length : 0,
      errorMessage: error?.message,
      tags: [
        `model:${model || 'unknown'}`,
        `action:${action}`,
        isSlow ? 'slow' : 'normal',
        error ? 'error' : 'success'
      ],
      metadata: {
        error: errorStr,
        result: resultStr
      }
    });
  } catch (logError) {
    // Don't let logging errors affect the application
    console.error('Failed to log query:', logError);
  }
}

/**
 * Store execution plan for a query
 */
async function storeExecutionPlan(
  queryId: string,
  model: string | undefined,
  action: string,
  args: any
) {
  try {
    // For PostgreSQL, we would use EXPLAIN ANALYZE
    // This requires a raw query execution, which we'll implement
    // in the QueryAnalyticsService
    
    // For now, just log that we would store the execution plan
    console.log(`Would store execution plan for query ${queryId} (${model}.${action})`);
  } catch (error) {
    console.error('Failed to store execution plan:', error);
  }
}
