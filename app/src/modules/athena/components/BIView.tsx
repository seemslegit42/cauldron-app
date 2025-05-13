/**
 * BIView Component
 *
 * A layout component for the business intelligence view.
 * Features:
 * - Sections for KPIs, intelligence feed, and forecast charts
 * - Glassmorphism styling
 * - Responsive design for different screen sizes
 * - Integration with Athena business intelligence services
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@src/shared/utils/cn';
import { getGlassmorphismClasses } from '@src/shared/utils/glassmorphism';
import {
  BarChart,
  TrendingUp,
  Lightbulb,
  Calendar,
  ArrowRight,
  RefreshCw,
  Zap,
  PieChart,
  LineChart,
  BarChart2
} from 'lucide-react';
import { Button } from '@src/shared/components/ui/Button';
import {
  BusinessMetric,
  BusinessInsight,
  BusinessRecommendation,
  TimeframeOption,
  GrowthMetric
} from '../types';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { InsightCard } from './InsightCard';
import { AthenaPrompt } from './AthenaPrompt';
import TrendDelta from './TrendDelta';

export interface BIViewProps {
  /** Business metrics data */
  metrics?: BusinessMetric[];
  /** Growth metrics with trend data */
  growthMetrics?: GrowthMetric[];
  /** Business insights */
  insights?: BusinessInsight[];
  /** Business recommendations */
  recommendations?: BusinessRecommendation[];
  /** Current timeframe */
  timeframe?: TimeframeOption;
  /** Whether data is loading */
  isLoading?: boolean;
  /** Error message if any */
  error?: Error | null;
  /** Callback when timeframe changes */
  onTimeframeChange?: (timeframe: TimeframeOption) => void;
  /** Callback when data is refreshed */
  onRefresh?: () => void;
  /** Callback when an insight is accepted */
  onInsightAccept?: (insightId: string) => void;
  /** Callback when an insight is snoozed */
  onInsightSnooze?: (insightId: string) => void;
  /** Callback when a query is submitted to Athena */
  onQuerySubmit?: (query: string) => Promise<string>;
  /** Additional CSS classes */
  className?: string;
}

