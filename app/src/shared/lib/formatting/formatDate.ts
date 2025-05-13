/**
 * Date formatting utility
 */

/**
 * Date format options
 */
export type DateFormatOptions = {
  /** Date format */
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  /** Time format */
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
  /** Whether to use 24-hour time */
  hour12?: boolean;
  /** Locale */
  locale?: string;
};

/**
 * Formats a date according to the specified options
 * 
 * @param date The date to format
 * @param options Formatting options
 * @returns The formatted date string
 * 
 * @example
 * ```
 * formatDate(new Date(), { dateStyle: 'medium' }) // 'Jan 1, 2023'
 * formatDate(new Date(), { timeStyle: 'short' }) // '12:00 AM'
 * formatDate(new Date(), { dateStyle: 'short', timeStyle: 'short' }) // '1/1/23, 12:00 AM'
 * ```
 */
export function formatDate(
  date: Date | string | number,
  options: DateFormatOptions = { dateStyle: 'medium' }
): string {
  // Convert to Date object if necessary
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Get locale from options or use default
  const locale = options.locale || navigator.language || 'en-US';
  
  // Format the date
  return new Intl.DateTimeFormat(locale, options as Intl.DateTimeFormatOptions).format(dateObj);
}

/**
 * Formats a date as a relative time string (e.g., "2 hours ago")
 * 
 * @param date The date to format
 * @param options Formatting options
 * @returns The relative time string
 * 
 * @example
 * ```
 * formatRelativeTime(new Date(Date.now() - 1000 * 60 * 60)) // '1 hour ago'
 * formatRelativeTime(new Date(Date.now() + 1000 * 60 * 60 * 24)) // 'tomorrow'
 * ```
 */
export function formatRelativeTime(
  date: Date | string | number,
  options: { locale?: string } = {}
): string {
  // Convert to Date object if necessary
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Get locale from options or use default
  const locale = options.locale || navigator.language || 'en-US';
  
  // Calculate the time difference in seconds
  const now = new Date();
  const diffInSeconds = Math.floor((dateObj.getTime() - now.getTime()) / 1000);
  
  // Define the units and their thresholds in seconds
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 60 * 60 * 24 * 365],
    ['month', 60 * 60 * 24 * 30],
    ['day', 60 * 60 * 24],
    ['hour', 60 * 60],
    ['minute', 60],
    ['second', 1],
  ];
  
  // Find the appropriate unit
  for (const [unit, threshold] of units) {
    if (Math.abs(diffInSeconds) >= threshold || unit === 'second') {
      const value = Math.round(diffInSeconds / threshold);
      return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(value, unit);
    }
  }
  
  return 'just now';
}
