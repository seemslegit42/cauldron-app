/**
 * LangGraph Operations
 *
 * This file provides API operations for executing LangGraph workflows.
 */

import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import { z } from 'zod';
import { ensureArgsSchemaOrThrowHttpError } from '@src/server/validation';
import { executeThreatWorkflow } from '../langGraph/threatWorkflow';
import { requirePermission } from '@src/api/middleware/rbac';
import { LoggingService } from '@src/shared/services/logging';
import {
  getLangGraphState,
  getLangGraphStatesForWorkflow,
  getLangGraphStatesForUser,
  getWorkflowExecution,
  getWorkflowExecutions,
  getWorkflowExecutionsForUser,
} from '../services/langGraphService';

// Schema for executing a threat workflow
const executeThreatWorkflowSchema = z.object({
  input_threat: z.string().min(1, 'Input threat is required'),
  project_name: z.string().min(1, 'Project name is required'),
  workflowId: z.string().optional(),
});

/**
 * Executes a threat research and drafting workflow
 */
export const executeThreatResearchWorkflow = async (args: unknown, context: any) => {
  // Validate arguments
  const validatedArgs = ensureArgsSchemaOrThrowHttpError(executeThreatWorkflowSchema, args);

  // Apply RBAC middleware - require 'forgeflow:execute' permission
  const user = await requirePermission({
    resource: 'forgeflow',
    action: 'execute',
    adminOverride: true,
    auditRejection: true,
  })(context);

  try {
    // Create or get a workflow if not provided
    let workflowId = validatedArgs.workflowId;
    if (!workflowId) {
      // Create a new workflow
      const workflow = await prisma.workflow.create({
        data: {
          userId: user.id,
          name: `Threat Analysis: ${validatedArgs.project_name}`,
          description: `Threat analysis workflow for ${validatedArgs.project_name}`,
          steps: {},
          triggers: {},
          isActive: true,
          isLangGraph: true,
        },
      });
      workflowId = workflow.id;
    }

    // Create a workflow execution
    const workflowExecution = await prisma.workflowExecution.create({
      data: {
        workflowId,
        userId: user.id,
        status: 'running',
        isLangGraph: true,
        results: {},
      },
    });

    // Log the operation start
    LoggingService.info({
      message: 'Executing threat research workflow',
      userId: user.id,
      module: 'forgeflow',
      category: 'LANGGRAPH_EXECUTION',
      metadata: {
        input_threat: validatedArgs.input_threat,
        project_name: validatedArgs.project_name,
        workflowId,
        executionId: workflowExecution.id,
      },
    });

    // Execute the workflow
    const result = await executeThreatWorkflow(
      validatedArgs.input_threat,
      validatedArgs.project_name,
      user.id,
      workflowId,
      workflowExecution.id
    );

    // Update the workflow execution
    await prisma.workflowExecution.update({
      where: { id: workflowExecution.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        results: result,
      },
    });

    // Log the operation completion
    LoggingService.info({
      message: 'Threat research workflow completed',
      userId: user.id,
      module: 'forgeflow',
      category: 'LANGGRAPH_EXECUTION',
      metadata: {
        project_name: validatedArgs.project_name,
        workflowId,
        executionId: workflowExecution.id,
        has_research: !!result.research_result,
        has_draft: !!result.draft_summary,
      },
    });

    return {
      ...result,
      workflowId,
      executionId: workflowExecution.id,
    };
  } catch (error: any) {
    // Log the operation failure
    LoggingService.error({
      message: 'Error executing threat research workflow',
      userId: user.id,
      module: 'forgeflow',
      category: 'LANGGRAPH_EXECUTION',
      error,
      metadata: {
        input_threat: validatedArgs.input_threat,
        project_name: validatedArgs.project_name,
        workflowId: validatedArgs.workflowId,
      },
    });

    console.error('Error executing threat research workflow:', error);
    throw new HttpError(500, 'Failed to execute threat research workflow: ' + error.message);
  }
};

/**
 * Gets a workflow execution by ID
 */
export const getWorkflowExecutionById = async (args: unknown, context: any) => {
  // Validate arguments
  const schema = z.object({
    executionId: z.string().min(1, 'Execution ID is required'),
  });

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(schema, args);

  // Apply RBAC middleware - require 'forgeflow:read' permission
  const user = await requirePermission({
    resource: 'forgeflow',
    action: 'read',
    adminOverride: true,
    auditRejection: true,
  })(context);

  try {
    // Get the workflow execution
    const execution = await getWorkflowExecution(validatedArgs.executionId);

    // Check if the user has access to this execution
    if (execution.userId !== user.id && !user.isAdmin) {
      throw new HttpError(403, 'You do not have permission to access this workflow execution');
    }

    return execution;
  } catch (error: any) {
    console.error('Error getting workflow execution:', error);
    throw new HttpError(500, 'Failed to get workflow execution: ' + error.message);
  }
};

/**
 * Gets all workflow executions for a workflow
 */
export const getWorkflowExecutionsForWorkflow = async (args: unknown, context: any) => {
  // Validate arguments
  const schema = z.object({
    workflowId: z.string().min(1, 'Workflow ID is required'),
  });

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(schema, args);

  // Apply RBAC middleware - require 'forgeflow:read' permission
  const user = await requirePermission({
    resource: 'forgeflow',
    action: 'read',
    adminOverride: true,
    auditRejection: true,
  })(context);

  try {
    // Get the workflow to check ownership
    const workflow = await prisma.workflow.findUnique({
      where: { id: validatedArgs.workflowId },
    });

    if (!workflow) {
      throw new HttpError(404, 'Workflow not found');
    }

    // Check if the user has access to this workflow
    if (workflow.userId !== user.id && !user.isAdmin) {
      throw new HttpError(403, 'You do not have permission to access this workflow');
    }

    // Get the workflow executions
    const executions = await getWorkflowExecutions(validatedArgs.workflowId);

    return executions;
  } catch (error: any) {
    console.error('Error getting workflow executions:', error);
    throw new HttpError(500, 'Failed to get workflow executions: ' + error.message);
  }
};

/**
 * Gets all workflow executions for the current user
 */
export const getUserWorkflowExecutions = async (args: unknown, context: any) => {
  // Validate arguments
  const schema = z.object({
    limit: z.number().optional().default(10),
  });

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(schema, args);

  // Apply RBAC middleware - require 'forgeflow:read' permission
  const user = await requirePermission({
    resource: 'forgeflow',
    action: 'read',
    adminOverride: true,
    auditRejection: true,
  })(context);

  try {
    // Get the workflow executions
    const executions = await getWorkflowExecutionsForUser(user.id, validatedArgs.limit);

    return executions;
  } catch (error: any) {
    console.error('Error getting user workflow executions:', error);
    throw new HttpError(500, 'Failed to get user workflow executions: ' + error.message);
  }
};
