import React, { useState } from 'react';
import { useQuery } from 'wasp/client/operations';
import { getFailureStats } from '@wasp/queries/getFailureStats';
import { SentientLoopFailureManager } from '../components/SentientLoopFailureManager';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  AlertCircle, 
  Clock, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Shield,
  BarChart4,
  History,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { PageHeader } from '@/components/ui/page-header';
import { DashboardShell } from '@/components/dashboard-shell';

/**
 * Page for managing Sentient Loop failures and recovery
 */
export default function FailureRecoveryPage() {
  // State for selected module
  const [selectedModule, setSelectedModule] = useState<string | undefined>(undefined);
  
  // Get failure statistics
  const { data: failureStats, isLoading, error, refetch } = useQuery(getFailureStats, { moduleId: selectedModule });
  
  // Handle module selection
  const handleModuleChange = (value: string) => {
    setSelectedModule(value === 'all' ? undefined : value);
  };
  
  return (
    <DashboardShell>
      <PageHeader
        heading="Sentient Loop™ Failure Recovery"
        description="Monitor and recover from Sentient Loop failures across all modules"
        actions={
          <div className="flex items-center space-x-2">
            <Select
              value={selectedModule || 'all'}
              onValueChange={handleModuleChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                <SelectItem value="arcana">Arcana</SelectItem>
                <SelectItem value="phantom">Phantom</SelectItem>
                <SelectItem value="sentinel">Sentinel</SelectItem>
                <SelectItem value="forgeflow">Forgeflow</SelectItem>
                <SelectItem value="manifold">Manifold</SelectItem>
                <SelectItem value="cauldron-prime">Cauldron Prime</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner size="sm" className="mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        }
      />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Failures
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Spinner size="sm" />
              ) : (
                failureStats?.activeFailures?.length || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {selectedModule || 'all'} modules
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recovery Success Rate
            </CardTitle>
            <BarChart4 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Spinner size="sm" />
              ) : (
                `${Math.round((failureStats?.recoverySuccessRate || 0) * 100)}%`
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Recovery Time
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Spinner size="sm" />
              ) : (
                `${failureStats?.averageTimeToResolve || 0} min`
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              From detection to resolution
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Auto-Resolved
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Spinner size="sm" />
              ) : (
                failureStats?.autoResolvedFailures || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Resolved without human intervention
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="active" className="mt-6">
        <TabsList>
          <TabsTrigger value="active">Active Failures</TabsTrigger>
          <TabsTrigger value="history">Failure History</TabsTrigger>
          <TabsTrigger value="settings">Recovery Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-4">
          <SentientLoopFailureManager 
            moduleId={selectedModule}
            showHeader={false}
            maxFailures={10}
            onRecoveryComplete={() => refetch()}
          />
        </TabsContent>
        
        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Failure History</CardTitle>
              <CardDescription>
                View past failures and their resolution details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-8 text-muted-foreground">
                <History className="h-8 w-8 mr-2" />
                <span>Failure history will be implemented in a future update</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recovery Settings</CardTitle>
              <CardDescription>
                Configure automatic recovery behavior and thresholds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-8 text-muted-foreground">
                <Settings className="h-8 w-8 mr-2" />
                <span>Recovery settings will be implemented in a future update</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
