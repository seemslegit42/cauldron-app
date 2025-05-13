/**
 * API route for listing schema maps
 */
import { HttpError } from 'wasp/server';
import { withErrorHandling } from '../../middleware';
import { validateRequest } from '../../middleware/validation';
import { requirePermission } from '../../middleware/rbac';
import { z } from 'zod';
import { AgentQueryService } from '../../../server/services/agentQueryService';
import { LoggingService } from '../../../shared/services/logging';

// Define the schema for the request
const listSchemaMapsSchema = z.object({
  organizationId: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const listSchemaMaps = withErrorHandling(async (args, context) => {
  // Apply RBAC middleware - require 'schema-maps:list' permission
  const user = await requirePermission({
    resource: 'schema-maps',
    action: 'list',
    adminOverride: true,
    auditRejection: true,
  })(context);

  // Validate the request
  const validatedArgs = validateRequest(args, listSchemaMapsSchema);

  try {
    // List schema maps
    const schemaMaps = await AgentQueryService.listSchemaMaps(
      user.id,
      validatedArgs.organizationId,
      validatedArgs.isActive
    );

    // Log the schema maps listing
    await LoggingService.logSystemEvent({
      message: `Schema maps listed`,
      level: 'INFO',
      category: 'DATA_ACCESS',
      source: 'agent-query-api',
      userId: user.id,
      tags: ['agent-query', 'schema-map', 'list'],
      metadata: {
        count: schemaMaps.length,
        organizationId: validatedArgs.organizationId,
        isActive: validatedArgs.isActive,
      },
    });

    return schemaMaps;
  } catch (error) {
    console.error('Error listing schema maps:', error);
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(500, 'Failed to list schema maps');
  }
});
