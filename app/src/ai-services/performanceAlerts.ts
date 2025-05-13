/**
 * Performance Alerts
 * 
 * This module provides monitoring and alerting for AI performance metrics,
 * including latency, throughput, and error rates.
 */

import { GROQ_CONFIG } from '../shared/config/ai-config';
import { LoggingService } from '../shared/services/logging';
import { prisma } from 'wasp/server';
import { sendNotification } from '../shared/services/notificationService';

// Alert severity levels
export enum AlertSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

// Alert types
export enum AlertType {
  LATENCY = 'LATENCY',
  THROUGHPUT = 'THROUGHPUT',
  ERROR_RATE = 'ERROR_RATE',
  TOKEN_BUDGET = 'TOKEN_BUDGET',
  CACHE_PERFORMANCE = 'CACHE_PERFORMANCE',
}

// Alert interface
export interface PerformanceAlert {
  id?: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  timestamp: Date;
  metadata: any;
  acknowledged?: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

// In-memory storage for recent metrics
const recentMetrics = {
  latency: [] as { timestamp: number; model: string; latencyMs: number; category: string }[],
  throughput: [] as { timestamp: number; requestsPerMinute: number; tokensPerMinute: number }[],
  errors: [] as { timestamp: number; model: string; error: string }[],
  tokenBudget: [] as { timestamp: number; userId: string; totalTokens: number; budgetPercent: number }[],
};

// Alert thresholds
const alertThresholds = {
  latency: {
    warning: GROQ_CONFIG.performance.latencyThresholds?.acceptable || 1000, // ms
    error: GROQ_CONFIG.performance.latencyThresholds?.poor || 3000, // ms
    critical: GROQ_CONFIG.performance.latencyThresholds?.poor * 2 || 6000, // ms
  },
  throughput: {
    warning: GROQ_CONFIG.performance.throughputLimits?.requestsPerMinute * 0.8 || 80, // 80% of limit
    error: GROQ_CONFIG.performance.throughputLimits?.requestsPerMinute * 0.9 || 90, // 90% of limit
    critical: GROQ_CONFIG.performance.throughputLimits?.requestsPerMinute * 0.95 || 95, // 95% of limit
  },
  tokenBudget: {
    warning: 0.8, // 80% of budget
    error: 0.9, // 90% of budget
    critical: 0.95, // 95% of budget
  },
  errorRate: {
    warning: 0.05, // 5% error rate
    error: 0.1, // 10% error rate
    critical: 0.2, // 20% error rate
  },
};

// Cooldown periods to prevent alert spam (in milliseconds)
const alertCooldowns = {
  [AlertType.LATENCY]: 5 * 60 * 1000, // 5 minutes
  [AlertType.THROUGHPUT]: 10 * 60 * 1000, // 10 minutes
  [AlertType.ERROR_RATE]: 15 * 60 * 1000, // 15 minutes
  [AlertType.TOKEN_BUDGET]: 30 * 60 * 1000, // 30 minutes
  [AlertType.CACHE_PERFORMANCE]: 60 * 60 * 1000, // 60 minutes
};

// Last alert timestamps to implement cooldowns
const lastAlertTimestamps: Record<AlertType, Record<string, number>> = {
  [AlertType.LATENCY]: {},
  [AlertType.THROUGHPUT]: {},
  [AlertType.ERROR_RATE]: {},
  [AlertType.TOKEN_BUDGET]: {},
  [AlertType.CACHE_PERFORMANCE]: {},
};

/**
 * Tracks a latency metric and triggers alerts if thresholds are exceeded
 * 
 * @param model The model used
 * @param latencyMs The latency in milliseconds
 * @param category The latency category
 * @param metadata Additional metadata
 */
export async function trackLatency(
  model: string,
  latencyMs: number,
  category: string,
  metadata: any = {}
): Promise<void> {
  const timestamp = Date.now();
  
  // Add to recent metrics
  recentMetrics.latency.push({ timestamp, model, latencyMs, category });
  
  // Keep only recent metrics (last hour)
  const oneHourAgo = timestamp - 60 * 60 * 1000;
  recentMetrics.latency = recentMetrics.latency.filter(m => m.timestamp >= oneHourAgo);
  
  // Check if latency exceeds thresholds
  let severity: AlertSeverity | null = null;
  
  if (latencyMs >= alertThresholds.latency.critical) {
    severity = AlertSeverity.CRITICAL;
  } else if (latencyMs >= alertThresholds.latency.error) {
    severity = AlertSeverity.ERROR;
  } else if (latencyMs >= alertThresholds.latency.warning) {
    severity = AlertSeverity.WARNING;
  }
  
  // If threshold exceeded, create alert
  if (severity) {
    const alertKey = `${model}-${category}`;
    const lastAlertTime = lastAlertTimestamps[AlertType.LATENCY][alertKey] || 0;
    
    // Check if we're in cooldown period
    if (timestamp - lastAlertTime >= alertCooldowns[AlertType.LATENCY]) {
      // Create alert
      const alert: PerformanceAlert = {
        type: AlertType.LATENCY,
        severity,
        message: `High latency detected for ${model}: ${latencyMs}ms (${category})`,
        timestamp: new Date(timestamp),
        metadata: {
          model,
          latencyMs,
          category,
          threshold: getThresholdForSeverity(alertThresholds.latency, severity),
          ...metadata,
        },
      };
      
      // Store alert
      await createAlert(alert);
      
      // Update last alert timestamp
      lastAlertTimestamps[AlertType.LATENCY][alertKey] = timestamp;
    }
  }
}

/**
 * Tracks throughput metrics and triggers alerts if thresholds are exceeded
 * 
 * @param requestsPerMinute The number of requests per minute
 * @param tokensPerMinute The number of tokens per minute
 * @param metadata Additional metadata
 */
export async function trackThroughput(
  requestsPerMinute: number,
  tokensPerMinute: number,
  metadata: any = {}
): Promise<void> {
  const timestamp = Date.now();
  
  // Add to recent metrics
  recentMetrics.throughput.push({ timestamp, requestsPerMinute, tokensPerMinute });
  
  // Keep only recent metrics (last hour)
  const oneHourAgo = timestamp - 60 * 60 * 1000;
  recentMetrics.throughput = recentMetrics.throughput.filter(m => m.timestamp >= oneHourAgo);
  
  // Check if throughput exceeds thresholds
  let severity: AlertSeverity | null = null;
  
  if (requestsPerMinute >= alertThresholds.throughput.critical) {
    severity = AlertSeverity.CRITICAL;
  } else if (requestsPerMinute >= alertThresholds.throughput.error) {
    severity = AlertSeverity.ERROR;
  } else if (requestsPerMinute >= alertThresholds.throughput.warning) {
    severity = AlertSeverity.WARNING;
  }
  
  // If threshold exceeded, create alert
  if (severity) {
    const alertKey = 'throughput';
    const lastAlertTime = lastAlertTimestamps[AlertType.THROUGHPUT][alertKey] || 0;
    
    // Check if we're in cooldown period
    if (timestamp - lastAlertTime >= alertCooldowns[AlertType.THROUGHPUT]) {
      // Create alert
      const alert: PerformanceAlert = {
        type: AlertType.THROUGHPUT,
        severity,
        message: `High throughput detected: ${requestsPerMinute} req/min, ${tokensPerMinute} tokens/min`,
        timestamp: new Date(timestamp),
        metadata: {
          requestsPerMinute,
          tokensPerMinute,
          requestLimit: GROQ_CONFIG.performance.throughputLimits?.requestsPerMinute,
          tokenLimit: GROQ_CONFIG.performance.throughputLimits?.tokensPerMinute,
          requestPercent: (requestsPerMinute / (GROQ_CONFIG.performance.throughputLimits?.requestsPerMinute || 100)) * 100,
          tokenPercent: (tokensPerMinute / (GROQ_CONFIG.performance.throughputLimits?.tokensPerMinute || 100000)) * 100,
          threshold: getThresholdForSeverity(alertThresholds.throughput, severity),
          ...metadata,
        },
      };
      
      // Store alert
      await createAlert(alert);
      
      // Update last alert timestamp
      lastAlertTimestamps[AlertType.THROUGHPUT][alertKey] = timestamp;
    }
  }
}

/**
 * Tracks token budget usage and triggers alerts if thresholds are exceeded
 * 
 * @param userId The user ID
 * @param totalTokens The total tokens used
 * @param budgetPercent The percentage of budget used
 * @param metadata Additional metadata
 */
export async function trackTokenBudget(
  userId: string,
  totalTokens: number,
  budgetPercent: number,
  metadata: any = {}
): Promise<void> {
  const timestamp = Date.now();
  
  // Add to recent metrics
  recentMetrics.tokenBudget.push({ timestamp, userId, totalTokens, budgetPercent });
  
  // Keep only recent metrics (last day)
  const oneDayAgo = timestamp - 24 * 60 * 60 * 1000;
  recentMetrics.tokenBudget = recentMetrics.tokenBudget.filter(m => m.timestamp >= oneDayAgo);
  
  // Check if budget usage exceeds thresholds
  let severity: AlertSeverity | null = null;
  
  if (budgetPercent >= alertThresholds.tokenBudget.critical * 100) {
    severity = AlertSeverity.CRITICAL;
  } else if (budgetPercent >= alertThresholds.tokenBudget.error * 100) {
    severity = AlertSeverity.ERROR;
  } else if (budgetPercent >= alertThresholds.tokenBudget.warning * 100) {
    severity = AlertSeverity.WARNING;
  }
  
  // If threshold exceeded, create alert
  if (severity) {
    const alertKey = userId;
    const lastAlertTime = lastAlertTimestamps[AlertType.TOKEN_BUDGET][alertKey] || 0;
    
    // Check if we're in cooldown period
    if (timestamp - lastAlertTime >= alertCooldowns[AlertType.TOKEN_BUDGET]) {
      // Create alert
      const alert: PerformanceAlert = {
        type: AlertType.TOKEN_BUDGET,
        severity,
        message: `High token budget usage for user ${userId}: ${budgetPercent.toFixed(2)}% (${totalTokens} tokens)`,
        timestamp: new Date(timestamp),
        metadata: {
          userId,
          totalTokens,
          budgetPercent,
          threshold: getThresholdForSeverity(alertThresholds.tokenBudget, severity) * 100,
          ...metadata,
        },
      };
      
      // Store alert
      await createAlert(alert);
      
      // Update last alert timestamp
      lastAlertTimestamps[AlertType.TOKEN_BUDGET][alertKey] = timestamp;
    }
  }
}

/**
 * Tracks error rates and triggers alerts if thresholds are exceeded
 * 
 * @param model The model used
 * @param error The error message
 * @param metadata Additional metadata
 */
export async function trackError(
  model: string,
  error: string,
  metadata: any = {}
): Promise<void> {
  const timestamp = Date.now();
  
  // Add to recent metrics
  recentMetrics.errors.push({ timestamp, model, error });
  
  // Keep only recent metrics (last hour)
  const oneHourAgo = timestamp - 60 * 60 * 1000;
  recentMetrics.errors = recentMetrics.errors.filter(m => m.timestamp >= oneHourAgo);
  
  // Calculate error rate for this model
  const modelErrors = recentMetrics.errors.filter(m => m.model === model && m.timestamp >= oneHourAgo);
  const totalRequests = recentMetrics.latency.filter(m => m.model === model && m.timestamp >= oneHourAgo).length;
  
  if (totalRequests === 0) {
    return; // No requests to calculate error rate
  }
  
  const errorRate = modelErrors.length / totalRequests;
  
  // Check if error rate exceeds thresholds
  let severity: AlertSeverity | null = null;
  
  if (errorRate >= alertThresholds.errorRate.critical) {
    severity = AlertSeverity.CRITICAL;
  } else if (errorRate >= alertThresholds.errorRate.error) {
    severity = AlertSeverity.ERROR;
  } else if (errorRate >= alertThresholds.errorRate.warning) {
    severity = AlertSeverity.WARNING;
  }
  
  // If threshold exceeded, create alert
  if (severity) {
    const alertKey = model;
    const lastAlertTime = lastAlertTimestamps[AlertType.ERROR_RATE][alertKey] || 0;
    
    // Check if we're in cooldown period
    if (timestamp - lastAlertTime >= alertCooldowns[AlertType.ERROR_RATE]) {
      // Create alert
      const alert: PerformanceAlert = {
        type: AlertType.ERROR_RATE,
        severity,
        message: `High error rate detected for ${model}: ${(errorRate * 100).toFixed(2)}%`,
        timestamp: new Date(timestamp),
        metadata: {
          model,
          errorRate,
          errorCount: modelErrors.length,
          totalRequests,
          recentErrors: modelErrors.slice(-5).map(e => e.error), // Include last 5 errors
          threshold: getThresholdForSeverity(alertThresholds.errorRate, severity),
          ...metadata,
        },
      };
      
      // Store alert
      await createAlert(alert);
      
      // Update last alert timestamp
      lastAlertTimestamps[AlertType.ERROR_RATE][alertKey] = timestamp;
    }
  }
}

/**
 * Creates a performance alert and sends notifications
 * 
 * @param alert The alert to create
 * @returns The created alert
 */
async function createAlert(alert: PerformanceAlert): Promise<PerformanceAlert> {
  try {
    // Log the alert
    await LoggingService.logSystemEvent({
      message: alert.message,
      level: alert.severity,
      category: 'AI_PERFORMANCE_ALERT',
      source: 'performance-alerts',
      tags: ['ai', 'alert', alert.type.toLowerCase(), alert.severity.toLowerCase()],
      metadata: alert.metadata,
    });
    
    // Store in database
    const dbAlert = await prisma.performanceAlert.create({
      data: {
        type: alert.type,
        severity: alert.severity,
        message: alert.message,
        metadata: alert.metadata,
      },
    });
    
    // Send notification based on severity
    if (alert.severity === AlertSeverity.ERROR || alert.severity === AlertSeverity.CRITICAL) {
      await sendNotification({
        title: `[${alert.severity}] AI Performance Alert`,
        message: alert.message,
        type: 'PERFORMANCE_ALERT',
        severity: alert.severity,
        metadata: {
          alertId: dbAlert.id,
          alertType: alert.type,
          ...alert.metadata,
        },
        recipients: ['admin'], // Send to admins
      });
    }
    
    return {
      ...alert,
      id: dbAlert.id,
    };
  } catch (error) {
    console.error('Error creating performance alert:', error);
    return alert;
  }
}

/**
 * Gets the threshold value for a given severity
 */
function getThresholdForSeverity(
  thresholds: { warning: number; error: number; critical: number },
  severity: AlertSeverity
): number {
  switch (severity) {
    case AlertSeverity.WARNING:
      return thresholds.warning;
    case AlertSeverity.ERROR:
      return thresholds.error;
    case AlertSeverity.CRITICAL:
      return thresholds.critical;
    default:
      return 0;
  }
}

/**
 * Gets all active alerts
 * 
 * @returns Active alerts
 */
export async function getActiveAlerts(): Promise<PerformanceAlert[]> {
  try {
    const alerts = await prisma.performanceAlert.findMany({
      where: {
        acknowledged: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return alerts.map(alert => ({
      id: alert.id,
      type: alert.type as AlertType,
      severity: alert.severity as AlertSeverity,
      message: alert.message,
      timestamp: alert.createdAt,
      metadata: alert.metadata,
      acknowledged: alert.acknowledged,
      acknowledgedBy: alert.acknowledgedBy,
      acknowledgedAt: alert.acknowledgedAt,
    }));
  } catch (error) {
    console.error('Error getting active alerts:', error);
    return [];
  }
}

/**
 * Acknowledges an alert
 * 
 * @param alertId The alert ID
 * @param userId The user ID acknowledging the alert
 * @returns The acknowledged alert
 */
export async function acknowledgeAlert(
  alertId: string,
  userId: string
): Promise<PerformanceAlert | null> {
  try {
    const alert = await prisma.performanceAlert.update({
      where: { id: alertId },
      data: {
        acknowledged: true,
        acknowledgedBy: userId,
        acknowledgedAt: new Date(),
      },
    });
    
    return {
      id: alert.id,
      type: alert.type as AlertType,
      severity: alert.severity as AlertSeverity,
      message: alert.message,
      timestamp: alert.createdAt,
      metadata: alert.metadata,
      acknowledged: alert.acknowledged,
      acknowledgedBy: alert.acknowledgedBy,
      acknowledgedAt: alert.acknowledgedAt,
    };
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    return null;
  }
}
