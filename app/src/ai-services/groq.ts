import { Groq } from '@groq/groq-sdk';
import { SwarmGroq } from 'swarm-groq';
import { HttpError } from 'wasp/server';
import * as z from 'zod';
import { ensureArgsSchemaOrThrowHttpError } from '../server/validation';
import { AiLogging, createLoggingContext } from '../shared/services/loggingIntegration';

// Initialize Groq client with API key
const GROQ_API_KEY = process.env.GROQ_API_KEY || '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';

// Initialize the standard Groq client
const groq = new Groq({
  apiKey: GROQ_API_KEY,
});

// Initialize the Swarm Groq client for high-performance, low-latency responses
const swarmGroq = new SwarmGroq({
  apiKey: GROQ_API_KEY,
  // Configure with optimal settings for sub-100ms latency
  maxConcurrentRequests: 10,
  retryAttempts: 3,
  retryDelay: 50, // ms
});

// Input schema for the groqInference function
export const groqInferenceInputSchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty"),
  context: z.string().optional(),
  model: z.enum(['llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma-7b-it']).default('llama3-8b-8192'),
  temperature: z.number().min(0).max(1).default(0.7),
  maxTokens: z.number().positive().default(1024),
  stream: z.boolean().default(true),
});

export type GroqInferenceInput = z.infer<typeof groqInferenceInputSchema>;

/**
 * Performs inference using Groq's Swarm cluster for ultra-low latency responses
 * @param args The input parameters for the inference
 * @param context The request context
 * @returns A streaming response from the Groq API
 */
export const groqInference = async (rawArgs: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, "Unauthorized");
  }

  const args = ensureArgsSchemaOrThrowHttpError(groqInferenceInputSchema, rawArgs);

  // Create logging context
  const loggingContext = createLoggingContext(context);

  // Initialize logging for this inference request
  const logger = await AiLogging.logInference(
    args.model,
    args.prompt,
    loggingContext,
    {
      temperature: args.temperature,
      maxTokens: args.maxTokens,
      stream: args.stream,
      contextLength: args.context?.length || 0
    }
  );

  // Log the start of the inference
  await logger.logStart();

  try {
    // Construct the messages array
    const messages = [
      {
        role: "user",
        content: args.context
          ? `${args.context}\n\n${args.prompt}`
          : args.prompt
      }
    ];

    // Use swarmGroq for streaming responses with sub-100ms latency
    if (args.stream) {
      const stream = swarmGroq.chat.completions.create({
        messages,
        model: args.model,
        temperature: args.temperature,
        max_tokens: args.maxTokens,
        stream: true,
      });

      // Log successful completion
      await logger.logCompletion('Streaming response started');

      return stream;
    }

    // Use standard groq client for non-streaming responses
    else {
      const completion = await groq.chat.completions.create({
        messages,
        model: args.model,
        temperature: args.temperature,
        max_tokens: args.maxTokens,
      });

      // Calculate token usage if available
      const tokensUsed = completion.usage?.total_tokens || 0;

      // Log successful completion with token usage
      await logger.logCompletion(completion.choices[0]?.message?.content || '', {
        tokensUsed,
        promptTokens: completion.usage?.prompt_tokens,
        completionTokens: completion.usage?.completion_tokens
      });

      return completion;
    }
  } catch (error: any) {
    console.error("Groq inference error:", error);

    // Log the error
    await logger.logCompletion(null, error);

    throw new HttpError(
      error.status || 500,
      error.message || "Failed to get response from Groq"
    );
  }
};

/**
 * Helper function to handle streaming responses on the client side
 * This can be imported and used in frontend components
 */
export const handleGroqStream = async (
  stream: AsyncIterable<any>,
  onChunk: (chunk: string) => void,
  onComplete?: (fullText: string) => void
) => {
  let fullText = '';

  try {
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullText += content;
        onChunk(content);
      }
    }

    if (onComplete) {
      onComplete(fullText);
    }

    return fullText;
  } catch (error) {
    console.error('Error processing Groq stream:', error);
    throw error;
  }
};import { Groq } from '@groq/groq-sdk';
import { SwarmGroq } from 'swarm-groq';
import { HttpError } from 'wasp/server';
import * as z from 'zod';
import { ensureArgsSchemaOrThrowHttpError } from '../server/validation';

