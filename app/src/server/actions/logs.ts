import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'fast-csv';
import { LoggingService } from '../../shared/services/logging';

// Types
interface LogFilters {
  startDate: Date;
  endDate: Date;
  level?: string[];
  category?: string[];
  userId?: string;
  agentId?: string;
  search?: string;
  tags?: string[];
  limit?: number;
}

interface ExportLogsArgs {
  logType: 'system' | 'agent' | 'api' | 'approval';
  filters: LogFilters;
  format: 'json' | 'csv';
  options?: {
    includeMetadata?: boolean;
    includeRelatedLogs?: boolean;
    applyCurrentFilters?: boolean;
    dateRange?: 'current' | 'all' | 'custom';
    customStartDate?: string;
    customEndDate?: string;
    maxRecords?: number;
  };
}

interface RetentionPolicy {
  enabled: boolean;
  systemLogs: {
    retentionDays: number;
    archiveEnabled: boolean;
    archiveStorage: 'local' | 's3' | 'azure';
  };
  agentLogs: {
    retentionDays: number;
    archiveEnabled: boolean;
  };
  apiLogs: {
    retentionDays: number;
    archiveEnabled: boolean;
    excludeHealthChecks: boolean;
  };
  approvalLogs: {
    retentionDays: number;
    archiveEnabled: boolean;
    preserveApproved: boolean;
  };
  complianceMode: boolean;
}

/**
 * Export logs based on filters and format
 */
