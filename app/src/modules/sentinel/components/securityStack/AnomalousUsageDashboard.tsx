import React, { useState } from 'react';
import { useQuery } from 'wasp/client/operations';
import { getAnomalousUsage, updateAnomalousUsageStatus } from '@src/modules/sentinel/api';
import { AnomalousUsage, AnomalyStatus, AnomalyType, AlertSeverity } from '@src/modules/sentinel/types/securityStack';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@src/shared/components/ui/card';
import { Button } from '@src/shared/components/ui/button';
import { Badge } from '@src/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@src/shared/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@src/shared/components/ui/select';
import { DataTable } from '@src/shared/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Loader2, AlertTriangle, Activity, Clock, Filter } from 'lucide-react';
import { toast } from '@src/shared/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@src/shared/components/ui/dialog';
import { Textarea } from '@src/shared/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@src/shared/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

export const AnomalousUsageDashboard: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<AnomalyStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<AnomalyType | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all');
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalousUsage | null>(null);
  const [resolution, setResolution] = useState('');
  const [newStatus, setNewStatus] = useState<AnomalyStatus>('resolved');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch anomalous usage reports
  const { data: anomalies, isLoading, error, refetch } = useQuery(getAnomalousUsage);

  // Update anomalous usage status
  const handleUpdateStatus = async () => {
    if (!selectedAnomaly) return;

    try {
      setIsUpdating(true);
      await updateAnomalousUsageStatus({
        id: selectedAnomaly.id,
        status: newStatus,
        resolution,
      });
      toast({
        title: 'Status updated',
        description: `The anomaly status has been updated to ${newStatus}.`,
        variant: 'default',
      });
      setIsDialogOpen(false);
      refetch();
    } catch (error) {
      console.error('Error updating anomaly status:', error);
      toast({
        title: 'Error',
        description: `Failed to update anomaly status: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Filter anomalies based on selected filters
  const filteredAnomalies = anomalies?.filter((anomaly) => {
    if (statusFilter !== 'all' && anomaly.status !== statusFilter) return false;
    if (typeFilter !== 'all' && anomaly.type !== typeFilter) return false;
    if (severityFilter !== 'all' && anomaly.severity !== severityFilter) return false;
    return true;
  });

  // Define columns for the data table
  const columns: ColumnDef<AnomalousUsage>[] = [
    {
      accessorKey: 'detectedAt',
      header: 'Detected',
      cell: ({ row }) => (
        <div>
          {format(new Date(row.getValue('detectedAt')), 'MMM d, yyyy HH:mm')}
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <div className="font-medium">
          {row.getValue('type')}
        </div>
      ),
    },
    {
      accessorKey: 'severity',
      header: 'Severity',
      cell: ({ row }) => {
        const severity = row.getValue('severity') as AlertSeverity;
        return (
          <Badge
            variant={
              severity === 'critical'
                ? 'destructive'
                : severity === 'high'
                ? 'destructive'
                : severity === 'medium'
                ? 'warning'
                : 'outline'
            }
          >
            {severity}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as AnomalyStatus;
        return (
          <Badge
            variant={
              status === 'new'
                ? 'default'
                : status === 'investigating'
                ? 'secondary'
                : status === 'resolved'
                ? 'success'
                : 'outline'
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'source',
      header: 'Source',
      cell: ({ row }) => (
        <div>
          {row.getValue('source')}
        </div>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <div className="max-w-md truncate">
          {row.getValue('description')}
        </div>
      ),
    },
    {
      accessorKey: 'affectedResource',
      header: 'Affected Resource',
      cell: ({ row }) => (
        <div>
          {row.getValue('affectedResource') || 'N/A'}
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const anomaly = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setSelectedAnomaly(anomaly);
                  setNewStatus('investigating');
                  setResolution('');
                  setIsDialogOpen(true);
                }}
                disabled={anomaly.status === 'investigating'}
              >
                Mark as Investigating
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedAnomaly(anomaly);
                  setNewStatus('resolved');
                  setResolution('');
                  setIsDialogOpen(true);
                }}
                disabled={anomaly.status === 'resolved'}
              >
                Mark as Resolved
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedAnomaly(anomaly);
                  setNewStatus('false_positive');
                  setResolution('');
                  setIsDialogOpen(true);
                }}
                disabled={anomaly.status === 'false_positive'}
              >
                Mark as False Positive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Calculate summary statistics
  const totalAnomalies = anomalies?.length || 0;
  const newAnomalies = anomalies?.filter(a => a.status === 'new').length || 0;
  const investigatingAnomalies = anomalies?.filter(a => a.status === 'investigating').length || 0;
  const criticalAnomalies = anomalies?.filter(a => a.severity === 'critical').length || 0;
  const highAnomalies = anomalies?.filter(a => a.severity === 'high').length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Anomalous Usage Detection</h2>
          <p className="text-muted-foreground">
            Monitor and investigate unusual system usage patterns and potential security threats.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Anomalies</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAnomalies}</div>
            <p className="text-xs text-muted-foreground">
              All detected anomalies
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newAnomalies}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting investigation
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalAnomalies}</div>
            <p className="text-xs text-muted-foreground">
              Highest severity anomalies
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highAnomalies}</div>
            <p className="text-xs text-muted-foreground">
              High severity anomalies
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Anomalous Usage Reports</CardTitle>
          <CardDescription>
            View and manage detected anomalous usage patterns and potential security threats.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as AnomalyStatus | 'all')}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="false_positive">False Positive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select
                value={typeFilter}
                onValueChange={(value) => setTypeFilter(value as AnomalyType | 'all')}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="login_attempt">Login Attempt</SelectItem>
                  <SelectItem value="api_usage">API Usage</SelectItem>
                  <SelectItem value="data_access">Data Access</SelectItem>
                  <SelectItem value="resource_usage">Resource Usage</SelectItem>
                  <SelectItem value="permission_change">Permission Change</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Severity</label>
              <Select
                value={severityFilter}
                onValueChange={(value) => setSeverityFilter(value as AlertSeverity | 'all')}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-red-500">
              Error loading anomalous usage reports: {error.message}
            </div>
          ) : filteredAnomalies?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground">No anomalous usage reports found with the selected filters.</p>
              {statusFilter !== 'all' || typeFilter !== 'all' || severityFilter !== 'all' ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setStatusFilter('all');
                    setTypeFilter('all');
                    setSeverityFilter('all');
                  }}
                  className="mt-4"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              ) : null}
            </div>
          ) : (
            <DataTable columns={columns} data={filteredAnomalies} />
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Anomaly Status</DialogTitle>
            <DialogDescription>
              Change the status of this anomaly and provide a resolution note.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">New Status</label>
              <Select
                value={newStatus}
                onValueChange={(value) => setNewStatus(value as AnomalyStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="false_positive">False Positive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Resolution Note</label>
              <Textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Provide details about the resolution or investigation..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUpdating ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
