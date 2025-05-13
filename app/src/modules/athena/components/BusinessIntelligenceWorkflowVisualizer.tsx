/**
 * Business Intelligence Workflow Visualizer
 *
 * This component visualizes the LangGraph workflow for business intelligence.
 * It shows the nodes, edges, and execution state of the workflow.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@src/shared/utils/cn';
import { getGlassmorphismClasses } from '@src/shared/utils/glassmorphism';
import { Button } from '@src/shared/components/ui/Button';
import { Spinner } from '@src/shared/components/ui/Spinner';
import { Badge } from '@src/shared/components/ui/Badge';
import { Tooltip } from '@src/shared/components/ui/Tooltip';
import { useQuery } from 'wasp/client/operations';
import { getGraphState } from '@src/modules/forgeflow/api/operations';
import { 
  GraphState, 
  GraphNodeState, 
  GraphNodeStatus 
} from '@src/modules/forgeflow/types/langgraph';
import { TimeframeOption } from '../types';

// Define the props interface
interface BusinessIntelligenceWorkflowVisualizerProps {
  graphStateId?: string;
  timeframe: TimeframeOption;
  className?: string;
  onNodeClick?: (nodeId: string, nodeState: GraphNodeState) => void;
}

/**
 * Business Intelligence Workflow Visualizer Component
 */
export function BusinessIntelligenceWorkflowVisualizer({
  graphStateId,
  timeframe,
  className,
  onNodeClick
}: BusinessIntelligenceWorkflowVisualizerProps) {
  // State for the selected node
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Query the graph state
  const { data: graphState, isLoading, error, refetch } = useQuery(getGraphState, {
    id: graphStateId,
    includeNodeStates: true,
    includeEdgeStates: true,
  });
  
  // Handle node click
  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    
    if (onNodeClick && graphState?.nodeStates) {
      onNodeClick(nodeId, graphState.nodeStates[nodeId]);
    }
  };
  
  // Get the status color for a node
  const getNodeStatusColor = (status: GraphNodeStatus) => {
    switch (status) {
      case GraphNodeStatus.COMPLETED:
        return 'bg-green-500';
      case GraphNodeStatus.RUNNING:
        return 'bg-blue-500';
      case GraphNodeStatus.WAITING:
        return 'bg-yellow-500';
      case GraphNodeStatus.FAILED:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  // Get the node type label
  const getNodeTypeLabel = (nodeId: string) => {
    if (nodeId.startsWith('retrieve-')) {
      return 'Memory Retrieval';
    } else if (nodeId.startsWith('store-')) {
      return 'Memory Storage';
    } else if (nodeId.startsWith('analyze-')) {
      return 'Analysis';
    } else if (nodeId.startsWith('generate-')) {
      return 'Generation';
    } else {
      return 'Process';
    }
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <Spinner size="lg" />
        <span className="ml-2 text-gray-400">Loading workflow state...</span>
      </div>
    );
  }
  
  // Render error state
  if (error || !graphState) {
    return (
      <div className={cn("p-4 text-red-500", className)}>
        <p>Error loading workflow state: {error?.message || 'Unknown error'}</p>
        <Button onClick={() => refetch()} className="mt-2">
          Retry
        </Button>
      </div>
    );
  }
  
  // Render empty state
  if (!graphStateId) {
    return (
      <div className={cn("p-4 text-gray-400", className)}>
        <p>No workflow execution found for the selected timeframe.</p>
        <p className="mt-2">Generate insights or recommendations to see the workflow visualization.</p>
      </div>
    );
  }
  
  // Get the node states
  const nodeStates = graphState.nodeStates || {};
  const nodeIds = Object.keys(nodeStates);
  
  // Get the edge states
  const edgeStates = graphState.edgeStates || {};
  
  return (
    <div className={cn("p-4", className)}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          Business Intelligence Workflow
        </h3>
        <Badge variant="outline" className="text-xs">
          {timeframe}
        </Badge>
      </div>
      
      <div className="mb-4">
        <div className="text-sm text-gray-400">
          Workflow Status: 
          <Badge 
            variant="outline" 
            className={cn(
              "ml-2",
              graphState.status === 'completed' ? 'text-green-500' : 
              graphState.status === 'running' ? 'text-blue-500' : 
              graphState.status === 'failed' ? 'text-red-500' : 
              'text-gray-500'
            )}
          >
            {graphState.status}
          </Badge>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Started: {new Date(graphState.startedAt).toLocaleString()}
          {graphState.completedAt && (
            <span className="ml-2">
              Completed: {new Date(graphState.completedAt).toLocaleString()}
            </span>
          )}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className="min-w-[800px] p-4">
          {/* Workflow visualization */}
          <div className="flex flex-col items-center">
            {/* Nodes */}
            <div className="grid grid-cols-3 gap-4 w-full">
              {nodeIds.map((nodeId) => {
                const nodeState = nodeStates[nodeId];
                const isSelected = selectedNodeId === nodeId;
                
                return (
                  <motion.div
                    key={nodeId}
                    className={cn(
                      "p-3 rounded-lg cursor-pointer transition-all",
                      getGlassmorphismClasses({
                        level: 'low',
                        border: true,
                        shadow: true,
                      }),
                      isSelected && "ring-2 ring-blue-500"
                    )}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleNodeClick(nodeId)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-white">
                        {nodeId}
                      </div>
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        getNodeStatusColor(nodeState.status)
                      )} />
                    </div>
                    <div className="text-xs text-gray-400">
                      {getNodeTypeLabel(nodeId)}
                    </div>
                    {nodeState.startedAt && (
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(nodeState.startedAt).toLocaleTimeString()}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
            
            {/* Selected node details */}
            {selectedNodeId && nodeStates[selectedNodeId] && (
              <div className={cn(
                "mt-6 p-4 w-full rounded-lg",
                getGlassmorphismClasses({
                  level: 'medium',
                  border: true,
                  shadow: true,
                })
              )}>
                <h4 className="text-md font-semibold text-white mb-2">
                  {selectedNodeId} Details
                </h4>
                <div className="text-sm text-gray-400">
                  <div>Status: {nodeStates[selectedNodeId].status}</div>
                  {nodeStates[selectedNodeId].startedAt && (
                    <div>Started: {new Date(nodeStates[selectedNodeId].startedAt).toLocaleString()}</div>
                  )}
                  {nodeStates[selectedNodeId].completedAt && (
                    <div>Completed: {new Date(nodeStates[selectedNodeId].completedAt).toLocaleString()}</div>
                  )}
                  {nodeStates[selectedNodeId].error && (
                    <div className="text-red-500 mt-2">
                      Error: {nodeStates[selectedNodeId].error}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
