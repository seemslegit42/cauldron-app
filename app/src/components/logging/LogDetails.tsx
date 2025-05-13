import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { 
  AlertCircle, 
  Info, 
  AlertTriangle, 
  Bug, 
  Clock,
  Copy,
  ExternalLink,
  Check
} from 'lucide-react';
import { useQuery } from 'wasp/client/react';
import { getRelatedLogs } from '@wasp/queries/logs';

// Types
type LogType = 'system' | 'agent' | 'api' | 'approval';

interface LogDetailsProps {
  log: any;
  type: LogType;
}

// Helper function to get the appropriate icon for log level
const getLevelIcon = (level: string) => {
  switch (level) {
    case 'CRITICAL':
    case 'ERROR':
      return <AlertCircle className="h-5 w-5 text-destructive" />;
    case 'WARN':
      return <AlertTriangle className="h-5 w-5 text-warning" />;
    case 'INFO':
      return <Info className="h-5 w-5 text-info" />;
    case 'DEBUG':
    case 'TRACE':
      return <Bug className="h-5 w-5 text-muted-foreground" />;
    default:
      return <Info className="h-5 w-5" />;
  }
};

const LogDetails: React.FC<LogDetailsProps> = ({ log, type }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Query for related logs
  const { data: relatedLogs, isLoading } = useQuery(getRelatedLogs, {
    traceId: log.traceId,
    excludeId: log.id
  });

  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render metadata as key-value pairs
  const renderMetadata = (data: Record<string, any>) => {
    if (!data) return <p className="text-muted-foreground">No metadata available</p>;

    return (
      <div className="grid grid-cols-1 gap-2">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex flex-col">
            <span className="text-sm font-medium">{key}</span>
            <span className="text-sm text-muted-foreground">
              {typeof value === 'object' 
                ? JSON.stringify(value) 
                : String(value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Render the header based on log type
  const renderHeader = () => {
    switch (type) {
      case 'system':
        return (
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              {getLevelIcon(log.level)}
              <div>
                <h3 className="text-lg font-semibold">{log.message}</h3>
                <p className="text-sm text-muted-foreground">
                  {log.source} • {new Date(log.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
            <Badge>{log.category}</Badge>
          </div>
        );
      case 'agent':
        return (
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              {getLevelIcon(log.level)}
              <div>
                <h3 className="text-lg font-semibold">{log.message}</h3>
                <p className="text-sm text-muted-foreground">
                  Agent: {log.agent?.name || log.agentId} • {new Date(log.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
            <Badge>{log.level}</Badge>
          </div>
        );
      case 'api':
        return (
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <Badge variant={
                log.method === 'GET' ? 'default' :
                log.method === 'POST' ? 'success' :
                log.method === 'PUT' ? 'warning' :
                log.method === 'DELETE' ? 'destructive' : 'outline'
              }>
                {log.method}
              </Badge>
              <div>
                <h3 className="text-lg font-semibold">{log.endpoint}</h3>
                <p className="text-sm text-muted-foreground">
                  {log.source} • {log.duration}ms • {new Date(log.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
            <Badge>{log.status}</Badge>
          </div>
        );
      case 'approval':
        return (
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              {log.status === 'PENDING' ? (
                <Clock className="h-5 w-5 text-warning" />
              ) : log.status === 'APPROVED' ? (
                <Check className="h-5 w-5 text-success" />
              ) : (
                <AlertCircle className="h-5 w-5 text-destructive" />
              )}
              <div>
                <h3 className="text-lg font-semibold">{log.requestedAction}</h3>
                <p className="text-sm text-muted-foreground">
                  Requested by: {log.requestedBy} • {new Date(log.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
            <Badge>{log.status}</Badge>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {renderHeader()}
      
      <Separator />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
          <TabsTrigger value="related">
            Related Logs
            {relatedLogs && <Badge className="ml-2">{relatedLogs.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="raw">Raw JSON</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium">ID</h4>
              <p className="text-sm text-muted-foreground">{log.id}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Timestamp</h4>
              <p className="text-sm text-muted-foreground">
                {new Date(log.timestamp).toLocaleString()}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium">User</h4>
              <p className="text-sm text-muted-foreground">
                {log.user?.username || log.userId || '-'}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Source</h4>
              <p className="text-sm text-muted-foreground">{log.source || '-'}</p>
            </div>
            {log.traceId && (
              <div>
                <h4 className="text-sm font-medium">Trace ID</h4>
                <p className="text-sm text-muted-foreground">{log.traceId}</p>
              </div>
            )}
            {log.spanId && (
              <div>
                <h4 className="text-sm font-medium">Span ID</h4>
                <p className="text-sm text-muted-foreground">{log.spanId}</p>
              </div>
            )}
            {log.duration && (
              <div>
                <h4 className="text-sm font-medium">Duration</h4>
                <p className="text-sm text-muted-foreground">{log.duration}ms</p>
              </div>
            )}
          </div>
          
          {log.tags && log.tags.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {log.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {type === 'api' && (
            <>
              <div>
                <h4 className="text-sm font-medium mb-2">Status Code</h4>
                <Badge variant={log.statusCode >= 400 ? 'destructive' : 'success'}>
                  {log.statusCode}
                </Badge>
              </div>
              
              {log.errorMessage && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Error</h4>
                  <p className="text-sm text-destructive">{log.errorMessage}</p>
                </div>
              )}
            </>
          )}
          
          {type === 'approval' && (
            <>
              <div>
                <h4 className="text-sm font-medium mb-2">Approval Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-xs font-medium">Requested By</h5>
                    <p className="text-sm">{log.requestedBy}</p>
                  </div>
                  <div>
                    <h5 className="text-xs font-medium">Approved By</h5>
                    <p className="text-sm">{log.approvedBy || '-'}</p>
                  </div>
                  <div>
                    <h5 className="text-xs font-medium">Request Time</h5>
                    <p className="text-sm">
                      {new Date(log.requestTimestamp).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <h5 className="text-xs font-medium">Response Time</h5>
                    <p className="text-sm">
                      {log.responseTimestamp 
                        ? new Date(log.responseTimestamp).toLocaleString()
                        : '-'
                      }
                    </p>
                  </div>
                </div>
              </div>
              
              {log.reason && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Reason</h4>
                  <p className="text-sm">{log.reason}</p>
                </div>
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="metadata">
          <ScrollArea className="h-[300px]">
            {renderMetadata(log.metadata)}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="related">
          {isLoading ? (
            <div className="flex justify-center items-center h-[300px]">
              <Clock className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">Loading related logs...</span>
            </div>
          ) : relatedLogs && relatedLogs.length > 0 ? (
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {relatedLogs.map((relatedLog: any) => (
                  <div 
                    key={relatedLog.id} 
                    className="p-3 rounded-md border hover:bg-muted/50 cursor-pointer"
                  >
                    <div className="flex justify-between">
                      <div className="flex items-center space-x-2">
                        {relatedLog.level && getLevelIcon(relatedLog.level)}
                        <span className="font-medium">
                          {relatedLog.message || relatedLog.endpoint || relatedLog.requestedAction}
                        </span>
                      </div>
                      <Badge variant="outline">
                        {relatedLog.type || relatedLog.category || relatedLog.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(relatedLog.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex justify-center items-center h-[300px] text-muted-foreground">
              <p>No related logs found</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="raw">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2"
              onClick={handleCopy}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            <ScrollArea className="h-[300px] rounded-md bg-muted p-4">
              <pre className="text-xs">
                {JSON.stringify(log, null, 2)}
              </pre>
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LogDetails;
