import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import { SentientLoopService } from '../shared/services/sentientLoop';
import { LoggingService } from '../shared/services/logging';
import { requirePermission } from './middleware/rbac';

/**
 * Gets pending checkpoints for the current user
 */
export const getPendingCheckpoints = async (args: { moduleId?: string }, context: any) => {
  // Apply RBAC middleware - require 'sentient-loop:read' permission
  const user = await requirePermission({
    resource: 'sentient-loop',
    action: 'read',
    adminOverride: true,
    auditRejection: true
  })(context);

  try {
    const { moduleId } = args;

    // Log the operation
    LoggingService.info({
      message: 'Getting pending Sentient Loop checkpoints',
      userId: user.id,
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      metadata: { moduleId }
    });

    // Get pending checkpoints
    const checkpoints = await SentientLoopService.getPendingCheckpoints(user.id, moduleId);

    return checkpoints;
  } catch (error) {
    console.error('Error getting pending checkpoints:', error);
    LoggingService.error({
      message: 'Failed to get pending Sentient Loop checkpoints',
      userId: user.id,
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      error
    });
    throw new HttpError(500, 'Failed to get pending checkpoints');
  }
};

/**
 * Resolves a checkpoint
 */
export const resolveCheckpoint = async (args: {
  checkpointId: string;
  status: 'APPROVED' | 'REJECTED' | 'MODIFIED' | 'ESCALATED';
  resolution: string;
  modifiedPayload?: any;
}, context: any) => {
  // Apply RBAC middleware - require 'sentient-loop:use' permission
  const user = await requirePermission({
    resource: 'sentient-loop',
    action: 'use',
    adminOverride: true,
    auditRejection: true
  })(context);

  try {
    const { checkpointId, status, resolution, modifiedPayload } = args;

    // Log the operation
    LoggingService.info({
      message: `Resolving Sentient Loop checkpoint: ${status}`,
      userId: user.id,
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      metadata: { checkpointId, status }
    });

    // Resolve the checkpoint
    const checkpoint = await SentientLoopService.resolveCheckpoint({
      checkpointId,
      userId: user.id,
      status,
      resolution,
      modifiedPayload
    });

    return checkpoint;
  } catch (error) {
    console.error('Error resolving checkpoint:', error);
    LoggingService.error({
      message: 'Failed to resolve Sentient Loop checkpoint',
      userId: user.id,
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      error,
      metadata: { checkpointId: args.checkpointId, status: args.status }
    });
    throw new HttpError(500, 'Failed to resolve checkpoint');
  }
};

/**
 * Gets the Sentient Loop configuration
 */
export const getSentientLoopConfig = async (args: { moduleId?: string }, context: any) => {
  // Apply RBAC middleware - require 'sentient-loop:read' permission
  const user = await requirePermission({
    resource: 'sentient-loop',
    action: 'read',
    adminOverride: true,
    auditRejection: true
  })(context);

  try {
    const { moduleId } = args;

    // Log the operation
    LoggingService.info({
      message: 'Getting Sentient Loop configuration',
      userId: user.id,
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      metadata: { moduleId }
    });

    // Get the configuration
    const config = await SentientLoopService.getLoopConfig(user.id, moduleId);

    return config;
  } catch (error) {
    console.error('Error getting Sentient Loop configuration:', error);
    LoggingService.error({
      message: 'Failed to get Sentient Loop configuration',
      userId: user.id,
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      error
    });
    throw new HttpError(500, 'Failed to get Sentient Loop configuration');
  }
};

/**
 * Updates the Sentient Loop configuration
 */
