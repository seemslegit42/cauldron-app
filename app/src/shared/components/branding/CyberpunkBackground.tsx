import React from 'react';
import { cn } from '../../utils/cn';
import { ModuleId } from '../../theme/moduleColors';
import BackgroundPattern, { PatternType } from '../effects/BackgroundPattern';
import AmbientGlow from '../effects/AmbientGlow';

export interface CyberpunkBackgroundProps {
  moduleId: ModuleId;
  pattern?: PatternType;
  patternOpacity?: number;
  glowIntensity?: 'low' | 'medium' | 'high';
  glowPositions?: ('top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center')[];
  animate?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Cyberpunk background component with pattern and ambient glow
 * 
 * @example
 * ```tsx
 * <CyberpunkBackground
 *   moduleId="arcana"
 *   pattern="grid"
 *   patternOpacity={0.1}
 *   glowIntensity="medium"
 *   glowPositions={['top-right', 'bottom-left']}
 *   animate
 * >
 *   <div>Content goes here</div>
 * </CyberpunkBackground>
 * ```
 */
export const CyberpunkBackground: React.FC<CyberpunkBackgroundProps> = ({
  moduleId,
  pattern = 'grid',
  patternOpacity = 0.1,
  glowIntensity = 'medium',
  glowPositions = ['top-right', 'bottom-left'],
  animate = true,
  className,
  children,
}) => {
  return (
    <div className={cn(
      "relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900",
      className
    )}>
      {/* Background pattern */}
      <BackgroundPattern
        pattern={pattern}
        moduleId={moduleId}
        opacity={patternOpacity}
        animate={animate}
      />
      
      {/* Ambient glows */}
      {glowPositions.map((position, index) => (
        <AmbientGlow
          key={`glow-${index}`}
          moduleId={moduleId}
          intensity={glowIntensity}
          position={position}
          animate={animate}
        />
      ))}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default CyberpunkBackground;
