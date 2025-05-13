/**
 * Typography system for the application
 */

// Font families
export const fontFamilies = {
  sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
  serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
};

// Font sizes (in rem)
export const fontSizes = {
  xs: 'text-xs', // 0.75rem
  sm: 'text-sm', // 0.875rem
  base: 'text-base', // 1rem
  lg: 'text-lg', // 1.125rem
  xl: 'text-xl', // 1.25rem
  '2xl': 'text-2xl', // 1.5rem
  '3xl': 'text-3xl', // 1.875rem
  '4xl': 'text-4xl', // 2.25rem
  '5xl': 'text-5xl', // 3rem
  '6xl': 'text-6xl', // 3.75rem
  '7xl': 'text-7xl', // 4.5rem
  '8xl': 'text-8xl', // 6rem
  '9xl': 'text-9xl', // 8rem
};

// Font weights
export const fontWeights = {
  thin: 'font-thin', // 100
  extralight: 'font-extralight', // 200
  light: 'font-light', // 300
  normal: 'font-normal', // 400
  medium: 'font-medium', // 500
  semibold: 'font-semibold', // 600
  bold: 'font-bold', // 700
  extrabold: 'font-extrabold', // 800
  black: 'font-black', // 900
};

// Line heights
export const lineHeights = {
  none: 'leading-none', // 1
  tight: 'leading-tight', // 1.25
  snug: 'leading-snug', // 1.375
  normal: 'leading-normal', // 1.5
  relaxed: 'leading-relaxed', // 1.625
  loose: 'leading-loose', // 2
};

// Letter spacing
export const letterSpacing = {
  tighter: 'tracking-tighter', // -0.05em
  tight: 'tracking-tight', // -0.025em
  normal: 'tracking-normal', // 0em
  wide: 'tracking-wide', // 0.025em
  wider: 'tracking-wider', // 0.05em
  widest: 'tracking-widest', // 0.1em
};

// Text styles
export const textStyles = {
  // Headings
  heading: {
    h1: `${fontSizes['4xl']} ${fontWeights.bold} ${lineHeights.tight}`,
    h2: `${fontSizes['3xl']} ${fontWeights.bold} ${lineHeights.tight}`,
    h3: `${fontSizes['2xl']} ${fontWeights.bold} ${lineHeights.tight}`,
    h4: `${fontSizes.xl} ${fontWeights.bold} ${lineHeights.tight}`,
    h5: `${fontSizes.lg} ${fontWeights.bold} ${lineHeights.tight}`,
    h6: `${fontSizes.base} ${fontWeights.bold} ${lineHeights.tight}`,
  },
  
  // Body text
  body: {
    small: `${fontSizes.sm} ${fontWeights.normal} ${lineHeights.normal}`,
    regular: `${fontSizes.base} ${fontWeights.normal} ${lineHeights.normal}`,
    large: `${fontSizes.lg} ${fontWeights.normal} ${lineHeights.normal}`,
  },
  
  // Display text (larger than headings)
  display: {
    small: `${fontSizes['5xl']} ${fontWeights.bold} ${lineHeights.tight}`,
    medium: `${fontSizes['6xl']} ${fontWeights.bold} ${lineHeights.tight}`,
    large: `${fontSizes['7xl']} ${fontWeights.bold} ${lineHeights.tight}`,
  },
  
  // Labels
  label: {
    small: `${fontSizes.xs} ${fontWeights.medium} ${lineHeights.normal}`,
    regular: `${fontSizes.sm} ${fontWeights.medium} ${lineHeights.normal}`,
    large: `${fontSizes.base} ${fontWeights.medium} ${lineHeights.normal}`,
  },
  
  // Code
  code: {
    small: `${fontSizes.xs} ${fontWeights.normal} ${lineHeights.normal} font-mono`,
    regular: `${fontSizes.sm} ${fontWeights.normal} ${lineHeights.normal} font-mono`,
    large: `${fontSizes.base} ${fontWeights.normal} ${lineHeights.normal} font-mono`,
  },
};

// Typography utility functions
export const typography = {
  fontFamilies,
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacing,
  textStyles,
};
