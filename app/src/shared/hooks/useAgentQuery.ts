/**
 * Agent Query Hook
 *
 * This hook provides a way for agents to query the database safely.
 * It handles the conversion of natural language prompts to Prisma queries,
 * validation, approval, and execution.
 */

import { useState, useCallback } from 'react';
import { useAction } from 'wasp/client/operations';
import { createQueryRequest, processQueryRequest, getQueryResult } from 'wasp/client/operations';
import { QueryApprovalStatus } from '../types/entities/agentQuery';

/**
 * Options for the useAgentQuery hook
 */
export interface UseAgentQueryOptions {
  /** Agent ID */
  agentId: string;
  /** Session ID */
  sessionId?: string;
  /** Whether to auto-approve queries that don't require human approval */
  autoApprove?: boolean;
  /** Whether to use query templates */
  useTemplates?: boolean;
  /** Maximum number of tokens to use for query generation */
  maxTokens?: number;
  /** Temperature for query generation */
  temperature?: number;
  /** Whether to wait for query execution */
  waitForExecution?: boolean;
  /** Maximum time to wait for query execution (ms) */
  executionTimeout?: number;
  /** Maximum number of results to return */
  maxResultSize?: number;
  /** Whether to use sandbox mode */
  useSandbox?: boolean;
  /** Sandbox mode */
  sandboxMode?: 'strict' | 'permissive';
  /** Callback when query is successful */
  onSuccess?: (result: any) => void;
  /** Callback when query fails */
  onError?: (error: Error) => void;
  /** Callback when query requires approval */
  onPending?: (queryRequestId: string) => void;
}

/**
 * Result of a query request
 */
export interface QueryRequestResult {
  /** Whether the query request was successful */
  success: boolean;
  /** The query request ID */
  queryRequestId?: string;
  /** The status of the query request */
  status?: QueryApprovalStatus;
  /** Whether the query requires approval */
  requiresApproval?: boolean;
  /** Error message if the query request failed */
  error?: string;
}

/**
 * Result of a query execution
 */
export interface QueryExecutionResult<T = any> {
  /** Whether the query execution was successful */
  success: boolean;
  /** The result of the query */
  result?: T;
  /** Error message if the query execution failed */
  error?: string;
  /** Warnings from the query execution */
  warnings?: string[];
}

/**
 * Query result state
 */
export interface QueryResult {
  /** The query data */
  data: any;
  /** Error message if the query failed */
  error: string | null;
  /** The status of the query */
  status: QueryApprovalStatus;
  /** Warnings from the query execution */
  warnings?: string[];
}

/**
 * Hook for agent queries
 *
 * @example
 * ```tsx
 * const { executeQuery, isLoading, result } = useAgentQuery({
 *   agentId: 'agent-123',
 *   sessionId: 'session-456',
 *   autoApprove: true,
 *   onSuccess: (result) => console.log('Query succeeded:', result),
 *   onError: (error) => console.error('Query failed:', error),
 *   onPending: (queryId) => console.log('Query pending approval:', queryId)
 * });
 *
 * const handleQuery = () => {
 *   executeQuery('Show me the latest 5 system logs');
 * };
 * ```
 */
