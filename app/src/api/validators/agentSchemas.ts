/**
 * Validation schemas for agent-related API requests
 */
import { z } from 'zod';
import { BadgeCategory, BadgeTier, BadgeRequirementType } from '@src/shared/types/entities/agentTrust';

// Schema for creating a new agent
export const createAgentSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  type: z.string(),
  capabilities: z.array(z.string()).optional().default([]),
  model: z.string().optional(),
  provider: z.string().optional(),
  systemPrompt: z.string().optional(),
  configuration: z.record(z.any()),
  isActive: z.boolean().default(true),
  personaId: z.string().uuid().optional(),
});

// Schema for updating an agent
export const updateAgentSchema = z.object({
  agentId: z.string().uuid(),
  name: z.string().min(3).max(100).optional(),
  description: z.string().min(10).max(500).optional(),
  type: z.string().optional(),
  capabilities: z.array(z.string()).optional(),
  model: z.string().optional(),
  provider: z.string().optional(),
  systemPrompt: z.string().optional(),
  configuration: z.record(z.any()).optional(),
  isActive: z.boolean().optional(),
  personaId: z.string().uuid().optional().nullable(),
});

// Schema for deleting an agent
export const deleteAgentSchema = z.object({
  agentId: z.string().uuid(),
});

// Schema for getting agent details
export const getAgentSchema = z.object({
  agentId: z.string().uuid(),
});

// Schema for listing agents
export const listAgentsSchema = z.object({
  userId: z.string().uuid().optional(),
  type: z.string().optional(),
  isActive: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

// Schema for executing an agent
export const executeAgentSchema = z.object({
  agentId: z.string().uuid(),
  input: z.record(z.any()),
  context: z.record(z.any()).optional(),
});

// Schema for agent metadata
export const agentMetadataSchema = z.object({
  scope: z.string(),
  module: z.string(),
  owner: z.string().uuid(),
  safetyScore: z.number().min(0).max(10).optional(),
  estimatedTokens: z.number().int().min(0).optional(),
});

// Schema for creating a badge
export const createBadgeSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  category: z.nativeEnum(BadgeCategory),
  tier: z.nativeEnum(BadgeTier),
  iconUrl: z.string().url().optional(),
  requirement: z.string().min(1).max(200),
  requirementType: z.nativeEnum(BadgeRequirementType),
  requirementValue: z.number().positive(),
  isActive: z.boolean(),
});

// Schema for updating a badge
export const updateBadgeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(500).optional(),
  category: z.nativeEnum(BadgeCategory).optional(),
  tier: z.nativeEnum(BadgeTier).optional(),
  iconUrl: z.string().url().optional().nullable(),
  requirement: z.string().min(1).max(200).optional(),
  requirementType: z.nativeEnum(BadgeRequirementType).optional(),
  requirementValue: z.number().positive().optional(),
  isActive: z.boolean().optional(),
});

// Schema for submitting feedback
export const submitFeedbackSchema = z.object({
  agentId: z.string().uuid(),
  rating: z.enum(['positive', 'neutral', 'negative']),
  comment: z.string().max(1000).optional(),
  context: z.string().max(2000).optional(),
});

// Schema for submitting escalation
export const submitEscalationSchema = z.object({
  agentId: z.string().uuid(),
  reason: z.string().min(1).max(200),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  details: z.string().max(2000).optional(),
  context: z.string().max(2000).optional(),
});

// Schema for recording a task
export const recordTaskSchema = z.object({
  agentId: z.string().uuid(),
  success: z.boolean(),
  taskType: z.string().optional(),
  details: z.string().optional(),
});

// Schema for adding XP
export const addXpSchema = z.object({
  agentId: z.string().uuid(),
  xp: z.number().positive(),
  actionType: z.string(),
  description: z.string().optional(),
});

// Schema for awarding a badge
export const awardBadgeSchema = z.object({
  agentId: z.string().uuid(),
  badgeId: z.string().uuid(),
});
