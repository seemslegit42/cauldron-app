/**
 * Sentient Loop™ API Types
 *
 * This file contains type definitions for the Sentient Loop™ API.
 */

import { z } from 'zod';

// Event types that can be emitted by the Sentient Loop
export enum SentientLoopEventType {
  CHECKPOINT_CREATED = 'checkpoint.created',
  CHECKPOINT_UPDATED = 'checkpoint.updated',
  CHECKPOINT_RESOLVED = 'checkpoint.resolved',
  ESCALATION_CREATED = 'escalation.created',
  ESCALATION_RESOLVED = 'escalation.resolved',
  MEMORY_CREATED = 'memory.created',
  MEMORY_UPDATED = 'memory.updated',
  DECISION_RECORDED = 'decision.recorded',
  AGENT_ACTION_PROCESSED = 'agent.action.processed',
  AGENT_ACTION_APPROVED = 'agent.action.approved',
  AGENT_ACTION_REJECTED = 'agent.action.rejected',
  AGENT_ACTION_MODIFIED = 'agent.action.modified',
}

// Base event schema
export const baseEventSchema = z.object({
  id: z.string().uuid(),
  type: z.nativeEnum(SentientLoopEventType),
  timestamp: z.string().datetime(),
  organizationId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  moduleId: z.string().optional(),
  agentId: z.string().uuid().optional(),
  sessionId: z.string().optional(),
  traceId: z.string().optional(),
  spanId: z.string().optional(),
  version: z.string().default('1.0'),
});

// Checkpoint event schema
export const checkpointEventSchema = baseEventSchema.extend({
  data: z.object({
    checkpointId: z.string().uuid(),
    type: z.enum([
      'DECISION_REQUIRED',
      'CONFIRMATION_REQUIRED',
      'INFORMATION_REQUIRED',
      'ESCALATION_REQUIRED',
      'VALIDATION_REQUIRED',
      'AUDIT_REQUIRED'
    ]),
    title: z.string(),
    description: z.string(),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'MODIFIED', 'EXPIRED', 'ESCALATED']),
    originalPayload: z.any(),
    modifiedPayload: z.any().optional(),
    metadata: z.record(z.any()).optional(),
    expiresAt: z.string().datetime().optional(),
    resolvedAt: z.string().datetime().optional(),
    resolvedBy: z.string().uuid().optional(),
    resolution: z.string().optional(),
  }),
});

// Escalation event schema
export const escalationEventSchema = baseEventSchema.extend({
  data: z.object({
    escalationId: z.string().uuid(),
    checkpointId: z.string().uuid().optional(),
    level: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    reason: z.string(),
    status: z.enum(['PENDING', 'ACKNOWLEDGED', 'RESOLVED', 'REJECTED']),
    metadata: z.record(z.any()).optional(),
    resolvedAt: z.string().datetime().optional(),
    resolvedBy: z.string().uuid().optional(),
    resolution: z.string().optional(),
  }),
});

// Memory event schema
export const memoryEventSchema = baseEventSchema.extend({
  data: z.object({
    memoryId: z.string().uuid(),
    checkpointId: z.string().uuid().optional(),
    type: z.enum(['SHORT_TERM', 'LONG_TERM', 'EPISODIC', 'SEMANTIC', 'PROCEDURAL']),
    content: z.any(),
    context: z.string().optional(),
    importance: z.number().min(0).max(1).default(0.5),
    metadata: z.record(z.any()).optional(),
    expiresAt: z.string().datetime().optional(),
  }),
});

// Decision event schema
export const decisionEventSchema = baseEventSchema.extend({
  data: z.object({
    decisionId: z.string().uuid(),
    checkpointId: z.string().uuid().optional(),
    decisionMaker: z.enum(['HUMAN', 'AGENT', 'SYSTEM']),
    decision: z.enum(['APPROVE', 'REJECT', 'MODIFY', 'ESCALATE']),
    reasoning: z.string(),
    factorsConsidered: z.array(z.string()).optional(),
    alternatives: z.array(z.string()).optional(),
    confidence: z.number().min(0).max(1).optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

// Agent action event schema
export const agentActionEventSchema = baseEventSchema.extend({
  data: z.object({
    actionId: z.string().uuid(),
    checkpointId: z.string().uuid().optional(),
    actionType: z.string(),
    title: z.string(),
    description: z.string(),
    payload: z.any(),
    confidence: z.number().min(0).max(1),
    impact: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'MODIFIED', 'ESCALATED', 'EXECUTED']),
    context: z.record(z.any()).optional(),
    metadata: z.record(z.any()).optional(),
    resolvedAt: z.string().datetime().optional(),
    resolvedBy: z.string().uuid().optional(),
    resolution: z.string().optional(),
  }),
});

// Webhook registration schema
export const webhookRegistrationSchema = z.object({
  url: z.string().url(),
  secret: z.string().min(16).optional(),
  description: z.string().optional(),
  events: z.array(z.nativeEnum(SentientLoopEventType)),
  isActive: z.boolean().default(true),
  metadata: z.record(z.any()).optional(),
});

// API key schema
export const apiKeySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  permissions: z.array(z.string()),
  expiresAt: z.string().datetime().optional(),
});

// Submit decision schema
export const submitDecisionSchema = z.object({
  checkpointId: z.string().uuid(),
  decision: z.enum(['APPROVE', 'REJECT', 'MODIFY', 'ESCALATE']),
  reasoning: z.string(),
  modifiedPayload: z.any().optional(),
  metadata: z.record(z.any()).optional(),
});

// Contribute memory schema
export const contributeMemorySchema = z.object({
  type: z.enum(['SHORT_TERM', 'LONG_TERM', 'EPISODIC', 'SEMANTIC', 'PROCEDURAL']),
  content: z.any(),
  context: z.string().optional(),
  importance: z.number().min(0).max(1).default(0.5),
  metadata: z.record(z.any()).optional(),
  expiresAt: z.string().datetime().optional(),
  agentId: z.string().uuid().optional(),
  moduleId: z.string().optional(),
  sessionId: z.string().optional(),
});

// Export types derived from schemas
export type BaseEvent = z.infer<typeof baseEventSchema>;
export type CheckpointEvent = z.infer<typeof checkpointEventSchema>;
export type EscalationEvent = z.infer<typeof escalationEventSchema>;
export type MemoryEvent = z.infer<typeof memoryEventSchema>;
export type DecisionEvent = z.infer<typeof decisionEventSchema>;
export type AgentActionEvent = z.infer<typeof agentActionEventSchema>;
export type WebhookRegistration = z.infer<typeof webhookRegistrationSchema>;
export type ApiKey = z.infer<typeof apiKeySchema>;
export type SubmitDecision = z.infer<typeof submitDecisionSchema>;
export type ContributeMemory = z.infer<typeof contributeMemorySchema>;
