import React, { useState, useEffect } from 'react';
import { useQuery } from 'wasp/client/operations';
import { getCollaborationArchives, verifyCollaborationArchive, getCollaborationArchiveContent } from 'wasp/client/operations';
import { useToast } from '@src/shared/hooks/useToast';
import { Button } from '@src/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@src/shared/components/ui/card';
import { Badge } from '@src/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@src/shared/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@src/shared/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@src/shared/components/ui/select';
import { DateRangePicker } from '@src/shared/components/ui/date-range-picker';
import { Skeleton } from '@src/shared/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@src/shared/components/ui/dialog';
import { Input } from '@src/shared/components/ui/input';
import { Label } from '@src/shared/components/ui/label';
import { AlertCircle, CheckCircle, Clock, Download, Eye, FileText, Lock, Shield, User } from 'lucide-react';
import { format } from 'date-fns';

interface DateRange {
  from: Date;
  to: Date;
}

const CollaborationArchivesDashboard: React.FC = () => {
  const [archiveType, setArchiveType] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(),
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isViewingArchive, setIsViewingArchive] = useState(false);
  const [selectedArchive, setSelectedArchive] = useState<any>(null);
  const [archiveContent, setArchiveContent] = useState<any>(null);
  const [decryptionKey, setDecryptionKey] = useState('');
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const { toast } = useToast();

  // Query archives
  const { data: archivesData, isLoading, error, refetch } = useQuery(getCollaborationArchives, {
    archiveType,
    status,
    startDate: dateRange.from.toISOString(),
    endDate: dateRange.to.toISOString(),
    page,
    pageSize,
  });

  // Handle verification
  const handleVerify = async (archiveId: string) => {
    try {
      setIsVerifying(true);
      const result = await verifyCollaborationArchive({
        archiveId,
        verificationMethod: 'manual',
        metadata: {
          source: 'dashboard',
          timestamp: new Date().toISOString(),
        },
      });

      if (result.isValid) {
        toast({
          title: 'Archive verified',
          description: 'The archive integrity has been verified successfully.',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Archive verification failed',
          description: 'The archive may have been tampered with.',
          variant: 'destructive',
        });
      }

      refetch();
    } catch (error) {
      console.error('Error verifying archive:', error);
      toast({
        title: 'Error',
        description: `Failed to verify archive: ${(error as Error).message}`,
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle viewing archive content
  const handleViewArchive = (archive: any) => {
    setSelectedArchive(archive);
    setArchiveContent(null);
    setDecryptionKey('');
    setIsViewingArchive(true);
  };

  // Handle fetching archive content
  const handleFetchContent = async () => {
    if (!selectedArchive) return;

    try {
      setIsLoadingContent(true);
      const result = await getCollaborationArchiveContent({
        archiveId: selectedArchive.id,
        decryptionKey: decryptionKey || undefined,
        reason: 'admin-dashboard-view',
      });

      setArchiveContent(result);

      toast({
        title: 'Archive content loaded',
        description: decryptionKey
          ? 'Archive content decrypted and loaded successfully.'
          : 'Encrypted archive content loaded. Provide a decryption key to view the content.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error fetching archive content:', error);
      toast({
        title: 'Error',
        description: `Failed to fetch archive content: ${(error as Error).message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoadingContent(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <Badge variant="outline">Complete</Badge>;
      case 'verified':
        return <Badge variant="success">Verified</Badge>;
      case 'tampered':
        return <Badge variant="destructive">Tampered</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get archive type icon
  const getArchiveTypeIcon = (type: string) => {
    switch (type) {
      case 'ai-session':
        return <FileText className="h-4 w-4 mr-1" />;
      case 'human-approval':
        return <User className="h-4 w-4 mr-1" />;
      case 'sentient-checkpoint':
        return <CheckCircle className="h-4 w-4 mr-1" />;
      default:
        return <FileText className="h-4 w-4 mr-1" />;
    }
  };

  // Format date
  const formatDate = (date: string) => {
    return format(new Date(date), 'MMM d, yyyy HH:mm:ss');
  };

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Error Loading Archives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Failed to load collaboration archives: {(error as Error).message}</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => refetch()}>Retry</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <>
      <Dialog open={isViewingArchive} onOpenChange={setIsViewingArchive}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Archive Content</DialogTitle>
            <DialogDescription>
              {selectedArchive && (
                <div className="text-sm">
                  <p>Archive ID: {selectedArchive.id}</p>
                  <p>Type: {selectedArchive.archiveType}</p>
                  <p>Created: {selectedArchive.createdAt && formatDate(selectedArchive.createdAt)}</p>
                  <p>Status: {selectedArchive.status}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="decryptionKey">Decryption Key (optional)</Label>
                <Input
                  id="decryptionKey"
                  value={decryptionKey}
                  onChange={(e) => setDecryptionKey(e.target.value)}
                  placeholder="Enter decryption key to view content"
                />
              </div>
              <Button
                onClick={handleFetchContent}
                disabled={isLoadingContent}
              >
                {isLoadingContent ? 'Loading...' : 'Load Content'}
              </Button>
            </div>

            {archiveContent && (
              <div className="border rounded-md p-4 bg-muted/50">
                <h3 className="text-lg font-medium mb-2">Archive Content</h3>
                {archiveContent.content ? (
                  <div className="space-y-2">
                    <pre className="whitespace-pre-wrap overflow-x-auto p-2 bg-background rounded border text-sm">
                      {JSON.stringify(archiveContent.content, null, 2)}
                    </pre>
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const blob = new Blob(
                            [JSON.stringify(archiveContent.content, null, 2)],
                            { type: 'application/json' }
                          );
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `archive-${selectedArchive?.id}.json`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download JSON
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    <p>Encrypted content. Please provide a valid decryption key to view the content.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Collaboration Archives
          </CardTitle>
          <CardDescription>
            Tamper-proof archives of human-AI collaboration sessions for auditing and compliance
          </CardDescription>
        </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/4">
              <Select value={archiveType} onValueChange={setArchiveType}>
                <SelectTrigger>
                  <SelectValue placeholder="All archive types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={undefined}>All archive types</SelectItem>
                  <SelectItem value="ai-session">AI Session</SelectItem>
                  <SelectItem value="human-approval">Human Approval</SelectItem>
                  <SelectItem value="sentient-checkpoint">Sentient Checkpoint</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-1/4">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={undefined}>All statuses</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="tampered">Tampered</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-2/4">
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Archive Type</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Time Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Compliance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {archivesData?.archives.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No archives found matching the criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    archivesData?.archives.map((archive) => (
                      <TableRow key={archive.id}>
                        <TableCell className="flex items-center">
                          {getArchiveTypeIcon(archive.archiveType)}
                          {archive.archiveType}
                        </TableCell>
                        <TableCell>{formatDate(archive.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span className="text-xs">
                              {formatDate(archive.startTimestamp)} to {formatDate(archive.endTimestamp)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(archive.status)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {archive.complianceStandards.map((standard: string) => (
                              <Badge key={standard} variant="outline" className="text-xs">
                                {standard}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVerify(archive.id)}
                              disabled={isVerifying}
                            >
                              <Lock className="h-4 w-4 mr-1" />
                              Verify
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewArchive(archive)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {archivesData && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {archivesData.archives.length} of {archivesData.pagination.totalItems} archives
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= archivesData.pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
    </>
  );
};

export default CollaborationArchivesDashboard;
