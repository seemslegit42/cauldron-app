/**
 * Query Analytics Service
 * 
 * This service provides functionality for analyzing database query performance,
 * detecting slow queries, and generating performance metrics.
 */

import { prisma } from 'wasp/server';
import { LoggingService } from '../../shared/services/logging';
import { QueryStatus } from '@prisma/client';

// Types
export interface QueryAnalyticsOptions {
  slowQueryThreshold: number;
  moduleId?: string;
  organizationId?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

export interface QueryPerformanceStats {
  totalQueries: number;
  slowQueries: number;
  errorQueries: number;
  averageDuration: number;
  maxDuration: number;
  p95Duration: number;
  p99Duration: number;
  queriesByModel: Record<string, number>;
  queriesByAction: Record<string, number>;
  slowQueriesByModel: Record<string, number>;
  errorQueriesByModel: Record<string, number>;
  topSlowestQueries: any[];
  recentErrorQueries: any[];
}

export interface QueryAggregateOptions {
  period: 'hourly' | 'daily' | 'weekly' | 'monthly';
  moduleId?: string;
  model?: string;
  action?: string;
}

/**
 * Query Analytics Service
 */
export class QueryAnalyticsService {
  /**
   * Get query performance statistics
   */
  static async getQueryPerformanceStats(options: QueryAnalyticsOptions): Promise<QueryPerformanceStats> {
    const {
      slowQueryThreshold = 500,
      moduleId,
      organizationId,
      userId,
      startDate = new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      endDate = new Date(),
      limit = 10
    } = options;

    // Build the base query filter
    const baseFilter: any = {
      timestamp: {
        gte: startDate,
        lte: endDate
      }
    };

    if (moduleId) baseFilter.moduleId = moduleId;
    if (organizationId) baseFilter.organizationId = organizationId;
    if (userId) baseFilter.userId = userId;

    try {
      // Get total queries
      const totalQueries = await prisma.queryLog.count({
        where: baseFilter
      });

      // Get slow queries
      const slowQueries = await prisma.queryLog.count({
        where: {
          ...baseFilter,
          isSlow: true
        }
      });

      // Get error queries
      const errorQueries = await prisma.queryLog.count({
        where: {
          ...baseFilter,
          status: QueryStatus.error
        }
      });

      // Get average duration
      const durationStats = await prisma.$queryRaw<{ avg: number, max: number }[]>`
        SELECT 
          AVG(duration) as avg,
          MAX(duration) as max
        FROM "QueryLog"
        WHERE 
          timestamp >= ${startDate} AND
          timestamp <= ${endDate}
          ${moduleId ? ` AND "moduleId" = ${moduleId}` : ''}
          ${organizationId ? ` AND "organizationId" = ${organizationId}` : ''}
          ${userId ? ` AND "userId" = ${userId}` : ''}
      `;

      const averageDuration = durationStats[0]?.avg || 0;
      const maxDuration = durationStats[0]?.max || 0;

      // Get percentile durations (p95, p99)
      // This requires a more complex query that depends on the database
      // For PostgreSQL, we can use percentile_cont
      const percentileStats = await prisma.$queryRaw<{ p95: number, p99: number }[]>`
        SELECT 
          percentile_cont(0.95) WITHIN GROUP (ORDER BY duration) as p95,
          percentile_cont(0.99) WITHIN GROUP (ORDER BY duration) as p99
        FROM "QueryLog"
        WHERE 
          timestamp >= ${startDate} AND
          timestamp <= ${endDate}
          ${moduleId ? ` AND "moduleId" = ${moduleId}` : ''}
          ${organizationId ? ` AND "organizationId" = ${organizationId}` : ''}
          ${userId ? ` AND "userId" = ${userId}` : ''}
      `;

      const p95Duration = percentileStats[0]?.p95 || 0;
      const p99Duration = percentileStats[0]?.p99 || 0;

      // Get queries by model
      const queriesByModelResult = await prisma.queryLog.groupBy({
        by: ['model'],
        where: baseFilter,
        _count: true
      });

      const queriesByModel = queriesByModelResult.reduce((acc, item) => {
        acc[item.model] = item._count;
        return acc;
      }, {} as Record<string, number>);

      // Get queries by action
      const queriesByActionResult = await prisma.queryLog.groupBy({
        by: ['action'],
        where: baseFilter,
        _count: true
      });

      const queriesByAction = queriesByActionResult.reduce((acc, item) => {
        acc[item.action] = item._count;
        return acc;
      }, {} as Record<string, number>);

      // Get slow queries by model
      const slowQueriesByModelResult = await prisma.queryLog.groupBy({
        by: ['model'],
        where: {
          ...baseFilter,
          isSlow: true
        },
        _count: true
      });

      const slowQueriesByModel = slowQueriesByModelResult.reduce((acc, item) => {
        acc[item.model] = item._count;
        return acc;
      }, {} as Record<string, number>);

      // Get error queries by model
      const errorQueriesByModelResult = await prisma.queryLog.groupBy({
        by: ['model'],
        where: {
          ...baseFilter,
          status: QueryStatus.error
        },
        _count: true
      });

      const errorQueriesByModel = errorQueriesByModelResult.reduce((acc, item) => {
        acc[item.model] = item._count;
        return acc;
      }, {} as Record<string, number>);

      // Get top slowest queries
      const topSlowestQueries = await prisma.queryLog.findMany({
        where: baseFilter,
        orderBy: {
          duration: 'desc'
        },
        take: limit,
        include: {
          executionPlan: true
        }
      });

      // Get recent error queries
      const recentErrorQueries = await prisma.queryLog.findMany({
        where: {
          ...baseFilter,
          status: QueryStatus.error
        },
        orderBy: {
          timestamp: 'desc'
        },
        take: limit
      });

      return {
        totalQueries,
        slowQueries,
        errorQueries,
        averageDuration,
        maxDuration,
        p95Duration,
        p99Duration,
        queriesByModel,
        queriesByAction,
        slowQueriesByModel,
        errorQueriesByModel,
        topSlowestQueries,
        recentErrorQueries
      };
    } catch (error) {
      console.error('Error getting query performance stats:', error);
      throw error;
    }
  }

