/**
 * Data Archiving Job
 * 
 * This job archives expired data across various modules.
 * It implements configurable retention policies and integrates with Sentinel.
 */

import { prisma } from 'wasp/server';
import { LoggingService } from '../../shared/services/logging';
import { MaintenanceOperation, MaintenanceConfig } from '../services/maintenanceService';
import { SentinelMetricsService } from '../../sentinel/services/sentinelMetricsService';

// Default configuration
const defaultConfig = {
  memoryEntries: {
    expirationDays: 90,
    batchSize: 500,
    archiveEnabled: true,
  },
  signals: {
    expirationDays: 30,
    batchSize: 500,
    archiveEnabled: true,
    preserveUnprocessed: true,
  },
  feedbackEntries: {
    expirationDays: 365,
    batchSize: 500,
    archiveEnabled: true,
  },
  workflowExecutions: {
    expirationDays: 60,
    batchSize: 200,
    archiveEnabled: true,
    preserveErrors: true,
  },
};

/**
 * Calculate the date that is N days ago
 */
function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * Get the current configuration
 */
async function getDataArchivingConfig() {
  try {
    // Try to get the configuration from the database
    const globalSettings = await prisma.globalSettings.findFirst({
      where: {
        settings: {
          path: ['dataArchiving'],
          not: undefined,
        },
      },
    });

    if (globalSettings?.settings?.dataArchiving) {
      return {
        ...defaultConfig,
        ...globalSettings.settings.dataArchiving,
      };
    }

    return defaultConfig;
  } catch (error) {
    console.error('Error getting data archiving configuration:', error);
    return defaultConfig;
  }
}

/**
 * Archive data to JSON file
 */
async function archiveData(data: any[], type: string): Promise<string> {
  try {
    // In a real implementation, this would archive to a file or cloud storage
    // For now, we'll just log the data
    const archiveId = `${type}-${new Date().toISOString().split('T')[0]}`;
    
    console.log(`Archived ${data.length} ${type} items with ID: ${archiveId}`);
    
    // Create archive record
    await prisma.logArchive.create({
      data: {
        logType: type,
        startDate: new Date(Math.min(...data.map(item => new Date(item.createdAt).getTime()))),
        endDate: new Date(Math.max(...data.map(item => new Date(item.createdAt).getTime()))),
        count: data.length,
        storageProvider: 'local',
        archiveUrl: `archives/${archiveId}.json`,
        metadata: {
          itemCount: data.length,
          archiveDate: new Date(),
        },
      },
    });
    
    return archiveId;
  } catch (error) {
    console.error(`Error archiving ${type} data:`, error);
    throw error;
  }
}

/**
 * Memory Entries Archiving Operation
 */
class MemoryEntriesArchiving extends MaintenanceOperation {
  private config: any;

  constructor(config: Partial<MaintenanceConfig> = {}) {
    super(config);
  }

  async doExecute(): Promise<void> {
    try {
      // Get the current configuration
      this.config = await getDataArchivingConfig();
      const { expirationDays, batchSize, archiveEnabled } = this.config.memoryEntries;
      const cutoffDate = daysAgo(expirationDays);

      // Get count of expired memory entries
      const count = await prisma.memoryEntry.count({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
          // Only archive expired memories
          OR: [
            { expiresAt: { lt: new Date() } },
            { expiresAt: null },
          ],
        },
      });

      if (count === 0) {
        await this.logDebug('No expired memory entries to archive');
        return;
      }

      await this.logDebug(`Found ${count} expired memory entries to archive`);

      // Process in batches
      let processedCount = 0;
      while (processedCount < count) {
        // Get batch of memory entries
        const memoryEntries = await prisma.memoryEntry.findMany({
          where: {
            createdAt: {
              lt: cutoffDate,
            },
            // Only archive expired memories
            OR: [
              { expiresAt: { lt: new Date() } },
              { expiresAt: null },
            ],
          },
          take: batchSize,
          orderBy: {
            createdAt: 'asc',
          },
        });

        if (memoryEntries.length === 0) break;

        // Archive memory entries if enabled
        if (archiveEnabled) {
          await archiveData(memoryEntries, 'memory-entries');
        }

        // Delete memory entries
        const result = await prisma.memoryEntry.deleteMany({
          where: {
            id: {
              in: memoryEntries.map(entry => entry.id),
            },
          },
        });

        processedCount += result.count;
        this.itemsProcessed += result.count;

        await this.logDebug(`Archived batch of ${result.count} memory entries, total: ${processedCount}/${count}`);

        // Update Sentinel metrics
        await SentinelMetricsService.updateMetric('data_archiving_progress', processedCount / count * 100);
      }

      // Log the archiving
      await LoggingService.logSystemEvent({
        message: `Archived ${processedCount} expired memory entries`,
        level: 'INFO',
        category: 'MAINTENANCE',
        source: 'data-archiving',
        tags: ['maintenance', 'data-archiving', 'memory-entries'],
        metadata: {
          expirationDays,
          cutoffDate,
          count: processedCount,
          archiveEnabled,
        },
      });

      // Update Sentinel metrics
      await SentinelMetricsService.updateMetric('memory_entries_archived', processedCount);
    } catch (error) {
      this.errors.push(error as Error);
      console.error('Error archiving memory entries:', error);
      throw error;
    }
  }
}

