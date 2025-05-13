/**
 * Log Alerts Service
 * 
 * This service provides functionality for creating, managing, and evaluating
 * alert rules based on log patterns and thresholds.
 */

import { prisma } from 'wasp/server';
import { LoggingService } from './logging';
import { LogAnalyticsService } from './logAnalytics';
import { v4 as uuidv4 } from 'uuid';

// Types
export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';
export type AlertStatus = 'active' | 'resolved' | 'acknowledged';
export type AlertConditionOperator = '>' | '>=' | '=' | '<=' | '<' | 'contains' | 'not_contains' | 'regex';
export type AlertType = 'threshold' | 'pattern' | 'anomaly' | 'trend';
export type NotificationChannel = 'email' | 'slack' | 'webhook' | 'in_app';

// Alert rule definition
export interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  type: AlertType;
  logType: 'system' | 'agent' | 'api' | 'approval';
  conditions: AlertCondition[];
  timeWindow: number; // in minutes
  severity: AlertSeverity;
  notificationChannels: NotificationChannel[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Alert condition
export interface AlertCondition {
  field: string;
  operator: AlertConditionOperator;
  value: string | number;
}

// Alert instance
export interface Alert {
  id: string;
  ruleId: string;
  ruleName: string;
  message: string;
  severity: AlertSeverity;
  status: AlertStatus;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  count: number;
  lastOccurrence: Date;
  relatedLogs: string[];
}

/**
 * Log Alerts Service
 */
export class LogAlertsService {
  /**
   * Create a new alert rule
   */
  static async createAlertRule(
    rule: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<AlertRule> {
    try {
      const newRule = await prisma.alertRule.create({
        data: {
          id: uuidv4(),
          name: rule.name,
          description: rule.description,
          enabled: rule.enabled,
          type: rule.type,
          logType: rule.logType,
          conditions: rule.conditions,
          timeWindow: rule.timeWindow,
          severity: rule.severity,
          notificationChannels: rule.notificationChannels,
          createdBy: rule.createdBy,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Log the creation
      await LoggingService.logSystemEvent({
        message: `Alert rule created: ${rule.name}`,
        level: 'INFO',
        category: 'SYSTEM_EVENT',
        source: 'log-alerts',
        userId: rule.createdBy,
        tags: ['alert-rule', 'create'],
        metadata: {
          ruleId: newRule.id,
          ruleName: rule.name,
          type: rule.type,
          logType: rule.logType,
        },
      });

      return newRule as AlertRule;
    } catch (error) {
      console.error('Error creating alert rule:', error);
      throw error;
    }
  }

  /**
   * Update an existing alert rule
   */
  static async updateAlertRule(
    id: string,
    rule: Partial<Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>>,
    userId: string
  ): Promise<AlertRule> {
    try {
      const updatedRule = await prisma.alertRule.update({
        where: { id },
        data: {
          ...rule,
          updatedAt: new Date(),
        },
      });

      // Log the update
      await LoggingService.logSystemEvent({
        message: `Alert rule updated: ${updatedRule.name}`,
        level: 'INFO',
        category: 'SYSTEM_EVENT',
        source: 'log-alerts',
        userId,
        tags: ['alert-rule', 'update'],
        metadata: {
          ruleId: id,
          ruleName: updatedRule.name,
          changes: rule,
        },
      });

      return updatedRule as AlertRule;
    } catch (error) {
      console.error('Error updating alert rule:', error);
      throw error;
    }
  }

  /**
   * Delete an alert rule
   */
  static async deleteAlertRule(id: string, userId: string): Promise<void> {
    try {
      const rule = await prisma.alertRule.findUnique({
        where: { id },
      });

      if (!rule) {
        throw new Error(`Alert rule with ID ${id} not found`);
      }

      await prisma.alertRule.delete({
        where: { id },
      });

      // Log the deletion
      await LoggingService.logSystemEvent({
        message: `Alert rule deleted: ${rule.name}`,
        level: 'INFO',
        category: 'SYSTEM_EVENT',
        source: 'log-alerts',
        userId,
        tags: ['alert-rule', 'delete'],
        metadata: {
          ruleId: id,
          ruleName: rule.name,
        },
      });
    } catch (error) {
      console.error('Error deleting alert rule:', error);
      throw error;
    }
  }

  /**
   * Get all alert rules
   */
  static async getAlertRules(): Promise<AlertRule[]> {
    try {
      const rules = await prisma.alertRule.findMany({
        orderBy: {
          updatedAt: 'desc',
        },
      });

      return rules as AlertRule[];
    } catch (error) {
      console.error('Error getting alert rules:', error);
      throw error;
    }
  }

  /**
   * Get an alert rule by ID
   */
  static async getAlertRuleById(id: string): Promise<AlertRule | null> {
    try {
      const rule = await prisma.alertRule.findUnique({
        where: { id },
      });

      return rule as AlertRule | null;
    } catch (error) {
      console.error('Error getting alert rule by ID:', error);
      throw error;
    }
  }

  /**
   * Create a new alert
   */
  static async createAlert(
    ruleId: string,
    message: string,
    relatedLogs: string[] = []
  ): Promise<Alert> {
    try {
      // Get the rule
      const rule = await prisma.alertRule.findUnique({
        where: { id: ruleId },
      });

      if (!rule) {
        throw new Error(`Alert rule with ID ${ruleId} not found`);
      }

      // Check if there's an existing active alert for this rule
      const existingAlert = await prisma.alert.findFirst({
        where: {
          ruleId,
          status: 'active',
        },
      });

      if (existingAlert) {
        // Update the existing alert
        const updatedAlert = await prisma.alert.update({
          where: { id: existingAlert.id },
          data: {
            count: existingAlert.count + 1,
            lastOccurrence: new Date(),
            relatedLogs: [...existingAlert.relatedLogs, ...relatedLogs],
            updatedAt: new Date(),
          },
        });

        return updatedAlert as Alert;
      } else {
        // Create a new alert
        const newAlert = await prisma.alert.create({
          data: {
            id: uuidv4(),
            ruleId,
            ruleName: rule.name,
            message,
            severity: rule.severity as AlertSeverity,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
            count: 1,
            lastOccurrence: new Date(),
            relatedLogs,
          },
        });

        // Log the alert creation
        await LoggingService.logSystemEvent({
          message: `Alert triggered: ${rule.name}`,
          level: rule.severity === 'critical' ? 'CRITICAL' : rule.severity === 'error' ? 'ERROR' : rule.severity === 'warning' ? 'WARN' : 'INFO',
          category: 'SECURITY',
          source: 'log-alerts',
          tags: ['alert', 'trigger', rule.severity],
          metadata: {
            alertId: newAlert.id,
            ruleId,
            ruleName: rule.name,
            message,
          },
        });

        // Send notifications
        await this.sendAlertNotifications(newAlert as Alert, rule as AlertRule);

        return newAlert as Alert;
      }
    } catch (error) {
      console.error('Error creating alert:', error);
      throw error;
    }
  }

  /**
   * Acknowledge an alert
   */
  static async acknowledgeAlert(id: string, userId: string): Promise<Alert> {
    try {
      const alert = await prisma.alert.update({
        where: { id },
        data: {
          status: 'acknowledged',
          acknowledgedBy: userId,
          acknowledgedAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Log the acknowledgement
      await LoggingService.logSystemEvent({
        message: `Alert acknowledged: ${alert.ruleName}`,
        level: 'INFO',
        category: 'SYSTEM_EVENT',
        source: 'log-alerts',
        userId,
        tags: ['alert', 'acknowledge'],
        metadata: {
          alertId: id,
          ruleName: alert.ruleName,
        },
      });

      return alert as Alert;
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      throw error;
    }
  }

  /**
   * Resolve an alert
   */
  static async resolveAlert(id: string, userId: string): Promise<Alert> {
    try {
      const alert = await prisma.alert.update({
        where: { id },
        data: {
          status: 'resolved',
          resolvedAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Log the resolution
      await LoggingService.logSystemEvent({
        message: `Alert resolved: ${alert.ruleName}`,
        level: 'INFO',
        category: 'SYSTEM_EVENT',
        source: 'log-alerts',
        userId,
        tags: ['alert', 'resolve'],
        metadata: {
          alertId: id,
          ruleName: alert.ruleName,
        },
      });

      return alert as Alert;
    } catch (error) {
      console.error('Error resolving alert:', error);
      throw error;
    }
  }

  /**
   * Get all alerts
   */
  static async getAlerts(
    status?: AlertStatus,
    severity?: AlertSeverity
  ): Promise<Alert[]> {
    try {
      const where: any = {};

      if (status) {
        where.status = status;
      }

      if (severity) {
        where.severity = severity;
      }

      const alerts = await prisma.alert.findMany({
        where,
        orderBy: {
          lastOccurrence: 'desc',
        },
      });

      return alerts as Alert[];
    } catch (error) {
      console.error('Error getting alerts:', error);
      throw error;
    }
  }

  /**
   * Evaluate alert rules against logs
   */
  static async evaluateAlertRules(): Promise<void> {
    try {
      // Get all enabled alert rules
      const rules = await prisma.alertRule.findMany({
        where: {
          enabled: true,
        },
      });

      // Process each rule
      for (const rule of rules) {
        await this.evaluateRule(rule as AlertRule);
      }
    } catch (error) {
      console.error('Error evaluating alert rules:', error);
      throw error;
    }
  }

  /**
   * Evaluate a single alert rule
   */
  private static async evaluateRule(rule: AlertRule): Promise<void> {
    try {
      const now = new Date();
      const startDate = new Date(now.getTime() - rule.timeWindow * 60 * 1000);

      switch (rule.type) {
        case 'threshold':
          await this.evaluateThresholdRule(rule, startDate, now);
          break;
        case 'pattern':
          await this.evaluatePatternRule(rule, startDate, now);
          break;
        case 'anomaly':
          await this.evaluateAnomalyRule(rule, startDate, now);
          break;
        case 'trend':
          await this.evaluateTrendRule(rule, startDate, now);
          break;
      }
    } catch (error) {
      console.error(`Error evaluating rule ${rule.id}:`, error);
    }
  }

  /**
   * Evaluate a threshold alert rule
   */
  private static async evaluateThresholdRule(
    rule: AlertRule,
    startDate: Date,
    endDate: Date
  ): Promise<void> {
    // Implementation will depend on the specific conditions
    // This is a simplified example for log count threshold
    const condition = rule.conditions[0]; // Assuming first condition is the threshold
    
    if (condition.field === 'count') {
      // Get log counts
      const counts = await LogAnalyticsService.getLogCountsByTimeInterval(
        rule.logType,
        startDate,
        endDate,
        'hour'
      );
      
      // Calculate total count
      const totalCount = counts.reduce((sum, item) => sum + item.count, 0);
      
      // Check if threshold is exceeded
      const threshold = Number(condition.value);
      const operator = condition.operator;
      
      let thresholdExceeded = false;
      switch (operator) {
        case '>':
          thresholdExceeded = totalCount > threshold;
          break;
        case '>=':
          thresholdExceeded = totalCount >= threshold;
          break;
        case '=':
          thresholdExceeded = totalCount === threshold;
          break;
        case '<=':
          thresholdExceeded = totalCount <= threshold;
          break;
        case '<':
          thresholdExceeded = totalCount < threshold;
          break;
      }
      
      if (thresholdExceeded) {
        // Create an alert
        await this.createAlert(
          rule.id,
          `${rule.name}: ${totalCount} logs in the last ${rule.timeWindow} minutes ${operator} ${threshold}`,
          []
        );
      }
    }
  }

  /**
   * Evaluate a pattern alert rule
   */
  private static async evaluatePatternRule(
    rule: AlertRule,
    startDate: Date,
    endDate: Date
  ): Promise<void> {
    // Implementation for pattern rules
    // This would typically look for specific patterns in log messages
  }

  /**
   * Evaluate an anomaly alert rule
   */
  private static async evaluateAnomalyRule(
    rule: AlertRule,
    startDate: Date,
    endDate: Date
  ): Promise<void> {
    // Implementation for anomaly rules
    // This would use the anomaly detection from LogAnalyticsService
  }

  /**
   * Evaluate a trend alert rule
   */
  private static async evaluateTrendRule(
    rule: AlertRule,
    startDate: Date,
    endDate: Date
  ): Promise<void> {
    // Implementation for trend rules
    // This would use the trend analysis from LogAnalyticsService
  }

  /**
   * Send notifications for an alert
   */
  private static async sendAlertNotifications(alert: Alert, rule: AlertRule): Promise<void> {
    // Implementation for sending notifications
    // This would send notifications to the configured channels
  }
}
