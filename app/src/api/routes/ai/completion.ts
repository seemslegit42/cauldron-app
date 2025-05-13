/**
 * AI Completion API Route
 * 
 * This file implements the API route for AI text completions using the Vercel AI SDK.
 * It supports streaming responses for text generation.
 */

import { StreamingTextResponse, createStreamDataTransformer } from 'ai';
import { groqInference } from '../../../ai-services/groq';
import { HttpError } from 'wasp/server';
import { LoggingService } from '../../../shared/services/LoggingService';
import { requirePermission } from '../../../shared/auth/rbac';

/**
 * Handler for the completion API route
 * This is designed to be compatible with the Vercel AI SDK's useCompletion hook
 */
export const POST = async (req: Request, context: any) => {
  // Apply RBAC middleware - require 'ai-assistant:use' permission
  const user = await requirePermission({
    resource: 'ai-assistant',
    action: 'use',
    adminOverride: true,
    auditRejection: true
  })(context);

  try {
    // Parse the request body
    const { prompt, module = 'arcana', temperature = 0.7, maxTokens = 1000 } = await req.json();

    // Validate the request
    if (!prompt || typeof prompt !== 'string') {
      throw new HttpError(400, 'Invalid request: prompt must be a string');
    }

    // Log the operation
    LoggingService.info({
      message: 'Processing AI completion request',
      userId: user.id,
      module,
      category: 'AI_COMPLETION',
      metadata: { 
        promptLength: prompt.length,
        temperature,
        maxTokens
      }
    });

    // Prepare the system message based on the module
    const systemPrompt = getSystemPromptForModule(module);
    
    // Call the Groq inference API with streaming enabled
    const stream = await groqInference({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama3-8b-8192', // Default model, can be made configurable
      temperature,
      maxTokens,
      stream: true,
    }, context);

    // Transform the stream to be compatible with Vercel AI SDK
    const transformedStream = stream.pipeThrough(createStreamDataTransformer());

    // Return a streaming response
    return new StreamingTextResponse(transformedStream);
  } catch (error) {
    console.error('Error in completion API route:', error);
    
    // Log the error
    LoggingService.error({
      message: 'Error in completion API route',
      userId: user?.id,
      module: 'ai',
      category: 'API_ERROR',
      metadata: { error: error.message }
    });

    // Return an appropriate error response
    return new Response(
      JSON.stringify({
        error: error.message || 'An error occurred during the completion request',
      }),
      {
        status: error.status || 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

/**
 * Get a system prompt for a specific module
 */
function getSystemPromptForModule(module: string): string {
  switch (module) {
    case 'arcana':
      return `You are the Arcana AI assistant, a helpful and knowledgeable assistant for the Cauldron platform.
You provide concise, accurate information and assist with dashboard operations.
Always be professional, clear, and helpful.`;
    
    case 'phantom':
      return `You are the Phantom AI assistant, a cybersecurity expert for the Cauldron platform.
You help users understand security threats, analyze vulnerabilities, and recommend defensive actions.
Your tone is precise, technical when needed, but always accessible.`;
    
    case 'athena':
      return `You are the Athena AI assistant, a business intelligence expert for the Cauldron platform.
You analyze data, identify trends, and provide strategic recommendations.
Your insights are data-driven, actionable, and focused on business growth.`;
    
    case 'forgeflow':
      return `You are the Forgeflow AI assistant, an expert in workflow automation for the Cauldron platform.
You help users design, implement, and optimize automated workflows.
Your guidance is practical, step-by-step, and focused on efficiency.`;
    
    case 'sentinel':
      return `You are the Sentinel AI assistant, a security monitoring expert for the Cauldron platform.
You help users understand security alerts, assess risks, and implement protective measures.
Your tone is calm but authoritative, focusing on clear security guidance.`;
    
    default:
      return `You are a helpful AI assistant for the Cauldron platform.
You provide concise, accurate information and assist users with their tasks.
Always be professional, clear, and helpful.`;
  }
}
