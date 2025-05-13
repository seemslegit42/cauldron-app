/**
 * AnalyticsDashboard Component
 *
 * A comprehensive dashboard for displaying business metrics and analytics.
 * Features:
 * - Displays metrics grouped by category
 * - Shows charts for metric trends
 * - Supports glassmorphism styling
 * - Includes loading and empty states
 * - Responsive layout for different screen sizes
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@src/shared/utils/cn';
import { getGlassmorphismClasses } from '@src/shared/utils/glassmorphism';
import { BusinessMetric, MetricCategory, TimeframeOption } from '../types';
import { MetricCard } from './MetricCard';
import { MetricChart } from './MetricChart';
import { RefreshCw, BarChart2 } from 'lucide-react';
import { useHapticFeedback } from '@src/shared/hooks/useHapticFeedback';
import { useSoundEffects } from '@src/shared/hooks/useSoundEffects';

interface AnalyticsDashboardProps {
  /** The metrics to display */
  metrics: BusinessMetric[];
  /** The selected timeframe */
  timeframe: TimeframeOption;
  /** Whether the dashboard is loading */
  isLoading?: boolean;
  /** Whether to enable glassmorphism styling */
  enableGlassmorphism?: boolean;
  /** Whether to enable haptic feedback */
  enableHaptics?: boolean;
  /** Whether to enable sound effects */
  enableSound?: boolean;
  /** Whether to enable animations */
  enableAnimations?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Callback when the refresh button is clicked */
  onRefresh?: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  metrics,
  timeframe,
  isLoading = false,
  enableGlassmorphism = true,
  enableHaptics = false,
  enableSound = false,
  enableAnimations = true,
  className,
  onRefresh,
}) => {
  const { triggerHaptic } = useHapticFeedback({ enabled: enableHaptics });
  const { playSound } = useSoundEffects({ enabled: enableSound });

  // Handle refresh button click
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }

    if (enableHaptics) {
      triggerHaptic('click');
    }

    if (enableSound) {
      playSound('click');
    }
  };

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

  if (isLoading) {
    return (
      <motion.div
        className={cn(
          "p-6 mb-6",
          enableGlassmorphism
            ? getGlassmorphismClasses({
              level: 'medium',
              border: true,
              shadow: true,
            })
            : "bg-gray-800 rounded-lg shadow-lg",
          className
        )}
        initial={enableAnimations ? { opacity: 0 } : { opacity: 1 }}
        animate={enableAnimations ? { opacity: 1 } : { opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <motion.div
            className="h-6 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded w-1/4"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          {onRefresh && (
            <motion.div
              className="h-8 w-20 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            />
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="h-32 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-lg"
              initial={enableAnimations ? { opacity: 0, y: 20 } : { opacity: 1 }}
              animate={enableAnimations ? { opacity: 1, y: 0 } : { opacity: 1 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            />
          ))}
        </div>
      </motion.div>
    );
  }

  if (!metrics || metrics.length === 0) {
    return (
      <motion.div
        className={cn(
          "p-6 mb-6",
          enableGlassmorphism
            ? getGlassmorphismClasses({
              level: 'medium',
              border: true,
              shadow: true,
            })
            : "bg-gray-800 rounded-lg shadow-lg",
          className
        )}
        initial={enableAnimations ? { opacity: 0 } : { opacity: 1 }}
        animate={enableAnimations ? { opacity: 1 } : { opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <motion.h2
            className="text-xl font-bold text-white flex items-center"
            initial={enableAnimations ? { opacity: 0, x: -20 } : { opacity: 1 }}
            animate={enableAnimations ? { opacity: 1, x: 0 } : { opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <BarChart2 className="mr-2 text-yellow-500" size={24} />
            Analytics Dashboard
          </motion.h2>
          {onRefresh && (
            <motion.button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center px-3 py-1.5 border border-gray-600 rounded-md text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              initial={enableAnimations ? { opacity: 0, x: 20 } : { opacity: 1 }}
              animate={enableAnimations ? { opacity: 1, x: 0 } : { opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className="h-4 w-4 mr-1.5" />
              Refresh
            </motion.button>
          )}
        </div>
        <motion.div
          className="flex flex-col items-center justify-center py-12"
          initial={enableAnimations ? { opacity: 0, y: 20 } : { opacity: 1 }}
          animate={enableAnimations ? { opacity: 1, y: 0 } : { opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.div
            initial={enableAnimations ? { scale: 0.8 } : { scale: 1 }}
            animate={enableAnimations ? { scale: 1 } : { scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <BarChart2 className="h-20 w-20 text-gray-600 mb-4" />
          </motion.div>
          <motion.p
            className="text-gray-400 text-center max-w-md"
            initial={enableAnimations ? { opacity: 0 } : { opacity: 1 }}
            animate={enableAnimations ? { opacity: 1 } : { opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            No metrics available for the selected timeframe. Try selecting a different timeframe or refreshing the data.
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn(
        "p-6 mb-6",
        enableGlassmorphism
          ? getGlassmorphismClasses({
            level: 'medium',
            border: true,
            shadow: true,
          })
          : "bg-gray-800 rounded-lg shadow-lg",
        className
      )}
      initial={enableAnimations ? { opacity: 0 } : { opacity: 1 }}
      animate={enableAnimations ? { opacity: 1 } : { opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <motion.h2
          className="text-xl font-bold text-white flex items-center"
          initial={enableAnimations ? { opacity: 0, x: -20 } : { opacity: 1 }}
          animate={enableAnimations ? { opacity: 1, x: 0 } : { opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <BarChart2 className="mr-2 text-yellow-500" size={24} />
          Analytics Dashboard
        </motion.h2>
        {onRefresh && (
          <motion.button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center px-3 py-1.5 border border-gray-600 rounded-md text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            initial={enableAnimations ? { opacity: 0, x: 20 } : { opacity: 1 }}
            animate={enableAnimations ? { opacity: 1, x: 0 } : { opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Refresh
          </motion.button>
        )}
      </div>

      {categories.map((category, categoryIndex) => (
        <motion.div
          key={category}
          className="mb-8"
          initial={enableAnimations ? { opacity: 0, y: 20 } : { opacity: 1 }}
          animate={enableAnimations ? { opacity: 1, y: 0 } : { opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 + categoryIndex * 0.1 }}
        >
          <motion.h3
            className="text-lg font-semibold mb-3 text-yellow-400 capitalize flex items-center"
            initial={enableAnimations ? { opacity: 0, x: -10 } : { opacity: 1 }}
            animate={enableAnimations ? { opacity: 1, x: 0 } : { opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 + categoryIndex * 0.1 }}
          >
            {category === MetricCategory.REVENUE && <Zap className="mr-2" size={18} />}
            {category === MetricCategory.GROWTH && <TrendingUp className="mr-2" size={18} />}
            {category === MetricCategory.ENGAGEMENT && <Lightbulb className="mr-2" size={18} />}
            {category === MetricCategory.RETENTION && <Lightbulb className="mr-2" size={18} />}
            {category === MetricCategory.CONVERSION && <TrendingUp className="mr-2" size={18} />}
            {category === MetricCategory.ACQUISITION && <TrendingUp className="mr-2" size={18} />}
            {category === MetricCategory.PERFORMANCE && <BarChart2 className="mr-2" size={18} />}
            {category} Metrics
          </motion.h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {metricsByCategory[category]?.map((metric, index) => (
              <MetricCard
                key={metric.id}
                metric={metric}
                enableGlassmorphism={enableGlassmorphism}
                enableHaptics={enableHaptics}
                enableSound={enableSound}
                enableAnimations={enableAnimations}
                glassLevel="medium"
              />
            ))}
          </div>

          {metricsByCategory[category]?.length > 1 && (
            <motion.div
              className={cn(
                "mt-4 p-4 rounded-lg",
                enableGlassmorphism
                  ? getGlassmorphismClasses({
                    level: 'light',
                    border: true,
                    shadow: false,
                  })
                  : "bg-gray-700/50"
              )}
              initial={enableAnimations ? { opacity: 0, y: 10 } : { opacity: 1 }}
              animate={enableAnimations ? { opacity: 1, y: 0 } : { opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 + categoryIndex * 0.1 }}
            >
              <MetricChart
                metrics={metricsByCategory[category] || []}
                timeframe={timeframe}
                category={category}
              />
            </motion.div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
};
