import React from 'react';
import { cn } from '../../utils/cn';
import { GlassmorphismLevel, getGlassmorphismClasses } from '../../utils/glassmorphism';

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Panel title */
  title?: React.ReactNode;
  /** Panel description */
  description?: React.ReactNode;
  /** Panel icon */
  icon?: React.ReactNode;
  /** Panel actions */
  actions?: React.ReactNode;
  /** Panel footer */
  footer?: React.ReactNode;
  /** Whether the panel has a hover effect */
  hoverable?: boolean;
  /** Whether the panel has a border */
  bordered?: boolean;
  /** Whether the panel has a shadow */
  shadowed?: boolean;
  /** Glassmorphism level */
  glassLevel?: GlassmorphismLevel;
  /** Whether the panel is padded */
  padded?: boolean;
  /** Whether the panel has a header */
  hasHeader?: boolean;
  /** Whether the panel has a footer */
  hasFooter?: boolean;
  /** Custom class name for the header */
  headerClassName?: string;
  /** Custom class name for the content */
  contentClassName?: string;
  /** Custom class name for the footer */
  footerClassName?: string;
}

/**
 * Glass Panel Component
 * 
 * A panel component with glassmorphism effect for dashboard widgets.
 * 
 * @example
 * ```tsx
 * <GlassPanel
 *   title="Dashboard Widget"
 *   description="Widget description"
 *   icon={<Icon />}
 *   actions={<Button>Action</Button>}
 *   footer={<Footer />}
 *   glassLevel="medium"
 * >
 *   Panel content
 * </GlassPanel>
 * ```
 */
export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  className,
  title,
  description,
  icon,
  actions,
  footer,
  hoverable = false,
  bordered = true,
  shadowed = true,
  glassLevel = 'medium',
  padded = true,
  hasHeader = true,
  hasFooter = false,
  headerClassName,
  contentClassName,
  footerClassName,
  ...props
}) => {
  // Determine if we should show the header
  const showHeader = hasHeader && (title || description || icon || actions);
  
  // Determine if we should show the footer
  const showFooter = hasFooter || footer;

  return (
    <div
      className={cn(
        getGlassmorphismClasses({
          level: glassLevel,
          border: bordered,
          shadow: shadowed,
          hover: hoverable,
        }),
        className
      )}
      {...props}
    >
      {/* Header */}
      {showHeader && (
        <div
          className={cn(
            'flex items-start justify-between p-4 border-b border-white/10 dark:border-gray-800/30',
            headerClassName
          )}
        >
          <div className="flex items-center">
            {icon && <div className="mr-3">{icon}</div>}
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
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
      {showFooter && (
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

export default GlassPanel;
