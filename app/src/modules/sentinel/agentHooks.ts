import { useQuery, useAction } from 'wasp/client/operations';
import { 
  getSecurityAlerts, 
  getSecurityMetrics, 
  getSecurityRecommendations, 
  getSecurityScans,
  runSecurityScan,
  acknowledgeAlert
} from 'wasp/client/operations';
import { 
  SecurityAlert, 
  SecurityMetric, 
  SecurityRecommendation, 
  SecurityScan,
  ScanType,
  RiskLevel
} from './types';

/**
 * Hook to get security alerts
 */
export const useSentinelAlerts = () => {
  const { data: alerts = [], isLoading, error, refetch } = useQuery(getSecurityAlerts);
  
  return {
    alerts,
    isLoading,
    error,
    refetch,
    criticalAlerts: alerts.filter(alert => alert.severity === 'critical'),
    highAlerts: alerts.filter(alert => alert.severity === 'high'),
    mediumAlerts: alerts.filter(alert => alert.severity === 'medium'),
    lowAlerts: alerts.filter(alert => alert.severity === 'low'),
    newAlerts: alerts.filter(alert => alert.status === 'new'),
    acknowledgedAlerts: alerts.filter(alert => alert.status === 'acknowledged'),
    resolvedAlerts: alerts.filter(alert => alert.status === 'resolved'),
  };
};

/**
 * Hook to get security metrics
 */
export const useSentinelMetrics = () => {
  const { data: metrics = [], isLoading, error, refetch } = useQuery(getSecurityMetrics);
  
  // Helper function to find a metric by name
  const getMetricByName = (name: string): SecurityMetric | undefined => {
    return metrics.find(metric => metric.name === name);
  };
  
  // Calculate security score
  const securityScore = getMetricByName('security_score')?.value || 0;
  
  // Calculate risk level
  const calculateRiskLevel = (): RiskLevel => {
    if (securityScore >= 90) return 'green';
    if (securityScore >= 70) return 'yellow';
    return 'red';
  };
  
  return {
    metrics,
    isLoading,
    error,
    refetch,
    securityScore,
    riskLevel: calculateRiskLevel(),
    getMetricByName,
    postureMetrics: metrics.filter(metric => metric.category === 'posture'),
    threatMetrics: metrics.filter(metric => metric.category === 'threats'),
    complianceMetrics: metrics.filter(metric => metric.category === 'compliance'),
    responseMetrics: metrics.filter(metric => metric.category === 'response'),
  };
};

/**
 * Hook to get security recommendations
 */
export const useSentinelRecommendations = () => {
  const { data: recommendations = [], isLoading, error, refetch } = useQuery(getSecurityRecommendations);
  
  return {
    recommendations,
    isLoading,
    error,
    refetch,
    criticalRecommendations: recommendations.filter(rec => rec.priority === 'critical'),
    highRecommendations: recommendations.filter(rec => rec.priority === 'high'),
    mediumRecommendations: recommendations.filter(rec => rec.priority === 'medium'),
    lowRecommendations: recommendations.filter(rec => rec.priority === 'low'),
    openRecommendations: recommendations.filter(rec => rec.status === 'open'),
    inProgressRecommendations: recommendations.filter(rec => rec.status === 'in_progress'),
    implementedRecommendations: recommendations.filter(rec => rec.status === 'implemented'),
  };
};

/**
 * Hook to get security scans
 */
export const useSentinelScans = () => {
  const { data: scans = [], isLoading, error, refetch } = useQuery(getSecurityScans);
  
  // Get the latest scan
  const latestScan = scans.length > 0 ? scans[0] : null;
  
  // Get compliance checks from all scans
  const complianceChecks = scans.flatMap(scan => scan.complianceChecks || []);
  
  return {
    scans,
    isLoading,
    error,
    refetch,
    latestScan,
    complianceChecks,
    completedScans: scans.filter(scan => scan.status === 'completed'),
    runningScans: scans.filter(scan => scan.status === 'running'),
    failedScans: scans.filter(scan => scan.status === 'failed'),
  };
};

/**
 * Hook to run security scans
 */
export const useSentinelScanRunner = () => {
  const runSecurityScanFn = useAction(runSecurityScan);
  const { refetch: refetchScans } = useQuery(getSecurityScans);
  
  const runScan = async (scanType: ScanType) => {
    try {
      const result = await runSecurityScanFn({ type: scanType });
      // Refetch scans to get the latest data
      refetchScans();
      return result;
    } catch (error) {
      console.error('Error running security scan:', error);
      throw error;
    }
  };
  
  return {
    runScan,
    runFullScan: () => runScan('full'),
    runVulnerabilityScan: () => runScan('vulnerability'),
    runComplianceScan: () => runScan('compliance'),
    runConfigurationScan: () => runScan('configuration'),
    runThreatScan: () => runScan('threat'),
  };
};

/**
 * Hook to acknowledge security alerts
 */
export const useSentinelAlertActions = () => {
  const acknowledgeAlertFn = useAction(acknowledgeAlert);
  const { refetch: refetchAlerts } = useQuery(getSecurityAlerts);
  
  const acknowledgeAlertById = async (alertId: string) => {
    try {
      const result = await acknowledgeAlertFn({ alertId });
      // Refetch alerts to get the latest data
      refetchAlerts();
      return result;
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      throw error;
    }
  };
  
  return {
    acknowledgeAlert: acknowledgeAlertById,
  };
};

/**
 * Hook to get a comprehensive security dashboard
 */
export const useSentinelDashboard = () => {
  const { 
    alerts, 
    isLoading: isLoadingAlerts, 
    error: alertsError,
    criticalAlerts,
    newAlerts
  } = useSentinelAlerts();
  
  const { 
    metrics, 
    isLoading: isLoadingMetrics, 
    error: metricsError,
    securityScore,
    riskLevel
  } = useSentinelMetrics();
  
  const { 
    recommendations, 
    isLoading: isLoadingRecommendations, 
    error: recommendationsError,
    criticalRecommendations,
    openRecommendations
  } = useSentinelRecommendations();
  
  const { 
    scans, 
    isLoading: isLoadingScans, 
    error: scansError,
    latestScan,
    complianceChecks
  } = useSentinelScans();
  
  const { runScan } = useSentinelScanRunner();
  const { acknowledgeAlert } = useSentinelAlertActions();
  
  // Calculate overall loading and error states
  const isLoading = isLoadingAlerts || isLoadingMetrics || isLoadingRecommendations || isLoadingScans;
  const error = alertsError || metricsError || recommendationsError || scansError;
  
  // Get last scan time
  const lastScanTime = latestScan ? new Date(latestScan.startedAt).toLocaleString() : 'Never';
  
  return {
    // Data
    alerts,
    metrics,
    recommendations,
    scans,
    complianceChecks,
    
    // Status
    isLoading,
    error,
    
    // Key metrics
    securityScore,
    riskLevel,
    criticalAlerts,
    newAlerts,
    criticalRecommendations,
    openRecommendations,
    lastScanTime,
    latestScan,
    
    // Actions
    runScan,
    acknowledgeAlert,
  };
};