// Initialize Groq client with API key
const GROQ_API_KEY = process.env.GROQ_API_KEY || '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';

// Initialize the standard Groq client
const groq = new Groq({
  apiKey: GROQ_API_KEY,
});

// Initialize the Swarm Groq client for high-performance, low-latency responses
const swarmGroq = new SwarmGroq({
  apiKey: GROQ_API_KEY,
  // Configure with optimal settings for sub-100ms latency
  maxConcurrentRequests: 10,
  retryAttempts: 3,
  retryDelay: 50, // ms
});

// Input schema for the groqInference function
export const groqInferenceInputSchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty"),
  context: z.string().optional(),
  model: z.enum(['llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma-7b-it']).default('llama3-8b-8192'),
  temperature: z.number().min(0).max(1).default(0.7),
  maxTokens: z.number().positive().default(1024),
  stream: z.boolean().default(true),
});

export type GroqInferenceInput = z.infer<typeof groqInferenceInputSchema>;

/**
 * Performs inference using Groq's Swarm cluster for ultra-low latency responses
 * @param args The input parameters for the inference
 * @param context The request context
 * @returns A streaming response from the Groq API
 */
export const groqInference = async (rawArgs: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, "Unauthorized");
  }

  const args = ensureArgsSchemaOrThrowHttpError(groqInferenceInputSchema, rawArgs);

  try {
    // Construct the messages array
    const messages = [
      {
        role: "user",
        content: args.context
          ? `${args.context}\n\n${args.prompt}`
          : args.prompt
      }
    ];

    // Use swarmGroq for streaming responses with sub-100ms latency
    if (args.stream) {
      return swarmGroq.chat.completions.create({
        messages,
        model: args.model,
        temperature: args.temperature,
        max_tokens: args.maxTokens,
        stream: true,
      });
    }

    // Use standard groq client for non-streaming responses
    else {
      const completion = await groq.chat.completions.create({
        messages,
        model: args.model,
        temperature: args.temperature,
        max_tokens: args.maxTokens,
      });

      return completion;
    }
  } catch (error: any) {
    console.error("Groq inference error:", error);
    throw new HttpError(
      error.status || 500,
      error.message || "Failed to get response from Groq"
    );
  }
};

/**
 * Helper function to handle streaming responses on the client side
 * This can be imported and used in frontend components
 */
export const handleGroqStream = async (
  stream: AsyncIterable<any>,
  onChunk: (chunk: string) => void,
  onComplete?: (fullText: string) => void
) => {
  let fullText = '';

  try {
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullText += content;
        onChunk(content);
      }
    }

    if (onComplete) {
      onComplete(fullText);
    }

    return fullText;
  } catch (error) {
    console.error('Error processing Groq stream:', error);
    throw error;
  }
};import { Groq } from '@groq/groq-sdk';
import { SwarmGroq } from 'swarm-groq';
import { HttpError } from 'wasp/server';
import * as z from 'zod';
import { ensureArgsSchemaOrThrowHttpError } from '../server/validation';

// Initialize Groq client with API key
const GROQ_API_KEY = process.env.GROQ_API_KEY || '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';

// Initialize the standard Groq client
const groq = new Groq({
  apiKey: GROQ_API_KEY,
});

// Initialize the Swarm Groq client for high-performance, low-latency responses
const swarmGroq = new SwarmGroq({
  apiKey: GROQ_API_KEY,
  // Configure with optimal settings for sub-100ms latency
  maxConcurrentRequests: 10,
  retryAttempts: 3,
  retryDelay: 50, // ms
});

// Input schema for the groqInference function
export const groqInferenceInputSchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty"),
  context: z.string().optional(),
  model: z.enum(['llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma-7b-it']).default('llama3-8b-8192'),
  temperature: z.number().min(0).max(1).default(0.7),
  maxTokens: z.number().positive().default(1024),
  stream: z.boolean().default(true),
});

export type GroqInferenceInput = z.infer<typeof groqInferenceInputSchema>;

