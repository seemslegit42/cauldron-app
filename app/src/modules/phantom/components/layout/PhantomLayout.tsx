import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@src/shared/utils/cn';
import { ModuleLayout } from '@src/shared/components/layout/ModuleLayout';
import { Button } from '@src/shared/components/ui/Button';
import { RiskLevelIndicator } from '@src/shared/components/security/RiskLevelIndicator';
import { ThreatSeverity } from '../../types';
import { ModuleHeader } from '@src/shared/components/branding/ModuleHeader';
import { ModuleNavigation } from '@src/shared/components/branding/ModuleNavigation';
import { GlassmorphicCard } from '@src/shared/components/branding/GlassmorphicCard';
import { useModuleTheme } from '@src/shared/hooks/useModuleTheme';
import { Shield, AlertTriangle, Globe, Search, FileWarning, PlaySquare, Settings } from 'lucide-react';

export interface PhantomLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical' | 'unknown';
  className?: string;
}

/**
 * PhantomLayout - Layout component for the Phantom cybersecurity module
 *
 * Features:
 * - Header with title, description, and actions
 * - Risk level indicator
 * - Content area for module-specific components
 */
export const PhantomLayout: React.FC<PhantomLayoutProps> = ({
  children,
  title,
  description,
  actions,
  riskLevel = 'unknown',
  className,
}) => {
  // Navigation items
  const navigationItems = [
    {
      label: 'Overview',
      path: '/phantom',
      icon: <Shield className="h-5 w-5" />
    },
    {
      label: 'Threats',
      path: '/phantom?tab=threats',
      icon: <AlertTriangle className="h-5 w-5" />
    },
    {
      label: 'Domain Clones',
      path: '/phantom?tab=domains',
      icon: <Globe className="h-5 w-5" />
    },
    {
      label: 'OSINT',
      path: '/phantom?tab=osint',
      icon: <Search className="h-5 w-5" />
    },
    {
      label: 'Vulnerabilities',
      path: '/phantom?tab=vulnerabilities',
      icon: <FileWarning className="h-5 w-5" />
    },
    {
      label: 'Simulations',
      path: '/phantom?tab=simulations',
      icon: <PlaySquare className="h-5 w-5" />
    },
    {
      label: 'Settings',
      path: '/phantom/settings',
      icon: <Settings className="h-5 w-5" />
    },
  ];

  // Header with actions
  const header = (
    <ModuleHeader
      moduleId="phantom"
      title={title}
      description={description}
      icon={<Shield />}
      actions={
        <div className="flex items-center space-x-3">
          <RiskLevelIndicator level={riskLevel} showLabel showDetails />
          {actions}
        </div>
      }
    />
  );

  // Sidebar with navigation
  const sidebar = (
    <div className="h-full p-4">
      <div className="mb-8 flex items-center justify-center">
        <h2 className="text-xl font-bold text-red-400">Phantom</h2>
      </div>
      <ModuleNavigation
        moduleId="phantom"
        items={navigationItems}
      />
    </div>
  );

  return (
    <ModuleLayout
      moduleId="phantom"
      title="Phantom"
      header={header}
      sidebar={sidebar}
      pattern="circuit"
      patternOpacity={0.1}
      glowIntensity="medium"
      glowPositions={['top-right', 'bottom-left']}
      animate={true}
    >
      <div className={cn("space-y-6", className)}>
        {children}
      </div>
    </ModuleLayout>
  );
};

export default PhantomLayout;
