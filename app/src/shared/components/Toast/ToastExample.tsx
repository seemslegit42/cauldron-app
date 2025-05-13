import React from 'react';
import { useToast } from './ToastContext';
import { getGlassmorphismClasses } from '../../utils/glassmorphism';

/**
 * Example component to demonstrate toast functionality
 * This can be used in any page to show how the toast system works
 */
const ToastExample: React.FC = () => {
  const { addToast } = useToast();

  // Example toast messages with BitBrew's alchemical terminology
  const showSuccessToast = () => {
    addToast({
      title: 'Spell Cast Successfully',
      message: 'Your incantation has been processed by the cauldron.',
      type: 'success',
    });
  };

  const showErrorToast = () => {
    addToast({
      title: 'Arcane Error',
      message: 'The mystical forces rejected your request. Try a different approach.',
      type: 'error',
    });
  };

  const showWarningToast = () => {
    addToast({
      title: 'Alchemical Warning',
      message: 'This mixture is unstable. Proceed with caution, brave wizard.',
      type: 'warning',
    });
  };

  const showInfoToast = () => {
    addToast({
      title: 'Sentient Loop™ Update',
      message: 'The AI has completed its divination ritual and awaits your command.',
      type: 'info',
    });
  };

  // Get glassmorphism classes for the container
  const glassClasses = getGlassmorphismClasses({
    level: 'medium',
    border: true,
    shadow: true,
  });

  return (
    <div className={`${glassClasses} p-6 max-w-2xl mx-auto`}>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Toast Notification Examples
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Click the buttons below to summon different types of notifications.
      </p>
      
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <button 
          onClick={showSuccessToast}
          className="px-4 py-2 bg-arcana-green-600 text-white rounded-md hover:bg-arcana-green-500 transition-colors"
        >
          Success Toast
        </button>
        
        <button 
          onClick={showErrorToast}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500 transition-colors"
        >
          Error Toast
        </button>
        
        <button 
          onClick={showWarningToast}
          className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-500 transition-colors"
        >
          Warning Toast
        </button>
        
        <button 
          onClick={showInfoToast}
          className="px-4 py-2 bg-arcana-blue-600 text-white rounded-md hover:bg-arcana-blue-500 transition-colors"
        >
          Info Toast
        </button>
      </div>
    </div>
  );
};

export default ToastExample;
