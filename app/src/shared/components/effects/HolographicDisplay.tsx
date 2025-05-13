import React, { useEffect, useRef } from 'react';
import { cn } from '../../utils/cn';

export type HolographicDisplayColor = 'red' | 'green' | 'blue' | 'yellow' | 'purple' | 'teal' | 'pink' | 'orange';

export interface HolographicDisplayProps {
  /** Title of the holographic display */
  title: string;
  /** Main value to display */
  value: string | number;
  /** Subtitle or description */
  subtitle?: string;
  /** Color theme of the hologram */
  color?: HolographicDisplayColor;
  /** Whether to show scan lines effect */
  scanLines?: boolean;
  /** Whether to show flickering effect */
  flicker?: boolean;
  /** Whether to show 3D rotation effect */
  rotate?: boolean;
  /** Additional class name */
  className?: string;
}

/**
 * Holographic Display Component
 * 
 * A cyberpunk-styled holographic display that shows information with futuristic effects.
 * 
 * @example
 * ```tsx
 * <HolographicDisplay
 *   title="Revenue Forecast"
 *   value="$1.2M"
 *   subtitle="+15% YoY Growth"
 *   color="blue"
 *   scanLines
 *   flicker
 *   rotate
 * />
 * ```
 */
export const HolographicDisplay: React.FC<HolographicDisplayProps> = ({
  title,
  value,
  subtitle,
  color = 'blue',
  scanLines = true,
  flicker = true,
  rotate = true,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Get color classes based on color theme
  const getColorClasses = () => {
    switch (color) {
      case 'red':
        return { text: 'text-red-400', glow: 'shadow-red-500/30', border: 'border-red-500/30' };
      case 'green':
        return { text: 'text-green-400', glow: 'shadow-green-500/30', border: 'border-green-500/30' };
      case 'blue':
        return { text: 'text-blue-400', glow: 'shadow-blue-500/30', border: 'border-blue-500/30' };
      case 'yellow':
        return { text: 'text-yellow-400', glow: 'shadow-yellow-500/30', border: 'border-yellow-500/30' };
      case 'purple':
        return { text: 'text-purple-400', glow: 'shadow-purple-500/30', border: 'border-purple-500/30' };
      case 'teal':
        return { text: 'text-teal-400', glow: 'shadow-teal-500/30', border: 'border-teal-500/30' };
      case 'pink':
        return { text: 'text-pink-400', glow: 'shadow-pink-500/30', border: 'border-pink-500/30' };
      case 'orange':
        return { text: 'text-orange-400', glow: 'shadow-orange-500/30', border: 'border-orange-500/30' };
      default:
        return { text: 'text-blue-400', glow: 'shadow-blue-500/30', border: 'border-blue-500/30' };
    }
  };
  
  const colorClasses = getColorClasses();
  
  // Add 3D rotation effect
  useEffect(() => {
    if (!rotate || !containerRef.current) return;
    
    const container = containerRef.current;
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;
      
      container.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };
    
    const handleMouseLeave = () => {
      container.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    };
    
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [rotate]);
  
  return (
    <div 
      ref={containerRef}
      className={cn(
        'relative w-full h-full flex flex-col items-center justify-center',
        'transition-transform duration-200 ease-out',
        colorClasses.border,
        colorClasses.glow,
        'border rounded-lg bg-gray-900/50 backdrop-blur-sm',
        className
      )}
    >
      {/* Scan lines effect */}
      {scanLines && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i}
              className="w-full h-px bg-white"
              style={{ marginTop: `${i * 10}px` }}
            />
          ))}
        </div>
      )}
      
      {/* Content */}
      <div className={cn(
        'flex flex-col items-center justify-center text-center p-6 z-10',
        flicker && 'animate-flicker'
      )}>
        <h3 className={cn('text-sm font-medium text-gray-400 mb-2', flicker && 'animate-flicker-slow')}>
          {title}
        </h3>
        
        <div className={cn(
          'text-4xl font-bold mb-1',
          colorClasses.text
        )}>
          {value}
        </div>
        
        {subtitle && (
          <p className="text-sm text-gray-400">
            {subtitle}
          </p>
        )}
      </div>
      
      {/* Corner accents */}
      <div className={cn('absolute top-0 left-0 w-3 h-3 border-t border-l', colorClasses.border)} />
      <div className={cn('absolute top-0 right-0 w-3 h-3 border-t border-r', colorClasses.border)} />
      <div className={cn('absolute bottom-0 left-0 w-3 h-3 border-b border-l', colorClasses.border)} />
      <div className={cn('absolute bottom-0 right-0 w-3 h-3 border-b border-r', colorClasses.border)} />
    </div>
  );
};

export default HolographicDisplay;
