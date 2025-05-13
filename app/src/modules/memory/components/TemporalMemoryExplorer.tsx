/**
 * Temporal Memory Explorer Component
 * 
 * A UI component for exploring memories across time periods and performing
 * natural language temporal queries.
 */

import React, { useState } from 'react';
import { useTemporalMemory } from '../hooks/useTemporalMemory';
import { MemoryContentType, TemporalQueryResult, MemoryComparison } from '../types';

interface TemporalMemoryExplorerProps {
  agentId?: string;
  contentType?: MemoryContentType;
}

export const TemporalMemoryExplorer: React.FC<TemporalMemoryExplorerProps> = ({
  agentId,
  contentType,
}) => {
  const [temporalQuery, setTemporalQuery] = useState('');
  const [period1, setPeriod1] = useState('last month');
  const [period2, setPeriod2] = useState('this month');
  const [queryResults, setQueryResults] = useState<TemporalQueryResult | null>(null);
  const [comparisonResults, setComparisonResults] = useState<MemoryComparison | null>(null);
  const [activeTab, setActiveTab] = useState<'query' | 'compare'>('query');

  const {
    rememberWhen,
    compareTimes,
    isQuerying,
    isComparing,
    error,
    clearError,
  } = useTemporalMemory();

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!temporalQuery.trim()) return;

    try {
      const results = await rememberWhen(temporalQuery, { agentId, contentType });
      setQueryResults(results);
      setComparisonResults(null);
    } catch (err) {
      console.error('Error querying temporal memories:', err);
    }
  };

  const handleCompareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!period1.trim() || !period2.trim()) return;

    try {
      const results = await compareTimes(period1, period2, { agentId, contentType });
      setComparisonResults(results);
      setQueryResults(null);
    } catch (err) {
      console.error('Error comparing time periods:', err);
    }
  };

  const renderMemoryItem = (memory: any) => {
    const content = typeof memory.content === 'string'
      ? memory.content
      : JSON.stringify(memory.content, null, 2);
    
    const date = memory.createdAt 
      ? new Date(memory.createdAt).toLocaleString()
      : 'Unknown date';

    return (
      <div key={memory.id} className="p-4 mb-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="flex justify-between items-start mb-2">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {memory.contentType}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{date}</span>
        </div>
        <div className="mb-2">
          <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mr-2">
            {memory.context}
          </span>
          <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            Importance: {memory.importance.toFixed(1)}
          </span>
        </div>
        <div className="mt-2 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {content}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'query'
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('query')}
          >
            Temporal Query
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'compare'
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('compare')}
          >
            Time Comparison
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-lg">
          <div className="flex justify-between">
            <p>{error}</p>
            <button onClick={clearError} className="text-red-800 dark:text-red-200 hover:underline">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {activeTab === 'query' ? (
        <>
          <form onSubmit={handleQuerySubmit} className="mb-6">
            <div className="mb-4">
              <label htmlFor="temporalQuery" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Ask about your memories
              </label>
              <input
                id="temporalQuery"
                type="text"
                value={temporalQuery}
                onChange={(e) => setTemporalQuery(e.target.value)}
                placeholder="e.g., What did we discuss about pricing last week?"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isQuerying}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isQuerying ? 'Searching...' : 'Search Memories'}
            </button>
          </form>

          {queryResults && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
                Memories from {queryResults.timeframe.description}
              </h3>
              
              {queryResults.summary && (
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                  <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-200">Summary</h4>
                  <p className="text-gray-700 dark:text-gray-300">{queryResults.summary}</p>
                </div>
              )}
              
              {queryResults.memories.length > 0 ? (
                <div className="space-y-4">
                  {queryResults.memories.map(renderMemoryItem)}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No memories found for this query.</p>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          <form onSubmit={handleCompareSubmit} className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="period1" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  First Time Period
                </label>
                <input
                  id="period1"
                  type="text"
                  value={period1}
                  onChange={(e) => setPeriod1(e.target.value)}
                  placeholder="e.g., last month, Q1 2023"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label htmlFor="period2" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Second Time Period
                </label>
                <input
                  id="period2"
                  type="text"
                  value={period2}
                  onChange={(e) => setPeriod2(e.target.value)}
                  placeholder="e.g., this month, Q2 2023"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isComparing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isComparing ? 'Comparing...' : 'Compare Periods'}
            </button>
          </form>

          {comparisonResults && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                Comparison: {comparisonResults.period1.description} vs. {comparisonResults.period2.description}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">
                    {comparisonResults.period1.description}
                    <span className="text-xs ml-2 text-gray-500">
                      ({comparisonResults.period1.memories.length} memories)
                    </span>
                  </h4>
                  {comparisonResults.period1.summary && (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {comparisonResults.period1.summary}
                      </p>
                    </div>
                  )}
                </div>
                
                <div>
                  <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">
                    {comparisonResults.period2.description}
                    <span className="text-xs ml-2 text-gray-500">
                      ({comparisonResults.period2.memories.length} memories)
                    </span>
                  </h4>
                  {comparisonResults.period2.summary && (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {comparisonResults.period2.summary}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {(comparisonResults.differences?.length > 0 || comparisonResults.similarities?.length > 0) && (
                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-amber-50 dark:bg-amber-900 rounded-lg">
                    <h4 className="font-medium mb-2 text-amber-800 dark:text-amber-200">Key Differences</h4>
                    {comparisonResults.differences?.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                        {comparisonResults.differences.map((diff, idx) => (
                          <li key={idx} className="text-sm">{diff}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No significant differences found.</p>
                    )}
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                    <h4 className="font-medium mb-2 text-green-800 dark:text-green-200">Key Similarities</h4>
                    {comparisonResults.similarities?.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                        {comparisonResults.similarities.map((sim, idx) => (
                          <li key={idx} className="text-sm">{sim}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No significant similarities found.</p>
                    )}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Memories from {comparisonResults.period1.description}
                  </h4>
                  {comparisonResults.period1.memories.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                      {comparisonResults.period1.memories.map(renderMemoryItem)}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No memories found for this period.</p>
                  )}
                </div>
                
                <div>
                  <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Memories from {comparisonResults.period2.description}
                  </h4>
                  {comparisonResults.period2.memories.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                      {comparisonResults.period2.memories.map(renderMemoryItem)}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No memories found for this period.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TemporalMemoryExplorer;