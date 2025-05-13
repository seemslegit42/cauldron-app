import React, { useState, useEffect } from 'react';
import { useQuery } from 'wasp/client/operations';
import { getHoneytokens, getHoneytokenAlerts } from '@src/modules/phantom/api';
import { HoneytokenMap, Honeytoken, HoneytokenAlert, HoneytokenType, HoneytokenStatus } from '../components/HoneytokenMap';
import { PageLayout } from '@src/shared/components/layout/PageLayout';
import { Button } from '@src/shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@src/shared/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@src/shared/components/ui/card';
import { PlusIcon, RefreshCwIcon, ShieldIcon } from 'lucide-react';
import { ThreatSeverity } from '../types';

export function HoneytokenPage() {
    const [activeTab, setActiveTab] = useState('map');

    // In a real implementation, these would be actual API calls
    // For now, we'll use mock data
    const mockHoneytokens: Honeytoken[] = [
        {
            id: 'ht-1',
            name: 'Admin API Key',
            type: HoneytokenType.API_KEY,
            location: 'api/v1/admin',
            deployedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
            lastChecked: new Date(),
            status: HoneytokenStatus.ACTIVE,
            accessCount: 0,
            description: 'Fake admin API key to detect unauthorized access attempts',
        },
        {
            id: 'ht-2',
            name: 'Database Credentials',
            type: HoneytokenType.DATABASE_CREDENTIAL,
            location: 'database/users',
            deployedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15), // 15 days ago
            lastChecked: new Date(),
            status: HoneytokenStatus.TRIGGERED,
            accessCount: 3,
            lastAccessedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            description: 'Fake database credentials to detect unauthorized access attempts',
        },
        {
            id: 'ht-3',
            name: 'Admin Account',
            type: HoneytokenType.ADMIN_ACCOUNT,
            location: 'auth/admin',
            deployedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
            lastChecked: new Date(),
            status: HoneytokenStatus.ACTIVE,
            accessCount: 1,
            lastAccessedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
            description: 'Fake admin account to detect unauthorized access attempts',
        },
        {
            id: 'ht-4',
            name: 'Backup File',
            type: HoneytokenType.FILE,
            location: 'storage/backups',
            deployedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20), // 20 days ago
            lastChecked: new Date(),
            status: HoneytokenStatus.ACTIVE,
            accessCount: 0,
            description: 'Fake backup file to detect unauthorized access attempts',
        },
        {
            id: 'ht-5',
            name: 'Secret URL',
            type: HoneytokenType.URL,
            location: 'api/v1/internal/config',
            deployedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
            lastChecked: new Date(),
            status: HoneytokenStatus.ACTIVE,
            accessCount: 0,
            description: 'Fake secret URL to detect unauthorized access attempts',
        },
    ];

    const mockAlerts: HoneytokenAlert[] = [
        {
            id: 'alert-1',
            honeytokenId: 'ht-2',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            sourceIp: '192.168.1.1',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            location: 'United States',
            severity: ThreatSeverity.HIGH,
            details: 'Database credential honeytoken accessed from suspicious IP',
        },
        {
            id: 'alert-2',
            honeytokenId: 'ht-2',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
            sourceIp: '10.0.0.1',
            userAgent: 'curl/7.64.1',
            location: 'Internal Network',
            severity: ThreatSeverity.MEDIUM,
            details: 'Database credential honeytoken accessed from internal network',
        },
        {
            id: 'alert-3',
            honeytokenId: 'ht-3',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
            sourceIp: '8.8.8.8',
            userAgent: 'python-requests/2.25.1',
            location: 'United States',
            severity: ThreatSeverity.CRITICAL,
            details: 'Admin account honeytoken login attempt detected from external IP',
        },
    ];

    const [isLoading, setIsLoading] = useState(false);
    const [honeytokens, setHoneytokens] = useState<Honeytoken[]>(mockHoneytokens);
    const [alerts, setAlerts] = useState<HoneytokenAlert[]>(mockAlerts);

    const handleAddHoneytoken = () => {
        // In a real implementation, this would open a modal or navigate to a form
        console.log('Add honeytoken clicked');
    };

    const handleViewDetails = (id: string) => {
        // In a real implementation, this would navigate to a details page or open a modal
        console.log('View details clicked for honeytoken:', id);
    };

    const handleRefresh = () => {
        // In a real implementation, this would refetch the data
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    };

    return (
        <PageLayout>
            <div className="container mx-auto py-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Honeytoken Management</h1>
                        <p className="text-muted-foreground">
                            Deploy and monitor honeytokens to detect unauthorized access attempts
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleRefresh}>
                            <RefreshCwIcon className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                        <Button onClick={handleAddHoneytoken}>
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Deploy New Honeytoken
                        </Button>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="map">Honeytoken Map</TabsTrigger>
                        <TabsTrigger value="security">Security Recommendations</TabsTrigger>
                    </TabsList>

                    <TabsContent value="map">
                        <HoneytokenMap
                            honeytokens={honeytokens}
                            alerts={alerts}
                            isLoading={isLoading}
                            onAddHoneytoken={handleAddHoneytoken}
                            onViewDetails={handleViewDetails}
                            onRefresh={handleRefresh}
                        />
                    </TabsContent>

                    <TabsContent value="security">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Honeytoken Security Recommendations</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-2">
                                            <ShieldIcon className="h-5 w-5 text-green-500 mt-0.5" />
                                            <div>
                                                <h3 className="font-medium">Deploy diverse honeytoken types</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Use a mix of API keys, credentials, files, and URLs to detect different types of attacks.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <ShieldIcon className="h-5 w-5 text-green-500 mt-0.5" />
                                            <div>
                                                <h3 className="font-medium">Place honeytokens strategically</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Deploy honeytokens in locations that would be attractive to attackers but not to legitimate users.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <ShieldIcon className="h-5 w-5 text-green-500 mt-0.5" />
                                            <div>
                                                <h3 className="font-medium">Monitor and respond quickly</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Set up alerts and have a response plan ready for when honeytokens are triggered.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <ShieldIcon className="h-5 w-5 text-green-500 mt-0.5" />
                                            <div>
                                                <h3 className="font-medium">Rotate honeytokens regularly</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Change honeytokens periodically to prevent attackers from identifying them.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Current Coverage</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="font-medium">API Layer</h3>
                                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-2">
                                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">60% coverage</p>
                                        </div>
                                        <div>
                                            <h3 className="font-medium">Database Layer</h3>
                                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-2">
                                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">40% coverage</p>
                                        </div>
                                        <div>
                                            <h3 className="font-medium">Authentication Layer</h3>
                                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-2">
                                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">80% coverage</p>
                                        </div>
                                        <div>
                                            <h3 className="font-medium">Storage Layer</h3>
                                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-2">
                                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">20% coverage</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </PageLayout>
    );
}