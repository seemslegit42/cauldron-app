/**
 * Archive Rotation Job
 * 
 * This job rotates and maintains collaboration archives.
 * It ensures compliance with retention policies and integrates with Sentinel.
 */

import { prisma } from 'wasp/server';
import { LoggingService } from '../../../shared/services/logging';
import { MaintenanceOperation, MaintenanceConfig } from '../../../server/services/maintenanceService';
import { SentinelMetricsService } from '../../sentinel/services/sentinelMetricsService';

// Default configuration
const defaultConfig = {
  collaborationArchives: {
    retentionDays: 730, // 2 years
    batchSize: 100,
    preserveVerified: true,
    preserveTampered: true,
  },
  archiveVerifications: {
    retentionDays: 730, // 2 years
    batchSize: 500,
  },
  archiveAccessLogs: {
    retentionDays: 365, // 1 year
    batchSize: 1000,
  },
};

/**
 * Helper function to get days ago
 */
function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * Get archive rotation configuration
 */
async function getArchiveRotationConfig(): Promise<any> {
  try {
    // Get global settings
    const globalSettings = await prisma.globalSettings.findFirst();
    
    if (!globalSettings || !globalSettings.archiveRotationConfig) {
      return defaultConfig;
    }
    
    return {
      ...defaultConfig,
      ...(globalSettings.archiveRotationConfig as any),
    };
  } catch (error) {
    console.error('Error getting archive rotation config:', error);
    return defaultConfig;
  }
}

/**
 * Collaboration Archives Rotation Operation
 */
class CollaborationArchivesRotation extends MaintenanceOperation {
  private config: any;

  constructor(config: Partial<MaintenanceConfig> = {}) {
    super(config);
  }

  async doExecute(): Promise<void> {
    try {
      // Get the current configuration
      this.config = await getArchiveRotationConfig();
      const { retentionDays, batchSize, preserveVerified, preserveTampered } = this.config.collaborationArchives;
      const cutoffDate = daysAgo(retentionDays);

      // Build where clause
      const whereClause: any = {
        createdAt: {
          lt: cutoffDate,
        },
      };

      // If preserveVerified is true, exclude verified archives
      if (preserveVerified) {
        whereClause.status = {
          not: 'verified',
        };
      }

      // If preserveTampered is true, exclude tampered archives
      if (preserveTampered) {
        whereClause.status = {
          not: 'tampered',
        };
      }

      // Get count of old archives
      const count = await prisma.collaborationArchive.count({ where: whereClause });

      if (count === 0) {
        await this.logDebug('No old collaboration archives to rotate');
        return;
      }

      await this.logDebug(`Found ${count} old collaboration archives to rotate`);

      // Process in batches
      let processedCount = 0;
      while (processedCount < count) {
        // Get batch of archives to delete
        const archives = await prisma.collaborationArchive.findMany({
          where: whereClause,
          take: batchSize,
          include: {
            archiveContent: true,
          },
        });

        // Delete archive contents first (due to foreign key constraints)
        const archiveIds = archives.map(archive => archive.id);
        const contentIds = archives
          .filter(archive => archive.archiveContent)
          .map(archive => archive.archiveContent!.id);

        if (contentIds.length > 0) {
          await prisma.archiveContent.deleteMany({
            where: {
              id: {
                in: contentIds,
              },
            },
          });
        }

        // Delete archives
        const result = await prisma.collaborationArchive.deleteMany({
          where: {
            id: {
              in: archiveIds,
            },
          },
        });

        processedCount += result.count;
        this.itemsProcessed += result.count;

        await this.logDebug(`Rotated batch of ${result.count} collaboration archives, total: ${processedCount}/${count}`);

        // Update Sentinel metrics
        await SentinelMetricsService.updateMetric('archive_rotation_progress', processedCount / count * 100);
      }

      // Log the rotation
      await LoggingService.logSystemEvent({
        message: `Rotated ${processedCount} old collaboration archives`,
        level: 'INFO',
        category: 'MAINTENANCE',
        source: 'archive-rotation',
        tags: ['maintenance', 'archive-rotation', 'collaboration-archives'],
        metadata: {
          retentionDays,
          cutoffDate,
          count: processedCount,
          preserveVerified,
          preserveTampered,
        },
      });
    } catch (error) {
      await this.logError('Error rotating collaboration archives', error);
      throw error;
    }
  }
}

/**
 * Archive Verifications Rotation Operation
 */
class ArchiveVerificationsRotation extends MaintenanceOperation {
  private config: any;

  constructor(config: Partial<MaintenanceConfig> = {}) {
    super(config);
  }

