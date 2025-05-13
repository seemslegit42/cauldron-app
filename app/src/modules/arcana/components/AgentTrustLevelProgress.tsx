import React from 'react';
import { cn } from '@src/shared/utils/cn';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@src/shared/components/ui/Card';
import { Progress } from '@src/shared/components/ui/Progress';
import { Badge } from '@src/shared/components/ui/Badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@src/shared/components/ui/Tooltip';
import { TrustLevel } from '@src/shared/types/entities/agentTrust';
import { Zap, Star, Award } from 'lucide-react';

export interface AgentTrustLevelProgressProps {
  level: number;
  experiencePoints: number;
  xpForNextLevel: number;
  levelProgress: number;
  trustLevel: TrustLevel | string;
  className?: string;
  showNextLevelPreview?: boolean;
}

/**
 * Component for displaying an agent's trust level progress
 */
export const AgentTrustLevelProgress: React.FC<AgentTrustLevelProgressProps> = ({
  level,
  experiencePoints,
  xpForNextLevel,
  levelProgress,
  trustLevel,
  className,
  showNextLevelPreview = true,
}) => {
  // Get trust level color
  const getTrustLevelColor = (level: TrustLevel | string) => {
    switch (level) {
      case TrustLevel.NOVICE:
        return 'bg-gray-500 text-white';
      case TrustLevel.APPRENTICE:
        return 'bg-blue-500 text-white';
      case TrustLevel.ADEPT:
        return 'bg-green-500 text-white';
      case TrustLevel.EXPERT:
        return 'bg-yellow-500 text-black';
      case TrustLevel.MASTER:
        return 'bg-purple-500 text-white';
      case TrustLevel.GRANDMASTER:
        return 'bg-red-500 text-white';
      case TrustLevel.LEGENDARY:
        return 'bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Get next trust level
  const getNextTrustLevel = (currentLevel: number): TrustLevel => {
    if (currentLevel >= 30) return TrustLevel.LEGENDARY;
    if (currentLevel >= 25) return TrustLevel.GRANDMASTER;
    if (currentLevel >= 20) return TrustLevel.MASTER;
    if (currentLevel >= 15) return TrustLevel.EXPERT;
    if (currentLevel >= 10) return TrustLevel.ADEPT;
    if (currentLevel >= 5) return TrustLevel.APPRENTICE;
    return TrustLevel.NOVICE;
  };

  // Calculate next level
  const nextLevel = level + 1;
  const nextTrustLevel = getNextTrustLevel(nextLevel);
  const isNewTrustLevel = trustLevel !== nextTrustLevel;

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Level Progress</CardTitle>
          <Badge className={cn(getTrustLevelColor(trustLevel))}>
            {trustLevel}
          </Badge>
        </div>
        <CardDescription>Current level and progress</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-primary/10 rounded-full p-2 mr-3">
              <Star className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Level {level}</p>
              <p className="text-xs text-muted-foreground">{experiencePoints} XP total</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm font-medium">{Math.round(levelProgress)}%</p>
            <p className="text-xs text-muted-foreground">{xpForNextLevel} XP needed</p>
          </div>
        </div>
        
        <Progress value={levelProgress} className="h-2" />
        
        {showNextLevelPreview && (
          <div className="pt-2 border-t border-border mt-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="bg-primary/10 rounded-full p-2 mr-3">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Next: Level {nextLevel}</p>
                  {isNewTrustLevel && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge className={cn('mt-1', getTrustLevelColor(nextTrustLevel))}>
                            {nextTrustLevel}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">New trust level at level {nextLevel}!</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm font-medium">
                  {xpForNextLevel - (experiencePoints % xpForNextLevel)} XP
                </p>
                <p className="text-xs text-muted-foreground">remaining</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
