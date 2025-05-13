/**
 * SentientEntity Component
 * 
 * A UI component that simulates a sentient entity with subtle animations,
 * emotional responses, and multi-sensory feedback.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { cn } from '@src/shared/utils/cn';
import { getGlassmorphismClasses } from '@src/shared/utils/glassmorphism';
import { useSentientLoop } from '@src/shared/hooks/ai/useSentientLoop';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { useSoundEffects } from '../../hooks/useSoundEffects';

// Emotion types that the entity can express
export type SentientEmotion = 
  | 'neutral'   // Default state
  | 'thinking'  // Processing information
  | 'happy'     // Positive response
  | 'sad'       // Negative response
  | 'excited'   // High energy positive
  | 'concerned' // Cautious or warning
  | 'confused'  // Uncertain or questioning
  | 'focused'   // Concentrated attention
  | 'surprised' // Unexpected information
  | 'curious';  // Interested in learning more

// Intensity levels for animations and feedback
export type EmotionIntensity = 'subtle' | 'moderate' | 'strong';

// Props for the SentientEntity component
export interface SentientEntityProps {
  // Core properties
  emotion?: SentientEmotion;
  intensity?: EmotionIntensity;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'circle' | 'square' | 'pill' | 'organic';
  
  // Feedback options
  enableSound?: boolean;
  enableHaptics?: boolean;
  
  // Animation options
  breathingAnimation?: boolean;
  pulseOnActivity?: boolean;
  reactToHover?: boolean;
  reactToClick?: boolean;
  
  // Content
  icon?: React.ReactNode;
  label?: string;
  
  // Events
  onEmotionChange?: (emotion: SentientEmotion) => void;
  onInteraction?: (type: 'hover' | 'click' | 'longpress') => void;
  
  // Styling
  className?: string;
  glassLevel?: 'none' | 'light' | 'medium' | 'heavy';
}

/**
 * SentientEntity Component
 * 
 * A UI component that simulates a sentient entity with subtle animations,
 * emotional responses, and multi-sensory feedback.
 */
