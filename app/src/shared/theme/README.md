# Theme System

This directory contains the theme system for the application, including color schemes, typography, spacing, and other design tokens.

## Directory Structure

- `/colors.ts`: Color palette definitions
- `/typography.ts`: Typography definitions (font families, sizes, weights, etc.)
- `/spacing.ts`: Spacing scale
- `/breakpoints.ts`: Responsive breakpoints
- `/darkMode.ts`: Dark mode utilities
- `/index.ts`: Main theme export

## Usage Guidelines

### Colors

The color system is based on a set of base colors with various shades. Each color has a semantic meaning and should be used consistently throughout the application.

```tsx
import { colors } from '../shared/theme';

// In a component
<div className={`bg-${colors.primary[500]} text-${colors.neutral[50]}`}>
  Primary background with light text
</div>
```

### Typography

The typography system defines font families, sizes, weights, and line heights. It also includes text styles for different purposes.

```tsx
import { typography } from '../shared/theme';

// In a component
<h1 className={typography.heading.h1}>Heading 1</h1>
<p className={typography.body.regular}>Body text</p>
```

### Dark Mode

The dark mode system provides utilities for implementing dark mode in the application.

```tsx
import { useDarkMode } from '../shared/theme/darkMode';

// In a component
const { isDarkMode, toggleDarkMode } = useDarkMode();

return (
  <button onClick={toggleDarkMode}>
    {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
  </button>
);
```
