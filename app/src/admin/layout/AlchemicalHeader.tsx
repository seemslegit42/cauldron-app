import React from 'react';
import { type AuthUser } from 'wasp/auth';
import { motion } from 'framer-motion';
import { Menu, Bell, MessageSquare } from 'lucide-react';
import { cn } from '../../shared/utils/cn';
import { getGlassmorphismClasses } from '../../shared/utils/glassmorphism';
import { DarkModeToggle } from '../../shared/theme';
import DropdownUser from '../../user/DropdownUser';
import ServiceHealthIndicator from '../components/ServiceHealthIndicator';

interface AlchemicalHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg0: boolean) => void;
  user: AuthUser;
}

/**
 * AlchemicalHeader - Corporate cyberpunk themed header with service health indicators
 */
const AlchemicalHeader: React.FC<AlchemicalHeaderProps> = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  user 
}) => {
  // Mock service health data - in a real app, this would come from an API
  const services = [
    { name: 'Phantom', status: 'healthy', latency: 45 },
    { name: 'Sentinel', status: 'healthy', latency: 32 },
    { name: 'Arcana', status: 'warning', latency: 120 },
    { name: 'Forgeflow', status: 'healthy', latency: 67 },
  ];

  return (
    <header 
      className={cn(
        "sticky top-0 z-999 flex w-full",
        getGlassmorphismClasses({ 
          level: 'medium', 
          border: true, 
          shadow: true 
        })
      )}
    >
      <div className="flex flex-grow items-center justify-between px-4 py-4 md:px-6 2xl:px-8">
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          {/* Hamburger Toggle Button */}
          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              setSidebarOpen(!sidebarOpen);
            }}
            className="z-99999 block rounded-sm border border-gray-700 bg-gray-800 p-1.5 shadow-sm lg:hidden"
          >
            <Menu className="h-5 w-5 text-gray-300" />
          </button>
        </div>

        {/* Service Health Indicators */}
        <div className="hidden md:flex items-center space-x-4">
          {services.map((service) => (
            <ServiceHealthIndicator
              key={service.name}
              name={service.name}
              status={service.status}
              latency={service.latency}
            />
          ))}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3 2xl:gap-7">
          {/* Notification Bell with Pulse Effect */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="relative"
          >
            <button className="flex h-8.5 w-8.5 items-center justify-center rounded-full border border-gray-700 bg-gray-800 hover:text-indigo-400">
              <Bell className="h-5 w-5 duration-300" />
            </button>
            <span className="absolute -right-0.5 -top-0.5 z-1 h-2 w-2 rounded-full bg-red-500">
              <span className="absolute -z-1 inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
            </span>
          </motion.div>

          {/* Messages */}
          <motion.div
            whileHover={{ scale: 1.1 }}
          >
            <button className="flex h-8.5 w-8.5 items-center justify-center rounded-full border border-gray-700 bg-gray-800 hover:text-indigo-400">
              <MessageSquare className="h-5 w-5 duration-300" />
            </button>
          </motion.div>

          {/* Dark Mode Toggle */}
          <DarkModeToggle />

          {/* User Dropdown */}
          <DropdownUser user={user} />
        </div>
      </div>
    </header>
  );
};

export default AlchemicalHeader;
