import React from 'react';
import { cn } from '@src/shared/utils/cn';
import { AgentTrustBadge } from './AgentTrustBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@src/shared/components/ui/Card';
import { Badge } from '@src/shared/components/ui/Badge';
import { Button } from '@src/shared/components/ui/Button';
import { Award, Shield } from 'lucide-react';
import { BadgeCategory, BadgeTier } from '@src/shared/types/entities/agentTrust';

export interface AgentTrustBadgeGridProps {
  title?: string;
  description?: string;
  badges: Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    tier: string;
    iconUrl?: string;
    requirement?: string;
    isEarned?: boolean;
    earnedAt?: Date;
  }>;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  groupBy?: 'category' | 'tier' | null;
  badgeSize?: 'sm' | 'md' | 'lg';
  className?: string;
  onAwardBadge?: (badgeId: string) => void;
  showAwardButton?: boolean;
}

/**
 * Component for displaying a grid of agent trust badges
 */
export const AgentTrustBadgeGrid: React.FC<AgentTrustBadgeGridProps> = ({
  title,
  description,
  badges,
  emptyMessage = 'No badges available',
  emptyIcon = <Shield className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />,
  groupBy = null,
  badgeSize = 'md',
  className,
  onAwardBadge,
  showAwardButton = false,
}) => {
  // If no badges, show empty state
  if (!badges || badges.length === 0) {
    return (
      <Card className={cn('w-full', className)}>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-10">
            {emptyIcon}
            <p className="mt-2 text-muted-foreground">{emptyMessage}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group badges by category
  const renderBadgesByCategory = () => {
    const categories = Object.values(BadgeCategory);
    
    return (
      <div className="space-y-6">
        {categories.map((category) => {
          const badgesInCategory = badges.filter(
            (badge) => badge.category === category
          );
          
          if (badgesInCategory.length === 0) return null;
          
          return (
            <div key={category} className="space-y-2">
              <h3 className="text-lg font-medium">{category}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {badgesInCategory.map((badge) => (
                  <div key={badge.id} className="flex flex-col items-center">
                    <AgentTrustBadge
                      badge={badge}
                      earnedAt={badge.isEarned ? badge.earnedAt : undefined}
                      size={badgeSize}
                      className={!badge.isEarned ? 'opacity-50' : ''}
                    />
                    <div className="mt-2 text-center">
                      <p className="text-xs font-medium truncate max-w-[100px]">{badge.name}</p>
                      {showAwardButton && onAwardBadge && !badge.isEarned && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-1 h-7 text-xs"
                          onClick={() => onAwardBadge(badge.id)}
                        >
                          Award
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Group badges by tier
  const renderBadgesByTier = () => {
    const tiers = Object.values(BadgeTier);
    
    return (
      <div className="space-y-6">
        {tiers.map((tier) => {
          const badgesInTier = badges.filter(
            (badge) => badge.tier === tier
          );
          
          if (badgesInTier.length === 0) return null;
          
          return (
            <div key={tier} className="space-y-2">
              <h3 className="text-lg font-medium">{tier}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {badgesInTier.map((badge) => (
                  <div key={badge.id} className="flex flex-col items-center">
                    <AgentTrustBadge
                      badge={badge}
                      earnedAt={badge.isEarned ? badge.earnedAt : undefined}
                      size={badgeSize}
                      className={!badge.isEarned ? 'opacity-50' : ''}
                    />
                    <div className="mt-2 text-center">
                      <p className="text-xs font-medium truncate max-w-[100px]">{badge.name}</p>
                      {showAwardButton && onAwardBadge && !badge.isEarned && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-1 h-7 text-xs"
                          onClick={() => onAwardBadge(badge.id)}
                        >
                          Award
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render all badges in a grid
  const renderAllBadges = () => {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {badges.map((badge) => (
          <div key={badge.id} className="flex flex-col items-center">
            <AgentTrustBadge
              badge={badge}
              earnedAt={badge.isEarned ? badge.earnedAt : undefined}
              size={badgeSize}
              className={!badge.isEarned ? 'opacity-50' : ''}
            />
            <div className="mt-2 text-center">
              <p className="text-xs font-medium truncate max-w-[100px]">{badge.name}</p>
              {showAwardButton && onAwardBadge && !badge.isEarned && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1 h-7 text-xs"
                  onClick={() => onAwardBadge(badge.id)}
                >
                  Award
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className={cn('w-full', className)}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        {groupBy === 'category' ? renderBadgesByCategory() : 
         groupBy === 'tier' ? renderBadgesByTier() : 
         renderAllBadges()}
      </CardContent>
    </Card>
  );
};
