/**
 * Metrics Service
 * 
 * This service provides functionality for retrieving business metrics.
 */

import { sentientLoop } from '../../shared/services/sentientLoopService';
import { LoggingService } from '../../shared/services/LoggingService';

interface MetricsResult {
  id: string;
  timestamp: string;
  metricType: string;
  timeframe: string;
  period: string;
  segment?: string;
  currentValue: number;
  previousValue: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'stable';
  data: { date: string; value: number }[];
  summary: string;
}

/**
 * Get business metrics for a specific time period
 * 
 * @param metricType The type of metric to retrieve
 * @param timeframe The timeframe for the metrics
 * @param period The specific period to analyze
 * @param segment Optional segment to filter by
 * @returns The metrics result
 */
export async function getMetrics(
  metricType: string,
  timeframe: string,
  period: string = 'last_30_days',
  segment?: string
): Promise<MetricsResult> {
  // Log the metrics request
  LoggingService.info({
    message: `Retrieving ${metricType} metrics for ${timeframe} (${period})`,
    module: 'athena',
    category: 'METRICS_REQUEST',
    metadata: { metricType, timeframe, period, segment }
  });
  
  // Add to Sentient Loop context
  sentientLoop.addMemory({
    type: 'action',
    module: 'athena',
    content: `Retrieved ${metricType} metrics for ${timeframe} (${period})`,
    metadata: {
      action: 'get_metrics',
      metricType,
      timeframe,
      period,
      segment,
      timestamp: new Date().toISOString()
    }
  });
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate metrics based on metric type and timeframe
  const metrics = generateMetrics(metricType, timeframe, period, segment);
  
  // Log the metrics retrieval completion
  LoggingService.info({
    message: `Completed retrieval of ${metricType} metrics`,
    module: 'athena',
    category: 'METRICS_REQUEST',
    metadata: { 
      metricsId: metrics.id,
      currentValue: metrics.currentValue,
      changePercentage: metrics.changePercentage,
      trend: metrics.trend
    }
  });
  
  return metrics;
}

/**
 * Generate metrics based on metric type and timeframe
 */
function generateMetrics(
  metricType: string,
  timeframe: string,
  period: string,
  segment?: string
): MetricsResult {
  // Base values for different metric types
  const baseValues: Record<string, number> = {
    revenue: 100000,
    users: 5000,
    conversion: 3.5,
    engagement: 65,
    churn: 2.8,
    cac: 75,
    ltv: 450,
    arpu: 35,
    retention: 78,
    sessions: 15000
  };
  
  // Get base value for the metric type or use a default
  const baseValue = baseValues[metricType.toLowerCase()] || 1000;
  
  // Generate current value with some randomness
  const currentValue = baseValue * (0.9 + Math.random() * 0.4);
  
  // Generate previous value
  let previousValue: number;
  let trend: 'up' | 'down' | 'stable';
  
  // Determine trend based on metric type
  // Some metrics are better when they go up (revenue, users)
  // Some are better when they go down (churn, cac)
  const positiveMetrics = ['revenue', 'users', 'conversion', 'engagement', 'ltv', 'arpu', 'retention'];
  const isPositiveMetric = positiveMetrics.includes(metricType.toLowerCase());
  
  // Generate trend with bias based on metric type
  const trendBias = isPositiveMetric ? 0.7 : 0.3; // 70% chance of positive trend for positive metrics
  const isPositiveTrend = Math.random() < trendBias;
  
  if (isPositiveTrend) {
    // Positive trend (value increased)
    previousValue = currentValue * (0.85 + Math.random() * 0.1);
    trend = 'up';
  } else {
    // Negative trend (value decreased)
    previousValue = currentValue * (1.05 + Math.random() * 0.1);
    trend = 'down';
  }
  
  // If the change is very small, consider it stable
  const changePercentage = ((currentValue - previousValue) / previousValue) * 100;
  if (Math.abs(changePercentage) < 1) {
    trend = 'stable';
  }
  
  // Generate time series data
  const data = generateTimeSeriesData(metricType, timeframe, period, currentValue);
  
  // Generate summary
  const summary = generateMetricSummary(metricType, currentValue, previousValue, changePercentage, trend, segment);
  
  return {
    id: `metrics-${Date.now()}`,
    timestamp: new Date().toISOString(),
    metricType,
    timeframe,
    period,
    segment,
    currentValue: parseFloat(currentValue.toFixed(2)),
    previousValue: parseFloat(previousValue.toFixed(2)),
    changePercentage: parseFloat(changePercentage.toFixed(2)),
    trend,
    data,
    summary
  };
}

