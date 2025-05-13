/**
 * EnhancedSentientLoopPanel Component
 *
 * Implements the 5-phase intelligence loop with Wake → Detect → Decide → Act → Reflect
 * This is the core UI component for the Sentient Loop™ system.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery, useAction } from 'wasp/client/operations';
import {
  getPendingCheckpoints,
  getSentientActions,
  getSentientInsights,
  executeSentientAction
} from '../api/operations';
import { useSentientLoop } from '../hooks/useSentientLoop';
import { cn } from '@src/shared/utils/cn';
import { getGlassmorphismClasses } from '@src/shared/utils/glassmorphism';
import { useHapticFeedback } from '@src/shared/hooks/useHapticFeedback';
import { useSoundEffects } from '@src/shared/hooks/useSoundEffects';
import { Button } from '@src/shared/components/ui/Button';
import {
  Brain,
  Eye,
  Lightbulb,
  Play,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

// Types
export type SentientLoopPhase = 'wake' | 'detect' | 'decide' | 'act' | 'reflect';

export interface EnhancedSentientLoopPanelProps {
  initialPhase?: SentientLoopPhase;
  onPhaseChange?: (phase: SentientLoopPhase) => void;
  onComplete?: () => void;
  className?: string;
  enableHaptics?: boolean;
  enableSound?: boolean;
}

interface PhaseData {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  pulseColor: string;
  actions?: React.ReactNode;
  content?: React.ReactNode;
}

/**
 * EnhancedSentientLoopPanel - Main UI component for the Sentient Loop™ flow
 *
 * Implements the 5-phase UX flow:
 * 1. Wake - Initial briefing and context gathering
 * 2. Detect - Identify issues and opportunities
 * 3. Decide - Present options and recommendations
 * 4. Act - Execute the chosen action
 * 5. Reflect - Analyze results and learn
 */
