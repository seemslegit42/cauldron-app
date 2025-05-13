import React from 'react';
import { cn } from '../../utils/cn';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether the container should have a max width */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'none';
  /** Whether the container should be centered */
  centered?: boolean;
  /** Whether the container should have padding */
  padded?: boolean;
}

/**
 * Container component for layout
 */
export const Container: React.FC<ContainerProps> = ({
  children,
  className,
  maxWidth = 'lg',
  centered = true,
  padded = true,
  ...props
}) => {
  return (
    <div
      className={cn(
        {
          'mx-auto': centered,
          'px-4 sm:px-6 lg:px-8': padded,
          'max-w-xs': maxWidth === 'xs',
          'max-w-sm': maxWidth === 'sm',
          'max-w-md': maxWidth === 'md',
          'max-w-lg': maxWidth === 'lg',
          'max-w-xl': maxWidth === 'xl',
          'max-w-2xl': maxWidth === '2xl',
          'max-w-full': maxWidth === 'full',
          '': maxWidth === 'none',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
