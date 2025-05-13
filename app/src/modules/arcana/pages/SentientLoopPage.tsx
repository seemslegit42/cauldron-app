import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSentientLoopSystem } from '../hooks/useSentientLoopSystem';
import SentientCheckpointCard from '../components/SentientCheckpointCard';
import SentientLoopStats from '../components/SentientLoopStats';
import SentientLoopConfig from '../components/SentientLoopConfig';
import SentientCheckpointDetail from '../components/SentientCheckpointDetail';
import SentientLoopCommandCenter from '../components/SentientLoopCommandCenter';
import SentientCheckpointFlow from '../components/SentientCheckpointFlow';

const SentientLoopPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'command-center' | 'checkpoints' | 'flow' | 'config'>('dashboard');
  const [selectedCheckpointId, setSelectedCheckpointId] = useState<string | null>(null);

  const {
    pendingCheckpoints,
    currentCheckpoint,
    loopConfig,
    isLoadingCheckpoints,
    isLoadingConfig,
    isProcessing,
    approveCheckpoint,
    rejectCheckpoint,
    modifyCheckpoint,
    escalateCheckpoint,
    updateConfig,
    selectCheckpoint,
    refetchCheckpoints,
    activeHITLSessions,
    getActiveHITLSessions
  } = useSentientLoopSystem();

  // Handle checkpoint selection
  const handleCheckpointSelected = (checkpoint: any) => {
    selectCheckpoint(checkpoint);
    setSelectedCheckpointId(checkpoint.id);
  };

  // Handle checkpoint resolution
  const handleCheckpointResolved = (checkpoint: any, resolution: any) => {
    refetchCheckpoints();
    setSelectedCheckpointId(null);
  };

  // Count active sessions
  const activeSessions = getActiveHITLSessions();
  const activeSessionsCount = activeSessions.length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-purple-500">Sentient Loop™</h1>
          <p className="text-gray-400">Human-in-the-loop cognitive feedback system</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className={`rounded-lg px-4 py-2 ${
              activeTab === 'dashboard'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`rounded-lg px-4 py-2 ${
              activeTab === 'command-center'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => setActiveTab('command-center')}
          >
            Command Center
            {activeSessionsCount > 0 && (
              <span className="ml-2 rounded-full bg-blue-500 px-2 py-0.5 text-xs text-white">
                {activeSessionsCount}
              </span>
            )}
          </button>
          <button
            className={`rounded-lg px-4 py-2 ${
              activeTab === 'checkpoints'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => setActiveTab('checkpoints')}
          >
            Checkpoints
            {pendingCheckpoints.length > 0 && (
              <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                {pendingCheckpoints.length}
              </span>
            )}
          </button>
          <button
            className={`rounded-lg px-4 py-2 ${
              activeTab === 'flow'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => setActiveTab('flow')}
          >
            Decision Flow
          </button>
          <button
            className={`rounded-lg px-4 py-2 ${
              activeTab === 'config'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => setActiveTab('config')}
          >
            Configuration
          </button>
          <Link
            to="/arcana/sentient-loop/feedback-graph"
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Feedback Graph
          </Link>
          <Link
            to="/arcana/sentient-loop/failure-recovery"
            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Failure Recovery
          </Link>
        </div>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="col-span-2">
            <div className="mb-6 rounded-lg border border-gray-700 bg-gray-800 p-6">
              <h2 className="mb-4 text-xl font-semibold text-white">Sentient Loop™ Overview</h2>
              <p className="mb-4 text-gray-300">
                The Sentient Loop™ is an always-on cognitive feedback system where human decision-making is at the core of all AI outputs.
                It includes human-in-the-loop (HITL) checkpoints, agent accountability layers, memory snapshots, escalation thresholds,
                and decision traceability.
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-gray-700 p-4">
                  <h3 className="mb-2 text-lg font-medium text-purple-400">Human Checkpoints</h3>
                  <p className="text-sm text-gray-300">
                    Critical decision points where human input is required before proceeding
                  </p>
                </div>
                <div className="rounded-lg bg-gray-700 p-4">
                  <h3 className="mb-2 text-lg font-medium text-purple-400">Memory Snapshots</h3>
                  <p className="text-sm text-gray-300">
                    Contextual information captured at each checkpoint for future reference
                  </p>
                </div>
                <div className="rounded-lg bg-gray-700 p-4">
                  <h3 className="mb-2 text-lg font-medium text-purple-400">Decision Traceability</h3>
                  <p className="text-sm text-gray-300">
                    Complete audit trail of all decisions made within the system
                  </p>
                </div>
              </div>
            </div>

            <SentientLoopStats />
          </div>

          <div>
            <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Pending Checkpoints</h2>
                <Link
                  to="/arcana/sentient-loop/checkpoints"
                  className="text-sm text-purple-400 hover:text-purple-300"
                >
                  View All
                </Link>
              </div>

              {isLoadingCheckpoints ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
                </div>
              ) : pendingCheckpoints.length === 0 ? (
                <div className="rounded-lg border border-gray-700 bg-gray-700 p-4 text-center text-gray-400">
                  No pending checkpoints
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingCheckpoints.slice(0, 3).map((checkpoint) => (
                    <SentientCheckpointCard
                      key={checkpoint.id}
                      checkpoint={checkpoint}
                      onClick={() => handleCheckpointSelected(checkpoint)}
                      isSelected={currentCheckpoint?.id === checkpoint.id}
                    />
                  ))}
                  {pendingCheckpoints.length > 3 && (
                    <div className="text-center text-sm text-gray-400">
                      +{pendingCheckpoints.length - 3} more checkpoints
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 rounded-lg border border-gray-700 bg-gray-800 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Active HITL Sessions</h2>
                <button
                  onClick={() => setActiveTab('command-center')}
                  className="text-sm text-purple-400 hover:text-purple-300"
                >
                  Open Command Center
                </button>
              </div>

              {activeSessionsCount === 0 ? (
                <div className="rounded-lg border border-gray-700 bg-gray-700 p-4 text-center text-gray-400">
                  No active sessions
                </div>
              ) : (
                <div className="space-y-4">
                  {activeSessions.slice(0, 3).map((session) => (
                    <div
                      key={session.id}
                      className="rounded-lg bg-gray-700 p-3 hover:bg-gray-600 cursor-pointer"
                      onClick={() => {
                        setActiveTab('command-center');
                        setSelectedCheckpointId(session.id);
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-sm">{session.checkpoint.title}</h4>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          session.status === 'PENDING' ? 'bg-yellow-900 text-yellow-200' :
                          session.status === 'APPROVED' ? 'bg-green-900 text-green-200' :
                          session.status === 'REJECTED' ? 'bg-red-900 text-red-200' :
                          'bg-gray-900 text-gray-200'
                        }`}>
                          {session.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 truncate">
                        {session.checkpoint.description}
                      </p>
                    </div>
                  ))}
                  {activeSessionsCount > 3 && (
                    <div className="text-center text-sm text-gray-400">
                      +{activeSessionsCount - 3} more sessions
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Command Center Tab */}
      {activeTab === 'command-center' && (
        <SentientLoopCommandCenter
          moduleId="arcana"
          onCheckpointSelected={handleCheckpointSelected}
          onCheckpointResolved={handleCheckpointResolved}
          className="w-full"
        />
      )}

      {/* Checkpoints Tab */}
      {activeTab === 'checkpoints' && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
              <h2 className="mb-4 text-xl font-semibold text-white">Pending Checkpoints</h2>
              {isLoadingCheckpoints ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
                </div>
              ) : pendingCheckpoints.length === 0 ? (
                <div className="rounded-lg border border-gray-700 bg-gray-700 p-4 text-center text-gray-400">
                  No pending checkpoints
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingCheckpoints.map((checkpoint) => (
                    <SentientCheckpointCard
                      key={checkpoint.id}
                      checkpoint={checkpoint}
                      onClick={() => handleCheckpointSelected(checkpoint)}
                      isSelected={currentCheckpoint?.id === checkpoint.id}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {currentCheckpoint ? (
              <SentientCheckpointDetail
                checkpoint={currentCheckpoint}
                onApprove={approveCheckpoint}
                onReject={rejectCheckpoint}
                onModify={modifyCheckpoint}
                onEscalate={escalateCheckpoint}
                isProcessing={isProcessing}
              />
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg border border-gray-700 bg-gray-800 p-6">
                <div className="text-center text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mx-auto h-12 w-12 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium">No checkpoint selected</h3>
                  <p className="mt-1">Select a checkpoint from the list to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Decision Flow Tab */}
      {activeTab === 'flow' && (
        <SentientCheckpointFlow
          checkpointId={selectedCheckpointId || undefined}
          onCheckpointSelected={handleCheckpointSelected}
          className="w-full"
        />
      )}

      {/* Configuration Tab */}
      {activeTab === 'config' && (
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
          <h2 className="mb-6 text-xl font-semibold text-white">Sentient Loop™ Configuration</h2>
          {isLoadingConfig ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
            </div>
          ) : (
            <SentientLoopConfig config={loopConfig} onUpdate={updateConfig} />
          )}
        </div>
      )}
    </div>
  );
};

export default SentientLoopPage;