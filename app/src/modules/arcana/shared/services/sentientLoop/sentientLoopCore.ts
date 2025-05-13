import { LoggingService } from '../logging';
import { SentientCheckpointService } from './sentientCheckpointService';
import { SentientMemoryService } from './sentientMemoryService';
import { SentientEscalationService } from './sentientEscalationService';
import { SentientDecisionTraceService } from './sentientDecisionTraceService';
import { SentientLoopConfigService } from './sentientLoopConfigService';
import { prisma } from 'wasp/server';

/**
 * Core service for the Sentient Loop™ system
 * 
 * The Sentient Loop™ is an always-on cognitive feedback system where human decision-making
 * is at the core of all AI outputs. It includes:
 * 
 * - Human-in-the-loop (HITL) checkpoints
 * - Agent accountability layers
 * - Memory snapshots
 * - Escalation thresholds
 * - Decision traceability
 */
export class SentientLoopCore {
  /**
   * Processes an agent action through the Sentient Loop™
   * 
   * This is the main entry point for the Sentient Loop™ system. It evaluates
   * the action and determines whether it needs human approval based on
   * confidence, impact, and configuration settings.
   * 
   * @param params Action parameters
   * @returns Result of the action processing
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
    try {
      const { 
        userId, 
        moduleId, 
        agentId, 
        sessionId, 
        actionType, 
        title, 
        description, 
        payload, 
        confidence, 
        impact, 
        context, 
        metadata 
      } = params;

      // Log the operation
      LoggingService.info({
        message: `Processing agent action through Sentient Loop: ${actionType}`,
        userId,
        module: 'arcana',
        category: 'SENTIENT_LOOP',
        metadata: { moduleId, actionType, impact, confidence }
      });

      // Get the Sentient Loop configuration for this user and module
      const config = await SentientLoopConfigService.getLoopConfig(userId, moduleId);

      // If no configuration exists, create a default one
      const loopConfig = config || await SentientLoopConfigService.createDefaultConfig(userId, moduleId);

      // Determine if this action requires human approval based on confidence, impact, and configuration
      const requiresApproval = this.evaluateApprovalRequirement(
        confidence, 
        impact, 
        actionType, 
        loopConfig.checkpointThresholds
      );

      // If the action doesn't require approval, return success
      if (!requiresApproval) {
        // Record the auto-approved action for audit purposes
        await SentientDecisionTraceService.recordDecisionTrace({
          checkpointId: 'auto-approved', // Special value for auto-approved actions
          decisionMaker: 'system',
          decisionType: 'system',
          reasoning: `Auto-approved based on confidence (${confidence}) and impact (${impact})`,
          factors: {
            confidence,
            impact,
            actionType,
            thresholds: loopConfig.checkpointThresholds
          },
          metadata: {
            userId,
            moduleId,
            agentId,
            sessionId,
            actionType,
            title,
            description,
            payload: JSON.stringify(payload).substring(0, 1000) // Truncate for logging
          }
        });

        return {
          status: 'APPROVED',
          message: 'Action was automatically approved based on confidence and impact thresholds',
          requiresHumanApproval: false,
          checkpointId: null,
          payload
        };
      }

      // Create a checkpoint for human approval
      const checkpoint = await SentientCheckpointService.createCheckpoint({
        userId,
        moduleId,
        agentId,
        sessionId,
        type: 'DECISION_REQUIRED',
        title,
        description,
        originalPayload: payload,
        metadata: {
          ...metadata,
          actionType,
          confidence,
          impact,
          context: JSON.stringify(context).substring(0, 1000) // Truncate for logging
        }
      });

      // Create a memory snapshot with the context
      await SentientMemoryService.createMemorySnapshot({
        checkpointId: checkpoint.id,
        type: 'CONTEXT',
        content: context,
        metadata: {
          actionType,
          confidence,
          impact
        }
      });

      // If the impact is CRITICAL, create an escalation
      if (impact === 'CRITICAL') {
        await SentientEscalationService.createEscalation({
          checkpointId: checkpoint.id,
          level: 'CRITICAL',
          reason: `Critical impact action requires immediate attention: ${title}`,
          metadata: {
            actionType,
            confidence
          }
        });
      }

      return {
        status: 'PENDING',
        message: 'Action requires human approval',
        requiresHumanApproval: true,
        checkpointId: checkpoint.id,
        payload
      };
    } catch (error) {
      LoggingService.error({
        message: 'Error processing agent action through Sentient Loop',
        userId: params.userId,
        module: 'arcana',
        category: 'SENTIENT_LOOP',
        error,
        metadata: {
          moduleId: params.moduleId,
          actionType: params.actionType,
          impact: params.impact,
          confidence: params.confidence
        }
      });
      throw error;
    }
  }

  /**
   * Evaluates whether an action requires human approval
   * 
   * @param confidence Confidence level of the action (0-1)
   * @param impact Impact level of the action
   * @param actionType Type of action
   * @param thresholds Configuration thresholds
   * @returns Whether the action requires human approval
   */
  private static evaluateApprovalRequirement(
    confidence: number,
    impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    actionType: string,
    thresholds: any
  ): boolean {
    // Critical impact always requires approval
    if (impact === 'CRITICAL') {
      return true;
    }

    // Check if this action type is in the always-approve list
    if (thresholds.alwaysApproveActions && 
        Array.isArray(thresholds.alwaysApproveActions) && 
        thresholds.alwaysApproveActions.includes(actionType)) {
      return true;
    }

    // Check if this action type is in the never-approve list
    if (thresholds.neverApproveActions && 
        Array.isArray(thresholds.neverApproveActions) && 
        thresholds.neverApproveActions.includes(actionType)) {
      return false;
    }

    // Check confidence thresholds based on impact
    const impactThresholds = {
      LOW: thresholds.lowImpactConfidenceThreshold || 0.7,
      MEDIUM: thresholds.mediumImpactConfidenceThreshold || 0.8,
      HIGH: thresholds.highImpactConfidenceThreshold || 0.9,
      CRITICAL: 1.0 // Critical always requires approval
    };

    // If confidence is below the threshold for this impact level, require approval
    return confidence < impactThresholds[impact];
  }

