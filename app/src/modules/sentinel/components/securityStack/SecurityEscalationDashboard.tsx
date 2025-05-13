import React, { useState } from 'react';
import { useQuery } from 'wasp/client/operations';
import { getSecurityEscalations, createSecurityEscalation, updateSecurityEscalation } from '@src/modules/sentinel/api';
import { SecurityEscalation, EscalationStatus, EscalationCategory, AlertSeverity } from '@src/modules/sentinel/types/securityStack';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@src/shared/components/ui/card';
import { Button } from '@src/shared/components/ui/button';
import { Badge } from '@src/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@src/shared/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@src/shared/components/ui/select';
import { Input } from '@src/shared/components/ui/input';
import { Textarea } from '@src/shared/components/ui/textarea';
import { DataTable } from '@src/shared/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Loader2, AlertTriangle, Shield, Clock, Filter, User, CheckCircle } from 'lucide-react';
import { toast } from '@src/shared/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@src/shared/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@src/shared/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { MultiSelect } from '@src/shared/components/ui/multi-select';

export const SecurityEscalationDashboard: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<EscalationStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<EscalationCategory | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all');
  const [selectedEscalation, setSelectedEscalation] = useState<SecurityEscalation | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for creating a new escalation
  const [newEscalation, setNewEscalation] = useState({
    title: '',
    description: '',
    severity: 'high' as AlertSeverity,
    category: 'intrusion' as EscalationCategory,
    sourceAlert: '',
    affectedSystems: [] as string[],
  });

  // Form state for updating an escalation
  const [updateForm, setUpdateForm] = useState({
    status: 'in_progress' as EscalationStatus,
    assignedTo: '',
    resolutionSummary: '',
  });

  // Fetch security escalations
  const { data: escalations, isLoading, error, refetch } = useQuery(getSecurityEscalations);

  // Create a new security escalation
  const handleCreateEscalation = async () => {
    try {
      setIsSubmitting(true);
      await createSecurityEscalation(newEscalation);
      toast({
        title: 'Escalation created',
        description: 'The security escalation has been created successfully.',
        variant: 'default',
      });
      setIsCreateDialogOpen(false);
      setNewEscalation({
        title: '',
        description: '',
        severity: 'high',
        category: 'intrusion',
        sourceAlert: '',
        affectedSystems: [],
      });
      refetch();
    } catch (error) {
      console.error('Error creating security escalation:', error);
      toast({
        title: 'Error',
        description: `Failed to create security escalation: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update a security escalation
  const handleUpdateEscalation = async () => {
    if (!selectedEscalation) return;

    try {
      setIsSubmitting(true);
      await updateSecurityEscalation({
        id: selectedEscalation.id,
        status: updateForm.status,
        assignedTo: updateForm.assignedTo || undefined,
        resolutionSummary: updateForm.resolutionSummary || undefined,
      });
      toast({
        title: 'Escalation updated',
        description: `The escalation status has been updated to ${updateForm.status}.`,
        variant: 'default',
      });
      setIsUpdateDialogOpen(false);
      refetch();
    } catch (error) {
      console.error('Error updating security escalation:', error);
      toast({
        title: 'Error',
        description: `Failed to update security escalation: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter escalations based on selected filters
  const filteredEscalations = escalations?.filter((escalation) => {
    if (statusFilter !== 'all' && escalation.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && escalation.category !== categoryFilter) return false;
    if (severityFilter !== 'all' && escalation.severity !== severityFilter) return false;
    return true;
  });

  // Define columns for the data table
  const columns: ColumnDef<SecurityEscalation>[] = [
    {
      accessorKey: 'escalatedAt',
      header: 'Escalated',
      cell: ({ row }) => (
        <div>
          {format(new Date(row.getValue('escalatedAt')), 'MMM d, yyyy HH:mm')}
        </div>
      ),
    },
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div className="font-medium">
          {row.getValue('title')}
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
        const status = row.getValue('status') as EscalationStatus;
        return (
          <Badge
            variant={
              status === 'open'
                ? 'default'
                : status === 'in_progress'
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
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <div>
          {row.getValue('category')}
        </div>
      ),
    },
    {
      accessorKey: 'assignedTo',
      header: 'Assigned To',
      cell: ({ row }) => (
        <div>
          {row.getValue('assignedTo') || 'Unassigned'}
        </div>
      ),
    },
    {
      accessorKey: 'affectedSystems',
      header: 'Affected Systems',
      cell: ({ row }) => {
        const systems = row.getValue('affectedSystems') as string[];
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
      id: 'actions',
      cell: ({ row }) => {
        const escalation = row.original;
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
                  setSelectedEscalation(escalation);
                  setUpdateForm({
                    status: 'in_progress',
                    assignedTo: escalation.assignedTo || '',
                    resolutionSummary: '',
                  });
                  setIsUpdateDialogOpen(true);
                }}
                disabled={escalation.status === 'in_progress'}
              >
                Mark as In Progress
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedEscalation(escalation);
                  setUpdateForm({
                    status: 'resolved',
                    assignedTo: escalation.assignedTo || '',
                    resolutionSummary: '',
                  });
                  setIsUpdateDialogOpen(true);
                }}
                disabled={escalation.status === 'resolved'}
              >
                Mark as Resolved
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedEscalation(escalation);
                  setUpdateForm({
                    status: 'closed',
                    assignedTo: escalation.assignedTo || '',
                    resolutionSummary: '',
                  });
                  setIsUpdateDialogOpen(true);
                }}
                disabled={escalation.status === 'closed'}
              >
                Mark as Closed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Calculate summary statistics
  const totalEscalations = escalations?.length || 0;
  const openEscalations = escalations?.filter(e => e.status === 'open').length || 0;
  const inProgressEscalations = escalations?.filter(e => e.status === 'in_progress').length || 0;
  const criticalEscalations = escalations?.filter(e => e.severity === 'critical').length || 0;
  const highEscalations = escalations?.filter(e => e.severity === 'high').length || 0;

  // System options for affected systems
  const systemOptions = [
    { label: 'User Authentication', value: 'auth' },
    { label: 'Database', value: 'database' },
    { label: 'API Gateway', value: 'api' },
    { label: 'File Storage', value: 'storage' },
    { label: 'Payment Processing', value: 'payment' },
    { label: 'Admin Dashboard', value: 'admin' },
    { label: 'User Portal', value: 'portal' },
    { label: 'Mobile App', value: 'mobile' },
    { label: 'Third-Party Integrations', value: 'integrations' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Security Escalations</h2>
          <p className="text-muted-foreground">
            Manage and track security incidents that require escalation and resolution.
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          Create Escalation
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Escalations</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEscalations}</div>
            <p className="text-xs text-muted-foreground">
              All security escalations
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openEscalations}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting action
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalEscalations}</div>
            <p className="text-xs text-muted-foreground">
              Highest severity escalations
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <User className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressEscalations}</div>
            <p className="text-xs text-muted-foreground">
              Currently being addressed
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Security Escalations</CardTitle>
          <CardDescription>
            View and manage security incidents that require escalation and resolution.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as EscalationStatus | 'all')}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={categoryFilter}
                onValueChange={(value) => setCategoryFilter(value as EscalationCategory | 'all')}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="intrusion">Intrusion</SelectItem>
                  <SelectItem value="data_breach">Data Breach</SelectItem>
                  <SelectItem value="malware">Malware</SelectItem>
                  <SelectItem value="insider_threat">Insider Threat</SelectItem>
                  <SelectItem value="policy_violation">Policy Violation</SelectItem>
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
              Error loading security escalations: {error.message}
            </div>
          ) : filteredEscalations?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground">No security escalations found with the selected filters.</p>
              {statusFilter !== 'all' || categoryFilter !== 'all' || severityFilter !== 'all' ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setStatusFilter('all');
                    setCategoryFilter('all');
                    setSeverityFilter('all');
                  }}
                  className="mt-4"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              ) : (
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="mt-4"
                >
                  Create Your First Escalation
                </Button>
              )}
            </div>
          ) : (
            <DataTable columns={columns} data={filteredEscalations} />
          )}
        </CardContent>
      </Card>

      {/* Create Escalation Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Security Escalation</DialogTitle>
            <DialogDescription>
              Create a new security escalation for an incident that requires attention.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={newEscalation.title}
                onChange={(e) => setNewEscalation({ ...newEscalation, title: e.target.value })}
                placeholder="Brief title describing the incident"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newEscalation.description}
                onChange={(e) => setNewEscalation({ ...newEscalation, description: e.target.value })}
                placeholder="Detailed description of the security incident..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Severity</label>
                <Select
                  value={newEscalation.severity}
                  onValueChange={(value) => setNewEscalation({ ...newEscalation, severity: value as AlertSeverity })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={newEscalation.category}
                  onValueChange={(value) => setNewEscalation({ ...newEscalation, category: value as EscalationCategory })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="intrusion">Intrusion</SelectItem>
                    <SelectItem value="data_breach">Data Breach</SelectItem>
                    <SelectItem value="malware">Malware</SelectItem>
                    <SelectItem value="insider_threat">Insider Threat</SelectItem>
                    <SelectItem value="policy_violation">Policy Violation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Source Alert (Optional)</label>
              <Input
                value={newEscalation.sourceAlert}
                onChange={(e) => setNewEscalation({ ...newEscalation, sourceAlert: e.target.value })}
                placeholder="ID or reference to the source alert"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Affected Systems</label>
              <MultiSelect
                options={systemOptions}
                selected={newEscalation.affectedSystems}
                onChange={(selected) => setNewEscalation({ ...newEscalation, affectedSystems: selected })}
                placeholder="Select affected systems"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateEscalation} 
              disabled={isSubmitting || !newEscalation.title || !newEscalation.description || newEscalation.affectedSystems.length === 0}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Creating...' : 'Create Escalation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Escalation Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Escalation Status</DialogTitle>
            <DialogDescription>
              Update the status of this security escalation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">New Status</label>
              <Select
                value={updateForm.status}
                onValueChange={(value) => setUpdateForm({ ...updateForm, status: value as EscalationStatus })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Assigned To (Optional)</label>
              <Input
                value={updateForm.assignedTo}
                onChange={(e) => setUpdateForm({ ...updateForm, assignedTo: e.target.value })}
                placeholder="User ID or name of assignee"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Resolution Summary</label>
              <Textarea
                value={updateForm.resolutionSummary}
                onChange={(e) => setUpdateForm({ ...updateForm, resolutionSummary: e.target.value })}
                placeholder="Provide details about the resolution or current status..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateEscalation} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
