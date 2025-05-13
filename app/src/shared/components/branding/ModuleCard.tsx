import React from 'react';
import { cn } from '../../utils/cn';
import { ModuleId, getModuleColors } from '../../theme/moduleColors';
import { getGlassmorphismClasses, GlassmorphismLevel } from '../../utils/glassmorphism';

export interface ModuleCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Module ID for consistent styling */
  moduleId: ModuleId;
  /** Card title */
  title?: React.ReactNode;
  /** Card description */
  description?: React.ReactNode;
  /** Card icon */
  icon?: React.ReactNode;
  /** Card actions (buttons, etc.) */
  actions?: React.ReactNode;
  /** Card footer */
  footer?: React.ReactNode;
  /** Glass effect level */
  glassLevel?: GlassmorphismLevel;
  /** Whether to show a border */
  border?: boolean;
  /** Whether to show a shadow */
  shadow?: boolean;
  /** Whether to show a hover effect */
  hover?: boolean;
  /** Whether to show a glow effect */
  glow?: boolean;
  /** Whether to add padding */
  padded?: boolean;
  /** Whether to show a header */
  hasHeader?: boolean;
  /** Whether to show a footer */
  hasFooter?: boolean;
  /** Custom class name for the header */
  headerClassName?: string;
  /** Custom class name for the content */
  contentClassName?: string;
  /** Custom class name for the footer */
  footerClassName?: string;
}

/**
 * Module Card Component
 * 
 * A card component with cyberpunk styling for all modules.
 * 
 * @example
 * ```tsx
 * <ModuleCard
 *   moduleId="arcana"
 *   title="Card Title"
 *   description="Card description"
 *   icon={<Icon />}
 *   actions={<Button>Action</Button>}
 *   footer={<Footer />}
 * >
 *   Card content
 * </ModuleCard>
 * ```
 */
export const ModuleCard: React.FC<ModuleCardProps> = ({
  moduleId,
  title,
  description,
  icon,
  actions,
  footer,
  children,
  glassLevel = 'medium',
  border = true,
  shadow = true,
  hover = false,
  glow = false,
  padded = true,
  hasHeader = !!title,
  hasFooter = !!footer,
  className = '',
  headerClassName = '',
  contentClassName = '',
  footerClassName = '',
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
          level: glassLevel,
          border,
          shadow,
          hover,
          borderColor: getBorderColor(),
          bgColor: getBgColor(),
        }),
        getGlowClass(),
        'transition-all duration-300 rounded-lg overflow-hidden',
        className
      )}
      {...props}
    >
      {/* Header */}
      {hasHeader && (
        <div
          className={cn(
            'flex items-start justify-between p-4 border-b border-white/10 dark:border-gray-800/30',
            headerClassName
          )}
        >
          <div className="flex items-center">
            {icon && (
              <div className={cn(
                "mr-3 flex items-center justify-center w-8 h-8 rounded-lg",
                colors.icon,
                `bg-${moduleId === 'arcana' ? 'purple' : moduleId === 'phantom' ? 'red' : moduleId === 'athena' ? 'blue' : 'gray'}-500/20`
              )}>
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h3 className={cn("text-lg font-semibold", colors.primary)}>
                  {title}
                </h3>
              )}
              {description && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {description}
                </p>
              )}
            </div>
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}

      {/* Content */}
      <div
        className={cn(
          padded && 'p-4',
          contentClassName
        )}
      >
        {children}
      </div>

      {/* Footer */}
      {hasFooter && (
        <div
          className={cn(
            'p-4 border-t border-white/10 dark:border-gray-800/30',
            footerClassName
          )}
        >
          {footer}
        </div>
      )}
    </div>
  );
};

export default ModuleCard;
