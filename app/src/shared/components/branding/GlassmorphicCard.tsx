import React from 'react';
import { cn } from '../../utils/cn';
import { getGlassmorphismClasses } from '../../utils/glassmorphism';
import { ModuleId, getModuleColors } from '../../theme/moduleColors';

export interface GlassmorphicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  moduleId: ModuleId;
  level?: 'light' | 'medium' | 'heavy';
  border?: boolean;
  shadow?: boolean;
  hover?: boolean;
  glow?: boolean;
  children: React.ReactNode;
}

/**
 * Glassmorphic card component with cyberpunk styling
 * 
 * @example
 * ```tsx
 * <GlassmorphicCard moduleId="arcana" level="medium" border shadow hover glow>
 *   <h2>Card Title</h2>
 *   <p>Card content</p>
 * </GlassmorphicCard>
 * ```
 */
export const GlassmorphicCard: React.FC<GlassmorphicCardProps> = ({
  moduleId,
  level = 'medium',
  border = true,
  shadow = true,
  hover = false,
  glow = false,
  className,
  children,
  ...props
}) => {
  const colors = getModuleColors(moduleId);
  
  // Get custom border color based on module
  const getBorderColor = () => {
    return border ? colors.border.replace('border-', '') : undefined;
  };
  
  // Get custom background color based on module
  const getBgColor = () => {
    return colors.glassBg;
  };
  
  // Get glow effect class
  const getGlowClass = () => {
    return glow ? colors.glow : '';
  };
  
  return (
    <div
      className={cn(
        getGlassmorphismClasses({
          level,
          border,
          shadow,
          hover,
          borderColor: getBorderColor(),
          bgColor: getBgColor(),
        }),
        getGlowClass(),
        'transition-all duration-300',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassmorphicCard;
