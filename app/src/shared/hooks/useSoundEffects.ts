/**
 * Hook for playing sound effects
 * 
 * This hook provides functions for playing sound effects based on
 * different emotions and intensities. It uses the Web Audio API for
 * precise control over sounds and falls back gracefully when not supported.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { SentientEmotion, EmotionIntensity } from '../components/sentient/SentientEntity';

interface UseSoundEffectsOptions {
  enabled?: boolean;
  volume?: number;
  preloadSounds?: boolean;
}

interface UseSoundEffectsReturn {
  isSupported: boolean;
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
  playSound: (
    emotionOrSound: SentientEmotion | 'click' | 'error' | 'success' | 'notification',
    intensity?: EmotionIntensity
  ) => void;
  stopAllSounds: () => void;
}

/**
 * Hook for playing sound effects
 */
export function useSoundEffects({
  enabled = true,
  volume = 0.5,
  preloadSounds = true
}: UseSoundEffectsOptions = {}): UseSoundEffectsReturn {
  // Check if Web Audio API is supported
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isEnabled, setEnabled] = useState<boolean>(enabled);
  const [currentVolume, setVolume] = useState<number>(volume);
  
  // Audio context reference
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundCacheRef = useRef<Map<string, AudioBuffer>>(new Map());
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  
  // Initialize audio context on mount
  useEffect(() => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioContextRef.current = new AudioContext();
        setIsSupported(true);
        
        // Preload sounds if enabled
        if (preloadSounds) {
          preloadCommonSounds();
        }
        
        // Clean up on unmount
        return () => {
          if (audioContextRef.current?.state !== 'closed') {
            stopAllSounds();
            audioContextRef.current?.close();
          }
        };
      } else {
        setIsSupported(false);
      }
    } catch (error) {
      console.error('Error initializing Web Audio API:', error);
      setIsSupported(false);
    }
  }, [preloadSounds]);
  
  // Preload common sounds
  const preloadCommonSounds = useCallback(async () => {
    if (!audioContextRef.current) return;
    
    const commonSounds = ['click', 'notification', 'success', 'error'];
    
    for (const sound of commonSounds) {
      try {
        await generateSound(sound as any, 'moderate');
      } catch (error) {
        console.error(`Error preloading sound "${sound}":`, error);
      }
    }
  }, []);
  
  // Generate a sound based on emotion and intensity
  const generateSound = useCallback(async (
    emotion: SentientEmotion | 'click' | 'error' | 'success' | 'notification',
    intensity: EmotionIntensity = 'moderate'
  ): Promise<AudioBuffer> => {
    if (!audioContextRef.current) {
      throw new Error('Audio context not initialized');
    }
    
    const ctx = audioContextRef.current;
    const cacheKey = `${emotion}-${intensity}`;
    
    // Check if sound is already cached
    if (soundCacheRef.current.has(cacheKey)) {
      return soundCacheRef.current.get(cacheKey)!;
    }
    
    // Get intensity factor
    const intensityFactor = 
      intensity === 'subtle' ? 0.7 :
      intensity === 'moderate' ? 1.0 :
      intensity === 'strong' ? 1.3 : 1.0;
    
    // Create an empty buffer
    const duration = 0.3 * intensityFactor;
    const sampleRate = ctx.sampleRate;
    const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
    
    // Get parameters based on emotion
    let frequency: number;
    let type: OscillatorType;
    let attackTime: number;
    let releaseTime: number;
    let modulationFrequency: number = 0;
    let modulationDepth: number = 0;
    
    switch (emotion) {
      case 'neutral':
        frequency = 440;
        type = 'sine';
        attackTime = 0.01;
        releaseTime = 0.2;
        break;
      
      case 'thinking':
        frequency = 330;
        type = 'sine';
        attackTime = 0.05;
        releaseTime = 0.2;
        modulationFrequency = 5;
        modulationDepth = 10;
        break;
      
      case 'happy':
        frequency = 523.25; // C5
        type = 'sine';
        attackTime = 0.01;
        releaseTime = 0.1;
        break;
      
      case 'sad':
        frequency = 349.23; // F4
        type = 'sine';
        attackTime = 0.1;
        releaseTime = 0.3;
        break;
      
      case 'excited':
        frequency = 587.33; // D5
        type = 'square';
        attackTime = 0.01;
        releaseTime = 0.1;
        modulationFrequency = 8;
        modulationDepth = 20;
        break;
      
      case 'concerned':
        frequency = 392; // G4
        type = 'triangle';
        attackTime = 0.05;
        releaseTime = 0.2;
        break;
      
      case 'confused':
        frequency = 466.16; // A#4/Bb4
        type = 'triangle';
        attackTime = 0.05;
        releaseTime = 0.15;
        modulationFrequency = 4;
        modulationDepth = 15;
        break;
      
      case 'focused':
        frequency = 440; // A4
        type = 'sine';
        attackTime = 0.02;
        releaseTime = 0.1;
        break;
      
      case 'surprised':
        frequency = 622.25; // D#5/Eb5
        type = 'sine';
        attackTime = 0.01;
        releaseTime = 0.1;
        break;
      
      case 'curious':
        frequency = 493.88; // B4
        type = 'sine';
        attackTime = 0.03;
        releaseTime = 0.2;
        modulationFrequency = 3;
        modulationDepth = 10;
        break;
      
      case 'click':
        frequency = 800;
        type = 'sine';
        attackTime = 0.001;
        releaseTime = 0.05;
        break;
      
      case 'error':
        frequency = 220;
        type = 'sawtooth';
        attackTime = 0.01;
        releaseTime = 0.2;
        break;
      
      case 'success':
        frequency = 587.33; // D5
        type = 'sine';
        attackTime = 0.01;
        releaseTime = 0.2;
        break;
      
      case 'notification':
        frequency = 880;
        type = 'sine';
        attackTime = 0.01;
        releaseTime = 0.1;
        break;
      
      default:
        frequency = 440;
        type = 'sine';
        attackTime = 0.01;
        releaseTime = 0.2;
    }
    
    // Apply intensity factor to frequency
    frequency *= intensityFactor;
    
    // Generate sound data
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const data = buffer.getChannelData(channel);
      
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        
        // Apply envelope (attack and release)
        let envelope = 0;
        if (t < attackTime) {
          envelope = t / attackTime;
        } else if (t > duration - releaseTime) {
          envelope = (duration - t) / releaseTime;
        } else {
          envelope = 1;
        }
        
        // Apply modulation if needed
        let modulation = 1;
        if (modulationFrequency > 0) {
          modulation = 1 + (Math.sin(2 * Math.PI * modulationFrequency * t) * modulationDepth / 100);
        }
        
        // Generate waveform
        let sample = 0;
        const currentFreq = frequency * modulation;
        
        switch (type) {
          case 'sine':
            sample = Math.sin(2 * Math.PI * currentFreq * t);
            break;
          case 'square':
            sample = Math.sin(2 * Math.PI * currentFreq * t) >= 0 ? 1 : -1;
            break;
          case 'sawtooth':
            sample = 2 * ((t * currentFreq) % 1) - 1;
            break;
          case 'triangle':
            sample = 2 * Math.abs(2 * ((t * currentFreq) % 1) - 1) - 1;
            break;
        }
        
        // Apply envelope
        data[i] = sample * envelope * 0.5; // Reduce volume to avoid clipping
      }
    }
    
    // Cache the buffer
    soundCacheRef.current.set(cacheKey, buffer);
    
    return buffer;
  }, []);
  
  // Play a sound
  const playSound = useCallback((
    emotionOrSound: SentientEmotion | 'click' | 'error' | 'success' | 'notification',
    intensity: EmotionIntensity = 'moderate'
  ) => {
    if (!isSupported || !isEnabled || !audioContextRef.current) return;
    
    // Resume audio context if it's suspended (needed for some browsers)
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    
    // Generate and play the sound
    generateSound(emotionOrSound, intensity)
      .then(buffer => {
        const source = audioContextRef.current!.createBufferSource();
        source.buffer = buffer;
        
        // Create gain node for volume control
        const gainNode = audioContextRef.current!.createGain();
        gainNode.gain.value = currentVolume;
        
        // Connect nodes
        source.connect(gainNode);
        gainNode.connect(audioContextRef.current!.destination);
        
        // Track active sources
        activeSourcesRef.current.push(source);
        
        // Remove from active sources when finished
        source.onended = () => {
          activeSourcesRef.current = activeSourcesRef.current.filter(s => s !== source);
        };
        
        // Play the sound
        source.start();
      })
      .catch(error => {
        console.error('Error playing sound:', error);
      });
  }, [isSupported, isEnabled, currentVolume, generateSound]);
  
  // Stop all sounds
  const stopAllSounds = useCallback(() => {
    activeSourcesRef.current.forEach(source => {
      try {
        source.stop();
      } catch (error) {
        // Ignore errors from already stopped sources
      }
    });
    
    activeSourcesRef.current = [];
  }, []);
  
  return {
    isSupported,
    isEnabled,
    setEnabled,
    setVolume,
    playSound,
    stopAllSounds
  };
}

export default useSoundEffects;
