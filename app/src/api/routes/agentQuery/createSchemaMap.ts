/**
 * API route for creating a schema map
 */
import { HttpError } from 'wasp/server';
import { withErrorHandling } from '../../middleware';
import { validateRequest } from '../../middleware/validation';
import { requirePermission } from '../../middleware/rbac';
import { z } from 'zod';
import { AgentQueryService } from '../../../server/services/agentQueryService';
import { LoggingService } from '../../../shared/services/logging';

// Define the schema for the request
const createSchemaMapSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  schema: z.record(z.any()).refine(
    schema => {
      // Validate that the schema has at least one model
      return Object.keys(schema).length > 0;
    },
    {
      message: 'Schema must have at least one model',
    }
  ),
  isActive: z.boolean().optional(),
  organizationId: z.string().optional(),
});

export const createSchemaMap = withErrorHandling(async (args, context) => {
  // Apply RBAC middleware - require 'schema-maps:create' permission
  const user = await requirePermission({
    resource: 'schema-maps',
    action: 'create',
    adminOverride: true,
    auditRejection: true,
  })(context);

  // Validate the request
  const validatedArgs = validateRequest(args, createSchemaMapSchema);

  try {
    // Create the schema map
    const schemaMap = await AgentQueryService.createSchemaMap(user.id, validatedArgs);

    // Log the schema map creation
    await LoggingService.logSystemEvent({
      message: `Schema map created: ${schemaMap.name}`,
      level: 'INFO',
      category: 'DATA_ACCESS',
      source: 'agent-query-api',
      userId: user.id,
      tags: ['agent-query', 'schema-map', 'create'],
      metadata: {
        schemaMapId: schemaMap.id,
        schemaMapName: schemaMap.name,
        modelCount: Object.keys(schemaMap.schema).length,
      },
    });

    return schemaMap;
  } catch (error) {
    console.error('Error creating schema map:', error);
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(500, 'Failed to create schema map');
  }
});
