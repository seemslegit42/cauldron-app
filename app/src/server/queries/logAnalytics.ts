/**
 * Log Analytics Queries
 * 
 * This file contains queries for retrieving log analytics data.
 */

import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import { LogAnalyticsService } from '../../shared/services/logAnalytics';
import { requireAdmin } from '../../api/middleware/auth';

/**
 * Get log analytics results
 */
export const getLogAnalytics = async (
  args: {
    type?: string;
    logType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  },
  context: any
) => {
  // Check if user is authenticated and has permission
  requireAdmin(context);

  try {
    const where: any = {};

    // Apply filters
    if (args.type) {
      where.type = args.type;
    }

    if (args.logType) {
      where.logType = args.logType;
    }

    if (args.startDate) {
      where.startDate = {
        gte: new Date(args.startDate),
      };
    }

    if (args.endDate) {
      where.endDate = {
        lte: new Date(args.endDate),
      };
    }

    // Get analytics results
    const results = await prisma.logAnalyticsResult.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: args.limit || 10,
    });

    return results;
  } catch (error) {
    console.error('Error getting log analytics:', error);
    throw new HttpError(500, 'Failed to get log analytics');
  }
};

/**
 * Get log insights
 */
export const getLogInsights = async (
  args: {
    importance?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  },
  context: any
) => {
  // Check if user is authenticated and has permission
  requireAdmin(context);

  try {
    const where: any = {};

    // Apply filters
    if (args.importance) {
      where.importance = args.importance;
    }

    if (args.category) {
      where.category = args.category;
    }

    if (args.startDate) {
      where.startDate = {
        gte: new Date(args.startDate),
      };
    }

    if (args.endDate) {
      where.endDate = {
        lte: new Date(args.endDate),
      };
    }

    // Get insights
    const insights = await prisma.logInsight.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: args.limit || 10,
    });

    return insights;
  } catch (error) {
    console.error('Error getting log insights:', error);
    throw new HttpError(500, 'Failed to get log insights');
  }
};

/**
 * Get real-time log analytics
 * 
 * This function generates analytics on-the-fly rather than retrieving
 * pre-computed results from the database.
 */
export const getRealTimeLogAnalytics = async (
  args: {
    type: string;
    logType: string;
    startDate: string;
    endDate: string;
    interval?: 'hour' | 'day' | 'week' | 'month';
    sensitivityThreshold?: number;
    minOccurrences?: number;
    groupBy?: string;
  },
  context: any
) => {
  // Check if user is authenticated and has permission
  requireAdmin(context);

  try {
    const startDate = new Date(args.startDate);
    const endDate = new Date(args.endDate);
    const logType = args.logType as any;

    // Generate analytics based on the requested type
    switch (args.type) {
      case 'counts_by_level':
        return await LogAnalyticsService.getLogCountsByLevel(logType, startDate, endDate);
      
      case 'counts_by_category':
        return await LogAnalyticsService.getLogCountsByCategory(logType, startDate, endDate);
      
      case 'counts_by_time':
        return await LogAnalyticsService.getLogCountsByTimeInterval(
          logType,
          startDate,
          endDate,
          args.interval || 'hour'
        );
      
      case 'anomalies':
        return await LogAnalyticsService.detectAnomalies(
          logType,
          startDate,
          endDate,
          args.interval || 'hour',
          args.sensitivityThreshold
        );
      
      case 'patterns':
        return await LogAnalyticsService.detectPatterns(
          logType,
          startDate,
          endDate,
          args.minOccurrences
        );
      
      case 'trends':
        return await LogAnalyticsService.analyzeTrends(
          logType,
          startDate,
          endDate,
          args.groupBy as any
        );
      
      default:
        throw new HttpError(400, `Unsupported analytics type: ${args.type}`);
    }
  } catch (error) {
    console.error('Error generating real-time log analytics:', error);
    throw new HttpError(500, 'Failed to generate real-time log analytics');
  }
};
