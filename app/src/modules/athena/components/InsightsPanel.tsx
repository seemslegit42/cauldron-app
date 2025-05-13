import React from 'react';
import { BusinessInsight, ImpactLevel, ConfidenceLevel } from '../types';
import { 
  LightBulbIcon, 
  ChartBarIcon, 
  ExclamationTriangleIcon, 
  ArrowTrendingUpIcon 
} from '@heroicons/react/24/outline';

interface InsightsPanelProps {
  insights: BusinessInsight[];
  isLoading: boolean;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({
  insights,
  isLoading
}) => {
  // Get icon based on category
  const getInsightIcon = (category: string) => {
    switch (category) {
      case 'revenue':
      case 'financial':
        return <ChartBarIcon className="h-5 w-5 text-green-400" />;
      case 'growth':
      case 'acquisition':
        return <ArrowTrendingUpIcon className="h-5 w-5 text-blue-400" />;
      case 'risk':
      case 'operational':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />;
      default:
        return <LightBulbIcon className="h-5 w-5 text-yellow-400" />;
    }
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

  // Get color based on confidence level
  const getConfidenceColor = (confidence: ConfidenceLevel) => {
    switch (confidence) {
      case ConfidenceLevel.LOW:
        return 'bg-gray-700 text-gray-300';
      case ConfidenceLevel.MEDIUM:
        return 'bg-blue-900 text-blue-300';
      case ConfidenceLevel.HIGH:
        return 'bg-green-900 text-green-300';
      case ConfidenceLevel.VERY_HIGH:
        return 'bg-purple-900 text-purple-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="mb-4">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-16 bg-gray-700 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!insights || insights.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 text-white">AI-Generated Insights</h2>
        <div className="flex items-center justify-center p-6 bg-gray-700 rounded-lg">
          <LightBulbIcon className="h-8 w-8 text-gray-500 mr-3" />
          <p className="text-gray-400">No insights available for the selected timeframe.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-white">AI-Generated Insights</h2>
      
      <div className="space-y-4">
        {insights.map((insight) => (
          <div key={insight.id} className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-start">
              <div className="mr-3 mt-1">
                {getInsightIcon(insight.category)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-md font-semibold text-white">{insight.title}</h3>
                  <div className="flex space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getImpactColor(insight.impact)}`}>
                      {insight.impact}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(insight.confidence)}`}>
                      {insight.confidence}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-300 mb-2">{insight.description}</p>
                
                {insight.relatedMetrics && insight.relatedMetrics.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-400">Related metrics:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {insight.relatedMetrics.map((metric, index) => (
                        <span key={index} className="text-xs bg-gray-600 text-gray-300 px-2 py-0.5 rounded">
                          {metric}
                        </span>
                      ))}
                    </div>
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
