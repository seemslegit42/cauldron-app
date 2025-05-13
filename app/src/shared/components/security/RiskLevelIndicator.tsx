import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@src/shared/utils/cn';
import { Tooltip } from '../ui/Tooltip';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical' | 'unknown';

export interface RiskLevelIndicatorProps {
  level?: RiskLevel;
  showLabel?: boolean;
  showDetails?: boolean;
  className?: string;
}

interface RiskDetails {
  color: string;
  pulseColor: string;
  label: string;
  description: string;
  threatCount: number;
  topThreat?: string;
}

/**
 * RiskLevelIndicator - Visual indicator for the current security risk level
 * 
 * Features:
 * - Color-coded risk levels
 * - Pulsing animation for higher risk levels
 * - Tooltip with risk details
 * - Optional detailed view with threat information
 */
export const RiskLevelIndicator: React.FC<RiskLevelIndicatorProps> = ({
  level = 'unknown',
  showLabel = false,
  showDetails = false,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Define risk level details
  const riskDetails: Record<RiskLevel, RiskDetails> = {
    low: {
      color: 'bg-green-500',
      pulseColor: 'rgba(34, 197, 94, 0.5)',
      label: 'Low',
      description: 'No significant threats detected',
      threatCount: 0,
    },
    medium: {
      color: 'bg-yellow-500',
      pulseColor: 'rgba(234, 179, 8, 0.5)',
      label: 'Medium',
      description: 'Minor threats detected, monitoring advised',
      threatCount: 2,
      topThreat: 'Unusual login pattern detected',
    },
    high: {
      color: 'bg-orange-500',
      pulseColor: 'rgba(249, 115, 22, 0.5)',
      label: 'High',
      description: 'Significant threats detected, action required',
      threatCount: 5,
      topThreat: 'Multiple failed authentication attempts',
    },
    critical: {
      color: 'bg-red-500',
      pulseColor: 'rgba(239, 68, 68, 0.5)',
      label: 'Critical',
      description: 'Severe threats detected, immediate action required',
      threatCount: 12,
      topThreat: 'Potential data breach in progress',
    },
    unknown: {
      color: 'bg-gray-500',
      pulseColor: 'rgba(107, 114, 128, 0.5)',
      label: 'Unknown',
      description: 'Security status unknown',
      threatCount: 0,
    },
  };

  // Get details for current risk level
  const details = riskDetails[level];

  // Animation variants for the indicator
  const indicatorVariants = {
    low: {
      scale: [1, 1.05, 1],
      opacity: [1, 0.9, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: 'reverse' as const,
      },
    },
    medium: {
      scale: [1, 1.1, 1],
      opacity: [1, 0.8, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: 'reverse' as const,
      },
    },
    high: {
      scale: [1, 1.15, 1],
      opacity: [1, 0.7, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatType: 'reverse' as const,
      },
    },
    critical: {
      scale: [1, 1.2, 1],
      opacity: [1, 0.6, 1],
      transition: {
        duration: 1,
        repeat: Infinity,
        repeatType: 'reverse' as const,
      },
    },
    unknown: {
      scale: [1, 1.05, 1],
      opacity: [0.7, 0.5, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: 'reverse' as const,
      },
    },
  };

  // Pulse animation for the glow effect
  const pulseVariants = {
    low: {
      boxShadow: [
        `0 0 0px ${details.pulseColor}`,
        `0 0 10px ${details.pulseColor}`,
        `0 0 0px ${details.pulseColor}`,
      ],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: 'reverse' as const,
      },
    },
    medium: {
      boxShadow: [
        `0 0 0px ${details.pulseColor}`,
        `0 0 15px ${details.pulseColor}`,
        `0 0 0px ${details.pulseColor}`,
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: 'reverse' as const,
      },
    },
    high: {
      boxShadow: [
        `0 0 0px ${details.pulseColor}`,
        `0 0 20px ${details.pulseColor}`,
        `0 0 0px ${details.pulseColor}`,
      ],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatType: 'reverse' as const,
      },
    },
    critical: {
      boxShadow: [
        `0 0 5px ${details.pulseColor}`,
        `0 0 25px ${details.pulseColor}`,
        `0 0 5px ${details.pulseColor}`,
      ],
      transition: {
        duration: 1,
        repeat: Infinity,
        repeatType: 'reverse' as const,
      },
    },
    unknown: {
      boxShadow: [
        `0 0 0px ${details.pulseColor}`,
        `0 0 10px ${details.pulseColor}`,
        `0 0 0px ${details.pulseColor}`,
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: 'reverse' as const,
      },
    },
  };

  // Simple indicator with tooltip
  if (!showDetails) {
    return (
      <Tooltip content={`${details.label} Risk: ${details.description}`}>
        <div className={cn("flex items-center space-x-2", className)}>
          <motion.div
            className={cn(
              "h-3 w-3 rounded-full",
              details.color
            )}
            variants={indicatorVariants}
            animate={level}
            style={{ position: 'relative' }}
          >
            <motion.div
              className="absolute inset-0 rounded-full"
              variants={pulseVariants}
              animate={level}
            />
          </motion.div>
          {showLabel && (
            <span className="text-xs font-mono uppercase tracking-wider text-gray-400">
              {details.label}
            </span>
          )}
        </div>
      </Tooltip>
    );
  }

  // Detailed expandable indicator
  return (
    <div className={cn("relative", className)}>
      <button
        className="flex items-center space-x-2 rounded-md px-2 py-1 hover:bg-gray-800/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <motion.div
          className={cn(
            "h-3 w-3 rounded-full",
            details.color
          )}
          variants={indicatorVariants}
          animate={level}
          style={{ position: 'relative' }}
        >
          <motion.div
            className="absolute inset-0 rounded-full"
            variants={pulseVariants}
            animate={level}
          />
        </motion.div>
        <span className="text-xs font-mono uppercase tracking-wider text-gray-400">
          {details.label} Risk
        </span>
        <svg
          className={cn(
            "h-4 w-4 text-gray-400 transition-transform",
            isExpanded ? "rotate-180" : ""
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 z-10 mt-2 w-64 overflow-hidden rounded-md bg-gray-800 shadow-lg"
          >
            <div className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">{details.label} Risk Level</h3>
                <span className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium",
                  level === 'low' ? "bg-green-900 text-green-200" :
                  level === 'medium' ? "bg-yellow-900 text-yellow-200" :
                  level === 'high' ? "bg-orange-900 text-orange-200" :
                  level === 'critical' ? "bg-red-900 text-red-200" :
                  "bg-gray-700 text-gray-300"
                )}>
                  {details.threatCount} {details.threatCount === 1 ? 'Threat' : 'Threats'}
                </span>
              </div>
              <p className="mb-3 text-xs text-gray-300">{details.description}</p>
              {details.topThreat && (
                <div className="rounded-md bg-gray-700 p-2">
                  <p className="text-xs font-medium text-white">Top Threat:</p>
                  <p className="text-xs text-gray-300">{details.topThreat}</p>
                </div>
              )}
              <div className="mt-3 flex justify-end">
                <button
                  className="text-xs font-medium text-blue-400 hover:text-blue-300"
                  onClick={() => window.location.href = '/phantom'}
                >
                  View Details →
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RiskLevelIndicator;
