/**
 * Log Analytics Service
 * 
 * This service provides analytics capabilities for log data, including:
 * - Pattern detection
 * - Anomaly detection
 * - Trend analysis
 * - Security insights
 */

import { prisma } from 'wasp/server';
import { LogLevel, EventCategory } from './logging';

// Types
export type TimeRange = '1h' | '6h' | '24h' | '7d' | '30d' | '90d' | 'custom';
export type LogType = 'system' | 'agent' | 'api' | 'approval';
export type AggregationType = 'count' | 'avg' | 'min' | 'max' | 'sum';
export type GroupByField = 'level' | 'category' | 'source' | 'userId' | 'agentId' | 'endpoint' | 'status' | 'tag';

// Analytics result types
export interface LogCountByLevel {
  level: LogLevel;
  count: number;
}

export interface LogCountByCategory {
  category: EventCategory;
  count: number;
}

export interface LogCountBySource {
  source: string;
  count: number;
}

export interface LogCountByTimeInterval {
  interval: string;
  count: number;
}

export interface LogAnomalyResult {
  timestamp: Date;
  value: number;
  expected: number;
  deviation: number;
  isAnomaly: boolean;
}

export interface LogPatternResult {
  pattern: string;
  count: number;
  examples: string[];
  sources: string[];
}

export interface LogTrendResult {
  trend: string;
  startValue: number;
  endValue: number;
  changePercent: number;
  direction: 'up' | 'down' | 'stable';
}

export interface LogInsightResult {
  insight: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
  relatedLogs: number;
  category: string;
}

/**
 * Log Analytics Service
 */
export class LogAnalyticsService {
  /**
   * Get log counts by level
   */
  static async getLogCountsByLevel(
    logType: LogType,
    startDate: Date,
    endDate: Date
  ): Promise<LogCountByLevel[]> {
    try {
      let result: any[] = [];

      switch (logType) {
        case 'system':
          result = await prisma.$queryRaw`
            SELECT "level", COUNT(*) as "count"
            FROM "SystemLog"
            WHERE "timestamp" >= ${startDate} AND "timestamp" <= ${endDate}
            GROUP BY "level"
            ORDER BY "count" DESC
          `;
          break;
        case 'agent':
          result = await prisma.$queryRaw`
            SELECT "level", COUNT(*) as "count"
            FROM "AgentLog"
            WHERE "timestamp" >= ${startDate} AND "timestamp" <= ${endDate}
            GROUP BY "level"
            ORDER BY "count" DESC
          `;
          break;
        case 'api':
          result = await prisma.$queryRaw`
            SELECT "status" as "level", COUNT(*) as "count"
            FROM "ApiInteraction"
            WHERE "timestamp" >= ${startDate} AND "timestamp" <= ${endDate}
            GROUP BY "status"
            ORDER BY "count" DESC
          `;
          break;
        case 'approval':
          result = await prisma.$queryRaw`
            SELECT "status" as "level", COUNT(*) as "count"
            FROM "HumanApproval"
            WHERE "timestamp" >= ${startDate} AND "timestamp" <= ${endDate}
            GROUP BY "status"
            ORDER BY "count" DESC
          `;
          break;
      }

      return result.map((row) => ({
        level: row.level as LogLevel,
        count: Number(row.count),
      }));
    } catch (error) {
      console.error(`Error getting log counts by level for ${logType}:`, error);
      throw error;
    }
  }

