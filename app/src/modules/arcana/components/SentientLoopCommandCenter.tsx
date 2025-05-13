import React, { useState, useEffect } from 'react';
import { useSentientLoopSystem } from '../hooks/useSentientLoopSystem';
import { useUser } from 'wasp/client/auth';

// Types for the component
type SentientLoopCommandCenterProps = {
  moduleId?: string;
  onCheckpointSelected?: (checkpoint: any) => void;
  onCheckpointResolved?: (checkpoint: any, resolution: any) => void;
  className?: string;
};

/**
 * Sentient Loop Command Center Component
 * 
 * This component serves as the central UI for the Sentient Loop™ system,
 * displaying pending checkpoints, active HITL sessions, and providing
 * controls for human-in-the-loop decision making.
 */
export const SentientLoopCommandCenter: React.FC<SentientLoopCommandCenterProps> = ({
  moduleId,
  onCheckpointSelected,
  onCheckpointResolved,
  className = ''
}) => {
  const user = useUser();
  const {
    pendingCheckpoints,
    currentCheckpoint,
    isLoadingCheckpoints,
    approveCheckpoint,
    rejectCheckpoint,
    modifyCheckpoint,
    escalateCheckpoint,
    selectCheckpoint,
    activeHITLSessions,
    getActiveHITLSessions,
    resolveHITLSession,
    escalateHITLSession,
    takeMemorySnapshot
  } = useSentientLoopSystem(moduleId);

  // Local state
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<any>(null);
  const [modifiedPayload, setModifiedPayload] = useState<any>(null);
  const [resolution, setResolution] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'checkpoints' | 'sessions' | 'memory' | 'traces'>('checkpoints');
  const [activeSessions, setActiveSessions] = useState<any[]>([]);

  // Update selected checkpoint when current checkpoint changes
  useEffect(() => {
    if (currentCheckpoint && !selectedCheckpoint) {
      setSelectedCheckpoint(currentCheckpoint);
      if (onCheckpointSelected) {
        onCheckpointSelected(currentCheckpoint);
      }
    }
  }, [currentCheckpoint, selectedCheckpoint, onCheckpointSelected]);

  // Update active sessions when they change
  useEffect(() => {
    setActiveSessions(getActiveHITLSessions());
  }, [activeHITLSessions, getActiveHITLSessions]);

  // Handle checkpoint selection
  const handleSelectCheckpoint = (checkpoint: any) => {
    setSelectedCheckpoint(checkpoint);
    selectCheckpoint(checkpoint);
    setModifiedPayload(null);
    setResolution('');
    if (onCheckpointSelected) {
      onCheckpointSelected(checkpoint);
    }
  };

  // Handle checkpoint approval
  const handleApproveCheckpoint = async () => {
    if (!selectedCheckpoint) return;
    
    setIsProcessing(true);
    try {
      const result = await approveCheckpoint(selectedCheckpoint.id, resolution || 'Approved');
      setSelectedCheckpoint(null);
      setModifiedPayload(null);
      setResolution('');
      if (onCheckpointResolved) {
        onCheckpointResolved(selectedCheckpoint, { status: 'APPROVED', resolution, result });
      }
    } catch (error) {
      console.error('Error approving checkpoint:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle checkpoint rejection
  const handleRejectCheckpoint = async () => {
    if (!selectedCheckpoint || !resolution) return;
    
    setIsProcessing(true);
    try {
      const result = await rejectCheckpoint(selectedCheckpoint.id, resolution);
      setSelectedCheckpoint(null);
      setModifiedPayload(null);
      setResolution('');
      if (onCheckpointResolved) {
        onCheckpointResolved(selectedCheckpoint, { status: 'REJECTED', resolution, result });
      }
    } catch (error) {
      console.error('Error rejecting checkpoint:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle checkpoint modification
  const handleModifyCheckpoint = async () => {
    if (!selectedCheckpoint || !modifiedPayload || !resolution) return;
    
    setIsProcessing(true);
    try {
      const result = await modifyCheckpoint(selectedCheckpoint.id, modifiedPayload, resolution);
      setSelectedCheckpoint(null);
      setModifiedPayload(null);
      setResolution('');
      if (onCheckpointResolved) {
        onCheckpointResolved(selectedCheckpoint, { status: 'MODIFIED', resolution, modifiedPayload, result });
      }
    } catch (error) {
      console.error('Error modifying checkpoint:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle checkpoint escalation
  const handleEscalateCheckpoint = async (level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') => {
    if (!selectedCheckpoint || !resolution) return;
    
    setIsProcessing(true);
    try {
      const result = await escalateCheckpoint(selectedCheckpoint.id, level, resolution);
      setSelectedCheckpoint(null);
      setModifiedPayload(null);
      setResolution('');
      if (onCheckpointResolved) {
        onCheckpointResolved(selectedCheckpoint, { status: 'ESCALATED', resolution, level, result });
      }
    } catch (error) {
      console.error('Error escalating checkpoint:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle HITL session resolution
  const handleResolveSession = async (sessionId: string, status: 'APPROVED' | 'REJECTED' | 'MODIFIED', sessionResolution: string, payload?: any) => {
    setIsProcessing(true);
    try {
      const result = await resolveHITLSession({
        sessionId,
        status,
        resolution: sessionResolution,
        modifiedPayload: payload
      });
      if (onCheckpointResolved) {
        onCheckpointResolved({ id: sessionId }, { status, resolution: sessionResolution, modifiedPayload: payload, result });
      }
    } catch (error) {
      console.error('Error resolving HITL session:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle HITL session escalation
  const handleEscalateSession = async (sessionId: string, level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', reason: string) => {
    setIsProcessing(true);
    try {
      const result = await escalateHITLSession({
        sessionId,
        level,
        reason
      });
      if (onCheckpointResolved) {
        onCheckpointResolved({ id: sessionId }, { status: 'ESCALATED', resolution: reason, level, result });
      }
    } catch (error) {
      console.error('Error escalating HITL session:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle adding a memory snapshot
  const handleAddMemory = async (sessionId: string, memoryType: 'CONTEXT' | 'FEEDBACK' | 'DECISION', content: any) => {
    try {
      await takeMemorySnapshot({
        sessionId,
        memoryType,
        content
      });
    } catch (error) {
      console.error('Error adding memory snapshot:', error);
    }
  };

  // Render loading state
  if (isLoadingCheckpoints) {
    return (
      <div className={`p-4 bg-gray-900 text-white rounded-lg shadow-lg ${className}`}>
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          <span className="ml-2">Loading Sentient Loop™ data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900 text-white rounded-lg shadow-lg ${className}`}>
      {/* Command Center Header */}
      <div className="border-b border-gray-800 p-4">
        <h2 className="text-xl font-bold text-purple-400">Sentient Loop™ Command Center</h2>
        <p className="text-gray-400 text-sm">Human-in-the-loop cognitive feedback system</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-800">
        <button
          className={`px-4 py-2 ${activeTab === 'checkpoints' ? 'bg-gray-800 text-purple-400' : 'text-gray-400'}`}
          onClick={() => setActiveTab('checkpoints')}
        >
          Checkpoints {pendingCheckpoints.length > 0 && `(${pendingCheckpoints.length})`}
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'sessions' ? 'bg-gray-800 text-purple-400' : 'text-gray-400'}`}
          onClick={() => setActiveTab('sessions')}
        >
          Active Sessions {activeSessions.length > 0 && `(${activeSessions.length})`}
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'memory' ? 'bg-gray-800 text-purple-400' : 'text-gray-400'}`}
          onClick={() => setActiveTab('memory')}
        >
          Memory
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'traces' ? 'bg-gray-800 text-purple-400' : 'text-gray-400'}`}
          onClick={() => setActiveTab('traces')}
        >
          Decision Traces
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {/* Checkpoints Tab */}
        {activeTab === 'checkpoints' && (
          <div>
            {pendingCheckpoints.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>No pending checkpoints requiring human decision</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {/* Checkpoint List */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">Pending Checkpoints</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {pendingCheckpoints.map((checkpoint) => (
                      <div
                        key={checkpoint.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedCheckpoint?.id === checkpoint.id ? 'bg-purple-900' : 'bg-gray-700 hover:bg-gray-600'
                        }`}
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
                </div>

                {/* Selected Checkpoint Details */}
                {selectedCheckpoint && (
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2">Checkpoint Details</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm text-gray-400">Title</h4>
                        <p className="font-medium">{selectedCheckpoint.title}</p>
                      </div>
                      <div>
                        <h4 className="text-sm text-gray-400">Description</h4>
                        <p>{selectedCheckpoint.description}</p>
                      </div>
                      <div>
                        <h4 className="text-sm text-gray-400">Type</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          selectedCheckpoint.type === 'DECISION_REQUIRED' ? 'bg-blue-900 text-blue-200' :
                          selectedCheckpoint.type === 'CONFIRMATION_REQUIRED' ? 'bg-green-900 text-green-200' :
                          selectedCheckpoint.type === 'INFORMATION_REQUIRED' ? 'bg-yellow-900 text-yellow-200' :
                          selectedCheckpoint.type === 'ESCALATION_REQUIRED' ? 'bg-red-900 text-red-200' :
                          selectedCheckpoint.type === 'VALIDATION_REQUIRED' ? 'bg-indigo-900 text-indigo-200' :
                          'bg-gray-900 text-gray-200'
                        }`}>
                          {selectedCheckpoint.type.replace('_REQUIRED', '')}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm text-gray-400">Payload</h4>
                        <div className="bg-gray-900 p-3 rounded-lg overflow-x-auto">
                          <pre className="text-xs">{JSON.stringify(selectedCheckpoint.originalPayload, null, 2)}</pre>
                        </div>
                      </div>

                      {/* Modification Section */}
                      <div>
                        <h4 className="text-sm text-gray-400">Modify Payload (Optional)</h4>
                        <textarea
                          className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg p-2 text-xs font-mono mt-1"
                          rows={5}
                          value={modifiedPayload ? JSON.stringify(modifiedPayload, null, 2) : JSON.stringify(selectedCheckpoint.originalPayload, null, 2)}
                          onChange={(e) => {
                            try {
                              setModifiedPayload(JSON.parse(e.target.value));
                            } catch (error) {
                              // Invalid JSON, don't update
                            }
                          }}
                        />
                      </div>

                      {/* Resolution Section */}
                      <div>
                        <h4 className="text-sm text-gray-400">Resolution / Reasoning</h4>
                        <textarea
                          className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg p-2 mt-1"
                          rows={3}
                          value={resolution}
                          onChange={(e) => setResolution(e.target.value)}
                          placeholder="Provide reasoning for your decision..."
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={handleApproveCheckpoint}
                          disabled={isProcessing}
                        >
                          Approve
                        </button>
                        <button
                          className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={handleRejectCheckpoint}
                          disabled={isProcessing || !resolution}
                        >
                          Reject
                        </button>
                        <button
                          className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={handleModifyCheckpoint}
                          disabled={isProcessing || !modifiedPayload || !resolution}
                        >
                          Modify & Approve
                        </button>
                        <div className="relative group">
                          <button
                            className="px-4 py-2 bg-yellow-700 hover:bg-yellow-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isProcessing || !resolution}
                          >
                            Escalate
                          </button>
                          <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 hidden group-hover:block z-10">
                            <div className="py-1" role="menu" aria-orientation="vertical">
                              <button
                                className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left"
                                onClick={() => handleEscalateCheckpoint('LOW')}
                                disabled={isProcessing}
                              >
                                Low Priority
                              </button>
                              <button
                                className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left"
                                onClick={() => handleEscalateCheckpoint('MEDIUM')}
                                disabled={isProcessing}
                              >
                                Medium Priority
                              </button>
                              <button
                                className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left"
                                onClick={() => handleEscalateCheckpoint('HIGH')}
                                disabled={isProcessing}
                              >
                                High Priority
                              </button>
                              <button
                                className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left"
                                onClick={() => handleEscalateCheckpoint('CRITICAL')}
                                disabled={isProcessing}
                              >
                                Critical Priority
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Active Sessions Tab */}
        {activeTab === 'sessions' && (
          <div>
            {activeSessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>No active HITL sessions</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeSessions.map((session) => (
                  <div key={session.id} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{session.checkpoint.title}</h3>
                        <p className="text-sm text-gray-400">{session.checkpoint.description}</p>
                      </div>
                      <div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          session.status === 'PENDING' ? 'bg-yellow-900 text-yellow-200' :
                          session.status === 'APPROVED' ? 'bg-green-900 text-green-200' :
                          session.status === 'REJECTED' ? 'bg-red-900 text-red-200' :
                          session.status === 'MODIFIED' ? 'bg-blue-900 text-blue-200' :
                          session.status === 'ESCALATED' ? 'bg-purple-900 text-purple-200' :
                          'bg-gray-900 text-gray-200'
                        }`}>
                          {session.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm text-gray-400 mb-2">Session Details</h4>
                        <div className="bg-gray-900 p-3 rounded-lg">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="text-gray-500">ID:</div>
                            <div className="truncate">{session.id}</div>
                            <div className="text-gray-500">Created:</div>
                            <div>{new Date(session.createdAt).toLocaleString()}</div>
                            <div className="text-gray-500">Expires:</div>
                            <div>{session.timeoutAt ? new Date(session.timeoutAt).toLocaleString() : 'N/A'}</div>
                            <div className="text-gray-500">Type:</div>
                            <div>{session.checkpoint.type}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm text-gray-400 mb-2">Payload</h4>
                        <div className="bg-gray-900 p-3 rounded-lg overflow-x-auto max-h-40">
                          <pre className="text-xs">{JSON.stringify(session.checkpoint.originalPayload, null, 2)}</pre>
                        </div>
                      </div>
                    </div>
                    
                    {session.status === 'PENDING' && (
                      <div className="mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm text-gray-400 mb-2">Resolution</h4>
                            <textarea
                              className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg p-2"
                              rows={3}
                              placeholder="Provide reasoning for your decision..."
                              id={`resolution-${session.id}`}
                            />
                          </div>
                          
                          <div>
                            <h4 className="text-sm text-gray-400 mb-2">Actions</h4>
                            <div className="flex flex-wrap gap-2">
                              <button
                                className="px-3 py-1 bg-green-700 hover:bg-green-600 text-white rounded-lg text-sm"
                                onClick={() => {
                                  const resolutionEl = document.getElementById(`resolution-${session.id}`) as HTMLTextAreaElement;
                                  handleResolveSession(session.id, 'APPROVED', resolutionEl?.value || 'Approved');
                                }}
                                disabled={isProcessing}
                              >
                                Approve
                              </button>
                              <button
                                className="px-3 py-1 bg-red-700 hover:bg-red-600 text-white rounded-lg text-sm"
                                onClick={() => {
                                  const resolutionEl = document.getElementById(`resolution-${session.id}`) as HTMLTextAreaElement;
                                  handleResolveSession(session.id, 'REJECTED', resolutionEl?.value || 'Rejected');
                                }}
                                disabled={isProcessing}
                              >
                                Reject
                              </button>
                              <button
                                className="px-3 py-1 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-sm"
                                onClick={() => {
                                  const resolutionEl = document.getElementById(`resolution-${session.id}`) as HTMLTextAreaElement;
                                  // In a real implementation, you would have a UI for modifying the payload
                                  handleResolveSession(session.id, 'MODIFIED', resolutionEl?.value || 'Modified', session.checkpoint.originalPayload);
                                }}
                                disabled={isProcessing}
                              >
                                Modify
                              </button>
                              <div className="relative group">
                                <button
                                  className="px-3 py-1 bg-yellow-700 hover:bg-yellow-600 text-white rounded-lg text-sm"
                                  disabled={isProcessing}
                                >
                                  Escalate
                                </button>
                                <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 hidden group-hover:block z-10">
                                  <div className="py-1" role="menu" aria-orientation="vertical">
                                    <button
                                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left"
                                      onClick={() => {
                                        const resolutionEl = document.getElementById(`resolution-${session.id}`) as HTMLTextAreaElement;
                                        handleEscalateSession(session.id, 'LOW', resolutionEl?.value || 'Escalated: Low Priority');
                                      }}
                                      disabled={isProcessing}
                                    >
                                      Low Priority
                                    </button>
                                    <button
                                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left"
                                      onClick={() => {
                                        const resolutionEl = document.getElementById(`resolution-${session.id}`) as HTMLTextAreaElement;
                                        handleEscalateSession(session.id, 'MEDIUM', resolutionEl?.value || 'Escalated: Medium Priority');
                                      }}
                                      disabled={isProcessing}
                                    >
                                      Medium Priority
                                    </button>
                                    <button
                                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left"
                                      onClick={() => {
                                        const resolutionEl = document.getElementById(`resolution-${session.id}`) as HTMLTextAreaElement;
                                        handleEscalateSession(session.id, 'HIGH', resolutionEl?.value || 'Escalated: High Priority');
                                      }}
                                      disabled={isProcessing}
                                    >
                                      High Priority
                                    </button>
                                    <button
                                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left"
                                      onClick={() => {
                                        const resolutionEl = document.getElementById(`resolution-${session.id}`) as HTMLTextAreaElement;
                                        handleEscalateSession(session.id, 'CRITICAL', resolutionEl?.value || 'Escalated: Critical Priority');
                                      }}
                                      disabled={isProcessing}
                                    >
                                      Critical Priority
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {session.status !== 'PENDING' && (
                      <div className="mt-4 bg-gray-900 p-3 rounded-lg">
                        <h4 className="text-sm text-gray-400 mb-2">Resolution</h4>
                        <p className="text-sm">{session.result?.message || 'No resolution provided'}</p>
                      </div>
                    )}
                    
                    {/* Memory Snapshots */}
                    {session.memorySnapshots && session.memorySnapshots.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm text-gray-400 mb-2">Memory Snapshots</h4>
                        <div className="bg-gray-900 p-3 rounded-lg max-h-40 overflow-y-auto">
                          {session.memorySnapshots.map((memory: any, index: number) => (
                            <div key={index} className="mb-2 pb-2 border-b border-gray-800 last:border-0">
                              <div className="flex justify-between items-start">
                                <span className="text-xs font-medium">{memory.type}</span>
                                {memory.importance && (
                                  <span className="text-xs bg-gray-700 px-2 py-0.5 rounded-full">
                                    Importance: {memory.importance}
                                  </span>
                                )}
                              </div>
                              <pre className="text-xs mt-1 overflow-x-auto">{JSON.stringify(memory.content, null, 2)}</pre>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Add Memory Button (for PENDING sessions) */}
                    {session.status === 'PENDING' && (
                      <div className="mt-4">
                        <button
                          className="text-sm text-purple-400 hover:text-purple-300"
                          onClick={() => {
                            // In a real implementation, you would have a UI for adding memory
                            handleAddMemory(session.id, 'CONTEXT', { note: 'Additional context added by user' });
                          }}
                        >
                          + Add Memory Snapshot
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Memory Tab */}
        {activeTab === 'memory' && (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p>Memory management interface</p>
            <p className="text-sm mt-2">View and manage Sentient Loop™ memory snapshots</p>
          </div>
        )}

        {/* Decision Traces Tab */}
        {activeTab === 'traces' && (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <p>Decision traceability interface</p>
            <p className="text-sm mt-2">View and audit decision traces for accountability</p>
          </div>
        )}
      </div>

      {/* Command Center Footer */}
      <div className="border-t border-gray-800 p-4 text-xs text-gray-500 flex justify-between items-center">
        <div>
          Sentient Loop™ v1.0 | User: {user?.username || user?.email || 'Unknown'}
        </div>
        <div>
          {isProcessing && (
            <span className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-purple-500 mr-2"></div>
              Processing...
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SentientLoopCommandCenter;