export const updateSentientLoopConfig = async (args: {
  moduleId?: string;
  checkpointThresholds?: any;
  escalationRules?: any;
  memoryRetention?: any;
  auditFrequency?: any;
  isActive?: boolean;
}, context: any) => {
  // Apply RBAC middleware - require 'sentient-loop:manage' permission
  const user = await requirePermission({
    resource: 'sentient-loop',
    action: 'manage',
    adminOverride: true,
    auditRejection: true
  })(context);

  try {
    const { moduleId, checkpointThresholds, escalationRules, memoryRetention, auditFrequency, isActive } = args;

    // Log the operation
    LoggingService.info({
      message: 'Updating Sentient Loop configuration',
      userId: user.id,
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      metadata: { moduleId }
    });

    // Update the configuration
    const config = await SentientLoopService.updateLoopConfig({
      userId: user.id,
      moduleId,
      checkpointThresholds,
      escalationRules,
      memoryRetention,
      auditFrequency,
      isActive
    });

    return config;
  } catch (error) {
    console.error('Error updating Sentient Loop configuration:', error);
    LoggingService.error({
      message: 'Failed to update Sentient Loop configuration',
      userId: user.id,
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      error
    });
    throw new HttpError(500, 'Failed to update Sentient Loop configuration');
  }
};

/**
 * Creates a checkpoint
 */
export const createCheckpoint = async (args: {
  moduleId: string;
  agentId?: string;
  sessionId?: string;
  type: 'DECISION_REQUIRED' | 'CONFIRMATION_REQUIRED' | 'INFORMATION_REQUIRED' | 'ESCALATION_REQUIRED' | 'VALIDATION_REQUIRED' | 'AUDIT_REQUIRED';
  title: string;
  description: string;
  originalPayload: any;
  metadata?: any;
  expiresAt?: Date;
  traceId?: string;
  parentCheckpointId?: string;
}, context: any) => {
  // Apply RBAC middleware - require 'sentient-loop:create' permission
  const user = await requirePermission({
    resource: 'sentient-loop',
    action: 'create',
    adminOverride: true,
    auditRejection: true
  })(context);

  try {
    const { 
      moduleId, 
      agentId, 
      sessionId, 
      type, 
      title, 
      description, 
      originalPayload, 
      metadata, 
      expiresAt, 
      traceId, 
      parentCheckpointId 
    } = args;

    // Log the operation
    LoggingService.info({
      message: `Creating Sentient Loop checkpoint: ${title}`,
      userId: user.id,
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      metadata: { moduleId, type }
    });

    // Create the checkpoint
    const checkpoint = await SentientLoopService.createCheckpoint({
      userId: user.id,
      moduleId,
      agentId,
      sessionId,
      type,
      title,
      description,
      originalPayload,
      metadata,
      expiresAt,
      traceId,
      parentCheckpointId
    });

    return checkpoint;
  } catch (error) {
    console.error('Error creating checkpoint:', error);
    LoggingService.error({
      message: 'Failed to create Sentient Loop checkpoint',
      userId: user.id,
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      error,
      metadata: { moduleId: args.moduleId, type: args.type }
    });
    throw new HttpError(500, 'Failed to create checkpoint');
  }
};

/**
 * Creates a memory snapshot
 */
export const createMemorySnapshot = async (args: {
  checkpointId: string;
  type: 'DECISION' | 'FEEDBACK' | 'CONTEXT' | 'ESCALATION' | 'AUDIT' | 'SYSTEM';
  content: any;
  metadata?: any;
  importance?: number;
  expiresAt?: Date;
}, context: any) => {
  // Apply RBAC middleware - require 'sentient-loop:create' permission
  const user = await requirePermission({
    resource: 'sentient-loop',
    action: 'create',
    adminOverride: true,
    auditRejection: true
  })(context);

  try {
    const { checkpointId, type, content, metadata, importance, expiresAt } = args;

    // Log the operation
    LoggingService.info({
      message: 'Creating Sentient Loop memory snapshot',
      userId: user.id,
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      metadata: { checkpointId, type }
    });

    // Create the memory snapshot
    const memorySnapshot = await SentientLoopService.createMemorySnapshot({
      checkpointId,
      type,
      content,
      metadata,
      importance,
      expiresAt
    });

    return memorySnapshot;
  } catch (error) {
    console.error('Error creating memory snapshot:', error);
    LoggingService.error({
      message: 'Failed to create Sentient Loop memory snapshot',
      userId: user.id,
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      error,
      metadata: { checkpointId: args.checkpointId, type: args.type }
    });
    throw new HttpError(500, 'Failed to create memory snapshot');
  }
};

