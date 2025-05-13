import React from 'react';
import { cn } from '@src/shared/utils/cn';
import { CauldronLayout } from '@src/shared/components/layout/CauldronLayout';
import { ModuleHeader } from '@src/shared/components/branding/ModuleHeader';
import { useModuleTheme } from '@src/shared/hooks/useModuleTheme';
import { Workflow } from 'lucide-react';

export interface ForgeflowLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  showHeader?: boolean;
}

/**
 * ForgeflowLayout - Layout component for the Forgeflow visual agent builder module
 * 
 * Features:
 * - Header with title, description, and actions
 * - Cyberpunk background with hex pattern
 * - Content area for module-specific components
 */
export const ForgeflowLayout: React.FC<ForgeflowLayoutProps> = ({
  children,
  title,
  description,
  actions,
  className,
  showHeader = true,
}) => {
  const { colors, classes } = useModuleTheme('forgeflow');
  
  return (
    <CauldronLayout activeModule="forgeflow" backgroundPattern="hex">
      <div className="space-y-6">
        {/* Header */}
        {showHeader && (
          <ModuleHeader
            moduleId="forgeflow"
            title={title}
            description={description}
            icon={<Workflow />}
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

export default ForgeflowLayout;
