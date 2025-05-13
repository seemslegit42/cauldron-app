import React from 'react';
import { cn } from '../../utils/cn';
import { ModuleId } from '../../theme/moduleColors';

export type PatternType = 'grid' | 'hex' | 'circuit' | 'dots' | 'none';

export interface BackgroundPatternProps {
  pattern?: PatternType;
  moduleId?: ModuleId;
  opacity?: number;
  className?: string;
  animate?: boolean;
}

/**
 * Background pattern component for cyberpunk aesthetic
 * 
 * @example
 * ```tsx
 * <BackgroundPattern pattern="grid" moduleId="arcana" opacity={0.1} animate />
 * ```
 */
export const BackgroundPattern: React.FC<BackgroundPatternProps> = ({
  pattern = 'grid',
  moduleId,
  opacity = 0.1,
  className,
  animate = false,
}) => {
  // Get pattern URL based on type
  const getPatternUrl = () => {
    switch (pattern) {
      case 'grid':
        return '/assets/patterns/grid-pattern.svg';
      case 'hex':
        return '/assets/patterns/hex-pattern.svg';
      case 'circuit':
        return '/assets/patterns/circuit-pattern.svg';
      case 'dots':
        return '/assets/patterns/dots-pattern.svg';
      case 'none':
      default:
        return '';
    }
  };

  // If pattern is none, don't render anything
  if (pattern === 'none') {
    return null;
  }

  return (
    <div 
      className={cn(
        "fixed inset-0 z-0 pointer-events-none bg-repeat",
        animate && "animate-pulse-slow",
        className
      )}
      style={{ 
        backgroundImage: `url(${getPatternUrl()})`,
        opacity,
      }}
      aria-hidden="true"
    />
  );
};

export default BackgroundPattern;
