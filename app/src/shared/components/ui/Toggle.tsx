import React, { useId } from 'react';
import { cn } from '../../utils/cn';

export interface ToggleProps {
  /** Whether the toggle is on */
  isOn: boolean;
  /** Callback when the toggle changes */
  onChange: (value: boolean) => void;
  /** Size of the toggle */
  size?: 'sm' | 'md' | 'lg';
  /** Variant of the toggle */
  variant?: 'default' | 'withIcons' | 'minimal';
  /** Custom class name */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Label for the toggle */
  label?: {
    on?: string;
    off?: string;
  };
  /** Position of the label */
  labelPosition?: 'left' | 'right';
}

/**
 * A unified toggle component with multiple variants
 * 
 * @example
 * ```tsx
 * // Default style
 * <Toggle isOn={isEnabled} onChange={setIsEnabled} />
 * 
 * // With icons
 * <Toggle isOn={isEnabled} onChange={setIsEnabled} variant="withIcons" />
 * 
 * // Minimal style
 * <Toggle isOn={isEnabled} onChange={setIsEnabled} variant="minimal" />
 * 
 * // Different sizes
 * <Toggle isOn={isEnabled} onChange={setIsEnabled} size="sm" />
 * <Toggle isOn={isEnabled} onChange={setIsEnabled} size="md" />
 * <Toggle isOn={isEnabled} onChange={setIsEnabled} size="lg" />
 * 
 * // With label
 * <Toggle isOn={isEnabled} onChange={setIsEnabled} label={{ on: "Enabled", off: "Disabled" }} />
 * 
 * // With label position
 * <Toggle isOn={isEnabled} onChange={setIsEnabled} label={{ on: "Enabled", off: "Disabled" }} labelPosition="left" />
 * ```
 */
export const Toggle: React.FC<ToggleProps> = ({
  isOn,
  onChange,
  size = 'md',
  variant = 'default',
  className = '',
  disabled = false,
  label,
  labelPosition = 'right',
}) => {
  const id = useId();

  // Size classes for toggle
  const toggleSize = {
    sm: { container: 'h-6 w-12', circle: 'h-4 w-4' },
    md: { container: 'h-7 w-14', circle: 'h-5 w-5' },
    lg: { container: 'h-8 w-16', circle: 'h-6 w-6' }
  }[size];

  // Size classes for icons
  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }[size];

  const renderLabel = () => {
    if (!label) return null;
    
    const labelText = isOn ? label.on : label.off;
    if (!labelText) return null;
    
    return (
      <span className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
        {labelText}
      </span>
    );
  };

  const renderToggle = () => (
    <div className="relative">
      <label htmlFor={id} className="flex cursor-pointer select-none items-center">
        <div className="relative">
          <input
            id={id}
            type="checkbox"
            className="sr-only"
            checked={isOn}
            onChange={(e) => !disabled && onChange(e.target.checked)}
            disabled={disabled}
          />
          <div 
            className={cn(
              'rounded-full transition-colors',
              toggleSize.container,
              disabled 
                ? 'bg-gray-300 dark:bg-gray-700' 
                : isOn 
                  ? 'bg-primary dark:bg-primary' 
                  : 'bg-gray-300 dark:bg-gray-600'
            )}
          />
          <div
            className={cn(
              'absolute left-1 top-1/2 -translate-y-1/2 rounded-full bg-white transition-transform',
              toggleSize.circle,
              {
                'translate-x-full': isOn,
                'opacity-60': disabled
              }
            )}
          >
            {variant === 'withIcons' && (
              <>
                <span className={cn('absolute inset-0 flex items-center justify-center transition-opacity', isOn ? 'opacity-0' : 'opacity-100')}>
                  <XIcon className={iconSize} />
                </span>
                <span className={cn('absolute inset-0 flex items-center justify-center transition-opacity', isOn ? 'opacity-100' : 'opacity-0')}>
                  <CheckIcon className={iconSize} />
                </span>
              </>
            )}
          </div>
        </div>
      </label>
    </div>
  );

  return (
    <div className={cn('flex items-center gap-2', className, labelPosition === 'left' ? 'flex-row-reverse' : 'flex-row')}>
      {renderLabel()}
      {renderToggle()}
    </div>
  );
};

const XIcon = ({ className }: { className?: string }) => (
  <svg
    className={cn('stroke-current text-gray-600', className)}
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    className={cn('text-primary', className)}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 12L10 17L19 8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Toggle;
