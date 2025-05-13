import { useState, useEffect, useCallback } from 'react';
import { useQuery } from 'wasp/client/operations';
import { Node, Edge } from 'reactflow';
import { 
  getLangGraphState, 
  getWorkflowExecutionById,
  getWorkflowExecutionsForWorkflow
} from '../api/operations';

interface UseLangGraphDataOptions {
  graphStateId?: string;
  workflowId?: string;
  executionId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface LangGraphNodeExecution {
  id: string;
  nodeId: string;
  startedAt: string;
  completedAt?: string;
  status: string;
  input: any;
  output?: any;
  error?: string;
  duration?: number;
}

interface LangGraphState {
  id: string;
  graphId: string;
  name: string;
  status: string;
  state: any;
  checkpointedAt: string;
  nodes: Array<{
    id: string;
    nodeId: string;
    type: string;
    config: any;
  }>;
  edges: Array<{
    id: string;
    sourceNodeId: string;
    targetNodeId: string;
    condition?: string;
  }>;
  nodeExecutions: LangGraphNodeExecution[];
}

export function useLangGraphData({
  graphStateId,
  workflowId,
  executionId,
  autoRefresh = true,
  refreshInterval = 3000,
}: UseLangGraphDataOptions) {
  // State for nodes and edges
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [nodeExecutions, setNodeExecutions] = useState<LangGraphNodeExecution[]>([]);
  const [graphState, setGraphState] = useState<any>(null);
  
  // Query for graph state
  const { 
    data: graphStateData, 
    isLoading: isLoadingGraphState, 
    error: graphStateError,
    refetch: refetchGraphState
  } = useQuery(
    getLangGraphState, 
    { stateId: graphStateId },
    { enabled: !!graphStateId }
  );
  
  // Query for workflow execution
  const { 
    data: executionData, 
    isLoading: isLoadingExecution, 
    error: executionError,
    refetch: refetchExecution
  } = useQuery(
    getWorkflowExecutionById, 
    { executionId },
    { enabled: !!executionId && !graphStateId }
  );
  
  // Query for workflow executions
  const { 
    data: workflowExecutionsData, 
    isLoading: isLoadingWorkflowExecutions, 
    error: workflowExecutionsError,
    refetch: refetchWorkflowExecutions
  } = useQuery(
    getWorkflowExecutionsForWorkflow, 
    { workflowId },
    { enabled: !!workflowId && !graphStateId && !executionId }
  );
  
  // Determine the actual graph state to use
  const actualGraphState = graphStateData || 
    (executionData?.langGraphState) || 
    (workflowExecutionsData?.[0]?.langGraphState);
  
  const isLoading = isLoadingGraphState || isLoadingExecution || isLoadingWorkflowExecutions;
  const error = graphStateError || executionError || workflowExecutionsError;
  
  // Function to transform graph state into nodes and edges
  const transformGraphState = useCallback((graphState: LangGraphState) => {
    if (!graphState) return;
    
    // Set the graph state
    setGraphState(graphState);
    
    // Set node executions
    setNodeExecutions(graphState.nodeExecutions || []);
    
    // Transform nodes
    const reactFlowNodes: Node[] = graphState.nodes.map((node, index) => {
      // Find the node execution
      const nodeExecution = graphState.nodeExecutions?.find(
        (execution: LangGraphNodeExecution) => execution.nodeId === node.nodeId
      );
      
      // Calculate position (simple grid layout)
      const position = {
        x: (index % 3) * 250,
        y: Math.floor(index / 3) * 150,
      };
      
      return {
        id: node.nodeId,
        type: node.type,
        position,
        data: {
          label: node.config.label || node.nodeId,
          ...node.config,
          execution: nodeExecution,
        },
      };
    });
    
    // Transform edges
    const reactFlowEdges: Edge[] = graphState.edges.map((edge) => {
      return {
        id: edge.id,
        source: edge.sourceNodeId,
        target: edge.targetNodeId,
        animated: true,
        label: edge.condition,
        data: {
          condition: edge.condition,
        },
      };
    });
    
    setNodes(reactFlowNodes);
    setEdges(reactFlowEdges);
  }, []);
  
  // Effect to transform graph state when it changes
  useEffect(() => {
    if (actualGraphState) {
      transformGraphState(actualGraphState);
    }
  }, [actualGraphState, transformGraphState]);
  
  // Set up auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    
    const intervalId = setInterval(() => {
      if (graphStateId) {
        refetchGraphState();
      } else if (executionId) {
        refetchExecution();
      } else if (workflowId) {
        refetchWorkflowExecutions();
      }
    }, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [
    autoRefresh, 
    refreshInterval, 
    graphStateId, 
    executionId, 
    workflowId, 
    refetchGraphState, 
    refetchExecution, 
    refetchWorkflowExecutions
  ]);
  
  // Function to manually refresh
  const refresh = useCallback(() => {
    if (graphStateId) {
      refetchGraphState();
    } else if (executionId) {
      refetchExecution();
    } else if (workflowId) {
      refetchWorkflowExecutions();
    }
  }, [
    graphStateId, 
    executionId, 
    workflowId, 
    refetchGraphState, 
    refetchExecution, 
    refetchWorkflowExecutions
  ]);
  
  return {
    nodes,
    edges,
    isLoading,
    error,
    refresh,
    graphState: actualGraphState,
    nodeExecutions,
  };
}
