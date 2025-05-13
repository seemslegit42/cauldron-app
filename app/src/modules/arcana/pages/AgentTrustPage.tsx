import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'wasp/client/operations';
import { getAgentById } from '@src/api/routes/agents/getAgentById';
import { PageHeader } from '@src/shared/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@src/shared/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@src/shared/components/ui/Tabs';
import { Button } from '@src/shared/components/ui/Button';
import { Skeleton } from '@src/shared/components/ui/Skeleton';
import { Badge } from '@src/shared/components/ui/Badge';
import { AgentTrustScore } from '@src/shared/components/ai/AgentTrustScore';
import { AgentFeedbackWidget } from '@src/shared/components/ai/AgentFeedbackWidget';
import { useAgentTrust } from '@src/shared/hooks/useAgentTrust';
import { BadgeCategory, BadgeTier, TrustLevel } from '@src/shared/types/entities/agentTrust';
import { Award, Star, Zap, CheckCircle, XCircle, ThumbsUp, BarChart, Clock, Shield } from 'lucide-react';

/**
 * Page for displaying and managing agent trust scores
 */
const AgentTrustPage: React.FC = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Get agent details
  const {
    data: agent,
    isLoading: isAgentLoading,
    error: agentError,
  } = useQuery(getAgentById, { id: agentId });
  
  // Get trust score
  const {
    trustScore,
    badges,
    isLoading: isTrustScoreLoading,
    getBadgesByCategory,
    getBadgesByTier,
    getEarnedBadges,
    getEarnedBadgesByCategory,
    getEarnedBadgesByTier,
    getTrustLevelColor,
    getBadgeTierColor,
    getBadgeCategoryColor,
    recordTask,
    addXp,
    awardBadge,
  } = useAgentTrust({ agentId });
  
  const isLoading = isAgentLoading || isTrustScoreLoading;
  
  // Handle simulating a successful task
  const handleSimulateSuccessfulTask = async () => {
    if (!agentId) return;
    await recordTask({ agentId, success: true });
  };
  
  // Handle simulating a failed task
  const handleSimulateFailedTask = async () => {
    if (!agentId) return;
    await recordTask({ agentId, success: false });
  };
  
  // Handle adding XP
  const handleAddXp = async () => {
    if (!agentId) return;
    await addXp({ 
      agentId, 
      xp: 25, 
      actionType: 'special_achievement',
      description: 'Manual XP award for testing'
    });
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <PageHeader
          title={<Skeleton className="h-8 w-64" />}
          description={<Skeleton className="h-4 w-96" />}
        />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }
  
  if (!agent) {
    return (
      <div className="container mx-auto py-6">
        <PageHeader
          title="Agent Not Found"
          description="The requested agent could not be found."
        />
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <p>The agent you're looking for doesn't exist or you don't have permission to view it.</p>
              <Button className="mt-4" variant="outline" onClick={() => window.history.back()}>
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title={
          <div className="flex items-center gap-2">
            <span>{agent.name}</span>
            {trustScore && (
              <Badge className={getTrustLevelColor(trustScore.trustLevel)}>
                {trustScore.trustLevel}
              </Badge>
            )}
          </div>
        }
        description={`Trust score and reputation for ${agent.name}`}
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="test">Test Tools</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <AgentTrustScore agentId={agentId!} showBadges={false} />
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest trust-building activities</CardDescription>
                </CardHeader>
                <CardContent>
                  {trustScore ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Successful Tasks</span>
                        </div>
                        <Badge variant="outline">{trustScore.successfulTasks}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-sm">Failed Tasks</span>
                        </div>
                        <Badge variant="outline">{trustScore.failedTasks}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <ThumbsUp className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">Positive Feedback</span>
                        </div>
                        <Badge variant="outline">{trustScore.positiveRatings}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">Badges Earned</span>
                        </div>
                        <Badge variant="outline">{trustScore.earnedBadges?.length || 0}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-purple-500" />
                          <span className="text-sm">Last Level Up</span>
                        </div>
                        <Badge variant="outline">
                          {new Date(trustScore.lastLevelUpAt).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No activity data available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Agent Details</CardTitle>
                <CardDescription>Information about this agent</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium">Description</h4>
                    <p className="text-sm text-muted-foreground">{agent.description}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Type</h4>
                    <p className="text-sm text-muted-foreground">{agent.type}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Model</h4>
                    <p className="text-sm text-muted-foreground">{agent.model}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Provider</h4>
                    <p className="text-sm text-muted-foreground">{agent.provider}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Capabilities</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {agent.capabilities.map((capability) => (
                        <Badge key={capability} variant="secondary">
                          {capability}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Provide Feedback</CardTitle>
                <CardDescription>Rate this agent's performance</CardDescription>
              </CardHeader>
              <CardContent>
                <AgentFeedbackWidget agentId={agentId!} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="badges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Earned Badges</CardTitle>
              <CardDescription>Badges this agent has earned</CardDescription>
            </CardHeader>
            <CardContent>
              {trustScore && trustScore.earnedBadges && trustScore.earnedBadges.length > 0 ? (
                <div className="space-y-6">
                  {/* Group by category */}
                  {Object.values(BadgeCategory).map((category) => {
                    const badgesInCategory = trustScore.earnedBadges.filter(
                      (eb) => eb.badge.category === category
                    );
                    
                    if (badgesInCategory.length === 0) return null;
                    
                    return (
                      <div key={category} className="space-y-2">
                        <h3 className="text-lg font-medium">{category}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {badgesInCategory.map((earnedBadge) => (
                            <Card key={earnedBadge.id} className="overflow-hidden">
                              <div className={`h-2 ${getBadgeCategoryColor(earnedBadge.badge.category)}`} />
                              <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                  <CardTitle className="text-base">{earnedBadge.badge.name}</CardTitle>
                                  <Badge className={getBadgeTierColor(earnedBadge.badge.tier)}>
                                    {earnedBadge.badge.tier}
                                  </Badge>
                                </div>
                                <CardDescription>{earnedBadge.badge.description}</CardDescription>
                              </CardHeader>
                              <CardContent className="pb-3">
                                <p className="text-xs text-muted-foreground">
                                  <span className="font-medium">Earned:</span>{' '}
                                  {new Date(earnedBadge.earnedAt).toLocaleDateString()}
                                </p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Award className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                  <p className="mt-2 text-muted-foreground">No badges earned yet</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Available Badges</CardTitle>
              <CardDescription>Badges this agent can earn</CardDescription>
            </CardHeader>
            <CardContent>
              {badges && badges.length > 0 ? (
                <div className="space-y-6">
                  {/* Group by category */}
                  {Object.values(BadgeCategory).map((category) => {
                    const badgesInCategory = getBadgesByCategory(category);
                    
                    if (badgesInCategory.length === 0) return null;
                    
                    return (
                      <div key={category} className="space-y-2">
                        <h3 className="text-lg font-medium">{category}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {badgesInCategory.map((badge) => {
                            // Check if badge is already earned
                            const isEarned = trustScore?.earnedBadges?.some(
                              (eb) => eb.badge.id === badge.id
                            );
                            
                            return (
                              <Card 
                                key={badge.id} 
                                className={`overflow-hidden ${isEarned ? 'opacity-50' : ''}`}
                              >
                                <div className={`h-2 ${getBadgeCategoryColor(badge.category)}`} />
                                <CardHeader className="pb-2">
                                  <div className="flex justify-between items-start">
                                    <CardTitle className="text-base">{badge.name}</CardTitle>
                                    <Badge className={getBadgeTierColor(badge.tier)}>
                                      {badge.tier}
                                    </Badge>
                                  </div>
                                  <CardDescription>{badge.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="pb-3">
                                  <p className="text-xs text-muted-foreground">
                                    <span className="font-medium">Requirement:</span>{' '}
                                    {badge.requirement}
                                  </p>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Shield className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                  <p className="mt-2 text-muted-foreground">No badges available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trust History</CardTitle>
              <CardDescription>Timeline of trust-building events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                <p className="mt-2 text-muted-foreground">History tracking coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Tools</CardTitle>
              <CardDescription>Tools for testing the trust system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button onClick={handleSimulateSuccessfulTask}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Simulate Successful Task
                </Button>
                <Button onClick={handleSimulateFailedTask} variant="outline">
                  <XCircle className="mr-2 h-4 w-4" />
                  Simulate Failed Task
                </Button>
                <Button onClick={handleAddXp} variant="secondary">
                  <Zap className="mr-2 h-4 w-4" />
                  Add 25 XP
                </Button>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Award Special Badge</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {badges
                    ?.filter((badge) => badge.requirementType === 'special')
                    .map((badge) => {
                      // Check if badge is already earned
                      const isEarned = trustScore?.earnedBadges?.some(
                        (eb) => eb.badge.id === badge.id
                      );
                      
                      return (
                        <Card key={badge.id} className="overflow-hidden">
                          <div className={`h-2 ${getBadgeCategoryColor(badge.category)}`} />
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-base">{badge.name}</CardTitle>
                              <Badge className={getBadgeTierColor(badge.tier)}>
                                {badge.tier}
                              </Badge>
                            </div>
                            <CardDescription>{badge.description}</CardDescription>
                          </CardHeader>
                          <CardFooter>
                            <Button
                              onClick={() => awardBadge({ agentId: agentId!, badgeId: badge.id })}
                              disabled={isEarned}
                              className="w-full"
                              variant={isEarned ? "outline" : "default"}
                            >
                              {isEarned ? 'Already Earned' : 'Award Badge'}
                            </Button>
                          </CardFooter>
                        </Card>
                      );
                    })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentTrustPage;
