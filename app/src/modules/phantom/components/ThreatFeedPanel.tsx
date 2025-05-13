import React from 'react';
import { Card, CardContent } from '@src/shared/components/ui/card';
import { Badge } from '@src/shared/components/ui/badge';
import { Button } from '@src/shared/components/ui/button';
import { EmptyState } from '@src/shared/components/EmptyState';
import { formatDistanceToNow } from 'date-fns';
import { RssIcon, RefreshCwIcon, PlusIcon, ExternalLinkIcon } from 'lucide-react';

interface ThreatFeed {
  id: string;
  name: string;
  description?: string;
  type: string;
  url?: string;
  isActive: boolean;
  lastRefreshed?: string;
}

interface ThreatFeedPanelProps {
  feeds: ThreatFeed[];
}

export function ThreatFeedPanel({ feeds }: ThreatFeedPanelProps) {
  if (feeds.length === 0) {
    return (
      <EmptyState
        icon={<RssIcon className="h-10 w-10 text-muted-foreground" />}
        title="No threat feeds configured"
        description="Add threat feeds to monitor for security threats."
        action={
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Threat Feed
          </Button>
        }
      />
    );
  }

  const getFeedTypeLabel = (type: string) => {
    switch (type) {
      case 'osint':
        return <Badge className="bg-blue-600">OSINT</Badge>;
      case 'cve':
        return <Badge className="bg-red-600">CVE</Badge>;
      case 'domain_clone':
        return <Badge className="bg-purple-600">Domain Clone</Badge>;
      case 'phishing':
        return <Badge className="bg-orange-600">Phishing</Badge>;
      case 'external_api':
        return <Badge className="bg-green-600">External API</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Threat Feeds</h2>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Feed
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {feeds.map((feed) => (
          <Card key={feed.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{feed.name}</h3>
                    {getFeedTypeLabel(feed.type)}
                  </div>
                  {feed.description && (
                    <p className="text-sm text-muted-foreground mt-1">{feed.description}</p>
                  )}
                </div>
                <Badge variant={feed.isActive ? 'default' : 'outline'}>
                  {feed.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className="mt-4 flex justify-between items-center text-sm">
                <div className="text-muted-foreground">
                  {feed.lastRefreshed
                    ? `Last refreshed ${formatDistanceToNow(new Date(feed.lastRefreshed), { addSuffix: true })}`
                    : 'Never refreshed'}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <RefreshCwIcon className="h-4 w-4" />
                  </Button>
                  {feed.url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={feed.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLinkIcon className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
