/**
 * Enhanced LangGraph Service
 * 
 * Provides a comprehensive interface for working with the enhanced LangGraph system.
 * Supports graph creation, execution, persistence, and visualization.
 */

import { prisma } from 'wasp/server';
import { 
  LangGraphStateStatus, 
  LangGraphNodeType,
  LangGraphExecutionStatus,
  EnhancedLangGraphState,
  EnhancedLangGraphNode,
  EnhancedLangGraphEdge,
  EnhancedLangGraphNodeExecution,
  GraphDefinition,
  GraphExecutionOptions,
  GraphVisualizationData
} from '../types';
import { LoggingService } from '@src/shared/services/logging';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create a new LangGraph state
 * 
 * @param graphDefinition The graph definition
 * @param options Graph creation options
 * @returns The created graph state
 */
export async function createLangGraphState(
  graphDefinition: GraphDefinition,
  options: {
    userId?: string;
    workflowId?: string;
    executionId?: string;
    expiresInDays?: number;
  } = {}
): Promise<EnhancedLangGraphState> {
  try {
    const { userId, workflowId, executionId, expiresInDays } = options;
    
    // Calculate expiration date if provided
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;
    
    // Create the graph state
    const graphState = await prisma.enhancedLangGraphState.create({
      data: {
        graphId: graphDefinition.id || uuidv4(),
        name: graphDefinition.name || 'Unnamed Graph',
        status: LangGraphStateStatus.ACTIVE,
        state: graphDefinition.initialState || {},
        metadata: graphDefinition.metadata || {},
        userId,
        workflowId,
        executionId,
        expiresAt,
        nodes: {
          create: graphDefinition.nodes.map(node => ({
            nodeId: node.id,
            type: node.type as LangGraphNodeType,
            config: node.config || {},
            metadata: node.metadata || {},
            position: node.position || { x: 0, y: 0 }
          }))
        }
      },
      include: {
        nodes: true
      }
    });
    
    // Create edges
    if (graphDefinition.edges && graphDefinition.edges.length > 0) {
      // Get the created nodes to reference them in edges
      const nodes = await prisma.enhancedLangGraphNode.findMany({
        where: { graphStateId: graphState.id }
      });
      
      // Create a map of nodeId to node
      const nodeMap = new Map<string, EnhancedLangGraphNode>();
      nodes.forEach(node => nodeMap.set(node.nodeId, node));
      
      // Create edges
      for (const edge of graphDefinition.edges) {
        const sourceNode = nodeMap.get(edge.source);
        const targetNode = nodeMap.get(edge.target);
        
        if (sourceNode && targetNode) {
          await prisma.enhancedLangGraphEdge.create({
            data: {
              graphStateId: graphState.id,
              sourceNodeId: sourceNode.id,
              targetNodeId: targetNode.id,
              condition: edge.condition,
              metadata: edge.metadata || {}
            }
          });
        }
      }
    }
    
    LoggingService.info({
      message: `Created LangGraph state: ${graphState.id}`,
      module: 'forgeflow',
      category: 'LANGGRAPH_SERVICE',
      metadata: {
        graphId: graphState.graphId,
        name: graphState.name,
        stateId: graphState.id,
        userId,
        workflowId,
        executionId
      }
    });
    
    return graphState;
  } catch (error) {
    LoggingService.error({
      message: 'Error creating LangGraph state',
      module: 'forgeflow',
      category: 'LANGGRAPH_SERVICE',
      error,
      metadata: {
        graphId: graphDefinition.id,
        name: graphDefinition.name,
        ...options
      }
    });
    
    throw error;
  }
}

/**
 * Get a LangGraph state by ID
 * 
 * @param stateId The state ID
 * @returns The graph state
 */
export async function getLangGraphState(stateId: string): Promise<EnhancedLangGraphState> {
  try {
    const state = await prisma.enhancedLangGraphState.findUnique({
      where: { id: stateId },
      include: {
        nodes: true,
        edges: true,
        nodeExecutions: {
          orderBy: { startedAt: 'asc' }
        }
      }
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
      metadata: { stateId }
    });
    
    throw error;
  }
}

/**
 * Update a LangGraph state
 * 
 * @param stateId The state ID
 * @param state The new state
 * @param status Optional new status
 */
