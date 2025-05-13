import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@src/shared/utils/cn';
import { getGlassmorphismClasses } from '@src/shared/utils/glassmorphism';
import { CauldronLayout } from '@src/shared/components/layout/CauldronLayout';
import { Button } from '@src/shared/components/ui/Button';
import { RiskLevelIndicator } from '@src/shared/components/security/RiskLevelIndicator';
import { ThreatSeverity } from '../../types';

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
  return (
    <CauldronLayout activeModule="phantom" backgroundPattern="circuit">
      <div className="space-y-6">
        {/* Header */}
        <div className={cn(
          "overflow-hidden rounded-lg",
          getGlassmorphismClasses({
            level: 'medium',
            border: true,
            shadow: true,
          })
        )}>
          <div className="p-6">
            <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
              <div>
                <div className="flex items-center space-x-3">
                  <RiskLevelIndicator level={riskLevel} showLabel showDetails />
                  <h1 className="text-2xl font-bold text-white">{title}</h1>
                </div>
                {description && (
                  <p className="mt-2 text-gray-400">{description}</p>
                )}
              </div>
              {actions && (
                <div className="flex space-x-3">{actions}</div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={cn("space-y-6", className)}>
          {children}
        </div>
      </div>
    </CauldronLayout>
  );
};

export default PhantomLayout;
