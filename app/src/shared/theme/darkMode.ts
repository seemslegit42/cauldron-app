import { useEffect } from 'react';
import { useLocalStorage } from '../hooks/data/useLocalStorage';

/**
 * Options for the useDarkMode hook
 */
export interface UseDarkModeOptions {
  /** The key to store the dark mode preference in localStorage */
  storageKey?: string;
  /** The class name to apply to the document element when dark mode is enabled */
  className?: string;
  /** The initial value to use if no preference is found in localStorage */
  defaultValue?: boolean;
  /** Whether to respect the user's system preference */
  respectSystemPreference?: boolean;
}

/**
 * Return type for the useDarkMode hook
 */
export interface UseDarkModeReturn {
  /** Whether dark mode is enabled */
  isDarkMode: boolean;
  /** Function to toggle dark mode */
  toggleDarkMode: () => void;
  /** Function to enable dark mode */
  enableDarkMode: () => void;
  /** Function to disable dark mode */
  disableDarkMode: () => void;
  /** Function to set dark mode based on a value */
  setDarkMode: (value: boolean) => void;
}

/**
 * A hook for managing dark mode
 * 
 * @example
 * ```tsx
 * const { isDarkMode, toggleDarkMode } = useDarkMode();
 * 
 * return (
 *   <button onClick={toggleDarkMode}>
 *     {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
 *   </button>
 * );
 * ```
 */
export function useDarkMode({
  storageKey = 'darkMode',
  className = 'dark',
  defaultValue = false,
  respectSystemPreference = true,
}: UseDarkModeOptions = {}): UseDarkModeReturn {
  const [isDarkMode, setIsDarkMode, removeDarkMode] = useLocalStorage({
    key: storageKey,
    initialValue: getInitialValue(),
  });

  // Get the initial value based on system preference if enabled
  function getInitialValue(): boolean {
    if (respectSystemPreference) {
      // Check if the user has a system preference
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return systemPreference;
    }
    return defaultValue;
  }

  // Update the class on the document element when dark mode changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add(className);
    } else {
      document.documentElement.classList.remove(className);
    }
  }, [isDarkMode, className]);

  // Listen for changes to the system preference if enabled
  useEffect(() => {
    if (!respectSystemPreference) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [respectSystemPreference, setIsDarkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Enable dark mode
  const enableDarkMode = () => {
    setIsDarkMode(true);
  };

  // Disable dark mode
  const disableDarkMode = () => {
    setIsDarkMode(false);
  };

  return {
    isDarkMode,
    toggleDarkMode,
    enableDarkMode,
    disableDarkMode,
    setDarkMode: setIsDarkMode,
  };
}
