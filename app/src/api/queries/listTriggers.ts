/**
 * Query to list triggers
 */
import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import { TriggerSourceType } from '@prisma/client';

export type ListTriggersInput = {
  page?: number;
  limit?: number;
  sourceType?: TriggerSourceType;
  moduleId?: string;
  status?: string;
  agentId?: string;
  workflowId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: 'timestamp' | 'status' | 'duration';
  sortOrder?: 'asc' | 'desc';
};

export const listTriggers = async (
  { 
    page = 1, 
    limit = 20, 
    sourceType, 
    moduleId, 
    status, 
    agentId, 
    workflowId, 
    userId,
    startDate,
    endDate,
    search,
    sortBy = 'timestamp',
    sortOrder = 'desc'
  }: ListTriggersInput, 
  context: any
) => {
  try {
    // Ensure user is authenticated
    if (!context.user) {
      throw new HttpError(401, 'You must be logged in to list triggers');
    }

    // Build the where clause
    const where: any = {};

    if (sourceType) {
      where.sourceType = sourceType;
    }

    if (moduleId) {
      where.source = {
        moduleId,
      };
    }

    if (status) {
      where.status = status;
    }

    if (agentId) {
      where.agentId = agentId;
    }

    if (workflowId) {
      where.workflowId = workflowId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (startDate) {
      where.timestamp = {
        ...where.timestamp,
        gte: new Date(startDate),
      };
    }

    if (endDate) {
      where.timestamp = {
        ...where.timestamp,
        lte: new Date(endDate),
      };
    }

    if (search) {
      where.OR = [
        {
          source: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          agent: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          workflow: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          tags: {
            has: search,
          },
        },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build the orderBy clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Get the triggers
    const triggers = await prisma.agentTrigger.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        source: true,
        agent: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        workflow: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        execution: {
          select: {
            id: true,
            status: true,
            completedAt: true,
          },
        },
      },
    });

    // Get the total count
    const totalCount = await prisma.agentTrigger.count({ where });

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    return {
      triggers,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  } catch (error: any) {
    console.error('Error listing triggers:', error);
    throw new HttpError(500, `Failed to list triggers: ${error.message}`);
  }
};