export const exportLogs = async (args: ExportLogsArgs, context: any) => {
  // Check if user is authenticated and has permission
  if (!context.user) {
    throw new HttpError(401, 'Not authenticated');
  }

  // Check if user has permission to export logs
  if (!context.user.isAdmin && !context.user.role?.permissions?.includes('system:export_logs')) {
    throw new HttpError(403, 'Not authorized to export logs');
  }

  try {
    // Apply filters based on options
    const filters = { ...args.filters };
    
    // Apply custom date range if specified
    if (args.options?.dateRange === 'custom' && args.options.customStartDate && args.options.customEndDate) {
      filters.startDate = new Date(args.options.customStartDate);
      filters.endDate = new Date(args.options.customEndDate);
    } else if (args.options?.dateRange === 'all') {
      // Set a very old start date for "all" option
      filters.startDate = new Date(0);
      filters.endDate = new Date();
    }
    
    // Apply max records limit
    if (args.options?.maxRecords) {
      filters.limit = args.options.maxRecords;
    }
    
    // Clear filters if not applying current filters
    if (args.options?.applyCurrentFilters === false) {
      filters.level = undefined;
      filters.category = undefined;
      filters.userId = undefined;
      filters.agentId = undefined;
      filters.search = undefined;
      filters.tags = undefined;
    }

    // Get logs based on type
    let logs: any[] = [];
    
    switch (args.logType) {
      case 'system':
        logs = await prisma.systemLog.findMany({
          where: buildWhereClause(filters),
          orderBy: { timestamp: 'desc' },
          take: filters.limit || 1000,
          include: {
            user: {
              select: { id: true, username: true, email: true },
            },
            agent: {
              select: { id: true, name: true, type: true },
            },
          },
        });
        break;
      case 'agent':
        logs = await prisma.agentLog.findMany({
          where: buildWhereClause(filters),
          orderBy: { timestamp: 'desc' },
          take: filters.limit || 1000,
          include: {
            user: {
              select: { id: true, username: true, email: true },
            },
            agent: {
              select: { id: true, name: true, type: true },
            },
          },
        });
        break;
      case 'api':
        logs = await prisma.apiInteraction.findMany({
          where: buildWhereClause(filters, 'api'),
          orderBy: { timestamp: 'desc' },
          take: filters.limit || 1000,
          include: {
            user: {
              select: { id: true, username: true, email: true },
            },
            agent: {
              select: { id: true, name: true, type: true },
            },
          },
        });
        break;
      case 'approval':
        logs = await prisma.humanApproval.findMany({
          where: buildWhereClause(filters, 'approval'),
          orderBy: { timestamp: 'desc' },
          take: filters.limit || 1000,
          include: {
            user: {
              select: { id: true, username: true, email: true },
            },
            agent: {
              select: { id: true, name: true, type: true },
            },
          },
        });
        break;
    }

    // Include related logs if requested
    if (args.options?.includeRelatedLogs) {
      const traceIds = logs
        .filter(log => log.traceId)
        .map(log => log.traceId);
      
      if (traceIds.length > 0) {
        const relatedLogs = await getRelatedLogsByTraceIds(traceIds, logs.map(log => log.id));
        logs = [...logs, ...relatedLogs];
      }
    }

    // Remove metadata if not requested
    if (!args.options?.includeMetadata) {
      logs = logs.map(log => {
        const { metadata, ...rest } = log;
        return rest;
      });
    }

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${args.logType}_logs_${timestamp}.${args.format}`;
    const filePath = path.join(process.cwd(), 'tmp', filename);
    
    // Ensure tmp directory exists
    if (!fs.existsSync(path.join(process.cwd(), 'tmp'))) {
      fs.mkdirSync(path.join(process.cwd(), 'tmp'));
    }

    // Export based on format
    if (args.format === 'json') {
      fs.writeFileSync(filePath, JSON.stringify(logs, null, 2));
    } else if (args.format === 'csv') {
      await exportToCsv(logs, filePath);
    }

    // Log the export
    await LoggingService.logSystemEvent({
      message: `Exported ${logs.length} ${args.logType} logs to ${args.format}`,
      level: 'INFO',
      category: 'DATA_ACCESS',
      source: 'log-export',
      userId: context.user.id,
      tags: ['export', args.logType, args.format],
      metadata: {
        logType: args.logType,
        format: args.format,
        recordCount: logs.length,
        filters: args.filters,
        options: args.options
      }
    });

    return {
      success: true,
      filename,
      recordCount: logs.length,
      downloadUrl: `/api/download/${filename}`
    };
  } catch (error) {
    console.error('Error exporting logs:', error);
    throw new HttpError(500, 'Failed to export logs');
  }
};

/**
 * Update log retention policy
 */
export const updateLogRetentionPolicy = async (policy: RetentionPolicy, context: any) => {
  // Check if user is authenticated and has permission
  if (!context.user) {
    throw new HttpError(401, 'Not authenticated');
  }

  // Check if user has permission to update retention policy
  if (!context.user.isAdmin) {
    throw new HttpError(403, 'Not authorized to update retention policy');
  }

  try {
    // Validate policy
    validateRetentionPolicy(policy);

    // Save policy to database
    // In a real implementation, this would update a settings table
    // For now, we'll just log it
    await LoggingService.logSystemEvent({
      message: 'Log retention policy updated',
      level: 'INFO',
      category: 'SYSTEM_EVENT',
      source: 'log-retention',
      userId: context.user.id,
      tags: ['retention-policy', 'update'],
      metadata: {
        policy,
        updatedBy: context.user.id
      }
    });

    // Schedule retention job if enabled
    if (policy.enabled) {
      // In a real implementation, this would schedule a job to run
      // For now, we'll just log it
      console.log('Scheduled log retention job');
    }

    return {
      success: true,
      message: 'Retention policy updated successfully'
    };
  } catch (error) {
    console.error('Error updating retention policy:', error);
    throw new HttpError(500, 'Failed to update retention policy');
  }
};

// Helper function to build where clause for queries
function buildWhereClause(filters: LogFilters, type?: 'api' | 'approval') {
  const where: any = {
    timestamp: {
      gte: filters.startDate,
      lte: filters.endDate,
    },
  };

  // Add level/status filter if provided
  if (filters.level && filters.level.length > 0) {
    if (type === 'api' || type === 'approval') {
      where.status = {
        in: filters.level,
      };
    } else {
      where.level = {
        in: filters.level,
      };
    }
  }

  // Add category filter if provided
  if (filters.category && filters.category.length > 0) {
    where.category = {
      in: filters.category,
    };
  }

  // Add user filter if provided
  if (filters.userId) {
    where.userId = filters.userId;
  }

  // Add agent filter if provided
  if (filters.agentId) {
    where.agentId = filters.agentId;
  }

  // Add search filter if provided
  if (filters.search) {
    if (type === 'api') {
      where.endpoint = {
        contains: filters.search,
        mode: 'insensitive',
      };
    } else if (type === 'approval') {
      where.requestedAction = {
        contains: filters.search,
        mode: 'insensitive',
      };
    } else {
      where.message = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }
  }

  // Add tags filter if provided
  if (filters.tags && filters.tags.length > 0) {
    where.tags = {
      hasSome: filters.tags,
    };
  }

  return where;
}

// Helper function to get related logs by trace IDs
async function getRelatedLogsByTraceIds(traceIds: string[], excludeIds: string[]) {
  const [systemLogs, agentLogs, apiInteractions, humanApprovals] = await Promise.all([
    prisma.systemLog.findMany({
      where: {
        traceId: { in: traceIds },
        id: { notIn: excludeIds },
      },
      take: 500,
    }),
    prisma.agentLog.findMany({
      where: {
        traceId: { in: traceIds },
        id: { notIn: excludeIds },
      },
      take: 500,
    }),
    prisma.apiInteraction.findMany({
      where: {
        traceId: { in: traceIds },
        id: { notIn: excludeIds },
      },
      take: 500,
    }),
    prisma.humanApproval.findMany({
      where: {
        traceId: { in: traceIds },
        id: { notIn: excludeIds },
      },
      take: 500,
    }),
  ]);

  return [
    ...systemLogs.map(log => ({ ...log, type: 'system' })),
    ...agentLogs.map(log => ({ ...log, type: 'agent' })),
    ...apiInteractions.map(log => ({ ...log, type: 'api' })),
    ...humanApprovals.map(log => ({ ...log, type: 'approval' })),
  ];
}

// Helper function to export logs to CSV
async function exportToCsv(logs: any[], filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Flatten logs for CSV export
    const flattenedLogs = logs.map(log => {
      const flattened: any = {
        id: log.id,
        timestamp: log.timestamp,
        type: log.type || (log.level ? 'system' : log.status ? 'api' : 'approval'),
      };

      // Add common fields
      if (log.level) flattened.level = log.level;
      if (log.status) flattened.status = log.status;
      if (log.message) flattened.message = log.message;
      if (log.category) flattened.category = log.category;
      if (log.source) flattened.source = log.source;
      if (log.userId) flattened.userId = log.userId;
      if (log.user?.username) flattened.username = log.user.username;
      if (log.agentId) flattened.agentId = log.agentId;
      if (log.agent?.name) flattened.agentName = log.agent.name;
      if (log.traceId) flattened.traceId = log.traceId;
      if (log.spanId) flattened.spanId = log.spanId;
      if (log.duration) flattened.duration = log.duration;
      if (log.tags) flattened.tags = log.tags.join(',');

      // Add API-specific fields
      if (log.endpoint) flattened.endpoint = log.endpoint;
      if (log.method) flattened.method = log.method;
      if (log.statusCode) flattened.statusCode = log.statusCode;

      // Add approval-specific fields
      if (log.requestedAction) flattened.requestedAction = log.requestedAction;
      if (log.requestedBy) flattened.requestedBy = log.requestedBy;
      if (log.approvedBy) flattened.approvedBy = log.approvedBy;

      return flattened;
    });

    // Write to CSV
    const csvStream = csv.format({ headers: true });
    const writableStream = fs.createWriteStream(filePath);

    csvStream.pipe(writableStream);
    flattenedLogs.forEach(log => csvStream.write(log));
    csvStream.end();

    writableStream.on('finish', () => resolve());
    writableStream.on('error', reject);
  });
}

// Helper function to validate retention policy
function validateRetentionPolicy(policy: RetentionPolicy): void {
  if (policy.complianceMode) {
    // In compliance mode, enforce minimum retention periods
    if (policy.systemLogs.retentionDays < 90) {
      throw new HttpError(400, 'System logs must be retained for at least 90 days in compliance mode');
    }
    if (policy.agentLogs.retentionDays < 30) {
      throw new HttpError(400, 'Agent logs must be retained for at least 30 days in compliance mode');
    }
    if (policy.apiLogs.retentionDays < 30) {
      throw new HttpError(400, 'API logs must be retained for at least 30 days in compliance mode');
    }
    if (policy.approvalLogs.retentionDays < 365) {
      throw new HttpError(400, 'Approval logs must be retained for at least 365 days in compliance mode');
    }
    if (!policy.approvalLogs.archiveEnabled) {
      throw new HttpError(400, 'Approval logs must be archived in compliance mode');
    }
  }
}
