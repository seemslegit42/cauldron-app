import React from 'react';
import { cn } from '@src/shared/utils/cn';
import { Badge } from '@src/shared/components/ui/Badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@src/shared/components/ui/Tooltip';
import { Award } from 'lucide-react';
import { BadgeCategory, BadgeTier } from '@src/shared/types/entities/agentTrust';

export interface AgentTrustBadgeProps {
  badge: {
    id: string;
    name: string;
    description: string;
    category: string;
    tier: string;
    iconUrl?: string;
    requirement?: string;
  };
  earnedAt?: Date;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

/**
 * Component for displaying an agent trust badge
 */
export const AgentTrustBadge: React.FC<AgentTrustBadgeProps> = ({
  badge,
  earnedAt,
  size = 'md',
  showTooltip = true,
  className,
}) => {
  // Get badge tier color
  const getBadgeTierColor = (tier: string) => {
    switch (tier) {
      case BadgeTier.BRONZE:
        return 'bg-amber-700 text-white';
      case BadgeTier.SILVER:
        return 'bg-gray-400 text-black';
      case BadgeTier.GOLD:
        return 'bg-yellow-400 text-black';
      case BadgeTier.PLATINUM:
        return 'bg-cyan-200 text-black';
      case BadgeTier.DIAMOND:
        return 'bg-blue-300 text-black';
      case BadgeTier.SPECIAL:
        return 'bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Get badge category color
  const getBadgeCategoryColor = (category: string) => {
    switch (category) {
      case BadgeCategory.PERFORMANCE:
        return 'bg-blue-500 text-white';
      case BadgeCategory.FEEDBACK:
        return 'bg-green-500 text-white';
      case BadgeCategory.ACCURACY:
        return 'bg-yellow-500 text-black';
      case BadgeCategory.RELIABILITY:
        return 'bg-purple-500 text-white';
      case BadgeCategory.EFFICIENCY:
        return 'bg-cyan-500 text-black';
      case BadgeCategory.LEARNING:
        return 'bg-pink-500 text-white';
      case BadgeCategory.COLLABORATION:
        return 'bg-indigo-500 text-white';
      case BadgeCategory.SECURITY:
        return 'bg-red-500 text-white';
      case BadgeCategory.INNOVATION:
        return 'bg-orange-500 text-white';
      case BadgeCategory.SPECIAL:
        return 'bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  // Icon size classes
  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  // Badge element
  const badgeElement = (
    <div 
      className={cn(
        'flex items-center justify-center rounded-full', 
        sizeClasses[size],
        getBadgeTierColor(badge.tier),
        className
      )}
    >
      {badge.iconUrl ? (
        <img src={badge.iconUrl} alt={badge.name} className={iconSizeClasses[size]} />
      ) : (
        <Award className={iconSizeClasses[size]} />
      )}
    </div>
  );

  // If tooltip is disabled, just return the badge
  if (!showTooltip) {
    return badgeElement;
  }

  // Return badge with tooltip
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badgeElement}
        </TooltipTrigger>
        <TooltipContent className="w-64">
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold">{badge.name}</h4>
                <div className="flex space-x-1 mt-1">
                  <Badge className={getBadgeTierColor(badge.tier)}>
                    {badge.tier}
                  </Badge>
                  <Badge className={getBadgeCategoryColor(badge.category)}>
                    {badge.category}
                  </Badge>
                </div>
              </div>
              <Award className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-xs">{badge.description}</p>
            {badge.requirement && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Requirement:</span> {badge.requirement}
              </p>
            )}
            {earnedAt && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Earned:</span> {earnedAt.toLocaleDateString()}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
