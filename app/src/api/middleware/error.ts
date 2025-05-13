/**
 * Error handling middleware for API routes
 */
import { HttpError } from 'wasp/server';

/**
 * Standard error handler for API routes
 * @param fn The route handler function
 * @returns A wrapped function that catches and formats errors
 */
export const withErrorHandling = <T, U>(fn: (args: T, context: any) => Promise<U>) => {
  return async (args: T, context: any): Promise<U> => {
    try {
      return await fn(args, context);
    } catch (error) {
      // Import here to avoid circular dependencies
      const { LoggingService } = require('../../shared/services/logging');

      // Log the error
      LoggingService.error({
        message: 'API error',
        userId: context?.user?.id,
        module: 'api',
        category: 'ERROR',
        error,
        metadata: {
          args: JSON.stringify(args).substring(0, 1000) // Truncate to avoid huge logs
        }
      });

      // Format and rethrow HttpErrors
      if (error instanceof HttpError) {
        throw error;
      }

      // Convert other errors to HttpErrors
      throw new HttpError(500, 'Internal server error', {
        originalError: process.env.NODE_ENV === 'production'
          ? undefined
          : error instanceof Error ? error.message : String(error)
      });
    }
  };
};

/**
 * Rate limiting middleware
 * This is a simple in-memory implementation. For production,
 * consider using a distributed solution like Redis.
 */
const requestCounts: Record<string, { count: number, resetAt: number }> = {};

export const rateLimit = (
  context: any,
  {
    maxRequests = 100,
    windowMs = 60 * 1000, // 1 minute
    identifier = (ctx: any) => ctx.user?.id || ctx.req.ip
  } = {}
) => {
  const id = identifier(context);
  const now = Date.now();

  // Initialize or reset if window has passed
  if (!requestCounts[id] || requestCounts[id].resetAt < now) {
    requestCounts[id] = { count: 0, resetAt: now + windowMs };
  }

  // Increment count
  requestCounts[id].count++;

  // Check if over limit
  if (requestCounts[id].count > maxRequests) {
    throw new HttpError(429, 'Too many requests', {
      retryAfter: Math.ceil((requestCounts[id].resetAt - now) / 1000)
    });
  }
};
