import React, { useState } from 'react';
import { useQuery } from 'wasp/client/operations';
import { getSentientRecommendations } from '../operations';
import { Recommendation } from '../types';

interface RecommendationsPanelProps {
  maxItems?: number;
}

export const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({ maxItems = 5 }) => {
  const { data: recommendations, isLoading, error } = useQuery(getSentientRecommendations);
  const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  // Get unique categories from recommendations
  const categories = recommendations 
    ? [...new Set(recommendations.map((rec: Recommendation) => rec.category))]
    : [];

  // Filter recommendations by category
  const filteredRecommendations = recommendations
    ? filterCategory 
      ? recommendations.filter((rec: Recommendation) => rec.category === filterCategory)
      : recommendations
    : [];

  // Limit the number of recommendations shown
  const displayedRecommendations = filteredRecommendations.slice(0, maxItems);

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'business':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'security':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'content':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-purple-400">AI Recommendations</h2>
        <div className="flex space-x-2">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-2 py-1 text-xs rounded-full ${
                filterCategory === category
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setFilterCategory(filterCategory === category ? null : category)}
            >
              <div className="flex items-center">
                {getCategoryIcon(category)}
                <span className="ml-1 capitalize">{category}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-900/30 text-red-300 p-4 rounded-lg">
          <p>Error loading recommendations. Please try again later.</p>
        </div>
      ) : displayedRecommendations.length === 0 ? (
        <div className="bg-gray-700 p-4 rounded-lg text-gray-400">
          <p>No recommendations available at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedRecommendations.map((recommendation: Recommendation) => (
            <div
              key={recommendation.id}
              className={`bg-gray-700 rounded-lg p-4 border ${
                selectedRecommendation === recommendation.id
                  ? 'border-purple-500'
                  : 'border-gray-600'
              } hover:border-purple-500 transition-colors cursor-pointer`}
              onClick={() => setSelectedRecommendation(
                selectedRecommendation === recommendation.id ? null : recommendation.id
              )}
            >
              <div className="flex items-start">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
                  getPriorityColor(recommendation.priority)
                }`}>
                  {getCategoryIcon(recommendation.category)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-white">{recommendation.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      getPriorityColor(recommendation.priority)
                    }`}>
                      {recommendation.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{recommendation.description}</p>
                  
                  {selectedRecommendation === recommendation.id && (
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Suggested Actions:</h4>
                      <ul className="space-y-2">
                        {recommendation.actions.map((action, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-purple-400 mr-2">•</span>
                            <span className="text-sm text-gray-400">{action}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 flex justify-end space-x-2">
                        <button className="px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors">
                          Execute
                        </button>
                        <button className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded-md transition-colors">
                          Dismiss
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
