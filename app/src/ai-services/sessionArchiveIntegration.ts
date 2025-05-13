/**
 * Session Archive Integration
 * 
 * This module integrates the AI session tracking with the tamper-proof archiving system.
 * It provides utilities for automatically archiving completed AI sessions and human-AI interactions.
 */

import { prisma } from 'wasp/server';
import { LoggingService } from '../shared/services/logging';
import { CollaborationArchiveService } from '../modules/sentinel/services/collaborationArchiveService';

/**
 * Interface for session archive parameters
 */
interface ArchiveSessionParams {
  sessionId: string;
  userId: string;
  organizationId?: string;
  retentionPolicy?: string;
  complianceStandards?: string[];
  metadata?: any;
}

/**
 * Archives a completed AI session
 */
export async function archiveAISession(params: ArchiveSessionParams) {
  try {
    const { sessionId, userId, organizationId, metadata } = params;
    
    // Get the session with all related data
    const session = await prisma.aISession.findUnique({
      where: { id: sessionId },
      include: {
        prompts: true,
        systemPrompts: true,
        reasoningChains: {
          include: {
            reasoningSteps: true,
          },
        },
      },
    });
    
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    
    // Determine retention policy and compliance standards
    const retentionPolicy = params.retentionPolicy || 'standard';
    const complianceStandards = params.complianceStandards || ['SOC2', 'GDPR'];
    
    // Create the archive
    const archiveResult = await CollaborationArchiveService.createArchive({
      userId,
      organizationId,
      archiveType: 'ai-session',
      sourceSessionId: sessionId,
      startTimestamp: session.startedAt,
      endTimestamp: session.completedAt || new Date(),
      content: {
        session,
        metadata: {
          ...metadata,
          archivedAt: new Date(),
        },
      },
      retentionPolicy,
      complianceStandards,
      metadata: {
        sessionType: session.sessionType,
        module: session.module,
        totalTokens: session.totalTokens,
        totalLatencyMs: session.totalLatencyMs,
        ...metadata,
      },
    });
    
    // Update the session to mark it as archived
    await prisma.aISession.update({
      where: { id: sessionId },
      data: {
        metadata: {
          ...(session.metadata as any || {}),
          archived: true,
          archiveId: archiveResult.archiveId,
          archiveTimestamp: new Date(),
        },
      },
    });
    
    // Log the archiving operation
    LoggingService.info({
      message: `Archived AI session: ${sessionId}`,
      userId,
      module: 'ai-service',
      category: 'ARCHIVE',
      metadata: {
        sessionId,
        archiveId: archiveResult.archiveId,
        sessionType: session.sessionType,
        module: session.module,
      },
    });
    
    return {
      success: true,
      archiveId: archiveResult.archiveId,
      contentHash: archiveResult.contentHash,
    };
  } catch (error) {
    LoggingService.error({
      message: 'Error archiving AI session',
      userId: params.userId,
      module: 'ai-service',
      category: 'ARCHIVE',
      error,
      metadata: {
        sessionId: params.sessionId,
      },
    });
    throw error;
  }
}

/**
 * Archives a human approval decision
 */
export async function archiveHumanApproval(approvalId: string, userId: string, metadata?: any) {
  try {
    // Get the human approval with related data
    const approval = await prisma.humanApproval.findUnique({
      where: { id: approvalId },
    });
    
    if (!approval) {
      throw new Error(`Human approval not found: ${approvalId}`);
    }
    
    // Create the archive
    const archiveResult = await CollaborationArchiveService.createArchive({
      userId,
      organizationId: approval.organizationId || undefined,
      archiveType: 'human-approval',
      sourceSessionId: approval.sessionId || undefined,
      startTimestamp: approval.requestTimestamp,
      endTimestamp: approval.responseTimestamp || new Date(),
      content: {
        approval,
        metadata: {
          ...metadata,
          archivedAt: new Date(),
        },
      },
      retentionPolicy: 'compliance',
      complianceStandards: ['SOC2', 'GDPR', 'INTERNAL_GOVERNANCE'],
      metadata: {
        approvalType: approval.requestedAction,
        status: approval.status,
        ...metadata,
      },
    });
    
    // Update the approval to mark it as archived
    await prisma.humanApproval.update({
      where: { id: approvalId },
      data: {
        metadata: {
          ...(approval.metadata as any || {}),
          archived: true,
          archiveId: archiveResult.archiveId,
          archiveTimestamp: new Date(),
        },
      },
    });
    
    // Log the archiving operation
    LoggingService.info({
      message: `Archived human approval: ${approvalId}`,
      userId,
      module: 'sentient-loop',
      category: 'ARCHIVE',
      metadata: {
        approvalId,
        archiveId: archiveResult.archiveId,
        approvalType: approval.requestedAction,
        status: approval.status,
      },
    });
    
    return {
      success: true,
      archiveId: archiveResult.archiveId,
      contentHash: archiveResult.contentHash,
    };
  } catch (error) {
    LoggingService.error({
      message: 'Error archiving human approval',
      userId,
      module: 'sentient-loop',
      category: 'ARCHIVE',
      error,
      metadata: {
        approvalId,
      },
    });
    throw error;
  }
}

/**
 * Archives a Sentient Loop checkpoint
 */
export async function archiveSentientCheckpoint(checkpointId: string, userId: string, metadata?: any) {
  try {
    // Get the checkpoint with related data
    const checkpoint = await prisma.sentientCheckpoint.findUnique({
      where: { id: checkpointId },
    });
    
    if (!checkpoint) {
      throw new Error(`Sentient checkpoint not found: ${checkpointId}`);
    }
    
    // Create the archive
    const archiveResult = await CollaborationArchiveService.createArchive({
      userId,
      organizationId: checkpoint.organizationId || undefined,
      archiveType: 'sentient-checkpoint',
      sourceSessionId: checkpoint.sessionId || undefined,
      startTimestamp: checkpoint.createdAt,
      endTimestamp: checkpoint.resolvedAt || new Date(),
      content: {
        checkpoint,
        metadata: {
          ...metadata,
          archivedAt: new Date(),
        },
      },
      retentionPolicy: 'compliance',
      complianceStandards: ['SOC2', 'GDPR', 'INTERNAL_GOVERNANCE'],
      metadata: {
        checkpointType: checkpoint.checkpointType,
        status: checkpoint.status,
        ...metadata,
      },
    });
    
    // Update the checkpoint to mark it as archived
    await prisma.sentientCheckpoint.update({
      where: { id: checkpointId },
      data: {
        metadata: {
          ...(checkpoint.metadata as any || {}),
          archived: true,
          archiveId: archiveResult.archiveId,
          archiveTimestamp: new Date(),
        },
      },
    });
    
    return {
      success: true,
      archiveId: archiveResult.archiveId,
      contentHash: archiveResult.contentHash,
    };
  } catch (error) {
    LoggingService.error({
      message: 'Error archiving sentient checkpoint',
      userId,
      module: 'sentient-loop',
      category: 'ARCHIVE',
      error,
      metadata: {
        checkpointId,
      },
    });
    throw error;
  }
}
