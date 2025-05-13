import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'wasp/client/operations';
import { getWorkflowExecutionById } from '../api/operations';
import { PageLayout } from '@src/shared/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@src/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@src/shared/components/ui/tabs';
import { Badge } from '@src/shared/components/ui/badge';
import { Spinner } from '@src/shared/components/ui/spinner';
import { Alert, AlertDescription, AlertTitle } from '@src/shared/components/ui/alert';
import { Button } from '@src/shared/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function LangGraphExecutionPage() {
  const { executionId } = useParams<{ executionId: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  
  const { data: execution, isLoading, error } = useQuery(getWorkflowExecutionById, { 
    executionId: executionId || '' 
  });
  
  if (isLoading) {
    return (
      <PageLayout>
        <div className="container mx-auto py-8 flex items-center justify-center min-h-[60vh]">
          <Spinner size="lg" />
          <span className="ml-2">Loading execution details...</span>
        </div>
      </PageLayout>
    );
  }
  
  if (error) {
    return (
      <PageLayout>
        <div className="container mx-auto py-8">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error.message || 'Failed to load execution details'}
            </AlertDescription>
          </Alert>
        </div>
      </PageLayout>
    );
  }
  
  if (!execution) {
    return (
      <PageLayout>
        <div className="container mx-auto py-8">
          <Alert>
            <AlertTitle>Not Found</AlertTitle>
            <AlertDescription>
              The execution with ID {executionId} was not found.
            </AlertDescription>
          </Alert>
        </div>
      </PageLayout>
    );
  }
  
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString();
  };
  
  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'pending': 'outline',
      'running': 'info',
      'completed': 'success',
      'failed': 'destructive',
    };
    
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status}
      </Badge>
    );
  };
  
  return (
    <PageLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.history.back()}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Workflow Execution</h1>
              <p className="text-muted-foreground mt-1">
                {execution.workflow?.name || 'Unknown Workflow'}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 space-y-2 md:space-y-0 md:space-x-2">
              {getStatusBadge(execution.status)}
              <Badge variant="outline" className="ml-2">
                ID: {execution.id.substring(0, 8)}...
              </Badge>
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="state">State</TabsTrigger>
            <TabsTrigger value="nodes">Nodes</TabsTrigger>
            <TabsTrigger value="executions">Executions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Execution Details</CardTitle>
                <CardDescription>
                  Details about this workflow execution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                    <p>{getStatusBadge(execution.status)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Workflow</h3>
                    <p>{execution.workflow?.name || 'Unknown'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Started At</h3>
                    <p>{formatDate(execution.startedAt)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Completed At</h3>
                    <p>{execution.completedAt ? formatDate(execution.completedAt) : 'Not completed'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Duration</h3>
                    <p>
                      {execution.completedAt 
                        ? `${Math.round((new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime()) / 1000)} seconds` 
                        : 'In progress'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">LangGraph</h3>
                    <p>{execution.isLangGraph ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {execution.error && (
              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle>Error</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
                    {execution.error}
                  </pre>
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle>Results</CardTitle>
                <CardDescription>
                  The results of this workflow execution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-md text-sm overflow-auto max-h-[400px]">
                  {JSON.stringify(execution.results, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="state" className="space-y-4">
            {execution.langGraphState ? (
              <Card>
                <CardHeader>
                  <CardTitle>LangGraph State</CardTitle>
                  <CardDescription>
                    The state of the LangGraph execution
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Graph ID</h3>
                      <p>{execution.langGraphState.graphId}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                      <p>{getStatusBadge(execution.langGraphState.status)}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
                      <p>{formatDate(execution.langGraphState.createdAt)}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Last Checkpointed</h3>
                      <p>{formatDate(execution.langGraphState.checkpointedAt)}</p>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-medium mb-2">State</h3>
                  <pre className="bg-muted p-4 rounded-md text-sm overflow-auto max-h-[400px]">
                    {JSON.stringify(execution.langGraphState.state, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            ) : (
              <Alert>
                <AlertTitle>No LangGraph State</AlertTitle>
                <AlertDescription>
                  This execution does not have a LangGraph state.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
          
          <TabsContent value="nodes" className="space-y-4">
            {execution.langGraphState?.nodes && execution.langGraphState.nodes.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Graph Nodes</CardTitle>
                  <CardDescription>
                    The nodes in the LangGraph execution
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {execution.langGraphState.nodes.map((node: any) => (
                      <div key={node.id} className="border rounded-md p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium">{node.nodeId}</h3>
                            <p className="text-sm text-muted-foreground">Type: {node.type}</p>
                          </div>
                          <Badge variant="outline">{node.id.substring(0, 8)}...</Badge>
                        </div>
                        
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">Configuration</h4>
                          <pre className="bg-muted p-2 rounded-md text-xs overflow-auto max-h-[200px]">
                            {JSON.stringify(node.config, null, 2)}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Alert>
                <AlertTitle>No Nodes</AlertTitle>
                <AlertDescription>
                  This execution does not have any LangGraph nodes.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
          
          <TabsContent value="executions" className="space-y-4">
            {execution.langGraphState?.nodeExecutions && execution.langGraphState.nodeExecutions.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Node Executions</CardTitle>
                  <CardDescription>
                    The executions of nodes in the LangGraph
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {execution.langGraphState.nodeExecutions.map((nodeExecution: any) => (
                      <div key={nodeExecution.id} className="border rounded-md p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium">
                              {execution.langGraphState?.nodes.find((n: any) => n.id === nodeExecution.nodeId)?.nodeId || 'Unknown Node'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Started: {formatDate(nodeExecution.startedAt)}
                              {nodeExecution.completedAt && ` • Completed: ${formatDate(nodeExecution.completedAt)}`}
                              {nodeExecution.duration && ` • Duration: ${nodeExecution.duration}ms`}
                            </p>
                          </div>
                          {getStatusBadge(nodeExecution.status)}
                        </div>
                        
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium mb-2">Input</h4>
                            <pre className="bg-muted p-2 rounded-md text-xs overflow-auto max-h-[200px]">
                              {JSON.stringify(nodeExecution.input, null, 2)}
                            </pre>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-2">Output</h4>
                            {nodeExecution.output ? (
                              <pre className="bg-muted p-2 rounded-md text-xs overflow-auto max-h-[200px]">
                                {JSON.stringify(nodeExecution.output, null, 2)}
                              </pre>
                            ) : (
                              <p className="text-sm text-muted-foreground">No output</p>
                            )}
                          </div>
                        </div>
                        
                        {nodeExecution.error && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2 text-destructive">Error</h4>
                            <pre className="bg-destructive/10 p-2 rounded-md text-xs overflow-auto max-h-[200px] text-destructive">
                              {nodeExecution.error}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Alert>
                <AlertTitle>No Node Executions</AlertTitle>
                <AlertDescription>
                  This execution does not have any node executions.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
