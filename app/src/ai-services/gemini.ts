/**
 * Gemini AI Integration for Cauldron
 * 
 * This module provides integration with Google's Gemini AI models,
 * supporting both streaming and non-streaming responses.
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/genai';
import { HttpError } from 'wasp/server';
import * as z from 'zod';
import { ensureArgsSchemaOrThrowHttpError } from '../server/validation';
import { AiLogging, createLoggingContext } from '../shared/services/loggingIntegration';

// Initialize Gemini client with API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Input schema for the geminiInference function
export const geminiInferenceInputSchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty"),
  context: z.string().optional(),
  model: z.enum(['gemini-pro', 'gemini-pro-vision', 'gemini-ultra']).default('gemini-pro'),
  temperature: z.number().min(0).max(1).default(0.7),
  maxTokens: z.number().positive().default(1024),
  stream: z.boolean().default(true),
  systemPrompt: z.string().optional(),
});

export type GeminiInferenceInput = z.infer<typeof geminiInferenceInputSchema>;

// Safety settings for Gemini models
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

/**
 * Performs inference using Google's Gemini models
 * @param args The input parameters for the inference
 * @param context The request context
 * @returns A streaming or non-streaming response from the Gemini API
 */
export const geminiInference = async (rawArgs: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, "Unauthorized");
  }

  const args = ensureArgsSchemaOrThrowHttpError(geminiInferenceInputSchema, rawArgs);

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
    // Get the model
    const model = genAI.getGenerativeModel({
      model: args.model,
      safetySettings,
      generationConfig: {
        temperature: args.temperature,
        maxOutputTokens: args.maxTokens,
        topP: 0.95,
      },
    });

    // Construct the chat history
    const history = [];
    
    // Add system prompt if provided
    if (args.systemPrompt) {
      history.push({
        role: 'user',
        parts: [{ text: args.systemPrompt }],
      });
      history.push({
        role: 'model',
        parts: [{ text: 'I understand and will follow these instructions.' }],
      });
    }
    
    // Construct the content with context if provided
    const content = args.context
      ? `${args.context}\n\n${args.prompt}`
      : args.prompt;

    // Create a chat session
    const chat = model.startChat({
      history,
      generationConfig: {
        temperature: args.temperature,
        maxOutputTokens: args.maxTokens,
        topP: 0.95,
      },
    });

    // Use streaming for real-time responses
    if (args.stream) {
      const result = await chat.sendMessageStream(content);
      
      // Log successful completion
      await logger.logCompletion('Streaming response started');
      
      return result;
    } 
    // Use non-streaming for complete responses
    else {
      const result = await chat.sendMessage(content);
      const response = result.response;
      const text = response.text();
      
      // Log successful completion
      await logger.logCompletion(text);
      
      return {
        text,
        response,
      };
    }
  } catch (error: any) {
    console.error("Gemini inference error:", error);
    
    // Log the error
    await logger.logCompletion(null, error);
    
    throw new HttpError(
      error.status || 500,
      error.message || "Failed to get response from Gemini"
    );
  }
};

/**
 * Helper function to handle streaming responses on the client side
 * This can be imported and used in frontend components
 */
export const handleGeminiStream = async (
  stream: AsyncIterable<any>,
  onChunk: (chunk: string) => void,
  onComplete?: (fullText: string) => void
) => {
  let fullText = '';

  try {
    for await (const chunk of stream) {
      const content = chunk.text();
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
    console.error('Error processing Gemini stream:', error);
    throw error;
  }
};