import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@src/shared/utils/cn';
import { getGlassmorphismClasses } from '@src/shared/utils/glassmorphism';
import { SentientLoopPhase } from './SentientLoopIndicator';
import { Button } from '../ui/Button';

export interface SentientLoopPanelProps {
  initialPhase?: SentientLoopPhase;
  onPhaseChange?: (phase: SentientLoopPhase) => void;
  onComplete?: () => void;
  className?: string;
}

interface PhaseData {
  title: string;
  description: string;
  icon: React.ReactNode;
  actions?: React.ReactNode;
  content?: React.ReactNode;
}

/**
 * SentientLoopPanel - Main UI component for the Sentient Loop™ flow
 * 
 * Implements the 5-phase UX flow:
 * 1. Wake - Initial briefing and context gathering
 * 2. Detect - Identify issues and opportunities
 * 3. Decide - Present options and recommendations
 * 4. Act - Execute the chosen action
 * 5. Reflect - Analyze results and learn
 */
export const SentientLoopPanel: React.FC<SentientLoopPanelProps> = ({
  initialPhase = 'wake',
  onPhaseChange,
  onComplete,
  className,
}) => {
  const [currentPhase, setCurrentPhase] = useState<SentientLoopPhase>(initialPhase);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Update parent component when phase changes
  useEffect(() => {
    if (onPhaseChange) {
      onPhaseChange(currentPhase);
    }
  }, [currentPhase, onPhaseChange]);

  // Handle phase transition
  const transitionToPhase = (phase: SentientLoopPhase) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentPhase(phase);
      setIsTransitioning(false);
    }, 500);
  };

  // Sample data for each phase
  const phaseData: Record<SentientLoopPhase, PhaseData> = {
    wake: {
      title: 'Morning Briefing',
      description: 'Good morning. Here\'s what you need to know today.',
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      content: (
        <div className="space-y-4">
          <div className="rounded-lg bg-gray-800/50 p-4">
            <h3 className="mb-2 text-sm font-medium text-blue-400">Phantom Security</h3>
            <p className="text-sm text-gray-300">Phantom caught a domain spoof attempt at <span className="font-mono text-white">cauldron-app.net</span> (registered yesterday).</p>
          </div>
          <div className="rounded-lg bg-gray-800/50 p-4">
            <h3 className="mb-2 text-sm font-medium text-green-400">Athena Analytics</h3>
            <p className="text-sm text-gray-300">Email campaign CTR increased by 14% after yesterday's subject line changes.</p>
          </div>
          <div className="rounded-lg bg-gray-800/50 p-4">
            <h3 className="mb-2 text-sm font-medium text-purple-400">Chief of Staff</h3>
            <p className="text-sm text-gray-300">You have 3 pending decisions and 2 workflows awaiting approval.</p>
          </div>
        </div>
      ),
      actions: (
        <Button onClick={() => transitionToPhase('detect')}>
          Analyze Threats
        </Button>
      ),
    },
    detect: {
      title: 'Threat Analysis',
      description: 'Analyzing security threats and business opportunities.',
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-white">Current Risk Assessment</h3>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500 text-xs font-bold text-white">
              MED
            </div>
          </div>
          
          <div className="h-32 rounded-lg bg-gray-800/50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400">Domain Spoof Risk</span>
              <span className="text-xs font-medium text-yellow-400">Medium</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-700">
              <div className="h-full w-3/5 bg-yellow-500" />
            </div>
            <p className="mt-2 text-xs text-gray-300">
              Domain <span className="font-mono text-white">cauldron-app.net</span> was registered yesterday and mimics your brand. 
              The site is currently empty but DNS records have been configured.
            </p>
          </div>
          
          <div className="h-32 rounded-lg bg-gray-800/50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400">Email Campaign Opportunity</span>
              <span className="text-xs font-medium text-green-400">High Value</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-700">
              <div className="h-full w-4/5 bg-green-500" />
            </div>
            <p className="mt-2 text-xs text-gray-300">
              Subject line A/B test shows 14% CTR improvement. Expanding this approach could 
              yield an estimated $2,300 in additional monthly revenue.
            </p>
          </div>
        </div>
      ),
      actions: (
        <Button onClick={() => transitionToPhase('decide')}>
          View Recommendations
        </Button>
      ),
    },
    decide: {
      title: 'Decision Options',
      description: 'Here are your recommended actions.',
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      content: (
        <div className="space-y-4">
          <div className="rounded-lg border border-blue-500/30 bg-gray-800/50 p-4 shadow-md shadow-blue-500/10">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium text-blue-400">Deploy Redirect Shield</h3>
              <span className="rounded-full bg-blue-900 px-2 py-0.5 text-xs font-medium text-blue-200">Recommended</span>
            </div>
            <p className="mb-3 text-xs text-gray-300">
              Automatically redirect visitors from the spoofed domain to your legitimate site with a security notice.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Confidence: 92%</span>
              <Button size="sm" variant="primary" onClick={() => transitionToPhase('act')}>
                Deploy
              </Button>
            </div>
          </div>
          
          <div className="rounded-lg border border-purple-500/30 bg-gray-800/50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium text-purple-400">Notify Subscribers</h3>
              <span className="rounded-full bg-purple-900 px-2 py-0.5 text-xs font-medium text-purple-200">Optional</span>
            </div>
            <p className="mb-3 text-xs text-gray-300">
              Send a security alert to all subscribers warning them about the potential phishing attempt.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Confidence: 78%</span>
              <Button size="sm" variant="outline">
                Select
              </Button>
            </div>
          </div>
          
          <div className="rounded-lg border border-green-500/30 bg-gray-800/50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium text-green-400">Schedule Email Recap</h3>
              <span className="rounded-full bg-green-900 px-2 py-0.5 text-xs font-medium text-green-200">Growth</span>
            </div>
            <p className="mb-3 text-xs text-gray-300">
              Schedule a weekly email using the new high-performing subject line format.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Est. ROI: $2,300/mo</span>
              <Button size="sm" variant="outline">
                Select
              </Button>
            </div>
          </div>
        </div>
      ),
      actions: (
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => transitionToPhase('detect')}>
            Back
          </Button>
          <Button onClick={() => transitionToPhase('act')}>
            Execute Selected
          </Button>
        </div>
      ),
    },
    act: {
      title: 'Executing Actions',
      description: 'Deploying Redirect Shield to protect against domain spoof.',
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      content: (
        <div className="space-y-4">
          <div className="rounded-lg bg-gray-800/50 p-4">
            <h3 className="mb-2 text-sm font-medium text-blue-400">Forgeflow Execution</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300">Initializing workflow</span>
                <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300">Analyzing domain records</span>
                <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300">Configuring redirect rules</span>
                <motion.svg 
                  className="h-4 w-4 text-blue-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </motion.svg>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300">Deploying security notice</span>
                <span className="text-xs text-gray-400">Pending</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300">Logging to Sentinel</span>
                <span className="text-xs text-gray-400">Pending</span>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg bg-gray-800/50 p-4">
            <h3 className="mb-2 text-sm font-medium text-purple-400">Progress</h3>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700">
              <motion.div 
                className="h-full bg-purple-500"
                initial={{ width: "0%" }}
                animate={{ width: "60%" }}
                transition={{ duration: 2 }}
              />
            </div>
            <p className="mt-2 text-xs text-gray-300">
              Estimated completion: 45 seconds
            </p>
          </div>
        </div>
      ),
      actions: (
        <Button 
          variant="outline" 
          onClick={() => transitionToPhase('reflect')}
          className="opacity-50"
          disabled
        >
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Processing...
          </motion.span>
        </Button>
      ),
    },
    reflect: {
      title: 'Action Complete',
      description: 'Redirect Shield deployed successfully.',
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      content: (
        <div className="space-y-4">
          <div className="rounded-lg bg-green-900/20 p-4">
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-sm font-medium text-green-400">Redirect Shield Deployed</h3>
            </div>
            <p className="mt-2 text-xs text-gray-300">
              Visitors to <span className="font-mono text-white">cauldron-app.net</span> will now be redirected to your legitimate site with a security notice.
            </p>
          </div>
          
          <div className="rounded-lg bg-gray-800/50 p-4">
            <h3 className="mb-2 text-sm font-medium text-blue-400">Impact Summary</h3>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>• Security posture improved by 12%</li>
              <li>• Potential phishing attack mitigated</li>
              <li>• Incident logged to Sentinel for future reference</li>
              <li>• Domain added to monitoring watchlist</li>
            </ul>
          </div>
          
          <div className="rounded-lg bg-gray-800/50 p-4">
            <h3 className="mb-2 text-sm font-medium text-purple-400">Learning & Adaptation</h3>
            <p className="text-xs text-gray-300">
              Based on this incident, Phantom has updated its threat detection patterns to identify similar domain spoofing attempts earlier.
            </p>
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-xs font-medium text-gray-400">Was this action helpful?</span>
              <button className="rounded-full p-1 text-gray-400 hover:text-green-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              </button>
              <button className="rounded-full p-1 text-gray-400 hover:text-red-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ),
      actions: (
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => transitionToPhase('wake')}>
            Return to Dashboard
          </Button>
          <Button onClick={() => {
            if (onComplete) onComplete();
          }}>
            View Details in Phantom
          </Button>
        </div>
      ),
    },
    idle: {
      title: 'Sentient Loop™ Idle',
      description: 'The Sentient Loop™ is currently inactive.',
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      content: (
        <div className="flex h-64 flex-col items-center justify-center">
          <p className="text-center text-sm text-gray-400">
            The Sentient Loop™ is currently idle. Start a new session to begin.
          </p>
        </div>
      ),
      actions: (
        <Button onClick={() => transitionToPhase('wake')}>
          Start New Session
        </Button>
      ),
    },
  };

  // Get data for current phase
  const data = phaseData[currentPhase];

  return (
    <div className={cn(
      "overflow-hidden rounded-lg",
      getGlassmorphismClasses({
        level: 'medium',
        border: true,
        shadow: true,
      }),
      className
    )}>
      {/* Header */}
      <div className="border-b border-gray-700/50 bg-gray-800/50 p-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-700">
            {data.icon}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">{data.title}</h2>
            <p className="text-sm text-gray-400">{data.description}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {data.content}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-700/50 bg-gray-800/50 p-4">
        <div className="flex items-center justify-between">
          {/* Phase indicators */}
          <div className="flex space-x-1">
            {(['wake', 'detect', 'decide', 'act', 'reflect'] as SentientLoopPhase[]).map((phase) => (
              <div
                key={phase}
                className={cn(
                  "h-1 w-6 rounded-full",
                  currentPhase === phase
                    ? phase === 'wake' ? "bg-blue-500" :
                      phase === 'detect' ? "bg-yellow-500" :
                      phase === 'decide' ? "bg-purple-500" :
                      phase === 'act' ? "bg-green-500" :
                      "bg-pink-500"
                    : "bg-gray-600"
                )}
              />
            ))}
          </div>

          {/* Actions */}
          <div>
            {data.actions}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentientLoopPanel;
