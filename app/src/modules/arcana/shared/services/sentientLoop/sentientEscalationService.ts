import { prisma } from 'wasp/server';
import { LoggingService } from '../logging';

/**
 * Service for managing escalations in the Sentient Loop™ system
 */
export class SentientEscalationService {
  /**
   * Creates an escalation for a checkpoint
   * 
   * @param params Escalation parameters
   * @returns The created escalation
   */
  static async createEscalation(params: {
    checkpointId: string;
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    reason: string;
    metadata?: any;
  }) {
    try {
      // Log the operation
      LoggingService.info({
        message: `Creating Sentient Loop escalation: ${params.level} level`,
        module: 'arcana',
        category: 'SENTIENT_LOOP',
        metadata: {
          checkpointId: params.checkpointId,
          level: params.level,
          reason: params.reason
        }
      });

      // Create the escalation
      const escalation = await prisma.sentientEscalation.create({
        data: {
          checkpointId: params.checkpointId,
          level: params.level as any,
          reason: params.reason,
          status: 'PENDING',
          metadata: params.metadata || {}
        }
      });

      // Update the checkpoint status to ESCALATED
      await prisma.sentientCheckpoint.update({
        where: {
          id: params.checkpointId
        },
        data: {
          status: 'ESCALATED'
        }
      });

      return escalation;
    } catch (error) {
      LoggingService.error({
        message: 'Error creating Sentient Loop escalation',
        module: 'arcana',
        category: 'SENTIENT_LOOP',
        error,
        metadata: {
          checkpointId: params.checkpointId,
          level: params.level
        }
      });
      throw error;
    }
  }

  /**
   * Resolves an escalation
   * 
   * @param params Resolution parameters
   * @returns The updated escalation
   */
  static async resolveEscalation(params: {
    escalationId: string;
    userId: string;
    status: 'APPROVED' | 'REJECTED' | 'MODIFIED';
    resolution: string;
  }) {
    try {
      // Log the operation
      LoggingService.info({
        message: `Resolving Sentient Loop escalation: ${params.escalationId}`,
        userId: params.userId,
        module: 'arcana',
        category: 'SENTIENT_LOOP',
        metadata: {
          escalationId: params.escalationId,
          status: params.status
        }
      });

      // Update the escalation
      const escalation = await prisma.sentientEscalation.update({
        where: {
          id: params.escalationId
        },
        data: {
          status: params.status as any,
          resolvedAt: new Date(),
          resolvedBy: params.userId,
          resolution: params.resolution
        },
        include: {
          checkpoint: true
        }
      });

      // Update the checkpoint status to match the escalation resolution
      await prisma.sentientCheckpoint.update({
        where: {
          id: escalation.checkpointId
        },
        data: {
          status: params.status as any,
          resolvedAt: new Date(),
          resolvedBy: params.userId,
          resolution: params.resolution
        }
      });

      return escalation;
    } catch (error) {
      LoggingService.error({
        message: 'Error resolving Sentient Loop escalation',
        userId: params.userId,
        module: 'arcana',
        category: 'SENTIENT_LOOP',
        error,
        metadata: {
          escalationId: params.escalationId,
          status: params.status
        }
      });
      throw error;
    }
  }

  /**
   * Gets pending escalations
   * 
   * @param params Query parameters
   * @returns Array of pending escalations
   */
  static async getPendingEscalations(params: {
    level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    limit?: number;
  }) {
    try {
      const { level, limit = 10 } = params;

      // Build the query
      const query: any = {
        where: {
          status: 'PENDING'
        },
        orderBy: [
          {
            level: 'desc'
          },
          {
            createdAt: 'desc'
          }
        ],
        take: limit,
        include: {
          checkpoint: {
            include: {
              agent: {
                select: {
                  id: true,
                  name: true,
                  type: true
                }
              },
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        }
      };

      // Add level filter if provided
      if (level) {
        query.where.level = level;
      }

      const escalations = await prisma.sentientEscalation.findMany(query);

      return escalations;
    } catch (error) {
      LoggingService.error({
        message: 'Error getting pending Sentient Loop escalations',
        module: 'arcana',
        category: 'SENTIENT_LOOP',
        error,
        metadata: {
          level: params.level
        }
      });
      throw error;
    }
  }

  /**
   * Gets escalations by checkpoint
   * 
   * @param checkpointId The checkpoint ID
   * @returns Array of escalations
   */
  static async getEscalationsByCheckpoint(checkpointId: string) {
    try {
      const escalations = await prisma.sentientEscalation.findMany({
        where: {
          checkpointId
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return escalations;
    } catch (error) {
      LoggingService.error({
        message: 'Error getting Sentient Loop escalations by checkpoint',
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
}