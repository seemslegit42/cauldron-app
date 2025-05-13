/**
 * Sentient Query Approval Hook
 * 
 * This hook provides functionality for approving, rejecting, or modifying agent-generated
 * queries through the Sentient Loop™ system.
 */

import { useState, useCallback } from 'react';
import { useAction, useQuery } from 'wasp/client/operations';
import { useUser } from 'wasp/client/auth';
import { 
  getPendingQueryRequests,
  approveQueryRequest,
  rejectQueryRequest,
  modifyQueryRequest,
  getQueryRequestDetails
} from '../api/sentientQueryOperations';
import { useSentientLoop } from './useSentientLoop';
import { QueryApprovalStatus } from '@src/shared/types/entities/agentQuery';

export interface QueryRequestWithDetails {
  id: string;
  prompt: string;
  generatedQuery: string;
  targetModel: string;
  action: string;
  queryParams: any;
  status: QueryApprovalStatus;
  agent: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    email: string;
  };
  validationResults?: {
    valid: boolean;
    errors?: string[];
    warnings?: string[];
  };
  metadata?: any;
  createdAt: Date;
}

export interface UseSentientQueryApprovalOptions {
  moduleId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

/**
 * Hook for approving, rejecting, or modifying agent-generated queries
 * through the Sentient Loop™ system.
 * 
 * @param options Hook options
 * @returns Query approval functions and state
 */
export function useSentientQueryApproval(options: UseSentientQueryApprovalOptions = {}) {
  const { 
    moduleId = 'agent-query',
    autoRefresh = true,
    refreshInterval = 30000 // 30 seconds
  } = options;
  
  const user = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedQueryId, setSelectedQueryId] = useState<string | null>(null);
  
  // Get the Sentient Loop™ functionality
  const sentientLoop = useSentientLoop(moduleId);
  
  // Get pending query requests
  const { 
    data: pendingQueries,
    isLoading: isLoadingPendingQueries,
    error: pendingQueriesError,
    refetch: refetchPendingQueries
  } = useQuery(getPendingQueryRequests, {
    pollingInterval: autoRefresh ? refreshInterval : undefined,
  });
  
  // Get query request details
  const { 
    data: selectedQuery,
    isLoading: isLoadingSelectedQuery,
    error: selectedQueryError,
    refetch: refetchSelectedQuery
  } = useQuery(getQueryRequestDetails, {
    queryId: selectedQueryId,
  }, {
    enabled: !!selectedQueryId,
  });
  
  // Actions
  const approveQueryRequestAction = useAction(approveQueryRequest);
  const rejectQueryRequestAction = useAction(rejectQueryRequest);
  const modifyQueryRequestAction = useAction(modifyQueryRequest);
  
  /**
   * Approve a query request
   * 
   * @param queryId The ID of the query request to approve
   * @param comment Optional comment
   * @returns The result of the approval
   */
  const approveQuery = useCallback(async (
    queryId: string,
    comment?: string
  ) => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await approveQueryRequestAction({
        queryId,
        comment,
      });
      
      // Refetch pending queries
      refetchPendingQueries();
      
      // If the selected query was approved, refetch it
      if (selectedQueryId === queryId) {
        refetchSelectedQuery();
      }
      
      // Record the decision in Sentient Loop™
      await sentientLoop.recordDecision({
        decisionType: 'QUERY_APPROVAL',
        decision: 'APPROVED',
        context: {
          queryId,
          comment,
        },
        metadata: {
          userId: user.id,
          moduleId,
        },
      });
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve query';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, approveQueryRequestAction, refetchPendingQueries, refetchSelectedQuery, selectedQueryId, sentientLoop, moduleId]);
  
  /**
   * Reject a query request
   * 
   * @param queryId The ID of the query request to reject
   * @param reason The reason for rejection
   * @returns The result of the rejection
   */
  const rejectQuery = useCallback(async (
    queryId: string,
    reason: string
  ) => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await rejectQueryRequestAction({
        queryId,
        reason,
      });
      
      // Refetch pending queries
      refetchPendingQueries();
      
      // If the selected query was rejected, refetch it
      if (selectedQueryId === queryId) {
        refetchSelectedQuery();
      }
      
      // Record the decision in Sentient Loop™
      await sentientLoop.recordDecision({
        decisionType: 'QUERY_APPROVAL',
        decision: 'REJECTED',
        context: {
          queryId,
          reason,
        },
        metadata: {
          userId: user.id,
          moduleId,
        },
      });
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject query';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, rejectQueryRequestAction, refetchPendingQueries, refetchSelectedQuery, selectedQueryId, sentientLoop, moduleId]);
  
  /**
   * Modify a query request
   * 
   * @param queryId The ID of the query request to modify
   * @param modifiedParams The modified query parameters
   * @param comment Optional comment
   * @returns The result of the modification
   */
  const modifyQuery = useCallback(async (
    queryId: string,
    modifiedParams: Record<string, any>,
    comment?: string
  ) => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await modifyQueryRequestAction({
        queryId,
        modifiedParams,
        comment,
      });
      
      // Refetch pending queries
      refetchPendingQueries();
      
      // If the selected query was modified, refetch it
      if (selectedQueryId === queryId) {
        refetchSelectedQuery();
      }
      
      // Record the decision in Sentient Loop™
      await sentientLoop.recordDecision({
        decisionType: 'QUERY_APPROVAL',
        decision: 'MODIFIED',
        context: {
          queryId,
          comment,
          originalParams: selectedQuery?.queryParams,
          modifiedParams,
        },
        metadata: {
          userId: user.id,
          moduleId,
        },
      });
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to modify query';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, modifyQueryRequestAction, refetchPendingQueries, refetchSelectedQuery, selectedQueryId, selectedQuery, sentientLoop, moduleId]);
  
  return {
    // State
    pendingQueries,
    selectedQuery,
    isLoading: isLoading || isLoadingPendingQueries || isLoadingSelectedQuery,
    error: error || pendingQueriesError || selectedQueryError,
    
    // Actions
    approveQuery,
    rejectQuery,
    modifyQuery,
    selectQuery: setSelectedQueryId,
    refreshQueries: refetchPendingQueries,
  };
}
