import React from 'react';
import { cn } from '@src/shared/utils/cn';
import { CauldronLayout } from '@src/shared/components/layout/CauldronLayout';
import { ModuleHeader } from '@src/shared/components/branding/ModuleHeader';
import { useModuleTheme } from '@src/shared/hooks/useModuleTheme';
import { RiskLevelIndicator } from '@src/shared/components/security/RiskLevelIndicator';
import { ShieldAlert } from 'lucide-react';

export interface SentinelLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical' | 'unknown';
  className?: string;
  showHeader?: boolean;
}

/**
 * SentinelLayout - Layout component for the Sentinel security monitoring module
 * 
 * Features:
 * - Header with title, description, and actions
 * - Risk level indicator
 * - Cyberpunk background with circuit pattern
 * - Content area for module-specific components
 */
export const SentinelLayout: React.FC<SentinelLayoutProps> = ({
  children,
  title,
  description,
  actions,
  riskLevel = 'unknown',
  className,
  showHeader = true,
}) => {
  const { colors, classes } = useModuleTheme('sentinel');
  
  return (
    <CauldronLayout activeModule="sentinel" backgroundPattern="circuit">
      <div className="space-y-6">
        {/* Header */}
        {showHeader && (
          <ModuleHeader
            moduleId="sentinel"
            title={title}
            description={description}
            icon={<ShieldAlert />}
            actions={
              <div className="flex items-center space-x-3">
                <RiskLevelIndicator level={riskLevel} showLabel showDetails />
                {actions}
              </div>
            }
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

export default SentinelLayout;
