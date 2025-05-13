/**
 * API route for getting a schema map by ID
 */
import { HttpError } from 'wasp/server';
import { withErrorHandling } from '../../middleware';
import { validateRequest } from '../../middleware/validation';
import { requirePermission } from '../../middleware/rbac';
import { z } from 'zod';
import { AgentQueryService } from '../../../server/services/agentQueryService';
import { LoggingService } from '../../../shared/services/logging';

// Define the schema for the request
const getSchemaMapSchema = z.object({
  id: z.string().uuid('Invalid schema map ID'),
});

export const getSchemaMap = withErrorHandling(async (args, context) => {
  // Apply RBAC middleware - require 'schema-maps:read' permission
  const user = await requirePermission({
    resource: 'schema-maps',
    action: 'read',
    adminOverride: true,
    auditRejection: true,
  })(context);

  // Validate the request
  const validatedArgs = validateRequest(args, getSchemaMapSchema);

  try {
    // Get the schema map
    const schemaMap = await AgentQueryService.getSchemaMap(validatedArgs.id);

    // Log the schema map access
    await LoggingService.logSystemEvent({
      message: `Schema map accessed: ${schemaMap.name}`,
      level: 'INFO',
      category: 'DATA_ACCESS',
      source: 'agent-query-api',
      userId: user.id,
      tags: ['agent-query', 'schema-map', 'read'],
      metadata: {
        schemaMapId: schemaMap.id,
        schemaMapName: schemaMap.name,
      },
    });

    return schemaMap;
  } catch (error) {
    console.error('Error getting schema map:', error);
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(500, 'Failed to get schema map');
  }
});
