/**
 * API route for registering webhooks for Sentient Loop™ events
 */
import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import { withErrorHandling } from '../../middleware';
import { validateRequest } from '../../middleware/validation';
import { requirePermission } from '../../middleware/rbac';
import { webhookRegistrationSchema } from '../../types/sentientLoopApi';
import { LoggingService } from '../../../shared/services/logging';
import { generateSecureToken } from '../../../shared/utils/security';

export const registerWebhook = withErrorHandling(async (args, context) => {
  // Apply RBAC middleware - require 'sentient-loop:manage-webhooks' permission
  const user = await requirePermission({
    resource: 'sentient-loop',
    action: 'manage-webhooks',
    adminOverride: true,
    auditRejection: true
  })(context);

  // Validate request data
  const validatedData = validateRequest(args, webhookRegistrationSchema);

  try {
    // Log the operation
    LoggingService.info({
      message: `API: Registering webhook for Sentient Loop events`,
      userId: user.id,
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      metadata: {
        url: validatedData.url,
        events: validatedData.events
      }
    });

    // Generate a webhook secret if not provided
    const webhookSecret = validatedData.secret || generateSecureToken(32);

    // Create the webhook
    const webhook = await prisma.sentientLoopWebhook.create({
      data: {
        userId: user.id,
        url: validatedData.url,
        secret: webhookSecret,
        description: validatedData.description || '',
        events: validatedData.events,
        isActive: validatedData.isActive,
        metadata: validatedData.metadata || {}
      }
    });

    return {
      success: true,
      webhookId: webhook.id,
      secret: webhookSecret,
      events: webhook.events,
      url: webhook.url,
      isActive: webhook.isActive,
      createdAt: webhook.createdAt
    };
  } catch (error) {
    console.error('Error registering webhook:', error);
    LoggingService.error({
      message: 'Failed to register webhook',
      userId: user.id,
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      error
    });
    throw error;
  }
});
