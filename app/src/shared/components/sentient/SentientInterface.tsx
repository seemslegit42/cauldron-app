/**
 * SentientInterface Component
 * 
 * A higher-level component that creates a sentient interface with multiple
 * animated elements, emotional responses, and multi-sensory feedback.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { cn } from '@src/shared/utils/cn';
import { getGlassmorphismClasses } from '@src/shared/utils/glassmorphism';
import { SentientEntity, SentientEmotion, EmotionIntensity } from './SentientEntity';
import { useSentientLoop } from '@src/shared/hooks/ai/useSentientLoop';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { Brain, Zap, MessageSquare, AlertTriangle, CheckCircle } from 'lucide-react';

// Interface state
export type SentientInterfaceState = 
  | 'idle'      // Default state, minimal activity
  | 'listening' // Actively listening to user input
  | 'thinking'  // Processing information
  | 'speaking'  // Providing output to the user
  | 'alert'     // Calling attention to something important
  | 'success'   // Operation completed successfully
  | 'error'     // Error or warning state
  | 'dormant';  // Powered down or inactive

// Props for the SentientInterface component
export interface SentientInterfaceProps {
  // Core properties
  state?: SentientInterfaceState;
  emotion?: SentientEmotion;
  intensity?: EmotionIntensity;
  
  // Content
  title?: string;
  message?: string;
  children?: React.ReactNode;
  
  // Feedback options
  enableSound?: boolean;
  enableHaptics?: boolean;
  
  // Animation options
  breathingAnimation?: boolean;
  pulseOnActivity?: boolean;
  ambientParticles?: boolean;
  
  // Events
  onStateChange?: (state: SentientInterfaceState) => void;
  onEmotionChange?: (emotion: SentientEmotion) => void;
  onInteraction?: (type: 'hover' | 'click' | 'longpress') => void;
  
  // Styling
  className?: string;
  glassLevel?: 'none' | 'light' | 'medium' | 'heavy';
  variant?: 'minimal' | 'standard' | 'expanded';
}

/**
 * SentientInterface Component
 * 
 * A higher-level component that creates a sentient interface with multiple
 * animated elements, emotional responses, and multi-sensory feedback.
 */
