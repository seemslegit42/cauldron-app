import React from 'react';
import { Card, CardContent } from '@src/shared/components/ui/card';
import { Badge } from '@src/shared/components/ui/badge';
import { Button } from '@src/shared/components/ui/button';
import { EmptyState } from '@src/shared/components/EmptyState';
import { formatDistanceToNow } from 'date-fns';
import { ShieldIcon, PlusIcon, RefreshCwIcon, LinkIcon, AlertTriangleIcon } from 'lucide-react';

interface SentinelLogIntegration {
  id: string;
  name: string;
  description?: string;
  type: string;
  isActive: boolean;
  lastSyncedAt?: string;
}

interface SentinelLogIntegrationPanelProps {
  integrations: SentinelLogIntegration[];
}

export function SentinelLogIntegrationPanel({ integrations }: SentinelLogIntegrationPanelProps) {
  if (integrations.length === 0) {
    return (
      <EmptyState
        icon={<ShieldIcon className="h-10 w-10 text-muted-foreground" />}
        title="No Sentinel log integrations configured"
        description="Connect to Sentinel logs to enhance your security monitoring."
        action={
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Integration
          </Button>
        }
      />
    );
  }

  const getIntegrationTypeLabel = (type: string) => {
    switch (type) {
      case 'security_alert':
        return <Badge className="bg-red-600">Security Alerts</Badge>;
      case 'security_scan':
        return <Badge className="bg-blue-600">Security Scans</Badge>;
      case 'compliance_check':
        return <Badge className="bg-green-600">Compliance Checks</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Sentinel Log Integrations</h2>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Integration
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((integration) => (
          <Card key={integration.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{integration.name}</h3>
                    {getIntegrationTypeLabel(integration.type)}
                  </div>
                  {integration.description && (
                    <p className="text-sm text-muted-foreground mt-1">{integration.description}</p>
                  )}
                </div>
                <Badge variant={integration.isActive ? 'default' : 'outline'}>
                  {integration.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className="mt-4 flex justify-between items-center text-sm">
                <div className="text-muted-foreground">
                  {integration.lastSyncedAt
                    ? `Last synced ${formatDistanceToNow(new Date(integration.lastSyncedAt), { addSuffix: true })}`
                    : 'Never synced'}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <RefreshCwIcon className="mr-1 h-4 w-4" />
                    Sync Now
                  </Button>
                  <Button variant="outline" size="sm">
                    <LinkIcon className="mr-1 h-4 w-4" />
                    View Logs
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/50 border-dashed">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangleIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium">Integration with Sentinel Module</h4>
              <p className="text-sm text-muted-foreground">
                Sentinel logs are automatically synchronized with the Phantom module. This integration enhances your security posture by providing a unified view of security events.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