  /**
   * Get log counts by category
   */
  static async getLogCountsByCategory(
    logType: LogType,
    startDate: Date,
    endDate: Date
  ): Promise<LogCountByCategory[]> {
    try {
      let result: any[] = [];

      switch (logType) {
        case 'system':
        case 'agent':
          const table = logType === 'system' ? 'SystemLog' : 'AgentLog';
          result = await prisma.$queryRaw`
            SELECT "category", COUNT(*) as "count"
            FROM "${table}"
            WHERE "timestamp" >= ${startDate} AND "timestamp" <= ${endDate}
            GROUP BY "category"
            ORDER BY "count" DESC
          `;
          break;
        case 'api':
          // For API logs, use endpoint as category
          result = await prisma.$queryRaw`
            SELECT SUBSTRING("endpoint" FROM '^/[^/]+') as "category", COUNT(*) as "count"
            FROM "ApiInteraction"
            WHERE "timestamp" >= ${startDate} AND "timestamp" <= ${endDate}
            GROUP BY SUBSTRING("endpoint" FROM '^/[^/]+')
            ORDER BY "count" DESC
          `;
          break;
        case 'approval':
          // For approval logs, use requestedAction as category
          result = await prisma.$queryRaw`
            SELECT "requestedAction" as "category", COUNT(*) as "count"
            FROM "HumanApproval"
            WHERE "timestamp" >= ${startDate} AND "timestamp" <= ${endDate}
            GROUP BY "requestedAction"
            ORDER BY "count" DESC
          `;
          break;
      }

      return result.map((row) => ({
        category: row.category as EventCategory,
        count: Number(row.count),
      }));
    } catch (error) {
      console.error(`Error getting log counts by category for ${logType}:`, error);
      throw error;
    }
  }

  /**
   * Get log counts by time interval
   */
  static async getLogCountsByTimeInterval(
    logType: LogType,
    startDate: Date,
    endDate: Date,
    interval: 'hour' | 'day' | 'week' | 'month' = 'hour'
  ): Promise<LogCountByTimeInterval[]> {
    try {
      let result: any[] = [];
      let intervalSql: string;

      // Determine the interval SQL
      switch (interval) {
        case 'hour':
          intervalSql = `DATE_TRUNC('hour', "timestamp")`;
          break;
        case 'day':
          intervalSql = `DATE_TRUNC('day', "timestamp")`;
          break;
        case 'week':
          intervalSql = `DATE_TRUNC('week', "timestamp")`;
          break;
        case 'month':
          intervalSql = `DATE_TRUNC('month', "timestamp")`;
          break;
        default:
          intervalSql = `DATE_TRUNC('hour', "timestamp")`;
      }

      // Get the table name based on log type
      const table = 
        logType === 'system' ? 'SystemLog' :
        logType === 'agent' ? 'AgentLog' :
        logType === 'api' ? 'ApiInteraction' :
        'HumanApproval';

      // Execute the query
      result = await prisma.$queryRaw`
        SELECT ${intervalSql} as "interval", COUNT(*) as "count"
        FROM "${table}"
        WHERE "timestamp" >= ${startDate} AND "timestamp" <= ${endDate}
        GROUP BY ${intervalSql}
        ORDER BY ${intervalSql} ASC
      `;

      return result.map((row) => ({
        interval: row.interval.toISOString(),
        count: Number(row.count),
      }));
    } catch (error) {
      console.error(`Error getting log counts by time interval for ${logType}:`, error);
      throw error;
    }
  }

