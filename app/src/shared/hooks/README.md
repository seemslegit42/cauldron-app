# Shared Hooks

This directory contains reusable React hooks that are used across the application.

## Directory Structure

- `/ai`: AI-related hooks (inference, streaming, etc.)
- `/auth`: Authentication-related hooks
- `/data`: Data fetching and manipulation hooks
- `/ui`: UI-related hooks (modals, toasts, etc.)
- `/form`: Form-related hooks (validation, submission, etc.)

## Hook Guidelines

### Hook Structure

Each hook should follow this structure:

1. A TypeScript file with the hook implementation
2. A documentation file (optional but recommended)
3. A test file (required for complex hooks)

### Hook Implementation

Hooks should:

- Be typed with TypeScript
- Have clear return types
- Include JSDoc comments
- Handle errors gracefully
- Be composable when possible

### Example Hook

```tsx
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
```
