/**
 * UserPulse Component
 *
 * An adaptive header with identity-aware data that responds to the user's
 * context, persona, and activity patterns.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useQuery } from 'wasp/client/operations';
import { useUser } from 'wasp/client/auth';
import { cn } from '@src/shared/utils/cn';
import { getGlassmorphismClasses } from '@src/shared/utils/glassmorphism';
import { useHapticFeedback } from '@src/shared/hooks/useHapticFeedback';
import { useSoundEffects } from '@src/shared/hooks/useSoundEffects';
import {
  User,
  Bell,
  Settings,
  ChevronDown,
  Clock,
  Calendar,
  Zap,
  Shield,
  Brain,
  Activity,
  Sparkles
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { getUserContext } from '../api/operations';

// Types
export interface UserPulseProps {
  className?: string;
  enableHaptics?: boolean;
  enableSound?: boolean;
  enableAnimations?: boolean;
  onPersonaChange?: (persona: string) => void;
}

interface UserContextData {
  id: string;
  userId: string;
  metrics: any;
  projects: any;
  decisions: any;
  goals: any;
  persona: string;
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface UserPersona {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

/**
 * UserPulse - Adaptive header with identity-aware data
 */
export const UserPulse: React.FC<UserPulseProps> = ({
  className,
  enableHaptics = true,
  enableSound = true,
  enableAnimations = true,
  onPersonaChange,
}) => {
  // State
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'context' | 'personas' | 'settings'>('context');
  const [greeting, setGreeting] = useState('');
  const [breathingState, setBreathingState] = useState<'inhale' | 'exhale'>('inhale');
  const [pulseEffect, setPulseEffect] = useState(true);

  // Refs
  const breathingInterval = useRef<NodeJS.Timeout | null>(null);

  // Queries
  const { data: user, isLoading: isLoadingUser } = useUser();
  const { data: userContext, isLoading: isLoadingContext } = useQuery(getUserContext);

  // Hooks
  const { triggerHaptic } = useHapticFeedback({ enabled: enableHaptics });
  const { playSound } = useSoundEffects({ enabled: enableSound });

  // Animation controls
  const avatarControls = useAnimation();
  const contentControls = useAnimation();

  // Available personas
  const personas: UserPersona[] = [
    {
      id: 'hacker-ceo',
      name: 'Hacker CEO',
      description: 'Focus on growth metrics and security threats',
      icon: <Zap className="h-5 w-5" />,
      color: 'text-yellow-400'
    },
    {
      id: 'podcast-mogul',
      name: 'Podcast Mogul',
      description: 'Focus on content metrics and audience growth',
      icon: <Activity className="h-5 w-5" />,
      color: 'text-blue-400'
    },
    {
      id: 'enterprise-admin',
      name: 'Enterprise Admin',
      description: 'Focus on security and compliance',
      icon: <Shield className="h-5 w-5" />,
      color: 'text-red-400'
    },
    {
      id: 'ai-researcher',
      name: 'AI Researcher',
      description: 'Focus on AI metrics and experiments',
      icon: <Brain className="h-5 w-5" />,
      color: 'text-purple-400'
    }
  ];

  // Get current persona
  const currentPersona = personas.find(p => p.id === userContext?.persona) || personas[0];

  // Generate greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    let newGreeting = '';

    if (hour < 12) {
      newGreeting = 'Good morning';
    } else if (hour < 18) {
      newGreeting = 'Good afternoon';
    } else {
      newGreeting = 'Good evening';
    }

    setGreeting(newGreeting);
  }, []);

  // Start breathing animation
  useEffect(() => {
    if (enableAnimations) {
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
    }
  }, [enableAnimations]);

  // Toggle expanded state
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);

    // Trigger haptic feedback
    if (enableHaptics) {
      triggerHaptic('click', 'subtle');
    }

    // Play sound effect
    if (enableSound) {
      playSound('click', 'subtle');
    }
  };

  // Change persona
  const changePersona = (personaId: string) => {
    // TODO: Implement persona change logic

    // Trigger haptic feedback
    if (enableHaptics) {
      triggerHaptic('success', 'moderate');
    }

    // Play sound effect
    if (enableSound) {
      playSound('success', 'moderate');
    }

    // Notify parent component
    if (onPersonaChange) {
      onPersonaChange(personaId);
    }
  };

  // Loading state
  if (isLoadingUser || isLoadingContext) {
    return (
      <div className={cn(
        "flex h-16 items-center justify-center rounded-lg",
        getGlassmorphismClasses({
          level: 'medium',
          border: true,
          shadow: true,
        }),
        className
      )}>
        <motion.div
          className="h-6 w-6 rounded-full border-2 border-blue-400 border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  // Error state
  if (!user || !userContext) {
    return (
      <div className={cn(
        "flex h-16 items-center justify-center rounded-lg",
        getGlassmorphismClasses({
          level: 'medium',
          border: true,
          shadow: true,
        }),
        className
      )}>
        <p className="text-red-400">Error loading user data</p>
      </div>
    );
  }

  return (
    <div className={cn(
      "overflow-hidden rounded-lg relative",
      getGlassmorphismClasses({
        level: 'heavy',
        border: true,
        shadow: true,
        bgColor: 'bg-gray-900/40',
        borderColor: 'border-purple-500/30',
      }),
      className
    )}>
      {/* Ambient background glow */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-900 via-blue-900 to-purple-900 blur-xl" />
      </div>

      {/* Collapsed View */}
      <div
        className="relative z-10 flex items-center justify-between p-4 cursor-pointer"
        onClick={toggleExpanded}
      >
        <div className="flex items-center">
          <motion.div
            className={cn(
              "relative mr-3 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full",
              currentPersona.color.replace('text-', 'bg-').replace('400', '900')
            )}
            animate={{
              scale: breathingState === 'inhale' ? 1.05 : 0.95,
            }}
            transition={{ duration: 2, ease: "easeInOut" }}
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.username || 'User'}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <User className="h-6 w-6 text-white" />
            )}

            <motion.div
              className={cn(
                "absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-gray-800",
                currentPersona.color.replace('text-', 'bg-')
              )}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              {currentPersona.icon}
            </motion.div>
          </motion.div>

          <div>
            <div className="flex items-center">
              <h2 className="text-lg font-semibold text-white">
                {greeting}, {user.username || 'User'}
              </h2>
              <motion.div
                className={cn(
                  "ml-2 flex h-5 w-5 items-center justify-center rounded-full",
                  currentPersona.color.replace('text-', 'bg-').replace('400', '900')
                )}
                animate={pulseEffect ? {
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7]
                } : {}}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <Sparkles className="h-3 w-3 text-white" />
              </motion.div>
            </div>
            <p className="text-sm text-gray-400">
              {currentPersona.name} • Last active: {formatDistanceToNow(new Date(userContext.lastActive), { addSuffix: true })}
            </p>
          </div>
        </div>

        <ChevronDown
          className={cn(
            "h-5 w-5 text-gray-400 transition-transform duration-300",
            isExpanded && "rotate-180"
          )}
        />
      </div>

      {/* Expanded View */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative z-10 border-t border-gray-700/50 bg-gray-900/20 backdrop-blur-sm">
              {/* Tabs */}
              <div className="flex border-b border-gray-700/50">
                <button type="button"
                  className={cn(
                    "flex-1 px-4 py-2 text-sm font-medium",
                    activeTab === 'context'
                      ? "border-b-2 border-blue-400 text-blue-400"
                      : "text-gray-400 hover:text-white"
                  )}
                  onClick={() => setActiveTab('context')}
                >
                  Context
                </button>
                <button type="button"
                  className={cn(
                    "flex-1 px-4 py-2 text-sm font-medium",
                    activeTab === 'personas'
                      ? "border-b-2 border-purple-400 text-purple-400"
                      : "text-gray-400 hover:text-white"
                  )}
                  onClick={() => setActiveTab('personas')}
                >
                  Personas
                </button>
                <button type="button"
                  className={cn(
                    "flex-1 px-4 py-2 text-sm font-medium",
                    activeTab === 'settings'
                      ? "border-b-2 border-green-400 text-green-400"
                      : "text-gray-400 hover:text-white"
                  )}
                  onClick={() => setActiveTab('settings')}
                >
                  Settings
                </button>
              </div>

              {/* Tab Content */}
              <div className="relative z-10 p-4 bg-gray-900/10 backdrop-blur-sm">
                {activeTab === 'context' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className={cn(
                        "rounded-md p-3",
                        getGlassmorphismClasses({ level: 'light', border: true })
                      )}>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-blue-400" />
                          <h3 className="text-sm font-medium text-white">Today</h3>
                        </div>
                        <p className="mt-1 text-sm text-gray-400">
                          {format(new Date(), 'EEEE, MMMM d, yyyy')}
                        </p>
                      </div>

                      <div className={cn(
                        "rounded-md p-3",
                        getGlassmorphismClasses({ level: 'light', border: true })
                      )}>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-green-400" />
                          <h3 className="text-sm font-medium text-white">Active Time</h3>
                        </div>
                        <p className="mt-1 text-sm text-gray-400">
                          3h 42m today
                        </p>
                      </div>
                    </div>

                    <div className={cn(
                      "rounded-md p-3",
                      getGlassmorphismClasses({ level: 'light', border: true })
                    )}>
                      <div className="flex items-center">
                        <Activity className="mr-2 h-4 w-4 text-purple-400" />
                        <h3 className="text-sm font-medium text-white">Activity Summary</h3>
                      </div>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Decisions Made</span>
                          <span className="text-white">12</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Actions Taken</span>
                          <span className="text-white">8</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Insights Generated</span>
                          <span className="text-white">15</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'personas' && (
                  <div className="space-y-3">
                    {personas.map((persona) => (
                      <div
                        key={persona.id}
                        className={cn(
                          "flex cursor-pointer items-start rounded-md p-3 transition-colors",
                          getGlassmorphismClasses({ level: 'light', border: true }),
                          persona.id === currentPersona.id && "border-blue-500"
                        )}
                        onClick={() => changePersona(persona.id)}
                      >
                        <div className={cn(
                          "mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
                          persona.color.replace('text-', 'bg-').replace('400', '900')
                        )}>
                          {persona.icon}
                        </div>
                        <div>
                          <h3 className={cn(
                            "font-medium",
                            persona.color
                          )}>
                            {persona.name}
                          </h3>
                          <p className="text-sm text-gray-400">{persona.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-3">
                    <div className={cn(
                      "rounded-md p-3",
                      getGlassmorphismClasses({ level: 'light', border: true })
                    )}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Bell className="mr-2 h-4 w-4 text-blue-400" />
                          <h3 className="text-sm font-medium text-white">Notifications</h3>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input type="checkbox" className="peer sr-only" defaultChecked />
                          <div className="peer h-5 w-9 rounded-full bg-gray-700 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-focus:ring-2 peer-focus:ring-blue-300"></div>
                        </label>
                      </div>
                    </div>

                    <div className={cn(
                      "rounded-md p-3",
                      getGlassmorphismClasses({ level: 'light', border: true })
                    )}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Settings className="mr-2 h-4 w-4 text-green-400" />
                          <h3 className="text-sm font-medium text-white">Haptic Feedback</h3>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={enableHaptics}
                            onChange={() => { }}
                          />
                          <div className="peer h-5 w-9 rounded-full bg-gray-700 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-600 peer-checked:after:translate-x-full peer-focus:ring-2 peer-focus:ring-green-300"></div>
                        </label>
                      </div>
                    </div>

                    <div className={cn(
                      "rounded-md p-3",
                      getGlassmorphismClasses({ level: 'light', border: true })
                    )}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Sparkles className="mr-2 h-4 w-4 text-yellow-400" />
                          <h3 className="text-sm font-medium text-white">Animations</h3>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={enableAnimations}
                            onChange={() => { }}
                          />
                          <div className="peer h-5 w-9 rounded-full bg-gray-700 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-yellow-600 peer-checked:after:translate-x-full peer-focus:ring-2 peer-focus:ring-yellow-300"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserPulse;
