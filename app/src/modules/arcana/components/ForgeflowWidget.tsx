import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface Workflow {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed' | 'failed';
  progress: number;
  steps: number;
  completedSteps: number;
  type: string;
  agents?: string[];
  lastUpdated?: string;
}

interface ForgeflowWidgetProps {
  workflows?: Workflow[];
  loading?: boolean;
}

export const ForgeflowWidget: React.FC<ForgeflowWidgetProps> = ({
  workflows = [
    {
      id: 'wf-1',
      name: 'Content Generation Pipeline',
      status: 'active',
      progress: 0.65,
      steps: 5,
      completedSteps: 3,
      type: 'content',
      agents: ['Perception', 'Analysis', 'Action'],
      lastUpdated: '5 min ago',
    },
    {
      id: 'wf-2',
      name: 'Security Audit Workflow',
      status: 'paused',
      progress: 0.3,
      steps: 4,
      completedSteps: 1,
      type: 'security',
      agents: ['Perception', 'Coordinator'],
      lastUpdated: '1 hour ago',
    },
    {
      id: 'wf-3',
      name: 'Market Analysis',
      status: 'completed',
      progress: 1,
      steps: 6,
      completedSteps: 6,
      type: 'analysis',
      agents: ['Perception', 'Analysis', 'Feedback'],
      lastUpdated: '2 days ago',
    },
  ],
  loading = false
}) => {
  const [activeWorkflows, setActiveWorkflows] = useState<Workflow[]>(workflows);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePauseWorkflow = (id: string) => {
    setActiveWorkflows(
      activeWorkflows.map(workflow =>
        workflow.id === id
          ? { ...workflow, status: workflow.status === 'paused' ? 'active' : 'paused' }
          : workflow
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-900 text-green-300';
      case 'paused':
        return 'bg-yellow-900 text-yellow-300';
      case 'completed':
        return 'bg-blue-900 text-blue-300';
      case 'failed':
        return 'bg-red-900 text-red-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'content':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        );
      case 'security':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'analysis':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
        );
    }
  };

  const toggleWorkflowDetails = (id: string) => {
    if (selectedWorkflow === id) {
      setSelectedWorkflow(null);
    } else {
      setSelectedWorkflow(id);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <h2 className="text-xl font-bold text-green-400">Forgeflow Widget</h2>
          <span className="ml-2 px-2 py-0.5 bg-green-900 text-green-300 text-xs rounded-full">
            {activeWorkflows.filter(w => w.status === 'active').length} active
          </span>
        </div>
        <div className="flex items-center">
          <Link
            to="/forgeflow"
            className="text-sm text-blue-400 hover:text-blue-300 flex items-center mr-2"
          >
            View All
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <button
            className="text-gray-400 hover:text-white"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        ) : activeWorkflows.length > 0 ? (
          activeWorkflows.map(workflow => (
            <div
              key={workflow.id}
              className={`bg-gray-700 rounded-lg p-4 border ${
                selectedWorkflow === workflow.id ? 'border-green-500' : 'border-gray-600'
              } transition-colors duration-200 hover:border-green-500`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start">
                  <div className={`p-2 rounded-lg mr-3 ${
                    workflow.type === 'content' ? 'bg-pink-900/30' :
                    workflow.type === 'security' ? 'bg-red-900/30' :
                    'bg-blue-900/30'
                  }`}>
                    {getTypeIcon(workflow.type)}
                  </div>
                  <div>
                    <div className="font-medium flex items-center">
                      {workflow.name}
                      <button
                        className="ml-2 text-gray-400 hover:text-white"
                        onClick={() => toggleWorkflowDetails(workflow.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center mt-1">
                      <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(workflow.status)}`}>
                        {workflow.status}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">
                        {workflow.completedSteps}/{workflow.steps} steps
                      </span>
                      {workflow.lastUpdated && (
                        <span className="text-xs text-gray-500 ml-2">
                          • Updated {workflow.lastUpdated}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    className="p-1 rounded hover:bg-gray-600 text-gray-400 hover:text-white transition-colors"
                    onClick={() => handlePauseWorkflow(workflow.id)}
                    title={workflow.status === 'paused' ? 'Resume' : 'Pause'}
                  >
                    {workflow.status === 'paused' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </button>
                  <button
                    className="p-1 rounded hover:bg-gray-600 text-gray-400 hover:text-white transition-colors"
                    title="Edit"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="mt-3">
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      workflow.status === 'failed' ? 'bg-red-500' :
                      workflow.status === 'completed' ? 'bg-blue-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${workflow.progress * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Workflow details */}
              {selectedWorkflow === workflow.id && (
                <div className="mt-4 pt-3 border-t border-gray-600">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <div className="text-xs text-gray-400">Type</div>
                      <div className="text-sm font-medium text-gray-200 capitalize">{workflow.type}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Created</div>
                      <div className="text-sm font-medium text-gray-200">2 days ago</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Owner</div>
                      <div className="text-sm font-medium text-gray-200">System</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Priority</div>
                      <div className="text-sm font-medium text-gray-200">Medium</div>
                    </div>
                  </div>

                  {workflow.agents && workflow.agents.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs text-gray-400 mb-1">Active Agents</div>
                      <div className="flex flex-wrap gap-2">
                        {workflow.agents.map((agent, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded">
                            {agent}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end mt-2">
                    <button className="text-xs bg-gray-600 hover:bg-gray-500 text-gray-300 rounded px-2 py-1 transition-colors">
                      View Full Details
                    </button>
                  </div>
                </div>
              )}

              {/* Quick actions */}
              {(isExpanded || !selectedWorkflow) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="bg-gray-600 hover:bg-gray-500 text-xs text-gray-300 rounded px-2 py-1 transition-colors flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add step
                  </button>
                  <button className="bg-gray-600 hover:bg-gray-500 text-xs text-gray-300 rounded px-2 py-1 transition-colors flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    Notify me
                  </button>
                  <button className="bg-gray-600 hover:bg-gray-500 text-xs text-gray-300 rounded px-2 py-1 transition-colors flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    View logs
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>No active workflows</p>
            <Link
              to="/forgeflow"
              className="mt-2 inline-block px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white text-sm transition-colors"
            >
              Create Workflow
            </Link>
          </div>
        )}
      </div>

      {/* Quick create */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <button className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md py-2 flex items-center justify-center transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create New Workflow
        </button>
      </div>
    </div>
  );
};