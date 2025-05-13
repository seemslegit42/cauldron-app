/**
 * API route for getting agent escalations
 */
import { HttpError } from 'wasp/server';
import { withErrorHandling } from '../../middleware';
import { validateRequest } from '../../middleware/validation';
import { requirePermission } from '../../middleware/rbac';
import { z } from 'zod';
import { AgentFeedbackService } from '../../../server/services/agentFeedbackService';
import { LoggingService } from '../../../shared/services/logging';

// Define the schema for the request
const getEscalationsSchema = z.object({
  agentId: z.string().uuid('Invalid agent ID').optional(),
  userId: z.string().uuid('Invalid user ID').optional(),
  sessionId: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'resolved', 'rejected']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const getEscalations = withErrorHandling(async (args, context) => {
  // Apply RBAC middleware - require 'agent-escalation:read' permission
  const user = await requirePermission({
    resource: 'agent-escalation',
    action: 'read',
    adminOverride: true,
    auditRejection: true,
  })(context);

  // Validate the request
  const validatedArgs = validateRequest(args, getEscalationsSchema);

  try {
    // Get the escalations
    const escalations = await AgentFeedbackService.getEscalations({
      agentId: validatedArgs.agentId,
      userId: validatedArgs.userId,
      sessionId: validatedArgs.sessionId,
      status: validatedArgs.status,
      priority: validatedArgs.priority,
      startDate: validatedArgs.startDate,
      endDate: validatedArgs.endDate,
      page: validatedArgs.page,
      limit: validatedArgs.limit,
    });

    // Log the action
    await LoggingService.log({
      level: 'INFO',
      category: 'API',
      message: `User ${user.id} retrieved agent escalations`,
      userId: user.id,
      metadata: {
        action: 'getEscalations',
        filters: {
          agentId: validatedArgs.agentId,
          userId: validatedArgs.userId,
          sessionId: validatedArgs.sessionId,
          status: validatedArgs.status,
          priority: validatedArgs.priority,
        },
      },
    });

    return escalations;
  } catch (error) {
    console.error('Error getting escalations:', error);
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(500, 'Failed to get escalations');
  }
});