/**
 * Performs inference using Groq's Swarm cluster for ultra-low latency responses
 * @param args The input parameters for the inference
 * @param context The request context
 * @returns A streaming response from the Groq API
 */
export const groqInference = async (rawArgs: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, "Unauthorized");
  }

  const args = ensureArgsSchemaOrThrowHttpError(groqInferenceInputSchema, rawArgs);

  try {
    // Construct the messages array
    const messages = [
      {
        role: "user",
        content: args.context
          ? `${args.context}\n\n${args.prompt}`
          : args.prompt
      }
    ];

    // Use swarmGroq for streaming responses with sub-100ms latency
    if (args.stream) {
      return swarmGroq.chat.completions.create({
        messages,
        model: args.model,
        temperature: args.temperature,
        max_tokens: args.maxTokens,
        stream: true,
      });
    }

    // Use standard groq client for non-streaming responses
    else {
      const completion = await groq.chat.completions.create({
        messages,
        model: args.model,
        temperature: args.temperature,
        max_tokens: args.maxTokens,
      });

      return completion;
    }
  } catch (error: any) {
    console.error("Groq inference error:", error);
    throw new HttpError(
      error.status || 500,
      error.message || "Failed to get response from Groq"
    );
  }
};

/**
 * Helper function to handle streaming responses on the client side
 * This can be imported and used in frontend components
 */
export const handleGroqStream = async (
  stream: AsyncIterable<any>,
  onChunk: (chunk: string) => void,
  onComplete?: (fullText: string) => void
) => {
  let fullText = '';

  try {
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullText += content;
        onChunk(content);
      }
    }

    if (onComplete) {
      onComplete(fullText);
    }

    return fullText;
  } catch (error) {
    console.error('Error processing Groq stream:', error);
    throw error;
  }
};import { Groq } from '@groq/groq-sdk';
import { SwarmGroq } from 'swarm-groq';
import { HttpError } from 'wasp/server';
import * as z from 'zod';
import { ensureArgsSchemaOrThrowHttpError } from '../server/validation';

// Initialize Groq client with API key
const GROQ_API_KEY = process.env.GROQ_API_KEY || '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';

// Initialize the standard Groq client
const groq = new Groq({
  apiKey: GROQ_API_KEY,
});

// Initialize the Swarm Groq client for high-performance, low-latency responses
const swarmGroq = new SwarmGroq({
  apiKey: GROQ_API_KEY,
  // Configure with optimal settings for sub-100ms latency
  maxConcurrentRequests: 10,
  retryAttempts: 3,
  retryDelay: 50, // ms
});

// Input schema for the groqInference function
export const groqInferenceInputSchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty"),
  context: z.string().optional(),
  model: z.enum(['llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma-7b-it']).default('llama3-8b-8192'),
  temperature: z.number().min(0).max(1).default(0.7),
  maxTokens: z.number().positive().default(1024),
  stream: z.boolean().default(true),
});

export type GroqInferenceInput = z.infer<typeof groqInferenceInputSchema>;

/**
 * Performs inference using Groq's Swarm cluster for ultra-low latency responses
 * @param args The input parameters for the inference
 * @param context The request context
 * @returns A streaming response from the Groq API
 */
export const groqInference = async (rawArgs: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, "Unauthorized");
  }

  const args = ensureArgsSchemaOrThrowHttpError(groqInferenceInputSchema, rawArgs);

  try {
    // Construct the messages array
    const messages = [
      {
        role: "user",
        content: args.context
          ? `${args.context}\n\n${args.prompt}`
          : args.prompt
      }
    ];

    // Use swarmGroq for streaming responses with sub-100ms latency
    if (args.stream) {
      return swarmGroq.chat.completions.create({
        messages,
        model: args.model,
        temperature: args.temperature,
        max_tokens: args.maxTokens,
        stream: true,
      });
    }

    // Use standard groq client for non-streaming responses
    else {
      const completion = await groq.chat.completions.create({
        messages,
        model: args.model,
        temperature: args.temperature,
        max_tokens: args.maxTokens,
      });

      return completion;
    }
  } catch (error: any) {
    console.error("Groq inference error:", error);
    throw new HttpError(
      error.status || 500,
      error.message || "Failed to get response from Groq"
    );
  }
};

