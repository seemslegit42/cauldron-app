import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@src/shared/utils/cn';
import { Tooltip } from '../ui/Tooltip';

export type SentientLoopPhase = 'wake' | 'detect' | 'decide' | 'act' | 'reflect' | 'idle';

export interface SentientLoopIndicatorProps {
  currentPhase?: SentientLoopPhase;
  className?: string;
}

/**
 * SentientLoopIndicator - Visual indicator for the current phase of the Sentient Loop™
 * 
 * The Sentient Loop™ has 5 phases:
 * 1. Wake - Initial briefing and context gathering
 * 2. Detect - Identify issues and opportunities
 * 3. Decide - Present options and recommendations
 * 4. Act - Execute the chosen action
 * 5. Reflect - Analyze results and learn
 */
export const SentientLoopIndicator: React.FC<SentientLoopIndicatorProps> = ({
  currentPhase = 'idle',
  className,
}) => {
  // Define colors for each phase
  const phaseColors = {
    wake: 'bg-blue-500',
    detect: 'bg-yellow-500',
    decide: 'bg-purple-500',
    act: 'bg-green-500',
    reflect: 'bg-pink-500',
    idle: 'bg-gray-500',
  };

  // Define labels for each phase
  const phaseLabels = {
    wake: 'Wake',
    detect: 'Detect',
    decide: 'Decide',
    act: 'Act',
    reflect: 'Reflect',
    idle: 'Idle',
  };

  // Define descriptions for each phase
  const phaseDescriptions = {
    wake: 'Morning briefing and context gathering',
    detect: 'Identifying issues and opportunities',
    decide: 'Presenting options and recommendations',
    act: 'Executing the chosen action',
    reflect: 'Analyzing results and learning',
    idle: 'Sentient Loop™ is idle',
  };

  // Animation variants for the indicator
  const indicatorVariants = {
    idle: {
      scale: [1, 1.05, 1],
      opacity: [0.7, 0.9, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: 'reverse' as const,
      },
    },
    active: {
      scale: [1, 1.2, 1],
      opacity: [0.8, 1, 0.8],
      transition: {
        duration: 1,
        repeat: Infinity,
        repeatType: 'reverse' as const,
      },
    },
  };

  return (
    <Tooltip content={`${phaseLabels[currentPhase]}: ${phaseDescriptions[currentPhase]}`}>
      <div className={cn("flex items-center space-x-2", className)}>
        <motion.div
          className={cn(
            "h-3 w-3 rounded-full",
            phaseColors[currentPhase]
          )}
          variants={indicatorVariants}
          animate={currentPhase === 'idle' ? 'idle' : 'active'}
        />
        <span className="text-xs font-mono uppercase tracking-wider text-gray-400">
          {phaseLabels[currentPhase]}
        </span>
      </div>
    </Tooltip>
  );
};

export default SentientLoopIndicator;
