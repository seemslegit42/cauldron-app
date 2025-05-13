import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@src/shared/utils/cn';
import { CauldronLayout } from '@src/shared/components/layout/CauldronLayout';
import { ModuleHeader } from '@src/shared/components/branding/ModuleHeader';
import { CyberpunkBackground } from '@src/shared/components/branding/CyberpunkBackground';
import { GlassmorphicCard } from '@src/shared/components/branding/GlassmorphicCard';
import { useModuleTheme } from '@src/shared/hooks/useModuleTheme';
import { LayoutDashboard } from 'lucide-react';

export interface ArcanaLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  showHeader?: boolean;
}

/**
 * ArcanaLayout - Layout component for the Arcana command center module
 * 
 * Features:
 * - Header with title, description, and actions
 * - Cyberpunk background with ambient glow
 * - Content area for module-specific components
 */
export const ArcanaLayout: React.FC<ArcanaLayoutProps> = ({
  children,
  title,
  description,
  actions,
  className,
  showHeader = true,
}) => {
  const { colors, classes } = useModuleTheme('arcana');
  
  return (
    <CauldronLayout activeModule="arcana" backgroundPattern="grid">
      <div className="space-y-6">
        {/* Header */}
        {showHeader && (
          <ModuleHeader
            moduleId="arcana"
            title={title}
            description={description}
            icon={<LayoutDashboard />}
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

export default ArcanaLayout;
