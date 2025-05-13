/**
 * Session Archiving Hook
 *
 * This hook provides functionality for archiving AI sessions and human-AI interactions.
 * It integrates with the tamper-proof archiving system to ensure compliance with
 * SOC2, GDPR, and internal governance standards.
 */

import { useState, useCallback } from 'react';
import { archiveAISession, archiveHumanApproval, archiveSentientCheckpoint } from '../sessionArchiveIntegration';
import { useAuth } from 'wasp/client/auth';
import {
  createCollaborationArchive,
  verifyCollaborationArchive,
  getCollaborationArchives,
  getCollaborationArchiveContent
} from 'wasp/client/operations';

/**
 * Hook for archiving AI sessions and human-AI interactions
 */
export function useSessionArchiving() {
  const { data: user } = useAuth();
  const [isArchiving, setIsArchiving] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [archiveError, setArchiveError] = useState<Error | null>(null);
  const [archiveResult, setArchiveResult] = useState<any | null>(null);

  /**
   * Archive an AI session
   */
  const archiveSession = useCallback(async (sessionId: string, metadata?: any) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setIsArchiving(true);
    setArchiveError(null);
    setArchiveResult(null);

    try {
      const result = await archiveAISession({
        sessionId,
        userId: user.id,
        organizationId: user.organizationId,
        metadata,
      });

      setArchiveResult(result);
      return result;
    } catch (error) {
      setArchiveError(error as Error);
      throw error;
    } finally {
      setIsArchiving(false);
    }
  }, [user]);

  /**
   * Archive a human approval
   */
  const archiveApproval = useCallback(async (approvalId: string, metadata?: any) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setIsArchiving(true);
    setArchiveError(null);
    setArchiveResult(null);

    try {
      const result = await archiveHumanApproval(approvalId, user.id, metadata);

      setArchiveResult(result);
      return result;
    } catch (error) {
      setArchiveError(error as Error);
      throw error;
    } finally {
      setIsArchiving(false);
    }
  }, [user]);

  /**
   * Archive a Sentient Loop checkpoint
   */
  const archiveCheckpoint = useCallback(async (checkpointId: string, metadata?: any) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setIsArchiving(true);
    setArchiveError(null);
    setArchiveResult(null);

    try {
      const result = await archiveSentientCheckpoint(checkpointId, user.id, metadata);

      setArchiveResult(result);
      return result;
    } catch (error) {
      setArchiveError(error as Error);
      throw error;
    } finally {
      setIsArchiving(false);
    }
  }, [user]);

  /**
   * Create a custom archive
   */
  const createCustomArchive = useCallback(async (params: {
    archiveType: string;
    content: any;
    startTimestamp: Date;
    endTimestamp: Date;
    sourceSessionId?: string;
    retentionPolicy?: string;
    complianceStandards?: string[];
    metadata?: any;
  }) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setIsArchiving(true);
    setArchiveError(null);
    setArchiveResult(null);

    try {
      const result = await createCollaborationArchive({
        archiveType: params.archiveType,
        sourceSessionId: params.sourceSessionId,
        startTimestamp: params.startTimestamp.toISOString(),
        endTimestamp: params.endTimestamp.toISOString(),
        content: params.content,
        retentionPolicy: params.retentionPolicy || 'standard',
        complianceStandards: params.complianceStandards || ['SOC2', 'GDPR'],
        metadata: params.metadata,
      });

      setArchiveResult(result);
      return result;
    } catch (error) {
      setArchiveError(error as Error);
      throw error;
    } finally {
      setIsArchiving(false);
    }
  }, [user]);

  /**
   * Verify an archive's integrity
   */
  const verifyArchive = useCallback(async (params: {
    archiveId: string;
    verificationMethod?: string;
    metadata?: any;
  }) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setIsVerifying(true);
    setArchiveError(null);

    try {
      const result = await verifyCollaborationArchive({
        archiveId: params.archiveId,
        verificationMethod: params.verificationMethod || 'manual',
        metadata: params.metadata,
      });

      return result;
    } catch (error) {
      setArchiveError(error as Error);
      throw error;
    } finally {
      setIsVerifying(false);
    }
  }, [user]);

  /**
   * Get archives
   */
  const getArchives = useCallback(async (params?: {
    archiveType?: string;
    startDate?: Date;
    endDate?: Date;
    sourceSessionId?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setIsFetching(true);
    setArchiveError(null);

    try {
      const result = await getCollaborationArchives({
        archiveType: params?.archiveType,
        startDate: params?.startDate?.toISOString(),
        endDate: params?.endDate?.toISOString(),
        sourceSessionId: params?.sourceSessionId,
        status: params?.status,
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
      });

      return result;
    } catch (error) {
      setArchiveError(error as Error);
      throw error;
    } finally {
      setIsFetching(false);
    }
  }, [user]);

  /**
   * Get archive content
   */
  const getArchiveContent = useCallback(async (params: {
    archiveId: string;
    decryptionKey?: string;
    reason?: string;
  }) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setIsFetching(true);
    setArchiveError(null);

    try {
      const result = await getCollaborationArchiveContent({
        archiveId: params.archiveId,
        decryptionKey: params.decryptionKey,
        reason: params.reason,
      });

      return result;
    } catch (error) {
      setArchiveError(error as Error);
      throw error;
    } finally {
      setIsFetching(false);
    }
  }, [user]);

  return {
    // Archive creation functions
    archiveSession,
    archiveApproval,
    archiveCheckpoint,
    createCustomArchive,

    // Archive management functions
    verifyArchive,
    getArchives,
    getArchiveContent,

    // State
    isArchiving,
    isVerifying,
    isFetching,
    archiveError,
    archiveResult,
  };
}
