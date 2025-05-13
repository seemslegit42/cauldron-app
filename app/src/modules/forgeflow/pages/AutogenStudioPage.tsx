import React, { useState, useEffect, useRef } from 'react';
import { PageLayout } from '@src/shared/components/layout/PageLayout';
import { Button } from '@src/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@src/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@src/shared/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@src/shared/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle, Server } from 'lucide-react';
import { useToast } from '@src/shared/components/ui/use-toast';
import {
  useAutogenStudioStatus,
  useStartAutogenStudioServer,
  useStopAutogenStudioServer,
  getAutogenStudioUrl
} from '../services/autogenStudioService';

export function AutogenStudioPage() {
  const [serverStatus, setServerStatus] = useState<'starting' | 'running' | 'stopped'>('stopped');
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  // Use Wasp hooks
  const { data: statusData, isLoading, error: statusError } = useAutogenStudioStatus();
  const startServerAction = useStartAutogenStudioServer();
  const stopServerAction = useStopAutogenStudioServer();

  // Update server status when the status data changes
  useEffect(() => {
    if (statusData) {
      if (statusData.running) {
        setServerStatus('running');
        setServerUrl(getAutogenStudioUrl());
      } else {
        setServerStatus('stopped');
        setServerUrl(null);
      }
    }
  }, [statusData]);

  // Handle errors
  useEffect(() => {
    if (statusError) {
      console.error('Error checking server status:', statusError);
      toast({
        variant: 'destructive',
        title: 'Status Check Error',
        description: 'Failed to check Autogen Studio server status',
        duration: 5000,
      });
    }
  }, [statusError, toast]);

  const handleStartServer = async () => {
    try {
      setServerStatus('starting');
      toast({
        title: 'Starting Autogen Studio Server',
        description: 'This may take a few moments...',
        duration: 3000,
      });

      const result = await startServerAction({
        port: 8081,
        host: 'localhost'
      });

      if (result.success) {
        setServerStatus('running');
        setServerUrl(getAutogenStudioUrl());
        toast({
          title: 'Server Started',
          description: 'Autogen Studio server is now running',
          duration: 3000,
        });
      } else {
        setServerStatus('stopped');
        toast({
          variant: 'destructive',
          title: 'Server Error',
          description: result.message || 'Failed to start Autogen Studio server',
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error starting server:', error);
      setServerStatus('stopped');
      toast({
        variant: 'destructive',
        title: 'Server Error',
        description: 'An unexpected error occurred while starting the server',
        duration: 5000,
      });
    }
  };

  return (
    <PageLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Autogen Studio</h1>
            <p className="text-muted-foreground mt-2">
              Build and test multi-agent workflows with Microsoft's Autogen Studio
            </p>
          </div>
          <div className="flex items-center gap-2">
            {serverStatus === 'running' ? (
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle size={16} />
                <span>Server Running</span>
              </div>
            ) : serverStatus === 'starting' ? (
              <div className="flex items-center gap-2 text-yellow-500">
                <Loader2 size={16} className="animate-spin" />
                <span>Server Starting...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-500">
                <AlertCircle size={16} />
                <span>Server Stopped</span>
              </div>
            )}
            {serverStatus !== 'running' && (
              <Button
                onClick={handleStartServer}
                disabled={serverStatus === 'starting' || isLoading}
                className="ml-4"
              >
                {serverStatus === 'starting' ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Server size={16} className="mr-2" />
                    Start Server
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <Card className="w-full h-[600px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Loading Autogen Studio...</p>
          </Card>
        ) : serverStatus === 'running' && serverUrl ? (
          <Card className="w-full h-[800px] overflow-hidden">
            <CardContent className="p-0 h-full">
              <iframe
                ref={iframeRef}
                src={serverUrl}
                className="w-full h-full border-0"
                title="Autogen Studio"
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Autogen Studio</CardTitle>
              <CardDescription>
                A powerful interface for building and testing multi-agent systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Server Not Running</AlertTitle>
                <AlertDescription>
                  The Autogen Studio server is not currently running. Click the "Start Server" button above to launch it.
                </AlertDescription>
              </Alert>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">What is Autogen Studio?</h3>
                <p className="text-muted-foreground">
                  Autogen Studio is a low-code interface built to help you rapidly prototype AI agents,
                  enhance them with tools, compose them into teams and interact with them to accomplish tasks.
                  It is built on AutoGen AgentChat - a high-level API for building multi-agent applications.
                </p>

                <h3 className="text-lg font-medium mt-4 mb-2">Key Features</h3>
                <ul className="list-disc pl-5 text-muted-foreground">
                  <li>Visual interface for creating agent teams</li>
                  <li>Interactive playground for testing and running agent teams</li>
                  <li>Live message streaming between agents</li>
                  <li>Visual representation of message flow</li>
                  <li>Full run control with the ability to pause or stop execution</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
