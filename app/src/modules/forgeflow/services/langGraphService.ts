/**
 * LangGraph Service
 * 
 * This file provides services for working with LangGraph workflows.
 */

import { prisma } from 'wasp/server';
import { LoggingService } from '@src/shared/services/logging';

/**
 * Gets a LangGraph state by ID
 */
export async function getLangGraphState(stateId: string) {
  try {
    const state = await prisma.langGraphState.findUnique({
      where: { id: stateId },
      include: {
        nodes: true,
        edges: true,
        nodeExecutions: {
          orderBy: { startedAt: 'asc' },
        },
      },
    });
    
    if (!state) {
      throw new Error(`LangGraph state not found: ${stateId}`);
    }
    
    return state;
  } catch (error) {
    LoggingService.error({
      message: 'Error getting LangGraph state',
      module: 'forgeflow',
      category: 'LANGGRAPH_SERVICE',
      error,
      metadata: {
        stateId,
      },
    });
    
    throw error;
  }
}

/**
 * Gets all LangGraph states for a workflow
 */
export async function getLangGraphStatesForWorkflow(workflowId: string) {
  try {
    const states = await prisma.langGraphState.findMany({
      where: { workflowId },
      orderBy: { createdAt: 'desc' },
      include: {
        workflowExecution: true,
      },
    });
    
    return states;
  } catch (error) {
    LoggingService.error({
      message: 'Error getting LangGraph states for workflow',
      module: 'forgeflow',
      category: 'LANGGRAPH_SERVICE',
      error,
      metadata: {
        workflowId,
      },
    });
    
    throw error;
  }
}

/**
 * Gets all LangGraph states for a user
 */
export async function getLangGraphStatesForUser(userId: string, limit: number = 10) {
  try {
    const states = await prisma.langGraphState.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        workflow: true,
        workflowExecution: true,
      },
    });
    
    return states;
  } catch (error) {
    LoggingService.error({
      message: 'Error getting LangGraph states for user',
      module: 'forgeflow',
      category: 'LANGGRAPH_SERVICE',
      error,
      metadata: {
        userId,
        limit,
      },
    });
    
    throw error;
  }
}

/**
 * Gets a workflow execution by ID
 */
export async function getWorkflowExecution(executionId: string) {
  try {
    const execution = await prisma.workflowExecution.findUnique({
      where: { id: executionId },
      include: {
        workflow: true,
        langGraphState: {
          include: {
            nodes: true,
            edges: true,
            nodeExecutions: {
              orderBy: { startedAt: 'asc' },
            },
          },
        },
      },
    });
    
    if (!execution) {
      throw new Error(`Workflow execution not found: ${executionId}`);
    }
    
    return execution;
  } catch (error) {
    LoggingService.error({
      message: 'Error getting workflow execution',
      module: 'forgeflow',
      category: 'LANGGRAPH_SERVICE',
      error,
      metadata: {
        executionId,
      },
    });
    
    throw error;
  }
}

/**
 * Gets all workflow executions for a workflow
 */
export async function getWorkflowExecutions(workflowId: string) {
  try {
    const executions = await prisma.workflowExecution.findMany({
      where: { 
        workflowId,
        isLangGraph: true,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        langGraphState: true,
      },
    });
    
    return executions;
  } catch (error) {
    LoggingService.error({
      message: 'Error getting workflow executions',
      module: 'forgeflow',
      category: 'LANGGRAPH_SERVICE',
      error,
      metadata: {
        workflowId,
      },
    });
    
    throw error;
  }
}

/**
 * Gets all workflow executions for a user
 */
export async function getWorkflowExecutionsForUser(userId: string, limit: number = 10) {
  try {
    const executions = await prisma.workflowExecution.findMany({
      where: { 
        userId,
        isLangGraph: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        workflow: true,
        langGraphState: true,
      },
    });
    
    return executions;
  } catch (error) {
    LoggingService.error({
      message: 'Error getting workflow executions for user',
      module: 'forgeflow',
      category: 'LANGGRAPH_SERVICE',
      error,
      metadata: {
        userId,
        limit,
      },
    });
    
    throw error;
  }
}
