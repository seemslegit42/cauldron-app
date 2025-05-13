import React from 'react';
import { BusinessMetric, MetricCategory } from '../types';

interface MetricsSummaryProps {
  metrics: BusinessMetric[];
  loading?: boolean;
}

export const MetricsSummary: React.FC<MetricsSummaryProps> = ({ metrics, loading = false }) => {
  // Group metrics by category
  const groupedMetrics = metrics?.reduce((acc: Record<string, BusinessMetric[]>, metric) => {
    if (!acc[metric.category]) {
      acc[metric.category] = [];
    }
    acc[metric.category].push(metric);
    return acc;
  }, {}) || {};

  // Get trend icon based on trend value
  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
    } else if (trend < 0) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
        </svg>
      );
    } else {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
        </svg>
      );
    }
  };

  // Get category icon
  const getCategoryIcon = (category: MetricCategory) => {
    switch (category) {
      case 'business':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'security':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'social':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
        );
      case 'media':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  // Get category color
  const getCategoryColor = (category: MetricCategory) => {
    switch (category) {
      case 'business':
        return 'text-green-400';
      case 'security':
        return 'text-red-400';
      case 'social':
        return 'text-blue-400';
      case 'media':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
      <h2 className="text-xl font-bold text-blue-400 mb-4">Key Metrics Summary</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : metrics?.length === 0 ? (
        <div className="bg-gray-700 p-4 rounded-lg text-gray-400">
          <p>No metrics available at this time.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedMetrics).map(([category, categoryMetrics]) => (
            <div key={category} className="space-y-4">
              <div className="flex items-center">
                <div className={`${getCategoryColor(category as MetricCategory)}`}>
                  {getCategoryIcon(category as MetricCategory)}
                </div>
                <h3 className={`ml-2 font-medium capitalize ${getCategoryColor(category as MetricCategory)}`}>
                  {category}
                </h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {categoryMetrics.map((metric) => (
                  <div 
                    key={metric.id} 
                    className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-blue-500 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="text-sm text-gray-400">{metric.name}</div>
                      {metric.trend !== undefined && (
                        <div className="flex items-center">
                          {getTrendIcon(metric.trend)}
                          <span className={`text-xs ml-1 ${
                            metric.trend > 0 ? 'text-green-400' : 
                            metric.trend < 0 ? 'text-red-400' : 
                            'text-gray-400'
                          }`}>
                            {Math.abs(metric.trend)}%
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-xl font-bold mt-1 text-white">
                      {metric.value}
                      {metric.unit && <span className="text-sm text-gray-400 ml-1">{metric.unit}</span>}
                    </div>
                    {metric.change !== undefined && (
                      <div className="text-xs text-gray-500 mt-1">
                        {metric.change > 0 ? '+' : ''}{metric.change}% from last period
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
