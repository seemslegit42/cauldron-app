import React, { useState } from 'react';

interface Insight {
  id: string;
  title: string;
  description: string;
  category: 'business' | 'security' | 'operations' | 'marketing' | 'development';
  timestamp: string;
  source: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  relatedMetrics?: {
    name: string;
    value: string;
    trend: 'up' | 'down' | 'stable';
    changePercent: number;
  }[];
}

interface SentientInsightsPanelProps {
  insights?: Insight[];
  loading?: boolean;
  maxItems?: number;
  className?: string;
}

export const SentientInsightsPanel: React.FC<SentientInsightsPanelProps> = ({
  insights = [],
  loading = false,
  maxItems = 3,
  className = '',
}) => {
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Get category color
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'business':
        return 'bg-blue-900 text-blue-300';
      case 'security':
        return 'bg-red-900 text-red-300';
      case 'operations':
        return 'bg-green-900 text-green-300';
      case 'marketing':
        return 'bg-purple-900 text-purple-300';
      case 'development':
        return 'bg-yellow-900 text-yellow-300';
      default:
        return 'bg-gray-900 text-gray-300';
    }
  };

  // Get impact color
  const getImpactColor = (impact: 'high' | 'medium' | 'low'): string => {
    switch (impact) {
      case 'high':
        return 'text-red-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  // Get trend icon and color
  const getTrendInfo = (trend: 'up' | 'down' | 'stable', isPositive: boolean = true) => {
    const positiveIsUp = isPositive;

    if (trend === 'up') {
      return {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        ),
        color: positiveIsUp ? 'text-green-400' : 'text-red-400',
      };
    } else if (trend === 'down') {
      return {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        ),
        color: positiveIsUp ? 'text-red-400' : 'text-green-400',
      };
    } else {
      return {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
          </svg>
        ),
        color: 'text-gray-400',
      };
    }
  };

  // Toggle expanded insight
  const toggleExpand = (insightId: string) => {
    if (expandedInsight === insightId) {
      setExpandedInsight(null);
    } else {
      setExpandedInsight(insightId);
    }
  };

  // Use provided insights
  const displayInsights = insights;

  // Filter insights by category
  const filteredInsights = activeCategory === 'all'
    ? displayInsights
    : displayInsights.filter(insight => insight.category === activeCategory);

  // Get unique categories
  const categories = ['all', ...new Set(displayInsights.map(insight => insight.category))];

  return (
    <div className={`rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-lg ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-cyan-400">Sentient Insights</h2>
        <div className="flex space-x-2">
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                type="button"
                key={category}
                className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${activeCategory === category
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                onClick={() => setActiveCategory(category)}
              >
                <span className="capitalize">{category}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
          </div>
        ) : filteredInsights.length > 0 ? (
          filteredInsights.slice(0, maxItems).map((insight) => (
            <div
              key={insight.id}
              className="rounded-lg border border-gray-700 bg-gray-700 p-4 transition-colors duration-200 hover:border-cyan-500"
            >
              <div className="flex justify-between">
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => toggleExpand(insight.id)}
                >
                  <div className="flex items-center">
                    <div className={`mr-2 px-2 py-0.5 text-xs rounded-full ${getCategoryColor(insight.category)}`}>
                      <span className="capitalize">{insight.category}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(insight.timestamp).toLocaleDateString()} • {insight.source}
                    </div>
                  </div>
                  <div className="mt-2 font-medium">{insight.title}</div>
                </div>
                <div className="ml-4 flex flex-col items-end">
                  <div className={`font-medium ${getImpactColor(insight.impact)}`}>
                    {insight.impact} impact
                  </div>
                  <div className="mt-1 text-xs text-gray-400">
                    {(insight.confidence * 100).toFixed(0)}% confidence
                  </div>
                </div>
              </div>

              {expandedInsight === insight.id && (
                <div className="mt-4 border-t border-gray-600 pt-4">
                  <p className="text-sm text-gray-300 mb-4">{insight.description}</p>

                  {insight.relatedMetrics && insight.relatedMetrics.length > 0 && (
                    <div className="mt-4">
                      <h3 className="mb-2 text-sm font-medium text-cyan-400">Related Metrics:</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {insight.relatedMetrics.map((metric, index) => {
                          const trendInfo = getTrendInfo(metric.trend);
                          return (
                            <div key={index} className="bg-gray-800 rounded-lg p-3 border border-gray-600">
                              <div className="text-sm text-gray-400">{metric.name}</div>
                              <div className="mt-1 flex items-center justify-between">
                                <div className="text-lg font-bold">{metric.value}</div>
                                <div className={`flex items-center ${trendInfo.color}`}>
                                  {trendInfo.icon}
                                  <span className="ml-1 text-sm">
                                    {metric.changePercent > 0 ? '+' : ''}{metric.changePercent}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex justify-end space-x-2">
                    <button type="button" className="flex items-center rounded bg-gray-600 px-3 py-1 text-xs text-white transition-colors hover:bg-gray-500">
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
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                      </svg>
                      Share
                    </button>
                    <button type="button" className="flex items-center rounded bg-cyan-600 px-3 py-1 text-xs text-white transition-colors hover:bg-cyan-700">
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
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      Take Action
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="py-4 text-center text-gray-400">No insights available</div>
        )}

        {filteredInsights.length > maxItems && (
          <div className="mt-4 text-center">
            <button type="button" className="rounded-full bg-gray-700 px-4 py-2 text-sm text-cyan-400 hover:bg-gray-600 transition-colors">
              View All Insights
            </button>
          </div>
        )}
      </div>
    </div>
  );
};