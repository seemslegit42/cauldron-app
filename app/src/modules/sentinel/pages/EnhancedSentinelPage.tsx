/**
 * Enhanced Sentinel Module - Security Monitoring Dashboard
 *
 * This is the enhanced version of the Sentinel security module with cyberpunk styling.
 * It provides real-time security monitoring, alerts, and compliance enforcement.
 */

import React, { useState } from 'react';
import { useQuery } from 'wasp/client/operations';
import {
  getSecurityAlerts,
  getSecurityMetrics,
  getSecurityRecommendations,
  getSecurityScans,
} from 'wasp/client/operations';
import { SentientAssistant } from '@src/shared/components/SentientAssistant';
import { ModuleLayout } from '@src/shared/components/layout/ModuleLayout';
import { ModuleHeader } from '@src/shared/components/branding/ModuleHeader';
import { ModuleCard } from '@src/shared/components/branding/ModuleCard';
import { ModuleNavigation } from '@src/shared/components/branding/ModuleNavigation';
import { PulsatingGlow } from '@src/shared/components/effects/PulsatingGlow';
import { SecurityScanVisualization } from '@src/shared/components/visualizations/SecurityScanVisualization';
import { RiskLevel } from '../types';
import { 
  Shield, 
  AlertTriangle, 
  BarChart, 
  FileCheck, 
  Search, 
  CheckCircle, 
  Settings, 
  RefreshCw,
  Lock,
  Eye,
  FileWarning,
  Server
} from 'lucide-react';

