/**
 * Athena Module Agent Hooks
 *
 * This file contains custom hooks for the Athena business intelligence module.
 * These hooks provide access to business metrics, insights, and recommendations.
 */

import { useQuery, useAction } from 'wasp/client/operations';
import { useState, useEffect, useMemo } from 'react';
import {
  getBusinessMetrics,
  getBusinessInsights,
  getCampaignSuggestions,
  getStrategicDecisions,
  getMarketData,
  getStrategicRecommendations,
  getExecutiveSummary,
  exportToNotion,
  getExecutiveAdvice
} from 'wasp/client/operations';
import {
  BusinessMetric,
  BusinessInsight,
  BusinessRecommendation,
  CampaignSuggestion,
  StrategicDecision,
  StrategicRecommendation,
  MarketData,
  ExecutiveSummary,
  ExecutiveAdvisorOutput,
  ExecutiveAdvisorOptions,
  ExecutiveAdvisorTone,
  NotionExportOptions,
  TimeframeOption,
  MetricCategory
} from './types';

/**
 * Hook for accessing business metrics with filtering and timeframe options
 */
export const useBusinessMetrics = (options?: {
  timeframe?: TimeframeOption;
  categories?: MetricCategory[];
}) => {
  const {
    data: metrics,
    isLoading,
    error,
    refetch
  } = useQuery(getBusinessMetrics, {
    timeframe: options?.timeframe || TimeframeOption.WEEK,
    categories: options?.categories
  });

  // Group metrics by category
  const metricsByCategory = useMemo(() => {
    if (!metrics) return {};

    return metrics.reduce((acc, metric) => {
      if (!acc[metric.category]) {
        acc[metric.category] = [];
      }
      acc[metric.category].push(metric);
      return acc;
    }, {} as Record<string, BusinessMetric[]>);
  }, [metrics]);

  // Get latest metrics for each name
  const latestMetrics = useMemo(() => {
    if (!metrics) return [];

    const metricsByName: Record<string, BusinessMetric> = {};

    metrics.forEach(metric => {
      if (!metricsByName[metric.name] || new Date(metric.date) > new Date(metricsByName[metric.name].date)) {
        metricsByName[metric.name] = metric;
      }
    });

    return Object.values(metricsByName);
  }, [metrics]);

  return {
    metrics,
    metricsByCategory,
    latestMetrics,
    isLoading,
    error,
    refetch
  };
};

/**
 * Hook for accessing business insights and recommendations
 */
export const useBusinessInsights = (options?: {
  timeframe?: TimeframeOption;
  categories?: MetricCategory[];
}) => {
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery(getBusinessInsights, {
    timeframe: options?.timeframe || TimeframeOption.WEEK,
    categories: options?.categories
  });

  // Extract insights and recommendations
  const insights = data?.insights || [];
  const recommendations = data?.recommendations || [];
  const hasMemoryContext = data?.hasMemoryContext || false;

  // Group insights by category
  const insightsByCategory = useMemo(() => {
    return insights.reduce((acc, insight) => {
      if (!acc[insight.category]) {
        acc[insight.category] = [];
      }
      acc[insight.category].push(insight);
      return acc;
    }, {} as Record<string, BusinessInsight[]>);
  }, [insights]);

  // Group recommendations by category
  const recommendationsByCategory = useMemo(() => {
    return recommendations.reduce((acc, recommendation) => {
      if (!acc[recommendation.category]) {
        acc[recommendation.category] = [];
      }
      acc[recommendation.category].push(recommendation);
      return acc;
    }, {} as Record<string, BusinessRecommendation[]>);
  }, [recommendations]);

  // Get high impact insights
  const highImpactInsights = useMemo(() => {
    return insights.filter(insight =>
      insight.impact === 'high' || insight.impact === 'critical'
    );
  }, [insights]);

  return {
    insights,
    recommendations,
    insightsByCategory,
    recommendationsByCategory,
    highImpactInsights,
    hasMemoryContext,
    timeframe: data?.timeframe,
    isLoading,
    error,
    refetch
  };
};

/**
 * Hook for accessing campaign and experiment suggestions
 */
