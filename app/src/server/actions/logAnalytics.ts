/**
 * Log Analytics Actions
 * 
 * This file contains actions for generating and managing log analytics.
 */

import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import { LogAnalyticsService } from '../../shared/services/logAnalytics';
import { requireAdmin } from '../../api/middleware/auth';

/**
 * Generate log analytics
 */
export const generateLogAnalytics = async (
  args: {
    type: string;
    logType: string;
    startDate: string;
    endDate: string;
    interval?: 'hour' | 'day' | 'week' | 'month';
    sensitivityThreshold?: number;
    minOccurrences?: number;
    groupBy?: string;
    metadata?: Record<string, any>;
  },
  context: any
) => {
  // Check if user is authenticated and has permission
  requireAdmin(context);

  try {
    const startDate = new Date(args.startDate);
    const endDate = new Date(args.endDate);
    const logType = args.logType as any;
    let result: any;

    // Generate analytics based on the requested type
    switch (args.type) {
      case 'counts_by_level':
        result = await LogAnalyticsService.getLogCountsByLevel(logType, startDate, endDate);
        break;
      
      case 'counts_by_category':
        result = await LogAnalyticsService.getLogCountsByCategory(logType, startDate, endDate);
        break;
      
      case 'counts_by_time':
        result = await LogAnalyticsService.getLogCountsByTimeInterval(
          logType,
          startDate,
          endDate,
          args.interval || 'hour'
        );
        break;
      
      case 'anomalies':
        result = await LogAnalyticsService.detectAnomalies(
          logType,
          startDate,
          endDate,
          args.interval || 'hour',
          args.sensitivityThreshold
        );
        break;
      
      case 'patterns':
        result = await LogAnalyticsService.detectPatterns(
          logType,
          startDate,
          endDate,
          args.minOccurrences
        );
        break;
      
      case 'trends':
        result = await LogAnalyticsService.analyzeTrends(
          logType,
          startDate,
          endDate,
          args.groupBy as any
        );
        break;
      
      default:
        throw new HttpError(400, `Unsupported analytics type: ${args.type}`);
    }

    // Save the analytics result
    const analyticsResult = await prisma.logAnalyticsResult.create({
      data: {
        type: args.type,
        logType: args.logType,
        startDate,
        endDate,
        result,
        metadata: args.metadata || {},
      },
    });

    return analyticsResult;
  } catch (error) {
    console.error('Error generating log analytics:', error);
    throw new HttpError(500, 'Failed to generate log analytics');
  }
};

/**
 * Generate log insights
 */
export const generateLogInsights = async (
  args: {
    startDate: string;
    endDate: string;
    metadata?: Record<string, any>;
  },
  context: any
) => {
  // Check if user is authenticated and has permission
  requireAdmin(context);

  try {
    const startDate = new Date(args.startDate);
    const endDate = new Date(args.endDate);

    // Generate insights
    const insights = await LogAnalyticsService.generateInsights(startDate, endDate);

    // Save insights to the database
    const savedInsights = await Promise.all(
      insights.map(async (insight) => {
        return prisma.logInsight.create({
          data: {
            insight: insight.insight,
            importance: insight.importance,
            category: insight.category,
            relatedLogs: insight.relatedLogs,
            startDate,
            endDate,
            metadata: {
              ...(args.metadata || {}),
              generatedAt: new Date().toISOString(),
            },
          },
        });
      })
    );

    return savedInsights;
  } catch (error) {
    console.error('Error generating log insights:', error);
    throw new HttpError(500, 'Failed to generate log insights');
  }
};

/**
 * Delete log analytics result
 */
export const deleteLogAnalyticsResult = async (
  args: {
    id: string;
  },
  context: any
) => {
  // Check if user is authenticated and has permission
  requireAdmin(context);

  try {
    // Check if the analytics result exists
    const analyticsResult = await prisma.logAnalyticsResult.findUnique({
      where: {
        id: args.id,
      },
    });

    if (!analyticsResult) {
      throw new HttpError(404, 'Analytics result not found');
    }

    // Delete the analytics result
    await prisma.logAnalyticsResult.delete({
      where: {
        id: args.id,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting log analytics result:', error);
    throw new HttpError(500, 'Failed to delete log analytics result');
  }
};

/**
 * Delete log insight
 */
export const deleteLogInsight = async (
  args: {
    id: string;
  },
  context: any
) => {
  // Check if user is authenticated and has permission
  requireAdmin(context);

  try {
    // Check if the insight exists
    const insight = await prisma.logInsight.findUnique({
      where: {
        id: args.id,
      },
    });

    if (!insight) {
      throw new HttpError(404, 'Insight not found');
    }

    // Delete the insight
    await prisma.logInsight.delete({
      where: {
        id: args.id,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting log insight:', error);
    throw new HttpError(500, 'Failed to delete log insight');
  }
};
