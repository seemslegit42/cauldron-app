import React, { useState } from 'react';

interface Action {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  module: string;
  moduleColor: string;
  moduleIcon: React.ReactNode;
  user: string;
  status: 'completed' | 'failed' | 'in-progress';
}

interface RecentActionsProps {
  actions?: Action[];
  loading?: boolean;
  maxItems?: number;
  className?: string;
}

export const RecentActions: React.FC<RecentActionsProps> = ({
  actions = [],
  loading = false,
  maxItems = 5,
  className = '',
}) => {
  const [expandedAction, setExpandedAction] = useState<string | null>(null);
  const [filterModule, setFilterModule] = useState<string | null>(null);

  // Get status color
  const getStatusColor = (status: 'completed' | 'failed' | 'in-progress'): string => {
    switch (status) {
      case 'completed':
        return 'bg-green-900 text-green-300';
      case 'failed':
        return 'bg-red-900 text-red-300';
      case 'in-progress':
        return 'bg-blue-900 text-blue-300';
      default:
        return 'bg-gray-900 text-gray-300';
    }
  };

  // Toggle expanded action
  const toggleExpand = (actionId: string) => {
    if (expandedAction === actionId) {
      setExpandedAction(null);
    } else {
      setExpandedAction(actionId);
    }
  };

  // Use provided actions or empty array
  const displayActions = actions;

  // Get unique modules for filtering
  const modules = [...new Set(displayActions.map(action => action.module))];

  // Filter actions by module
  const filteredActions = filterModule
    ? displayActions.filter(action => action.module === filterModule)
    : displayActions;

  return (
    <div className={`rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-lg ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-purple-400">Recent Actions</h2>
        <div className="flex space-x-2">
          <select
            className="rounded bg-gray-700 px-2 py-1 text-sm text-white"
            value={filterModule || ''}
            onChange={(e) => setFilterModule(e.target.value || null)}
            aria-label="Filter by module"
            title="Filter by module"
          >
            <option value="">All Modules</option>
            {modules.map((module) => (
              <option key={module} value={module}>
                {module}
              </option>
            ))}
          </select>
          {filteredActions.length > maxItems && (
            <button type="button" className="rounded px-3 py-1 text-sm text-gray-400 transition-colors hover:bg-gray-700 hover:text-white">
              View All
            </button>
          )}
        </div>
      </div>
      <div className="space-y-3">
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
          </div>
        ) : filteredActions.length > 0 ? (
          filteredActions.slice(0, maxItems).map((action) => (
            <div
              key={action.id}
              className="rounded-lg border border-gray-700 bg-gray-700 p-4 transition-colors duration-200 hover:border-purple-500"
            >
              <div className="flex justify-between">
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => toggleExpand(action.id)}
                >
                  <div className={`mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 ${action.moduleColor}`}>
                    {action.moduleIcon}
                  </div>
                  <div>
                    <div className="font-medium">{action.title}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(action.timestamp).toLocaleString()} • {action.user}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div
                    className={`rounded px-2 py-0.5 text-xs ${getStatusColor(action.status)}`}
                  >
                    {action.status}
                  </div>
                  <div className="mt-1 text-xs text-gray-400">
                    {action.module}
                  </div>
                </div>
              </div>

              {expandedAction === action.id && (
                <div className="mt-3 border-t border-gray-600 pt-3">
                  <p className="text-sm text-gray-300">{action.description}</p>
                  <div className="mt-3 flex justify-end space-x-2">
                    <button type="button" className="flex items-center rounded bg-gray-600 px-3 py-1 text-xs text-white transition-colors hover:bg-gray-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-1 h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      Details
                    </button>
                    <button type="button" className="flex items-center rounded bg-purple-600 px-3 py-1 text-xs text-white transition-colors hover:bg-purple-700">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-1 h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                      Go to Module
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="py-4 text-center text-gray-400">No recent actions</div>
        )}
      </div>
    </div>
  );
};