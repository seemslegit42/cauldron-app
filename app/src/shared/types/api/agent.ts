import { Agent } from '@src/shared/types/entities/agent';
import { TrustScore, Badge } from '@src/shared/types/entities/agentTrust';

// Get agent by ID
export type GetAgentById = (
  args: { id: string },
  context: any
) => Promise<Agent>;

// Get agent trust score
export type GetAgentTrustScore = (
  args: { agentId: string },
  context: any
) => Promise<TrustScore>;

// Get agent badges
export type GetAgentBadges = (
  args: { agentId: string },
  context: any
) => Promise<Badge[]>;

// Record agent task
export type RecordAgentTask = (
  args: { 
    agentId: string;
    success: boolean;
    taskType?: string;
    details?: string;
  },
  context: any
) => Promise<TrustScore>;

// Add XP to agent
export type AddAgentXp = (
  args: { 
    agentId: string;
    xp: number;
    actionType: string;
    description?: string;
  },
  context: any
) => Promise<TrustScore>;

// Award badge to agent
export type AwardAgentBadge = (
  args: { 
    agentId: string;
    badgeId: string;
  },
  context: any
) => Promise<{ success: boolean; message: string }>;

// Submit agent feedback
export type SubmitAgentFeedback = (
  args: { 
    agentId: string;
    rating: 'positive' | 'neutral' | 'negative';
    comment?: string;
    context?: string;
  },
  context: any
) => Promise<{ success: boolean; message: string }>;

// Submit agent escalation
export type SubmitAgentEscalation = (
  args: { 
    agentId: string;
    reason: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    details?: string;
    context?: string;
  },
  context: any
) => Promise<{ success: boolean; message: string; escalationId: string }>;

// Create agent
export type CreateAgent = (
  args: {
    name: string;
    description: string;
    type: string;
    capabilities: string[];
    model: string;
    provider: string;
    systemPrompt: string;
    configuration: Record<string, any>;
    isActive: boolean;
    personaId?: string;
  },
  context: any
) => Promise<Agent>;

// Update agent
export type UpdateAgent = (
  args: {
    id: string;
    name?: string;
    description?: string;
    type?: string;
    capabilities?: string[];
    model?: string;
    provider?: string;
    systemPrompt?: string;
    configuration?: Record<string, any>;
    isActive?: boolean;
    personaId?: string;
  },
  context: any
) => Promise<Agent>;

// Delete agent
export type DeleteAgent = (
  args: { id: string },
  context: any
) => Promise<{ success: boolean; message: string }>;

// List agents
export type ListAgents = (
  args: {
    userId?: string;
    type?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  },
  context: any
) => Promise<{
  agents: Agent[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}>;
