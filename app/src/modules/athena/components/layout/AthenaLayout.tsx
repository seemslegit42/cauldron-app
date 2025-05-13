import React from 'react';
import { cn } from '@src/shared/utils/cn';
import { CauldronLayout } from '@src/shared/components/layout/CauldronLayout';
import { TimeframeOption } from '../../types';
import { ModuleHeader } from '@src/shared/components/branding/ModuleHeader';
import { useModuleTheme } from '@src/shared/hooks/useModuleTheme';
import { BarChart } from 'lucide-react';

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
  const { colors, classes } = useModuleTheme('athena');

  return (
    <CauldronLayout activeModule="athena" backgroundPattern="dots">
      <div className="space-y-6">
        {/* Header */}
        <ModuleHeader
          moduleId="athena"
          title={title}
          description={description}
          icon={<BarChart />}
          actions={
            <div className="flex items-center space-x-4">
              {/* Timeframe selector */}
              {onTimeframeChange && (
                <div className="flex space-x-1 rounded-md bg-gray-800 p-1">
                  {Object.values(TimeframeOption).map((tf) => (
                    <button
                      key={tf}
                      type="button"
                      className={cn(
                        "rounded-md px-3 py-1 text-sm font-medium transition-colors",
                        timeframe === tf
                          ? `bg-blue-600 text-white`
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
          }
        />

        {/* Content */}
        <div className={cn("space-y-6", className)}>
          {children}
        </div>
      </div>
    </CauldronLayout>
  );
};

export default AthenaLayout;
