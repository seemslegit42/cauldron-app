import React, { useState, useEffect } from 'react';

interface SentientLoopConfigProps {
  config: any;
  onUpdate: (config: any) => Promise<any>;
}

const SentientLoopConfig: React.FC<SentientLoopConfigProps> = ({ config, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.7);
  const [alwaysCheckHighImpact, setAlwaysCheckHighImpact] = useState(true);
  const [autoEscalateThreshold, setAutoEscalateThreshold] = useState('HIGH');
  const [escalationTimeout, setEscalationTimeout] = useState(24);
  const [shortTermRetention, setShortTermRetention] = useState(7);
  const [longTermRetention, setLongTermRetention] = useState(90);
  const [criticalDecisionsRetention, setCriticalDecisionsRetention] = useState(365);
  const [auditTrailRetention, setAuditTrailRetention] = useState(730);
  const [isActive, setIsActive] = useState(true);
  
  // Initialize form state from config
  useEffect(() => {
    if (config) {
      if (config.checkpointThresholds) {
        setConfidenceThreshold(config.checkpointThresholds.confidenceThreshold || 0.7);
        setAlwaysCheckHighImpact(config.checkpointThresholds.alwaysCheckHighImpact !== undefined ? config.checkpointThresholds.alwaysCheckHighImpact : true);
      }
      
      if (config.escalationRules) {
        setAutoEscalateThreshold(config.escalationRules.autoEscalateThreshold || 'HIGH');
        setEscalationTimeout(config.escalationRules.escalationTimeout || 24);
      }
      
      if (config.memoryRetention) {
        setShortTermRetention(config.memoryRetention.shortTerm || 7);
        setLongTermRetention(config.memoryRetention.longTerm || 90);
        setCriticalDecisionsRetention(config.memoryRetention.criticalDecisions || 365);
        setAuditTrailRetention(config.memoryRetention.auditTrail || 730);
      }
      
      setIsActive(config.isActive !== undefined ? config.isActive : true);
    }
  }, [config]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    
    try {
      const updatedConfig = {
        checkpointThresholds: {
          confidenceThreshold,
          alwaysCheckHighImpact,
          actionRules: config?.checkpointThresholds?.actionRules || {
            'delete': {
              alwaysCheck: true,
              checkpointType: 'CONFIRMATION_REQUIRED',
              reason: 'Delete operations require confirmation'
            },
            'payment': {
              alwaysCheck: true,
              checkpointType: 'DECISION_REQUIRED',
              reason: 'Payment operations require approval'
            },
            'security': {
              alwaysCheck: true,
              checkpointType: 'VALIDATION_REQUIRED',
              reason: 'Security operations require validation'
            }
          }
        },
        escalationRules: {
          autoEscalateThreshold,
          escalationTimeout,
          notifyUsers: config?.escalationRules?.notifyUsers || ['admin'],
          criticalEscalationPath: config?.escalationRules?.criticalEscalationPath || ['team-lead', 'manager', 'executive']
        },
        memoryRetention: {
          shortTerm: shortTermRetention,
          longTerm: longTermRetention,
          criticalDecisions: criticalDecisionsRetention,
          auditTrail: auditTrailRetention
        },
        auditFrequency: config?.auditFrequency || {
          lowImpact: 'monthly',
          mediumImpact: 'weekly',
          highImpact: 'daily',
          criticalImpact: 'immediate'
        },
        isActive
      };
      
      await onUpdate(updatedConfig);
      setSuccess('Configuration updated successfully');
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update configuration');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div>
      {!isEditing ? (
        <div>
          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-gray-700 bg-gray-700 p-6">
              <h3 className="mb-4 text-lg font-medium text-purple-400">Checkpoint Thresholds</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Confidence Threshold</span>
                    <span className="text-sm font-medium text-white">{confidenceThreshold}</span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-800">
                    <div 
                      className="h-full rounded-full bg-purple-500" 
                      style={{ width: `${confidenceThreshold * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Always Check High Impact</span>
                  <span className={`rounded px-2 py-0.5 text-xs ${alwaysCheckHighImpact ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                    {alwaysCheckHighImpact ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Auto-Escalate Threshold</span>
                  <span className={`rounded px-2 py-0.5 text-xs ${
                    autoEscalateThreshold === 'CRITICAL' ? 'bg-red-900 text-red-300' :
                    autoEscalateThreshold === 'HIGH' ? 'bg-orange-900 text-orange-300' :
                    autoEscalateThreshold === 'MEDIUM' ? 'bg-yellow-900 text-yellow-300' :
                    'bg-blue-900 text-blue-300'
                  }`}>
                    {autoEscalateThreshold}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Escalation Timeout</span>
                  <span className="text-sm font-medium text-white">{escalationTimeout} hours</span>
                </div>
              </div>
            </div>
            
            <div className="rounded-lg border border-gray-700 bg-gray-700 p-6">
              <h3 className="mb-4 text-lg font-medium text-purple-400">Memory Retention</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Short-Term Memory</span>
                  <span className="text-sm font-medium text-white">{shortTermRetention} days</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Long-Term Memory</span>
                  <span className="text-sm font-medium text-white">{longTermRetention} days</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Critical Decisions</span>
                  <span className="text-sm font-medium text-white">{criticalDecisionsRetention} days</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Audit Trail</span>
                  <span className="text-sm font-medium text-white">{auditTrailRetention} days</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-6 rounded-lg border border-gray-700 bg-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-purple-400">System Status</h3>
                <p className="mt-1 text-sm text-gray-400">The Sentient Loop™ system is currently {isActive ? 'active' : 'inactive'}</p>
              </div>
              <div className={`flex h-6 w-12 items-center rounded-full ${isActive ? 'bg-green-900' : 'bg-gray-600'} p-1`}>
                <div className={`h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
              onClick={() => setIsEditing(true)}
            >
              Edit Configuration
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-gray-700 bg-gray-700 p-6">
              <h3 className="mb-4 text-lg font-medium text-purple-400">Checkpoint Thresholds</h3>
              
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Confidence Threshold ({confidenceThreshold})
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-800"
                />
                <div className="mt-1 flex justify-between text-xs text-gray-400">
                  <span>0</span>
                  <span>0.5</span>
                  <span>1</span>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="mb-2 flex items-center text-sm font-medium text-gray-300">
                  <input
                    type="checkbox"
                    checked={alwaysCheckHighImpact}
                    onChange={(e) => setAlwaysCheckHighImpact(e.target.checked)}
                    className="mr-2 h-4 w-4 rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500"
                  />
                  Always Check High Impact Actions
                </label>
              </div>
              
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Auto-Escalate Threshold
                </label>
                <select
                  value={autoEscalateThreshold}
                  onChange={(e) => setAutoEscalateThreshold(e.target.value)}
                  className="w-full rounded-lg border border-gray-600 bg-gray-800 p-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Escalation Timeout (hours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="72"
                  value={escalationTimeout}
                  onChange={(e) => setEscalationTimeout(parseInt(e.target.value))}
                  className="w-full rounded-lg border border-gray-600 bg-gray-800 p-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
            
            <div className="rounded-lg border border-gray-700 bg-gray-700 p-6">
              <h3 className="mb-4 text-lg font-medium text-purple-400">Memory Retention</h3>
              
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Short-Term Memory (days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={shortTermRetention}
                  onChange={(e) => setShortTermRetention(parseInt(e.target.value))}
                  className="w-full rounded-lg border border-gray-600 bg-gray-800 p-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
              
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Long-Term Memory (days)
                </label>
                <input
                  type="number"
                  min="30"
                  max="365"
                  value={longTermRetention}
                  onChange={(e) => setLongTermRetention(parseInt(e.target.value))}
                  className="w-full rounded-lg border border-gray-600 bg-gray-800 p-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
              
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Critical Decisions (days)
                </label>
                <input
                  type="number"
                  min="90"
                  max="730"
                  value={criticalDecisionsRetention}
                  onChange={(e) => setCriticalDecisionsRetention(parseInt(e.target.value))}
                  className="w-full rounded-lg border border-gray-600 bg-gray-800 p-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
              
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Audit Trail (days)
                </label>
                <input
                  type="number"
                  min="365"
                  max="3650"
                  value={auditTrailRetention}
                  onChange={(e) => setAuditTrailRetention(parseInt(e.target.value))}
                  className="w-full rounded-lg border border-gray-600 bg-gray-800 p-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
          
          <div className="mb-6 rounded-lg border border-gray-700 bg-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-purple-400">System Status</h3>
                <p className="mt-1 text-sm text-gray-400">Toggle to enable or disable the Sentient Loop™ system</p>
              </div>
              <button
                type="button"
                className={`flex h-6 w-12 items-center rounded-full ${isActive ? 'bg-green-900' : 'bg-gray-600'} p-1`}
                onClick={() => setIsActive(!isActive)}
              >
                <div className={`h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mb-4 rounded-lg bg-red-900 p-3 text-sm text-red-300">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 rounded-lg bg-green-900 p-3 text-sm text-green-300">
              {success}
            </div>
          )}
          
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600"
              onClick={() => setIsEditing(false)}
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </div>
              ) : (
                'Save Configuration'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SentientLoopConfig;