/**
 * Generate time series data for metrics
 */
function generateTimeSeriesData(
  metricType: string,
  timeframe: string,
  period: string,
  currentValue: number
): { date: string; value: number }[] {
  const data: { date: string; value: number }[] = [];
  let dataPoints = 0;
  
  // Determine number of data points based on timeframe
  switch (timeframe.toLowerCase()) {
    case 'daily':
      dataPoints = period.includes('7') ? 7 : 30;
      break;
    case 'weekly':
      dataPoints = 12;
      break;
    case 'monthly':
      dataPoints = 12;
      break;
    case 'quarterly':
      dataPoints = 4;
      break;
    case 'yearly':
      dataPoints = 5;
      break;
    default:
      dataPoints = 30;
  }
  
  // Generate data points
  const today = new Date();
  const baseValue = currentValue * 0.9; // Start slightly below current value
  
  for (let i = dataPoints - 1; i >= 0; i--) {
    const date = new Date(today);
    
    // Adjust date based on timeframe
    switch (timeframe.toLowerCase()) {
      case 'daily':
        date.setDate(date.getDate() - i);
        break;
      case 'weekly':
        date.setDate(date.getDate() - (i * 7));
        break;
      case 'monthly':
        date.setMonth(date.getMonth() - i);
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() - (i * 3));
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() - i);
        break;
    }
    
    // Generate value with some randomness and trend
    const trendFactor = 1 + ((dataPoints - i) / dataPoints) * 0.2; // Gradual increase
    const randomFactor = 0.9 + Math.random() * 0.2; // ±10% randomness
    const value = baseValue * trendFactor * randomFactor;
    
    data.push({
      date: date.toISOString().split('T')[0], // YYYY-MM-DD format
      value: parseFloat(value.toFixed(2))
    });
  }
  
  return data;
}

/**
 * Generate a summary of the metrics
 */
function generateMetricSummary(
  metricType: string,
  currentValue: number,
  previousValue: number,
  changePercentage: number,
  trend: 'up' | 'down' | 'stable',
  segment?: string
): string {
  // Format values based on metric type
  let formattedCurrent = '';
  let formattedPrevious = '';
  
  switch (metricType.toLowerCase()) {
    case 'revenue':
      formattedCurrent = `$${currentValue.toLocaleString()}`;
      formattedPrevious = `$${previousValue.toLocaleString()}`;
      break;
    case 'conversion':
    case 'churn':
    case 'retention':
      formattedCurrent = `${currentValue.toFixed(1)}%`;
      formattedPrevious = `${previousValue.toFixed(1)}%`;
      break;
    case 'users':
    case 'sessions':
      formattedCurrent = currentValue.toLocaleString();
      formattedPrevious = previousValue.toLocaleString();
      break;
    default:
      formattedCurrent = currentValue.toFixed(2);
      formattedPrevious = previousValue.toFixed(2);
  }
  
  // Determine if the trend is positive or negative for the business
  const positiveMetrics = ['revenue', 'users', 'conversion', 'engagement', 'ltv', 'arpu', 'retention'];
  const isPositiveMetric = positiveMetrics.includes(metricType.toLowerCase());
  const isPositiveForBusiness = (isPositiveMetric && trend === 'up') || (!isPositiveMetric && trend === 'down');
  
  // Create segment text if provided
  const segmentText = segment ? ` for ${segment}` : '';
  
  // Create summary based on trend
  let summary = `${metricType.charAt(0).toUpperCase() + metricType.slice(1)}${segmentText} is currently at ${formattedCurrent}, `;
  
  if (trend === 'stable') {
    summary += `which is stable compared to the previous period (${formattedPrevious}).`;
  } else {
    const trendText = trend === 'up' ? 'an increase' : 'a decrease';
    summary += `${trendText} of ${Math.abs(changePercentage).toFixed(1)}% from ${formattedPrevious}. `;
    
    // Add business impact
    if (isPositiveForBusiness) {
      summary += 'This is a positive trend for the business.';
    } else {
      summary += 'This trend requires attention.';
    }
  }
  
  return summary;
}
