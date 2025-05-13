/**
 * API route for retrieving escalations from the Sentient Loop™
 */
import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import { withErrorHandling } from '../../middleware';
import { validateRequest } from '../../middleware/validation';
import { requirePermission } from '../../middleware/rbac';
import { z } from 'zod';
import { LoggingService } from '../../../shared/services/logging';

// Schema for escalation query parameters
const getEscalationsSchema = z.object({
  status: z.enum(['PENDING', 'ACKNOWLEDGED', 'RESOLVED', 'REJECTED']).optional(),
  level: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  moduleId: z.string().optional(),
  agentId: z.string().uuid().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sortBy: z.enum(['createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const getEscalations = withErrorHandling(async (args, context) => {
  // Apply RBAC middleware - require 'sentient-loop:read-escalations' permission
  const user = await requirePermission({
    resource: 'sentient-loop',
    action: 'read-escalations',
    adminOverride: true,
    auditRejection: true
  })(context);

  // Validate request data
  const validatedData = validateRequest(args, getEscalationsSchema);

  try {
    // Log the operation
    LoggingService.info({
      message: `API: Retrieving escalations`,
      userId: user.id,
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      metadata: {
        status: validatedData.status,
        level: validatedData.level,
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

    if (validatedData.level) {
      where.level = validatedData.level;
    }

    if (validatedData.moduleId) {
      where.moduleId = validatedData.moduleId;
    }

    if (validatedData.agentId) {
      where.agentId = validatedData.agentId;
    }

    // Get the total count
    const totalCount = await prisma.sentientEscalation.count({ where });

    // Get the escalations
    const escalations = await prisma.sentientEscalation.findMany({
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
        level: true,
        status: true,
        reason: true,
        moduleId: true,
        agentId: true,
        checkpointId: true,
        metadata: true,
        resolvedAt: true,
        resolvedBy: true,
        resolution: true,
        traceId: true
      }
    });

    return {
      escalations,
      pagination: {
        total: totalCount,
        limit: validatedData.limit,
        offset: validatedData.offset,
        hasMore: validatedData.offset + escalations.length < totalCount
      }
    };
  } catch (error) {
    console.error('Error retrieving escalations:', error);
    LoggingService.error({
      message: 'Failed to retrieve escalations',
      userId: user.id,
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      error
    });
    throw error;
  }
});