/**
 * Helper function to handle streaming responses on the client side
 * This can be imported and used in frontend components
 */
export const handleGroqStream = async (
  stream: AsyncIterable<any>,
  onChunk: (chunk: string) => void,
  onComplete?: (fullText: string) => void
) => {
  let fullText = '';

  try {
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullText += content;
        onChunk(content);
      }
    }

    if (onComplete) {
      onComplete(fullText);
    }

    return fullText;
  } catch (error) {
    console.error('Error processing Groq stream:', error);
    throw error;
  }
};import { Groq } from '@groq/groq-sdk';
import { SwarmGroq } from 'swarm-groq';
import { HttpError } from 'wasp/server';
import * as z from 'zod';
import { ensureArgsSchemaOrThrowHttpError } from '../server/validation';

// Initialize Groq client with API key
const GROQ_API_KEY = process.env.GROQ_API_KEY || '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';

// Initialize the standard Groq client
const groq = new Groq({
  apiKey: GROQ_API_KEY,
});

// Initialize the Swarm Groq client for high-performance, low-latency responses
const swarmGroq = new SwarmGroq({
  apiKey: GROQ_API_KEY,
  // Configure with optimal settings for sub-100ms latency
  maxConcurrentRequests: 10,
  retryAttempts: 3,
  retryDelay: 50, // ms
});

// Input schema for the groqInference function
export const groqInferenceInputSchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty"),
  context: z.string().optional(),
  model: z.enum(['llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma-7b-it']).default('llama3-8b-8192'),
  temperature: z.number().min(0).max(1).default(0.7),
  maxTokens: z.number().positive().default(1024),
  stream: z.boolean().default(true),
});

export type GroqInferenceInput = z.infer<typeof groqInferenceInputSchema>;

/**
 * Performs inference using Groq's Swarm cluster for ultra-low latency responses
 * @param args The input parameters for the inference
 * @param context The request context
 * @returns A streaming response from the Groq API
 */
export const groqInference = async (rawArgs: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, "Unauthorized");
  }

  const args = ensureArgsSchemaOrThrowHttpError(groqInferenceInputSchema, rawArgs);

  try {
    // Construct the messages array
    const messages = [
      {
        role: "user",
        content: args.context
          ? `${args.context}\n\n${args.prompt}`
          : args.prompt
      }
    ];

    // Use swarmGroq for streaming responses with sub-100ms latency
    if (args.stream) {
      return swarmGroq.chat.completions.create({
        messages,
        model: args.model,
        temperature: args.temperature,
        max_tokens: args.maxTokens,
        stream: true,
      });
    }

    // Use standard groq client for non-streaming responses
    else {
      const completion = await groq.chat.completions.create({
        messages,
        model: args.model,
        temperature: args.temperature,
        max_tokens: args.maxTokens,
      });

      return completion;
    }
  } catch (error: any) {
    console.error("Groq inference error:", error);
    throw new HttpError(
      error.status || 500,
      error.message || "Failed to get response from Groq"
    );
  }
};

/**
 * Helper function to handle streaming responses on the client side
 * This can be imported and used in frontend components
 */
export const handleGroqStream = async (
  stream: AsyncIterable<any>,
  onChunk: (chunk: string) => void,
  onComplete?: (fullText: string) => void
) => {
  let fullText = '';

  try {
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullText += content;
        onChunk(content);
      }
    }

    if (onComplete) {
      onComplete(fullText);
    }

    return fullText;
  } catch (error) {
    console.error('Error processing Groq stream:', error);
    throw error;
  }
};import { Groq } from '@groq/groq-sdk';
import { SwarmGroq } from 'swarm-groq';
import { HttpError } from 'wasp/server';
import * as z from 'zod';
import { ensureArgsSchemaOrThrowHttpError } from '../server/validation';

// Initialize Groq client with API key
const GROQ_API_KEY = process.env.GROQ_API_KEY || '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';

// Initialize the standard Groq client
const groq = new Groq({
  apiKey: GROQ_API_KEY,
});

// Initialize the Swarm Groq client for high-performance, low-latency responses
const swarmGroq = new SwarmGroq({
  apiKey: GROQ_API_KEY,
  // Configure with optimal settings for sub-100ms latency
  maxConcurrentRequests: 10,
  retryAttempts: 3,
  retryDelay: 50, // ms
});

