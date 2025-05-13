/**
 * AI Response Cache
 * 
 * This module provides caching functionality for AI responses to improve performance
 * and reduce costs for frequently requested content.
 */

import { createHash } from 'crypto';
import { GROQ_CONFIG } from '../shared/config/ai-config';
import { LoggingService } from '../shared/services/logging';
import { prisma } from 'wasp/server';

// Cache entry interface
interface CacheEntry {
  key: string;
  value: any;
  expiresAt: number;
  metadata: {
    model: string;
    promptHash: string;
    userId?: string;
    module?: string;
    requestType?: string;
    hitCount?: number;
  };
}

// In-memory cache storage
const memoryCache = new Map<string, CacheEntry>();

// Cache configuration
const defaultCacheConfig = {
  enabled: GROQ_CONFIG.performance.cache?.enabled ?? true,
  ttlSeconds: GROQ_CONFIG.performance.cache?.ttlSeconds ?? 300, // 5 minutes
  maxSize: GROQ_CONFIG.performance.cache?.maxSize ?? 100,
};

/**
 * Generates a cache key from the request parameters
 * 
 * @param prompt The prompt text
 * @param model The model name
 * @param options Additional options that affect the response
 * @returns A unique cache key
 */
export function generateCacheKey(
  prompt: string,
  model: string,
  options: {
    temperature?: number;
    maxTokens?: number;
    userId?: string;
    module?: string;
    requestType?: string;
    systemPrompt?: string;
  } = {}
): string {
  // Create a string representation of the request
  const requestString = JSON.stringify({
    prompt,
    model,
    temperature: options.temperature || 0.7,
    maxTokens: options.maxTokens || 1000,
    systemPrompt: options.systemPrompt || '',
    module: options.module || '',
    requestType: options.requestType || '',
  });
  
  // Generate a hash of the request string
  return createHash('md5').update(requestString).digest('hex');
}

/**
 * Gets a response from the cache if available
 * 
 * @param cacheKey The cache key
 * @returns The cached response or null if not found
 */
export async function getCachedResponse(cacheKey: string): Promise<any | null> {
  // Check if caching is enabled
  if (!defaultCacheConfig.enabled) {
    return null;
  }
  
  // Check in-memory cache first
  const cacheEntry = memoryCache.get(cacheKey);
  
  if (cacheEntry && cacheEntry.expiresAt > Date.now()) {
    // Update hit count
    cacheEntry.metadata.hitCount = (cacheEntry.metadata.hitCount || 0) + 1;
    memoryCache.set(cacheKey, cacheEntry);
    
    // Log cache hit
    await LoggingService.logSystemEvent({
      message: `Cache hit for ${cacheEntry.metadata.model}`,
      level: 'DEBUG',
      category: 'AI_CACHE',
      source: 'ai-response-cache',
      userId: cacheEntry.metadata.userId,
      tags: ['ai', 'cache', 'hit', cacheEntry.metadata.model],
      metadata: {
        cacheKey,
        model: cacheEntry.metadata.model,
        module: cacheEntry.metadata.module,
        requestType: cacheEntry.metadata.requestType,
        hitCount: cacheEntry.metadata.hitCount,
      },
    });
    
    // Return the cached value
    return cacheEntry.value;
  }
  
  // If not in memory, check database cache
  try {
    const dbCacheEntry = await prisma.aIResponseCache.findUnique({
      where: { key: cacheKey },
    });
    
    if (dbCacheEntry && new Date(dbCacheEntry.expiresAt) > new Date()) {
      // Parse the cached response
      const cachedResponse = JSON.parse(dbCacheEntry.response);
      
      // Update hit count
      await prisma.aIResponseCache.update({
        where: { key: cacheKey },
        data: {
          hitCount: { increment: 1 },
          lastAccessedAt: new Date(),
        },
      });
      
      // Add to memory cache
      memoryCache.set(cacheKey, {
        key: cacheKey,
        value: cachedResponse,
        expiresAt: new Date(dbCacheEntry.expiresAt).getTime(),
        metadata: {
          model: dbCacheEntry.model,
          promptHash: dbCacheEntry.promptHash,
          userId: dbCacheEntry.userId,
          module: dbCacheEntry.module,
          requestType: dbCacheEntry.requestType,
          hitCount: dbCacheEntry.hitCount + 1,
        },
      });
      
      // Log cache hit from database
      await LoggingService.logSystemEvent({
        message: `Database cache hit for ${dbCacheEntry.model}`,
        level: 'DEBUG',
        category: 'AI_CACHE',
        source: 'ai-response-cache',
        userId: dbCacheEntry.userId,
        tags: ['ai', 'cache', 'hit', 'database', dbCacheEntry.model],
        metadata: {
          cacheKey,
          model: dbCacheEntry.model,
          module: dbCacheEntry.module,
          requestType: dbCacheEntry.requestType,
          hitCount: dbCacheEntry.hitCount + 1,
        },
      });
      
      return cachedResponse;
    }
  } catch (error) {
    console.error('Error checking database cache:', error);
    // Continue execution even if database cache check fails
  }
  
  // Not found in any cache
  return null;
}