export const BIView: React.FC<BIViewProps> = ({
  metrics = [],
  growthMetrics = [],
  insights = [],
  recommendations = [],
  timeframe = TimeframeOption.WEEK,
  isLoading = false,
  error = null,
  onTimeframeChange,
  onRefresh,
  onInsightAccept,
  onInsightSnooze,
  onQuerySubmit,
  className,
}) => {
  // State
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'forecasts'>('overview');

  // Get top insights (limited to 3)
  const topInsights = insights
    .filter(insight => insight.impact === 'high' || insight.impact === 'critical')
    .slice(0, 3);

  // Get key metrics (limited to 4)
  const keyMetrics = metrics.slice(0, 4);

  // Handle tab change
  const handleTabChange = (tab: 'overview' | 'insights' | 'forecasts') => {
    setActiveTab(tab);
  };

  // Render error state
  if (error) {
    return (
      <div className={cn(
        "overflow-hidden rounded-lg p-6",
        getGlassmorphismClasses({
          level: 'medium',
          border: true,
          shadow: true,
        }),
        className
      )}>
        <div className="flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-400">Error Loading Data</h3>
            <p className="mt-2 text-gray-400">{error.message || 'An unknown error occurred'}</p>
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={onRefresh}
                leftIcon={<RefreshCw size={16} />}
              >
                Retry
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Prompt Component */}
      <AthenaPrompt
        timeframe={timeframe}
        onQuerySubmit={onQuerySubmit}
        enableHaptics={true}
        enableSound={true}
        enableAnimations={true}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - KPIs and Metrics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <motion.div
            className={cn(
              "overflow-hidden rounded-lg",
              getGlassmorphismClasses({
                level: 'heavy',
                border: true,
                shadow: true,
              })
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="border-b border-gray-700/50 p-4 bg-gradient-to-r from-gray-900/50 to-gray-800/30">
              <div className="flex space-x-4">
                <motion.button
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    activeTab === 'overview'
                      ? "bg-gradient-to-r from-yellow-600 to-yellow-700 text-white shadow-md shadow-yellow-600/20"
                      : "text-gray-300 hover:bg-gray-800/70 hover:text-white"
                  )}
                  onClick={() => handleTabChange('overview')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <BarChart size={16} className="mr-2" />
                  Overview
                </motion.button>
                <motion.button
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    activeTab === 'insights'
                      ? "bg-gradient-to-r from-yellow-600 to-yellow-700 text-white shadow-md shadow-yellow-600/20"
                      : "text-gray-300 hover:bg-gray-800/70 hover:text-white"
                  )}
                  onClick={() => handleTabChange('insights')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Lightbulb size={16} className="mr-2" />
                  Insights
                </motion.button>
                <motion.button
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    activeTab === 'forecasts'
                      ? "bg-gradient-to-r from-yellow-600 to-yellow-700 text-white shadow-md shadow-yellow-600/20"
                      : "text-gray-300 hover:bg-gray-800/70 hover:text-white"
                  )}
                  onClick={() => handleTabChange('forecasts')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <TrendingUp size={16} className="mr-2" />
                  Forecasts
                </motion.button>
              </div>
            </div>

            <div className="p-6">
              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <BarChart2 className="mr-2 text-yellow-500" size={20} />
                      Key Metrics
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {isLoading ? (
                        Array(4).fill(0).map((_, i) => (
                          <motion.div
                            key={i}
                            className="h-24 animate-pulse rounded-lg"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1, duration: 0.3 }}
                            style={{
                              background: "linear-gradient(to right, rgba(55, 65, 81, 0.3), rgba(55, 65, 81, 0.5))"
                            }}
                          />
                        ))
                      ) : keyMetrics.length > 0 ? (
                        keyMetrics.map((metric, index) => (
                          <motion.div
                            key={metric.id}
                            className={cn(
                              "rounded-lg p-4 transition-all",
                              getGlassmorphismClasses({
                                level: 'medium',
                                border: true,
                                shadow: true,
                                hover: true
                              })
                            )}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: index * 0.1, duration: 0.4 }}
                            whileHover={{ y: -5, scale: 1.02 }}
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-gray-300">{metric.name}</h4>
                              {metric.percentChange !== undefined && (
                                <TrendDelta
                                  value={metric.percentChange}
                                  isPositiveGood={!metric.name.toLowerCase().includes('churn') &&
                                    !metric.name.toLowerCase().includes('cost')}
                                  size="sm"
                                  enableHaptics={true}
                                  glassmorphism={true}
                                  glassLevel="light"
                                  variant="pill"
                                  filled={true}
                                  animationStyle="bounce"
                                />
                              )}
                            </div>
                            <div className="mt-2">
                              <motion.p
                                className="text-2xl font-bold text-white"
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: index * 0.1 + 0.2, duration: 0.3, type: "spring" }}
                              >
                                {metric.unit === '$' ? `$${metric.value.toLocaleString()}` : metric.value.toLocaleString()}
                                {metric.unit !== '$' && metric.unit !== '%' && (
                                  <span className="ml-1 text-sm text-gray-400">{metric.unit}</span>
                                )}
                                {metric.unit === '%' && <span>%</span>}
                              </motion.p>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <motion.div
                          className="col-span-full flex h-24 items-center justify-center rounded-lg p-4"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5 }}
                          style={{
                            background: "linear-gradient(to right, rgba(55, 65, 81, 0.3), rgba(55, 65, 81, 0.5))"
                          }}
                        >
                          <p className="text-gray-400">No metrics available</p>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Analytics Dashboard */}
                  <AnalyticsDashboard
                    metrics={metrics}
                    timeframe={timeframe}
                    isLoading={isLoading}
                  />
                </div>
              )}

              {activeTab === 'insights' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Business Insights</h3>
                  {isLoading ? (
                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className="h-40 animate-pulse rounded-lg bg-gray-800/50 mb-4"></div>
                    ))
                  ) : insights.length > 0 ? (
                    <div className="space-y-4">
                      {insights.map((insight) => (
                        <InsightCard
                          key={insight.id}
                          id={insight.id}
                          title={insight.title}
                          summary={insight.description.substring(0, 120) + '...'}
                          description={insight.description}
                          category={insight.category}
                          impact={insight.impact}
                          confidence={insight.confidence}
                          timestamp={insight.createdAt}
                          relatedMetrics={insight.relatedMetrics.map(id => {
                            const metric = metrics.find(m => m.id === id);
                            return metric ? {
                              name: metric.name,
                              value: metric.value,
                              percentChange: metric.percentChange || 0,
                              isPositiveGood: !metric.name.toLowerCase().includes('churn') &&
                                !metric.name.toLowerCase().includes('cost')
                            } : null;
                          }).filter(Boolean) as any[]}
                          onAccept={() => onInsightAccept && onInsightAccept(insight.id)}
                          onSnooze={() => onInsightSnooze && onInsightSnooze(insight.id)}
                          enableHaptics={true}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-40 items-center justify-center rounded-lg bg-gray-800/50 p-4">
                      <p className="text-gray-400">No insights available</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'forecasts' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Growth Forecasts</h3>
                  {isLoading ? (
                    <div className="h-80 animate-pulse rounded-lg bg-gray-800/50"></div>
                  ) : growthMetrics.length > 0 ? (
                    <div className="space-y-6">
                      {/* Placeholder for forecast charts */}
                      <div className="rounded-lg bg-gray-800/50 p-4 h-80 flex items-center justify-center">
                        <div className="text-center">
                          <LineChart size={48} className="mx-auto mb-4 text-yellow-500 opacity-50" />
                          <p className="text-gray-400">Forecast charts will be implemented here</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-80 items-center justify-center rounded-lg bg-gray-800/50 p-4">
                      <p className="text-gray-400">No forecast data available</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Column - Insights Feed */}
      <div className="space-y-6">
        {/* Top Insights */}
        <motion.div
          className={cn(
            "overflow-hidden rounded-lg",
            getGlassmorphismClasses({
              level: 'heavy',
              border: true,
              shadow: true,
            })
          )}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="border-b border-gray-700/50 p-4 bg-gradient-to-r from-gray-900/50 to-gray-800/30">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Lightbulb className="mr-2 text-yellow-500" size={20} />
              Top Insights
            </h3>
          </div>
          <div className="p-4">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <motion.div
                  key={i}
                  className="h-24 animate-pulse rounded-lg mb-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                  style={{
                    background: "linear-gradient(to right, rgba(55, 65, 81, 0.3), rgba(55, 65, 81, 0.5))"
                  }}
                />
              ))
            ) : topInsights.length > 0 ? (
              <div className="space-y-3">
                {topInsights.map((insight, index) => (
                  <motion.div
                    key={insight.id}
                    className={cn(
                      "rounded-lg p-3 transition-all",
                      getGlassmorphismClasses({
                        level: 'light',
                        border: true,
                        shadow: true,
                        hover: true
                      })
                    )}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="flex items-start">
                      <motion.div
                        initial={{ rotate: 0 }}
                        animate={{ rotate: [0, 15, 0, -15, 0] }}
                        transition={{
                          duration: 1.5,
                          delay: index * 0.2 + 0.5,
                          ease: "easeInOut"
                        }}
                      >
                        <Lightbulb size={18} className="mt-0.5 mr-2 text-yellow-500" />
                      </motion.div>
                      <div>
                        <h4 className="text-sm font-medium text-white">{insight.title}</h4>
                        <p className="mt-1 text-xs text-gray-300 line-clamp-2">
                          {insight.description}
                        </p>
                        <div className="mt-2 flex items-center">
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full shadow-sm",
                            insight.impact === 'critical' ? "bg-gradient-to-r from-red-900/70 to-red-800/70 text-red-200" :
                              insight.impact === 'high' ? "bg-gradient-to-r from-orange-900/70 to-orange-800/70 text-orange-200" :
                                insight.impact === 'medium' ? "bg-gradient-to-r from-yellow-900/70 to-yellow-800/70 text-yellow-200" :
                                  "bg-gradient-to-r from-green-900/70 to-green-800/70 text-green-200"
                          )}>
                            {insight.impact} impact
                          </span>
                          <motion.button
                            className="ml-auto text-xs text-yellow-500 hover:text-yellow-400 p-1 rounded-full hover:bg-yellow-500/10"
                            onClick={() => onInsightAccept && onInsightAccept(insight.id)}
                            whileHover={{ scale: 1.2, rotate: 10 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <ArrowRight size={14} />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                className="flex h-24 items-center justify-center rounded-lg p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                style={{
                  background: "linear-gradient(to right, rgba(55, 65, 81, 0.3), rgba(55, 65, 81, 0.5))"
                }}
              >
                <p className="text-gray-400">No insights available</p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Recommendations */}
        <motion.div
          className={cn(
            "overflow-hidden rounded-lg",
            getGlassmorphismClasses({
              level: 'heavy',
              border: true,
              shadow: true,
            })
          )}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="border-b border-gray-700/50 p-4 bg-gradient-to-r from-gray-900/50 to-gray-800/30">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Zap className="mr-2 text-yellow-500" size={20} />
              Recommendations
            </h3>
          </div>
          <div className="p-4">
            {isLoading ? (
              Array(2).fill(0).map((_, i) => (
                <motion.div
                  key={i}
                  className="h-24 animate-pulse rounded-lg mb-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                  style={{
                    background: "linear-gradient(to right, rgba(55, 65, 81, 0.3), rgba(55, 65, 81, 0.5))"
                  }}
                />
              ))
            ) : recommendations.length > 0 ? (
              <div className="space-y-3">
                {recommendations.slice(0, 3).map((recommendation, index) => (
                  <motion.div
                    key={recommendation.id}
                    className={cn(
                      "rounded-lg p-3 transition-all",
                      getGlassmorphismClasses({
                        level: 'light',
                        border: true,
                        shadow: true,
                        hover: true
                      })
                    )}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="flex items-start">
                      <motion.div
                        initial={{ scale: 1 }}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{
                          duration: 1.5,
                          delay: index * 0.2 + 0.5,
                          repeat: Infinity,
                          repeatType: "reverse"
                        }}
                      >
                        <Zap size={18} className="mt-0.5 mr-2 text-yellow-500" />
                      </motion.div>
                      <div>
                        <h4 className="text-sm font-medium text-white">{recommendation.title}</h4>
                        <p className="mt-1 text-xs text-gray-300 line-clamp-2">
                          {recommendation.description}
                        </p>
                        <div className="mt-2 flex items-center">
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full shadow-sm",
                            recommendation.impact === 'critical' ? "bg-gradient-to-r from-red-900/70 to-red-800/70 text-red-200" :
                              recommendation.impact === 'high' ? "bg-gradient-to-r from-orange-900/70 to-orange-800/70 text-orange-200" :
                                recommendation.impact === 'medium' ? "bg-gradient-to-r from-yellow-900/70 to-yellow-800/70 text-yellow-200" :
                                  "bg-gradient-to-r from-green-900/70 to-green-800/70 text-green-200"
                          )}>
                            {recommendation.impact} impact
                          </span>
                          <motion.button
                            className="ml-auto text-xs text-yellow-500 hover:text-yellow-400 p-1 rounded-full hover:bg-yellow-500/10"
                            whileHover={{ scale: 1.2, rotate: 10 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <ArrowRight size={14} />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                className="flex h-24 items-center justify-center rounded-lg p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                style={{
                  background: "linear-gradient(to right, rgba(55, 65, 81, 0.3), rgba(55, 65, 81, 0.5))"
                }}
              >
                <p className="text-gray-400">No recommendations available</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BIView;
