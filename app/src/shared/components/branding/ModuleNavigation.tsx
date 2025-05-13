import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { ModuleId, getModuleColors } from '../../theme/moduleColors';
import { getGlassmorphismClasses, GlassmorphismLevel } from '../../utils/glassmorphism';

export interface ModuleNavigationItem {
  /** Item label */
  label: string;
  /** Item path */
  path: string;
  /** Item icon */
  icon?: React.ReactNode;
  /** Whether the item is active */
  active?: boolean;
  /** Whether the item is disabled */
  disabled?: boolean;
}

export interface ModuleNavigationProps {
  /** Module ID for consistent styling */
  moduleId: ModuleId;
  /** Navigation items */
  items: ModuleNavigationItem[];
  /** Glass effect level */
  glassLevel?: GlassmorphismLevel;
  /** Whether to show a border */
  border?: boolean;
  /** Whether to show a shadow */
  shadow?: boolean;
  /** Whether to show icons */
  showIcons?: boolean;
  /** Whether to show labels */
  showLabels?: boolean;
  /** Whether to use vertical orientation */
  vertical?: boolean;
  /** Additional class name */
  className?: string;
}

/**
 * Module Navigation Component
 * 
 * A navigation component with cyberpunk styling for all modules.
 * 
 * @example
 * ```tsx
 * <ModuleNavigation
 *   moduleId="arcana"
 *   items={[
 *     { label: 'Dashboard', path: '/arcana', icon: <DashboardIcon /> },
 *     { label: 'Settings', path: '/arcana/settings', icon: <SettingsIcon /> },
 *   ]}
 * />
 * ```
 */
export const ModuleNavigation: React.FC<ModuleNavigationProps> = ({
  moduleId,
  items,
  glassLevel = 'medium',
  border = true,
  shadow = true,
  showIcons = true,
  showLabels = true,
  vertical = true,
  className = '',
}) => {
  const colors = getModuleColors(moduleId);
  const location = useLocation();
  
  // Check if an item is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <nav
      className={cn(
        getGlassmorphismClasses({
          level: glassLevel,
          border,
          shadow,
          borderColor: colors.border.replace('border-', ''),
        }),
        'rounded-lg overflow-hidden',
        vertical ? 'flex flex-col' : 'flex flex-row',
        className
      )}
    >
      {items.map((item, index) => {
        const active = item.active !== undefined ? item.active : isActive(item.path);
        
        return (
          <Link
            key={index}
            to={item.path}
            className={cn(
              'flex items-center transition-colors duration-200',
              vertical ? 'px-4 py-3' : 'px-4 py-2',
              active 
                ? cn(
                    'bg-gray-800/50',
                    colors.primary
                  )
                : 'text-gray-400 hover:text-white hover:bg-gray-800/30',
              item.disabled && 'opacity-50 pointer-events-none',
              !vertical && 'flex-1 justify-center'
            )}
          >
            {showIcons && item.icon && (
              <span className={cn(
                'flex-shrink-0',
                vertical ? 'mr-3' : showLabels ? 'mr-2' : '',
                active ? colors.icon : 'text-gray-400'
              )}>
                {item.icon}
              </span>
            )}
            
            {showLabels && (
              <span className={cn(
                'text-sm font-medium',
                active && colors.text
              )}>
                {item.label}
              </span>
            )}
            
            {active && (
              <span
                className={cn(
                  'absolute inset-y-0',
                  vertical ? 'left-0 w-1' : 'bottom-0 left-0 right-0 h-1',
                  `bg-${moduleId === 'arcana' ? 'purple' : moduleId === 'phantom' ? 'red' : moduleId === 'athena' ? 'blue' : 'gray'}-500`
                )}
                aria-hidden="true"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
};

export default ModuleNavigation;
