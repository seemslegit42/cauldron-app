import { SentientCheckpointService } from './sentientCheckpointService';
import { SentientMemoryService } from './sentientMemoryService';
import { SentientEscalationService } from './sentientEscalationService';
import { SentientDecisionTraceService } from './sentientDecisionTraceService';
import { SentientLoopConfigService } from './sentientLoopConfigService';
import { deliverEventToWebhooks } from './webhookService';
import { SentientLoopEventType } from '../../../../../api/types/sentientLoopApi';
import crypto from 'crypto';

/**
 * Main Sentient Loop™ service that orchestrates the cognitive feedback system
 * with human decision-making at the core of all AI outputs.
 */
export class SentientLoopService {
  /**
   * Creates a checkpoint in the Sentient Loop™ system
   *
   * @param params Checkpoint parameters
   * @returns The created checkpoint
   */
  static async createCheckpoint(params: {
    userId: string;
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
  }) {
    const checkpoint = await SentientCheckpointService.createCheckpoint(params);

    // Emit checkpoint.created event
    try {
      await deliverEventToWebhooks({
        type: SentientLoopEventType.CHECKPOINT_CREATED,
        userId: params.userId,
        moduleId: params.moduleId,
        agentId: params.agentId,
        sessionId: params.sessionId,
        traceId: params.traceId,
        data: {
          checkpointId: checkpoint.id,
          type: checkpoint.type,
          title: checkpoint.title,
          description: checkpoint.description,
          status: checkpoint.status,
          originalPayload: checkpoint.originalPayload,
          metadata: checkpoint.metadata,
          expiresAt: checkpoint.expiresAt,
        }
      });
    } catch (error) {
      console.error('Error emitting checkpoint.created event:', error);
      // Don't throw the error, just log it
    }

    return checkpoint;
  }

  /**
   * Resolves a checkpoint in the Sentient Loop™ system
   *
   * @param params Resolution parameters
   * @returns The updated checkpoint
   */
  static async resolveCheckpoint(params: {
    checkpointId: string;
    userId: string;
    status: 'APPROVED' | 'REJECTED' | 'MODIFIED' | 'ESCALATED';
    resolution: string;
    modifiedPayload?: any;
    reasoning?: string;
    metadata?: any;
  }) {
    const checkpoint = await SentientCheckpointService.resolveCheckpoint(params);

    // Emit checkpoint.resolved event
    try {
      await deliverEventToWebhooks({
        type: SentientLoopEventType.CHECKPOINT_RESOLVED,
        userId: params.userId,
        moduleId: checkpoint.moduleId,
        agentId: checkpoint.agentId,
        sessionId: checkpoint.sessionId,
        traceId: checkpoint.traceId,
        data: {
          checkpointId: checkpoint.id,
          type: checkpoint.type,
          title: checkpoint.title,
          description: checkpoint.description,
          status: checkpoint.status,
          originalPayload: checkpoint.originalPayload,
          modifiedPayload: checkpoint.modifiedPayload,
          metadata: checkpoint.metadata,
          resolvedAt: checkpoint.resolvedAt,
          resolvedBy: checkpoint.resolvedBy,
          resolution: checkpoint.resolution
        }
      });

      // Emit specific event based on the resolution
      let eventType: SentientLoopEventType;
      switch (params.status) {
        case 'APPROVED':
          eventType = SentientLoopEventType.AGENT_ACTION_APPROVED;
          break;
        case 'REJECTED':
          eventType = SentientLoopEventType.AGENT_ACTION_REJECTED;
          break;
        case 'MODIFIED':
          eventType = SentientLoopEventType.AGENT_ACTION_MODIFIED;
          break;
        default:
          return checkpoint; // No specific event for other statuses
      }

      await deliverEventToWebhooks({
        type: eventType,
        userId: params.userId,
        moduleId: checkpoint.moduleId,
        agentId: checkpoint.agentId,
        sessionId: checkpoint.sessionId,
        traceId: checkpoint.traceId,
        data: {
          checkpointId: checkpoint.id,
          status: checkpoint.status,
          resolution: checkpoint.resolution,
          reasoning: params.reasoning,
          modifiedPayload: checkpoint.modifiedPayload,
          metadata: params.metadata || checkpoint.metadata
        }
      });
    } catch (error) {
      console.error(`Error emitting checkpoint events for ${checkpoint.id}:`, error);
      // Don't throw the error, just log it
    }

    return checkpoint;
  }

