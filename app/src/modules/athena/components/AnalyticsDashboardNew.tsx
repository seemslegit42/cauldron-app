import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@src/shared/utils/cn';
import { getGlassmorphismClasses } from '@src/shared/utils/glassmorphism';
import { BusinessMetric, MetricCategory, TimeframeOption } from '../types';
import { Button } from '@src/shared/components/ui/Button';

export interface AnalyticsDashboardNewProps {
  metrics: BusinessMetric[];
  timeframe: TimeframeOption;
  isLoading?: boolean;
  onRefresh?: () => void;
  className?: string;
}

/**
 * AnalyticsDashboardNew - Business metrics visualization
 * 
 * Features:
 * - Key performance indicators
 * - Metric cards with trend indicators
 * - Category-based organization
 * - Interactive charts
 */
export const AnalyticsDashboardNew: React.FC<AnalyticsDashboardNewProps> = ({
  metrics,
  timeframe,
  isLoading = false,
  onRefresh,
  className,
}) => {
  // Group metrics by category
  const metricsByCategory = metrics?.reduce((acc, metric) => {
    if (!acc[metric.category]) {
      acc[metric.category] = [];
    }
    acc[metric.category].push(metric);
    return acc;
  }, {} as Record<string, BusinessMetric[]>) || {};

  // Get categories with metrics
  const categories = Object.keys(metricsByCategory) as MetricCategory[];

  // Get trend indicator
  const getTrendIndicator = (metric: BusinessMetric) => {
    if (metric.percentChange === undefined) return null;

    const isPositive = metric.percentChange >= 0;
    const trendColor = isPositive ? 'text-green-500' : 'text-red-500';

    return (
      <div className={`flex items-center ${trendColor}`}>
        {isPositive ? (
          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        ) : (
          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        )}
        <span className="text-xs font-medium">
          {Math.abs(metric.percentChange).toFixed(1)}%
        </span>
      </div>
    );
  };

  // Format metric value
  const formatMetricValue = (metric: BusinessMetric) => {
    if (metric.unit === '$') {
      return `$${metric.value.toLocaleString()}`;
    } else if (metric.unit === '%') {
      return `${metric.value}%`;
    } else {
      return `${metric.value.toLocaleString()} ${metric.unit}`;
    }
  };

  if (isLoading) {
    return (
      <div className={cn(
        "overflow-hidden rounded-lg",
        getGlassmorphismClasses({
          level: 'medium',
          border: true,
          shadow: true,
        }),
        className
      )}>
        <div className="border-b border-gray-700/50 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Analytics Dashboard</h2>
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                isLoading={true}
                leftIcon={
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                }
              >
                Refresh
              </Button>
            )}
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-800/50 p-4"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!metrics || metrics.length === 0) {
    return (
      <div className={cn(
        "overflow-hidden rounded-lg",
        getGlassmorphismClasses({
          level: 'medium',
          border: true,
          shadow: true,
        }),
        className
      )}>
        <div className="border-b border-gray-700/50 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Analytics Dashboard</h2>
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                leftIcon={
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                }
              >
                Refresh
              </Button>
            )}
          </div>
        </div>
        <div className="p-6">
          <div className="flex h-32 flex-col items-center justify-center">
            <svg className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="mt-2 text-center text-gray-400">
              No metrics available for the selected timeframe.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "overflow-hidden rounded-lg",
      getGlassmorphismClasses({
        level: 'medium',
        border: true,
        shadow: true,
      }),
      className
    )}>
      <div className="border-b border-gray-700/50 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Analytics Dashboard</h2>
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              leftIcon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              }
            >
              Refresh
            </Button>
          )}
        </div>
      </div>
      <div className="p-6">
        {categories.map((category) => (
          <div key={category} className="mb-8">
            <h3 className="mb-4 text-lg font-semibold text-yellow-400 capitalize">
              {category} Metrics
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {metricsByCategory[category].map((metric) => (
                <div
                  key={metric.id}
                  className="rounded-lg bg-gray-800/50 p-4 transition-colors hover:bg-gray-700/50"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-400">{metric.name}</h4>
                    {getTrendIndicator(metric)}
                  </div>
                  <div className="mt-2">
                    <p className="text-2xl font-bold text-white">{formatMetricValue(metric)}</p>
                    {metric.target !== undefined && (
                      <p className="mt-1 text-xs text-gray-400">
                        Target: {metric.unit === '$' ? '$' : ''}{metric.target.toLocaleString()}{metric.unit === '%' ? '%' : metric.unit !== '$' ? ` ${metric.unit}` : ''}
                      </p>
                    )}
                  </div>
                  {metric.description && (
                    <p className="mt-2 text-xs text-gray-400">{metric.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsDashboardNew;
