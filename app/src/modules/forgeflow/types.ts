/**
 * Forgeflow Module Types
 * 
 * This file contains TypeScript type definitions for the Forgeflow visual no-code agent builder.
 */

// Node types for the visual workflow builder
export enum NodeType {
  AGENT = 'AGENT',
  TASK = 'TASK',
  TRIGGER = 'TRIGGER',
  CONDITION = 'CONDITION',
  OUTPUT = 'OUTPUT',
  DATA = 'DATA',
  LOOP = 'LOOP',
  TRANSFORM = 'TRANSFORM',
  INTEGRATION = 'INTEGRATION',
}

// Trigger types
export enum TriggerType {
  MANUAL = 'manual',
  SCHEDULED = 'scheduled',
  WEBHOOK = 'webhook',
  EVENT = 'event',
  DATA_CHANGE = 'data_change',
  API = 'api',
}

// Condition types
export enum ConditionType {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  REGEX = 'regex',
  CUSTOM = 'custom',
}

// Output types
export enum OutputType {
  RESULT = 'result',
  NOTIFICATION = 'notification',
  EMAIL = 'email',
  WEBHOOK = 'webhook',
  DATABASE = 'database',
  API = 'api',
}

// Agent template interface
export interface AgentTemplate {
  id: string;
  name: string;
  role: string;
  goal: string;
  backstory?: string;
  memory: boolean;
  allowDelegation: boolean;
  verbose?: boolean;
  maxIterations?: number;
  maxExecutionTime?: number;
  tools?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Task template interface
export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  expectedOutput?: string;
  contextual: boolean;
  async: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Workflow template interface
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  agents: AgentTemplate[];
  tasks: {
    name: string;
    description: string;
    agent: string;
    expectedOutput?: string;
    dependsOn?: string[];
  }[];
  process?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Workflow design interface
export interface WorkflowDesign {
  id: string;
  workflowId: string;
  version: number;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  createdAt: Date;
  updatedAt: Date;
}

// Workflow node interface
export interface WorkflowNode {
  id: string;
  designId: string;
  type: NodeType;
  positionX: number;
  positionY: number;
  data: any;
  createdAt: Date;
  updatedAt: Date;
}

// Workflow connection interface
export interface WorkflowConnection {
  id: string;
  designId: string;
  sourceId: string;
  targetId: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Workflow execution interface
export interface WorkflowExecution {
  id: string;
  workflowId: string;
  userId?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  results?: any;
  error?: string;
  triggerId?: string;
  isLangGraph: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// LangGraph node types
export enum LangGraphNodeType {
  LLM = 'llm',
  TOOL = 'tool',
  CONDITION = 'condition',
  DEFAULT = 'default',
}

// LangGraph state interface
export interface LangGraphState {
  id: string;
  userId?: string;
  workflowId?: string;
  executionId?: string;
  graphId: string;
  name: string;
  status: 'active' | 'completed' | 'failed' | 'paused';
  state: any;
  metadata?: any;
  checkpointedAt: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  nodes: LangGraphNode[];
  edges: LangGraphEdge[];
  nodeExecutions: LangGraphNodeExecution[];
}

// LangGraph node interface
export interface LangGraphNode {
  id: string;
  graphStateId: string;
  nodeId: string;
  type: LangGraphNodeType;
  config: any;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

// LangGraph edge interface
export interface LangGraphEdge {
  id: string;
  graphStateId: string;
  sourceNodeId: string;
  targetNodeId: string;
  condition?: string;
  createdAt: Date;
  updatedAt: Date;
}

// LangGraph node execution interface
export interface LangGraphNodeExecution {
  id: string;
  graphStateId: string;
  nodeId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  input: any;
  output?: any;
  error?: string;
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
}
