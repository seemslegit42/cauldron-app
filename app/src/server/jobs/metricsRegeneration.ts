/**
 * Metrics Regeneration Job
 * 
 * This job regenerates derived metrics across various modules.
 * It integrates with existing analytics systems and Sentinel.
 */

import { prisma } from 'wasp/server';
import { LoggingService } from '../../shared/services/logging';
import { MaintenanceOperation, MaintenanceConfig } from '../services/maintenanceService';
import { SentinelMetricsService } from '../../sentinel/services/sentinelMetricsService';

// Default configuration
const defaultConfig = {
  securityMetrics: {
    enabled: true,
    lookbackDays: 30,
  },
  businessMetrics: {
    enabled: true,
    lookbackDays: 90,
  },
  growthMetrics: {
    enabled: true,
    lookbackDays: 180,
  },
  revenueMetrics: {
    enabled: true,
    lookbackDays: 90,
  },
  logInsights: {
    enabled: true,
    lookbackDays: 7,
  },
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
 * Get the current configuration
 */
async function getMetricsRegenerationConfig() {
  try {
    // Try to get the configuration from the database
    const globalSettings = await prisma.globalSettings.findFirst({
      where: {
        settings: {
          path: ['metricsRegeneration'],
          not: undefined,
        },
      },
    });

    if (globalSettings?.settings?.metricsRegeneration) {
      return {
        ...defaultConfig,
        ...globalSettings.settings.metricsRegeneration,
      };
    }

    return defaultConfig;
  } catch (error) {
    console.error('Error getting metrics regeneration configuration:', error);
    return defaultConfig;
  }
}

/**
 * Security Metrics Regeneration Operation
 */
class SecurityMetricsRegeneration extends MaintenanceOperation {
  private config: any;

  constructor(config: Partial<MaintenanceConfig> = {}) {
    super(config);
  }

  async doExecute(): Promise<void> {
    try {
      // Get the current configuration
      this.config = await getMetricsRegenerationConfig();
      const { enabled, lookbackDays } = this.config.securityMetrics;

      if (!enabled) {
        await this.logDebug('Security metrics regeneration is disabled');
        return;
      }

      const startDate = daysAgo(lookbackDays);
      await this.logDebug(`Regenerating security metrics from ${startDate.toISOString()}`);

      // Get all users
      const users = await prisma.user.findMany({
        select: {
          id: true,
        },
      });

      // Process each user
      for (const user of users) {
        await this.regenerateUserSecurityMetrics(user.id, startDate);
        this.itemsProcessed++;
      }

      // Log the regeneration
      await LoggingService.logSystemEvent({
        message: `Regenerated security metrics for ${users.length} users`,
        level: 'INFO',
        category: 'MAINTENANCE',
        source: 'metrics-regeneration',
        tags: ['maintenance', 'metrics', 'security'],
        metadata: {
          lookbackDays,
          startDate,
          userCount: users.length,
        },
      });

      // Update Sentinel metrics
      await SentinelMetricsService.updateMetric('security_metrics_regenerated', users.length);
    } catch (error) {
      this.errors.push(error as Error);
      console.error('Error regenerating security metrics:', error);
      throw error;
    }
  }

  /**
   * Regenerate security metrics for a user
   */
  private async regenerateUserSecurityMetrics(userId: string, startDate: Date): Promise<void> {
    try {
      // Get security alerts for the user
      const alerts = await prisma.securityAlert.findMany({
        where: {
          userId,
          createdAt: {
            gte: startDate,
          },
        },
      });

      // Get security scans for the user
      const scans = await prisma.securityScan.findMany({
        where: {
          userId,
          createdAt: {
            gte: startDate,
          },
        },
      });

      // Calculate security score
      const securityScore = this.calculateSecurityScore(alerts, scans);

      // Update security score metric
      await prisma.securityMetric.upsert({
        where: {
          id: `security-score-${userId}`,
        },
        update: {
          value: securityScore,
          updatedAt: new Date(),
        },
        create: {
          id: `security-score-${userId}`,
          userId,
          name: 'security_score',
          value: securityScore,
          category: 'posture',
        },
      });

      // Calculate vulnerabilities count
      const vulnerabilities = alerts.filter(alert => 
        alert.source === 'scan' && 
        ['high', 'critical'].includes(alert.severity)
      ).length;

      // Update vulnerabilities metric
      await prisma.securityMetric.upsert({
        where: {
          id: `vulnerabilities-${userId}`,
        },
        update: {
          value: vulnerabilities,
          updatedAt: new Date(),
        },
        create: {
          id: `vulnerabilities-${userId}`,
          userId,
          name: 'vulnerabilities',
          value: vulnerabilities,
          category: 'posture',
        },
      });

      // Calculate threats blocked
      const threatsBlocked = alerts.filter(alert => 
        alert.source === 'monitor' && 
        alert.status === 'resolved'
      ).length;

      // Update threats blocked metric
      await prisma.securityMetric.upsert({
        where: {
          id: `threats-blocked-${userId}`,
        },
        update: {
          value: threatsBlocked,
          updatedAt: new Date(),
        },
        create: {
          id: `threats-blocked-${userId}`,
          userId,
          name: 'threats_blocked',
          value: threatsBlocked,
          category: 'threats',
        },
      });

      await this.logDebug(`Regenerated security metrics for user ${userId}`);
    } catch (error) {
      console.error(`Error regenerating security metrics for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Calculate security score based on alerts and scans
   */
  private calculateSecurityScore(alerts: any[], scans: any[]): number {
    // Start with a base score of 100
    let score = 100;

    // Deduct points for critical alerts
    const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
    score -= criticalAlerts.length * 10;

    // Deduct points for high severity alerts
    const highAlerts = alerts.filter(alert => alert.severity === 'high');
    score -= highAlerts.length * 5;

    // Deduct points for medium severity alerts
    const mediumAlerts = alerts.filter(alert => alert.severity === 'medium');
    score -= mediumAlerts.length * 2;

    // Add points for completed scans
    const completedScans = scans.filter(scan => scan.status === 'completed');
    score += completedScans.length * 2;

    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, score));
  }
}

/**
 * Log Insights Regeneration Operation
 */
class LogInsightsRegeneration extends MaintenanceOperation {
  private config: any;

  constructor(config: Partial<MaintenanceConfig> = {}) {
    super(config);
  }

  async doExecute(): Promise<void> {
    try {
      // Get the current configuration
      this.config = await getMetricsRegenerationConfig();
      const { enabled, lookbackDays } = this.config.logInsights;

      if (!enabled) {
        await this.logDebug('Log insights regeneration is disabled');
        return;
      }

      const startDate = daysAgo(lookbackDays);
      await this.logDebug(`Regenerating log insights from ${startDate.toISOString()}`);

      // Delete existing log insights
      await prisma.logInsight.deleteMany({});

      // Generate error insights
      await this.generateErrorInsights(startDate);

      // Generate API insights
      await this.generateApiInsights(startDate);

      // Generate security insights
      await this.generateSecurityInsights(startDate);

      // Log the regeneration
      await LoggingService.logSystemEvent({
        message: 'Regenerated log insights',
        level: 'INFO',
        category: 'MAINTENANCE',
        source: 'metrics-regeneration',
        tags: ['maintenance', 'metrics', 'log-insights'],
        metadata: {
          lookbackDays,
          startDate,
          insightsCount: this.itemsProcessed,
        },
      });

      // Update Sentinel metrics
      await SentinelMetricsService.updateMetric('log_insights_regenerated', this.itemsProcessed);
    } catch (error) {
      this.errors.push(error as Error);
      console.error('Error regenerating log insights:', error);
      throw error;
    }
  }

  /**
   * Generate error insights
   */
  private async generateErrorInsights(startDate: Date): Promise<void> {
    try {
      // Get error logs
      const errorLogs = await prisma.systemLog.findMany({
        where: {
          level: 'ERROR',
          timestamp: {
            gte: startDate,
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
      });

      // Group errors by message
      const errorGroups = this.groupByMessage(errorLogs);

      // Create insights for frequent errors
      for (const [message, logs] of Object.entries(errorGroups)) {
        if (logs.length >= 5) { // Only create insights for frequent errors
          await prisma.logInsight.create({
            data: {
              insight: `Frequent error: ${message.substring(0, 100)}...`,
              importance: logs.length >= 20 ? 'critical' : logs.length >= 10 ? 'high' : 'medium',
              category: 'errors',
              relatedLogs: logs.length,
              startDate: new Date(Math.min(...logs.map(log => new Date(log.timestamp).getTime()))),
              endDate: new Date(Math.max(...logs.map(log => new Date(log.timestamp).getTime()))),
              metadata: {
                errorCount: logs.length,
                sources: [...new Set(logs.map(log => log.source))],
                modules: [...new Set(logs.map(log => log.moduleId).filter(Boolean))],
              },
            },
          });

          this.itemsProcessed++;
        }
      }
    } catch (error) {
      console.error('Error generating error insights:', error);
      throw error;
    }
  }

  /**
   * Generate API insights
   */
  private async generateApiInsights(startDate: Date): Promise<void> {
    try {
      // Get API interactions
      const apiInteractions = await prisma.apiInteraction.findMany({
        where: {
          timestamp: {
            gte: startDate,
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
      });

      // Group by endpoint
      const endpointGroups = this.groupByEndpoint(apiInteractions);

      // Create insights for slow endpoints
      for (const [endpoint, interactions] of Object.entries(endpointGroups)) {
        const avgDuration = interactions.reduce((sum, interaction) => sum + interaction.duration, 0) / interactions.length;
        
        if (avgDuration > 1000) { // Only create insights for slow endpoints (>1s)
          await prisma.logInsight.create({
            data: {
              insight: `Slow API endpoint: ${endpoint} (avg: ${Math.round(avgDuration)}ms)`,
              importance: avgDuration > 5000 ? 'high' : avgDuration > 2000 ? 'medium' : 'low',
              category: 'performance',
              relatedLogs: interactions.length,
              startDate: new Date(Math.min(...interactions.map(i => new Date(i.timestamp).getTime()))),
              endDate: new Date(Math.max(...interactions.map(i => new Date(i.timestamp).getTime()))),
              metadata: {
                endpoint,
                avgDuration,
                count: interactions.length,
                methods: [...new Set(interactions.map(i => i.method))],
                statusCodes: [...new Set(interactions.map(i => i.statusCode).filter(Boolean))],
              },
            },
          });

          this.itemsProcessed++;
        }
      }
    } catch (error) {
      console.error('Error generating API insights:', error);
      throw error;
    }
  }

  /**
   * Generate security insights
   */
  private async generateSecurityInsights(startDate: Date): Promise<void> {
    try {
      // Get security-related logs
      const securityLogs = await prisma.systemLog.findMany({
        where: {
          category: 'SECURITY',
          timestamp: {
            gte: startDate,
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
      });

      // Group by source
      const sourceGroups = this.groupBySource(securityLogs);

      // Create insights for security events
      for (const [source, logs] of Object.entries(sourceGroups)) {
        if (logs.length >= 3) { // Only create insights for repeated security events
          await prisma.logInsight.create({
            data: {
              insight: `Security events from ${source}: ${logs.length} events`,
              importance: logs.length >= 10 ? 'high' : 'medium',
              category: 'security',
              relatedLogs: logs.length,
              startDate: new Date(Math.min(...logs.map(log => new Date(log.timestamp).getTime()))),
              endDate: new Date(Math.max(...logs.map(log => new Date(log.timestamp).getTime()))),
              metadata: {
                source,
                count: logs.length,
                levels: [...new Set(logs.map(log => log.level))],
                modules: [...new Set(logs.map(log => log.moduleId).filter(Boolean))],
              },
            },
          });

          this.itemsProcessed++;
        }
      }
    } catch (error) {
      console.error('Error generating security insights:', error);
      throw error;
    }
  }

  /**
   * Group logs by message
   */
  private groupByMessage(logs: any[]): Record<string, any[]> {
    return logs.reduce((groups, log) => {
      const message = log.message;
      if (!groups[message]) {
        groups[message] = [];
      }
      groups[message].push(log);
      return groups;
    }, {});
  }

  /**
   * Group API interactions by endpoint
   */
  private groupByEndpoint(interactions: any[]): Record<string, any[]> {
    return interactions.reduce((groups, interaction) => {
      const endpoint = interaction.endpoint;
      if (!groups[endpoint]) {
        groups[endpoint] = [];
      }
      groups[endpoint].push(interaction);
      return groups;
    }, {});
  }

  /**
   * Group logs by source
   */
  private groupBySource(logs: any[]): Record<string, any[]> {
    return logs.reduce((groups, log) => {
      const source = log.source;
      if (!groups[source]) {
        groups[source] = [];
      }
      groups[source].push(log);
      return groups;
    }, {});
  }
}

/**
 * Main metrics regeneration job function
 */
export const metricsRegenerationJob = async () => {
  try {
    console.log('Starting metrics regeneration job');
    const startTime = Date.now();

    // Regenerate security metrics
    const securityMetricsRegeneration = new SecurityMetricsRegeneration();
    const securityResult = await securityMetricsRegeneration.execute();

    // Regenerate log insights
    const logInsightsRegeneration = new LogInsightsRegeneration();
    const insightsResult = await logInsightsRegeneration.execute();

    const duration = Date.now() - startTime;
    console.log('Metrics regeneration job completed successfully');

    // Record job execution in Sentinel
    await SentinelMetricsService.recordMaintenanceJob(
      'metrics_regeneration',
      securityResult.status === 'success' && insightsResult.status === 'success' ? 'success' : 'partial',
      securityResult.itemsProcessed + insightsResult.itemsProcessed,
      duration,
      {
        securityMetrics: securityResult,
        logInsights: insightsResult,
      }
    );
  } catch (error) {
    console.error('Error in metrics regeneration job:', error);
    throw error;
  }
};
