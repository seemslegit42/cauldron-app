import React, { useState, ReactNode } from 'react';
import { type AuthUser } from 'wasp/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../shared/utils/cn';
import { getGlassmorphismClasses } from '../../shared/utils/glassmorphism';
import { Command } from 'lucide-react';
import AlchemicalSidebar from './AlchemicalSidebar';
import AlchemicalHeader from './AlchemicalHeader';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../shared/components/ui/tooltip';

interface AlchemicalAdminLayoutProps {
  user: AuthUser;
  children?: ReactNode;
}

/**
 * AlchemicalAdminLayout - A corporate cyberpunk themed admin layout
 * 
 * Features:
 * - Glassmorphism styling
 * - Animated transitions
 * - Collapsible sidebar
 * - Service health indicators in header
 * - Floating command button
 */
const AlchemicalAdminLayout: React.FC<AlchemicalAdminLayoutProps> = ({ children, user }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      {/* Background grid overlay */}
      <div className="fixed inset-0 z-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
      
      {/* Main layout */}
      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* Sidebar */}
        <AlchemicalSidebar 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
        />

        {/* Content Area */}
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          {/* Header */}
          <AlchemicalHeader 
            sidebarOpen={sidebarOpen} 
            setSidebarOpen={setSidebarOpen} 
            user={user} 
          />

          {/* Main Content */}
          <main className="flex-1">
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>

      {/* Floating Command Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              className={cn(
                "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full",
                "bg-indigo-600 text-white shadow-lg transition-all hover:bg-indigo-700",
                "border border-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.5)]"
              )}
            >
              <Command className="h-6 w-6" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Command Center</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default AlchemicalAdminLayout;
