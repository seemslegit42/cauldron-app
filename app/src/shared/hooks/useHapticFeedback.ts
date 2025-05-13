/**
 * Hook for providing haptic feedback
 * 
 * This hook provides functions for triggering haptic feedback based on
 * different emotions and intensities. It uses the Web Vibration API when
 * available and falls back gracefully when not supported.
 */

import { useCallback, useEffect, useState } from 'react';
import { SentientEmotion, EmotionIntensity } from '../components/sentient/SentientEntity';

interface UseHapticFeedbackOptions {
  enabled?: boolean;
  intensityMultiplier?: number;
}

interface UseHapticFeedbackReturn {
  isSupported: boolean;
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
  triggerHaptic: (
    emotionOrPattern: SentientEmotion | 'click' | 'error' | 'success' | number[],
    intensity?: EmotionIntensity
  ) => void;
}

/**
 * Hook for providing haptic feedback
 */
export function useHapticFeedback({
  enabled = true,
  intensityMultiplier = 1.0
}: UseHapticFeedbackOptions = {}): UseHapticFeedbackReturn {
  // Check if vibration is supported
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isEnabled, setEnabled] = useState<boolean>(enabled);
  
  // Check for vibration support on mount
  useEffect(() => {
    setIsSupported('vibrate' in navigator);
  }, []);
  
  // Get vibration pattern based on emotion and intensity
  const getVibrationPattern = useCallback((
    emotionOrPattern: SentientEmotion | 'click' | 'error' | 'success' | number[],
    intensity: EmotionIntensity = 'moderate'
  ): number[] => {
    // If a custom pattern is provided, use it
    if (Array.isArray(emotionOrPattern)) {
      return emotionOrPattern;
    }
    
    // Get intensity multiplier
    const intensityFactor = 
      intensity === 'subtle' ? 0.5 :
      intensity === 'moderate' ? 1.0 :
      intensity === 'strong' ? 1.5 : 1.0;
    
    // Apply global intensity multiplier
    const factor = intensityFactor * intensityMultiplier;
    
    // Define patterns for different emotions
    switch (emotionOrPattern) {
      case 'neutral':
        return [10 * factor];
      
      case 'thinking':
        return [20 * factor, 100, 20 * factor, 100, 20 * factor];
      
      case 'happy':
        return [40 * factor, 50, 80 * factor];
      
      case 'sad':
        return [100 * factor, 200, 100 * factor];
      
      case 'excited':
        return [30 * factor, 50, 30 * factor, 50, 80 * factor];
      
      case 'concerned':
        return [60 * factor, 100, 120 * factor];
      
      case 'confused':
        return [30 * factor, 100, 30 * factor, 200, 80 * factor];
      
      case 'focused':
        return [100 * factor];
      
      case 'surprised':
        return [150 * factor];
      
      case 'curious':
        return [40 * factor, 100, 40 * factor];
      
      case 'click':
        return [20 * factor];
      
      case 'error':
        return [100 * factor, 50, 100 * factor, 50, 100 * factor];
      
      case 'success':
        return [50 * factor, 50, 100 * factor];
      
      default:
        return [50 * factor];
    }
  }, [intensityMultiplier]);
  
  // Trigger haptic feedback
  const triggerHaptic = useCallback((
    emotionOrPattern: SentientEmotion | 'click' | 'error' | 'success' | number[],
    intensity: EmotionIntensity = 'moderate'
  ) => {
    if (!isSupported || !isEnabled) return;
    
    try {
      const pattern = getVibrationPattern(emotionOrPattern, intensity);
      navigator.vibrate(pattern);
    } catch (error) {
      console.error('Error triggering haptic feedback:', error);
    }
  }, [isSupported, isEnabled, getVibrationPattern]);
  
  return {
    isSupported,
    isEnabled,
    setEnabled,
    triggerHaptic
  };
}

export default useHapticFeedback;