// Input schema for the groqInference function
export const groqInferenceInputSchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty"),
  context: z.string().optional(),
  model: z.enum(['llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma-7b-it']).default('llama3-8b-8192'),
  temperature: z.number().min(0).max(1).default(0.7),
  maxTokens: z.number().positive().default(1024),
  stream: z.boolean().default(true),
});

export type GroqInferenceInput = z.infer<typeof groqInferenceInputSchema>;

/**
 * Performs inference using Groq's Swarm cluster for ultra-low latency responses
 * @param args The input parameters for the inference
 * @param context The request context
 * @returns A streaming response from the Groq API
 */
export const groqInference = async (rawArgs: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, "Unauthorized");
  }

  const args = ensureArgsSchemaOrThrowHttpError(groqInferenceInputSchema, rawArgs);

  try {
    // Construct the messages array
    const messages = [
      {
        role: "user",
        content: args.context
          ? `${args.context}\n\n${args.prompt}`
          : args.prompt
      }
    ];

    // Use swarmGroq for streaming responses with sub-100ms latency
    if (args.stream) {
      return swarmGroq.chat.completions.create({
        messages,
        model: args.model,
        temperature: args.temperature,
        max_tokens: args.maxTokens,
        stream: true,
      });
    }

    // Use standard groq client for non-streaming responses
    else {
      const completion = await groq.chat.completions.create({
        messages,
        model: args.model,
        temperature: args.temperature,
        max_tokens: args.maxTokens,
      });

      return completion;
    }
  } catch (error: any) {
    console.error("Groq inference error:", error);
    throw new HttpError(
      error.status || 500,
      error.message || "Failed to get response from Groq"
    );
  }
};

/**
 * Helper function to handle streaming responses on the client side
 * This can be imported and used in frontend components
 */
export const handleGroqStream = async (
  stream: AsyncIterable<any>,
  onChunk: (chunk: string) => void,
  onComplete?: (fullText: string) => void
) => {
  let fullText = '';

  try {
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullText += content;
        onChunk(content);
      }
    }

    if (onComplete) {
      onComplete(fullText);
    }

    return fullText;
  } catch (error) {
    console.error('Error processing Groq stream:', error);
    throw error;
  }
};import { Groq } from '@groq/groq-sdk';
import { SwarmGroq } from 'swarm-groq';
import { HttpError } from 'wasp/server';
import * as z from 'zod';
import { ensureArgsSchemaOrThrowHttpError } from '../server/validation';

// Initialize Groq client with API key
const GROQ_API_KEY = process.env.GROQ_API_KEY || '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';

// Initialize the standard Groq client
const groq = new Groq({
  apiKey: GROQ_API_KEY,
});

// Initialize the Swarm Groq client for high-performance, low-latency responses
const swarmGroq = new SwarmGroq({
  apiKey: GROQ_API_KEY,
  // Configure with optimal settings for sub-100ms latency
  maxConcurrentRequests: 10,
  retryAttempts: 3,
  retryDelay: 50, // ms
});

// Input schema for the groqInference function
export const groqInferenceInputSchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty"),
  context: z.string().optional(),
  model: z.enum(['llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma-7b-it']).default('llama3-8b-8192'),
  temperature: z.number().min(0).max(1).default(0.7),
  maxTokens: z.number().positive().default(1024),
  stream: z.boolean().default(true),
});

export type GroqInferenceInput = z.infer<typeof groqInferenceInputSchema>;

/**
 * Performs inference using Groq's Swarm cluster for ultra-low latency responses
 * @param args The input parameters for the inference
 * @param context The request context
 * @returns A streaming response from the Groq API
 */
