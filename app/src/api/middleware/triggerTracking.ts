/**
 * Trigger Tracking Middleware
 * 
 * This middleware tracks agent triggers and execution flow.
 * It can be used to wrap agent execution functions to track
 * how they are triggered and their execution flow.
 */

import { TriggerTrackingService } from '../../shared/services/triggerTrackingService';
import { TriggerSourceType } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

/**
 * Interface for trigger tracking options
 */
export interface TriggerTrackingOptions {
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
 * Middleware to track agent triggers
 * 
 * @param options Trigger tracking options
 * @returns A middleware function that tracks agent triggers
 */
export const withTriggerTracking = (options: TriggerTrackingOptions) => {
  return async <T, U>(handler: (args: T, context: any) => Promise<U>) => {
    return async (args: T, context: any): Promise<U> => {
      // Record the trigger
      const trigger = await TriggerTrackingService.recordTrigger({
        sourceId: options.sourceId,
        sourceType: options.sourceType,
        agentId: options.agentId,
        workflowId: options.workflowId,
        userId: options.userId || context?.user?.id,
        sessionId: options.sessionId,
        originatingEventId: options.originatingEventId,
        payload: options.payload || args,
        metadata: options.metadata,
        traceId: options.traceId || uuidv4(),
        spanId: options.spanId || uuidv4(),
        parentSpanId: options.parentSpanId,
        tags: options.tags || [],
      });

      // Update the trigger status to PROCESSING
      await TriggerTrackingService.updateTrigger({
        id: trigger.id,
        status: 'PROCESSING',
      });

      try {
        // Execute the handler
        const startTime = Date.now();
        const result = await handler(args, {
          ...context,
          trigger: {
            id: trigger.id,
            traceId: trigger.traceId,
            spanId: trigger.spanId,
          },
        });

        // Calculate duration
        const duration = Date.now() - startTime;

        // Update the trigger status to COMPLETED
        await TriggerTrackingService.updateTrigger({
          id: trigger.id,
          status: 'COMPLETED',
          executionId: result?.executionId,
          completedAt: new Date(),
          duration,
        });

        return result;
      } catch (error) {
        // Update the trigger status to FAILED
        await TriggerTrackingService.updateTrigger({
          id: trigger.id,
          status: 'FAILED',
          error: error.message || 'Unknown error',
          completedAt: new Date(),
        });

        throw error;
      }
    };
  };
};

/**
 * Track a step in the execution flow
 * 
 * @param triggerId The ID of the trigger
 * @param executionId The ID of the execution
 * @param stepNumber The step number
 * @param stepType The step type
 * @param stepId The step ID (optional)
 * @param stepName The step name (optional)
 * @param input The input to the step (optional)
 * @param metadata Additional metadata (optional)
 * @returns A function that tracks the execution of a step
 */
export const trackExecutionStep = (
  triggerId: string,
  executionId: string,
  stepNumber: number,
  stepType: string,
  stepId?: string,
  stepName?: string,
  input?: Record<string, any>,
  metadata?: Record<string, any>
) => {
  return async <T>(handler: () => Promise<T>): Promise<T> => {
    // Record the execution step
    const step = await TriggerTrackingService.recordExecutionStep({
      triggerId,
      executionId,
      stepNumber,
      stepType,
      stepId,
      stepName,
      input,
      metadata,
    });

    try {
      // Update the step status to RUNNING
      await TriggerTrackingService.updateExecutionStep({
        id: step.id,
        status: 'RUNNING',
      });

      // Execute the handler
      const startTime = Date.now();
      const result = await handler();

      // Calculate duration
      const duration = Date.now() - startTime;

      // Update the step status to COMPLETED
      await TriggerTrackingService.updateExecutionStep({
        id: step.id,
        status: 'COMPLETED',
        output: result,
        completedAt: new Date(),
        duration,
      });

      return result;
    } catch (error) {
      // Update the step status to FAILED
      await TriggerTrackingService.updateExecutionStep({
        id: step.id,
        status: 'FAILED',
        error: error.message || 'Unknown error',
        completedAt: new Date(),
      });

      throw error;
    }
  };
};
