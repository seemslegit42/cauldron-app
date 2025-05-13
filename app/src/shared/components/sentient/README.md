# Sentient UI Components

This directory contains UI components that simulate sentient behavior, creating interfaces that feel alive and responsive to user interactions.

## Overview

The Sentient UI system creates interfaces that feel alive and responsive to user interactions. Through subtle animations, visual cues, haptic feedback, and sound effects, these components create a more engaging and emotionally connected user experience.

## Components

### SentientEntity

A base component that simulates a sentient entity with subtle animations, emotional responses, and multi-sensory feedback.

```tsx
<SentientEntity
  emotion="curious"
  intensity="moderate"
  size="md"
  variant="circle"
  enableSound={true}
  enableHaptics={true}
  breathingAnimation={true}
  pulseOnActivity={true}
  reactToHover={true}
  reactToClick={true}
  icon={<Brain size={24} />}
/>
```

### SentientInterface

A higher-level component that creates a sentient interface with multiple animated elements, emotional responses, and multi-sensory feedback.

```tsx
<SentientInterface
  state="listening"
  emotion="curious"
  intensity="moderate"
  title="Sentient Interface"
  message="I'm listening to your request..."
  enableSound={true}
  enableHaptics={true}
  breathingAnimation={true}
  pulseOnActivity={true}
  ambientParticles={true}
/>
```

### SentientDecisionPanel

A decision panel that presents options with sentient behaviors, emotional responses, and feedback collection.

```tsx
<SentientDecisionPanel
  title="Strategic Decision"
  description="Choose the best approach for the marketing campaign"
  options={[
    { id: '1', label: 'Social Media Focus', description: 'Concentrate on social platforms', isRecommended: true },
    { id: '2', label: 'Content Marketing', description: 'Create valuable content' },
    { id: '3', label: 'Traditional Advertising', description: 'Use established channels', isRisky: true }
  ]}
  onDecision={(optionId) => console.log(`Selected option: ${optionId}`)}
  enableFeedback={true}
  emotion="thinking"
  intensity="moderate"
/>
```

## Features

### Emotional Responses

Components respond emotionally to user actions and system events, creating a more human-like interaction experience.

### Multi-Sensory Feedback

Combines visual, auditory, and haptic feedback for a richer, more immersive experience.

### Ambient Intelligence

The interface subtly adapts to context, user behavior, and system state, creating an environment that feels aware and responsive.

### Breathing Animation

Subtle pulsing animations simulate breathing, making the interface feel alive and present.

### Ambient Particles

Dynamic particle effects that respond to user interactions and emotional states, creating a sense of energy and life.

## Demo

Visit the Sentient UI Demo page at `/arcana/sentient-ui-demo` to see these components in action.

## Usage Guidelines

1. **Use Sparingly**: Sentient UI elements should be used thoughtfully and sparingly. Too many animated elements can be distracting.

2. **Respect User Preferences**: Always provide options to disable animations, sounds, and haptic feedback for users who prefer a more static interface.

3. **Meaningful Emotions**: Emotional responses should be meaningful and contextually appropriate, not random or excessive.

4. **Accessibility**: Ensure that all sentient behaviors have accessible alternatives for users with disabilities.

5. **Performance**: Be mindful of performance implications, especially with particle effects and complex animations.

## Implementation Details

The sentient components use:

- Framer Motion for animations
- Web Audio API for sound effects
- Web Vibration API for haptic feedback
- React hooks for state management
- Tailwind CSS for styling
- Glassmorphism for visual effects
