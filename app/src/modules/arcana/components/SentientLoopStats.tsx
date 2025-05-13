import React, { useState, useEffect } from 'react';
import { useQuery } from 'wasp/client/operations';
import { getLoopPerformanceMetrics } from '../api/loopPerformanceOperations';

// Helper function to format milliseconds to human-readable time
const formatTime = (ms: number | null): string => {
  if (ms === null) return 'N/A';
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

// Helper function to format percentage
const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

const SentientLoopStats: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedTab, setSelectedTab] = useState<'overview' | 'performance' | 'quality' | 'trends'>('overview');
  
  // Calculate date range based on selected time range
  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
    }
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };
  
  const dateRange = getDateRange();
  
  // Fetch performance metrics
  const { 
    data: performanceData, 
    isLoading, 
    error 
  } = useQuery(getLoopPerformanceMetrics, { 
    startDate: dateRange.startDate,
    endDate: dateRange.endDate
  });
  
  // Fallback data for when API data is loading or unavailable
  const fallbackStats = {
    checkpoints: {
      total: 128,
      pending: 5,
      approved: 98,
      rejected: 12,
      modified: 8,
      escalated: 5
    },
    decisions: {
      human: 118,
      agent: 42,
      system: 15
    },
    responseTime: {
      average: '1h 12m',
      critical: '8m',
      high: '32m',
      medium: '1h 45m',
      low: '3h 22m'
    },
    topModules: [
      { name: 'phantom', count: 42, color: 'bg-red-500' },
      { name: 'athena', count: 36, color: 'bg-blue-500' },
      { name: 'forgeflow', count: 28, color: 'bg-yellow-500' },
      { name: 'arcana', count: 22, color: 'bg-purple-500' }
    ],
    performance: {
      falsePositiveRate: 0.08,
      overrideRate: 0.15,
      memoryRetrievalRate: 0.92,
      agentQuality: 0.85
    }
  };
  
  // Combine API data with fallback data
  const stats = performanceData ? {
    checkpoints: performanceData.resolutionDistribution || fallbackStats.checkpoints,
    decisions: {
      human: performanceData.resolutionDistribution?.approved || 0,
      agent: performanceData.resolutionDistribution?.modified || 0,
      system: performanceData.resolutionDistribution?.rejected || 0
    },
    responseTime: {
      average: formatTime(performanceData.timeToDecision?.averageTimeMs),
      critical: formatTime(performanceData.timeToDecision?.byPriority?.critical),
      high: formatTime(performanceData.timeToDecision?.byPriority?.high),
      medium: formatTime(performanceData.timeToDecision?.byPriority?.medium),
      low: formatTime(performanceData.timeToDecision?.byPriority?.low)
    },
    topModules: Object.entries(performanceData.moduleMetrics || {})
      .map(([name, data]: [string, any], index) => ({
        name,
        count: data.checkpointCount,
        color: [
          'bg-red-500',
          'bg-blue-500',
          'bg-yellow-500',
          'bg-purple-500',
          'bg-green-500',
          'bg-indigo-500'
        ][index % 6]
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4),
    performance: {
      falsePositiveRate: performanceData.falsePositiveRate?.overall || fallbackStats.performance.falsePositiveRate,
      overrideRate: performanceData.overrideRate?.overall || fallbackStats.performance.overrideRate,
      memoryRetrievalRate: performanceData.memoryRetrievalRate?.successRate || fallbackStats.performance.memoryRetrievalRate,
      agentQuality: performanceData.agentResponseQuality?.overall || fallbackStats.performance.agentQuality
    },
    trends: performanceData.trends || null
  } : fallbackStats;
  
  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
      <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <h2 className="text-xl font-semibold text-white">Sentient Loop™ Analytics</h2>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange('7d')}
            className={`rounded-md px-3 py-1 text-sm ${
              timeRange === '7d' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`rounded-md px-3 py-1 text-sm ${
              timeRange === '30d' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setTimeRange('90d')}
            className={`rounded-md px-3 py-1 text-sm ${
              timeRange === '90d' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            90 Days
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-700">
        <div className="flex space-x-4">
          <button
            onClick={() => setSelectedTab('overview')}
            className={`border-b-2 pb-2 text-sm font-medium ${
              selectedTab === 'overview'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:border-gray-600 hover:text-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setSelectedTab('performance')}
            className={`border-b-2 pb-2 text-sm font-medium ${
              selectedTab === 'performance'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:border-gray-600 hover:text-gray-300'
            }`}
          >
            Performance
          </button>
          <button
            onClick={() => setSelectedTab('quality')}
            className={`border-b-2 pb-2 text-sm font-medium ${
              selectedTab === 'quality'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:border-gray-600 hover:text-gray-300'
            }`}
          >
            Quality
          </button>
          <button
            onClick={() => setSelectedTab('trends')}
            className={`border-b-2 pb-2 text-sm font-medium ${
              selectedTab === 'trends'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:border-gray-600 hover:text-gray-300'
            }`}
          >
            Trends
          </button>
        </div>
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-purple-500"></div>
          <span className="ml-2 text-gray-400">Loading metrics...</span>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="rounded-md bg-red-900/20 p-4 text-red-400">
          <p>Error loading metrics. Please try again later.</p>
        </div>
      )}
      
      {/* Overview Tab */}
      {selectedTab === 'overview' && !isLoading && !error && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-3 text-lg font-medium text-purple-400">Checkpoint Status</h3>
            <div className="space-y-3">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm text-gray-400">Total</span>
                  <span className="text-sm font-medium text-white">{stats.checkpoints.total}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700">
                  <div className="h-full w-full rounded-full bg-purple-500"></div>
                </div>
              </div>
              
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm text-gray-400">Pending</span>
                  <span className="text-sm font-medium text-white">{stats.checkpoints.pending}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700">
                  <div 
                    className="h-full rounded-full bg-yellow-500" 
                    style={{ width: `${(stats.checkpoints.pending / stats.checkpoints.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm text-gray-400">Approved</span>
                  <span className="text-sm font-medium text-white">{stats.checkpoints.approved}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700">
                  <div 
                    className="h-full rounded-full bg-green-500" 
                    style={{ width: `${(stats.checkpoints.approved / stats.checkpoints.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm text-gray-400">Rejected</span>
                  <span className="text-sm font-medium text-white">{stats.checkpoints.rejected}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700">
                  <div 
                    className="h-full rounded-full bg-red-500" 
                    style={{ width: `${(stats.checkpoints.rejected / stats.checkpoints.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm text-gray-400">Modified</span>
                  <span className="text-sm font-medium text-white">{stats.checkpoints.modified}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700">
                  <div 
                    className="h-full rounded-full bg-blue-500" 
                    style={{ width: `${(stats.checkpoints.modified / stats.checkpoints.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm text-gray-400">Escalated</span>
                  <span className="text-sm font-medium text-white">{stats.checkpoints.escalated}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700">
                  <div 
                    className="h-full rounded-full bg-orange-500" 
                    style={{ width: `${(stats.checkpoints.escalated / stats.checkpoints.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="mb-3 text-lg font-medium text-purple-400">Decision Makers</h3>
            <div className="mb-4 flex h-40 items-center justify-center">
              <div className="relative h-40 w-40">
                <svg viewBox="0 0 100 100" className="h-full w-full">
                  {/* Human decisions */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#8b5cf6"
                    strokeWidth="20"
                    strokeDasharray={`${(stats.decisions.human / (stats.decisions.human + stats.decisions.agent + stats.decisions.system)) * 251.2} 251.2`}
                    transform="rotate(-90 50 50)"
                  />
                  {/* Agent decisions */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#3b82f6"
                    strokeWidth="20"
                    strokeDasharray={`${(stats.decisions.agent / (stats.decisions.human + stats.decisions.agent + stats.decisions.system)) * 251.2} 251.2`}
                    strokeDashoffset={`${-(stats.decisions.human / (stats.decisions.human + stats.decisions.agent + stats.decisions.system)) * 251.2}`}
                    transform="rotate(-90 50 50)"
                  />
                  {/* System decisions */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#10b981"
                    strokeWidth="20"
                    strokeDasharray={`${(stats.decisions.system / (stats.decisions.human + stats.decisions.agent + stats.decisions.system)) * 251.2} 251.2`}
                    strokeDashoffset={`${-((stats.decisions.human + stats.decisions.agent) / (stats.decisions.human + stats.decisions.agent + stats.decisions.system)) * 251.2}`}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-white">{stats.decisions.human + stats.decisions.agent + stats.decisions.system}</span>
                  <span className="text-xs text-gray-400">Total Decisions</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="mr-2 h-3 w-3 rounded-full bg-purple-500"></div>
                <span className="text-sm text-gray-400">Human</span>
                <span className="ml-auto text-sm font-medium text-white">{stats.decisions.human}</span>
              </div>
              <div className="flex items-center">
                <div className="mr-2 h-3 w-3 rounded-full bg-blue-500"></div>
                <span className="text-sm text-gray-400">Agent</span>
                <span className="ml-auto text-sm font-medium text-white">{stats.decisions.agent}</span>
              </div>
              <div className="flex items-center">
                <div className="mr-2 h-3 w-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-400">System</span>
                <span className="ml-auto text-sm font-medium text-white">{stats.decisions.system}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="mb-3 text-lg font-medium text-purple-400">Average Response Time</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-gray-700 p-4">
                <div className="text-sm text-gray-400">Overall</div>
                <div className="text-xl font-bold text-white">{stats.responseTime.average}</div>
              </div>
              <div className="rounded-lg bg-gray-700 p-4">
                <div className="text-sm text-gray-400">Critical</div>
                <div className="text-xl font-bold text-red-400">{stats.responseTime.critical}</div>
              </div>
              <div className="rounded-lg bg-gray-700 p-4">
                <div className="text-sm text-gray-400">High</div>
                <div className="text-xl font-bold text-orange-400">{stats.responseTime.high}</div>
              </div>
              <div className="rounded-lg bg-gray-700 p-4">
                <div className="text-sm text-gray-400">Medium</div>
                <div className="text-xl font-bold text-yellow-400">{stats.responseTime.medium}</div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="mb-3 text-lg font-medium text-purple-400">Top Modules</h3>
            <div className="space-y-3">
              {stats.topModules.map((module) => (
                <div key={module.name}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm text-gray-400">{module.name}</span>
                    <span className="text-sm font-medium text-white">{module.count}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700">
                    <div 
                      className={`h-full rounded-full ${module.color}`} 
                      style={{ width: `${(module.count / stats.checkpoints.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Performance Tab */}
      {selectedTab === 'performance' && !isLoading && !error && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-lg bg-gray-700 p-4">
            <h3 className="mb-3 text-lg font-medium text-purple-400">Time to Human Decision</h3>
            <div className="mb-4">
              <div className="text-sm text-gray-400">Average Response Time</div>
              <div className="text-2xl font-bold text-white">{stats.responseTime.average}</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Critical Priority</span>
                <span className="text-sm font-medium text-red-400">{stats.responseTime.critical}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">High Priority</span>
                <span className="text-sm font-medium text-orange-400">{stats.responseTime.high}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Medium Priority</span>
                <span className="text-sm font-medium text-yellow-400">{stats.responseTime.medium}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Low Priority</span>
                <span className="text-sm font-medium text-green-400">{stats.responseTime.low}</span>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg bg-gray-700 p-4">
            <h3 className="mb-3 text-lg font-medium text-purple-400">False Positive Rate</h3>
            <div className="mb-4">
              <div className="text-sm text-gray-400">Unnecessary Checkpoints</div>
              <div className="text-2xl font-bold text-white">{formatPercentage(stats.performance.falsePositiveRate)}</div>
            </div>
            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm text-gray-400">False Positive Rate</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-800">
                <div 
                  className="h-full rounded-full bg-yellow-500" 
                  style={{ width: `${stats.performance.falsePositiveRate * 100}%` }}
                ></div>
              </div>
              <div className="mt-1 flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-400">
              <p>Lower is better. Indicates how often the system creates checkpoints that humans approve without changes.</p>
            </div>
          </div>
          
          <div className="rounded-lg bg-gray-700 p-4">
            <h3 className="mb-3 text-lg font-medium text-purple-400">Memory Retrieval Success</h3>
            <div className="mb-4">
              <div className="text-sm text-gray-400">Success Rate</div>
              <div className="text-2xl font-bold text-white">{formatPercentage(stats.performance.memoryRetrievalRate)}</div>
            </div>
            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm text-gray-400">Memory Retrieval Rate</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-800">
                <div 
                  className="h-full rounded-full bg-green-500" 
                  style={{ width: `${stats.performance.memoryRetrievalRate * 100}%` }}
                ></div>
              </div>
              <div className="mt-1 flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-400">
              <p>Higher is better. Measures how often the system successfully retrieves relevant memory for decisions.</p>
            </div>
          </div>
          
          <div className="rounded-lg bg-gray-700 p-4">
            <h3 className="mb-3 text-lg font-medium text-purple-400">Override Rate</h3>
            <div className="mb-4">
              <div className="text-sm text-gray-400">Human Modifications</div>
              <div className="text-2xl font-bold text-white">{formatPercentage(stats.performance.overrideRate)}</div>
            </div>
            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm text-gray-400">Override Rate</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-800">
                <div 
                  className="h-full rounded-full bg-blue-500" 
                  style={{ width: `${stats.performance.overrideRate * 100}%` }}
                ></div>
              </div>
              <div className="mt-1 flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-400">
              <p>Lower is better. Measures how often humans modify or reject agent decisions.</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Quality Tab */}
      {selectedTab === 'quality' && !isLoading && !error && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-lg bg-gray-700 p-4">
            <h3 className="mb-3 text-lg font-medium text-purple-400">Agent Response Quality</h3>
            <div className="mb-4">
              <div className="text-sm text-gray-400">Overall Quality Score</div>
              <div className="text-2xl font-bold text-white">{formatPercentage(stats.performance.agentQuality)}</div>
            </div>
            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm text-gray-400">Quality Score</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-800">
                <div 
                  className="h-full rounded-full bg-green-500" 
                  style={{ width: `${stats.performance.agentQuality * 100}%` }}
                ></div>
              </div>
              <div className="mt-1 flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-400">
              <p>Higher is better. Composite score based on approval rate and modification rate.</p>
            </div>
          </div>
          
          <div className="rounded-lg bg-gray-700 p-4">
            <h3 className="mb-3 text-lg font-medium text-purple-400">Resolution Distribution</h3>
            <div className="space-y-3">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm text-gray-400">Approved</span>
                  <span className="text-sm font-medium text-white">{stats.checkpoints.approved}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-800">
                  <div 
                    className="h-full rounded-full bg-green-500" 
                    style={{ width: `${(stats.checkpoints.approved / stats.checkpoints.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm text-gray-400">Modified</span>
                  <span className="text-sm font-medium text-white">{stats.checkpoints.modified}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-800">
                  <div 
                    className="h-full rounded-full bg-blue-500" 
                    style={{ width: `${(stats.checkpoints.modified / stats.checkpoints.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm text-gray-400">Rejected</span>
                  <span className="text-sm font-medium text-white">{stats.checkpoints.rejected}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-800">
                  <div 
                    className="h-full rounded-full bg-red-500" 
                    style={{ width: `${(stats.checkpoints.rejected / stats.checkpoints.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm text-gray-400">Escalated</span>
                  <span className="text-sm font-medium text-white">{stats.checkpoints.escalated}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-800">
                  <div 
                    className="h-full rounded-full bg-orange-500" 
                    style={{ width: `${(stats.checkpoints.escalated / stats.checkpoints.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-span-1 rounded-lg bg-gray-700 p-4 md:col-span-2">
            <h3 className="mb-3 text-lg font-medium text-purple-400">Module Performance Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-full table-auto">
                <thead>
                  <tr className="border-b border-gray-600 text-left text-sm text-gray-400">
                    <th className="pb-2">Module</th>
                    <th className="pb-2">Checkpoints</th>
                    <th className="pb-2">Avg. Response Time</th>
                    <th className="pb-2">Override Rate</th>
                    <th className="pb-2">Quality Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {stats.topModules.map((module) => (
                    <tr key={module.name} className="text-sm">
                      <td className="py-2 font-medium text-white">{module.name}</td>
                      <td className="py-2 text-gray-300">{module.count}</td>
                      <td className="py-2 text-gray-300">
                        {performanceData?.moduleMetrics?.[module.name]?.averageTimeToDecision 
                          ? formatTime(performanceData.moduleMetrics[module.name].averageTimeToDecision)
                          : 'N/A'}
                      </td>
                      <td className="py-2 text-gray-300">
                        {performanceData?.moduleMetrics?.[module.name]?.overrideRate !== undefined
                          ? formatPercentage(performanceData.moduleMetrics[module.name].overrideRate)
                          : 'N/A'}
                      </td>
                      <td className="py-2 text-gray-300">
                        {performanceData?.moduleMetrics?.[module.name]?.qualityScore !== undefined
                          ? formatPercentage(performanceData.moduleMetrics[module.name].qualityScore || 0.75)
                          : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* Trends Tab */}
      {selectedTab === 'trends' && !isLoading && !error && (
        <div className="grid grid-cols-1 gap-6">
          <div className="rounded-lg bg-gray-700 p-4">
            <h3 className="mb-3 text-lg font-medium text-purple-400">Checkpoint Volume Trend</h3>
            <div className="h-64">
              {/* Simple bar chart visualization */}
              <div className="flex h-full items-end space-x-1">
                {(stats.trends?.data || Array(12).fill(0).map((_, i) => ({ 
                  timeKey: `Day ${i+1}`, 
                  checkpointCount: Math.floor(Math.random() * 20) + 5 
                }))).map((item, index) => (
                  <div 
                    key={index} 
                    className="group relative flex flex-1 flex-col items-center"
                  >
                    <div 
                      className="w-full rounded-t bg-purple-500 transition-all hover:bg-purple-400"
                      style={{ 
                        height: `${Math.min(100, (item.checkpointCount / 30) * 100)}%`,
                        minHeight: '4px'
                      }}
                    ></div>
                    <div className="absolute bottom-0 left-1/2 z-10 mb-8 hidden -translate-x-1/2 transform rounded bg-gray-900 px-2 py-1 text-xs text-white group-hover:block">
                      {item.timeKey}: {item.checkpointCount} checkpoints
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-between text-xs text-gray-500">
                {(stats.trends?.data || Array(5).fill(0)).slice(0, 5).map((item, index) => (
                  <span key={index}>{item.timeKey || `Day ${index+1}`}</span>
                ))}
                <span>...</span>
                {(stats.trends?.data || Array(5).fill(0)).slice(-1).map((item, index) => (
                  <span key={index}>{item.timeKey || 'Today'}</span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg bg-gray-700 p-4">
              <h3 className="mb-3 text-lg font-medium text-purple-400">Response Time Trend</h3>
              <div className="h-48">
                {/* Simple line chart visualization */}
                <div className="relative h-full w-full">
                  <svg className="h-full w-full" viewBox="0 0 100 50">
                    {/* X and Y axes */}
                    <line x1="0" y1="50" x2="100" y2="50" stroke="#4B5563" strokeWidth="0.5" />
                    <line x1="0" y1="0" x2="0" y2="50" stroke="#4B5563" strokeWidth="0.5" />
                    
                    {/* Data line */}
                    <polyline
                      fill="none"
                      stroke="#8B5CF6"
                      strokeWidth="2"
                      points={
                        (stats.trends?.data || Array(10).fill(0).map(() => ({ 
                          averageTimeToDecisionMs: Math.random() * 3600000 
                        }))).map((item, index, arr) => {
                          const x = (index / (arr.length - 1)) * 100;
                          const maxTime = 3600000; // 1 hour in ms
                          const y = 50 - ((item.averageTimeToDecisionMs || Math.random() * maxTime) / maxTime) * 45;
                          return `${x},${y}`;
                        }).join(' ')
                      }
                    />
                  </svg>
                </div>
                <div className="mt-2 flex justify-between text-xs text-gray-500">
                  <span>Start</span>
                  <span>Time</span>
                  <span>End</span>
                </div>
              </div>
            </div>
            
            <div className="rounded-lg bg-gray-700 p-4">
              <h3 className="mb-3 text-lg font-medium text-purple-400">Quality Score Trend</h3>
              <div className="h-48">
                {/* Simple line chart visualization */}
                <div className="relative h-full w-full">
                  <svg className="h-full w-full" viewBox="0 0 100 50">
                    {/* X and Y axes */}
                    <line x1="0" y1="50" x2="100" y2="50" stroke="#4B5563" strokeWidth="0.5" />
                    <line x1="0" y1="0" x2="0" y2="50" stroke="#4B5563" strokeWidth="0.5" />
                    
                    {/* Data line */}
                    <polyline
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2"
                      points={
                        Array(10).fill(0).map((_, index) => {
                          const x = (index / 9) * 100;
                          const y = 50 - (0.65 + Math.random() * 0.25) * 45; // Random quality score between 0.65 and 0.9
                          return `${x},${y}`;
                        }).join(' ')
                      }
                    />
                  </svg>
                </div>
                <div className="mt-2 flex justify-between text-xs text-gray-500">
                  <span>Start</span>
                  <span>Quality</span>
                  <span>End</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SentientLoopStats;