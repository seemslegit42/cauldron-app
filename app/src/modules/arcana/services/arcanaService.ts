/**
 * Arcana Module - Data Processing Service
 * 
 * This service handles data processing and transformation for the Arcana dashboard.
 * It provides functions for working with metrics, recommendations, and user context.
 */

import { BusinessMetric, Recommendation, UserContext, SecurityMetrics, Workflow } from '../types';

/**
 * Processes raw metrics data and calculates additional derived metrics
 * @param metrics - Raw metrics data
 * @returns Processed metrics with calculated fields
 */
export const processMetrics = (metrics: BusinessMetric[]): BusinessMetric[] => {
  return metrics.map(metric => {
    // Add any calculated fields or transformations
    return {
      ...metric,
      // Example: Add a formatted display value
      displayValue: formatMetricValue(metric.value, metric.unit),
      // Example: Add a trend indicator
      trendIndicator: getTrendIndicator(metric.trend || 0)
    };
  });
};

/**
 * Formats a metric value for display
 * @param value - Raw metric value
 * @param unit - Unit of measurement
 * @returns Formatted value as string
 */
export const formatMetricValue = (value: number | string, unit?: string): string => {
  if (typeof value === 'string') {
    return unit ? `${value}${unit}` : value;
  }

  // Format numbers based on size
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M${unit || ''}`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K${unit || ''}`;
  }

  return unit ? `${value}${unit}` : `${value}`;
};

/**
 * Gets a trend indicator based on the trend value
 * @param trend - Trend value (percentage)
 * @returns Trend indicator string
 */
export const getTrendIndicator = (trend: number): string => {
  if (trend > 5) return 'strong-increase';
  if (trend > 0) return 'increase';
  if (trend < -5) return 'strong-decrease';
  if (trend < 0) return 'decrease';
  return 'stable';
};

/**
 * Filters metrics by category
 * @param metrics - All metrics
 * @param category - Category to filter by
 * @returns Filtered metrics
 */
export const filterMetricsByCategory = (
  metrics: BusinessMetric[],
  category: string
): BusinessMetric[] => {
  return metrics.filter(metric => metric.category === category);
};

/**
 * Sorts metrics by priority
 * @param metrics - Metrics to sort
 * @param priorityOrder - Array of metric IDs in priority order
 * @returns Sorted metrics
 */
export const sortMetricsByPriority = (
  metrics: BusinessMetric[],
  priorityOrder: string[] = []
): BusinessMetric[] => {
  return [...metrics].sort((a, b) => {
    const aIndex = priorityOrder.indexOf(a.id);
    const bIndex = priorityOrder.indexOf(b.id);
    
    // If both metrics are in the priority list, sort by their position
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    
    // If only one metric is in the priority list, it comes first
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    
    // Otherwise, sort alphabetically by name
    return a.name.localeCompare(b.name);
  });
};

/**
 * Prioritizes recommendations based on user context and preferences
 * @param recommendations - All recommendations
 * @param userContext - User context data
 * @returns Prioritized recommendations
 */
export const prioritizeRecommendations = (
  recommendations: Recommendation[],
  userContext?: UserContext
): Recommendation[] => {
  if (!userContext) return recommendations;

  // Get user preferences
  const preferences = userContext.preferences || {};
  const persona = userContext.persona || 'hacker-ceo';
  
  // Define category weights based on persona
  const categoryWeights: Record<string, number> = {
    'hacker-ceo': {
      security: 0.4,
      business: 0.3,
      content: 0.1,
      social: 0.2
    },
    'podcast-mogul': {
      security: 0.1,
      business: 0.2,
      content: 0.5,
      social: 0.2
    },
    'enterprise-admin': {
      security: 0.3,
      business: 0.4,
      content: 0.1,
      social: 0.2
    }
  }[persona as string] || {
    security: 0.25,
    business: 0.25,
    content: 0.25,
    social: 0.25
  };
  
  // Calculate a score for each recommendation
  const scoredRecommendations = recommendations.map(rec => {
    // Base score from priority
    let score = rec.priority === 'high' ? 3 : rec.priority === 'medium' ? 2 : 1;
    
    // Adjust by category weight
    score *= categoryWeights[rec.category] || 0.25;
    
    // Adjust by user preferences if available
    if (preferences.preferredCategories && preferences.preferredCategories.includes(rec.category)) {
      score *= 1.5;
    }
    
    return { ...rec, score };
  });
  
  // Sort by score (descending)
  return scoredRecommendations.sort((a, b) => (b.score || 0) - (a.score || 0));
};

