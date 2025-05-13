/**
 * Memory Page
 * 
 * A page for exploring and managing memory entries, with temporal memory capabilities.
 */

import React, { useState } from 'react';
import { MemoryExplorer } from '../components/MemoryExplorer';
import { TemporalMemoryExplorer } from '../components/TemporalMemoryExplorer';
import { MemoryEntry } from '../types';

const MemoryPage: React.FC = () => {
  const [selectedMemory, setSelectedMemory] = useState<MemoryEntry | null>(null);
  const [activeTab, setActiveTab] = useState<'standard' | 'temporal'>('standard');

  // Format JSON for display
  const formatJson = (json: any) => {
    return JSON.stringify(json, null, 2);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">AI Memory Manager</h1>
        <p className="text-gray-400">
          Explore and manage AI task history, interaction logs, decisions, and outcomes across time.
        </p>
      </div>

      <div className="mb-6">
        <div className="flex border-b border-gray-700">
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'standard'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('standard')}
          >
            Standard Memory
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'temporal'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('temporal')}
          >
            Temporal Memory
          </button>
        </div>
      </div>

      {activeTab === 'standard' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MemoryExplorer 
              onMemorySelect={setSelectedMemory}
              className="h-full"
            />
          </div>

          <div>
            <div className="bg-gray-900 rounded-lg p-4 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Memory Details</h2>
              
              {selectedMemory ? (
                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">
                      {selectedMemory.contentType} Memory
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                      <div className="bg-gray-800 p-2 rounded">
                        <div className="text-gray-400">Type</div>
                        <div>{selectedMemory.type}</div>
                      </div>
                      <div className="bg-gray-800 p-2 rounded">
                        <div className="text-gray-400">Context</div>
                        <div>{selectedMemory.context}</div>
                      </div>
                      <div className="bg-gray-800 p-2 rounded">
                        <div className="text-gray-400">Importance</div>
                        <div>{selectedMemory.importance}</div>
                      </div>
                      <div className="bg-gray-800 p-2 rounded">
                        <div className="text-gray-400">Created</div>
                        <div>{new Date(selectedMemory.createdAt as any).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-md font-medium mb-2">Content</h3>
                    <div className="bg-gray-800 p-3 rounded overflow-auto max-h-96">
                      <pre className="text-sm whitespace-pre-wrap">
                        {formatJson(selectedMemory.content)}
                      </pre>
                    </div>
                  </div>

                  {selectedMemory.metadata && Object.keys(selectedMemory.metadata).length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-md font-medium mb-2">Metadata</h3>
                      <div className="bg-gray-800 p-3 rounded overflow-auto max-h-40">
                        <pre className="text-sm whitespace-pre-wrap">
                          {formatJson(selectedMemory.metadata)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {selectedMemory.embedding && (
                    <div>
                      <h3 className="text-md font-medium mb-2">Embedding</h3>
                      <div className="bg-gray-800 p-3 rounded">
                        <div className="text-sm">
                          Vector dimensions: {selectedMemory.embedding.length}
                        </div>
                        <div className="mt-2 h-20 w-full overflow-hidden relative">
                          <div className="absolute inset-0 flex items-center">
                            {selectedMemory.embedding.slice(0, 100).map((value, i) => (
                              <div
                                key={i}
                                className="w-1 mx-px bg-blue-500"
                                style={{ 
                                  height: `${Math.max(4, Math.abs(value) * 100)}%`,
                                  opacity: Math.max(0.3, Math.abs(value)),
                                }}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Showing first 100 of {selectedMemory.embedding.length} dimensions
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  Select a memory to view details
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Temporal Memory Explorer</h2>
          <p className="text-gray-400 mb-6">
            Query your memories using natural language with temporal references or compare memories across different time periods.
          </p>
          <TemporalMemoryExplorer />
        </div>
      )}
    </div>
  );
};

export default MemoryPage;