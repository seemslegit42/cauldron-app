/**
 * Prisma Middleware Initialization
 * 
 * This file initializes all Prisma middleware, including query monitoring.
 */

import { PrismaClient } from '@prisma/client';
import { applyQueryMonitoringMiddleware } from './prismaQueryMiddleware';

/**
 * Initialize Prisma middleware
 * 
 * This function applies all middleware to the Prisma client.
 * It should be called once during application startup.
 */
export function initPrismaMiddleware(prisma: PrismaClient): PrismaClient {
  // Apply query monitoring middleware
  prisma = applyQueryMonitoringMiddleware(prisma, {
    slowQueryThreshold: 500, // ms
    logAllQueries: process.env.NODE_ENV === 'development', // Log all queries in development
    storeExecutionPlans: true,
    maxParamsLength: 10000,
    maxResultSize: 5000,
    enabled: true
  });

  // Add other middleware here as needed
  
  return prisma;
}

/**
 * Get the middleware configuration from environment variables
 */
export function getMiddlewareConfig() {
  return {
    queryMonitoring: {
      slowQueryThreshold: parseInt(process.env.SLOW_QUERY_THRESHOLD || '500'),
      logAllQueries: process.env.LOG_ALL_QUERIES === 'true',
      storeExecutionPlans: process.env.STORE_EXECUTION_PLANS !== 'false',
      maxParamsLength: parseInt(process.env.MAX_PARAMS_LENGTH || '10000'),
      maxResultSize: parseInt(process.env.MAX_RESULT_SIZE || '5000'),
      enabled: process.env.ENABLE_QUERY_MONITORING !== 'false'
    }
  };
}
