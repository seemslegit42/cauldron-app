/**
 * Trigger Tracking Service
 * 
 * This service tracks how agents are triggered by various sources like
 * scheduled jobs, OSINT scans, webhook events, or user inputs.
 * It provides methods to record trigger events and track execution flow.
 */

import { prisma } from 'wasp/server';
import { TriggerSourceType } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { LoggingService } from './logging';

/**
 * Interface for creating a trigger source
 */
export interface CreateTriggerSourceParams {
  name: string;
  description?: string;
  type: TriggerSourceType;
  moduleId?: string;
  configuration?: Record<string, any>;
  isActive?: boolean;
}

/**
 * Interface for recording a trigger event
 */
export interface RecordTriggerParams {
  sourceId: string;
  sourceType: TriggerSourceType;
  agentId?: string;
  workflowId?: string;
  userId?: string;
  sessionId?: string;
  originatingEventId?: string;
  payload?: Record<string, any>;
  metadata?: Record<string, any>;
  traceId?: string;
  spanId?: string;
  parentSpanId?: string;
  tags?: string[];
}

/**
 * Interface for recording a trigger execution step
 */
export interface RecordExecutionStepParams {
  triggerId: string;
  executionId: string;
  stepNumber: number;
  stepType: string;
  stepId?: string;
  stepName?: string;
  input?: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * Interface for updating a trigger execution step
 */
export interface UpdateExecutionStepParams {
  id: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  output?: Record<string, any>;
  error?: string;
  completedAt?: Date;
  duration?: number;
}

/**
 * Interface for updating a trigger status
 */
export interface UpdateTriggerParams {
  id: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  executionId?: string;
  error?: string;
  completedAt?: Date;
  duration?: number;
}

/**
 * Trigger Tracking Service
 */
export class TriggerTrackingService {
  /**
   * Create a new trigger source
   */
  static async createTriggerSource(params: CreateTriggerSourceParams) {
    try {
      const source = await prisma.triggerSource.create({
        data: {
          name: params.name,
          description: params.description,
          type: params.type,
          moduleId: params.moduleId,
          configuration: params.configuration || {},
          isActive: params.isActive !== false,
        },
      });

      await LoggingService.logSystemEvent({
        message: `Created trigger source: ${params.name}`,
        level: 'INFO',
        category: 'SYSTEM_EVENT',
        source: 'trigger-tracking',
        tags: ['trigger-source', 'created', params.type],
        metadata: {
          sourceId: source.id,
          sourceName: source.name,
          sourceType: source.type,
        },
      });

      return source;
    } catch (error) {
      console.error('Error creating trigger source:', error);
      throw error;
    }
  }

  /**
   * Record a trigger event
   */
  static async recordTrigger(params: RecordTriggerParams) {
    try {
      const traceId = params.traceId || uuidv4();
      const spanId = params.spanId || uuidv4();

      const trigger = await prisma.agentTrigger.create({
        data: {
          sourceId: params.sourceId,
          sourceType: params.sourceType,
          agentId: params.agentId,
          workflowId: params.workflowId,
          userId: params.userId,
          sessionId: params.sessionId,
          originatingEventId: params.originatingEventId,
          payload: params.payload || {},
          metadata: params.metadata || {},
          traceId,
          spanId,
          parentSpanId: params.parentSpanId,
          tags: params.tags || [],
          status: 'PENDING',
        },
      });

      await LoggingService.logSystemEvent({
        message: `Recorded trigger event from ${params.sourceType}`,
        level: 'INFO',
        category: 'SYSTEM_EVENT',
        source: 'trigger-tracking',
        userId: params.userId,
        agentId: params.agentId,
        sessionId: params.sessionId,
        traceId,
        spanId,
        parentSpanId: params.parentSpanId,
        tags: ['trigger', 'recorded', params.sourceType, ...(params.tags || [])],
        metadata: {
          triggerId: trigger.id,
          sourceId: params.sourceId,
          sourceType: params.sourceType,
          originatingEventId: params.originatingEventId,
        },
      });

      return trigger;
    } catch (error) {
      console.error('Error recording trigger:', error);
      throw error;
    }
  }

  /**
   * Update a trigger with execution details
   */
  static async updateTrigger(params: UpdateTriggerParams) {
    try {
      const trigger = await prisma.agentTrigger.update({
        where: { id: params.id },
        data: {
          status: params.status,
          executionId: params.executionId,
          error: params.error,
          completedAt: params.completedAt || (params.status === 'COMPLETED' || params.status === 'FAILED' ? new Date() : undefined),
          duration: params.duration,
        },
      });

      await LoggingService.logSystemEvent({
        message: `Updated trigger status to ${params.status}`,
        level: params.status === 'FAILED' ? 'ERROR' : 'INFO',
        category: 'SYSTEM_EVENT',
        source: 'trigger-tracking',
        traceId: trigger.traceId || undefined,
        spanId: trigger.spanId || undefined,
        tags: ['trigger', 'updated', params.status],
        metadata: {
          triggerId: trigger.id,
          status: params.status,
          executionId: params.executionId,
          error: params.error,
          duration: params.duration,
        },
      });

      return trigger;
    } catch (error) {
      console.error('Error updating trigger:', error);
      throw error;
    }
  }

  /**
   * Record a step in the execution flow
   */
  static async recordExecutionStep(params: RecordExecutionStepParams) {
    try {
      const step = await prisma.triggerExecutionFlow.create({
        data: {
          triggerId: params.triggerId,
          executionId: params.executionId,
          stepNumber: params.stepNumber,
          stepType: params.stepType,
          stepId: params.stepId,
          stepName: params.stepName,
          input: params.input || {},
          status: 'PENDING',
          metadata: params.metadata || {},
        },
      });

      return step;
    } catch (error) {
      console.error('Error recording execution step:', error);
      throw error;
    }
  }

  /**
   * Update a step in the execution flow
   */
  static async updateExecutionStep(params: UpdateExecutionStepParams) {
    try {
      const step = await prisma.triggerExecutionFlow.update({
        where: { id: params.id },
        data: {
          status: params.status,
          output: params.output,
          error: params.error,
          completedAt: params.completedAt || new Date(),
          duration: params.duration,
        },
      });

      return step;
    } catch (error) {
      console.error('Error updating execution step:', error);
      throw error;
    }
  }

  /**
   * Get trigger details by ID
   */
  static async getTriggerById(id: string) {
    try {
      return await prisma.agentTrigger.findUnique({
        where: { id },
        include: {
          source: true,
          agent: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          workflow: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          execution: true,
          executionFlows: {
            orderBy: {
              stepNumber: 'asc',
            },
          },
        },
      });
    } catch (error) {
      console.error('Error getting trigger by ID:', error);
      throw error;
    }
  }

  /**
   * Get triggers by source type
   */
  static async getTriggersBySourceType(sourceType: TriggerSourceType, limit = 50) {
    try {
      return await prisma.agentTrigger.findMany({
        where: { sourceType },
        orderBy: { timestamp: 'desc' },
        take: limit,
        include: {
          source: true,
          agent: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          workflow: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    } catch (error) {
      console.error('Error getting triggers by source type:', error);
      throw error;
    }
  }
}
