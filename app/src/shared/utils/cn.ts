import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function for conditionally joining class names with Tailwind CSS
 * 
 * @example
 * ```tsx
 * <div className={cn(
 *   'base-class',
 *   isActive && 'active-class',
 *   variant === 'primary' ? 'primary-class' : 'secondary-class'
 * )}>
 *   Content
 * </div>
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
