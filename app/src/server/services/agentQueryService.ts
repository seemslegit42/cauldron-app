/**
 * Agent Query Service
 *
 * This service provides functionality for managing agent queries, including
 * schema maps, query permissions, and query requests.
 */

import { prisma } from 'wasp/server';
import { HttpError } from 'wasp/server';
import { LoggingService } from '../../shared/services/logging';
import { QuerySandboxService } from './querySandboxService';
import { PromptToQueryService } from './promptToQueryService';
import {
  QueryPermissionLevel,
  QueryApprovalStatus,
  SchemaMap,
  AgentQueryPermission,
  AgentQueryRequest,
  QueryTemplate,
  CreateSchemaMapInput,
  UpdateSchemaMapInput,
  CreateAgentQueryPermissionInput,
  UpdateAgentQueryPermissionInput,
  CreateQueryTemplateInput,
  UpdateQueryTemplateInput,
  CreateAgentQueryRequestInput,
  ProcessQueryRequestInput,
} from '../../shared/types/entities/agentQuery';
import { z } from 'zod';

/**
 * Agent Query Service
 */
export class AgentQueryService {
  /**
   * Create a schema map
   */
  static async createSchemaMap(userId: string, input: CreateSchemaMapInput): Promise<SchemaMap> {
    try {
      const schemaMap = await prisma.schemaMap.create({
        data: {
          name: input.name,
          description: input.description,
          version: '1.0.0',
          schema: input.schema,
          isActive: input.isActive ?? true,
          createdById: userId,
          organizationId: input.organizationId,
        },
      });

      return schemaMap;
    } catch (error) {
      console.error('Error creating schema map:', error);
      throw new HttpError(500, 'Failed to create schema map');
    }
  }

  /**
   * Update a schema map
   */
  static async updateSchemaMap(userId: string, input: UpdateSchemaMapInput): Promise<SchemaMap> {
    try {
      // Check if the schema map exists and the user has permission to update it
      const existingSchemaMap = await prisma.schemaMap.findUnique({
        where: { id: input.id },
      });

      if (!existingSchemaMap) {
        throw new HttpError(404, 'Schema map not found');
      }

      if (existingSchemaMap.createdById !== userId) {
        // Check if the user is an admin or has permission to update schema maps
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        });

        const hasPermission = user?.role?.permissions.some(
          (rp) => rp.permission.resource === 'schema-maps' && rp.permission.action === 'update'
        );

        if (!hasPermission) {
          throw new HttpError(403, 'You do not have permission to update this schema map');
        }
      }

      // Update the schema map
      const updatedSchemaMap = await prisma.schemaMap.update({
        where: { id: input.id },
        data: {
          name: input.name,
          description: input.description,
          schema: input.schema,
          isActive: input.isActive,
          version: existingSchemaMap.version, // Increment version if schema changes
        },
      });

