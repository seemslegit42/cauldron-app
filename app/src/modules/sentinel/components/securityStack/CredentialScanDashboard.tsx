import React, { useState } from 'react';
import { useQuery } from 'wasp/client/operations';
import { getCredentialScans, runCredentialScan } from '@src/modules/sentinel/api';
import { CredentialScan, CredentialScanType } from '@src/modules/sentinel/types/securityStack';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@src/shared/components/ui/card';
import { Button } from '@src/shared/components/ui/button';
import { Badge } from '@src/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@src/shared/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@src/shared/components/ui/select';
import { Checkbox } from '@src/shared/components/ui/checkbox';
import { DataTable } from '@src/shared/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Loader2, ShieldAlert, Key, UserCheck, Database } from 'lucide-react';
import { toast } from '@src/shared/components/ui/use-toast';
import { Progress } from '@src/shared/components/ui/progress';

export const CredentialScanDashboard: React.FC = () => {
  const [scanType, setScanType] = useState<CredentialScanType>('password_strength');
  const [targetSystems, setTargetSystems] = useState<string[]>(['users', 'api_keys']);
  const [isRunningScan, setIsRunningScan] = useState(false);

  // Fetch credential scans
  const { data: scans, isLoading, error, refetch } = useQuery(getCredentialScans);

  // Run a credential scan
  const handleRunScan = async () => {
    try {
      setIsRunningScan(true);
      await runCredentialScan({
        scanType,
        targetSystems,
      });
      toast({
        title: 'Credential scan completed',
        description: 'The credential scan has been completed successfully.',
        variant: 'default',
      });
      refetch();
    } catch (error) {
      console.error('Error running credential scan:', error);
      toast({
        title: 'Error',
        description: `Failed to run credential scan: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsRunningScan(false);
    }
  };

  // Define columns for the data table
  const columns: ColumnDef<CredentialScan>[] = [
    {
      accessorKey: 'scanType',
      header: 'Scan Type',
      cell: ({ row }) => (
        <div className="font-medium">
          {row.getValue('scanType')}
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
              status === 'completed'
                ? 'success'
                : status === 'in_progress'
                ? 'outline'
                : 'destructive'
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'findings',
      header: 'Findings',
      cell: ({ row }) => (
        <div className="text-right">
          {row.getValue('findings')}
        </div>
      ),
    },
    {
      accessorKey: 'criticalFindings',
      header: 'Critical',
      cell: ({ row }) => (
        <div className="text-right font-medium text-red-500">
          {row.getValue('criticalFindings')}
        </div>
      ),
    },
    {
      accessorKey: 'targetSystems',
      header: 'Target Systems',
      cell: ({ row }) => {
        const systems = row.getValue('targetSystems') as string[];
        return (
          <div className="flex flex-wrap gap-1">
            {systems.map((system) => (
              <Badge key={system} variant="outline" className="text-xs">
                {system}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: 'startedAt',
      header: 'Started',
      cell: ({ row }) => (
        <div>
          {format(new Date(row.getValue('startedAt')), 'MMM d, yyyy HH:mm')}
        </div>
      ),
    },
    {
      accessorKey: 'completedAt',
      header: 'Completed',
      cell: ({ row }) => {
        const completedAt = row.getValue('completedAt');
        return completedAt ? (
          <div>
            {format(new Date(completedAt), 'MMM d, yyyy HH:mm')}
          </div>
        ) : (
          <div className="text-muted-foreground">In progress</div>
        );
      },
    },
    {
      accessorKey: 'summary',
      header: 'Summary',
      cell: ({ row }) => (
        <div>
          {row.getValue('summary') || 'No summary available'}
        </div>
      ),
    },
  ];

  // Calculate summary statistics
  const totalScans = scans?.length || 0;
  const completedScans = scans?.filter(scan => scan.status === 'completed').length || 0;
  const totalFindings = scans?.reduce((sum, scan) => sum + scan.findings, 0) || 0;
  const totalCriticalFindings = scans?.reduce((sum, scan) => sum + scan.criticalFindings, 0) || 0;
  const latestScan = scans?.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())[0];

  // Target system options
  const targetSystemOptions = [
    { id: 'users', label: 'User Accounts' },
    { id: 'api_keys', label: 'API Keys' },
    { id: 'service_accounts', label: 'Service Accounts' },
    { id: 'database', label: 'Database Credentials' },
    { id: 'third_party', label: 'Third-Party Integrations' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Credential Scanning</h2>
          <p className="text-muted-foreground">
            Scan credentials for vulnerabilities, rotation issues, and exposure risks.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalScans}</div>
            <p className="text-xs text-muted-foreground">
              {completedScans} completed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Findings</CardTitle>
            <Key className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFindings}</div>
            <p className="text-xs text-muted-foreground">
              Across all scans
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Findings</CardTitle>
            <ShieldAlert className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCriticalFindings}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Scan</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-md font-bold">
              {latestScan ? format(new Date(latestScan.startedAt), 'MMM d, yyyy') : 'Never'}
            </div>
            <p className="text-xs text-muted-foreground">
              {latestScan ? `${latestScan.scanType} scan` : 'No scans yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Run Credential Scan</CardTitle>
          <CardDescription>
            Scan credentials for vulnerabilities, weak passwords, and rotation issues.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Scan Type</label>
                <Select
                  value={scanType}
                  onValueChange={(value) => setScanType(value as CredentialScanType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select scan type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="password_strength">Password Strength</SelectItem>
                    <SelectItem value="key_rotation">Key Rotation</SelectItem>
                    <SelectItem value="exposed_credentials">Exposed Credentials</SelectItem>
                    <SelectItem value="privilege_audit">Privilege Audit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Systems</label>
                <div className="space-y-2">
                  {targetSystemOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.id}
                        checked={targetSystems.includes(option.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setTargetSystems([...targetSystems, option.id]);
                          } else {
                            setTargetSystems(targetSystems.filter((id) => id !== option.id));
                          }
                        }}
                      />
                      <label
                        htmlFor={option.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-md border p-4">
                <h4 className="text-sm font-medium">Scan Details</h4>
                <div className="mt-2 text-sm text-muted-foreground">
                  {scanType === 'password_strength' && (
                    <p>Analyzes password complexity, length, and common patterns to identify weak credentials.</p>
                  )}
                  {scanType === 'key_rotation' && (
                    <p>Checks API keys, tokens, and certificates for age and rotation compliance with security policies.</p>
                  )}
                  {scanType === 'exposed_credentials' && (
                    <p>Searches for credentials that may have been exposed in public repositories or data breaches.</p>
                  )}
                  {scanType === 'privilege_audit' && (
                    <p>Audits privilege levels and access rights to identify over-privileged accounts and potential risks.</p>
                  )}
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-medium">Selected Systems:</h4>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {targetSystems.map((system) => (
                      <Badge key={system} variant="secondary" className="text-xs">
                        {targetSystemOptions.find(opt => opt.id === system)?.label || system}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleRunScan} disabled={isRunningScan || targetSystems.length === 0}>
            {isRunningScan && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isRunningScan ? 'Running Scan...' : 'Run Scan'}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Credential Scan History</CardTitle>
          <CardDescription>
            View the history of credential scans and their findings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-red-500">
              Error loading credential scans: {error.message}
            </div>
          ) : scans?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground">No credential scans have been run yet.</p>
              <Button onClick={handleRunScan} className="mt-4" disabled={isRunningScan}>
                Run Your First Scan
              </Button>
            </div>
          ) : (
            <DataTable columns={columns} data={scans} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
