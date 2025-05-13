/**
 * LangChain Chains Integration
 * 
 * This file provides chain implementations for LangChain that integrate with
 * CauldronOS's existing systems.
 */

import { LoggingService } from '@src/shared/services/logging';
import { LLMChain } from 'langchain/chains';
import { PromptTemplate } from '@langchain/core/prompts';
import { BaseChatModel } from 'langchain/chat_models/base';
import { createDefaultChatModel } from './models';
import { BufferMemory } from 'langchain/memory';
import { createBufferMemory } from './memory';

/**
 * Creates a simple LLM chain with the given prompt template and model
 */
export function createSimpleChain(
  promptTemplate: string,
  inputVariables: string[],
  model?: BaseChatModel,
  memory?: BufferMemory
): LLMChain {
  try {
    // Create prompt template
    const prompt = PromptTemplate.fromTemplate(promptTemplate);
    
    // Use provided model or create default
    const llm = model || createDefaultChatModel();
    
    // Use provided memory or create default
    const chainMemory = memory || createBufferMemory();
    
    // Create chain
    const chain = new LLMChain({
      llm,
      prompt,
      memory: chainMemory,
    });
    
    LoggingService.info({
      message: 'Created LangChain simple chain',
      module: 'ai-services',
      category: 'LANGCHAIN',
      metadata: {
        inputVariables,
        modelName: (llm as any).modelName,
      },
    });
    
    return chain;
  } catch (error) {
    LoggingService.error({
      message: 'Error creating LangChain simple chain',
      module: 'ai-services',
      category: 'LANGCHAIN',
      error,
      metadata: {
        inputVariables,
      },
    });
    
    throw error;
  }
}

/**
 * Creates a chain for summarization
 */
export function createSummarizationChain(
  model?: BaseChatModel,
  memory?: BufferMemory
): LLMChain {
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
  
  return createSimpleChain(
    summarizationTemplate,
    ['text'],
    model,
    memory
  );
}

/**
 * Creates a chain for content generation
 */
export function createContentGenerationChain(
  model?: BaseChatModel,
  memory?: BufferMemory
): LLMChain {
  const contentTemplate = `
  You are a creative content generator. Your task is to create high-quality content based on the provided topic and guidelines.
  
  Topic: {topic}
  Content Type: {contentType}
  Tone: {tone}
  Target Audience: {audience}
  Additional Guidelines: {guidelines}
  
  Generate content that is engaging, informative, and tailored to the target audience. Ensure it matches the requested tone and content type.
  
  Generated Content:
  `;
  
  return createSimpleChain(
    contentTemplate,
    ['topic', 'contentType', 'tone', 'audience', 'guidelines'],
    model,
    memory
  );
}

/**
 * Creates a chain for threat analysis
 */
export function createThreatAnalysisChain(
  model?: BaseChatModel,
  memory?: BufferMemory
): LLMChain {
  const threatAnalysisTemplate = `
  You are a cybersecurity expert specializing in threat analysis. Your task is to analyze the provided information and identify potential security threats.
  
  Information to analyze:
  {information}
  
  Context: {context}
  
  Provide a detailed threat analysis including:
  1. Identified threats and vulnerabilities
  2. Potential impact and severity (Low, Medium, High, Critical)
  3. Recommended mitigation strategies
  4. Additional security considerations
  
  Threat Analysis:
  `;
  
  return createSimpleChain(
    threatAnalysisTemplate,
    ['information', 'context'],
    model,
    memory
  );
}

/**
 * Creates a chain for business intelligence analysis
 */
export function createBusinessIntelligenceChain(
  model?: BaseChatModel,
  memory?: BufferMemory
): LLMChain {
  const biTemplate = `
  You are a business intelligence analyst. Your task is to analyze the provided data and extract meaningful insights.
  
  Data: {data}
  
  Business Context: {context}
  
  Questions to Address: {questions}
  
  Provide a comprehensive analysis including:
  1. Key findings and insights
  2. Trends and patterns
  3. Actionable recommendations
  4. Areas for further investigation
  
  Analysis:
  `;
  
  return createSimpleChain(
    biTemplate,
    ['data', 'context', 'questions'],
    model,
    memory
  );
}