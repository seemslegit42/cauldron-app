import { ToastProvider, useToast, ToastType, Toast } from './ToastContext';
import ToastContainer from './ToastContainer';

// Re-export everything for easy imports
export { 
  ToastProvider, 
  useToast, 
  ToastContainer,
  type ToastType,
  type Toast
};

/**
 * Wrapped ToastProvider that includes the ToastContainer
 * This is the component that should be used at the app root
 */
export const ToastProviderWithContainer: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  return (
    <ToastProvider>
      {children}
      <ToastContainer />
    </ToastProvider>
  );
};
