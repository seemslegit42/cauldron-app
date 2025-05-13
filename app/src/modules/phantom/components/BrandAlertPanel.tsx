import React, { useState } from 'react';
import { useAction } from 'wasp/client/operations';
import { updateBrandAlert } from '@src/modules/phantom/api/threatMonitoring';
import { Card, CardContent } from '@src/shared/components/ui/card';
import { Button } from '@src/shared/components/ui/button';
import { Badge } from '@src/shared/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@src/shared/components/ui/dialog';
import { Textarea } from '@src/shared/components/ui/textarea';
import { Label } from '@src/shared/components/ui/label';
import { useToast } from '@src/shared/hooks/useToast';
import { AlertTriangleIcon, CheckCircleIcon, ClockIcon, XCircleIcon, ExternalLinkIcon, EyeIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { EmptyState } from '@src/shared/components/EmptyState';

interface BrandAlert {
  id: string;
  title: string;
  description: string;
  brandName: string;
  source: string;
  severity: string;
  status: string;
  detectedAt: string;
  resolvedAt?: string;
}

interface BrandAlertPanelProps {
  alerts: BrandAlert[];
  compact?: boolean;
}

export function BrandAlertPanel({ alerts, compact = false }: BrandAlertPanelProps) {
  const [selectedAlert, setSelectedAlert] = useState<BrandAlert | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const updateAlertAction = useAction(updateBrandAlert);
  const toast = useToast();

  const handleStatusChange = async (alertId: string, newStatus: string) => {
    try {
      await updateAlertAction({
        id: alertId,
        status: newStatus,
        resolvedAt: ['resolved', 'mitigated', 'false_positive'].includes(newStatus) ? new Date().toISOString() : undefined,
      });
      toast.success(`Alert status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update alert status');
      console.error('Error updating alert status:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="outline" className="border-blue-500 text-blue-500">New</Badge>;
      case 'investigating':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Investigating</Badge>;
      case 'mitigated':
        return <Badge variant="outline" className="border-orange-500 text-orange-500">Mitigated</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="border-green-500 text-green-500">Resolved</Badge>;
      case 'false_positive':
        return <Badge variant="outline" className="border-gray-500 text-gray-500">False Positive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'social_media':
        return <Badge className="bg-blue-500">Social Media</Badge>;
      case 'dark_web':
        return <Badge className="bg-purple-700">Dark Web</Badge>;
      case 'domain':
        return <Badge className="bg-indigo-600">Domain</Badge>;
      case 'phishing':
        return <Badge className="bg-red-500">Phishing</Badge>;
      default:
        return <Badge>{source}</Badge>;
    }
  };

  if (alerts.length === 0) {
    return (
      <EmptyState
        icon={<AlertTriangleIcon className="h-10 w-10 text-muted-foreground" />}
        title="No brand alerts"
        description="When brand alerts are detected, they will appear here."
      />
    );
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {alerts.map((alert) => (
          <div 
            key={alert.id}
            className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => {
              setSelectedAlert(alert);
              setIsDetailsOpen(true);
            }}
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${getSeverityColor(alert.severity)}`} />
              <div>
                <h4 className="text-sm font-medium truncate max-w-[200px]">{alert.title}</h4>
                <p className="text-xs text-muted-foreground">{alert.brandName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(alert.status)}
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(alert.detectedAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        ))}

        {selectedAlert && (
          <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedAlert.title}</DialogTitle>
                <DialogDescription>
                  Alert for {selectedAlert.brandName} • {getSourceIcon(selectedAlert.source)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <Badge className={getSeverityColor(selectedAlert.severity)}>
                    {selectedAlert.severity.charAt(0).toUpperCase() + selectedAlert.severity.slice(1)} Severity
                  </Badge>
                  {getStatusBadge(selectedAlert.status)}
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <div className="p-3 rounded-md bg-muted text-sm">
                    {selectedAlert.description}
                  </div>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <div>Detected: {formatDistanceToNow(new Date(selectedAlert.detectedAt), { addSuffix: true })}</div>
                  {selectedAlert.resolvedAt && (
                    <div>Resolved: {formatDistanceToNow(new Date(selectedAlert.resolvedAt), { addSuffix: true })}</div>
                  )}
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                {selectedAlert.status === 'new' && (
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto"
                    onClick={() => {
                      handleStatusChange(selectedAlert.id, 'investigating');
                      setIsDetailsOpen(false);
                    }}
                  >
                    <ClockIcon className="mr-2 h-4 w-4" />
                    Investigate
                  </Button>
                )}
                {['new', 'investigating'].includes(selectedAlert.status) && (
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto"
                    onClick={() => {
                      handleStatusChange(selectedAlert.id, 'mitigated');
                      setIsDetailsOpen(false);
                    }}
                  >
                    <CheckCircleIcon className="mr-2 h-4 w-4" />
                    Mark as Mitigated
                  </Button>
                )}
                {['new', 'investigating', 'mitigated'].includes(selectedAlert.status) && (
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto"
                    onClick={() => {
                      handleStatusChange(selectedAlert.id, 'resolved');
                      setIsDetailsOpen(false);
                    }}
                  >
                    <CheckCircleIcon className="mr-2 h-4 w-4" />
                    Mark as Resolved
                  </Button>
                )}
                {['new', 'investigating'].includes(selectedAlert.status) && (
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto"
                    onClick={() => {
                      handleStatusChange(selectedAlert.id, 'false_positive');
                      setIsDetailsOpen(false);
                    }}
                  >
                    <XCircleIcon className="mr-2 h-4 w-4" />
                    False Positive
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alerts.map((alert) => (
          <Card key={alert.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className={`h-1 w-full ${getSeverityColor(alert.severity)}`} />
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{alert.title}</h3>
                    <p className="text-sm text-muted-foreground">{alert.brandName}</p>
                  </div>
                  {getStatusBadge(alert.status)}
                </div>
                
                <p className="text-sm line-clamp-2">{alert.description}</p>
                
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    {getSourceIcon(alert.source)}
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(alert.detectedAt), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSelectedAlert(alert);
                        setIsDetailsOpen(true);
                      }}
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedAlert && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedAlert.title}</DialogTitle>
              <DialogDescription>
                Alert for {selectedAlert.brandName} • {getSourceIcon(selectedAlert.source)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <Badge className={getSeverityColor(selectedAlert.severity)}>
                  {selectedAlert.severity.charAt(0).toUpperCase() + selectedAlert.severity.slice(1)} Severity
                </Badge>
                {getStatusBadge(selectedAlert.status)}
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <div className="p-3 rounded-md bg-muted text-sm">
                  {selectedAlert.description}
                </div>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <div>Detected: {formatDistanceToNow(new Date(selectedAlert.detectedAt), { addSuffix: true })}</div>
                {selectedAlert.resolvedAt && (
                  <div>Resolved: {formatDistanceToNow(new Date(selectedAlert.resolvedAt), { addSuffix: true })}</div>
                )}
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              {selectedAlert.status === 'new' && (
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto"
                  onClick={() => {
                    handleStatusChange(selectedAlert.id, 'investigating');
                    setIsDetailsOpen(false);
                  }}
                >
                  <ClockIcon className="mr-2 h-4 w-4" />
                  Investigate
                </Button>
              )}
              {['new', 'investigating'].includes(selectedAlert.status) && (
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto"
                  onClick={() => {
                    handleStatusChange(selectedAlert.id, 'mitigated');
                    setIsDetailsOpen(false);
                  }}
                >
                  <CheckCircleIcon className="mr-2 h-4 w-4" />
                  Mark as Mitigated
                </Button>
              )}
              {['new', 'investigating', 'mitigated'].includes(selectedAlert.status) && (
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto"
                  onClick={() => {
                    handleStatusChange(selectedAlert.id, 'resolved');
                    setIsDetailsOpen(false);
                  }}
                >
                  <CheckCircleIcon className="mr-2 h-4 w-4" />
                  Mark as Resolved
                </Button>
              )}
              {['new', 'investigating'].includes(selectedAlert.status) && (
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto"
                  onClick={() => {
                    handleStatusChange(selectedAlert.id, 'false_positive');
                    setIsDetailsOpen(false);
                  }}
                >
                  <XCircleIcon className="mr-2 h-4 w-4" />
                  False Positive
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
