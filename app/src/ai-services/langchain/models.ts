/**
 * LangChain Model Integrations
 * 
 * This file provides integrations with various LLM providers through LangChain.
 * It offers a unified interface for working with different models while leveraging
 * CauldronOS's existing infrastructure.
 */

import { LoggingService } from '@src/shared/services/logging';
import { groqInference } from '@src/ai-services/groq';
import { ChatOpenAI } from '@langchain/openai';
import { ChatGroq } from '@langchain/groq';
import { BaseChatModel } from 'langchain/chat_models/base';

/**
 * Configuration options for LLM models
 */
export interface ModelConfig {
  provider: 'openai' | 'groq' | 'custom';
  model: string;
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
  baseUrl?: string;
  streaming?: boolean;
  callbacks?: any[];
}

/**
 * Default model configurations
 */
export const DEFAULT_MODEL_CONFIGS: Record<string, ModelConfig> = {
  'gpt-4o': {
    provider: 'openai',
    model: 'gpt-4o',
    temperature: 0.7,
  },
  'llama3-8b': {
    provider: 'groq',
    model: 'llama3-8b-8192',
    temperature: 0.7,
  },
  'llama3-70b': {
    provider: 'groq',
    model: 'llama3-70b-8192',
    temperature: 0.7,
  },
  'mixtral-8x7b': {
    provider: 'groq',
    model: 'mixtral-8x7b-32768',
    temperature: 0.7,
  },
};

/**
 * Creates a LangChain chat model based on the provided configuration
 */
export function createChatModel(config: ModelConfig): BaseChatModel {
  try {
    // Log model creation
    LoggingService.info({
      message: `Creating LangChain chat model`,
      module: 'ai-services',
      category: 'LANGCHAIN',
      metadata: {
        provider: config.provider,
        model: config.model,
        temperature: config.temperature,
      },
    });

    // Create the appropriate model based on provider
    switch (config.provider) {
      case 'openai':
        return new ChatOpenAI({
          modelName: config.model,
          temperature: config.temperature,
          maxTokens: config.maxTokens,
          openAIApiKey: config.apiKey,
          streaming: config.streaming,
          callbacks: config.callbacks,
        });
      
      case 'groq':
        return new ChatGroq({
          modelName: config.model,
          temperature: config.temperature,
          maxTokens: config.maxTokens,
          apiKey: config.apiKey,
          streaming: config.streaming,
          callbacks: config.callbacks,
        });
      
      default:
        throw new Error(`Unsupported provider: ${config.provider}`);
    }
  } catch (error) {
    LoggingService.error({
      message: 'Error creating LangChain chat model',
      module: 'ai-services',
      category: 'LANGCHAIN',
      error,
      metadata: {
        provider: config.provider,
        model: config.model,
      },
    });
    
    throw error;
  }
}

/**
 * Creates a LangChain chat model with the default configuration
 */
export function createDefaultChatModel(modelName: string = 'gpt-4o'): BaseChatModel {
  const config = DEFAULT_MODEL_CONFIGS[modelName] || DEFAULT_MODEL_CONFIGS['gpt-4o'];
  return createChatModel(config);
}

/**
 * Adapter to use existing groqInference with LangChain
 */
export async function adaptGroqToLangChain(
  prompt: string,
  modelName: string = 'llama3-8b-8192',
  temperature: number = 0.7
): Promise<string> {
  try {
    // Use existing groqInference function
    const response = await groqInference({
      prompt,
      model: modelName,
      temperature,
      stream: false,
    }, {});
    
    return response;
  } catch (error) {
    LoggingService.error({
      message: 'Error in adaptGroqToLangChain',
      module: 'ai-services',
      category: 'LANGCHAIN',
      error,
      metadata: {
        modelName,
        temperature,
      },
    });
    
    throw error;
  }
}