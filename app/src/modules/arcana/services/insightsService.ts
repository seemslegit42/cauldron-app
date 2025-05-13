/**
 * Arcana Module - Insights Service
 * 
 * This service generates insights from metrics data and provides
 * functions for analyzing trends and patterns.
 */

import { BusinessMetric, Recommendation, UserContext } from '../types';

/**
 * Generates insights from metrics data
 * @param metrics - Business metrics
 * @param userContext - User context data
 * @returns Array of insights
 */
export const generateInsightsFromMetrics = (
  metrics: BusinessMetric[],
  userContext?: UserContext
): Array<{
  id: string;
  title: string;
  description: string;
  category: string;
  importance: 'low' | 'medium' | 'high';
  relatedMetrics: string[];
}> => {
  if (!metrics || metrics.length === 0) return [];
  
  const insights = [];
  
  // Find metrics with significant trends
  const significantTrends = metrics.filter(m => Math.abs(m.trend || 0) > 10);
  if (significantTrends.length > 0) {
    for (const metric of significantTrends) {
      insights.push({
        id: `trend-${metric.id}`,
        title: `Significant ${metric.trend && metric.trend > 0 ? 'increase' : 'decrease'} in ${metric.name}`,
        description: `${metric.name} has ${metric.trend && metric.trend > 0 ? 'increased' : 'decreased'} by ${Math.abs(metric.trend || 0)}% compared to the previous period.`,
        category: metric.category,
        importance: Math.abs(metric.trend || 0) > 20 ? 'high' : 'medium',
        relatedMetrics: [metric.id]
      });
    }
  }
  
  // Find correlations between metrics
  const correlations = findCorrelations(metrics);
  for (const correlation of correlations) {
    insights.push({
      id: `correlation-${correlation.metric1Id}-${correlation.metric2Id}`,
      title: `Correlation between ${correlation.metric1Name} and ${correlation.metric2Name}`,
      description: `There appears to be a ${correlation.strength} ${correlation.type} correlation between ${correlation.metric1Name} and ${correlation.metric2Name}.`,
      category: 'analysis',
      importance: correlation.strength === 'strong' ? 'high' : 'medium',
      relatedMetrics: [correlation.metric1Id, correlation.metric2Id]
    });
  }
  
  // Find anomalies in metrics
  const anomalies = findAnomalies(metrics);
  for (const anomaly of anomalies) {
    insights.push({
      id: `anomaly-${anomaly.metricId}`,
      title: `Anomaly detected in ${anomaly.metricName}`,
      description: `${anomaly.metricName} shows an unusual pattern: ${anomaly.description}`,
      category: anomaly.category,
      importance: 'high',
      relatedMetrics: [anomaly.metricId]
    });
  }
  
  // Generate category-specific insights
  const categoryInsights = generateCategoryInsights(metrics, userContext);
  insights.push(...categoryInsights);
  
  return insights;
};

/**
 * Finds correlations between metrics
 * @param metrics - Business metrics
 * @returns Array of correlations
 */
const findCorrelations = (metrics: BusinessMetric[]): Array<{
  metric1Id: string;
  metric2Id: string;
  metric1Name: string;
  metric2Name: string;
  type: 'positive' | 'negative';
  strength: 'weak' | 'moderate' | 'strong';
}> => {
  // In a real implementation, this would use statistical analysis
  // For this example, we'll return some sample correlations
  
  // Find metrics with trends
  const metricsWithTrends = metrics.filter(m => m.trend !== undefined);
  if (metricsWithTrends.length < 2) return [];
  
  const correlations = [];
  
  // Simple correlation detection based on trend direction
  for (let i = 0; i < metricsWithTrends.length; i++) {
    for (let j = i + 1; j < metricsWithTrends.length; j++) {
      const metric1 = metricsWithTrends[i];
      const metric2 = metricsWithTrends[j];
      
      // Skip metrics in the same category for more interesting insights
      if (metric1.category === metric2.category) continue;
      
      const trend1 = metric1.trend || 0;
      const trend2 = metric2.trend || 0;
      
      // Determine correlation type
      const type = (trend1 > 0 && trend2 > 0) || (trend1 < 0 && trend2 < 0) 
        ? 'positive' 
        : 'negative';
      
      // Determine correlation strength
      const trendProduct = Math.abs(trend1 * trend2);
      let strength: 'weak' | 'moderate' | 'strong';
      
      if (trendProduct > 200) strength = 'strong';
      else if (trendProduct > 50) strength = 'moderate';
      else strength = 'weak';
      
      correlations.push({
        metric1Id: metric1.id,
        metric2Id: metric2.id,
        metric1Name: metric1.name,
        metric2Name: metric2.name,
        type,
        strength
      });
    }
  }
  
  return correlations;
};

/**
 * Finds anomalies in metrics
 * @param metrics - Business metrics
 * @returns Array of anomalies
 */
const findAnomalies = (metrics: BusinessMetric[]): Array<{
  metricId: string;
  metricName: string;
  category: string;
  description: string;
}> => {
  // In a real implementation, this would use statistical analysis
  // For this example, we'll return some sample anomalies
  
  const anomalies = [];
  
  for (const metric of metrics) {
    // Example: Detect large changes
    if (metric.trend && Math.abs(metric.trend) > 30) {
      anomalies.push({
        metricId: metric.id,
        metricName: metric.name,
        category: metric.category,
        description: `Unusually large ${metric.trend > 0 ? 'increase' : 'decrease'} of ${Math.abs(metric.trend)}%`
      });
    }
    
    // Example: Detect unusual values
    if (metric.category === 'business' && metric.name === 'Conversion Rate' && parseFloat(metric.value.toString()) < 1) {
      anomalies.push({
        metricId: metric.id,
        metricName: metric.name,
        category: metric.category,
        description: 'Conversion rate has dropped below 1%, which is significantly below industry average'
      });
    }
  }
  
  return anomalies;
};

