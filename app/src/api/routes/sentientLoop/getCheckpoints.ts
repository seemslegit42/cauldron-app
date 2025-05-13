/**
 * API route for retrieving checkpoints from the Sentient Loop™
 */
import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import { withErrorHandling } from '../../middleware';
import { validateRequest } from '../../middleware/validation';
import { requirePermission } from '../../middleware/rbac';
import { z } from 'zod';
import { LoggingService } from '../../../shared/services/logging';

// Schema for checkpoint query parameters
const getCheckpointsSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'MODIFIED', 'EXPIRED', 'ESCALATED']).optional(),
  moduleId: z.string().optional(),
  agentId: z.string().uuid().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sortBy: z.enum(['createdAt', 'updatedAt', 'expiresAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const getCheckpoints = withErrorHandling(async (args, context) => {
  // Apply RBAC middleware - require 'sentient-loop:read-checkpoints' permission
  const user = await requirePermission({
    resource: 'sentient-loop',
    action: 'read-checkpoints',
    adminOverride: true,
    auditRejection: true
  })(context);

  // Validate request data
  const validatedData = validateRequest(args, getCheckpointsSchema);

  try {
    // Log the operation
    LoggingService.info({
      message: `API: Retrieving checkpoints`,
      userId: user.id,
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      metadata: {
        status: validatedData.status,
        moduleId: validatedData.moduleId,
        agentId: validatedData.agentId
      }
    });

    // Build the query
    const where: any = {
      userId: user.id
    };

    if (validatedData.status) {
      where.status = validatedData.status;
    }

    if (validatedData.moduleId) {
      where.moduleId = validatedData.moduleId;
    }

    if (validatedData.agentId) {
      where.agentId = validatedData.agentId;
    }

    // Get the total count
    const totalCount = await prisma.sentientCheckpoint.count({ where });

    // Get the checkpoints
    const checkpoints = await prisma.sentientCheckpoint.findMany({
      where,
      orderBy: {
        [validatedData.sortBy]: validatedData.sortOrder
      },
      skip: validatedData.offset,
      take: validatedData.limit,
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        type: true,
        status: true,
        title: true,
        description: true,
        moduleId: true,
        agentId: true,
        originalPayload: true,
        modifiedPayload: true,
        metadata: true,
        expiresAt: true,
        resolvedAt: true,
        resolvedBy: true,
        resolution: true,
        traceId: true,
        parentCheckpointId: true
      }
    });

    return {
      checkpoints,
      pagination: {
        total: totalCount,
        limit: validatedData.limit,
        offset: validatedData.offset,
        hasMore: validatedData.offset + checkpoints.length < totalCount
      }
    };
  } catch (error) {
    console.error('Error retrieving checkpoints:', error);
    LoggingService.error({
      message: 'Failed to retrieve checkpoints',
      userId: user.id,
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      error
    });
    throw error;
  }
});
