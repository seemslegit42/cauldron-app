import React from 'react';
import { Card, CardContent } from '@src/shared/components/ui/card';
import { Badge } from '@src/shared/components/ui/badge';
import { Button } from '@src/shared/components/ui/button';
import { EmptyState } from '@src/shared/components/EmptyState';
import { formatDistanceToNow } from 'date-fns';
import { ShieldAlertIcon, ExternalLinkIcon, CheckCircleIcon, AlertTriangleIcon } from 'lucide-react';

interface CVEAlert {
  id: string;
  cveId: string;
  title: string;
  description: string;
  severity: string;
  cvssScore?: number;
  affectedSystems: string[];
  status: string;
  publishedAt: string;
  patchAvailable: boolean;
  patchUrl?: string;
}

interface CVEAlertPanelProps {
  alerts: CVEAlert[];
  compact?: boolean;
}

export function CVEAlertPanel({ alerts, compact = false }: CVEAlertPanelProps) {
  if (alerts.length === 0) {
    return (
      <EmptyState
        icon={<ShieldAlertIcon className="h-10 w-10 text-muted-foreground" />}
        title="No CVE alerts"
        description="When CVE alerts are detected, they will appear here."
      />
    );
  }

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
      case 'patched':
        return <Badge variant="outline" className="border-green-500 text-green-500">Patched</Badge>;
      case 'mitigated':
        return <Badge variant="outline" className="border-orange-500 text-orange-500">Mitigated</Badge>;
      case 'not_affected':
        return <Badge variant="outline" className="border-gray-500 text-gray-500">Not Affected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {alerts.map((alert) => (
          <div 
            key={alert.id}
            className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${getSeverityColor(alert.severity)}`} />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium">{alert.cveId}</h4>
                  {alert.patchAvailable && <CheckCircleIcon className="h-3 w-3 text-green-500" />}
                </div>
                <p className="text-xs text-muted-foreground truncate max-w-[200px]">{alert.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(alert.status)}
              {alert.cvssScore && (
                <Badge className={getSeverityColor(alert.severity)}>
                  {alert.cvssScore.toFixed(1)}
                </Badge>
              )}
            </div>
          </div>
        ))}
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
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{alert.cveId}</h3>
                      {alert.cvssScore && (
                        <Badge className={getSeverityColor(alert.severity)}>
                          CVSS {alert.cvssScore.toFixed(1)}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium mt-1">{alert.title}</p>
                  </div>
                  {getStatusBadge(alert.status)}
                </div>
                
                <p className="text-sm line-clamp-2">{alert.description}</p>
                
                <div className="flex flex-wrap gap-1 mt-2">
                  {alert.affectedSystems.map((system, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {system}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <div className="text-muted-foreground">
                    Published {formatDistanceToNow(new Date(alert.publishedAt), { addSuffix: true })}
                  </div>
                  
                  <div className="flex gap-2">
                    {alert.patchAvailable && alert.patchUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={alert.patchUrl} target="_blank" rel="noopener noreferrer">
                          <CheckCircleIcon className="mr-1 h-4 w-4" />
                          Patch
                        </a>
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      asChild
                    >
                      <a 
                        href={`https://nvd.nist.gov/vuln/detail/${alert.cveId}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLinkIcon className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
