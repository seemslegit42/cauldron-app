import React, { useState, useCallback, useEffect } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout } from '@src/shared/components/layout/PageLayout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@src/shared/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@src/shared/components/ui/tabs';
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
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@src/shared/components/ui/table';
import { format } from 'date-fns';

import { LangGraphVisualizer } from '../components/LangGraphVisualizer';
import { LangGraphFilters, LangGraphFilters as FiltersType } from '../components/LangGraphFilters';
import { LangGraphSearch } from '../components/LangGraphSearch';
import { 
  getUserWorkflowExecutions, 
  executeThreatResearchWorkflow 
} from '../api/operations';

export function LangGraphDashboardPage() {
  const navigate = useNavigate();
  const { executionId } = useParams<{ executionId?: string }>();
  const [activeTab, setActiveTab] = useState<string>(executionId ? 'visualizer' : 'executions');
  const [filters, setFilters] = useState<FiltersType>({});
  const [selectedExecution, setSelectedExecution] = useState<string | null>(executionId || null);
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
  
  // Filter executions based on filters
  const filteredExecutions = executions?.filter((execution: any) => {
    // Filter by status
    if (filters.status && filters.status !== 'all' && execution.status.toLowerCase() !== filters.status.toLowerCase()) {
      return false;
    }
    
    // Filter by date range
    if (filters.dateRange?.from) {
      const executionDate = new Date(execution.startedAt);
      const fromDate = new Date(filters.dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      
      if (executionDate < fromDate) {
        return false;
      }
      
      if (filters.dateRange.to) {
        const toDate = new Date(filters.dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        
        if (executionDate > toDate) {
          return false;
        }
      }
    }
    
    // Filter by workflow type
    if (filters.workflowType && filters.workflowType !== 'all') {
      // This is a simplified check - in a real app, you'd have a proper type field
      const workflowType = execution.workflow.name.toLowerCase().includes('threat') 
        ? 'threat_research' 
        : 'custom';
      
      if (workflowType !== filters.workflowType) {
        return false;
      }
    }
    
    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        execution.workflow.name.toLowerCase().includes(searchLower) ||
        execution.id.toLowerCase().includes(searchLower) ||
        (execution.langGraphState?.name || '').toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });
  
  // Handle filter change
  const handleFilterChange = useCallback((newFilters: FiltersType) => {
    setFilters(newFilters);
  }, []);
  
  // Handle execution selection
  const handleExecutionSelect = useCallback((executionId: string) => {
    setSelectedExecution(executionId);
    setActiveTab('visualizer');
    navigate(`/forgeflow/langgraph/${executionId}`);
  }, [navigate]);
  
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
      
      // Navigate to the new execution
      if (result?.executionId) {
        handleExecutionSelect(result.executionId);
      }
      
      // Refetch executions
      refetchExecutions();
    } catch (error) {
      console.error('Error executing workflow:', error);
    }
  }, [threatInput, projectName, executeWorkflowAction, handleExecutionSelect, refetchExecutions]);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
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
    <PageLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">LangGraph Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Visualize and manage your LangGraph workflows
            </p>
          </div>
          
          <Button onClick={() => setNewWorkflowDialog(true)}>
            New Workflow
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="executions">Executions</TabsTrigger>
            <TabsTrigger value="visualizer" disabled={!selectedExecution}>
              Visualizer
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="executions" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Executions</CardTitle>
                <CardDescription>
                  View and manage your LangGraph workflow executions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <LangGraphFilters 
                    onFilterChange={handleFilterChange} 
                  />
                </div>
                
                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Spinner size="lg" />
                    <span className="ml-2">Loading executions...</span>
                  </div>
                ) : error ? (
                  <Alert variant="destructive">
                    <AlertDescription>
                      Error loading executions: {error.message || 'Unknown error'}
                    </AlertDescription>
                  </Alert>
                ) : filteredExecutions?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No executions found matching your filters.
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Workflow</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Started</TableHead>
                          <TableHead>Completed</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredExecutions?.map((execution: any) => (
                          <TableRow 
                            key={execution.id}
                            className={selectedExecution === execution.id ? 'bg-muted/50' : ''}
                          >
                            <TableCell className="font-medium">
                              {execution.workflow.name}
                              {execution.langGraphState && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {execution.langGraphState.name}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(execution.status)}>
                                {execution.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {formatDate(execution.startedAt)}
                            </TableCell>
                            <TableCell>
                              {execution.completedAt 
                                ? formatDate(execution.completedAt)
                                : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleExecutionSelect(execution.id)}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="visualizer" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Visualizer</CardTitle>
                <CardDescription>
                  Visualize the execution of your LangGraph workflow
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedExecution ? (
                  <div className="h-[600px]">
                    <LangGraphVisualizer 
                      executionId={selectedExecution}
                      autoRefresh={true}
                      refreshInterval={3000}
                      height="600px"
                    />
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Select an execution to visualize
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* New Workflow Dialog */}
      <Dialog open={newWorkflowDialog} onOpenChange={setNewWorkflowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Workflow</DialogTitle>
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
              Create Workflow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
