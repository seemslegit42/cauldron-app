import React, { useState, useEffect } from 'react';
import { useQuery } from 'wasp/client/operations';
import { getThreatMonitoringDashboard } from '@src/modules/phantom/api/threatMonitoring';
import { useToast } from '@src/shared/hooks/useToast';
import { Spinner } from '@src/shared/components/Spinner';
import { ErrorMessage } from '@src/shared/components/ErrorMessage';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@src/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@src/shared/components/ui/tabs';
import { Button } from '@src/shared/components/ui/button';
import { Badge } from '@src/shared/components/ui/badge';
import { ThreatFeedPanel } from './ThreatFeedPanel';
import { BrandAlertPanel } from './BrandAlertPanel';
import { CVEAlertPanel } from './CVEAlertPanel';
import { PhishingVectorPanel } from './PhishingVectorPanel';
import { SentinelLogIntegrationPanel } from './SentinelLogIntegrationPanel';
import { ThreatMonitorPanel } from './ThreatMonitorPanel';
import { ThreatSeverityVisualizer } from './ThreatSeverityVisualizer';
import { ThreatResponseOptions } from './ThreatResponseOptions';
import { RefreshIcon, AlertTriangleIcon, ShieldIcon, EyeIcon, BellIcon } from 'lucide-react';

export function ThreatMonitoringDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { data, isLoading, error, refetch } = useQuery(getThreatMonitoringDashboard);
  const toast = useToast();

  useEffect(() => {
    // Set up a refresh interval (every 5 minutes)
    const intervalId = setInterval(() => {
      refetch();
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [refetch]);

  const handleRefresh = () => {
    refetch();
    toast.success('Dashboard refreshed');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <ErrorMessage error={error} />
      </div>
    );
  }

  const {
    threatFeeds,
    threatMonitors,
    brandAlerts,
    cveAlerts,
    phishingVectors,
    sentinelLogIntegrations,
    stats,
  } = data || {
    threatFeeds: [],
    threatMonitors: [],
    brandAlerts: [],
    cveAlerts: [],
    phishingVectors: [],
    sentinelLogIntegrations: [],
    stats: {
      totalAlerts: 0,
      criticalAlerts: 0,
      highAlerts: 0,
      mediumAlerts: 0,
      lowAlerts: 0,
      activeMonitors: 0,
      activeFeeds: 0,
    },
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Threat Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of security threats and brand alerts
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2">
          <RefreshIcon className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Alerts</p>
                <h3 className="text-2xl font-bold">{stats.totalAlerts}</h3>
              </div>
              <AlertTriangleIcon className="h-8 w-8 text-primary opacity-75" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Alerts</p>
                <h3 className="text-2xl font-bold">{stats.criticalAlerts}</h3>
              </div>
              <Badge variant="destructive" className="text-lg px-3 py-1">
                {stats.criticalAlerts}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Monitors</p>
                <h3 className="text-2xl font-bold">{stats.activeMonitors}</h3>
              </div>
              <EyeIcon className="h-8 w-8 text-primary opacity-75" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Feeds</p>
                <h3 className="text-2xl font-bold">{stats.activeFeeds}</h3>
              </div>
              <BellIcon className="h-8 w-8 text-primary opacity-75" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Severity Visualizer */}
      <Card>
        <CardHeader>
          <CardTitle>Threat Severity Overview</CardTitle>
          <CardDescription>
            Distribution of alerts by severity level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ThreatSeverityVisualizer
            criticalCount={stats.criticalAlerts}
            highCount={stats.highAlerts}
            mediumCount={stats.mediumAlerts}
            lowCount={stats.lowAlerts}
          />
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="brand-alerts">Brand Alerts</TabsTrigger>
          <TabsTrigger value="cve-alerts">CVE Alerts</TabsTrigger>
          <TabsTrigger value="phishing">Phishing</TabsTrigger>
          <TabsTrigger value="monitors">Monitors</TabsTrigger>
          <TabsTrigger value="feeds">Feeds</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Brand Alerts</CardTitle>
                <CardDescription>
                  Latest alerts for your monitored brands
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BrandAlertPanel alerts={brandAlerts.slice(0, 5)} compact />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent CVE Alerts</CardTitle>
                <CardDescription>
                  Latest vulnerability alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CVEAlertPanel alerts={cveAlerts.slice(0, 5)} compact />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Phishing Vectors</CardTitle>
                <CardDescription>
                  Recent phishing attempts detected
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PhishingVectorPanel vectors={phishingVectors.slice(0, 5)} compact />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Options</CardTitle>
                <CardDescription>
                  Quick actions for threat response
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ThreatResponseOptions />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="brand-alerts" className="space-y-4 mt-4">
          <BrandAlertPanel alerts={brandAlerts} />
        </TabsContent>

        <TabsContent value="cve-alerts" className="space-y-4 mt-4">
          <CVEAlertPanel alerts={cveAlerts} />
        </TabsContent>

        <TabsContent value="phishing" className="space-y-4 mt-4">
          <PhishingVectorPanel vectors={phishingVectors} />
        </TabsContent>

        <TabsContent value="monitors" className="space-y-4 mt-4">
          <ThreatMonitorPanel monitors={threatMonitors} />
        </TabsContent>

        <TabsContent value="feeds" className="space-y-4 mt-4">
          <ThreatFeedPanel feeds={threatFeeds} />
        </TabsContent>
      </Tabs>

      {/* Sentinel Integration */}
      <Card>
        <CardHeader>
          <CardTitle>Sentinel Log Integration</CardTitle>
          <CardDescription>
            Integration with Sentinel security logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SentinelLogIntegrationPanel integrations={sentinelLogIntegrations} />
        </CardContent>
      </Card>
    </div>
  );
}
