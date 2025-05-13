import React, { createContext, useContext, ReactNode } from 'react';
import { useDarkMode, UseDarkModeReturn } from './darkMode';

/**
 * Context for dark mode
 */
export const DarkModeContext = createContext<UseDarkModeReturn>({
  isDarkMode: false,
  toggleDarkMode: () => {},
  enableDarkMode: () => {},
  disableDarkMode: () => {},
  setDarkMode: () => {},
});

/**
 * Hook to use the dark mode context
 */
export const useDarkModeContext = () => useContext(DarkModeContext);

interface DarkModeProviderProps {
  children: ReactNode;
  initialDarkMode?: boolean;
  respectSystemPreference?: boolean;
  storageKey?: string;
  className?: string;
}

/**
 * Provider component for dark mode
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <DarkModeProvider>
 *   <App />
 * </DarkModeProvider>
 * 
 * // With options
 * <DarkModeProvider 
 *   initialDarkMode={true} 
 *   respectSystemPreference={false}
 *   storageKey="my-app-dark-mode"
 * >
 *   <App />
 * </DarkModeProvider>
 * ```
 */
export const DarkModeProvider: React.FC<DarkModeProviderProps> = ({
  children,
  initialDarkMode = false,
  respectSystemPreference = true,
  storageKey = 'darkMode',
  className = 'dark',
}) => {
  const darkModeState = useDarkMode({
    defaultValue: initialDarkMode,
    respectSystemPreference,
    storageKey,
    className,
  });

  return (
    <DarkModeContext.Provider value={darkModeState}>
      {children}
    </DarkModeContext.Provider>
  );
};

export default DarkModeProvider;
