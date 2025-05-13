/**
 * API route for creating a query template
 */
import { HttpError } from 'wasp/server';
import { withErrorHandling } from '../../middleware';
import { validateRequest } from '../../middleware/validation';
import { requirePermission } from '../../middleware/rbac';
import { z } from 'zod';
import { AgentQueryService } from '../../../server/services/agentQueryService';
import { LoggingService } from '../../../shared/services/logging';

// Define the schema for the request
const createQueryTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  template: z.string().min(1, 'Template is required'),
  targetModel: z.string().min(1, 'Target model is required'),
  action: z.string().min(1, 'Action is required'),
  parameterSchema: z.record(z.any()),
  category: z.string().optional(),
  isAutoApproved: z.boolean().optional(),
  organizationId: z.string().optional(),
});

export const createQueryTemplate = withErrorHandling(async (args, context) => {
  // Apply RBAC middleware - require 'query-templates:create' permission
  const user = await requirePermission({
    resource: 'query-templates',
    action: 'create',
    adminOverride: true,
    auditRejection: true,
  })(context);

  // Validate the request
  const validatedArgs = validateRequest(args, createQueryTemplateSchema);

  try {
    // Create the query template
    const template = await AgentQueryService.createQueryTemplate(user.id, validatedArgs);

    // Log the template creation
    await LoggingService.logSystemEvent({
      message: `Query template created: ${template.name}`,
      level: 'INFO',
      category: 'DATA_ACCESS',
      source: 'agent-query-api',
      userId: user.id,
      tags: ['agent-query', 'template', 'create'],
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
    console.error('Error creating query template:', error);
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(500, 'Failed to create query template');
  }
});
