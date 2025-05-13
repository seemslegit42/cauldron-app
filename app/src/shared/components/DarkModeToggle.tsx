import React from 'react';
import { useDarkMode } from '../theme/darkMode';
import { cn } from '../utils/cn';

interface DarkModeToggleProps {
  className?: string;
  variant?: 'default' | 'minimal' | 'text' | 'icon-text' | 'pill';
  size?: 'sm' | 'md' | 'lg';
  label?: {
    light?: string;
    dark?: string;
  };
  onToggle?: (isDarkMode: boolean) => void;
}

/**
 * A toggle button for switching between light and dark mode
 * 
 * @example
 * ```tsx
 * // Default style
 * <DarkModeToggle />
 * 
 * // Minimal style
 * <DarkModeToggle variant="minimal" />
 * 
 * // Text style
 * <DarkModeToggle variant="text" />
 * 
 * // Icon with text
 * <DarkModeToggle variant="icon-text" />
 * 
 * // Pill style (segmented control)
 * <DarkModeToggle variant="pill" />
 * 
 * // Different sizes
 * <DarkModeToggle size="sm" />
 * <DarkModeToggle size="md" />
 * <DarkModeToggle size="lg" />
 * 
 * // Custom labels
 * <DarkModeToggle label={{ light: "Day", dark: "Night" }} />
 * 
 * // With custom class
 * <DarkModeToggle className="my-custom-class" />
 * 
 * // With toggle callback
 * <DarkModeToggle onToggle={(isDark) => console.log(`Dark mode: ${isDark}`)} />
 * ```
 */
export const DarkModeToggle: React.FC<DarkModeToggleProps> = ({
  className = '',
  variant = 'default',
  size = 'md',
  label = { light: 'Light', dark: 'Dark' },
  onToggle
}) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const handleToggle = () => {
    toggleDarkMode();
    if (onToggle) {
      onToggle(!isDarkMode);
    }
  };

  // Size classes for icons
  const iconSize = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }[size];

  // Size classes for buttons
  const buttonSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }[size];

  // Size classes for toggle
  const toggleSize = {
    sm: { container: 'h-6 w-12', circle: 'h-4 w-4' },
    md: { container: 'h-7.5 w-14', circle: 'h-6 w-6' },
    lg: { container: 'h-9 w-16', circle: 'h-7 w-7' }
  }[size];

  // Minimal variant (icon only)
  if (variant === 'minimal') {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          'rounded-full bg-gray-800 p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white',
          className
        )}
        title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDarkMode ? (
          <svg xmlns="http://www.w3.org/2000/svg" className={iconSize} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className={iconSize} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>
    );
  }

  // Text variant (text only)
  if (variant === 'text') {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          'px-3 py-1.5 rounded font-medium transition-colors',
          isDarkMode 
            ? 'bg-gray-700 text-white hover:bg-gray-600' 
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300',
          buttonSize,
          className
        )}
        title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDarkMode ? label.dark : label.light}
      </button>
    );
  }

  // Icon + Text variant
  if (variant === 'icon-text') {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded font-medium transition-colors',
          isDarkMode 
            ? 'bg-gray-700 text-white hover:bg-gray-600' 
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300',
          buttonSize,
          className
        )}
        title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDarkMode ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className={iconSize} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>{label.dark}</span>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className={iconSize} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <span>{label.light}</span>
          </>
        )}
      </button>
    );
  }

  // Pill variant
  if (variant === 'pill') {
    return (
      <div className={cn('inline-flex rounded-full p-1 bg-gray-200 dark:bg-gray-700', className)}>
        <button
          type="button"
          onClick={() => isDarkMode && handleToggle()}
          className={cn(
            'px-3 py-1 rounded-full font-medium transition-colors',
            !isDarkMode 
              ? 'bg-white text-gray-800 shadow-sm' 
              : 'text-gray-400 hover:text-gray-600',
            buttonSize
          )}
          aria-label="Switch to light mode"
        >
          {label.light}
        </button>
        <button
          type="button"
          onClick={() => !isDarkMode && handleToggle()}
          className={cn(
            'px-3 py-1 rounded-full font-medium transition-colors',
            isDarkMode 
              ? 'bg-gray-800 text-white shadow-sm' 
              : 'text-gray-600 hover:text-gray-800',
            buttonSize
          )}
          aria-label="Switch to dark mode"
        >
          {label.dark}
        </button>
      </div>
    );
  }

  // Default variant (slider style)
  return (
    <div className={className}>
      <label className={cn('relative m-0 block rounded-full', toggleSize.container, isDarkMode ? 'bg-primary' : 'bg-stroke')}>
        <input
          type='checkbox'
          checked={isDarkMode}
          onChange={handleToggle}
          className='absolute top-0 z-50 m-0 h-full w-full cursor-pointer opacity-0'
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        />
        <span
          className={cn(
            'absolute top-1/2 left-[3px] flex -translate-y-1/2 translate-x-0 items-center justify-center rounded-full bg-white shadow-switcher duration-200 ease-linear',
            toggleSize.circle,
            {
              '!right-[3px] !translate-x-full': isDarkMode,
            }
          )}
        >
          <ModeIcon isDarkMode={isDarkMode} />
        </span>
      </label>
    </div>
  );
};

