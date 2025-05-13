import React from 'react';
import { cn } from '../../utils/cn';
import { ModuleId, getModuleColors } from '../../theme/moduleColors';

export interface AmbientGlowProps {
  moduleId: ModuleId;
  intensity?: 'low' | 'medium' | 'high';
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  className?: string;
}

/**
 * Ambient glow effect component for cyberpunk aesthetic
 * 
 * @example
 * ```tsx
 * <AmbientGlow moduleId="arcana" intensity="medium" position="top-right" animate />
 * ```
 */
export const AmbientGlow: React.FC<AmbientGlowProps> = ({
  moduleId,
  intensity = 'medium',
  position = 'top-right',
  size = 'lg',
  animate = true,
  className,
}) => {
  const colors = getModuleColors(moduleId);
  
  // Get position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-0 left-0';
      case 'top-right':
        return 'top-0 right-0';
      case 'bottom-left':
        return 'bottom-0 left-0';
      case 'bottom-right':
        return 'bottom-0 right-0';
      case 'center':
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
      default:
        return 'top-0 right-0';
    }
  };
  
  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-32 h-32';
      case 'md':
        return 'w-64 h-64';
      case 'lg':
        return 'w-96 h-96';
      case 'xl':
        return 'w-[32rem] h-[32rem]';
      default:
        return 'w-64 h-64';
    }
  };
  
  // Get intensity classes
  const getIntensityClasses = () => {
    switch (intensity) {
      case 'low':
        return 'opacity-10 blur-2xl';
      case 'medium':
        return 'opacity-20 blur-3xl';
      case 'high':
        return 'opacity-30 blur-3xl';
      default:
        return 'opacity-20 blur-3xl';
    }
  };
  
  // Get animation classes
  const getAnimationClasses = () => {
    return animate ? 'animate-pulse-slow' : '';
  };
  
  // Get gradient classes based on module
  const getGradientClasses = () => {
    return `bg-gradient-to-br ${colors.gradientFrom} ${colors.gradientTo}`;
  };
  
  return (
    <div 
      className={cn(
        "absolute rounded-full pointer-events-none",
        getPositionClasses(),
        getSizeClasses(),
        getIntensityClasses(),
        getAnimationClasses(),
        getGradientClasses(),
        className
      )}
      aria-hidden="true"
    />
  );
};

export default AmbientGlow;
