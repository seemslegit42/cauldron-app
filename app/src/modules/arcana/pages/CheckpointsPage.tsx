import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSentientLoop } from '../hooks/useSentientLoop';
import SentientCheckpointCard from '../components/SentientCheckpointCard';
import SentientCheckpointDetail from '../components/SentientCheckpointDetail';
import { ArcanaLayout } from '../components/layout/ArcanaLayout';
import { GlassmorphicCard } from '@src/shared/components/branding/GlassmorphicCard';
import { Brain, RefreshCw } from 'lucide-react';

/**
 * Sentient Checkpoints Page
 *
 * Where human and machine intelligence meet for a cup of tea and critical decision-making.
 * This page displays pending checkpoints that require human intervention in the Sentient Loop™.
 */
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
    <ArcanaLayout
      title="Sentient Checkpoints"
      description="Human-in-the-loop decision points requiring your attention"
      actions={
        <Link
          to="/arcana/sentient-loop"
          className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600"
        >
          Back to Dashboard
        </Link>
      }
    >

      <GlassmorphicCard moduleId="arcana" level="light" border shadow className="mb-6 p-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`rounded-lg px-3 py-1 text-sm font-medium ${filter === null
              ? 'bg-arcana-purple-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            onClick={() => setFilter(null)}
          >
            All
          </button>
          <button
            type="button"
            className={`rounded-lg px-3 py-1 text-sm font-medium ${filter === 'DECISION_REQUIRED'
              ? 'bg-arcana-purple-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            onClick={() => setFilter('DECISION_REQUIRED')}
          >
            Decision
          </button>
          <button
            type="button"
            className={`rounded-lg px-3 py-1 text-sm font-medium ${filter === 'CONFIRMATION_REQUIRED'
              ? 'bg-arcana-purple-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            onClick={() => setFilter('CONFIRMATION_REQUIRED')}
          >
            Confirmation
          </button>
          <button
            type="button"
            className={`rounded-lg px-3 py-1 text-sm font-medium ${filter === 'INFORMATION_REQUIRED'
              ? 'bg-arcana-purple-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            onClick={() => setFilter('INFORMATION_REQUIRED')}
          >
            Information
          </button>
          <button
            type="button"
            className={`rounded-lg px-3 py-1 text-sm font-medium ${filter === 'VALIDATION_REQUIRED'
              ? 'bg-arcana-purple-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            onClick={() => setFilter('VALIDATION_REQUIRED')}
          >
            Validation
          </button>
          <button
            type="button"
            className={`rounded-lg px-3 py-1 text-sm font-medium ${filter === 'ESCALATION_REQUIRED'
              ? 'bg-arcana-purple-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            onClick={() => setFilter('ESCALATION_REQUIRED')}
          >
            Escalation
          </button>
          <button
            type="button"
            className={`rounded-lg px-3 py-1 text-sm font-medium ${filter === 'AUDIT_REQUIRED'
              ? 'bg-arcana-purple-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            onClick={() => setFilter('AUDIT_REQUIRED')}
          >
            Audit
          </button>
        </div>
      </GlassmorphicCard>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <GlassmorphicCard moduleId="arcana" level="medium" border shadow className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-arcana-purple-400">Pending Checkpoints</h2>
              <button
                type="button"
                className="rounded-full bg-gray-700 p-1 text-gray-400 hover:bg-gray-600 hover:text-white"
                onClick={() => refetchCheckpoints()}
                title="Refresh your reality buffer"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>

            {isLoadingCheckpoints ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-arcana-purple-400"></div>
              </div>
            ) : filteredCheckpoints.length === 0 ? (
              <div className="rounded-lg border border-gray-700 bg-gray-700/50 p-4 text-center text-gray-400">
                {filter ? `No ${filter.replace('_REQUIRED', '').toLowerCase()} checkpoints pending` : 'All systems nominal. No pending checkpoints.'}
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
          </GlassmorphicCard>
        </div>

        <div className="lg:col-span-2">
          {currentCheckpoint ? (
            <GlassmorphicCard moduleId="arcana" level="medium" border shadow glow className="p-0 overflow-hidden">
              <SentientCheckpointDetail
                checkpoint={currentCheckpoint}
                onApprove={approveCheckpoint}
                onReject={rejectCheckpoint}
                onModify={modifyCheckpoint}
                onEscalate={escalateCheckpoint}
                isProcessing={isProcessing}
              />
            </GlassmorphicCard>
          ) : (
            <GlassmorphicCard moduleId="arcana" level="medium" border shadow className="flex h-full items-center justify-center p-6">
              <div className="text-center text-gray-400">
                <Brain className="mx-auto h-12 w-12 text-arcana-purple-300 opacity-50" />
                <h3 className="mt-2 text-lg font-medium">No checkpoint selected</h3>
                <p className="mt-1">Select a checkpoint from the list to begin your human-in-the-loop adventure</p>
              </div>
            </GlassmorphicCard>
          )}
        </div>
      </div>
    </ArcanaLayout>
  );
};

export default CheckpointsPage;