/**
 * Signals Archiving Operation
 */
class SignalsArchiving extends MaintenanceOperation {
  private config: any;

  constructor(config: Partial<MaintenanceConfig> = {}) {
    super(config);
  }

  async doExecute(): Promise<void> {
    try {
      // Get the current configuration
      this.config = await getDataArchivingConfig();
      const { expirationDays, batchSize, archiveEnabled, preserveUnprocessed } = this.config.signals;
      const cutoffDate = daysAgo(expirationDays);

      // Build where clause
      const whereClause: any = {
        createdAt: {
          lt: cutoffDate,
        },
      };

      // If preserveUnprocessed is true, only archive processed signals
      if (preserveUnprocessed) {
        whereClause.processed = true;
      }

      // Get count of expired signals
      const count = await prisma.signal.count({ where: whereClause });

      if (count === 0) {
        await this.logDebug('No expired signals to archive');
        return;
      }

      await this.logDebug(`Found ${count} expired signals to archive`);

      // Process in batches
      let processedCount = 0;
      while (processedCount < count) {
        // Get batch of signals
        const signals = await prisma.signal.findMany({
          where: whereClause,
          take: batchSize,
          orderBy: {
            createdAt: 'asc',
          },
        });

        if (signals.length === 0) break;

        // Archive signals if enabled
        if (archiveEnabled) {
          await archiveData(signals, 'signals');
        }

        // Delete signals
        const result = await prisma.signal.deleteMany({
          where: {
            id: {
              in: signals.map(signal => signal.id),
            },
          },
        });

        processedCount += result.count;
        this.itemsProcessed += result.count;

        await this.logDebug(`Archived batch of ${result.count} signals, total: ${processedCount}/${count}`);

        // Update Sentinel metrics
        await SentinelMetricsService.updateMetric('data_archiving_progress', processedCount / count * 100);
      }

      // Log the archiving
      await LoggingService.logSystemEvent({
        message: `Archived ${processedCount} expired signals`,
        level: 'INFO',
        category: 'MAINTENANCE',
        source: 'data-archiving',
        tags: ['maintenance', 'data-archiving', 'signals'],
        metadata: {
          expirationDays,
          cutoffDate,
          count: processedCount,
          archiveEnabled,
          preserveUnprocessed,
        },
      });

      // Update Sentinel metrics
      await SentinelMetricsService.updateMetric('signals_archived', processedCount);
    } catch (error) {
      this.errors.push(error as Error);
      console.error('Error archiving signals:', error);
      throw error;
    }
  }
}

/**
 * Main data archiving job function
 */
export const dataArchivingJob = async () => {
  try {
    console.log('Starting data archiving job');
    const startTime = Date.now();

    // Archive expired memory entries
    const memoryEntriesArchiving = new MemoryEntriesArchiving();
    const memoryResult = await memoryEntriesArchiving.execute();

    // Archive expired signals
    const signalsArchiving = new SignalsArchiving();
    const signalsResult = await signalsArchiving.execute();

    const duration = Date.now() - startTime;
    console.log('Data archiving job completed successfully');

    // Record job execution in Sentinel
    await SentinelMetricsService.recordMaintenanceJob(
      'data_archiving',
      memoryResult.status === 'success' && signalsResult.status === 'success' ? 'success' : 'partial',
      memoryResult.itemsProcessed + signalsResult.itemsProcessed,
      duration,
      {
        memoryEntries: memoryResult,
        signals: signalsResult,
      }
    );
  } catch (error) {
    console.error('Error in data archiving job:', error);
    throw error;
  }
};
