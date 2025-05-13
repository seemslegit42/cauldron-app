// Security alert severity levels
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';

// Security alert status
export type AlertStatus = 'new' | 'acknowledged' | 'resolved' | 'false_positive';

// Security alert source
export type AlertSource = 'scan' | 'monitor' | 'ai' | 'manual' | 'integration';

// Security alert interface
export interface SecurityAlert {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  source: AlertSource;
  status: AlertStatus;
  metadata?: any;
  resolvedAt?: Date;
  acknowledgedAt?: Date;
  scanId?: string;
}

// Security metric categories
export type MetricCategory = 'posture' | 'threats' | 'compliance' | 'response';

// Security metric interface
export interface SecurityMetric {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  name: string;
  value: number;
  previousValue?: number;
  target?: number;
  unit?: string;
  category: MetricCategory;
  metadata?: any;
}

// Security recommendation priority
export type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low';

// Security recommendation status
export type RecommendationStatus = 'open' | 'in_progress' | 'implemented' | 'dismissed';

// Security recommendation category
export type RecommendationCategory = 'configuration' | 'patch' | 'policy' | 'training' | 'monitoring';

// Impact level
export type ImpactLevel = 'high' | 'medium' | 'low';

// Effort level
export type EffortLevel = 'high' | 'medium' | 'low';

// Security recommendation interface
export interface SecurityRecommendation {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  title: string;
  description: string;
  priority: RecommendationPriority;
  status: RecommendationStatus;
  category: RecommendationCategory;
  impact: ImpactLevel;
  effort: EffortLevel;
  implementedAt?: Date;
  dismissedAt?: Date;
  metadata?: any;
}

// Security scan types
export type ScanType = 'vulnerability' | 'compliance' | 'configuration' | 'threat' | 'full';

// Security scan status
export type ScanStatus = 'scheduled' | 'running' | 'completed' | 'failed';

// Security scan interface
export interface SecurityScan {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  type: ScanType;
  status: ScanStatus;
  startedAt: Date;
  completedAt?: Date;
  results?: any;
  summary?: string;
  score?: number;
  metadata?: any;
  alerts?: SecurityAlert[];
  complianceChecks?: ComplianceCheck[];
}

// Compliance standard
export type ComplianceStandard = 'GDPR' | 'HIPAA' | 'PCI-DSS' | 'SOC2' | 'ISO27001' | 'NIST';

// Compliance status
export type ComplianceStatus = 'compliant' | 'non_compliant' | 'partial' | 'not_applicable';

// Compliance check interface
export interface ComplianceCheck {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  standard: ComplianceStandard;
  control: string;
  status: ComplianceStatus;
  description: string;
  evidence?: string;
  scanId?: string;
  metadata?: any;
}

// Security risk level
export type RiskLevel = 'green' | 'yellow' | 'red';

// Security risk assessment
export interface RiskAssessment {
  level: RiskLevel;
  description: string;
  metrics?: {
    securityScore: number;
    vulnerabilities: number;
    threatsBlocked: number;
    criticalAlerts: number;
    threatDetection?: number;
    responseTime?: string;
    lastScanTime?: string;
    threatLevel?: number;
  };
}

// Security dashboard stats
export interface SecurityDashboardStats {
  securityScore: number;
  vulnerabilities: number;
  threatsBlocked: number;
  criticalAlerts: number;
  complianceScore: number;
  lastScanTime: string;
  riskLevel: RiskLevel;
  metrics: SecurityMetric[];
  recentAlerts: SecurityAlert[];
  recentRecommendations: SecurityRecommendation[];
  recentScans: SecurityScan[];
  logIntegrityStatus?: {
    lastCheck: Date;
    status: string;
    issuesFound: number;
  };
  credentialStatus?: {
    lastScan: Date;
    criticalFindings: number;
    totalFindings: number;
  };
  anomalousUsage?: {
    count: number;
    critical: number;
    recent: any[];
  };
  mfaStatus?: {
    enabled: boolean;
    enrollmentRate: number;
    policiesActive: number;
  };
}

// Export security stack types
export * from './securityStack';
