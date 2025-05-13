import React, { useState, useEffect } from 'react';
import { useAction } from 'wasp/client/operations';
import { Link } from 'react-router-dom';
import { executeSentientAction } from '../api/operations';

interface SentientAction {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  module: string;
  moduleIcon: React.ReactNode;
  options: {
    id: string;
    label: string;
    description: string;
    isRecommended: boolean;
  }[];
}

interface SentientLoopPanelProps {
  actions?: SentientAction[];
  loading?: boolean;
  className?: string;
  onActionExecuted?: (actionId: string, optionId: string) => void;
}

export const SentientLoopPanel: React.FC<SentientLoopPanelProps> = ({
  actions = [],
  loading = false,
  className = '',
  onActionExecuted,
}) => {
  const [expandedAction, setExpandedAction] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [executingAction, setExecutingAction] = useState<string | null>(null);
  const [pulseEffect, setPulseEffect] = useState(true);
  const executeSentientActionFn = useAction(executeSentientAction);

  // Disable pulse effect after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setPulseEffect(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Get impact color
  const getImpactColor = (impact: 'high' | 'medium' | 'low'): string => {
    switch (impact) {
      case 'high':
        return 'bg-red-900 text-red-300';
      case 'medium':
        return 'bg-yellow-900 text-yellow-300';
      case 'low':
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
      // Set the recommended option as selected by default
      const action = actions.find(a => a.id === actionId);
      if (action) {
        const recommendedOption = action.options.find(o => o.isRecommended);
        if (recommendedOption) {
          setSelectedOptions(prev => ({
            ...prev,
            [actionId]: recommendedOption.id,
          }));
        }
      }
    }
  };

  // Handle option selection
  const handleOptionSelect = (actionId: string, optionId: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [actionId]: optionId,
    }));
  };

  // Execute action
  const handleExecuteAction = async (actionId: string) => {
    const optionId = selectedOptions[actionId];
    if (!optionId) return;

    setExecutingAction(actionId);
    try {
      await executeSentientActionFn({
        actionId,
        optionId,
      });

      if (onActionExecuted) {
        onActionExecuted(actionId, optionId);
      }
    } catch (error) {
      console.error('Error executing action:', error);
    } finally {
      setExecutingAction(null);
      setExpandedAction(null);
    }
  };

  // Use provided actions
  const displayActions = actions;

  return (
    <div className={`rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-lg ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className={`mr-3 h-3 w-3 rounded-full bg-purple-500 ${pulseEffect ? 'animate-pulse' : ''}`}></div>
          <h2 className="text-xl font-bold text-purple-400">Sentient Loop™</h2>
        </div>
        <div className="flex items-center">
          <div className="mr-3 text-sm text-gray-400">
            AI-powered decision engine
          </div>
          <Link
            to="/arcana/sentient-loop"
            className="rounded-md bg-gray-700 px-2 py-1 text-xs text-white hover:bg-gray-600"
          >
            Dashboard
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
          </div>
        ) : displayActions.length > 0 ? (
          displayActions.map((action) => (
            <div
              key={action.id}
              className={`rounded-lg border border-gray-700 bg-gray-700 p-4 transition-colors duration-200 ${expandedAction === action.id ? 'border-purple-500' : 'hover:border-purple-500'
                }`}
            >
              <div className="flex justify-between">
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => toggleExpand(action.id)}
                >
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-purple-400">
                    {action.moduleIcon}
                  </div>
                  <div>
                    <div className="font-medium">{action.title}</div>
                    <div className="text-sm text-gray-400">
                      {action.module} • Confidence: {(action.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div
                    className={`rounded px-2 py-0.5 text-xs ${getImpactColor(action.impact)}`}
                  >
                    {action.impact} impact
                  </div>
                </div>
              </div>

              {expandedAction === action.id && (
                <div className="mt-4 border-t border-gray-600 pt-4">
                  <p className="mb-4 text-sm text-gray-300">{action.description}</p>

                  <div className="mb-4">
                    <h3 className="mb-2 text-sm font-medium text-purple-400">Options:</h3>
                    <div className="space-y-2">
                      {action.options.map((option) => (
                        <div
                          key={option.id}
                          className={`flex cursor-pointer items-start rounded-lg border p-3 ${selectedOptions[action.id] === option.id
                            ? 'border-purple-500 bg-gray-800'
                            : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                            }`}
                          onClick={() => handleOptionSelect(action.id, option.id)}
                        >
                          <div className="mr-3 mt-0.5">
                            <div className={`flex h-4 w-4 items-center justify-center rounded-full border ${selectedOptions[action.id] === option.id
                              ? 'border-purple-500 bg-purple-500'
                              : 'border-gray-500'
                              }`}>
                              {selectedOptions[action.id] === option.id && (
                                <div className="h-2 w-2 rounded-full bg-white"></div>
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center">
                              <div className="font-medium">{option.label}</div>
                              {option.isRecommended && (
                                <div className="ml-2 rounded bg-purple-900 px-2 py-0.5 text-xs text-purple-300">
                                  Recommended
                                </div>
                              )}
                            </div>
                            <div className="mt-1 text-sm text-gray-400">{option.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      className="rounded bg-gray-600 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-500"
                      onClick={() => setExpandedAction(null)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className={`flex items-center rounded bg-purple-600 px-4 py-2 text-sm text-white transition-colors hover:bg-purple-700 ${!selectedOptions[action.id] || executingAction === action.id
                        ? 'cursor-not-allowed opacity-50'
                        : ''
                        }`}
                      onClick={() => handleExecuteAction(action.id)}
                      disabled={!selectedOptions[action.id] || executingAction === action.id}
                    >
                      {executingAction === action.id ? (
                        <>
                          <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="mr-2 h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                          Execute Action
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-gray-700 bg-gray-700 p-6 text-center">
            <div className="mb-3 flex justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="mb-1 text-lg font-medium text-gray-300">No Actions Required</h3>
            <p className="text-sm text-gray-400">
              The Sentient Loop™ is monitoring your systems and will suggest actions when needed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};