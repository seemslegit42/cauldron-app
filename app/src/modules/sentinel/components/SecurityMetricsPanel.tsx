import React, { useState } from 'react';
import { SecurityMetric, MetricCategory } from '../types';

interface SecurityMetricsPanelProps {
  metrics: SecurityMetric[];
}

export const SecurityMetricsPanel: React.FC<SecurityMetricsPanelProps> = ({ metrics }) => {
  const [activeCategory, setActiveCategory] = useState<MetricCategory | 'all'>('all');

  // Group metrics by category
  const metricsByCategory = metrics.reduce((acc, metric) => {
    if (!acc[metric.category]) {
      acc[metric.category] = [];
    }
    acc[metric.category].push(metric);
    return acc;
  }, {} as Record<string, SecurityMetric[]>);

  // Get metrics to display based on active category
  const metricsToDisplay = activeCategory === 'all' 
    ? metrics 
    : metricsByCategory[activeCategory] || [];

  // Helper function to get category color
  const getCategoryColor = (category: MetricCategory) => {
    switch (category) {
      case 'posture':
        return 'bg-blue-500';
      case 'threats':
        return 'bg-red-500';
      case 'compliance':
        return 'bg-green-500';
      case 'response':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Helper function to format metric name
  const formatMetricName = (name: string) => {
    return name
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Helper function to get trend icon and color
  const getTrendInfo = (current: number, previous?: number) => {
    if (!previous) return { icon: '—', color: 'text-gray-400' };
    
    if (current > previous) {
      return { icon: '↑', color: 'text-green-400' };
    } else if (current < previous) {
      return { icon: '↓', color: 'text-red-400' };
    } else {
      return { icon: '→', color: 'text-gray-400' };
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Security Metrics</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1 text-sm rounded-md ${
              activeCategory === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveCategory('posture')}
            className={`px-3 py-1 text-sm rounded-md ${
              activeCategory === 'posture' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Posture
          </button>
          <button
            onClick={() => setActiveCategory('threats')}
            className={`px-3 py-1 text-sm rounded-md ${
              activeCategory === 'threats' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Threats
          </button>
          <button
            onClick={() => setActiveCategory('compliance')}
            className={`px-3 py-1 text-sm rounded-md ${
              activeCategory === 'compliance' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Compliance
          </button>
          <button
            onClick={() => setActiveCategory('response')}
            className={`px-3 py-1 text-sm rounded-md ${
              activeCategory === 'response' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Response
          </button>
        </div>
      </div>

      {metricsToDisplay.length === 0 ? (
        <div className="bg-gray-700 rounded-lg p-6 text-center">
          <p className="text-gray-400">No metrics available for this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metricsToDisplay.map((metric) => {
            const { icon, color } = getTrendInfo(metric.value, metric.previousValue);
            
            return (
              <div key={metric.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center mb-2">
                  <div className={`h-3 w-3 rounded-full mr-2 ${getCategoryColor(metric.category)}`}></div>
                  <h3 className="text-sm font-medium text-gray-300">{formatMetricName(metric.name)}</h3>
                </div>
                <div className="flex justify-between items-end">
                  <div className="text-2xl font-bold text-white">
                    {metric.value}{metric.unit}
                  </div>
                  <div className="flex flex-col items-end">
                    {metric.previousValue !== undefined && (
                      <div className={`text-sm ${color}`}>
                        {icon} {Math.abs(((metric.value - metric.previousValue) / metric.previousValue) * 100).toFixed(1)}%
                      </div>
                    )}
                    {metric.target !== undefined && (
                      <div className="text-xs text-gray-400 mt-1">
                        Target: {metric.target}{metric.unit}
                      </div>
                    )}
                  </div>
                </div>
                {metric.target !== undefined && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-600 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${
                          metric.value >= metric.target ? 'bg-green-500' : 'bg-blue-500'
                        }`} 
                        style={{ 
                          width: `${Math.min(100, (metric.value / metric.target) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
