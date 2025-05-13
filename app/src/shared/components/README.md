# Shared Components

This directory contains reusable components that are used across the application.

## Directory Structure

- `/ui`: Basic UI components (buttons, inputs, cards, etc.)
- `/layout`: Layout components (containers, grids, etc.)
- `/data`: Data display components (tables, lists, etc.)
- `/feedback`: User feedback components (alerts, toasts, etc.)
- `/forms`: Form components (inputs, selectors, etc.)
- `/navigation`: Navigation components (menus, tabs, etc.)
- `/modals`: Modal and dialog components
- `/ai`: AI-specific components (chat interfaces, etc.)

## Component Guidelines

### Component Structure

Each component should follow this structure:

1. A TypeScript file with the component implementation
2. A documentation file (optional but recommended)
3. A test file (required for complex components)

### Component Implementation

Components should:

- Be typed with TypeScript
- Use functional components with hooks
- Accept a `className` prop for styling customization
- Have clear prop interfaces
- Include JSDoc comments for props and the component itself

### Example Component

```tsx
import React from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** The variant style of the button */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  /** The size of the button */
  size?: 'sm' | 'md' | 'lg';
  /** Whether the button is in a loading state */
  isLoading?: boolean;
}

/**
 * Button component for user interactions
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        {
          'bg-primary text-white hover:bg-primary-dark': variant === 'primary',
          'bg-gray-200 text-gray-800 hover:bg-gray-300': variant === 'secondary',
          'border border-gray-300 bg-transparent hover:bg-gray-100': variant === 'outline',
          'bg-transparent hover:bg-gray-100': variant === 'ghost',
          'px-2 py-1 text-sm': size === 'sm',
          'px-4 py-2': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
          'opacity-50 cursor-not-allowed': isLoading || disabled,
        },
        className
      )}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};
```
