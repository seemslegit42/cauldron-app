import { useState, useCallback } from 'react';

/**
 * Options for the useModal hook
 */
export interface UseModalOptions {
  /** Initial state of the modal */
  initialOpen?: boolean;
  /** Callback when the modal is opened */
  onOpen?: () => void;
  /** Callback when the modal is closed */
  onClose?: () => void;
}

/**
 * Return type for the useModal hook
 */
export interface UseModalReturn {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Function to open the modal */
  open: () => void;
  /** Function to close the modal */
  close: () => void;
  /** Function to toggle the modal */
  toggle: () => void;
}

/**
 * A hook for managing modal state
 * 
 * @example
 * ```tsx
 * const { isOpen, open, close, toggle } = useModal();
 * 
 * return (
 *   <>
 *     <button onClick={open}>Open Modal</button>
 *     {isOpen && (
 *       <div className="modal">
 *         <div className="modal-content">
 *           <h2>Modal Title</h2>
 *           <p>Modal content goes here...</p>
 *           <button onClick={close}>Close</button>
 *         </div>
 *       </div>
 *     )}
 *   </>
 * );
 * ```
 */
export function useModal({
  initialOpen = false,
  onOpen,
  onClose,
}: UseModalOptions = {}): UseModalReturn {
  const [isOpen, setIsOpen] = useState<boolean>(initialOpen);

  const open = useCallback(() => {
    setIsOpen(true);
    if (onOpen) {
      onOpen();
    }
  }, [onOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      const newState = !prev;
      if (newState && onOpen) {
        onOpen();
      } else if (!newState && onClose) {
        onClose();
      }
      return newState;
    });
  }, [onOpen, onClose]);

  return { isOpen, open, close, toggle };
}
