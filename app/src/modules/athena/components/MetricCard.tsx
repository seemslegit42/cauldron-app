/**
 * MetricCard Component
 *
 * A card component for displaying business metrics with trend indicators.
 * Features:
 * - Displays metric name, value, and trend
 * - Shows progress towards target if available
 * - Supports glassmorphism styling
 * - Integrates with TrendDelta for visual feedback
 */

import React from 'react';
import { motion } from 'framer-motion';
import { BusinessMetric } from '../types';
import { cn } from '@src/shared/utils/cn';
import { getGlassmorphismClasses } from '@src/shared/utils/glassmorphism';
import TrendDelta from './TrendDelta';

interface MetricCardProps {
  /** The business metric to display */
  metric: BusinessMetric;
  /** Additional CSS classes */
  className?: string;
  /** Whether to enable haptic feedback */
  enableHaptics?: boolean;
  /** Whether to enable sound effects */
  enableSound?: boolean;
  /** Whether to enable glassmorphism styling */
  enableGlassmorphism?: boolean;
  /** Whether to enable animations */
  enableAnimations?: boolean;
  /** The glassmorphism level if enabled */
  glassLevel?: 'light' | 'medium' | 'heavy';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  metric,
  className,
  enableHaptics = false,
  enableSound = false,
  enableGlassmorphism = true,
  enableAnimations = true,
  glassLevel = 'medium'
}) => {
  // Format the value based on the unit
  const formatValue = (value: number, unit: string): string => {
    if (unit === '%') {
      return `${value.toFixed(1)}%`;
    } else if (unit === '$') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    } else if (unit === 'k') {
      return `${(value / 1000).toFixed(1)}k`;
    } else if (unit === 'M') {
      return `${(value / 1000000).toFixed(1)}M`;
    } else {
      return value.toLocaleString();
    }
  };

  // Determine if the trend is positive (true) or negative (false)
  const isPositiveTrend = metric.percentChange ? metric.percentChange > 0 : null;

  // Determine if a positive trend is good (e.g., revenue up is good, churn down is good)
  const isPositiveGood = !metric.name.toLowerCase().includes('churn') &&
    !metric.name.toLowerCase().includes('cost') &&
    !metric.name.toLowerCase().includes('time');

  // Determine the color based on the trend direction and whether that's good or bad
  const getTrendColor = () => {
    if (isPositiveTrend === null) return 'text-gray-400';

    const isGood = (isPositiveTrend && isPositiveGood) || (!isPositiveTrend && !isPositiveGood);
    return isGood ? 'text-green-400' : 'text-red-400';
  };

  // Get the appropriate animation variant based on the trend
  const getAnimationVariant = () => {
    if (isPositiveTrend === null) return {};

    const isGood = (isPositiveTrend && isPositiveGood) || (!isPositiveTrend && !isPositiveGood);

    return isGood
      ? { y: [0, -3, 0], transition: { duration: 0.5 } }
      : { scale: [1, 0.98, 1], transition: { duration: 0.5 } };
  };

  // Calculate progress percentage for target
  const progressPercentage = metric.target !== undefined
    ? Math.min(100, Math.round((metric.value / metric.target) * 100))
    : null;

  return (
    <motion.div
      className={cn(
        enableGlassmorphism
          ? getGlassmorphismClasses({
            level: glassLevel,
            border: true,
            shadow: true,
            hover: true
          })
          : "bg-gray-700 shadow hover:bg-gray-600/80 transition-colors",
        "rounded-lg p-4",
        className
      )}
      initial={enableAnimations ? { opacity: 0, y: 10 } : { opacity: 1 }}
      animate={enableAnimations ? { opacity: 1, y: 0, ...getAnimationVariant() } : { opacity: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={enableAnimations ? { y: -5, scale: 1.02 } : {}}
    >
      <div className="flex justify-between items-start">
        <motion.h3
          className="text-sm font-medium text-gray-300"
          initial={enableAnimations ? { opacity: 0 } : { opacity: 1 }}
          animate={enableAnimations ? { opacity: 1 } : { opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {metric.name}
        </motion.h3>
        {metric.percentChange !== undefined && (
          <TrendDelta
            value={metric.percentChange}
            isPositiveGood={isPositiveGood}
            size="sm"
            enableHaptics={enableHaptics}
            enableSound={enableSound}
            glassmorphism={enableGlassmorphism}
            glassLevel="light"
            variant="pill"
            filled={true}
            animationStyle="bounce"
            animate={enableAnimations}
          />
        )}
      </div>

      <motion.div
        className="mt-2"
        initial={enableAnimations ? { opacity: 0, scale: 0.9 } : { opacity: 1 }}
        animate={enableAnimations ? { opacity: 1, scale: 1 } : { opacity: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
      >
        <span className="text-2xl font-bold text-white">
          {formatValue(metric.value, metric.unit)}
        </span>
        {metric.unit && metric.unit !== '$' && metric.unit !== '%' && (
          <span className="ml-1 text-sm text-gray-400">{metric.unit}</span>
        )}
      </motion.div>

      {progressPercentage !== null && (
        <motion.div
          className="mt-2"
          initial={enableAnimations ? { opacity: 0, scaleX: 0.5 } : { opacity: 1 }}
          animate={enableAnimations ? { opacity: 1, scaleX: 1 } : { opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Progress</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-600/50 rounded-full h-1.5 overflow-hidden">
            <motion.div
              className={cn(
                "h-1.5 rounded-full",
                progressPercentage < 30 ? "bg-gradient-to-r from-red-500 to-red-600" :
                  progressPercentage < 70 ? "bg-gradient-to-r from-yellow-500 to-yellow-600" :
                    "bg-gradient-to-r from-green-500 to-green-600"
              )}
              style={{ width: `${progressPercentage}%` }}
              initial={enableAnimations ? { width: 0 } : { width: `${progressPercentage}%` }}
              animate={enableAnimations ? { width: `${progressPercentage}%` } : { width: `${progressPercentage}%` }}
              transition={{ delay: 0.4, duration: 0.5 }}
            />
          </div>
        </motion.div>
      )}

      {metric.description && (
        <motion.p
          className="mt-2 text-xs text-gray-400"
          initial={enableAnimations ? { opacity: 0 } : { opacity: 1 }}
          animate={enableAnimations ? { opacity: 1 } : { opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {metric.description}
        </motion.p>
      )}
    </motion.div>
  );
};
