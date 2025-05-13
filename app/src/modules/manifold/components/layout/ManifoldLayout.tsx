import React from 'react';
import { cn } from '@src/shared/utils/cn';
import { CauldronLayout } from '@src/shared/components/layout/CauldronLayout';
import { ModuleHeader } from '@src/shared/components/branding/ModuleHeader';
import { useModuleTheme } from '@src/shared/hooks/useModuleTheme';
import { LineChart, TrendingUp } from 'lucide-react';

export interface ManifoldLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  showHeader?: boolean;
}

/**
 * ManifoldLayout - Layout component for the Manifold revenue intelligence module
 * 
 * Features:
 * - Header with title, description, and actions
 * - Cyberpunk background with dots pattern
 * - Content area for module-specific components
 */
export const ManifoldLayout: React.FC<ManifoldLayoutProps> = ({
  children,
  title,
  description,
  actions,
  className,
  showHeader = true,
}) => {
  const { colors, classes } = useModuleTheme('manifold');
  
  return (
    <CauldronLayout activeModule="manifold" backgroundPattern="dots">
      <div className="space-y-6">
        {/* Header */}
        {showHeader && (
          <ModuleHeader
            moduleId="manifold"
            title={title}
            description={description}
            icon={<TrendingUp />}
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

export default ManifoldLayout;
