/**
 * ArcanaNav Component
 *
 * Navigation component for the Arcana module.
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@src/shared/utils/cn';
import { getGlassmorphismClasses } from '@src/shared/utils/glassmorphism';
import {
  Home,
  Settings,
  Users,
  Brain,
  Sparkles,
  Cpu,
  LayoutDashboard
} from 'lucide-react';

export interface ArcanaNavProps {
  className?: string;
}

/**
 * ArcanaNav - Navigation component for the Arcana module
 */
export const ArcanaNav: React.FC<ArcanaNavProps> = ({
  className,
}) => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Navigation items
  const navItems = [
    {
      name: 'Dashboard',
      path: '/arcana',
      icon: <Home size={18} />,
    },
    {
      name: 'Sentient Loop',
      path: '/arcana/sentient-loop',
      icon: <Brain size={18} />,
    },
    {
      name: 'Personas',
      path: '/arcana/personas',
      icon: <Users size={18} />,
    },
    {
      name: 'Settings',
      path: '/arcana/settings',
      icon: <Settings size={18} />,
    },
    {
      name: 'Sentient UI Demo',
      path: '/arcana/sentient-ui-demo',
      icon: <Sparkles size={18} />,
    },
  ];

  // Check if a path is active
  const isActive = (path: string) => {
    return currentPath === path;
  };

  return (
    <div className={cn(
      "mb-6 overflow-hidden rounded-lg",
      getGlassmorphismClasses({ level: 'medium', border: true, shadow: true }),
      className
    )}>
      <div className="p-4">
        <div className="mb-4 flex items-center">
          <Cpu size={20} className="mr-2 text-purple-400" />
          <h2 className="text-lg font-bold text-white">Arcana Navigation</h2>
        </div>

        <nav className="flex flex-col space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive(item.path)
                  ? "bg-gray-700 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              )}
            >
              <span className="mr-2">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default ArcanaNav;
