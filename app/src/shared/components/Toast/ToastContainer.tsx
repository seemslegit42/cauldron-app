import React from 'react';
import { useToast } from './ToastContext';
import ToastComponent from './ToastComponent';

/**
 * Toast Container Component
 * Renders all active toasts in a fixed position container
 */
const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex flex-col items-end justify-end pointer-events-none p-4 space-y-4 z-50">
      {toasts.map((toast) => (
        <ToastComponent 
          key={toast.id} 
          {...toast} 
          onRemove={removeToast} 
        />
      ))}
    </div>
  );
};

export default ToastContainer;
