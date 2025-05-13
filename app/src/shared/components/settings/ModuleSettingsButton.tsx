import React from 'react';
import { Link } from 'react-router-dom';
import { FiSettings } from 'react-icons/fi';
import { cn } from '@src/shared/utils/cn';

export interface ModuleSettingsButtonProps {
  /** Module ID */
  moduleId: string;
  /** Additional class name */
  className?: string;
  /** Button variant */
  variant?: 'icon' | 'text' | 'full';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Button position */
  position?: 'top-right' | 'inline';
}

/**
 * Module Settings Button
 * 
 * A button that links to the settings page for a module.
 */
export const ModuleSettingsButton: React.FC<ModuleSettingsButtonProps> = ({
  moduleId,
  className = '',
  variant = 'icon',
  size = 'md',
  position = 'top-right',
}) => {
  const settingsUrl = `/${moduleId}/settings`;
  
  // Base styles
  const baseStyles = cn(
    'transition-colors duration-200',
    {
      'absolute top-4 right-4 z-10': position === 'top-right',
      'inline-flex': position === 'inline',
      'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200': true,
      'p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800': variant === 'icon',
      'px-3 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800': variant === 'text' || variant === 'full',
      'text-sm': size === 'sm',
      'text-base': size === 'md',
      'text-lg': size === 'lg',
    },
    className
  );
  
  // Icon size
  const iconSize = {
    sm: '1rem',
    md: '1.25rem',
    lg: '1.5rem',
  }[size];
  
  return (
    <Link to={settingsUrl} className={baseStyles} title="Module Settings">
      {variant === 'icon' && (
        <FiSettings size={iconSize} />
      )}
      
      {variant === 'text' && (
        <span>Settings</span>
      )}
      
      {variant === 'full' && (
        <div className="flex items-center space-x-2">
          <FiSettings size={iconSize} />
          <span>Settings</span>
        </div>
      )}
    </Link>
  );
};
