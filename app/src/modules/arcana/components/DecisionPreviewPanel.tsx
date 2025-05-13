import React, { useState } from 'react';
import { useAction } from 'wasp/client/operations';
import { updateDecisionStatus } from '../api/operations';
import { useToast } from '@src/shared/hooks/useToast';

interface Decision {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  dueDate: string;
  recommendation: string;
  status: 'pending' | 'approved' | 'rejected' | 'modified';
}

interface DecisionPreviewPanelProps {
  decisions: Decision[];
  loading?: boolean;
  maxItems?: number;
  showActions?: boolean;
  className?: string;
}

export const DecisionPreviewPanel: React.FC<DecisionPreviewPanelProps> = ({
  decisions = [],
  loading = false,
  maxItems = 3,
  showActions = true,
  className = '',
}) => {
  const [expandedDecision, setExpandedDecision] = useState<string | null>(null);
  const updateDecisionStatusAction = useAction(updateDecisionStatus);
  const { toast } = useToast();

  // Handle decision action (approve, reject, modify)
  const handleDecisionAction = async (decisionId: string, action: 'approve' | 'reject' | 'modify') => {
    try {
      await updateDecisionStatusAction({
        decisionId,
        status: action,
      });

      toast({
        title: 'Decision updated',
        description: `The decision has been ${action}ed successfully.`,
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${action} the decision. Please try again.`,
        variant: 'error',
      });
      console.error('Error updating decision:', error);
    }
  };

  // Get impact badge color
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

  // Toggle expanded decision
  const toggleExpand = (decisionId: string) => {
    if (expandedDecision === decisionId) {
      setExpandedDecision(null);
    } else {
      setExpandedDecision(decisionId);
    }
  };

  return (
    <div className={`rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-lg ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-pink-400">Pending Decisions</h2>
        {decisions.length > maxItems && (
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
        ) : decisions.length > 0 ? (
          decisions.slice(0, maxItems).map((decision) => (
            <div
              key={decision.id}
              className="rounded-lg border border-gray-600 bg-gray-700 p-4 transition-colors duration-200 hover:border-pink-500"
            >
              <div className="flex justify-between">
                <div 
                  className="font-medium cursor-pointer"
                  onClick={() => toggleExpand(decision.id)}
                >
                  {decision.title}
                </div>
                <div
                  className={`rounded px-2 py-0.5 text-xs ${getImpactColor(decision.impact)}`}
                >
                  {decision.impact} impact
                </div>
              </div>
              <div className="mt-1 text-sm text-gray-400">
                Due: {new Date(decision.dueDate).toLocaleDateString()}
              </div>
              
              {expandedDecision === decision.id && (
                <div className="mt-3 border-t border-gray-600 pt-3">
                  <p className="text-sm text-gray-300 mb-2">{decision.description}</p>
                  <div className="mt-2 text-sm">
                    <span className="text-gray-400">Recommendation: </span>
                    <span className="text-green-400">{decision.recommendation}</span>
                  </div>
                </div>
              )}
              
              {showActions && (
                <div className="mt-3 flex space-x-2">
                  <button 
                    className="flex items-center rounded bg-green-600 px-3 py-1 text-xs text-white transition-colors hover:bg-green-700"
                    onClick={() => handleDecisionAction(decision.id, 'approve')}
                  >
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Approve
                  </button>
                  <button 
                    className="flex items-center rounded bg-yellow-600 px-3 py-1 text-xs text-white transition-colors hover:bg-yellow-700"
                    onClick={() => handleDecisionAction(decision.id, 'modify')}
                  >
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Modify
                  </button>
                  <button 
                    className="flex items-center rounded bg-red-600 px-3 py-1 text-xs text-white transition-colors hover:bg-red-700"
                    onClick={() => handleDecisionAction(decision.id, 'reject')}
                  >
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="py-4 text-center text-gray-400">No pending decisions</div>
        )}
      </div>
    </div>
  );
};
