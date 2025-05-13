/**
 * Validation middleware for API routes
 */
import { HttpError } from 'wasp/server';
import { z } from 'zod';

/**
 * Validates request arguments against a Zod schema
 * @param args The request arguments
 * @param schema The Zod schema to validate against
 * @throws {HttpError} 400 if validation fails
 */
export const validateRequest = <T>(args: unknown, schema: z.ZodType<T>): T => {
  try {
    return schema.parse(args);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message
      }));
      throw new HttpError(400, 'Validation error', { errors: formattedErrors });
    }
    throw new HttpError(400, 'Invalid request data');
  }
};

/**
 * Sanitizes request data to prevent XSS attacks
 * @param data The data to sanitize
 * @returns Sanitized data
 */
export const sanitizeInput = <T extends Record<string, any>>(data: T): T => {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Basic sanitization - replace HTML tags
      sanitized[key] = value.replace(/<[^>]*>/g, '');
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeInput(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as T;
};

/**
 * Combines validation and sanitization
 * @param args The request arguments
 * @param schema The Zod schema to validate against
 * @returns Validated and sanitized data
 */
export const validateAndSanitize = <T>(args: unknown, schema: z.ZodType<T>): T => {
  const validated = validateRequest(args, schema);
  return typeof validated === 'object' && validated !== null
    ? sanitizeInput(validated as Record<string, any>) as T
    : validated;
};
