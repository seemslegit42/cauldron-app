import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@src/shared/utils/cn';
import { Tooltip } from '../ui/Tooltip';

export interface ModuleNavigationProps {
  activeModule?: string;
  className?: string;
}

interface Module {
  id: string;
  name: string;
  path: string;
  icon: React.ReactNode;
  description: string;
  status?: 'active' | 'warning' | 'error' | 'new';
}

/**
 * ModuleNavigation - Navigation sidebar for Cauldron modules
 * 
 * Features:
 * - Vertical command palette for all modules
 * - Active state indication
 * - Module status indicators
 * - Tooltips with module descriptions
 * - Animated transitions
 */
export const ModuleNavigation: React.FC<ModuleNavigationProps> = ({
  activeModule,
  className,
}) => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Define the modules
  const modules: Module[] = [
    {
      id: 'arcana',
      name: 'Arcana',
      path: '/arcana',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      description: 'Command center UI with personalized insights',
    },
    {
      id: 'phantom',
      name: 'Phantom',
      path: '/phantom',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      description: 'Cybersecurity monitoring and threat detection',
      status: 'warning',
    },
    {
      id: 'athena',
      name: 'Athena',
      path: '/athena',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      description: 'Business intelligence and decision support',
    },
    {
      id: 'forgeflow',
      name: 'Forgeflow',
      path: '/forgeflow',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      description: 'Visual no-code agent builder',
      status: 'new',
    },
    {
      id: 'sentinel',
      name: 'Sentinel',
      path: '/sentinel',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      description: 'Security posture monitoring and management',
    },
    {
      id: 'manifold',
      name: 'Manifold',
      path: '/manifold',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      description: 'AI-driven blog post generation',
    },
  ];

  // Status indicator colors
  const statusColors = {
    active: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    new: 'bg-blue-500',
  };

  return (
    <nav className={cn("flex h-full flex-col py-6", className)}>
      {/* Logo */}
      <div className="mb-8 flex items-center justify-center">
        <Link to="/" className="text-2xl font-bold text-white">
          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>

      {/* Module Links */}
      <div className="flex flex-1 flex-col space-y-2">
        {modules.map((module) => {
          const isActive = currentPath.includes(module.path) || activeModule === module.id;
          
          return (
            <Tooltip key={module.id} content={module.description} side="right">
              <Link
                to={module.path}
                className={cn(
                  "relative flex items-center justify-center p-3 transition-all duration-200 md:justify-start md:px-4",
                  isActive
                    ? "text-white"
                    : "text-gray-400 hover:text-white"
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeModule"
                    className="absolute inset-0 rounded-md bg-gray-800"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
                
                {/* Icon */}
                <span className="relative z-10">{module.icon}</span>
                
                {/* Module name (hidden on mobile) */}
                <span className="relative z-10 ml-3 hidden text-sm font-medium md:block">
                  {module.name}
                </span>
                
                {/* Status indicator */}
                {module.status && (
                  <span className={cn(
                    "absolute right-2 top-2 h-2 w-2 rounded-full",
                    statusColors[module.status]
                  )} />
                )}
              </Link>
            </Tooltip>
          );
        })}
      </div>

      {/* Settings Link */}
      <div className="mt-auto">
        <Tooltip content="Settings" side="right">
          <Link
            to="/settings"
            className="flex items-center justify-center p-3 text-gray-400 transition-all duration-200 hover:text-white md:justify-start md:px-4"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="ml-3 hidden text-sm font-medium md:block">Settings</span>
          </Link>
        </Tooltip>
      </div>
    </nav>
  );
};

export default ModuleNavigation;
