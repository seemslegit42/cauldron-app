import React, { useState, useEffect } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import { useUser } from 'wasp/client/auth';
import { motion } from 'framer-motion';
import { cn } from '@src/shared/utils/cn';
import { getGlassmorphismClasses } from '@src/shared/utils/glassmorphism';
import { Button } from '@src/shared/components/ui/Button';
import { PhantomLayout } from '../components/layout/PhantomLayout';
import { ThreatMonitoringDashboard } from '../components/ThreatMonitoringDashboard';
import { DomainCloneMonitor } from '../components/DomainCloneMonitor';
import { OsintScanResults } from '../components/OsintScanResults';
import { VulnerabilityScanner } from '../components/VulnerabilityScanner';
import { SecurityActionPanel } from '../components/SecurityActionPanel';
import { ThreatLangGraphWidget } from '../components/ThreatLangGraphWidget';
import { ThreatLog } from '../components/ThreatLog';
import { SimulationRunner } from '../components/SimulationRunner';
import { AIIntercept } from '../components/AIIntercept';
import { PermissionGuard } from '@src/shared/components/auth/PermissionGuard';
import {
  getSecurityDashboard,
  runSecurityScan,
  addDomainToMonitoring,
} from '../api/operations';
import {
  useCanViewPhantomDashboard,
  useCanRunSecurityScans,
  useCanMonitorThreats,
  useCanViewDomainClones,
  useCanScanDomainClones,
  PHANTOM_RESOURCE,
  READ_ACTION,
} from '../utils/permissionUtils';

/**
 * PhantomPageNew - Redesigned dashboard for the Phantom cybersecurity module
 *
 * Features:
 * - Real-time threat monitoring
 * - Domain clone detection
 * - OSINT scanning
 * - Vulnerability management
 * - Security action panel
 */
