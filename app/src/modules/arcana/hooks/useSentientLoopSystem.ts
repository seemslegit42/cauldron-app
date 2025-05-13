import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import { useUser } from 'wasp/client/auth';
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
} from '../api/sentientLoopOperations';
import { useSentientLoop } from './useSentientLoop';

/**
 * Enhanced hook for the Sentient Loop™ system with advanced HITL capabilities
 * 
 * This hook provides a comprehensive interface for interacting with the Sentient Loop™
 * system, including human-in-the-loop checkpoints, agent accountability, memory
 * snapshots, escalation thresholds, and decision traceability.
 * 
 * @param moduleId Optional module ID to filter by
 * @returns Sentient Loop functions and state
 */
export function useSentientLoopSystem(moduleId?: string) {
  // Get the base Sentient Loop functionality
  const baseSentientLoop = useSentientLoop(moduleId);
  
  // User information
  const user = useUser();
  
  // State for tracking active HITL sessions
  const [activeHITLSessions, setActiveHITLSessions] = useState<Record<string, any>>({});
  const [memorySnapshots, setMemorySnapshots] = useState<Record<string, any[]>>({});
  const [decisionTraces, setDecisionTraces] = useState<Record<string, any[]>>({});
  const [escalations, setEscalations] = useState<Record<string, any[]>>({});
  
  // Refs for tracking session timeouts
  const sessionTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});
  
  // Actions
  const processAgentActionFn = useAction(processAgentAction);
  const createMemorySnapshotAction = useAction(createMemorySnapshot);
  
  /**
   * Creates a human-in-the-loop checkpoint and returns a session object
   * 
   * @param params Checkpoint parameters
   * @returns HITL session object
   */
  const createHITLSession = useCallback(async (params: {
    title: string;
    description: string;
    payload: any;
    checkpointType: 'DECISION_REQUIRED' | 'CONFIRMATION_REQUIRED' | 'INFORMATION_REQUIRED' | 'VALIDATION_REQUIRED' | 'AUDIT_REQUIRED';
    context?: any;
    metadata?: any;
    timeoutMs?: number;
    agentId?: string;
    sessionId?: string;
  }) => {
    if (!user) throw new Error('User not authenticated');
    
    const { 
      title, 
      description, 
      payload, 
      checkpointType, 
      context, 
      metadata, 
      timeoutMs = 5 * 60 * 1000, // Default timeout: 5 minutes
      agentId,
      sessionId
    } = params;
    
    try {
      // Create the checkpoint
      const checkpoint = await baseSentientLoop.createNewCheckpoint({
        type: checkpointType,
        title,
        description,
        originalPayload: payload,
        metadata: {
          ...metadata,
          sessionId,
          agentId
        }
      });
      
      // If context is provided, create a memory snapshot
      if (context) {
        const memorySnapshot = await createMemorySnapshotAction({
          checkpointId: checkpoint.id,
          type: 'CONTEXT',
          content: context,
          metadata: {
            checkpointType,
            sessionId,
            agentId
          }
        });
        
        // Update memory snapshots state
        setMemorySnapshots(prev => ({
          ...prev,
          [checkpoint.id]: [...(prev[checkpoint.id] || []), memorySnapshot]
        }));
      }
      
      // Create a new HITL session
      const hitlSession = {
        id: checkpoint.id,
        checkpoint,
        status: 'PENDING',
        createdAt: new Date(),
        timeoutAt: new Date(Date.now() + timeoutMs),
        result: null,
        memorySnapshots: context ? [{ type: 'CONTEXT', content: context }] : [],
        decisionTraces: [],
        escalations: []
      };
      
      // Add the session to active sessions
      setActiveHITLSessions(prev => ({
        ...prev,
        [checkpoint.id]: hitlSession
      }));
      
      // Set a timeout to automatically expire the session
      const timeoutId = setTimeout(() => {
        // If the session is still pending when the timeout expires, mark it as expired
        setActiveHITLSessions(prev => {
          const session = prev[checkpoint.id];
          if (session && session.status === 'PENDING') {
            // Attempt to update the checkpoint status in the database
            baseSentientLoop.resolveCheckpoint(checkpoint.id, 'Session expired due to timeout');
            
            // Return updated sessions
            return {
              ...prev,
              [checkpoint.id]: {
                ...session,
                status: 'EXPIRED',
                result: {
                  status: 'EXPIRED',
                  message: 'Session expired due to timeout'
                }
              }
            };
          }
          return prev;
        });
        
        // Remove the timeout reference
        delete sessionTimeoutsRef.current[checkpoint.id];
      }, timeoutMs);
      
      // Store the timeout reference
      sessionTimeoutsRef.current[checkpoint.id] = timeoutId;
      
      return hitlSession;
    } catch (error) {
      console.error('Error creating HITL session:', error);
      throw error;
    }
  }, [user, baseSentientLoop, createMemorySnapshotAction]);
  
  /**
   * Waits for a HITL session to be resolved
   * 
   * @param sessionId The session ID
   * @param timeoutMs Timeout in milliseconds (default: 5 minutes)
   * @returns Promise that resolves when the session is resolved
   */
  const waitForHITLResolution = useCallback((sessionId: string, timeoutMs: number = 5 * 60 * 1000): Promise<any> => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const checkInterval = 1000; // Check every second
      
      // Function to check if the session is resolved
      const checkResolution = () => {
        const session = activeHITLSessions[sessionId];
        
        // If the session doesn't exist, reject
        if (!session) {
          return reject(new Error(`HITL session ${sessionId} not found`));
        }
        
        // If the session is resolved, resolve with the result
        if (session.status !== 'PENDING') {
          return resolve(session);
        }
        
        // If we've exceeded the timeout, reject
        if (Date.now() - startTime > timeoutMs) {
          return reject(new Error(`Timeout waiting for HITL session ${sessionId} to be resolved`));
        }
        
        // Otherwise, check again after the interval
        setTimeout(checkResolution, checkInterval);
      };
      
      // Start checking
      checkResolution();
    });
  }, [activeHITLSessions]);
  
  /**
   * Takes a memory snapshot and associates it with a HITL session
   * 
   * @param params Snapshot parameters
   * @returns The created memory snapshot
   */
  const takeMemorySnapshot = useCallback(async (params: {
    sessionId: string;
    memoryType: 'DECISION' | 'FEEDBACK' | 'CONTEXT' | 'ESCALATION' | 'AUDIT' | 'SYSTEM';
    content: any;
    importance?: number;
    metadata?: any;
  }) => {
    if (!user) throw new Error('User not authenticated');
    
    const { sessionId, memoryType, content, importance, metadata } = params;
    
    try {
      // Ensure the session exists
      const session = activeHITLSessions[sessionId];
      if (!session) {
        throw new Error(`HITL session ${sessionId} not found`);
      }
      
      // Create the memory snapshot
      const memorySnapshot = await createMemorySnapshotAction({
        checkpointId: sessionId,
        type: memoryType,
        content,
        importance,
        metadata
      });
      
      // Update memory snapshots state
      setMemorySnapshots(prev => ({
        ...prev,
        [sessionId]: [...(prev[sessionId] || []), memorySnapshot]
      }));
      
      // Update the session
      setActiveHITLSessions(prev => ({
        ...prev,
        [sessionId]: {
          ...prev[sessionId],
          memorySnapshots: [...(prev[sessionId].memorySnapshots || []), {
            type: memoryType,
            content,
            importance,
            metadata
          }]
        }
      }));
      
      return memorySnapshot;
    } catch (error) {
      console.error('Error taking memory snapshot:', error);
      throw error;
    }
  }, [user, activeHITLSessions, createMemorySnapshotAction]);
  
  /**
   * Processes an agent action with human-in-the-loop validation
   * 
   * @param params Action parameters
   * @returns Result of the action processing
   */
  const processActionWithHITL = useCallback(async (params: {
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
    timeoutMs?: number;
  }) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      // Process the action through the Sentient Loop
      const result = await processAgentActionFn({
        moduleId: moduleId || 'arcana',
        ...params
      });
      
      // If the action was automatically approved, return immediately
      if (result.status === 'APPROVED') {
        return {
          status: 'APPROVED',
          message: result.message,
          requiresHumanApproval: false,
          checkpointId: null,
          payload: params.payload
        };
      }
      
      // If the action requires human approval, create a HITL session
      if (result.status === 'PENDING' && result.checkpointId) {
        const checkpointId = result.checkpointId;
        
        // Create a new HITL session
        const hitlSession = {
          id: checkpointId,
          checkpoint: {
            id: checkpointId,
            type: 'DECISION_REQUIRED',
            title: params.title,
            description: params.description,
            originalPayload: params.payload,
            metadata: {
              ...params.metadata,
              actionType: params.actionType,
              confidence: params.confidence,
              impact: params.impact
            }
          },
          status: 'PENDING',
          createdAt: new Date(),
          timeoutAt: new Date(Date.now() + (params.timeoutMs || 5 * 60 * 1000)),
          result: null,
          memorySnapshots: params.context ? [{ type: 'CONTEXT', content: params.context }] : [],
          decisionTraces: [],
          escalations: []
        };
        
        // Add the session to active sessions
        setActiveHITLSessions(prev => ({
          ...prev,
          [checkpointId]: hitlSession
        }));
        
        // Set a timeout to automatically expire the session
        const timeoutId = setTimeout(() => {
          // If the session is still pending when the timeout expires, mark it as expired
          setActiveHITLSessions(prev => {
            const session = prev[checkpointId];
            if (session && session.status === 'PENDING') {
              // Attempt to update the checkpoint status in the database
              baseSentientLoop.rejectCheckpoint(checkpointId, 'Session expired due to timeout');
              
              // Return updated sessions
              return {
                ...prev,
                [checkpointId]: {
                  ...session,
                  status: 'EXPIRED',
                  result: {
                    status: 'EXPIRED',
                    message: 'Session expired due to timeout'
                  }
                }
              };
            }
            return prev;
          });
          
          // Remove the timeout reference
          delete sessionTimeoutsRef.current[checkpointId];
        }, params.timeoutMs || 5 * 60 * 1000);
        
        // Store the timeout reference
        sessionTimeoutsRef.current[checkpointId] = timeoutId;
        
        return {
          status: 'PENDING',
          message: 'Action requires human approval',
          requiresHumanApproval: true,
          checkpointId,
          hitlSession,
          payload: params.payload
        };
      }
      
      // Otherwise, return the result
      return result;
    } catch (error) {
      console.error('Error processing action with HITL:', error);
      throw error;
    }
  }, [user, moduleId, processAgentActionFn, baseSentientLoop]);
  
  /**
   * Resolves a HITL session
   * 
   * @param params Resolution parameters
   * @returns The resolved session
   */
  const resolveHITLSession = useCallback(async (params: {
    sessionId: string;
    status: 'APPROVED' | 'REJECTED' | 'MODIFIED' | 'ESCALATED';
    resolution: string;
    modifiedPayload?: any;
    decisionFactors?: any;
    decisionAlternatives?: any;
  }) => {
    if (!user) throw new Error('User not authenticated');
    
    const { sessionId, status, resolution, modifiedPayload, decisionFactors, decisionAlternatives } = params;
    
    try {
      // Ensure the session exists
      const session = activeHITLSessions[sessionId];
      if (!session) {
        throw new Error(`HITL session ${sessionId} not found`);
      }
      
      // Resolve the checkpoint
      const checkpoint = await baseSentientLoop.resolveCheckpoint(sessionId, status, resolution, modifiedPayload);
      
      // Record the decision trace
      const decisionTrace = await baseSentientLoop.recordDecision({
        checkpointId: sessionId,
        decisionType: 'human',
        reasoning: resolution,
        factors: decisionFactors,
        alternatives: decisionAlternatives || (modifiedPayload ? { original: session.checkpoint.originalPayload, modified: modifiedPayload } : undefined)
      });
      
      // Update decision traces state
      setDecisionTraces(prev => ({
        ...prev,
        [sessionId]: [...(prev[sessionId] || []), decisionTrace]
      }));
      
      // Clear any timeout for this session
      if (sessionTimeoutsRef.current[sessionId]) {
        clearTimeout(sessionTimeoutsRef.current[sessionId]);
        delete sessionTimeoutsRef.current[sessionId];
      }
      
      // Update the session
      setActiveHITLSessions(prev => ({
        ...prev,
        [sessionId]: {
          ...prev[sessionId],
          status,
          result: {
            status,
            message: resolution,
            modifiedPayload
          },
          decisionTraces: [...(prev[sessionId].decisionTraces || []), {
            decisionType: 'human',
            reasoning: resolution,
            factors: decisionFactors,
            alternatives: decisionAlternatives || (modifiedPayload ? { original: session.checkpoint.originalPayload, modified: modifiedPayload } : undefined)
          }]
        }
      }));
      
      return {
        ...session,
        status,
        result: {
          status,
          message: resolution,
          modifiedPayload
        }
      };
    } catch (error) {
      console.error('Error resolving HITL session:', error);
      throw error;
    }
  }, [user, activeHITLSessions, baseSentientLoop]);
  
  /**
   * Escalates a HITL session
   * 
   * @param params Escalation parameters
   * @returns The escalated session
   */
  const escalateHITLSession = useCallback(async (params: {
    sessionId: string;
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    reason: string;
    metadata?: any;
  }) => {
    if (!user) throw new Error('User not authenticated');
    
    const { sessionId, level, reason, metadata } = params;
    
    try {
      // Ensure the session exists
      const session = activeHITLSessions[sessionId];
      if (!session) {
        throw new Error(`HITL session ${sessionId} not found`);
      }
      
      // Escalate the checkpoint
      await baseSentientLoop.escalateCheckpoint(sessionId, level, reason);
      
      // Update the session
      setActiveHITLSessions(prev => ({
        ...prev,
        [sessionId]: {
          ...prev[sessionId],
          status: 'ESCALATED',
          result: {
            status: 'ESCALATED',
            message: reason,
            level
          },
          escalations: [...(prev[sessionId].escalations || []), {
            level,
            reason,
            metadata
          }]
        }
      }));
      
      return {
        ...session,
        status: 'ESCALATED',
        result: {
          status: 'ESCALATED',
          message: reason,
          level
        }
      };
    } catch (error) {
      console.error('Error escalating HITL session:', error);
      throw error;
    }
  }, [user, activeHITLSessions, baseSentientLoop]);
  
  /**
   * Gets all active HITL sessions
   * 
   * @returns Array of active HITL sessions
   */
  const getActiveHITLSessions = useCallback(() => {
    return Object.values(activeHITLSessions);
  }, [activeHITLSessions]);
  
  /**
   * Gets a HITL session by ID
   * 
   * @param sessionId The session ID
   * @returns The HITL session
   */
  const getHITLSession = useCallback((sessionId: string) => {
    return activeHITLSessions[sessionId];
  }, [activeHITLSessions]);
  
  // Clean up timeouts when the component unmounts
  useEffect(() => {
    return () => {
      // Clear all timeouts
      Object.values(sessionTimeoutsRef.current).forEach(timeoutId => {
        clearTimeout(timeoutId);
      });
    };
  }, []);
  
  // Sync with pending checkpoints from the server
  useEffect(() => {
    if (baseSentientLoop.pendingCheckpoints) {
      // For each pending checkpoint, create a HITL session if it doesn't already exist
      baseSentientLoop.pendingCheckpoints.forEach(checkpoint => {
        if (!activeHITLSessions[checkpoint.id]) {
          setActiveHITLSessions(prev => ({
            ...prev,
            [checkpoint.id]: {
              id: checkpoint.id,
              checkpoint,
              status: 'PENDING',
              createdAt: new Date(checkpoint.createdAt),
              timeoutAt: checkpoint.expiresAt ? new Date(checkpoint.expiresAt) : new Date(Date.now() + 5 * 60 * 1000),
              result: null,
              memorySnapshots: checkpoint.memorySnapshots || [],
              decisionTraces: [],
              escalations: checkpoint.escalations || []
            }
          }));
        }
      });
    }
  }, [baseSentientLoop.pendingCheckpoints, activeHITLSessions]);
  
  return {
    // Base Sentient Loop functionality
    ...baseSentientLoop,
    
    // HITL session management
    createHITLSession,
    waitForHITLResolution,
    resolveHITLSession,
    escalateHITLSession,
    getActiveHITLSessions,
    getHITLSession,
    activeHITLSessions,
    
    // Memory management
    takeMemorySnapshot,
    memorySnapshots,
    
    // Decision traces
    decisionTraces,
    
    // Escalations
    escalations,
    
    // Enhanced action processing
    processActionWithHITL
  };
}

