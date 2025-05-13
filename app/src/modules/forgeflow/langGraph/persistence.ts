/**
 * LangGraph Persistence Service
 * 
 * This file provides functionality for persisting LangGraph state to the database.
 */

import { prisma } from 'wasp/server';
import { LoggingService } from '@src/shared/services/logging';
import { v4 as uuidv4 } from 'uuid';

// Types for the persistence service
export interface PersistenceOptions {
  userId?: string;
  workflowId?: string;
  executionId?: string;
  expiresInDays?: number;
}

/**
 * Creates a new LangGraph state in the database
 */
export async function createGraphState(
  graphId: string,
  name: string,
  initialState: any,
  options: PersistenceOptions = {}
): Promise<string> {
  try {
    // Calculate expiration date if provided
    const expiresAt = options.expiresInDays
      ? new Date(Date.now() + options.expiresInDays * 24 * 60 * 60 * 1000)
      : null;
    
    // Create the graph state
    const graphState = await prisma.langGraphState.create({
      data: {
        graphId,
        name,
        state: initialState,
        status: 'active',
        userId: options.userId,
        workflowId: options.workflowId,
        executionId: options.executionId,
        expiresAt,
      },
    });
    
    // Log the creation
    LoggingService.info({
      message: `Created LangGraph state: ${graphState.id}`,
      module: 'forgeflow',
      category: 'LANGGRAPH_PERSISTENCE',
      metadata: {
        graphId,
        name,
        stateId: graphState.id,
        userId: options.userId,
        workflowId: options.workflowId,
        executionId: options.executionId,
      },
    });
    
    return graphState.id;
  } catch (error) {
    // Log the error
    LoggingService.error({
      message: 'Error creating LangGraph state',
      module: 'forgeflow',
      category: 'LANGGRAPH_PERSISTENCE',
      error,
      metadata: {
        graphId,
        name,
        userId: options.userId,
        workflowId: options.workflowId,
        executionId: options.executionId,
      },
    });
    
    throw error;
  }
}

/**
 * Updates an existing LangGraph state in the database
 */
export async function updateGraphState(
  stateId: string,
  state: any,
  status?: string
): Promise<void> {
  try {
    // Update the graph state
    await prisma.langGraphState.update({
      where: { id: stateId },
      data: {
        state,
        status: status || undefined,
        checkpointedAt: new Date(),
        updatedAt: new Date(),
      },
    });
    
    // Log the update
    LoggingService.info({
      message: `Updated LangGraph state: ${stateId}`,
      module: 'forgeflow',
      category: 'LANGGRAPH_PERSISTENCE',
      metadata: {
        stateId,
        status,
      },
    });
  } catch (error) {
    // Log the error
    LoggingService.error({
      message: 'Error updating LangGraph state',
      module: 'forgeflow',
      category: 'LANGGRAPH_PERSISTENCE',
      error,
      metadata: {
        stateId,
        status,
      },
    });
    
    throw error;
  }
}

/**
 * Gets a LangGraph state from the database
 */
export async function getGraphState(stateId: string): Promise<any> {
  try {
    // Get the graph state
    const graphState = await prisma.langGraphState.findUnique({
      where: { id: stateId },
    });
    
    if (!graphState) {
      throw new Error(`LangGraph state not found: ${stateId}`);
    }
    
    // Log the retrieval
    LoggingService.info({
      message: `Retrieved LangGraph state: ${stateId}`,
      module: 'forgeflow',
      category: 'LANGGRAPH_PERSISTENCE',
      metadata: {
        stateId,
        graphId: graphState.graphId,
        status: graphState.status,
      },
    });
    
    return graphState.state;
  } catch (error) {
    // Log the error
    LoggingService.error({
      message: 'Error getting LangGraph state',
      module: 'forgeflow',
      category: 'LANGGRAPH_PERSISTENCE',
      error,
      metadata: {
        stateId,
      },
    });
    
    throw error;
  }
}

/**
 * Records a node execution in the database
 */
