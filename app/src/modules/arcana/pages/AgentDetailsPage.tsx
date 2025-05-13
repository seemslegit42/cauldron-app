import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'wasp/client/operations';
import { getAgentById } from '@src/api/routes/agents/getAgentById';
import { PageHeader } from '@src/shared/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@src/shared/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@src/shared/components/ui/Tabs';
import { Button } from '@src/shared/components/ui/Button';
import { Skeleton } from '@src/shared/components/ui/Skeleton';
import { Badge } from '@src/shared/components/ui/Badge';
import { AgentTrustScore } from '@src/shared/components/ai/AgentTrustScore';
import { AgentFeedbackWidget } from '@src/shared/components/ai/AgentFeedbackWidget';
import { 
  Settings, 
  MessageSquare, 
  BarChart, 
  Shield, 
  Award, 
  History, 
  ExternalLink 
} from 'lucide-react';

/**
 * Page for displaying agent details
 */
const AgentDetailsPage: React.FC = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Get agent details
  const {
    data: agent,
    isLoading,
    error,
  } = useQuery(getAgentById, { id: agentId });
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <PageHeader
          title={<Skeleton className="h-8 w-64" />}
          description={<Skeleton className="h-4 w-96" />}
        />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }
  
  if (!agent) {
    return (
      <div className="container mx-auto py-6">
        <PageHeader
          title="Agent Not Found"
          description="The requested agent could not be found."
        />
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <p>The agent you're looking for doesn't exist or you don't have permission to view it.</p>
              <Button className="mt-4" variant="outline" onClick={() => window.history.back()}>
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title={agent.name}
        description={agent.description}
        actions={
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link to={`/agents/${agentId}/trust`} className="flex items-center">
                <Award className="mr-2 h-4 w-4" />
                Trust Score
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={`/agents/${agentId}/settings`} className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
          </div>
        }
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="interactions">Interactions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Agent Details</CardTitle>
                  <CardDescription>Information about this agent</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium">Description</h4>
                      <p className="text-sm text-muted-foreground">{agent.description}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium">Type</h4>
                        <p className="text-sm text-muted-foreground">{agent.type}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Status</h4>
                        <Badge variant={agent.isActive ? "success" : "destructive"}>
                          {agent.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Model</h4>
                        <p className="text-sm text-muted-foreground">{agent.model}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Provider</h4>
                        <p className="text-sm text-muted-foreground">{agent.provider}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Capabilities</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {agent.capabilities.map((capability) => (
                          <Badge key={capability} variant="secondary">
                            {capability}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <AgentTrustScore 
                agentId={agentId!} 
                showBadges={false} 
                showStats={false}
                showTrustPageLink={true}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest agent activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <History className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                  <p className="mt-2 text-muted-foreground">Activity history coming soon</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View All Activity
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Provide Feedback</CardTitle>
                <CardDescription>Rate this agent's performance</CardDescription>
              </CardHeader>
              <CardContent>
                <AgentFeedbackWidget agentId={agentId!} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="interactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Interactions</CardTitle>
              <CardDescription>Recent conversations and interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                <p className="mt-2 text-muted-foreground">Interaction history coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Agent performance and statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <BarChart className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                <p className="mt-2 text-muted-foreground">Performance metrics coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentDetailsPage;
