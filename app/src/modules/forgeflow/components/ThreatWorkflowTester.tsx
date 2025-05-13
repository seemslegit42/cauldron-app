import React, { useState } from 'react';
import { useAction } from 'wasp/client/operations';
import { executeThreatResearchWorkflow } from '../api/operations';
import { Button } from '@src/shared/components/ui/button';
import { Input } from '@src/shared/components/ui/input';
import { Textarea } from '@src/shared/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@src/shared/components/ui/card';
import { Label } from '@src/shared/components/ui/label';
import { Spinner } from '@src/shared/components/ui/spinner';
import { Alert, AlertDescription, AlertTitle } from '@src/shared/components/ui/alert';
import { Badge } from '@src/shared/components/ui/badge';

export function ThreatWorkflowTester() {
  const [inputThreat, setInputThreat] = useState('');
  const [projectName, setProjectName] = useState('Phantom');
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const executeThreatWorkflowAction = useAction(executeThreatResearchWorkflow);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecute = async () => {
    if (!inputThreat || !projectName) {
      setError('Please provide both input threat and project name');
      return;
    }

    setIsExecuting(true);
    setError(null);

    try {
      const result = await executeThreatWorkflowAction({
        input_threat: inputThreat,
        project_name: projectName,
        workflowId: workflowId || undefined,
      });

      setResult(result);
      setWorkflowId(result.workflowId);
    } catch (err: any) {
      console.error('Error executing threat workflow:', err);
      setError(err.message || 'An error occurred while executing the workflow');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Threat Research Workflow Tester</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Input Parameters</CardTitle>
            <CardDescription>
              Enter the threat to analyze and the project name
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="input-threat">Threat Description</Label>
                <Textarea
                  id="input-threat"
                  placeholder="Enter a description of the threat to analyze"
                  value={inputThreat}
                  onChange={(e) => setInputThreat(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  placeholder="Enter the project name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>

              {workflowId && (
                <div className="space-y-2">
                  <Label htmlFor="workflow-id">Workflow ID</Label>
                  <div className="flex items-center">
                    <Input
                      id="workflow-id"
                      value={workflowId}
                      readOnly
                      className="bg-muted"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-2"
                      onClick={() => setWorkflowId(null)}
                    >
                      Clear
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Using the same workflow ID will link executions together in the database
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleExecute}
              disabled={isExecuting || !inputThreat || !projectName}
              className="w-full"
            >
              {isExecuting ? (
                <>
                  <Spinner className="mr-2" />
                  Executing Workflow...
                </>
              ) : (
                'Execute Workflow'
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workflow Result</CardTitle>
            <CardDescription>
              The result of the threat research and drafting workflow
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isExecuting && (
              <div className="flex items-center justify-center py-8">
                <Spinner size="lg" />
                <span className="ml-2">Processing...</span>
              </div>
            )}

            {!isExecuting && result && (
              <div className="space-y-4">
                {result.workflowId && result.executionId && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className="text-xs">
                      Workflow ID: {result.workflowId.substring(0, 8)}...
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Execution ID: {result.executionId.substring(0, 8)}...
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-2"
                      onClick={() => window.location.href = `/forgeflow/execution/${result.executionId}`}
                    >
                      View Details
                    </Button>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-medium">Research Result</h3>
                  <pre className="bg-muted p-4 rounded-md text-sm mt-2 overflow-auto max-h-[200px]">
                    {JSON.stringify(result.research_result, null, 2)}
                  </pre>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Draft Summary</h3>
                  <div className="bg-muted p-4 rounded-md mt-2 whitespace-pre-wrap">
                    {result.draft_summary}
                  </div>
                </div>
              </div>
            )}

            {!isExecuting && !result && !error && (
              <div className="text-center py-8 text-muted-foreground">
                Execute the workflow to see results
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
