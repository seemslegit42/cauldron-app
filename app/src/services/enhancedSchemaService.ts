import { prisma } from 'wasp/server';
import type {
  AgentSession,
  ModuleState,
  AI_Agent,
  InteractionMemory,
  SessionMetric,
  SessionEvent,
  StateTransition,
  AgentMetric,
  AgentVersion,
  MemoryAccess,
  MemoryAnnotation,
  User
} from '@prisma/client';

/**
 * Enhanced Schema Service
 * 
 * This service provides methods for interacting with the enhanced schema models.
 */
export class EnhancedSchemaService {
  /**
   * Create a new agent session
   */
  static async createSession(data: {
    sessionId: string;
    userId?: string;
    agentId?: string;
    status: string;
    sessionPurpose?: string;
    businessContext?: string;
    sessionTags?: string[];
    sessionSource?: string;
    parentSessionId?: string;
    context?: Record<string, any>;
  }): Promise<AgentSession> {
    return prisma.agentSession.create({
      data: {
        sessionId: data.sessionId,
        userId: data.userId,
        agentId: data.agentId,
        status: data.status,
        sessionPurpose: data.sessionPurpose,
        businessContext: data.businessContext,
        sessionTags: data.sessionTags,
        sessionSource: data.sessionSource,
        parentSessionId: data.parentSessionId,
        context: data.context,
        startedAt: new Date()
      }
    });
  }

  /**
   * End an agent session
   */
  static async endSession(sessionId: string, data: {
    qualityScore?: number;
    userSatisfaction?: number;
    learningOutcomes?: Record<string, any>;
  }): Promise<AgentSession> {
    return prisma.agentSession.update({
      where: { sessionId },
      data: {
        status: 'completed',
        endedAt: new Date(),
        qualityScore: data.qualityScore,
        userSatisfaction: data.userSatisfaction,
        learningOutcomes: data.learningOutcomes
      }
    });
  }

  /**
   * Create a session metric
   */
  static async createSessionMetric(data: {
    sessionId: string;
    metricType: string;
    metricValue: number;
    metadata?: Record<string, any>;
  }): Promise<SessionMetric> {
    return prisma.sessionMetric.create({
      data: {
        sessionId: data.sessionId,
        metricType: data.metricType,
        metricValue: data.metricValue,
        metadata: data.metadata
      }
    });
  }

  /**
   * Create a session event
   */
  static async createSessionEvent(data: {
    sessionId: string;
    eventType: string;
    eventData: Record<string, any>;
    sequence: number;
    duration?: number;
  }): Promise<SessionEvent> {
    return prisma.sessionEvent.create({
      data: {
        sessionId: data.sessionId,
        eventType: data.eventType,
        eventData: data.eventData,
        sequence: data.sequence,
        duration: data.duration
      }
    });
  }

  /**
   * Create or update a module state
   */
  static async upsertModuleState(data: {
    moduleId: string;
    state: Record<string, any>;
    version: string;
    sessionId?: string;
    previousStateId?: string;
    stateType?: string;
    isSnapshot?: boolean;
    snapshotReason?: string;
    expiresAt?: Date;
  }): Promise<ModuleState> {
    // Generate a hash of the state for quick comparison
    const stateHash = this.generateStateHash(data.state);

    // Check if an identical state already exists
    const existingState = await prisma.moduleState.findFirst({
      where: {
        moduleId: data.moduleId,
        stateHash,
        version: data.version
      }
    });

    if (existingState) {
      return existingState;
    }

    return prisma.moduleState.create({
      data: {
        moduleId: data.moduleId,
        state: data.state,
        version: data.version,
        sessionId: data.sessionId,
        previousStateId: data.previousStateId,
        stateType: data.stateType,
        stateHash,
        isSnapshot: data.isSnapshot || false,
        snapshotReason: data.snapshotReason,
        expiresAt: data.expiresAt
      }
    });
  }

  /**
   * Record a state transition
   */
  static async recordStateTransition(data: {
    stateId: string;
    triggerId?: string;
    triggerType: string;
    transitionData: Record<string, any>;
    previousValues?: Record<string, any>;
    newValues?: Record<string, any>;
  }): Promise<StateTransition> {
    return prisma.stateTransition.create({
      data: {
        stateId: data.stateId,
        triggerId: data.triggerId,
        triggerType: data.triggerType,
        transitionData: data.transitionData,
        previousValues: data.previousValues,
        newValues: data.newValues
      }
    });
  }