      return updatedSchemaMap;
    } catch (error) {
      console.error('Error updating schema map:', error);
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, 'Failed to update schema map');
    }
  }

  /**
   * Get a schema map by ID
   */
  static async getSchemaMap(id: string): Promise<SchemaMap> {
    try {
      const schemaMap = await prisma.schemaMap.findUnique({
        where: { id },
      });

      if (!schemaMap) {
        throw new HttpError(404, 'Schema map not found');
      }

      return schemaMap;
    } catch (error) {
      console.error('Error getting schema map:', error);
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, 'Failed to get schema map');
    }
  }

  /**
   * List schema maps
   */
  static async listSchemaMaps(
    userId: string,
    organizationId?: string,
    isActive?: boolean
  ): Promise<SchemaMap[]> {
    try {
      const schemaMaps = await prisma.schemaMap.findMany({
        where: {
          OR: [{ createdById: userId }, { organizationId }],
          isActive,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return schemaMaps;
    } catch (error) {
      console.error('Error listing schema maps:', error);
      throw new HttpError(500, 'Failed to list schema maps');
    }
  }

  /**
   * Create an agent query permission
   */
  static async createAgentQueryPermission(
    userId: string,
    input: CreateAgentQueryPermissionInput
  ): Promise<AgentQueryPermission> {
    try {
      // Check if the agent exists and belongs to the user
      const agent = await prisma.aI_Agent.findUnique({
        where: { id: input.agentId },
      });

      if (!agent) {
        throw new HttpError(404, 'Agent not found');
      }

      if (agent.userId !== userId) {
        // Check if the user is an admin or has permission to manage agent permissions
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        });

        const hasPermission = user?.role?.permissions.some(
          (rp) =>
            rp.permission.resource === 'agent-permissions' && rp.permission.action === 'create'
        );

        if (!hasPermission) {
          throw new HttpError(403, 'You do not have permission to create agent query permissions');
        }
      }

      // Check if the schema map exists
      const schemaMap = await prisma.schemaMap.findUnique({
        where: { id: input.schemaMapId },
      });

      if (!schemaMap) {
        throw new HttpError(404, 'Schema map not found');
      }

      // Create the agent query permission
      const permission = await prisma.agentQueryPermission.create({
        data: {
          agentId: input.agentId,
          schemaMapId: input.schemaMapId,
          permissionLevel: input.permissionLevel ?? QueryPermissionLevel.READ_ONLY,
          allowedModels: input.allowedModels ?? [],
          allowedActions: input.allowedActions ?? ['findMany', 'findUnique', 'findFirst', 'count'],
          maxQueriesPerDay: input.maxQueriesPerDay ?? 100,
          requiresApproval: input.requiresApproval ?? true,
          isActive: input.isActive ?? true,
        },
      });

      return permission;
    } catch (error) {
      console.error('Error creating agent query permission:', error);
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, 'Failed to create agent query permission');
    }
  }

  /**
   * Update an agent query permission
   */
  static async updateAgentQueryPermission(
    userId: string,
    input: UpdateAgentQueryPermissionInput
  ): Promise<AgentQueryPermission> {
    try {
      // Check if the permission exists
      const existingPermission = await prisma.agentQueryPermission.findUnique({
        where: { id: input.id },
        include: {
          agent: true,
        },
      });

      if (!existingPermission) {
        throw new HttpError(404, 'Agent query permission not found');
      }

      if (existingPermission.agent.userId !== userId) {
        // Check if the user is an admin or has permission to update agent permissions
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        });

        const hasPermission = user?.role?.permissions.some(
          (rp) =>
            rp.permission.resource === 'agent-permissions' && rp.permission.action === 'update'
        );

        if (!hasPermission) {
          throw new HttpError(
            403,
            'You do not have permission to update this agent query permission'
          );
        }
      }

      // Update the permission
      const updatedPermission = await prisma.agentQueryPermission.update({
        where: { id: input.id },
        data: {
          permissionLevel: input.permissionLevel,
          allowedModels: input.allowedModels,
          allowedActions: input.allowedActions,
          maxQueriesPerDay: input.maxQueriesPerDay,
          requiresApproval: input.requiresApproval,
          isActive: input.isActive,
        },
      });

      return updatedPermission;
    } catch (error) {
      console.error('Error updating agent query permission:', error);
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, 'Failed to update agent query permission');
    }
  }

  /**
   * Create a query template
   */
  static async createQueryTemplate(
    userId: string,
    input: CreateQueryTemplateInput
  ): Promise<QueryTemplate> {
    try {
      const template = await prisma.queryTemplate.create({
        data: {
          name: input.name,
          description: input.description,
          template: input.template,
          targetModel: input.targetModel,
          action: input.action,
          parameterSchema: input.parameterSchema,
          category: input.category,
          isAutoApproved: input.isAutoApproved ?? false,
          createdById: userId,
          organizationId: input.organizationId,
        },
      });

      return template;
    } catch (error) {
      console.error('Error creating query template:', error);
      throw new HttpError(500, 'Failed to create query template');
    }
  }

  /**
   * Update a query template
   */
  static async updateQueryTemplate(
    userId: string,
    input: UpdateQueryTemplateInput
  ): Promise<QueryTemplate> {
    try {
      // Check if the template exists and the user has permission to update it
      const existingTemplate = await prisma.queryTemplate.findUnique({
        where: { id: input.id },
      });

      if (!existingTemplate) {
        throw new HttpError(404, 'Query template not found');
      }

      if (existingTemplate.createdById !== userId) {
        // Check if the user is an admin or has permission to update query templates
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        });

        const hasPermission = user?.role?.permissions.some(
          (rp) => rp.permission.resource === 'query-templates' && rp.permission.action === 'update'
        );

        if (!hasPermission) {
          throw new HttpError(403, 'You do not have permission to update this query template');
        }
      }

      // Update the query template
      const updatedTemplate = await prisma.queryTemplate.update({
        where: { id: input.id },
        data: {
          name: input.name,
          description: input.description,
          template: input.template,
          targetModel: input.targetModel,
          action: input.action,
          parameterSchema: input.parameterSchema,
          category: input.category,
          isAutoApproved: input.isAutoApproved,
        },
      });

      return updatedTemplate;
    } catch (error) {
      console.error('Error updating query template:', error);
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, 'Failed to update query template');
    }
  }

  /**
   * Process a query request (approve or reject)
   */
  static async processQueryRequest(
    userId: string,
    input: ProcessQueryRequestInput
  ): Promise<AgentQueryRequest> {
    try {
      // Check if the query request exists
      const queryRequest = await prisma.agentQueryRequest.findUnique({
        where: { id: input.id },
      });

      if (!queryRequest) {
        throw new HttpError(404, 'Query request not found');
      }

      if (queryRequest.status !== QueryApprovalStatus.PENDING) {
        throw new HttpError(400, 'Query request is not pending approval');
      }

      // Update the query request
      const updatedQueryRequest = await prisma.agentQueryRequest.update({
        where: { id: input.id },
        data: {
          status: input.approved ? QueryApprovalStatus.APPROVED : QueryApprovalStatus.REJECTED,
          approvedById: userId,
          approvedAt: new Date(),
          rejectionReason: input.approved ? null : input.rejectionReason,
        },
      });

      // If approved, execute the query
      if (input.approved) {
        await QuerySandboxService.executeQuery(updatedQueryRequest.id);
      }

      return updatedQueryRequest;
    } catch (error) {
      console.error('Error processing query request:', error);
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, 'Failed to process query request');
    }
  }

  /**
   * Create a query request from a prompt
   */
  static async createQueryRequest(
    userId: string,
    input: CreateAgentQueryRequestInput
  ): Promise<{
    queryRequestId: string;
    status: QueryApprovalStatus;
    requiresApproval: boolean;
  }> {
    try {
      // Convert the prompt to a query
      const result = await PromptToQueryService.promptToQuery(
        input.agentId,
        userId,
        input.sessionId,
        input.prompt,
        {
          autoApprove: true,
          useTemplates: true,
        }
      );

      if (!result.success) {
        throw new HttpError(400, result.error || 'Failed to convert prompt to query');
      }

      return {
        queryRequestId: result.queryRequestId!,
        status: result.status!,
        requiresApproval: result.status === QueryApprovalStatus.PENDING,
      };
    } catch (error) {
      console.error('Error creating query request:', error);
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, 'Failed to create query request');
    }
  }
}
