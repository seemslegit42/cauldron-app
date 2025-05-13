import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@src/shared/utils/cn';
import { getGlassmorphismClasses } from '@src/shared/utils/glassmorphism';
import { Button } from '../ui/Button';

export interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  module: string;
  read: boolean;
  actions?: React.ReactNode;
}

/**
 * NotificationsPanel - Panel for displaying system notifications
 * 
 * Features:
 * - Categorized notifications by type
 * - Read/unread status
 * - Filterable by module and type
 * - Action buttons for notifications
 */
export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  isOpen,
  onClose,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [filter, setFilter] = useState<string>('');

  // Sample notifications data
  const notifications: Notification[] = [
    {
      id: 'notif-1',
      title: 'Security Alert',
      message: 'Domain spoof detected at cauldron-app.net',
      timestamp: '2 minutes ago',
      type: 'warning',
      module: 'phantom',
      read: false,
      actions: (
        <Button size="xs" variant="outline">View Details</Button>
      ),
    },
    {
      id: 'notif-2',
      title: 'Workflow Completed',
      message: 'Content Generation Pipeline completed successfully',
      timestamp: '15 minutes ago',
      type: 'success',
      module: 'forgeflow',
      read: false,
      actions: (
        <Button size="xs" variant="outline">View Results</Button>
      ),
    },
    {
      id: 'notif-3',
      title: 'New Insight',
      message: 'Email campaign CTR increased by 14% after subject line changes',
      timestamp: '1 hour ago',
      type: 'info',
      module: 'athena',
      read: true,
      actions: (
        <Button size="xs" variant="outline">View Analysis</Button>
      ),
    },
    {
      id: 'notif-4',
      title: 'System Update',
      message: 'Cauldron platform updated to version 2.3.0',
      timestamp: '3 hours ago',
      type: 'info',
      module: 'system',
      read: true,
    },
    {
      id: 'notif-5',
      title: 'Authentication Failure',
      message: 'Multiple failed login attempts detected from IP 192.168.1.254',
      timestamp: '5 hours ago',
      type: 'error',
      module: 'sentinel',
      read: true,
      actions: (
        <Button size="xs" variant="outline">Block IP</Button>
      ),
    },
  ];

  // Filter notifications based on active tab and search filter
  const filteredNotifications = notifications.filter((notification) => {
    // Filter by tab
    if (activeTab === 'unread' && notification.read) return false;

    // Filter by search
    if (filter && !notification.title.toLowerCase().includes(filter.toLowerCase()) && 
        !notification.message.toLowerCase().includes(filter.toLowerCase())) {
      return false;
    }

    return true;
  });

  // Type colors
  const typeColors = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  // Module colors
  const moduleColors = {
    phantom: 'text-red-400',
    athena: 'text-blue-400',
    sentinel: 'text-green-400',
    forgeflow: 'text-yellow-400',
    system: 'text-gray-400',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed right-4 top-20 z-50 w-96 overflow-hidden rounded-lg",
              getGlassmorphismClasses({
                level: 'heavy',
                border: true,
                shadow: true,
              }),
              className
            )}
          >
            {/* Header */}
            <div className="border-b border-gray-700/50 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Notifications</h2>
                <button
                  className="rounded-full p-1 text-gray-400 hover:text-white"
                  onClick={onClose}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-700/50 p-2">
              <div className="flex space-x-1">
                <button
                  className={cn(
                    "flex-1 rounded-md px-3 py-1.5 text-sm font-medium",
                    activeTab === 'all'
                      ? "bg-gray-700 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  )}
                  onClick={() => setActiveTab('all')}
                >
                  All
                </button>
                <button
                  className={cn(
                    "flex-1 rounded-md px-3 py-1.5 text-sm font-medium",
                    activeTab === 'unread'
                      ? "bg-gray-700 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  )}
                  onClick={() => setActiveTab('unread')}
                >
                  Unread
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="border-b border-gray-700/50 p-4">
              <div className="relative">
                <svg
                  className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-700 bg-gray-800 py-2 pl-10 pr-4 text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Search notifications..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-96 overflow-y-auto p-4">
              <AnimatePresence initial={false}>
                {filteredNotifications.length === 0 ? (
                  <div className="flex h-32 flex-col items-center justify-center">
                    <svg
                      className="h-12 w-12 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                    <p className="mt-2 text-center text-sm text-gray-500">
                      No notifications found.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredNotifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "overflow-hidden rounded-lg",
                          getGlassmorphismClasses({
                            level: 'light',
                            border: true,
                            shadow: true,
                          }),
                          notification.read ? "opacity-70" : ""
                        )}
                      >
                        <div className="p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className={cn(
                                "h-2 w-2 rounded-full",
                                typeColors[notification.type]
                              )} />
                              <h3 className="text-sm font-medium text-white">{notification.title}</h3>
                            </div>
                            <span className={cn(
                              "text-xs font-medium",
                              moduleColors[notification.module as keyof typeof moduleColors] || "text-gray-400"
                            )}>
                              {notification.module.charAt(0).toUpperCase() + notification.module.slice(1)}
                            </span>
                          </div>
                          <p className="mb-3 text-xs text-gray-300">{notification.message}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">{notification.timestamp}</span>
                            {!notification.read && (
                              <span className="rounded-full bg-blue-900 px-2 py-0.5 text-xs font-medium text-blue-200">
                                New
                              </span>
                            )}
                          </div>
                          {notification.actions && (
                            <div className="mt-3 flex justify-end">
                              {notification.actions}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-700/50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {filteredNotifications.length} {filteredNotifications.length === 1 ? 'notification' : 'notifications'}
                </span>
                <Button size="sm" variant="outline">
                  Mark All as Read
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationsPanel;
