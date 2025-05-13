/**
 * Memory Explorer Component
 * 
 * A component for exploring and managing memory entries.
 */

import React, { useState, useEffect } from 'react';
import { useMemory } from '../hooks/useMemory';
import { MemoryContentType, MemoryQueryOptions, MemoryType } from '../types';

interface MemoryExplorerProps {
  initialOptions?: Partial<MemoryQueryOptions>;
  onMemorySelect?: (memory: any) => void;
  className?: string;
}

export const MemoryExplorer: React.FC<MemoryExplorerProps> = ({
  initialOptions = {},
  onMemorySelect,
  className = '',
}) => {
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOptions, setFilterOptions] = useState<Partial<MemoryQueryOptions>>(initialOptions);
  const { retrieveMemories, searchMemories, deleteMemory, memoryStats } = useMemory();

  // Load memories on mount and when filter options change
  useEffect(() => {
    const loadMemories = async () => {
      setLoading(true);
      try {
        const result = await retrieveMemories(filterOptions);
        setMemories(result);
      } catch (error) {
        console.error('Error loading memories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMemories();
  }, [retrieveMemories, filterOptions]);

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      // If search query is empty, revert to normal retrieval
      const result = await retrieveMemories(filterOptions);
      setMemories(result);
      return;
    }

    setLoading(true);
    try {
      const result = await searchMemories(searchQuery, filterOptions);
      setMemories(result);
    } catch (error) {
      console.error('Error searching memories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (newOptions: Partial<MemoryQueryOptions>) => {
    setFilterOptions(prev => ({
      ...prev,
      ...newOptions,
    }));
  };

  // Handle memory deletion
  const handleDeleteMemory = async (memoryId: string) => {
    if (window.confirm('Are you sure you want to delete this memory?')) {
      try {
        await deleteMemory(memoryId);
        setMemories(prev => prev.filter(memory => memory.id !== memoryId));
      } catch (error) {
        console.error('Error deleting memory:', error);
      }
    }
  };

  // Format date for display
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString();
  };

  // Format content for display
  const formatContent = (content: any) => {
    if (typeof content === 'string') {
      return content;
    }
    
    if (typeof content === 'object') {
      // Handle specific content types
      if (content.text) return content.text;
      if (content.summary) return content.summary;
      if (content.decision) return `Decision: ${content.decision}`;
      if (content.task) return `Task: ${content.task}`;
      
      // For conversation memories
      if (content.messages && Array.isArray(content.messages)) {
        return content.messages.map((msg: any, i: number) => (
          <div key={i} className="mb-1">
            {typeof msg === 'string' ? msg : msg.content || ''}
          </div>
        ));
      }
      
      // Fallback to JSON
      return (
        <pre className="text-xs overflow-auto max-h-32">
          {JSON.stringify(content, null, 2)}
        </pre>
      );
    }
    
    return String(content);
  };

  return (
    <div className={`bg-gray-900 rounded-lg p-4 ${className}`}>
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Memory Explorer</h2>
        
        {/* Memory Stats */}
        {memoryStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 text-sm">
            <div className="bg-gray-800 p-2 rounded">
              <div className="text-gray-400">Total</div>
              <div className="font-semibold">{memoryStats.totalEntries}</div>
            </div>
            <div className="bg-gray-800 p-2 rounded">
              <div className="text-gray-400">Short-term</div>
              <div className="font-semibold">{memoryStats.shortTermCount}</div>
            </div>
            <div className="bg-gray-800 p-2 rounded">
              <div className="text-gray-400">Long-term</div>
              <div className="font-semibold">{memoryStats.longTermCount}</div>
            </div>
            <div className="bg-gray-800 p-2 rounded">
              <div className="text-gray-400">Avg. Importance</div>
              <div className="font-semibold">{memoryStats.averageImportance.toFixed(1)}</div>
            </div>
          </div>
        )}
        
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-2 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search memories..."
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
        
        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          <select
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded"
            value={filterOptions.contentType || ''}
            onChange={e => handleFilterChange({ 
              contentType: e.target.value ? e.target.value as MemoryContentType : undefined 
            })}
          >
            <option value="">All Types</option>
            <option value={MemoryContentType.CONVERSATION}>Conversation</option>
            <option value={MemoryContentType.FACT}>Fact</option>
            <option value={MemoryContentType.PREFERENCE}>Preference</option>
            <option value={MemoryContentType.TASK}>Task</option>
            <option value={MemoryContentType.DECISION}>Decision</option>
            <option value={MemoryContentType.OUTCOME}>Outcome</option>
            <option value={MemoryContentType.FEEDBACK}>Feedback</option>
          </select>
          
          <select
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded"
            value={filterOptions.type || ''}
            onChange={e => handleFilterChange({ 
              type: e.target.value ? e.target.value as MemoryType : undefined 
            })}
          >
            <option value="">All Duration</option>
            <option value={MemoryType.SHORT_TERM}>Short-term</option>
            <option value={MemoryType.LONG_TERM}>Long-term</option>
          </select>
          
          <select
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded"
            value={filterOptions.minImportance?.toString() || ''}
            onChange={e => handleFilterChange({ 
              minImportance: e.target.value ? Number(e.target.value) : undefined 
            })}
          >
            <option value="">Any Importance</option>
            <option value="1">1+ (Low)</option>
            <option value="2">2+ (Medium)</option>
            <option value="3">3+ (High)</option>
            <option value="4">4+ (Critical)</option>
          </select>
          
          <select
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded"
            value={filterOptions.limit?.toString() || '10'}
            onChange={e => handleFilterChange({ 
              limit: Number(e.target.value) 
            })}
          >
            <option value="5">5 results</option>
            <option value="10">10 results</option>
            <option value="25">25 results</option>
            <option value="50">50 results</option>
          </select>
        </div>
      </div>
      
      {/* Memory List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <div className="mt-2">Loading memories...</div>
          </div>
        ) : memories.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No memories found. Try adjusting your filters.
          </div>
        ) : (
          memories.map(memory => (
            <div 
              key={memory.id} 
              className="bg-gray-800 rounded-lg p-3 hover:bg-gray-750 transition cursor-pointer"
              onClick={() => onMemorySelect && onMemorySelect(memory)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="inline-block px-2 py-1 text-xs rounded bg-gray-700 mr-2">
                    {memory.contentType}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {memory.context}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block px-2 py-1 text-xs rounded bg-blue-900 mr-2">
                    Importance: {memory.importance}
                  </span>
                  <button
                    className="text-red-500 hover:text-red-400 p-1"
                    onClick={e => {
                      e.stopPropagation();
                      handleDeleteMemory(memory.id);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="mb-2 text-sm">
                {formatContent(memory.content)}
              </div>
              
              <div className="text-xs text-gray-500 flex justify-between">
                <div>
                  {memory.agentId && (
                    <span className="mr-2">Agent: {memory.agentId.substring(0, 8)}...</span>
                  )}
                  {memory.sessionId && (
                    <span>Session: {memory.sessionId.substring(0, 8)}...</span>
                  )}
                </div>
                <div>
                  Created: {formatDate(memory.createdAt)}
                  {memory.expiresAt && (
                    <span className="ml-2">
                      Expires: {formatDate(memory.expiresAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};