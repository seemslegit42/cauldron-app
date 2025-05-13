/**
 * Phantom Module Permission Utilities
 *
 * This file contains constants and helper functions for Phantom module permissions.
 */

import { useAuth } from 'wasp/client/auth';
import { usePermission } from '@src/shared/components/auth/PermissionGuard';
import type { Resource, ResourceAction } from '@src/api/middleware/rbac';

// Resource constants
export const PHANTOM_RESOURCE: Resource = 'phantom';
export const SECURITY_SCANS_RESOURCE: Resource = 'security-scans';
export const THREAT_INTELLIGENCE_RESOURCE: Resource = 'threat-intelligence';
export const DOMAIN_CLONES_RESOURCE: Resource = 'domain-clones';

// Action constants
export const READ_ACTION: ResourceAction = 'read';
export const SCAN_ACTION: ResourceAction = 'scan';
export const MONITOR_ACTION: ResourceAction = 'monitor';
export const ANALYZE_ACTION: ResourceAction = 'analyze';
export const MANAGE_ACTION: ResourceAction = 'manage';

/**
 * Hook to check if user can view the Phantom dashboard
 */
export function useCanViewPhantomDashboard(): boolean {
  return usePermission(PHANTOM_RESOURCE, READ_ACTION);
}

/**
 * Hook to check if user can run security scans
 */
export function useCanRunSecurityScans(): boolean {
  return usePermission(PHANTOM_RESOURCE, SCAN_ACTION);
}

/**
 * Hook to check if user can monitor security threats
 */
export function useCanMonitorThreats(): boolean {
  return usePermission(PHANTOM_RESOURCE, MONITOR_ACTION);
}

/**
 * Hook to check if user can manage Phantom module
 */
export function useCanManagePhantom(): boolean {
  return usePermission(PHANTOM_RESOURCE, MANAGE_ACTION);
}

/**
 * Hook to check if user can view security scans
 */
export function useCanViewSecurityScans(): boolean {
  return usePermission(SECURITY_SCANS_RESOURCE, READ_ACTION);
}

/**
 * Hook to check if user can create security scans
 */
export function useCanCreateSecurityScans(): boolean {
  return usePermission(SECURITY_SCANS_RESOURCE, 'create');
}

/**
 * Hook to check if user can view threat intelligence
 */
export function useCanViewThreatIntelligence(): boolean {
  return usePermission(THREAT_INTELLIGENCE_RESOURCE, READ_ACTION);
}

/**
 * Hook to check if user can analyze threat intelligence
 */
export function useCanAnalyzeThreatIntelligence(): boolean {
  return usePermission(THREAT_INTELLIGENCE_RESOURCE, ANALYZE_ACTION);
}

/**
 * Hook to check if user can view domain clones
 */
export function useCanViewDomainClones(): boolean {
  return usePermission(DOMAIN_CLONES_RESOURCE, READ_ACTION);
}

/**
 * Hook to check if user can scan for domain clones
 */
export function useCanScanDomainClones(): boolean {
  return usePermission(DOMAIN_CLONES_RESOURCE, SCAN_ACTION);
}

/**
 * Hook to check if user can manage domain clones
 */
export function useCanManageDomainClones(): boolean {
  return usePermission(DOMAIN_CLONES_RESOURCE, MANAGE_ACTION);
}

/**
 * Get permission requirements for Phantom module features
 *
 * This is useful for displaying permission requirements in the UI
 */
export const PHANTOM_PERMISSION_REQUIREMENTS = {
  viewDashboard: {
    resource: PHANTOM_RESOURCE,
    action: READ_ACTION,
    description: 'View the Phantom security dashboard',
  },
  runScans: {
    resource: PHANTOM_RESOURCE,
    action: SCAN_ACTION,
    description: 'Run security scans',
  },
  monitorThreats: {
    resource: PHANTOM_RESOURCE,
    action: MONITOR_ACTION,
    description: 'Monitor security threats',
  },
  managePhantom: {
    resource: PHANTOM_RESOURCE,
    action: MANAGE_ACTION,
    description: 'Manage all Phantom aspects',
  },
  viewSecurityScans: {
    resource: SECURITY_SCANS_RESOURCE,
    action: READ_ACTION,
    description: 'View security scan results',
  },
  createSecurityScans: {
    resource: SECURITY_SCANS_RESOURCE,
    action: 'create',
    description: 'Create security scans',
  },
  viewThreatIntelligence: {
    resource: THREAT_INTELLIGENCE_RESOURCE,
    action: READ_ACTION,
    description: 'View threat intelligence',
  },
  analyzeThreatIntelligence: {
    resource: THREAT_INTELLIGENCE_RESOURCE,
    action: ANALYZE_ACTION,
    description: 'Analyze threat data',
  },
  viewDomainClones: {
    resource: DOMAIN_CLONES_RESOURCE,
    action: READ_ACTION,
    description: 'View domain clone information',
  },
  scanDomainClones: {
    resource: DOMAIN_CLONES_RESOURCE,
    action: SCAN_ACTION,
    description: 'Scan for domain clones',
  },
  manageDomainClones: {
    resource: DOMAIN_CLONES_RESOURCE,
    action: MANAGE_ACTION,
    description: 'Manage domain clone monitoring',
  },
};
