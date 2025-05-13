import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  Info, 
  AlertTriangle, 
  Bug, 
  CheckCircle2, 
  XCircle,
  Clock,
  Search
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

// Types
type LogType = 'system' | 'agent' | 'api' | 'approval';

interface LogTableProps {
  logs: any[];
  onSelectLog: (log: any) => void;
  type: LogType;
}

// Helper function to get the appropriate icon for log level
const getLevelIcon = (level: string) => {
  switch (level) {
    case 'CRITICAL':
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    case 'ERROR':
      return <XCircle className="h-4 w-4 text-destructive" />;
    case 'WARN':
      return <AlertTriangle className="h-4 w-4 text-warning" />;
    case 'INFO':
      return <Info className="h-4 w-4 text-info" />;
    case 'DEBUG':
      return <Bug className="h-4 w-4 text-muted-foreground" />;
    case 'TRACE':
      return <Search className="h-4 w-4 text-muted-foreground" />;
    default:
      return <Info className="h-4 w-4" />;
  }
};

// Helper function to get the appropriate icon for API status
const getApiStatusIcon = (status: string) => {
  switch (status) {
    case 'SUCCESS':
      return <CheckCircle2 className="h-4 w-4 text-success" />;
    case 'ERROR':
    case 'SERVER_ERROR':
      return <XCircle className="h-4 w-4 text-destructive" />;
    case 'TIMEOUT':
      return <Clock className="h-4 w-4 text-warning" />;
    case 'RATE_LIMITED':
    case 'UNAUTHORIZED':
    case 'FORBIDDEN':
      return <AlertTriangle className="h-4 w-4 text-warning" />;
    default:
      return <Info className="h-4 w-4" />;
  }
};

// Helper function to get the appropriate icon for approval status
const getApprovalStatusIcon = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return <CheckCircle2 className="h-4 w-4 text-success" />;
    case 'REJECTED':
      return <XCircle className="h-4 w-4 text-destructive" />;
    case 'PENDING':
      return <Clock className="h-4 w-4 text-warning" />;
    case 'EXPIRED':
      return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    default:
      return <Info className="h-4 w-4" />;
  }
};

// Helper function to truncate text
const truncate = (text: string, length: number) => {
  if (!text) return '';
  return text.length > length ? `${text.substring(0, length)}...` : text;
};

