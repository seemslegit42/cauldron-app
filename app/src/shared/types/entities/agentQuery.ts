/**
 * Agent Query System Types
 * 
 * This file contains types for the agent query system, which allows AI agents
 * to construct SQL-like queries safely using a validated schema map.
 */

// Permission level for agent queries
export enum QueryPermissionLevel {
  READ_ONLY = 'READ_ONLY',
  READ_WRITE = 'READ_WRITE',
  FULL_ACCESS = 'FULL_ACCESS',
}

// Status of a query approval request
export enum QueryApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  AUTO_APPROVED = 'AUTO_APPROVED',
}

// Schema map entity
export interface SchemaMap {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  description?: string;
  version: string;
  schema: Record<string, any>; // JSON schema map of allowed tables and fields
  isActive: boolean;
  createdById: string;
  organizationId?: string;
}

// Agent query permission entity
export interface AgentQueryPermission {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  agentId: string;
  schemaMapId: string;
  permissionLevel: QueryPermissionLevel;
  allowedModels: string[]; // Array of allowed Prisma models
  allowedActions: string[]; // Array of allowed actions (findMany, findUnique, etc.)
  maxQueriesPerDay: number;
  requiresApproval: boolean;
  isActive: boolean;
}

// Agent query request entity
export interface AgentQueryRequest {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  agentId: string;
  sessionId?: string;
  userId: string;
  prompt: string; // Natural language prompt
  generatedQuery: string; // Generated Prisma query
  queryParams?: Record<string, any>; // Query parameters
  targetModel: string; // Target Prisma model
  action: string; // Prisma action (findMany, findUnique, etc.)
  status: QueryApprovalStatus;
  approvedById?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  executedAt?: Date;
  executionResult?: Record<string, any>; // Result of the query execution
  executionError?: string; // Error message if execution failed
  queryLogId?: string; // Reference to the query log
}

// Query template entity
export interface QueryTemplate {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  description?: string;
  template: string; // Template string with placeholders
  targetModel: string; // Target Prisma model
  action: string; // Prisma action (findMany, findUnique, etc.)
  parameterSchema: Record<string, any>; // JSON schema for parameters
  category?: string; // Category for organization
  isAutoApproved: boolean;
  createdById: string;
  organizationId?: string;
}

// Schema for creating a schema map
export interface CreateSchemaMapInput {
  name: string;
  description?: string;
  schema: Record<string, any>;
  isActive?: boolean;
  organizationId?: string;
}

// Schema for updating a schema map
export interface UpdateSchemaMapInput {
  id: string;
  name?: string;
  description?: string;
  schema?: Record<string, any>;
  isActive?: boolean;
}

// Schema for creating an agent query permission
export interface CreateAgentQueryPermissionInput {
  agentId: string;
  schemaMapId: string;
  permissionLevel?: QueryPermissionLevel;
  allowedModels?: string[];
  allowedActions?: string[];
  maxQueriesPerDay?: number;
  requiresApproval?: boolean;
  isActive?: boolean;
}

// Schema for updating an agent query permission
export interface UpdateAgentQueryPermissionInput {
  id: string;
  permissionLevel?: QueryPermissionLevel;
  allowedModels?: string[];
  allowedActions?: string[];
  maxQueriesPerDay?: number;
  requiresApproval?: boolean;
  isActive?: boolean;
}

// Schema for creating a query template
export interface CreateQueryTemplateInput {
  name: string;
  description?: string;
  template: string;
  targetModel: string;
  action: string;
  parameterSchema: Record<string, any>;
  category?: string;
  isAutoApproved?: boolean;
  organizationId?: string;
}

// Schema for updating a query template
export interface UpdateQueryTemplateInput {
  id: string;
  name?: string;
  description?: string;
  template?: string;
  targetModel?: string;
  action?: string;
  parameterSchema?: Record<string, any>;
  category?: string;
  isAutoApproved?: boolean;
}

// Schema for creating an agent query request
export interface CreateAgentQueryRequestInput {
  agentId: string;
  sessionId?: string;
  prompt: string;
  targetModel?: string;
  action?: string;
}

// Schema for approving or rejecting a query request
export interface ProcessQueryRequestInput {
  id: string;
  approved: boolean;
  rejectionReason?: string;
}
