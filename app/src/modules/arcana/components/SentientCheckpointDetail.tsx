import React, { useState } from 'react';

interface SentientCheckpointDetailProps {
  checkpoint: any;
  onApprove: (checkpointId: string, resolution: string) => Promise<any>;
  onReject: (checkpointId: string, resolution: string) => Promise<any>;
  onModify: (checkpointId: string, modifiedPayload: any, resolution: string) => Promise<any>;
  onEscalate: (checkpointId: string, level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', reason: string) => Promise<any>;
  isProcessing: boolean;
}

const SentientCheckpointDetail: React.FC<SentientCheckpointDetailProps> = ({
  checkpoint,
  onApprove,
  onReject,
  onModify,
  onEscalate,
  isProcessing
}) => {
  const [resolution, setResolution] = useState('');
  const [modifiedPayload, setModifiedPayload] = useState(
    JSON.stringify(checkpoint.originalPayload, null, 2)
  );
  const [escalationLevel, setEscalationLevel] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [escalationReason, setEscalationReason] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'modify' | 'escalate'>('details');
  const [error, setError] = useState<string | null>(null);

  // Format the checkpoint type for display
  const formatType = (type: string) => {
    return type.replace('_REQUIRED', '').replace('_', ' ');
  };

  // Handle approve action
  const handleApprove = async () => {
    try {
      setError(null);
      await onApprove(checkpoint.id, resolution);
    } catch (err) {
      setError('Failed to approve checkpoint');
      console.error(err);
    }
  };

  // Handle reject action
  const handleReject = async () => {
    if (!resolution) {
      setError('Please provide a reason for rejection');
      return;
    }

    try {
      setError(null);
      await onReject(checkpoint.id, resolution);
    } catch (err) {
      setError('Failed to reject checkpoint');
      console.error(err);
    }
  };

  // Handle modify action
  const handleModify = async () => {
    if (!resolution) {
      setError('Please provide a reason for modification');
      return;
    }

    try {
      setError(null);
      let parsedPayload;
      
      try {
        parsedPayload = JSON.parse(modifiedPayload);
      } catch (err) {
        setError('Invalid JSON in modified payload');
        return;
      }

      await onModify(checkpoint.id, parsedPayload, resolution);
    } catch (err) {
      setError('Failed to modify checkpoint');
      console.error(err);
    }
  };

  // Handle escalate action
  const handleEscalate = async () => {
    if (!escalationReason) {
      setError('Please provide a reason for escalation');
      return;
    }

    try {
      setError(null);
      await onEscalate(checkpoint.id, escalationLevel, escalationReason);
    } catch (err) {
      setError('Failed to escalate checkpoint');
      console.error(err);
    }
  };

  // Get the context from memory snapshots
  const getContext = () => {
    if (checkpoint.memorySnapshots && checkpoint.memorySnapshots.length > 0) {
      return checkpoint.memorySnapshots[0].content;
    }
    return null;
  };

  // Get the module color
  const getModuleColor = () => {
    switch (checkpoint.moduleId) {
      case 'arcana':
        return 'text-purple-400 border-purple-500';
      case 'phantom':
        return 'text-red-400 border-red-500';
      case 'athena':
        return 'text-blue-400 border-blue-500';
      case 'forgeflow':
        return 'text-yellow-400 border-yellow-500';
      case 'obelisk':
        return 'text-green-400 border-green-500';
      case 'manifold':
        return 'text-pink-400 border-pink-500';
      default:
        return 'text-gray-400 border-gray-500';
    }
  };

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-white">{checkpoint.title}</h2>
            <div className={`ml-3 rounded border px-2 py-0.5 text-xs ${getModuleColor()}`}>
              {checkpoint.moduleId}
            </div>
            <div className="ml-2 rounded bg-gray-700 px-2 py-0.5 text-xs text-gray-300">
              {formatType(checkpoint.type)}
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-400">
            Created {new Date(checkpoint.createdAt).toLocaleString()}
            {checkpoint.agent && ` • Agent: ${checkpoint.agent.name}`}
          </p>
        </div>
        {checkpoint.escalations && checkpoint.escalations.length > 0 && (
          <div className="rounded bg-red-900 px-3 py-1 text-sm text-red-300">
            Escalated: {checkpoint.escalations[0].level}
          </div>
        )}
      </div>

      <div className="mb-6">
        <div className="mb-4 flex border-b border-gray-700">
          <button
            className={`mr-4 border-b-2 px-4 py-2 text-sm font-medium ${
              activeTab === 'details'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button
            className={`mr-4 border-b-2 px-4 py-2 text-sm font-medium ${
              activeTab === 'modify'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('modify')}
          >
            Modify
          </button>
          <button
            className={`border-b-2 px-4 py-2 text-sm font-medium ${
              activeTab === 'escalate'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('escalate')}
          >
            Escalate
          </button>
        </div>

        {activeTab === 'details' && (
          <div>
            <div className="mb-4">
              <h3 className="mb-2 text-sm font-medium text-gray-300">Description</h3>
              <p className="rounded-lg bg-gray-700 p-3 text-sm text-gray-300">{checkpoint.description}</p>
            </div>

            <div className="mb-4">
              <h3 className="mb-2 text-sm font-medium text-gray-300">Original Payload</h3>
              <pre className="max-h-60 overflow-auto rounded-lg bg-gray-700 p-3 text-xs text-gray-300">
                {JSON.stringify(checkpoint.originalPayload, null, 2)}
              </pre>
            </div>

            {getContext() && (
              <div className="mb-4">
                <h3 className="mb-2 text-sm font-medium text-gray-300">Context</h3>
                <pre className="max-h-60 overflow-auto rounded-lg bg-gray-700 p-3 text-xs text-gray-300">
                  {JSON.stringify(getContext(), null, 2)}
                </pre>
              </div>
            )}

            <div className="mb-4">
              <h3 className="mb-2 text-sm font-medium text-gray-300">Resolution</h3>
              <textarea
                className="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 text-sm text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                rows={3}
                placeholder="Enter your resolution comments..."
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
              ></textarea>
            </div>
          </div>
        )}

        {activeTab === 'modify' && (
          <div>
            <div className="mb-4">
              <h3 className="mb-2 text-sm font-medium text-gray-300">Modified Payload</h3>
              <textarea
                className="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 text-xs font-mono text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                rows={10}
                value={modifiedPayload}
                onChange={(e) => setModifiedPayload(e.target.value)}
              ></textarea>
            </div>

            <div className="mb-4">
              <h3 className="mb-2 text-sm font-medium text-gray-300">Modification Reason</h3>
              <textarea
                className="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 text-sm text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                rows={3}
                placeholder="Explain why you're modifying this payload..."
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
              ></textarea>
            </div>
          </div>
        )}

        {activeTab === 'escalate' && (
          <div>
            <div className="mb-4">
              <h3 className="mb-2 text-sm font-medium text-gray-300">Escalation Level</h3>
              <div className="flex space-x-4">
                {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((level) => (
                  <button
                    key={level}
                    className={`rounded-lg px-4 py-2 text-sm font-medium ${
                      escalationLevel === level
                        ? level === 'LOW'
                          ? 'bg-blue-900 text-blue-300'
                          : level === 'MEDIUM'
                          ? 'bg-yellow-900 text-yellow-300'
                          : level === 'HIGH'
                          ? 'bg-orange-900 text-orange-300'
                          : 'bg-red-900 text-red-300'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    onClick={() => setEscalationLevel(level)}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h3 className="mb-2 text-sm font-medium text-gray-300">Escalation Reason</h3>
              <textarea
                className="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 text-sm text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                rows={3}
                placeholder="Explain why this checkpoint needs escalation..."
                value={escalationReason}
                onChange={(e) => setEscalationReason(e.target.value)}
              ></textarea>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg bg-red-900 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-4">
          {activeTab === 'details' && (
            <>
              <button
                className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleReject}
                disabled={isProcessing}
              >
                Reject
              </button>
              <button
                className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleApprove}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <div className="flex items-center">
                    <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  'Approve'
                )}
              </button>
            </>
          )}

          {activeTab === 'modify' && (
            <button
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleModify}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                'Submit Modification'
              )}
            </button>
          )}

          {activeTab === 'escalate' && (
            <button
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleEscalate}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                'Escalate'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SentientCheckpointDetail;