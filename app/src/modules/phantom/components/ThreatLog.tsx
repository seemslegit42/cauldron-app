/**
 * ThreatLog Component
 * 
 * An animated table of security threats and intercepts with visual indicators
 * for severity and type. Provides real-time updates and filtering capabilities.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from 'wasp/client/operations';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@src/shared/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@src/shared/components/ui/card';
import { Badge } from '@src/shared/components/ui/badge';
import { Button } from '@src/shared/components/ui/button';
import { Input } from '@src/shared/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@src/shared/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@src/shared/components/ui/dropdown-menu';
import { Spinner } from '@src/shared/components/ui/spinner';
import { 
  AlertTriangle, 
  Shield, 
  AlertCircle, 
  Clock, 
  Filter, 
  MoreHorizontal,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  Zap
} from 'lucide-react';
import { getThreatMonitoringDashboard } from '../api/threatMonitoring';
import { ThreatSeverity, ThreatStatus, ThreatType } from '../types';
import { cn } from '@src/shared/utils/cn';

// Types
interface ThreatLogProps {
  className?: string;
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
  onSelectThreat?: (threat: any) => void;
}

// Severity badge variants
const severityVariants = {
  critical: "bg-red-500 hover:bg-red-600",
  high: "bg-orange-500 hover:bg-orange-600",
  medium: "bg-yellow-500 hover:bg-yellow-600",
  low: "bg-blue-500 hover:bg-blue-600",
  info: "bg-gray-500 hover:bg-gray-600",
};

// Threat type icons
const threatTypeIcons = {
  malware: <Shield className="h-4 w-4" />,
  phishing: <AlertCircle className="h-4 w-4" />,
  data_breach: <AlertTriangle className="h-4 w-4" />,
  domain_spoofing: <Eye className="h-4 w-4" />,
  vulnerability: <Zap className="h-4 w-4" />,
};

export function ThreatLog({ 
  className = '', 
  limit = 10, 
  autoRefresh = true, 
  refreshInterval = 30000,
  onSelectThreat 
}: ThreatLogProps) {
  // State
  const [filter, setFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Animation controls
  const controls = useAnimation();

  // Query for threat data
  const { data: dashboardData, isLoading, error, refetch } = useQuery(getThreatMonitoringDashboard);

  // Extract threats from dashboard data
  const threats = dashboardData ? [
    ...(dashboardData.brandAlerts || []).map((alert: any) => ({
      ...alert,
      type: 'domain_spoofing',
      severity: alert.severity || 'medium',
    })),
    ...(dashboardData.phishingVectors || []).map((vector: any) => ({
      ...vector,
      type: 'phishing',
      severity: vector.severity || 'high',
    })),
    ...(dashboardData.cveAlerts || []).map((alert: any) => ({
      ...alert,
      type: 'vulnerability',
      severity: alert.severity || 'medium',
    })),
  ] : [];

  // Filter and sort threats
  const filteredThreats = threats
    .filter((threat: any) => {
      // Text filter
      const textMatch = filter === '' || 
        threat.title?.toLowerCase().includes(filter.toLowerCase()) ||
        threat.description?.toLowerCase().includes(filter.toLowerCase());
      
      // Severity filter
      const severityMatch = severityFilter === 'all' || threat.severity === severityFilter;
      
      // Type filter
      const typeMatch = typeFilter === 'all' || threat.type === typeFilter;
      
      // Status filter
      const statusMatch = statusFilter === 'all' || threat.status === statusFilter;
      
      return textMatch && severityMatch && typeMatch && statusMatch;
    })
    .sort((a: any, b: any) => {
      // Sort by selected field
      if (sortBy === 'timestamp') {
        const dateA = new Date(a.createdAt || a.detectedAt || Date.now());
        const dateB = new Date(b.createdAt || b.detectedAt || Date.now());
        return sortDirection === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
      }
      
      if (sortBy === 'severity') {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };
        const orderA = severityOrder[a.severity as keyof typeof severityOrder] || 0;
        const orderB = severityOrder[b.severity as keyof typeof severityOrder] || 0;
        return sortDirection === 'asc' ? orderA - orderB : orderB - orderA;
      }
      
      // Default sort by title
      const valA = (a[sortBy] || '').toString().toLowerCase();
      const valB = (b[sortBy] || '').toString().toLowerCase();
      return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    })
    .slice(0, limit);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      refetch();
      setLastRefreshed(new Date());
      
      // Pulse animation on refresh
      controls.start({
        backgroundColor: ['rgba(59, 130, 246, 0.1)', 'rgba(59, 130, 246, 0)'],
        transition: { duration: 1 }
      });
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refetch, controls]);

  // Manual refresh handler
  const handleRefresh = useCallback(() => {
    refetch();
    setLastRefreshed(new Date());
    
    // Pulse animation on manual refresh
    controls.start({
      backgroundColor: ['rgba(59, 130, 246, 0.2)', 'rgba(59, 130, 246, 0)'],
      transition: { duration: 1 }
    });
  }, [refetch, controls]);

  return (
    <Card className={cn("w-full", className)} as={motion.div} animate={controls}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
              Threat Log
            </CardTitle>
            <CardDescription>
              Real-time security threats and intercepts
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="flex items-center"
          >
            <RefreshCw className="mr-1 h-3 w-3" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Input
            placeholder="Filter threats..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-[200px]"
          />
          
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="malware">Malware</SelectItem>
              <SelectItem value="phishing">Phishing</SelectItem>
              <SelectItem value="data_breach">Data Breach</SelectItem>
              <SelectItem value="domain_spoofing">Domain Spoofing</SelectItem>
              <SelectItem value="vulnerability">Vulnerability</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="investigating">Investigating</SelectItem>
              <SelectItem value="mitigated">Mitigated</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Threat Table */}
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Spinner size="md" />
            <span className="ml-2">Loading threats...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            Error loading threat data. Please try again.
          </div>
        ) : filteredThreats.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No threats found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Severity</TableHead>
                  <TableHead>Threat</TableHead>
                  <TableHead className="w-[120px]">Type</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[150px]">Detected</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredThreats.map((threat: any) => (
                    <TableRow 
                      key={threat.id}
                      as={motion.tr}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onSelectThreat && onSelectThreat(threat)}
                    >
                      <TableCell>
                        <Badge 
                          variant="default"
                          className={cn(
                            severityVariants[threat.severity as keyof typeof severityVariants] || 
                            severityVariants.info
                          )}
                        >
                          {threat.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {threat.title}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {threatTypeIcons[threat.type as keyof typeof threatTypeIcons] || 
                           <AlertCircle className="h-4 w-4" />}
                          <span className="ml-1">{threat.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            threat.status === 'active' ? 'destructive' : 
                            threat.status === 'investigating' ? 'warning' : 
                            threat.status === 'mitigated' ? 'outline' : 
                            'secondary'
                          }
                        >
                          {threat.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          {formatDistanceToNow(
                            new Date(threat.createdAt || threat.detectedAt || Date.now()),
                            { addSuffix: true }
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              onSelectThreat && onSelectThreat(threat);
                            }}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark as Resolved
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              <XCircle className="mr-2 h-4 w-4" />
                              Dismiss
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between text-xs text-muted-foreground pt-2">
        <div>
          Showing {filteredThreats.length} of {threats.length} threats
        </div>
        <div>
          Last updated: {formatDistanceToNow(lastRefreshed, { addSuffix: true })}
        </div>
      </CardFooter>
    </Card>
  );
}