  /**
   * Update agent metrics
   */
  static async updateAgentMetrics(agentId: string, metrics: {
    metricType: string;
    metricValue: number;
    timeframe: string;
    metadata?: Record<string, any>;
  }[]): Promise<AgentMetric[]> {
    const results: AgentMetric[] = [];

    for (const metric of metrics) {
      const result = await prisma.agentMetric.create({
        data: {
          agentId,
          metricType: metric.metricType,
          metricValue: metric.metricValue,
          timeframe: metric.timeframe,
          metadata: metric.metadata
        }
      });
      results.push(result);
    }

    return results;
  }

  /**
   * Create a new agent version
   */
  static async createAgentVersion(data: {
    agentId: string;
    versionNumber: string;
    changes: Record<string, any>;
    createdById: string;
    isActive?: boolean;
    performance?: Record<string, any>;
  }): Promise<AgentVersion> {
    // If this version is active, deactivate all other versions
    if (data.isActive) {
      await prisma.agentVersion.updateMany({
        where: {
          agentId: data.agentId,
          isActive: true
        },
        data: {
          isActive: false,
          deactivatedAt: new Date()
        }
      });
    }

    return prisma.agentVersion.create({
      data: {
        agentId: data.agentId,
        versionNumber: data.versionNumber,
        changes: data.changes,
        createdById: data.createdById,
        isActive: data.isActive || false,
        activatedAt: data.isActive ? new Date() : null,
        performance: data.performance
      }
    });
  }

  /**
   * Create a memory
   */
  static async createMemory(data: {
    userId: string;
    agentId: string;
    sessionId?: string;
    type: string;
    memoryType?: string;
    content: Record<string, any>;
    importance?: number;
    confidence?: number;
    sourceType?: string;
    expiresAt?: Date;
    relatedMemories?: Record<string, any>;
  }): Promise<InteractionMemory> {
    return prisma.interactionMemory.create({
      data: {
        userId: data.userId,
        agentId: data.agentId,
        sessionId: data.sessionId,
        type: data.type,
        memoryType: data.memoryType,
        content: data.content,
        importance: data.importance || 1.0,
        confidence: data.confidence,
        sourceType: data.sourceType,
        expiresAt: data.expiresAt,
        relatedMemories: data.relatedMemories
      }
    });
  }

  /**
   * Record memory access
   */
  static async recordMemoryAccess(data: {
    memoryId: string;
    accessType: string;
    accessedBy: string;
    accessorType: string;
    context?: string;
    usefulness?: number;
  }): Promise<MemoryAccess> {
    // Update the memory's access count and last accessed time
    await prisma.interactionMemory.update({
      where: { id: data.memoryId },
      data: {
        accessCount: { increment: 1 },
        lastAccessedAt: new Date()
      }
    });

    return prisma.memoryAccess.create({
      data: {
        memoryId: data.memoryId,
        accessType: data.accessType,
        accessedBy: data.accessedBy,
        accessorType: data.accessorType,
        context: data.context,
        usefulness: data.usefulness
      }
    });
  }

  /**
   * Create a memory annotation
   */
  static async createMemoryAnnotation(data: {
    memoryId: string;
    annotationType: string;
    content: string;
    createdById: string;
    isApplied?: boolean;
  }): Promise<MemoryAnnotation> {
    return prisma.memoryAnnotation.create({
      data: {
        memoryId: data.memoryId,
        annotationType: data.annotationType,
        content: data.content,
        createdById: data.createdById,
        isApplied: data.isApplied || false,
        appliedAt: data.isApplied ? new Date() : null
      }
    });
  }

  /**
   * Apply a memory annotation
   */
  static async applyMemoryAnnotation(id: string): Promise<MemoryAnnotation> {
    return prisma.memoryAnnotation.update({
      where: { id },
      data: {
        isApplied: true,
        appliedAt: new Date()
      }
    });
  }

  /**
   * Generate a hash of a state object for quick comparison
   * This is a simple implementation and could be improved for production use
   */
  private static generateStateHash(state: Record<string, any>): string {
    return Buffer.from(JSON.stringify(state)).toString('base64');
  }
}

export default EnhancedSchemaService;
