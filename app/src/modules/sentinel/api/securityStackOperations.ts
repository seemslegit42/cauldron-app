/**
 * Sentinel Security Stack API Operations
 *
 * This file contains API operations for the Sentinel Security Stack:
 * - Log Integrity Monitoring
 * - Credential Scanning
 * - Anomalous Usage Detection
 * - Security Escalations
 * - Multi-Factor Authentication
 */

import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import { z } from 'zod';
import { ensureArgsSchemaOrThrowHttpError } from '@src/server/validation';
import { LoggingService } from '@src/shared/services/logging';
import { sentientLoop } from '@src/shared/services/sentientLoopService';
import { requirePermission } from '@src/api/middleware/rbac';
import { applyFieldAccess, applyFieldAccessToArray } from '@src/api/middleware/fieldAccess';
import type {
  LogCheckType,
  LogCheckStatus,
  LogSource,
  CredentialScanType,
  CredentialScanStatus,
  AnomalyType,
  AnomalyStatus,
  AnomalySource,
  EscalationStatus,
  EscalationCategory,
  MfaMethod,
  ChallengeFrequency,
  ThresholdOperator,
  NotificationChannel
} from '../types/securityStack';

// Validation schemas
const logIntegrityCheckSchema = z.object({
  checkType: z.enum(['hash_verification', 'sequence_check', 'tamper_detection', 'consistency_check']),
  logSource: z.enum(['system_logs', 'agent_logs', 'api_interactions', 'security_alerts']),
  startTimestamp: z.string().or(z.date()),
  endTimestamp: z.string().or(z.date()),
  metadata: z.any().optional(),
});

const credentialScanSchema = z.object({
  scanType: z.enum(['password_strength', 'key_rotation', 'exposed_credentials', 'privilege_audit']),
  targetSystems: z.array(z.string()),
  metadata: z.any().optional(),
});

const anomalousUsageSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['login_attempt', 'api_usage', 'data_access', 'resource_usage', 'permission_change']),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  status: z.enum(['new', 'investigating', 'resolved', 'false_positive']),
  source: z.enum(['system', 'ai', 'manual', 'integration']),
  description: z.string().min(1, 'Description is required'),
  affectedResource: z.string().optional(),
  normalPattern: z.string().optional(),
  anomalyDetails: z.any().optional(),
  metadata: z.any().optional(),
});

const securityEscalationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  category: z.enum(['intrusion', 'data_breach', 'malware', 'insider_threat', 'policy_violation']),
  sourceAlert: z.string().optional(),
  assignedTo: z.string().optional(),
  affectedSystems: z.array(z.string()),
  metadata: z.any().optional(),
});

const mfaPolicySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  isEnabled: z.boolean().default(true),
  requiredMethods: z.number().int().min(1).default(1),
  allowedMethods: z.array(z.enum(['app', 'sms', 'email', 'hardware_token', 'biometric'])),
  applyToRoles: z.array(z.string()),
  exemptRoles: z.array(z.string()).optional(),
  exemptUsers: z.array(z.string()).optional(),
  graceLoginCount: z.number().int().min(0).default(0),
  rememberDeviceDays: z.number().int().min(0).default(30),
  challengeFrequency: z.enum(['login', 'daily', 'weekly', 'sensitive_action']).default('login'),
  metadata: z.any().optional(),
});

const mfaEnrollmentSchema = z.object({
  method: z.enum(['app', 'sms', 'email', 'hardware_token', 'biometric']),
  identifier: z.string().optional(),
  metadata: z.any().optional(),
});

const alertThresholdSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  metricName: z.string().min(1, 'Metric name is required'),
  operator: z.enum(['gt', 'lt', 'eq', 'gte', 'lte']),
  threshold: z.number(),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  enabled: z.boolean().default(true),
  cooldownMinutes: z.number().int().min(1).default(60),
  notificationChannels: z.array(z.enum(['email', 'slack', 'webhook', 'in_app'])),
  metadata: z.any().optional(),
});

// Log Integrity Operations

/**
 * Run a log integrity check
 */
