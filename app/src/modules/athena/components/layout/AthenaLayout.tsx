import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@src/shared/utils/cn';
import { getGlassmorphismClasses } from '@src/shared/utils/glassmorphism';
import { CauldronLayout } from '@src/shared/components/layout/CauldronLayout';
import { Button } from '@src/shared/components/ui/Button';
import { TimeframeOption } from '../../types';

export interface AthenaLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  timeframe?: TimeframeOption;
  onTimeframeChange?: (timeframe: TimeframeOption) => void;
  className?: string;
}

/**
 * AthenaLayout - Layout component for the Athena business intelligence module
 * 
 * Features:
 * - Header with title, description, and actions
 * - Timeframe selector
 * - Content area for module-specific components
 */
export const AthenaLayout: React.FC<AthenaLayoutProps> = ({
  children,
  title,
  description,
  actions,
  timeframe = TimeframeOption.WEEK,
  onTimeframeChange,
  className,
}) => {
  return (
    <CauldronLayout activeModule="athena" backgroundPattern="dots">
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
                <h1 className="text-2xl font-bold text-white">{title}</h1>
                {description && (
                  <p className="mt-2 text-gray-400">{description}</p>
                )}
              </div>
              <div className="flex items-center space-x-4">
                {onTimeframeChange && (
                  <div className="flex space-x-1 rounded-md bg-gray-800 p-1">
                    {Object.values(TimeframeOption).map((tf) => (
                      <button
                        key={tf}
                        className={cn(
                          "rounded-md px-3 py-1 text-sm font-medium transition-colors",
                          timeframe === tf
                            ? "bg-yellow-600 text-white"
                            : "text-gray-400 hover:bg-gray-700 hover:text-white"
                        )}
                        onClick={() => onTimeframeChange(tf)}
                      >
                        {tf.charAt(0).toUpperCase() + tf.slice(1)}
                      </button>
                    ))}
                  </div>
                )}
                {actions && (
                  <div className="flex space-x-3">{actions}</div>
                )}
              </div>
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

export default AthenaLayout;
