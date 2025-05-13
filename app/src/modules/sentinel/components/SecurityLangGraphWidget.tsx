import React, { useState, useCallback } from 'react';
import { useQuery } from 'wasp/client/operations';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@src/shared/components/ui/card';
import { Button } from '@src/shared/components/ui/button';
import { Badge } from '@src/shared/components/ui/badge';
import { Spinner } from '@src/shared/components/ui/spinner';
import { Alert, AlertDescription } from '@src/shared/components/ui/alert';
import { format } from 'date-fns';

import { getUserWorkflowExecutions } from '@src/modules/forgeflow/api/operations';

export interface SecurityLangGraphWidgetProps {
  className?: string;
  maxItems?: number;
}

export const SecurityLangGraphWidget: React.FC<SecurityLangGraphWidgetProps> = ({
  className = '',
  maxItems = 3,
}) => {
  const navigate = useNavigate();
  
  // Query for user workflow executions
  const { 
    data: executions, 
    isLoading, 
    error
  } = useQuery(getUserWorkflowExecutions);
  
  // Filter executions to only show active workflows
  const activeWorkflows = executions
    ?.filter((execution: any) => 
      execution.status.toLowerCase() === 'running' ||
      execution.status.toLowerCase() === 'pending'
    )
    .slice(0, maxItems);
  
  // Handle view all click
  const handleViewAll = useCallback(() => {
    navigate('/forgeflow/langgraph');
  }, [navigate]);
  
  // Handle view execution click
  const handleViewExecution = useCallback((executionId: string) => {
    navigate(`/forgeflow/langgraph/${executionId}`);
  }, [navigate]);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, h:mm a');
  };
  
  // Get status badge variant
  const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'running':
        return 'secondary';
      default:
        return 'outline';
    }
  };
  
  // Calculate security metrics
  const totalWorkflows = executions?.length || 0;
  const completedWorkflows = executions?.filter((e: any) => 
    e.status.toLowerCase() === 'completed'
  ).length || 0;
  const failedWorkflows = executions?.filter((e: any) => 
    e.status.toLowerCase() === 'failed'
  ).length || 0;
  const successRate = totalWorkflows > 0 
    ? Math.round((completedWorkflows / totalWorkflows) * 100) 
    : 0;
  
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle>Agent Workflow Monitor</CardTitle>
        <CardDescription>
          Security monitoring for LangGraph workflows
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <Spinner size="sm" />
            <span className="ml-2 text-sm">Loading workflows...</span>
          </div>
        ) : error ? (
          <Alert variant="destructive" className="text-sm">
            <AlertDescription>
              Error loading workflows
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Security Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-muted rounded-md p-3 text-center">
                <div className="text-2xl font-bold">{totalWorkflows}</div>
                <div className="text-xs text-muted-foreground">Total Workflows</div>
              </div>
              <div className="bg-muted rounded-md p-3 text-center">
                <div className="text-2xl font-bold">{successRate}%</div>
                <div className="text-xs text-muted-foreground">Success Rate</div>
              </div>
              <div className="bg-muted rounded-md p-3 text-center">
                <div className="text-2xl font-bold">{failedWorkflows}</div>
                <div className="text-xs text-muted-foreground">Failed Workflows</div>
              </div>
            </div>
            
            {/* Active Workflows */}
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Active Workflows</h3>
              {activeWorkflows?.length === 0 ? (
                <div className="text-center py-3 text-sm text-muted-foreground">
                  No active workflows at the moment.
                </div>
              ) : (
                <div className="space-y-2">
                  {activeWorkflows?.map((execution: any) => (
                    <div 
                      key={execution.id} 
                      className="flex justify-between items-center p-2 rounded-md border hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleViewExecution(execution.id)}
                    >
                      <div>
                        <div className="font-medium text-sm">
                          {execution.langGraphState?.name || execution.workflow.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Started: {formatDate(execution.startedAt)}
                        </div>
                      </div>
                      <Badge variant={getStatusBadgeVariant(execution.status)}>
                        {execution.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="outline" size="sm" className="w-full" onClick={handleViewAll}>
          View All Workflows
        </Button>
      </CardFooter>
    </Card>
  );
};
