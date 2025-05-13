# Static Assets

This directory contains static assets used throughout the application.

## Directory Structure

- `/icons`: SVG icons
- `/fonts`: Font files
- `/images`: Image files
- `/brand`: Brand assets (logos, etc.)
- `/styles`: Global styles and CSS variables

## Usage Guidelines

### Icons

Icons should be in SVG format and follow a consistent naming convention. Use the `Icon` component to render icons.

```tsx
import { Icon } from '../components/ui/Icon';

// In a component
<Icon name="check" size="md" />
```

### Fonts

Fonts should be in WOFF2 format for optimal performance. Font files should be imported in the global CSS file.

### Images

Images should be optimized for web use. Use the `Image` component to render images with proper loading and error handling.

```tsx
import { Image } from '../components/ui/Image';

// In a component
<Image src="/assets/images/hero.jpg" alt="Hero image" width={800} height={600} />
```

### Brand Assets

Brand assets should follow the brand guidelines. Use the `Logo` component to render the logo.

```tsx
import { Logo } from '../components/ui/Logo';

// In a component
<Logo variant="primary" size="md" />
```
