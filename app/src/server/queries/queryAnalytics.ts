/**
 * Query Analytics API
 * 
 * This file provides API operations for query performance monitoring.
 */

import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import { QueryAnalyticsService } from '../services/queryAnalyticsService';
import { requirePermission } from '../../api/middleware/rbac';

// Types
interface QueryPerformanceStatsArgs {
  moduleId?: string;
  organizationId?: string;
  userId?: string;
  startDate: Date;
  endDate: Date;
  slowQueryThreshold: number;
}

/**
 * Get query performance statistics
 */
export const getQueryPerformanceStats = async (args: QueryPerformanceStatsArgs, context: any) => {
  // Check if user is authenticated
  if (!context.user) {
    throw new HttpError(401, 'Not authenticated');
  }

  // Check if user has permission to view query performance stats
  await requirePermission({
    resource: 'database',
    action: 'monitor',
    adminOverride: true,
    auditRejection: true
  })(context);

  try {
    // Parse dates if they are strings
    const startDate = args.startDate instanceof Date ? args.startDate : new Date(args.startDate);
    const endDate = args.endDate instanceof Date ? args.endDate : new Date(args.endDate);

    // Get query performance stats
    const stats = await QueryAnalyticsService.getQueryPerformanceStats({
      moduleId: args.moduleId,
      organizationId: args.organizationId,
      userId: args.userId,
      startDate,
      endDate,
      slowQueryThreshold: args.slowQueryThreshold || 500
    });

    return stats;
  } catch (error) {
    console.error('Error getting query performance stats:', error);
    throw new HttpError(500, 'Failed to get query performance stats');
  }
};

/**
 * Get query execution plan
 */
export const getQueryExecutionPlan = async (args: { queryId: string }, context: any) => {
  // Check if user is authenticated
  if (!context.user) {
    throw new HttpError(401, 'Not authenticated');
  }

  // Check if user has permission to view query execution plans
  await requirePermission({
    resource: 'database',
    action: 'monitor',
    adminOverride: true,
    auditRejection: true
  })(context);

  try {
    // Get query execution plan
    const executionPlan = await prisma.queryExecutionPlan.findUnique({
      where: {
        queryId: args.queryId
      }
    });

    if (!executionPlan) {
      throw new HttpError(404, 'Execution plan not found');
    }

    return executionPlan;
  } catch (error) {
    console.error('Error getting query execution plan:', error);
    throw new HttpError(500, 'Failed to get query execution plan');
  }
};

/**
 * Get query performance metrics
 */
export const getQueryPerformanceMetrics = async (args: {
  period: 'hourly' | 'daily' | 'weekly' | 'monthly';
  moduleId?: string;
  model?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
}, context: any) => {
  // Check if user is authenticated
  if (!context.user) {
    throw new HttpError(401, 'Not authenticated');
  }

  // Check if user has permission to view query performance metrics
  await requirePermission({
    resource: 'database',
    action: 'monitor',
    adminOverride: true,
    auditRejection: true
  })(context);

  try {
    // Parse dates if they are strings
    const startDate = args.startDate instanceof Date ? args.startDate : args.startDate ? new Date(args.startDate) : undefined;
    const endDate = args.endDate instanceof Date ? args.endDate : args.endDate ? new Date(args.endDate) : undefined;

    // Build the query
    const query: any = {
      where: {
        period: args.period
      },
      orderBy: {
        timestamp: 'desc'
      }
    };

    // Add filters
    if (args.moduleId) query.where.moduleId = args.moduleId;
    if (args.model) query.where.model = args.model;
    if (args.action) query.where.action = args.action;
    if (startDate || endDate) {
      query.where.timestamp = {};
      if (startDate) query.where.timestamp.gte = startDate;
      if (endDate) query.where.timestamp.lte = endDate;
    }

    // Get metrics
    const metrics = await prisma.queryPerformanceMetric.findMany(query);

    return metrics;
  } catch (error) {
    console.error('Error getting query performance metrics:', error);
    throw new HttpError(500, 'Failed to get query performance metrics');
  }
};
