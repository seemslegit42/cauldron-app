import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import { 
  getPendingCheckpoints, 
  getSentientActions, 
  getSentientInsights,
  getChiefOfStaffTasks,
  getActiveWorkflows,
  getSystemNotices,
  executeSentientAction
} from '../api/operations';
import { useSentientLoop } from '../hooks/useSentientLoop';

// Types for the graph nodes
interface GraphNode {
  id: string;
  type: 'checkpoint' | 'action' | 'task' | 'workflow' | 'notice' | 'insight';
  title: string;
  description: string;
  status: string;
  module: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  timestamp: string;
  metadata?: any;
  parentId?: string;
  childIds?: string[];
}

interface SentientFeedbackGraphProps {
  className?: string;
  moduleFilter?: string;
  onNodeSelect?: (node: GraphNode) => void;
}

export const SentientFeedbackGraph: React.FC<SentientFeedbackGraphProps> = ({
  className = '',
  moduleFilter,
  onNodeSelect
}) => {
  const graphRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [showNodeDetails, setShowNodeDetails] = useState(false);
  const [graphLayout, setGraphLayout] = useState<'radial' | 'hierarchical' | 'force'>('force');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState({
    showCheckpoints: true,
    showActions: true,
    showTasks: true,
    showWorkflows: true,
    showNotices: true,
    showInsights: true,
    urgencyLevel: 'all' as 'all' | 'low' | 'medium' | 'high' | 'critical',
    confidenceThreshold: 0,
    moduleFilter: moduleFilter || 'all'
  });

  // Fetch data from various sources
  const { data: pendingCheckpoints = [], isLoading: isLoadingCheckpoints } = useQuery(getPendingCheckpoints);
  const { data: sentientActions = [], isLoading: isLoadingActions } = useQuery(getSentientActions);
  const { data: sentientInsights = [], isLoading: isLoadingInsights } = useQuery(getSentientInsights);
  const { data: chiefOfStaffTasks = [], isLoading: isLoadingTasks } = useQuery(getChiefOfStaffTasks);
  const { data: activeWorkflows = [], isLoading: isLoadingWorkflows } = useQuery(getActiveWorkflows);
  const { data: systemNotices = [], isLoading: isLoadingNotices } = useQuery(getSystemNotices);
  
  // Access Sentient Loop functionality
  const { 
    approveCheckpoint, 
    rejectCheckpoint, 
    escalateCheckpoint,
    processAction,
    isProcessing 
  } = useSentientLoop();

  // Execute action function
  const executeAction = useAction(executeSentientAction);

  // Convert all data into graph nodes
  const allNodes = useMemo(() => {
    const nodes: GraphNode[] = [];

    // Add checkpoints
    if (pendingCheckpoints && filterOptions.showCheckpoints) {
      pendingCheckpoints.forEach((checkpoint: any) => {
        nodes.push({
          id: `checkpoint-${checkpoint.id}`,
          type: 'checkpoint',
          title: checkpoint.title,
          description: checkpoint.description,
          status: checkpoint.status,
          module: checkpoint.moduleId,
          urgency: getUrgencyFromType(checkpoint.type),
          confidence: 1.0, // Checkpoints have high confidence
          timestamp: new Date(checkpoint.createdAt).toISOString(),
          metadata: {
            checkpointId: checkpoint.id,
            checkpointType: checkpoint.type,
            originalPayload: checkpoint.originalPayload,
            modifiedPayload: checkpoint.modifiedPayload,
            parentCheckpointId: checkpoint.parentCheckpointId
          },
          parentId: checkpoint.parentCheckpointId ? `checkpoint-${checkpoint.parentCheckpointId}` : undefined
        });
      });
    }

    // Add actions
    if (sentientActions && filterOptions.showActions) {
      sentientActions.forEach((action: any) => {
        const urgency = getUrgencyFromImpact(action.impact);
        if (shouldIncludeBasedOnFilters(urgency, action.confidence)) {
          nodes.push({
            id: `action-${action.id}`,
            type: 'action',
            title: action.title,
            description: action.description,
            status: 'pending',
            module: action.module,
            urgency,
            confidence: action.confidence,
            timestamp: new Date().toISOString(), // Assuming current time for actions
            metadata: {
              actionId: action.id,
              options: action.options
            }
          });
        }
      });
    }

    // Add tasks
    if (chiefOfStaffTasks && filterOptions.showTasks) {
      chiefOfStaffTasks.forEach((task: any) => {
        const urgency = getUrgencyFromPriority(task.priority);
        if (shouldIncludeBasedOnFilters(urgency, 0.8)) { // Assuming tasks have 0.8 confidence
          nodes.push({
            id: `task-${task.id}`,
            type: 'task',
            title: task.title,
            description: task.description,
            status: task.status,
            module: 'ChiefOfStaff',
            urgency,
            confidence: 0.8,
            timestamp: new Date(task.createdAt).toISOString(),
            metadata: {
              taskId: task.id,
              assignedTo: task.assignedTo,
              dueDate: task.dueDate
            }
          });
        }
      });
    }

    // Add workflows
    if (activeWorkflows && filterOptions.showWorkflows) {
      activeWorkflows.forEach((workflow: any) => {
        const urgency = 'medium' as const;
        if (shouldIncludeBasedOnFilters(urgency, 0.9)) { // Assuming workflows have 0.9 confidence
          nodes.push({
            id: `workflow-${workflow.id}`,
            type: 'workflow',
            title: workflow.name,
            description: `Progress: ${workflow.progress}%`,
            status: workflow.status,
            module: 'Forgeflow',
            urgency,
            confidence: 0.9,
            timestamp: new Date(workflow.lastUpdated || workflow.createdAt).toISOString(),
            metadata: {
              workflowId: workflow.id,
              progress: workflow.progress,
              steps: workflow.steps,
              completedSteps: workflow.completedSteps
            }
          });
        }
      });
    }

    // Add system notices
    if (systemNotices && filterOptions.showNotices) {
      systemNotices.forEach((notice: any) => {
        const urgency = getUrgencyFromLevel(notice.level);
        if (shouldIncludeBasedOnFilters(urgency, 0.95)) { // Assuming notices have 0.95 confidence
          nodes.push({
            id: `notice-${notice.id}`,
            type: 'notice',
            title: notice.title,
            description: notice.message,
            status: 'active',
            module: notice.source,
            urgency,
            confidence: 0.95,
            timestamp: new Date(notice.timestamp).toISOString(),
            metadata: {
              noticeId: notice.id,
              level: notice.level,
              source: notice.source
            }
          });
        }
      });
    }

    // Add insights
    if (sentientInsights && filterOptions.showInsights) {
      sentientInsights.forEach((insight: any) => {
        const urgency = getUrgencyFromImpact(insight.impact);
        if (shouldIncludeBasedOnFilters(urgency, insight.confidence)) {
          nodes.push({
            id: `insight-${insight.id}`,
            type: 'insight',
            title: insight.title,
            description: insight.description,
            status: 'active',
            module: insight.source,
            urgency,
            confidence: insight.confidence,
            timestamp: new Date(insight.timestamp).toISOString(),
            metadata: {
              insightId: insight.id,
              category: insight.category,
              relatedMetrics: insight.relatedMetrics
            }
          });
        }
      });
    }

    // Apply module filter if specified
    if (filterOptions.moduleFilter !== 'all') {
      return nodes.filter(node => node.module === filterOptions.moduleFilter);
    }

    return nodes;
  }, [
    pendingCheckpoints, 
    sentientActions, 
    sentientInsights, 
    chiefOfStaffTasks, 
    activeWorkflows, 
    systemNotices, 
    filterOptions
  ]);

  // Create edges between nodes
  const edges = useMemo(() => {
    const result: { source: string; target: string; type: string }[] = [];
    
    // Connect parent-child relationships
    allNodes.forEach(node => {
      if (node.parentId) {
        result.push({
          source: node.parentId,
          target: node.id,
          type: 'parent-child'
        });
      }
    });

    // Connect related nodes based on module
    const moduleGroups: Record<string, string[]> = {};
    allNodes.forEach(node => {
      if (!moduleGroups[node.module]) {
        moduleGroups[node.module] = [];
      }
      moduleGroups[node.module].push(node.id);
    });

    // Connect nodes within the same module with a weak connection
    Object.values(moduleGroups).forEach(group => {
      if (group.length > 1) {
        for (let i = 0; i < group.length - 1; i++) {
          result.push({
            source: group[i],
            target: group[i + 1],
            type: 'module-relation'
          });
        }
      }
    });

    return result;
  }, [allNodes]);

  // Helper functions for determining urgency
  function getUrgencyFromType(type: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (type) {
      case 'ESCALATION_REQUIRED':
        return 'critical';
      case 'DECISION_REQUIRED':
        return 'high';
      case 'CONFIRMATION_REQUIRED':
        return 'medium';
      default:
        return 'low';
    }
  }

  function getUrgencyFromImpact(impact: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (impact?.toLowerCase()) {
      case 'critical':
        return 'critical';
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      default:
        return 'low';
    }
  }

  function getUrgencyFromPriority(priority: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'critical';
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      default:
        return 'low';
    }
  }

  function getUrgencyFromLevel(level: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (level?.toLowerCase()) {
      case 'critical':
        return 'critical';
      case 'error':
        return 'high';
      case 'warning':
        return 'medium';
      default:
        return 'low';
    }
  }

  // Filter helper function
  function shouldIncludeBasedOnFilters(urgency: 'low' | 'medium' | 'high' | 'critical', confidence: number): boolean {
    if (filterOptions.urgencyLevel !== 'all' && urgency !== filterOptions.urgencyLevel) {
      return false;
    }
    
    if (confidence < filterOptions.confidenceThreshold) {
      return false;
    }
    
    return true;
  }

  // Get color based on urgency and confidence
  function getNodeColor(node: GraphNode): string {
    // Base colors for urgency levels
    const urgencyColors = {
      critical: '#ef4444', // red-500
      high: '#f97316',     // orange-500
      medium: '#eab308',   // yellow-500
      low: '#22c55e'       // green-500
    };
    
    // Adjust opacity based on confidence
    const baseColor = urgencyColors[node.urgency];
    const opacity = 0.5 + (node.confidence * 0.5); // Scale from 50% to 100% opacity
    
    // Return with opacity
    return baseColor;
  }

  // Get border color based on node type
  function getNodeBorderColor(node: GraphNode): string {
    switch (node.type) {
      case 'checkpoint':
        return '#a855f7'; // purple-500
      case 'action':
        return '#3b82f6'; // blue-500
      case 'task':
        return '#ec4899'; // pink-500
      case 'workflow':
        return '#06b6d4'; // cyan-500
      case 'notice':
        return '#f43f5e'; // rose-500
      case 'insight':
        return '#10b981'; // emerald-500
      default:
        return '#6b7280'; // gray-500
    }
  }

  // Get node size based on urgency and type
  function getNodeSize(node: GraphNode): number {
    // Base size by type
    let baseSize = 0;
    switch (node.type) {
      case 'checkpoint':
        baseSize = 16;
        break;
      case 'action':
        baseSize = 14;
        break;
      case 'insight':
        baseSize = 12;
        break;
      default:
        baseSize = 10;
    }
    
    // Adjust by urgency
    const urgencyMultiplier = {
      critical: 1.5,
      high: 1.3,
      medium: 1.1,
      low: 1.0
    };
    
    return baseSize * urgencyMultiplier[node.urgency];
  }

  // Handle node selection
  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
    setShowNodeDetails(true);
    if (onNodeSelect) {
      onNodeSelect(node);
    }
  };

  // Handle node action (approve, reject, etc.)
  const handleNodeAction = async (action: string) => {
    if (!selectedNode) return;
    
    try {
      if (selectedNode.type === 'checkpoint') {
        const checkpointId = selectedNode.metadata.checkpointId;
        
        switch (action) {
          case 'approve':
            await approveCheckpoint(checkpointId, 'Approved via Feedback Graph');
            break;
          case 'reject':
            await rejectCheckpoint(checkpointId, 'Rejected via Feedback Graph');
            break;
          case 'escalate':
            await escalateCheckpoint(checkpointId, 'HIGH', 'Escalated via Feedback Graph');
            break;
        }
      } else if (selectedNode.type === 'action') {
        const actionId = selectedNode.metadata.actionId;
        const recommendedOption = selectedNode.metadata.options.find((o: any) => o.isRecommended);
        
        if (recommendedOption) {
          await executeAction({
            actionId,
            optionId: recommendedOption.id
          });
        }
      }
      
      // Close the details panel after action
      setShowNodeDetails(false);
      setSelectedNode(null);
    } catch (error) {
      console.error('Error handling node action:', error);
    }
  };

  // Render the graph using SVG
  const renderGraph = () => {
    if (isLoadingCheckpoints || isLoadingActions || isLoadingInsights || 
        isLoadingTasks || isLoadingWorkflows || isLoadingNotices) {
      return (
        <div className="flex h-full w-full items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-purple-500"></div>
        </div>
      );
    }

    if (allNodes.length === 0) {
      return (
        <div className="flex h-full w-full items-center justify-center text-gray-400">
          <p>No data available with current filters</p>
        </div>
      );
    }

    // Calculate positions based on layout
    const nodePositions = calculateNodePositions(allNodes, graphLayout);

    return (
      <svg 
        className="h-full w-full"
        style={{ 
          transform: `scale(${zoomLevel}) translate(${panPosition.x}px, ${panPosition.y}px)`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={(e) => {
          setIsDragging(true);
          setDragStart({ x: e.clientX, y: e.clientY });
        }}
        onMouseMove={(e) => {
          if (isDragging) {
            setPanPosition({
              x: panPosition.x + (e.clientX - dragStart.x) / zoomLevel,
              y: panPosition.y + (e.clientY - dragStart.y) / zoomLevel
            });
            setDragStart({ x: e.clientX, y: e.clientY });
          }
        }}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        {/* Render edges first so they appear behind nodes */}
        <g className="edges">
          {edges.map((edge, index) => {
            const sourcePos = nodePositions[edge.source];
            const targetPos = nodePositions[edge.target];
            
            if (!sourcePos || !targetPos) return null;
            
            return (
              <line
                key={`edge-${index}`}
                x1={sourcePos.x}
                y1={sourcePos.y}
                x2={targetPos.x}
                y2={targetPos.y}
                stroke={edge.type === 'parent-child' ? '#6b7280' : '#374151'}
                strokeWidth={edge.type === 'parent-child' ? 2 : 1}
                strokeOpacity={edge.type === 'parent-child' ? 0.8 : 0.4}
                strokeDasharray={edge.type === 'module-relation' ? '4 2' : undefined}
              />
            );
          })}
        </g>
        
        {/* Render nodes */}
        <g className="nodes">
          {allNodes.map((node) => {
            const pos = nodePositions[node.id];
            if (!pos) return null;
            
            const nodeSize = getNodeSize(node);
            const isHovered = hoveredNode === node.id;
            const isSelected = selectedNode?.id === node.id;
            
            return (
              <g
                key={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => handleNodeClick(node)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Node circle */}
                <circle
                  r={nodeSize}
                  fill={getNodeColor(node)}
                  stroke={getNodeBorderColor(node)}
                  strokeWidth={isSelected || isHovered ? 3 : 1.5}
                  opacity={isHovered ? 1 : 0.85}
                />
                
                {/* Node icon based on type */}
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize={nodeSize * 0.8}
                  fontWeight="bold"
                >
                  {getNodeIcon(node.type)}
                </text>
                
                {/* Node label (only show on hover or selection) */}
                {(isHovered || isSelected) && (
                  <text
                    y={nodeSize + 12}
                    textAnchor="middle"
                    fill="white"
                    fontSize="10"
                    fontWeight="medium"
                  >
                    {node.title.length > 20 ? node.title.substring(0, 18) + '...' : node.title}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    );
  };

  // Helper function to get node icon
  function getNodeIcon(type: string): string {
    switch (type) {
      case 'checkpoint':
        return '⬡';
      case 'action':
        return '▶';
      case 'task':
        return '✓';
      case 'workflow':
        return '⟳';
      case 'notice':
        return '!';
      case 'insight':
        return 'i';
      default:
        return '•';
    }
  }

  // Calculate node positions based on layout algorithm
  function calculateNodePositions(nodes: GraphNode[], layout: string): Record<string, { x: number; y: number }> {
    const positions: Record<string, { x: number; y: number }> = {};
    const width = graphRef.current?.clientWidth || 800;
    const height = graphRef.current?.clientHeight || 600;
    const centerX = width / 2;
    const centerY = height / 2;
    
    if (layout === 'radial') {
      // Radial layout - nodes in a circle
      const radius = Math.min(width, height) * 0.4;
      nodes.forEach((node, index) => {
        const angle = (index / nodes.length) * 2 * Math.PI;
        positions[node.id] = {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle)
        };
      });
    } else if (layout === 'hierarchical') {
      // Hierarchical layout - nodes in levels
      const levels: Record<string, GraphNode[]> = {
        checkpoint: [],
        action: [],
        task: [],
        workflow: [],
        notice: [],
        insight: []
      };
      
      // Group nodes by type
      nodes.forEach(node => {
        if (levels[node.type]) {
          levels[node.type].push(node);
        }
      });
      
      // Position nodes by level
      let currentY = 100;
      Object.entries(levels).forEach(([type, typeNodes]) => {
        if (typeNodes.length > 0) {
          const levelWidth = width - 100;
          const nodeSpacing = levelWidth / (typeNodes.length + 1);
          
          typeNodes.forEach((node, index) => {
            positions[node.id] = {
              x: 50 + nodeSpacing * (index + 1),
              y: currentY
            };
          });
          
          currentY += 120;
        }
      });
    } else {
      // Force-directed layout (simplified)
      // In a real implementation, you would use a proper force-directed algorithm
      // This is a very simplified version
      nodes.forEach((node, index) => {
        const angle = (index / nodes.length) * 2 * Math.PI;
        const distance = 100 + Math.random() * 200;
        positions[node.id] = {
          x: centerX + distance * Math.cos(angle),
          y: centerY + distance * Math.sin(angle)
        };
      });
      
      // Apply some repulsion between nodes (very simplified)
      for (let i = 0; i < 10; i++) { // 10 iterations
        nodes.forEach(node1 => {
          nodes.forEach(node2 => {
            if (node1.id !== node2.id) {
              const pos1 = positions[node1.id];
              const pos2 = positions[node2.id];
              const dx = pos1.x - pos2.x;
              const dy = pos1.y - pos2.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              if (distance < 60) {
                const repulsionForce = 5;
                const fx = (dx / distance) * repulsionForce;
                const fy = (dy / distance) * repulsionForce;
                
                positions[node1.id] = {
                  x: pos1.x + fx,
                  y: pos1.y + fy
                };
                
                positions[node2.id] = {
                  x: pos2.x - fx,
                  y: pos2.y - fy
                };
              }
            }
          });
        });
      }
    }
    
    return positions;
  }

  return (
    <div className={`flex h-full flex-col rounded-lg border border-gray-700 bg-gray-800 shadow-lg ${className}`}>
      {/* Header with controls */}
      <div className="flex items-center justify-between border-b border-gray-700 p-4">
        <div>
          <h2 className="text-xl font-bold text-purple-400">Sentient Feedback Graph</h2>
          <p className="text-sm text-gray-400">Visualizing agent tasks, approvals, and escalations</p>
        </div>
        
        <div className="flex space-x-2">
          {/* Layout selector */}
          <select
            className="rounded-md border border-gray-600 bg-gray-700 px-2 py-1 text-sm text-white"
            value={graphLayout}
            onChange={(e) => setGraphLayout(e.target.value as any)}
          >
            <option value="force">Force Layout</option>
            <option value="radial">Radial Layout</option>
            <option value="hierarchical">Hierarchical Layout</option>
          </select>
          
          {/* Zoom controls */}
          <div className="flex rounded-md border border-gray-600 bg-gray-700">
            <button
              className="px-2 py-1 text-white hover:bg-gray-600"
              onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
              title="Zoom out"
            >
              -
            </button>
            <span className="border-x border-gray-600 px-2 py-1 text-sm text-white">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              className="px-2 py-1 text-white hover:bg-gray-600"
              onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
              title="Zoom in"
            >
              +
            </button>
          </div>
          
          {/* Reset view button */}
          <button
            className="rounded-md border border-gray-600 bg-gray-700 px-2 py-1 text-sm text-white hover:bg-gray-600"
            onClick={() => {
              setZoomLevel(1);
              setPanPosition({ x: 0, y: 0 });
            }}
            title="Reset view"
          >
            Reset
          </button>
        </div>
      </div>
      
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-700 p-3">
        <div className="text-sm font-medium text-gray-300">Filters:</div>
        
        {/* Node type filters */}
        <div className="flex flex-wrap gap-1">
          <button
            className={`rounded-full px-2 py-0.5 text-xs ${filterOptions.showCheckpoints ? 'bg-purple-900 text-purple-200' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => setFilterOptions({...filterOptions, showCheckpoints: !filterOptions.showCheckpoints})}
          >
            Checkpoints
          </button>
          <button
            className={`rounded-full px-2 py-0.5 text-xs ${filterOptions.showActions ? 'bg-blue-900 text-blue-200' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => setFilterOptions({...filterOptions, showActions: !filterOptions.showActions})}
          >
            Actions
          </button>
          <button
            className={`rounded-full px-2 py-0.5 text-xs ${filterOptions.showTasks ? 'bg-pink-900 text-pink-200' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => setFilterOptions({...filterOptions, showTasks: !filterOptions.showTasks})}
          >
            Tasks
          </button>
          <button
            className={`rounded-full px-2 py-0.5 text-xs ${filterOptions.showWorkflows ? 'bg-cyan-900 text-cyan-200' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => setFilterOptions({...filterOptions, showWorkflows: !filterOptions.showWorkflows})}
          >
            Workflows
          </button>
          <button
            className={`rounded-full px-2 py-0.5 text-xs ${filterOptions.showNotices ? 'bg-rose-900 text-rose-200' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => setFilterOptions({...filterOptions, showNotices: !filterOptions.showNotices})}
          >
            Notices
          </button>
          <button
            className={`rounded-full px-2 py-0.5 text-xs ${filterOptions.showInsights ? 'bg-emerald-900 text-emerald-200' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => setFilterOptions({...filterOptions, showInsights: !filterOptions.showInsights})}
          >
            Insights
          </button>
        </div>
        
        <div className="mx-2 h-4 w-px bg-gray-600"></div>
        
        {/* Urgency filter */}
        <select
          className="rounded-md border border-gray-600 bg-gray-700 px-2 py-1 text-xs text-white"
          value={filterOptions.urgencyLevel}
          onChange={(e) => setFilterOptions({...filterOptions, urgencyLevel: e.target.value as any})}
        >
          <option value="all">All Urgency Levels</option>
          <option value="critical">Critical Only</option>
          <option value="high">High & Above</option>
          <option value="medium">Medium & Above</option>
          <option value="low">Low & Above</option>
        </select>
        
        {/* Confidence threshold */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-400">Confidence:</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={filterOptions.confidenceThreshold}
            onChange={(e) => setFilterOptions({...filterOptions, confidenceThreshold: parseFloat(e.target.value)})}
            className="h-1 w-24 appearance-none rounded-full bg-gray-600"
          />
          <span className="text-xs text-gray-300">{Math.round(filterOptions.confidenceThreshold * 100)}%</span>
        </div>
        
        {/* Module filter */}
        {moduleFilter === undefined && (
          <select
            className="rounded-md border border-gray-600 bg-gray-700 px-2 py-1 text-xs text-white"
            value={filterOptions.moduleFilter}
            onChange={(e) => setFilterOptions({...filterOptions, moduleFilter: e.target.value})}
          >
            <option value="all">All Modules</option>
            <option value="Arcana">Arcana</option>
            <option value="Phantom">Phantom</option>
            <option value="Athena">Athena</option>
            <option value="Forgeflow">Forgeflow</option>
            <option value="ChiefOfStaff">Chief of Staff</option>
          </select>
        )}
      </div>
      
      {/* Graph visualization */}
      <div 
        ref={graphRef}
        className="relative flex-1 overflow-hidden"
      >
        {renderGraph()}
        
        {/* Legend */}
        <div className="absolute bottom-4 left-4 rounded-lg bg-gray-900 bg-opacity-80 p-2 text-xs text-white">
          <div className="mb-1 font-medium">Legend:</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <div className="flex items-center">
              <span className="mr-1 inline-block h-3 w-3 rounded-full bg-purple-500"></span>
              <span>Checkpoints</span>
            </div>
            <div className="flex items-center">
              <span className="mr-1 inline-block h-3 w-3 rounded-full bg-blue-500"></span>
              <span>Actions</span>
            </div>
            <div className="flex items-center">
              <span className="mr-1 inline-block h-3 w-3 rounded-full bg-pink-500"></span>
              <span>Tasks</span>
            </div>
            <div className="flex items-center">
              <span className="mr-1 inline-block h-3 w-3 rounded-full bg-cyan-500"></span>
              <span>Workflows</span>
            </div>
            <div className="flex items-center">
              <span className="mr-1 inline-block h-3 w-3 rounded-full bg-rose-500"></span>
              <span>Notices</span>
            </div>
            <div className="flex items-center">
              <span className="mr-1 inline-block h-3 w-3 rounded-full bg-emerald-500"></span>
              <span>Insights</span>
            </div>
          </div>
          <div className="mt-1 border-t border-gray-700 pt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="mr-1 inline-block h-3 w-3 rounded-full bg-red-500"></span>
                <span>Critical</span>
              </div>
              <div className="flex items-center">
                <span className="mr-1 inline-block h-3 w-3 rounded-full bg-orange-500"></span>
                <span>High</span>
              </div>
              <div className="flex items-center">
                <span className="mr-1 inline-block h-3 w-3 rounded-full bg-yellow-500"></span>
                <span>Medium</span>
              </div>
              <div className="flex items-center">
                <span className="mr-1 inline-block h-3 w-3 rounded-full bg-green-500"></span>
                <span>Low</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Node details modal */}
      {showNodeDetails && selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-gray-700 bg-gray-800 shadow-xl">
            <div className="border-b border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">{selectedNode.title}</h3>
                <button
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-700 hover:text-white"
                  onClick={() => setShowNodeDetails(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-1 flex flex-wrap gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs ${
                  selectedNode.urgency === 'critical' ? 'bg-red-900 text-red-200' :
                  selectedNode.urgency === 'high' ? 'bg-orange-900 text-orange-200' :
                  selectedNode.urgency === 'medium' ? 'bg-yellow-900 text-yellow-200' :
                  'bg-green-900 text-green-200'
                }`}>
                  {selectedNode.urgency.charAt(0).toUpperCase() + selectedNode.urgency.slice(1)} Urgency
                </span>
                <span className="rounded-full bg-gray-700 px-2 py-0.5 text-xs text-gray-300">
                  {selectedNode.module}
                </span>
                <span className="rounded-full bg-gray-700 px-2 py-0.5 text-xs text-gray-300">
                  Confidence: {Math.round(selectedNode.confidence * 100)}%
                </span>
                <span className="rounded-full bg-gray-700 px-2 py-0.5 text-xs text-gray-300">
                  {new Date(selectedNode.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <h4 className="mb-1 font-medium text-purple-400">Description</h4>
                <p className="text-gray-300">{selectedNode.description}</p>
              </div>
              
              {/* Node-specific details */}
              {selectedNode.type === 'checkpoint' && (
                <div className="mb-4">
                  <h4 className="mb-1 font-medium text-purple-400">Checkpoint Details</h4>
                  <div className="rounded-md bg-gray-900 p-3">
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-400">Type:</span>
                      <span className="ml-2 text-sm text-white">{selectedNode.metadata.checkpointType}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-400">Status:</span>
                      <span className="ml-2 text-sm text-white">{selectedNode.status}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-400">Payload:</span>
                      <pre className="mt-1 max-h-32 overflow-auto rounded bg-gray-800 p-2 text-xs text-gray-300">
                        {JSON.stringify(selectedNode.metadata.originalPayload, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedNode.type === 'action' && (
                <div className="mb-4">
                  <h4 className="mb-1 font-medium text-purple-400">Action Options</h4>
                  <div className="space-y-2">
                    {selectedNode.metadata.options.map((option: any) => (
                      <div 
                        key={option.id}
                        className={`rounded-md border p-2 ${
                          option.isRecommended 
                            ? 'border-purple-500 bg-purple-900 bg-opacity-20' 
                            : 'border-gray-700 bg-gray-900'
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="font-medium text-white">{option.label}</span>
                          {option.isRecommended && (
                            <span className="ml-2 rounded bg-purple-800 px-1.5 py-0.5 text-xs text-purple-200">
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-400">{option.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedNode.type === 'insight' && selectedNode.metadata.relatedMetrics && (
                <div className="mb-4">
                  <h4 className="mb-1 font-medium text-purple-400">Related Metrics</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedNode.metadata.relatedMetrics.map((metric: any, index: number) => (
                      <div key={index} className="rounded-md bg-gray-900 p-2">
                        <div className="text-sm font-medium text-white">{metric.name}</div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-gray-300">{metric.value}</span>
                          <span className={`flex items-center text-xs ${
                            metric.trend === 'up' ? 'text-green-400' : 
                            metric.trend === 'down' ? 'text-red-400' : 
                            'text-gray-400'
                          }`}>
                            {metric.trend === 'up' && '↑'}
                            {metric.trend === 'down' && '↓'}
                            {metric.trend === 'stable' && '→'}
                            {metric.changePercent !== undefined && ` ${metric.changePercent}%`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Action buttons */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  className="rounded bg-gray-700 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-600"
                  onClick={() => setShowNodeDetails(false)}
                >
                  Close
                </button>
                
                {selectedNode.type === 'checkpoint' && (
                  <>
                    <button
                      className="rounded bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700"
                      onClick={() => handleNodeAction('reject')}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Reject'}
                    </button>
                    <button
                      className="rounded bg-yellow-600 px-4 py-2 text-sm text-white transition-colors hover:bg-yellow-700"
                      onClick={() => handleNodeAction('escalate')}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Escalate'}
                    </button>
                    <button
                      className="rounded bg-green-600 px-4 py-2 text-sm text-white transition-colors hover:bg-green-700"
                      onClick={() => handleNodeAction('approve')}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Approve'}
                    </button>
                  </>
                )}
                
                {selectedNode.type === 'action' && (
                  <button
                    className="rounded bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
                    onClick={() => handleNodeAction('execute')}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Execute Recommended Action'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};