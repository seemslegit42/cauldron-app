import React from 'react';
import { Card, CardContent } from '@src/shared/components/ui/card';
import { Badge } from '@src/shared/components/ui/badge';
import { Button } from '@src/shared/components/ui/button';
import { EmptyState } from '@src/shared/components/EmptyState';
import { formatDistanceToNow } from 'date-fns';
import { FishIcon, MailIcon, SmartphoneIcon, GlobeIcon, AlertTriangleIcon, ShieldIcon } from 'lucide-react';

interface PhishingVector {
  id: string;
  title: string;
  description: string;
  type: string;
  targetedBrand?: string;
  severity: string;
  status: string;
  detectedAt: string;
  resolvedAt?: string;
  indicators: string[];
}

interface PhishingVectorPanelProps {
  vectors: PhishingVector[];
  compact?: boolean;
}

export function PhishingVectorPanel({ vectors, compact = false }: PhishingVectorPanelProps) {
  if (vectors.length === 0) {
    return (
      <EmptyState
        icon={<FishIcon className="h-10 w-10 text-muted-foreground" />}
        title="No phishing vectors detected"
        description="When phishing attempts are detected, they will appear here."
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
      case 'active':
        return <Badge variant="destructive">Active</Badge>;
      case 'investigating':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Investigating</Badge>;
      case 'blocked':
        return <Badge variant="outline" className="border-green-500 text-green-500">Blocked</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="border-green-500 text-green-500">Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <MailIcon className="h-4 w-4 text-blue-500" />;
      case 'sms':
        return <SmartphoneIcon className="h-4 w-4 text-green-500" />;
      case 'social_media':
        return <Badge className="bg-blue-500">Social Media</Badge>;
      case 'website':
        return <GlobeIcon className="h-4 w-4 text-purple-500" />;
      default:
        return <AlertTriangleIcon className="h-4 w-4 text-yellow-500" />;
    }
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {vectors.map((vector) => (
          <div 
            key={vector.id}
            className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              {getTypeIcon(vector.type)}
              <div>
                <h4 className="text-sm font-medium truncate max-w-[200px]">{vector.title}</h4>
                {vector.targetedBrand && (
                  <p className="text-xs text-muted-foreground">Target: {vector.targetedBrand}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(vector.status)}
              <Badge className={getSeverityColor(vector.severity)}>
                {vector.severity.charAt(0).toUpperCase() + vector.severity.slice(1)}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vectors.map((vector) => (
          <Card key={vector.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className={`h-1 w-full ${getSeverityColor(vector.severity)}`} />
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{vector.title}</h3>
                      {getTypeIcon(vector.type)}
                    </div>
                    {vector.targetedBrand && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Targeted Brand: <span className="font-medium">{vector.targetedBrand}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(vector.status)}
                    <Badge className={getSeverityColor(vector.severity)}>
                      {vector.severity.charAt(0).toUpperCase() + vector.severity.slice(1)}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm line-clamp-2">{vector.description}</p>
                
                {vector.indicators.length > 0 && (
                  <div>
                    <p className="text-xs font-medium mb-1">Indicators:</p>
                    <div className="flex flex-wrap gap-1">
                      {vector.indicators.map((indicator, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {indicator}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-center text-sm">
                  <div className="text-muted-foreground">
                    Detected {formatDistanceToNow(new Date(vector.detectedAt), { addSuffix: true })}
                  </div>
                  
                  <div className="flex gap-2">
                    {vector.status === 'active' && (
                      <Button variant="outline" size="sm">
                        <ShieldIcon className="mr-1 h-4 w-4" />
                        Block
                      </Button>
                    )}
                    {vector.status === 'active' && (
                      <Button variant="outline" size="sm">
                        Report
                      </Button>
                    )}
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
