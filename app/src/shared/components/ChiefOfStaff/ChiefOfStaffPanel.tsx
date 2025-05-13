import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@src/shared/utils/cn';
import { getGlassmorphismClasses } from '@src/shared/utils/glassmorphism';
import { Button } from '../ui/Button';

export interface ChiefOfStaffPanelProps {
  onClose: () => void;
  className?: string;
}

interface ActivityItem {
  id: string;
  type: 'task' | 'decision' | 'insight' | 'alert' | 'workflow';
  title: string;
  description: string;
  timestamp: string;
  module: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'waiting_approval';
  priority: 'low' | 'medium' | 'high' | 'critical';
  agent: string;
  actions?: React.ReactNode;
}

/**
 * ChiefOfStaffPanel - Right slide-in panel for the Chief of Staff operations log
 * 
 * Features:
 * - Real-time activity feed
 * - Categorized activities by type
 * - Filterable by module, status, and priority
 * - Action buttons for pending decisions
 */
export const ChiefOfStaffPanel: React.FC<ChiefOfStaffPanelProps> = ({
  onClose,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'decisions' | 'tasks' | 'insights'>('all');
  const [filter, setFilter] = useState<string>('');

  // Sample activity data
  const activities: ActivityItem[] = [
    {
      id: 'act-1',
      type: 'decision',
      title: 'Domain Spoof Response',
      description: 'Approve deployment of Redirect Shield for cauldron-app.net',
      timestamp: '2 minutes ago',
      module: 'phantom',
      status: 'waiting_approval',
      priority: 'high',
      agent: 'Security Coordinator',
      actions: (
        <div className="flex space-x-2">
          <Button size="xs" variant="primary">Approve</Button>
          <Button size="xs" variant="outline">Reject</Button>
        </div>
      ),
    },
    {
      id: 'act-2',
      type: 'task',
      title: 'Weekly Analytics Report',
      description: 'Generating weekly performance report for executive review',
      timestamp: '15 minutes ago',
      module: 'athena',
      status: 'in_progress',
      priority: 'medium',
      agent: 'Analytics Engine',
    },
    {
      id: 'act-3',
      type: 'insight',
      title: 'Email Campaign Optimization',
      description: 'Subject line A/B test shows 14% CTR improvement',
      timestamp: '1 hour ago',
      module: 'athena',
      status: 'completed',
      priority: 'medium',
      agent: 'Growth Advisor',
      actions: (
        <Button size="xs" variant="outline">View Details</Button>
      ),
    },
    {
      id: 'act-4',
      type: 'alert',
      title: 'Security Posture Change',
      description: 'Overall security score decreased from 92 to 87',
      timestamp: '3 hours ago',
      module: 'sentinel',
      status: 'pending',
      priority: 'medium',
      agent: 'Security Monitor',
      actions: (
        <Button size="xs" variant="outline">Investigate</Button>
      ),
    },
    {
      id: 'act-5',
      type: 'workflow',
      title: 'Content Generation Pipeline',
      description: 'Blog post draft ready for human review',
      timestamp: '5 hours ago',
      module: 'manifold',
      status: 'waiting_approval',
      priority: 'low',
      agent: 'Content Creator',
      actions: (
        <Button size="xs" variant="outline">Review Draft</Button>
      ),
    },
    {
      id: 'act-6',
      type: 'decision',
      title: 'Budget Allocation',
      description: 'Approve reallocation of marketing budget to high-performing channels',
      timestamp: '1 day ago',
      module: 'athena',
      status: 'waiting_approval',
      priority: 'high',
      agent: 'Financial Advisor',
      actions: (
        <div className="flex space-x-2">
          <Button size="xs" variant="primary">Approve</Button>
          <Button size="xs" variant="outline">Reject</Button>
        </div>
      ),
    },
    {
      id: 'act-7',
      type: 'task',
      title: 'Database Optimization',
      description: 'Scheduled maintenance completed successfully',
      timestamp: '1 day ago',
      module: 'sentinel',
      status: 'completed',
      priority: 'medium',
      agent: 'System Maintainer',
    },
  ];

  // Filter activities based on active tab and search filter
  const filteredActivities = activities.filter((activity) => {
    // Filter by tab
    if (activeTab === 'decisions' && activity.type !== 'decision') return false;
    if (activeTab === 'tasks' && activity.type !== 'task') return false;
    if (activeTab === 'insights' && activity.type !== 'insight') return false;

    // Filter by search
    if (filter && !activity.title.toLowerCase().includes(filter.toLowerCase()) && 
        !activity.description.toLowerCase().includes(filter.toLowerCase())) {
      return false;
    }

    return true;
  });

  // Status colors
  const statusColors = {
    pending: 'bg-yellow-500',
    in_progress: 'bg-blue-500',
    completed: 'bg-green-500',
    failed: 'bg-red-500',
    waiting_approval: 'bg-purple-500',
  };

  // Module colors
  const moduleColors = {
    phantom: 'text-red-400',
    athena: 'text-blue-400',
    sentinel: 'text-green-400',
    manifold: 'text-purple-400',
    forgeflow: 'text-yellow-400',
    arcana: 'text-pink-400',
  };

  // Priority labels
  const priorityLabels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical',
  };

  return (
    <div className={cn("flex h-full flex-col", className)}>
      {/* Header */}
      <div className="border-b border-gray-700/50 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Chief of Staff</h2>
          <button
            className="rounded-full p-1 text-gray-400 hover:text-white"
            onClick={onClose}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-gray-400">Real-time operations log and decision support</p>
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
              activeTab === 'decisions'
                ? "bg-gray-700 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            )}
            onClick={() => setActiveTab('decisions')}
          >
            Decisions
          </button>
          <button
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-sm font-medium",
              activeTab === 'tasks'
                ? "bg-gray-700 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            )}
            onClick={() => setActiveTab('tasks')}
          >
            Tasks
          </button>
          <button
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-sm font-medium",
              activeTab === 'insights'
                ? "bg-gray-700 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            )}
            onClick={() => setActiveTab('insights')}
          >
            Insights
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
            placeholder="Search activities..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Activity List */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence initial={false}>
          {filteredActivities.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center">
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
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="mt-2 text-center text-sm text-gray-500">
                No activities found.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActivities.map((activity) => (
                <motion.div
                  key={activity.id}
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
                    })
                  )}
                >
                  <div className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={cn(
                          "h-2 w-2 rounded-full",
                          statusColors[activity.status]
                        )} />
                        <h3 className="text-sm font-medium text-white">{activity.title}</h3>
                      </div>
                      <span className={cn(
                        "text-xs font-medium",
                        moduleColors[activity.module as keyof typeof moduleColors] || "text-gray-400"
                      )}>
                        {activity.module.charAt(0).toUpperCase() + activity.module.slice(1)}
                      </span>
                    </div>
                    <p className="mb-3 text-xs text-gray-300">{activity.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400">{activity.timestamp}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-400">{activity.agent}</span>
                      </div>
                      <span className="rounded-full bg-gray-700 px-2 py-0.5 text-xs font-medium text-gray-300">
                        {priorityLabels[activity.priority]}
                      </span>
                    </div>
                    {activity.actions && (
                      <div className="mt-3 flex justify-end">
                        {activity.actions}
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
            {filteredActivities.length} {filteredActivities.length === 1 ? 'activity' : 'activities'}
          </span>
          <Button size="sm" variant="outline">
            View All
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChiefOfStaffPanel;
