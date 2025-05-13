/**
 * API route for updating an agent query permission
 */
import { HttpError } from 'wasp/server';
import { withErrorHandling } from '../../middleware';
import { validateRequest } from '../../middleware/validation';
import { requirePermission } from '../../middleware/rbac';
import { z } from 'zod';
import { QueryPermissionLevel } from '../../../shared/types/entities/agentQuery';
import { AgentQueryService } from '../../../server/services/agentQueryService';
import { LoggingService } from '../../../shared/services/logging';

// Define the schema for the request
const updateAgentQueryPermissionSchema = z.object({
  id: z.string().uuid('Invalid permission ID'),
  permissionLevel: z.nativeEnum(QueryPermissionLevel).optional(),
  allowedModels: z.array(z.string()).optional(),
  allowedActions: z.array(z.string()).optional(),
  maxQueriesPerDay: z.number().int().positive().optional(),
  requiresApproval: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const updateAgentQueryPermission = withErrorHandling(async (args, context) => {
  // Apply RBAC middleware - require 'agent-permissions:update' permission
  const user = await requirePermission({
    resource: 'agent-permissions',
    action: 'update',
    adminOverride: true,
    auditRejection: true,
  })(context);

  // Validate the request
  const validatedArgs = validateRequest(args, updateAgentQueryPermissionSchema);

  try {
    // Update the agent query permission
    const permission = await AgentQueryService.updateAgentQueryPermission(user.id, validatedArgs);

    // Log the permission update
    await LoggingService.logSystemEvent({
      message: `Agent query permission updated: ${permission.id}`,
      level: 'INFO',
      category: 'DATA_ACCESS',
      source: 'agent-query-api',
      userId: user.id,
      tags: ['agent-query', 'permission', 'update'],
      metadata: {
        permissionId: permission.id,
        agentId: permission.agentId,
        schemaMapId: permission.schemaMapId,
        permissionLevel: permission.permissionLevel,
        allowedModels: permission.allowedModels,
        allowedActions: permission.allowedActions,
        maxQueriesPerDay: permission.maxQueriesPerDay,
        requiresApproval: permission.requiresApproval,
        isActive: permission.isActive,
      },
    });

    return permission;
  } catch (error) {
    console.error('Error updating agent query permission:', error);
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(500, 'Failed to update agent query permission');
  }
});
