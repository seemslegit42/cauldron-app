/**
 * Query Performance Service
 * 
 * This service provides functionality for optimizing query performance,
 * including caching, query plan analysis, and performance metrics.
 */

import { prisma } from 'wasp/server';
import { HttpError } from 'wasp/server';
import { LoggingService } from '../../shared/services/logging';
import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

// Cache entry interface
interface QueryCacheEntry {
  key: string;
  value: any;
  expiresAt: number;
  metadata: {
    model: string;
    action: string;
    paramsHash: string;
    userId?: string;
    agentId?: string;
    hitCount?: number;
  };
}

// In-memory cache storage
const queryCache = new Map<string, QueryCacheEntry>();

// Default cache configuration
const defaultCacheConfig = {
  enabled: true,
  ttlSeconds: {
    findMany: 300, // 5 minutes
    findUnique: 600, // 10 minutes
    findFirst: 600, // 10 minutes
    count: 300, // 5 minutes
    aggregate: 300, // 5 minutes
  },
  maxSize: 1000, // Maximum number of entries in memory cache
  maxResultSize: 10000, // Maximum size of result to cache (in characters)
};

/**
 * Query Performance Service
 * 
 * This service provides functionality for optimizing query performance,
 * including caching, query plan analysis, and performance metrics.
 */
export class QueryPerformanceService {
  /**
   * Generate a cache key for a query
   * 
   * @param model The Prisma model
   * @param action The Prisma action
   * @param params The query parameters
   * @param options Additional options
   * @returns A unique cache key
   */
  static generateCacheKey(
    model: string,
    action: string,
    params: Record<string, any>,
    options: {
      userId?: string;
      agentId?: string;
    } = {}
  ): string {
    // Create a string representation of the query
    const queryString = JSON.stringify({
      model,
      action,
      params,
      userId: options.userId,
      agentId: options.agentId,
    });

    // Generate a hash of the query string
    return createHash('sha256').update(queryString).digest('hex');
  }

  /**
   * Get a cached query result
   * 
   * @param cacheKey The cache key
   * @returns The cached result or null if not found
   */
  static async getCachedQueryResult(cacheKey: string): Promise<any | null> {
    // Check memory cache first
    const memoryCacheEntry = queryCache.get(cacheKey);
    if (memoryCacheEntry && memoryCacheEntry.expiresAt > Date.now()) {
      // Update hit count in memory
      memoryCacheEntry.metadata.hitCount = (memoryCacheEntry.metadata.hitCount || 0) + 1;
      return memoryCacheEntry.value;
    }

    // If not in memory cache, check database cache
    try {
      const dbCacheEntry = await prisma.queryCache.findUnique({
        where: { key: cacheKey },
      });

      if (dbCacheEntry && new Date(dbCacheEntry.expiresAt) > new Date()) {
        // Parse the cached result
        const cachedResult = JSON.parse(dbCacheEntry.result);

        // Update hit count
        await prisma.queryCache.update({
          where: { key: cacheKey },
          data: {
            hitCount: { increment: 1 },
            lastAccessedAt: new Date(),
          },
        });

        // Add to memory cache
        queryCache.set(cacheKey, {
          key: cacheKey,
          value: cachedResult,
          expiresAt: new Date(dbCacheEntry.expiresAt).getTime(),
          metadata: {
            model: dbCacheEntry.model,
            action: dbCacheEntry.action,
            paramsHash: dbCacheEntry.paramsHash,
            userId: dbCacheEntry.userId,
            agentId: dbCacheEntry.agentId,
            hitCount: dbCacheEntry.hitCount + 1,
          },
        });

        return cachedResult;
      }
    } catch (error) {
      console.error('Error getting cached query result:', error);
      // Continue without cache on error
    }

    return null;
  }

  /**
   * Cache a query result
   * 
   * @param cacheKey The cache key
   * @param result The query result
   * @param options Caching options
   */
  static async cacheQueryResult(
    cacheKey: string,
    result: any,
    options: {
      model: string;
      action: string;
      params: Record<string, any>;
      userId?: string;
      agentId?: string;
      ttlSeconds?: number;
    }
  ): Promise<void> {
    try {
      // Skip caching if result is too large
      const resultString = JSON.stringify(result);
      if (resultString.length > defaultCacheConfig.maxResultSize) {
        return;
      }

      // Get TTL based on action or default
      const ttlSeconds = options.ttlSeconds || 
        defaultCacheConfig.ttlSeconds[options.action as keyof typeof defaultCacheConfig.ttlSeconds] || 
        defaultCacheConfig.ttlSeconds.findMany;

      // Calculate expiration time
      const expiresAt = Date.now() + (ttlSeconds * 1000);

      // Generate params hash for security (don't store raw params)
      const paramsHash = createHash('sha256').update(JSON.stringify(options.params)).digest('hex');

      // Store in memory cache
      queryCache.set(cacheKey, {
        key: cacheKey,
        value: result,
        expiresAt,
        metadata: {
          model: options.model,
          action: options.action,
          paramsHash,
          userId: options.userId,
          agentId: options.agentId,
          hitCount: 0,
        },
      });

      // Store in database cache
      await prisma.queryCache.upsert({
        where: { key: cacheKey },
        update: {
          result: resultString,
          expiresAt: new Date(expiresAt),
          lastAccessedAt: new Date(),
        },
        create: {
          key: cacheKey,
          model: options.model,
          action: options.action,
          paramsHash,
          result: resultString,
          expiresAt: new Date(expiresAt),
          createdAt: new Date(),
          lastAccessedAt: new Date(),
          userId: options.userId,
          agentId: options.agentId,
          hitCount: 0,
        },
      });

      // Clean up memory cache if it's too large
      if (queryCache.size > defaultCacheConfig.maxSize) {
        this.cleanupMemoryCache();
      }
    } catch (error) {
      console.error('Error caching query result:', error);
      // Continue without caching on error
    }
  }

