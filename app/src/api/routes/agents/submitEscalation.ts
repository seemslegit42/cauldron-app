/**
 * API route for submitting agent escalations
 */
import { HttpError } from 'wasp/server';
import { withErrorHandling } from '../../middleware';
import { validateRequest } from '../../middleware/validation';
import { requirePermission } from '../../middleware/rbac';
import { z } from 'zod';
import { AgentFeedbackService } from '../../../server/services/agentFeedbackService';
import { LoggingService } from '../../../shared/services/logging';

// Define the schema for the request
const submitEscalationSchema = z.object({
  agentId: z.string().uuid('Invalid agent ID'),
  sessionId: z.string().optional(),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  metadata: z.record(z.any()).optional(),
});

export const submitEscalation = withErrorHandling(async (args, context) => {
  // Apply RBAC middleware - require 'agent-escalation:submit' permission
  const user = await requirePermission({
    resource: 'agent-escalation',
    action: 'submit',
    adminOverride: true,
    auditRejection: true,
  })(context);

  // Validate the request
  const validatedArgs = validateRequest(args, submitEscalationSchema);

  try {
    // Submit the escalation
    const escalation = await AgentFeedbackService.submitEscalation({
      userId: user.id,
      agentId: validatedArgs.agentId,
      sessionId: validatedArgs.sessionId,
      reason: validatedArgs.reason,
      priority: validatedArgs.priority,
      metadata: validatedArgs.metadata,
    });

    // Log the action
    await LoggingService.log({
      level: 'WARN',
      category: 'API',
      message: `User ${user.id} submitted escalation for agent ${validatedArgs.agentId}`,
      userId: user.id,
      metadata: {
        action: 'submitEscalation',
        agentId: validatedArgs.agentId,
        priority: validatedArgs.priority,
      },
    });

    return escalation;
  } catch (error) {
    console.error('Error submitting escalation:', error);
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(500, 'Failed to submit escalation');
  }
});
