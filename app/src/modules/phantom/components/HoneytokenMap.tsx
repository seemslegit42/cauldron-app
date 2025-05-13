import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@src/shared/components/ui/card';
import { Badge } from '@src/shared/components/ui/badge';
import { Button } from '@src/shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@src/shared/components/ui/tabs';
import { EmptyState } from '@src/shared/components/EmptyState';
import {
    AlertCircleIcon,
    PlusIcon,
    EyeIcon,
    MapPinIcon,
    ClockIcon,
    ShieldIcon,
    AlertTriangleIcon,
    SettingsIcon,
    RefreshCwIcon,
    DownloadIcon
} from 'lucide-react';
import { ThreatSeverity } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

// Define Honeytoken types
export interface Honeytoken {
    id: string;
    name: string;
    type: HoneytokenType;
    location: string;
    deployedAt: Date;
    lastChecked: Date;
    status: HoneytokenStatus;
    accessCount: number;
    lastAccessedAt?: Date;
    description?: string;
    metadata?: Record<string, any>;
}

export enum HoneytokenType {
    API_KEY = 'api_key',
    DATABASE_CREDENTIAL = 'database_credential',
    ADMIN_ACCOUNT = 'admin_account',
    FILE = 'file',
    URL = 'url',
    EMAIL = 'email',
    CUSTOM = 'custom'
}

export enum HoneytokenStatus {
    ACTIVE = 'active',
    TRIGGERED = 'triggered',
    DISABLED = 'disabled',
    EXPIRED = 'expired'
}

export interface HoneytokenAlert {
    id: string;
    honeytokenId: string;
    timestamp: Date;
    sourceIp?: string;
    userAgent?: string;
    location?: string;
    severity: ThreatSeverity;
    details: string;
}

interface HoneytokenMapProps {
    honeytokens?: Honeytoken[];
    alerts?: HoneytokenAlert[];
    isLoading?: boolean;
    onAddHoneytoken?: () => void;
    onViewDetails?: (id: string) => void;
    onRefresh?: () => void;
}