/**
 * Hook for human-in-the-loop confirmation in the Sentient Loop™ system
 * 
 * @param moduleId Optional module ID
 * @returns Human confirmation functions
 */
export function useHumanInTheLoop(moduleId?: string) {
  const { 
    createHITLSession, 
    waitForHITLResolution,
    processActionWithHITL
  } = useSentientLoopSystem(moduleId);
  
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
    timeoutMs?: number;
  }): Promise<{ status: string; payload: any; message: string }> => {
    try {
      // If confidence and impact are provided, use processActionWithHITL
      if (params.confidence !== undefined && params.impact !== undefined) {
        const result = await processActionWithHITL({
          actionType: 'confirmation',
          title: params.title,
          description: params.description,
          payload: params.payload,
          confidence: params.confidence,
          impact: params.impact,
          context: params.context || {},
          metadata: params.metadata,
          timeoutMs: params.timeoutMs
        });
        
        // If the action was automatically approved, return immediately
        if (result.status === 'APPROVED') {
          return {
            status: 'APPROVED',
            payload: params.payload,
            message: result.message
          };
        }
        
        // If the action requires human approval, wait for resolution
        if (result.status === 'PENDING' && result.checkpointId) {
          const resolvedSession = await waitForHITLResolution(result.checkpointId, params.timeoutMs);
          
          return {
            status: resolvedSession.status,
            payload: resolvedSession.status === 'MODIFIED' ? resolvedSession.result.modifiedPayload : params.payload,
            message: resolvedSession.result.message
          };
        }
        
        // Otherwise, return the result
        return {
          status: result.status,
          payload: params.payload,
          message: result.message
        };
      }
      
      // Otherwise, create a HITL session directly
      const session = await createHITLSession({
        title: params.title,
        description: params.description,
        payload: params.payload,
        checkpointType: 'CONFIRMATION_REQUIRED',
        context: params.context,
        metadata: params.metadata,
        timeoutMs: params.timeoutMs
      });
      
      // Wait for the session to be resolved
      const resolvedSession = await waitForHITLResolution(session.id, params.timeoutMs);
      
      return {
        status: resolvedSession.status,
        payload: resolvedSession.status === 'MODIFIED' ? resolvedSession.result.modifiedPayload : params.payload,
        message: resolvedSession.result.message
      };
    } catch (error) {
      console.error('Error requesting confirmation:', error);
      throw error;
    }
  }, [createHITLSession, waitForHITLResolution, processActionWithHITL]);
  
  /**
   * Requests human input for a decision
   * 
   * @param params Decision parameters
   * @returns Promise that resolves with the human decision
   */
  const requestDecision = useCallback(async (params: {
    title: string;
    description: string;
    options: Array<{ id: string; label: string; description?: string; isRecommended?: boolean }>;
    context?: any;
    metadata?: any;
    timeoutMs?: number;
  }): Promise<{ selectedOption: string; message: string }> => {
    try {
      // Create a HITL session
      const session = await createHITLSession({
        title: params.title,
        description: params.description,
        payload: { options: params.options },
        checkpointType: 'DECISION_REQUIRED',
        context: params.context,
        metadata: params.metadata,
        timeoutMs: params.timeoutMs
      });
      
      // Wait for the session to be resolved
      const resolvedSession = await waitForHITLResolution(session.id, params.timeoutMs);
      
      // If the session was approved, return the selected option
      if (resolvedSession.status === 'APPROVED') {
        return {
          selectedOption: resolvedSession.result.modifiedPayload?.selectedOption || params.options[0].id,
          message: resolvedSession.result.message
        };
      }
      
      // If the session was modified, return the modified payload
      if (resolvedSession.status === 'MODIFIED' && resolvedSession.result.modifiedPayload) {
        return {
          selectedOption: resolvedSession.result.modifiedPayload.selectedOption,
          message: resolvedSession.result.message
        };
      }
      
      // Otherwise, throw an error
      throw new Error(`Decision was not approved: ${resolvedSession.result.message}`);
    } catch (error) {
      console.error('Error requesting decision:', error);
      throw error;
    }
  }, [createHITLSession, waitForHITLResolution]);
  
  /**
   * Requests human information input
   * 
   * @param params Information request parameters
   * @returns Promise that resolves with the provided information
   */
  const requestInformation = useCallback(async (params: {
    title: string;
    description: string;
    fields: Array<{ id: string; label: string; type: 'text' | 'number' | 'boolean' | 'select'; options?: Array<{ value: string; label: string }>; required?: boolean }>;
    context?: any;
    metadata?: any;
    timeoutMs?: number;
  }): Promise<{ [key: string]: any; message: string }> => {
    try {
      // Create a HITL session
      const session = await createHITLSession({
        title: params.title,
        description: params.description,
        payload: { fields: params.fields },
        checkpointType: 'INFORMATION_REQUIRED',
        context: params.context,
        metadata: params.metadata,
        timeoutMs: params.timeoutMs
      });
      
      // Wait for the session to be resolved
      const resolvedSession = await waitForHITLResolution(session.id, params.timeoutMs);
      
      // If the session was approved or modified, return the provided information
      if (resolvedSession.status === 'APPROVED' || resolvedSession.status === 'MODIFIED') {
        return {
          ...resolvedSession.result.modifiedPayload,
          message: resolvedSession.result.message
        };
      }
      
      // Otherwise, throw an error
      throw new Error(`Information request was not completed: ${resolvedSession.result.message}`);
    } catch (error) {
      console.error('Error requesting information:', error);
      throw error;
    }
  }, [createHITLSession, waitForHITLResolution]);
  
  return {
    requestConfirmation,
    requestDecision,
    requestInformation
  };
}

