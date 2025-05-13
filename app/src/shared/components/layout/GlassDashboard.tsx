import React from 'react';
import { cn } from '../../utils/cn';
import { GlassmorphismLevel, getGlassmorphismClasses } from '../../utils/glassmorphism';

export interface GlassDashboardProps {
  /** Main content */
  children: React.ReactNode;
  /** Sidebar content */
  sidebar?: React.ReactNode;
  /** Header content */
  header?: React.ReactNode;
  /** Footer content */
  footer?: React.ReactNode;
  /** Background image or gradient */
  background?: string;
  /** Whether the sidebar is on the left or right */
  sidebarPosition?: 'left' | 'right';
  /** Whether the sidebar is collapsed */
  sidebarCollapsed?: boolean;
  /** Glassmorphism level for the main content */
  mainGlassLevel?: GlassmorphismLevel;
  /** Glassmorphism level for the sidebar */
  sidebarGlassLevel?: GlassmorphismLevel;
  /** Glassmorphism level for the header */
  headerGlassLevel?: GlassmorphismLevel;
  /** Glassmorphism level for the footer */
  footerGlassLevel?: GlassmorphismLevel;
  /** Custom class name for the container */
  className?: string;
  /** Custom class name for the main content */
  mainClassName?: string;
  /** Custom class name for the sidebar */
  sidebarClassName?: string;
  /** Custom class name for the header */
  headerClassName?: string;
  /** Custom class name for the footer */
  footerClassName?: string;
}

/**
 * Glass Dashboard Layout Component
 * 
 * A dashboard layout with glassmorphism effects for the main content, sidebar, header, and footer.
 * 
 * @example
 * ```tsx
 * <GlassDashboard
 *   sidebar={<Sidebar />}
 *   header={<Header />}
 *   footer={<Footer />}
 *   background="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"
 * >
 *   <MainContent />
 * </GlassDashboard>
 * ```
 */
export const GlassDashboard: React.FC<GlassDashboardProps> = ({
  children,
  sidebar,
  header,
  footer,
  background = 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500',
  sidebarPosition = 'left',
  sidebarCollapsed = false,
  mainGlassLevel = 'medium',
  sidebarGlassLevel = 'heavy',
  headerGlassLevel = 'light',
  footerGlassLevel = 'light',
  className,
  mainClassName,
  sidebarClassName,
  headerClassName,
  footerClassName,
}) => {
  // Determine sidebar width based on collapsed state
  const sidebarWidth = sidebarCollapsed ? 'w-16' : 'w-64';
  
  // Determine main content margin based on sidebar position and presence
  const mainMargin = sidebar
    ? sidebarPosition === 'left'
      ? `ml-${sidebarCollapsed ? '16' : '64'}`
      : `mr-${sidebarCollapsed ? '16' : '64'}`
    : '';

  return (
    <div className={cn('min-h-screen', background, className)}>
      {/* Header */}
      {header && (
        <header
          className={cn(
            'fixed top-0 left-0 right-0 z-10 p-4',
            getGlassmorphismClasses({
              level: headerGlassLevel,
              border: true,
              shadow: true,
              className: 'border-t-0 border-x-0'
            }),
            headerClassName
          )}
        >
          {header}
        </header>
      )}

      {/* Sidebar */}
      {sidebar && (
        <aside
          className={cn(
            'fixed top-0 bottom-0 z-20 transition-all duration-300',
            sidebarPosition === 'left' ? 'left-0' : 'right-0',
            header ? 'mt-16' : '',
            footer ? 'mb-16' : '',
            sidebarWidth,
            getGlassmorphismClasses({
              level: sidebarGlassLevel,
              border: true,
              shadow: true,
              className: sidebarPosition === 'left' 
                ? 'border-l-0 border-y-0' 
                : 'border-r-0 border-y-0'
            }),
            sidebarClassName
          )}
        >
          {sidebar}
        </aside>
      )}

      {/* Main Content */}
      <main
        className={cn(
          'min-h-screen p-6 transition-all duration-300',
          header ? 'pt-24' : 'pt-6',
          footer ? 'pb-24' : 'pb-6',
          mainMargin,
          getGlassmorphismClasses({
            level: mainGlassLevel,
            border: true,
            shadow: true,
          }),
          mainClassName
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
              level: footerGlassLevel,
              border: true,
              shadow: true,
              className: 'border-b-0 border-x-0'
            }),
            footerClassName
          )}
        >
          {footer}
        </footer>
      )}
    </div>
  );
};

export default GlassDashboard;