export function HoneytokenMap({
    honeytokens = [],
    alerts = [],
    isLoading = false,
    onAddHoneytoken,
    onViewDetails,
    onRefresh
}: HoneytokenMapProps) {
    const [activeTab, setActiveTab] = useState('map');
    const [filteredTokens, setFilteredTokens] = useState<Honeytoken[]>(honeytokens);
    const [selectedType, setSelectedType] = useState<string>('all');

    useEffect(() => {
        if (selectedType === 'all') {
            setFilteredTokens(honeytokens);
        } else {
            setFilteredTokens(honeytokens.filter(token => token.type === selectedType));
        }
    }, [honeytokens, selectedType]);

    // Mock data for visualization
    const mockNetworkNodes = [
        { id: 'network', label: 'Network', x: 400, y: 100, type: 'network' },
        { id: 'database', label: 'Database', x: 200, y: 250, type: 'database' },
        { id: 'api', label: 'API Gateway', x: 600, y: 250, type: 'api' },
        { id: 'storage', label: 'Storage', x: 400, y: 400, type: 'storage' },
        { id: 'auth', label: 'Auth Service', x: 300, y: 300, type: 'auth' },
    ];

    // Generate honeytoken nodes based on actual data
    const honeytokenNodes = filteredTokens.map((token, index) => {
        // Position honeytokens around their "parent" system
        let parentNode;
        switch (token.type) {
            case HoneytokenType.DATABASE_CREDENTIAL:
                parentNode = mockNetworkNodes.find(n => n.id === 'database');
                break;
            case HoneytokenType.API_KEY:
                parentNode = mockNetworkNodes.find(n => n.id === 'api');
                break;
            case HoneytokenType.FILE:
                parentNode = mockNetworkNodes.find(n => n.id === 'storage');
                break;
            case HoneytokenType.ADMIN_ACCOUNT:
                parentNode = mockNetworkNodes.find(n => n.id === 'auth');
                break;
            default:
                parentNode = mockNetworkNodes.find(n => n.id === 'network');
        }

        // Calculate position with some randomness
        const angle = (index * (360 / filteredTokens.length)) * (Math.PI / 180);
        const distance = 80;
        const x = (parentNode?.x || 400) + Math.cos(angle) * distance;
        const y = (parentNode?.y || 250) + Math.sin(angle) * distance;

        return {
            id: token.id,
            label: token.name,
            x,
            y,
            type: 'honeytoken',
            status: token.status,
            tokenType: token.type,
            data: token
        };
    });

    // Combine all nodes
    const allNodes = [...mockNetworkNodes, ...honeytokenNodes];

    // Generate connections between nodes
    const connections = honeytokenNodes.map(token => {
        // Find the parent node based on token type
        let parentId;
        switch (token.tokenType) {
            case HoneytokenType.DATABASE_CREDENTIAL:
                parentId = 'database';
                break;
            case HoneytokenType.API_KEY:
                parentId = 'api';
                break;
            case HoneytokenType.FILE:
                parentId = 'storage';
                break;
            case HoneytokenType.ADMIN_ACCOUNT:
                parentId = 'auth';
                break;
            default:
                parentId = 'network';
        }

        return {
            id: `${parentId}-${token.id}`,
            source: parentId,
            target: token.id,
            status: token.status
        };
    });

    if (isLoading) {
        return (
            <Card className="w-full h-[600px] flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <RefreshCwIcon className="h-10 w-10 text-muted-foreground animate-spin" />
                    <p className="mt-4 text-muted-foreground">Loading honeytoken data...</p>
                </div>
            </Card>
        );
    }

    if (honeytokens.length === 0) {
        return (
            <Card className="w-full">
                <CardContent className="pt-6">
                    <EmptyState
                        icon={<ShieldIcon className="h-10 w-10 text-muted-foreground" />}
                        title="No honeytokens deployed"
                        description="Deploy honeytokens to detect unauthorized access attempts and potential data breaches."
                        action={
                            <Button onClick={onAddHoneytoken}>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Deploy Honeytoken
                            </Button>
                        }
                    />
                </CardContent>
            </Card>
        );
    }

    const getTypeColor = (type: HoneytokenType) => {
        switch (type) {
            case HoneytokenType.API_KEY:
                return 'bg-blue-600';
            case HoneytokenType.DATABASE_CREDENTIAL:
                return 'bg-green-600';
            case HoneytokenType.ADMIN_ACCOUNT:
                return 'bg-purple-600';
            case HoneytokenType.FILE:
                return 'bg-amber-600';
            case HoneytokenType.URL:
                return 'bg-cyan-600';
            case HoneytokenType.EMAIL:
                return 'bg-pink-600';
            default:
                return 'bg-slate-600';
        }
    };

    const getStatusColor = (status: HoneytokenStatus) => {
        switch (status) {
            case HoneytokenStatus.ACTIVE:
                return 'bg-green-500';
            case HoneytokenStatus.TRIGGERED:
                return 'bg-red-500';
            case HoneytokenStatus.DISABLED:
                return 'bg-slate-500';
            case HoneytokenStatus.EXPIRED:
                return 'bg-amber-500';
            default:
                return 'bg-slate-500';
        }
    };

    const getStatusVariant = (status: HoneytokenStatus) => {
        switch (status) {
            case HoneytokenStatus.ACTIVE:
                return 'default';
            case HoneytokenStatus.TRIGGERED:
                return 'destructive';
            case HoneytokenStatus.DISABLED:
                return 'outline';
            case HoneytokenStatus.EXPIRED:
                return 'secondary';
            default:
                return 'outline';
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleString();
    };

    const recentAlerts = alerts.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, 5);

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Honeytoken Deployment Map</CardTitle>
                        <CardDescription>
                            Visualize and manage honeytokens across your infrastructure
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={onRefresh}>
                            <RefreshCwIcon className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                        <Button size="sm" onClick={onAddHoneytoken}>
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Deploy New
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="map">Visual Map</TabsTrigger>
                        <TabsTrigger value="list">List View</TabsTrigger>
                        <TabsTrigger value="alerts">
                            Alerts
                            {recentAlerts.length > 0 && (
                                <Badge variant="destructive" className="ml-2">
                                    {recentAlerts.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="stats">Statistics</TabsTrigger>
                    </TabsList>

                    <TabsContent value="map" className="w-full">
                        <div className="flex mb-4 gap-2">
                            <Button
                                variant={selectedType === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedType('all')}
                            >
                                All
                            </Button>
                            {Object.values(HoneytokenType).map(type => (
                                <Button
                                    key={type}
                                    variant={selectedType === type ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedType(type)}
                                >
                                    {type.replace('_', ' ')}
                                </Button>
                            ))}
                        </div>

                        <div className="relative w-full h-[500px] border rounded-md bg-slate-50 dark:bg-slate-900">
                            {/* Network visualization */}
                            <svg width="100%" height="100%" className="absolute inset-0">
                                {/* Draw connections */}
                                {connections.map(conn => {
                                    const source = allNodes.find(n => n.id === conn.source);
                                    const target = allNodes.find(n => n.id === conn.target);

                                    if (!source || !target) return null;

                                    const isTriggered = conn.status === HoneytokenStatus.TRIGGERED;

                                    return (
                                        <line
                                            key={conn.id}
                                            x1={source.x}
                                            y1={source.y}
                                            x2={target.x}
                                            y2={target.y}
                                            stroke={isTriggered ? "#ef4444" : "#94a3b8"}
                                            strokeWidth={isTriggered ? 2 : 1}
                                            strokeDasharray={isTriggered ? "5,5" : ""}
                                            className={isTriggered ? "animate-pulse" : ""}
                                        />
                                    );
                                })}

                                {/* Draw system nodes */}
                                {mockNetworkNodes.map(node => (
                                    <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                                        <circle
                                            r={25}
                                            fill="#1e293b"
                                            className="stroke-2 stroke-slate-300 dark:stroke-slate-700"
                                        />
                                        <text
                                            textAnchor="middle"
                                            dy="0.3em"
                                            className="fill-white text-xs font-medium"
                                        >
                                            {node.label}
                                        </text>
                                    </g>
                                ))}

                                {/* Draw honeytoken nodes */}
                                {honeytokenNodes.map(node => {
                                    const isTriggered = node.status === HoneytokenStatus.TRIGGERED;

                                    return (
                                        <g
                                            key={node.id}
                                            transform={`translate(${node.x}, ${node.y})`}
                                            className="cursor-pointer"
                                            onClick={() => onViewDetails?.(node.id)}
                                        >
                                            <circle
                                                r={15}
                                                className={`
                          ${isTriggered ? 'fill-red-500 animate-pulse' : 'fill-amber-500'} 
                          stroke-2 stroke-white dark:stroke-slate-800
                        `}
                                            />
                                            {isTriggered && (
                                                <circle
                                                    r={20}
                                                    fill="none"
                                                    className="stroke-2 stroke-red-500 animate-ping opacity-75"
                                                />
                                            )}
                                            <text
                                                textAnchor="middle"
                                                dy="0.3em"
                                                className="fill-white text-[10px] font-bold"
                                            >
                                                HT
                                            </text>
                                            <text
                                                textAnchor="middle"
                                                y={30}
                                                className="fill-slate-700 dark:fill-slate-300 text-[10px]"
                                            >
                                                {node.label.length > 10 ? `${node.label.substring(0, 10)}...` : node.label}
                                            </text>
                                        </g>
                                    );
                                })}
                            </svg>

                            {/* Legend */}
                            <div className="absolute bottom-4 left-4 bg-white dark:bg-slate-800 p-2 rounded-md shadow-sm border">
                                <div className="text-xs font-medium mb-1">Legend:</div>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                        <span className="text-xs">Active Honeytoken</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <span className="text-xs">Triggered Honeytoken</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                                        <span className="text-xs">System Component</span>
                                    </div>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="absolute top-4 right-4 flex gap-2">
                                <Button variant="outline" size="sm">
                                    <DownloadIcon className="h-4 w-4 mr-2" />
                                    Export
                                </Button>
                                <Button variant="outline" size="sm">
                                    <SettingsIcon className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="list">
                        <div className="space-y-4">
                            {filteredTokens.map(token => (
                                <Card key={token.id} className="overflow-hidden">
                                    <div className={`h-1 ${getStatusColor(token.status)}`}></div>
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium">{token.name}</h3>
                                                    <Badge className={getTypeColor(token.type)}>
                                                        {token.type.replace('_', ' ')}
                                                    </Badge>
                                                </div>
                                                {token.description && (
                                                    <p className="text-sm text-muted-foreground mt-1">{token.description}</p>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <Badge variant={getStatusVariant(token.status)}>
                                                    {token.status}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <MapPinIcon className="h-4 w-4" />
                                                <span>{token.location}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <ClockIcon className="h-4 w-4" />
                                                <span>Deployed: {formatDate(token.deployedAt)}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <EyeIcon className="h-4 w-4" />
                                                <span>Access count: {token.accessCount}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <ClockIcon className="h-4 w-4" />
                                                <span>Last checked: {formatDate(token.lastChecked)}</span>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex justify-end gap-2">
                                            <Button variant="outline" size="sm" onClick={() => onViewDetails?.(token.id)}>
                                                View Details
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="alerts">
                        {recentAlerts.length === 0 ? (
                            <EmptyState
                                icon={<AlertCircleIcon className="h-10 w-10 text-muted-foreground" />}
                                title="No alerts detected"
                                description="When honeytokens are accessed, alerts will appear here."
                            />
                        ) : (
                            <div className="space-y-4">
                                <AnimatePresence>
                                    {recentAlerts.map(alert => (
                                        <motion.div
                                            key={alert.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -100 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <Card className="overflow-hidden">
                                                <div className={`h-1 ${alert.severity === ThreatSeverity.CRITICAL ? 'bg-red-600' :
                                                        alert.severity === ThreatSeverity.HIGH ? 'bg-orange-500' :
                                                            alert.severity === ThreatSeverity.MEDIUM ? 'bg-yellow-500' :
                                                                'bg-blue-500'
                                                    }`}></div>
                                                <CardContent className="p-4">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <AlertTriangleIcon className={`h-5 w-5 ${alert.severity === ThreatSeverity.CRITICAL ? 'text-red-600' :
                                                                        alert.severity === ThreatSeverity.HIGH ? 'text-orange-500' :
                                                                            alert.severity === ThreatSeverity.MEDIUM ? 'text-yellow-500' :
                                                                                'text-blue-500'
                                                                    }`} />
                                                                <h3 className="font-medium">
                                                                    Honeytoken access detected
                                                                </h3>
                                                                <Badge className={
                                                                    alert.severity === ThreatSeverity.CRITICAL ? 'bg-red-600' :
                                                                        alert.severity === ThreatSeverity.HIGH ? 'bg-orange-500' :
                                                                            alert.severity === ThreatSeverity.MEDIUM ? 'bg-yellow-500' :
                                                                                'bg-blue-500'
                                                                }>
                                                                    {alert.severity}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                {alert.details}
                                                            </p>
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {formatDate(alert.timestamp)}
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                                                        {alert.sourceIp && (
                                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                                <span className="font-medium">Source IP:</span>
                                                                <span>{alert.sourceIp}</span>
                                                            </div>
                                                        )}
                                                        {alert.location && (
                                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                                <span className="font-medium">Location:</span>
                                                                <span>{alert.location}</span>
                                                            </div>
                                                        )}
                                                        {alert.userAgent && (
                                                            <div className="flex items-center gap-1 text-muted-foreground col-span-2">
                                                                <span className="font-medium">User Agent:</span>
                                                                <span className="truncate">{alert.userAgent}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="mt-4 flex justify-end gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => onViewDetails?.(alert.honeytokenId)}>
                                                            View Honeytoken
                                                        </Button>
                                                        <Button size="sm">
                                                            Investigate
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="stats">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Deployment Status</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span>Active</span>
                                            <span className="font-medium">
                                                {honeytokens.filter(t => t.status === HoneytokenStatus.ACTIVE).length}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Triggered</span>
                                            <span className="font-medium text-red-500">
                                                {honeytokens.filter(t => t.status === HoneytokenStatus.TRIGGERED).length}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Disabled</span>
                                            <span className="font-medium">
                                                {honeytokens.filter(t => t.status === HoneytokenStatus.DISABLED).length}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Expired</span>
                                            <span className="font-medium">
                                                {honeytokens.filter(t => t.status === HoneytokenStatus.EXPIRED).length}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Token Types</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {Object.values(HoneytokenType).map(type => (
                                            <div key={type} className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-3 h-3 rounded-full ${getTypeColor(type as HoneytokenType)}`}></div>
                                                    <span>{type.replace('_', ' ')}</span>
                                                </div>
                                                <span className="font-medium">
                                                    {honeytokens.filter(t => t.type === type).length}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="md:col-span-2">
                                <CardHeader>
                                    <CardTitle className="text-lg">Access Statistics</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span>Total access attempts</span>
                                            <span className="font-medium">
                                                {honeytokens.reduce((sum, token) => sum + token.accessCount, 0)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Tokens with access attempts</span>
                                            <span className="font-medium">
                                                {honeytokens.filter(t => t.accessCount > 0).length}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Most accessed token</span>
                                            <span className="font-medium">
                                                {honeytokens.length > 0
                                                    ? honeytokens.reduce((prev, current) =>
                                                        prev.accessCount > current.accessCount ? prev : current
                                                    ).name
                                                    : 'N/A'
                                                }
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Last access</span>
                                            <span className="font-medium">
                                                {honeytokens.some(t => t.lastAccessedAt)
                                                    ? formatDate(
                                                        honeytokens
                                                            .filter(t => t.lastAccessedAt)
                                                            .reduce((prev, current) =>
                                                                (prev.lastAccessedAt && current.lastAccessedAt &&
                                                                    new Date(prev.lastAccessedAt) > new Date(current.lastAccessedAt))
                                                                    ? prev : current
                                                            ).lastAccessedAt!
                                                    )
                                                    : 'No access recorded'
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}