export function useAgentQuery(options: UseAgentQueryOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [queryRequestId, setQueryRequestId] = useState<string | null>(null);

  // Default options
  const defaultOptions = {
    autoApprove: true,
    useTemplates: true,
    maxTokens: 1000,
    temperature: 0.2,
    waitForExecution: true,
    executionTimeout: 10000,
    maxResultSize: 1000,
    useSandbox: true,
    sandboxMode: 'strict' as const,
  };

  // Merge options with defaults
  const mergedOptions = { ...defaultOptions, ...options };

  // Actions
  const createQueryRequestAction = useAction(createQueryRequest);
  const processQueryRequestAction = useAction(processQueryRequest);
  const getQueryResultAction = useAction(getQueryResult);

  /**
   * Execute a query from a natural language prompt
   */
  const executeQuery = useCallback(async (
    prompt: string,
    queryOptions: Partial<Omit<UseAgentQueryOptions, 'agentId' | 'sessionId' | 'onSuccess' | 'onError' | 'onPending'>> = {}
  ) => {
    setIsLoading(true);
    setResult(null);

    try {
      // Merge options
      const finalOptions = { ...mergedOptions, ...queryOptions };

      // Create the query request
      const response = await createQueryRequestAction({
        agentId: options.agentId,
        sessionId: options.sessionId,
        prompt,
        autoApprove: finalOptions.autoApprove,
        useTemplates: finalOptions.useTemplates,
        maxTokens: finalOptions.maxTokens,
        temperature: finalOptions.temperature,
      });

      setQueryRequestId(response.queryRequestId);

      if (response.status === QueryApprovalStatus.PENDING) {
        setResult({
          data: null,
          error: null,
          status: QueryApprovalStatus.PENDING,
        });

        options.onPending?.(response.queryRequestId);
        return;
      }

      if (response.status === QueryApprovalStatus.AUTO_APPROVED || response.status === QueryApprovalStatus.APPROVED) {
        // If approved, get the result
        if (finalOptions.waitForExecution) {
          const executionResult = await getQueryResultAction({
            queryRequestId: response.queryRequestId,
            timeout: finalOptions.executionTimeout,
            maxResultSize: finalOptions.maxResultSize,
            sandboxMode: finalOptions.sandboxMode,
          });

          if (executionResult.success) {
            setResult({
              data: executionResult.result,
              error: null,
              status: response.status,
              warnings: executionResult.warnings,
            });

            options.onSuccess?.(executionResult.result);
          } else {
            setResult({
              data: null,
              error: executionResult.error || 'Failed to execute query',
              status: response.status,
              warnings: executionResult.warnings,
            });

            options.onError?.(new Error(executionResult.error || 'Failed to execute query'));
          }
        } else {
          // If not waiting for execution, just return success
          setResult({
            data: { queryRequestId: response.queryRequestId },
            error: null,
            status: response.status,
          });

          options.onSuccess?.({ queryRequestId: response.queryRequestId });
        }
      }
    } catch (error) {
      setResult({
        data: null,
        error: error instanceof Error ? error.message : 'An error occurred',
        status: QueryApprovalStatus.REJECTED,
      });

      options.onError?.(error instanceof Error ? error : new Error('An error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [options, mergedOptions, createQueryRequestAction, getQueryResultAction]);

  /**
   * Approve a pending query
   */
  const approveQuery = useCallback(async (
    id: string,
    executionOptions: Partial<Omit<UseAgentQueryOptions, 'agentId' | 'sessionId' | 'onSuccess' | 'onError' | 'onPending'>> = {}
  ) => {
    setIsLoading(true);

    try {
      // Merge options
      const finalOptions = { ...mergedOptions, ...executionOptions };

      // Approve the query
      const approvalResult = await processQueryRequestAction({
        queryRequestId: id,
        action: 'approve',
      });

      if (!approvalResult.success) {
        setResult({
          data: null,
          error: approvalResult.error || 'Failed to approve query',
          status: QueryApprovalStatus.REJECTED,
        });

        options.onError?.(new Error(approvalResult.error || 'Failed to approve query'));
        return;
      }

      // If we don't want to wait for execution, return success
      if (!finalOptions.waitForExecution) {
        setResult({
          data: { queryRequestId: id },
          error: null,
          status: QueryApprovalStatus.APPROVED,
        });

        options.onSuccess?.({ queryRequestId: id });
        return;
      }

      // Get the query result
      const executionResult = await getQueryResultAction({
        queryRequestId: id,
        timeout: finalOptions.executionTimeout,
        maxResultSize: finalOptions.maxResultSize,
        sandboxMode: finalOptions.sandboxMode,
      });

      if (executionResult.success) {
        setResult({
          data: executionResult.result,
          error: null,
          status: QueryApprovalStatus.APPROVED,
          warnings: executionResult.warnings,
        });

        options.onSuccess?.(executionResult.result);
      } else {
        setResult({
          data: null,
          error: executionResult.error || 'Failed to execute query',
          status: QueryApprovalStatus.APPROVED,
          warnings: executionResult.warnings,
        });

        options.onError?.(new Error(executionResult.error || 'Failed to execute query'));
      }
    } catch (error) {
      setResult({
        data: null,
        error: error instanceof Error ? error.message : 'An error occurred',
        status: QueryApprovalStatus.REJECTED,
      });

      options.onError?.(error instanceof Error ? error : new Error('An error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [options, mergedOptions, processQueryRequestAction, getQueryResultAction]);

  /**
   * Reject a pending query
   */
  const rejectQuery = useCallback(async (
    id: string,
    reason?: string
  ) => {
    setIsLoading(true);

    try {
      // Reject the query
      const rejectionResult = await processQueryRequestAction({
        queryRequestId: id,
        action: 'reject',
        reason,
      });

      if (!rejectionResult.success) {
        setResult({
          data: null,
          error: rejectionResult.error || 'Failed to reject query',
          status: QueryApprovalStatus.REJECTED,
        });

        options.onError?.(new Error(rejectionResult.error || 'Failed to reject query'));
        return;
      }

      setResult({
        data: null,
        error: reason || 'Query rejected',
        status: QueryApprovalStatus.REJECTED,
      });
    } catch (error) {
      setResult({
        data: null,
        error: error instanceof Error ? error.message : 'An error occurred',
        status: QueryApprovalStatus.REJECTED,
      });

      options.onError?.(error instanceof Error ? error : new Error('An error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [options, processQueryRequestAction]);

  return {
    executeQuery,
    approveQuery,
    rejectQuery,
    isLoading,
    result,
    queryRequestId,
  };
}
