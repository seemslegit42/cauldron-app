/**
 * Stale Log Cleanup Job
 * 
 * This job extends the existing log rotation system to handle stale logs more efficiently.
 * It provides visual logging for execution batches and integrates with Sentinel.
 */

import { prisma } from 'wasp/server';
import { LoggingService } from '../../shared/services/logging';
import { LogArchivingService } from '../../shared/services/logArchiving';
import { MaintenanceOperation, MaintenanceConfig } from '../services/maintenanceService';
import { SentinelMetricsService } from '../../sentinel/services/sentinelMetricsService';

// Default configuration
const defaultConfig = {
  systemLogs: {
    staleThresholdDays: 180,
    batchSize: 1000,
    archiveEnabled: true,
    archiveStorage: 'local',
  },
  agentLogs: {
    staleThresholdDays: 90,
    batchSize: 1000,
    archiveEnabled: true,
    archiveStorage: 'local',
  },
  apiLogs: {
    staleThresholdDays: 30,
    batchSize: 1000,
    archiveEnabled: true,
    archiveStorage: 'local',
    excludeHealthChecks: true,
  },
  approvalLogs: {
    staleThresholdDays: 365,
    batchSize: 1000,
    archiveEnabled: true,
    archiveStorage: 'local',
    preserveApproved: true,
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
async function getStaleLogConfig() {
  try {
    // Try to get the configuration from the database
    const globalSettings = await prisma.globalSettings.findFirst({
      where: {
        settings: {
          path: ['staleLogCleanup'],
          not: undefined,
        },
      },
    });

    if (globalSettings?.settings?.staleLogCleanup) {
      return {
        ...defaultConfig,
        ...globalSettings.settings.staleLogCleanup,
      };
    }

    return defaultConfig;
  } catch (error) {
    console.error('Error getting stale log cleanup configuration:', error);
    return defaultConfig;
  }
}

/**
 * Stale System Logs Cleanup Operation
 */
class StaleSystemLogsCleanup extends MaintenanceOperation {
  private config: any;

  constructor(config: Partial<MaintenanceConfig> = {}) {
    super(config);
  }

  async doExecute(): Promise<void> {
    try {
      // Get the current configuration
      this.config = await getStaleLogConfig();
      const { staleThresholdDays, batchSize, archiveEnabled, archiveStorage } = this.config.systemLogs;
      const cutoffDate = daysAgo(staleThresholdDays);

      // Get count of logs to be cleaned up
      const count = await prisma.systemLog.count({
        where: {
          timestamp: {
            lt: cutoffDate,
          },
        },
      });

      if (count === 0) {
        await this.logDebug('No stale system logs to clean up');
        return;
      }

      await this.logDebug(`Found ${count} stale system logs to clean up`);

      // Process in batches
      let processedCount = 0;
      while (processedCount < count) {
        // Get batch of logs
        const logs = await prisma.systemLog.findMany({
          where: {
            timestamp: {
              lt: cutoffDate,
            },
          },
          take: batchSize,
          orderBy: {
            timestamp: 'asc',
          },
        });

        if (logs.length === 0) break;

        // Archive logs if enabled
        if (archiveEnabled) {
          const oldestLog = logs[0];
          const newestLog = logs[logs.length - 1];
          
          await LogArchivingService.archiveSystemLogs(
            oldestLog.timestamp,
            newestLog.timestamp,
            archiveStorage
          );
        }

        // Delete logs
        const result = await prisma.systemLog.deleteMany({
          where: {
            id: {
              in: logs.map(log => log.id),
            },
          },
        });

        processedCount += result.count;
        this.itemsProcessed += result.count;

        await this.logDebug(`Cleaned up batch of ${result.count} system logs, total: ${processedCount}/${count}`);

        // Update Sentinel metrics
        await SentinelMetricsService.updateMetric('log_cleanup_progress', processedCount / count * 100);
      }

      // Log the cleanup
      await LoggingService.logSystemEvent({
        message: `Cleaned up ${processedCount} stale system logs`,
        level: 'INFO',
        category: 'MAINTENANCE',
        source: 'stale-log-cleanup',
        tags: ['maintenance', 'log-cleanup', 'system-logs'],
        metadata: {
          staleThresholdDays,
          cutoffDate,
          count: processedCount,
          archiveEnabled,
          archiveStorage,
        },
      });

      // Update Sentinel metrics
      await SentinelMetricsService.updateMetric('stale_logs_cleaned', processedCount);
      await SentinelMetricsService.updateMetric('last_log_cleanup', new Date().getTime());
    } catch (error) {
      this.errors.push(error as Error);
      console.error('Error cleaning up stale system logs:', error);
      throw error;
    }
  }
}

/**
 * Stale Agent Logs Cleanup Operation
 */
class StaleAgentLogsCleanup extends MaintenanceOperation {
  private config: any;

  constructor(config: Partial<MaintenanceConfig> = {}) {
    super(config);
  }

  async doExecute(): Promise<void> {
    try {
      // Get the current configuration
      this.config = await getStaleLogConfig();
      const { staleThresholdDays, batchSize, archiveEnabled, archiveStorage } = this.config.agentLogs;
      const cutoffDate = daysAgo(staleThresholdDays);

      // Get count of logs to be cleaned up
      const count = await prisma.agentLog.count({
        where: {
          timestamp: {
            lt: cutoffDate,
          },
        },
      });

      if (count === 0) {
        await this.logDebug('No stale agent logs to clean up');
        return;
      }

      await this.logDebug(`Found ${count} stale agent logs to clean up`);

      // Process in batches
      let processedCount = 0;
      while (processedCount < count) {
        // Get batch of logs
        const logs = await prisma.agentLog.findMany({
          where: {
            timestamp: {
              lt: cutoffDate,
            },
          },
          take: batchSize,
          orderBy: {
            timestamp: 'asc',
          },
        });

        if (logs.length === 0) break;

        // Archive logs if enabled
        if (archiveEnabled) {
          const oldestLog = logs[0];
          const newestLog = logs[logs.length - 1];
          
          await LogArchivingService.archiveAgentLogs(
            oldestLog.timestamp,
            newestLog.timestamp,
            archiveStorage
          );
        }

        // Delete logs
        const result = await prisma.agentLog.deleteMany({
          where: {
            id: {
              in: logs.map(log => log.id),
            },
          },
        });

        processedCount += result.count;
        this.itemsProcessed += result.count;

        await this.logDebug(`Cleaned up batch of ${result.count} agent logs, total: ${processedCount}/${count}`);

        // Update Sentinel metrics
        await SentinelMetricsService.updateMetric('log_cleanup_progress', processedCount / count * 100);
      }

      // Log the cleanup
      await LoggingService.logSystemEvent({
        message: `Cleaned up ${processedCount} stale agent logs`,
        level: 'INFO',
        category: 'MAINTENANCE',
        source: 'stale-log-cleanup',
        tags: ['maintenance', 'log-cleanup', 'agent-logs'],
        metadata: {
          staleThresholdDays,
          cutoffDate,
          count: processedCount,
          archiveEnabled,
          archiveStorage,
        },
      });

      // Update Sentinel metrics
      await SentinelMetricsService.updateMetric('stale_logs_cleaned', processedCount, { type: 'agent' });
    } catch (error) {
      this.errors.push(error as Error);
      console.error('Error cleaning up stale agent logs:', error);
      throw error;
    }
  }
}

/**
 * Main stale log cleanup job function
 */
export const staleLogCleanupJob = async () => {
  try {
    console.log('Starting stale log cleanup job');

    // Clean up stale system logs
    const systemLogsCleanup = new StaleSystemLogsCleanup();
    await systemLogsCleanup.execute();

    // Clean up stale agent logs
    const agentLogsCleanup = new StaleAgentLogsCleanup();
    await agentLogsCleanup.execute();

    console.log('Stale log cleanup job completed successfully');
  } catch (error) {
    console.error('Error in stale log cleanup job:', error);
    throw error;
  }
};
