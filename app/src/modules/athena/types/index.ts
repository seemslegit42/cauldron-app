/**
 * Athena Module Types
 *
 * This file contains TypeScript type definitions for the Athena business intelligence module.
 */

// Business metric categories
export enum MetricCategory {
  REVENUE = 'revenue',
  GROWTH = 'growth',
  ENGAGEMENT = 'engagement',
  CONVERSION = 'conversion',
  RETENTION = 'retention',
  ACQUISITION = 'acquisition',
  PERFORMANCE = 'performance',
  MARKETING = 'marketing',
  SALES = 'sales',
  CUSTOMER = 'customer',
  FINANCIAL = 'financial',
  OPERATIONAL = 'operational',
  MARKET = 'market',
  PRODUCT = 'product',
  HIRING = 'hiring',
  PARTNERSHIP = 'partnership'
}

// Executive Advisor communication style
export enum ExecutiveAdvisorTone {
  AGGRESSIVE = 'aggressive',
  CONSERVATIVE = 'conservative',
  BALANCED = 'balanced'
}

// Timeframe options for analytics
export enum TimeframeOption {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year'
}

// Impact level for insights and recommendations
export enum ImpactLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Confidence level for AI-generated insights
export enum ConfidenceLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high'
}

// Status for campaigns and experiments
export enum CampaignStatus {
  DRAFT = 'draft',
  PLANNED = 'planned',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Business metric interface
export interface BusinessMetric {
  id: string;
  name: string;
  category: MetricCategory;
  value: number;
  previousValue?: number;
  percentChange?: number;
  target?: number;
  date: Date;
  unit: string;
  description?: string;
}

// Business insight interface
export interface BusinessInsight {
  id: string;
  title: string;
  description: string;
  category: MetricCategory;
  impact: ImpactLevel;
  confidence: ConfidenceLevel;
  relatedMetrics: string[];
  createdAt: Date;
  isArchived: boolean;
  metadata?: Record<string, any>;
}

// Business recommendation interface
export interface BusinessRecommendation {
  id: string;
  title: string;
  description: string;
  category: MetricCategory;
  impact: ImpactLevel;
  effort: ImpactLevel;
  confidence: ConfidenceLevel;
  actionItems: string[];
  expectedOutcome: string;
  createdAt: Date;
  isImplemented: boolean;
  metadata?: Record<string, any>;
}

// Campaign or experiment suggestion
export interface CampaignSuggestion {
  id: string;
  title: string;
  description: string;
  objective: string;
  targetAudience: string;
  estimatedImpact: ImpactLevel;
  estimatedCost?: number;
  estimatedDuration: number; // in days
  kpis: string[];
  status: CampaignStatus;
  createdAt: Date;
  metadata?: Record<string, any>;
}

// Strategic decision suggestion
export interface StrategicDecision {
  id: string;
  title: string;
  description: string;
  category: string;
  impact: ImpactLevel;
  risk: ImpactLevel;
  options: StrategicOption[];
  recommendedOptionId: string;
  createdAt: Date;
  deadline?: Date;
  isResolved: boolean;
  metadata?: Record<string, any>;
}

// Strategic option for a decision
export interface StrategicOption {
  id: string;
  title: string;
  description: string;
  pros: string[];
  cons: string[];
  estimatedImpact: ImpactLevel;
  estimatedRisk: ImpactLevel;
  metadata?: Record<string, any>;
}

// Growth metric with trend data
export interface GrowthMetric {
  id: string;
  name: string;
  category: MetricCategory;
  currentValue: number;
  historicalValues: {
    date: Date;
    value: number;
  }[];
  trend: number; // percentage change
  forecastValues?: {
    date: Date;
    value: number;
    confidence: number;
  }[];
  unit: string;
  description?: string;
}

// Market data interface
export interface MarketData {
  id: string;
  name: string;
  category: string;
  value: number;
  source: string;
  date: Date;
  trend?: number;
  impact: ImpactLevel;
  relevance: ConfidenceLevel;
  description: string;
  metadata?: Record<string, any>;
}

// Strategic recommendation interface
export interface StrategicRecommendation {
  id: string;
  title: string;
  description: string;
  category: MetricCategory;
  impact: ImpactLevel;
  timeframe: TimeframeOption;
  actionItems: string[];
  expectedOutcome: string;
  supportingData: string[];
  createdAt: Date;
  isImplemented: boolean;
  metadata?: Record<string, any>;
}

// Executive summary interface
export interface ExecutiveSummary {
  id: string;
  title: string;
  summary: string;
  keyMetrics: {
    name: string;
    value: string;
    trend: number;
  }[];
  keyInsights: string[];
  topRecommendations: string[];
  riskFactors: string[];
  opportunities: string[];
  createdAt: Date;
  timeframe: TimeframeOption;
  metadata?: Record<string, any>;
}

// Notion export options
export interface NotionExportOptions {
  includeMetrics: boolean;
  includeInsights: boolean;
  includeRecommendations: boolean;
  includeExecutiveSummary: boolean;
  notionPageId?: string;
  notionDatabaseId?: string;
  exportFormat: 'page' | 'database';
  timeframe: TimeframeOption;
}

// Executive Advisor output interface
export interface ExecutiveAdvisorOutput {
  id: string;
  title: string;
  summary: string;
  keyPoints: string[];
  strategicSuggestions: string[];
  investorPitchPoints?: string[];
  growthOpportunities: {
    title: string;
    description: string;
    impact: ImpactLevel;
    timeframe: TimeframeOption;
  }[];
  communicationStyle: ExecutiveAdvisorTone;
  createdAt: Date;
  metadata?: Record<string, any>;
}

// Executive Advisor request options
export interface ExecutiveAdvisorOptions {
  timeframe: TimeframeOption;
  communicationStyle: ExecutiveAdvisorTone;
  focusArea?: MetricCategory[];
  includeInvestorPitch?: boolean;
  maxSuggestions?: number;
  maxLength?: 'concise' | 'standard' | 'detailed';
}

// Dashboard analytics data
export interface AnalyticsDashboard {
  timeframe: TimeframeOption;
  metrics: BusinessMetric[];
  growthMetrics: GrowthMetric[];
  insights: BusinessInsight[];
  recommendations: BusinessRecommendation[];
  campaigns: CampaignSuggestion[];
  strategicDecisions: StrategicDecision[];
  marketData?: MarketData[];
  strategicRecommendations?: StrategicRecommendation[];
  executiveSummary?: ExecutiveSummary;
  executiveAdvisorOutput?: ExecutiveAdvisorOutput;
}