  /**
   * Waits for a checkpoint to be resolved
   * 
   * This method polls the database for changes to the checkpoint status
   * and resolves when the checkpoint is no longer pending.
   * 
   * @param checkpointId The checkpoint ID
   * @param timeoutMs Timeout in milliseconds (default: 5 minutes)
   * @returns The resolved checkpoint
   */
  static async waitForCheckpointResolution(checkpointId: string, timeoutMs: number = 5 * 60 * 1000): Promise<any> {
    const startTime = Date.now();
    const pollIntervalMs = 2000; // Poll every 2 seconds

    while (Date.now() - startTime < timeoutMs) {
      // Get the current checkpoint status
      const checkpoint = await prisma.sentientCheckpoint.findUnique({
        where: { id: checkpointId },
        include: {
          decisionTraces: true
        }
      });

      // If the checkpoint doesn't exist, throw an error
      if (!checkpoint) {
        throw new Error(`Checkpoint ${checkpointId} not found`);
      }

      // If the checkpoint is no longer pending, return it
      if (checkpoint.status !== 'PENDING') {
        return checkpoint;
      }

      // Wait for the poll interval
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }

    // If we reach here, the timeout was exceeded
    throw new Error(`Timeout waiting for checkpoint ${checkpointId} to be resolved`);
  }

  /**
   * Creates a human-in-the-loop checkpoint
   * 
   * @param params Checkpoint parameters
   * @returns The created checkpoint
   */
  static async createHITLCheckpoint(params: {
    userId: string;
    moduleId: string;
    agentId?: string;
    sessionId?: string;
    title: string;
    description: string;
    payload: any;
    checkpointType: 'DECISION_REQUIRED' | 'CONFIRMATION_REQUIRED' | 'INFORMATION_REQUIRED' | 'VALIDATION_REQUIRED' | 'AUDIT_REQUIRED';
    context?: any;
    metadata?: any;
    expiresAt?: Date;
  }) {
    try {
      const { 
        userId, 
        moduleId, 
        agentId, 
        sessionId, 
        title, 
        description, 
        payload, 
        checkpointType, 
        context, 
        metadata, 
        expiresAt 
      } = params;

      // Log the operation
      LoggingService.info({
        message: `Creating HITL checkpoint: ${title}`,
        userId,
        module: 'arcana',
        category: 'SENTIENT_LOOP',
        metadata: { moduleId, checkpointType }
      });

      // Create the checkpoint
      const checkpoint = await SentientCheckpointService.createCheckpoint({
        userId,
        moduleId,
        agentId,
        sessionId,
        type: checkpointType,
        title,
        description,
        originalPayload: payload,
        metadata,
        expiresAt
      });

      // If context is provided, create a memory snapshot
      if (context) {
        await SentientMemoryService.createMemorySnapshot({
          checkpointId: checkpoint.id,
          type: 'CONTEXT',
          content: context,
          metadata: {
            checkpointType
          }
        });
      }

      return checkpoint;
    } catch (error) {
      LoggingService.error({
        message: 'Error creating HITL checkpoint',
        userId: params.userId,
        module: 'arcana',
        category: 'SENTIENT_LOOP',
        error,
        metadata: {
          moduleId: params.moduleId,
          checkpointType: params.checkpointType
        }
      });
      throw error;
    }
  }

