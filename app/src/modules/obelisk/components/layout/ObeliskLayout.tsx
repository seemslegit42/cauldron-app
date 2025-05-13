import React from 'react';
import { cn } from '@src/shared/utils/cn';
import { CauldronLayout } from '@src/shared/components/layout/CauldronLayout';
import { ModuleHeader } from '@src/shared/components/branding/ModuleHeader';
import { useModuleTheme } from '@src/shared/hooks/useModuleTheme';
import { Globe, Search } from 'lucide-react';

export interface ObeliskLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  showHeader?: boolean;
}

/**
 * ObeliskLayout - Layout component for the Obelisk OSINT engine module
 * 
 * Features:
 * - Header with title, description, and actions
 * - Cyberpunk background with grid pattern
 * - Content area for module-specific components
 */
export const ObeliskLayout: React.FC<ObeliskLayoutProps> = ({
  children,
  title,
  description,
  actions,
  className,
  showHeader = true,
}) => {
  const { colors, classes } = useModuleTheme('obelisk');
  
  return (
    <CauldronLayout activeModule="obelisk" backgroundPattern="grid">
      <div className="space-y-6">
        {/* Header */}
        {showHeader && (
          <ModuleHeader
            moduleId="obelisk"
            title={title}
            description={description}
            icon={<Globe />}
            actions={actions}
          />
        )}

        {/* Content */}
        <div className={cn("space-y-6", className)}>
          {children}
        </div>
      </div>
    </CauldronLayout>
  );
};

export default ObeliskLayout;
