/**
 * AI Chat API Route
 * 
 * This file implements the API route for AI chat completions using the Vercel AI SDK.
 * It supports streaming responses and function calling.
 */

import { StreamingTextResponse, Message, createStreamDataTransformer } from 'ai';
import { groqInference } from '../../../ai-services/groq';
import { HttpError } from 'wasp/server';
import { LoggingService } from '../../../shared/services/LoggingService';
import { requirePermission } from '../../../shared/auth/rbac';

/**
 * Handler for the chat API route
 * This is designed to be compatible with the Vercel AI SDK's useChat hook
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
    const { messages, functions, module = 'arcana' } = await req.json();

    // Validate the request
    if (!messages || !Array.isArray(messages)) {
      throw new HttpError(400, 'Invalid request: messages must be an array');
    }

    // Log the operation
    LoggingService.info({
      message: 'Processing AI chat request',
      userId: user.id,
      module,
      category: 'AI_CHAT',
      metadata: { 
        messageCount: messages.length,
        hasFunctions: !!functions,
      }
    });

    // Prepare the system message if not already provided
    let systemMessage = messages.find(m => m.role === 'system');
    if (!systemMessage) {
      // Add a default system message based on the module
      const defaultSystemMessage = getDefaultSystemMessage(module);
      messages.unshift({
        role: 'system',
        content: defaultSystemMessage
      });
    }

    // Call the Groq inference API with streaming enabled
    const stream = await groqInference({
      messages,
      model: 'llama3-8b-8192', // Default model, can be made configurable
      temperature: 0.7,
      stream: true,
      functions: functions,
    }, context);

    // Transform the stream to be compatible with Vercel AI SDK
    const transformedStream = stream.pipeThrough(createStreamDataTransformer());

    // Return a streaming response
    return new StreamingTextResponse(transformedStream);
  } catch (error) {
    console.error('Error in chat API route:', error);
    
    // Log the error
    LoggingService.error({
      message: 'Error in chat API route',
      userId: user?.id,
      module: 'ai',
      category: 'API_ERROR',
      metadata: { error: error.message }
    });

    // Return an appropriate error response
    return new Response(
      JSON.stringify({
        error: error.message || 'An error occurred during the chat request',
      }),
      {
        status: error.status || 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

/**
 * Get a default system message based on the module
 */
function getDefaultSystemMessage(module: string): string {
  switch (module) {
    case 'arcana':
      return `You are the Arcana AI assistant, a helpful and knowledgeable assistant for the Cauldron platform.
You provide concise, accurate information and assist with dashboard operations.
You have access to business metrics, security insights, and can help users navigate the platform.
Always be professional, clear, and helpful.`;
    
    case 'phantom':
      return `You are the Phantom AI assistant, a cybersecurity expert for the Cauldron platform.
You help users understand security threats, analyze vulnerabilities, and recommend defensive actions.
Your tone is precise, technical when needed, but always accessible.
Focus on actionable security insights and clear explanations of complex security concepts.`;
    
    case 'athena':
      return `You are the Athena AI assistant, a business intelligence expert for the Cauldron platform.
You analyze data, identify trends, and provide strategic recommendations.
Your insights are data-driven, actionable, and focused on business growth.
Present information clearly with a focus on metrics that matter.`;
    
    case 'forgeflow':
      return `You are the Forgeflow AI assistant, an expert in workflow automation for the Cauldron platform.
You help users design, implement, and optimize automated workflows.
Your guidance is practical, step-by-step, and focused on efficiency.
Explain technical concepts clearly and suggest best practices for workflow design.`;
    
    case 'sentinel':
      return `You are the Sentinel AI assistant, a security monitoring expert for the Cauldron platform.
You help users understand security alerts, assess risks, and implement protective measures.
Your tone is calm but authoritative, focusing on clear security guidance.
Prioritize user safety while explaining security concepts in accessible terms.`;
    
    default:
      return `You are a helpful AI assistant for the Cauldron platform.
You provide concise, accurate information and assist users with their tasks.
Always be professional, clear, and helpful.`;
  }
}
