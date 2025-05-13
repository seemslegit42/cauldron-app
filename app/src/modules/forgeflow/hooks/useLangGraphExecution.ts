import { useState, useEffect, useCallback } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import { 
  getWorkflowExecutionById, 
  executeThreatResearchWorkflow 
} from '../api/operations';

interface UseLangGraphExecutionOptions {
  executionId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  onStatusChange?: (status: string, execution: any) => void;
  onComplete?: (execution: any) => void;
  onError?: (error: any, execution: any) => void;
}

export function useLangGraphExecution({
  executionId,
  autoRefresh = true,
  refreshInterval = 2000,
  onStatusChange,
  onComplete,
  onError,
}: UseLangGraphExecutionOptions) {
  const [previousStatus, setPreviousStatus] = useState<string | null>(null);
  
  // Query for workflow execution
  const { 
    data: execution, 
    isLoading, 
    error,
    refetch
  } = useQuery(
    getWorkflowExecutionById, 
    { executionId },
    { enabled: !!executionId }
  );
  
  // Action to execute a workflow
  const executeWorkflowAction = useAction(executeThreatResearchWorkflow);
  
  // Execute a new workflow
  const executeWorkflow = useCallback(async (input: {
    input_threat: string;
    project_name: string;
  }) => {
    try {
      const result = await executeWorkflowAction(input);
      return result;
    } catch (error) {
      console.error('Error executing workflow:', error);
      throw error;
    }
  }, [executeWorkflowAction]);
  
  // Check for status changes
  useEffect(() => {
    if (!execution) return;
    
    const currentStatus = execution.status;
    
    // If status changed, call the callback
    if (previousStatus !== null && previousStatus !== currentStatus) {
      onStatusChange?.(currentStatus, execution);
      
      // If completed, call the onComplete callback
      if (currentStatus === 'COMPLETED') {
        onComplete?.(execution);
      }
      
      // If failed, call the onError callback
      if (currentStatus === 'FAILED') {
        onError?.(new Error(execution.error || 'Execution failed'), execution);
      }
    }
    
    setPreviousStatus(currentStatus);
  }, [execution, previousStatus, onStatusChange, onComplete, onError]);
  
  // Set up auto-refresh
  useEffect(() => {
    if (!autoRefresh || !executionId) return;
    
    // Don't refresh if execution is completed or failed
    if (
      execution?.status === 'COMPLETED' || 
      execution?.status === 'FAILED' ||
      execution?.status === 'CANCELLED'
    ) {
      return;
    }
    
    const intervalId = setInterval(() => {
      refetch();
    }, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [
    autoRefresh, 
    refreshInterval, 
    executionId, 
    refetch, 
    execution?.status
  ]);
  
  // Function to manually refresh
  const refresh = useCallback(() => {
    if (executionId) {
      refetch();
    }
  }, [executionId, refetch]);
  
  return {
    execution,
    isLoading,
    error,
    refresh,
    executeWorkflow,
    status: execution?.status || null,
    results: execution?.results || null,
    langGraphState: execution?.langGraphState || null,
  };
}
