/**
 * Sentinel Module API Operations
 * 
 * This file exports all API operations for the Sentinel module.
 */

// Security Alert Operations
export {
  getSecurityAlerts,
  createSecurityAlert,
  updateSecurityAlert,
  deleteSecurityAlert,
} from './securityAlertOperations';

// Security Metric Operations
export {
  getSecurityMetrics,
  createSecurityMetric,
  updateSecurityMetric,
  deleteSecurityMetric,
} from './securityMetricOperations';

// Security Recommendation Operations
export {
  getSecurityRecommendations,
  createSecurityRecommendation,
  updateSecurityRecommendation,
  deleteSecurityRecommendation,
} from './securityRecommendationOperations';

// Security Scan Operations
export {
  getSecurityScans,
  createSecurityScan,
  updateSecurityScan,
  deleteSecurityScan,
} from './securityScanOperations';

// Compliance Check Operations
export {
  getComplianceChecks,
  createComplianceCheck,
  updateComplianceCheck,
  deleteComplianceCheck,
} from './complianceCheckOperations';

// Security Stack Operations
export {
  // Log Integrity Operations
  runLogIntegrityCheck,
  getLogIntegrityChecks,
  
  // Credential Scan Operations
  runCredentialScan,
  getCredentialScans,
  
  // Anomalous Usage Operations
  reportAnomalousUsage,
  getAnomalousUsage,
  updateAnomalousUsageStatus,
  
  // Security Escalation Operations
  createSecurityEscalation,
  getSecurityEscalations,
  updateSecurityEscalation,
  
  // MFA Policy Operations
  createMfaPolicy,
  getMfaPolicies,
  updateMfaPolicy,
  
  // MFA Enrollment Operations
  enrollMfa,
  verifyMfaEnrollment,
  getMfaEnrollments,
  deleteMfaEnrollment,
  
  // Alert Threshold Operations
  createAlertThreshold,
  getAlertThresholds,
  updateAlertThreshold,
  deleteAlertThreshold,
} from './securityStackOperations';

// Dashboard Operations
export {
  getSecurityDashboardStats,
} from './dashboardOperations';
