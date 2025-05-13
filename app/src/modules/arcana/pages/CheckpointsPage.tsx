import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSentientLoop } from '../hooks/useSentientLoop';
import SentientCheckpointCard from '../components/SentientCheckpointCard';
import SentientCheckpointDetail from '../components/SentientCheckpointDetail';

const CheckpointsPage: React.FC = () => {
  const [filter, setFilter] = useState<string | null>(null);
  const {
    pendingCheckpoints,
    currentCheckpoint,
    isLoadingCheckpoints,
    isProcessing,
    approveCheckpoint,
    rejectCheckpoint,
    modifyCheckpoint,
    escalateCheckpoint,
    selectCheckpoint,
    refetchCheckpoints
  } = useSentientLoop();

  // Filter checkpoints by type
  const filteredCheckpoints = filter
    ? pendingCheckpoints.filter(checkpoint => checkpoint.type === filter)
    : pendingCheckpoints;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-purple-500">Sentient Checkpoints</h1>
          <p className="text-gray-400">Human-in-the-loop decision points</p>
        </div>
        <Link
          to="/arcana/sentient-loop"
          className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600"
        >
          Back to Dashboard
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          className={`rounded-lg px-3 py-1 text-sm font-medium ${
            filter === null
              ? 'bg-purple-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          onClick={() => setFilter(null)}
        >
          All
        </button>
        <button
          className={`rounded-lg px-3 py-1 text-sm font-medium ${
            filter === 'DECISION_REQUIRED'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          onClick={() => setFilter('DECISION_REQUIRED')}
        >
          Decision
        </button>
        <button
          className={`rounded-lg px-3 py-1 text-sm font-medium ${
            filter === 'CONFIRMATION_REQUIRED'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          onClick={() => setFilter('CONFIRMATION_REQUIRED')}
        >
          Confirmation
        </button>
        <button
          className={`rounded-lg px-3 py-1 text-sm font-medium ${
            filter === 'INFORMATION_REQUIRED'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          onClick={() => setFilter('INFORMATION_REQUIRED')}
        >
          Information
        </button>
        <button
          className={`rounded-lg px-3 py-1 text-sm font-medium ${
            filter === 'VALIDATION_REQUIRED'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          onClick={() => setFilter('VALIDATION_REQUIRED')}
        >
          Validation
        </button>
        <button
          className={`rounded-lg px-3 py-1 text-sm font-medium ${
            filter === 'ESCALATION_REQUIRED'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          onClick={() => setFilter('ESCALATION_REQUIRED')}
        >
          Escalation
        </button>
        <button
          className={`rounded-lg px-3 py-1 text-sm font-medium ${
            filter === 'AUDIT_REQUIRED'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          onClick={() => setFilter('AUDIT_REQUIRED')}
        >
          Audit
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Pending Checkpoints</h2>
              <button
                className="rounded-full bg-gray-700 p-1 text-gray-400 hover:bg-gray-600 hover:text-white"
                onClick={() => refetchCheckpoints()}
                title="Refresh"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            
            {isLoadingCheckpoints ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
              </div>
            ) : filteredCheckpoints.length === 0 ? (
              <div className="rounded-lg border border-gray-700 bg-gray-700 p-4 text-center text-gray-400">
                {filter ? `No ${filter.replace('_REQUIRED', '').toLowerCase()} checkpoints pending` : 'No pending checkpoints'}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCheckpoints.map((checkpoint) => (
                  <SentientCheckpointCard
                    key={checkpoint.id}
                    checkpoint={checkpoint}
                    onClick={() => selectCheckpoint(checkpoint)}
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
    </div>
  );
};

export default CheckpointsPage;