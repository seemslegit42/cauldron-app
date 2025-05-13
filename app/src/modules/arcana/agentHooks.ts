/**
 * Arcana Module - Agent Hooks
 * 
 * This file contains Sentient Loop™ hooks for AI interactions in the Arcana module.
 * These hooks provide a standardized way to integrate AI capabilities into the dashboard.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAction, useQuery } from 'wasp/client/operations';
import { useUser } from 'wasp/client/auth';
import { getUserContext, processCommand } from './operations';
import { 
  useSentientLoop as useSentientLoopCore,
  useHumanInTheLoop,
  useAgentAccountability,
  useMemoryManagement,
  useDecisionTraceability
} from './hooks';

/**
 * Hook for generating personalized insights based on user context and metrics
 * @param metricCategories - Categories of metrics to analyze
 * @param maxInsights - Maximum number of insights to generate
 * @returns Object containing insights and loading state
 */
export const useSentientInsights = (
  metricCategories: string[] = ['business', 'security', 'social', 'media'],
  maxInsights: number = 3
) => {
  const [insights, setInsights] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const user = useUser();
  const { data: userContext } = useQuery(getUserContext);
  const processCommandAction = useAction(processCommand);
  const { storeMemory } = useMemoryManagement('arcana');

  const generateInsights = useCallback(async () => {
    if (!user || !userContext) return;

    setIsLoading(true);
    try {
      // Use the processCommand action to generate insights
      const result = await processCommandAction({
        command: `Generate ${maxInsights} insights about my ${metricCategories.join(', ')} metrics`,
        module: 'arcana',
        context: {
          metricCategories,
          maxInsights,
          userContext
        }
      });

      // Parse the insights from the result
      if (result && result.insights) {
        setInsights(result.insights);
        
        // Store insights in Sentient Loop memory
        if (result.sessionId) {
          await storeMemory({
            sessionId: result.sessionId,
            memoryType: 'CONTEXT',
            content: {
              type: 'INSIGHTS',
              insights: result.insights,
              metricCategories
            },
            importance: 3
          });
        }
      }
    } catch (err) {
      setError(err as Error);
      console.error('Error generating insights:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, userContext, metricCategories, maxInsights, processCommandAction, storeMemory]);

  useEffect(() => {
    if (user && userContext) {
      generateInsights();
    }
  }, [user, userContext, generateInsights]);

  return { insights, isLoading, error, refreshInsights: generateInsights };
};

/**
 * Hook for requesting user confirmation for important actions
 * @param moduleId - Optional module ID
 * @returns Object containing confirmation state and functions
 */
export const useHumanConfirmation = (moduleId: string = 'arcana') => {
  const { requestConfirmation, requestDecision, requestInformation } = useHumanInTheLoop(moduleId);
  const { recordAgentAction } = useAgentAccountability(moduleId);
  const user = useUser();
  
  /**
   * Requests human confirmation for an action
   * 
   * @param params Confirmation parameters
   * @returns Promise that resolves when the action is confirmed or rejected
   */
  const confirmAction = useCallback(async (params: {
    title: string;
    description: string;
    payload: any;
    confidence?: number;
    impact?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    context?: any;
    metadata?: any;
    timeoutMs?: number;
    sessionId?: string;
  }) => {
    try {
      const result = await requestConfirmation(params);
      
      // Record the action for accountability
      if (params.sessionId) {
        await recordAgentAction({
          sessionId: params.sessionId,
          actionType: 'confirmation',
          actionDescription: params.title,
          actionResult: result,
          confidence: params.confidence || 0.5,
          reasoning: params.description
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error requesting confirmation:', error);
      throw error;
    }
  }, [requestConfirmation, recordAgentAction]);
  
  /**
   * Requests human decision for a choice
   * 
   * @param params Decision parameters
   * @returns Promise that resolves with the human decision
   */
  const makeDecision = useCallback(async (params: {
    title: string;
    description: string;
    options: Array<{ id: string; label: string; description?: string; isRecommended?: boolean }>;
    context?: any;
    metadata?: any;
    timeoutMs?: number;
    sessionId?: string;
  }) => {
    try {
      const result = await requestDecision(params);
      
      // Record the decision for accountability
      if (params.sessionId) {
        await recordAgentAction({
          sessionId: params.sessionId,
          actionType: 'decision',
          actionDescription: params.title,
          actionResult: result,
          confidence: 0.5,
          reasoning: params.description
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error requesting decision:', error);
      throw error;
    }
  }, [requestDecision, recordAgentAction]);
  
  /**
   * Requests human information input
   * 
   * @param params Information request parameters
   * @returns Promise that resolves with the provided information
   */
  const getInformation = useCallback(async (params: {
    title: string;
    description: string;
    fields: Array<{ id: string; label: string; type: 'text' | 'number' | 'boolean' | 'select'; options?: Array<{ value: string; label: string }>; required?: boolean }>;
    context?: any;
    metadata?: any;
    timeoutMs?: number;
    sessionId?: string;
  }) => {
    try {
      const result = await requestInformation(params);
      
      // Record the information request for accountability
      if (params.sessionId) {
        await recordAgentAction({
          sessionId: params.sessionId,
          actionType: 'information',
          actionDescription: params.title,
          actionResult: result,
          confidence: 0.5,
          reasoning: params.description
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error requesting information:', error);
      throw error;
    }
  }, [requestInformation, recordAgentAction]);
  
  return {
    confirmAction,
    makeDecision,
    getInformation
  };
};

/**
 * Hook for tracking AI decision points for auditing
 * @param moduleId - ID of the module using the checkpoint
 * @returns Object containing checkpoint functions
 */
export const useSentientCheckpoints = (moduleId: string = 'arcana') => {
  const { createHITLSession, waitForHITLResolution, processActionWithHITL } = useHumanInTheLoop(moduleId);
  const { recordAgentAction } = useAgentAccountability(moduleId);
  const { traceDecision } = useDecisionTraceability(moduleId);
  const user = useUser();
  
  /**
   * Creates a checkpoint in the Sentient Loop™ system
   * 
   * @param params Checkpoint parameters
   * @returns The created checkpoint
   */
  const createCheckpoint = useCallback(async (params: {
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
    try {
      return await createHITLSession(params);
    } catch (error) {
      console.error('Error creating checkpoint:', error);
      throw error;
    }
  }, [createHITLSession]);
  
  /**
   * Waits for a checkpoint to be resolved
   * 
   * @param checkpointId The checkpoint ID
   * @param timeoutMs Timeout in milliseconds
   * @returns Promise that resolves when the checkpoint is resolved
   */
  const waitForResolution = useCallback(async (checkpointId: string, timeoutMs?: number) => {
    try {
      return await waitForHITLResolution(checkpointId, timeoutMs);
    } catch (error) {
      console.error('Error waiting for resolution:', error);
      throw error;
    }
  }, [waitForHITLResolution]);
  
  /**
   * Processes an action with a checkpoint
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
    timeoutMs?: number;
  }) => {
    try {
      return await processActionWithHITL(params);
    } catch (error) {
      console.error('Error processing action:', error);
      throw error;
    }
  }, [processActionWithHITL]);
  
  /**
   * Evaluates the risk of an action
   * 
   * @param action The action to evaluate
   * @param context The context of the action
   * @returns The risk evaluation result
   */
  const evaluateRisk = useCallback((
    action: string,
    context: Record<string, any>
  ): { riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', requiresConfirmation: boolean, impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' } => {
    // Sensitive actions that always require confirmation
    const sensitiveActions = ['delete', 'remove', 'reset', 'publish', 'deploy'];
    const containsSensitiveAction = sensitiveActions.some(sa => action.toLowerCase().includes(sa));
    
    if (containsSensitiveAction) {
      return { 
        riskLevel: 'HIGH', 
        requiresConfirmation: true,
        impact: 'HIGH'
      };
    }
    
    if (context.affectsMultipleUsers || context.isSystemWide) {
      return { 
        riskLevel: 'MEDIUM', 
        requiresConfirmation: true,
        impact: 'MEDIUM'
      };
    }
    
    return { 
      riskLevel: 'LOW', 
      requiresConfirmation: false,
      impact: 'LOW'
    };
  }, []);
  
  /**
   * Records a decision trace
   * 
   * @param params Decision trace parameters
   * @returns The recorded decision trace
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
      return await traceDecision(params);
    } catch (error) {
      console.error('Error recording decision:', error);
      throw error;
    }
  }, [traceDecision]);
  
  return {
    createCheckpoint,
    waitForResolution,
    processAction,
    evaluateRisk,
    recordDecision
  };
};

/**
 * Hook for adaptive AI responses based on user persona
 * @param moduleId - Optional module ID
 * @returns Object containing persona-specific functions
 */
export const useAdaptivePersona = (moduleId: string = 'arcana') => {
  const { storeMemory, getMemories } = useMemoryManagement(moduleId);
  const { data: userContext } = useQuery(getUserContext);
  const [currentPersona, setCurrentPersona] = useState<string>(userContext?.persona || 'hacker-ceo');
  
  /**
   * Gets the persona style based on the current persona
   * 
   * @returns The persona style
   */
  const getPersonaStyle = useCallback(() => {
    switch (currentPersona) {
      case 'hacker-ceo':
        return {
          tone: 'direct',
          detailLevel: 'high',
          focusAreas: ['security', 'operations', 'growth'],
          language: 'technical'
        };
      case 'podcast-mogul':
        return {
          tone: 'creative',
          detailLevel: 'medium',
          focusAreas: ['content', 'audience', 'engagement'],
          language: 'conversational'
        };
      case 'enterprise-admin':
        return {
          tone: 'formal',
          detailLevel: 'comprehensive',
          focusAreas: ['compliance', 'efficiency', 'resources'],
          language: 'professional'
        };
      default:
        return {
          tone: 'balanced',
          detailLevel: 'medium',
          focusAreas: ['general'],
          language: 'standard'
        };
    }
  }, [currentPersona]);
  
  /**
   * Adapts a message based on the current persona style
   * 
   * @param message The message to adapt
   * @returns The adapted message
   */
  const adaptMessage = useCallback((message: string): string => {
    const style = getPersonaStyle();
    
    // In a real implementation, this would use more sophisticated NLP
    // to adapt the message based on the persona style
    
    // For now, we'll just add a simple prefix
    return `[${style.tone}] ${message}`;
  }, [getPersonaStyle]);
  
  /**
   * Stores the current persona in the Sentient Loop™ system
   * 
   * @param params Persona parameters
   * @returns The stored persona
   */
  const storePersona = useCallback(async (params: {
    sessionId: string;
    persona: string;
    metadata?: any;
  }) => {
    try {
      setCurrentPersona(params.persona);
      return await storeMemory({
        sessionId: params.sessionId,
        memoryType: 'CONTEXT',
        content: {
          type: 'PERSONA',
          persona: params.persona,
          style: getPersonaStyle()
        },
        metadata: params.metadata
      });
    } catch (error) {
      console.error('Error storing persona:', error);
      throw error;
    }
  }, [storeMemory, getPersonaStyle]);
  
  /**
   * Gets personas from the Sentient Loop™ system
   * 
   * @param sessionId The session ID
   * @returns Array of personas
   */
  const getPersonas = useCallback((sessionId: string) => {
    const memories = getMemories(sessionId, 'CONTEXT');
    return memories.filter((memory: any) => memory.content?.type === 'PERSONA');
  }, [getMemories]);
  
  return {
    persona: currentPersona,
    personaStyle: getPersonaStyle(),
    adaptMessage,
    storePersona,
    getPersonas
  };
};
