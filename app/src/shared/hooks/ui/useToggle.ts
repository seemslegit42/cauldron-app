import { useState, useCallback } from 'react';

/**
 * Options for the useToggle hook
 */
export interface UseToggleOptions {
  /** Initial state of the toggle */
  initialState?: boolean;
  /** Callback when the toggle is turned on */
  onToggleOn?: () => void;
  /** Callback when the toggle is turned off */
  onToggleOff?: () => void;
}

/**
 * Return type for the useToggle hook
 */
export interface UseToggleReturn {
  /** Current state of the toggle */
  state: boolean;
  /** Function to toggle the state */
  toggle: () => void;
  /** Function to set the state to true */
  setOn: () => void;
  /** Function to set the state to false */
  setOff: () => void;
}

/**
 * A hook for managing toggle state
 * 
 * @example
 * ```tsx
 * const { state, toggle, setOn, setOff } = useToggle({ initialState: false });
 * 
 * return (
 *   <button onClick={toggle}>
 *     {state ? 'On' : 'Off'}
 *   </button>
 * );
 * ```
 */
export function useToggle({
  initialState = false,
  onToggleOn,
  onToggleOff,
}: UseToggleOptions = {}): UseToggleReturn {
  const [state, setState] = useState<boolean>(initialState);

  const toggle = useCallback(() => {
    setState((prev) => {
      const newState = !prev;
      if (newState && onToggleOn) {
        onToggleOn();
      } else if (!newState && onToggleOff) {
        onToggleOff();
      }
      return newState;
    });
  }, [onToggleOn, onToggleOff]);

  const setOn = useCallback(() => {
    setState(true);
    if (onToggleOn) {
      onToggleOn();
    }
  }, [onToggleOn]);

  const setOff = useCallback(() => {
    setState(false);
    if (onToggleOff) {
      onToggleOff();
    }
  }, [onToggleOff]);

  return { state, toggle, setOn, setOff };
}
