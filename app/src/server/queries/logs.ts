import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import { LogLevel, EventCategory, ApprovalStatus, ApiStatus } from '../../shared/services/logging';
import {
  getUserLogPermissions,
  hasLogAccess,
  applyLogCollectionAccess,
  LogAccessLevel
} from '../../api/middleware/logAccess';

// Types
interface LogFilters {
  startDate: Date;
  endDate: Date;
  level?: LogLevel[];
  category?: EventCategory[];
  userId?: string;
  agentId?: string;
  search?: string;
  tags?: string[];
  limit?: number;
}

/**
 * Get system logs with filters
 */
export const getSystemLogs = async (args: LogFilters, context: any) => {
  // Check if user is authenticated
  if (!context.user) {
    throw new HttpError(401, 'Not authenticated');
  }

  try {
    // Get user's log permissions
    const permissions = await getUserLogPermissions(context.user.id);

    // Check if user has permission to view system logs
    if (!hasLogAccess(permissions, 'system', LogAccessLevel.READ_BASIC)) {
      throw new HttpError(403, 'Not authorized to view system logs');
    }

    // Build the query
    const query: any = {
      where: {
        timestamp: {
          gte: args.startDate,
          lte: args.endDate,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: args.limit || 100,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        agent: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    };

    // Add level filter if provided
    if (args.level && args.level.length > 0) {
      query.where.level = {
        in: args.level,
      };
    }

    // Add category filter if provided
    if (args.category && args.category.length > 0) {
      query.where.category = {
        in: args.category,
      };
    }

    // Add user filter if provided
    if (args.userId) {
      query.where.userId = args.userId;
    }

    // Add agent filter if provided
    if (args.agentId) {
      query.where.agentId = args.agentId;
    }

    // Add search filter if provided
    if (args.search) {
      query.where.message = {
        contains: args.search,
        mode: 'insensitive',
      };
    }

    // Add tags filter if provided
    if (args.tags && args.tags.length > 0) {
      query.where.tags = {
        hasSome: args.tags,
      };
    }

    // Execute the query
    const logs = await prisma.systemLog.findMany(query);

    // Apply field-level access control based on user's permissions
    const filteredLogs = applyLogCollectionAccess(logs, permissions, 'system');

    return filteredLogs;
  } catch (error) {
    console.error('Error fetching system logs:', error);
    throw new HttpError(500, 'Failed to fetch system logs');
  }
};

/**
 * Get agent logs with filters
 */
export const getAgentLogs = async (args: LogFilters, context: any) => {
  // Check if user is authenticated
  if (!context.user) {
    throw new HttpError(401, 'Not authenticated');
  }

  try {
    // Get user's log permissions
    const permissions = await getUserLogPermissions(context.user.id);

    // Check if user has permission to view agent logs
    if (!hasLogAccess(permissions, 'agent', LogAccessLevel.READ_BASIC)) {
      throw new HttpError(403, 'Not authorized to view agent logs');
    }

    // Build the query
    const query: any = {
      where: {
        timestamp: {
          gte: args.startDate,
          lte: args.endDate,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: args.limit || 100,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        agent: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    };

    // Add level filter if provided
    if (args.level && args.level.length > 0) {
      query.where.level = {
        in: args.level,
      };
    }

    // Add category filter if provided
    if (args.category && args.category.length > 0) {
      query.where.category = {
        in: args.category,
      };
    }

    // Add user filter if provided
    if (args.userId) {
      query.where.userId = args.userId;
    }

    // Add agent filter if provided
    if (args.agentId) {
      query.where.agentId = args.agentId;
    }

    // Add search filter if provided
    if (args.search) {
      query.where.message = {
        contains: args.search,
        mode: 'insensitive',
      };
    }

    // Add tags filter if provided
    if (args.tags && args.tags.length > 0) {
      query.where.tags = {
        hasSome: args.tags,
      };
    }

    // Execute the query
    const logs = await prisma.agentLog.findMany(query);

    // Apply field-level access control based on user's permissions
    const filteredLogs = applyLogCollectionAccess(logs, permissions, 'agent');

    return filteredLogs;
  } catch (error) {
    console.error('Error fetching agent logs:', error);
    throw new HttpError(500, 'Failed to fetch agent logs');
  }
};

/**
 * Get API interactions with filters
 */
export const getApiInteractions = async (args: LogFilters, context: any) => {
  // Check if user is authenticated
  if (!context.user) {
    throw new HttpError(401, 'Not authenticated');
  }

  try {
    // Get user's log permissions
    const permissions = await getUserLogPermissions(context.user.id);

    // Check if user has permission to view API logs
    if (!hasLogAccess(permissions, 'api', LogAccessLevel.READ_BASIC)) {
      throw new HttpError(403, 'Not authorized to view API interactions');
    }

    // Build the query
    const query: any = {
      where: {
        timestamp: {
          gte: args.startDate,
          lte: args.endDate,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: args.limit || 100,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        agent: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    };

    // Add status filter if provided (using level filter)
    if (args.level && args.level.length > 0) {
      query.where.status = {
        in: args.level,
      };
    }

    // Add user filter if provided
    if (args.userId) {
      query.where.userId = args.userId;
    }

    // Add agent filter if provided
    if (args.agentId) {
      query.where.agentId = args.agentId;
    }

    // Add search filter if provided
    if (args.search) {
      query.where.endpoint = {
        contains: args.search,
        mode: 'insensitive',
      };
    }

    // Add tags filter if provided
    if (args.tags && args.tags.length > 0) {
      query.where.tags = {
        hasSome: args.tags,
      };
    }

    // Execute the query
    const logs = await prisma.apiInteraction.findMany(query);

    // Apply field-level access control based on user's permissions
    const filteredLogs = applyLogCollectionAccess(logs, permissions, 'api');

    return filteredLogs;
  } catch (error) {
    console.error('Error fetching API interactions:', error);
    throw new HttpError(500, 'Failed to fetch API interactions');
  }
};

/**
 * Get human approvals with filters
 */
export const getHumanApprovals = async (args: LogFilters, context: any) => {
  // Check if user is authenticated
  if (!context.user) {
    throw new HttpError(401, 'Not authenticated');
  }

  try {
    // Get user's log permissions
    const permissions = await getUserLogPermissions(context.user.id);

    // Check if user has permission to view approval logs
    if (!hasLogAccess(permissions, 'approval', LogAccessLevel.READ_BASIC)) {
      throw new HttpError(403, 'Not authorized to view human approvals');
    }

    // Build the query
    const query: any = {
      where: {
        timestamp: {
          gte: args.startDate,
          lte: args.endDate,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: args.limit || 100,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        agent: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    };

    // Add status filter if provided (using level filter)
    if (args.level && args.level.length > 0) {
      query.where.status = {
        in: args.level,
      };
    }

    // Add user filter if provided
    if (args.userId) {
      query.where.userId = args.userId;
    }

    // Add agent filter if provided
    if (args.agentId) {
      query.where.agentId = args.agentId;
    }

    // Add search filter if provided
    if (args.search) {
      query.where.requestedAction = {
        contains: args.search,
        mode: 'insensitive',
      };
    }

    // Add tags filter if provided
    if (args.tags && args.tags.length > 0) {
      query.where.tags = {
        hasSome: args.tags,
      };
    }

    // Execute the query
    const logs = await prisma.humanApproval.findMany(query);

    // Apply field-level access control based on user's permissions
    const filteredLogs = applyLogCollectionAccess(logs, permissions, 'approval');

    return filteredLogs;
  } catch (error) {
    console.error('Error fetching human approvals:', error);
    throw new HttpError(500, 'Failed to fetch human approvals');
  }
};

/**
 * Get related logs by trace ID
 */
export const getRelatedLogs = async (
  args: { traceId: string; excludeId?: string },
  context: any
) => {
  // Check if user is authenticated
  if (!context.user) {
    throw new HttpError(401, 'Not authenticated');
  }

  try {
    // Get user's log permissions
    const permissions = await getUserLogPermissions(context.user.id);

    // Check if user has permission to view at least one log type
    if (
      !hasLogAccess(permissions, 'system', LogAccessLevel.READ_BASIC) &&
      !hasLogAccess(permissions, 'agent', LogAccessLevel.READ_BASIC) &&
      !hasLogAccess(permissions, 'api', LogAccessLevel.READ_BASIC) &&
      !hasLogAccess(permissions, 'approval', LogAccessLevel.READ_BASIC)
    ) {
      throw new HttpError(403, 'Not authorized to view any logs');
    }

    // Get all logs with the same trace ID, but only for log types the user has access to
    const logPromises = [];

    if (hasLogAccess(permissions, 'system', LogAccessLevel.READ_BASIC)) {
      logPromises.push(
        prisma.systemLog.findMany({
          where: {
            traceId: args.traceId,
            ...(args.excludeId ? { id: { not: args.excludeId } } : {}),
          },
          orderBy: {
            timestamp: 'asc',
          },
          take: 50,
        })
      );
    } else {
      logPromises.push(Promise.resolve([]));
    }

    if (hasLogAccess(permissions, 'agent', LogAccessLevel.READ_BASIC)) {
      logPromises.push(
        prisma.agentLog.findMany({
          where: {
            traceId: args.traceId,
            ...(args.excludeId ? { id: { not: args.excludeId } } : {}),
          },
          orderBy: {
            timestamp: 'asc',
          },
          take: 50,
        })
      );
    } else {
      logPromises.push(Promise.resolve([]));
    }

    if (hasLogAccess(permissions, 'api', LogAccessLevel.READ_BASIC)) {
      logPromises.push(
        prisma.apiInteraction.findMany({
          where: {
            traceId: args.traceId,
            ...(args.excludeId ? { id: { not: args.excludeId } } : {}),
          },
          orderBy: {
            timestamp: 'asc',
          },
          take: 50,
        })
      );
    } else {
      logPromises.push(Promise.resolve([]));
    }

    if (hasLogAccess(permissions, 'approval', LogAccessLevel.READ_BASIC)) {
      logPromises.push(
        prisma.humanApproval.findMany({
          where: {
            traceId: args.traceId,
            ...(args.excludeId ? { id: { not: args.excludeId } } : {}),
          },
          orderBy: {
            timestamp: 'asc',
          },
          take: 50,
        })
      );
    } else {
      logPromises.push(Promise.resolve([]));
    }

    // Wait for all queries to complete
    const [systemLogs, agentLogs, apiInteractions, humanApprovals] = await Promise.all(logPromises);

    // Apply field-level access control
    const filteredSystemLogs = applyLogCollectionAccess(systemLogs, permissions, 'system');
    const filteredAgentLogs = applyLogCollectionAccess(agentLogs, permissions, 'agent');
    const filteredApiLogs = applyLogCollectionAccess(apiInteractions, permissions, 'api');
    const filteredApprovalLogs = applyLogCollectionAccess(humanApprovals, permissions, 'approval');

    // Combine and sort all logs by timestamp
    const allLogs = [
      ...filteredSystemLogs.map(log => ({ ...log, type: 'system' })),
      ...filteredAgentLogs.map(log => ({ ...log, type: 'agent' })),
      ...filteredApiLogs.map(log => ({ ...log, type: 'api' })),
      ...filteredApprovalLogs.map(log => ({ ...log, type: 'approval' })),
    ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return allLogs;
  } catch (error) {
    console.error('Error fetching related logs:', error);
    throw new HttpError(500, 'Failed to fetch related logs');
  }
};
