import React, { useState, useCallback } from 'react';
import { AgentChat } from '../../shared/components/ai/AgentChat';
import { AIFunction } from '../../shared/ai/vercel-ai-utils';
import { useToast } from '../../shared/hooks/useToast';
import { getMetrics } from '../services/metricsService';
import { analyzeTrend } from '../services/trendAnalysisService';
import { generateForecast } from '../services/forecastService';

interface BusinessIntelligenceAssistantProps {
  minimized?: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
  className?: string;
}

/**
 * BusinessIntelligenceAssistant component for the Athena module
 * Provides business intelligence AI assistance with function calling capabilities
 */
export const BusinessIntelligenceAssistant: React.FC<BusinessIntelligenceAssistantProps> = ({
  minimized = false,
  onMinimize,
  onMaximize,
  className,
}) => {
  const { toast } = useToast();
  const [metricsData, setMetricsData] = useState<any>(null);
  const [trendAnalysis, setTrendAnalysis] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any>(null);

  // Define business intelligence functions that the AI can call
  const businessFunctions: AIFunction[] = [
    {
      name: 'getMetrics',
      description: 'Get business metrics for a specific time period',
      parameters: {
        type: 'object',
        properties: {
          metricType: {
            type: 'string',
            description: 'The type of metric to retrieve (e.g., "revenue", "users", "conversion", "engagement", "churn")',
          },
          timeframe: {
            type: 'string',
            description: 'The timeframe for the metrics (e.g., "daily", "weekly", "monthly", "quarterly", "yearly")',
          },
          period: {
            type: 'string',
            description: 'The specific period to analyze (e.g., "last_7_days", "last_30_days", "last_quarter", "ytd")',
          },
          segment: {
            type: 'string',
            description: 'Optional segment to filter by (e.g., "region", "product", "channel")',
          },
        },
        required: ['metricType', 'timeframe'],
      },
    },
    {
      name: 'analyzeTrend',
      description: 'Analyze trends in business data',
      parameters: {
        type: 'object',
        properties: {
          dataType: {
            type: 'string',
            description: 'The type of data to analyze (e.g., "revenue", "users", "conversion", "engagement")',
          },
          timeRange: {
            type: 'string',
            description: 'The time range for analysis (e.g., "last_quarter", "last_year", "ytd")',
          },
          comparisonPeriod: {
            type: 'string',
            description: 'Optional period to compare against (e.g., "previous_period", "same_period_last_year")',
          },
          segment: {
            type: 'string',
            description: 'Optional segment to analyze (e.g., "region", "product", "channel")',
          },
        },
        required: ['dataType', 'timeRange'],
      },
    },
    {
      name: 'generateForecast',
      description: 'Generate a forecast for business metrics',
      parameters: {
        type: 'object',
        properties: {
          metricType: {
            type: 'string',
            description: 'The type of metric to forecast (e.g., "revenue", "users", "conversion", "churn")',
          },
          forecastPeriod: {
            type: 'string',
            description: 'The period to forecast (e.g., "next_month", "next_quarter", "next_year")',
          },
          scenario: {
            type: 'string',
            description: 'The forecast scenario (e.g., "baseline", "optimistic", "pessimistic")',
          },
          includeConfidenceIntervals: {
            type: 'boolean',
            description: 'Whether to include confidence intervals in the forecast',
          },
        },
        required: ['metricType', 'forecastPeriod'],
      },
    },
  ];

  // Handle function calls from the AI
  const handleFunctionCall = useCallback(async (functionCall: { name: string; arguments: any }) => {
    const { name, arguments: args } = functionCall;
    
    try {
      switch (name) {
        case 'getMetrics': {
          toast({
            title: 'Retrieving Metrics',
            description: `Getting ${args.metricType} metrics for ${args.timeframe}...`,
            variant: 'default',
          });
          
          const metrics = await getMetrics(args.metricType, args.timeframe, args.period, args.segment);
          setMetricsData(metrics);
          
          return JSON.stringify({
            status: 'success',
            metrics: {
              metricType: metrics.metricType,
              timeframe: metrics.timeframe,
              period: metrics.period,
              currentValue: metrics.currentValue,
              previousValue: metrics.previousValue,
              changePercentage: metrics.changePercentage,
              trend: metrics.trend,
              summary: metrics.summary,
            },
          });
        }
        
        case 'analyzeTrend': {
          toast({
            title: 'Analyzing Trend',
            description: `Analyzing ${args.dataType} trends for ${args.timeRange}...`,
            variant: 'default',
          });
          
          const analysis = await analyzeTrend(args.dataType, args.timeRange, args.comparisonPeriod, args.segment);
          setTrendAnalysis(analysis);
          
          return JSON.stringify({
            status: 'success',
            analysis: {
              dataType: analysis.dataType,
              timeRange: analysis.timeRange,
              trendDirection: analysis.trendDirection,
              changeRate: analysis.changeRate,
              seasonality: analysis.seasonality,
              anomalies: analysis.anomalies.length > 0,
              insights: analysis.insights,
              summary: analysis.summary,
            },
          });
        }
        
        case 'generateForecast': {
          toast({
            title: 'Generating Forecast',
            description: `Forecasting ${args.metricType} for ${args.forecastPeriod}...`,
            variant: 'default',
          });
          
          const forecast = await generateForecast(
            args.metricType, 
            args.forecastPeriod, 
            args.scenario, 
            args.includeConfidenceIntervals
          );
          setForecastData(forecast);
          
          return JSON.stringify({
            status: 'success',
            forecast: {
              metricType: forecast.metricType,
              forecastPeriod: forecast.forecastPeriod,
              scenario: forecast.scenario,
              predictedValue: forecast.predictedValue,
              growthRate: forecast.growthRate,
              confidenceLevel: forecast.confidenceLevel,
              keyDrivers: forecast.keyDrivers,
              summary: forecast.summary,
            },
          });
        }
        
        default:
          return JSON.stringify({
            status: 'error',
            message: `Unknown function: ${name}`,
          });
      }
    } catch (error) {
      console.error(`Error executing function ${name}:`, error);
      return JSON.stringify({
        status: 'error',
        message: error.message || 'An error occurred',
      });
    }
  }, [toast]);

  return (
    <AgentChat
      agentName="Business Intelligence Assistant"
      module="athena"
      systemPrompt={`You are the Athena Business Intelligence Assistant, a data analysis expert for the Cauldron platform.
You analyze business metrics, identify trends, and provide strategic recommendations.
Your insights are data-driven, actionable, and focused on business growth.
Present information clearly with a focus on metrics that matter.

You have access to business intelligence tools through function calling:
1. getMetrics - Retrieve business metrics for specific time periods
2. analyzeTrend - Analyze trends in business data
3. generateForecast - Generate forecasts for business metrics

Always provide clear explanations of business concepts and actionable recommendations.
When appropriate, offer to retrieve metrics or analyze trends to provide more specific insights.`}
      minimized={minimized}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className={className}
      functions={businessFunctions}
      onFunctionCall={handleFunctionCall}
      showLatency={true}
    />
  );
};

export default BusinessIntelligenceAssistant;