  /**
   * Store execution plan for a query
   */
  static async storeExecutionPlan(queryId: string, model: string, action: string, params: any): Promise<void> {
    try {
      // For PostgreSQL, we would use EXPLAIN ANALYZE
      // This requires a raw query execution
      // We need to reconstruct the query from the model, action, and params
      
      // This is a simplified example and would need to be adapted for real use
      const planData = await this.generateExecutionPlan(model, action, params);
      
      if (planData) {
        await prisma.queryExecutionPlan.create({
          data: {
            queryId,
            planType: 'explain_analyze',
            planData,
            metadata: {
              model,
              action,
              params: JSON.stringify(params).substring(0, 1000) // Limit size
            }
          }
        });
      }
    } catch (error) {
      console.error('Failed to store execution plan:', error);
    }
  }

  /**
   * Generate execution plan for a query
   * This is a placeholder implementation
   */
  private static async generateExecutionPlan(model: string, action: string, params: any): Promise<string> {
    // In a real implementation, we would construct the SQL query and run EXPLAIN ANALYZE
    // This is a simplified example
    return `EXPLAIN ANALYZE for ${model}.${action} with params ${JSON.stringify(params).substring(0, 100)}...`;
  }

  /**
   * Aggregate query performance metrics
   */
  static async aggregateQueryMetrics(options: QueryAggregateOptions): Promise<void> {
    const { period, moduleId, model, action } = options;
    
    try {
      // Determine the time window based on the period
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case 'hourly':
          startDate = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
          break;
        case 'daily':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
          break;
        case 'weekly':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
          break;
        case 'monthly':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
          break;
        default:
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Default to daily
      }
      
      // Build the filter
      const filter: any = {
        timestamp: {
          gte: startDate,
          lte: now
        }
      };
      
      if (moduleId) filter.moduleId = moduleId;
      if (model) filter.model = model;
      if (action) filter.action = action;
      
      // Calculate metrics
      const metrics = await this.calculateMetrics(filter, period);
      
      // Store metrics
      for (const metric of metrics) {
        await prisma.queryPerformanceMetric.create({
          data: {
            name: metric.name,
            value: metric.value,
            moduleId,
            model,
            action,
            period,
            metadata: metric.metadata
          }
        });
      }
    } catch (error) {
      console.error('Error aggregating query metrics:', error);
      throw error;
    }
  }

  /**
   * Calculate metrics from query logs
   */
  private static async calculateMetrics(filter: any, period: string): Promise<Array<{ name: string, value: number, metadata?: any }>> {
    const metrics: Array<{ name: string, value: number, metadata?: any }> = [];
    
    // Average duration
    const avgDuration = await prisma.queryLog.aggregate({
      where: filter,
      _avg: {
        duration: true
      }
    });
    
    metrics.push({
      name: 'avg_duration',
      value: avgDuration._avg.duration || 0
    });
    
    // Count of queries
    const queryCount = await prisma.queryLog.count({
      where: filter
    });
    
    metrics.push({
      name: 'query_count',
      value: queryCount
    });
    
    // Count of slow queries
    const slowQueryCount = await prisma.queryLog.count({
      where: {
        ...filter,
        isSlow: true
      }
    });
    
    metrics.push({
      name: 'slow_query_count',
      value: slowQueryCount
    });
    
    // Percentage of slow queries
    const slowQueryPercentage = queryCount > 0 ? (slowQueryCount / queryCount) * 100 : 0;
    
    metrics.push({
      name: 'slow_query_percentage',
      value: slowQueryPercentage
    });
    
    // Count of error queries
    const errorQueryCount = await prisma.queryLog.count({
      where: {
        ...filter,
        status: QueryStatus.error
      }
    });
    
    metrics.push({
      name: 'error_query_count',
      value: errorQueryCount
    });
    
    // Percentage of error queries
    const errorQueryPercentage = queryCount > 0 ? (errorQueryCount / queryCount) * 100 : 0;
    
    metrics.push({
      name: 'error_query_percentage',
      value: errorQueryPercentage
    });
    
    return metrics;
  }
}
