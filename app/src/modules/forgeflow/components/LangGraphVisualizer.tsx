import React, { useState, useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  NodeTypes,
  EdgeTypes,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Badge } from '@src/shared/components/ui/badge';
import { Button } from '@src/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@src/shared/components/ui/card';
import { Spinner } from '@src/shared/components/ui/spinner';
import { Alert, AlertDescription } from '@src/shared/components/ui/alert';
import { LangGraphNodeTypes } from './LangGraphNodeTypes';
import { ConnectionLine } from './ConnectionLine';
import { useLangGraphData } from '../hooks/useLangGraphData';

// Define custom node types
const nodeTypes: NodeTypes = {
  llm: LangGraphNodeTypes.LLMNode,
  tool: LangGraphNodeTypes.ToolNode,
  condition: LangGraphNodeTypes.ConditionNode,
  default: LangGraphNodeTypes.DefaultNode,
};

// Define custom edge types
const edgeTypes: EdgeTypes = {
  default: ConnectionLine,
};

export interface LangGraphVisualizerProps {
  graphStateId?: string;
  workflowId?: string;
  executionId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  onNodeClick?: (nodeId: string, nodeData: any) => void;
  className?: string;
  showControls?: boolean;
  showMiniMap?: boolean;
  showRefreshButton?: boolean;
  height?: string;
}

const LangGraphVisualizerInner: React.FC<LangGraphVisualizerProps> = ({
  graphStateId,
  workflowId,
  executionId,
  autoRefresh = true,
  refreshInterval = 3000,
  onNodeClick,
  className = '',
  showControls = true,
  showMiniMap = true,
  showRefreshButton = true,
  height = '500px',
}) => {
  const { 
    nodes, 
    edges, 
    isLoading, 
    error, 
    refresh,
    graphState,
    nodeExecutions
  } = useLangGraphData({
    graphStateId,
    workflowId,
    executionId,
    autoRefresh,
    refreshInterval,
  });

  const [reactFlowNodes, setNodes, onNodesChange] = useNodesState([]);
  const [reactFlowEdges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();

  // Update nodes and edges when they change
  useEffect(() => {
    if (nodes && edges) {
      setNodes(nodes);
      setEdges(edges);
    }
  }, [nodes, edges, setNodes, setEdges]);

  // Fit view when nodes change
  useEffect(() => {
    if (reactFlowNodes.length > 0) {
      setTimeout(() => {
        fitView({ padding: 0.2 });
      }, 100);
    }
  }, [reactFlowNodes.length, fitView]);

  // Handle node click
  const handleNodeClick = useCallback((_, node) => {
    if (onNodeClick) {
      // Find the node execution data
      const nodeExecution = nodeExecutions?.find(
        (execution) => execution.nodeId === node.id
      );
      
      onNodeClick(node.id, {
        ...node.data,
        execution: nodeExecution,
      });
    }
  }, [onNodeClick, nodeExecutions]);

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  // Render loading state
  if (isLoading && (!nodes || nodes.length === 0)) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <Spinner size="lg" />
        <span className="ml-2">Loading graph data...</span>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertDescription>
          Error loading graph data: {error.message || 'Unknown error'}
        </AlertDescription>
      </Alert>
    );
  }

  // Render empty state
  if (!nodes || nodes.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <p className="text-muted-foreground">No graph data available</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <ReactFlow
        nodes={reactFlowNodes}
        edges={reactFlowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        attributionPosition="bottom-right"
        minZoom={0.2}
        maxZoom={4}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#333" gap={16} />
        {showControls && <Controls />}
        {showMiniMap && (
          <MiniMap
            nodeStrokeColor={(n) => {
              if (n.type === 'llm') return '#ff0072';
              if (n.type === 'tool') return '#0041d0';
              if (n.type === 'condition') return '#ff9900';
              return '#eee';
            }}
            nodeColor={(n) => {
              if (n.type === 'llm') return '#ff0072';
              if (n.type === 'tool') return '#0041d0';
              if (n.type === 'condition') return '#ff9900';
              return '#fff';
            }}
            maskColor="rgba(0, 0, 0, 0.5)"
          />
        )}
        {showRefreshButton && (
          <Panel position="top-right">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleRefresh}
              className="bg-card"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 mr-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
              Refresh
            </Button>
          </Panel>
        )}
      </ReactFlow>
      
      {/* Graph Status Badge */}
      {graphState && (
        <div className="absolute top-2 left-2 z-10">
          <Badge 
            variant={
              graphState.status === 'completed' ? 'success' : 
              graphState.status === 'failed' ? 'destructive' : 
              graphState.status === 'active' ? 'default' : 
              'outline'
            }
          >
            {graphState.status.charAt(0).toUpperCase() + graphState.status.slice(1)}
          </Badge>
        </div>
      )}
    </div>
  );
};

// Wrap the component with ReactFlowProvider
export const LangGraphVisualizer: React.FC<LangGraphVisualizerProps> = (props) => {
  return (
    <ReactFlowProvider>
      <LangGraphVisualizerInner {...props} />
    </ReactFlowProvider>
  );
};

export default LangGraphVisualizer;
