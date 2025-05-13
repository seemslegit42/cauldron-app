# Storybook

This directory contains the Storybook configuration for the application.

## Getting Started

To run Storybook:

```bash
npm run storybook
```

This will start Storybook on port 6006. You can access it at http://localhost:6006.

## Directory Structure

- `main.js`: Main Storybook configuration
- `preview.js`: Preview configuration
- `preview-head.html`: HTML to include in the preview iframe head
- `manager.js`: Manager configuration
- `theme.js`: Storybook theme configuration

## Writing Stories

Stories should be placed alongside the components they document. For example, if you have a component at `src/shared/components/ui/Button.tsx`, the stories should be at `src/shared/components/ui/Button.stories.tsx`.

### Example Story

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
    },
    isLoading: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    fullWidth: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Button',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Button',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Button',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Button',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Button',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
    children: 'Button',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Button',
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
    children: 'Button',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Button',
  },
};

export const FullWidth: Story = {
  args: {
    fullWidth: true,
    children: 'Button',
  },
};
```
