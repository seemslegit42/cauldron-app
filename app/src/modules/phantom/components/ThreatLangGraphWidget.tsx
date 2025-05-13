import React, { useState, useCallback } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
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
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@src/shared/components/ui/dialog';
import { Input } from '@src/shared/components/ui/input';
import { Label } from '@src/shared/components/ui/label';
import { format } from 'date-fns';

import { getUserWorkflowExecutions } from '@src/modules/forgeflow/api/operations';
import { executeThreatResearchWorkflow } from '@src/modules/forgeflow/api/operations';

export interface ThreatLangGraphWidgetProps {
  className?: string;
  maxItems?: number;
}

export const ThreatLangGraphWidget: React.FC<ThreatLangGraphWidgetProps> = ({
  className = '',
  maxItems = 5,
}) => {
  const navigate = useNavigate();
  const [newWorkflowDialog, setNewWorkflowDialog] = useState<boolean>(false);
  const [threatInput, setThreatInput] = useState<string>('');
  const [projectName, setProjectName] = useState<string>('');
  
  // Query for user workflow executions
  const { 
    data: executions, 
    isLoading, 
    error,
    refetch: refetchExecutions
  } = useQuery(getUserWorkflowExecutions);
  
  // Action to execute a workflow
  const executeWorkflowAction = useAction(executeThreatResearchWorkflow);
  
  // Filter executions to only show threat research workflows
  const threatWorkflows = executions
    ?.filter((execution: any) => 
      execution.workflow.name.toLowerCase().includes('threat') ||
      (execution.langGraphState?.name || '').toLowerCase().includes('threat')
    )
    .slice(0, maxItems);
  
  // Handle new workflow submission
  const handleNewWorkflow = useCallback(async () => {
    if (!threatInput || !projectName) return;
    
    try {
      const result = await executeWorkflowAction({
        input_threat: threatInput,
        project_name: projectName,
      });
      
      setNewWorkflowDialog(false);
      setThreatInput('');
      setProjectName('');
      
      // Refetch executions
      refetchExecutions();
    } catch (error) {
      console.error('Error executing workflow:', error);
    }
  }, [threatInput, projectName, executeWorkflowAction, refetchExecutions]);
  
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
  
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Threat Research Workflows</CardTitle>
            <CardDescription>
              LangGraph-powered threat analysis
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => setNewWorkflowDialog(true)}>
            New Analysis
          </Button>
        </div>
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
        ) : threatWorkflows?.length === 0 ? (
          <div className="text-center py-4 text-sm text-muted-foreground">
            No threat research workflows found.
          </div>
        ) : (
          <div className="space-y-3">
            {threatWorkflows?.map((execution: any) => (
              <div 
                key={execution.id} 
                className="flex justify-between items-center p-3 rounded-md border hover:bg-muted/50 cursor-pointer"
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
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="outline" size="sm" className="w-full" onClick={handleViewAll}>
          View All Workflows
        </Button>
      </CardFooter>
      
      {/* New Workflow Dialog */}
      <Dialog open={newWorkflowDialog} onOpenChange={setNewWorkflowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Threat Analysis</DialogTitle>
            <DialogDescription>
              Create a new threat research workflow
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="threat-input" className="text-right">
                Threat Input
              </Label>
              <Input
                id="threat-input"
                value={threatInput}
                onChange={(e) => setThreatInput(e.target.value)}
                className="col-span-3"
                placeholder="Describe the threat to research"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="project-name" className="text-right">
                Project Name
              </Label>
              <Input
                id="project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="col-span-3"
                placeholder="Enter a name for this project"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewWorkflowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleNewWorkflow} disabled={!threatInput || !projectName}>
              Start Analysis
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
