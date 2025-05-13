import { prisma } from 'wasp/server';
import { LoggingService } from '../logging';

/**
 * Service for managing decision traces in the Sentient Loop™ system
 */
export class SentientDecisionTraceService {
  /**
   * Records a decision trace for accountability and traceability
   * 
   * @param params Decision trace parameters
   * @returns The created decision trace
   */
  static async recordDecisionTrace(params: {
    checkpointId: string;
    decisionMaker: string;
    decisionType: 'human' | 'agent' | 'system';
    reasoning?: string;
    factors?: any;
    alternatives?: any;
    metadata?: any;
  }) {
    try {
      // Log the operation
      LoggingService.info({
        message: `Recording Sentient Loop decision trace`,
        module: 'arcana',
        category: 'SENTIENT_LOOP',
        metadata: {
          checkpointId: params.checkpointId,
          decisionMaker: params.decisionMaker,
          decisionType: params.decisionType
        }
      });

      // Create the decision trace
      const decisionTrace = await prisma.sentientDecisionTrace.create({
        data: {
          checkpointId: params.checkpointId,
          decisionMaker: params.decisionMaker,
          decisionType: params.decisionType,
          reasoning: params.reasoning,
          factors: params.factors || {},
          alternatives: params.alternatives || {},
          metadata: params.metadata || {}
        }
      });

      return decisionTrace;
    } catch (error) {
      LoggingService.error({
        message: 'Error recording Sentient Loop decision trace',
        module: 'arcana',
        category: 'SENTIENT_LOOP',
        error,
        metadata: {
          checkpointId: params.checkpointId,
          decisionMaker: params.decisionMaker,
          decisionType: params.decisionType
        }
      });
      throw error;
    }
  }

  /**
   * Gets decision traces for a checkpoint
   * 
   * @param checkpointId The checkpoint ID
   * @returns Array of decision traces
   */
  static async getDecisionTracesByCheckpoint(checkpointId: string) {
    try {
      const decisionTraces = await prisma.sentientDecisionTrace.findMany({
        where: {
          checkpointId
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return decisionTraces;
    } catch (error) {
      LoggingService.error({
        message: 'Error getting Sentient Loop decision traces',
        module: 'arcana',
        category: 'SENTIENT_LOOP',
        error,
        metadata: {
          checkpointId
        }
      });
      throw error;
    }
  }

  /**
   * Gets decision traces by decision maker
   * 
   * @param params Query parameters
   * @returns Array of decision traces
   */
  static async getDecisionTracesByDecisionMaker(params: {
    decisionMaker: string;
    decisionType?: 'human' | 'agent' | 'system';
    limit?: number;
  }) {
    try {
      const { decisionMaker, decisionType, limit = 10 } = params;

      // Build the query
      const query: any = {
        where: {
          decisionMaker
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit,
        include: {
          checkpoint: {
            select: {
              id: true,
              title: true,
              moduleId: true,
              status: true
            }
          }
        }
      };

      // Add decision type filter if provided
      if (decisionType) {
        query.where.decisionType = decisionType;
      }

      const decisionTraces = await prisma.sentientDecisionTrace.findMany(query);

      return decisionTraces;
    } catch (error) {
      LoggingService.error({
        message: 'Error getting Sentient Loop decision traces by decision maker',
        module: 'arcana',
        category: 'SENTIENT_LOOP',
        error,
        metadata: {
          decisionMaker: params.decisionMaker,
          decisionType: params.decisionType
        }
      });
      throw error;
    }
  }

  /**
   * Gets decision trace statistics
   * 
   * @param params Query parameters
   * @returns Decision trace statistics
   */
  static async getDecisionTraceStats(params: {
    userId?: string;
    moduleId?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    try {
      const { userId, moduleId, startDate, endDate } = params;

      // Build the base query for checkpoints
      const checkpointQuery: any = {
        where: {}
      };

      if (userId) {
        checkpointQuery.where.userId = userId;
      }

      if (moduleId) {
        checkpointQuery.where.moduleId = moduleId;
      }

      if (startDate || endDate) {
        checkpointQuery.where.createdAt = {};
        
        if (startDate) {
          checkpointQuery.where.createdAt.gte = startDate;
        }
        
        if (endDate) {
          checkpointQuery.where.createdAt.lte = endDate;
        }
      }

      // Get checkpoint IDs matching the criteria
      const checkpoints = await prisma.sentientCheckpoint.findMany({
        where: checkpointQuery.where,
        select: {
          id: true
        }
      });

      const checkpointIds = checkpoints.map(c => c.id);

      // Get decision trace statistics
      const decisionTraces = await prisma.sentientDecisionTrace.findMany({
        where: {
          checkpointId: {
            in: checkpointIds
          }
        },
        select: {
          decisionType: true
        }
      });

      // Calculate statistics
      const stats = {
        total: decisionTraces.length,
        byType: {
          human: decisionTraces.filter(dt => dt.decisionType === 'human').length,
          agent: decisionTraces.filter(dt => dt.decisionType === 'agent').length,
          system: decisionTraces.filter(dt => dt.decisionType === 'system').length
        }
      };

      return stats;
    } catch (error) {
      LoggingService.error({
        message: 'Error getting Sentient Loop decision trace statistics',
        module: 'arcana',
        category: 'SENTIENT_LOOP',
        error,
        metadata: {
          userId: params.userId,
          moduleId: params.moduleId
        }
      });
      throw error;
    }
  }
}