function ModeIcon({ isDarkMode }: { isDarkMode: boolean }) {
  const iconStyle = 'absolute inset-0 flex items-center justify-center transition-opacity ease-in-out duration-400';
  return (
    <>
      <span className={cn(iconStyle, !isDarkMode ? 'opacity-100' : 'opacity-0')}><SunIcon /></span>
      <span className={cn(iconStyle, isDarkMode ? 'opacity-100' : 'opacity-0')}><MoonIcon /></span>
    </>
  );
}

function SunIcon() {
  return (
    <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M7.99992 12.6666C10.5772 12.6666 12.6666 10.5772 12.6666 7.99992C12.6666 5.42259 10.5772 3.33325 7.99992 3.33325C5.42259 3.33325 3.33325 5.42259 3.33325 7.99992C3.33325 10.5772 5.42259 12.6666 7.99992 12.6666Z'
        fill='#969AA1'
      />
      <path
        d='M8.00008 2.33341C8.23625 2.33341 8.42258 2.14708 8.42258 1.91091V0.422581C8.42258 0.186411 8.23625 8.11108e-05 8.00008 8.11108e-05C7.76391 8.11108e-05 7.57758 0.186411 7.57758 0.422581V1.91091C7.57758 2.14708 7.76391 2.33341 8.00008 2.33341Z'
        fill='#969AA1'
      />
      <path
        d='M8.00008 13.6667C7.76391 13.6667 7.57758 13.8531 7.57758 14.0892V15.5776C7.57758 15.8137 7.76391 16.0001 8.00008 16.0001C8.23625 16.0001 8.42258 15.8137 8.42258 15.5776V14.0892C8.42258 13.8531 8.23625 13.6667 8.00008 13.6667Z'
        fill='#969AA1'
      />
      <path
        d='M15.5775 7.57758H14.0891C13.853 7.57758 13.6667 7.76391 13.6667 8.00008C13.6667 8.23625 13.853 8.42258 14.0891 8.42258H15.5775C15.8136 8.42258 16.0000 8.23625 16.0000 8.00008C16.0000 7.76391 15.8136 7.57758 15.5775 7.57758Z'
        fill='#969AA1'
      />
      <path
        d='M2.33341 8.00008C2.33341 7.76391 2.14708 7.57758 1.91091 7.57758H0.422581C0.186411 7.57758 8.11108e-05 7.76391 8.11108e-05 8.00008C8.11108e-05 8.23625 0.186411 8.42258 0.422581 8.42258H1.91091C2.14708 8.42258 2.33341 8.23625 2.33341 8.00008Z'
        fill='#969AA1'
      />
      <path
        d='M13.1893 2.81092C13.3563 2.81092 13.5231 2.74509 13.6476 2.6206L14.7422 1.52589C14.9911 1.27706 14.9911 0.875748 14.7422 0.626915C14.4934 0.378082 14.0921 0.378082 13.8432 0.626915L12.7486 1.72163C12.4997 1.97046 12.4997 2.37177 12.7486 2.6206C12.8729 2.74509 13.0398 2.81092 13.1893 2.81092Z'
        fill='#969AA1'
      />
      <path
        d='M2.81092 13.1893C2.81092 13.3563 2.74509 13.5231 2.6206 13.6476L1.52589 14.7422C1.27706 14.9911 0.875748 14.9911 0.626915 14.7422C0.378082 14.4934 0.378082 14.0921 0.626915 13.8432L1.72163 12.7486C1.97046 12.4997 2.37177 12.4997 2.6206 12.7486C2.74509 12.8729 2.81092 13.0398 2.81092 13.1893Z'
        fill='#969AA1'
      />
      <path
        d='M13.6476 13.3795C13.5231 13.255 13.3563 13.1892 13.1893 13.1892C13.0398 13.1892 12.8729 13.255 12.7486 13.3795C12.4997 13.6283 12.4997 14.0296 12.7486 14.2785L13.8432 15.3732C14.0921 15.622 14.4934 15.622 14.7422 15.3732C14.9911 15.1243 14.9911 14.723 14.7422 14.4742L13.6476 13.3795Z'
        fill='#969AA1'
      />
      <path
        d='M2.6206 2.6206C2.74509 2.74509 2.91196 2.81092 3.06155 2.81092C3.21114 2.81092 3.37801 2.74509 3.5025 2.6206C3.75133 2.37177 3.75133 1.97046 3.5025 1.72163L2.40779 0.626915C2.15896 0.378082 1.75765 0.378082 1.50882 0.626915C1.25998 0.875748 1.25998 1.27706 1.50882 1.52589L2.6206 2.6206Z'
        fill='#969AA1'
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M14.3533 10.62C14.2466 10.44 13.9466 10.16 13.1999 10.2933C12.7866 10.3667 12.3666 10.4 11.9466 10.38C10.3933 10.3133 8.98659 9.6 8.00659 8.5C7.13993 7.53333 6.60659 6.27333 6.59993 4.91333C6.59993 4.15333 6.74659 3.42 7.04659 2.72666C7.33993 2.05333 7.13326 1.7 6.98659 1.55333C6.83326 1.4 6.47326 1.18666 5.76659 1.48C3.03993 2.62666 1.35326 5.36 1.55326 8.28666C1.75326 11.04 3.68659 13.3933 6.24659 14.28C6.85993 14.4933 7.50659 14.62 8.17326 14.6467C8.27993 14.6533 8.38659 14.66 8.49326 14.66C10.7266 14.66 12.8199 13.6067 14.1399 11.8133C14.5866 11.1933 14.4666 10.8 14.3533 10.62Z'
        fill='#969AA1'
      />
    </svg>
  );
}

export default DarkModeToggle;
