/**
 * Enhanced LangGraph Implementation
 *
 * This file provides an enhanced implementation of a LangGraph-inspired orchestration system.
 * It defines a graph-based workflow for agent orchestration with nodes and edges.
 */

import { LoggingService } from '@src/shared/services/logging';
import { 
  createLangGraphState, 
  updateLangGraphState, 
  getLangGraphState,
  recordNodeExecution,
  updateNodeExecution
} from '../services/enhancedLangGraphService';
import { 
  GraphDefinition, 
  GraphExecutionOptions, 
  GraphExecutionResult,
  LangGraphStateStatus,
  LangGraphExecutionStatus,
  NodeExecutionResult
} from '../types/langgraph';
import { v4 as uuidv4 } from 'uuid';

/**
 * Creates a new graph
 * 
 * @param initialState The initial state
 * @param name The graph name
 * @param metadata Optional metadata
 * @returns A graph definition
 */
export function createGraph<T>(
  initialState: T,
  name: string = 'Unnamed Graph',
  metadata: any = {}
): GraphDefinition {
  return {
    id: uuidv4(),
    name,
    nodes: [],
    edges: [],
    initialState,
    metadata
  };
}

/**
 * Adds a node to the graph
 * 
 * @param graph The graph
 * @param node The node to add
 * @returns The updated graph
 */
export function addNode(
  graph: GraphDefinition,
  node: any
): GraphDefinition {
  return {
    ...graph,
    nodes: [...graph.nodes, node]
  };
}

/**
 * Adds an edge to the graph
 * 
 * @param graph The graph
 * @param edge The edge to add
 * @returns The updated graph
 */
export function addEdge(
  graph: GraphDefinition,
  edge: { source: string; target: string; condition?: string; metadata?: any }
): GraphDefinition {
  return {
    ...graph,
    edges: [...(graph.edges || []), edge]
  };
}

/**
 * Executes a graph
 * 
 * @param graph The graph to execute
 * @param options Execution options
 * @returns The execution result
 */
export async function executeGraph(
  graph: GraphDefinition,
  options: GraphExecutionOptions = {}
): Promise<GraphExecutionResult> {
  const startTime = Date.now();
  let graphState;
  let finalState;
  let status = LangGraphStateStatus.ACTIVE;
  const nodeExecutions: NodeExecutionResult[] = [];
  
  try {
    // Create the graph state
    graphState = await createLangGraphState(graph, options);
    
    // Add graph state ID to the state
    let state = {
      ...graph.initialState,
      graphId: graph.id,
      graphStateId: graphState.id
    };
    
    // Find start nodes (nodes with no incoming edges)
    const startNodes = findStartNodes(graph);
    
    if (startNodes.length === 0) {
      throw new Error('No start nodes found in the graph');
    }
    
    // Create a queue of nodes to execute
    const queue = [...startNodes];
    const visited = new Set<string>();
    const maxSteps = options.maxSteps || 100;
    let steps = 0;
    
    // Execute the graph
    while (queue.length > 0 && steps < maxSteps) {
      // Get the next node
      const nodeId = queue.shift()!;
      
      // Skip if already visited
      if (visited.has(nodeId)) {
        continue;
      }
      
      // Mark as visited
      visited.add(nodeId);
      
      // Find the node
      const node = graph.nodes.find(n => n.id === nodeId);
      
      if (!node) {
        throw new Error(`Node not found: ${nodeId}`);
      }
      
      // Record the node execution
      const executionId = await recordNodeExecution(
        graphState.id,
        nodeId,
        state
      );
      
      try {
        // Execute the node
        const nodeStartTime = Date.now();
        const newState = await node.execute(state);
        const nodeEndTime = Date.now();
        
        // Update the state
        state = newState;
        
        // Update the node execution
        await updateNodeExecution(
          executionId,
          state
        );
        
        // Add to node executions
        nodeExecutions.push({
          executionId,
          nodeId,
          status: LangGraphExecutionStatus.COMPLETED,
          output: state,
          duration: nodeEndTime - nodeStartTime
        });
        
        // Find outgoing edges
        const outgoingEdges = (graph.edges || []).filter(e => e.source === nodeId);
        
        // Add target nodes to the queue
        for (const edge of outgoingEdges) {
          // Check condition if present
          if (edge.condition) {
            // Parse and evaluate the condition
            const conditionFn = new Function('state', `return ${edge.condition}`);
            const conditionResult = conditionFn(state);
            
            if (!conditionResult) {
              continue;
            }
          }
          
          queue.push(edge.target);
        }
      } catch (error) {
        // Update the node execution with error
        await updateNodeExecution(
          executionId,
          null,
          error.message
        );
        
        // Add to node executions
        nodeExecutions.push({
          executionId,
          nodeId,
          status: LangGraphExecutionStatus.FAILED,
          error: error.message
        });
        
        // Log the error
        LoggingService.error({
          message: `Error executing node: ${nodeId}`,
          module: 'forgeflow',
          category: 'LANGGRAPH_EXECUTION',
          error,
          metadata: {
            graphId: graph.id,
            graphStateId: graphState.id,
            nodeId
          }
        });
        
        // Set status to failed
        status = LangGraphStateStatus.FAILED;
        
        // Break the loop
        break;
      }
      
      // Increment steps
      steps++;
      
      // Update the graph state periodically
      if (steps % (options.checkpointInterval || 5) === 0) {
        await updateLangGraphState(graphState.id, state);
      }
    }
    
    // Check if we reached the max steps
    if (steps >= maxSteps) {
      LoggingService.warn({
        message: `Graph execution reached max steps: ${maxSteps}`,
        module: 'forgeflow',
        category: 'LANGGRAPH_EXECUTION',
        metadata: {
          graphId: graph.id,
          graphStateId: graphState.id,
          steps
        }
      });
    }
    
    // Set final state
    finalState = state;
    
    // Set status to completed if not failed
    if (status !== LangGraphStateStatus.FAILED) {
      status = LangGraphStateStatus.COMPLETED;
    }
    
    // Update the graph state
    await updateLangGraphState(graphState.id, finalState, status);
    
    // Calculate duration
    const duration = Date.now() - startTime;
    
    // Return the result
    return {
      graphStateId: graphState.id,
      status,
      finalState,
      nodeExecutions,
      duration,
      error: status === LangGraphStateStatus.FAILED ? 'Graph execution failed' : undefined
    };
  } catch (error) {
    // Log the error
    LoggingService.error({
      message: 'Error executing graph',
      module: 'forgeflow',
      category: 'LANGGRAPH_EXECUTION',
      error,
      metadata: {
        graphId: graph.id,
        graphStateId: graphState?.id
      }
    });
    
    // Update the graph state if created
    if (graphState) {
      await updateLangGraphState(
        graphState.id,
        finalState || graph.initialState,
        LangGraphStateStatus.FAILED
      );
    }
    
    // Calculate duration
    const duration = Date.now() - startTime;
    
    // Return the result
    return {
      graphStateId: graphState?.id,
      status: LangGraphStateStatus.FAILED,
      finalState: finalState || graph.initialState,
      nodeExecutions,
      duration,
      error: error.message
    };
  }
}

/**
 * Finds nodes with no incoming edges
 * 
 * @param graph The graph
 * @returns Array of node IDs
 */
function findStartNodes(graph: GraphDefinition): string[] {
  // Get all node IDs
  const nodeIds = graph.nodes.map(n => n.id);
  
  // Get all target node IDs from edges
  const targetNodeIds = (graph.edges || []).map(e => e.target);
  
  // Find nodes that are not targets
  return nodeIds.filter(id => !targetNodeIds.includes(id));
}
