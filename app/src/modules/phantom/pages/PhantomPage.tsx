import React, { useState, useEffect } from 'react';
import { useQuery } from 'wasp/client/operations';
import { useUser } from 'wasp/client/auth';
import { Link } from 'react-router-dom';
import { SentientAssistant } from '@src/shared/components/SentientAssistant';
import { getSecurityDashboard } from '../api/operations';
import { SecurityDashboardStats, ThreatSeverity } from '../types';
import { PermissionGuard } from '@src/shared/components/auth/PermissionGuard';
import {
  useCanViewPhantomDashboard,
  useCanRunSecurityScans,
  useCanMonitorThreats,
  useCanViewDomainClones,
  useCanScanDomainClones,
  PHANTOM_RESOURCE,
  READ_ACTION,
} from '../utils/permissionUtils';

// Import components
import { SecurityOverview } from '../components/SecurityOverview';
import { ThreatDetectionPanel } from '../components/ThreatDetectionPanel';
import { DomainCloneMonitor } from '../components/DomainCloneMonitor';
import { OsintScanResults } from '../components/OsintScanResults';
import { SecurityActionPanel } from '../components/SecurityActionPanel';
import { VulnerabilityScanner } from '../components/VulnerabilityScanner';
import { ThreatMonitoringDashboard } from '../components/ThreatMonitoringDashboard';
import { ThreatLangGraphWidget } from '../components/ThreatLangGraphWidget';

