import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { useAgentTrust } from '../../hooks/useAgentTrust';
import { TrustLevel, BadgeCategory, BadgeTier } from '../../types/entities/agentTrust';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import { Progress } from '../ui/Progress';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/Tooltip';
import { Skeleton } from '../ui/Skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Award, Star, Zap, CheckCircle, XCircle, ThumbsUp, BarChart, Clock, ExternalLink } from 'lucide-react';

export interface AgentTrustScoreProps {
  agentId: string;
  className?: string;
  compact?: boolean;
  showBadges?: boolean;
  showStats?: boolean;
  showTrustPageLink?: boolean;
}

/**
 * Component for displaying an agent's trust score
 */
export const AgentTrustScore: React.FC<AgentTrustScoreProps> = ({
  agentId,
  className,
  compact = false,
  showBadges = true,
  showStats = true,
  showTrustPageLink = false,
}) => {
  const {
    trustScore,
    isLoading,
    getTrustLevelColor,
    getBadgeTierColor,
    getBadgeCategoryColor,
  } = useAgentTrust({ agentId });

  if (isLoading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-8 w-full mb-4" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!trustScore) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <CardTitle>Trust Score</CardTitle>
          <CardDescription>No trust score available for this agent</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This agent has not yet accumulated any trust metrics.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Compact view
  if (compact) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn('px-2 py-1 rounded text-xs font-medium', getTrustLevelColor(trustScore.trustLevel))}>
                {trustScore.trustLevel}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs">
                <p className="font-bold">Trust Score: {Math.round(trustScore.trustScore)}/100</p>
                <p>Level {trustScore.level}</p>
                <p>{trustScore.experiencePoints} XP</p>
                <p>{Math.round(trustScore.levelProgress)}% to next level</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center space-x-1">
                <Award className="h-4 w-4 text-yellow-500" />
                <span className="text-xs">{trustScore.earnedBadges?.length || 0}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs font-medium">Earned Badges</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {showTrustPageLink && (
          <Link
            to={`/agents/${agentId}/trust`}
            className="text-xs text-blue-500 hover:text-blue-700 flex items-center"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            <span>Details</span>
          </Link>
        )}
      </div>
    );
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Trust Score</CardTitle>
            <CardDescription>Agent reputation and experience</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {showTrustPageLink && (
              <Link
                to={`/agents/${agentId}/trust`}
                className="text-sm text-blue-500 hover:text-blue-700 flex items-center"
              >
                <span className="mr-1">View Details</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
            <Badge className={cn('ml-2', getTrustLevelColor(trustScore.trustLevel))}>
              {trustScore.trustLevel}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Trust Score */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Trust Score</span>
            <span className="text-sm font-bold">{Math.round(trustScore.trustScore)}/100</span>
          </div>
          <Progress value={trustScore.trustScore} className="h-2" />
        </div>

        {/* Level Progress */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Level {trustScore.level}</span>
            <span className="text-sm">{Math.round(trustScore.levelProgress)}% to Level {trustScore.level + 1}</span>
          </div>
          <Progress value={trustScore.levelProgress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {trustScore.experiencePoints} XP total ({trustScore.xpForNextLevel} XP needed for next level)
          </p>
        </div>

        {/* Stats */}
        {showStats && (
          <div className="grid grid-cols-2 gap-2 mt-4">
            <StatCard
              title="Success Rate"
              value={`${Math.round(trustScore.successRate)}%`}
              icon={<CheckCircle className="h-4 w-4 text-green-500" />}
            />
            <StatCard
              title="Tasks Completed"
              value={trustScore.successfulTasks.toString()}
              icon={<CheckCircle className="h-4 w-4 text-green-500" />}
            />
            <StatCard
              title="Positive Feedback"
              value={trustScore.positiveRatings.toString()}
              icon={<ThumbsUp className="h-4 w-4 text-blue-500" />}
            />
            <StatCard
              title="Total Feedback"
              value={trustScore.feedbackCount.toString()}
              icon={<BarChart className="h-4 w-4 text-purple-500" />}
            />
          </div>
        )}

        {/* Badges */}
        {showBadges && trustScore.earnedBadges && trustScore.earnedBadges.length > 0 && (
          <div className="mt-4">
            <Tabs defaultValue="all">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="category">Category</TabsTrigger>
                <TabsTrigger value="tier">Tier</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-2">
                <div className="flex flex-wrap gap-2">
                  {trustScore.earnedBadges.map((earnedBadge) => (
                    <BadgeItem
                      key={earnedBadge.id}
                      badge={earnedBadge.badge}
                      earnedAt={new Date(earnedBadge.earnedAt)}
                      getBadgeTierColor={getBadgeTierColor}
                      getBadgeCategoryColor={getBadgeCategoryColor}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="category" className="mt-2">
                <div className="space-y-2">
                  {Object.values(BadgeCategory).map((category) => {
                    const badgesInCategory = trustScore.earnedBadges.filter(
                      (eb) => eb.badge.category === category
                    );

                    if (badgesInCategory.length === 0) return null;

                    return (
                      <div key={category} className="space-y-1">
                        <h4 className="text-sm font-medium">{category}</h4>
                        <div className="flex flex-wrap gap-2">
                          {badgesInCategory.map((earnedBadge) => (
                            <BadgeItem
                              key={earnedBadge.id}
                              badge={earnedBadge.badge}
                              earnedAt={new Date(earnedBadge.earnedAt)}
                              getBadgeTierColor={getBadgeTierColor}
                              getBadgeCategoryColor={getBadgeCategoryColor}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="tier" className="mt-2">
                <div className="space-y-2">
                  {Object.values(BadgeTier).map((tier) => {
                    const badgesInTier = trustScore.earnedBadges.filter(
                      (eb) => eb.badge.tier === tier
                    );

                    if (badgesInTier.length === 0) return null;

                    return (
                      <div key={tier} className="space-y-1">
                        <h4 className="text-sm font-medium">{tier}</h4>
                        <div className="flex flex-wrap gap-2">
                          {badgesInTier.map((earnedBadge) => (
                            <BadgeItem
                              key={earnedBadge.id}
                              badge={earnedBadge.badge}
                              earnedAt={new Date(earnedBadge.earnedAt)}
                              getBadgeTierColor={getBadgeTierColor}
                              getBadgeCategoryColor={getBadgeCategoryColor}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Helper component for stats
const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({
  title,
  value,
  icon
}) => {
  return (
    <div className="bg-secondary/50 rounded-lg p-3">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-muted-foreground">{title}</span>
        {icon}
      </div>
      <div className="text-lg font-bold mt-1">{value}</div>
    </div>
  );
};

// Helper component for badges
interface BadgeItemProps {
  badge: {
    id: string;
    name: string;
    description: string;
    category: string;
    tier: string;
    iconUrl?: string;
    requirement: string;
  };
  earnedAt: Date;
  getBadgeTierColor: (tier: string) => string;
  getBadgeCategoryColor: (category: string) => string;
}

const BadgeItem: React.FC<BadgeItemProps> = ({
  badge,
  earnedAt,
  getBadgeTierColor,
  getBadgeCategoryColor
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'flex items-center justify-center w-10 h-10 rounded-full',
              getBadgeTierColor(badge.tier)
            )}
          >
            {badge.iconUrl ? (
              <img src={badge.iconUrl} alt={badge.name} className="w-6 h-6" />
            ) : (
              <Award className="w-5 h-5" />
            )}
          </div>
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
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Requirement:</span> {badge.requirement}
            </p>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Earned:</span> {earnedAt.toLocaleDateString()}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
