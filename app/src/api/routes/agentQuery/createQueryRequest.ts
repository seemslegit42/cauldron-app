/**
 * API route for creating a query request from a prompt
 */
import { HttpError } from 'wasp/server';
import { withErrorHandling } from '../../middleware';
import { validateRequest } from '../../middleware/validation';
import { requirePermission } from '../../middleware/rbac';
import { z } from 'zod';
import { AgentQueryService } from '../../../server/services/agentQueryService';
import { LoggingService } from '../../../shared/services/logging';

// Define the schema for the request
const createQueryRequestSchema = z.object({
  agentId: z.string().uuid(),
  sessionId: z.string().optional(),
  prompt: z.string().min(1, 'Prompt is required'),
});

export const createQueryRequest = withErrorHandling(async (args, context) => {
  // Apply RBAC middleware - require 'agent-queries:create' permission
  const user = await requirePermission({
    resource: 'agent-queries',
    action: 'create',
    adminOverride: true,
    auditRejection: true,
  })(context);

  // Validate the request
  const validatedArgs = validateRequest(args, createQueryRequestSchema);

  try {
    // Create the query request
    const result = await AgentQueryService.createQueryRequest(user.id, {
      agentId: validatedArgs.agentId,
      sessionId: validatedArgs.sessionId,
      prompt: validatedArgs.prompt,
    });

    // Log the query request creation
    await LoggingService.logSystemEvent({
      message: `Query request created: ${result.queryRequestId}`,
      level: 'INFO',
      category: 'AGENT_ACTION',
      source: 'agent-query-api',
      userId: user.id,
      tags: ['agent-query', 'create-request'],
      metadata: {
        agentId: validatedArgs.agentId,
        sessionId: validatedArgs.sessionId,
        queryRequestId: result.queryRequestId,
        status: result.status,
        requiresApproval: result.requiresApproval,
      },
    });

    return result;
  } catch (error) {
    console.error('Error creating query request:', error);
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(500, 'Failed to create query request');
  }
});
