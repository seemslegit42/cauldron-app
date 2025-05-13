/**
 * LLM Node for LangGraph
 * 
 * This file provides an LLM node implementation for LangGraph.
 * It allows for generating text using LLMs within a graph execution.
 */

import { groqInference } from '@src/ai-services/groq';
import { LoggingService } from '@src/shared/services/logging';
import { LangGraphNodeType } from '../../types/langgraph';

// Interface for LLM node configuration
export interface LLMNodeConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  promptTemplate: string | ((state: any) => string);
  outputKey?: string;
  systemPrompt?: string;
  stopSequences?: string[];
  metadata?: any;
}

/**
 * Create an LLM node for LangGraph
 * 
 * @param id The node ID
 * @param config The node configuration
 * @returns A graph node definition
 */
export function createLLMNode(
  id: string,
  config: LLMNodeConfig
) {
  return {
    id,
    type: LangGraphNodeType.LLM,
    config,
    execute: async (state: any) => {
      try {
        const { 
          model = 'llama3-8b-8192', 
          temperature = 0.7, 
          maxTokens,
          promptTemplate,
          outputKey = 'llmOutput',
          systemPrompt,
          stopSequences,
          metadata = {}
        } = config;
        
        // Generate the prompt
        const prompt = typeof promptTemplate === 'function'
          ? promptTemplate(state)
          : promptTemplate;
        
        // Get the user ID from the state
        const userId = state.userId || state.user?.id;
        
        // Call the LLM
        const response = await groqInference({
          model,
          prompt,
          temperature,
          maxTokens,
          systemPrompt,
          stopSequences,
          stream: false,
          userId,
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
          [outputKey]: response
        };
      } catch (error) {
        LoggingService.error({
          message: 'Error executing LLM node',
          module: 'forgeflow',
          category: 'LANGGRAPH_LLM_NODE',
          error,
          metadata: {
            nodeId: id,
            model: config.model,
          }
        });
        
        throw error;
      }
    }
  };
}