export const runLogIntegrityCheck = async (args: any, context: any) => {
  // Validate arguments
  const validatedArgs = ensureArgsSchemaOrThrowHttpError(logIntegrityCheckSchema, args);

  // Apply RBAC middleware - require 'sentinel:log-integrity:check' permission
  const user = await requirePermission({
    resource: 'sentinel',
    action: 'log-integrity:check',
    adminOverride: true,
    auditRejection: true,
  })(context);

  try {
    // Log the operation
    LoggingService.info({
      message: `Running log integrity check: ${validatedArgs.checkType} on ${validatedArgs.logSource}`,
      userId: user.id,
      module: 'sentinel',
      category: 'SECURITY',
      metadata: {
        checkType: validatedArgs.checkType,
        logSource: validatedArgs.logSource,
        startTimestamp: validatedArgs.startTimestamp,
        endTimestamp: validatedArgs.endTimestamp,
      },
    });

    // Add to Sentient Loop context
    sentientLoop.addMemory({
      type: 'action',
      module: 'sentinel',
      content: `Running log integrity check on ${validatedArgs.logSource}`,
      metadata: {
        action: 'log_integrity_check',
        checkType: validatedArgs.checkType,
        logSource: validatedArgs.logSource,
        timestamp: new Date().toISOString(),
      },
    });

    // Perform the log integrity check
    const result = await performLogIntegrityCheck(
      user.id,
      validatedArgs.checkType as LogCheckType,
      validatedArgs.logSource as LogSource,
      new Date(validatedArgs.startTimestamp),
      new Date(validatedArgs.endTimestamp),
      validatedArgs.metadata
    );

    return result;
  } catch (error) {
    console.error('Error running log integrity check:', error);
    throw new HttpError(500, `Error running log integrity check: ${error.message}`);
  }
};

/**
 * Get log integrity checks
 */
export const getLogIntegrityChecks = async (args: any, context: any) => {
  // Apply RBAC middleware - require 'sentinel:log-integrity:read' permission
  const user = await requirePermission({
    resource: 'sentinel',
    action: 'log-integrity:read',
    adminOverride: true,
    auditRejection: true,
    fieldVisibility: { resource: 'sentinel', action: 'log-integrity:read' },
  })(context);

  try {
    // Get log integrity checks
    const checks = await prisma.logIntegrityCheck.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Apply field-level access control
    const filteredChecks = await applyFieldAccessToArray(checks, user, 'sentinel', 'log-integrity:read');

    return filteredChecks;
  } catch (error) {
    console.error('Error getting log integrity checks:', error);
    throw new HttpError(500, `Error getting log integrity checks: ${error.message}`);
  }
};

// Helper function to perform log integrity check
async function performLogIntegrityCheck(
  userId: string,
  checkType: LogCheckType,
  logSource: LogSource,
  startTimestamp: Date,
  endTimestamp: Date,
  metadata?: any
) {
  // In a real implementation, this would perform actual log integrity checks
  // For now, we'll create a mock check result
  const recordsChecked = Math.floor(Math.random() * 1000) + 100;
  const issuesFound = Math.floor(Math.random() * 5);
  const status: LogCheckStatus = issuesFound > 0 ? 'warning' : 'passed';

  // Create a log integrity check record
  const check = await prisma.logIntegrityCheck.create({
    data: {
      userId,
      checkType,
      status,
      details: issuesFound > 0 ? `Found ${issuesFound} potential issues` : 'No issues found',
      logSource,
      startTimestamp,
      endTimestamp,
      recordsChecked,
      issuesFound,
      metadata,
    },
  });

  return check;
}

// Credential Scan Operations

/**
 * Run a credential scan
 */
export const runCredentialScan = async (args: any, context: any) => {
  // Validate arguments
  const validatedArgs = ensureArgsSchemaOrThrowHttpError(credentialScanSchema, args);

  // Apply RBAC middleware - require 'sentinel:credential-scan:run' permission
  const user = await requirePermission({
    resource: 'sentinel',
    action: 'credential-scan:run',
    adminOverride: true,
    auditRejection: true,
  })(context);

  try {
    // Log the operation
    LoggingService.info({
      message: `Running credential scan: ${validatedArgs.scanType}`,
      userId: user.id,
      module: 'sentinel',
      category: 'SECURITY',
      metadata: {
        scanType: validatedArgs.scanType,
        targetSystems: validatedArgs.targetSystems,
      },
    });

    // Add to Sentient Loop context
    sentientLoop.addMemory({
      type: 'action',
      module: 'sentinel',
      content: `Running credential scan: ${validatedArgs.scanType}`,
      metadata: {
        action: 'credential_scan',
        scanType: validatedArgs.scanType,
        targetSystems: validatedArgs.targetSystems,
        timestamp: new Date().toISOString(),
      },
    });

    // Perform the credential scan
    const result = await performCredentialScan(
      user.id,
      validatedArgs.scanType as CredentialScanType,
      validatedArgs.targetSystems,
      validatedArgs.metadata
    );

    return result;
  } catch (error) {
    console.error('Error running credential scan:', error);
    throw new HttpError(500, `Error running credential scan: ${error.message}`);
  }
};

/**
 * Get credential scans
 */