  /**
   * Records an agent accountability event
   * 
   * @param params Event parameters
   * @returns The created accountability record
   */
  static async recordAgentAccountability(params: {
    userId: string;
    moduleId: string;
    agentId: string;
    actionType: string;
    actionDescription: string;
    actionResult: any;
    confidence: number;
    reasoning: string;
    metadata?: any;
  }) {
    try {
      const { 
        userId, 
        moduleId, 
        agentId, 
        actionType, 
        actionDescription, 
        actionResult, 
        confidence, 
        reasoning, 
        metadata 
      } = params;

      // Log the operation
      LoggingService.info({
        message: `Recording agent accountability: ${actionType}`,
        userId,
        module: 'arcana',
        category: 'SENTIENT_LOOP',
        metadata: { moduleId, agentId, actionType }
      });

      // Create an agent log entry
      const agentLog = await prisma.agentLog.create({
        data: {
          userId,
          agentId,
          module: moduleId,
          action: actionType,
          description: actionDescription,
          result: actionResult,
          confidence,
          reasoning,
          metadata: metadata || {}
        }
      });

      return agentLog;
    } catch (error) {
      LoggingService.error({
        message: 'Error recording agent accountability',
        userId: params.userId,
        module: 'arcana',
        category: 'SENTIENT_LOOP',
        error,
        metadata: {
          moduleId: params.moduleId,
          agentId: params.agentId,
          actionType: params.actionType
        }
      });
      throw error;
    }
  }

  /**
   * Takes a memory snapshot of the current system state
   * 
   * @param params Snapshot parameters
   * @returns The created memory snapshot
   */
  static async takeMemorySnapshot(params: {
    checkpointId: string;
    memoryType: 'DECISION' | 'FEEDBACK' | 'CONTEXT' | 'ESCALATION' | 'AUDIT' | 'SYSTEM';
    content: any;
    importance?: number;
    metadata?: any;
    expiresAt?: Date;
  }) {
    try {
      const { checkpointId, memoryType, content, importance, metadata, expiresAt } = params;

      // Log the operation
      LoggingService.info({
        message: `Taking memory snapshot: ${memoryType}`,
        module: 'arcana',
        category: 'SENTIENT_LOOP',
        metadata: { checkpointId, memoryType }
      });

      // Create the memory snapshot
      const snapshot = await SentientMemoryService.createMemorySnapshot({
        checkpointId,
        type: memoryType,
        content,
        importance,
        metadata,
        expiresAt
      });

      return snapshot;
    } catch (error) {
      LoggingService.error({
        message: 'Error taking memory snapshot',
        module: 'arcana',
        category: 'SENTIENT_LOOP',
        error,
        metadata: {
          checkpointId: params.checkpointId,
          memoryType: params.memoryType
        }
      });
      throw error;
    }
  }

  /**
   * Escalates an issue based on predefined thresholds
   * 
   * @param params Escalation parameters
   * @returns The created escalation
   */
  static async escalateIssue(params: {
    checkpointId: string;
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    reason: string;
    metadata?: any;
  }) {
    try {
      const { checkpointId, level, reason, metadata } = params;

      // Log the operation
      LoggingService.info({
        message: `Escalating issue: ${level} level`,
        module: 'arcana',
        category: 'SENTIENT_LOOP',
        metadata: { checkpointId, level, reason }
      });

      // Create the escalation
      const escalation = await SentientEscalationService.createEscalation({
        checkpointId,
        level,
        reason,
        metadata
      });

      return escalation;
    } catch (error) {
      LoggingService.error({
        message: 'Error escalating issue',
        module: 'arcana',
        category: 'SENTIENT_LOOP',
        error,
        metadata: {
          checkpointId: params.checkpointId,
          level: params.level,
          reason: params.reason
        }
      });
      throw error;
    }
  }

  /**
   * Records a decision trace for audit and traceability
   * 
   * @param params Trace parameters
   * @returns The created decision trace
   */
  static async recordDecisionTrace(params: {
    checkpointId: string;
    decisionMaker: string;
    decisionType: 'human' | 'agent' | 'system';
    reasoning?: string;
    factors?: any;
    alternatives?: any;
    metadata?: any;
  }) {
    try {
      const { checkpointId, decisionMaker, decisionType, reasoning, factors, alternatives, metadata } = params;

      // Log the operation
      LoggingService.info({
        message: `Recording decision trace: ${decisionType}`,
        module: 'arcana',
        category: 'SENTIENT_LOOP',
        metadata: { checkpointId, decisionMaker, decisionType }
      });

      // Create the decision trace
      const trace = await SentientDecisionTraceService.recordDecisionTrace({
        checkpointId,
        decisionMaker,
        decisionType,
        reasoning,
        factors,
        alternatives,
        metadata
      });

      return trace;
    } catch (error) {
      LoggingService.error({
        message: 'Error recording decision trace',
        module: 'arcana',
        category: 'SENTIENT_LOOP',
        error,
        metadata: {
          checkpointId: params.checkpointId,
          decisionMaker: params.decisionMaker,
          decisionType: params.decisionType
        }
      });
      throw error;
    }
  }

  /**
   * Gets the Sentient Loop™ configuration for a user and module
   * 
   * @param userId The user ID
   * @param moduleId The module ID
   * @returns The configuration
   */
  static async getLoopConfig(userId: string, moduleId?: string) {
    return SentientLoopConfigService.getLoopConfig(userId, moduleId);
  }

  /**
   * Updates the Sentient Loop™ configuration
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
    return SentientLoopConfigService.updateLoopConfig(params);
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
   * Resolves a checkpoint
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
  }) {
    return SentientCheckpointService.resolveCheckpoint(params);
  }
}

// Export the service as the default SentientLoopService for backward compatibility
export const SentientLoopService = SentientLoopCore;