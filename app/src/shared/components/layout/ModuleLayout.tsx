import React from 'react';
import { cn } from '../../utils/cn';
import { ModuleId } from '../../theme/moduleColors';
import { CyberpunkBackground } from '../branding/CyberpunkBackground';
import { PatternType } from '../effects/BackgroundPattern';
import { getGlassmorphismClasses } from '../../utils/glassmorphism';

export interface ModuleLayoutProps {
  /** Module ID for consistent styling */
  moduleId: ModuleId;
  /** Module title */
  title: string;
  /** Module description */
  description?: string;
  /** Main content */
  children: React.ReactNode;
  /** Header content */
  header?: React.ReactNode;
  /** Sidebar content */
  sidebar?: React.ReactNode;
  /** Footer content */
  footer?: React.ReactNode;
  /** Background pattern type */
  pattern?: PatternType;
  /** Pattern opacity */
  patternOpacity?: number;
  /** Glow intensity */
  glowIntensity?: 'low' | 'medium' | 'high';
  /** Glow positions */
  glowPositions?: ('top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center')[];
  /** Whether to animate background elements */
  animate?: boolean;
  /** Additional class name */
  className?: string;
}

/**
 * Module Layout Component
 * 
 * A consistent layout for all modules with cyberpunk styling.
 * 
 * @example
 * ```tsx
 * <ModuleLayout
 *   moduleId="arcana"
 *   title="Arcana"
 *   description="Command Center Dashboard"
 *   header={<Header />}
 *   sidebar={<Sidebar />}
 * >
 *   <MainContent />
 * </ModuleLayout>
 * ```
 */
export const ModuleLayout: React.FC<ModuleLayoutProps> = ({
  moduleId,
  title,
  description,
  children,
  header,
  sidebar,
  footer,
  pattern = 'grid',
  patternOpacity = 0.1,
  glowIntensity = 'medium',
  glowPositions = ['top-right', 'bottom-left'],
  animate = true,
  className,
}) => {
  // Calculate sidebar width for main content margin
  const sidebarWidth = sidebar ? 'ml-64' : '';
  
  // Calculate header height for main content padding
  const headerHeight = header ? 'pt-20' : 'pt-6';
  
  // Calculate footer height for main content padding
  const footerHeight = footer ? 'pb-20' : 'pb-6';
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <CyberpunkBackground
        moduleId={moduleId}
        pattern={pattern}
        patternOpacity={patternOpacity}
        glowIntensity={glowIntensity}
        glowPositions={glowPositions}
        animate={animate}
        className="min-h-screen"
      >
        {/* Header */}
        {header && (
          <header
            className={cn(
              'fixed top-0 left-0 right-0 z-10 p-4',
              getGlassmorphismClasses({
                level: 'medium',
                border: true,
                shadow: true,
                className: 'border-t-0 border-x-0'
              })
            )}
          >
            {header}
          </header>
        )}
        
        {/* Sidebar */}
        {sidebar && (
          <aside
            className={cn(
              'fixed top-0 bottom-0 left-0 z-20 w-64 transition-all duration-300',
              header ? 'mt-16' : '',
              footer ? 'mb-16' : '',
              getGlassmorphismClasses({
                level: 'heavy',
                border: true,
                shadow: true,
                className: 'border-l-0 border-y-0'
              })
            )}
          >
            {sidebar}
          </aside>
        )}
        
        {/* Main Content */}
        <main
          className={cn(
            'min-h-screen transition-all duration-300 p-6',
            headerHeight,
            footerHeight,
            sidebarWidth,
            className
          )}
        >
          {children}
        </main>
        
        {/* Footer */}
        {footer && (
          <footer
            className={cn(
              'fixed bottom-0 left-0 right-0 z-10 p-4',
              getGlassmorphismClasses({
                level: 'medium',
                border: true,
                shadow: true,
                className: 'border-b-0 border-x-0'
              })
            )}
          >
            {footer}
          </footer>
        )}
      </CyberpunkBackground>
    </div>
  );
};

export default ModuleLayout;
