/**
 * API route for submitting agent feedback
 */
import { HttpError } from 'wasp/server';
import { withErrorHandling } from '../../middleware';
import { validateRequest } from '../../middleware/validation';
import { requirePermission } from '../../middleware/rbac';
import { z } from 'zod';
import { AgentFeedbackService } from '../../../server/services/agentFeedbackService';
import { LoggingService } from '../../../shared/services/logging';

// Define the schema for the request
const submitFeedbackSchema = z.object({
  agentId: z.string().uuid('Invalid agent ID'),
  sessionId: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  feedback: z.string().optional(),
  category: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const submitFeedback = withErrorHandling(async (args, context) => {
  // Apply RBAC middleware - require 'agent-feedback:submit' permission
  const user = await requirePermission({
    resource: 'agent-feedback',
    action: 'submit',
    adminOverride: true,
    auditRejection: true,
  })(context);

  // Validate the request
  const validatedArgs = validateRequest(args, submitFeedbackSchema);

  try {
    // Submit the feedback
    const feedback = await AgentFeedbackService.submitFeedback({
      userId: user.id,
      agentId: validatedArgs.agentId,
      sessionId: validatedArgs.sessionId,
      rating: validatedArgs.rating,
      feedback: validatedArgs.feedback,
      category: validatedArgs.category,
      metadata: validatedArgs.metadata,
    });

    // Log the action
    await LoggingService.log({
      level: 'INFO',
      category: 'API',
      message: `User ${user.id} submitted feedback for agent ${validatedArgs.agentId}`,
      userId: user.id,
      metadata: {
        action: 'submitFeedback',
        agentId: validatedArgs.agentId,
        rating: validatedArgs.rating,
      },
    });

    return feedback;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(500, 'Failed to submit feedback');
  }
});
