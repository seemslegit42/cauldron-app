import React from 'react';
import { BusinessRecommendation, ImpactLevel } from '../types';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  ArrowPathIcon, 
  BoltIcon 
} from '@heroicons/react/24/outline';

interface RecommendationsPanelProps {
  recommendations: BusinessRecommendation[];
  isLoading: boolean;
  onImplement?: (recommendationId: string) => void;
}

export const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({
  recommendations,
  isLoading,
  onImplement
}) => {
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

  // Get color based on effort level
  const getEffortColor = (effort: ImpactLevel) => {
    switch (effort) {
      case ImpactLevel.LOW:
        return 'bg-green-900 text-green-300';
      case ImpactLevel.MEDIUM:
        return 'bg-blue-900 text-blue-300';
      case ImpactLevel.HIGH:
        return 'bg-yellow-900 text-yellow-300';
      case ImpactLevel.CRITICAL:
        return 'bg-red-900 text-red-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="mb-4">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-20 bg-gray-700 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 text-white">Strategic Recommendations</h2>
        <div className="flex items-center justify-center p-6 bg-gray-700 rounded-lg">
          <BoltIcon className="h-8 w-8 text-gray-500 mr-3" />
          <p className="text-gray-400">No recommendations available for the selected timeframe.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-white">Strategic Recommendations</h2>
      
      <div className="space-y-4">
        {recommendations.map((recommendation) => (
          <div key={recommendation.id} className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-start">
              <div className="mr-3 mt-1">
                {recommendation.isImplemented ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-400" />
                ) : (
                  <BoltIcon className="h-5 w-5 text-yellow-400" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-md font-semibold text-white">{recommendation.title}</h3>
                  <div className="flex space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getImpactColor(recommendation.impact)}`}>
                      Impact: {recommendation.impact}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getEffortColor(recommendation.effort)}`}>
                      Effort: {recommendation.effort}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-300 mb-3">{recommendation.description}</p>
                
                {recommendation.actionItems && recommendation.actionItems.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-400 mb-1">Action items:</p>
                    <ul className="list-disc list-inside text-sm text-gray-300 space-y-1 pl-2">
                      {recommendation.actionItems.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-400">
                    Expected outcome: <span className="text-gray-300">{recommendation.expectedOutcome}</span>
                  </p>
                  
                  {!recommendation.isImplemented && onImplement && (
                    <button
                      onClick={() => onImplement(recommendation.id)}
                      className="flex items-center text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded"
                    >
                      <ArrowPathIcon className="h-3 w-3 mr-1" />
                      Implement
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
