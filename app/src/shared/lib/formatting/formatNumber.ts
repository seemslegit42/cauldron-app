/**
 * Number formatting utility
 */

/**
 * Number format options
 */
export type NumberFormatOptions = {
  /** Number of decimal places */
  decimals?: number;
  /** Whether to use grouping separators */
  useGrouping?: boolean;
  /** Locale */
  locale?: string;
  /** Currency code (e.g., 'USD') */
  currency?: string;
  /** Number format style */
  style?: 'decimal' | 'currency' | 'percent' | 'unit';
  /** Unit to use (e.g., 'byte') */
  unit?: string;
};

/**
 * Formats a number according to the specified options
 * 
 * @param value The number to format
 * @param options Formatting options
 * @returns The formatted number string
 * 
 * @example
 * ```
 * formatNumber(1234.56) // '1,234.56'
 * formatNumber(1234.56, { decimals: 1 }) // '1,234.6'
 * formatNumber(1234.56, { style: 'currency', currency: 'USD' }) // '$1,234.56'
 * formatNumber(0.1234, { style: 'percent' }) // '12.34%'
 * ```
 */
export function formatNumber(
  value: number,
  options: NumberFormatOptions = {}
): string {
  // Get locale from options or use default
  const locale = options.locale || navigator.language || 'en-US';
  
  // Prepare format options
  const formatOptions: Intl.NumberFormatOptions = {
    style: options.style || 'decimal',
    useGrouping: options.useGrouping !== undefined ? options.useGrouping : true,
  };
  
  // Add currency if specified
  if (options.style === 'currency' && options.currency) {
    formatOptions.currency = options.currency;
  }
  
  // Add unit if specified
  if (options.style === 'unit' && options.unit) {
    formatOptions.unit = options.unit;
  }
  
  // Add decimal places if specified
  if (options.decimals !== undefined) {
    formatOptions.minimumFractionDigits = options.decimals;
    formatOptions.maximumFractionDigits = options.decimals;
  }
  
  // Format the number
  return new Intl.NumberFormat(locale, formatOptions).format(value);
}

/**
 * Formats a number as a currency string
 * 
 * @param value The number to format
 * @param currency The currency code (e.g., 'USD')
 * @param options Additional formatting options
 * @returns The formatted currency string
 * 
 * @example
 * ```
 * formatCurrency(1234.56, 'USD') // '$1,234.56'
 * formatCurrency(1234.56, 'EUR', { locale: 'de-DE' }) // '1.234,56 €'
 * ```
 */
export function formatCurrency(
  value: number,
  currency: string = 'USD',
  options: Omit<NumberFormatOptions, 'style' | 'currency'> = {}
): string {
  return formatNumber(value, {
    ...options,
    style: 'currency',
    currency,
  });
}

/**
 * Formats a number as a percentage string
 * 
 * @param value The number to format (0.1 = 10%)
 * @param options Additional formatting options
 * @returns The formatted percentage string
 * 
 * @example
 * ```
 * formatPercent(0.1234) // '12.34%'
 * formatPercent(0.1234, { decimals: 1 }) // '12.3%'
 * ```
 */
export function formatPercent(
  value: number,
  options: Omit<NumberFormatOptions, 'style'> = {}
): string {
  return formatNumber(value, {
    ...options,
    style: 'percent',
  });
}

/**
 * Formats a number as a compact string (e.g., 1.2K, 1.2M)
 * 
 * @param value The number to format
 * @param options Additional formatting options
 * @returns The formatted compact string
 * 
 * @example
 * ```
 * formatCompact(1234) // '1.2K'
 * formatCompact(1234567) // '1.2M'
 * ```
 */
export function formatCompact(
  value: number,
  options: Omit<NumberFormatOptions, 'style'> = {}
): string {
  // Get locale from options or use default
  const locale = options.locale || navigator.language || 'en-US';
  
  // Format the number
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: options.decimals !== undefined ? options.decimals : 1,
  }).format(value);
}
