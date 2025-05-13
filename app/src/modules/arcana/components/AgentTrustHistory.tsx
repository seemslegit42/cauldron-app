import React, { useState } from 'react';
import { cn } from '@src/shared/utils/cn';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@src/shared/components/ui/Card';
import { Badge } from '@src/shared/components/ui/Badge';
import { Button } from '@src/shared/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@src/shared/components/ui/Tabs';
import { Skeleton } from '@src/shared/components/ui/Skeleton';
import { XpActionType } from '@src/shared/types/entities/agentTrust';
import { 
  Zap, 
  Award, 
  CheckCircle, 
  XCircle, 
  ThumbsUp, 
  ThumbsDown, 
  Clock, 
  ArrowUp, 
  BarChart 
} from 'lucide-react';

export interface AgentTrustHistoryProps {
  agentId: string;
  className?: string;
  isLoading?: boolean;
  xpHistory?: Array<{
    id: string;
    xp: number;
    actionType: string;
    description?: string;
    createdAt: Date;
  }>;
  taskHistory?: Array<{
    id: string;
    success: boolean;
    taskType?: string;
    details?: string;
    createdAt: Date;
  }>;
  feedbackHistory?: Array<{
    id: string;
    rating: 'positive' | 'neutral' | 'negative';
    comment?: string;
    createdAt: Date;
  }>;
  badgeHistory?: Array<{
    id: string;
    badgeId: string;
    badge: {
      name: string;
      category: string;
      tier: string;
    };
    earnedAt: Date;
  }>;
  levelUpHistory?: Array<{
    id: string;
    fromLevel: number;
    toLevel: number;
    createdAt: Date;
  }>;
}

/**
 * Component for displaying an agent's trust history
 */
export const AgentTrustHistory: React.FC<AgentTrustHistoryProps> = ({
  agentId,
  className,
  isLoading = false,
  xpHistory = [],
  taskHistory = [],
  feedbackHistory = [],
  badgeHistory = [],
  levelUpHistory = [],
}) => {
  const [activeTab, setActiveTab] = useState('all');
  
  // Get action type icon
  const getActionTypeIcon = (actionType: string) => {
    switch (actionType) {
      case XpActionType.TASK_COMPLETION:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case XpActionType.POSITIVE_FEEDBACK:
        return <ThumbsUp className="h-4 w-4 text-blue-500" />;
      case XpActionType.BADGE_EARNED:
        return <Award className="h-4 w-4 text-yellow-500" />;
      case XpActionType.MILESTONE_REACHED:
        return <BarChart className="h-4 w-4 text-purple-500" />;
      case XpActionType.SPECIAL_ACHIEVEMENT:
        return <Zap className="h-4 w-4 text-amber-500" />;
      default:
        return <Zap className="h-4 w-4 text-blue-500" />;
    }
  };
  
  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Combine all history items
  const allHistory = [
    ...xpHistory.map(item => ({
      id: item.id,
      type: 'xp',
      title: `Earned ${item.xp} XP`,
      description: item.description || `From ${item.actionType.toLowerCase().replace(/_/g, ' ')}`,
      icon: getActionTypeIcon(item.actionType),
      date: item.createdAt,
      metadata: { xp: item.xp, actionType: item.actionType },
    })),
    ...taskHistory.map(item => ({
      id: item.id,
      type: 'task',
      title: item.success ? 'Task Completed' : 'Task Failed',
      description: item.taskType || (item.success ? 'Successfully completed a task' : 'Failed to complete a task'),
      icon: item.success ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />,
      date: item.createdAt,
      metadata: { success: item.success, taskType: item.taskType },
    })),
    ...feedbackHistory.map(item => ({
      id: item.id,
      type: 'feedback',
      title: `Received ${item.rating} feedback`,
      description: item.comment || `User provided ${item.rating} feedback`,
      icon: item.rating === 'positive' ? <ThumbsUp className="h-4 w-4 text-green-500" /> : 
            item.rating === 'negative' ? <ThumbsDown className="h-4 w-4 text-red-500" /> : 
            <Clock className="h-4 w-4 text-gray-500" />,
      date: item.createdAt,
      metadata: { rating: item.rating },
    })),
    ...badgeHistory.map(item => ({
      id: item.id,
      type: 'badge',
      title: `Earned "${item.badge.name}" Badge`,
      description: `Earned a ${item.badge.tier.toLowerCase()} tier badge in ${item.badge.category.toLowerCase()}`,
      icon: <Award className="h-4 w-4 text-yellow-500" />,
      date: item.earnedAt,
      metadata: { badge: item.badge },
    })),
    ...levelUpHistory.map(item => ({
      id: item.id,
      type: 'levelUp',
      title: `Leveled Up to ${item.toLevel}`,
      description: `Advanced from level ${item.fromLevel} to level ${item.toLevel}`,
      icon: <ArrowUp className="h-4 w-4 text-purple-500" />,
      date: item.createdAt,
      metadata: { fromLevel: item.fromLevel, toLevel: item.toLevel },
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Filter history by type
  const filteredHistory = activeTab === 'all' ? allHistory : allHistory.filter(item => item.type === activeTab);
  
  // Loading state
  if (isLoading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <CardTitle>Trust History</CardTitle>
          <CardDescription>History of trust-related events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Empty state
  if (allHistory.length === 0) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <CardTitle>Trust History</CardTitle>
          <CardDescription>History of trust-related events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
            <p className="mt-2 text-muted-foreground">No history available yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle>Trust History</CardTitle>
        <CardDescription>History of trust-related events</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="xp">XP</TabsTrigger>
            <TabsTrigger value="task">Tasks</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="badge">Badges</TabsTrigger>
            <TabsTrigger value="levelUp">Levels</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-4">
            {filteredHistory.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No {activeTab} history available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start space-x-3 border-b border-border pb-3 last:border-0 last:pb-0"
                  >
                    <div className="bg-secondary/50 rounded-full p-2 mt-1">
                      {item.icon}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-medium">{item.title}</h4>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(item.date)}
                        </span>
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                      
                      {item.type === 'xp' && (
                        <Badge variant="outline" className="mt-1">
                          +{item.metadata.xp} XP
                        </Badge>
                      )}
                      
                      {item.type === 'badge' && (
                        <Badge
                          className={cn(
                            'mt-1',
                            item.metadata.badge.tier === 'BRONZE' && 'bg-amber-700 text-white',
                            item.metadata.badge.tier === 'SILVER' && 'bg-gray-400 text-black',
                            item.metadata.badge.tier === 'GOLD' && 'bg-yellow-400 text-black',
                            item.metadata.badge.tier === 'PLATINUM' && 'bg-cyan-200 text-black',
                            item.metadata.badge.tier === 'DIAMOND' && 'bg-blue-300 text-black',
                            item.metadata.badge.tier === 'SPECIAL' && 'bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white'
                          )}
                        >
                          {item.metadata.badge.tier}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                
                {filteredHistory.length >= 10 && (
                  <Button variant="outline" className="w-full">
                    Load More
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