/**
 * Stores a response in the cache
 * 
 * @param cacheKey The cache key
 * @param response The response to cache
 * @param options Additional options for caching
 */
export async function cacheResponse(
  cacheKey: string,
  response: any,
  options: {
    prompt: string;
    model: string;
    ttlSeconds?: number;
    userId?: string;
    module?: string;
    requestType?: string;
  }
): Promise<void> {
  // Check if caching is enabled
  if (!defaultCacheConfig.enabled) {
    return;
  }
  
  // Calculate expiration time
  const ttlSeconds = options.ttlSeconds || defaultCacheConfig.ttlSeconds;
  const expiresAt = Date.now() + (ttlSeconds * 1000);
  
  // Generate prompt hash for security (don't store raw prompts)
  const promptHash = createHash('sha256').update(options.prompt).digest('hex');
  
  // Store in memory cache
  memoryCache.set(cacheKey, {
    key: cacheKey,
    value: response,
    expiresAt,
    metadata: {
      model: options.model,
      promptHash,
      userId: options.userId,
      module: options.module,
      requestType: options.requestType,
      hitCount: 0,
    },
  });
  
  // Enforce cache size limit
  if (memoryCache.size > defaultCacheConfig.maxSize) {
    // Find the oldest entry
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    
    for (const [key, entry] of memoryCache.entries()) {
      if (entry.expiresAt < oldestTime) {
        oldestTime = entry.expiresAt;
        oldestKey = key;
      }
    }
    
    // Remove the oldest entry
    if (oldestKey) {
      memoryCache.delete(oldestKey);
    }
  }
  
  // Store in database cache
  try {
    await prisma.aIResponseCache.upsert({
      where: { key: cacheKey },
      update: {
        response: JSON.stringify(response),
        expiresAt: new Date(expiresAt),
        lastAccessedAt: new Date(),
      },
      create: {
        key: cacheKey,
        promptHash,
        model: options.model,
        response: JSON.stringify(response),
        expiresAt: new Date(expiresAt),
        createdAt: new Date(),
        lastAccessedAt: new Date(),
        userId: options.userId,
        module: options.module,
        requestType: options.requestType,
        hitCount: 0,
      },
    });
    
    // Log cache store
    await LoggingService.logSystemEvent({
      message: `Cached response for ${options.model}`,
      level: 'DEBUG',
      category: 'AI_CACHE',
      source: 'ai-response-cache',
      userId: options.userId,
      tags: ['ai', 'cache', 'store', options.model],
      metadata: {
        cacheKey,
        model: options.model,
        module: options.module,
        requestType: options.requestType,
        ttlSeconds,
      },
    });
  } catch (error) {
    console.error('Error storing in database cache:', error);
    // Continue execution even if database cache store fails
  }
}

/**
 * Invalidates a specific cache entry
 * 
 * @param cacheKey The cache key to invalidate
 */
