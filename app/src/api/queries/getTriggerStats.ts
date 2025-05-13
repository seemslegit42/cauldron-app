/**
 * Query to get trigger statistics
 */
import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import { TriggerSourceType } from '@prisma/client';

export type GetTriggerStatsInput = {
  timeframe?: 'day' | 'week' | 'month' | 'year' | 'all';
  moduleId?: string;
  sourceType?: TriggerSourceType;
};

export const getTriggerStats = async ({ timeframe = 'week', moduleId, sourceType }: GetTriggerStatsInput, context: any) => {
  try {
    // Ensure user is authenticated
    if (!context.user) {
      throw new HttpError(401, 'You must be logged in to view trigger statistics');
    }

    // Calculate the start date based on the timeframe
    const startDate = new Date();
    switch (timeframe) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'all':
        // No date filter
        break;
    }

    // Build the where clause
    const where: any = {};
    if (timeframe !== 'all') {
      where.timestamp = {
        gte: startDate,
      };
    }
    if (moduleId) {
      where.source = {
        moduleId,
      };
    }
    if (sourceType) {
      where.sourceType = sourceType;
    }

    // Get total count
    const totalCount = await prisma.agentTrigger.count({
      where,
    });

    // Get count by status
    const countByStatus = await prisma.$queryRaw`
      SELECT status, COUNT(*) as count
      FROM "AgentTrigger"
      WHERE ${timeframe !== 'all' ? prisma.sql`timestamp >= ${startDate}` : prisma.sql`1=1`}
      ${moduleId ? prisma.sql`AND "sourceId" IN (SELECT id FROM "TriggerSource" WHERE "moduleId" = ${moduleId})` : prisma.sql``}
      ${sourceType ? prisma.sql`AND "sourceType" = ${sourceType}` : prisma.sql``}
      GROUP BY status
      ORDER BY count DESC
    `;

    // Get count by source type
    const countBySourceType = await prisma.$queryRaw`
      SELECT "sourceType", COUNT(*) as count
      FROM "AgentTrigger"
      WHERE ${timeframe !== 'all' ? prisma.sql`timestamp >= ${startDate}` : prisma.sql`1=1`}
      ${moduleId ? prisma.sql`AND "sourceId" IN (SELECT id FROM "TriggerSource" WHERE "moduleId" = ${moduleId})` : prisma.sql``}
      ${sourceType ? prisma.sql`AND "sourceType" = ${sourceType}` : prisma.sql``}
      GROUP BY "sourceType"
      ORDER BY count DESC
    `;

    // Get count by module
    const countByModule = await prisma.$queryRaw`
      SELECT ts."moduleId", COUNT(*) as count
      FROM "AgentTrigger" at
      JOIN "TriggerSource" ts ON at."sourceId" = ts.id
      WHERE ${timeframe !== 'all' ? prisma.sql`at.timestamp >= ${startDate}` : prisma.sql`1=1`}
      ${moduleId ? prisma.sql`AND ts."moduleId" = ${moduleId}` : prisma.sql``}
      ${sourceType ? prisma.sql`AND at."sourceType" = ${sourceType}` : prisma.sql``}
      GROUP BY ts."moduleId"
      ORDER BY count DESC
    `;

    // Get count by day
    const countByDay = await prisma.$queryRaw`
      SELECT DATE_TRUNC('day', timestamp) as day, COUNT(*) as count
      FROM "AgentTrigger"
      WHERE ${timeframe !== 'all' ? prisma.sql`timestamp >= ${startDate}` : prisma.sql`1=1`}
      ${moduleId ? prisma.sql`AND "sourceId" IN (SELECT id FROM "TriggerSource" WHERE "moduleId" = ${moduleId})` : prisma.sql``}
      ${sourceType ? prisma.sql`AND "sourceType" = ${sourceType}` : prisma.sql``}
      GROUP BY day
      ORDER BY day ASC
    `;

    // Get average duration by source type
    const avgDurationBySourceType = await prisma.$queryRaw`
      SELECT "sourceType", AVG(duration) as avg_duration
      FROM "AgentTrigger"
      WHERE duration IS NOT NULL
      AND ${timeframe !== 'all' ? prisma.sql`timestamp >= ${startDate}` : prisma.sql`1=1`}
      ${moduleId ? prisma.sql`AND "sourceId" IN (SELECT id FROM "TriggerSource" WHERE "moduleId" = ${moduleId})` : prisma.sql``}
      ${sourceType ? prisma.sql`AND "sourceType" = ${sourceType}` : prisma.sql``}
      GROUP BY "sourceType"
      ORDER BY avg_duration DESC
    `;

    // Get top 10 most frequent triggers
    const topTriggers = await prisma.$queryRaw`
      SELECT ts.name, ts.type, COUNT(*) as count
      FROM "AgentTrigger" at
      JOIN "TriggerSource" ts ON at."sourceId" = ts.id
      WHERE ${timeframe !== 'all' ? prisma.sql`at.timestamp >= ${startDate}` : prisma.sql`1=1`}
      ${moduleId ? prisma.sql`AND ts."moduleId" = ${moduleId}` : prisma.sql``}
      ${sourceType ? prisma.sql`AND at."sourceType" = ${sourceType}` : prisma.sql``}
      GROUP BY ts.name, ts.type
      ORDER BY count DESC
      LIMIT 10
    `;

    // Get error rate by source type
    const errorRateBySourceType = await prisma.$queryRaw`
      SELECT 
        "sourceType", 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed,
        ROUND((SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END)::numeric / COUNT(*)::numeric) * 100, 2) as error_rate
      FROM "AgentTrigger"
      WHERE ${timeframe !== 'all' ? prisma.sql`timestamp >= ${startDate}` : prisma.sql`1=1`}
      ${moduleId ? prisma.sql`AND "sourceId" IN (SELECT id FROM "TriggerSource" WHERE "moduleId" = ${moduleId})` : prisma.sql``}
      ${sourceType ? prisma.sql`AND "sourceType" = ${sourceType}` : prisma.sql``}
      GROUP BY "sourceType"
      ORDER BY error_rate DESC
    `;

    return {
      totalCount,
      countByStatus,
      countBySourceType,
      countByModule,
      countByDay,
      avgDurationBySourceType,
      topTriggers,
      errorRateBySourceType,
    };
  } catch (error: any) {
    console.error('Error getting trigger statistics:', error);
    throw new HttpError(500, `Failed to get trigger statistics: ${error.message}`);
  }
};
