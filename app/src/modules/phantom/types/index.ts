/**
 * Phantom Module Types
 * 
 * This file contains type definitions for the Phantom cybersecurity module.
 */

// Security threat severity levels
export enum ThreatSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info',
}

// Security threat status
export enum ThreatStatus {
  ACTIVE = 'active',
  MITIGATED = 'mitigated',
  INVESTIGATING = 'investigating',
  RESOLVED = 'resolved',
  FALSE_POSITIVE = 'false_positive',
}

// Security threat types
export enum ThreatType {
  MALWARE = 'malware',
  PHISHING = 'phishing',
  DATA_BREACH = 'data_breach',
  DOMAIN_SPOOFING = 'domain_spoofing',
  BRAND_IMPERSONATION = 'brand_impersonation',
  VULNERABILITY = 'vulnerability',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  INSIDER_THREAT = 'insider_threat',
  RANSOMWARE = 'ransomware',
  DDOS = 'ddos',
}

// Security threat source
export enum ThreatSource {
  INTERNAL_SCAN = 'internal_scan',
  EXTERNAL_FEED = 'external_feed',
  USER_REPORT = 'user_report',
  OSINT = 'osint',
  HONEYPOT = 'honeypot',
  THREAT_INTELLIGENCE = 'threat_intelligence',
  AUTOMATED_DETECTION = 'automated_detection',
}

// Security threat interface
export interface SecurityThreat {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  description: string;
  severity: ThreatSeverity;
  status: ThreatStatus;
  type: ThreatType;
  source: ThreatSource;
  affectedAssets?: string[];
  indicators?: string[];
  mitigationSteps?: string[];
  assignedTo?: string;
  metadata?: Record<string, any>;
}

// Domain clone detection
export interface DomainClone {
  id: string;
  createdAt: Date;
  detectedAt: Date;
  originalDomain: string;
  cloneDomain: string;
  registrationDate?: Date;
  registrar?: string;
  ipAddress?: string;
  country?: string;
  similarity: number; // 0-1 score of how similar the clone is to the original
  status: 'active' | 'inactive' | 'monitoring' | 'blocked';
  threatLevel: ThreatSeverity;
  screenshot?: string; // URL to screenshot of the clone site
  contentMatch?: number; // Percentage of content that matches the original
  lastChecked: Date;
  metadata?: Record<string, any>;
}

// Vulnerability interface
export interface Vulnerability {
  id: string;
  createdAt: Date;
  discoveredAt: Date;
  cveId?: string; // CVE identifier if available
  title: string;
  description: string;
  severity: ThreatSeverity;
  status: 'open' | 'fixed' | 'in_progress' | 'wont_fix' | 'false_positive';
  affectedSystems: string[];
  exploitAvailable: boolean;
  exploitability: number; // 0-10 score of how easily exploitable
  remediationSteps?: string;
  patchAvailable: boolean;
  patchLink?: string;
  metadata?: Record<string, any>;
}

// OSINT scan result
export interface OsintScanResult {
  id: string;
  createdAt: Date;
  scanDate: Date;
  source: string;
  query: string;
  results: OsintFinding[];
  summary?: string;
  metadata?: Record<string, any>;
}

// OSINT finding
export interface OsintFinding {
  id: string;
  title: string;
  description: string;
  source: string;
  url?: string;
  discoveredAt: Date;
  severity: ThreatSeverity;
  category: string;
  relatedTo?: string[];
  metadata?: Record<string, any>;
}

// Security scan configuration
export interface SecurityScanConfig {
  id: string;
  name: string;
  description: string;
  scanType: 'vulnerability' | 'threat' | 'domain' | 'osint' | 'compliance';
  schedule: {
    frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
    day?: number | string; // Day of week or month
    time?: string; // Time in HH:MM format
  };
  targets?: string[]; // URLs, domains, IP ranges, etc.
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  configuration: Record<string, any>; // Scan-specific configuration
}

// Security dashboard stats
export interface SecurityDashboardStats {
  activeThreatCount: number;
  criticalThreatCount: number;
  domainCloneCount: number;
  vulnerabilityCount: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  securityScore: number; // 0-100 score
  lastScanDate?: Date;
  threatsByType: Record<string, number>;
  recentThreats: SecurityThreat[];
  recentDomainClones: DomainClone[];
  recentVulnerabilities: Vulnerability[];
}

// Phishing simulation
export interface PhishingSimulation {
  id: string;
  createdAt: Date;
  name: string;
  description: string;
  status: 'draft' | 'scheduled' | 'in_progress' | 'completed';
  startDate?: Date;
  endDate?: Date;
  targetGroups: string[];
  templateId: string;
  results?: {
    sent: number;
    opened: number;
    clicked: number;
    reported: number;
    compromised: number;
  };
  metadata?: Record<string, any>;
}

// Phishing template
export interface PhishingTemplate {
  id: string;
  createdAt: Date;
  name: string;
  description: string;
  subject: string;
  body: string;
  fromName: string;
  fromEmail: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  metadata?: Record<string, any>;
}
