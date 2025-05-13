import { create } from '@storybook/theming/create';

export default create({
  base: 'light',
  brandTitle: 'Cauldron UI',
  brandUrl: 'https://cauldron.ai',
  brandImage: '../src/shared/assets/brand/logo.svg',
  brandTarget: '_self',
  
  // UI
  appBg: '#f8fafc',
  appContentBg: '#ffffff',
  appBorderColor: '#e2e8f0',
  appBorderRadius: 4,
  
  // Typography
  fontBase: '"Inter", sans-serif',
  fontCode: 'monospace',
  
  // Text colors
  textColor: '#0f172a',
  textInverseColor: '#f8fafc',
  
  // Toolbar default and active colors
  barTextColor: '#64748b',
  barSelectedColor: '#4f46e5',
  barBg: '#ffffff',
  
  // Form colors
  inputBg: '#ffffff',
  inputBorder: '#cbd5e1',
  inputTextColor: '#0f172a',
  inputBorderRadius: 4,
  
  // Colors
  colorPrimary: '#4f46e5',
  colorSecondary: '#4f46e5',
});
