/**
 * TrendDelta Component
 *
 * Enhanced animated growth/shrink indicators for metrics with visual and haptic feedback.
 * Features:
 * - Color-coded visual feedback
 * - Subtle animations for value changes with multiple animation styles
 * - Support for different metric types and formats
 * - Haptic feedback with intensity based on change magnitude
 * - Glassmorphism styling support
 * - Multiple display variants
 */

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { cn } from '@src/shared/utils/cn';
import { getGlassmorphismClasses } from '@src/shared/utils/glassmorphism';
import {
  ArrowUp,
  ArrowDown,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  ChevronUp,
  ChevronDown,
  Percent
} from 'lucide-react';
import { useHapticFeedback } from '@src/shared/hooks/useHapticFeedback';
import { useSoundEffects } from '@src/shared/hooks/useSoundEffects';

export interface TrendDeltaProps {
  /** The percentage change value */
  value: number;
  /** Whether a positive value is considered good (e.g., revenue up is good, churn down is bad) */
  isPositiveGood?: boolean;
  /** The size of the component */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Whether to show the value */
  showValue?: boolean;
  /** Whether to show the icon */
  showIcon?: boolean;
  /** Whether to animate the component */
  animate?: boolean;
  /** Animation style to use */
  animationStyle?: 'pulse' | 'bounce' | 'fade' | 'slide' | 'scale' | 'glow';
  /** Whether to enable haptic feedback */
  enableHaptics?: boolean;
  /** Whether to enable sound effects */
  enableSound?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Optional label to display */
  label?: string;
  /** Whether to use a filled background */
  filled?: boolean;
  /** Whether to use glassmorphism styling */
  glassmorphism?: boolean;
  /** The glassmorphism level if enabled */
  glassLevel?: 'light' | 'medium' | 'heavy';
  /** The variant of the component */
  variant?: 'default' | 'pill' | 'minimal' | 'badge' | 'card' | 'inline';
  /** Format for displaying the value */
  valueFormat?: 'percent' | 'decimal' | 'integer' | 'currency';
  /** Number of decimal places to show */
  decimalPlaces?: number;
  /** Currency code for currency format */
  currencyCode?: string;
  /** Optional callback when clicked */
  onClick?: () => void;
}

