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

export interface LangGraphSummaryWidgetProps {
  className?: string;
  maxItems?: number;
}

export const LangGraphSummaryWidget: React.FC<LangGraphSummaryWidgetProps> = ({
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
  
  // Get recent executions
  const recentExecutions = executions
    ?.sort((a: any, b: any) => 
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
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
  
  // Calculate summary metrics
  const totalWorkflows = executions?.length || 0;
  const completedWorkflows = executions?.filter((e: any) => 
    e.status.toLowerCase() === 'completed'
  ).length || 0;
  const activeWorkflows = executions?.filter((e: any) => 
    e.status.toLowerCase() === 'running' || e.status.toLowerCase() === 'pending'
  ).length || 0;
  
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle>Agent Workflows</CardTitle>
        <CardDescription>
          Summary of your LangGraph workflows
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
            {/* Summary Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-muted rounded-md p-3 text-center">
                <div className="text-2xl font-bold">{totalWorkflows}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div className="bg-muted rounded-md p-3 text-center">
                <div className="text-2xl font-bold">{activeWorkflows}</div>
                <div className="text-xs text-muted-foreground">Active</div>
              </div>
              <div className="bg-muted rounded-md p-3 text-center">
                <div className="text-2xl font-bold">{completedWorkflows}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
            </div>
            
            {/* Recent Workflows */}
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Recent Workflows</h3>
              {recentExecutions?.length === 0 ? (
                <div className="text-center py-3 text-sm text-muted-foreground">
                  No workflows found.
                </div>
              ) : (
                <div className="space-y-2">
                  {recentExecutions?.map((execution: any) => (
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
                          {formatDate(execution.startedAt)}
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
