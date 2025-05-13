import React from 'react';
import { cn } from '@src/shared/utils/cn';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@src/shared/components/ui/Card';
import { Badge } from '@src/shared/components/ui/Badge';
import { Progress } from '@src/shared/components/ui/Progress';
import { CheckCircle, XCircle, ThumbsUp, ThumbsDown, Award, BarChart } from 'lucide-react';

export interface AgentTrustStatsProps {
  successfulTasks: number;
  failedTasks: number;
  positiveRatings: number;
  negativeRatings: number;
  neutralRatings: number;
  feedbackCount: number;
  badgeCount: number;
  successRate: number;
  approvalRate: number;
  className?: string;
}

/**
 * Component for displaying an agent's trust stats
 */
export const AgentTrustStats: React.FC<AgentTrustStatsProps> = ({
  successfulTasks,
  failedTasks,
  positiveRatings,
  negativeRatings,
  neutralRatings,
  feedbackCount,
  badgeCount,
  successRate,
  approvalRate,
  className,
}) => {
  // Calculate total tasks
  const totalTasks = successfulTasks + failedTasks;

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle>Performance Stats</CardTitle>
        <CardDescription>Agent performance metrics</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Task Success Rate */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Task Success Rate
            </h3>
            <span className="text-sm font-bold">{Math.round(successRate)}%</span>
          </div>
          <Progress value={successRate} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{successfulTasks} successful</span>
            <span>{failedTasks} failed</span>
          </div>
        </div>
        
        {/* Feedback Approval Rate */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium flex items-center">
              <ThumbsUp className="h-4 w-4 text-blue-500 mr-2" />
              Feedback Approval Rate
            </h3>
            <span className="text-sm font-bold">{Math.round(approvalRate)}%</span>
          </div>
          <Progress value={approvalRate} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{positiveRatings} positive</span>
            <span>{negativeRatings} negative</span>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <StatCard
            title="Total Tasks"
            value={totalTasks.toString()}
            icon={<BarChart className="h-4 w-4 text-purple-500" />}
          />
          
          <StatCard
            title="Feedback Received"
            value={feedbackCount.toString()}
            icon={<ThumbsUp className="h-4 w-4 text-blue-500" />}
          />
          
          <StatCard
            title="Success Rate"
            value={`${Math.round(successRate)}%`}
            icon={<CheckCircle className="h-4 w-4 text-green-500" />}
          />
          
          <StatCard
            title="Badges Earned"
            value={badgeCount.toString()}
            icon={<Award className="h-4 w-4 text-yellow-500" />}
          />
        </div>
        
        {/* Feedback Breakdown */}
        <div className="pt-2">
          <h3 className="text-sm font-medium mb-3">Feedback Breakdown</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <ThumbsUp className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm">Positive</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{positiveRatings}</Badge>
                <Badge variant="secondary">
                  {feedbackCount > 0 ? Math.round((positiveRatings / feedbackCount) * 100) : 0}%
                </Badge>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="h-4 w-4 flex items-center justify-center mr-2">—</div>
                <span className="text-sm">Neutral</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{neutralRatings}</Badge>
                <Badge variant="secondary">
                  {feedbackCount > 0 ? Math.round((neutralRatings / feedbackCount) * 100) : 0}%
                </Badge>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <ThumbsDown className="h-4 w-4 text-red-500 mr-2" />
                <span className="text-sm">Negative</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{negativeRatings}</Badge>
                <Badge variant="secondary">
                  {feedbackCount > 0 ? Math.round((negativeRatings / feedbackCount) * 100) : 0}%
                </Badge>
              </div>
            </div>
          </div>
        </div>
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
