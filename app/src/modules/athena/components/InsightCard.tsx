/**
 * InsightCard Component
 * 
 * A glassmorphic card for AI-generated TL;DRs with user actions.
 * Features:
 * - AI-generated insights with TL;DR summaries
 * - User actions (Accept, Snooze, Ask Phantom)
 * - Subtle animations and haptic feedback
 * - Glassmorphism styling
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@src/shared/utils/cn';
import { getGlassmorphismClasses } from '@src/shared/utils/glassmorphism';
import { useHapticFeedback } from '@src/shared/hooks/useHapticFeedback';
import { useSoundEffects } from '@src/shared/hooks/useSoundEffects';
import { 
  Lightbulb, 
  CheckCircle, 
  Clock, 
  Shield, 
  ChevronDown, 
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Zap,
  TrendingUp,
  TrendingDown,
  BarChart
} from 'lucide-react';
import TrendDelta from './TrendDelta';
import { Button } from '@src/shared/components/ui/Button';
import { ImpactLevel, ConfidenceLevel, MetricCategory } from '../types';

export interface InsightCardProps {
  /** Unique identifier for the insight */
  id: string;
  /** The title of the insight */
  title: string;
  /** The TL;DR summary of the insight */
  summary: string;
  /** The full description of the insight (optional) */
  description?: string;
  /** The category of the insight */
  category: MetricCategory;
  /** The impact level of the insight */
  impact: ImpactLevel;
  /** The confidence level of the insight */
  confidence: ConfidenceLevel;
  /** The timestamp when the insight was generated */
  timestamp: Date;
  /** Related metrics for the insight (optional) */
  relatedMetrics?: {
    name: string;
    value: number;
    percentChange: number;
    isPositiveGood?: boolean;
  }[];
  /** Whether to enable haptic feedback */
  enableHaptics?: boolean;
  /** Whether to enable sound effects */
  enableSound?: boolean;
  /** Callback when the insight is accepted */
  onAccept?: (id: string) => void;
  /** Callback when the insight is snoozed */
  onSnooze?: (id: string) => void;
  /** Callback when the insight is sent to Phantom for security analysis */
  onAskPhantom?: (id: string) => void;
  /** Callback when feedback is provided */
  onFeedback?: (id: string, isPositive: boolean) => void;
  /** Additional CSS classes */
  className?: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  id,
  title,
  summary,
  description,
  category,
  impact,
  confidence,
  timestamp,
  relatedMetrics,
  enableHaptics = false,
  enableSound = false,
  onAccept,
  onSnooze,
  onAskPhantom,
  onFeedback,
  className,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [snoozed, setSnoozed] = useState(false);
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  
  const { triggerHaptic } = useHapticFeedback({ enabled: enableHaptics });
  const { playSound } = useSoundEffects({ enabled: enableSound });
  
  // Handle expanding/collapsing the card
  const toggleExpand = () => {
    setExpanded(!expanded);
    if (enableHaptics) {
      triggerHaptic('click', 'subtle');
    }
    if (enableSound) {
      playSound(expanded ? 'collapse' : 'expand');
    }
  };
  
  // Handle accepting the insight
  const handleAccept = () => {
    setAccepted(true);
    if (onAccept) {
      onAccept(id);
    }
    if (enableHaptics) {
      triggerHaptic('success', 'moderate');
    }
    if (enableSound) {
      playSound('success');
    }
  };
  
  // Handle snoozing the insight
  const handleSnooze = () => {
    setSnoozed(true);
    if (onSnooze) {
      onSnooze(id);
    }
    if (enableHaptics) {
      triggerHaptic('click', 'subtle');
    }
    if (enableSound) {
      playSound('notification');
    }
  };
  
  // Handle asking Phantom for security analysis
  const handleAskPhantom = () => {
    if (onAskPhantom) {
      onAskPhantom(id);
    }
    if (enableHaptics) {
      triggerHaptic('click', 'subtle');
    }
    if (enableSound) {
      playSound('alert');
    }
  };
  
  // Handle providing feedback
  const handleFeedback = (isPositive: boolean) => {
    setFeedback(isPositive ? 'positive' : 'negative');
    if (onFeedback) {
      onFeedback(id, isPositive);
    }
    if (enableHaptics) {
      triggerHaptic(isPositive ? 'success' : 'error', 'subtle');
    }
    if (enableSound) {
      playSound(isPositive ? 'success' : 'error');
    }
  };
  
  // Get the icon for the category
  const getCategoryIcon = () => {
    switch (category) {
      case MetricCategory.REVENUE:
      case MetricCategory.FINANCIAL:
        return <Zap className="h-5 w-5 text-green-400" />;
      case MetricCategory.GROWTH:
        return <TrendingUp className="h-5 w-5 text-blue-400" />;
      case MetricCategory.ENGAGEMENT:
      case MetricCategory.RETENTION:
        return <Lightbulb className="h-5 w-5 text-yellow-400" />;
      case MetricCategory.CONVERSION:
        return <TrendingUp className="h-5 w-5 text-purple-400" />;
      case MetricCategory.ACQUISITION:
        return <TrendingUp className="h-5 w-5 text-indigo-400" />;
      case MetricCategory.PERFORMANCE:
        return <BarChart className="h-5 w-5 text-cyan-400" />;
      case MetricCategory.MARKETING:
        return <TrendingUp className="h-5 w-5 text-pink-400" />;
      case MetricCategory.SALES:
        return <TrendingUp className="h-5 w-5 text-orange-400" />;
      case MetricCategory.CUSTOMER:
        return <Lightbulb className="h-5 w-5 text-amber-400" />;
      case MetricCategory.OPERATIONAL:
        return <BarChart className="h-5 w-5 text-slate-400" />;
      case MetricCategory.MARKET:
        return <BarChart className="h-5 w-5 text-emerald-400" />;
      case MetricCategory.PRODUCT:
        return <Lightbulb className="h-5 w-5 text-violet-400" />;
      case MetricCategory.HIRING:
        return <TrendingUp className="h-5 w-5 text-teal-400" />;
      case MetricCategory.PARTNERSHIP:
        return <Lightbulb className="h-5 w-5 text-rose-400" />;
      default:
        return <Lightbulb className="h-5 w-5 text-blue-400" />;
    }
  };
  
  // Get the color for the impact level
  const getImpactColor = () => {
    switch (impact) {
      case ImpactLevel.CRITICAL:
        return 'bg-red-500 text-white';
      case ImpactLevel.HIGH:
        return 'bg-orange-500 text-white';
      case ImpactLevel.MEDIUM:
        return 'bg-yellow-500 text-black';
      case ImpactLevel.LOW:
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };
  
  // Get the color for the confidence level
  const getConfidenceColor = () => {
    switch (confidence) {
      case ConfidenceLevel.VERY_HIGH:
        return 'bg-green-500 text-white';
      case ConfidenceLevel.HIGH:
        return 'bg-blue-500 text-white';
      case ConfidenceLevel.MEDIUM:
        return 'bg-yellow-500 text-black';
      case ConfidenceLevel.LOW:
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };
  
  return (
    <motion.div
      className={cn(
        "overflow-hidden rounded-lg transition-all duration-300",
        getGlassmorphismClasses({
          level: 'medium',
          border: true,
          shadow: true,
          hover: true,
        }),
        (accepted || snoozed) && 'opacity-60',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.01 }}
    >
      {/* Card Header */}
      <div className="p-4 border-b border-gray-200/10">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="mt-0.5">
              {getCategoryIcon()}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full ${getImpactColor()}`}>
                  {impact} impact
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getConfidenceColor()}`}>
                  {confidence} confidence
                </span>
                <span className="text-xs text-gray-400">
                  {timestamp.toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={toggleExpand}
            className="p-1 rounded-full hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
          >
            {expanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
      
      {/* Card Content */}
      <div className="p-4">
        <p className="text-gray-300">{summary}</p>
        
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 space-y-4"
            >
              {description && (
                <div className="border-t border-gray-700/50 pt-4">
                  <p className="text-sm text-gray-300">{description}</p>
                </div>
              )}
              
              {relatedMetrics && relatedMetrics.length > 0 && (
                <div className="border-t border-gray-700/50 pt-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Related Metrics</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {relatedMetrics.map((metric, index) => (
                      <div key={index} className="bg-gray-800/50 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-300">{metric.name}</span>
                          <TrendDelta
                            value={metric.percentChange}
                            isPositiveGood={metric.isPositiveGood}
                            size="sm"
                            enableHaptics={false}
                          />
                        </div>
                        <div className="text-lg font-semibold text-white mt-1">
                          {metric.value.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Card Actions */}
      <div className="px-4 py-3 bg-gray-800/30 border-t border-gray-700/50 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleFeedback(true)}
            disabled={feedback !== null}
            className={cn(
              "text-gray-400 hover:text-green-400",
              feedback === 'positive' && "text-green-400"
            )}
          >
            <ThumbsUp className="h-4 w-4 mr-1" />
            Helpful
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleFeedback(false)}
            disabled={feedback !== null}
            className={cn(
              "text-gray-400 hover:text-red-400",
              feedback === 'negative' && "text-red-400"
            )}
          >
            <ThumbsDown className="h-4 w-4 mr-1" />
            Not Helpful
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleAskPhantom}
            className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
          >
            <Shield className="h-4 w-4 mr-1" />
            Ask Phantom
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleSnooze}
            disabled={snoozed}
            className={cn(
              "border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20",
              snoozed && "opacity-50 cursor-not-allowed"
            )}
          >
            <Clock className="h-4 w-4 mr-1" />
            Snooze
          </Button>
          <Button
            size="sm"
            variant="solid"
            onClick={handleAccept}
            disabled={accepted}
            className={cn(
              "bg-green-500 hover:bg-green-600 text-white",
              accepted && "opacity-50 cursor-not-allowed"
            )}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Accept
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default InsightCard;
