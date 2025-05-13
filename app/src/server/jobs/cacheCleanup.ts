/**
 * Cache Cleanup Job
 * 
 * This job cleans up expired cache entries and optimizes cache performance.
 */

import { prisma } from 'wasp/server';
import { LoggingService } from '../../shared/services/logging';
import { cleanupExpiredCache, getCacheStats } from '../../ai-services/aiResponseCache';

/**
 * Cleans up expired cache entries and performs cache optimization
 */
export async function cacheCleanupJob(): Promise<void> {
  try {
    // Log job start
    await LoggingService.logSystemEvent({
      message: 'Starting cache cleanup job',
      level: 'INFO',
      category: 'MAINTENANCE',
      source: 'cache-cleanup-job',
      tags: ['maintenance', 'cache', 'cleanup'],
    });

    // Get cache stats before cleanup
    const beforeStats = await getCacheStats();

    // Clean up expired cache entries
    await cleanupExpiredCache();

    // Get cache stats after cleanup
    const afterStats = await getCacheStats();

    // Calculate cleanup metrics
    const entriesRemoved = beforeStats.databaseSize - afterStats.databaseSize;
    const memoryEntriesRemoved = beforeStats.memorySize - afterStats.memorySize;

    // Log cleanup results
    await LoggingService.logSystemEvent({
      message: `Cache cleanup completed: ${entriesRemoved} database entries and ${memoryEntriesRemoved} memory entries removed`,
      level: 'INFO',
      category: 'MAINTENANCE',
      source: 'cache-cleanup-job',
      tags: ['maintenance', 'cache', 'cleanup', 'completed'],
      metadata: {
        beforeStats,
        afterStats,
        entriesRemoved,
        memoryEntriesRemoved,
      },
    });

    // Optimize cache by removing low-hit entries if cache is near capacity
    if (afterStats.databaseSize > 1000) { // Arbitrary threshold
      await optimizeCache();
    }

    // Update maintenance job record
    // Using MaintenanceJob model instead of SystemMaintenanceJob
    await prisma.maintenanceJob.create({
      data: {
        jobType: 'cache-cleanup',
        startTime: startTime,
        endTime: new Date(),
        status: 'success',
        itemsProcessed: entriesRemoved + memoryEntriesRemoved,
        metadata: {
          entriesRemoved,
          memoryEntriesRemoved,
          beforeSize: beforeStats.databaseSize,
          afterSize: afterStats.databaseSize,
        },
        errors: null,
        details: {
          entriesRemoved,
          memoryEntriesRemoved,
          beforeSize: beforeStats.databaseSize,
          afterSize: afterStats.databaseSize,
        },
      },
    });
  } catch (error) {
    console.error('Error in cache cleanup job:', error);

    // Log error
    await LoggingService.logSystemEvent({
      message: `Cache cleanup job failed: ${error.message}`,
      level: 'ERROR',
      category: 'MAINTENANCE',
      source: 'cache-cleanup-job',
      tags: ['maintenance', 'cache', 'cleanup', 'error'],
      metadata: {
        error: error.message,
        stack: error.stack,
      },
    });

    // Update maintenance job record with error
    await prisma.maintenanceJob.create({
      data: {
        jobType: 'cache-cleanup',
        startTime: startTime,
        endTime: new Date(),
        status: 'failed',
        itemsProcessed: 0,
        errors: error.message,
        details: {
          error: error.message,
          stack: error.stack,
        },
      },
    });
  }
}

/**
 * Optimizes the cache by removing low-hit entries
 */
async function optimizeCache(): Promise<void> {
  try {
    // Find low-hit cache entries (entries with few hits)
    const lowHitEntries = await prisma.aIResponseCache.findMany({
      where: {
        hitCount: {
          lt: 3, // Entries with less than 3 hits
        },
        // Exclude recently created entries
        createdAt: {
          lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Older than 24 hours
        },
      },
      orderBy: {
        hitCount: 'asc',
      },
      take: 100, // Remove up to 100 entries at a time
    });

    if (lowHitEntries.length === 0) {
      return;
    }

    // Delete low-hit entries
    await prisma.aIResponseCache.deleteMany({
      where: {
        id: {
          in: lowHitEntries.map(entry => entry.id),
        },
      },
    });

    // Log optimization results
    await LoggingService.logSystemEvent({
      message: `Cache optimization completed: ${lowHitEntries.length} low-hit entries removed`,
      level: 'INFO',
      category: 'MAINTENANCE',
      source: 'cache-cleanup-job',
      tags: ['maintenance', 'cache', 'optimization'],
      metadata: {
        entriesRemoved: lowHitEntries.length,
        averageHitCount: lowHitEntries.reduce((sum, entry) => sum + entry.hitCount, 0) / lowHitEntries.length,
      },
    });
  } catch (error) {
    console.error('Error optimizing cache:', error);

    // Log error
    await LoggingService.logSystemEvent({
      message: `Cache optimization failed: ${error.message}`,
      level: 'ERROR',
      category: 'MAINTENANCE',
      source: 'cache-cleanup-job',
      tags: ['maintenance', 'cache', 'optimization', 'error'],
      metadata: {
        error: error.message,
        stack: error.stack,
      },
    });
  }
}
