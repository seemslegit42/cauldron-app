import React, { useState } from 'react';
import { SecurityRecommendation, RecommendationPriority, RecommendationCategory, RecommendationStatus } from '../types';

interface SecurityRecommendationsPanelProps {
  recommendations: SecurityRecommendation[];
}

export const SecurityRecommendationsPanel: React.FC<SecurityRecommendationsPanelProps> = ({ recommendations }) => {
  const [selectedRecommendation, setSelectedRecommendation] = useState<SecurityRecommendation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<{
    priority: RecommendationPriority | 'all';
    category: RecommendationCategory | 'all';
    status: RecommendationStatus | 'all';
  }>({
    priority: 'all',
    category: 'all',
    status: 'all',
  });

  // Helper function to get color based on priority
  const getPriorityColor = (priority: RecommendationPriority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Helper function to get color based on status
  const getStatusColor = (status: RecommendationStatus) => {
    switch (status) {
      case 'open':
        return 'bg-blue-500 text-white';
      case 'in_progress':
        return 'bg-yellow-500 text-white';
      case 'implemented':
        return 'bg-green-500 text-white';
      case 'dismissed':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Helper function to get icon based on category
  const getCategoryIcon = (category: RecommendationCategory) => {
    switch (category) {
      case 'configuration':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        );
      case 'patch':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'policy':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      case 'training':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
          </svg>
        );
      case 'monitoring':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  // Filter recommendations based on selected filters
  const filteredRecommendations = recommendations.filter((recommendation) => {
    return (
      (filter.priority === 'all' || recommendation.priority === filter.priority) &&
      (filter.category === 'all' || recommendation.category === filter.category) &&
      (filter.status === 'all' || recommendation.status === filter.status)
    );
  });

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Security Recommendations</h2>
        <div className="text-sm text-gray-400">
          {recommendations.filter(r => r.status === 'open').length} open recommendations
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Priority</label>
          <select
            value={filter.priority}
            onChange={(e) => setFilter({ ...filter, priority: e.target.value as RecommendationPriority | 'all' })}
            className="bg-gray-700 text-white text-sm rounded-md border border-gray-600 focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
          >
            <option value="all">All</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
          <select
            value={filter.category}
            onChange={(e) => setFilter({ ...filter, category: e.target.value as RecommendationCategory | 'all' })}
            className="bg-gray-700 text-white text-sm rounded-md border border-gray-600 focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
          >
            <option value="all">All</option>
            <option value="configuration">Configuration</option>
            <option value="patch">Patch</option>
            <option value="policy">Policy</option>
            <option value="training">Training</option>
            <option value="monitoring">Monitoring</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value as RecommendationStatus | 'all' })}
            className="bg-gray-700 text-white text-sm rounded-md border border-gray-600 focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="implemented">Implemented</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
      </div>

      {/* Recommendations List */}
      {filteredRecommendations.length === 0 ? (
        <div className="bg-gray-700 rounded-lg p-6 text-center">
          <p className="text-gray-400">No recommendations match your filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecommendations.map((recommendation) => (
            <div
              key={recommendation.id}
              className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-blue-500 cursor-pointer transition-colors"
              onClick={() => {
                setSelectedRecommendation(recommendation);
                setIsModalOpen(true);
              }}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start">
                  <div className={`rounded-full h-3 w-3 mt-1.5 mr-3 ${getPriorityColor(recommendation.priority)}`}></div>
                  <div>
                    <h3 className="text-white font-medium">{recommendation.title}</h3>
                    <p className="text-gray-400 text-sm mt-1">{recommendation.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(recommendation.status)}`}>
                    {recommendation.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center mt-3 text-xs text-gray-400">
                <div className="flex items-center">
                  <div className="text-blue-400 mr-1">
                    {getCategoryIcon(recommendation.category)}
                  </div>
                  <span>{recommendation.category}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div>
                    <span className="text-gray-500 mr-1">Impact:</span>
                    <span className={`${recommendation.impact === 'high' ? 'text-red-400' : recommendation.impact === 'medium' ? 'text-yellow-400' : 'text-blue-400'}`}>
                      {recommendation.impact}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 mr-1">Effort:</span>
                    <span className={`${recommendation.effort === 'high' ? 'text-red-400' : recommendation.effort === 'medium' ? 'text-yellow-400' : 'text-green-400'}`}>
                      {recommendation.effort}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recommendation Detail Modal */}
      {isModalOpen && selectedRecommendation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <div className={`rounded-full h-3 w-3 mr-3 ${getPriorityColor(selectedRecommendation.priority)}`}></div>
                <h2 className="text-xl font-bold text-white">{selectedRecommendation.title}</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-4">
              <p className="text-gray-300">{selectedRecommendation.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Priority</h3>
                <div className={`inline-block px-2 py-1 rounded-full text-xs ${getPriorityColor(selectedRecommendation.priority)}`}>
                  {selectedRecommendation.priority}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Status</h3>
                <div className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(selectedRecommendation.status)}`}>
                  {selectedRecommendation.status.replace('_', ' ')}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Category</h3>
                <div className="flex items-center">
                  <div className="text-blue-400 mr-1">
                    {getCategoryIcon(selectedRecommendation.category)}
                  </div>
                  <span className="text-white">{selectedRecommendation.category}</span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Created</h3>
                <div className="text-white">
                  {new Date(selectedRecommendation.createdAt).toLocaleString()}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Impact</h3>
                <div className={`text-white ${
                  selectedRecommendation.impact === 'high' 
                    ? 'text-red-400' 
                    : selectedRecommendation.impact === 'medium' 
                      ? 'text-yellow-400' 
                      : 'text-blue-400'
                }`}>
                  {selectedRecommendation.impact}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Effort</h3>
                <div className={`text-white ${
                  selectedRecommendation.effort === 'high' 
                    ? 'text-red-400' 
                    : selectedRecommendation.effort === 'medium' 
                      ? 'text-yellow-400' 
                      : 'text-green-400'
                }`}>
                  {selectedRecommendation.effort}
                </div>
              </div>
            </div>
            {selectedRecommendation.metadata && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-400 mb-1">Additional Information</h3>
                <div className="bg-gray-700 rounded-lg p-3 border border-gray-600">
                  <pre className="text-xs text-gray-300 overflow-auto">
                    {JSON.stringify(selectedRecommendation.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            )}
            <div className="flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
