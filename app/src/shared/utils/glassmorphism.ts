import { cn } from './cn';

/**
 * Glassmorphism effect levels
 */
export type GlassmorphismLevel = 'none' | 'light' | 'medium' | 'heavy';

/**
 * Glassmorphism effect options
 */
export interface GlassmorphismOptions {
  /** Level of the glassmorphism effect */
  level?: GlassmorphismLevel;
  /** Whether to add a border */
  border?: boolean;
  /** Whether to add a shadow */
  shadow?: boolean;
  /** Whether to add a hover effect */
  hover?: boolean;
  /** Custom background color (default is white with opacity) */
  bgColor?: string;
  /** Custom border color (default is white with opacity) */
  borderColor?: string;
  /** Custom backdrop filter blur amount */
  blurAmount?: string;
  /** Additional classes to apply */
  className?: string;
}

/**
 * Get glassmorphism classes based on options
 * 
 * @example
 * ```tsx
 * <div className={getGlassmorphismClasses({ level: 'medium', border: true, shadow: true })}>
 *   Glassmorphism content
 * </div>
 * ```
 */
export function getGlassmorphismClasses({
  level = 'medium',
  border = true,
  shadow = true,
  hover = false,
  bgColor,
  borderColor,
  blurAmount,
  className,
}: GlassmorphismOptions = {}): string {
  if (level === 'none') {
    return className || '';
  }

  // Base classes for all glassmorphism levels
  const baseClasses = 'backdrop-filter backdrop-blur rounded-lg';

  // Level-specific classes
  const levelClasses = {
    light: {
      bg: bgColor || 'bg-white/10 dark:bg-gray-900/10',
      border: borderColor || 'border-white/20 dark:border-gray-800/20',
      blur: blurAmount || 'backdrop-blur-sm',
    },
    medium: {
      bg: bgColor || 'bg-white/20 dark:bg-gray-900/20',
      border: borderColor || 'border-white/30 dark:border-gray-800/30',
      blur: blurAmount || 'backdrop-blur-md',
    },
    heavy: {
      bg: bgColor || 'bg-white/30 dark:bg-gray-900/30',
      border: borderColor || 'border-white/40 dark:border-gray-800/40',
      blur: blurAmount || 'backdrop-blur-lg',
    },
  };

  // Shadow classes
  const shadowClasses = shadow ? 'shadow-lg' : '';

  // Border classes
  const borderClasses = border ? `border ${levelClasses[level].border}` : '';

  // Hover classes
  const hoverClasses = hover
    ? 'transition-all duration-300 hover:bg-opacity-30 hover:shadow-xl'
    : '';

  return cn(
    baseClasses,
    levelClasses[level].bg,
    levelClasses[level].blur,
    borderClasses,
    shadowClasses,
    hoverClasses,
    className
  );
}

/**
 * Glassmorphism component props
 */
export interface GlassmorphismProps extends React.HTMLAttributes<HTMLDivElement>, GlassmorphismOptions {}

/**
 * A higher-order function that adds glassmorphism to a component
 * 
 * @example
 * ```tsx
 * // Create a glassmorphism card component
 * const GlassCard = withGlassmorphism('div');
 * 
 * // Use the component
 * <GlassCard level="medium" border shadow hover>
 *   Card content
 * </GlassCard>
 * ```
 */
export function withGlassmorphism<T extends React.ElementType = 'div'>(
  Component: T
): React.FC<GlassmorphismProps & React.ComponentPropsWithoutRef<T>> {
  return ({
    level,
    border,
    shadow,
    hover,
    bgColor,
    borderColor,
    blurAmount,
    className,
    ...props
  }) => {
    const glassmorphismClasses = getGlassmorphismClasses({
      level,
      border,
      shadow,
      hover,
      bgColor,
      borderColor,
      blurAmount,
    });

    return (
      <Component
        className={cn(glassmorphismClasses, className)}
        {...props}
      />
    );
  };
}

/**
 * Glassmorphism components
 */
export const GlassContainer = withGlassmorphism('div');
export const GlassCard = withGlassmorphism('div');
export const GlassPanel = withGlassmorphism('div');
