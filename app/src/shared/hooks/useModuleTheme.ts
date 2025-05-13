import { useMemo } from 'react';
import { getModuleColors, ModuleId, ModuleColorScheme } from '../theme/moduleColors';

export type ModuleTheme = {
  colors: ModuleColorScheme;
  classes: {
    header: string;
    card: string;
    button: {
      primary: string;
      secondary: string;
      outline: string;
    };
    badge: {
      primary: string;
      secondary: string;
    };
    panel: string;
    gradient: string;
    glassmorphism: string;
  };
};

/**
 * Hook to get module-specific theme
 * 
 * @param moduleId - Module ID
 * @returns Module theme
 * 
 * @example
 * ```tsx
 * const { colors, classes } = useModuleTheme('arcana');
 * 
 * return (
 *   <div className={classes.card}>
 *     <h2 className={colors.primary}>Card Title</h2>
 *     <button className={classes.button.primary}>Click Me</button>
 *   </div>
 * );
 * ```
 */
export function useModuleTheme(moduleId: ModuleId): ModuleTheme {
  return useMemo(() => {
    const colors = getModuleColors(moduleId);
    
    return {
      colors,
      classes: {
        header: `bg-gradient-to-r ${colors.gradientFrom} ${colors.gradientTo} border-b border-gray-800`,
        card: `bg-gray-800 border ${colors.border} rounded-lg shadow-lg hover:${colors.glow} transition-shadow duration-300`,
        button: {
          primary: `bg-gradient-to-r ${colors.gradientFrom} ${colors.gradientTo} text-white rounded-md px-4 py-2 font-medium hover:opacity-90 transition-opacity`,
          secondary: `bg-gray-800 ${colors.text} ${colors.border} border rounded-md px-4 py-2 font-medium hover:bg-gray-700 transition-colors`,
          outline: `bg-transparent ${colors.text} ${colors.border} border rounded-md px-4 py-2 font-medium hover:bg-gray-800 transition-colors`,
        },
        badge: {
          primary: `${colors.primary} bg-opacity-20 border ${colors.border} px-2 py-1 rounded-full text-xs font-medium`,
          secondary: `${colors.secondary} bg-opacity-10 border ${colors.border} border-opacity-50 px-2 py-1 rounded-full text-xs font-medium`,
        },
        panel: `bg-gray-800 border ${colors.border} rounded-lg p-4 shadow-lg`,
        gradient: `bg-gradient-to-r ${colors.gradientFrom} ${colors.gradientTo}`,
        glassmorphism: `backdrop-filter backdrop-blur-md ${colors.glassBg} border ${colors.border} border-opacity-30 rounded-lg shadow-lg`,
      },
    };
  }, [moduleId]);
}
