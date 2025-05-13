/**
 * Sentinel Module Permission Utilities
 *
 * This file contains constants and helper functions for Sentinel module permissions.
 */

import { useAuth } from 'wasp/client/auth';
import { usePermission } from '@src/shared/components/auth/PermissionGuard';
import type { Resource, ResourceAction } from '@src/api/middleware/rbac';

// Resource constants
export const SENTINEL_RESOURCE: Resource = 'sentinel';
export const SECURITY_ALERTS_RESOURCE: Resource = 'security-alerts';
export const SECURITY_METRICS_RESOURCE: Resource = 'security-metrics';
export const SECURITY_RECOMMENDATIONS_RESOURCE: Resource = 'security-recommendations';
export const SECURITY_SCANS_RESOURCE: Resource = 'security-scans';
export const SECURITY_COMPLIANCE_RESOURCE: Resource = 'security-compliance';

// Action constants
export const READ_ACTION: ResourceAction = 'read';
export const SCAN_ACTION: ResourceAction = 'scan';
export const MONITOR_ACTION: ResourceAction = 'monitor';
export const ANALYZE_ACTION: ResourceAction = 'analyze';
export const MANAGE_ACTION: ResourceAction = 'manage';
export const ACKNOWLEDGE_ACTION: ResourceAction = 'acknowledge';
export const RESOLVE_ACTION: ResourceAction = 'resolve';
export const CONFIGURE_ACTION: ResourceAction = 'configure';

/**
 * Hook to check if user can view the Sentinel dashboard
 */
export function useCanViewSentinelDashboard(): boolean {
  return usePermission(SENTINEL_RESOURCE, READ_ACTION);
}

/**
 * Hook to check if user can run security scans
 */
export function useCanRunSecurityScans(): boolean {
  return usePermission(SECURITY_SCANS_RESOURCE, SCAN_ACTION);
}

/**
 * Hook to check if user can view security alerts
 */
export function useCanViewSecurityAlerts(): boolean {
  return usePermission(SECURITY_ALERTS_RESOURCE, READ_ACTION);
}

/**
 * Hook to check if user can acknowledge security alerts
 */
export function useCanAcknowledgeSecurityAlerts(): boolean {
  return usePermission(SECURITY_ALERTS_RESOURCE, ACKNOWLEDGE_ACTION);
}

/**
 * Hook to check if user can resolve security alerts
 */
export function useCanResolveSecurityAlerts(): boolean {
  return usePermission(SECURITY_ALERTS_RESOURCE, RESOLVE_ACTION);
}

/**
 * Hook to check if user can view security metrics
 */
export function useCanViewSecurityMetrics(): boolean {
  return usePermission(SECURITY_METRICS_RESOURCE, READ_ACTION);
}

/**
 * Hook to check if user can analyze security metrics
 */
export function useCanAnalyzeSecurityMetrics(): boolean {
  return usePermission(SECURITY_METRICS_RESOURCE, ANALYZE_ACTION);
}

/**
 * Hook to check if user can view security recommendations
 */
export function useCanViewSecurityRecommendations(): boolean {
  return usePermission(SECURITY_RECOMMENDATIONS_RESOURCE, READ_ACTION);
}

/**
 * Hook to check if user can configure Sentinel
 */
export function useCanConfigureSentinel(): boolean {
  return usePermission(SENTINEL_RESOURCE, CONFIGURE_ACTION);
}

/**
 * Hook to check if user can manage Sentinel
 */
export function useCanManageSentinel(): boolean {
  return usePermission(SENTINEL_RESOURCE, MANAGE_ACTION);
}

/**
 * Hook to check if user can view security compliance
 */
export function useCanViewSecurityCompliance(): boolean {
  return usePermission(SECURITY_COMPLIANCE_RESOURCE, READ_ACTION);
}

/**
 * Get permission requirements for Sentinel module features
 *
 * This is useful for displaying permission requirements in the UI
 */
export const SENTINEL_PERMISSION_REQUIREMENTS = {
  viewDashboard: {
    resource: SENTINEL_RESOURCE,
    action: READ_ACTION,
    description: 'View the Sentinel security dashboard',
  },
  runScans: {
    resource: SECURITY_SCANS_RESOURCE,
    action: SCAN_ACTION,
    description: 'Run security scans',
  },
  viewAlerts: {
    resource: SECURITY_ALERTS_RESOURCE,
    action: READ_ACTION,
    description: 'View security alerts',
  },
  acknowledgeAlerts: {
    resource: SECURITY_ALERTS_RESOURCE,
    action: ACKNOWLEDGE_ACTION,
    description: 'Acknowledge security alerts',
  },
  resolveAlerts: {
    resource: SECURITY_ALERTS_RESOURCE,
    action: RESOLVE_ACTION,
    description: 'Resolve security alerts',
  },
  viewMetrics: {
    resource: SECURITY_METRICS_RESOURCE,
    action: READ_ACTION,
    description: 'View security metrics',
  },
  analyzeMetrics: {
    resource: SECURITY_METRICS_RESOURCE,
    action: ANALYZE_ACTION,
    description: 'Analyze security metrics',
  },
  viewRecommendations: {
    resource: SECURITY_RECOMMENDATIONS_RESOURCE,
    action: READ_ACTION,
    description: 'View security recommendations',
  },
  configureSentinel: {
    resource: SENTINEL_RESOURCE,
    action: CONFIGURE_ACTION,
    description: 'Configure Sentinel settings',
  },
  manageSentinel: {
    resource: SENTINEL_RESOURCE,
    action: MANAGE_ACTION,
    description: 'Manage all Sentinel aspects',
  },
  viewCompliance: {
    resource: SECURITY_COMPLIANCE_RESOURCE,
    action: READ_ACTION,
    description: 'View security compliance information',
  },
};
