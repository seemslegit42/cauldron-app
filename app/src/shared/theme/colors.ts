/**
 * Color palette for the application
 */

// Base colors with shades
export const colors = {
  // Primary brand color
  primary: {
    50: 'primary-50',
    100: 'primary-100',
    200: 'primary-200',
    300: 'primary-300',
    400: 'primary-400',
    500: 'primary-500', // Base primary color
    600: 'primary-600',
    700: 'primary-700',
    800: 'primary-800',
    900: 'primary-900',
    950: 'primary-950',
  },
  
  // Secondary brand color
  secondary: {
    50: 'secondary-50',
    100: 'secondary-100',
    200: 'secondary-200',
    300: 'secondary-300',
    400: 'secondary-400',
    500: 'secondary-500', // Base secondary color
    600: 'secondary-600',
    700: 'secondary-700',
    800: 'secondary-800',
    900: 'secondary-900',
    950: 'secondary-950',
  },
  
  // Neutral colors (grays)
  neutral: {
    50: 'gray-50',
    100: 'gray-100',
    200: 'gray-200',
    300: 'gray-300',
    400: 'gray-400',
    500: 'gray-500',
    600: 'gray-600',
    700: 'gray-700',
    800: 'gray-800',
    900: 'gray-900',
    950: 'gray-950',
  },
  
  // Semantic colors
  success: {
    50: 'green-50',
    100: 'green-100',
    200: 'green-200',
    300: 'green-300',
    400: 'green-400',
    500: 'green-500',
    600: 'green-600',
    700: 'green-700',
    800: 'green-800',
    900: 'green-900',
    950: 'green-950',
  },
  
  warning: {
    50: 'yellow-50',
    100: 'yellow-100',
    200: 'yellow-200',
    300: 'yellow-300',
    400: 'yellow-400',
    500: 'yellow-500',
    600: 'yellow-600',
    700: 'yellow-700',
    800: 'yellow-800',
    900: 'yellow-900',
    950: 'yellow-950',
  },
  
  error: {
    50: 'red-50',
    100: 'red-100',
    200: 'red-200',
    300: 'red-300',
    400: 'red-400',
    500: 'red-500',
    600: 'red-600',
    700: 'red-700',
    800: 'red-800',
    900: 'red-900',
    950: 'red-950',
  },
  
  info: {
    50: 'blue-50',
    100: 'blue-100',
    200: 'blue-200',
    300: 'blue-300',
    400: 'blue-400',
    500: 'blue-500',
    600: 'blue-600',
    700: 'blue-700',
    800: 'blue-800',
    900: 'blue-900',
    950: 'blue-950',
  },
};

// Semantic color aliases
export const semanticColors = {
  // Text colors
  text: {
    primary: colors.neutral[900],
    secondary: colors.neutral[700],
    tertiary: colors.neutral[500],
    disabled: colors.neutral[400],
    inverse: colors.neutral[50],
    link: colors.primary[600],
    success: colors.success[700],
    warning: colors.warning[700],
    error: colors.error[700],
    info: colors.info[700],
  },
  
  // Background colors
  background: {
    primary: colors.neutral[50],
    secondary: colors.neutral[100],
    tertiary: colors.neutral[200],
    inverse: colors.neutral[900],
    success: colors.success[50],
    warning: colors.warning[50],
    error: colors.error[50],
    info: colors.info[50],
  },
  
  // Border colors
  border: {
    primary: colors.neutral[200],
    secondary: colors.neutral[300],
    tertiary: colors.neutral[400],
    focus: colors.primary[500],
    success: colors.success[300],
    warning: colors.warning[300],
    error: colors.error[300],
    info: colors.info[300],
  },
  
  // Button colors
  button: {
    primary: {
      background: colors.primary[500],
      hover: colors.primary[600],
      active: colors.primary[700],
      text: colors.neutral[50],
    },
    secondary: {
      background: colors.secondary[500],
      hover: colors.secondary[600],
      active: colors.secondary[700],
      text: colors.neutral[50],
    },
    tertiary: {
      background: 'transparent',
      hover: colors.neutral[100],
      active: colors.neutral[200],
      text: colors.primary[500],
    },
    danger: {
      background: colors.error[500],
      hover: colors.error[600],
      active: colors.error[700],
      text: colors.neutral[50],
    },
  },
};

// Dark mode semantic colors
export const darkSemanticColors = {
  // Text colors
  text: {
    primary: colors.neutral[50],
    secondary: colors.neutral[300],
    tertiary: colors.neutral[400],
    disabled: colors.neutral[600],
    inverse: colors.neutral[900],
    link: colors.primary[400],
    success: colors.success[400],
    warning: colors.warning[400],
    error: colors.error[400],
    info: colors.info[400],
  },
  
  // Background colors
  background: {
    primary: colors.neutral[900],
    secondary: colors.neutral[800],
    tertiary: colors.neutral[700],
    inverse: colors.neutral[50],
    success: colors.success[900],
    warning: colors.warning[900],
    error: colors.error[900],
    info: colors.info[900],
  },
  
  // Border colors
  border: {
    primary: colors.neutral[700],
    secondary: colors.neutral[600],
    tertiary: colors.neutral[500],
    focus: colors.primary[500],
    success: colors.success[700],
    warning: colors.warning[700],
    error: colors.error[700],
    info: colors.info[700],
  },
  
  // Button colors
  button: {
    primary: {
      background: colors.primary[600],
      hover: colors.primary[500],
      active: colors.primary[400],
      text: colors.neutral[50],
    },
    secondary: {
      background: colors.secondary[600],
      hover: colors.secondary[500],
      active: colors.secondary[400],
      text: colors.neutral[50],
    },
    tertiary: {
      background: 'transparent',
      hover: colors.neutral[800],
      active: colors.neutral[700],
      text: colors.primary[400],
    },
    danger: {
      background: colors.error[600],
      hover: colors.error[500],
      active: colors.error[400],
      text: colors.neutral[50],
    },
  },
};