  /**
   * Creates a memory snapshot associated with a checkpoint
   *
   * @param params Memory snapshot parameters
   * @returns The created memory snapshot
   */
  static async createMemorySnapshot(params: {
    checkpointId?: string;
    userId?: string;
    agentId?: string;
    moduleId?: string;
    sessionId?: string;
    type: 'DECISION' | 'FEEDBACK' | 'CONTEXT' | 'ESCALATION' | 'AUDIT' | 'SYSTEM' | 'SHORT_TERM' | 'LONG_TERM' | 'EPISODIC' | 'SEMANTIC' | 'PROCEDURAL';
    content: any;
    context?: string;
    metadata?: any;
    importance?: number;
    expiresAt?: Date;
  }) {
    const memorySnapshot = await SentientMemoryService.createMemorySnapshot(params);

    // Emit memory.created event
    try {
      await deliverEventToWebhooks({
        type: SentientLoopEventType.MEMORY_CREATED,
        userId: params.userId,
        moduleId: params.moduleId,
        agentId: params.agentId,
        sessionId: params.sessionId,
        data: {
          memoryId: memorySnapshot.id,
          checkpointId: params.checkpointId,
          type: memorySnapshot.type,
          content: memorySnapshot.content,
          context: params.context,
          importance: memorySnapshot.importance,
          metadata: memorySnapshot.metadata,
          expiresAt: memorySnapshot.expiresAt
        }
      });
    } catch (error) {
      console.error('Error emitting memory.created event:', error);
      // Don't throw the error, just log it
    }

    return memorySnapshot;
  }

  /**
   * Escalates a checkpoint to a higher authority or for special handling
   *
   * @param params Escalation parameters
   * @returns The created escalation
   */
  static async createEscalation(params: {
    checkpointId: string;
    userId?: string;
    agentId?: string;
    moduleId?: string;
    sessionId?: string;
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    reason: string;
    metadata?: any;
  }) {
    const escalation = await SentientEscalationService.createEscalation(params);

    // Emit escalation.created event
    try {
      // Get the checkpoint to include its details
      const checkpoint = await SentientCheckpointService.getCheckpointById(params.checkpointId);

      await deliverEventToWebhooks({
        type: SentientLoopEventType.ESCALATION_CREATED,
        userId: params.userId || checkpoint?.userId,
        moduleId: params.moduleId || checkpoint?.moduleId,
        agentId: params.agentId || checkpoint?.agentId,
        sessionId: params.sessionId || checkpoint?.sessionId,
        traceId: checkpoint?.traceId,
        data: {
          escalationId: escalation.id,
          checkpointId: params.checkpointId,
          level: escalation.level,
          reason: escalation.reason,
          status: escalation.status,
          metadata: escalation.metadata
        }
      });
    } catch (error) {
      console.error('Error emitting escalation.created event:', error);
      // Don't throw the error, just log it
    }

    return escalation;
  }