/**
 * Calculates overall security score from security metrics
 * @param metrics - Security metrics
 * @returns Overall security score (0-100)
 */
export const calculateSecurityScore = (metrics: SecurityMetrics): number => {
  if (!metrics) return 0;
  
  // Example scoring algorithm
  const scores = {
    vulnerabilities: Math.max(0, 100 - metrics.vulnerabilities * 5),
    threatsBlocked: Math.min(100, metrics.threatsBlocked / 10),
    criticalAlerts: Math.max(0, 100 - metrics.criticalAlerts * 10),
    threatDetection: metrics.threatDetection || 0,
    responseTime: metrics.responseTime ? 
      (metrics.responseTime.includes('min') ? 80 : 50) : 0
  };
  
  // Calculate weighted average
  return Math.round(
    (scores.vulnerabilities * 0.3) +
    (scores.threatsBlocked * 0.2) +
    (scores.criticalAlerts * 0.3) +
    (scores.threatDetection * 0.1) +
    (scores.responseTime * 0.1)
  );
};

/**
 * Determines risk level based on security metrics
 * @param metrics - Security metrics
 * @returns Risk level (green, yellow, red)
 */
export const determineRiskLevel = (metrics: SecurityMetrics): 'green' | 'yellow' | 'red' => {
  const score = calculateSecurityScore(metrics);
  
  if (score >= 80) return 'green';
  if (score >= 60) return 'yellow';
  return 'red';
};

/**
 * Filters workflows by status
 * @param workflows - All workflows
 * @param status - Status to filter by
 * @returns Filtered workflows
 */
export const filterWorkflowsByStatus = (
  workflows: Workflow[],
  status: 'active' | 'paused' | 'completed' | 'failed'
): Workflow[] => {
  return workflows.filter(workflow => workflow.status === status);
};

/**
 * Gets the most important metrics based on user context
 * @param metrics - All metrics
 * @param userContext - User context data
 * @param count - Number of metrics to return
 * @returns Most important metrics
 */
export const getImportantMetrics = (
  metrics: BusinessMetric[],
  userContext?: UserContext,
  count: number = 3
): BusinessMetric[] => {
  if (!metrics || metrics.length === 0) return [];
  
  // Define importance criteria based on persona
  const persona = userContext?.persona || 'hacker-ceo';
  
  // Sort metrics by importance
  const sortedMetrics = [...metrics].sort((a, b) => {
    // First, prioritize by absolute trend value
    const aTrend = Math.abs(a.trend || 0);
    const bTrend = Math.abs(b.trend || 0);
    
    if (aTrend !== bTrend) {
      return bTrend - aTrend;
    }
    
    // Then, prioritize by category based on persona
    const categoryPriority: Record<string, Record<string, number>> = {
      'hacker-ceo': {
        security: 4,
        business: 3,
        social: 2,
        media: 1
      },
      'podcast-mogul': {
        media: 4,
        social: 3,
        business: 2,
        security: 1
      },
      'enterprise-admin': {
        business: 4,
        security: 3,
        media: 2,
        social: 1
      }
    };
    
    const aPriority = categoryPriority[persona]?.[a.category] || 0;
    const bPriority = categoryPriority[persona]?.[b.category] || 0;
    
    return bPriority - aPriority;
  });
  
  return sortedMetrics.slice(0, count);
};
