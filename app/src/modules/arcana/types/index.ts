/**
 * Type definitions for the Arcana module
 */

// Persona types
export type PersonaType = 'hacker-ceo' | 'podcast-mogul' | 'enterprise-admin';

// Risk level for security status
export type RiskLevel = 'green' | 'yellow' | 'red';

// Dashboard layout options
export type DashboardLayout = 'default' | 'compact' | 'expanded';

// Metric category types
export type MetricCategory = 'business' | 'security' | 'social' | 'media';

// User context interface
export interface UserContext {
  userId: string;
  metrics?: Record<string, any>;
  projects?: Record<string, any>;
  decisions?: Record<string, any>;
  goals?: Record<string, any>;
  preferences?: Record<string, any>;
  persona?: PersonaType;
}

// Business metric interface
export interface BusinessMetric {
  id: string;
  name: string;
  value: number | string;
  trend?: number;
  change?: number;
  unit?: string;
  category: MetricCategory;
  icon?: string;
  color?: string;
}

// Security metrics interface
export interface SecurityMetrics {
  securityScore: number;
  vulnerabilities: number;
  threatsBlocked: number;
  criticalAlerts: number;
  threatDetection?: number;
  responseTime?: string;
  lastScanTime?: string;
  threatLevel?: number;
}

// Recommendation interface
export interface Recommendation {
  id: string;
  title: string;
  description: string;
  actions: string[];
  priority: 'low' | 'medium' | 'high';
  category: string;
  source: string;
  timestamp: Date;
}

// Workflow interface
export interface Workflow {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed' | 'failed';
  progress: number;
  steps: number;
  completedSteps: number;
  type: string;
  agents?: string[];
  lastUpdated?: string;
}

// Message interface for AI chat
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Suggested prompt interface
export interface SuggestedPrompt {
  text: string;
  icon: string;
  category?: string;
}

// Persona style interface
export interface PersonaStyle {
  accentColor: string;
  buttonBg: string;
  cardBorder: string;
  gradientStart: string;
  gradientEnd: string;
  iconColor: string;
}