export const getCredentialScans = async (args: any, context: any) => {
  // Apply RBAC middleware - require 'sentinel:credential-scan:read' permission
  const user = await requirePermission({
    resource: 'sentinel',
    action: 'credential-scan:read',
    adminOverride: true,
    auditRejection: true,
    fieldVisibility: { resource: 'sentinel', action: 'credential-scan:read' },
  })(context);

  try {
    // Get credential scans
    const scans = await prisma.credentialScan.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Apply field-level access control
    const filteredScans = await applyFieldAccessToArray(scans, user, 'sentinel', 'credential-scan:read');

    return filteredScans;
  } catch (error) {
    console.error('Error getting credential scans:', error);
    throw new HttpError(500, `Error getting credential scans: ${error.message}`);
  }
};

// Helper function to perform credential scan
async function performCredentialScan(
  userId: string,
  scanType: CredentialScanType,
  targetSystems: string[],
  metadata?: any
) {
  // In a real implementation, this would perform actual credential scans
  // For now, we'll create a mock scan result
  const findings = Math.floor(Math.random() * 10);
  const criticalFindings = Math.floor(findings * 0.3);
  const status: CredentialScanStatus = 'completed';

  // Create a credential scan record
  const scan = await prisma.credentialScan.create({
    data: {
      userId,
      scanType,
      status,
      findings,
      criticalFindings,
      targetSystems,
      summary: `Found ${findings} issues (${criticalFindings} critical)`,
      completedAt: new Date(),
      metadata,
    },
  });

  return scan;
}

// Anomalous Usage Operations

/**
 * Report anomalous usage
 */
export const reportAnomalousUsage = async (args: any, context: any) => {
  // Validate arguments
  const validatedArgs = ensureArgsSchemaOrThrowHttpError(anomalousUsageSchema, args);

  // Apply RBAC middleware - require 'sentinel:anomalous-usage:report' permission
  const user = await requirePermission({
    resource: 'sentinel',
    action: 'anomalous-usage:report',
    adminOverride: true,
    auditRejection: true,
  })(context);

  try {
    // Log the operation
    LoggingService.info({
      message: `Reporting anomalous usage: ${validatedArgs.type}`,
      userId: user.id,
      module: 'sentinel',
      category: 'SECURITY',
      metadata: {
        type: validatedArgs.type,
        severity: validatedArgs.severity,
        description: validatedArgs.description,
      },
    });

    // Add to Sentient Loop context
    sentientLoop.addMemory({
      type: 'action',
      module: 'sentinel',
      content: `Reporting anomalous usage: ${validatedArgs.type}`,
      metadata: {
        action: 'report_anomalous_usage',
        type: validatedArgs.type,
        severity: validatedArgs.severity,
        timestamp: new Date().toISOString(),
      },
    });

    // Create anomalous usage record
    const anomaly = await prisma.anomalousUsage.create({
      data: {
        userId: user.id,
        type: validatedArgs.type,
        severity: validatedArgs.severity,
        status: validatedArgs.status,
        source: validatedArgs.source,
        description: validatedArgs.description,
        affectedResource: validatedArgs.affectedResource,
        normalPattern: validatedArgs.normalPattern,
        anomalyDetails: validatedArgs.anomalyDetails,
        metadata: validatedArgs.metadata,
      },
    });

    return anomaly;
  } catch (error) {
    console.error('Error reporting anomalous usage:', error);
    throw new HttpError(500, `Error reporting anomalous usage: ${error.message}`);
  }
};

/**
 * Get anomalous usage reports
 */
export const getAnomalousUsage = async (args: any, context: any) => {
  // Apply RBAC middleware - require 'sentinel:anomalous-usage:read' permission
  const user = await requirePermission({
    resource: 'sentinel',
    action: 'anomalous-usage:read',
    adminOverride: true,
    auditRejection: true,
    fieldVisibility: { resource: 'sentinel', action: 'anomalous-usage:read' },
  })(context);

  try {
    // Get anomalous usage reports
    const anomalies = await prisma.anomalousUsage.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Apply field-level access control
    const filteredAnomalies = await applyFieldAccessToArray(anomalies, user, 'sentinel', 'anomalous-usage:read');

    return filteredAnomalies;
  } catch (error) {
    console.error('Error getting anomalous usage reports:', error);
    throw new HttpError(500, `Error getting anomalous usage reports: ${error.message}`);
  }
};

/**
 * Update anomalous usage status
 */
