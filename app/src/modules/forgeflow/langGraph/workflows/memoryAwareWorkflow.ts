/**
 * Memory-Aware Workflow
 * 
 * This file implements a memory-aware workflow using LangGraph.
 * It demonstrates how to use memory nodes to store and retrieve information during graph execution.
 */

import { 
  createGraph, 
  addNode, 
  addEdge, 
  executeGraph 
} from '../enhancedLangGraph';
import { createLLMNode } from '../nodes/llmNode';
import { createMemoryNode, MemoryNodeOperation } from '../nodes/memoryNode';
import { createToolNode } from '../nodes/toolNode';
import { createHumanInputNode } from '../nodes/humanInputNode';
import { MemoryEntryType, MemoryContentType } from '@src/modules/memory/types';
import { LoggingService } from '@src/shared/services/logging';
import { GraphDefinition, GraphExecutionOptions, GraphExecutionResult } from '../../types/langgraph';

// Define the state interface
export interface MemoryAwareWorkflowState {
  userId: string;
  agentId?: string;
  sessionId?: string;
  query: string;
  context?: any;
  relevantMemories?: any[];
  researchResults?: any;
  response?: string;
  storedMemoryId?: string;
}

/**
 * Create a memory-aware workflow
 * 
 * @param initialState The initial state
 * @returns The graph definition
 */
export function createMemoryAwareWorkflow(
  initialState: MemoryAwareWorkflowState
): GraphDefinition {
  // Create the graph
  const graph: GraphDefinition = {
    id: `memory-aware-workflow-${Date.now()}`,
    name: 'Memory-Aware Workflow',
    initialState,
    nodes: [
      // Node to retrieve relevant memories
      createMemoryNode('retrieve-memories', {
        operation: MemoryNodeOperation.SEARCH,
        inputKey: 'query',
        outputKey: 'relevantMemories',
        queryOptions: {
          limit: 5,
          similarityThreshold: 0.7,
          includeExpired: false,
        }
      }),
      
      // Node to generate a response based on the query and relevant memories
      createLLMNode('generate-response', {
        model: 'llama3-8b-8192',
        temperature: 0.7,
        promptTemplate: (state: MemoryAwareWorkflowState) => `
          You are a helpful AI assistant with access to the user's memory.
          
          User query: ${state.query}
          
          Relevant memories:
          ${state.relevantMemories && state.relevantMemories.length > 0
            ? state.relevantMemories.map((memory: any) => 
                `- ${memory.context}: ${JSON.stringify(memory.content)}`
              ).join('\n')
            : 'No relevant memories found.'
          }
          
          Please provide a helpful response based on the user's query and relevant memories.
        `,
        outputKey: 'response'
      }),
      
      // Node to store the response in memory
      createMemoryNode('store-response', {
        operation: MemoryNodeOperation.STORE,
        memoryType: MemoryEntryType.LONG_TERM,
        contentType: MemoryContentType.CONVERSATION,
        context: 'conversation-history',
        importance: 2.0,
        inputKey: 'response',
        outputKey: 'storedMemoryId'
      })
    ],
    edges: [
      // Connect the nodes
      {
        source: 'retrieve-memories',
        target: 'generate-response'
      },
      {
        source: 'generate-response',
        target: 'store-response'
      }
    ]
  };
  
  return graph;
}

/**
 * Execute a memory-aware workflow
 * 
 * @param initialState The initial state
 * @param options Execution options
 * @returns The execution result
 */
export async function executeMemoryAwareWorkflow(
  initialState: MemoryAwareWorkflowState,
  options: GraphExecutionOptions = {}
): Promise<GraphExecutionResult> {
  try {
    // Create the graph
    const graph = createMemoryAwareWorkflow(initialState);
    
    // Execute the graph
    const result = await executeGraph(graph, options);
    
    // Log the execution
    LoggingService.info({
      message: 'Executed memory-aware workflow',
      module: 'forgeflow',
      category: 'MEMORY_AWARE_WORKFLOW',
      metadata: {
        graphId: graph.id,
        userId: initialState.userId,
        query: initialState.query,
        resultState: result.finalState
      }
    });
    
    return result;
  } catch (error) {
    // Log the error
    LoggingService.error({
      message: 'Error executing memory-aware workflow',
      module: 'forgeflow',
      category: 'MEMORY_AWARE_WORKFLOW',
      error,
      metadata: {
        userId: initialState.userId,
        query: initialState.query
      }
    });
    
    throw error;
  }
}