export const TrendDelta: React.FC<TrendDeltaProps> = ({
  value,
  isPositiveGood = true,
  size = 'md',
  showValue = true,
  showIcon = true,
  animate = true,
  animationStyle = 'pulse',
  enableHaptics = false,
  enableSound = false,
  className,
  label,
  filled = false,
  glassmorphism = false,
  glassLevel = 'medium',
  variant = 'default',
  valueFormat = 'percent',
  decimalPlaces = 1,
  currencyCode = 'USD',
  onClick
}) => {
  const [prevValue, setPrevValue] = useState<number>(value);
  const [hasChanged, setHasChanged] = useState<boolean>(false);
  const animationControls = useAnimation();
  const { triggerHaptic, isSupported: isHapticSupported } = useHapticFeedback({ enabled: enableHaptics });
  const { playSound, isSupported: isSoundSupported } = useSoundEffects({ enabled: enableSound });

  // Determine if the trend is positive (true) or negative (false)
  const isPositive = value > 0;
  const isNeutral = value === 0;

  // Determine if the trend is good or bad based on direction and context
  const isGood = (isPositive && isPositiveGood) || (!isPositive && !isPositiveGood);

  // Determine the magnitude of the change for haptic feedback intensity
  const changeMagnitude = Math.abs(value);
  const getHapticIntensity = () => {
    if (changeMagnitude > 20) return 'strong';
    if (changeMagnitude > 5) return 'moderate';
    return 'subtle';
  };

  // Get the appropriate color based on whether the trend is good or bad
  const getColor = () => {
    if (isNeutral) return 'text-gray-400 dark:text-gray-500';
    return isGood ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400';
  };

  // Get the appropriate background color for filled variant
  const getBgColor = () => {
    if (isNeutral) return 'bg-gray-100 dark:bg-gray-800';
    return isGood ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30';
  };

  // Get the appropriate border color
  const getBorderColor = () => {
    if (isNeutral) return 'border-gray-200 dark:border-gray-700';
    return isGood ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800';
  };

  // Get the appropriate icon based on the trend direction and variant
  const getIcon = () => {
    if (isNeutral) return <ArrowRight className={getIconSize()} />;

    if (variant === 'minimal' || variant === 'inline') {
      return isPositive ?
        <ChevronUp className={getIconSize()} /> :
        <ChevronDown className={getIconSize()} />;
    }

    return isPositive ?
      <TrendingUp className={getIconSize()} /> :
      <TrendingDown className={getIconSize()} />;
  };

  // Get the appropriate size for the icon
  const getIconSize = () => {
    switch (size) {
      case 'xs': return 'h-2 w-2';
      case 'sm': return 'h-3 w-3';
      case 'lg': return 'h-5 w-5';
      case 'xl': return 'h-6 w-6';
      default: return 'h-4 w-4';
    }
  };

  // Get the appropriate size for the text
  const getTextSize = () => {
    switch (size) {
      case 'xs': return 'text-xs';
      case 'sm': return 'text-xs';
      case 'lg': return 'text-base';
      case 'xl': return 'text-lg';
      default: return 'text-sm';
    }
  };

  // Get the appropriate padding
  const getPadding = () => {
    if (variant === 'minimal' || variant === 'inline') return '';

    switch (size) {
      case 'xs': return 'px-1 py-0.5';
      case 'sm': return 'px-1.5 py-0.5';
      case 'lg': return 'px-3 py-1.5';
      case 'xl': return 'px-4 py-2';
      default: return 'px-2 py-1';
    }
  };

  // Format the value based on the specified format
  const formatValue = () => {
    const absValue = Math.abs(value);

    switch (valueFormat) {
      case 'decimal':
        return absValue.toFixed(decimalPlaces);
      case 'integer':
        return Math.round(absValue).toString();
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currencyCode,
          minimumFractionDigits: decimalPlaces,
          maximumFractionDigits: decimalPlaces
        }).format(absValue);
      case 'percent':
      default:
        return `${absValue.toFixed(decimalPlaces)}%`;
    }
  };

  // Get animation variants based on the animation style
  const getAnimationVariants = () => {
    switch (animationStyle) {
      case 'bounce':
        return {
          initial: { y: 0 },
          animate: { y: [0, -8, 0] },
          transition: { duration: 0.5, ease: 'easeInOut' }
        };
      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.3 }
        };
      case 'slide':
        return {
          initial: { x: isPositive ? -10 : 10, opacity: 0 },
          animate: { x: 0, opacity: 1 },
          transition: { duration: 0.3 }
        };
      case 'scale':
        return {
          initial: { scale: 0.8, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          transition: { duration: 0.3 }
        };
      case 'glow':
        return {
          initial: { boxShadow: '0 0 0 rgba(0,0,0,0)' },
          animate: {
            boxShadow: isGood
              ? '0 0 15px rgba(34,197,94,0.5)'
              : '0 0 15px rgba(239,68,68,0.5)'
          },
          transition: { duration: 0.5 }
        };
      case 'pulse':
      default:
        return {
          initial: { scale: 1 },
          animate: { scale: [1, 1.1, 1] },
          transition: { duration: 0.5 }
        };
    }
  };

  // Effect to detect value changes and trigger animations/haptics/sounds
  useEffect(() => {
    if (value !== prevValue) {
      setHasChanged(true);
      setPrevValue(value);

      // Trigger haptic feedback if enabled and supported
      if (enableHaptics && isHapticSupported) {
        triggerHaptic(isGood ? 'success' : 'error', getHapticIntensity());
      }

      // Play sound effect if enabled and supported
      if (enableSound && isSoundSupported) {
        playSound(isGood ? 'success' : 'error', getHapticIntensity());
      }

      // Trigger animation
      if (animate) {
        animationControls.start(getAnimationVariants().animate);
      }

      // Reset the changed state after animation
      const timer = setTimeout(() => {
        setHasChanged(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [value, prevValue, isGood, enableHaptics, isHapticSupported, enableSound, isSoundSupported, triggerHaptic, playSound, animate, animationControls]);

  // Get the component classes based on variant and options
  const getComponentClasses = () => {
    // Base classes that apply to all variants
    let baseClasses = cn(
      'inline-flex items-center',
      getColor(),
      'font-medium transition-all duration-200',
      onClick && 'cursor-pointer hover:opacity-80',
      className
    );

    // Apply variant-specific styling
    if (variant === 'minimal' || variant === 'inline') {
      baseClasses = cn(baseClasses, getTextSize());
    } else if (variant === 'badge') {
      baseClasses = cn(
        baseClasses,
        'rounded-md',
        filled ? getBgColor() : 'border',
        getBorderColor(),
        getPadding(),
        getTextSize()
      );
    } else if (variant === 'card') {
      baseClasses = cn(
        baseClasses,
        'rounded-lg',
        filled ? getBgColor() : 'border',
        getBorderColor(),
        'p-3',
        getTextSize()
      );
    } else if (variant === 'pill') {
      baseClasses = cn(
        baseClasses,
        'rounded-full border',
        getBorderColor(),
        filled && getBgColor(),
        getPadding(),
        getTextSize()
      );
    } else {
      // Default variant
      baseClasses = cn(
        baseClasses,
        'rounded-full',
        filled && getBgColor(),
        getPadding(),
        getTextSize()
      );
    }

    // Apply glassmorphism if enabled
    if (glassmorphism) {
      baseClasses = cn(
        baseClasses,
        getGlassmorphismClasses({
          level: glassLevel,
          border: true,
          shadow: true,
          hover: !!onClick
        })
      );
    }

    return baseClasses;
  };

  // Get the animation variants for the component
  const { initial, animate: animateVariant, transition } = getAnimationVariants();

  return (
    <AnimatePresence>
      <motion.div
        className={getComponentClasses()}
        initial={animate ? initial : { opacity: 1 }}
        animate={animate ? (hasChanged ? animateVariant : { opacity: 1 }) : { opacity: 1 }}
        exit={animate ? { opacity: 0, y: -5 } : { opacity: 1 }}
        transition={transition}
        onClick={onClick}
      >
        {showIcon && (
          <motion.span
            className="mr-1"
            animate={hasChanged && animate ? { scale: [1, 1.3, 1] } : { scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {getIcon()}
          </motion.span>
        )}

        {showValue && (
          <motion.span
            animate={hasChanged && animate ? { opacity: [0.7, 1] } : { opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {formatValue()}
          </motion.span>
        )}

        {label && (
          <span className="ml-1 text-gray-500 dark:text-gray-400">
            {label}
          </span>
        )}

        {valueFormat === 'percent' && !showValue && (
          <Percent className={cn(getIconSize(), 'ml-1 opacity-60')} />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default TrendDelta;
