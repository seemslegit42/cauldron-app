import React, { createContext, useContext, ReactNode } from 'react';
import { useGamification, type GamificationHook } from '../hooks/useGamification';
import { Toaster } from 'react-hot-toast';
import { Confetti } from '../../../shared/components/ui/confetti';

// Create context
const GamificationContext = createContext<GamificationHook | undefined>(undefined);

// Provider props
interface GamificationProviderProps {
  children: ReactNode;
}

/**
 * Gamification Provider Component
 * 
 * Provides gamification functionality to the entire application
 */
export function GamificationProvider({ children }: GamificationProviderProps) {
  const gamification = useGamification();
  
  return (
    <GamificationContext.Provider value={gamification}>
      {children}
      
      {/* Toast container for notifications */}
      <Toaster position="top-right" />
      
      {/* Confetti for celebrations */}
      <Confetti isActive={false} /> {/* Will be controlled by achievements */}
    </GamificationContext.Provider>
  );
}

/**
 * Hook to use the gamification context
 */
export function useGamificationContext(): GamificationHook {
  const context = useContext(GamificationContext);
  
  if (context === undefined) {
    throw new Error('useGamificationContext must be used within a GamificationProvider');
  }
  
  return context;
}

/**
 * Higher-order component to wrap a component with gamification functionality
 */
export function withGamification<P extends object>(
  Component: React.ComponentType<P & { gamification: GamificationHook }>
): React.FC<P> {
  return (props: P) => {
    const gamification = useGamificationContext();
    
    return <Component {...props} gamification={gamification} />;
  };
}