export async function updateLangGraphState(
  stateId: string,
  state: any,
  status?: LangGraphStateStatus
): Promise<void> {
  try {
    await prisma.enhancedLangGraphState.update({
      where: { id: stateId },
      data: {
        state,
        status: status || undefined,
        checkpointedAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    LoggingService.info({
      message: `Updated LangGraph state: ${stateId}`,
      module: 'forgeflow',
      category: 'LANGGRAPH_SERVICE',
      metadata: {
        stateId,
        status
      }
    });
  } catch (error) {
    LoggingService.error({
      message: 'Error updating LangGraph state',
      module: 'forgeflow',
      category: 'LANGGRAPH_SERVICE',
      error,
      metadata: {
        stateId,
        status
      }
    });
    
    throw error;
  }
}

/**
 * Record a node execution
 * 
 * @param stateId The state ID
 * @param nodeId The node ID
 * @param input The input data
 * @param output Optional output data
 * @param error Optional error message
 * @returns The execution ID
 */
export async function recordNodeExecution(
  stateId: string,
  nodeId: string,
  input: any,
  output?: any,
  error?: string
): Promise<string> {
  try {
    // Find the node
    const node = await prisma.enhancedLangGraphNode.findFirst({
      where: {
        graphStateId: stateId,
        nodeId
      }
    });
    
    if (!node) {
      throw new Error(`Node not found: ${nodeId} in graph state: ${stateId}`);
    }
    
    // Calculate duration if output is provided (execution completed)
    const startedAt = new Date();
    const completedAt = output || error ? new Date() : null;
    const duration = completedAt ? completedAt.getTime() - startedAt.getTime() : null;
    
    // Determine status
    let status = LangGraphExecutionStatus.RUNNING;
    if (error) {
      status = LangGraphExecutionStatus.FAILED;
    } else if (output) {
      status = LangGraphExecutionStatus.COMPLETED;
    }
    
    // Create the execution
    const execution = await prisma.enhancedLangGraphNodeExecution.create({
      data: {
        graphStateId: stateId,
        nodeId: node.id,
        status,
        input,
        output,
        error,
        startedAt,
        completedAt,
        duration
      }
    });
    
    LoggingService.info({
      message: `Recorded LangGraph node execution: ${execution.id}`,
      module: 'forgeflow',
      category: 'LANGGRAPH_SERVICE',
      metadata: {
        stateId,
        nodeId,
        executionId: execution.id,
        status,
        duration
      }
    });
    
    return execution.id;
  } catch (error) {
    LoggingService.error({
      message: 'Error recording node execution',
      module: 'forgeflow',
      category: 'LANGGRAPH_SERVICE',
      error,
      metadata: {
        stateId,
        nodeId
      }
    });
    
    throw error;
  }
}

/**
 * Update a node execution
 * 
 * @param executionId The execution ID
 * @param output The output data
 * @param error Optional error message
 */
export async function updateNodeExecution(
  executionId: string,
  output: any,
  error?: string
): Promise<void> {
  try {
    const completedAt = new Date();
    
    // Get the execution to calculate duration
    const execution = await prisma.enhancedLangGraphNodeExecution.findUnique({
      where: { id: executionId }
    });
    
    if (!execution) {
      throw new Error(`Node execution not found: ${executionId}`);
    }
    
    // Calculate duration
    const duration = completedAt.getTime() - execution.startedAt.getTime();
    
    // Determine status
    const status = error ? LangGraphExecutionStatus.FAILED : LangGraphExecutionStatus.COMPLETED;
    
    // Update the execution
    await prisma.enhancedLangGraphNodeExecution.update({
      where: { id: executionId },
      data: {
        status,
        output,
        error,
        completedAt,
        duration
      }
    });
    
    LoggingService.info({
      message: `Updated LangGraph node execution: ${executionId}`,
      module: 'forgeflow',
      category: 'LANGGRAPH_SERVICE',
      metadata: {
        executionId,
        status,
        duration
      }
    });
  } catch (error) {
    LoggingService.error({
      message: 'Error updating node execution',
      module: 'forgeflow',
      category: 'LANGGRAPH_SERVICE',
      error,
      metadata: {
        executionId
      }
    });
    
    throw error;
  }
}
