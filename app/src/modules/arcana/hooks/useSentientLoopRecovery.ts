import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import { useUser } from 'wasp/client/auth';
import { 
  getFailureStats, 
  acknowledgeFailure, 
  getRecoveryOptions,
  executeRecoveryAction,
  updateRecoveryConfig
} from '../api/sentientLoopOperations';
import { useSentientLoopSystem } from './useSentientLoopSystem';

/**
 * Failure state type definition
 */
export type FailureState = {
  id: string;
  type: 'TIMEOUT' | 'OPERATION_ERROR' | 'DECISION_ERROR' | 'INTEGRATION_ERROR' | 'MEMORY_ERROR' | 'HITL_ERROR';
  operationName: string;
  moduleId: string;
  timestamp: Date;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'AUTO_RESOLVED';
  recoveryAttempts: number;
  lastRecoveryAttempt?: Date;
  metadata?: Record<string, any>;
};

/**
 * Recovery option type definition
 */
export type RecoveryOption = {
  id: string;
  name: string;
  description: string;
  type: 'RETRY' | 'FALLBACK' | 'HUMAN_INTERVENTION' | 'ALTERNATIVE_APPROACH' | 'ABORT';
  confidence: number;
  impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  metadata?: Record<string, any>;
};

/**
 * Hook for managing Sentient Loop™ failure detection and recovery
 * 
 * This hook provides functionality for monitoring, acknowledging, and recovering from
 * failures in the Sentient Loop™ system.
 * 
 * @param moduleId Optional module ID to filter failures by
 * @returns Failure management functions and state
 */
