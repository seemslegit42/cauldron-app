import React from 'react';
import { cn } from '../../utils/cn';

export type CircuitPatternColor = 'red' | 'green' | 'blue' | 'yellow' | 'purple' | 'teal' | 'pink' | 'orange';
export type CircuitPatternDensity = 'low' | 'medium' | 'high';
export type CircuitPatternSpeed = 'slow' | 'medium' | 'fast';

export interface AnimatedCircuitPatternProps {
  /** Color of the circuit pattern */
  color?: CircuitPatternColor;
  /** Density of the circuit pattern */
  density?: CircuitPatternDensity;
  /** Animation speed */
  speed?: CircuitPatternSpeed;
  /** Whether to show nodes at circuit intersections */
  showNodes?: boolean;
  /** Whether to show a glow effect */
  glow?: boolean;
  /** Additional class name */
  className?: string;
}

/**
 * Animated Circuit Pattern Component
 * 
 * A cyberpunk-styled animated circuit pattern that can be used as a background or decorative element.
 * 
 * @example
 * ```tsx
 * <AnimatedCircuitPattern color="blue" density="medium" speed="medium" showNodes glow />
 * ```
 */
export const AnimatedCircuitPattern: React.FC<AnimatedCircuitPatternProps> = ({
  color = 'blue',
  density = 'medium',
  speed = 'medium',
  showNodes = true,
  glow = true,
  className,
}) => {
  // Get color classes
  const getColorClasses = () => {
    switch (color) {
      case 'red':
        return { line: 'stroke-red-500', node: 'bg-red-500', glow: 'shadow-red-500' };
      case 'green':
        return { line: 'stroke-green-500', node: 'bg-green-500', glow: 'shadow-green-500' };
      case 'blue':
        return { line: 'stroke-blue-500', node: 'bg-blue-500', glow: 'shadow-blue-500' };
      case 'yellow':
        return { line: 'stroke-yellow-500', node: 'bg-yellow-500', glow: 'shadow-yellow-500' };
      case 'purple':
        return { line: 'stroke-purple-500', node: 'bg-purple-500', glow: 'shadow-purple-500' };
      case 'teal':
        return { line: 'stroke-teal-500', node: 'bg-teal-500', glow: 'shadow-teal-500' };
      case 'pink':
        return { line: 'stroke-pink-500', node: 'bg-pink-500', glow: 'shadow-pink-500' };
      case 'orange':
        return { line: 'stroke-orange-500', node: 'bg-orange-500', glow: 'shadow-orange-500' };
      default:
        return { line: 'stroke-blue-500', node: 'bg-blue-500', glow: 'shadow-blue-500' };
    }
  };

  // Get density settings
  const getDensitySettings = () => {
    switch (density) {
      case 'low':
        return { lines: 5, nodeSize: 2 };
      case 'medium':
        return { lines: 10, nodeSize: 1.5 };
      case 'high':
        return { lines: 15, nodeSize: 1 };
      default:
        return { lines: 10, nodeSize: 1.5 };
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
  const densitySettings = getDensitySettings();
  const speedClasses = getSpeedClasses();

  // Generate circuit pattern
  const generateCircuitPattern = () => {
    const { lines, nodeSize } = densitySettings;
    const svgSize = 100;
    const lineSpacing = svgSize / lines;
    
    const horizontalLines = [];
    const verticalLines = [];
    const nodes = [];
    
    // Generate horizontal lines
    for (let i = 0; i < lines; i++) {
      const y = i * lineSpacing;
      horizontalLines.push(
        <line
          key={`h-${i}`}
          x1="0"
          y1={y}
          x2={svgSize}
          y2={y}
          className={cn(colorClasses.line, 'stroke-1 opacity-30')}
        />
      );
    }
    
    // Generate vertical lines
    for (let i = 0; i < lines; i++) {
      const x = i * lineSpacing;
      verticalLines.push(
        <line
          key={`v-${i}`}
          x1={x}
          y1="0"
          x2={x}
          y2={svgSize}
          className={cn(colorClasses.line, 'stroke-1 opacity-30')}
        />
      );
    }
    
    // Generate nodes at intersections
    if (showNodes) {
      for (let i = 0; i < lines; i++) {
        for (let j = 0; j < lines; j++) {
          // Only show some nodes for a more interesting pattern
          if ((i + j) % 3 === 0) {
            const x = i * lineSpacing;
            const y = j * lineSpacing;
            nodes.push(
              <circle
                key={`n-${i}-${j}`}
                cx={x}
                cy={y}
                r={nodeSize}
                className={cn(colorClasses.node, 'opacity-70', speedClasses)}
              />
            );
          }
        }
      }
    }
    
    return (
      <svg
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        className={cn('w-full h-full', glow && 'filter drop-shadow-sm')}
      >
        {horizontalLines}
        {verticalLines}
        {nodes}
      </svg>
    );
  };

  return (
    <div className={cn('overflow-hidden', className)}>
      {generateCircuitPattern()}
    </div>
  );
};

export default AnimatedCircuitPattern;
