/**
 * LangChain Agents Integration
 * 
 * This file provides agent implementations for LangChain that integrate with
 * CauldronOS's existing agent systems.
 */

import { LoggingService } from '@src/shared/services/logging';
import { AgentExecutor } from 'langchain/agents';
import { createOpenAIFunctionsAgent } from 'langchain/agents';
import { BaseChatModel } from 'langchain/chat_models/base';
import { createDefaultChatModel } from './models';
import { createDefaultTools, CauldronTool } from './tools';
import { BufferMemory } from 'langchain/memory';
import { createBufferMemory } from './memory';
import { PromptTemplate } from '@langchain/core/prompts';
import { MessagesPlaceholder } from '@langchain/core/prompts';

/**
 * Creates a LangChain agent with the given tools and model
 */
export async function createAgent(
  tools: CauldronTool[] = createDefaultTools(),
  model?: BaseChatModel,
  memory?: BufferMemory,
  systemMessage?: string
): Promise<AgentExecutor> {
  try {
    // Use provided model or create default
    const llm = model || createDefaultChatModel();
    
    // Use provided memory or create default
    const agentMemory = memory || createBufferMemory();
    
    // Default system message if not provided
    const defaultSystemMessage = `You are a helpful AI assistant with access to specialized tools. 
Use these tools to provide the best possible response to the user's query.
Always think step-by-step and use the most appropriate tool for each task.`;
    
    // Create the system message prompt
    const systemMessagePrompt = PromptTemplate.fromTemplate(
      systemMessage || defaultSystemMessage
    );
    
    // Create the prompt for the agent
    const prompt = await createOpenAIFunctionsAgent.getPrompt({
      systemMessage: systemMessagePrompt,
      memoryPrompt: new MessagesPlaceholder('chat_history'),
    });
    
    // Create the agent
    const agent = await createOpenAIFunctionsAgent({
      llm,
      tools,
      prompt,
    });
    
    // Create the executor
    const agentExecutor = new AgentExecutor({
      agent,
      tools,
      memory: agentMemory,
      returnIntermediateSteps: true,
    });
    
    LoggingService.info({
      message: 'Created LangChain agent',
      module: 'ai-services',
      category: 'LANGCHAIN',
      metadata: {
        toolCount: tools.length,
        toolNames: tools.map(tool => tool.name),
        modelName: (llm as any).modelName,
      },
    });
    
    return agentExecutor;
  } catch (error) {
    LoggingService.error({
      message: 'Error creating LangChain agent',
      module: 'ai-services',
      category: 'LANGCHAIN',
      error,
      metadata: {
        toolCount: tools.length,
        toolNames: tools.map(tool => tool.name),
      },
    });
    
    throw error;
  }
}

/**
 * Creates a specialized agent for security analysis
 */
export async function createSecurityAgent(
  model?: BaseChatModel,
  memory?: BufferMemory
): Promise<AgentExecutor> {
  // Create security-focused tools
  const tools = [
    ...createDefaultTools({ moduleId: 'phantom' }),
    // Add additional security-specific tools here
  ];
  
  // Security-focused system message
  const systemMessage = `You are a cybersecurity expert AI assistant with access to specialized security tools.
Your primary goal is to identify, analyze, and mitigate security threats.
Always approach security issues methodically and provide detailed explanations of your findings.
Use the available tools to gather information and perform security analyses.`;
  
  return createAgent(tools, model, memory, systemMessage);
}

/**
 * Creates a specialized agent for business intelligence
 */
export async function createBusinessIntelligenceAgent(
  model?: BaseChatModel,
  memory?: BufferMemory
): Promise<AgentExecutor> {
  // Create BI-focused tools
  const tools = [
    ...createDefaultTools({ moduleId: 'athena' }),
    // Add additional BI-specific tools here
  ];
  
  // BI-focused system message
  const systemMessage = `You are a business intelligence AI assistant with access to specialized analytics tools.
Your primary goal is to analyze data, identify trends, and provide actionable insights.
Always approach analysis methodically and provide clear explanations of your findings.
Use the available tools to gather information and perform data analyses.`;
  
  return createAgent(tools, model, memory, systemMessage);
}