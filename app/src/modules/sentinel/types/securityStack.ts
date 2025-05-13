/**
 * Sentinel Security Stack Types
 * 
 * This file contains type definitions for the Sentinel Security Stack components:
 * - Log Integrity Monitoring
 * - Credential Scanning
 * - Anomalous Usage Detection
 * - Security Escalations
 * - Multi-Factor Authentication
 */

// Log Integrity Check Types
export type LogCheckType = 'hash_verification' | 'sequence_check' | 'tamper_detection' | 'consistency_check';
export type LogCheckStatus = 'passed' | 'failed' | 'warning' | 'error';
export type LogSource = 'system_logs' | 'agent_logs' | 'api_interactions' | 'security_alerts';

export interface LogIntegrityCheck {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  checkType: LogCheckType;
  status: LogCheckStatus;
  details?: string;
  logSource: LogSource;
  startTimestamp: Date;
  endTimestamp: Date;
  recordsChecked: number;
  issuesFound: number;
  metadata?: any;
}

// Credential Scan Types
export type CredentialScanType = 'password_strength' | 'key_rotation' | 'exposed_credentials' | 'privilege_audit';
export type CredentialScanStatus = 'completed' | 'failed' | 'in_progress';

export interface CredentialScan {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  scanType: CredentialScanType;
  status: CredentialScanStatus;
  findings: number;
  criticalFindings: number;
  startedAt: Date;
  completedAt?: Date;
  targetSystems: string[];
  summary?: string;
  metadata?: any;
}

// Anomalous Usage Types
export type AnomalyType = 'login_attempt' | 'api_usage' | 'data_access' | 'resource_usage' | 'permission_change';
export type AnomalyStatus = 'new' | 'investigating' | 'resolved' | 'false_positive';
export type AnomalySource = 'system' | 'ai' | 'manual' | 'integration';

export interface AnomalousUsage {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  detectedAt: Date;
  type: AnomalyType;
  severity: AlertSeverity;
  status: AnomalyStatus;
  source: AnomalySource;
  description: string;
  affectedResource?: string;
  normalPattern?: string;
  anomalyDetails?: any;
  resolvedAt?: Date;
  metadata?: any;
}

// Security Escalation Types
export type EscalationStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type EscalationCategory = 'intrusion' | 'data_breach' | 'malware' | 'insider_threat' | 'policy_violation';

export interface SecurityEscalation {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: EscalationStatus;
  category: EscalationCategory;
  sourceAlert?: string;
  assignedTo?: string;
  escalatedBy: string;
  escalatedAt: Date;
  resolvedAt?: Date;
  resolutionSummary?: string;
  affectedSystems: string[];
  metadata?: any;
}

// MFA Policy Types
export type MfaMethod = 'app' | 'sms' | 'email' | 'hardware_token' | 'biometric';
export type ChallengeFrequency = 'login' | 'daily' | 'weekly' | 'sensitive_action';

export interface MfaPolicy {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;
  name: string;
  description?: string;
  isEnabled: boolean;
  requiredMethods: number;
  allowedMethods: MfaMethod[];
  applyToRoles: string[];
  exemptRoles: string[];
  exemptUsers: string[];
  graceLoginCount: number;
  rememberDeviceDays: number;
  challengeFrequency: ChallengeFrequency;
  metadata?: any;
}

export interface MfaEnrollment {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  method: MfaMethod;
  isVerified: boolean;
  verifiedAt?: Date;
  lastUsedAt?: Date;
  identifier?: string;
  metadata?: any;
}

// Alert Threshold Types
export type ThresholdOperator = 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
export type NotificationChannel = 'email' | 'slack' | 'webhook' | 'in_app';

export interface AlertThreshold {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  description?: string;
  metricName: string;
  operator: ThresholdOperator;
  threshold: number;
  severity: AlertSeverity;
  enabled: boolean;
  cooldownMinutes: number;
  notificationChannels: NotificationChannel[];
  metadata?: any;
}

// Re-export existing types from index.ts
export * from './index';
