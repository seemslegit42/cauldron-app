import React from 'react';
import { cn } from '../../utils/cn';

export type PulsatingGlowColor = 'red' | 'green' | 'blue' | 'yellow' | 'purple' | 'teal' | 'pink' | 'orange';
export type PulsatingGlowSize = 'sm' | 'md' | 'lg';
export type PulsatingGlowSpeed = 'slow' | 'medium' | 'fast';

export interface PulsatingGlowProps {
  /** Color of the glow */
  color?: PulsatingGlowColor;
  /** Size of the glow */
  size?: PulsatingGlowSize;
  /** Speed of the pulsation */
  speed?: PulsatingGlowSpeed;
  /** Whether to show a dot in the center */
  showDot?: boolean;
  /** Additional class name */
  className?: string;
}

/**
 * Pulsating Glow Component
 * 
 * A cyberpunk-styled pulsating glow effect that can be used to indicate status or draw attention.
 * 
 * @example
 * ```tsx
 * <PulsatingGlow color="red" size="md" speed="medium" showDot />
 * ```
 */
export const PulsatingGlow: React.FC<PulsatingGlowProps> = ({
  color = 'blue',
  size = 'md',
  speed = 'medium',
  showDot = true,
  className,
}) => {
  // Get color classes
  const getColorClasses = () => {
    switch (color) {
      case 'red':
        return { dot: 'bg-red-500', glow: 'bg-red-500' };
      case 'green':
        return { dot: 'bg-green-500', glow: 'bg-green-500' };
      case 'blue':
        return { dot: 'bg-blue-500', glow: 'bg-blue-500' };
      case 'yellow':
        return { dot: 'bg-yellow-500', glow: 'bg-yellow-500' };
      case 'purple':
        return { dot: 'bg-purple-500', glow: 'bg-purple-500' };
      case 'teal':
        return { dot: 'bg-teal-500', glow: 'bg-teal-500' };
      case 'pink':
        return { dot: 'bg-pink-500', glow: 'bg-pink-500' };
      case 'orange':
        return { dot: 'bg-orange-500', glow: 'bg-orange-500' };
      default:
        return { dot: 'bg-blue-500', glow: 'bg-blue-500' };
    }
  };

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return { dot: 'w-1.5 h-1.5', glow: 'w-3 h-3' };
      case 'md':
        return { dot: 'w-2 h-2', glow: 'w-4 h-4' };
      case 'lg':
        return { dot: 'w-3 h-3', glow: 'w-6 h-6' };
      default:
        return { dot: 'w-2 h-2', glow: 'w-4 h-4' };
    }
  };

  // Get animation speed classes
  const getSpeedClasses = () => {
    switch (speed) {
      case 'slow':
        return 'animate-pulse-slow';
      case 'medium':
        return 'animate-pulse';
      case 'fast':
        return 'animate-pulse-fast';
      default:
        return 'animate-pulse';
    }
  };

  const colorClasses = getColorClasses();
  const sizeClasses = getSizeClasses();
  const speedClasses = getSpeedClasses();

  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      {/* Pulsating glow */}
      <div
        className={cn(
          'absolute rounded-full opacity-60 blur-sm',
          colorClasses.glow,
          sizeClasses.glow,
          speedClasses
        )}
        aria-hidden="true"
      />
      
      {/* Center dot */}
      {showDot && (
        <div
          className={cn(
            'rounded-full',
            colorClasses.dot,
            sizeClasses.dot
          )}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default PulsatingGlow;