export async function recordNodeExecution(
  stateId: string,
  nodeId: string,
  input: any,
  output?: any,
  error?: string
): Promise<string> {
  try {
    // Find or create the node
    let node = await prisma.langGraphNode.findUnique({
      where: {
        graphStateId_nodeId: {
          graphStateId: stateId,
          nodeId,
        },
      },
    });
    
    if (!node) {
      // Create the node if it doesn't exist
      node = await prisma.langGraphNode.create({
        data: {
          graphStateId: stateId,
          nodeId,
          type: 'unknown', // Will be updated later
          config: {},
        },
      });
    }
    
    // Calculate duration if output is provided (execution completed)
    const startedAt = new Date();
    const completedAt = output ? new Date() : null;
    const duration = completedAt ? completedAt.getTime() - startedAt.getTime() : null;
    
    // Create the node execution
    const execution = await prisma.langGraphNodeExecution.create({
      data: {
        graphStateId: stateId,
        nodeId: node.id,
        status: error ? 'failed' : (output ? 'completed' : 'running'),
        input,
        output,
        error,
        startedAt,
        completedAt,
        duration,
      },
    });
    
    // Log the execution
    LoggingService.info({
      message: `Recorded LangGraph node execution: ${execution.id}`,
      module: 'forgeflow',
      category: 'LANGGRAPH_PERSISTENCE',
      metadata: {
        stateId,
        nodeId,
        executionId: execution.id,
        status: execution.status,
        duration,
      },
    });
    
    return execution.id;
  } catch (error) {
    // Log the error
    LoggingService.error({
      message: 'Error recording LangGraph node execution',
      module: 'forgeflow',
      category: 'LANGGRAPH_PERSISTENCE',
      error,
      metadata: {
        stateId,
        nodeId,
      },
    });
    
    throw error;
  }
}

/**
 * Updates a node execution in the database
 */
export async function updateNodeExecution(
  executionId: string,
  output: any,
  error?: string
): Promise<void> {
  try {
    // Calculate completion time and duration
    const completedAt = new Date();
    
    // Get the execution to calculate duration
    const execution = await prisma.langGraphNodeExecution.findUnique({
      where: { id: executionId },
    });
    
    if (!execution) {
      throw new Error(`Node execution not found: ${executionId}`);
    }
    
    const duration = completedAt.getTime() - execution.startedAt.getTime();
    
    // Update the execution
    await prisma.langGraphNodeExecution.update({
      where: { id: executionId },
      data: {
        status: error ? 'failed' : 'completed',
        output,
        error,
        completedAt,
        duration,
      },
    });
    
    // Log the update
    LoggingService.info({
      message: `Updated LangGraph node execution: ${executionId}`,
      module: 'forgeflow',
      category: 'LANGGRAPH_PERSISTENCE',
      metadata: {
        executionId,
        status: error ? 'failed' : 'completed',
        duration,
      },
    });
  } catch (error) {
    // Log the error
    LoggingService.error({
      message: 'Error updating LangGraph node execution',
      module: 'forgeflow',
      category: 'LANGGRAPH_PERSISTENCE',
      error,
      metadata: {
        executionId,
      },
    });
    
    throw error;
  }
}

/**
 * Creates a checkpointer for a LangGraph
 */
export function createCheckpointer(options: PersistenceOptions = {}) {
  // Generate a unique ID for this graph instance
  const graphId = uuidv4();
  let stateId: string | null = null;
  
  return {
    /**
     * Persists the current state of the graph
     */
    persist: async (name: string, state: any): Promise<void> => {
      try {
        if (!stateId) {
          // Create a new state if one doesn't exist
          stateId = await createGraphState(graphId, name, state, options);
        } else {
          // Update the existing state
          await updateGraphState(stateId, state);
        }
      } catch (error) {
        console.error('Error persisting graph state:', error);
        throw error;
      }
    },
    
    /**
     * Loads the state of the graph
     */
    load: async (id: string): Promise<any> => {
      try {
        stateId = id;
        return await getGraphState(id);
      } catch (error) {
        console.error('Error loading graph state:', error);
        throw error;
      }
    },
    
    /**
     * Gets the ID of the current state
     */
    getStateId: (): string | null => {
      return stateId;
    },
    
    /**
     * Gets the ID of the graph
     */
    getGraphId: (): string => {
      return graphId;
    },
  };
}
