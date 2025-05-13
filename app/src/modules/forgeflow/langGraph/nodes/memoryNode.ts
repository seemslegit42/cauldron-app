/**
 * Memory Node for LangGraph
 * 
 * This file provides a memory node implementation for LangGraph.
 * It allows for storing and retrieving memories within a graph execution.
 */

import { 
  storeMemory, 
  retrieveMemories, 
  searchMemories 
} from '@src/modules/memory/services/enhancedMemoryManager';
import { 
  MemoryEntryType, 
  MemoryContentType 
} from '@src/modules/memory/types';
import { LoggingService } from '@src/shared/services/logging';
import { LangGraphNodeType } from '../../types/langgraph';

// Types for memory node operations
export enum MemoryNodeOperation {
  STORE = 'store',
  RETRIEVE = 'retrieve',
  SEARCH = 'search',
}

// Interface for memory node configuration
export interface MemoryNodeConfig {
  operation: MemoryNodeOperation;
  memoryType?: MemoryEntryType;
  contentType?: string;
  context?: string;
  importance?: number;
  expiresInHours?: number;
  inputKey?: string;
  outputKey?: string;
  queryOptions?: any;
}

/**
 * Create a memory node for LangGraph
 * 
 * @param id The node ID
 * @param config The node configuration
 * @returns A graph node definition
 */
export function createMemoryNode(
  id: string,
  config: MemoryNodeConfig
) {
  return {
    id,
    type: LangGraphNodeType.MEMORY,
    config,
    execute: async (state: any) => {
      try {
        const { 
          operation, 
          memoryType = MemoryEntryType.SHORT_TERM, 
          contentType = MemoryContentType.FACT, 
          context = 'default', 
          importance = 1.0,
          expiresInHours,
          inputKey,
          outputKey,
          queryOptions = {}
        } = config;
        
        // Get the user ID from the state
        const userId = state.userId || state.user?.id;
        
        if (!userId) {
          throw new Error('User ID not found in state');
        }
        
        // Get the agent ID from the state if available
        const agentId = state.agentId || state.agent?.id;
        
        // Get the session ID from the state if available
        const sessionId = state.sessionId;
        
        // Execute the operation
        switch (operation) {
          case MemoryNodeOperation.STORE: {
            // Get the content to store
            const content = inputKey ? state[inputKey] : state;
            
            // Calculate expiration date if provided
            const expiresAt = expiresInHours
              ? new Date(Date.now() + expiresInHours * 60 * 60 * 1000)
              : undefined;
            
            // Store the memory
            const storedMemory = await storeMemory({
              userId,
              agentId,
              sessionId,
              type: memoryType,
              contentType,
              context,
              content,
              importance,
              expiresAt,
              metadata: {
                graphId: state.graphId,
                graphStateId: state.graphStateId,
                nodeId: id,
              },
              embedding: []
            });
            
            // Update the state
            return {
              ...state,
              [outputKey || 'storedMemoryId']: storedMemory.id,
            };
          }
          
          case MemoryNodeOperation.RETRIEVE: {
            // Retrieve memories
            const memories = await retrieveMemories(userId, {
              agentId,
              sessionId,
              type: memoryType,
              contentType,
              context,
              ...queryOptions,
            });
            
            // Update the state
            return {
              ...state,
              [outputKey || 'retrievedMemories']: memories,
            };
          }
          
          case MemoryNodeOperation.SEARCH: {
            // Get the query from the state
            const query = state[inputKey || 'query'];
            
            if (!query) {
              throw new Error('Query not found in state');
            }
            
            // Search memories
            const results = await searchMemories(query, userId, {
              agentId,
              sessionId,
              contentType,
              ...queryOptions,
            });
            
            // Update the state
            return {
              ...state,
              [outputKey || 'searchResults']: results,
            };
          }
          
          default:
            throw new Error(`Unknown memory operation: ${operation}`);
        }
      } catch (error) {
        LoggingService.error({
          message: 'Error executing memory node',
          module: 'forgeflow',
          category: 'LANGGRAPH_MEMORY_NODE',
          error,
          metadata: {
            nodeId: id,
            operation: config.operation,
          }
        });
        
        throw error;
      }
    }
  };
}