  /**
   * Records a decision trace for accountability and traceability
   *
   * @param params Decision trace parameters
   * @returns The created decision trace
   */
  static async recordDecisionTrace(params: {
    checkpointId: string;
    userId?: string;
    agentId?: string;
    moduleId?: string;
    sessionId?: string;
    decisionMaker: string;
    decisionType: 'human' | 'agent' | 'system';
    reasoning?: string;
    factors?: any;
    alternatives?: any;
    metadata?: any;
  }) {
    const decisionTrace = await SentientDecisionTraceService.recordDecisionTrace(params);

    // Emit decision.recorded event
    try {
      // Get the checkpoint to include its details
      const checkpoint = await SentientCheckpointService.getCheckpointById(params.checkpointId);

      await deliverEventToWebhooks({
        type: SentientLoopEventType.DECISION_RECORDED,
        userId: params.userId || checkpoint?.userId,
        moduleId: params.moduleId || checkpoint?.moduleId,
        agentId: params.agentId || checkpoint?.agentId,
        sessionId: params.sessionId || checkpoint?.sessionId,
        traceId: checkpoint?.traceId,
        data: {
          decisionId: decisionTrace.id,
          checkpointId: params.checkpointId,
          decisionMaker: params.decisionType === 'human' ? 'HUMAN' :
                         params.decisionType === 'agent' ? 'AGENT' : 'SYSTEM',
          reasoning: params.reasoning,
          factorsConsidered: params.factors,
          alternatives: params.alternatives,
          metadata: params.metadata
        }
      });
    } catch (error) {
      console.error('Error emitting decision.recorded event:', error);
      // Don't throw the error, just log it
    }

    return decisionTrace;
  }

  /**
   * Gets pending checkpoints for a user
   *
   * @param userId The user ID
   * @param moduleId Optional module ID to filter by
   * @returns Array of pending checkpoints
   */
  static async getPendingCheckpoints(userId: string, moduleId?: string) {
    return SentientCheckpointService.getPendingCheckpoints(userId, moduleId);
  }

  /**
   * Gets the configuration for the Sentient Loop™ system
   *
   * @param userId The user ID
   * @param moduleId Optional module ID to get specific configuration
   * @returns The configuration
   */
  static async getLoopConfig(userId: string, moduleId?: string) {
    return SentientLoopConfigService.getConfig(userId, moduleId);
  }

  /**
   * Updates the configuration for the Sentient Loop™ system
   *
   * @param params Configuration parameters
   * @returns The updated configuration
   */
  static async updateLoopConfig(params: {
    userId: string;
    moduleId?: string;
    checkpointThresholds?: any;
    escalationRules?: any;
    memoryRetention?: any;
    auditFrequency?: any;
    isActive?: boolean;
  }) {
    return SentientLoopConfigService.updateConfig(params);
  }

  /**
   * Determines if a human checkpoint is needed based on the configuration
   *
   * @param params Parameters to check against thresholds
   * @returns Whether a checkpoint is needed and the recommended type
   */
  static async needsHumanCheckpoint(params: {
    userId: string;
    moduleId: string;
    agentId?: string;
    actionType: string;
    confidence: number;
    impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    context: any;
  }) {
    const config = await SentientLoopConfigService.getConfig(params.userId, params.moduleId);

    if (!config || !config.isActive) {
      return { needed: false };
    }

    const thresholds = config.checkpointThresholds as any;

    // Check if the action requires a checkpoint based on confidence and impact
    if (params.confidence < thresholds.confidenceThreshold) {
      return {
        needed: true,
        type: 'CONFIRMATION_REQUIRED',
        reason: 'Low confidence score'
      };
    }

    if (params.impact === 'HIGH' || params.impact === 'CRITICAL') {
      if (thresholds.alwaysCheckHighImpact) {
        return {
          needed: true,
          type: 'DECISION_REQUIRED',
          reason: 'High impact action'
        };
      }
    }

    // Check action-specific rules
    const actionRules = thresholds.actionRules || {};
    if (actionRules[params.actionType]) {
      const rule = actionRules[params.actionType];
      if (rule.alwaysCheck) {
        return {
          needed: true,
          type: rule.checkpointType || 'CONFIRMATION_REQUIRED',
          reason: rule.reason || 'Action-specific rule'
        };
      }
    }

    return { needed: false };
  }