export const updateAnomalousUsageStatus = async (args: any, context: any) => {
  // Validate arguments
  const validatedArgs = z.object({
    id: z.string(),
    status: z.enum(['new', 'investigating', 'resolved', 'false_positive']),
    resolution: z.string().optional(),
  }).parse(args);

  // Apply RBAC middleware - require 'sentinel:anomalous-usage:update' permission
  const user = await requirePermission({
    resource: 'sentinel',
    action: 'anomalous-usage:update',
    adminOverride: true,
    auditRejection: true,
  })(context);

  try {
    // Get the anomalous usage report
    const anomaly = await prisma.anomalousUsage.findUnique({
      where: {
        id: validatedArgs.id,
      },
    });

    if (!anomaly) {
      throw new HttpError(404, 'Anomalous usage report not found');
    }

    // Check if the user has permission to update this report
    if (anomaly.userId !== user.id && !user.isAdmin) {
      throw new HttpError(403, 'You do not have permission to update this anomalous usage report');
    }

    // Update the anomalous usage report
    const updatedAnomaly = await prisma.anomalousUsage.update({
      where: {
        id: validatedArgs.id,
      },
      data: {
        status: validatedArgs.status,
        resolvedAt: ['resolved', 'false_positive'].includes(validatedArgs.status) ? new Date() : null,
        metadata: {
          ...anomaly.metadata,
          resolution: validatedArgs.resolution,
          resolvedBy: user.id,
          resolvedAt: ['resolved', 'false_positive'].includes(validatedArgs.status) ? new Date().toISOString() : null,
        },
      },
    });

    return updatedAnomaly;
  } catch (error) {
    console.error('Error updating anomalous usage status:', error);
    throw new HttpError(500, `Error updating anomalous usage status: ${error.message}`);
  }
};

// Security Escalation Operations

/**
 * Create security escalation
 */
export const createSecurityEscalation = async (args: any, context: any) => {
  // Validate arguments
  const validatedArgs = ensureArgsSchemaOrThrowHttpError(securityEscalationSchema, args);

  // Apply RBAC middleware - require 'sentinel:escalation:create' permission
  const user = await requirePermission({
    resource: 'sentinel',
    action: 'escalation:create',
    adminOverride: true,
    auditRejection: true,
  })(context);

  try {
    // Log the operation
    LoggingService.info({
      message: `Creating security escalation: ${validatedArgs.title}`,
      userId: user.id,
      module: 'sentinel',
      category: 'SECURITY',
      metadata: {
        title: validatedArgs.title,
        severity: validatedArgs.severity,
        category: validatedArgs.category,
      },
    });

    // Add to Sentient Loop context
    sentientLoop.addMemory({
      type: 'action',
      module: 'sentinel',
      content: `Creating security escalation: ${validatedArgs.title}`,
      metadata: {
        action: 'create_security_escalation',
        title: validatedArgs.title,
        severity: validatedArgs.severity,
        category: validatedArgs.category,
        timestamp: new Date().toISOString(),
      },
    });

    // Create security escalation record
    const escalation = await prisma.securityEscalation.create({
      data: {
        userId: user.id,
        title: validatedArgs.title,
        description: validatedArgs.description,
        severity: validatedArgs.severity,
        category: validatedArgs.category,
        sourceAlert: validatedArgs.sourceAlert,
        assignedTo: validatedArgs.assignedTo,
        escalatedBy: user.id,
        affectedSystems: validatedArgs.affectedSystems,
        metadata: validatedArgs.metadata,
      },
    });

    return escalation;
  } catch (error) {
    console.error('Error creating security escalation:', error);
    throw new HttpError(500, `Error creating security escalation: ${error.message}`);
  }
};

/**
 * Get security escalations
 */
