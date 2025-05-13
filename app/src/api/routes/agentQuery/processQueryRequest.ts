/**
 * API route for processing a query request (approve or reject)
 */
import { HttpError } from 'wasp/server';
import { withErrorHandling } from '../../middleware';
import { validateRequest } from '../../middleware/validation';
import { requirePermission } from '../../middleware/rbac';
import { z } from 'zod';
import { AgentQueryService } from '../../../server/services/agentQueryService';
import { LoggingService } from '../../../shared/services/logging';

// Define the schema for the request
const processQueryRequestSchema = z.object({
  id: z.string().uuid('Invalid query request ID'),
  approved: z.boolean(),
  rejectionReason: z.string().optional(),
});

export const processQueryRequest = withErrorHandling(async (args, context) => {
  // Apply RBAC middleware - require 'query-requests:process' permission
  const user = await requirePermission({
    resource: 'query-requests',
    action: 'process',
    adminOverride: true,
    auditRejection: true,
  })(context);

  // Validate the request
  const validatedArgs = validateRequest(args, processQueryRequestSchema);

  try {
    // Process the query request
    const queryRequest = await AgentQueryService.processQueryRequest(user.id, validatedArgs);

    // Log the query request processing
    await LoggingService.logSystemEvent({
      message: `Query request ${validatedArgs.approved ? 'approved' : 'rejected'}: ${queryRequest.id}`,
      level: 'INFO',
      category: 'DATA_ACCESS',
      source: 'agent-query-api',
      userId: user.id,
      tags: ['agent-query', 'request', validatedArgs.approved ? 'approve' : 'reject'],
      metadata: {
        queryRequestId: queryRequest.id,
        agentId: queryRequest.agentId,
        approved: validatedArgs.approved,
        rejectionReason: validatedArgs.rejectionReason,
        targetModel: queryRequest.targetModel,
        action: queryRequest.action,
      },
    });

    return queryRequest;
  } catch (error) {
    console.error('Error processing query request:', error);
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(500, 'Failed to process query request');
  }
});
