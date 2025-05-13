import React from 'react';
import { cn } from '../../utils/cn';
import { GlassmorphismLevel, getGlassmorphismClasses } from '../../utils/glassmorphism';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether the card has a hover effect */
  hoverable?: boolean;
  /** Whether the card has a border */
  bordered?: boolean;
  /** Whether the card has a shadow */
  shadowed?: boolean;
  /** Card variant */
  variant?: 'default' | 'metric' | 'alert' | 'insight' | 'glass';
  /** Card status/severity for alert cards */
  status?: 'info' | 'success' | 'warning' | 'error' | 'critical' | 'high' | 'medium' | 'low';
  /** Card metric data for metric cards */
  metric?: {
    value?: number | string;
    previousValue?: number;
    percentChange?: number;
    target?: number;
    unit?: string;
    isPositiveGood?: boolean;
  };
  /** Glassmorphism level for glass variant */
  glassLevel?: GlassmorphismLevel;
}

/**
 * Card component for containing content with multiple variants
 *
 * @example
 * ```tsx
 * // Basic card
 * <Card>
 *   <CardContent>Basic card content</CardContent>
 * </Card>
 *
 * // Glass card
 * <Card variant="glass" glassLevel="medium">
 *   <CardContent>Glass card content</CardContent>
 * </Card>
 * ```
 */
export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverable = false,
  bordered = true,
  shadowed = true,
  variant = 'default',
  status,
  metric,
  glassLevel = 'medium',
  ...props
}) => {
  // Get status color for alert cards
  const getStatusColor = () => {
    if (!status) return '';

    switch (status) {
      case 'critical':
      case 'error':
        return 'border-red-500 bg-red-50 dark:bg-red-900 dark:bg-opacity-20';
      case 'high':
      case 'warning':
        return 'border-orange-500 bg-orange-50 dark:bg-orange-900 dark:bg-opacity-20';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20';
      case 'low':
      case 'info':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20';
      case 'success':
        return 'border-green-500 bg-green-50 dark:bg-green-900 dark:bg-opacity-20';
      default:
        return 'border-gray-500 bg-gray-50 dark:bg-gray-900 dark:bg-opacity-20';
    }
  };

  // Get trend indicator for metric cards
  const getTrendIndicator = () => {
    if (!metric || metric.percentChange === undefined) return null;

    const isPositiveTrend = metric.percentChange > 0;
    const isPositiveGood = metric.isPositiveGood !== false; // Default to true
    const isGood = (isPositiveTrend && isPositiveGood) || (!isPositiveTrend && !isPositiveGood);
    const trendColor = isGood ? 'text-green-500' : 'text-red-500';

    return (
      <div className={`flex items-center ${trendColor}`}>
        {isPositiveTrend ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v3.586l-4.293-4.293a1 1 0 00-1.414 0L8 10.586 3.707 6.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 10.414 14.586 14H12z" clipRule="evenodd" />
          </svg>
        )}
        <span className="text-xs font-medium">
          {Math.abs(metric.percentChange).toFixed(1)}%
        </span>
      </div>
    );
  };

  // Apply variant-specific classes
  const getVariantClasses = () => {
    switch (variant) {
      case 'alert':
        return cn('border-l-4', getStatusColor());
      case 'metric':
        return 'bg-white dark:bg-gray-800';
      case 'insight':
        return 'bg-white dark:bg-gray-800 border-l-4 border-indigo-500';
      case 'glass':
        return getGlassmorphismClasses({
          level: glassLevel,
          border: bordered,
          shadow: shadowed,
          hover: hoverable
        });
      default:
        return 'bg-white dark:bg-gray-800';
    }
  };

  return (
    <div
      className={cn(
        'rounded-lg',
        getVariantClasses(),
        {
          'border border-gray-200 dark:border-gray-700': bordered && variant !== 'alert' && variant !== 'glass',
          'shadow-md': shadowed && variant !== 'glass',
          'transition-all duration-200 hover:shadow-lg': hoverable && variant !== 'glass',
        },
        className
      )}
      {...props}
    >
      {variant === 'metric' && metric ? (
        <div className="p-4">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{props.title || 'Metric'}</h3>
            {getTrendIndicator()}
          </div>

          <div className="mt-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {metric.value !== undefined ? metric.value : '—'}
            </span>
            {metric.unit && metric.unit !== '$' && metric.unit !== '%' && (
              <span className="ml-1 text-sm text-gray-500">{metric.unit}</span>
            )}
          </div>

          {metric.target !== undefined && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{Math.min(100, Math.round(((metric.value as number) / metric.target) * 100))}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div
                  className="bg-primary h-1.5 rounded-full"
                  style={{ width: `${Math.min(100, Math.round(((metric.value as number) / metric.target) * 100))}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      ) : (
        children
      )}
    </div>
  );
};

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Title of the card */
  title?: React.ReactNode;
  /** Subtitle of the card */
  subtitle?: React.ReactNode;
  /** Actions to be displayed in the header */
  action?: React.ReactNode;
}

/**
 * Card header component
 */
export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className,
  title,
  subtitle,
  action,
  ...props
}) => {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-center justify-between">
          {title && (
            <h3 className="text-lg font-semibold leading-none tracking-tight text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      {subtitle && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
      )}
      {children}
    </div>
  );
};

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether to add padding to the body */
  padded?: boolean;
}

/**
 * Card body component
 */
export const CardBody: React.FC<CardBodyProps> = ({
  children,
  className,
  padded = true,
  ...props
}) => {
  return (
    <div
      className={cn(padded ? 'p-6 pt-0' : '', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Card footer component
 */
export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

/**
 * Card title component
 */
export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <h3
      className={cn(
        'text-lg font-semibold text-gray-900 dark:text-white',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
};

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

/**
 * Card description component
 */
export const CardDescription: React.FC<CardDescriptionProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <p
      className={cn(
        'mt-1 text-sm text-gray-500 dark:text-gray-400',
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
};

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Card content component
 */
export const CardContent: React.FC<CardContentProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn('px-6 py-4', className)}
      {...props}
    >
      {children}
    </div>
  );
};
