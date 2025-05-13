/**
 * Module-specific colors for consistent branding across the application
 */

export type ModuleColorScheme = {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  border: string;
  glow: string;
  gradientFrom: string;
  gradientTo: string;
  glassBg: string;
  icon: string;
};

export type ModuleId = 'arcana' | 'phantom' | 'athena' | 'forgeflow' | 'obelisk' | 'manifold' | 'sentinel';

/**
 * Module color schemes
 * 
 * Each module has a unique color scheme that follows the alchemical/cyberpunk aesthetic
 * while maintaining a consistent look and feel across the application.
 */
export const moduleColors: Record<ModuleId, ModuleColorScheme> = {
  // Arcana - Command Center - Purple/Violet theme
  arcana: {
    primary: 'text-arcana-purple-500',
    secondary: 'text-arcana-purple-300',
    accent: 'text-arcana-purple-400',
    text: 'text-white',
    border: 'border-arcana-purple-500',
    glow: 'shadow-glow-purple',
    gradientFrom: 'from-gray-900',
    gradientTo: 'to-purple-900',
    glassBg: 'bg-purple-900/20',
    icon: 'text-arcana-purple-400',
  },
  
  // Phantom - Cybersecurity - Red/Crimson theme
  phantom: {
    primary: 'text-red-500',
    secondary: 'text-red-300',
    accent: 'text-red-400',
    text: 'text-white',
    border: 'border-red-500',
    glow: 'shadow-[0_0_15px_rgba(239,68,68,0.5)]',
    gradientFrom: 'from-gray-900',
    gradientTo: 'to-red-900',
    glassBg: 'bg-red-900/20',
    icon: 'text-red-400',
  },
  
  // Athena - Business Intelligence - Blue theme
  athena: {
    primary: 'text-arcana-blue-500',
    secondary: 'text-arcana-blue-300',
    accent: 'text-arcana-blue-400',
    text: 'text-white',
    border: 'border-arcana-blue-500',
    glow: 'shadow-glow-blue',
    gradientFrom: 'from-gray-900',
    gradientTo: 'to-blue-900',
    glassBg: 'bg-blue-900/20',
    icon: 'text-arcana-blue-400',
  },
  
  // Forgeflow - Workflow Automation - Amber/Gold theme
  forgeflow: {
    primary: 'text-yellow-500',
    secondary: 'text-yellow-300',
    accent: 'text-yellow-400',
    text: 'text-white',
    border: 'border-yellow-500',
    glow: 'shadow-[0_0_15px_rgba(234,179,8,0.5)]',
    gradientFrom: 'from-gray-900',
    gradientTo: 'to-yellow-900',
    glassBg: 'bg-yellow-900/20',
    icon: 'text-yellow-400',
  },
  
  // Obelisk - OSINT Engine - Green theme
  obelisk: {
    primary: 'text-arcana-green-500',
    secondary: 'text-arcana-green-300',
    accent: 'text-arcana-green-400',
    text: 'text-white',
    border: 'border-arcana-green-500',
    glow: 'shadow-glow-green',
    gradientFrom: 'from-gray-900',
    gradientTo: 'to-green-900',
    glassBg: 'bg-green-900/20',
    icon: 'text-arcana-green-400',
  },
  
  // Manifold - Revenue Intelligence - Pink theme
  manifold: {
    primary: 'text-arcana-pink-500',
    secondary: 'text-arcana-pink-300',
    accent: 'text-arcana-pink-400',
    text: 'text-white',
    border: 'border-arcana-pink-500',
    glow: 'shadow-glow-pink',
    gradientFrom: 'from-gray-900',
    gradientTo: 'to-pink-900',
    glassBg: 'bg-pink-900/20',
    icon: 'text-arcana-pink-400',
  },
  
  // Sentinel - Security Monitoring - Teal theme
  sentinel: {
    primary: 'text-teal-500',
    secondary: 'text-teal-300',
    accent: 'text-teal-400',
    text: 'text-white',
    border: 'border-teal-500',
    glow: 'shadow-[0_0_15px_rgba(20,184,166,0.5)]',
    gradientFrom: 'from-gray-900',
    gradientTo: 'to-teal-900',
    glassBg: 'bg-teal-900/20',
    icon: 'text-teal-400',
  },
};

/**
 * Get module color scheme
 * 
 * @param moduleId - Module ID
 * @returns Module color scheme
 */
export function getModuleColors(moduleId: ModuleId): ModuleColorScheme {
  return moduleColors[moduleId] || moduleColors.arcana;
}
