import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';
import { Button } from './Button';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    hoverable: {
      control: 'boolean',
    },
    bordered: {
      control: 'boolean',
    },
    shadowed: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Basic: Story = {
  args: {
    children: <CardContent>Basic card content</CardContent>,
    className: 'w-96',
  },
};

export const WithHeader: Story = {
  args: {
    children: (
      <>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description goes here</CardDescription>
        </CardHeader>
        <CardContent>Card content goes here</CardContent>
      </>
    ),
    className: 'w-96',
  },
};

export const WithFooter: Story = {
  args: {
    children: (
      <>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description goes here</CardDescription>
        </CardHeader>
        <CardContent>Card content goes here</CardContent>
        <CardFooter>
          <Button variant="outline" size="sm" className="mr-2">Cancel</Button>
          <Button size="sm">Submit</Button>
        </CardFooter>
      </>
    ),
    className: 'w-96',
  },
};

export const Hoverable: Story = {
  args: {
    hoverable: true,
    children: (
      <>
        <CardHeader>
          <CardTitle>Hoverable Card</CardTitle>
          <CardDescription>This card has a hover effect</CardDescription>
        </CardHeader>
        <CardContent>Hover over this card to see the effect</CardContent>
      </>
    ),
    className: 'w-96',
  },
};

export const NoBorder: Story = {
  args: {
    bordered: false,
    children: (
      <>
        <CardHeader>
          <CardTitle>No Border Card</CardTitle>
          <CardDescription>This card has no border</CardDescription>
        </CardHeader>
        <CardContent>Card content goes here</CardContent>
      </>
    ),
    className: 'w-96',
  },
};

export const NoShadow: Story = {
  args: {
    shadowed: false,
    children: (
      <>
        <CardHeader>
          <CardTitle>No Shadow Card</CardTitle>
          <CardDescription>This card has no shadow</CardDescription>
        </CardHeader>
        <CardContent>Card content goes here</CardContent>
      </>
    ),
    className: 'w-96',
  },
};