export function EnhancedSentinelPage() {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'alerts' | 'metrics' | 'recommendations' | 'scans' | 'compliance' | 'maintenance'
  >('overview');
  const [assistantMinimized, setAssistantMinimized] = useState(false);

  // Fetch security data
  const {
    data: alerts = [],
    isLoading: isLoadingAlerts,
    error: alertsError,
    refetch: refetchAlerts,
  } = useQuery(getSecurityAlerts);
  const {
    data: metrics = [],
    isLoading: isLoadingMetrics,
    error: metricsError,
    refetch: refetchMetrics,
  } = useQuery(getSecurityMetrics);
  const {
    data: recommendations = [],
    isLoading: isLoadingRecommendations,
    error: recommendationsError,
    refetch: refetchRecommendations,
  } = useQuery(getSecurityRecommendations);
  const {
    data: scans = [],
    isLoading: isLoadingScans,
    error: scansError,
    refetch: refetchScans,
  } = useQuery(getSecurityScans);

  // Calculate security score and risk level
  const calculateSecurityScore = () => {
    const securityScoreMetric = metrics.find((m) => m.name === 'security_score');
    return securityScoreMetric?.value || 0;
  };

  const calculateRiskLevel = (): RiskLevel => {
    const score = calculateSecurityScore();
    if (score >= 90) return 'green';
    if (score >= 70) return 'yellow';
    return 'red';
  };

  // Get last scan time
  const getLastScanTime = () => {
    if (scans.length === 0) return 'Never';

    const lastScan = scans[0]; // Assuming scans are sorted by date desc
    return new Date(lastScan.startedAt).toLocaleString();
  };

  // Extract compliance checks from scans
  const getComplianceChecks = () => {
    return scans.flatMap((scan) => scan.complianceChecks || []);
  };

  // Handle refresh for all data
  const handleRefreshAll = () => {
    refetchAlerts();
    refetchMetrics();
    refetchRecommendations();
    refetchScans();
  };

  // Loading state
  const isLoading =
    isLoadingAlerts || isLoadingMetrics || isLoadingRecommendations || isLoadingScans;

  // Error state
  const hasError = alertsError || metricsError || recommendationsError || scansError;

  // Navigation items
  const navigationItems = [
    { 
      label: 'Overview', 
      path: '/sentinel',
      icon: <Shield className="h-5 w-5" />
    },
    { 
      label: 'Alerts', 
      path: '/sentinel?tab=alerts',
      icon: <AlertTriangle className="h-5 w-5" />
    },
    { 
      label: 'Metrics', 
      path: '/sentinel?tab=metrics',
      icon: <BarChart className="h-5 w-5" />
    },
    { 
      label: 'Recommendations', 
      path: '/sentinel?tab=recommendations',
      icon: <FileCheck className="h-5 w-5" />
    },
    { 
      label: 'Scans', 
      path: '/sentinel?tab=scans',
      icon: <Search className="h-5 w-5" />
    },
    { 
      label: 'Compliance', 
      path: '/sentinel?tab=compliance',
      icon: <CheckCircle className="h-5 w-5" />
    },
    { 
      label: 'Maintenance', 
      path: '/sentinel?tab=maintenance',
      icon: <Settings className="h-5 w-5" />
    },
  ];

  // Header with actions
  const header = (
    <ModuleHeader
      moduleId="sentinel"
      title="Sentinel Security"
      description="Monitor and enhance your system's security posture"
      icon={<Shield />}
      actions={
        <button
          onClick={handleRefreshAll}
          className="flex items-center rounded-md bg-teal-600 px-4 py-2 font-medium text-white hover:bg-teal-700"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg
                className="mr-2 -ml-1 h-5 w-5 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Loading...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-5 w-5" />
              Refresh All
            </>
          )}
        </button>
      }
    />
  );

  // Sidebar with navigation
  const sidebar = (
    <div className="h-full p-4">
      <div className="mb-8 flex items-center justify-center">
        <h2 className="text-xl font-bold text-teal-400">Sentinel</h2>
      </div>
      <ModuleNavigation
        moduleId="sentinel"
        items={navigationItems}
      />
    </div>
  );

  return (
    <ModuleLayout
      moduleId="sentinel"
      title="Sentinel"
      header={header}
      sidebar={sidebar}
      pattern="hex"
      patternOpacity={0.1}
      glowIntensity="medium"
      glowPositions={['top-right', 'bottom-left']}
      animate={true}
    >
      {/* Error Message */}
      {hasError && (
        <ModuleCard
          moduleId="sentinel"
          title="Error"
          icon={<AlertTriangle />}
          className="mb-6"
        >
          <div className="p-4">
            <div className="flex items-center">
              <span className="font-medium">
                Error loading security data. Please try refreshing.
              </span>
            </div>
          </div>
        </ModuleCard>
      )}

      {/* Navigation Tabs */}
      <div className="mb-8 border-b border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`border-b-2 px-1 py-4 text-sm font-medium ${activeTab === 'overview'
                ? 'border-teal-500 text-teal-500'
                : 'border-transparent text-gray-400 hover:border-gray-300 hover:text-gray-300'
              }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`border-b-2 px-1 py-4 text-sm font-medium ${activeTab === 'alerts'
                ? 'border-teal-500 text-teal-500'
                : 'border-transparent text-gray-400 hover:border-gray-300 hover:text-gray-300'
              }`}
          >
            Alerts {alerts.length > 0 && `(${alerts.length})`}
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`border-b-2 px-1 py-4 text-sm font-medium ${activeTab === 'metrics'
                ? 'border-teal-500 text-teal-500'
                : 'border-transparent text-gray-400 hover:border-gray-300 hover:text-gray-300'
              }`}
          >
            Metrics
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`border-b-2 px-1 py-4 text-sm font-medium ${activeTab === 'recommendations'
                ? 'border-teal-500 text-teal-500'
                : 'border-transparent text-gray-400 hover:border-gray-300 hover:text-gray-300'
              }`}
          >
            Recommendations {recommendations.length > 0 && `(${recommendations.length})`}
          </button>
          <button
            onClick={() => setActiveTab('scans')}
            className={`border-b-2 px-1 py-4 text-sm font-medium ${activeTab === 'scans'
                ? 'border-teal-500 text-teal-500'
                : 'border-transparent text-gray-400 hover:border-gray-300 hover:text-gray-300'
              }`}
          >
            Scans
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className={`border-b-2 px-1 py-4 text-sm font-medium ${activeTab === 'compliance'
                ? 'border-teal-500 text-teal-500'
                : 'border-transparent text-gray-400 hover:border-gray-300 hover:text-gray-300'
              }`}
          >
            Compliance
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`border-b-2 px-1 py-4 text-sm font-medium ${activeTab === 'maintenance'
                ? 'border-teal-500 text-teal-500'
                : 'border-transparent text-gray-400 hover:border-gray-300 hover:text-gray-300'
              }`}
          >
            Maintenance
          </button>
        </nav>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center">
            <svg
              className="mb-4 h-10 w-10 animate-spin text-teal-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-gray-400">Loading security data...</p>
          </div>
        </div>
      )}

      {/* Content */}
      {!isLoading && !hasError && (
        <div className="space-y-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Security Score Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ModuleCard
                  moduleId="sentinel"
                  title="Security Score"
                  icon={<Shield />}
                  className="md:col-span-1"
                  glow={true}
                >
                  <div className="p-6 flex flex-col items-center justify-center">
                    <div className="relative mb-4">
                      <div className="w-32 h-32 rounded-full border-8 border-gray-700 flex items-center justify-center">
                        <span className="text-4xl font-bold">{calculateSecurityScore()}</span>
                      </div>
                      <PulsatingGlow
                        color={calculateRiskLevel() === 'green' ? 'green' : calculateRiskLevel() === 'yellow' ? 'yellow' : 'red'}
                        className="absolute -top-2 -right-2"
                      />
                    </div>
                    <p className="text-sm text-gray-400">Last scan: {getLastScanTime()}</p>
                  </div>
                </ModuleCard>

                <ModuleCard
                  moduleId="sentinel"
                  title="Security Scan"
                  icon={<Search />}
                  className="md:col-span-2"
                >
                  <div className="p-6 h-64">
                    <SecurityScanVisualization />
                  </div>
                </ModuleCard>
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <ModuleCard
                  moduleId="sentinel"
                  title="Recent Alerts"
                  icon={<AlertTriangle />}
                >
                  <div className="p-4">
                    {alerts.slice(0, 3).map((alert: any, index: number) => (
                      <div key={index} className="mb-4 rounded-lg bg-gray-800/50 p-4">
                        <div className="flex items-start">
                          <div className={`p-2 rounded-lg mr-3 ${
                            alert.severity === 'critical' ? 'bg-red-500/20 text-red-500' :
                            alert.severity === 'high' ? 'bg-orange-500/20 text-orange-500' :
                            alert.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                            'bg-blue-500/20 text-blue-500'
                          }`}>
                            <AlertTriangle className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-bold">{alert.title}</h3>
                            <p className="text-sm text-gray-400 mt-1">{alert.description}</p>
                            <div className="flex items-center mt-2 text-xs text-gray-500">
                              <span>{new Date(alert.timestamp).toLocaleString()}</span>
                              <span className="mx-2">•</span>
                              <span className="capitalize">{alert.severity} Severity</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {alerts.length > 3 && (
                      <div className="mt-4 text-center">
                        <button
                          onClick={() => setActiveTab('alerts')}
                          className="text-sm text-teal-400 hover:text-teal-300"
                        >
                          View all {alerts.length} alerts
                        </button>
                      </div>
                    )}
                  </div>
                </ModuleCard>

                <ModuleCard
                  moduleId="sentinel"
                  title="Top Recommendations"
                  icon={<FileCheck />}
                >
                  <div className="p-4">
                    {recommendations.slice(0, 3).map((recommendation: any, index: number) => (
                      <div key={index} className="mb-4 rounded-lg bg-gray-800/50 p-4">
                        <div className="flex items-start">
                          <div className="bg-teal-500/20 p-2 rounded-lg mr-3 text-teal-500">
                            <FileCheck className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-bold">{recommendation.title}</h3>
                            <p className="text-sm text-gray-400 mt-1">{recommendation.description}</p>
                            <div className="flex items-center mt-2 text-xs text-gray-500">
                              <span className="capitalize">{recommendation.impact} Impact</span>
                              <span className="mx-2">•</span>
                              <span className="capitalize">{recommendation.effort} Effort</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {recommendations.length > 3 && (
                      <div className="mt-4 text-center">
                        <button
                          onClick={() => setActiveTab('recommendations')}
                          className="text-sm text-teal-400 hover:text-teal-300"
                        >
                          View all {recommendations.length} recommendations
                        </button>
                      </div>
                    )}
                  </div>
                </ModuleCard>
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <ModuleCard
                  moduleId="sentinel"
                  title="Security Metrics"
                  icon={<BarChart />}
                >
                  <div className="p-4 grid grid-cols-2 gap-4">
                    {metrics.slice(0, 4).map((metric: any, index: number) => (
                      <div key={index} className="bg-gray-800/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium text-gray-400">{metric.name.replace(/_/g, ' ')}</h3>
                          {metric.trend && (
                            <span className={`text-xs ${
                              metric.trend === 'up' ? 'text-green-400' : 
                              metric.trend === 'down' ? 'text-red-400' : 
                              'text-gray-400'
                            }`}>
                              {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'}
                            </span>
                          )}
                        </div>
                        <p className="text-2xl font-bold">{metric.value}</p>
                      </div>
                    ))}
                  </div>
                </ModuleCard>

                <ModuleCard
                  moduleId="sentinel"
                  title="Recent Scans"
                  icon={<Search />}
                >
                  <div className="p-4">
                    {scans.slice(0, 3).map((scan: any, index: number) => (
                      <div key={index} className="mb-4 rounded-lg bg-gray-800/50 p-4">
                        <div className="flex items-start">
                          <div className="bg-teal-500/20 p-2 rounded-lg mr-3 text-teal-500">
                            <Search className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-bold">{scan.type} Scan</h3>
                            <div className="flex items-center mt-2 text-xs text-gray-500">
                              <span>{new Date(scan.startedAt).toLocaleString()}</span>
                              <span className="mx-2">•</span>
                              <span>{scan.duration} seconds</span>
                              <span className="mx-2">•</span>
                              <span className={`capitalize ${
                                scan.status === 'completed' ? 'text-green-400' :
                                scan.status === 'failed' ? 'text-red-400' :
                                'text-yellow-400'
                              }`}>
                                {scan.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {scans.length > 3 && (
                      <div className="mt-4 text-center">
                        <button
                          type="button"
                          onClick={() => setActiveTab('scans')}
                          className="text-sm text-teal-400 hover:text-teal-300"
                        >
                          View all {scans.length} scans
                        </button>
                      </div>
                    )}
                  </div>
                </ModuleCard>
              </div>
            </div>
          )}

          {/* Other tabs would be implemented here */}
        </div>
      )}

      {/* Sentient Assistant */}
      <div className="fixed bottom-4 right-4 z-10 w-96">
        <SentientAssistant
          module="sentinel"
          initialPrompt="How can I help you improve your security posture today?"
          minimized={assistantMinimized}
          onMinimize={() => setAssistantMinimized(true)}
          onMaximize={() => setAssistantMinimized(false)}
        />
      </div>
    </ModuleLayout>
  );
}
