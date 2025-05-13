/**
 * LangGraph Implementation
 *
 * This file provides a simple implementation of a LangGraph-inspired orchestration system.
 * It defines a graph-based workflow for agent orchestration with nodes and edges.
 */

import { LoggingService } from '@src/shared/services/logging';
import { groqInference } from '@src/ai-services/groq';
import {
  createCheckpointer,
  recordNodeExecution,
  updateNodeExecution,
  PersistenceOptions
} from './persistence';

// Types for the graph system
export interface GraphNode<T = any> {
  id: string;
  type: string;
  execute: (state: T) => Promise<T>;
}

export interface GraphEdge<T = any> {
  source: string;
  target: string;
  condition?: (state: T) => boolean;
}

export interface Graph<T = any> {
  id?: string;
  name?: string;
  nodes: GraphNode<T>[];
  edges: GraphEdge<T>[];
  initialState: T;
  persistenceOptions?: PersistenceOptions;
}

/**
 * Creates a new graph
 */
export function createGraph<T>(
  initialState: T,
  name: string = 'Unnamed Graph',
  persistenceOptions?: PersistenceOptions
): Graph<T> {
  return {
    id: undefined, // Will be set when the graph is executed
    name,
    nodes: [],
    edges: [],
    initialState,
    persistenceOptions,
  };
}

/**
 * Adds a node to the graph
 */
export function addNode<T>(graph: Graph<T>, node: GraphNode<T>): Graph<T> {
  return {
    ...graph,
    nodes: [...graph.nodes, node],
  };
}

/**
 * Adds an edge to the graph
 */
export function addEdge<T>(graph: Graph<T>, edge: GraphEdge<T>): Graph<T> {
  return {
    ...graph,
    edges: [...graph.edges, edge],
  };
}

/**
 * Executes a graph
 */
export async function executeGraph<T>(graph: Graph<T>): Promise<T> {
  // Create a checkpointer for this graph
  const checkpointer = createCheckpointer(graph.persistenceOptions);

  // Initialize the state
  let state = { ...graph.initialState };

  // Persist the initial state
  await checkpointer.persist(graph.name || 'Unnamed Graph', state);

  // Get the state ID
  const stateId = checkpointer.getStateId();

  // Update the graph with the ID
  graph.id = checkpointer.getGraphId();

  // Create a set to track visited nodes
  const visitedNodes = new Set<string>();

  // Create a queue of nodes to visit
  const queue: string[] = [];

  // Find nodes with no incoming edges (start nodes)
  const startNodes = findStartNodes(graph);
  queue.push(...startNodes);

  // Log the graph execution start
  LoggingService.info({
    message: 'Starting graph execution',
    module: 'forgeflow',
    category: 'GRAPH_EXECUTION',
    metadata: {
      graphId: graph.id,
      stateId,
      nodeCount: graph.nodes.length,
      edgeCount: graph.edges.length,
      startNodes,
    },
  });

  // Execute the graph
  while (queue.length > 0) {
    // Get the next node
    const nodeId = queue.shift()!;

    // Skip if already visited
    if (visitedNodes.has(nodeId)) {
      continue;
    }

    // Find the node
    const node = graph.nodes.find(n => n.id === nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }

    // Log the node execution start
    LoggingService.info({
      message: `Executing node: ${nodeId}`,
      module: 'forgeflow',
      category: 'NODE_EXECUTION',
      metadata: {
        graphId: graph.id,
        stateId,
        nodeId,
        nodeType: node.type,
        stateKeys: Object.keys(state),
      },
    });

    // Record the node execution start
    let executionId: string | null = null;
    if (stateId) {
      executionId = await recordNodeExecution(stateId, nodeId, state);
    }

    // Execute the node
    try {
      state = await node.execute(state);

      // Mark the node as visited
      visitedNodes.add(nodeId);

      // Update the node execution record
      if (stateId && executionId) {
        await updateNodeExecution(executionId, state);
      }

      // Persist the updated state
      if (stateId) {
        await checkpointer.persist(graph.name || 'Unnamed Graph', state);
      }

      // Log the node execution completion
      LoggingService.info({
        message: `Node completed: ${nodeId}`,
        module: 'forgeflow',
        category: 'NODE_EXECUTION',
        metadata: {
          graphId: graph.id,
          stateId,
          nodeId,
          nodeType: node.type,
          executionId,
          success: true,
          updatedStateKeys: Object.keys(state),
        },
      });

      // Find outgoing edges
      const outgoingEdges = graph.edges.filter(e => e.source === nodeId);

      // Add target nodes to the queue if conditions are met
      for (const edge of outgoingEdges) {
        // Check if the condition is met
        if (!edge.condition || edge.condition(state)) {
          queue.push(edge.target);
        }
      }
    } catch (error) {
      // Update the node execution record with the error
      if (stateId && executionId) {
        await updateNodeExecution(executionId, null, error.message);
      }

      // Log the node execution failure
      LoggingService.error({
        message: `Node failed: ${nodeId}`,
        module: 'forgeflow',
        category: 'NODE_EXECUTION',
        error,
        metadata: {
          graphId: graph.id,
          stateId,
          nodeId,
          nodeType: node.type,
          executionId,
        },
      });

      throw error;
    }
  }

  // Update the graph state status to completed
  if (stateId) {
    await checkpointer.persist(graph.name || 'Unnamed Graph', state);
  }

  // Log the graph execution completion
  LoggingService.info({
    message: 'Graph execution completed',
    module: 'forgeflow',
    category: 'GRAPH_EXECUTION',
    metadata: {
      graphId: graph.id,
      stateId,
      visitedNodes: Array.from(visitedNodes),
      finalStateKeys: Object.keys(state),
    },
  });

  return state;
}

/**
 * Finds nodes with no incoming edges (start nodes)
 */
function findStartNodes<T>(graph: Graph<T>): string[] {
  // Get all nodes
  const allNodes = graph.nodes.map(n => n.id);

  // Get all target nodes
  const targetNodes = graph.edges.map(e => e.target);

  // Find nodes that are not targets
  return allNodes.filter(n => !targetNodes.includes(n));
}

/**
 * Creates an LLM node
 */
export function createLLMNode<T>(
  id: string,
  promptTemplate: string | ((state: T) => string),
  outputKey: string,
  model: string = 'llama3-8b-8192',
  temperature: number = 0.7
): GraphNode<T> {
  return {
    id,
    type: 'llm',
    execute: async (state: T) => {
      // Generate the prompt
      const prompt = typeof promptTemplate === 'function'
        ? promptTemplate(state)
        : promptTemplate;

      // Call the LLM
      const response = await groqInference({
        prompt,
        model,
        temperature,
        stream: false,
      }, {});

      // Update the state
      return {
        ...state,
        [outputKey]: response,
      };
    },
  };
}

/**
 * Creates a tool node
 */
export function createToolNode<T>(
  id: string,
  tool: (state: T) => Promise<any>,
  outputKey: string
): GraphNode<T> {
  return {
    id,
    type: 'tool',
    execute: async (state: T) => {
      // Execute the tool
      const result = await tool(state);

      // Update the state
      return {
        ...state,
        [outputKey]: result,
      };
    },
  };
}
