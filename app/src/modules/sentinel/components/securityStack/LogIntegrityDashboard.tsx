import React, { useState } from 'react';
import { useQuery } from 'wasp/client/operations';
import { getLogIntegrityChecks, runLogIntegrityCheck } from '@src/modules/sentinel/api';
import { LogIntegrityCheck, LogCheckType, LogSource } from '@src/modules/sentinel/types/securityStack';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@src/shared/components/ui/card';
import { Button } from '@src/shared/components/ui/button';
import { Badge } from '@src/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@src/shared/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@src/shared/components/ui/select';
import { DateRangePicker } from '@src/shared/components/ui/date-range-picker';
import { DataTable } from '@src/shared/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Loader2, CheckCircle, AlertTriangle, XCircle, InfoIcon } from 'lucide-react';
import { toast } from '@src/shared/components/ui/use-toast';

export const LogIntegrityDashboard: React.FC = () => {
  const [checkType, setCheckType] = useState<LogCheckType>('hash_verification');
  const [logSource, setLogSource] = useState<LogSource>('system_logs');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    to: new Date(),
  });
  const [isRunningCheck, setIsRunningCheck] = useState(false);

  // Fetch log integrity checks
  const { data: checks, isLoading, error, refetch } = useQuery(getLogIntegrityChecks);

  // Run a log integrity check
  const handleRunCheck = async () => {
    try {
      setIsRunningCheck(true);
      await runLogIntegrityCheck({
        checkType,
        logSource,
        startTimestamp: dateRange.from,
        endTimestamp: dateRange.to,
      });
      toast({
        title: 'Log integrity check completed',
        description: 'The log integrity check has been completed successfully.',
        variant: 'default',
      });
      refetch();
    } catch (error) {
      console.error('Error running log integrity check:', error);
      toast({
        title: 'Error',
        description: `Failed to run log integrity check: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsRunningCheck(false);
    }
  };

  // Define columns for the data table
  const columns: ColumnDef<LogIntegrityCheck>[] = [
    {
      accessorKey: 'checkType',
      header: 'Check Type',
      cell: ({ row }) => (
        <div className="font-medium">
          {row.getValue('checkType')}
        </div>
      ),
    },
    {
      accessorKey: 'logSource',
      header: 'Log Source',
      cell: ({ row }) => (
        <div>
          {row.getValue('logSource')}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <Badge
            variant={
              status === 'passed'
                ? 'success'
                : status === 'warning'
                ? 'warning'
                : status === 'error' || status === 'failed'
                ? 'destructive'
                : 'default'
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'recordsChecked',
      header: 'Records Checked',
      cell: ({ row }) => (
        <div className="text-right">
          {row.getValue('recordsChecked')}
        </div>
      ),
    },
    {
      accessorKey: 'issuesFound',
      header: 'Issues Found',
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {row.getValue('issuesFound')}
        </div>
      ),
    },
    {
      accessorKey: 'startTimestamp',
      header: 'Start Time',
      cell: ({ row }) => (
        <div>
          {format(new Date(row.getValue('startTimestamp')), 'MMM d, yyyy HH:mm')}
        </div>
      ),
    },
    {
      accessorKey: 'endTimestamp',
      header: 'End Time',
      cell: ({ row }) => (
        <div>
          {format(new Date(row.getValue('endTimestamp')), 'MMM d, yyyy HH:mm')}
        </div>
      ),
    },
    {
      accessorKey: 'details',
      header: 'Details',
      cell: ({ row }) => (
        <div>
          {row.getValue('details') || 'No details available'}
        </div>
      ),
    },
  ];

  // Calculate summary statistics
  const totalChecks = checks?.length || 0;
  const passedChecks = checks?.filter(check => check.status === 'passed').length || 0;
  const warningChecks = checks?.filter(check => check.status === 'warning').length || 0;
  const failedChecks = checks?.filter(check => check.status === 'error' || check.status === 'failed').length || 0;
  const totalIssues = checks?.reduce((sum, check) => sum + check.issuesFound, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Log Integrity Monitoring</h2>
          <p className="text-muted-foreground">
            Monitor and verify the integrity of system logs to detect tampering or corruption.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Checks</CardTitle>
            <InfoIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalChecks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Passed Checks</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{passedChecks}</div>
            <p className="text-xs text-muted-foreground">
              {totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{warningChecks}</div>
            <p className="text-xs text-muted-foreground">
              {totalChecks > 0 ? Math.round((warningChecks / totalChecks) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Checks</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failedChecks}</div>
            <p className="text-xs text-muted-foreground">
              {totalChecks > 0 ? Math.round((failedChecks / totalChecks) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Run Log Integrity Check</CardTitle>
          <CardDescription>
            Verify the integrity of logs by running a check on a specific log source.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Check Type</label>
              <Select
                value={checkType}
                onValueChange={(value) => setCheckType(value as LogCheckType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select check type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hash_verification">Hash Verification</SelectItem>
                  <SelectItem value="sequence_check">Sequence Check</SelectItem>
                  <SelectItem value="tamper_detection">Tamper Detection</SelectItem>
                  <SelectItem value="consistency_check">Consistency Check</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Log Source</label>
              <Select
                value={logSource}
                onValueChange={(value) => setLogSource(value as LogSource)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select log source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system_logs">System Logs</SelectItem>
                  <SelectItem value="agent_logs">Agent Logs</SelectItem>
                  <SelectItem value="api_interactions">API Interactions</SelectItem>
                  <SelectItem value="security_alerts">Security Alerts</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Date Range</label>
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleRunCheck} disabled={isRunningCheck}>
            {isRunningCheck && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isRunningCheck ? 'Running Check...' : 'Run Check'}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Log Integrity Check History</CardTitle>
          <CardDescription>
            View the history of log integrity checks and their results.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-red-500">
              Error loading log integrity checks: {error.message}
            </div>
          ) : checks?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground">No log integrity checks have been run yet.</p>
              <Button onClick={handleRunCheck} className="mt-4" disabled={isRunningCheck}>
                Run Your First Check
              </Button>
            </div>
          ) : (
            <DataTable columns={columns} data={checks} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