/**
 * Hook for agent accountability in the Sentient Loop™ system
 * 
 * @param moduleId Optional module ID
 * @param agentId Optional agent ID
 * @returns Agent accountability functions
 */
export function useAgentAccountability(moduleId?: string, agentId?: string) {
  const { takeMemorySnapshot, recordDecision } = useSentientLoopSystem(moduleId);
  
  /**
   * Records an agent action for accountability
   * 
   * @param params Action parameters
   * @returns The recorded action
   */
  const recordAgentAction = useCallback(async (params: {
    sessionId: string;
    actionType: string;
    actionDescription: string;
    actionResult: any;
    confidence: number;
    reasoning: string;
    metadata?: any;
  }) => {
    try {
      // Record the action as a memory snapshot
      const memorySnapshot = await takeMemorySnapshot({
        sessionId: params.sessionId,
        memoryType: 'AUDIT',
        content: {
          actionType: params.actionType,
          actionDescription: params.actionDescription,
          actionResult: params.actionResult,
          confidence: params.confidence,
          reasoning: params.reasoning
        },
        metadata: params.metadata
      });
      
      // Record a decision trace
      await recordDecision({
        checkpointId: params.sessionId,
        decisionType: 'agent',
        reasoning: params.reasoning,
        factors: {
          actionType: params.actionType,
          confidence: params.confidence
        },
        metadata: params.metadata
      });
      
      return memorySnapshot;
    } catch (error) {
      console.error('Error recording agent action:', error);
      throw error;
    }
  }, [takeMemorySnapshot, recordDecision]);
  
  return {
    recordAgentAction
  };
}

