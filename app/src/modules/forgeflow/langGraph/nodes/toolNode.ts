/**
 * Tool Node for LangGraph
 * 
 * This file provides a tool node implementation for LangGraph.
 * It allows for executing tools within a graph execution.
 */

import { LoggingService } from '@src/shared/services/logging';
import { LangGraphNodeType } from '../../types/langgraph';

// Interface for tool function
export interface ToolFunction {
  (input: any, context?: any): Promise<any>;
}

// Interface for tool node configuration
export interface ToolNodeConfig {
  tool: ToolFunction | string;
  inputKey?: string;
  outputKey?: string;
  errorHandler?: (error: any, state: any) => Promise<any>;
  metadata?: any;
}

/**
 * Create a tool node for LangGraph
 * 
 * @param id The node ID
 * @param config The node configuration
 * @returns A graph node definition
 */
export function createToolNode(
  id: string,
  config: ToolNodeConfig
) {
  return {
    id,
    type: LangGraphNodeType.TOOL,
    config,
    execute: async (state: any) => {
      try {
        const { 
          tool, 
          inputKey, 
          outputKey = 'toolOutput',
          errorHandler,
          metadata = {}
        } = config;
        
        // Get the input
        const input = inputKey ? state[inputKey] : state;
        
        // Get the tool function
        let toolFn: ToolFunction;
        
        if (typeof tool === 'string') {
          // Resolve the tool by name
          const toolModule = await import(`@src/shared/tools/${tool}`);
          toolFn = toolModule.default;
        } else {
          toolFn = tool;
        }
        
        // Execute the tool
        const result = await toolFn(input, {
          ...state,
          metadata: {
            ...metadata,
            graphId: state.graphId,
            graphStateId: state.graphStateId,
            nodeId: id,
          }
        });
        
        // Update the state
        return {
          ...state,
          [outputKey]: result
        };
      } catch (error) {
        LoggingService.error({
          message: 'Error executing tool node',
          module: 'forgeflow',
          category: 'LANGGRAPH_TOOL_NODE',
          error,
          metadata: {
            nodeId: id,
            tool: typeof config.tool === 'string' ? config.tool : 'custom',
          }
        });
        
        // Handle the error if an error handler is provided
        if (config.errorHandler) {
          return await config.errorHandler(error, state);
        }
        
        throw error;
      }
    }
  };
}
