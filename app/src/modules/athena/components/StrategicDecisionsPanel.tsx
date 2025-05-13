import React, { useState } from 'react';
import { StrategicDecision, StrategicOption, ImpactLevel } from '../types';
import {
  ScaleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface StrategicDecisionsPanelProps {
  decisions: StrategicDecision[];
  isLoading: boolean;
  onResolveDecision?: (decisionId: string, optionId: string) => void;
  canExecute?: boolean;
}

export const StrategicDecisionsPanel: React.FC<StrategicDecisionsPanelProps> = ({
  decisions,
  isLoading,
  onResolveDecision,
}) => {
  const [expandedDecisions, setExpandedDecisions] = useState<Record<string, boolean>>({});

  // Toggle expanded state for a decision
  const toggleExpanded = (decisionId: string) => {
    setExpandedDecisions((prev) => ({
      ...prev,
      [decisionId]: !prev[decisionId],
    }));
  };

  // Get color based on impact level
  const getImpactColor = (impact: ImpactLevel) => {
    switch (impact) {
      case ImpactLevel.LOW:
        return 'bg-blue-900 text-blue-300';
      case ImpactLevel.MEDIUM:
        return 'bg-yellow-900 text-yellow-300';
      case ImpactLevel.HIGH:
        return 'bg-orange-900 text-orange-300';
      case ImpactLevel.CRITICAL:
        return 'bg-red-900 text-red-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  // Get color based on risk level
  const getRiskColor = (risk: ImpactLevel) => {
    switch (risk) {
      case ImpactLevel.LOW:
        return 'bg-green-900 text-green-300';
      case ImpactLevel.MEDIUM:
        return 'bg-yellow-900 text-yellow-300';
      case ImpactLevel.HIGH:
        return 'bg-orange-900 text-orange-300';
      case ImpactLevel.CRITICAL:
        return 'bg-red-900 text-red-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="mb-6 animate-pulse rounded-lg bg-gray-800 p-6 shadow-lg">
        <div className="mb-4 h-6 w-1/3 rounded bg-gray-700"></div>
        {[...Array(2)].map((_, i) => (
          <div key={i} className="mb-4">
            <div className="mb-2 h-4 w-3/4 rounded bg-gray-700"></div>
            <div className="h-24 w-full rounded bg-gray-700"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!decisions || decisions.length === 0) {
    return (
      <div className="mb-6 rounded-lg bg-gray-800 p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-white">Strategic Decisions</h2>
        <div className="flex items-center justify-center rounded-lg bg-gray-700 p-6">
          <ScaleIcon className="mr-3 h-8 w-8 text-gray-500" />
          <p className="text-gray-400">No strategic decisions pending.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-lg bg-gray-800 p-6 shadow-lg">
      <h2 className="mb-4 text-xl font-bold text-white">Strategic Decisions</h2>

      <div className="space-y-4">
        {decisions.map((decision) => (
          <div key={decision.id} className="rounded-lg bg-gray-700 p-4">
            <div className="flex items-start">
              <div className="mt-1 mr-3">
                <ScaleIcon className="h-5 w-5 text-blue-400" />
              </div>

              <div className="flex-1">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-md font-semibold text-white">{decision.title}</h3>
                  <div className="flex space-x-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${getImpactColor(decision.impact)}`}
                    >
                      Impact: {decision.impact}
                    </span>
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${getRiskColor(decision.risk)}`}
                    >
                      Risk: {decision.risk}
                    </span>
                  </div>
                </div>

                <p className="mb-3 text-sm text-gray-300">{decision.description}</p>

                {decision.deadline && (
                  <p className="mb-3 text-xs text-gray-400">
                    Deadline:{' '}
                    <span className="text-gray-300">
                      {new Date(decision.deadline).toLocaleDateString()}
                    </span>
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => toggleExpanded(decision.id)}
                    className="flex items-center text-sm text-blue-400 hover:text-blue-300"
                  >
                    {expandedDecisions[decision.id] ? (
                      <>
                        <ChevronUpIcon className="mr-1 h-4 w-4" />
                        Hide options
                      </>
                    ) : (
                      <>
                        <ChevronDownIcon className="mr-1 h-4 w-4" />
                        View {decision.options.length} options
                      </>
                    )}
                  </button>

                  {decision.isResolved && (
                    <div className="flex items-center text-sm text-green-400">
                      <CheckCircleIcon className="mr-1 h-4 w-4" />
                      Resolved
                    </div>
                  )}
                </div>

                {expandedDecisions[decision.id] && (
                  <div className="mt-4 space-y-3">
                    {decision.options.map((option) => (
                      <div
                        key={option.id}
                        className={`rounded-md p-3 ${
                          option.id === decision.recommendedOptionId
                            ? 'bg-opacity-30 border border-blue-700 bg-blue-900'
                            : 'bg-gray-600'
                        }`}
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <h4 className="text-sm font-medium text-white">
                            {option.title}
                            {option.id === decision.recommendedOptionId && (
                              <span className="ml-2 text-xs text-blue-400">(Recommended)</span>
                            )}
                          </h4>

                          {!decision.isResolved && onResolveDecision && (
                            <button
                              onClick={() => onResolveDecision(decision.id, option.id)}
                              className={`text-xs ${
                                canExecute
                                  ? 'bg-yellow-600 hover:bg-yellow-700'
                                  : 'cursor-not-allowed bg-gray-600'
                              } rounded px-2 py-1 text-white`}
                              disabled={!canExecute}
                              title={
                                !canExecute
                                  ? 'You do not have permission to execute strategic decisions'
                                  : ''
                              }
                            >
                              Choose
                            </button>
                          )}
                        </div>

                        <p className="mb-2 text-xs text-gray-300">{option.description}</p>

                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <div>
                            <p className="mb-1 text-xs text-gray-400">Pros:</p>
                            <ul className="list-inside list-disc space-y-1 pl-1 text-xs text-gray-300">
                              {option.pros.map((pro, index) => (
                                <li key={index}>{pro}</li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <p className="mb-1 text-xs text-gray-400">Cons:</p>
                            <ul className="list-inside list-disc space-y-1 pl-1 text-xs text-gray-300">
                              {option.cons.map((con, index) => (
                                <li key={index}>{con}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="mt-2 flex space-x-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${getImpactColor(option.estimatedImpact)}`}
                          >
                            Impact: {option.estimatedImpact}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${getRiskColor(option.estimatedRisk)}`}
                          >
                            Risk: {option.estimatedRisk}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