export const groqInference = async (rawArgs: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, "Unauthorized");
  }

  const args = ensureArgsSchemaOrThrowHttpError(groqInferenceInputSchema, rawArgs);

  try {
    // Construct the messages array
    const messages = [
      {
        role: "user",
        content: args.context
          ? `${args.context}\n\n${args.prompt}`
          : args.prompt
      }
    ];

    // Use swarmGroq for streaming responses with sub-100ms latency
    if (args.stream) {
      return swarmGroq.chat.completions.create({
        messages,
        model: args.model,
        temperature: args.temperature,
        max_tokens: args.maxTokens,
        stream: true,
      });
    }

    // Use standard groq client for non-streaming responses
    else {
      const completion = await groq.chat.completions.create({
        messages,
        model: args.model,
        temperature: args.temperature,
        max_tokens: args.maxTokens,
      });

      return completion;
    }
  } catch (error: any) {
    console.error("Groq inference error:", error);
    throw new HttpError(
      error.status || 500,
      error.message || "Failed to get response from Groq"
    );
  }
};

/**
 * Helper function to handle streaming responses on the client side
 * This can be imported and used in frontend components
 */
export const handleGroqStream = async (
  stream: AsyncIterable<any>,
  onChunk: (chunk: string) => void,
  onComplete?: (fullText: string) => void
) => {
  let fullText = '';

  try {
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullText += content;
        onChunk(content);
      }
    }

    if (onComplete) {
      onComplete(fullText);
    }

    return fullText;
  } catch (error) {
    console.error('Error processing Groq stream:', error);
    throw error;
  }
};import { Groq } from '@groq/groq-sdk';
import { SwarmGroq } from 'swarm-groq';
import { HttpError } from 'wasp/server';
import * as z from 'zod';
import { ensureArgsSchemaOrThrowHttpError } from '../server/validation';

// Initialize Groq client with API key
const GROQ_API_KEY = process.env.GROQ_API_KEY || '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';

// Initialize the standard Groq client
const groq = new Groq({
  apiKey: GROQ_API_KEY,
});

// Initialize the Swarm Groq client for high-performance, low-latency responses
const swarmGroq = new SwarmGroq({
  apiKey: GROQ_API_KEY,
  // Configure with optimal settings for sub-100ms latency
  maxConcurrentRequests: 10,
  retryAttempts: 3,
  retryDelay: 50, // ms
});

// Input schema for the groqInference function
export const groqInferenceInputSchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty"),
  context: z.string().optional(),
  model: z.enum(['llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma-7b-it']).default('llama3-8b-8192'),
  temperature: z.number().min(0).max(1).default(0.7),
  maxTokens: z.number().positive().default(1024),
  stream: z.boolean().default(true),
});

export type GroqInferenceInput = z.infer<typeof groqInferenceInputSchema>;

/**
 * Performs inference using Groq's Swarm cluster for ultra-low latency responses
 * @param args The input parameters for the inference
 * @param context The request context
 * @returns A streaming response from the Groq API
 */
export const groqInference = async (rawArgs: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, "Unauthorized");
  }

  const args = ensureArgsSchemaOrThrowHttpError(groqInferenceInputSchema, rawArgs);

  try {
    // Construct the messages array
    const messages = [
      {
        role: "user",
        content: args.context
          ? `${args.context}\n\n${args.prompt}`
          : args.prompt
      }
    ];

    // Use swarmGroq for streaming responses with sub-100ms latency
    if (args.stream) {
      return swarmGroq.chat.completions.create({
        messages,
        model: args.model,
        temperature: args.temperature,
        max_tokens: args.maxTokens,
        stream: true,
      });
    }

    // Use standard groq client for non-streaming responses
    else {
      const completion = await groq.chat.completions.create({
        messages,
        model: args.model,
        temperature: args.temperature,
        max_tokens: args.maxTokens,
      });

      return completion;
    }
  } catch (error: any) {
    console.error("Groq inference error:", error);
    throw new HttpError(
      error.status || 500,
      error.message || "Failed to get response from Groq"
    );
  }
};

/**
 * Helper function to handle streaming responses on the client side
 * This can be imported and used in frontend components
 */
export const handleGroqStream = async (
  stream: AsyncIterable<any>,
  onChunk: (chunk: string) => void,
  onComplete?: (fullText: string) => void
) => {
  let fullText = '';

  try {
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullText += content;
        onChunk(content);
      }
    }

    if (onComplete) {
      onComplete(fullText);
    }

    return fullText;
  } catch (error) {
    console.error('Error processing Groq stream:', error);
    throw error;
  }
};