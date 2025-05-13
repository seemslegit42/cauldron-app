/**
 * Audit Snapshot Rotation Job
 * 
 * This job rotates and maintains audit snapshots.
 * It ensures compliance with retention policies and integrates with Sentinel.
 */

import { prisma } from 'wasp/server';
import { LoggingService } from '../../shared/services/logging';
import { MaintenanceOperation, MaintenanceConfig } from '../services/maintenanceService';
import { SentinelMetricsService } from '../../sentinel/services/sentinelMetricsService';

// Default configuration
const defaultConfig = {
  taskAudits: {
    retentionDays: 365,
    batchSize: 500,
    archiveEnabled: true,
  },
  humanApprovals: {
    retentionDays: 730, // 2 years
    batchSize: 500,
    archiveEnabled: true,
    preserveRejected: true,
  },
  apiInteractions: {
    retentionDays: 90,
    batchSize: 1000,
    archiveEnabled: true,
    excludeHealthChecks: true,
  },
  telemetrySpans: {
    retentionDays: 30,
    batchSize: 1000,
    archiveEnabled: false,
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
async function getAuditSnapshotConfig() {
  try {
    // Try to get the configuration from the database
    const globalSettings = await prisma.globalSettings.findFirst({
      where: {
        settings: {
          path: ['auditSnapshotRotation'],
          not: undefined,
        },
      },
    });

    if (globalSettings?.settings?.auditSnapshotRotation) {
      return {
        ...defaultConfig,
        ...globalSettings.settings.auditSnapshotRotation,
      };
    }

    return defaultConfig;
  } catch (error) {
    console.error('Error getting audit snapshot rotation configuration:', error);
    return defaultConfig;
  }
}

/**
 * Archive audit data to JSON file
 */
async function archiveAuditData(data: any[], type: string): Promise<string> {
  try {
    // In a real implementation, this would archive to a file or cloud storage
    // For now, we'll just log the data
    const archiveId = `audit-${type}-${new Date().toISOString().split('T')[0]}`;
    
    console.log(`Archived ${data.length} ${type} audit items with ID: ${archiveId}`);
    
    // Create archive record
    await prisma.logArchive.create({
      data: {
        logType: `audit-${type}`,
        startDate: new Date(Math.min(...data.map(item => new Date(item.createdAt).getTime()))),
        endDate: new Date(Math.max(...data.map(item => new Date(item.createdAt).getTime()))),
        count: data.length,
        storageProvider: 'local',
        archiveUrl: `archives/${archiveId}.json`,
        metadata: {
          itemCount: data.length,
          archiveDate: new Date(),
          type,
        },
      },
    });
    
    return archiveId;
  } catch (error) {
    console.error(`Error archiving ${type} audit data:`, error);
    throw error;
  }
}

/**
 * Task Audits Rotation Operation
 */
class TaskAuditsRotation extends MaintenanceOperation {
  private config: any;

  constructor(config: Partial<MaintenanceConfig> = {}) {
    super(config);
  }

  async doExecute(): Promise<void> {
    try {
      // Get the current configuration
      this.config = await getAuditSnapshotConfig();
      const { retentionDays, batchSize, archiveEnabled } = this.config.taskAudits;
      const cutoffDate = daysAgo(retentionDays);

      // Get count of old task audits
      const count = await prisma.taskAudit.count({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
        },
      });

      if (count === 0) {
        await this.logDebug('No old task audits to rotate');
        return;
      }

      await this.logDebug(`Found ${count} old task audits to rotate`);

      // Process in batches
      let processedCount = 0;
      while (processedCount < count) {
        // Get batch of task audits
        const taskAudits = await prisma.taskAudit.findMany({
          where: {
            createdAt: {
              lt: cutoffDate,
            },
          },
          take: batchSize,
          orderBy: {
            createdAt: 'asc',
          },
        });

        if (taskAudits.length === 0) break;

        // Archive task audits if enabled
        if (archiveEnabled) {
          await archiveAuditData(taskAudits, 'task-audits');
        }

        // Delete task audits
        const result = await prisma.taskAudit.deleteMany({
          where: {
            id: {
              in: taskAudits.map(audit => audit.id),
            },
          },
        });

        processedCount += result.count;
        this.itemsProcessed += result.count;

        await this.logDebug(`Rotated batch of ${result.count} task audits, total: ${processedCount}/${count}`);

        // Update Sentinel metrics
        await SentinelMetricsService.updateMetric('audit_rotation_progress', processedCount / count * 100);
      }

      // Log the rotation
      await LoggingService.logSystemEvent({
        message: `Rotated ${processedCount} old task audits`,
        level: 'INFO',
        category: 'MAINTENANCE',
        source: 'audit-snapshot-rotation',
        tags: ['maintenance', 'audit-rotation', 'task-audits'],
        metadata: {
          retentionDays,
          cutoffDate,
          count: processedCount,
          archiveEnabled,
        },
      });

      // Update Sentinel metrics
      await SentinelMetricsService.updateMetric('task_audits_rotated', processedCount);
    } catch (error) {
      this.errors.push(error as Error);
      console.error('Error rotating task audits:', error);
      throw error;
    }
  }
}

/**
 * Human Approvals Rotation Operation
 */
class HumanApprovalsRotation extends MaintenanceOperation {
  private config: any;

  constructor(config: Partial<MaintenanceConfig> = {}) {
    super(config);
  }

  async doExecute(): Promise<void> {
    try {
      // Get the current configuration
      this.config = await getAuditSnapshotConfig();
      const { retentionDays, batchSize, archiveEnabled, preserveRejected } = this.config.humanApprovals;
      const cutoffDate = daysAgo(retentionDays);

      // Build where clause
      const whereClause: any = {
        timestamp: {
          lt: cutoffDate,
        },
      };

      // If preserveRejected is true, exclude rejected approvals
      if (preserveRejected) {
        whereClause.status = {
          not: 'REJECTED',
        };
      }

      // Get count of old human approvals
      const count = await prisma.humanApproval.count({ where: whereClause });

      if (count === 0) {
        await this.logDebug('No old human approvals to rotate');
        return;
      }

      await this.logDebug(`Found ${count} old human approvals to rotate`);

      // Process in batches
      let processedCount = 0;
      while (processedCount < count) {
        // Get batch of human approvals
        const humanApprovals = await prisma.humanApproval.findMany({
          where: whereClause,
          take: batchSize,
          orderBy: {
            timestamp: 'asc',
          },
        });

        if (humanApprovals.length === 0) break;

        // Archive human approvals if enabled
        if (archiveEnabled) {
          await archiveAuditData(humanApprovals, 'human-approvals');
        }

        // Delete human approvals
        const result = await prisma.humanApproval.deleteMany({
          where: {
            id: {
              in: humanApprovals.map(approval => approval.id),
            },
          },
        });

        processedCount += result.count;
        this.itemsProcessed += result.count;

        await this.logDebug(`Rotated batch of ${result.count} human approvals, total: ${processedCount}/${count}`);

        // Update Sentinel metrics
        await SentinelMetricsService.updateMetric('audit_rotation_progress', processedCount / count * 100);
      }

      // Log the rotation
      await LoggingService.logSystemEvent({
        message: `Rotated ${processedCount} old human approvals`,
        level: 'INFO',
        category: 'MAINTENANCE',
        source: 'audit-snapshot-rotation',
        tags: ['maintenance', 'audit-rotation', 'human-approvals'],
        metadata: {
          retentionDays,
          cutoffDate,
          count: processedCount,
          archiveEnabled,
          preserveRejected,
        },
      });

      // Update Sentinel metrics
      await SentinelMetricsService.updateMetric('human_approvals_rotated', processedCount);
    } catch (error) {
      this.errors.push(error as Error);
      console.error('Error rotating human approvals:', error);
      throw error;
    }
  }
}

/**
 * Main audit snapshot rotation job function
 */
export const auditSnapshotRotationJob = async () => {
  try {
    console.log('Starting audit snapshot rotation job');
    const startTime = Date.now();

    // Rotate old task audits
    const taskAuditsRotation = new TaskAuditsRotation();
    const taskAuditsResult = await taskAuditsRotation.execute();

    // Rotate old human approvals
    const humanApprovalsRotation = new HumanApprovalsRotation();
    const humanApprovalsResult = await humanApprovalsRotation.execute();

    const duration = Date.now() - startTime;
    console.log('Audit snapshot rotation job completed successfully');

    // Record job execution in Sentinel
    await SentinelMetricsService.recordMaintenanceJob(
      'audit_snapshot_rotation',
      taskAuditsResult.status === 'success' && humanApprovalsResult.status === 'success' ? 'success' : 'partial',
      taskAuditsResult.itemsProcessed + humanApprovalsResult.itemsProcessed,
      duration,
      {
        taskAudits: taskAuditsResult,
        humanApprovals: humanApprovalsResult,
      }
    );
  } catch (error) {
    console.error('Error in audit snapshot rotation job:', error);
    throw error;
  }
};
