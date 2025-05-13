# Cauldron™ DOP Design System

## 1. Core Design Philosophy

The Cauldron™ DOP interface follows a "Corporate Cyberpunk" aesthetic that blends high-tech, neon-accented visuals with the precision of a command center. The design is:

- **Intelligent**: Surfaces critical information with minimal cognitive load
- **Responsive**: Adapts to user context and provides immediate feedback
- **Secure**: Visually communicates security status without being intrusive
- **Immersive**: Creates a sense of operating a powerful, sentient platform

## 2. Color Palette - "Digital Weave"

### Primary Colors
- `--primary-green: #7ED321` - Core identifier, energy, highlights
- `--secondary-dark-base: #121212` - Primary background, foundation
- `--secondary-blue: #00BFFF` - Tech accents, Command & Cauldron primary
- `--accent-pink: #FF1D58` - High-impact CTAs, critical alerts

### Semantic Colors
- `--success: #22c55e` - Success states, positive metrics
- `--warning: #f59e0b` - Warning states, attention required
- `--danger: #ef4444` - Error states, critical issues
- `--info: #3b82f6` - Information, neutral notifications

### Gradients
- **Command Gradient**: `linear-gradient(135deg, var(--secondary-blue) 0%, #4338ca 100%)`
- **Alert Gradient**: `linear-gradient(135deg, var(--accent-pink) 0%, #9333ea 100%)`
- **Success Gradient**: `linear-gradient(135deg, var(--primary-green) 0%, #059669 100%)`
- **Background Gradient**: `linear-gradient(to bottom right, #0f172a, #1e1b4b, #18181b)`

## 3. Typography

### Font Families
- **Primary**: JetBrains Mono (monospace) - For code, technical data, metrics
- **Secondary**: Inter (sans-serif) - For general UI text
- **Display**: Playfair Display - For headings and important text

### Font Sizes
- **Display**: 3rem, 2.5rem, 2rem
- **Heading**: 1.75rem, 1.5rem, 1.25rem, 1.125rem
- **Body**: 1rem, 0.875rem, 0.75rem

### Font Weights
- **Light**: 300
- **Regular**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

## 4. Glassmorphism

Glassmorphism is used selectively to create depth and focus. It should be applied to:

### Usage Guidelines
- **Cards**: User profiles, stats, product previews
- **Modals/Popups**: When shown over a background blur
- **Navigation Overlays**: Sidebars, dropdowns, mobile nav panels
- **Dashboards**: Panels, widgets, summary boxes
- **Hero Sections**: Content floating over an image or video

### Glass Levels
- **Light**: `bg-opacity-10 backdrop-blur-sm`
- **Medium**: `bg-opacity-20 backdrop-blur-md`
- **Heavy**: `bg-opacity-30 backdrop-blur-lg`

## 5. Components

### Core Components
- **GlassPanel**: Container with glassmorphism effect
- **GlassCard**: Card with glassmorphism effect
- **GlassHero**: Hero section with glassmorphism effect
- **Button**: Primary, secondary, outline, ghost variants
- **Badge**: Status indicators
- **Alert**: Success, warning, error, info variants
- **Modal**: Dialog with glassmorphism effect
- **Tooltip**: Contextual information
- **Progress**: Linear and radial progress indicators

### Specialized Components
- **SentientLoopPhase**: Visual representation of the current phase
- **AgentAvatar**: Visual representation of an AI agent
- **RiskMeter**: Visual indicator of security risk level
- **CommandPalette**: Global search and command interface
- **DecisionCard**: Card for presenting AI-generated decisions
- **InsightPanel**: Panel for displaying AI-generated insights
- **WorkflowGraph**: Visual representation of a workflow

## 6. Animations

### Transitions
- **Page Transitions**: Fade in/out, slide in/out
- **Component Transitions**: Scale, fade, slide
- **Loading States**: Pulse, spin, progress

### Interaction Feedback
- **Hover**: Scale, glow, color change
- **Active**: Scale down, color change
- **Focus**: Ring, glow

### Special Effects
- **Pulse**: For alerts and notifications
- **Glow**: For important elements and actions
- **Ripple**: For button clicks and interactions
- **Particles**: For background effects and transitions

## 7. Layout System

### Grid System
- **12-column grid**: For desktop layouts
- **6-column grid**: For tablet layouts
- **4-column grid**: For mobile layouts

### Spacing Scale
- **4px base**: 4px, 8px, 16px, 24px, 32px, 48px, 64px, 96px, 128px

### Breakpoints
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

## 8. Icons and Imagery

### Icon System
- **Phosphor Icons**: Primary icon set
- **Custom Glyphs**: For specialized functions and modules

### Imagery Guidelines
- **Abstract**: For backgrounds and decorative elements
- **Functional**: For illustrations and explanatory graphics
- **Data Visualization**: For charts, graphs, and dashboards

## 9. Motion Design

### Principles
- **Purposeful**: Motion should have meaning and purpose
- **Fluid**: Transitions should be smooth and natural
- **Responsive**: Motion should provide feedback to user actions

### Timing
- **Fast**: 150ms - For micro-interactions
- **Medium**: 300ms - For standard transitions
- **Slow**: 500ms - For emphasis and dramatic effect

## 10. Accessibility

### Color Contrast
- Minimum contrast ratio of 4.5:1 for normal text
- Minimum contrast ratio of 3:1 for large text

### Focus States
- Visible focus indicators for keyboard navigation
- Focus ring with high contrast

### Screen Reader Support
- Semantic HTML
- ARIA labels and roles
- Keyboard navigation