export const getSecurityEscalations = async (args: any, context: any) => {
  // Apply RBAC middleware - require 'sentinel:escalation:read' permission
  const user = await requirePermission({
    resource: 'sentinel',
    action: 'escalation:read',
    adminOverride: true,
    auditRejection: true,
    fieldVisibility: { resource: 'sentinel', action: 'escalation:read' },
  })(context);

  try {
    // Get security escalations
    const escalations = await prisma.securityEscalation.findMany({
      where: {
        OR: [
          { userId: user.id },
          { assignedTo: user.id },
          { escalatedBy: user.id },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Apply field-level access control
    const filteredEscalations = await applyFieldAccessToArray(escalations, user, 'sentinel', 'escalation:read');

    return filteredEscalations;
  } catch (error) {
    console.error('Error getting security escalations:', error);
    throw new HttpError(500, `Error getting security escalations: ${error.message}`);
  }
};

/**
 * Update security escalation
 */
export const updateSecurityEscalation = async (args: any, context: any) => {
  // Validate arguments
  const validatedArgs = z.object({
    id: z.string(),
    status: z.enum(['open', 'in_progress', 'resolved', 'closed']),
    assignedTo: z.string().optional(),
    resolutionSummary: z.string().optional(),
  }).parse(args);

  // Apply RBAC middleware - require 'sentinel:escalation:update' permission
  const user = await requirePermission({
    resource: 'sentinel',
    action: 'escalation:update',
    adminOverride: true,
    auditRejection: true,
  })(context);

  try {
    // Get the security escalation
    const escalation = await prisma.securityEscalation.findUnique({
      where: {
        id: validatedArgs.id,
      },
    });

    if (!escalation) {
      throw new HttpError(404, 'Security escalation not found');
    }

    // Check if the user has permission to update this escalation
    if (escalation.userId !== user.id && escalation.assignedTo !== user.id && !user.isAdmin) {
      throw new HttpError(403, 'You do not have permission to update this security escalation');
    }

    // Update the security escalation
    const updatedEscalation = await prisma.securityEscalation.update({
      where: {
        id: validatedArgs.id,
      },
      data: {
        status: validatedArgs.status,
        assignedTo: validatedArgs.assignedTo,
        resolutionSummary: validatedArgs.resolutionSummary,
        resolvedAt: ['resolved', 'closed'].includes(validatedArgs.status) ? new Date() : null,
        metadata: {
          ...escalation.metadata,
          lastUpdatedBy: user.id,
          lastUpdatedAt: new Date().toISOString(),
        },
      },
    });

    return updatedEscalation;
  } catch (error) {
    console.error('Error updating security escalation:', error);
    throw new HttpError(500, `Error updating security escalation: ${error.message}`);
  }
};

// MFA Policy Operations

/**
 * Create MFA policy
 */
export const createMfaPolicy = async (args: any, context: any) => {
  // Validate arguments
  const validatedArgs = ensureArgsSchemaOrThrowHttpError(mfaPolicySchema, args);

  // Apply RBAC middleware - require 'sentinel:mfa:create-policy' permission
  const user = await requirePermission({
    resource: 'sentinel',
    action: 'mfa:create-policy',
    adminOverride: true,
    auditRejection: true,
  })(context);

  try {
    // Check if user has an organization
    if (!user.organizationId) {
      throw new HttpError(400, 'User must be part of an organization to create MFA policies');
    }

    // Log the operation
    LoggingService.info({
      message: `Creating MFA policy: ${validatedArgs.name}`,
      userId: user.id,
      organizationId: user.organizationId,
      module: 'sentinel',
      category: 'SECURITY',
      metadata: {
        name: validatedArgs.name,
        requiredMethods: validatedArgs.requiredMethods,
        allowedMethods: validatedArgs.allowedMethods,
      },
    });

    // Create MFA policy record
    const policy = await prisma.mfaPolicy.create({
      data: {
        organizationId: user.organizationId,
        name: validatedArgs.name,
        description: validatedArgs.description,
        isEnabled: validatedArgs.isEnabled,
        requiredMethods: validatedArgs.requiredMethods,
        allowedMethods: validatedArgs.allowedMethods,
        applyToRoles: validatedArgs.applyToRoles,
        exemptRoles: validatedArgs.exemptRoles || [],
        exemptUsers: validatedArgs.exemptUsers || [],
        graceLoginCount: validatedArgs.graceLoginCount,
        rememberDeviceDays: validatedArgs.rememberDeviceDays,
        challengeFrequency: validatedArgs.challengeFrequency,
        metadata: {
          ...validatedArgs.metadata,
          createdBy: user.id,
          createdAt: new Date().toISOString(),
        },
      },
    });

    return policy;
  } catch (error) {
    console.error('Error creating MFA policy:', error);
    throw new HttpError(500, `Error creating MFA policy: ${error.message}`);
  }
};

/**
 * Get MFA policies
 */
export const getMfaPolicies = async (args: any, context: any) => {
  // Apply RBAC middleware - require 'sentinel:mfa:read-policy' permission
  const user = await requirePermission({
    resource: 'sentinel',
    action: 'mfa:read-policy',
    adminOverride: true,
    auditRejection: true,
    fieldVisibility: { resource: 'sentinel', action: 'mfa:read-policy' },
  })(context);

  try {
    // Check if user has an organization
    if (!user.organizationId) {
      return [];
    }

    // Get MFA policies
    const policies = await prisma.mfaPolicy.findMany({
      where: {
        organizationId: user.organizationId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Apply field-level access control
    const filteredPolicies = await applyFieldAccessToArray(policies, user, 'sentinel', 'mfa:read-policy');

    return filteredPolicies;
  } catch (error) {
    console.error('Error getting MFA policies:', error);
    throw new HttpError(500, `Error getting MFA policies: ${error.message}`);
  }
};

/**
 * Update MFA policy
 */
export const updateMfaPolicy = async (args: any, context: any) => {
  // Validate arguments
  const validatedArgs = z.object({
    id: z.string(),
    name: z.string().optional(),
    description: z.string().optional(),
    isEnabled: z.boolean().optional(),
    requiredMethods: z.number().int().min(1).optional(),
    allowedMethods: z.array(z.enum(['app', 'sms', 'email', 'hardware_token', 'biometric'])).optional(),
    applyToRoles: z.array(z.string()).optional(),
    exemptRoles: z.array(z.string()).optional(),
    exemptUsers: z.array(z.string()).optional(),
    graceLoginCount: z.number().int().min(0).optional(),
    rememberDeviceDays: z.number().int().min(0).optional(),
    challengeFrequency: z.enum(['login', 'daily', 'weekly', 'sensitive_action']).optional(),
  }).parse(args);

  // Apply RBAC middleware - require 'sentinel:mfa:update-policy' permission
  const user = await requirePermission({
    resource: 'sentinel',
    action: 'mfa:update-policy',
    adminOverride: true,
    auditRejection: true,
  })(context);

  try {
    // Get the MFA policy
    const policy = await prisma.mfaPolicy.findUnique({
      where: {
        id: validatedArgs.id,
      },
    });

    if (!policy) {
      throw new HttpError(404, 'MFA policy not found');
    }

    // Check if the user has permission to update this policy
    if (policy.organizationId !== user.organizationId && !user.isAdmin) {
      throw new HttpError(403, 'You do not have permission to update this MFA policy');
    }

    // Update the MFA policy
    const updatedPolicy = await prisma.mfaPolicy.update({
      where: {
        id: validatedArgs.id,
      },
      data: {
        name: validatedArgs.name,
        description: validatedArgs.description,
        isEnabled: validatedArgs.isEnabled,
        requiredMethods: validatedArgs.requiredMethods,
        allowedMethods: validatedArgs.allowedMethods,
        applyToRoles: validatedArgs.applyToRoles,
        exemptRoles: validatedArgs.exemptRoles,
        exemptUsers: validatedArgs.exemptUsers,
        graceLoginCount: validatedArgs.graceLoginCount,
        rememberDeviceDays: validatedArgs.rememberDeviceDays,
        challengeFrequency: validatedArgs.challengeFrequency,
        metadata: {
          ...policy.metadata,
          lastUpdatedBy: user.id,
          lastUpdatedAt: new Date().toISOString(),
        },
      },
    });

    return updatedPolicy;
  } catch (error) {
    console.error('Error updating MFA policy:', error);
    throw new HttpError(500, `Error updating MFA policy: ${error.message}`);
  }
};

/**
 * MFA Enrollment Operations
 */

/**
 * Enroll in MFA
 */
export const enrollMfa = async (args: any, context: any) => {
  // Validate arguments
  const validatedArgs = ensureArgsSchemaOrThrowHttpError(mfaEnrollmentSchema, args);

  // Apply RBAC middleware - require 'sentinel:mfa:enroll' permission
  const user = await requirePermission({
    resource: 'sentinel',
    action: 'mfa:enroll',
    adminOverride: true,
    auditRejection: true,
  })(context);

  try {
    // Log the operation
    LoggingService.info({
      message: `Enrolling in MFA: ${validatedArgs.method}`,
      userId: user.id,
      module: 'sentinel',
      category: 'SECURITY',
      metadata: {
        method: validatedArgs.method,
        identifier: validatedArgs.identifier,
      },
    });

    // Check if the user already has an enrollment for this method
    const existingEnrollment = await prisma.mfaEnrollment.findFirst({
      where: {
        userId: user.id,
        method: validatedArgs.method,
      },
    });

    if (existingEnrollment) {
      throw new HttpError(400, `User already has an enrollment for ${validatedArgs.method}`);
    }

    // Create MFA enrollment record
    const enrollment = await prisma.mfaEnrollment.create({
      data: {
        userId: user.id,
        method: validatedArgs.method,
        identifier: validatedArgs.identifier,
        metadata: validatedArgs.metadata,
      },
    });

    return enrollment;
  } catch (error) {
    console.error('Error enrolling in MFA:', error);
    throw new HttpError(500, `Error enrolling in MFA: ${error.message}`);
  }
};

/**
 * Verify MFA enrollment
 */
export const verifyMfaEnrollment = async (args: any, context: any) => {
  // Validate arguments
  const validatedArgs = z.object({
    enrollmentId: z.string(),
    verificationCode: z.string(),
  }).parse(args);

  // Apply RBAC middleware - require 'sentinel:mfa:verify' permission
  const user = await requirePermission({
    resource: 'sentinel',
    action: 'mfa:verify',
    adminOverride: true,
    auditRejection: true,
  })(context);

  try {
    // Get the MFA enrollment
    const enrollment = await prisma.mfaEnrollment.findUnique({
      where: {
        id: validatedArgs.enrollmentId,
      },
    });

    if (!enrollment) {
      throw new HttpError(404, 'MFA enrollment not found');
    }

    // Check if the user has permission to verify this enrollment
    if (enrollment.userId !== user.id && !user.isAdmin) {
      throw new HttpError(403, 'You do not have permission to verify this MFA enrollment');
    }

    // In a real implementation, this would verify the verification code
    // For now, we'll just mark the enrollment as verified
    const verificationSuccessful = true;

    if (!verificationSuccessful) {
      throw new HttpError(400, 'Invalid verification code');
    }

    // Update the MFA enrollment
    const updatedEnrollment = await prisma.mfaEnrollment.update({
      where: {
        id: validatedArgs.enrollmentId,
      },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
        metadata: {
          ...enrollment.metadata,
          verifiedBy: user.id,
          verifiedAt: new Date().toISOString(),
        },
      },
    });

    return updatedEnrollment;
  } catch (error) {
    console.error('Error verifying MFA enrollment:', error);
    throw new HttpError(500, `Error verifying MFA enrollment: ${error.message}`);
  }
};

/**
 * Get MFA enrollments
 */
export const getMfaEnrollments = async (args: any, context: any) => {
  // Apply RBAC middleware - require 'sentinel:mfa:read-enrollment' permission
  const user = await requirePermission({
    resource: 'sentinel',
    action: 'mfa:read-enrollment',
    adminOverride: true,
    auditRejection: true,
    fieldVisibility: { resource: 'sentinel', action: 'mfa:read-enrollment' },
  })(context);

  try {
    // Get MFA enrollments
    const enrollments = await prisma.mfaEnrollment.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Apply field-level access control
    const filteredEnrollments = await applyFieldAccessToArray(enrollments, user, 'sentinel', 'mfa:read-enrollment');

    return filteredEnrollments;
  } catch (error) {
    console.error('Error getting MFA enrollments:', error);
    throw new HttpError(500, `Error getting MFA enrollments: ${error.message}`);
  }
};

/**
 * Delete MFA enrollment
 */
export const deleteMfaEnrollment = async (args: any, context: any) => {
  // Validate arguments
  const validatedArgs = z.object({
    enrollmentId: z.string(),
  }).parse(args);

  // Apply RBAC middleware - require 'sentinel:mfa:delete-enrollment' permission
  const user = await requirePermission({
    resource: 'sentinel',
    action: 'mfa:delete-enrollment',
    adminOverride: true,
    auditRejection: true,
  })(context);

  try {
    // Get the MFA enrollment
    const enrollment = await prisma.mfaEnrollment.findUnique({
      where: {
        id: validatedArgs.enrollmentId,
      },
    });

    if (!enrollment) {
      throw new HttpError(404, 'MFA enrollment not found');
    }

    // Check if the user has permission to delete this enrollment
    if (enrollment.userId !== user.id && !user.isAdmin) {
      throw new HttpError(403, 'You do not have permission to delete this MFA enrollment');
    }

    // Delete the MFA enrollment
    await prisma.mfaEnrollment.delete({
      where: {
        id: validatedArgs.enrollmentId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting MFA enrollment:', error);
    throw new HttpError(500, `Error deleting MFA enrollment: ${error.message}`);
  }
};

/**
 * Alert Threshold Operations
 */

/**
 * Create alert threshold
 */
export const createAlertThreshold = async (args: any, context: any) => {
  // Validate arguments
  const validatedArgs = ensureArgsSchemaOrThrowHttpError(alertThresholdSchema, args);

  // Apply RBAC middleware - require 'sentinel:alert-threshold:create' permission
  const user = await requirePermission({
    resource: 'sentinel',
    action: 'alert-threshold:create',
    adminOverride: true,
    auditRejection: true,
  })(context);

  try {
    // Log the operation
    LoggingService.info({
      message: `Creating alert threshold: ${validatedArgs.name}`,
      userId: user.id,
      module: 'sentinel',
      category: 'SECURITY',
      metadata: {
        name: validatedArgs.name,
        metricName: validatedArgs.metricName,
        threshold: validatedArgs.threshold,
      },
    });

    // Create alert threshold record
    const threshold = await prisma.alertThreshold.create({
      data: {
        name: validatedArgs.name,
        description: validatedArgs.description,
        metricName: validatedArgs.metricName,
        operator: validatedArgs.operator,
        threshold: validatedArgs.threshold,
        severity: validatedArgs.severity,
        enabled: validatedArgs.enabled,
        cooldownMinutes: validatedArgs.cooldownMinutes,
        notificationChannels: validatedArgs.notificationChannels,
        metadata: {
          ...validatedArgs.metadata,
          createdBy: user.id,
          createdAt: new Date().toISOString(),
        },
      },
    });

    return threshold;
  } catch (error) {
    console.error('Error creating alert threshold:', error);
    throw new HttpError(500, `Error creating alert threshold: ${error.message}`);
  }
};

/**
 * Get alert thresholds
 */
export const getAlertThresholds = async (args: any, context: any) => {
  // Apply RBAC middleware - require 'sentinel:alert-threshold:read' permission
  const user = await requirePermission({
    resource: 'sentinel',
    action: 'alert-threshold:read',
    adminOverride: true,
    auditRejection: true,
    fieldVisibility: { resource: 'sentinel', action: 'alert-threshold:read' },
  })(context);

  try {
    // Get alert thresholds
    const thresholds = await prisma.alertThreshold.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Apply field-level access control
    const filteredThresholds = await applyFieldAccessToArray(thresholds, user, 'sentinel', 'alert-threshold:read');

    return filteredThresholds;
  } catch (error) {
    console.error('Error getting alert thresholds:', error);
    throw new HttpError(500, `Error getting alert thresholds: ${error.message}`);
  }
};

/**
 * Update alert threshold
 */
export const updateAlertThreshold = async (args: any, context: any) => {
  // Validate arguments
  const validatedArgs = z.object({
    id: z.string(),
    name: z.string().optional(),
    description: z.string().optional(),
    metricName: z.string().optional(),
    operator: z.enum(['gt', 'lt', 'eq', 'gte', 'lte']).optional(),
    threshold: z.number().optional(),
    severity: z.enum(['critical', 'high', 'medium', 'low']).optional(),
    enabled: z.boolean().optional(),
    cooldownMinutes: z.number().int().min(1).optional(),
    notificationChannels: z.array(z.enum(['email', 'slack', 'webhook', 'in_app'])).optional(),
  }).parse(args);

  // Apply RBAC middleware - require 'sentinel:alert-threshold:update' permission
  const user = await requirePermission({
    resource: 'sentinel',
    action: 'alert-threshold:update',
    adminOverride: true,
    auditRejection: true,
  })(context);

  try {
    // Get the alert threshold
    const threshold = await prisma.alertThreshold.findUnique({
      where: {
        id: validatedArgs.id,
      },
    });

    if (!threshold) {
      throw new HttpError(404, 'Alert threshold not found');
    }

    // Update the alert threshold
    const updatedThreshold = await prisma.alertThreshold.update({
      where: {
        id: validatedArgs.id,
      },
      data: {
        name: validatedArgs.name,
        description: validatedArgs.description,
        metricName: validatedArgs.metricName,
        operator: validatedArgs.operator,
        threshold: validatedArgs.threshold,
        severity: validatedArgs.severity,
        enabled: validatedArgs.enabled,
        cooldownMinutes: validatedArgs.cooldownMinutes,
        notificationChannels: validatedArgs.notificationChannels,
        metadata: {
          ...threshold.metadata,
          lastUpdatedBy: user.id,
          lastUpdatedAt: new Date().toISOString(),
        },
      },
    });

    return updatedThreshold;
  } catch (error) {
    console.error('Error updating alert threshold:', error);
    throw new HttpError(500, `Error updating alert threshold: ${error.message}`);
  }
};

/**
 * Delete alert threshold
 */
export const deleteAlertThreshold = async (args: any, context: any) => {
  // Validate arguments
  const validatedArgs = z.object({
    id: z.string(),
  }).parse(args);

  // Apply RBAC middleware - require 'sentinel:alert-threshold:delete' permission
  const user = await requirePermission({
    resource: 'sentinel',
    action: 'alert-threshold:delete',
    adminOverride: true,
    auditRejection: true,
  })(context);

  try {
    // Get the alert threshold
    const threshold = await prisma.alertThreshold.findUnique({
      where: {
        id: validatedArgs.id,
      },
    });

    if (!threshold) {
      throw new HttpError(404, 'Alert threshold not found');
    }

    // Delete the alert threshold
    await prisma.alertThreshold.delete({
      where: {
        id: validatedArgs.id,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting alert threshold:', error);
    throw new HttpError(500, `Error deleting alert threshold: ${error.message}`);
  }
};