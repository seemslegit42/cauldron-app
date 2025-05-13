import { HttpError } from 'wasp/server';
import type { GroqInference } from 'wasp/server/operations';
import { trackedGroqInference } from '../../ai-services/trackedGroqInference';
import { GroqInferenceInput } from '../../ai-services/groq';

/**
 * Server operation that exposes the Groq inference service
 * This operation handles authentication and forwards requests to the Groq service
 * with automatic tracking of prompts, reasoning chains, and response trees
 */
export const groqInference: GroqInference<GroqInferenceInput, any> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Unauthorized');
  }

  try {
    // Check if user has sufficient permissions/credits
    // This is where you would implement your business logic for rate limiting, etc.
    
    // Call the tracked Groq inference service
    // This automatically tracks prompts, reasoning chains, and response trees
    return await trackedGroqInference({
      ...args,
      userId: context.user.id,
      module: args.module || 'default',
      sessionType: 'inference',
      promptCategory: 'user-query',
    }, context);
  } catch (error: any) {
    console.error('Error in groqInference operation:', error);
    throw new HttpError(
      error.statusCode || 500,
      error.message || 'Failed to process Groq inference request'
    );
  }
};
