/**
 * API route for updating a schema map
 */
import { HttpError } from 'wasp/server';
import { withErrorHandling } from '../../middleware';
import { validateRequest } from '../../middleware/validation';
import { requirePermission } from '../../middleware/rbac';
import { z } from 'zod';
import { AgentQueryService } from '../../../server/services/agentQueryService';
import { LoggingService } from '../../../shared/services/logging';

// Define the schema for the request
const updateSchemaMapSchema = z.object({
  id: z.string().uuid('Invalid schema map ID'),
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  schema: z.record(z.any()).optional(),
  isActive: z.boolean().optional(),
});

export const updateSchemaMap = withErrorHandling(async (args, context) => {
  // Apply RBAC middleware - require 'schema-maps:update' permission
  const user = await requirePermission({
    resource: 'schema-maps',
    action: 'update',
    adminOverride: true,
    auditRejection: true,
  })(context);

  // Validate the request
  const validatedArgs = validateRequest(args, updateSchemaMapSchema);

  try {
    // Update the schema map
    const schemaMap = await AgentQueryService.updateSchemaMap(user.id, validatedArgs);

    // Log the schema map update
    await LoggingService.logSystemEvent({
      message: `Schema map updated: ${schemaMap.name}`,
      level: 'INFO',
      category: 'DATA_ACCESS',
      source: 'agent-query-api',
      userId: user.id,
      tags: ['agent-query', 'schema-map', 'update'],
      metadata: {
        schemaMapId: schemaMap.id,
        schemaMapName: schemaMap.name,
        modelCount: Object.keys(schemaMap.schema).length,
        isActive: schemaMap.isActive,
      },
    });

    return schemaMap;
  } catch (error) {
    console.error('Error updating schema map:', error);
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(500, 'Failed to update schema map');
  }
});
