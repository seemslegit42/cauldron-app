import React from 'react';

interface SentientCheckpointCardProps {
  checkpoint: any;
  onClick: () => void;
  isSelected: boolean;
}

const SentientCheckpointCard: React.FC<SentientCheckpointCardProps> = ({
  checkpoint,
  onClick,
  isSelected
}) => {
  // Get checkpoint type icon
  const getTypeIcon = () => {
    switch (checkpoint.type) {
      case 'DECISION_REQUIRED':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        );
      case 'CONFIRMATION_REQUIRED':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'INFORMATION_REQUIRED':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'ESCALATION_REQUIRED':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'VALIDATION_REQUIRED':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      case 'AUDIT_REQUIRED':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  // Format the checkpoint type for display
  const formatType = (type: string) => {
    return type.replace('_REQUIRED', '').replace('_', ' ');
  };

  // Get the time elapsed since the checkpoint was created
  const getTimeElapsed = () => {
    const now = new Date();
    const created = new Date(checkpoint.createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffMins < 1440) {
      return `${Math.floor(diffMins / 60)}h ago`;
    } else {
      return `${Math.floor(diffMins / 1440)}d ago`;
    }
  };

  // Get the module color
  const getModuleColor = () => {
    switch (checkpoint.moduleId) {
      case 'arcana':
        return 'text-purple-400';
      case 'phantom':
        return 'text-red-400';
      case 'athena':
        return 'text-blue-400';
      case 'forgeflow':
        return 'text-yellow-400';
      case 'obelisk':
        return 'text-green-400';
      case 'manifold':
        return 'text-pink-400';
      default:
        return 'text-gray-400';
    }
  };

  // Check if the checkpoint has escalations
  const hasEscalations = checkpoint.escalations && checkpoint.escalations.length > 0;

  return (
    <div
      className={`cursor-pointer rounded-lg border p-4 transition-colors duration-200 ${
        isSelected
          ? 'border-purple-500 bg-gray-700'
          : 'border-gray-700 bg-gray-800 hover:border-gray-600'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <div className={`mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 ${getModuleColor()}`}>
            {getTypeIcon()}
          </div>
          <div>
            <h3 className="font-medium text-white">{checkpoint.title}</h3>
            <div className="mt-1 flex items-center text-xs text-gray-400">
              <span className={getModuleColor()}>{checkpoint.moduleId}</span>
              <span className="mx-1">•</span>
              <span>{formatType(checkpoint.type)}</span>
              <span className="mx-1">•</span>
              <span>{getTimeElapsed()}</span>
            </div>
          </div>
        </div>
        {hasEscalations && (
          <div className="rounded bg-red-900 px-2 py-0.5 text-xs text-red-300">
            Escalated
          </div>
        )}
      </div>
      <p className="mt-2 text-sm text-gray-400 line-clamp-2">{checkpoint.description}</p>
    </div>
  );
};

export default SentientCheckpointCard;