export const EnhancedSentientLoopPanel: React.FC<EnhancedSentientLoopPanelProps> = ({
  initialPhase = 'wake',
  onPhaseChange,
  onComplete,
  className,
  enableHaptics = true,
  enableSound = true,
}) => {
  // State
  const [currentPhase, setCurrentPhase] = useState<SentientLoopPhase>(initialPhase);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [expandedAction, setExpandedAction] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [executingAction, setExecutingAction] = useState<string | null>(null);
  const [pulseEffect, setPulseEffect] = useState(true);
  const [breathingState, setBreathingState] = useState<'inhale' | 'exhale'>('inhale');

  // Refs
  const breathingInterval = useRef<NodeJS.Timeout | null>(null);

  // Queries and Actions
  const { data: pendingCheckpoints = [], isLoading: isLoadingCheckpoints } = useQuery(getPendingCheckpoints);
  const { data: sentientActions = [], isLoading: isLoadingActions } = useQuery(getSentientActions);
  const { data: sentientInsights = [], isLoading: isLoadingInsights } = useQuery(getSentientInsights);
  const executeSentientActionFn = useAction(executeSentientAction);

  // Hooks
  const { triggerHaptic } = useHapticFeedback({ enabled: enableHaptics });
  const { playSound } = useSoundEffects({ enabled: enableSound });

  // Animation controls
  const phaseIconControls = useAnimation();
  const contentControls = useAnimation();

  // Phase data
  const getPhaseData = (): PhaseData => {
    switch (currentPhase) {
      case 'wake':
        return {
          title: 'Wake Phase',
          description: 'Gathering context and initializing systems',
          icon: <Brain className="h-6 w-6 text-blue-400" />,
          color: 'text-blue-400',
          pulseColor: 'bg-blue-500',
          content: (
            <div className="space-y-4">
              <p className="text-gray-300">
                The Sentient Loop™ is initializing and gathering context about your current situation.
              </p>
              <div className="flex items-center space-x-2">
                <motion.div
                  className="h-2 w-2 rounded-full bg-blue-500"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-sm text-gray-400">Accessing user context...</span>
              </div>
              <div className="flex items-center space-x-2">
                <motion.div
                  className="h-2 w-2 rounded-full bg-blue-500"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
                <span className="text-sm text-gray-400">Loading system state...</span>
              </div>
              <div className="flex items-center space-x-2">
                <motion.div
                  className="h-2 w-2 rounded-full bg-blue-500"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                />
                <span className="text-sm text-gray-400">Preparing intelligence briefing...</span>
              </div>
            </div>
          ),
          actions: (
            <Button
              size="sm"
              variant="outline"
              onClick={() => advancePhase('detect')}
              className="text-blue-400 border-blue-400 hover:bg-blue-400/20"
            >
              Continue <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )
        };
      case 'detect':
        return {
          title: 'Detect Phase',
          description: 'Identifying issues and opportunities',
          icon: <Eye className="h-6 w-6 text-yellow-400" />,
          color: 'text-yellow-400',
          pulseColor: 'bg-yellow-500',
          content: (
            <div className="space-y-4">
              <p className="text-gray-300">
                The Sentient Loop™ is analyzing data to detect patterns, anomalies, and opportunities.
              </p>
              {isLoadingInsights ? (
                <div className="flex items-center justify-center py-4">
                  <motion.div
                    className="h-8 w-8 rounded-full border-2 border-yellow-400 border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  {sentientInsights.slice(0, 3).map((insight: any) => (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "rounded-md p-3",
                        getGlassmorphismClasses({ level: 'light', border: true })
                      )}
                    >
                      <div className="flex items-start">
                        <Lightbulb className="mr-2 h-5 w-5 flex-shrink-0 text-yellow-400" />
                        <div>
                          <h4 className="font-medium text-white">{insight.title}</h4>
                          <p className="text-sm text-gray-300">{insight.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ),
          actions: (
            <Button
              size="sm"
              variant="outline"
              onClick={() => advancePhase('decide')}
              className="text-yellow-400 border-yellow-400 hover:bg-yellow-400/20"
            >
              Continue <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )
        };
      case 'decide':
        return {
          title: 'Decide Phase',
          description: 'Evaluating options and making recommendations',
          icon: <Lightbulb className="h-6 w-6 text-purple-400" />,
          color: 'text-purple-400',
          pulseColor: 'bg-purple-500',
          content: (
            <div className="space-y-4">
              <p className="text-gray-300">
                The Sentient Loop™ is evaluating options and preparing recommendations.
              </p>
              {isLoadingActions ? (
                <div className="flex items-center justify-center py-4">
                  <motion.div
                    className="h-8 w-8 rounded-full border-2 border-purple-400 border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  {sentientActions.slice(0, 3).map((action: any) => (
                    <motion.div
                      key={action.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "rounded-md p-3",
                        getGlassmorphismClasses({ level: 'light', border: true }),
                        expandedAction === action.id ? "border-purple-500" : ""
                      )}
                    >
                      <div
                        className="flex items-start cursor-pointer"
                        onClick={() => setExpandedAction(expandedAction === action.id ? null : action.id)}
                      >
                        {action.isRecommended ? (
                          <CheckCircle className="mr-2 h-5 w-5 flex-shrink-0 text-green-400" />
                        ) : (
                          <HelpCircle className="mr-2 h-5 w-5 flex-shrink-0 text-purple-400" />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{action.title}</h4>
                          <p className="text-sm text-gray-300">{action.description}</p>
                        </div>
                        {expandedAction === action.id ? (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        )}
                      </div>

                      {expandedAction === action.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2 pl-7"
                        >
                          <div className="space-y-2">
                            <p className="text-sm text-gray-400">
                              {action.details || "No additional details available."}
                            </p>
                            <div className="flex justify-end space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => executeAction(action.id)}
                                className="text-purple-400 border-purple-400 hover:bg-purple-400/20"
                              >
                                Execute
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ),
          actions: (
            <Button
              size="sm"
              variant="outline"
              onClick={() => advancePhase('act')}
              className="text-purple-400 border-purple-400 hover:bg-purple-400/20"
            >
              Continue <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )
        };
      case 'act':
        return {
          title: 'Act Phase',
          description: 'Executing the chosen action',
          icon: <Play className="h-6 w-6 text-green-400" />,
          color: 'text-green-400',
          pulseColor: 'bg-green-500',
          content: (
            <div className="space-y-4">
              <p className="text-gray-300">
                The Sentient Loop™ is executing the selected action.
              </p>
              <div className="flex items-center justify-center py-4">
                {executingAction ? (
                  <motion.div
                    className="flex flex-col items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      className="h-12 w-12 rounded-full border-2 border-green-400 border-t-transparent"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <p className="mt-2 text-sm text-gray-400">Executing action...</p>
                  </motion.div>
                ) : (
                  <div className="text-center">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
                    <p className="mt-2 text-gray-300">Action completed successfully</p>
                  </div>
                )}
              </div>
            </div>
          ),
          actions: (
            <Button
              size="sm"
              variant="outline"
              onClick={() => advancePhase('reflect')}
              disabled={!!executingAction}
              className="text-green-400 border-green-400 hover:bg-green-400/20 disabled:opacity-50"
            >
              Continue <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )
        };
      case 'reflect':
        return {
          title: 'Reflect Phase',
          description: 'Analyzing results and learning',
          icon: <RefreshCw className="h-6 w-6 text-pink-400" />,
          color: 'text-pink-400',
          pulseColor: 'bg-pink-500',
          content: (
            <div className="space-y-4">
              <p className="text-gray-300">
                The Sentient Loop™ is analyzing the results and updating its knowledge.
              </p>
              <div className="space-y-3">
                <div className={cn(
                  "rounded-md p-3",
                  getGlassmorphismClasses({ level: 'light', border: true })
                )}>
                  <h4 className="font-medium text-white">Action Results</h4>
                  <p className="text-sm text-gray-300">
                    The action was completed successfully. The system has updated its knowledge base.
                  </p>
                </div>

                <div className={cn(
                  "rounded-md p-3",
                  getGlassmorphismClasses({ level: 'light', border: true })
                )}>
                  <h4 className="font-medium text-white">Feedback</h4>
                  <p className="text-sm text-gray-300 mb-2">
                    Was this action helpful?
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-400 border-green-400 hover:bg-green-400/20"
                    >
                      <ThumbsUp className="mr-1 h-4 w-4" /> Yes
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-400 border-red-400 hover:bg-red-400/20"
                    >
                      <ThumbsDown className="mr-1 h-4 w-4" /> No
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ),
          actions: (
            <Button
              size="sm"
              variant="outline"
              onClick={() => resetLoop()}
              className="text-pink-400 border-pink-400 hover:bg-pink-400/20"
            >
              Complete Loop
            </Button>
          )
        };
      default:
        return {
          title: 'Unknown Phase',
          description: 'Something went wrong',
          icon: <AlertTriangle className="h-6 w-6 text-red-400" />,
          color: 'text-red-400',
          pulseColor: 'bg-red-500',
          content: <p>Unknown phase</p>,
          actions: (
            <Button
              size="sm"
              variant="outline"
              onClick={() => resetLoop()}
              className="text-red-400 border-red-400 hover:bg-red-400/20"
            >
              Reset
            </Button>
          )
        };
    }
  };

  // Get current phase data
  const data = getPhaseData();

  // Advance to the next phase
  const advancePhase = (phase: SentientLoopPhase) => {
    setIsTransitioning(true);

    // Trigger haptic feedback
    if (enableHaptics) {
      triggerHaptic('success', 'moderate');
    }

    // Play sound effect
    if (enableSound) {
      playSound('success', 'moderate');
    }

    // Animate phase transition
    contentControls.start({ opacity: 0, y: -10 }).then(() => {
      setCurrentPhase(phase);
      setIsTransitioning(false);

      // Notify parent component
      if (onPhaseChange) {
        onPhaseChange(phase);
      }

      // Animate new phase content
      contentControls.start({ opacity: 1, y: 0 });
    });
  };

  // Execute an action
  const executeAction = async (actionId: string) => {
    setExecutingAction(actionId);

    try {
      await executeSentientActionFn({ actionId });

      // Trigger haptic feedback
      if (enableHaptics) {
        triggerHaptic('success', 'strong');
      }

      // Play sound effect
      if (enableSound) {
        playSound('success', 'strong');
      }

      // Advance to the next phase
      advancePhase('act');
    } catch (error) {
      console.error('Error executing action:', error);

      // Trigger haptic feedback
      if (enableHaptics) {
        triggerHaptic('error', 'strong');
      }

      // Play sound effect
      if (enableSound) {
        playSound('error', 'strong');
      }
    } finally {
      setExecutingAction(null);
    }
  };

  // Reset the loop
  const resetLoop = () => {
    setIsTransitioning(true);

    // Trigger haptic feedback
    if (enableHaptics) {
      triggerHaptic('neutral', 'moderate');
    }

    // Play sound effect
    if (enableSound) {
      playSound('notification', 'moderate');
    }

    // Animate phase transition
    contentControls.start({ opacity: 0, y: -10 }).then(() => {
      setCurrentPhase('wake');
      setIsTransitioning(false);
      setExpandedAction(null);
      setSelectedOptions({});

      // Notify parent component
      if (onPhaseChange) {
        onPhaseChange('wake');
      }

      if (onComplete) {
        onComplete();
      }

      // Animate new phase content
      contentControls.start({ opacity: 1, y: 0 });
    });
  };

  // Start breathing animation
  useEffect(() => {
    // Start breathing animation
    breathingInterval.current = setInterval(() => {
      setBreathingState(prev => prev === 'inhale' ? 'exhale' : 'inhale');
    }, 4000); // 4 seconds per breath cycle

    // Disable pulse effect after 5 seconds
    const timer = setTimeout(() => {
      setPulseEffect(false);
    }, 5000);

    return () => {
      if (breathingInterval.current) {
        clearInterval(breathingInterval.current);
      }
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className={cn(
      "overflow-hidden rounded-lg relative",
      getGlassmorphismClasses({
        level: 'heavy',
        border: true,
        shadow: true,
        bgColor: 'bg-gray-900/40',
        borderColor: currentPhase === 'wake' ? 'border-blue-500/30' :
          currentPhase === 'detect' ? 'border-yellow-500/30' :
            currentPhase === 'decide' ? 'border-purple-500/30' :
              currentPhase === 'act' ? 'border-green-500/30' :
                'border-pink-500/30',
      }),
      className
    )}>
      {/* Ambient background glow based on current phase */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className={cn(
          "absolute inset-0 rounded-lg blur-xl",
          currentPhase === 'wake' ? "bg-blue-900" :
            currentPhase === 'detect' ? "bg-yellow-900" :
              currentPhase === 'decide' ? "bg-purple-900" :
                currentPhase === 'act' ? "bg-green-900" :
                  "bg-pink-900"
        )} />
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-gray-700/50 bg-gray-800/30 backdrop-blur-sm p-4">
        <div className="flex items-center space-x-3">
          <motion.div
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-700`}
            animate={{
              scale: breathingState === 'inhale' ? 1.05 : 0.95,
            }}
            transition={{ duration: 2, ease: "easeInOut" }}
          >
            {data.icon}
          </motion.div>
          <div>
            <h2 className={`text-lg font-semibold ${data.color}`}>{data.title}</h2>
            <p className="text-sm text-gray-400">{data.description}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhase}
            initial={{ opacity: 0, y: 10 }}
            animate={contentControls}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "rounded-lg overflow-hidden",
              getGlassmorphismClasses({
                level: 'light',
                border: true,
                shadow: false,
                bgColor: 'bg-gray-800/30',
              })
            )}
          >
            <div className="p-4">
              {data.content}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="relative z-10 border-t border-gray-700/50 bg-gray-800/30 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between">
          {/* Phase indicators */}
          <div className="flex space-x-1">
            {(['wake', 'detect', 'decide', 'act', 'reflect'] as SentientLoopPhase[]).map((phase) => (
              <motion.div
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
                animate={currentPhase === phase && pulseEffect ? {
                  opacity: [0.5, 1, 0.5],
                  scale: [1, 1.1, 1]
                } : {}}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
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

export default EnhancedSentientLoopPanel;