export default function PhantomPageNew() {
  const { data: user } = useUser();
  const [activeTab, setActiveTab] = useState<'overview' | 'threat-monitoring' | 'threats' | 'domains' | 'osint' | 'vulnerabilities' | 'simulations'>('overview');
  const [selectedThreat, setSelectedThreat] = useState<any>(null);
  const [showAIIntercept, setShowAIIntercept] = useState(false);
  const { data: dashboardData, isLoading, error, refetch } = useQuery(getSecurityDashboard);
  const runSecurityScanAction = useAction(runSecurityScan);
  const addDomainToMonitoringAction = useAction(addDomainToMonitoring);

  // Check permissions
  const canViewDashboard = useCanViewPhantomDashboard();
  const canRunScans = useCanRunSecurityScans();
  const canMonitorThreats = useCanMonitorThreats();
  const canViewDomainClones = useCanViewDomainClones();
  const canScanDomainClones = useCanScanDomainClones();

  // Handle refresh
  const handleRefresh = () => {
    refetch();
  };

  // Handle run scan
  const handleRunScan = async (scanType: string) => {
    if (canRunScans) {
      try {
        await runSecurityScanAction({
          scanType,
          targets: [],
          configuration: {},
        });
        refetch();
      } catch (error) {
        console.error('Error running scan:', error);
      }
    }
  };

  // Handle add domain to monitoring
  const handleAddDomain = async (domain: string) => {
    if (canMonitorThreats) {
      try {
        await addDomainToMonitoringAction({
          domain,
          monitoringType: 'clone',
          isActive: true,
        });
        refetch();
      } catch (error) {
        console.error('Error adding domain:', error);
      }
    }
  };

  // Handle threat selection
  const handleThreatSelect = (threat: any) => {
    setSelectedThreat(threat);
    setShowAIIntercept(true);
  };

  // Handle AI intercept close
  const handleAIInterceptClose = () => {
    setShowAIIntercept(false);
  };

  // Handle decision made
  const handleDecisionMade = (decision: any) => {
    console.log('Decision made:', decision);
    setShowAIIntercept(false);
    refetch();
  };

  // Handle simulation complete
  const handleSimulationComplete = (results: any) => {
    console.log('Simulation complete:', results);
    refetch();
  };

  // Parse dashboard data
  const dashboardStats = dashboardData?.stats || {
    activeThreatCount: 0,
    criticalThreatCount: 0,
    domainCloneCount: 0,
    vulnerabilityCount: 0,
    securityScore: 0,
    lastScanDate: new Date(),
    threatsByType: {},
    recentThreats: [],
    recentDomainClones: [],
    recentVulnerabilities: [],
  };

  // Determine risk level
  const getRiskLevel = () => {
    if (dashboardStats.criticalThreatCount > 0) return 'critical';
    if (dashboardStats.activeThreatCount > 5) return 'high';
    if (dashboardStats.activeThreatCount > 0) return 'medium';
    return 'low';
  };

  // If user doesn't have permission to view the dashboard, show a message
  if (!canViewDashboard) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <div className={cn(
          "max-w-md rounded-lg p-8",
          getGlassmorphismClasses({
            level: 'medium',
            border: true,
            shadow: true,
          })
        )}>
          <h1 className="mb-4 text-2xl font-bold text-red-400">Access Restricted</h1>
          <p className="mb-6 text-gray-300">
            You don't have permission to access the Phantom Security Dashboard.
          </p>
          <Button
            onClick={() => window.location.href = '/'}
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <PhantomLayout
      title="Phantom Security"
      description="Cybersecurity monitoring and threat detection"
      riskLevel={getRiskLevel()}
      actions={
        <>
          <Button
            variant="outline"
            onClick={handleRefresh}
            isLoading={isLoading}
            leftIcon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            }
          >
            Refresh
          </Button>
          <PermissionGuard
            resource={PHANTOM_RESOURCE}
            action="scan"
            fallback={<div />}
          >
            <Button
              onClick={() => handleRunScan('full')}
              leftIcon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
            >
              Run Security Scan
            </Button>
          </PermissionGuard>
        </>
      }
    >
      {/* Tabs */}
      <div className="flex space-x-1 overflow-x-auto">
        <button
          type="button"
          className={cn(
            "rounded-md px-3 py-2 text-sm font-medium",
            activeTab === 'overview'
              ? "bg-gray-800 text-white"
              : "text-gray-400 hover:bg-gray-800 hover:text-white"
          )}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          type="button"
          className={cn(
            "rounded-md px-3 py-2 text-sm font-medium",
            activeTab === 'threat-monitoring'
              ? "bg-gray-800 text-white"
              : "text-gray-400 hover:bg-gray-800 hover:text-white"
          )}
          onClick={() => setActiveTab('threat-monitoring')}
        >
          Threat Monitoring
        </button>
        <button
          type="button"
          className={cn(
            "rounded-md px-3 py-2 text-sm font-medium",
            activeTab === 'threats'
              ? "bg-gray-800 text-white"
              : "text-gray-400 hover:bg-gray-800 hover:text-white"
          )}
          onClick={() => setActiveTab('threats')}
        >
          Threats
        </button>
        <button
          type="button"
          className={cn(
            "rounded-md px-3 py-2 text-sm font-medium",
            activeTab === 'domains'
              ? "bg-gray-800 text-white"
              : "text-gray-400 hover:bg-gray-800 hover:text-white"
          )}
          onClick={() => setActiveTab('domains')}
        >
          Domain Clones
        </button>
        <button
          type="button"
          className={cn(
            "rounded-md px-3 py-2 text-sm font-medium",
            activeTab === 'osint'
              ? "bg-gray-800 text-white"
              : "text-gray-400 hover:bg-gray-800 hover:text-white"
          )}
          onClick={() => setActiveTab('osint')}
        >
          OSINT
        </button>
        <button
          type="button"
          className={cn(
            "rounded-md px-3 py-2 text-sm font-medium",
            activeTab === 'vulnerabilities'
              ? "bg-gray-800 text-white"
              : "text-gray-400 hover:bg-gray-800 hover:text-white"
          )}
          onClick={() => setActiveTab('vulnerabilities')}
        >
          Vulnerabilities
        </button>
        <button
          type="button"
          className={cn(
            "rounded-md px-3 py-2 text-sm font-medium",
            activeTab === 'simulations'
              ? "bg-gray-800 text-white"
              : "text-gray-400 hover:bg-gray-800 hover:text-white"
          )}
          onClick={() => setActiveTab('simulations')}
        >
          Simulations
        </button>
      </div>

      {/* Tab Content */}
      <div className="mb-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className={cn(
                "overflow-hidden rounded-lg",
                getGlassmorphismClasses({
                  level: 'medium',
                  border: true,
                  shadow: true,
                })
              )}>
                <div className="border-b border-gray-700/50 p-4">
                  <h2 className="text-lg font-semibold text-white">Security Overview</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg bg-gray-800/50 p-4">
                      <h3 className="text-sm font-medium text-gray-400">Security Score</h3>
                      <p className="mt-2 text-3xl font-bold text-white">{dashboardStats.securityScore}/100</p>
                    </div>
                    <div className="rounded-lg bg-gray-800/50 p-4">
                      <h3 className="text-sm font-medium text-gray-400">Active Threats</h3>
                      <p className="mt-2 text-3xl font-bold text-white">{dashboardStats.activeThreatCount}</p>
                    </div>
                    <div className="rounded-lg bg-gray-800/50 p-4">
                      <h3 className="text-sm font-medium text-gray-400">Domain Clones</h3>
                      <p className="mt-2 text-3xl font-bold text-white">{dashboardStats.domainCloneCount}</p>
                    </div>
                    <div className="rounded-lg bg-gray-800/50 p-4">
                      <h3 className="text-sm font-medium text-gray-400">Vulnerabilities</h3>
                      <p className="mt-2 text-3xl font-bold text-white">{dashboardStats.vulnerabilityCount}</p>
                    </div>
                  </div>
                </div>
              </div>
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
          <ThreatMonitoringDashboard
            threats={dashboardStats.recentThreats}
            isLoading={isLoading}
            onRefresh={handleRefresh}
          />
        )}

        {activeTab === 'threats' && (
          <div className={cn(
            "overflow-hidden rounded-lg",
            getGlassmorphismClasses({
              level: 'medium',
              border: true,
              shadow: true,
            })
          )}>
            <div className="border-b border-gray-700/50 p-4">
              <h2 className="text-lg font-semibold text-white">Threat Detection</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-6">
                <ThreatLog
                  limit={20}
                  autoRefresh={true}
                  refreshInterval={30000}
                  onSelectThreat={handleThreatSelect}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'domains' && (
          <DomainCloneMonitor domainClones={dashboardStats.recentDomainClones} />
        )}

        {activeTab === 'osint' && <OsintScanResults />}

        {activeTab === 'vulnerabilities' && (
          <VulnerabilityScanner vulnerabilities={dashboardStats.recentVulnerabilities} />
        )}

        {activeTab === 'simulations' && (
          <div className={cn(
            "overflow-hidden rounded-lg",
            getGlassmorphismClasses({
              level: 'medium',
              border: true,
              shadow: true,
            })
          )}>
            <div className="border-b border-gray-700/50 p-4">
              <h2 className="text-lg font-semibold text-white">Red Team Simulations</h2>
            </div>
            <div className="p-6">
              <SimulationRunner onSimulationComplete={handleSimulationComplete} />
            </div>
          </div>
        )}
      </div>

      {/* AI Intercept Modal */}
      {showAIIntercept && selectedThreat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-4xl p-4">
            <AIIntercept
              threat={selectedThreat}
              onDecisionMade={handleDecisionMade}
              onClose={handleAIInterceptClose}
            />
          </div>
        </div>
      )}
    </PhantomLayout>
  );
}
