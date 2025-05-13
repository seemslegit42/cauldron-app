import React, { useState } from 'react';

interface AgentUpdate {
  id: string;
  agentName: string;
  agentIcon: React.ReactNode;
  agentColor: string;
  message: string;
  timestamp: string;
  status: 'active' | 'completed' | 'pending' | 'failed';
  details?: string;
}

interface AgentUpdatesProps {
  updates?: AgentUpdate[];
  loading?: boolean;
  maxItems?: number;
  className?: string;
}

export const AgentUpdates: React.FC<AgentUpdatesProps> = ({
  updates = [],
  loading = false,
  maxItems = 5,
  className = '',
}) => {
  const [expandedUpdate, setExpandedUpdate] = useState<string | null>(null);

  // Get status badge color
  const getStatusColor = (status: 'active' | 'completed' | 'pending' | 'failed'): string => {
    switch (status) {
      case 'active':
        return 'bg-blue-900 text-blue-300';
      case 'completed':
        return 'bg-green-900 text-green-300';
      case 'pending':
        return 'bg-yellow-900 text-yellow-300';
      case 'failed':
        return 'bg-red-900 text-red-300';
      default:
        return 'bg-gray-900 text-gray-300';
    }
  };

  // Toggle expanded update
  const toggleExpand = (updateId: string) => {
    if (expandedUpdate === updateId) {
      setExpandedUpdate(null);
    } else {
      setExpandedUpdate(updateId);
    }
  };

  // Sample agent updates if none are provided
  const sampleUpdates: AgentUpdate[] = [
    {
      id: '1',
      agentName: 'Phantom',
      agentIcon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      agentColor: 'text-blue-400',
      message: 'Completed security scan of all endpoints',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      status: 'completed',
      details: 'Scanned 24 endpoints. Found 0 critical vulnerabilities, 2 medium vulnerabilities, and 5 low vulnerabilities. Detailed report available in the Security module.',
    },
    {
      id: '2',
      agentName: 'Athena',
      agentIcon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      agentColor: 'text-purple-400',
      message: 'Analyzing campaign performance data',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      status: 'active',
      details: 'Currently analyzing data from 3 active campaigns. Preliminary results show a 12% increase in engagement for Campaign A, 5% decrease for Campaign B, and stable metrics for Campaign C.',
    },
    {
      id: '3',
      agentName: 'Forgeflow',
      agentIcon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      agentColor: 'text-green-400',
      message: 'Scheduled content distribution workflow',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      status: 'pending',
      details: 'Workflow "Weekly Content Distribution" has been scheduled to run at 9:00 AM tomorrow. This workflow will distribute content to 5 platforms and generate performance reports.',
    },
    {
      id: '4',
      agentName: 'Sentinel',
      agentIcon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      agentColor: 'text-red-400',
      message: 'Detected unusual network activity',
      timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      status: 'completed',
      details: 'Detected unusual outbound traffic from server-03. Investigation revealed it was a scheduled backup process that was not properly documented. Added to known patterns database.',
    },
    {
      id: '5',
      agentName: 'Chief of Staff',
      agentIcon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      agentColor: 'text-yellow-400',
      message: 'Daily briefing prepared',
      timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
      status: 'completed',
      details: 'Daily briefing has been prepared with 3 key insights, 2 pending decisions, and 1 high-priority action item. Review it in the Briefings section.',
    },
  ];

  // Use sample updates if none are provided
  const displayUpdates = updates.length > 0 ? updates : sampleUpdates;

  return (
    <div className={`rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-lg ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-green-400">Agent Updates</h2>
        {displayUpdates.length > maxItems && (
          <button className="rounded px-3 py-1 text-sm text-gray-400 transition-colors hover:bg-gray-700 hover:text-white">
            View All
          </button>
        )}
      </div>
      <div className="space-y-3">
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
          </div>
        ) : displayUpdates.length > 0 ? (
          displayUpdates.slice(0, maxItems).map((update) => (
            <div
              key={update.id}
              className="rounded-lg border border-gray-700 bg-gray-700 p-4 transition-colors duration-200 hover:border-green-500"
            >
              <div className="flex justify-between">
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => toggleExpand(update.id)}
                >
                  <div className={`mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 ${update.agentColor}`}>
                    {update.agentIcon}
                  </div>
                  <div>
                    <div className="font-medium">{update.agentName}</div>
                    <div className="text-sm text-gray-400">{update.message}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div
                    className={`rounded px-2 py-0.5 text-xs ${getStatusColor(update.status)}`}
                  >
                    {update.status}
                  </div>
                  <div className="mt-1 text-xs text-gray-400">
                    {new Date(update.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
              
              {expandedUpdate === update.id && update.details && (
                <div className="mt-3 border-t border-gray-600 pt-3">
                  <p className="text-sm text-gray-300">{update.details}</p>
                  <div className="mt-3 flex justify-end space-x-2">
                    <button className="flex items-center rounded bg-gray-600 px-3 py-1 text-xs text-white transition-colors hover:bg-gray-500">
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
                    <button className="flex items-center rounded bg-green-600 px-3 py-1 text-xs text-white transition-colors hover:bg-green-700">
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
                      Go to Agent
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="py-4 text-center text-gray-400">No agent updates</div>
        )}
      </div>
    </div>
  );
};