/**
 * Sentinel Metrics Service
 * 
 * This service provides utilities for updating and retrieving security metrics
 * for the Sentinel module. It integrates with maintenance jobs to provide
 * visibility into system health and maintenance status.
 */

import { prisma } from 'wasp/server';
import { LoggingService } from '../../shared/services/logging';

/**
 * Sentinel Metrics Service
 */
export const SentinelMetricsService = {
  /**
   * Update a security metric
   * 
   * @param name - Name of the metric
   * @param value - Value of the metric
   * @param metadata - Additional metadata
   */
  updateMetric: async (
    name: string,
    value: number,
    metadata: Record<string, any> = {}
  ): Promise<void> => {
    try {
      // Get the current metric if it exists
      const existingMetric = await prisma.securityMetric.findFirst({
        where: {
          name,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Create or update the metric
      if (existingMetric) {
        await prisma.securityMetric.update({
          where: {
            id: existingMetric.id,
          },
          data: {
            value,
            previousValue: existingMetric.value,
            percentChange: existingMetric.value !== 0 
              ? ((value - existingMetric.value) / existingMetric.value) * 100 
              : null,
            metadata: {
              ...existingMetric.metadata,
              ...metadata,
              lastUpdated: new Date(),
            },
          },
        });
      } else {
        // For system-wide metrics, create with a null userId
        await prisma.securityMetric.create({
          data: {
            name,
            value,
            category: metadata.category || 'maintenance',
            metadata: {
              ...metadata,
              lastUpdated: new Date(),
            },
            // Use the system user ID or null for system-wide metrics
            userId: metadata.userId || '00000000-0000-0000-0000-000000000000',
          },
        });
      }

      // Log the metric update
      await LoggingService.logSystemEvent({
        message: `Updated security metric: ${name}`,
        level: 'DEBUG',
        category: 'MAINTENANCE',
        source: 'sentinel-metrics',
        tags: ['metrics', 'security', name],
        metadata: {
          name,
          value,
          previousValue: existingMetric?.value,
          ...metadata,
        },
      });
    } catch (error) {
      console.error(`Error updating security metric ${name}:`, error);
      // Log the error but don't throw - metrics updates should not break the main flow
      await LoggingService.logSystemEvent({
        message: `Error updating security metric: ${name}`,
        level: 'ERROR',
        category: 'MAINTENANCE',
        source: 'sentinel-metrics',
        tags: ['metrics', 'security', 'error', name],
        metadata: {
          name,
          value,
          error: error.message,
        },
      });
    }
  },

  /**
   * Get a security metric
   * 
   * @param name - Name of the metric
   * @param userId - Optional user ID to filter by
   */
  getMetric: async (
    name: string,
    userId?: string
  ): Promise<any> => {
    try {
      const whereClause: any = { name };
      if (userId) {
        whereClause.userId = userId;
      }

      const metric = await prisma.securityMetric.findFirst({
        where: whereClause,
        orderBy: {
          createdAt: 'desc',
        },
      });

      return metric;
    } catch (error) {
      console.error(`Error getting security metric ${name}:`, error);
      throw error;
    }
  },

  /**
   * Get maintenance metrics
   */
  getMaintenanceMetrics: async (): Promise<any[]> => {
    try {
      const metrics = await prisma.securityMetric.findMany({
        where: {
          category: 'maintenance',
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 100, // Limit to recent metrics
      });

      // Group metrics by name
      const groupedMetrics = metrics.reduce((acc, metric) => {
        if (!acc[metric.name]) {
          acc[metric.name] = [];
        }
        acc[metric.name].push(metric);
        return acc;
      }, {});

      // Get the most recent value for each metric
      return Object.keys(groupedMetrics).map(name => {
        const metricValues = groupedMetrics[name];
        return metricValues[0]; // Most recent value
      });
    } catch (error) {
      console.error('Error getting maintenance metrics:', error);
      throw error;
    }
  },

  /**
   * Record a maintenance job execution
   * 
   * @param jobType - Type of maintenance job
   * @param status - Status of the job
   * @param itemsProcessed - Number of items processed
   * @param duration - Duration of the job in milliseconds
   * @param metadata - Additional metadata
   */
  recordMaintenanceJob: async (
    jobType: string,
    status: 'success' | 'partial' | 'failed',
    itemsProcessed: number,
    duration: number,
    metadata: Record<string, any> = {}
  ): Promise<void> => {
    try {
      // Update last run time metric
      await SentinelMetricsService.updateMetric(
        `last_${jobType}_run`,
        new Date().getTime(),
        { jobType, status }
      );

      // Update items processed metric
      await SentinelMetricsService.updateMetric(
        `${jobType}_items_processed`,
        itemsProcessed,
        { jobType, status }
      );

      // Update duration metric
      await SentinelMetricsService.updateMetric(
        `${jobType}_duration`,
        duration,
        { jobType, status }
      );

      // Update status metric (1 for success, 0 for failure)
      await SentinelMetricsService.updateMetric(
        `${jobType}_status`,
        status === 'success' ? 1 : status === 'partial' ? 0.5 : 0,
        { jobType, status }
      );

      // Log the job execution
      await LoggingService.logSystemEvent({
        message: `Maintenance job executed: ${jobType}`,
        level: 'INFO',
        category: 'MAINTENANCE',
        source: 'sentinel-metrics',
        tags: ['maintenance', jobType, status],
        metadata: {
          jobType,
          status,
          itemsProcessed,
          duration,
          ...metadata,
        },
      });
    } catch (error) {
      console.error(`Error recording maintenance job ${jobType}:`, error);
      // Log the error but don't throw
      await LoggingService.logSystemEvent({
        message: `Error recording maintenance job: ${jobType}`,
        level: 'ERROR',
        category: 'MAINTENANCE',
        source: 'sentinel-metrics',
        tags: ['maintenance', 'error', jobType],
        metadata: {
          jobType,
          status,
          error: error.message,
        },
      });
    }
  },
};