export const SentientInterface: React.FC<SentientInterfaceProps> = ({
  state = 'idle',
  emotion = 'neutral',
  intensity = 'subtle',
  title,
  message,
  children,
  enableSound = true,
  enableHaptics = true,
  breathingAnimation = true,
  pulseOnActivity = true,
  ambientParticles = true,
  onStateChange,
  onEmotionChange,
  onInteraction,
  className,
  glassLevel = 'medium',
  variant = 'standard',
}) => {
  // Animation controls
  const controls = useAnimation();
  const particlesControls = useAnimation();
  const messageControls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State for particles
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; speed: number; opacity: number }[]>([]);
  
  // Map state to emotion
  const mapStateToEmotion = useCallback((state: SentientInterfaceState): SentientEmotion => {
    switch (state) {
      case 'idle': return 'neutral';
      case 'listening': return 'curious';
      case 'thinking': return 'thinking';
      case 'speaking': return 'focused';
      case 'alert': return 'concerned';
      case 'success': return 'happy';
      case 'error': return 'sad';
      case 'dormant': return 'neutral';
      default: return 'neutral';
    }
  }, []);
  
  // Handle state changes
  useEffect(() => {
    if (onStateChange) {
      onStateChange(state);
    }
    
    // Map state to emotion if no explicit emotion is provided
    const derivedEmotion = mapStateToEmotion(state);
    
    // Animate based on state
    switch (state) {
      case 'idle':
        controls.start({
          opacity: 0.9,
          scale: 1,
          transition: { duration: 0.5 }
        });
        break;
      
      case 'listening':
        controls.start({
          opacity: 1,
          scale: 1.02,
          transition: { duration: 0.3 }
        });
        break;
      
      case 'thinking':
        controls.start({
          opacity: 1,
          scale: [1, 1.03, 1],
          transition: { 
            duration: 1.5,
            repeat: Infinity,
            repeatType: "reverse"
          }
        });
        break;
      
      case 'speaking':
        controls.start({
          opacity: 1,
          scale: 1.05,
          transition: { duration: 0.3 }
        });
        
        // Animate message appearance
        if (message) {
          messageControls.start({
            opacity: 1,
            y: 0,
            transition: { 
              duration: 0.3,
              ease: "easeOut"
            }
          });
        }
        break;
      
      case 'alert':
        controls.start({
          opacity: 1,
          scale: [1, 1.1, 1],
          transition: { 
            duration: 0.5,
            times: [0, 0.5, 1],
            repeat: 3
          }
        });
        break;
      
      case 'success':
        controls.start({
          opacity: 1,
          scale: [1, 1.1, 1],
          transition: { 
            duration: 0.5,
            ease: "easeOut"
          }
        });
        break;
      
      case 'error':
        controls.start({
          opacity: 1,
          scale: [1, 0.95, 1.05, 1],
          transition: { 
            duration: 0.5,
            times: [0, 0.3, 0.7, 1]
          }
        });
        break;
      
      case 'dormant':
        controls.start({
          opacity: 0.5,
          scale: 0.98,
          transition: { duration: 0.8 }
        });
        break;
    }
    
    // Generate particles on state change
    if (ambientParticles && state !== 'dormant') {
      generateParticles();
    }
  }, [state, controls, messageControls, mapStateToEmotion, onStateChange, ambientParticles]);
  
  // Generate ambient particles
  const generateParticles = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Number of particles based on intensity
    const particleCount = 
      intensity === 'subtle' ? 3 :
      intensity === 'moderate' ? 5 :
      intensity === 'strong' ? 8 : 5;
    
    // Generate new particles
    const newParticles = Array.from({ length: particleCount }).map((_, i) => ({
      id: Date.now() + i,
      x: centerX + (Math.random() * 40 - 20),
      y: centerY + (Math.random() * 40 - 20),
      size: Math.random() * 4 + 2,
      speed: Math.random() * 1 + 0.5,
      opacity: Math.random() * 0.5 + 0.3
    }));
    
    setParticles(prev => [...prev, ...newParticles]);
    
    // Animate particles
    particlesControls.start({
      opacity: 0,
      scale: 2,
      transition: { 
        duration: 2,
        ease: "easeOut"
      }
    });
    
    // Remove particles after animation
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)));
    }, 2000);
  }, [intensity, particlesControls]);
  
  // Get icon based on state
  const getStateIcon = (state: SentientInterfaceState) => {
    switch (state) {
      case 'idle': return <Brain size={24} />;
      case 'listening': return <MessageSquare size={24} />;
      case 'thinking': return <Brain size={24} />;
      case 'speaking': return <MessageSquare size={24} />;
      case 'alert': return <AlertTriangle size={24} />;
      case 'success': return <CheckCircle size={24} />;
      case 'error': return <AlertTriangle size={24} />;
      case 'dormant': return <Brain size={24} />;
      default: return <Brain size={24} />;
    }
  };
  
  // Get container classes based on variant
  const getContainerClasses = () => {
    switch (variant) {
      case 'minimal':
        return 'p-4 max-w-sm';
      case 'standard':
        return 'p-6 max-w-md';
      case 'expanded':
        return 'p-8 max-w-lg';
      default:
        return 'p-6 max-w-md';
    }
  };
  
  return (
    <motion.div
      ref={containerRef}
      className={cn(
        getContainerClasses(),
        getGlassmorphismClasses({ level: glassLevel, border: true, shadow: true }),
        "relative overflow-hidden rounded-xl",
        className
      )}
      animate={controls}
      initial={{ opacity: 0.9, scale: 1 }}
    >
      {/* Background ambient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm" />
      
      {/* Ambient particles */}
      <AnimatePresence>
        {ambientParticles && particles.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-blue-400"
            style={{
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              opacity: particle.opacity
            }}
            animate={particlesControls}
            exit={{ opacity: 0, scale: 0 }}
          />
        ))}
      </AnimatePresence>
      
      {/* Content container */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Entity */}
        <div className="mb-4">
          <SentientEntity
            emotion={emotion}
            intensity={intensity}
            size="lg"
            variant="circle"
            enableSound={enableSound}
            enableHaptics={enableHaptics}
            breathingAnimation={breathingAnimation}
            pulseOnActivity={pulseOnActivity}
            reactToHover={true}
            reactToClick={true}
            icon={getStateIcon(state)}
            onEmotionChange={onEmotionChange}
            onInteraction={onInteraction}
            glassLevel="heavy"
          />
        </div>
        
        {/* Title */}
        {title && (
          <h3 className="mb-2 text-center text-xl font-semibold text-white">{title}</h3>
        )}
        
        {/* Message */}
        {message && (
          <motion.div
            className="mb-4 text-center text-gray-200"
            initial={{ opacity: 0, y: 10 }}
            animate={messageControls}
          >
            {message}
          </motion.div>
        )}
        
        {/* Children content */}
        {children && (
          <div className="w-full">
            {children}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SentientInterface;
