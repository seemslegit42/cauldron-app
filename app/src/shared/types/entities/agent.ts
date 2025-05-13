/**
 * Agent-related entity types
 */

// Agent type
export enum AgentType {
  PERCEPTION = 'PERCEPTION',
  ANALYSIS = 'ANALYSIS',
  ACTION = 'ACTION',
  COORDINATION = 'COORDINATION',
  MEMORY = 'MEMORY',
}

// Agent configuration
export interface AgentConfiguration {
  /** Agent's role */
  role: string;
  /** Agent's goal */
  goal: string;
  /** Agent's backstory */
  backstory?: string;
  /** Agent's tools */
  tools?: string[];
  /** Agent's constraints */
  constraints?: string[];
  /** Agent's metadata */
  metadata?: AgentMetadata;
  /** Agent's model configuration */
  model?: {
    /** Model name */
    name: string;
    /** Model provider */
    provider: 'OPENAI' | 'GROQ' | 'ANTHROPIC' | 'OTHER';
    /** Model parameters */
    parameters?: Record<string, any>;
  };
}

// Agent metadata
export interface AgentMetadata {
  /** Agent's scope */
  scope: string;
  /** Module the agent belongs to */
  module: string;
  /** User ID of the agent's owner */
  owner: string;
  /** Agent's safety score (0-10) */
  safetyScore?: number;
  /** Estimated token usage */
  estimatedTokens?: number;
}

// Agent entity
export interface Agent {
  /** Unique identifier for the agent */
  id: string;
  /** When the agent was created */
  createdAt: Date;
  /** When the agent was last updated */
  updatedAt: Date;
  /** User ID of the agent's owner */
  userId: string;
  /** Agent's name */
  name: string;
  /** Agent's description */
  description: string;
  /** Agent's type */
  type: string;
  /** Agent's capabilities */
  capabilities: string[];
  /** AI model used */
  model: string;
  /** AI provider */
  provider: string;
  /** System prompt for the agent */
  systemPrompt: string;
  /** Agent's configuration */
  configuration: AgentConfiguration;
  /** Whether the agent is active */
  isActive: boolean;
  /** Persona ID if this agent uses one */
  personaId?: string;
  /** Persona details if included */
  persona?: AgentPersona;
}

// Agent persona
export interface AgentPersona {
  /** Unique identifier for the persona */
  id: string;
  /** When the persona was created */
  createdAt: Date;
  /** When the persona was last updated */
  updatedAt: Date;
  /** Persona name */
  name: string;
  /** Persona description */
  description: string;
  /** Persona role */
  role: string;
  /** Persona category */
  category: string;
  /** Base system prompt for the persona */
  systemPrompt: string;
  /** Whether this persona is available in the public library */
  isPublic: boolean;
  /** Whether this persona is verified by the platform */
  isVerified: boolean;
  /** Semantic versioning */
  version: string;
  /** User ID who created this persona */
  createdById: string;
  /** Organization ID if this persona belongs to an organization */
  organizationId?: string;
  /** ID of the persona this was forked from */
  forkedFromId?: string;
}

// Agent with workflows
export interface AgentWithWorkflows extends Agent {
  /** Agent's workflows */
  workflows: Workflow[];
}

// Workflow entity
export interface Workflow {
  /** Unique identifier for the workflow */
  id: string;
  /** When the workflow was created */
  createdAt: Date;
  /** When the workflow was last updated */
  updatedAt: Date;
  /** User ID of the workflow's owner */
  userId: string;
  /** Workflow's name */
  name: string;
  /** Workflow's description */
  description: string;
  /** Workflow's steps */
  steps: WorkflowStep[];
  /** Workflow's triggers */
  triggers: WorkflowTrigger[];
  /** Whether the workflow is active */
  isActive: boolean;
}

// Workflow step
export interface WorkflowStep {
  /** Step ID */
  id: string;
  /** Step name */
  name: string;
  /** Step description */
  description?: string;
  /** Agent ID to execute this step */
  agentId: string;
  /** Step input */
  input?: Record<string, any>;
  /** Dependencies on other steps */
  dependencies?: string[];
  /** Whether this step is required */
  isRequired: boolean;
  /** Maximum execution time in seconds */
  maxExecutionTime?: number;
}

// Workflow trigger
export interface WorkflowTrigger {
  /** Trigger ID */
  id: string;
  /** Trigger type */
  type: 'EVENT' | 'SCHEDULE' | 'MANUAL' | 'WEBHOOK';
  /** Trigger configuration */
  config: Record<string, any>;
}

// Workflow execution
export interface WorkflowExecution {
  /** Unique identifier for the execution */
  id: string;
  /** When the execution was created */
  createdAt: Date;
  /** User ID who initiated the execution */
  userId: string;
  /** Workflow ID being executed */
  workflowId: string;
  /** Execution status */
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  /** Execution input */
  input: Record<string, any>;
  /** Execution context */
  context: Record<string, any>;
  /** Execution output */
  output?: Record<string, any>;
  /** When the execution started */
  startedAt?: Date;
  /** When the execution completed */
  completedAt?: Date;
  /** Error message if execution failed */
  error?: string;
}
