import React from 'react';
import { cn } from '../../utils/cn';
import { ModuleId, getModuleColors } from '../../theme/moduleColors';
import { useModuleTheme } from '../../hooks/useModuleTheme';
import { getGlassmorphismClasses, GlassmorphismLevel } from '../../utils/glassmorphism';

export interface ModuleHeaderProps {
  moduleId: ModuleId;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  /** Whether to use glass effect */
  glass?: boolean;
  /** Glass effect level */
  glassLevel?: GlassmorphismLevel;
  /** Whether to show a border */
  border?: boolean;
  /** Whether to show a shadow */
  shadow?: boolean;
  className?: string;
}

/**
 * Module header component with cyberpunk styling
 *
 * @example
 * ```tsx
 * <ModuleHeader
 *   moduleId="arcana"
 *   title="Arcana Dashboard"
 *   description="Command center for your digital operations"
 *   icon={<DashboardIcon />}
 *   actions={<Button>Settings</Button>}
 * />
 * ```
 */
export const ModuleHeader: React.FC<ModuleHeaderProps> = ({
  moduleId,
  title,
  description,
  icon,
  actions,
  glass = true,
  glassLevel = 'medium',
  border = true,
  shadow = true,
  className = '',
}) => {
  const { colors } = useModuleTheme(moduleId);

  return (
    <header
      className={cn(
        "px-6 py-4 mb-6",
        glass
          ? getGlassmorphismClasses({
            level: glassLevel,
            border,
            shadow,
            borderColor: colors.border.replace('border-', ''),
          })
          : "border-b border-gray-800 bg-gray-900",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {icon && (
            <div className={cn(
              "mr-3 text-2xl flex items-center justify-center w-10 h-10 rounded-lg",
              colors.icon,
              `bg-${moduleId === 'arcana' ? 'purple' : moduleId === 'phantom' ? 'red' : moduleId === 'athena' ? 'blue' : 'gray'}-500/20`
            )}>
              {icon}
            </div>
          )}

          <div>
            <h1 className={cn("text-2xl font-bold", colors.primary)}>
              {title}
            </h1>

            {description && (
              <p className="mt-1 text-sm text-gray-400">
                {description}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
};

export default ModuleHeader;
