/**
 * LangChain Integration for LangGraph
 * 
 * This file provides integration between LangChain and CauldronOS's LangGraph implementation.
 */

import { LoggingService } from '@src/shared/services/logging';
import { 
  createDefaultChatModel,
  createBufferMemory,
  createSimpleChain,
  CauldronTool
} from '@src/ai-services/langchain';
import { 
  Graph,
  GraphNode,
  GraphEdge,
  createGraph,
  addNode,
  addEdge,
  executeGraph
} from './index';
import { BaseChatModel } from 'langchain/chat_models/base';
import { LLMChain } from 'langchain/chains';
import { BufferMemory } from 'langchain/memory';

/**
 * Creates a LangGraph node from a LangChain chain
 */
export function createLangChainNode<T>(
  id: string,
  chain: LLMChain,
  inputMapping: (state: T) => Record<string, any>,
  outputMapping: (chainOutput: Record<string, any>, state: T) => T
): GraphNode<T> {
  return {
    id,
    type: 'langchain_chain',
    execute: async (state: T) => {
      try {
        // Map state to chain input
        const input = inputMapping(state);
        
        // Execute the chain
        const output = await chain.invoke(input);
        
        // Map chain output to state
        const newState = outputMapping(output, state);
        
        LoggingService.info({
          message: `Executed LangChain node: ${id}`,
          module: 'forgeflow',
          category: 'LANGGRAPH',
          metadata: {
            nodeId: id,
            inputKeys: Object.keys(input),
            outputKeys: Object.keys(output),
          },
        });
        
        return newState;
      } catch (error) {
        LoggingService.error({
          message: `Error executing LangChain node: ${id}`,
          module: 'forgeflow',
          category: 'LANGGRAPH',
          error,
          metadata: {
            nodeId: id,
          },
        });
        
        throw error;
      }
    },
  };
}

/**
 * Creates a LangGraph node from a LangChain tool
 */
export function createLangChainToolNode<T>(
  id: string,
  tool: CauldronTool,
  inputMapping: (state: T) => string,
  outputMapping: (toolOutput: string, state: T) => T
): GraphNode<T> {
  return {
    id,
    type: 'langchain_tool',
    execute: async (state: T) => {
      try {
        // Map state to tool input
        const input = inputMapping(state);
        
        // Execute the tool
        const output = await tool.invoke(input);
        
        // Map tool output to state
        const newState = outputMapping(output, state);
        
        LoggingService.info({
          message: `Executed LangChain tool node: ${id}`,
          module: 'forgeflow',
          category: 'LANGGRAPH',
          metadata: {
            nodeId: id,
            toolName: tool.name,
            inputLength: input.length,
            outputLength: output.length,
          },
        });
        
        return newState;
      } catch (error) {
        LoggingService.error({
          message: `Error executing LangChain tool node: ${id}`,
          module: 'forgeflow',
          category: 'LANGGRAPH',
          error,
          metadata: {
            nodeId: id,
            toolName: tool.name,
          },
        });
        
        throw error;
      }
    },
  };
}

/**
 * Creates a workflow graph using LangChain components
 */
export function createLangChainWorkflow<T>(
  initialState: T,
  name: string = 'LangChain Workflow'
): Graph<T> {
  return createGraph<T>(initialState, name);
}

/**
 * Creates a summarization workflow using LangChain
 */
export function createSummarizationWorkflow(
  model?: BaseChatModel,
  memory?: BufferMemory
): Graph<{
  text: string;
  summary?: string;
  keyPoints?: string[];
  sentiment?: string;
}> {
  // Create the model and memory if not provided
  const llm = model || createDefaultChatModel();
  const chainMemory = memory || createBufferMemory();
  
  // Create the initial state
  const initialState = {
    text: '',
  };
  
  // Create the graph
  let graph = createGraph(initialState, 'Summarization Workflow');
  
  // Create the summarization chain
  const summarizationTemplate = `
  You are an expert summarizer. Your task is to create a concise and comprehensive summary of the provided text.
  
  Text to summarize:
  {text}
  
  Instructions:
  - Maintain the key points and important details
  - Eliminate redundant information
  - Ensure the summary is coherent and flows logically
  - Keep the summary to approximately 20% of the original length
  
  Summary:
  `;
  
  const summarizationChain = createSimpleChain(
    summarizationTemplate,
    ['text'],
    llm,
    chainMemory
  );
  
  // Create the key points extraction chain
  const keyPointsTemplate = `
  Extract the key points from the following text:
  
  {text}
  
  Instructions:
  - Identify the most important points
  - Format as a bullet-point list
  - Keep each point concise
  - Include 3-7 key points
  
  Key Points:
  `;
  
  const keyPointsChain = createSimpleChain(
    keyPointsTemplate,
    ['text'],
    llm,
    chainMemory
  );
  
  // Create the sentiment analysis chain
  const sentimentTemplate = `
  Analyze the sentiment of the following text:
  
  {text}
  
  Provide a brief sentiment analysis (positive, negative, or neutral) and explain why.
  
  Sentiment:
  `;
  
  const sentimentChain = createSimpleChain(
    sentimentTemplate,
    ['text'],
    llm,
    chainMemory
  );
  
  // Create nodes for the graph
  const summarizationNode = createLangChainNode(
    'summarize',
    summarizationChain,
    (state) => ({ text: state.text }),
    (output, state) => ({ ...state, summary: output.text })
  );
  
  const keyPointsNode = createLangChainNode(
    'extract_key_points',
    keyPointsChain,
    (state) => ({ text: state.text }),
    (output, state) => {
      // Simple parsing of bullet points
      const keyPoints = output.text
        .split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
        .map(line => line.replace(/^[-•]\s*/, '').trim());
      
      return { ...state, keyPoints };
    }
  );
  
  const sentimentNode = createLangChainNode(
    'analyze_sentiment',
    sentimentChain,
    (state) => ({ text: state.text }),
    (output, state) => ({ ...state, sentiment: output.text })
  );
  
  // Add nodes to the graph
  graph = addNode(graph, summarizationNode);
  graph = addNode(graph, keyPointsNode);
  graph = addNode(graph, sentimentNode);
  
  // Add edges to the graph
  graph = addEdge(graph, { source: 'summarize', target: 'extract_key_points' });
  graph = addEdge(graph, { source: 'extract_key_points', target: 'analyze_sentiment' });
  
  return graph;
}

/**
 * Executes a summarization workflow
 */
export async function executeSummarizationWorkflow(
  text: string,
  model?: BaseChatModel,
  memory?: BufferMemory
): Promise<{
  summary: string;
  keyPoints: string[];
  sentiment: string;
}> {
  try {
    // Create the workflow
    const workflow = createSummarizationWorkflow(model, memory);
    
    // Set the initial state
    workflow.initialState = {
      text,
    };
    
    // Execute the workflow
    const result = await executeGraph(workflow);
    
    LoggingService.info({
      message: 'Executed summarization workflow',
      module: 'forgeflow',
      category: 'LANGGRAPH',
      metadata: {
        textLength: text.length,
        summaryLength: result.summary?.length || 0,
        keyPointsCount: result.keyPoints?.length || 0,
      },
    });
    
    return {
      summary: result.summary || '',
      keyPoints: result.keyPoints || [],
      sentiment: result.sentiment || '',
    };
  } catch (error) {
    LoggingService.error({
      message: 'Error executing summarization workflow',
      module: 'forgeflow',
      category: 'LANGGRAPH',
      error,
      metadata: {
        textLength: text.length,
      },
    });
    
    throw error;
  }
}