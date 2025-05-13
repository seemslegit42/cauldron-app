import { prisma } from 'wasp/server';
import { LoggingService } from '../logging';

/**
 * Service for managing memory snapshots in the Sentient Loop™ system
 */
export class SentientMemoryService {
  /**
   * Creates a memory snapshot associated with a checkpoint
   * 
   * @param params Memory snapshot parameters
   * @returns The created memory snapshot
   */
  static async createMemorySnapshot(params: {
    checkpointId: string;
    type: 'DECISION' | 'FEEDBACK' | 'CONTEXT' | 'ESCALATION' | 'AUDIT' | 'SYSTEM';
    content: any;
    metadata?: any;
    importance?: number;
    expiresAt?: Date;
  }) {
    try {
      // Log the operation
      LoggingService.info({
        message: `Creating Sentient Loop memory snapshot`,
        module: 'arcana',
        category: 'SENTIENT_LOOP',
        metadata: {
          checkpointId: params.checkpointId,
          type: params.type
        }
      });

      // Create the memory snapshot
      const memorySnapshot = await prisma.sentientMemorySnapshot.create({
        data: {
          checkpointId: params.checkpointId,
          type: params.type as any,
          content: params.content,
          metadata: params.metadata || {},
          importance: params.importance || 1.0,
          expiresAt: params.expiresAt
        }
      });

      return memorySnapshot;
    } catch (error) {
      LoggingService.error({
        message: 'Error creating Sentient Loop memory snapshot',
        module: 'arcana',
        category: 'SENTIENT_LOOP',
        error,
        metadata: {
          checkpointId: params.checkpointId,
          type: params.type
        }
      });
      throw error;
    }
  }

  /**
   * Gets memory snapshots for a checkpoint
   * 
   * @param checkpointId The checkpoint ID
   * @returns Array of memory snapshots
   */
  static async getMemorySnapshotsByCheckpoint(checkpointId: string) {
    try {
      const memorySnapshots = await prisma.sentientMemorySnapshot.findMany({
        where: {
          checkpointId
        },
        orderBy: [
          {
            importance: 'desc'
          },
          {
            createdAt: 'desc'
          }
        ]
      });

      return memorySnapshots;
    } catch (error) {
      LoggingService.error({
        message: 'Error getting Sentient Loop memory snapshots',
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
   * Gets memory snapshots by type
   * 
   * @param params Query parameters
   * @returns Array of memory snapshots
   */
  static async getMemorySnapshotsByType(params: {
    type: 'DECISION' | 'FEEDBACK' | 'CONTEXT' | 'ESCALATION' | 'AUDIT' | 'SYSTEM';
    limit?: number;
  }) {
    try {
      const { type, limit = 10 } = params;

      const memorySnapshots = await prisma.sentientMemorySnapshot.findMany({
        where: {
          type: type as any
        },
        orderBy: [
          {
            importance: 'desc'
          },
          {
            createdAt: 'desc'
          }
        ],
        take: limit,
        include: {
          checkpoint: {
            select: {
              id: true,
              title: true,
              moduleId: true,
              userId: true
            }
          }
        }
      });

      return memorySnapshots;
    } catch (error) {
      LoggingService.error({
        message: 'Error getting Sentient Loop memory snapshots by type',
        module: 'arcana',
        category: 'SENTIENT_LOOP',
        error,
        metadata: {
          type: params.type
        }
      });
      throw error;
    }
  }

  /**
   * Deletes expired memory snapshots
   * 
   * @returns Number of deleted snapshots
   */
  static async cleanupExpiredMemory() {
    try {
      const result = await prisma.sentientMemorySnapshot.deleteMany({
        where: {
          expiresAt: {
            lt: new Date()
          }
        }
      });

      LoggingService.info({
        message: `Cleaned up ${result.count} expired Sentient Loop memory snapshots`,
        module: 'arcana',
        category: 'SENTIENT_LOOP'
      });

      return result.count;
    } catch (error) {
      LoggingService.error({
        message: 'Error cleaning up expired Sentient Loop memory snapshots',
        module: 'arcana',
        category: 'SENTIENT_LOOP',
        error
      });
      throw error;
    }
  }
}