  /**
   * Processes an agent action through the Sentient Loop™
   *
   * @param params Action parameters
   * @returns The result of the action processing
   */
  static async processAgentAction(params: {
    userId: string;
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
  }) {
    // Check if a human checkpoint is needed
    const checkpointCheck = await this.needsHumanCheckpoint({
      userId: params.userId,
      moduleId: params.moduleId,
      agentId: params.agentId,
      actionType: params.actionType,
      confidence: params.confidence,
      impact: params.impact,
      context: params.context
    });

    // If no checkpoint is needed, return immediately
    if (!checkpointCheck.needed) {
      // Emit agent.action.processed event for auto-approved actions
      try {
        await deliverEventToWebhooks({
          type: SentientLoopEventType.AGENT_ACTION_PROCESSED,
          userId: params.userId,
          moduleId: params.moduleId,
          agentId: params.agentId,
          sessionId: params.sessionId,
          data: {
            actionType: params.actionType,
            title: params.title,
            description: params.description,
            payload: params.payload,
            confidence: params.confidence,
            impact: params.impact,
            status: 'APPROVED',
            context: params.context,
            metadata: params.metadata
          }
        });
      } catch (error) {
        console.error('Error emitting agent.action.processed event:', error);
        // Don't throw the error, just log it
      }

      return {
        status: 'APPROVED',
        message: 'Action automatically approved (no checkpoint needed)',
        payload: params.payload
      };
    }

    // Create a checkpoint
    const checkpoint = await this.createCheckpoint({
      userId: params.userId,
      moduleId: params.moduleId,
      agentId: params.agentId,
      sessionId: params.sessionId,
      type: checkpointCheck.type as any,
      title: params.title,
      description: params.description,
      originalPayload: params.payload,
      metadata: {
        ...params.metadata,
        confidence: params.confidence,
        impact: params.impact,
        actionType: params.actionType,
        reason: checkpointCheck.reason
      }
    });

    // Create a memory snapshot for context
    await this.createMemorySnapshot({
      checkpointId: checkpoint.id,
      type: 'CONTEXT',
      content: params.context,
      importance: params.impact === 'CRITICAL' ? 5 :
                 params.impact === 'HIGH' ? 4 :
                 params.impact === 'MEDIUM' ? 3 : 2
    });

    // For high impact or critical actions, create an escalation
    if (params.impact === 'HIGH' || params.impact === 'CRITICAL') {
      await this.createEscalation({
        checkpointId: checkpoint.id,
        level: params.impact,
        reason: `High impact ${params.actionType} action requires review`,
        metadata: {
          confidence: params.confidence,
          actionType: params.actionType
        }
      });
    }

    // Emit agent.action.processed event for pending actions
    try {
      await deliverEventToWebhooks({
        type: SentientLoopEventType.AGENT_ACTION_PROCESSED,
        userId: params.userId,
        moduleId: params.moduleId,
        agentId: params.agentId,
        sessionId: params.sessionId,
        traceId: checkpoint.traceId,
        data: {
          actionId: crypto.randomUUID(),
          checkpointId: checkpoint.id,
          actionType: params.actionType,
          title: params.title,
          description: params.description,
          payload: params.payload,
          confidence: params.confidence,
          impact: params.impact,
          status: 'PENDING',
          context: params.context,
          metadata: params.metadata
        }
      });
    } catch (error) {
      console.error('Error emitting agent.action.processed event:', error);
      // Don't throw the error, just log it
    }

    return {
      status: 'PENDING',
      message: 'Action requires human approval',
      checkpointId: checkpoint.id,
      reason: checkpointCheck.reason
    };
  }
}

export {
  SentientCheckpointService,
  SentientMemoryService,
  SentientEscalationService,
  SentientDecisionTraceService,
  SentientLoopConfigService
};

export { LoopPerformanceService } from './loopPerformanceService';