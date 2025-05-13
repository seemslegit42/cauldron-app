export enum ThreatSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum ThreatStatus {
  ACTIVE = 'ACTIVE',
  MITIGATED = 'MITIGATED',
  RESOLVED = 'RESOLVED',
  FALSE_POSITIVE = 'FALSE_POSITIVE',
}

export enum ThreatType {
  DOMAIN_CLONE = 'DOMAIN_CLONE',
  PHISHING = 'PHISHING',
  MALWARE = 'MALWARE',
  VULNERABILITY = 'VULNERABILITY',
  DATA_BREACH = 'DATA_BREACH',
  CREDENTIAL_LEAK = 'CREDENTIAL_LEAK',
  BRAND_IMPERSONATION = 'BRAND_IMPERSONATION',
  SOCIAL_ENGINEERING = 'SOCIAL_ENGINEERING',
  INSIDER_THREAT = 'INSIDER_THREAT',
  DDOS = 'DDOS',
  OTHER = 'OTHER',
}

export interface SecurityThreat {
  id: string;
  title: string;
  description: string;
  severity: ThreatSeverity;
  status: ThreatStatus;
  type: ThreatType;
  source: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  assignedTo?: string;
  tags?: string[];
  indicators?: string[];
  relatedThreats?: string[];
  mitigationSteps?: string[];
  notes?: string;
}

export interface DomainClone {
  id: string;
  domain: string;
  registrationDate: string;
  registrar: string;
  ipAddress: string;
  similarity: number;
  status: ThreatStatus;
  createdAt: string;
  updatedAt: string;
  screenshot?: string;
  dnsRecords?: Record<string, string>;
  whoisInfo?: string;
  contentSimilarity?: number;
  threatId?: string;
}

export interface Vulnerability {
  id: string;
  title: string;
  description: string;
  severity: ThreatSeverity;
  status: ThreatStatus;
  cveId?: string;
  cvssScore?: number;
  affectedSystems: string[];
  discoveredAt: string;
  patchAvailable: boolean;
  patchUrl?: string;
  exploitAvailable: boolean;
  exploitDetails?: string;
  remediationSteps: string[];
  threatId?: string;
}

export interface OsintResult {
  id: string;
  source: string;
  type: string;
  content: string;
  relevance: number;
  createdAt: string;
  metadata: Record<string, any>;
  relatedThreats?: string[];
}

export interface SecurityScan {
  id: string;
  type: string;
  startedAt: string;
  completedAt?: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  progress: number;
  results?: Record<string, any>;
  threatsDetected?: number;
  vulnerabilitiesDetected?: number;
  domainsScanned?: number;
  error?: string;
}

export interface SecurityAction {
  id: string;
  title: string;
  description: string;
  type: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  completedAt?: string;
  threatId?: string;
  userId?: string;
  result?: string;
}

export interface SecurityDashboardStats {
  activeThreatCount: number;
  criticalThreatCount: number;
  domainCloneCount: number;
  vulnerabilityCount: number;
  securityScore: number;
  lastScanDate: Date;
  threatsByType: Record<string, number>;
  recentThreats: SecurityThreat[];
  recentDomainClones: DomainClone[];
  recentVulnerabilities: Vulnerability[];
}

export interface SecurityDashboardData {
  stats: SecurityDashboardStats;
  scans: SecurityScan[];
  actions: SecurityAction[];
}

export interface SecurityScanRequest {
  scanType: string;
  targets: string[];
  configuration: Record<string, any>;
}

export interface DomainMonitoringRequest {
  domain: string;
  monitoringType: string;
  isActive: boolean;
}

export interface ThreatResponse {
  threatId: string;
  action: string;
  notes?: string;
  assignTo?: string;
}