/**
 * Hook for memory management in the Sentient Loop™ system
 * 
 * @param moduleId Optional module ID
 * @returns Memory management functions
 */
export function useMemoryManagement(moduleId?: string) {
  const { takeMemorySnapshot, memorySnapshots } = useSentientLoopSystem(moduleId);
  
  /**
   * Stores a memory in the Sentient Loop™ system
   * 
   * @param params Memory parameters
   * @returns The stored memory
   */
  const storeMemory = useCallback(async (params: {
    sessionId: string;
    memoryType: 'DECISION' | 'FEEDBACK' | 'CONTEXT' | 'ESCALATION' | 'AUDIT' | 'SYSTEM';
    content: any;
    importance?: number;
    metadata?: any;
  }) => {
    try {
      return await takeMemorySnapshot(params);
    } catch (error) {
      console.error('Error storing memory:', error);
      throw error;
    }
  }, [takeMemorySnapshot]);
  
  /**
   * Retrieves memories for a session
   * 
   * @param sessionId The session ID
   * @param memoryType Optional memory type to filter by
   * @returns Array of memories
   */
  const getMemories = useCallback((sessionId: string, memoryType?: string) => {
    const sessionMemories = memorySnapshots[sessionId] || [];
    
    if (memoryType) {
      return sessionMemories.filter(memory => memory.type === memoryType);
    }
    
    return sessionMemories;
  }, [memorySnapshots]);
  
  return {
    storeMemory,
    getMemories
  };
}

