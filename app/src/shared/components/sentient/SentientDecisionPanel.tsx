/**
 * SentientDecisionPanel Component
 * 
 * A specialized sentient interface for presenting decisions and gathering user input.
 * It provides a more interactive and emotionally responsive experience for critical
 * decision points in the application.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { cn } from '@src/shared/utils/cn';
import { getGlassmorphismClasses } from '@src/shared/utils/glassmorphism';
import { SentientInterface, SentientInterfaceState } from './SentientInterface';
import { SentientEmotion, EmotionIntensity } from './SentientEntity';
import { useSentientLoop } from '@src/shared/hooks/ai/useSentientLoop';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { Button } from '@src/shared/components/ui/Button';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  HelpCircle, 
  Clock,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

// Decision option type
export interface DecisionOption {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  isRecommended?: boolean;
  isRisky?: boolean;
  confidence?: number; // 0-100
}

// Props for the SentientDecisionPanel component
export interface SentientDecisionPanelProps {
  // Core properties
  title: string;
  description?: string;
  options: DecisionOption[];
  
  // State and appearance
  state?: SentientInterfaceState;
  emotion?: SentientEmotion;
  intensity?: EmotionIntensity;
  
  // Timing
  timeoutSeconds?: number;
  showCountdown?: boolean;
  
  // Feedback options
  enableSound?: boolean;
  enableHaptics?: boolean;
  showConfidence?: boolean;
  
  // Events
  onDecisionMade?: (optionId: string) => void;
  onTimeout?: () => void;
  onFeedback?: (feedback: 'positive' | 'negative', comment?: string) => void;
  
  // Styling
  className?: string;
  glassLevel?: 'none' | 'light' | 'medium' | 'heavy';
}

/**
 * SentientDecisionPanel Component
 * 
 * A specialized sentient interface for presenting decisions and gathering user input.
 */
