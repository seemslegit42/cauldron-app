/**
 * Agent Database Query Hook
 * 
 * This hook provides a way for agents to query the database safely.
 * It handles the creation of query requests, polling for results, and error handling.
 */

import { useState, useCallback, useEffect } from 'react';
import { useAction, useQuery } from 'wasp/client/operations';
import { createQueryRequest, getQueryResult } from 'wasp/client/operations';
import { QueryApprovalStatus } from '../types/entities/agentQuery';

interface UseAgentDatabaseQueryOptions {
  agentId: string;
  sessionId?: string;
  pollingInterval?: number;
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
  onPending?: () => void;
}

interface QueryState {
  isLoading: boolean;
  isPolling: boolean;
  data: any;
  error: string | null;
  status: QueryApprovalStatus | null;
  queryRequestId: string | null;
}

/**
 * Hook for agents to query the database
 */
export function useAgentDatabaseQuery(options: UseAgentDatabaseQueryOptions) {
  const {
    agentId,
    sessionId,
    pollingInterval = 2000, // Default polling interval: 2 seconds
    onSuccess,
    onError,
    onPending,
  } = options;

  const [queryState, setQueryState] = useState<QueryState>({
    isLoading: false,
    isPolling: false,
    data: null,
    error: null,
    status: null,
    queryRequestId: null,
  });

  // Actions and queries
  const createQueryRequestAction = useAction(createQueryRequest);
  const { data: queryResult, isLoading: isLoadingResult, error: queryResultError } = useQuery(
    getQueryResult,
    { queryRequestId: queryState.queryRequestId },
    { enabled: !!queryState.queryRequestId && queryState.isPolling }
  );

  // Effect to handle query result changes
  useEffect(() => {
    if (queryState.isPolling && queryResult) {
      if (queryResult.status === QueryApprovalStatus.APPROVED || 
          queryResult.status === QueryApprovalStatus.AUTO_APPROVED) {
        // Query has been approved and executed
        setQueryState(prev => ({
          ...prev,
          isPolling: false,
          data: queryResult.data,
          status: queryResult.status,
        }));
        
        onSuccess?.(queryResult.data);
      } else if (queryResult.status === QueryApprovalStatus.REJECTED) {
        // Query has been rejected
        setQueryState(prev => ({
          ...prev,
          isPolling: false,
          error: queryResult.rejectionReason || 'Query was rejected',
          status: queryResult.status,
        }));
        
        onError?.(new Error(queryResult.rejectionReason || 'Query was rejected'));
      }
      // If still pending, continue polling
    }
  }, [queryResult, queryState.isPolling, onSuccess, onError]);

  // Effect to handle query result errors
  useEffect(() => {
    if (queryResultError && queryState.isPolling) {
      setQueryState(prev => ({
        ...prev,
        isPolling: false,
        error: queryResultError.message,
      }));
      
      onError?.(queryResultError);
    }
  }, [queryResultError, queryState.isPolling, onError]);

  // Function to execute a query
  const executeQuery = useCallback(async (prompt: string) => {
    setQueryState({
      isLoading: true,
      isPolling: false,
      data: null,
      error: null,
      status: null,
      queryRequestId: null,
    });
    
    try {
      const response = await createQueryRequestAction({
        agentId,
        sessionId,
        prompt,
      });

      if (response.status === QueryApprovalStatus.PENDING) {
        // Query requires approval
        setQueryState({
          isLoading: false,
          isPolling: true,
          data: null,
          error: null,
          status: QueryApprovalStatus.PENDING,
          queryRequestId: response.queryRequestId,
        });
        
        onPending?.();
      } else if (response.status === QueryApprovalStatus.AUTO_APPROVED) {
        // Query was auto-approved, start polling for results
        setQueryState({
          isLoading: false,
          isPolling: true,
          data: null,
          error: null,
          status: QueryApprovalStatus.AUTO_APPROVED,
          queryRequestId: response.queryRequestId,
        });
      }
    } catch (error) {
      setQueryState({
        isLoading: false,
        isPolling: false,
        data: null,
        error: error instanceof Error ? error.message : 'An error occurred',
        status: null,
        queryRequestId: null,
      });
      
      onError?.(error instanceof Error ? error : new Error('An error occurred'));
    }
  }, [agentId, sessionId, createQueryRequestAction, onPending, onError]);

  // Function to cancel polling
  const cancelPolling = useCallback(() => {
    if (queryState.isPolling) {
      setQueryState(prev => ({
        ...prev,
        isPolling: false,
      }));
    }
  }, [queryState.isPolling]);

  return {
    executeQuery,
    cancelPolling,
    isLoading: queryState.isLoading,
    isPolling: queryState.isPolling,
    data: queryState.data,
    error: queryState.error,
    status: queryState.status,
    queryRequestId: queryState.queryRequestId,
  };
}
