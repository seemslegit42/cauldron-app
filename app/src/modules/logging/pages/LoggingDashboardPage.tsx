import React, { useState, useEffect } from 'react';
import { useQuery } from 'wasp/client/react';
import { getSystemLogs, getAgentLogs, getApiInteractions, getHumanApprovals } from '@wasp/queries/logs';
import { LogLevel, EventCategory, ApprovalStatus, ApiStatus } from '../../../shared/services/logging';
import { exportLogs } from '@wasp/actions/logs';
import { formatDistanceToNow } from 'date-fns';

// Components
import LogTable from '../../../components/logging/LogTable';
import LogFilters from '../../../components/logging/LogFilters';
import LogDetails from '../../../components/logging/LogDetails';
import LogExport from '../../../components/logging/LogExport';
import LogRetentionSettings from '../../../components/logging/LogRetentionSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Loader2 } from 'lucide-react';

// Types
type LogType = 'system' | 'agent' | 'api' | 'approval';
type LogEntry = any; // We'll use a generic type for now

const LoggingDashboardPage: React.FC = () => {
  // State
  const [logType, setLogType] = useState<LogType>('system');
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
    endDate: new Date(),
    level: [] as LogLevel[],
    category: [] as EventCategory[],
    userId: '',
    agentId: '',
    search: '',
    tags: [] as string[],
    limit: 100,
  });

  // Queries
  const {
    data: systemLogs,
    isLoading: isLoadingSystemLogs,
    error: systemLogsError,
  } = useQuery(getSystemLogs, filters);

  const {
    data: agentLogs,
    isLoading: isLoadingAgentLogs,
    error: agentLogsError,
  } = useQuery(getAgentLogs, filters);

  const {
    data: apiInteractions,
    isLoading: isLoadingApiInteractions,
    error: apiInteractionsError,
  } = useQuery(getApiInteractions, filters);

  const {
    data: humanApprovals,
    isLoading: isLoadingHumanApprovals,
    error: humanApprovalsError,
  } = useQuery(getHumanApprovals, filters);

  // Derived state
  const isLoading = 
    isLoadingSystemLogs || 
    isLoadingAgentLogs || 
    isLoadingApiInteractions || 
    isLoadingHumanApprovals;

  const error = 
    systemLogsError || 
    agentLogsError || 
    apiInteractionsError || 
    humanApprovalsError;

  const logs = {
    system: systemLogs || [],
    agent: agentLogs || [],
    api: apiInteractions || [],
    approval: humanApprovals || [],
  };

  const currentLogs = logs[logType] || [];

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Handle log selection
  const handleLogSelect = (log: LogEntry) => {
    setSelectedLog(log);
  };

  // Handle log export
  const handleExport = async (format: 'json' | 'csv') => {
    try {
      await exportLogs({
        logType,
        filters,
        format,
      });
    } catch (error) {
      console.error('Failed to export logs:', error);
    }
  };

  // Reset selected log when changing log type
  useEffect(() => {
    setSelectedLog(null);
  }, [logType]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Logging Dashboard</h1>
          <p className="text-muted-foreground">
            View and analyze system logs, agent actions, API interactions, and human approvals
          </p>
        </div>
        <LogExport onExport={handleExport} isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Refine the logs displayed</CardDescription>
            </CardHeader>
            <CardContent>
              <LogFilters filters={filters} onChange={handleFilterChange} />
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Log Retention</CardTitle>
              <CardDescription>Configure log retention policies</CardDescription>
            </CardHeader>
            <CardContent>
              <LogRetentionSettings />
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Tabs value={logType} onValueChange={(value) => setLogType(value as LogType)}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="system">
                System Logs
                {systemLogs && <Badge className="ml-2">{systemLogs.length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="agent">
                Agent Logs
                {agentLogs && <Badge className="ml-2">{agentLogs.length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="api">
                API Interactions
                {apiInteractions && <Badge className="ml-2">{apiInteractions.length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="approval">
                Human Approvals
                {humanApprovals && <Badge className="ml-2">{humanApprovals.length}</Badge>}
              </TabsTrigger>
            </TabsList>

            {isLoading ? (
              <div className="flex justify-center items-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading logs...</span>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-96 text-destructive">
                <p>Error loading logs: {error.message}</p>
              </div>
            ) : currentLogs.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-96 text-muted-foreground">
                <p>No logs found matching the current filters.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setFilters({
                    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
                    endDate: new Date(),
                    level: [],
                    category: [],
                    userId: '',
                    agentId: '',
                    search: '',
                    tags: [],
                    limit: 100,
                  })}
                >
                  Reset Filters
                </Button>
              </div>
            ) : (
              <>
                <TabsContent value="system" className="mt-0">
                  <LogTable logs={systemLogs} onSelectLog={handleLogSelect} type="system" />
                </TabsContent>
                <TabsContent value="agent" className="mt-0">
                  <LogTable logs={agentLogs} onSelectLog={handleLogSelect} type="agent" />
                </TabsContent>
                <TabsContent value="api" className="mt-0">
                  <LogTable logs={apiInteractions} onSelectLog={handleLogSelect} type="api" />
                </TabsContent>
                <TabsContent value="approval" className="mt-0">
                  <LogTable logs={humanApprovals} onSelectLog={handleLogSelect} type="approval" />
                </TabsContent>
              </>
            )}
          </Tabs>

          {selectedLog && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Log Details</CardTitle>
                <CardDescription>
                  {formatDistanceToNow(new Date(selectedLog.timestamp), { addSuffix: true })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LogDetails log={selectedLog} type={logType} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoggingDashboardPage;
