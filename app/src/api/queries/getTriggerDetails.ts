/**
 * Query to get trigger details
 */
import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import { TriggerSourceType } from '@prisma/client';

export type GetTriggerDetailsInput = {
  id: string;
};

export const getTriggerDetails = async ({ id }: GetTriggerDetailsInput, context: any) => {
  try {
    // Ensure user is authenticated
    if (!context.user) {
      throw new HttpError(401, 'You must be logged in to view trigger details');
    }

    // Get the trigger details
    const trigger = await prisma.agentTrigger.findUnique({
      where: { id },
      include: {
        source: true,
        agent: {
          select: {
            id: true,
            name: true,
            type: true,
            description: true,
          },
        },
        workflow: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        execution: {
          include: {
            workflow: true,
          },
        },
        executionFlows: {
          orderBy: {
            stepNumber: 'asc',
          },
        },
      },
    });

    if (!trigger) {
      throw new HttpError(404, `Trigger with ID ${id} not found`);
    }

    // Get related logs
    const logs = await prisma.systemLog.findMany({
      where: {
        OR: [
          { traceId: trigger.traceId },
          { spanId: trigger.spanId },
          { parentSpanId: trigger.spanId },
        ],
      },
      orderBy: {
        timestamp: 'asc',
      },
      take: 100,
    });

    // Get related agent logs
    const agentLogs = await prisma.agentLog.findMany({
      where: {
        OR: [
          { traceId: trigger.traceId },
          { spanId: trigger.spanId },
          { parentSpanId: trigger.spanId },
        ],
      },
      orderBy: {
        timestamp: 'asc',
      },
      take: 100,
    });

    return {
      trigger,
      logs,
      agentLogs,
    };
  } catch (error: any) {
    console.error('Error getting trigger details:', error);
    
    if (error instanceof HttpError) {
      throw error;
    }
    
    throw new HttpError(500, `Failed to get trigger details: ${error.message}`);
  }
};