  /**
   * Clean up memory cache by removing expired entries and oldest entries if still too large
   */
  private static cleanupMemoryCache(): void {
    // Remove expired entries
    const now = Date.now();
    for (const [key, entry] of queryCache.entries()) {
      if (entry.expiresAt < now) {
        queryCache.delete(key);
      }
    }

    // If still too large, remove oldest entries
    if (queryCache.size > defaultCacheConfig.maxSize) {
      // Convert to array and sort by expiration time
      const entries = Array.from(queryCache.entries());
      entries.sort((a, b) => a[1].expiresAt - b[1].expiresAt);

      // Remove oldest entries until we're under the limit
      const entriesToRemove = entries.slice(0, entries.length - defaultCacheConfig.maxSize);
      for (const [key] of entriesToRemove) {
        queryCache.delete(key);
      }
    }
  }

  /**
   * Generate and store an execution plan for a query
   * 
   * @param queryId The query ID
   * @param model The Prisma model
   * @param action The Prisma action
   * @param params The query parameters
   */
  static async storeQueryExecutionPlan(
    queryId: string,
    model: string,
    action: string,
    params: Record<string, any>
  ): Promise<void> {
    try {
      // Generate the execution plan
      const planData = await this.generateExecutionPlan(model, action, params);
      
      if (planData) {
        // Store the execution plan
        await prisma.queryExecutionPlan.create({
          data: {
            queryId,
            planType: 'explain_analyze',
            planData,
            metadata: {
              model,
              action,
              params: JSON.stringify(params).substring(0, 1000), // Limit size
            },
          },
        });
      }
    } catch (error) {
      console.error('Error storing query execution plan:', error);
      // Continue without storing execution plan on error
    }
  }

  /**
   * Generate an execution plan for a query
   * 
   * @param model The Prisma model
   * @param action The Prisma action
   * @param params The query parameters
   * @returns The execution plan data
   */
  private static async generateExecutionPlan(
    model: string,
    action: string,
    params: Record<string, any>
  ): Promise<string> {
    try {
      // Convert Prisma query to SQL
      const sql = this.convertPrismaQueryToSql(model, action, params);
      
      // Execute EXPLAIN ANALYZE
      const result = await prisma.$queryRawUnsafe(`EXPLAIN ANALYZE ${sql}`);
      
      return JSON.stringify(result);
    } catch (error) {
      console.error('Error generating execution plan:', error);
      return `Error generating execution plan: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  /**
   * Convert a Prisma query to SQL
   * 
   * @param model The Prisma model
   * @param action The Prisma action
   * @param params The query parameters
   * @returns The SQL query
   */
  private static convertPrismaQueryToSql(
    model: string,
    action: string,
    params: Record<string, any>
  ): string {
    // This is a simplified implementation
    // In a real implementation, we would use Prisma's query engine to generate the SQL
    
    // For now, just return a basic SQL query based on the model and action
    switch (action) {
      case 'findMany':
        return `SELECT * FROM "${model}"`;
      case 'findUnique':
        return `SELECT * FROM "${model}" WHERE id = '${params.where?.id || 'unknown'}'`;
      case 'count':
        return `SELECT COUNT(*) FROM "${model}"`;
      default:
        return `SELECT * FROM "${model}"`;
    }
  }

  /**
   * Track query performance metrics
   * 
   * @param model The Prisma model
   * @param action The Prisma action
   * @param duration The query duration in milliseconds
   * @param resultSize The result size in bytes
   * @param moduleId Optional module ID
   */
  static async trackQueryPerformance(
    model: string,
    action: string,
    duration: number,
    resultSize: number,
    moduleId?: string
  ): Promise<void> {
    try {
      // Store performance metrics
      await prisma.queryPerformanceMetric.upsert({
        where: {
          modelAction: `${model}:${action}`,
        },
        update: {
          totalExecutions: { increment: 1 },
          totalDuration: { increment: duration },
          totalResultSize: { increment: resultSize },
          slowExecutions: duration > 500 ? { increment: 1 } : undefined,
          lastExecutionAt: new Date(),
          averageDuration: {
            set: prisma.raw(`(total_duration + ${duration}) / (total_executions + 1)`),
          },
          averageResultSize: {
            set: prisma.raw(`(total_result_size + ${resultSize}) / (total_executions + 1)`),
          },
        },
        create: {
          modelAction: `${model}:${action}`,
          model,
          action,
          totalExecutions: 1,
          totalDuration: duration,
          totalResultSize: resultSize,
          slowExecutions: duration > 500 ? 1 : 0,
          lastExecutionAt: new Date(),
          averageDuration: duration,
          averageResultSize: resultSize,
          moduleId,
        },
      });
    } catch (error) {
      console.error('Error tracking query performance:', error);
      // Continue without tracking performance on error
    }
  }
}
