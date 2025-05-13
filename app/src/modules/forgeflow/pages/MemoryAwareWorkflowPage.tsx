import React, { useState } from 'react';
import { useAction, useQuery } from 'wasp/client/operations';
import { executeMemoryAwareWorkflow, getMemoryAwareWorkflowExecution } from 'wasp/client/operations';
import { PageLayout } from '@src/shared/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@src/shared/components/ui/card';
import { Button } from '@src/shared/components/ui/button';
import { Input } from '@src/shared/components/ui/input';
import { Textarea } from '@src/shared/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@src/shared/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@src/shared/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { LangGraphVisualizer } from '../components/LangGraphVisualizer';

export function MemoryAwareWorkflowPage() {
  const [query, setQuery] = useState('');
  const [graphStateId, setGraphStateId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('query');
  
  const { data: executionData, isLoading: isLoadingExecution } = useQuery(
    getMemoryAwareWorkflowExecution,
    { graphStateId },
    { enabled: !!graphStateId }
  );
  
  const { 
    data: workflowResult, 
    isLoading: isExecuting, 
    error: executionError 
  } = useAction(executeMemoryAwareWorkflow);
  
  const handleExecute = async () => {
    if (!query.trim()) return;
    
    try {
      const result = await executeMemoryAwareWorkflow({ query });
      setGraphStateId(result.graphStateId);
      setActiveTab('result');
    } catch (error) {
      console.error('Error executing workflow:', error);
    }
  };
  
  return (
    <PageLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Memory-Aware Workflow</h1>
          <p className="text-muted-foreground mt-2">
            Test the memory-aware workflow that uses LangGraph and the Memory Store
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Query</CardTitle>
                <CardDescription>
                  Enter a query to test the memory-aware workflow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Textarea
                      placeholder="Enter your query here..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="min-h-[120px]"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleExecute} 
                  disabled={isExecuting || !query.trim()}
                  className="w-full"
                >
                  {isExecuting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isExecuting ? 'Executing...' : 'Execute Workflow'}
                </Button>
              </CardFooter>
            </Card>
            
            {executionError && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {executionError.message || 'An error occurred while executing the workflow.'}
                </AlertDescription>
              </Alert>
            )}
            
            {workflowResult && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Execution Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Status:</span>{' '}
                      <span className={workflowResult.status === 'COMPLETED' ? 'text-green-500' : 'text-red-500'}>
                        {workflowResult.status}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span>{' '}
                      {Math.round(workflowResult.duration / 1000)} seconds
                    </div>
                    <div>
                      <span className="font-medium">Memory ID:</span>{' '}
                      {workflowResult.storedMemoryId || 'N/A'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="query">Query</TabsTrigger>
                    <TabsTrigger value="result">Result</TabsTrigger>
                    <TabsTrigger value="memories">Memories</TabsTrigger>
                    <TabsTrigger value="graph">Graph</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                <TabsContent value="query" className="mt-0">
                  <div className="min-h-[400px]">
                    <p className="text-muted-foreground">
                      Enter a query on the left to test the memory-aware workflow.
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="result" className="mt-0">
                  <div className="min-h-[400px]">
                    {workflowResult ? (
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-medium">Response</h3>
                          <div className="mt-2 p-4 bg-muted rounded-md">
                            {workflowResult.response || 'No response generated.'}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        No result available. Execute a workflow first.
                      </p>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="memories" className="mt-0">
                  <div className="min-h-[400px]">
                    {workflowResult?.relevantMemories ? (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Relevant Memories</h3>
                        {workflowResult.relevantMemories.length > 0 ? (
                          <div className="space-y-2">
                            {workflowResult.relevantMemories.map((memory: any, index: number) => (
                              <Card key={memory.id || index}>
                                <CardContent className="p-4">
                                  <div className="space-y-2">
                                    <div>
                                      <span className="font-medium">Context:</span> {memory.context}
                                    </div>
                                    <div>
                                      <span className="font-medium">Content:</span>{' '}
                                      <pre className="mt-1 p-2 bg-muted rounded-md text-sm whitespace-pre-wrap">
                                        {JSON.stringify(memory.content, null, 2)}
                                      </pre>
                                    </div>
                                    <div>
                                      <span className="font-medium">Similarity:</span>{' '}
                                      {Math.round(memory.similarity * 100)}%
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">No relevant memories found.</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        No memories available. Execute a workflow first.
                      </p>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="graph" className="mt-0">
                  <div className="min-h-[400px]">
                    {graphStateId ? (
                      <LangGraphVisualizer
                        graphStateId={graphStateId}
                        autoRefresh={false}
                        showControls={true}
                        showMiniMap={true}
                        height="400px"
                      />
                    ) : (
                      <p className="text-muted-foreground">
                        No graph available. Execute a workflow first.
                      </p>
                    )}
                  </div>
                </TabsContent>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