export const SentientEntity: React.FC<SentientEntityProps> = ({
  emotion = 'neutral',
  intensity = 'subtle',
  size = 'md',
  variant = 'circle',
  enableSound = true,
  enableHaptics = true,
  breathingAnimation = true,
  pulseOnActivity = true,
  reactToHover = true,
  reactToClick = true,
  icon,
  label,
  onEmotionChange,
  onInteraction,
  className,
  glassLevel = 'medium',
}) => {
  // Animation controls
  const controls = useAnimation();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const entityRef = useRef<HTMLDivElement>(null);
  
  // Hooks for haptic and sound feedback
  const { triggerHaptic } = useHapticFeedback();
  const { playSound } = useSoundEffects();
  
  // Get color based on emotion
  const getEmotionColor = (emotion: SentientEmotion): string => {
    switch (emotion) {
      case 'neutral': return 'bg-blue-500';
      case 'thinking': return 'bg-purple-500';
      case 'happy': return 'bg-green-500';
      case 'sad': return 'bg-blue-400';
      case 'excited': return 'bg-yellow-500';
      case 'concerned': return 'bg-orange-500';
      case 'confused': return 'bg-pink-500';
      case 'focused': return 'bg-indigo-500';
      case 'surprised': return 'bg-cyan-500';
      case 'curious': return 'bg-violet-500';
      default: return 'bg-blue-500';
    }
  };
  
  // Get size classes
  const getSizeClasses = (size: string): string => {
    switch (size) {
      case 'sm': return 'w-8 h-8';
      case 'md': return 'w-12 h-12';
      case 'lg': return 'w-16 h-16';
      case 'xl': return 'w-24 h-24';
      default: return 'w-12 h-12';
    }
  };
  
  // Get shape classes
  const getShapeClasses = (variant: string): string => {
    switch (variant) {
      case 'circle': return 'rounded-full';
      case 'square': return 'rounded-lg';
      case 'pill': return 'rounded-full aspect-[2/1]';
      case 'organic': return 'rounded-[40%_60%_70%_30%/30%_30%_70%_70%]';
      default: return 'rounded-full';
    }
  };
  
  // Get intensity factor
  const getIntensityFactor = (intensity: EmotionIntensity): number => {
    switch (intensity) {
      case 'subtle': return 0.5;
      case 'moderate': return 1.0;
      case 'strong': return 1.5;
      default: return 1.0;
    }
  };
  
  // Breathing animation
  useEffect(() => {
    if (breathingAnimation) {
      const intensityFactor = getIntensityFactor(intensity);
      
      controls.start({
        scale: [1, 1 + (0.05 * intensityFactor), 1],
        opacity: [0.9, 1, 0.9],
        transition: {
          duration: 4,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse"
        }
      });
    } else {
      controls.stop();
      controls.set({ scale: 1, opacity: 1 });
    }
  }, [breathingAnimation, emotion, intensity, controls]);
  
  // Handle emotion changes
  useEffect(() => {
    if (enableSound) {
      playSound(emotion, intensity);
    }
    
    if (enableHaptics) {
      triggerHaptic(emotion, intensity);
    }
    
    if (onEmotionChange) {
      onEmotionChange(emotion);
    }
    
    // Animate based on emotion
    const intensityFactor = getIntensityFactor(intensity);
    
    switch (emotion) {
      case 'thinking':
        controls.start({
          scale: [1, 1 + (0.08 * intensityFactor), 1],
          opacity: [0.8, 1, 0.8],
          transition: {
            duration: 1.5,
            ease: "easeInOut",
            repeat: Infinity,
          }
        });
        break;
      case 'excited':
        controls.start({
          scale: [1, 1 + (0.15 * intensityFactor), 1],
          rotate: [-2, 2, -2],
          transition: {
            duration: 0.5,
            ease: "easeInOut",
            repeat: Infinity,
          }
        });
        break;
      case 'surprised':
        controls.start({
          scale: [1, 1 + (0.2 * intensityFactor), 1],
          transition: {
            duration: 0.3,
            ease: "easeOut",
            times: [0, 0.2, 1]
          }
        });
        break;
      // Other emotions handled by the breathing animation
    }
  }, [emotion, intensity, enableSound, enableHaptics, onEmotionChange, controls, playSound, triggerHaptic]);
  
  // Handle interactions
  const handleHover = () => {
    setIsHovered(true);
    if (reactToHover && onInteraction) {
      onInteraction('hover');
    }
  };
  
  const handleHoverEnd = () => {
    setIsHovered(false);
  };
  
  const handlePress = () => {
    setIsPressed(true);
    if (reactToClick && onInteraction) {
      onInteraction('click');
    }
    
    if (enableHaptics) {
      triggerHaptic('click', intensity);
    }
    
    if (enableSound) {
      playSound('click', intensity);
    }
  };
  
  const handlePressEnd = () => {
    setIsPressed(false);
  };
  
  return (
    <motion.div
      ref={entityRef}
      className={cn(
        getSizeClasses(size),
        getShapeClasses(variant),
        getEmotionColor(emotion),
        getGlassmorphismClasses({ level: glassLevel, border: true, shadow: true }),
        "flex items-center justify-center relative overflow-hidden",
        className
      )}
      animate={controls}
      initial={{ scale: 1, opacity: 1 }}
      whileHover={reactToHover ? { scale: 1.05, opacity: 1 } : {}}
      whileTap={reactToClick ? { scale: 0.95 } : {}}
      onHoverStart={handleHover}
      onHoverEnd={handleHoverEnd}
      onTapStart={handlePress}
      onTap={handlePressEnd}
    >
      {/* Inner glow effect */}
      <div className="absolute inset-0 rounded-full bg-white opacity-20 blur-md" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {icon && <div className="text-white">{icon}</div>}
        {label && <div className="mt-1 text-xs font-medium text-white">{label}</div>}
      </div>
      
      {/* Pulse effect on activity */}
      <AnimatePresence>
        {pulseOnActivity && (isHovered || isPressed) && (
          <motion.div
            className="absolute inset-0 rounded-full bg-white"
            initial={{ opacity: 0.5, scale: 1 }}
            animate={{ opacity: 0, scale: 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SentientEntity;
