/**
 * Memory-Aware Workflow Operations
 * 
 * This file provides API operations for executing memory-aware workflows.
 */

import { HttpError } from 'wasp/server';
import { z } from 'zod';
import { ensureArgsSchemaOrThrowHttpError } from '@src/server/validation';
import { executeMemoryAwareWorkflow } from '../langGraph/workflows/memoryAwareWorkflow';
import { requirePermission } from '@src/api/middleware/rbac';
import { LoggingService } from '@src/shared/services/logging';

// Schema for executing a memory-aware workflow
const executeMemoryAwareWorkflowSchema = z.object({
  query: z.string().min(1).max(1000),
  context: z.any().optional(),
  agentId: z.string().optional(),
  sessionId: z.string().optional(),
});

/**
 * Execute a memory-aware workflow
 * 
 * @param args The arguments
 * @param context The context
 * @returns The execution result
 */
export const executeMemoryAwareWorkflowOperation = async (args: any, context: any) => {
  try {
    // Validate the arguments
    ensureArgsSchemaOrThrowHttpError(args, executeMemoryAwareWorkflowSchema);
    
    // Check permissions
    requirePermission(context, 'workflow:execute');
    
    // Get the user ID
    const userId = context.user.id;
    
    if (!userId) {
      throw new HttpError(401, 'Unauthorized');
    }
    
    // Execute the workflow
    const result = await executeMemoryAwareWorkflow({
      userId,
      agentId: args.agentId,
      sessionId: args.sessionId,
      query: args.query,
      context: args.context,
    });
    
    // Return the result
    return {
      graphStateId: result.graphStateId,
      status: result.status,
      response: result.finalState.response,
      relevantMemories: result.finalState.relevantMemories,
      storedMemoryId: result.finalState.storedMemoryId,
      duration: result.duration,
      error: result.error,
    };
  } catch (error) {
    // Log the error
    LoggingService.error({
      message: 'Error executing memory-aware workflow',
      module: 'forgeflow',
      category: 'MEMORY_AWARE_WORKFLOW_API',
      error,
      metadata: {
        userId: context.user?.id,
        query: args.query,
      }
    });
    
    // Throw an HTTP error
    if (error instanceof HttpError) {
      throw error;
    }
    
    throw new HttpError(500, error.message || 'Internal server error');
  }
};

// Schema for getting a memory-aware workflow execution
const getMemoryAwareWorkflowExecutionSchema = z.object({
  graphStateId: z.string().min(1),
});

/**
 * Get a memory-aware workflow execution
 * 
 * @param args The arguments
 * @param context The context
 * @returns The execution
 */
export const getMemoryAwareWorkflowExecution = async (args: any, context: any) => {
  try {
    // Validate the arguments
    ensureArgsSchemaOrThrowHttpError(args, getMemoryAwareWorkflowExecutionSchema);
    
    // Check permissions
    requirePermission(context, 'workflow:view');
    
    // Get the user ID
    const userId = context.user.id;
    
    if (!userId) {
      throw new HttpError(401, 'Unauthorized');
    }
    
    // Get the graph state
    const graphState = await context.entities.EnhancedLangGraphState.findUnique({
      where: {
        id: args.graphStateId,
        userId,
      },
      include: {
        nodes: true,
        edges: true,
        nodeExecutions: {
          orderBy: {
            startedAt: 'asc',
          },
        },
      },
    });
    
    if (!graphState) {
      throw new HttpError(404, 'Workflow execution not found');
    }
    
    // Return the graph state
    return graphState;
  } catch (error) {
    // Log the error
    LoggingService.error({
      message: 'Error getting memory-aware workflow execution',
      module: 'forgeflow',
      category: 'MEMORY_AWARE_WORKFLOW_API',
      error,
      metadata: {
        userId: context.user?.id,
        graphStateId: args.graphStateId,
      }
    });
    
    // Throw an HTTP error
    if (error instanceof HttpError) {
      throw error;
    }
    
    throw new HttpError(500, error.message || 'Internal server error');
  }
};
