import React, { Fragment, useEffect, useState } from 'react';
import { cn } from '../../utils/cn';
import { GlassmorphismLevel, getGlassmorphismClasses } from '../../utils/glassmorphism';

export interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when the modal is closed */
  onClose: () => void;
  /** Modal title */
  title?: React.ReactNode;
  /** Modal description */
  description?: React.ReactNode;
  /** Modal content */
  children: React.ReactNode;
  /** Modal size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Whether to show a close button */
  showCloseButton?: boolean;
  /** Whether to close the modal when clicking outside */
  closeOnClickOutside?: boolean;
  /** Whether to close the modal when pressing escape */
  closeOnEscape?: boolean;
  /** Custom class name for the modal */
  className?: string;
  /** Custom class name for the backdrop */
  backdropClassName?: string;
  /** Whether the modal has a footer */
  footer?: React.ReactNode;
  /** Whether the modal is centered vertically */
  centered?: boolean;
  /** Whether the modal has a max height and scrolls */
  scrollable?: boolean;
  /** Whether to use glassmorphism effect */
  glass?: boolean;
  /** Glassmorphism level */
  glassLevel?: GlassmorphismLevel;
  /** Whether to blur the backdrop */
  blurBackdrop?: boolean;
}

/**
 * Modal component for displaying content in a dialog
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
 *   <p>Modal content</p>
 * </Modal>
 *
 * // With title and footer
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Modal Title"
 *   footer={
 *     <div className="flex justify-end gap-2">
 *       <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
 *       <Button onClick={handleConfirm}>Confirm</Button>
 *     </div>
 *   }
 * >
 *   <p>Modal content</p>
 * </Modal>
 * ```
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnClickOutside = true,
  closeOnEscape = true,
  className,
  backdropClassName,
  footer,
  centered = true,
  scrollable = true,
  glass = false,
  glassLevel = 'medium',
  blurBackdrop = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      // Restore body scrolling when modal is closed
      document.body.style.overflow = '';
    };
  }, [isOpen, closeOnEscape, onClose]);

  // Animation effect
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300); // Match this with the CSS transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible && !isOpen) {
    return null;
  }

  // Size classes
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4',
  }[size];

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-start justify-center overflow-y-auto transition-opacity duration-300',
        centered ? 'items-center' : 'items-start pt-10',
        isOpen ? 'opacity-100' : 'opacity-0',
        blurBackdrop ? 'backdrop-blur-sm bg-black/30' : 'bg-black/50',
        backdropClassName
      )}
      onClick={closeOnClickOutside ? onClose : undefined}
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          'relative w-full transform rounded-lg p-6 transition-all duration-300',
          glass
            ? getGlassmorphismClasses({
                level: glassLevel,
                border: true,
                shadow: true,
                className: 'border-white/20 dark:border-gray-800/30'
              })
            : 'bg-white dark:bg-gray-800 shadow-xl',
          sizeClasses,
          scrollable ? 'max-h-[calc(100vh-2rem)] overflow-y-auto' : '',
          isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="mb-4 flex items-start justify-between">
            <div>
              {title && (
                <h3
                  id="modal-title"
                  className="text-lg font-semibold leading-6 text-gray-900 dark:text-white"
                >
                  {title}
                </h3>
              )}
              {description && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                type="button"
                className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none dark:hover:bg-gray-700"
                onClick={onClose}
                aria-label="Close"
              >
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className={cn(footer ? 'mb-6' : '')}>{children}</div>

        {/* Footer */}
        {footer && <div className="mt-6">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