  async doExecute(): Promise<void> {
    try {
      // Get the current configuration
      this.config = await getArchiveRotationConfig();
      const { retentionDays, batchSize } = this.config.archiveVerifications;
      const cutoffDate = daysAgo(retentionDays);

      // Get count of old verifications
      const count = await prisma.archiveVerification.count({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
        },
      });

      if (count === 0) {
        await this.logDebug('No old archive verifications to rotate');
        return;
      }

      await this.logDebug(`Found ${count} old archive verifications to rotate`);

      // Process in batches
      let processedCount = 0;
      while (processedCount < count) {
        // Delete batch of verifications
        const result = await prisma.archiveVerification.deleteMany({
          where: {
            createdAt: {
              lt: cutoffDate,
            },
          },
          take: batchSize,
        });

        processedCount += result.count;
        this.itemsProcessed += result.count;

        await this.logDebug(`Rotated batch of ${result.count} archive verifications, total: ${processedCount}/${count}`);
      }

      // Log the rotation
      await LoggingService.logSystemEvent({
        message: `Rotated ${processedCount} old archive verifications`,
        level: 'INFO',
        category: 'MAINTENANCE',
        source: 'archive-rotation',
        tags: ['maintenance', 'archive-rotation', 'archive-verifications'],
        metadata: {
          retentionDays,
          cutoffDate,
          count: processedCount,
        },
      });
    } catch (error) {
      await this.logError('Error rotating archive verifications', error);
      throw error;
    }
  }
}

/**
 * Archive Access Logs Rotation Operation
 */
class ArchiveAccessLogsRotation extends MaintenanceOperation {
  private config: any;

  constructor(config: Partial<MaintenanceConfig> = {}) {
    super(config);
  }

  async doExecute(): Promise<void> {
    try {
      // Get the current configuration
      this.config = await getArchiveRotationConfig();
      const { retentionDays, batchSize } = this.config.archiveAccessLogs;
      const cutoffDate = daysAgo(retentionDays);

      // Get count of old access logs
      const count = await prisma.archiveAccessLog.count({
        where: {
          timestamp: {
            lt: cutoffDate,
          },
        },
      });

      if (count === 0) {
        await this.logDebug('No old archive access logs to rotate');
        return;
      }

      await this.logDebug(`Found ${count} old archive access logs to rotate`);

      // Process in batches
      let processedCount = 0;
      while (processedCount < count) {
        // Delete batch of access logs
        const result = await prisma.archiveAccessLog.deleteMany({
          where: {
            timestamp: {
              lt: cutoffDate,
            },
          },
          take: batchSize,
        });

        processedCount += result.count;
        this.itemsProcessed += result.count;

        await this.logDebug(`Rotated batch of ${result.count} archive access logs, total: ${processedCount}/${count}`);
      }

      // Log the rotation
      await LoggingService.logSystemEvent({
        message: `Rotated ${processedCount} old archive access logs`,
        level: 'INFO',
        category: 'MAINTENANCE',
        source: 'archive-rotation',
        tags: ['maintenance', 'archive-rotation', 'archive-access-logs'],
        metadata: {
          retentionDays,
          cutoffDate,
          count: processedCount,
        },
      });
    } catch (error) {
      await this.logError('Error rotating archive access logs', error);
      throw error;
    }
  }
}

/**
 * Main archive rotation job function
 */
export const archiveRotationJob = async () => {
  try {
    console.log('Starting archive rotation job');
    const startTime = Date.now();

    // Rotate old collaboration archives
    const archivesRotation = new CollaborationArchivesRotation();
    const archivesResult = await archivesRotation.execute();

    // Rotate old archive verifications
    const verificationsRotation = new ArchiveVerificationsRotation();
    const verificationsResult = await verificationsRotation.execute();

    // Rotate old archive access logs
    const accessLogsRotation = new ArchiveAccessLogsRotation();
    const accessLogsResult = await accessLogsRotation.execute();

    const duration = Date.now() - startTime;
    console.log('Archive rotation job completed successfully');
    console.log(`Duration: ${duration}ms`);
    console.log(`Archives rotated: ${archivesResult.itemsProcessed}`);
    console.log(`Verifications rotated: ${verificationsResult.itemsProcessed}`);
    console.log(`Access logs rotated: ${accessLogsResult.itemsProcessed}`);

    // Log the job completion
    await LoggingService.logSystemEvent({
      message: 'Archive rotation job completed',
      level: 'INFO',
      category: 'MAINTENANCE',
      source: 'archive-rotation',
      tags: ['maintenance', 'archive-rotation', 'job-complete'],
      metadata: {
        duration,
        archivesRotated: archivesResult.itemsProcessed,
        verificationsRotated: verificationsResult.itemsProcessed,
        accessLogsRotated: accessLogsResult.itemsProcessed,
      },
    });

    return {
      success: true,
      duration,
      archivesRotated: archivesResult.itemsProcessed,
      verificationsRotated: verificationsResult.itemsProcessed,
      accessLogsRotated: accessLogsResult.itemsProcessed,
    };
  } catch (error) {
    console.error('Archive rotation job failed:', error);
    
    // Log the job failure
    await LoggingService.logSystemEvent({
      message: 'Archive rotation job failed',
      level: 'ERROR',
      category: 'MAINTENANCE',
      source: 'archive-rotation',
      tags: ['maintenance', 'archive-rotation', 'job-failed'],
      error: error as Error,
    });
    
    throw error;
  }
};
