/**
 * API route for getting the result of a query request
 */
import { HttpError } from 'wasp/server';
import { withErrorHandling } from '../../middleware';
import { validateRequest } from '../../middleware/validation';
import { requirePermission } from '../../middleware/rbac';
import { z } from 'zod';
import { prisma } from 'wasp/server';
import { LoggingService } from '../../../shared/services/logging';

// Define the schema for the request
const getQueryResultSchema = z.object({
  queryRequestId: z.string().uuid('Invalid query request ID'),
});

export const getQueryResult = withErrorHandling(async (args, context) => {
  // Apply RBAC middleware - require 'query-requests:read' permission
  const user = await requirePermission({
    resource: 'query-requests',
    action: 'read',
    adminOverride: true,
    auditRejection: true,
  })(context);

  // Validate the request
  const validatedArgs = validateRequest(args, getQueryResultSchema);

  try {
    // Get the query request
    const queryRequest = await prisma.agentQueryRequest.findUnique({
      where: { id: validatedArgs.queryRequestId },
      include: {
        queryLog: true,
      },
    });

    if (!queryRequest) {
      throw new HttpError(404, 'Query request not found');
    }

    // Check if the user has permission to view this query request
    if (queryRequest.userId !== user.id) {
      // Check if the user is an admin or has permission to view all query requests
      const hasPermission = await prisma.userPermission.findFirst({
        where: {
          userId: user.id,
          permission: {
            resource: 'query-requests',
            action: 'read-all',
          },
        },
      });

      if (!hasPermission) {
        throw new HttpError(403, 'You do not have permission to view this query result');
      }
    }

    // Log the query result access
    await LoggingService.logSystemEvent({
      message: `Query result accessed: ${queryRequest.id}`,
      level: 'INFO',
      category: 'DATA_ACCESS',
      source: 'agent-query-api',
      userId: user.id,
      tags: ['agent-query', 'result', 'read'],
      metadata: {
        queryRequestId: queryRequest.id,
        agentId: queryRequest.agentId,
        status: queryRequest.status,
        hasResult: !!queryRequest.executionResult,
      },
    });

    return {
      status: queryRequest.status,
      data: queryRequest.executionResult,
      error: queryRequest.executionError,
      rejectionReason: queryRequest.rejectionReason,
      executedAt: queryRequest.executedAt,
      queryLog: queryRequest.queryLog,
    };
  } catch (error) {
    console.error('Error getting query result:', error);
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(500, 'Failed to get query result');
  }
});
