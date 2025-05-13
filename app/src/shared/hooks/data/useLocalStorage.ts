import { useState, useEffect, useCallback } from 'react';

/**
 * Options for the useLocalStorage hook
 */
export interface UseLocalStorageOptions<T> {
  /** The key to store the value under in localStorage */
  key: string;
  /** The initial value to use if no value is found in localStorage */
  initialValue: T;
  /** Whether to use sessionStorage instead of localStorage */
  useSessionStorage?: boolean;
}

/**
 * Return type for the useLocalStorage hook
 */
export type UseLocalStorageReturn<T> = [
  /** The current value */
  T,
  /** Function to update the value */
  (value: T | ((val: T) => T)) => void,
  /** Function to remove the value from storage */
  () => void
];

/**
 * A hook for managing state in localStorage or sessionStorage
 * 
 * @example
 * ```tsx
 * const [theme, setTheme, removeTheme] = useLocalStorage({
 *   key: 'theme',
 *   initialValue: 'light'
 * });
 * 
 * return (
 *   <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
 *     Toggle Theme
 *   </button>
 * );
 * ```
 */
export function useLocalStorage<T>({
  key,
  initialValue,
  useSessionStorage = false,
}: UseLocalStorageOptions<T>): UseLocalStorageReturn<T> {
  // Get the storage object based on the option
  const storageObject = useSessionStorage ? sessionStorage : localStorage;

  // Helper function to get the value from storage
  const readValue = useCallback((): T => {
    try {
      const item = storageObject.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue, storageObject]);

  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        
        // Save state
        setStoredValue(valueToStore);
        
        // Save to storage
        storageObject.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue, storageObject]
  );

  // Remove from storage
  const removeValue = useCallback(() => {
    try {
      // Remove from storage
      storageObject.removeItem(key);
      // Reset state
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue, storageObject]);

  // Listen for changes to the localStorage/sessionStorage outside of this hook
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.storageArea === storageObject) {
        setStoredValue(e.newValue ? JSON.parse(e.newValue) : initialValue);
      }
    };

    // Listen for storage events
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue, storageObject]);

  return [storedValue, setValue, removeValue];
}
