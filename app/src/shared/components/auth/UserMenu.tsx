import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn } from '@src/shared/utils/cn';
import { getGlassmorphismClasses } from '@src/shared/utils/glassmorphism';
import { Button } from '../ui/Button';

export interface UserMenuProps {
  user?: any;
  className?: string;
}

/**
 * UserMenu - User profile menu component
 * 
 * Features:
 * - User profile information
 * - Account settings
 * - Theme toggle
 * - Logout
 */
export const UserMenu: React.FC<UserMenuProps> = ({
  user,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Handle logout
  const handleLogout = () => {
    // Implement logout logic here
    console.log('Logging out...');
  };

  return (
    <div className={cn("relative", className)} ref={menuRef}>
      {/* User Avatar Button */}
      <button
        className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white hover:opacity-90"
        onClick={toggleMenu}
      >
        {user?.username?.charAt(0).toUpperCase() || 'U'}
      </button>

      {/* Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-lg",
              getGlassmorphismClasses({
                level: 'heavy',
                border: true,
                shadow: true,
              })
            )}
          >
            {/* User Info */}
            <div className="border-b border-gray-700/50 p-4">
              <div className="flex items-center">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="ml-3">
                  <p className="font-medium text-white">{user?.username || 'User'}</p>
                  <p className="text-sm text-gray-400">{user?.email || 'user@example.com'}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              <Link
                to="/profile"
                className="flex items-center rounded-md px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </Link>
              <Link
                to="/settings"
                className="flex items-center rounded-md px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </Link>
              <Link
                to="/api-keys"
                className="flex items-center rounded-md px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                API Keys
              </Link>
              <div className="my-2 border-t border-gray-700/50"></div>
              <button
                className="flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
              >
                <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-700/50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Cauldron™ DOP v2.3.0</span>
                <Link
                  to="/help"
                  className="text-xs text-blue-400 hover:text-blue-300"
                  onClick={() => setIsOpen(false)}
                >
                  Help
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;