  /**
   * Detect anomalies in log counts
   */
  static async detectAnomalies(
    logType: LogType,
    startDate: Date,
    endDate: Date,
    interval: 'hour' | 'day' = 'hour',
    sensitivityThreshold: number = 2.0
  ): Promise<LogAnomalyResult[]> {
    try {
      // Get log counts by time interval
      const countsByInterval = await this.getLogCountsByTimeInterval(
        logType,
        startDate,
        endDate,
        interval
      );

      // Calculate the mean and standard deviation
      const counts = countsByInterval.map((item) => item.count);
      const mean = counts.reduce((sum, count) => sum + count, 0) / counts.length;
      const variance = counts.reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) / counts.length;
      const stdDev = Math.sqrt(variance);

      // Detect anomalies
      return countsByInterval.map((item) => {
        const deviation = (item.count - mean) / (stdDev || 1); // Avoid division by zero
        return {
          timestamp: new Date(item.interval),
          value: item.count,
          expected: mean,
          deviation,
          isAnomaly: Math.abs(deviation) > sensitivityThreshold,
        };
      });
    } catch (error) {
      console.error(`Error detecting anomalies for ${logType}:`, error);
      throw error;
    }
  }

  /**
   * Detect patterns in log messages
   */
  static async detectPatterns(
    logType: LogType,
    startDate: Date,
    endDate: Date,
    minOccurrences: number = 5
  ): Promise<LogPatternResult[]> {
    try {
      let result: any[] = [];
      let messageField: string;

      // Determine the message field based on log type
      switch (logType) {
        case 'system':
        case 'agent':
          messageField = 'message';
          break;
        case 'api':
          messageField = 'endpoint';
          break;
        case 'approval':
          messageField = 'requestedAction';
          break;
        default:
          messageField = 'message';
      }

      // Get the table name based on log type
      const table = 
        logType === 'system' ? 'SystemLog' :
        logType === 'agent' ? 'AgentLog' :
        logType === 'api' ? 'ApiInteraction' :
        'HumanApproval';

      // Execute the query to find common patterns
      result = await prisma.$queryRaw`
        SELECT 
          REGEXP_REPLACE(${messageField}, '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', '<UUID>') as "pattern",
          COUNT(*) as "count",
          ARRAY_AGG(${messageField} ORDER BY "timestamp" DESC LIMIT 3) as "examples",
          ARRAY_AGG(DISTINCT "source") as "sources"
        FROM "${table}"
        WHERE "timestamp" >= ${startDate} AND "timestamp" <= ${endDate}
        GROUP BY "pattern"
        HAVING COUNT(*) >= ${minOccurrences}
        ORDER BY "count" DESC
        LIMIT 20
      `;

      return result.map((row) => ({
        pattern: row.pattern,
        count: Number(row.count),
        examples: row.examples,
        sources: row.sources,
      }));
    } catch (error) {
      console.error(`Error detecting patterns for ${logType}:`, error);
      throw error;
    }
  }

  /**
   * Analyze trends in log data
   */
  static async analyzeTrends(
    logType: LogType,
    startDate: Date,
    endDate: Date,
    groupBy: GroupByField = 'level'
  ): Promise<LogTrendResult[]> {
    try {
      // Get the table name based on log type
      const table = 
        logType === 'system' ? 'SystemLog' :
        logType === 'agent' ? 'AgentLog' :
        logType === 'api' ? 'ApiInteraction' :
        'HumanApproval';

      // Adjust field name based on log type
      let fieldName = groupBy;
      if ((logType === 'api' || logType === 'approval') && groupBy === 'level') {
        fieldName = 'status';
      }

      // Calculate the midpoint date
      const midDate = new Date((startDate.getTime() + endDate.getTime()) / 2);

      // Get counts for the first half of the period
      const firstHalfCounts = await prisma.$queryRaw`
        SELECT "${fieldName}" as "trend", COUNT(*) as "count"
        FROM "${table}"
        WHERE "timestamp" >= ${startDate} AND "timestamp" < ${midDate}
        GROUP BY "${fieldName}"
      `;

      // Get counts for the second half of the period
      const secondHalfCounts = await prisma.$queryRaw`
        SELECT "${fieldName}" as "trend", COUNT(*) as "count"
        FROM "${table}"
        WHERE "timestamp" >= ${midDate} AND "timestamp" <= ${endDate}
        GROUP BY "${fieldName}"
      `;

      // Convert to maps for easier lookup
      const firstHalfMap = new Map(
        (firstHalfCounts as any[]).map((row) => [row.trend, Number(row.count)])
      );
      const secondHalfMap = new Map(
        (secondHalfCounts as any[]).map((row) => [row.trend, Number(row.count)])
      );

      // Combine all unique trends
      const allTrends = new Set([
        ...Array.from(firstHalfMap.keys()),
        ...Array.from(secondHalfMap.keys()),
      ]);

      // Calculate trends
      return Array.from(allTrends).map((trend) => {
        const startValue = firstHalfMap.get(trend) || 0;
        const endValue = secondHalfMap.get(trend) || 0;
        const changePercent =
          startValue === 0
            ? endValue > 0
              ? 100
              : 0
            : ((endValue - startValue) / startValue) * 100;
        
        return {
          trend: String(trend),
          startValue,
          endValue,
          changePercent,
          direction:
            changePercent > 10 ? 'up' : changePercent < -10 ? 'down' : 'stable',
        };
      }).sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
    } catch (error) {
      console.error(`Error analyzing trends for ${logType}:`, error);
      throw error;
    }
  }

  /**
   * Generate insights from log data
   */
  static async generateInsights(
    startDate: Date,
    endDate: Date
  ): Promise<LogInsightResult[]> {
    try {
      const insights: LogInsightResult[] = [];

      // Get error counts
      const errorCounts = await prisma.$queryRaw`
        SELECT "category", COUNT(*) as "count"
        FROM "SystemLog"
        WHERE "timestamp" >= ${startDate} AND "timestamp" <= ${endDate}
          AND "level" IN ('ERROR', 'CRITICAL')
        GROUP BY "category"
        ORDER BY "count" DESC
        LIMIT 5
      `;

      // Add error insights
      for (const row of errorCounts as any[]) {
        insights.push({
          insight: `High number of errors in ${row.category} category`,
          importance: Number(row.count) > 100 ? 'critical' : Number(row.count) > 50 ? 'high' : 'medium',
          relatedLogs: Number(row.count),
          category: 'errors',
        });
      }

      // Get API error rates
      const apiErrorRates = await prisma.$queryRaw`
        SELECT 
          SUBSTRING("endpoint" FROM '^/[^/]+') as "endpoint",
          COUNT(*) FILTER (WHERE "status" IN ('ERROR', 'SERVER_ERROR', 'TIMEOUT')) as "errors",
          COUNT(*) as "total",
          (COUNT(*) FILTER (WHERE "status" IN ('ERROR', 'SERVER_ERROR', 'TIMEOUT')) * 100.0 / COUNT(*)) as "error_rate"
        FROM "ApiInteraction"
        WHERE "timestamp" >= ${startDate} AND "timestamp" <= ${endDate}
        GROUP BY SUBSTRING("endpoint" FROM '^/[^/]+')
        HAVING COUNT(*) > 10 AND (COUNT(*) FILTER (WHERE "status" IN ('ERROR', 'SERVER_ERROR', 'TIMEOUT')) * 100.0 / COUNT(*)) > 5
        ORDER BY "error_rate" DESC
        LIMIT 5
      `;

      // Add API error rate insights
      for (const row of apiErrorRates as any[]) {
        insights.push({
          insight: `High error rate (${row.error_rate.toFixed(1)}%) for ${row.endpoint} API`,
          importance: Number(row.error_rate) > 20 ? 'critical' : Number(row.error_rate) > 10 ? 'high' : 'medium',
          relatedLogs: Number(row.errors),
          category: 'api',
        });
      }

      // Get unusual activity patterns
      const unusualActivity = await prisma.$queryRaw`
        WITH hourly_counts AS (
          SELECT 
            DATE_TRUNC('hour', "timestamp") as "hour",
            COUNT(*) as "count"
          FROM "SystemLog"
          WHERE "timestamp" >= ${startDate} AND "timestamp" <= ${endDate}
          GROUP BY DATE_TRUNC('hour', "timestamp")
        ),
        stats AS (
          SELECT 
            AVG("count") as "avg_count",
            STDDEV("count") as "stddev_count"
          FROM hourly_counts
        )
        SELECT 
          hc."hour",
          hc."count",
          (hc."count" - s."avg_count") / NULLIF(s."stddev_count", 0) as "z_score"
        FROM hourly_counts hc, stats s
        WHERE ABS((hc."count" - s."avg_count") / NULLIF(s."stddev_count", 0)) > 2
        ORDER BY ABS((hc."count" - s."avg_count") / NULLIF(s."stddev_count", 0)) DESC
        LIMIT 3
      `;

      // Add unusual activity insights
      for (const row of unusualActivity as any[]) {
        const direction = row.z_score > 0 ? 'spike' : 'drop';
        insights.push({
          insight: `Unusual ${direction} in activity at ${new Date(row.hour).toLocaleString()}`,
          importance: Math.abs(row.z_score) > 3 ? 'high' : 'medium',
          relatedLogs: Number(row.count),
          category: 'activity',
        });
      }

      return insights;
    } catch (error) {
      console.error('Error generating insights:', error);
      throw error;
    }
  }
}