export default function PhantomDashboard() {
  const { data: user } = useUser();
  const [assistantMinimized, setAssistantMinimized] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Check permissions
  const canViewDashboard = useCanViewPhantomDashboard();
  const canRunScans = useCanRunSecurityScans();
  const canMonitorThreats = useCanMonitorThreats();
  const canViewDomainClones = useCanViewDomainClones();
  const canScanDomainClones = useCanScanDomainClones();

  // Fetch security dashboard data
  const {
    data: securityData,
    isLoading: isLoadingSecurityData,
    error: securityError,
  } = useQuery(getSecurityDashboard, {});

  // Default dashboard stats for initial render or when data is loading
  const defaultStats: SecurityDashboardStats = {
    activeThreatCount: 0,
    criticalThreatCount: 0,
    domainCloneCount: 0,
    vulnerabilityCount: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    },
    securityScore: 0,
    threatsByType: {},
    recentThreats: [],
    recentDomainClones: [],
    recentVulnerabilities: [],
  };

  // Use actual data or default stats
  const dashboardStats = securityData?.stats || defaultStats;

  // Calculate security status based on threat counts
  const getSecurityStatus = () => {
    if (dashboardStats.criticalThreatCount > 0) return 'critical';
    if (dashboardStats.activeThreatCount > 3) return 'high';
    if (dashboardStats.activeThreatCount > 0) return 'medium';
    return 'stable';
  };

  const securityStatus = getSecurityStatus();

  // Status color mapping
  const statusColors = {
    critical: 'text-red-500',
    high: 'text-orange-500',
    medium: 'text-yellow-500',
    stable: 'text-green-500',
  };

  return (
    <PermissionGuard
      resource={PHANTOM_RESOURCE}
      action={READ_ACTION}
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-6 text-white">
          <div className="max-w-md rounded-lg border border-red-700 bg-red-900/30 p-6">
            <h2 className="mb-4 text-2xl font-bold text-red-400">Access Denied</h2>
            <p className="mb-6 text-gray-300">
              You do not have permission to access the Phantom security dashboard. Please contact
              your administrator if you believe this is an error.
            </p>
            <Link
              to="/arcana"
              className="block w-full rounded-md bg-red-700 px-4 py-2 text-center font-medium text-white hover:bg-red-600"
            >
              Return to Arcana
            </Link>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-gray-900 text-white">
        <header className="border-b border-gray-700 bg-gray-800 p-6 shadow-lg">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-red-400">Phantom</h1>
                <p className="mt-1 text-gray-400">Cybersecurity Command Center</p>
              </div>
              <div className="flex items-center space-x-4">
                <div
                  className={`rounded-full px-4 py-2 ${statusColors[securityStatus]} bg-opacity-20 border border-current`}
                >
                  <span className="font-medium">Security Status: </span>
                  <span className="font-bold capitalize">{securityStatus}</span>
                </div>
                <Link
                  to="/arcana"
                  className="rounded-md bg-gray-700 px-4 py-2 font-medium text-white transition-colors hover:bg-gray-600"
                >
                  Return to Arcana
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl p-6">
          {isLoadingSecurityData ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-red-500"></div>
            </div>
          ) : securityError ? (
            <div className="mb-8 rounded-lg border border-red-700 bg-red-900/30 p-6">
              <h2 className="mb-2 text-xl font-bold text-red-400">Error Loading Security Data</h2>
              <p className="text-gray-300">{securityError.message}</p>
              <button
                type="button"
                className="mt-4 rounded-md bg-red-700 px-4 py-2 font-medium text-white hover:bg-red-600"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Navigation Tabs */}
              <div className="mb-6 flex border-b border-gray-700">
                <button
                  type="button"
                  className={`px-6 py-3 font-medium ${activeTab === 'overview' ? 'border-b-2 border-red-400 text-red-400' : 'text-gray-400 hover:text-gray-200'}`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </button>
                <button
                  type="button"
                  className={`px-6 py-3 font-medium ${activeTab === 'threat-monitoring' ? 'border-b-2 border-red-400 text-red-400' : 'text-gray-400 hover:text-gray-200'}`}
                  onClick={() => setActiveTab('threat-monitoring')}
                >
                  Threat Monitoring
                </button>
                <button
                  type="button"
                  className={`px-6 py-3 font-medium ${activeTab === 'threats' ? 'border-b-2 border-red-400 text-red-400' : 'text-gray-400 hover:text-gray-200'}`}
                  onClick={() => setActiveTab('threats')}
                >
                  Threat Detection
                </button>
                <button
                  type="button"
                  className={`px-6 py-3 font-medium ${activeTab === 'domains' ? 'border-b-2 border-red-400 text-red-400' : 'text-gray-400 hover:text-gray-200'}`}
                  onClick={() => setActiveTab('domains')}
                >
                  Domain Monitoring
                </button>
                <button
                  type="button"
                  className={`px-6 py-3 font-medium ${activeTab === 'osint' ? 'border-b-2 border-red-400 text-red-400' : 'text-gray-400 hover:text-gray-200'}`}
                  onClick={() => setActiveTab('osint')}
                >
                  OSINT Scanner
                </button>
                <button
                  type="button"
                  className={`px-6 py-3 font-medium ${activeTab === 'vulnerabilities' ? 'border-b-2 border-red-400 text-red-400' : 'text-gray-400 hover:text-gray-200'}`}
                  onClick={() => setActiveTab('vulnerabilities')}
                >
                  Vulnerabilities
                </button>
              </div>

              {/* Tab Content */}
              <div className="mb-8">
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                      <SecurityOverview stats={dashboardStats} />
                      <div className="mt-6">
                        <ThreatLangGraphWidget />
                      </div>
                    </div>
                    <div>
                      <SecurityActionPanel />
                    </div>
                  </div>
                )}

                {activeTab === 'threat-monitoring' && (
                  <ThreatMonitoringDashboard />
                )}

                {activeTab === 'threats' && (
                  <ThreatDetectionPanel threats={dashboardStats.recentThreats} />
                )}

                {activeTab === 'domains' && (
                  <DomainCloneMonitor domainClones={dashboardStats.recentDomainClones} />
                )}

                {activeTab === 'osint' && <OsintScanResults />}

                {activeTab === 'vulnerabilities' && (
                  <VulnerabilityScanner vulnerabilities={dashboardStats.recentVulnerabilities} />
                )}
              </div>
            </>
          )}
        </main>

        {/* Sentient Assistant */}
        <div className="fixed right-4 bottom-4 z-10 w-96">
          <SentientAssistant
            module="phantom"
            initialPrompt="What security threats should I be aware of today?"
            minimized={assistantMinimized}
            onMinimize={() => setAssistantMinimized(true)}
            onMaximize={() => setAssistantMinimized(false)}
          />
        </div>
      </div>
    </PermissionGuard>
  );
}
