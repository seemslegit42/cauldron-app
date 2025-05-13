import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from 'wasp/client/auth';
import { cn } from '@src/shared/utils/cn';
import { getGlassmorphismClasses } from '@src/shared/utils/glassmorphism';
import { CommandPalette } from '../ui/CommandPalette';
import { SentientLoopIndicator } from '../SentientLoop/SentientLoopIndicator';
import { ModuleNavigation } from '../navigation/ModuleNavigation';
import { ChiefOfStaffPanel } from '../ChiefOfStaff/ChiefOfStaffPanel';
import { RiskLevelIndicator } from '../security/RiskLevelIndicator';
import { NotificationsPanel } from '../notifications/NotificationsPanel';
import { UserMenu } from '../auth/UserMenu';
import { useKeyboardShortcut } from '@src/shared/hooks/useKeyboardShortcut';

export interface CauldronLayoutProps {
  children: React.ReactNode;
  activeModule?: string;
  showChiefOfStaff?: boolean;
  backgroundPattern?: 'grid' | 'hex' | 'circuit' | 'none';
  className?: string;
}

/**
 * CauldronLayout - The main layout component for the Cauldron™ DOP
 * 
 * Features:
 * - Left sidebar with module navigation
 * - Top bar with date/time, AI status, and quick actions
 * - Right slide-in panel for Chief of Staff operations log
 * - Animated transitions between pages
 * - Command palette (Cmd+K) for quick navigation and actions
 * - Cyberpunk-inspired design with glassmorphism effects
 */
export const CauldronLayout: React.FC<CauldronLayoutProps> = ({
  children,
  activeModule,
  showChiefOfStaff = true,
  backgroundPattern = 'grid',
  className,
}) => {
  const { data: user } = useUser();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isChiefOfStaffOpen, setIsChiefOfStaffOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Toggle command palette with Cmd+K
  useKeyboardShortcut('k', (e) => {
    if (e.metaKey || e.ctrlKey) {
      e.preventDefault();
      setIsCommandPaletteOpen(!isCommandPaletteOpen);
    }
  });

  // Get current date and time
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format date and time
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(currentDateTime);
  
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  }).format(currentDateTime);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      {/* Background pattern */}
      {backgroundPattern !== 'none' && (
        <div 
          className={cn(
            "fixed inset-0 z-0 opacity-10",
            {
              "bg-[url('/assets/patterns/grid-pattern.svg')]": backgroundPattern === 'grid',
              "bg-[url('/assets/patterns/hex-pattern.svg')]": backgroundPattern === 'hex',
              "bg-[url('/assets/patterns/circuit-pattern.svg')]": backgroundPattern === 'circuit',
            }
          )}
        />
      )}

      {/* Left Sidebar - Module Navigation */}
      <aside className={cn(
        "fixed left-0 top-0 bottom-0 z-20 w-16 transition-all duration-300 md:w-64",
        getGlassmorphismClasses({
          level: 'heavy',
          border: true,
          shadow: true,
          className: 'border-l-0 border-y-0'
        })
      )}>
        <ModuleNavigation activeModule={activeModule} />
      </aside>

      {/* Top Bar */}
      <header className={cn(
        "fixed top-0 left-16 right-0 z-20 flex h-16 items-center justify-between px-4 md:left-64",
        getGlassmorphismClasses({
          level: 'medium',
          border: true,
          shadow: true,
          className: 'border-t-0 border-x-0'
        })
      )}>
        {/* Left section - Date and Time */}
        <div className="flex items-center space-x-4">
          <div className="text-sm font-mono">
            <span className="text-gray-400">{formattedDate}</span>
            <span className="ml-2 text-primary-500">{formattedTime}</span>
          </div>
          <SentientLoopIndicator />
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center space-x-4">
          <button 
            className="rounded-full p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
            onClick={() => setIsCommandPaletteOpen(true)}
          >
            <span className="sr-only">Open command palette</span>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          
          <RiskLevelIndicator />
          
          <button 
            className="rounded-full p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
            onClick={() => setIsNotificationsOpen(true)}
          >
            <span className="sr-only">View notifications</span>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          
          {showChiefOfStaff && (
            <button 
              className="rounded-full p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
              onClick={() => setIsChiefOfStaffOpen(!isChiefOfStaffOpen)}
            >
              <span className="sr-only">Toggle Chief of Staff</span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </button>
          )}
          
          <UserMenu user={user} />
        </div>
      </header>

      {/* Main Content */}
      <main className={cn(
        "ml-16 mt-16 min-h-[calc(100vh-4rem)] p-6 transition-all duration-300 md:ml-64",
        className
      )}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeModule || 'default'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Right Slide-In Panel - Chief of Staff */}
      <AnimatePresence>
        {isChiefOfStaffOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={cn(
              "fixed right-0 top-16 bottom-0 z-30 w-80 overflow-y-auto",
              getGlassmorphismClasses({
                level: 'heavy',
                border: true,
                shadow: true,
                className: 'border-r-0 border-y-0'
              })
            )}
          >
            <ChiefOfStaffPanel onClose={() => setIsChiefOfStaffOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Command Palette */}
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
      />

      {/* Notifications Panel */}
      <NotificationsPanel 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
      />

      {/* XP/Operator Bar */}
      <footer className={cn(
        "fixed bottom-0 left-16 right-0 z-20 h-4 md:left-64",
        getGlassmorphismClasses({
          level: 'light',
          border: true,
          shadow: true,
          className: 'border-b-0 border-x-0'
        })
      )}>
        <motion.div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          style={{ width: '35%' }}
          animate={{ 
            width: ['35%', '36%', '35%'],
            opacity: [1, 0.8, 1]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            repeatType: 'reverse' 
          }}
        />
      </footer>
    </div>
  );
};

export default CauldronLayout;
