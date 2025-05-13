/**
 * Temporal Memory API Operations
 * 
 * API endpoints for working with time-based memory queries and temporal awareness.
 */

import { z } from 'zod';
import { 
  queryMemoriesByTime,
  compareMemoriesAcrossPeriods
} from '../services/temporalMemoryService';
import { MemoryContentType } from '../types';
import { logger } from '../../../shared/logger';
import { prisma } from '../../../../prisma/client';

/**
 * Query memories using natural language with temporal references
 */
export const queryMemoriesByTimeOperation = async (args: any, context: any) => {
  try {
    // Validate input
    const schema = z.object({
      query: z.string(),
      userId: z.string(),
      agentId: z.string().optional(),
      sessionId: z.string().optional(),
      contentType: z.enum([
        MemoryContentType.CONVERSATION,
        MemoryContentType.FACT,
        MemoryContentType.PREFERENCE,
        MemoryContentType.TASK,
        MemoryContentType.DECISION,
        MemoryContentType.OUTCOME,
        MemoryContentType.FEEDBACK,
        MemoryContentType.EVENT,
        MemoryContentType.COMPARISON,
      ]).optional(),
      limit: z.number().positive().default(10),
      minImportance: z.number().min(0).max(5).default(0),
    });

    const validatedArgs = schema.parse(args);

    // Ensure the user has permission
    if (context.user?.id !== validatedArgs.userId && !context.user?.isAdmin) {
      throw new Error('Unauthorized: Cannot query memories for another user');
    }

    // Query the memories
    const result = await queryMemoriesByTime(
      validatedArgs.query,
      validatedArgs.userId,
      {
        agentId: validatedArgs.agentId,
        sessionId: validatedArgs.sessionId,
        contentType: validatedArgs.contentType,
        limit: validatedArgs.limit,
        minImportance: validatedArgs.minImportance,
      }
    );

    return result;
  } catch (error) {
    logger.error('Error in queryMemoriesByTimeOperation:', { error, args });
    throw new Error(`Failed to query memories by time: ${error.message}`);
  }
};

/**
 * Compare memories across different time periods
 */
export const compareMemoriesAcrossPeriodsOperation = async (args: any, context: any) => {
  try {
    // Validate input
    const schema = z.object({
      userId: z.string(),
      period1: z.string(),
      period2: z.string(),
      agentId: z.string().optional(),
      contentType: z.enum([
        MemoryContentType.CONVERSATION,
        MemoryContentType.FACT,
        MemoryContentType.PREFERENCE,
        MemoryContentType.TASK,
        MemoryContentType.DECISION,
        MemoryContentType.OUTCOME,
        MemoryContentType.FEEDBACK,
        MemoryContentType.EVENT,
        MemoryContentType.COMPARISON,
      ]).optional(),
      context: z.string().optional(),
      limit: z.number().positive().default(20),
    });

    const validatedArgs = schema.parse(args);

    // Ensure the user has permission
    if (context.user?.id !== validatedArgs.userId && !context.user?.isAdmin) {
      throw new Error('Unauthorized: Cannot compare memories for another user');
    }

    // Compare the memories
    const result = await compareMemoriesAcrossPeriods(
      validatedArgs.userId,
      validatedArgs.period1,
      validatedArgs.period2,
      {
        agentId: validatedArgs.agentId,
        contentType: validatedArgs.contentType,
        context: validatedArgs.context,
        limit: validatedArgs.limit,
      }
    );

    return result;
  } catch (error) {
    logger.error('Error in compareMemoriesAcrossPeriodsOperation:', { error, args });
    throw new Error(`Failed to compare memories across periods: ${error.message}`);
  }
};

/**
 * Get temporal distribution of memories
 */
export const getTemporalDistributionOperation = async (args: any, context: any) => {
  try {
    // Validate input
    const schema = z.object({
      userId: z.string(),
      agentId: z.string().optional(),
      contentType: z.enum([
        MemoryContentType.CONVERSATION,
        MemoryContentType.FACT,
        MemoryContentType.PREFERENCE,
        MemoryContentType.TASK,
        MemoryContentType.DECISION,
        MemoryContentType.OUTCOME,
        MemoryContentType.FEEDBACK,
        MemoryContentType.EVENT,
        MemoryContentType.COMPARISON,
      ]).optional(),
    });

    const validatedArgs = schema.parse(args);

    // Ensure the user has permission
    if (context.user?.id !== validatedArgs.userId && !context.user?.isAdmin) {
      throw new Error('Unauthorized: Cannot get memory distribution for another user');
    }

    // Build the where clause
    const whereClause: any = {
      userId: validatedArgs.userId,
      ...(validatedArgs.agentId && { agentId: validatedArgs.agentId }),
      ...(validatedArgs.contentType && { type: validatedArgs.contentType }),
    };

    // Get memory counts by month
    const monthlyDistribution = await prisma.$queryRaw<Array<{ month: string; count: number }>>`
      SELECT 
        TO_CHAR("createdAt", 'YYYY-MM') as month,
        COUNT(*) as count
      FROM "InteractionMemory"
      WHERE ${whereClause}
      GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
      ORDER BY month
    `;

    // Get memory counts by day of week
    const dowDistribution = await prisma.$queryRaw<Array<{ dow: string; count: number }>>`
      SELECT 
        TO_CHAR("createdAt", 'Day') as dow,
        COUNT(*) as count
      FROM "InteractionMemory"
      WHERE ${whereClause}
      GROUP BY TO_CHAR("createdAt", 'Day')
      ORDER BY MIN("createdAt")
    `;

    // Get memory counts by hour of day
    const hourDistribution = await prisma.$queryRaw<Array<{ hour: number; count: number }>>`
      SELECT 
        EXTRACT(HOUR FROM "createdAt") as hour,
        COUNT(*) as count
      FROM "InteractionMemory"
      WHERE ${whereClause}
      GROUP BY EXTRACT(HOUR FROM "createdAt")
      ORDER BY hour
    `;

    return {
      monthly: monthlyDistribution.reduce((acc, { month, count }) => {
        acc[month] = Number(count);
        return acc;
      }, {} as Record<string, number>),
      
      dayOfWeek: dowDistribution.reduce((acc, { dow, count }) => {
        acc[dow.trim()] = Number(count);
        return acc;
      }, {} as Record<string, number>),
      
      hourOfDay: hourDistribution.reduce((acc, { hour, count }) => {
        acc[hour.toString()] = Number(count);
        return acc;
      }, {} as Record<string, number>),
    };
  } catch (error) {
    logger.error('Error in getTemporalDistributionOperation:', { error, args });
    throw new Error(`Failed to get temporal distribution: ${error.message}`);
  }
};