export function useSentientLoopRecovery(moduleId?: string) {
  // User information
  const user = useUser();
  
  // Get the base Sentient Loop functionality
  const sentientLoopSystem = useSentientLoopSystem(moduleId);
  
  // State for active failures
  const [activeFailures, setActiveFailures] = useState<Record<string, FailureState>>({});
  
  // State for recovery options
  const [recoveryOptions, setRecoveryOptions] = useState<Record<string, RecoveryOption[]>>({});
  
  // State for recovery in progress
  const [recoveryInProgress, setRecoveryInProgress] = useState<Record<string, boolean>>({});
  
  // Refs for tracking recovery attempts
  const recoveryAttemptsRef = useRef<Record<string, number>>({});
  
  // Actions and queries
  const { data: failureStats, isLoading: isLoadingStats, error: statsError } = useQuery(getFailureStats, { moduleId });
  const acknowledgeFailureAction = useAction(acknowledgeFailure);
  const getRecoveryOptionsAction = useAction(getRecoveryOptions);
  const executeRecoveryActionFn = useAction(executeRecoveryAction);
  const updateRecoveryConfigAction = useAction(updateRecoveryConfig);
  
  // Load active failures when stats change
  useEffect(() => {
    if (failureStats?.activeFailures) {
      const failuresMap: Record<string, FailureState> = {};
      
      failureStats.activeFailures.forEach((failure: FailureState) => {
        failuresMap[failure.id] = failure;
      });
      
      setActiveFailures(failuresMap);
    }
  }, [failureStats]);
  
  /**
   * Acknowledges a failure
   * 
   * @param failureId The ID of the failure to acknowledge
   * @returns The acknowledged failure
   */
  const acknowledgeFailureState = useCallback(async (failureId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const result = await acknowledgeFailureAction({ failureId });
      
      // Update local state
      setActiveFailures(prev => ({
        ...prev,
        [failureId]: {
          ...prev[failureId],
          status: 'ACKNOWLEDGED'
        }
      }));
      
      return result;
    } catch (error) {
      console.error('Error acknowledging failure:', error);
      throw error;
    }
  }, [user, acknowledgeFailureAction]);
  
  /**
   * Gets recovery options for a failure
   * 
   * @param failureId The ID of the failure
   * @returns The recovery options
   */
  const getFailureRecoveryOptions = useCallback(async (failureId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const options = await getRecoveryOptionsAction({ failureId });
      
      // Update local state
      setRecoveryOptions(prev => ({
        ...prev,
        [failureId]: options
      }));
      
      return options;
    } catch (error) {
      console.error('Error getting recovery options:', error);
      throw error;
    }
  }, [user, getRecoveryOptionsAction]);
  
  /**
   * Executes a recovery action for a failure
   * 
   * @param params Recovery parameters
   * @returns The result of the recovery action
   */
  const executeRecovery = useCallback(async (params: {
    failureId: string;
    recoveryOptionId: string;
    additionalContext?: Record<string, any>;
  }) => {
    if (!user) throw new Error('User not authenticated');
    
    const { failureId, recoveryOptionId, additionalContext = {} } = params;
    
    try {
      // Mark recovery as in progress
      setRecoveryInProgress(prev => ({
        ...prev,
        [failureId]: true
      }));
      
      // Increment recovery attempts
      recoveryAttemptsRef.current[failureId] = (recoveryAttemptsRef.current[failureId] || 0) + 1;
      
      // Execute the recovery action
      const result = await executeRecoveryActionFn({
        failureId,
        recoveryOptionId,
        context: {
          ...additionalContext,
          attemptNumber: recoveryAttemptsRef.current[failureId]
        }
      });
      
      // Update local state if recovery was successful
      if (result.status === 'SUCCESS') {
        setActiveFailures(prev => {
          const newFailures = { ...prev };
          delete newFailures[failureId];
          return newFailures;
        });
      } else {
        // Update failure with new recovery attempt count
        setActiveFailures(prev => ({
          ...prev,
          [failureId]: {
            ...prev[failureId],
            recoveryAttempts: recoveryAttemptsRef.current[failureId],
            lastRecoveryAttempt: new Date()
          }
        }));
      }
      
      return result;
    } catch (error) {
      console.error('Error executing recovery action:', error);
      throw error;
    } finally {
      // Mark recovery as no longer in progress
      setRecoveryInProgress(prev => ({
        ...prev,
        [failureId]: false
      }));
    }
  }, [user, executeRecoveryActionFn]);
  
  /**
   * Updates the recovery configuration
   * 
   * @param config The new configuration
   * @returns The updated configuration
   */
  const updateRecoveryConfiguration = useCallback(async (config: {
    autoRecoveryEnabled?: boolean;
    maxAutoRecoveryAttempts?: number;
    recoveryTimeoutMs?: number;
    escalationThresholds?: Record<string, number>;
    moduleSpecificConfig?: Record<string, any>;
  }) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      return await updateRecoveryConfigAction({
        ...config,
        moduleId
      });
    } catch (error) {
      console.error('Error updating recovery configuration:', error);
      throw error;
    }
  }, [user, moduleId, updateRecoveryConfigAction]);
  
  /**
   * Executes an operation with automatic retry and recovery
   * 
   * @param operation The operation to execute
   * @param options Retry and recovery options
   * @returns The result of the operation
   */
  const executeWithRecovery = useCallback(async <T>(
    operation: () => Promise<T>,
    options: {
      operationName: string;
      maxRetries?: number;
      timeoutMs?: number;
      fallback?: () => Promise<T>;
      context?: Record<string, any>;
    }
  ): Promise<T> => {
    const {
      operationName,
      maxRetries = 3,
      timeoutMs = 30000,
      fallback,
      context = {}
    } = options;
    
    // Create a unique ID for this operation
    const operationId = `${operationName}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Operation '${operationName}' timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      });
      
      // Execute with retries
      let lastError: Error | null = null;
      
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          // Race the operation against the timeout
          return await Promise.race([
            operation(),
            timeoutPromise
          ]);
        } catch (error) {
          lastError = error as Error;
          console.error(`Operation '${operationName}' failed (attempt ${attempt + 1}/${maxRetries}):`, error);
          
          // Wait before retrying
          if (attempt < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
          }
        }
      }
      
      // If we've exhausted all retries and have a fallback, use it
      if (fallback) {
        console.log(`Using fallback for operation '${operationName}' after ${maxRetries} failed attempts`);
        return await fallback();
      }
      
      // Otherwise, throw the last error
      throw lastError || new Error(`Operation '${operationName}' failed after ${maxRetries} attempts`);
    } catch (error) {
      // Record the failure
      console.error(`Operation '${operationName}' failed with recovery:`, error);
      
      // If we have a fallback, use it
      if (fallback) {
        console.log(`Using fallback for operation '${operationName}' after failure`);
        return await fallback();
      }
      
      // Otherwise, rethrow the error
      throw error;
    }
  }, []);
  
  return {
    // Failure state
    activeFailures: Object.values(activeFailures),
    failureStats,
    isLoadingStats,
    statsError,
    recoveryInProgress,
    
    // Actions
    acknowledgeFailure: acknowledgeFailureState,
    getRecoveryOptions: getFailureRecoveryOptions,
    executeRecovery,
    updateRecoveryConfiguration,
    executeWithRecovery,
    
    // Base Sentient Loop functionality
    ...sentientLoopSystem
  };
}
