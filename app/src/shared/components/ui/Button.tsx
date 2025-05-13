import React from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** The variant style of the button */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  /** The size of the button */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Whether the button is in a loading state */
  isLoading?: boolean;
  /** Optional icon to display before the button text */
  leftIcon?: React.ReactNode;
  /** Optional icon to display after the button text */
  rightIcon?: React.ReactNode;
  /** Whether the button should take the full width of its container */
  fullWidth?: boolean;
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
  leftIcon,
  rightIcon,
  fullWidth = false,
  ...props
}) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        {
          // Variant styles
          'bg-primary text-white hover:bg-primary-dark focus-visible:ring-primary': 
            variant === 'primary',
          'bg-gray-200 text-gray-800 hover:bg-gray-300 focus-visible:ring-gray-400': 
            variant === 'secondary',
          'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-100': 
            variant === 'outline',
          'bg-transparent text-gray-700 hover:bg-gray-100': 
            variant === 'ghost',
          'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600': 
            variant === 'danger',
          
          // Size styles
          'px-2 py-1 text-xs': size === 'xs',
          'px-2.5 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-sm': size === 'md',
          'px-6 py-3 text-base': size === 'lg',
          
          // Width styles
          'w-full': fullWidth,
          
          // State styles
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
          <span>Loading...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
