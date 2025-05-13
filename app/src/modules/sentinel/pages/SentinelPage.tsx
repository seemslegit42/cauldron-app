import React, { useState } from 'react';
import { useQuery } from 'wasp/client/operations';
import {
  getSecurityAlerts,
  getSecurityMetrics,
  getSecurityRecommendations,
  getSecurityScans,
} from 'wasp/client/operations';
import {
  SecurityOverview,
  SecurityAlertsList,
  SecurityMetricsPanel,
  SecurityRecommendationsPanel,
  SecurityScanHistory,
  SecurityCompliancePanel,
  MaintenanceDashboard,
} from '../components';
import { RiskLevel } from '../types';

export function SentinelPage() {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'alerts' | 'metrics' | 'recommendations' | 'scans' | 'compliance' | 'maintenance'
  >('overview');

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

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Sentinel Security</h1>
            <p className="mt-1 text-gray-400">Monitor and enhance your system's security posture</p>
          </div>
          <button
            onClick={handleRefreshAll}
            className="flex items-center rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </svg>
                Refresh All
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {hasError && (
          <div className="mb-8 rounded-lg bg-red-900 p-4 text-white">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span className="font-medium">
                Error loading security data. Please try refreshing.
              </span>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-8 border-b border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-400 hover:border-gray-300 hover:text-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'alerts'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-400 hover:border-gray-300 hover:text-gray-300'
              }`}
            >
              Alerts {alerts.length > 0 && `(${alerts.length})`}
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'metrics'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-400 hover:border-gray-300 hover:text-gray-300'
              }`}
            >
              Metrics
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'recommendations'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-400 hover:border-gray-300 hover:text-gray-300'
              }`}
            >
              Recommendations {recommendations.length > 0 && `(${recommendations.length})`}
            </button>
            <button
              onClick={() => setActiveTab('scans')}
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'scans'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-400 hover:border-gray-300 hover:text-gray-300'
              }`}
            >
              Scans
            </button>
            <button
              onClick={() => setActiveTab('compliance')}
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'compliance'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-400 hover:border-gray-300 hover:text-gray-300'
              }`}
            >
              Compliance
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'maintenance'
                  ? 'border-blue-500 text-blue-500'
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
                className="mb-4 h-10 w-10 animate-spin text-blue-500"
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
                <SecurityOverview
                  securityScore={calculateSecurityScore()}
                  riskLevel={calculateRiskLevel()}
                  metrics={metrics.slice(0, 4)}
                  lastScanTime={getLastScanTime()}
                />

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  <div>
                    <h2 className="mb-4 text-xl font-bold text-white">Recent Alerts</h2>
                    <SecurityAlertsList alerts={alerts.slice(0, 3)} onRefresh={refetchAlerts} />
                    {alerts.length > 3 && (
                      <div className="mt-4 text-center">
                        <button
                          onClick={() => setActiveTab('alerts')}
                          className="text-sm text-blue-400 hover:text-blue-300"
                        >
                          View all {alerts.length} alerts
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <h2 className="mb-4 text-xl font-bold text-white">Top Recommendations</h2>
                    <SecurityRecommendationsPanel recommendations={recommendations.slice(0, 3)} />
                    {recommendations.length > 3 && (
                      <div className="mt-4 text-center">
                        <button
                          onClick={() => setActiveTab('recommendations')}
                          className="text-sm text-blue-400 hover:text-blue-300"
                        >
                          View all {recommendations.length} recommendations
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  <div>
                    <h2 className="mb-4 text-xl font-bold text-white">Agent Workflow Monitor</h2>
                    <SecurityLangGraphWidget />
                  </div>

                  <div>
                    <h2 className="mb-4 text-xl font-bold text-white">Recent Scans</h2>
                    <SecurityScanHistory scans={scans.slice(0, 3)} onRefresh={refetchScans} />
                    {scans.length > 3 && (
                      <div className="mt-4 text-center">
                        <button
                          type="button"
                          onClick={() => setActiveTab('scans')}
                          className="text-sm text-blue-400 hover:text-blue-300"
                        >
                          View all {scans.length} scans
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Alerts Tab */}
            {activeTab === 'alerts' && (
              <SecurityAlertsList alerts={alerts} onRefresh={refetchAlerts} />
            )}

            {/* Metrics Tab */}
            {activeTab === 'metrics' && <SecurityMetricsPanel metrics={metrics} />}

            {/* Recommendations Tab */}
            {activeTab === 'recommendations' && (
              <SecurityRecommendationsPanel recommendations={recommendations} />
            )}

            {/* Scans Tab */}
            {activeTab === 'scans' && (
              <SecurityScanHistory scans={scans} onRefresh={refetchScans} />
            )}

            {/* Compliance Tab */}
            {activeTab === 'compliance' && (
              <SecurityCompliancePanel complianceChecks={getComplianceChecks()} />
            )}

            {/* Maintenance Tab */}
            {activeTab === 'maintenance' && <MaintenanceDashboard />}
          </div>
        )}
      </div>
    </div>
  );
}