export const SentientDecisionPanel: React.FC<SentientDecisionPanelProps> = ({
  title,
  description,
  options,
  state = 'thinking',
  emotion = 'curious',
  intensity = 'moderate',
  timeoutSeconds = 0,
  showCountdown = false,
  enableSound = true,
  enableHaptics = true,
  showConfidence = true,
  onDecisionMade,
  onTimeout,
  onFeedback,
  className,
  glassLevel = 'medium',
}) => {
  // State
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(timeoutSeconds);
  const [showFeedbackForm, setShowFeedbackForm] = useState<boolean>(false);
  const [feedbackComment, setFeedbackComment] = useState<string>('');
  const [interfaceState, setInterfaceState] = useState<SentientInterfaceState>(state);
  const [interfaceEmotion, setInterfaceEmotion] = useState<SentientEmotion>(emotion);
  
  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Hooks
  const { triggerHaptic } = useHapticFeedback({ enabled: enableHaptics });
  const { playSound } = useSoundEffects({ enabled: enableSound });
  
  // Animation controls
  const optionsControls = useAnimation();
  
  // Initialize timer
  useEffect(() => {
    if (timeoutSeconds > 0) {
      setTimeRemaining(timeoutSeconds);
      
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            
            if (onTimeout) {
              onTimeout();
            }
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timeoutSeconds, onTimeout]);
  
  // Animate options in
  useEffect(() => {
    optionsControls.start(i => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.2 + (i * 0.1),
        duration: 0.3,
        ease: "easeOut"
      }
    }));
  }, [optionsControls]);
  
  // Handle option selection
  const handleOptionSelect = useCallback((optionId: string) => {
    setSelectedOption(optionId);
    
    // Update interface state and emotion
    setInterfaceState('success');
    setInterfaceEmotion('happy');
    
    // Provide feedback
    if (enableHaptics) {
      triggerHaptic('success', 'moderate');
    }
    
    if (enableSound) {
      playSound('success', 'moderate');
    }
    
    // Call the callback
    if (onDecisionMade) {
      onDecisionMade(optionId);
    }
    
    // Show feedback form after a short delay
    setTimeout(() => {
      setShowFeedbackForm(true);
    }, 1000);
  }, [onDecisionMade, enableHaptics, enableSound, triggerHaptic, playSound]);
  
  // Handle feedback submission
  const handleFeedback = useCallback((type: 'positive' | 'negative') => {
    if (onFeedback) {
      onFeedback(type, feedbackComment);
    }
    
    // Provide feedback
    if (enableHaptics) {
      triggerHaptic(type === 'positive' ? 'happy' : 'sad', 'subtle');
    }
    
    if (enableSound) {
      playSound(type === 'positive' ? 'happy' : 'sad', 'subtle');
    }
    
    // Hide feedback form
    setShowFeedbackForm(false);
  }, [onFeedback, feedbackComment, enableHaptics, enableSound, triggerHaptic, playSound]);
  
  // Format time remaining
  const formatTimeRemaining = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);
  
  // Get recommended option
  const recommendedOption = options.find(option => option.isRecommended);
  
  return (
    <SentientInterface
      state={interfaceState}
      emotion={interfaceEmotion}
      intensity={intensity}
      title={title}
      message={description}
      enableSound={enableSound}
      enableHaptics={enableHaptics}
      className={cn("w-full max-w-2xl", className)}
      glassLevel={glassLevel}
      variant="expanded"
    >
      {/* Decision options */}
      {!selectedOption && (
        <div className="mt-4 space-y-3">
          {options.map((option, index) => (
            <motion.div
              key={option.id}
              custom={index}
              initial={{ opacity: 0, y: 20 }}
              animate={optionsControls}
              className={cn(
                "cursor-pointer rounded-lg p-4 transition-all duration-200",
                getGlassmorphismClasses({ 
                  level: 'light', 
                  border: true, 
                  shadow: true 
                }),
                option.isRecommended && "border-green-500",
                option.isRisky && "border-orange-500"
              )}
              onClick={() => handleOptionSelect(option.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start">
                {/* Option icon */}
                {option.icon && (
                  <div className="mr-3 mt-1 text-white">
                    {option.icon}
                  </div>
                )}
                
                {/* Option content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-white">{option.label}</h4>
                    
                    {/* Confidence indicator */}
                    {showConfidence && option.confidence !== undefined && (
                      <div className="ml-2 flex items-center">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-700">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              option.confidence >= 70 ? "bg-green-500" :
                              option.confidence >= 40 ? "bg-yellow-500" :
                              "bg-red-500"
                            )}
                            style={{ width: `${option.confidence}%` }}
                          />
                        </div>
                        <span className="ml-2 text-xs text-gray-400">
                          {option.confidence}%
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Option description */}
                  {option.description && (
                    <p className="mt-1 text-sm text-gray-300">{option.description}</p>
                  )}
                  
                  {/* Recommendation badge */}
                  {option.isRecommended && (
                    <div className="mt-2 flex items-center text-xs text-green-400">
                      <CheckCircle size={12} className="mr-1" />
                      Recommended option
                    </div>
                  )}
                  
                  {/* Risk badge */}
                  {option.isRisky && (
                    <div className="mt-2 flex items-center text-xs text-orange-400">
                      <AlertTriangle size={12} className="mr-1" />
                      Potential risks involved
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          
          {/* Timeout indicator */}
          {showCountdown && timeoutSeconds > 0 && (
            <div className="mt-4 flex items-center justify-center text-sm text-gray-400">
              <Clock size={14} className="mr-1" />
              Decision needed in: {formatTimeRemaining(timeRemaining)}
            </div>
          )}
        </div>
      )}
      
      {/* Selected option confirmation */}
      {selectedOption && !showFeedbackForm && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 rounded-lg bg-green-900/30 p-4"
        >
          <div className="flex items-center justify-center">
            <CheckCircle className="mr-2 text-green-400" />
            <span className="text-green-300">
              Decision confirmed: {options.find(o => o.id === selectedOption)?.label}
            </span>
          </div>
        </motion.div>
      )}
      
      {/* Feedback form */}
      {showFeedbackForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-lg bg-gray-800/50 p-4"
        >
          <h4 className="mb-2 text-center text-lg font-medium text-white">
            How do you feel about this decision?
          </h4>
          
          <div className="mb-4">
            <textarea
              className="w-full rounded-md bg-gray-700 p-2 text-white placeholder-gray-400"
              placeholder="Optional feedback..."
              rows={2}
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
            />
          </div>
          
          <div className="flex justify-center space-x-4">
            <Button
              onClick={() => handleFeedback('positive')}
              className="flex items-center bg-green-600 hover:bg-green-700"
            >
              <ThumbsUp size={16} className="mr-2" />
              Good Decision
            </Button>
            
            <Button
              onClick={() => handleFeedback('negative')}
              className="flex items-center bg-red-600 hover:bg-red-700"
            >
              <ThumbsDown size={16} className="mr-2" />
              Bad Decision
            </Button>
          </div>
        </motion.div>
      )}
    </SentientInterface>
  );
};

export default SentientDecisionPanel;
