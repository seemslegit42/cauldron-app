import React from 'react';
import { Card, CardContent } from '@src/shared/components/ui/card';
import { Badge } from '@src/shared/components/ui/badge';
import { Button } from '@src/shared/components/ui/button';
import { EmptyState } from '@src/shared/components/EmptyState';
import { EyeIcon, PlusIcon, BellIcon, BellOffIcon } from 'lucide-react';

interface ThreatMonitor {
  id: string;
  name: string;
  description?: string;
  type: string;
  keywords: string[];
  severity: string;
  isActive: boolean;
  notificationEnabled: boolean;
}

interface ThreatMonitorPanelProps {
  monitors: ThreatMonitor[];
}

export function ThreatMonitorPanel({ monitors }: ThreatMonitorPanelProps) {
  if (monitors.length === 0) {
    return (
      <EmptyState
        icon={<EyeIcon className="h-10 w-10 text-muted-foreground" />}
        title="No threat monitors configured"
        description="Add threat monitors to track specific threats."
        action={
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Monitor
          </Button>
        }
      />
    );
  }

  const getMonitorTypeLabel = (type: string) => {
    switch (type) {
      case 'brand':
        return <Badge className="bg-blue-600">Brand</Badge>;
      case 'domain':
        return <Badge className="bg-purple-600">Domain</Badge>;
      case 'vulnerability':
        return <Badge className="bg-red-600">Vulnerability</Badge>;
      case 'general':
        return <Badge className="bg-green-600">General</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-red-600">Critical Only</Badge>;
      case 'high':
        return <Badge className="bg-orange-500">High & Above</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500">Medium & Above</Badge>;
      case 'low':
        return <Badge className="bg-green-500">All Severities</Badge>;
      case 'all':
        return <Badge className="bg-blue-500">All Severities</Badge>;
      default:
        return <Badge>{severity}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Threat Monitors</h2>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Monitor
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {monitors.map((monitor) => (
          <Card key={monitor.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{monitor.name}</h3>
                    {getMonitorTypeLabel(monitor.type)}
                  </div>
                  {monitor.description && (
                    <p className="text-sm text-muted-foreground mt-1">{monitor.description}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={monitor.isActive ? 'default' : 'outline'}>
                    {monitor.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {getSeverityBadge(monitor.severity)}
                </div>
              </div>

              {monitor.keywords.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-medium mb-1">Keywords:</p>
                  <div className="flex flex-wrap gap-1">
                    {monitor.keywords.map((keyword, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 flex justify-between items-center">
                <div className="flex items-center text-sm text-muted-foreground">
                  {monitor.notificationEnabled ? (
                    <>
                      <BellIcon className="h-4 w-4 mr-1 text-green-500" />
                      Notifications enabled
                    </>
                  ) : (
                    <>
                      <BellOffIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                      Notifications disabled
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
