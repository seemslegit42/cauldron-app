import React, { useState, useEffect } from 'react';
import { useSentientLoopSystem } from '../hooks/useSentientLoopSystem';

// Types for the component
type SentientCheckpointFlowProps = {
  checkpointId?: string;
  onCheckpointSelected?: (checkpoint: any) => void;
  className?: string;
};

/**
 * Sentient Checkpoint Flow Component
 * 
 * This component visualizes the flow of checkpoints, decisions, and escalations
 * in the Sentient Loop™ system, showing the relationships between different
 * decision points and their outcomes.
 */
export const SentientCheckpointFlow: React.FC<SentientCheckpointFlowProps> = ({
  checkpointId,
  onCheckpointSelected,
  className = ''
}) => {
  const {
    pendingCheckpoints,
    isLoadingCheckpoints,
    decisionTraces,
    escalations,
    memorySnapshots
  } = useSentientLoopSystem();

  // Local state
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<any>(null);
  const [checkpointHistory, setCheckpointHistory] = useState<any[]>([]);
  const [flowData, setFlowData] = useState<any>({
    nodes: [],
    edges: []
  });

  // Load checkpoint data when checkpointId changes
  useEffect(() => {
    if (checkpointId) {
      const checkpoint = pendingCheckpoints.find(cp => cp.id === checkpointId);
      if (checkpoint) {
        setSelectedCheckpoint(checkpoint);
      }
    }
  }, [checkpointId, pendingCheckpoints]);

  // Build flow data when selected checkpoint changes
  useEffect(() => {
    if (selectedCheckpoint) {
      // In a real implementation, you would fetch the checkpoint history
      // and build a graph of related checkpoints, decisions, and escalations
      
      // For now, we'll create a simple flow with the selected checkpoint
      // and any related decision traces and escalations
      
      const nodes = [
        {
          id: selectedCheckpoint.id,
          type: 'checkpoint',
          data: selectedCheckpoint,
          position: { x: 250, y: 100 }
        }
      ];
      
      const edges: any[] = [];
      
      // Add decision traces
      const checkpointTraces = decisionTraces[selectedCheckpoint.id] || [];
      checkpointTraces.forEach((trace, index) => {
        const nodeId = `trace-${selectedCheckpoint.id}-${index}`;
        nodes.push({
          id: nodeId,
          type: 'decision',
          data: trace,
          position: { x: 250, y: 200 + (index * 100) }
        });
        
        edges.push({
          id: `edge-${selectedCheckpoint.id}-${nodeId}`,
          source: selectedCheckpoint.id,
          target: nodeId,
          type: 'decision-edge'
        });
      });
      
      // Add escalations
      const checkpointEscalations = escalations[selectedCheckpoint.id] || [];
      checkpointEscalations.forEach((escalation, index) => {
        const nodeId = `escalation-${selectedCheckpoint.id}-${index}`;
        nodes.push({
          id: nodeId,
          type: 'escalation',
          data: escalation,
          position: { x: 450, y: 100 + (index * 100) }
        });
        
        edges.push({
          id: `edge-${selectedCheckpoint.id}-${nodeId}`,
          source: selectedCheckpoint.id,
          target: nodeId,
          type: 'escalation-edge'
        });
      });
      
      // Add memory snapshots
      const checkpointMemories = memorySnapshots[selectedCheckpoint.id] || [];
      checkpointMemories.forEach((memory, index) => {
        const nodeId = `memory-${selectedCheckpoint.id}-${index}`;
        nodes.push({
          id: nodeId,
          type: 'memory',
          data: memory,
          position: { x: 50, y: 100 + (index * 100) }
        });
        
        edges.push({
          id: `edge-${selectedCheckpoint.id}-${nodeId}`,
          source: selectedCheckpoint.id,
          target: nodeId,
          type: 'memory-edge'
        });
      });
      
      setFlowData({ nodes, edges });
    }
  }, [selectedCheckpoint, decisionTraces, escalations, memorySnapshots]);

  // Handle checkpoint selection
  const handleSelectCheckpoint = (checkpoint: any) => {
    setSelectedCheckpoint(checkpoint);
    if (onCheckpointSelected) {
      onCheckpointSelected(checkpoint);
    }
  };

  // Render loading state
  if (isLoadingCheckpoints) {
    return (
      <div className={`p-4 bg-gray-900 text-white rounded-lg shadow-lg ${className}`}>
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          <span className="ml-2">Loading checkpoint data...</span>
        </div>
      </div>
    );
  }

  // If no checkpoint is selected, show a list of checkpoints
  if (!selectedCheckpoint) {
    return (
      <div className={`bg-gray-900 text-white rounded-lg shadow-lg ${className}`}>
        <div className="border-b border-gray-800 p-4">
          <h2 className="text-xl font-bold text-purple-400">Sentient Checkpoint Flow</h2>
          <p className="text-gray-400 text-sm">Select a checkpoint to visualize its decision flow</p>
        </div>
        
        <div className="p-4">
          {pendingCheckpoints.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <p>No checkpoints available</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {pendingCheckpoints.map((checkpoint) => (
                <div
                  key={checkpoint.id}
                  className="p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                  onClick={() => handleSelectCheckpoint(checkpoint)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{checkpoint.title}</h4>
                      <p className="text-sm text-gray-400">{checkpoint.description.substring(0, 100)}{checkpoint.description.length > 100 ? '...' : ''}</p>
                    </div>
                    <div className="flex items-center">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        checkpoint.type === 'DECISION_REQUIRED' ? 'bg-blue-900 text-blue-200' :
                        checkpoint.type === 'CONFIRMATION_REQUIRED' ? 'bg-green-900 text-green-200' :
                        checkpoint.type === 'INFORMATION_REQUIRED' ? 'bg-yellow-900 text-yellow-200' :
                        checkpoint.type === 'ESCALATION_REQUIRED' ? 'bg-red-900 text-red-200' :
                        checkpoint.type === 'VALIDATION_REQUIRED' ? 'bg-indigo-900 text-indigo-200' :
                        'bg-gray-900 text-gray-200'
                      }`}>
                        {checkpoint.type.replace('_REQUIRED', '')}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Created: {new Date(checkpoint.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render the checkpoint flow visualization
  return (
    <div className={`bg-gray-900 text-white rounded-lg shadow-lg ${className}`}>
      <div className="border-b border-gray-800 p-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-purple-400">Checkpoint Flow</h2>
          <p className="text-gray-400 text-sm">{selectedCheckpoint.title}</p>
        </div>
        <button
          className="text-gray-400 hover:text-white"
          onClick={() => setSelectedCheckpoint(null)}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="p-4">
        {/* In a real implementation, you would use a graph visualization library like React Flow */}
        {/* For now, we'll render a simplified representation of the flow */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Checkpoint Details</h3>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-400">ID:</div>
              <div className="truncate">{selectedCheckpoint.id}</div>
              <div className="text-gray-400">Type:</div>
              <div>{selectedCheckpoint.type}</div>
              <div className="text-gray-400">Created:</div>
              <div>{new Date(selectedCheckpoint.createdAt).toLocaleString()}</div>
              <div className="text-gray-400">Status:</div>
              <div>{selectedCheckpoint.status}</div>
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Description</h3>
            <p className="mt-2 text-sm">{selectedCheckpoint.description}</p>
          </div>
          
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Payload</h3>
            <div className="mt-2 bg-gray-900 p-3 rounded-lg overflow-x-auto">
              <pre className="text-xs">{JSON.stringify(selectedCheckpoint.originalPayload, null, 2)}</pre>
            </div>
          </div>
          
          {/* Flow Visualization */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Decision Flow</h3>
            <div className="mt-4 relative" style={{ height: '400px' }}>
              {/* Checkpoint Node */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-purple-900 p-3 rounded-lg shadow-lg border border-purple-700 w-64">
                <div className="text-sm font-medium">{selectedCheckpoint.type.replace('_REQUIRED', '')}</div>
                <div className="text-xs mt-1">{selectedCheckpoint.title}</div>
              </div>
              
              {/* Decision Traces */}
              {(decisionTraces[selectedCheckpoint.id] || []).map((trace, index) => (
                <div
                  key={`trace-${index}`}
                  className="absolute bg-blue-900 p-3 rounded-lg shadow-lg border border-blue-700 w-64"
                  style={{ top: '120px', left: '50%', transform: 'translateX(-50%)' }}
                >
                  <div className="text-sm font-medium">Decision: {trace.decisionType}</div>
                  <div className="text-xs mt-1">{trace.reasoning || 'No reasoning provided'}</div>
                </div>
              ))}
              
              {/* Escalations */}
              {(escalations[selectedCheckpoint.id] || []).map((escalation, index) => (
                <div
                  key={`escalation-${index}`}
                  className="absolute bg-red-900 p-3 rounded-lg shadow-lg border border-red-700 w-64"
                  style={{ top: '60px', left: 'calc(50% + 200px)' }}
                >
                  <div className="text-sm font-medium">Escalation: {escalation.level}</div>
                  <div className="text-xs mt-1">{escalation.reason}</div>
                </div>
              ))}
              
              {/* Memory Snapshots */}
              {(memorySnapshots[selectedCheckpoint.id] || []).map((memory, index) => (
                <div
                  key={`memory-${index}`}
                  className="absolute bg-green-900 p-3 rounded-lg shadow-lg border border-green-700 w-64"
                  style={{ top: `${60 + index * 80}px`, left: 'calc(50% - 200px)' }}
                >
                  <div className="text-sm font-medium">Memory: {memory.type}</div>
                  <div className="text-xs mt-1 overflow-hidden text-ellipsis">
                    {typeof memory.content === 'object' ? JSON.stringify(memory.content).substring(0, 50) + '...' : memory.content}
                  </div>
                </div>
              ))}
              
              {/* Connecting Lines */}
              <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
                {/* These would be dynamically generated in a real implementation */}
                <line x1="50%" y1="40" x2="50%" y2="120" stroke="#8B5CF6" strokeWidth="2" />
                
                {/* Lines to memory snapshots */}
                {(memorySnapshots[selectedCheckpoint.id] || []).map((_, index) => (
                  <line
                    key={`memory-line-${index}`}
                    x1="50%"
                    y1="40"
                    x2="calc(50% - 100px)"
                    y2={`${60 + index * 80 + 20}px`}
                    stroke="#10B981"
                    strokeWidth="2"
                  />
                ))}
                
                {/* Lines to escalations */}
                {(escalations[selectedCheckpoint.id] || []).map((_, index) => (
                  <line
                    key={`escalation-line-${index}`}
                    x1="50%"
                    y1="40"
                    x2="calc(50% + 100px)"
                    y2="80"
                    stroke="#EF4444"
                    strokeWidth="2"
                  />
                ))}
              </svg>
            </div>
          </div>
          
          {/* Legend */}
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-400">Legend</h3>
            <div className="mt-2 flex flex-wrap gap-4 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-900 rounded-sm mr-2"></div>
                <span>Checkpoint</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-900 rounded-sm mr-2"></div>
                <span>Decision</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-900 rounded-sm mr-2"></div>
                <span>Escalation</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-900 rounded-sm mr-2"></div>
                <span>Memory</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentientCheckpointFlow;