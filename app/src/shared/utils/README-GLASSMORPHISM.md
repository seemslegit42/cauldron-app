# Glassmorphism Utility

This utility provides functions and components for adding glassmorphism effects to UI elements.

## What is Glassmorphism?

Glassmorphism is a design trend that creates a frosted glass effect for UI elements. It typically includes:

- Semi-transparent backgrounds
- Blur effects
- Subtle borders
- Light shadows

This creates a sense of depth and layering in the UI, making elements appear to float above the background.

## When to Use Glassmorphism

Glassmorphism works best for:

- Cards that display over backgrounds or images
- Modals and popups
- Navigation elements like sidebars and dropdowns
- Dashboard widgets and panels
- Hero sections with content over images or gradients

Avoid using glassmorphism for:
- Dense content areas (tables, forms, code blocks)
- Main content backgrounds
- Too many elements at once (limit to 1-2 glass elements per view)

## Usage

### Basic Usage

```tsx
import { getGlassmorphismClasses } from '@src/shared/utils/glassmorphism';

// In a component
<div className={getGlassmorphismClasses({ level: 'medium', border: true, shadow: true })}>
  Glassmorphism content
</div>
```

### Using Pre-built Components

```tsx
import { GlassCard, GlassPanel, GlassContainer } from '@src/shared/utils/glassmorphism';

// Glass card
<GlassCard level="medium" border shadow hover className="p-6">
  Card content
</GlassCard>

// Glass panel
<GlassPanel level="light" className="p-4">
  Panel content
</GlassPanel>

// Glass container
<GlassContainer level="heavy" className="p-8">
  Container content
</GlassContainer>
```

### Creating Custom Glassmorphism Components

```tsx
import { withGlassmorphism } from '@src/shared/utils/glassmorphism';

// Create a glassmorphism sidebar
const GlassSidebar = withGlassmorphism('aside');

// Use the component
<GlassSidebar level="medium" border={false} shadow className="p-4">
  Sidebar content
</GlassSidebar>
```

## Options

The glassmorphism utility accepts the following options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `level` | `'none' \| 'light' \| 'medium' \| 'heavy'` | `'medium'` | Level of the glassmorphism effect |
| `border` | `boolean` | `true` | Whether to add a border |
| `shadow` | `boolean` | `true` | Whether to add a shadow |
| `hover` | `boolean` | `false` | Whether to add a hover effect |
| `bgColor` | `string` | - | Custom background color (default is white with opacity) |
| `borderColor` | `string` | - | Custom border color (default is white with opacity) |
| `blurAmount` | `string` | - | Custom backdrop filter blur amount |
| `className` | `string` | - | Additional classes to apply |

## Examples

### Card with Glassmorphism

```tsx
import { GlassCard } from '@src/shared/utils/glassmorphism';

<GlassCard 
  level="medium" 
  border 
  shadow 
  hover 
  className="p-6"
>
  <h3 className="text-xl font-semibold mb-2">Card Title</h3>
  <p className="text-gray-200">Card content goes here...</p>
</GlassCard>
```

### Modal with Glassmorphism

```tsx
import { getGlassmorphismClasses } from '@src/shared/utils/glassmorphism';
import { Modal } from '@src/shared/components/ui/Modal';

<Modal
  isOpen={isOpen}
  onClose={onClose}
  className={getGlassmorphismClasses({ 
    level: 'heavy', 
    border: true, 
    shadow: true 
  })}
>
  <h2>Modal Title</h2>
  <p>Modal content goes here...</p>
</Modal>
```

### Navigation with Glassmorphism

```tsx
import { GlassPanel } from '@src/shared/utils/glassmorphism';

<GlassPanel 
  level="light" 
  border 
  shadow 
  className="fixed top-0 left-0 right-0 z-50 p-4"
>
  <nav className="flex justify-between items-center">
    <div className="logo">Logo</div>
    <ul className="flex gap-4">
      <li>Home</li>
      <li>About</li>
      <li>Contact</li>
    </ul>
  </nav>
</GlassPanel>
```

## Best Practices

1. **Use sparingly**: Limit glassmorphism to 1-2 key elements per view to maintain visual hierarchy.

2. **Ensure contrast**: Make sure text has sufficient contrast against the semi-transparent background.

3. **Consider performance**: Backdrop filters can impact performance on some devices. Test on various devices.

4. **Provide fallbacks**: Some older browsers don't support backdrop-filter. Provide graceful fallbacks.

5. **Layer appropriately**: Ensure glass elements have appropriate z-index values to maintain proper layering.

6. **Mind the background**: Glassmorphism works best over colorful or gradient backgrounds, not flat colors.

7. **Accessibility**: Ensure that glassmorphism doesn't reduce readability or usability for users with visual impairments.
