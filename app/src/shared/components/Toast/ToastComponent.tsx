import React, { useEffect } from 'react';
import { Toast, ToastType } from './ToastContext';
import { getGlassmorphismClasses } from '../../utils/glassmorphism';

// Toast colors based on type
const toastTypeClasses: Record<ToastType, string> = {
  success: 'border-l-4 border-l-arcana-green-500 dark:border-l-arcana-green-400',
  error: 'border-l-4 border-l-red-500 dark:border-l-red-400',
  warning: 'border-l-4 border-l-yellow-500 dark:border-l-yellow-400',
  info: 'border-l-4 border-l-arcana-blue-500 dark:border-l-arcana-blue-400',
};

// Toast icons based on type
const ToastIcon: React.FC<{ type: ToastType }> = ({ type }) => {
  switch (type) {
    case 'success':
      return (
        <svg className="w-6 h-6 text-arcana-green-500 dark:text-arcana-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    case 'error':
      return (
        <svg className="w-6 h-6 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    case 'warning':
      return (
        <svg className="w-6 h-6 text-yellow-500 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    case 'info':
    default:
      return (
        <svg className="w-6 h-6 text-arcana-blue-500 dark:text-arcana-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
};

// Toast component props
interface ToastComponentProps extends Toast {
  onRemove: (id: number) => void;
}

/**
 * Individual Toast Component
 * Displays a single toast notification with title, message, and icon
 */
const ToastComponent: React.FC<ToastComponentProps> = ({ 
  id, 
  title, 
  message, 
  type, 
  duration = 5000, 
  onRemove 
}) => {
  // Auto-remove toast after duration
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onRemove]);

  // Get glassmorphism classes
  const glassClasses = getGlassmorphismClasses({
    level: 'medium',
    border: true,
    shadow: true,
  });

  return (
    <div 
      className={`${glassClasses} ${toastTypeClasses[type]} p-4 w-80 pointer-events-auto animate-in fade-in slide-in-from-right-5 duration-300`}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <ToastIcon type={type} />
        </div>
        <div className="ml-3 w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">{message}</p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            className="inline-flex text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-white focus:outline-none"
            onClick={() => onRemove(id)}
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToastComponent;
