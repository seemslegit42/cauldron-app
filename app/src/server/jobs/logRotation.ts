/**
 * Log Rotation Job
 * 
 * This job is responsible for rotating logs based on retention policies.
 * It archives logs that are older than the retention period and then deletes them.
 */

import { prisma } from 'wasp/server';
import { LogArchivingService, StorageProvider } from '../../shared/services/logArchiving';
import { LoggingService } from '../../shared/services/logging';

// Log rotation configuration
interface LogRotationConfig {
  systemLogs: {
    retentionDays: number;
    archiveEnabled: boolean;
    archiveStorage: StorageProvider;
  };
  agentLogs: {
    retentionDays: number;
    archiveEnabled: boolean;
    archiveStorage: StorageProvider;
  };
  apiLogs: {
    retentionDays: number;
    archiveEnabled: boolean;
    archiveStorage: StorageProvider;
    excludeHealthChecks: boolean;
  };
  approvalLogs: {
    retentionDays: number;
    archiveEnabled: boolean;
    archiveStorage: StorageProvider;
    preserveApproved: boolean;
  };
  complianceMode: boolean;
}

// Default configuration
const defaultConfig: LogRotationConfig = {
  systemLogs: {
    retentionDays: 90,
    archiveEnabled: true,
    archiveStorage: 'local',
  },
  agentLogs: {
    retentionDays: 30,
    archiveEnabled: true,
    archiveStorage: 'local',
  },
  apiLogs: {
    retentionDays: 14,
    archiveEnabled: false,
    archiveStorage: 'local',
    excludeHealthChecks: true,
  },
  approvalLogs: {
    retentionDays: 365,
    archiveEnabled: true,
    archiveStorage: 'local',
    preserveApproved: true,
  },
  complianceMode: false,
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
 * Get the current log rotation configuration
 */
async function getLogRotationConfig(): Promise<LogRotationConfig> {
  try {
    // Try to get the configuration from the database
    const globalSettings = await prisma.globalSettings.findFirst({
      select: {
        logRetentionPolicy: true,
      },
    });

    if (globalSettings?.logRetentionPolicy) {
      return globalSettings.logRetentionPolicy as LogRotationConfig;
    }

    // If no configuration is found, return the default
    return defaultConfig;
  } catch (error) {
    console.error('Error getting log rotation configuration:', error);
    return defaultConfig;
  }
}

/**
 * Rotate system logs
 */
async function rotateSystemLogs(config: LogRotationConfig): Promise<void> {
  try {
    const { retentionDays, archiveEnabled, archiveStorage } = config.systemLogs;
    const cutoffDate = daysAgo(retentionDays);

    // Get count of logs to be rotated
    const count = await prisma.systemLog.count({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    if (count === 0) {
      console.log('No system logs to rotate');
      return;
    }

    console.log(`Rotating ${count} system logs older than ${cutoffDate.toISOString()}`);

    // Archive logs if enabled
    if (archiveEnabled) {
      await LogArchivingService.archiveSystemLogs(
        new Date(0), // From the beginning of time
        cutoffDate,
        archiveStorage
      );
    }

    // Delete logs
    const result = await prisma.systemLog.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    console.log(`Deleted ${result.count} system logs`);

    // Log the rotation
    await LoggingService.logSystemEvent({
      message: `Rotated ${result.count} system logs`,
      level: 'INFO',
      category: 'SYSTEM_EVENT',
      source: 'log-rotation',
      tags: ['log-rotation', 'system-logs'],
      metadata: {
        retentionDays,
        cutoffDate,
        count: result.count,
        archiveEnabled,
        archiveStorage,
      },
    });
  } catch (error) {
    console.error('Error rotating system logs:', error);
    throw error;
  }
}

/**
 * Rotate agent logs
 */
async function rotateAgentLogs(config: LogRotationConfig): Promise<void> {
  try {
    const { retentionDays, archiveEnabled, archiveStorage } = config.agentLogs;
    const cutoffDate = daysAgo(retentionDays);

    // Get count of logs to be rotated
    const count = await prisma.agentLog.count({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    if (count === 0) {
      console.log('No agent logs to rotate');
      return;
    }

    console.log(`Rotating ${count} agent logs older than ${cutoffDate.toISOString()}`);

    // Archive logs if enabled
    if (archiveEnabled) {
      await LogArchivingService.archiveAgentLogs(
        new Date(0), // From the beginning of time
        cutoffDate,
        archiveStorage
      );
    }

    // Delete logs
    const result = await prisma.agentLog.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    console.log(`Deleted ${result.count} agent logs`);

    // Log the rotation
    await LoggingService.logSystemEvent({
      message: `Rotated ${result.count} agent logs`,
      level: 'INFO',
      category: 'SYSTEM_EVENT',
      source: 'log-rotation',
      tags: ['log-rotation', 'agent-logs'],
      metadata: {
        retentionDays,
        cutoffDate,
        count: result.count,
        archiveEnabled,
        archiveStorage,
      },
    });
  } catch (error) {
    console.error('Error rotating agent logs:', error);
    throw error;
  }
}

/**
 * Rotate API interactions
 */
async function rotateApiInteractions(config: LogRotationConfig): Promise<void> {
  try {
    const { retentionDays, archiveEnabled, archiveStorage, excludeHealthChecks } = config.apiLogs;
    const cutoffDate = daysAgo(retentionDays);

    // Build the where clause
    const where: any = {
      timestamp: {
        lt: cutoffDate,
      },
    };

    // Exclude health checks if configured
    if (excludeHealthChecks) {
      where.endpoint = {
        not: {
          contains: '/health',
        },
      };
    }

    // Get count of logs to be rotated
    const count = await prisma.apiInteraction.count({ where });

    if (count === 0) {
      console.log('No API interactions to rotate');
      return;
    }

    console.log(`Rotating ${count} API interactions older than ${cutoffDate.toISOString()}`);

    // Archive logs if enabled
    if (archiveEnabled) {
      await LogArchivingService.archiveApiInteractions(
        new Date(0), // From the beginning of time
        cutoffDate,
        archiveStorage
      );
    }

    // Delete logs
    const result = await prisma.apiInteraction.deleteMany({ where });

    console.log(`Deleted ${result.count} API interactions`);

    // Log the rotation
    await LoggingService.logSystemEvent({
      message: `Rotated ${result.count} API interactions`,
      level: 'INFO',
      category: 'SYSTEM_EVENT',
      source: 'log-rotation',
      tags: ['log-rotation', 'api-interactions'],
      metadata: {
        retentionDays,
        cutoffDate,
        count: result.count,
        archiveEnabled,
        archiveStorage,
        excludeHealthChecks,
      },
    });
  } catch (error) {
    console.error('Error rotating API interactions:', error);
    throw error;
  }
}

/**
 * Rotate human approvals
 */
async function rotateHumanApprovals(config: LogRotationConfig): Promise<void> {
  try {
    const { retentionDays, archiveEnabled, archiveStorage, preserveApproved } = config.approvalLogs;
    const cutoffDate = daysAgo(retentionDays);

    // Build the where clause
    const where: any = {
      timestamp: {
        lt: cutoffDate,
      },
    };

    // Preserve approved logs if configured
    if (preserveApproved) {
      where.status = {
        not: 'APPROVED',
      };
    }

    // Get count of logs to be rotated
    const count = await prisma.humanApproval.count({ where });

    if (count === 0) {
      console.log('No human approvals to rotate');
      return;
    }

    console.log(`Rotating ${count} human approvals older than ${cutoffDate.toISOString()}`);

    // Archive logs if enabled
    if (archiveEnabled) {
      await LogArchivingService.archiveHumanApprovals(
        new Date(0), // From the beginning of time
        cutoffDate,
        archiveStorage
      );
    }

    // Delete logs
    const result = await prisma.humanApproval.deleteMany({ where });

    console.log(`Deleted ${result.count} human approvals`);

    // Log the rotation
    await LoggingService.logSystemEvent({
      message: `Rotated ${result.count} human approvals`,
      level: 'INFO',
      category: 'SYSTEM_EVENT',
      source: 'log-rotation',
      tags: ['log-rotation', 'human-approvals'],
      metadata: {
        retentionDays,
        cutoffDate,
        count: result.count,
        archiveEnabled,
        archiveStorage,
        preserveApproved,
      },
    });
  } catch (error) {
    console.error('Error rotating human approvals:', error);
    throw error;
  }
}

/**
 * Main log rotation job function
 */
export const rotateLogsJob = async () => {
  try {
    console.log('Starting log rotation job');

    // Get the current configuration
    const config = await getLogRotationConfig();

    // Rotate logs
    await rotateSystemLogs(config);
    await rotateAgentLogs(config);
    await rotateApiInteractions(config);
    await rotateHumanApprovals(config);

    console.log('Log rotation job completed successfully');
  } catch (error) {
    console.error('Error in log rotation job:', error);
    throw error;
  }
};
