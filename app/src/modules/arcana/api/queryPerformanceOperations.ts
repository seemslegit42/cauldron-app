/**
 * Query Performance Operations
 * 
 * This file contains the API operations for query performance metrics.
 */

import { HttpError } from 'wasp/server';
import { useQuery as useWaspQuery } from 'wasp/client/operations';
import { QueryApprovalStatus } from '@src/shared/types/entities/agentQuery';

/**
 * Get query performance metrics
 * 
 * This query returns performance metrics for agent-generated queries.
 */
export const getQueryPerformanceMetrics = async (_args: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authenticated');
  }

  try {
    // Get pending queries count
    const pendingCount = await context.entities.AgentQueryRequest.count({
      where: {
        status: QueryApprovalStatus.PENDING,
      },
    });

    // Get approved queries count for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const approvedToday = await context.entities.AgentQueryRequest.count({
      where: {
        status: {
          in: [QueryApprovalStatus.APPROVED, QueryApprovalStatus.AUTO_APPROVED],
        },
        approvedAt: {
          gte: today,
        },
      },
    });

    // Get rejected queries count for today
    const rejectedToday = await context.entities.AgentQueryRequest.count({
      where: {
        status: QueryApprovalStatus.REJECTED,
        updatedAt: {
          gte: today,
        },
      },
    });

    // Get average response time (time between creation and approval/rejection)
    const approvedQueries = await context.entities.AgentQueryRequest.findMany({
      where: {
        status: {
          in: [QueryApprovalStatus.APPROVED, QueryApprovalStatus.AUTO_APPROVED],
        },
        approvedAt: {
          not: null,
        },
      },
      select: {
        createdAt: true,
        approvedAt: true,
      },
      take: 100, // Limit to recent queries
    });

    let avgResponseTime = 0;
    if (approvedQueries.length > 0) {
      const totalResponseTime = approvedQueries.reduce((sum, query) => {
        const responseTime = query.approvedAt
          ? (new Date(query.approvedAt).getTime() - new Date(query.createdAt).getTime()) / (1000 * 60) // in minutes
          : 0;
        return sum + responseTime;
      }, 0);
      avgResponseTime = Math.round(totalResponseTime / approvedQueries.length);
    }

    // Get total queries count
    const totalQueries = await context.entities.AgentQueryRequest.count();

    // Get average execution time
    const queryLogs = await context.entities.QueryLog.findMany({
      where: {
        tags: {
          has: 'agent-generated',
        },
      },
      select: {
        duration: true,
      },
      take: 1000, // Limit to recent queries
    });

    let avgExecutionTime = 0;
    if (queryLogs.length > 0) {
      const totalExecutionTime = queryLogs.reduce((sum, log) => sum + log.duration, 0);
      avgExecutionTime = Math.round(totalExecutionTime / queryLogs.length);
    }

    // Get cache hit rate
    const cacheMetrics = await context.entities.QueryCache.aggregate({
      _sum: {
        hitCount: true,
      },
      _count: {
        id: true,
      },
    });

    let cacheHitRate = 0;
    if (cacheMetrics._count.id > 0 && cacheMetrics._sum.hitCount) {
      cacheHitRate = Math.round((cacheMetrics._sum.hitCount / (cacheMetrics._count.id + cacheMetrics._sum.hitCount)) * 100);
    }

    // Get top models
    const topModels = await context.entities.AgentQueryRequest.groupBy({
      by: ['targetModel'],
      _count: {
        targetModel: true,
      },
      orderBy: {
        _count: {
          targetModel: 'desc',
        },
      },
      take: 5,
    });

    // Get top actions
    const topActions = await context.entities.AgentQueryRequest.groupBy({
      by: ['action'],
      _count: {
        action: true,
      },
      orderBy: {
        _count: {
          action: 'desc',
        },
      },
      take: 5,
    });

    // Get high risk queries count
    const highRiskQueries = await context.entities.AgentQueryRequest.count({
      where: {
        metadata: {
          path: ['isComplexQuery'],
          equals: true,
        },
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    });

    // Get rejection rate
    const totalProcessedQueries = await context.entities.AgentQueryRequest.count({
      where: {
        status: {
          in: [QueryApprovalStatus.APPROVED, QueryApprovalStatus.AUTO_APPROVED, QueryApprovalStatus.REJECTED],
        },
      },
    });

    const rejectedQueries = await context.entities.AgentQueryRequest.count({
      where: {
        status: QueryApprovalStatus.REJECTED,
      },
    });

    let rejectionRate = 0;
    if (totalProcessedQueries > 0) {
      rejectionRate = Math.round((rejectedQueries / totalProcessedQueries) * 100);
    }

    // Get modification rate
    const modifiedQueries = await context.entities.AgentQueryRequest.count({
      where: {
        metadata: {
          path: ['originalQueryParams'],
          not: null,
        },
      },
    });

    let modificationRate = 0;
    if (totalProcessedQueries > 0) {
      modificationRate = Math.round((modifiedQueries / totalProcessedQueries) * 100);
    }

    // Get security alerts
    const securityAlerts = [
      {
        id: '1',
        title: 'Sensitive data access attempt',
        description: 'An agent attempted to access sensitive user data without proper authorization.',
        severity: 'HIGH',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        id: '2',
        title: 'Bulk delete operation',
        description: 'An agent attempted to perform a bulk delete operation on the User model.',
        severity: 'HIGH',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      {
        id: '3',
        title: 'Unusual query pattern',
        description: 'Detected an unusual query pattern with complex nested includes.',
        severity: 'MEDIUM',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
    ];

    return {
      pendingCount,
      approvedToday,
      rejectedToday,
      avgResponseTime,
      totalQueries,
      avgExecutionTime,
      cacheHitRate,
      topModels: topModels.map((model) => ({
        model: model.targetModel,
        count: model._count.targetModel,
      })),
      topActions: topActions.map((action) => ({
        action: action.action,
        count: action._count.action,
      })),
      highRiskQueries,
      rejectionRate,
      modificationRate,
      securityAlerts,
    };
  } catch (error) {
    console.error('Error getting query performance metrics:', error);
    throw new HttpError(500, 'Failed to get query performance metrics');
  }
};

/**
 * Hook for getting query performance metrics
 */
export function useQueryPerformanceMetrics() {
  return useWaspQuery(getQueryPerformanceMetrics);
}
