# Cauldron Cyberpunk Style Guide

## Introduction

This style guide defines the alchemical/cyberpunk visual language for the Cauldron application. It ensures consistency across all modules while maintaining a distinctive, futuristic aesthetic that reinforces the brand identity.

## Core Principles

1. **Dark Mode First**: Design for dark backgrounds with high-contrast elements.
2. **Neon Accents**: Use module-specific neon colors to highlight important elements.
3. **Glassmorphism**: Apply glass-like effects for cards, panels, and overlays.
4. **Ambient Glows**: Incorporate subtle glows to create depth and atmosphere.
5. **Circuit Patterns**: Use circuit-like patterns as background elements.
6. **Holographic Elements**: Implement holographic displays for important data.
7. **Animated Elements**: Add subtle animations to create a living, dynamic interface.

## Color Palette

### Base Colors

- **Background**: `bg-gray-900` (Primary), `bg-gray-800` (Secondary)
- **Text**: `text-white` (Primary), `text-gray-300` (Secondary), `text-gray-400` (Tertiary)
- **Borders**: `border-gray-700` (Primary), `border-white/10` (Secondary)

### Module-Specific Colors

Each module has its own color scheme to create visual distinction:

- **Arcana**: Purple (`#8b5cf6`) - Command center, central intelligence
- **Phantom**: Red (`#ef4444`) - Security, threat detection
- **Athena**: Blue (`#3b82f6`) - Business intelligence, analytics
- **Forgeflow**: Yellow (`#eab308`) - Workflow automation, agent orchestration
- **Sentinel**: Teal (`#14b8a6`) - Security monitoring, compliance
- **Manifold**: Pink (`#ec4899`) - Revenue intelligence, growth
- **Obelisk**: Green (`#10b981`) - OSINT, data collection

## Typography

- **Headings**: Inter, font-bold
- **Body**: Inter, font-normal
- **Monospace**: JetBrains Mono (for code, terminal outputs)
- **Size Scale**:
  - Heading 1: `text-2xl`
  - Heading 2: `text-xl`
  - Heading 3: `text-lg`
  - Body: `text-base`
  - Small: `text-sm`
  - Extra Small: `text-xs`

## Components

### ModuleLayout

The `ModuleLayout` component provides a consistent layout for all modules with:

- Cyberpunk background with module-specific colors
- Ambient glows in strategic positions
- Background patterns
- Consistent header, sidebar, and content areas

```tsx
<ModuleLayout
  moduleId="arcana"
  title="Arcana"
  header={header}
  sidebar={sidebar}
  pattern="grid"
  patternOpacity={0.1}
  glowIntensity="medium"
  glowPositions={['top-right', 'bottom-left']}
  animate={true}
>
  {children}
</ModuleLayout>
```

### ModuleHeader

The `ModuleHeader` component provides a consistent header for all modules with:

- Module icon
- Title and description
- Action buttons
- Glassmorphism effect

```tsx
<ModuleHeader
  moduleId="arcana"
  title="Arcana Dashboard"
  description="Command center for your digital operations"
  icon={<DashboardIcon />}
  actions={<Button>Action</Button>}
/>
```

### ModuleCard

The `ModuleCard` component provides a consistent card for all modules with:

- Glassmorphism effect
- Module-specific border color
- Optional header with icon, title, and actions
- Optional footer

```tsx
<ModuleCard
  moduleId="arcana"
  title="Card Title"
  icon={<Icon />}
  actions={<Button>Action</Button>}
  footer={<Footer />}
  glassLevel="medium"
  border={true}
  shadow={true}
  glow={true}
>
  Card content
</ModuleCard>
```

### ModuleNavigation

The `ModuleNavigation` component provides a consistent navigation for all modules with:

- Vertical or horizontal orientation
- Icons and labels
- Active state with module-specific color

```tsx
<ModuleNavigation
  moduleId="arcana"
  items={[
    { label: 'Dashboard', path: '/arcana', icon: <DashboardIcon /> },
    { label: 'Settings', path: '/arcana/settings', icon: <SettingsIcon /> },
  ]}
  vertical={true}
/>
```

## Visual Effects

### Glassmorphism

Use the `getGlassmorphismClasses` utility to apply glassmorphism effects:

```tsx
import { getGlassmorphismClasses } from '@src/shared/utils/glassmorphism';

<div
  className={getGlassmorphismClasses({
    level: 'medium',
    border: true,
    shadow: true,
    hover: true,
    borderColor: 'purple-500',
  })}
>
  Content
</div>
```

Glassmorphism levels:
- **Light**: Subtle transparency, minimal blur
- **Medium**: Moderate transparency, visible blur
- **Heavy**: High transparency, significant blur

### Ambient Glows

Use the `AmbientGlow` component to add glows to your interface:

```tsx
<AmbientGlow
  position="top-right"
  colors={['purple', 'indigo']}
  size="md"
  animate={true}
/>
```

### Background Patterns

Use the `BackgroundPattern` component to add patterns to your backgrounds:

```tsx
<BackgroundPattern
  pattern="grid"
  opacity={0.1}
/>
```

Pattern types:
- **Grid**: Cyberpunk grid pattern
- **Dots**: Matrix-like dot pattern
- **Circuit**: Circuit board pattern
- **Hex**: Hexagonal pattern

### Animated Elements

Use the following components for animated elements:

- `PulsatingGlow`: Pulsating glow effect for status indicators
- `AnimatedCircuitPattern`: Animated circuit pattern for backgrounds
- `DataFlowVisualization`: Animated data flow visualization
- `SecurityScanVisualization`: Animated security scan visualization
- `HolographicDisplay`: Holographic display for important data

## Usage Guidelines

### When to Use Glassmorphism

Use glassmorphism for:
- Cards containing important information
- Modal dialogs and popups
- Navigation elements
- Header and footer bars

Avoid overusing glassmorphism as it can reduce readability. Use it strategically to highlight important elements.

### When to Use Ambient Glows

Use ambient glows for:
- Creating depth and atmosphere
- Highlighting important areas
- Reinforcing module identity through color

Limit to 2-3 glows per page to avoid visual clutter.

### When to Use Animated Elements

Use animated elements for:
- Visualizing data and processes
- Indicating status or progress
- Creating visual interest

Animations should be subtle and purposeful, not distracting.

## Implementation Examples

### Module Dashboard

```tsx
<ModuleLayout moduleId="arcana">
  <ModuleHeader
    moduleId="arcana"
    title="Arcana Dashboard"
    description="Command center for your digital operations"
  />
  
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <ModuleCard
      moduleId="arcana"
      title="Status"
      icon={<StatusIcon />}
    >
      Status content
    </ModuleCard>
    
    <ModuleCard
      moduleId="arcana"
      title="Metrics"
      icon={<MetricsIcon />}
    >
      Metrics content
    </ModuleCard>
    
    <ModuleCard
      moduleId="arcana"
      title="Actions"
      icon={<ActionsIcon />}
    >
      Actions content
    </ModuleCard>
  </div>
</ModuleLayout>
```

## Accessibility Considerations

- Ensure sufficient contrast between text and backgrounds
- Provide alternative text for icons and visual elements
- Allow users to disable animations if needed
- Test with screen readers and keyboard navigation

## Conclusion

This style guide provides a foundation for creating a consistent, visually compelling alchemical/cyberpunk interface across all Cauldron modules. By following these guidelines, we ensure a cohesive user experience that reinforces the brand identity while maintaining usability and accessibility.
