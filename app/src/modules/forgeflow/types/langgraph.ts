/**
 * LangGraph Types
 * 
 * Types for the enhanced LangGraph system.
 */

// Enum for LangGraph state status
export enum LangGraphStateStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PAUSED = 'PAUSED',
}

// Enum for LangGraph node types
export enum LangGraphNodeType {
  LLM = 'LLM',
  TOOL = 'TOOL',
  CONDITION = 'CONDITION',
  ROUTER = 'ROUTER',
  MEMORY = 'MEMORY',
  HUMAN_INPUT = 'HUMAN_INPUT',
  DEFAULT = 'DEFAULT',
}

// Enum for LangGraph execution status
export enum LangGraphExecutionStatus {
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  WAITING = 'WAITING',
}

// Interface for LangGraph state
export interface EnhancedLangGraphState {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
  workflowId?: string;
  executionId?: string;
  graphId: string;
  name: string;
  status: LangGraphStateStatus;
  state: any;
  metadata?: any;
  checkpointedAt: Date;
  expiresAt?: Date;
  nodes: EnhancedLangGraphNode[];
  edges: EnhancedLangGraphEdge[];
  nodeExecutions: EnhancedLangGraphNodeExecution[];
}

// Interface for LangGraph node
export interface EnhancedLangGraphNode {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  graphStateId: string;
  nodeId: string;
  type: LangGraphNodeType;
  config: any;
  metadata?: any;
  position?: { x: number; y: number };
  sourceEdges?: EnhancedLangGraphEdge[];
  targetEdges?: EnhancedLangGraphEdge[];
  executions?: EnhancedLangGraphNodeExecution[];
}

// Interface for LangGraph edge
export interface EnhancedLangGraphEdge {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  graphStateId: string;
  sourceNodeId: string;
  targetNodeId: string;
  condition?: string;
  metadata?: any;
}

// Interface for LangGraph node execution
export interface EnhancedLangGraphNodeExecution {
  id: string;
  createdAt: Date;
  graphStateId: string;
  nodeId: string;
  status: LangGraphExecutionStatus;
  input: any;
  output?: any;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  metadata?: any;
}

// Interface for graph definition
export interface GraphDefinition {
  id?: string;
  name?: string;
  nodes: GraphNodeDefinition[];
  edges?: GraphEdgeDefinition[];
  initialState?: any;
  metadata?: any;
}

// Interface for graph node definition
export interface GraphNodeDefinition {
  id: string;
  type: string;
  config?: any;
  metadata?: any;
  position?: { x: number; y: number };
}

// Interface for graph edge definition
export interface GraphEdgeDefinition {
  source: string;
  target: string;
  condition?: string;
  metadata?: any;
}

// Interface for graph execution options
export interface GraphExecutionOptions {
  userId?: string;
  workflowId?: string;
  executionId?: string;
  expiresInDays?: number;
  checkpointInterval?: number;
  maxSteps?: number;
  timeout?: number;
}

// Interface for graph visualization data
export interface GraphVisualizationData {
  nodes: {
    id: string;
    type: string;
    data: any;
    position: { x: number; y: number };
  }[];
  edges: {
    id: string;
    source: string;
    target: string;
    label?: string;
    data?: any;
  }[];
  executions: {
    nodeId: string;
    status: string;
    startedAt: Date;
    completedAt?: Date;
    duration?: number;
  }[];
}

// Interface for node execution result
export interface NodeExecutionResult {
  executionId: string;
  nodeId: string;
  status: LangGraphExecutionStatus;
  output?: any;
  error?: string;
  duration?: number;
}

// Interface for graph execution result
export interface GraphExecutionResult {
  graphStateId: string;
  status: LangGraphStateStatus;
  finalState: any;
  nodeExecutions: NodeExecutionResult[];
  duration: number;
  error?: string;
}

// Interface for graph checkpoint
export interface GraphCheckpoint {
  graphStateId: string;
  state: any;
  timestamp: Date;
  step: number;
}

// Interface for graph execution metrics
export interface GraphExecutionMetrics {
  totalDuration: number;
  nodeExecutions: {
    nodeId: string;
    count: number;
    totalDuration: number;
    averageDuration: number;
    failureRate: number;
  }[];
  totalSteps: number;
  completionRate: number;
}
