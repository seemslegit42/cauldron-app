/**
 * API route for listing query requests
 */
import { HttpError } from 'wasp/server';
import { withErrorHandling } from '../../middleware';
import { validateRequest } from '../../middleware/validation';
import { requirePermission } from '../../middleware/rbac';
import { z } from 'zod';
import { prisma } from 'wasp/server';
import { QueryApprovalStatus } from '../../../shared/types/entities/agentQuery';
import { LoggingService } from '../../../shared/services/logging';

// Define the schema for the request
const listQueryRequestsSchema = z.object({
  agentId: z.string().uuid('Invalid agent ID').optional(),
  userId: z.string().uuid('Invalid user ID').optional(),
  status: z.nativeEnum(QueryApprovalStatus).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const listQueryRequests = withErrorHandling(async (args, context) => {
  // Apply RBAC middleware - require 'query-requests:list' permission
  const user = await requirePermission({
    resource: 'query-requests',
    action: 'list',
    adminOverride: true,
    auditRejection: true,
  })(context);

  // Validate the request
  const validatedArgs = validateRequest(args, listQueryRequestsSchema);

  try {
    // Build the query filter
    const filter: any = {};
    
    // If a specific agent ID is provided, filter by it
    if (validatedArgs.agentId) {
      filter.agentId = validatedArgs.agentId;
    }
    
    // If a specific user ID is provided, filter by it
    if (validatedArgs.userId) {
      // Check if the user has permission to view other users' query requests
      if (validatedArgs.userId !== user.id) {
        const hasPermission = await prisma.userPermission.findFirst({
          where: {
            userId: user.id,
            permission: {
              resource: 'query-requests',
              action: 'list-all',
            },
          },
        });

        if (!hasPermission) {
          throw new HttpError(403, 'You do not have permission to view other users\' query requests');
        }
      }
      
      filter.userId = validatedArgs.userId;
    } else {
      // If no user ID is provided, check if the user has permission to view all query requests
      const hasPermission = await prisma.userPermission.findFirst({
        where: {
          userId: user.id,
          permission: {
            resource: 'query-requests',
            action: 'list-all',
          },
        },
      });

      if (!hasPermission) {
        // If not, only show the user's own query requests
        filter.userId = user.id;
      }
    }
    
    // If a specific status is provided, filter by it
    if (validatedArgs.status) {
      filter.status = validatedArgs.status;
    }

    // Calculate pagination
    const skip = (validatedArgs.page - 1) * validatedArgs.limit;
    
    // Get the query requests
    const queryRequests = await prisma.agentQueryRequest.findMany({
      where: filter,
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: validatedArgs.limit,
    });

    // Get the total count
    const totalCount = await prisma.agentQueryRequest.count({
      where: filter,
    });

    // Log the query requests listing
    await LoggingService.logSystemEvent({
      message: `Query requests listed`,
      level: 'INFO',
      category: 'DATA_ACCESS',
      source: 'agent-query-api',
      userId: user.id,
      tags: ['agent-query', 'request', 'list'],
      metadata: {
        count: queryRequests.length,
        totalCount,
        page: validatedArgs.page,
        limit: validatedArgs.limit,
        agentId: validatedArgs.agentId,
        userId: validatedArgs.userId,
        status: validatedArgs.status,
      },
    });

    return {
      queryRequests,
      pagination: {
        page: validatedArgs.page,
        limit: validatedArgs.limit,
        totalCount,
        totalPages: Math.ceil(totalCount / validatedArgs.limit),
      },
    };
  } catch (error) {
    console.error('Error listing query requests:', error);
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(500, 'Failed to list query requests');
  }
});
