/**
 * API route for getting agent feedback
 */
import { HttpError } from 'wasp/server';
import { withErrorHandling } from '../../middleware';
import { validateRequest } from '../../middleware/validation';
import { requirePermission } from '../../middleware/rbac';
import { z } from 'zod';
import { AgentFeedbackService } from '../../../server/services/agentFeedbackService';
import { LoggingService } from '../../../shared/services/logging';

// Define the schema for the request
const getFeedbackSchema = z.object({
  agentId: z.string().uuid('Invalid agent ID').optional(),
  userId: z.string().uuid('Invalid user ID').optional(),
  sessionId: z.string().optional(),
  minRating: z.number().int().min(1).max(5).optional(),
  maxRating: z.number().int().min(1).max(5).optional(),
  category: z.string().optional(),
  startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const getFeedback = withErrorHandling(async (args, context) => {
  // Apply RBAC middleware - require 'agent-feedback:read' permission
  const user = await requirePermission({
    resource: 'agent-feedback',
    action: 'read',
    adminOverride: true,
    auditRejection: true,
  })(context);

  // Validate the request
  const validatedArgs = validateRequest(args, getFeedbackSchema);

  try {
    // Get the feedback
    const feedback = await AgentFeedbackService.getFeedback({
      agentId: validatedArgs.agentId,
      userId: validatedArgs.userId,
      sessionId: validatedArgs.sessionId,
      minRating: validatedArgs.minRating,
      maxRating: validatedArgs.maxRating,
      category: validatedArgs.category,
      startDate: validatedArgs.startDate,
      endDate: validatedArgs.endDate,
      page: validatedArgs.page,
      limit: validatedArgs.limit,
    });

    // Log the action
    await LoggingService.log({
      level: 'INFO',
      category: 'API',
      message: `User ${user.id} retrieved agent feedback`,
      userId: user.id,
      metadata: {
        action: 'getFeedback',
        filters: {
          agentId: validatedArgs.agentId,
          userId: validatedArgs.userId,
          sessionId: validatedArgs.sessionId,
          minRating: validatedArgs.minRating,
          maxRating: validatedArgs.maxRating,
          category: validatedArgs.category,
        },
      },
    });

    return feedback;
  } catch (error) {
    console.error('Error getting feedback:', error);
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(500, 'Failed to get feedback');
  }
});
