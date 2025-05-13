/**
 * Ethical Alignment Indicator Component
 * 
 * This component displays the ethical alignment score of an agent output
 * and provides visual feedback on the alignment status.
 */

import React, { useState } from 'react';
import { useEthicalAlignment } from '../../hooks/useEthicalAlignment';

interface EthicalAlignmentIndicatorProps {
  content: string;
  agentId: string;
  contentType?: string;
  moduleId?: string;
  industryContext?: string;
  regulatoryContext?: string;
  onAlignmentChecked?: (result: any) => void;
  showDetails?: boolean;
  className?: string;
}

export const EthicalAlignmentIndicator: React.FC<EthicalAlignmentIndicatorProps> = ({
  content,
  agentId,
  contentType = 'agent_output',
  moduleId,
  industryContext,
  regulatoryContext,
  onAlignmentChecked,
  showDetails = false,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { 
    checkAlignment, 
    isChecking, 
    lastCheckResult,
    getAlignmentStatusText,
    getAlignmentStatusColor
  } = useEthicalAlignment();

  // Check alignment when the component mounts
  React.useEffect(() => {
    const performCheck = async () => {
      if (content && agentId) {
        try {
          const result = await checkAlignment(content, agentId, {
            contentType,
            moduleId,
            industryContext,
            regulatoryContext,
          });
          
          if (onAlignmentChecked) {
            onAlignmentChecked(result);
          }
        } catch (error) {
          console.error('Error checking alignment:', error);
        }
      }
    };
    
    performCheck();
  }, [content, agentId, contentType, moduleId, industryContext, regulatoryContext]);

  if (!lastCheckResult) {
    return isChecking ? (
      <div className={`flex items-center text-gray-500 text-sm ${className}`}>
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Checking alignment...
      </div>
    ) : null;
  }

  const { alignmentScore, flagged, matchedRules, modelAssessment } = lastCheckResult;
  const statusText = getAlignmentStatusText(alignmentScore);
  const statusColor = getAlignmentStatusColor(alignmentScore);

  return (
    <div className={`rounded-md ${className}`}>
      <div 
        className={`flex items-center cursor-pointer`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div 
          className={`w-2 h-2 rounded-full mr-2 ${
            statusColor === 'green' ? 'bg-green-500' : 
            statusColor === 'teal' ? 'bg-teal-500' : 
            statusColor === 'blue' ? 'bg-blue-500' : 
            statusColor === 'yellow' ? 'bg-yellow-500' : 
            'bg-red-500'
          }`}
        ></div>
        <div className="text-sm flex items-center">
          <span className="font-medium mr-1">Alignment:</span>
          <span className={`${
            statusColor === 'green' ? 'text-green-600' : 
            statusColor === 'teal' ? 'text-teal-600' : 
            statusColor === 'blue' ? 'text-blue-600' : 
            statusColor === 'yellow' ? 'text-yellow-600' : 
            'text-red-600'
          }`}>
            {statusText}
          </span>
          <span className="ml-2 text-gray-500">
            ({Math.round(alignmentScore * 100)}%)
          </span>
          {flagged && (
            <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded">
              Flagged
            </span>
          )}
          <svg 
            className={`ml-1 h-4 w-4 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {(isExpanded || showDetails) && (
        <div className="mt-2 text-sm">
          {matchedRules.length > 0 && (
            <div className="mb-2">
              <div className="font-medium mb-1">Matched Rules:</div>
              <ul className="list-disc list-inside pl-2">
                {matchedRules.map((rule: any, index: number) => (
                  <li key={index} className="text-gray-700">
                    <span className="font-medium">{rule.ruleName}</span>
                    <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                      rule.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                      rule.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                      rule.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {rule.severity}
                    </span>
                    {rule.matchedPattern && (
                      <span className="ml-2 text-gray-500">
                        Matched: "{rule.matchedPattern}"
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {modelAssessment && (
            <div>
              <div className="font-medium mb-1">Model Assessment:</div>
              <div className="text-gray-700 pl-2">{modelAssessment.reasoning}</div>
              
              {modelAssessment.categories && modelAssessment.categories.length > 0 && (
                <div className="mt-1 pl-2">
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {modelAssessment.categories.map((category: any, index: number) => (
                      <div key={index} className="flex items-center">
                        <span className="text-gray-600 mr-1">{category.name}:</span>
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              category.score >= 0.8 ? 'bg-green-500' : 
                              category.score >= 0.6 ? 'bg-blue-500' : 
                              category.score >= 0.4 ? 'bg-yellow-500' : 
                              'bg-red-500'
                            }`}
                            style={{ width: `${category.score * 100}%` }}
                          ></div>
                        </div>
                        <span className="ml-1 text-xs text-gray-500">
                          {Math.round(category.score * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EthicalAlignmentIndicator;