/**
 * Generates category-specific insights
 * @param metrics - Business metrics
 * @param userContext - User context data
 * @returns Array of category insights
 */
const generateCategoryInsights = (
  metrics: BusinessMetric[],
  userContext?: UserContext
): Array<{
  id: string;
  title: string;
  description: string;
  category: string;
  importance: 'low' | 'medium' | 'high';
  relatedMetrics: string[];
}> => {
  const insights = [];
  
  // Group metrics by category
  const metricsByCategory: Record<string, BusinessMetric[]> = {};
  for (const metric of metrics) {
    if (!metricsByCategory[metric.category]) {
      metricsByCategory[metric.category] = [];
    }
    metricsByCategory[metric.category].push(metric);
  }
  
  // Generate business insights
  if (metricsByCategory.business && metricsByCategory.business.length > 0) {
    const revenueMetric = metricsByCategory.business.find(m => m.name === 'Revenue');
    const conversionMetric = metricsByCategory.business.find(m => m.name === 'Conversion Rate');
    const usersMetric = metricsByCategory.business.find(m => m.name === 'Active Users');
    
    if (revenueMetric && conversionMetric && revenueMetric.trend && conversionMetric.trend) {
      if (revenueMetric.trend > 0 && conversionMetric.trend < 0) {
        insights.push({
          id: 'business-insight-1',
          title: 'Revenue growing despite conversion decline',
          description: 'Your revenue is growing while conversion rates are declining. This suggests higher value per customer or increased pricing.',
          category: 'business',
          importance: 'medium',
          relatedMetrics: [revenueMetric.id, conversionMetric.id]
        });
      }
    }
    
    if (revenueMetric && usersMetric && revenueMetric.trend && usersMetric.trend) {
      if (revenueMetric.trend < usersMetric.trend) {
        insights.push({
          id: 'business-insight-2',
          title: 'User growth outpacing revenue',
          description: 'Your user base is growing faster than revenue. Consider strategies to increase revenue per user.',
          category: 'business',
          importance: 'high',
          relatedMetrics: [revenueMetric.id, usersMetric.id]
        });
      }
    }
  }
  
  // Generate security insights
  if (metricsByCategory.security && metricsByCategory.security.length > 0) {
    const securityScoreMetric = metricsByCategory.security.find(m => m.name === 'Security Score');
    const vulnerabilitiesMetric = metricsByCategory.security.find(m => m.name === 'Vulnerabilities');
    
    if (securityScoreMetric && vulnerabilitiesMetric && vulnerabilitiesMetric.trend && vulnerabilitiesMetric.trend > 0) {
      insights.push({
        id: 'security-insight-1',
        title: 'Increasing security vulnerabilities',
        description: 'The number of vulnerabilities is increasing. Consider prioritizing security updates and patches.',
        category: 'security',
        importance: 'high',
        relatedMetrics: [securityScoreMetric.id, vulnerabilitiesMetric.id]
      });
    }
  }
  
  // Generate social insights
  if (metricsByCategory.social && metricsByCategory.social.length > 0) {
    const engagementMetric = metricsByCategory.social.find(m => m.name === 'Engagement');
    const followersMetric = metricsByCategory.social.find(m => m.name === 'Followers');
    
    if (engagementMetric && followersMetric && engagementMetric.trend && followersMetric.trend) {
      if (engagementMetric.trend < 0 && followersMetric.trend > 0) {
        insights.push({
          id: 'social-insight-1',
          title: 'Declining engagement despite follower growth',
          description: 'Your follower count is growing, but engagement is declining. This may indicate a need to revise your content strategy.',
          category: 'social',
          importance: 'medium',
          relatedMetrics: [engagementMetric.id, followersMetric.id]
        });
      }
    }
  }
  
  return insights;
};

/**
 * Generates recommendations based on insights
 * @param insights - Generated insights
 * @returns Array of recommendations
 */
export const generateRecommendationsFromInsights = (
  insights: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    importance: 'low' | 'medium' | 'high';
    relatedMetrics: string[];
  }>
): Recommendation[] => {
  return insights.map(insight => {
    // Convert insight importance to recommendation priority
    const priority = insight.importance as 'low' | 'medium' | 'high';
    
    // Generate actions based on insight category
    let actions: string[] = [];
    
    switch (insight.category) {
      case 'business':
        actions = [
          'Review pricing strategy',
          'Analyze customer acquisition costs',
          'Optimize conversion funnel'
        ];
        break;
      case 'security':
        actions = [
          'Run a comprehensive security scan',
          'Update vulnerable dependencies',
          'Review access controls'
        ];
        break;
      case 'social':
        actions = [
          'Revise content strategy',
          'Analyze engagement patterns',
          'Test different content formats'
        ];
        break;
      case 'media':
        actions = [
          'Optimize content for better engagement',
          'Analyze top-performing content',
          'Develop a content calendar'
        ];
        break;
      default:
        actions = [
          'Analyze the data further',
          'Monitor the trend over time',
          'Develop a response strategy'
        ];
    }
    
    return {
      id: `rec-${insight.id}`,
      title: insight.title,
      description: insight.description,
      actions,
      priority,
      category: insight.category,
      source: 'insights',
      timestamp: new Date(),
    };
  });
};
