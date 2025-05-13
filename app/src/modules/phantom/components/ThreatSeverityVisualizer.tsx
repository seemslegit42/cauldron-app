import React from 'react';
import { Progress } from '@src/shared/components/ui/progress';
import { Badge } from '@src/shared/components/ui/badge';

interface ThreatSeverityVisualizerProps {
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

export function ThreatSeverityVisualizer({
  criticalCount,
  highCount,
  mediumCount,
  lowCount,
}: ThreatSeverityVisualizerProps) {
  const total = criticalCount + highCount + mediumCount + lowCount;
  
  // Calculate percentages
  const criticalPercentage = total > 0 ? (criticalCount / total) * 100 : 0;
  const highPercentage = total > 0 ? (highCount / total) * 100 : 0;
  const mediumPercentage = total > 0 ? (mediumCount / total) * 100 : 0;
  const lowPercentage = total > 0 ? (lowCount / total) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Stacked bar visualization */}
      <div className="h-8 flex rounded-md overflow-hidden">
        {criticalCount > 0 && (
          <div 
            className="bg-red-600 h-full flex items-center justify-center text-white text-xs font-medium"
            style={{ width: `${criticalPercentage}%` }}
          >
            {criticalPercentage > 8 && `${criticalCount}`}
          </div>
        )}
        {highCount > 0 && (
          <div 
            className="bg-orange-500 h-full flex items-center justify-center text-white text-xs font-medium"
            style={{ width: `${highPercentage}%` }}
          >
            {highPercentage > 8 && `${highCount}`}
          </div>
        )}
        {mediumCount > 0 && (
          <div 
            className="bg-yellow-500 h-full flex items-center justify-center text-white text-xs font-medium"
            style={{ width: `${mediumPercentage}%` }}
          >
            {mediumPercentage > 8 && `${mediumCount}`}
          </div>
        )}
        {lowCount > 0 && (
          <div 
            className="bg-green-500 h-full flex items-center justify-center text-white text-xs font-medium"
            style={{ width: `${lowPercentage}%` }}
          >
            {lowPercentage > 8 && `${lowCount}`}
          </div>
        )}
        {total === 0 && (
          <div className="bg-gray-200 dark:bg-gray-700 h-full w-full flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs font-medium">
            No alerts
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-600"></div>
          <span className="text-sm">Critical</span>
          <Badge variant="outline" className="ml-1">{criticalCount}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span className="text-sm">High</span>
          <Badge variant="outline" className="ml-1">{highCount}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span className="text-sm">Medium</span>
          <Badge variant="outline" className="ml-1">{mediumCount}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-sm">Low</span>
          <Badge variant="outline" className="ml-1">{lowCount}</Badge>
        </div>
      </div>

      {/* Individual progress bars */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Critical</span>
            <span className="text-sm text-muted-foreground">{criticalCount}</span>
          </div>
          <Progress value={criticalPercentage} className="h-2 bg-gray-200 dark:bg-gray-700" indicatorClassName="bg-red-600" />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">High</span>
            <span className="text-sm text-muted-foreground">{highCount}</span>
          </div>
          <Progress value={highPercentage} className="h-2 bg-gray-200 dark:bg-gray-700" indicatorClassName="bg-orange-500" />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Medium</span>
            <span className="text-sm text-muted-foreground">{mediumCount}</span>
          </div>
          <Progress value={mediumPercentage} className="h-2 bg-gray-200 dark:bg-gray-700" indicatorClassName="bg-yellow-500" />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Low</span>
            <span className="text-sm text-muted-foreground">{lowCount}</span>
          </div>
          <Progress value={lowPercentage} className="h-2 bg-gray-200 dark:bg-gray-700" indicatorClassName="bg-green-500" />
        </div>
      </div>
    </div>
  );
}