export const useCampaignSuggestions = (options?: {
  timeframe?: TimeframeOption;
  limit?: number;
}) => {
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery(getCampaignSuggestions, {
    timeframe: options?.timeframe || TimeframeOption.WEEK,
    limit: options?.limit || 5
  });

  // Extract campaigns
  const campaigns = data?.campaigns || [];

  return {
    campaigns,
    timeframe: data?.timeframe,
    isLoading,
    error,
    refetch
  };
};

/**
 * Hook for accessing strategic decision suggestions
 */
export const useStrategicDecisions = (options?: {
  timeframe?: TimeframeOption;
  limit?: number;
}) => {
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery(getStrategicDecisions, {
    timeframe: options?.timeframe || TimeframeOption.WEEK,
    limit: options?.limit || 5
  });

  // Extract decisions
  const decisions = data?.decisions || [];

  return {
    decisions,
    timeframe: data?.timeframe,
    isLoading,
    error,
    refetch
  };
};

/**
 * Hook for accessing market data
 */
export const useMarketData = (options?: {
  timeframe?: TimeframeOption;
  categories?: string[];
}) => {
  const {
    data: marketData,
    isLoading,
    error,
    refetch
  } = useQuery(getMarketData, {
    timeframe: options?.timeframe || TimeframeOption.WEEK,
    categories: options?.categories
  });

  return {
    marketData,
    isLoading,
    error,
    refetch
  };
};

/**
 * Hook for accessing strategic recommendations
 */
export const useStrategicRecommendations = (options?: {
  timeframe?: TimeframeOption;
  limit?: number;
}) => {
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery(getStrategicRecommendations, {
    timeframe: options?.timeframe || TimeframeOption.WEEK,
    limit: options?.limit || 5
  });

  // Extract recommendations
  const recommendations = data?.recommendations || [];

  return {
    recommendations,
    timeframe: data?.timeframe,
    isLoading,
    error,
    refetch
  };
};

/**
 * Hook for accessing executive summary
 */
export const useExecutiveSummary = (options?: {
  timeframe?: TimeframeOption;
}) => {
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery(getExecutiveSummary, {
    timeframe: options?.timeframe || TimeframeOption.WEEK
  });

  // Extract executive summary and workflow graph ID
  const executiveSummary = data?.executiveSummary || null;
  const workflowGraphId = executiveSummary?.metadata?.workflowId || null;
  const hasMemoryContext = executiveSummary?.metadata?.hasHistoricalContext || false;

  return {
    executiveSummary,
    workflowGraphId,
    hasMemoryContext,
    timeframe: data?.timeframe,
    isLoading,
    error,
    refetch
  };
};

/**
 * Hook for exporting data to Notion
 */
