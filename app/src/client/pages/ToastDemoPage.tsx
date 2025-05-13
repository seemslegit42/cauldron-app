import React from 'react';
import ToastExample from '../../shared/components/Toast/ToastExample';
import { getGlassmorphismClasses } from '../../shared/utils/glassmorphism';

/**
 * Toast Demo Page
 * A page to demonstrate the toast notification system
 */
const ToastDemoPage: React.FC = () => {
  // Get glassmorphism classes for the container
  const glassClasses = getGlassmorphismClasses({
    level: 'medium',
    border: true,
    shadow: true,
  });

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Toast Notification System
          </h1>
          <p className="mt-4 text-xl text-gray-500 dark:text-gray-300">
            A demonstration of the CauldronOS notification system with alchemical flair.
          </p>
        </div>

        <div className="mt-10">
          <ToastExample />
        </div>

        <div className={`${glassClasses} p-6 mt-12`}>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            How to Use Toast Notifications
          </h2>
          
          <div className="prose dark:prose-invert max-w-none">
            <p>
              The toast notification system provides a way to display temporary messages to users.
              These can be success messages, errors, warnings, or general information.
            </p>
            
            <h3>Implementation</h3>
            
            <p>To use toast notifications in your components:</p>
            
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto">
              <code>{`import { useToast } from '../../shared/components/Toast';

function YourComponent() {
  const { addToast } = useToast();
  
  const handleAction = () => {
    // Perform some action
    
    // Show a success toast
    addToast({
      title: 'Action Completed',
      message: 'Your action was successful.',
      type: 'success',
    });
  };
  
  // Rest of your component
}`}</code>
            </pre>
            
            <h3>Toast Types</h3>
            
            <ul>
              <li><strong>Success</strong> - For successful operations</li>
              <li><strong>Error</strong> - For errors and failures</li>
              <li><strong>Warning</strong> - For cautionary messages</li>
              <li><strong>Info</strong> - For general information</li>
            </ul>
            
            <h3>Customization</h3>
            
            <p>
              You can customize the duration of each toast by adding a <code>duration</code> property (in milliseconds).
              The default duration is 5000ms (5 seconds).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToastDemoPage;
