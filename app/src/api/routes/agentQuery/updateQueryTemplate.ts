/**
 * API route for updating a query template
 */
import { HttpError } from 'wasp/server';
import { withErrorHandling } from '../../middleware';
import { validateRequest } from '../../middleware/validation';
import { requirePermission } from '../../middleware/rbac';
import { z } from 'zod';
import { AgentQueryService } from '../../../server/services/agentQueryService';
import { LoggingService } from '../../../shared/services/logging';

// Define the schema for the request
const updateQueryTemplateSchema = z.object({
  id: z.string().uuid('Invalid template ID'),
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  template: z.string().min(1, 'Template is required').optional(),
  targetModel: z.string().min(1, 'Target model is required').optional(),
  action: z.string().min(1, 'Action is required').optional(),
  parameterSchema: z.record(z.any()).optional(),
  category: z.string().optional(),
  isAutoApproved: z.boolean().optional(),
});

export const updateQueryTemplate = withErrorHandling(async (args, context) => {
  // Apply RBAC middleware - require 'query-templates:update' permission
  const user = await requirePermission({
    resource: 'query-templates',
    action: 'update',
    adminOverride: true,
    auditRejection: true,
  })(context);

  // Validate the request
  const validatedArgs = validateRequest(args, updateQueryTemplateSchema);

  try {
    // Update the query template
    const template = await AgentQueryService.updateQueryTemplate(user.id, validatedArgs);

    // Log the template update
    await LoggingService.logSystemEvent({
      message: `Query template updated: ${template.name}`,
      level: 'INFO',
      category: 'DATA_ACCESS',
      source: 'agent-query-api',
      userId: user.id,
      tags: ['agent-query', 'template', 'update'],
      metadata: {
        templateId: template.id,
        templateName: template.name,
        targetModel: template.targetModel,
        action: template.action,
        isAutoApproved: template.isAutoApproved,
      },
    });

    return template;
  } catch (error) {
    console.error('Error updating query template:', error);
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(500, 'Failed to update query template');
  }
});