export async function invalidateCacheEntry(cacheKey: string): Promise<void> {
  // Remove from memory cache
  memoryCache.delete(cacheKey);
  
  // Remove from database cache
  try {
    await prisma.aIResponseCache.delete({
      where: { key: cacheKey },
    });
    
    // Log cache invalidation
    await LoggingService.logSystemEvent({
      message: `Invalidated cache entry: ${cacheKey}`,
      level: 'DEBUG',
      category: 'AI_CACHE',
      source: 'ai-response-cache',
      tags: ['ai', 'cache', 'invalidate'],
      metadata: { cacheKey },
    });
  } catch (error) {
    console.error('Error invalidating database cache entry:', error);
  }
}

/**
 * Invalidates cache entries by pattern
 * 
 * @param pattern Object with patterns to match for invalidation
 */
export async function invalidateCacheByPattern(
  pattern: {
    model?: string;
    userId?: string;
    module?: string;
    requestType?: string;
  }
): Promise<void> {
  // Build the where clause
  const whereClause: any = {};
  if (pattern.model) whereClause.model = pattern.model;
  if (pattern.userId) whereClause.userId = pattern.userId;
  if (pattern.module) whereClause.module = pattern.module;
  if (pattern.requestType) whereClause.requestType = pattern.requestType;
  
  // Find matching entries in database
  try {
    const entries = await prisma.aIResponseCache.findMany({
      where: whereClause,
      select: { key: true },
    });
    
    // Remove from memory cache
    for (const entry of entries) {
      memoryCache.delete(entry.key);
    }
    
    // Remove from database cache
    await prisma.aIResponseCache.deleteMany({
      where: whereClause,
    });
    
    // Log cache invalidation
    await LoggingService.logSystemEvent({
      message: `Invalidated ${entries.length} cache entries by pattern`,
      level: 'INFO',
      category: 'AI_CACHE',
      source: 'ai-response-cache',
      tags: ['ai', 'cache', 'invalidate', 'pattern'],
      metadata: { pattern, count: entries.length },
    });
  } catch (error) {
    console.error('Error invalidating cache by pattern:', error);
  }
}

/**
 * Cleans up expired cache entries
 */
export async function cleanupExpiredCache(): Promise<void> {
  const now = new Date();
  
  // Clean memory cache
  for (const [key, entry] of memoryCache.entries()) {
    if (entry.expiresAt < Date.now()) {
      memoryCache.delete(key);
    }
  }
  
  // Clean database cache
  try {
    const result = await prisma.aIResponseCache.deleteMany({
      where: {
        expiresAt: { lt: now },
      },
    });
    
    // Log cleanup
    await LoggingService.logSystemEvent({
      message: `Cleaned up ${result.count} expired cache entries`,
      level: 'INFO',
      category: 'AI_CACHE',
      source: 'ai-response-cache',
      tags: ['ai', 'cache', 'cleanup'],
      metadata: { count: result.count },
    });
  } catch (error) {
    console.error('Error cleaning up expired cache:', error);
  }
}

/**
 * Gets cache statistics
 * 
 * @returns Cache statistics
 */
export async function getCacheStats(): Promise<any> {
  try {
    // Get total count
    const totalCount = await prisma.aIResponseCache.count();
    
    // Get hit count statistics
    const hitStats = await prisma.aIResponseCache.aggregate({
      _sum: { hitCount: true },
      _avg: { hitCount: true },
      _max: { hitCount: true },
    });
    
    // Get model statistics
    const modelStats = await prisma.aIResponseCache.groupBy({
      by: ['model'],
      _count: true,
      _sum: { hitCount: true },
    });
    
    // Get module statistics
    const moduleStats = await prisma.aIResponseCache.groupBy({
      by: ['module'],
      _count: true,
      _sum: { hitCount: true },
    });
    
    // Get request type statistics
    const requestTypeStats = await prisma.aIResponseCache.groupBy({
      by: ['requestType'],
      _count: true,
      _sum: { hitCount: true },
    });
    
    return {
      memorySize: memoryCache.size,
      databaseSize: totalCount,
      hitStats,
      modelStats,
      moduleStats,
      requestTypeStats,
      config: defaultCacheConfig,
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return {
      error: 'Failed to get cache statistics',
      memorySize: memoryCache.size,
      config: defaultCacheConfig,
    };
  }
}
