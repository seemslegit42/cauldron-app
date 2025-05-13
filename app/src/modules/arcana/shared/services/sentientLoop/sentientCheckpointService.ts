import { prisma } from 'wasp/server';
import { LoggingService } from '../logging';

/**
 * Service for managing checkpoints in the Sentient Loop™ system
 */
export class SentientCheckpointService {
  /**
   * Creates a checkpoint in the Sentient Loop™ system
   * 
   * @param params Checkpoint parameters
   * @returns The created checkpoint
   */
  static async createCheckpoint(params: {
    userId: string;
    moduleId: string;
    agentId?: string;
    sessionId?: string;
    type: 'DECISION_REQUIRED' | 'CONFIRMATION_REQUIRED' | 'INFORMATION_REQUIRED' | 'ESCALATION_REQUIRED' | 'VALIDATION_REQUIRED' | 'AUDIT_REQUIRED';
    title: string;
    description: string;
    originalPayload: any;
    metadata?: any;
    expiresAt?: Date;
    traceId?: string;
    parentCheckpointId?: string;
  }) {
    try {
      // Log the operation
      LoggingService.info({
        message: `Creating Sentient Loop checkpoint: ${params.title}`,
        userId: params.userId,
        module: 'arcana',
        category: 'SENTIENT_LOOP',
        metadata: {
          moduleId: params.moduleId,
          agentId: params.agentId,
          type: params.type,
          sessionId: params.sessionId,
          traceId: params.traceId
        }
      });

      // Create the checkpoint
      const checkpoint = await prisma.sentientCheckpoint.create({
        data: {
          userId: params.userId,
          moduleId: params.moduleId,
          agentId: params.agentId,
          sessionId: params.sessionId,
          type: params.type as any,
          status: 'PENDING',
          title: params.title,
          description: params.description,
          originalPayload: params.originalPayload,
          metadata: params.metadata || {},
          expiresAt: params.expiresAt,
          traceId: params.traceId,
          parentCheckpointId: params.parentCheckpointId
        }
      });

      return checkpoint;
    } catch (error) {
      LoggingService.error({
        message: 'Error creating Sentient Loop checkpoint',
        userId: params.userId,
        module: 'arcana',
        category: 'SENTIENT_LOOP',
        error,
        metadata: {
          moduleId: params.moduleId,
          agentId: params.agentId,
          type: params.type
        }
      });
      throw error;
    }
  }

  /**
   * Resolves a checkpoint in the Sentient Loop™ system
   * 
   * @param params Resolution parameters
   * @returns The updated checkpoint
   */
  static async resolveCheckpoint(params: {
    checkpointId: string;
    userId: string;
    status: 'APPROVED' | 'REJECTED' | 'MODIFIED' | 'ESCALATED';
    resolution: string;
    modifiedPayload?: any;
  }) {
    try {
      // Log the operation
      LoggingService.info({
        message: `Resolving Sentient Loop checkpoint: ${params.checkpointId}`,
        userId: params.userId,
        module: 'arcana',
        category: 'SENTIENT_LOOP',
        metadata: {
          checkpointId: params.checkpointId,
          status: params.status
        }
      });

      // Update the checkpoint
      const checkpoint = await prisma.sentientCheckpoint.update({
        where: {
          id: params.checkpointId
        },
        data: {
          status: params.status as any,
          resolvedAt: new Date(),
          resolvedBy: params.userId,
          resolution: params.resolution,
          modifiedPayload: params.modifiedPayload
        }
      });

      return checkpoint;
    } catch (error) {
      LoggingService.error({
        message: 'Error resolving Sentient Loop checkpoint',
        userId: params.userId,
        module: 'arcana',
        category: 'SENTIENT_LOOP',
        error,
        metadata: {
          checkpointId: params.checkpointId,
          status: params.status
        }
      });
      throw error;
    }
  }

  /**
   * Gets pending checkpoints for a user
   * 
   * @param userId The user ID
   * @param moduleId Optional module ID to filter by
   * @returns Array of pending checkpoints
   */
  static async getPendingCheckpoints(userId: string, moduleId?: string) {
    try {
      // Build the query
      const query: any = {
        where: {
          userId,
          status: 'PENDING'
        },
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              type: true
            }
          },
          escalations: true,
          memorySnapshots: {
            where: {
              type: 'CONTEXT'
            },
            take: 1
          }
        }
      };

      // Add module filter if provided
      if (moduleId) {
        query.where.moduleId = moduleId;
      }

      // Get the checkpoints
      const checkpoints = await prisma.sentientCheckpoint.findMany(query);

      return checkpoints;
    } catch (error) {
      LoggingService.error({
        message: 'Error getting pending Sentient Loop checkpoints',
        userId,
        module: 'arcana',
        category: 'SENTIENT_LOOP',
        error,
        metadata: {
          moduleId
        }
      });
      throw error;
    }
  }

  /**
   * Gets a checkpoint by ID
   * 
   * @param checkpointId The checkpoint ID
   * @returns The checkpoint
   */
  static async getCheckpointById(checkpointId: string) {
    try {
      const checkpoint = await prisma.sentientCheckpoint.findUnique({
        where: {
          id: checkpointId
        },
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              type: true
            }
          },
          escalations: true,
          memorySnapshots: true,
          decisionTraces: true,
          childCheckpoints: {
            include: {
              escalations: true
            }
          }
        }
      });

      return checkpoint;
    } catch (error) {
      LoggingService.error({
        message: 'Error getting Sentient Loop checkpoint',
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
   * Gets checkpoints for a user with pagination
   * 
   * @param params Query parameters
   * @returns Paginated checkpoints
   */
  static async getCheckpoints(params: {
    userId: string;
    moduleId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const { userId, moduleId, status, page = 1, limit = 10 } = params;
      
      // Build the query
      const query: any = {
        where: {
          userId
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              type: true
            }
          },
          escalations: true
        }
      };

      // Add filters if provided
      if (moduleId) {
        query.where.moduleId = moduleId;
      }

      if (status) {
        query.where.status = status;
      }

      // Get the checkpoints
      const checkpoints = await prisma.sentientCheckpoint.findMany(query);

      // Get the total count
      const total = await prisma.sentientCheckpoint.count({
        where: query.where
      });

      return {
        data: checkpoints,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      LoggingService.error({
        message: 'Error getting Sentient Loop checkpoints',
        userId: params.userId,
        module: 'arcana',
        category: 'SENTIENT_LOOP',
        error,
        metadata: {
          moduleId: params.moduleId,
          status: params.status
        }
      });
      throw error;
    }
  }
}