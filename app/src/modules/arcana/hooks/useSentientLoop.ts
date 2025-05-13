import { useState, useCallback, useEffect } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import { 
  getPendingCheckpoints, 
  resolveCheckpoint, 
  getSentientLoopConfig,
  updateSentientLoopConfig,
  createCheckpoint,
  createMemorySnapshot,
  createEscalation,
  recordDecisionTrace,
  processAgentAction
} from '../api/operations';

/**
 * Hook for interacting with the Sentient Loop™ system
 * 
 * @param moduleId Optional module ID to filter by
 * @returns Sentient Loop functions and state
 */
export function useSentientLoop(moduleId?: string) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentCheckpoint, setCurrentCheckpoint] = useState<any>(null);

  // Get pending checkpoints
  const { 
    data: pendingCheckpoints = [], 
    isLoading: isLoadingCheckpoints,
    error: checkpointsError,
    refetch: refetchCheckpoints
  } = useQuery(getPendingCheckpoints, { moduleId });

  // Get Sentient Loop configuration
  const {
    data: loopConfig,
    isLoading: isLoadingConfig,
    error: configError,
    refetch: refetchConfig
  } = useQuery(getSentientLoopConfig, { moduleId });

  // Actions
  const resolveCheckpointAction = useAction(resolveCheckpoint);
  const updateConfigAction = useAction(updateSentientLoopConfig);
  const createCheckpointAction = useAction(createCheckpoint);
  const createMemorySnapshotAction = useAction(createMemorySnapshot);
  const createEscalationAction = useAction(createEscalation);
  const recordDecisionTraceAction = useAction(recordDecisionTrace);
  const processAgentActionFn = useAction(processAgentAction);

  // Set the first pending checkpoint as current if none is selected
  useEffect(() => {
    if (!currentCheckpoint && pendingCheckpoints && pendingCheckpoints.length > 0) {
      setCurrentCheckpoint(pendingCheckpoints[0]);
    }
  }, [pendingCheckpoints, currentCheckpoint]);

  /**
   * Approves a checkpoint
   * 
   * @param checkpointId The checkpoint ID
   * @param resolution Optional resolution message
   * @returns The updated checkpoint
   */
  const approveCheckpoint = useCallback(async (checkpointId: string, resolution: string = 'Approved') => {
    setIsProcessing(true);
    try {
      const result = await resolveCheckpointAction({
        checkpointId,
        status: 'APPROVED',
        resolution
      });

      // Record the decision trace
      await recordDecisionTraceAction({
        checkpointId,
        decisionType: 'human',
        reasoning: resolution
      });

      // Refetch checkpoints
      refetchCheckpoints();

      // Clear current checkpoint if it was the one that was approved
      if (currentCheckpoint && currentCheckpoint.id === checkpointId) {
        setCurrentCheckpoint(null);
      }

      return result;
    } catch (error) {
      console.error('Error approving checkpoint:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [resolveCheckpointAction, recordDecisionTraceAction, refetchCheckpoints, currentCheckpoint]);

  /**
   * Rejects a checkpoint
   * 
   * @param checkpointId The checkpoint ID
   * @param resolution Rejection reason
   * @returns The updated checkpoint
   */
  const rejectCheckpoint = useCallback(async (checkpointId: string, resolution: string) => {
    setIsProcessing(true);
    try {
      const result = await resolveCheckpointAction({
        checkpointId,
        status: 'REJECTED',
        resolution
      });

      // Record the decision trace
      await recordDecisionTraceAction({
        checkpointId,
        decisionType: 'human',
        reasoning: resolution
      });

      // Refetch checkpoints
      refetchCheckpoints();

      // Clear current checkpoint if it was the one that was rejected
      if (currentCheckpoint && currentCheckpoint.id === checkpointId) {
        setCurrentCheckpoint(null);
      }

      return result;
    } catch (error) {
      console.error('Error rejecting checkpoint:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [resolveCheckpointAction, recordDecisionTraceAction, refetchCheckpoints, currentCheckpoint]);

  /**
   * Modifies a checkpoint
   * 
   * @param checkpointId The checkpoint ID
   * @param modifiedPayload The modified payload
   * @param resolution Modification reason
   * @returns The updated checkpoint
   */
  const modifyCheckpoint = useCallback(async (checkpointId: string, modifiedPayload: any, resolution: string) => {
    setIsProcessing(true);
    try {
      const result = await resolveCheckpointAction({
        checkpointId,
        status: 'MODIFIED',
        resolution,
        modifiedPayload
      });

      // Record the decision trace
      await recordDecisionTraceAction({
        checkpointId,
        decisionType: 'human',
        reasoning: resolution,
        alternatives: { original: currentCheckpoint?.originalPayload, modified: modifiedPayload }
      });

      // Refetch checkpoints
      refetchCheckpoints();

      // Clear current checkpoint if it was the one that was modified
      if (currentCheckpoint && currentCheckpoint.id === checkpointId) {
        setCurrentCheckpoint(null);
      }

      return result;
    } catch (error) {
      console.error('Error modifying checkpoint:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [resolveCheckpointAction, recordDecisionTraceAction, refetchCheckpoints, currentCheckpoint]);

  /**
   * Escalates a checkpoint
   * 
   * @param checkpointId The checkpoint ID
   * @param level Escalation level
   * @param reason Escalation reason
   * @returns The created escalation
   */
  const escalateCheckpoint = useCallback(async (checkpointId: string, level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', reason: string) => {
    setIsProcessing(true);
    try {
      // Update the checkpoint status
      await resolveCheckpointAction({
        checkpointId,
        status: 'ESCALATED',
        resolution: `Escalated: ${reason}`
      });

      // Create the escalation
      const result = await createEscalationAction({
        checkpointId,
        level,
        reason
      });

      // Record the decision trace
      await recordDecisionTraceAction({
        checkpointId,
        decisionType: 'human',
        reasoning: reason
      });

      // Refetch checkpoints
      refetchCheckpoints();

      // Clear current checkpoint if it was the one that was escalated
      if (currentCheckpoint && currentCheckpoint.id === checkpointId) {
        setCurrentCheckpoint(null);
      }

      return result;
    } catch (error) {
      console.error('Error escalating checkpoint:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [resolveCheckpointAction, createEscalationAction, recordDecisionTraceAction, refetchCheckpoints, currentCheckpoint]);

  /**
   * Updates the Sentient Loop configuration
   * 
   * @param config Configuration updates
   * @returns The updated configuration
   */
  const updateConfig = useCallback(async (config: any) => {
    try {
      const result = await updateConfigAction({
        moduleId,
        ...config
      });

      // Refetch configuration
      refetchConfig();

      return result;
    } catch (error) {
      console.error('Error updating Sentient Loop configuration:', error);
      throw error;
    }
  }, [updateConfigAction, moduleId, refetchConfig]);

  /**
   * Creates a new checkpoint
   * 
   * @param params Checkpoint parameters
   * @returns The created checkpoint
   */
  const createNewCheckpoint = useCallback(async (params: {
    type: 'DECISION_REQUIRED' | 'CONFIRMATION_REQUIRED' | 'INFORMATION_REQUIRED' | 'ESCALATION_REQUIRED' | 'VALIDATION_REQUIRED' | 'AUDIT_REQUIRED';
    title: string;
    description: string;
    originalPayload: any;
    metadata?: any;
    expiresAt?: Date;
    traceId?: string;
    parentCheckpointId?: string;
  }) => {
    try {
      const result = await createCheckpointAction({
        moduleId: moduleId || 'arcana',
        ...params
      });

      // Refetch checkpoints
      refetchCheckpoints();

      return result;
    } catch (error) {
      console.error('Error creating checkpoint:', error);
      throw error;
    }
  }, [createCheckpointAction, moduleId, refetchCheckpoints]);

  /**
   * Processes an agent action through the Sentient Loop
   * 
   * @param params Action parameters
   * @returns The result of the action processing
   */
  const processAction = useCallback(async (params: {
    actionType: string;
    title: string;
    description: string;
    payload: any;
    confidence: number;
    impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    context: any;
    metadata?: any;
    agentId?: string;
    sessionId?: string;
  }) => {
    setIsProcessing(true);
    try {
      const result = await processAgentActionFn({
        moduleId: moduleId || 'arcana',
        ...params
      });

      // If a checkpoint was created, refetch checkpoints
      if (result.status === 'PENDING') {
        refetchCheckpoints();
      }

      return result;
    } catch (error) {
      console.error('Error processing agent action:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [processAgentActionFn, moduleId, refetchCheckpoints]);

  /**
   * Creates a memory snapshot
   * 
   * @param params Memory snapshot parameters
   * @returns The created memory snapshot
   */
  const createMemory = useCallback(async (params: {
    checkpointId: string;
    type: 'DECISION' | 'FEEDBACK' | 'CONTEXT' | 'ESCALATION' | 'AUDIT' | 'SYSTEM';
    content: any;
    metadata?: any;
    importance?: number;
    expiresAt?: Date;
  }) => {
    try {
      return await createMemorySnapshotAction(params);
    } catch (error) {
      console.error('Error creating memory snapshot:', error);
      throw error;
    }
  }, [createMemorySnapshotAction]);

  /**
   * Records a decision trace
   * 
   * @param params Decision trace parameters
   * @returns The created decision trace
   */
  const recordDecision = useCallback(async (params: {
    checkpointId: string;
    decisionType: 'human' | 'agent' | 'system';
    reasoning?: string;
    factors?: any;
    alternatives?: any;
    metadata?: any;
  }) => {
    try {
      return await recordDecisionTraceAction(params);
    } catch (error) {
      console.error('Error recording decision trace:', error);
      throw error;
    }
  }, [recordDecisionTraceAction]);

  /**
   * Selects a checkpoint as the current one
   * 
   * @param checkpoint The checkpoint to select
   */
  const selectCheckpoint = useCallback((checkpoint: any) => {
    setCurrentCheckpoint(checkpoint);
  }, []);

  return {
    // State
    pendingCheckpoints,
    currentCheckpoint,
    loopConfig,
    isLoadingCheckpoints,
    isLoadingConfig,
    isProcessing,
    checkpointsError,
    configError,

    // Actions
    approveCheckpoint,
    rejectCheckpoint,
    modifyCheckpoint,
    escalateCheckpoint,
    updateConfig,
    createNewCheckpoint,
    processAction,
    createMemory,
    recordDecision,
    selectCheckpoint,
    refetchCheckpoints
  };
}

/**
 * Hook for human confirmation in the Sentient Loop™ system
 * 
 * @param moduleId Optional module ID
 * @returns Human confirmation functions
 */
export function useHumanConfirmation(moduleId?: string) {
  const { 
    createNewCheckpoint, 
    approveCheckpoint, 
    rejectCheckpoint, 
    modifyCheckpoint,
    processAction
  } = useSentientLoop(moduleId);

  /**
   * Requests human confirmation for an action
   * 
   * @param params Confirmation parameters
   * @returns Promise that resolves when the action is confirmed or rejected
   */
  const requestConfirmation = useCallback(async (params: {
    title: string;
    description: string;
    payload: any;
    confidence?: number;
    impact?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    context?: any;
    metadata?: any;
    expiresAt?: Date;
  }): Promise<{ status: string; payload: any; message: string }> => {
    // If confidence and impact are provided, use processAction
    if (params.confidence !== undefined && params.impact !== undefined) {
      const result = await processAction({
        actionType: 'confirmation',
        title: params.title,
        description: params.description,
        payload: params.payload,
        confidence: params.confidence,
        impact: params.impact,
        context: params.context || {},
        metadata: params.metadata
      });

      // If the action was automatically approved, return immediately
      if (result.status === 'APPROVED') {
        return {
          status: 'APPROVED',
          payload: params.payload,
          message: result.message
        };
      }

      // Otherwise, we need to wait for human confirmation
      // In a real implementation, this would use a WebSocket or polling
      // For now, we'll just return a pending status
      return {
        status: 'PENDING',
        payload: null,
        message: 'Waiting for human confirmation'
      };
    }

    // Otherwise, create a checkpoint directly
    const checkpoint = await createNewCheckpoint({
      type: 'CONFIRMATION_REQUIRED',
      title: params.title,
      description: params.description,
      originalPayload: params.payload,
      metadata: params.metadata,
      expiresAt: params.expiresAt
    });

    // In a real implementation, this would wait for the checkpoint to be resolved
    // For now, we'll just return a pending status
    return {
      status: 'PENDING',
      payload: null,
      message: 'Waiting for human confirmation',
      checkpointId: checkpoint.id
    };
  }, [createNewCheckpoint, processAction]);

  return {
    requestConfirmation,
    approveCheckpoint,
    rejectCheckpoint,
    modifyCheckpoint
  };
}

/**
 * Hook for creating sentient checkpoints in the Sentient Loop™ system
 * 
 * @param moduleId Optional module ID
 * @returns Sentient checkpoint functions
 */
export function useSentientCheckpoints(moduleId?: string) {
  const { 
    createNewCheckpoint, 
    processAction,
    pendingCheckpoints,
    isLoadingCheckpoints,
    refetchCheckpoints
  } = useSentientLoop(moduleId);

  /**
   * Creates a decision checkpoint
   * 
   * @param params Decision parameters
   * @returns The created checkpoint
   */
  const createDecisionCheckpoint = useCallback(async (params: {
    title: string;
    description: string;
    options: any[];
    context?: any;
    metadata?: any;
    expiresAt?: Date;
  }) => {
    return createNewCheckpoint({
      type: 'DECISION_REQUIRED',
      title: params.title,
      description: params.description,
      originalPayload: { options: params.options },
      metadata: {
        ...params.metadata,
        context: params.context
      },
      expiresAt: params.expiresAt
    });
  }, [createNewCheckpoint]);

  /**
   * Creates a validation checkpoint
   * 
   * @param params Validation parameters
   * @returns The created checkpoint
   */
  const createValidationCheckpoint = useCallback(async (params: {
    title: string;
    description: string;
    data: any;
    validationRules?: any;
    context?: any;
    metadata?: any;
    expiresAt?: Date;
  }) => {
    return createNewCheckpoint({
      type: 'VALIDATION_REQUIRED',
      title: params.title,
      description: params.description,
      originalPayload: { 
        data: params.data,
        validationRules: params.validationRules
      },
      metadata: {
        ...params.metadata,
        context: params.context
      },
      expiresAt: params.expiresAt
    });
  }, [createNewCheckpoint]);

  /**
   * Creates an audit checkpoint
   * 
   * @param params Audit parameters
   * @returns The created checkpoint
   */
  const createAuditCheckpoint = useCallback(async (params: {
    title: string;
    description: string;
    auditData: any;
    auditType: string;
    context?: any;
    metadata?: any;
    expiresAt?: Date;
  }) => {
    return createNewCheckpoint({
      type: 'AUDIT_REQUIRED',
      title: params.title,
      description: params.description,
      originalPayload: { 
        auditData: params.auditData,
        auditType: params.auditType
      },
      metadata: {
        ...params.metadata,
        context: params.context
      },
      expiresAt: params.expiresAt
    });
  }, [createNewCheckpoint]);

  return {
    createDecisionCheckpoint,
    createValidationCheckpoint,
    createAuditCheckpoint,
    processAction,
    pendingCheckpoints,
    isLoadingCheckpoints,
    refetchCheckpoints
  };
}

export default useSentientLoop;