export const useNotionExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<{ success: boolean; pageUrl?: string; error?: string } | null>(null);

  const exportToNotionAction = useAction(exportToNotion);

  const exportData = async (options: NotionExportOptions) => {
    setIsExporting(true);
    setExportResult(null);

    try {
      const result = await exportToNotionAction(options);
      setExportResult(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const result = { success: false, error: errorMessage };
      setExportResult(result);
      return result;
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportData,
    isExporting,
    exportResult
  };
};

/**
 * Hook for accessing the Executive Advisor
 */
export const useExecutiveAdvisor = (options?: {
  timeframe?: TimeframeOption;
  communicationStyle?: ExecutiveAdvisorTone;
  focusArea?: MetricCategory[];
  includeInvestorPitch?: boolean;
  maxSuggestions?: number;
  maxLength?: 'concise' | 'standard' | 'detailed';
}) => {
  const [communicationStyle, setCommunicationStyle] = useState<ExecutiveAdvisorTone>(
    options?.communicationStyle || ExecutiveAdvisorTone.BALANCED
  );

  const defaultOptions: ExecutiveAdvisorOptions = {
    timeframe: options?.timeframe || TimeframeOption.WEEK,
    communicationStyle,
    focusArea: options?.focusArea,
    includeInvestorPitch: options?.includeInvestorPitch || false,
    maxSuggestions: options?.maxSuggestions || 5,
    maxLength: options?.maxLength || 'standard'
  };

  const [requestOptions, setRequestOptions] = useState<ExecutiveAdvisorOptions>(defaultOptions);

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery(getExecutiveAdvice, requestOptions);

  // Extract executive advice
  const executiveAdvice = data?.executiveAdvice || null;

  // Update options when communication style changes
  useEffect(() => {
    setRequestOptions(prev => ({
      ...prev,
      communicationStyle
    }));
  }, [communicationStyle]);

  // Update options when timeframe changes
  useEffect(() => {
    if (options?.timeframe) {
      setRequestOptions(prev => ({
        ...prev,
        timeframe: options.timeframe!
      }));
    }
  }, [options?.timeframe]);

  return {
    executiveAdvice,
    communicationStyle,
    setCommunicationStyle,
    requestOptions,
    setRequestOptions,
    isLoading,
    error,
    refetch
  };
};

/**
 * Hook for the complete Athena business intelligence dashboard
 */
export const useAthenaDashboard = (options?: {
  timeframe?: TimeframeOption;
}) => {
  const [timeframe, setTimeframe] = useState<TimeframeOption>(
    options?.timeframe || TimeframeOption.WEEK
  );

  const {
    metrics,
    latestMetrics,
    isLoading: isLoadingMetrics,
    error: metricsError
  } = useBusinessMetrics({ timeframe });

  const {
    insights,
    recommendations,
    highImpactInsights,
    hasMemoryContext: insightsHasMemoryContext,
    isLoading: isLoadingInsights,
    error: insightsError
  } = useBusinessInsights({ timeframe });

  const {
    campaigns,
    isLoading: isLoadingCampaigns,
    error: campaignsError
  } = useCampaignSuggestions({ timeframe });

  const {
    decisions,
    isLoading: isLoadingDecisions,
    error: decisionsError
  } = useStrategicDecisions({ timeframe });

  const {
    marketData,
    isLoading: isLoadingMarketData,
    error: marketDataError
  } = useMarketData({ timeframe });

  const {
    recommendations: strategicRecommendations,
    isLoading: isLoadingStrategicRecommendations,
    error: strategicRecommendationsError
  } = useStrategicRecommendations({ timeframe });

  const {
    executiveSummary,
    workflowGraphId,
    hasMemoryContext: summaryHasMemoryContext,
    isLoading: isLoadingExecutiveSummary,
    error: executiveSummaryError
  } = useExecutiveSummary({ timeframe });

  // Calculate overall loading and error states
  const isLoading =
    isLoadingMetrics ||
    isLoadingInsights ||
    isLoadingCampaigns ||
    isLoadingDecisions ||
    isLoadingMarketData ||
    isLoadingStrategicRecommendations ||
    isLoadingExecutiveSummary;

  const error =
    metricsError ||
    insightsError ||
    campaignsError ||
    decisionsError ||
    marketDataError ||
    strategicRecommendationsError ||
    executiveSummaryError;

  // Notion export hook
  const { exportData, isExporting, exportResult } = useNotionExport();

  // Executive Advisor hook
  const {
    executiveAdvice,
    communicationStyle,
    setCommunicationStyle,
    isLoading: isLoadingExecutiveAdvice,
    error: executiveAdviceError,
    refetch: refetchExecutiveAdvice
  } = useExecutiveAdvisor({
    timeframe,
    communicationStyle: ExecutiveAdvisorTone.BALANCED
  });

  // Update overall loading and error states
  const isLoadingAll =
    isLoading ||
    isLoadingExecutiveAdvice;

  const errorAll =
    error ||
    executiveAdviceError;

  return {
    // Data
    metrics,
    latestMetrics,
    insights,
    recommendations,
    campaigns,
    insightsHasMemoryContext,
    decisions,
    highImpactInsights,
    marketData,
    strategicRecommendations,
    executiveSummary,
    workflowGraphId,
    summaryHasMemoryContext,
    executiveAdvice,

    // State
    timeframe,
    setTimeframe,
    communicationStyle,
    setCommunicationStyle,
    isLoading: isLoadingAll,
    error: errorAll,

    // Actions
    refetchExecutiveAdvice,

    // Notion export
    exportToNotion: exportData,
    isExporting,
    exportResult
  };
};