const LogTable: React.FC<LogTableProps> = ({ logs, onSelectLog, type }) => {
  const [sortField, setSortField] = useState<string>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Sort logs
  const sortedLogs = [...logs].sort((a, b) => {
    if (sortField === 'timestamp') {
      return sortDirection === 'asc'
        ? new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
    
    if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Render table headers based on log type
  const renderHeaders = () => {
    const commonHeaders = (
      <>
        <TableHead className="w-[180px]">
          <Button 
            variant="ghost" 
            onClick={() => handleSort('timestamp')}
            className="flex items-center space-x-1 px-0"
          >
            <span>Timestamp</span>
            {sortField === 'timestamp' && (
              sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </TableHead>
        <TableHead className="w-[100px]">Level/Status</TableHead>
      </>
    );

    switch (type) {
      case 'system':
        return (
          <>
            {commonHeaders}
            <TableHead className="w-[120px]">Category</TableHead>
            <TableHead>Message</TableHead>
            <TableHead className="w-[120px]">Source</TableHead>
            <TableHead className="w-[120px]">User</TableHead>
            <TableHead className="w-[100px]">Tags</TableHead>
          </>
        );
      case 'agent':
        return (
          <>
            {commonHeaders}
            <TableHead className="w-[120px]">Agent</TableHead>
            <TableHead>Message</TableHead>
            <TableHead className="w-[120px]">User</TableHead>
            <TableHead className="w-[100px]">Tags</TableHead>
          </>
        );
      case 'api':
        return (
          <>
            {commonHeaders}
            <TableHead className="w-[120px]">Method</TableHead>
            <TableHead>Endpoint</TableHead>
            <TableHead className="w-[80px]">Duration</TableHead>
            <TableHead className="w-[120px]">Source</TableHead>
          </>
        );
      case 'approval':
        return (
          <>
            {commonHeaders}
            <TableHead>Requested Action</TableHead>
            <TableHead className="w-[120px]">Requested By</TableHead>
            <TableHead className="w-[120px]">Approved By</TableHead>
            <TableHead className="w-[120px]">Response Time</TableHead>
          </>
        );
      default:
        return commonHeaders;
    }
  };

  // Render table rows based on log type
  const renderRows = () => {
    return sortedLogs.map((log) => {
      const commonCells = (
        <>
          <TableCell className="whitespace-nowrap">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                </TooltipTrigger>
                <TooltipContent>
                  {new Date(log.timestamp).toLocaleString()}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </TableCell>
        </>
      );

      switch (type) {
        case 'system':
          return (
            <TableRow 
              key={log.id} 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSelectLog(log)}
            >
              {commonCells}
              <TableCell>
                <div className="flex items-center space-x-2">
                  {getLevelIcon(log.level)}
                  <span>{log.level}</span>
                </div>
              </TableCell>
              <TableCell>{log.category}</TableCell>
              <TableCell>{truncate(log.message, 50)}</TableCell>
              <TableCell>{log.source}</TableCell>
              <TableCell>{log.user?.username || log.userId || '-'}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {log.tags?.slice(0, 2).map((tag: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {log.tags?.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{log.tags.length - 2}
                    </Badge>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        case 'agent':
          return (
            <TableRow 
              key={log.id} 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSelectLog(log)}
            >
              {commonCells}
              <TableCell>
                <div className="flex items-center space-x-2">
                  {getLevelIcon(log.level)}
                  <span>{log.level}</span>
                </div>
              </TableCell>
              <TableCell>{log.agent?.name || log.agentId || '-'}</TableCell>
              <TableCell>{truncate(log.message, 50)}</TableCell>
              <TableCell>{log.user?.username || log.userId || '-'}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {log.tags?.slice(0, 2).map((tag: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {log.tags?.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{log.tags.length - 2}
                    </Badge>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        case 'api':
          return (
            <TableRow 
              key={log.id} 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSelectLog(log)}
            >
              {commonCells}
              <TableCell>
                <div className="flex items-center space-x-2">
                  {getApiStatusIcon(log.status)}
                  <span>{log.status}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={
                  log.method === 'GET' ? 'default' :
                  log.method === 'POST' ? 'success' :
                  log.method === 'PUT' ? 'warning' :
                  log.method === 'DELETE' ? 'destructive' : 'outline'
                }>
                  {log.method}
                </Badge>
              </TableCell>
              <TableCell>{truncate(log.endpoint, 50)}</TableCell>
              <TableCell>{log.duration}ms</TableCell>
              <TableCell>{log.source}</TableCell>
            </TableRow>
          );
        case 'approval':
          return (
            <TableRow 
              key={log.id} 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSelectLog(log)}
            >
              {commonCells}
              <TableCell>
                <div className="flex items-center space-x-2">
                  {getApprovalStatusIcon(log.status)}
                  <span>{log.status}</span>
                </div>
              </TableCell>
              <TableCell>{truncate(log.requestedAction, 50)}</TableCell>
              <TableCell>{log.requestedBy}</TableCell>
              <TableCell>{log.approvedBy || '-'}</TableCell>
              <TableCell>
                {log.responseTimestamp 
                  ? formatDistanceToNow(
                      new Date(log.responseTimestamp), 
                      { addSuffix: true }
                    )
                  : '-'
                }
              </TableCell>
            </TableRow>
          );
        default:
          return null;
      }
    });
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {renderHeaders()}
          </TableRow>
        </TableHeader>
        <TableBody>
          {renderRows()}
        </TableBody>
      </Table>
    </div>
  );
};

export default LogTable;