/**
 * Hook for decision traceability in the Sentient Loop™ system
 * 
 * @param moduleId Optional module ID
 * @returns Decision traceability functions
 */
export function useDecisionTraceability(moduleId?: string) {
  const { recordDecision, decisionTraces } = useSentientLoopSystem(moduleId);
  
  /**
   * Traces a decision in the Sentient Loop™ system
   * 
   * @param params Decision parameters
   * @returns The traced decision
   */
  const traceDecision = useCallback(async (params: {
    checkpointId: string;
    decisionType: 'human' | 'agent' | 'system';
    reasoning?: string;
    factors?: any;
    alternatives?: any;
    metadata?: any;
  }) => {
    try {
      return await recordDecision(params);
    } catch (error) {
      console.error('Error tracing decision:', error);
      throw error;
    }
  }, [recordDecision]);
  
  /**
   * Gets decision traces for a checkpoint
   * 
   * @param checkpointId The checkpoint ID
   * @param decisionType Optional decision type to filter by
   * @returns Array of decision traces
   */
  const getDecisionTraces = useCallback((checkpointId: string, decisionType?: string) => {
    const checkpointTraces = decisionTraces[checkpointId] || [];
    
    if (decisionType) {
      return checkpointTraces.filter(trace => trace.decisionType === decisionType);
    }
    
    return checkpointTraces;
  }, [decisionTraces]);
  
  return {
    traceDecision,
    getDecisionTraces
  };
}