/**
 * Creates an escalation
 */
export const createEscalation = async (args: {
  checkpointId: string;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reason: string;
  metadata?: any;
}, context: any) => {
  // Apply RBAC middleware - require 'sentient-loop:create' permission
  const user = await requirePermission({
    resource: 'sentient-loop',
    action: 'create',
    adminOverride: true,
    auditRejection: true
  })(context);

  try {
    const { checkpointId, level, reason, metadata } = args;

    // Log the operation
    LoggingService.info({
      message: `Creating Sentient Loop escalation: ${level} level`,
      userId: user.id,
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      metadata: { checkpointId, level, reason }
    });

    // Create the escalation
    const escalation = await SentientLoopService.createEscalation({
      checkpointId,
      level,
      reason,
      metadata
    });

    return escalation;
  } catch (error) {
    console.error('Error creating escalation:', error);
    LoggingService.error({
      message: 'Failed to create Sentient Loop escalation',
      userId: user.id,
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      error,
      metadata: { checkpointId: args.checkpointId, level: args.level }
    });
    throw new HttpError(500, 'Failed to create escalation');
  }
};

/**
 * Records a decision trace
 */
export const recordDecisionTrace = async (args: {
  checkpointId: string;
  decisionType: 'human' | 'agent' | 'system';
  reasoning?: string;
  factors?: any;
  alternatives?: any;
  metadata?: any;
}, context: any) => {
  // Apply RBAC middleware - require 'sentient-loop:create' permission
  const user = await requirePermission({
    resource: 'sentient-loop',
    action: 'create',
    adminOverride: true,
    auditRejection: true
  })(context);

  try {
    const { checkpointId, decisionType, reasoning, factors, alternatives, metadata } = args;

    // Log the operation
    LoggingService.info({
      message: 'Recording Sentient Loop decision trace',
      userId: user.id,
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      metadata: { checkpointId, decisionType }
    });

    // Record the decision trace
    const decisionTrace = await SentientLoopService.recordDecisionTrace({
      checkpointId,
      decisionMaker: user.id,
      decisionType,
      reasoning,
      factors,
      alternatives,
      metadata
    });

    return decisionTrace;
  } catch (error) {
    console.error('Error recording decision trace:', error);
    LoggingService.error({
      message: 'Failed to record Sentient Loop decision trace',
      userId: user.id,
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      error,
      metadata: { checkpointId: args.checkpointId, decisionType: args.decisionType }
    });
    throw new HttpError(500, 'Failed to record decision trace');
  }
};

/**
 * Processes an agent action through the Sentient Loop
 */
export const processAgentAction = async (args: {
  moduleId: string;
  agentId?: string;
  sessionId?: string;
  actionType: string;
  title: string;
  description: string;
  payload: any;
  confidence: number;
  impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  context: any;
  metadata?: any;
}, context: any) => {
  // Apply RBAC middleware - require 'sentient-loop:use' permission
  const user = await requirePermission({
    resource: 'sentient-loop',
    action: 'use',
    adminOverride: true,
    auditRejection: true
  })(context);

  try {
    const { 
      moduleId, 
      agentId, 
      sessionId, 
      actionType, 
      title, 
      description, 
      payload, 
      confidence, 
      impact, 
      context: actionContext, 
      metadata 
    } = args;

    // Log the operation
    LoggingService.info({
      message: `Processing agent action through Sentient Loop: ${actionType}`,
      userId: user.id,
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      metadata: { moduleId, actionType, impact, confidence }
    });

    // Process the action
    const result = await SentientLoopService.processAgentAction({
      userId: user.id,
      moduleId,
      agentId,
      sessionId,
      actionType,
      title,
      description,
      payload,
      confidence,
      impact,
      context: actionContext,
      metadata
    });

    return result;
  } catch (error) {
    console.error('Error processing agent action:', error);
    LoggingService.error({
      message: 'Failed to process agent action through Sentient Loop',
      userId: user.id,
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      error,
      metadata: { moduleId: args.moduleId, actionType: args.actionType }
    });
    throw new HttpError(500, 'Failed to process agent action');
  }
};