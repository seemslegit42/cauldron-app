/**
 * API routes for managing webhooks for Sentient Loop™ events
 */
import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import { withErrorHandling } from '../../middleware';
import { validateRequest } from '../../middleware/validation';
import { requirePermission } from '../../middleware/rbac';
import { z } from 'zod';
import { SentientLoopEventType } from '../../types/sentientLoopApi';
import { LoggingService } from '../../../shared/services/logging';

// Schema for updating a webhook
const updateWebhookSchema = z.object({
  webhookId: z.string().uuid(),
  url: z.string().url().optional(),
  description: z.string().optional(),
  events: z.array(z.nativeEnum(SentientLoopEventType)).optional(),
  isActive: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
});

// Schema for deleting a webhook
const deleteWebhookSchema = z.object({
  webhookId: z.string().uuid(),
});

// Schema for listing webhooks
const listWebhooksSchema = z.object({
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  isActive: z.boolean().optional(),
});

// Update webhook
export const updateWebhook = withErrorHandling(async (args, context) => {
  // Apply RBAC middleware - require 'sentient-loop:manage-webhooks' permission
  const user = await requirePermission({
    resource: 'sentient-loop',
    action: 'manage-webhooks',
    adminOverride: true,
    auditRejection: true
  })(context);

  // Validate request data
  const validatedData = validateRequest(args, updateWebhookSchema);

  try {
    // Log the operation
    LoggingService.info({
      message: `API: Updating webhook for Sentient Loop events`,
      userId: user.id,
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      metadata: {
        webhookId: validatedData.webhookId
      }
    });

    // Check if the webhook exists and belongs to the user
    const existingWebhook = await prisma.sentientLoopWebhook.findUnique({
      where: { id: validatedData.webhookId }
    });

    if (!existingWebhook) {
      throw new HttpError(404, 'Webhook not found');
    }

    if (existingWebhook.userId !== user.id && !user.isAdmin) {
      throw new HttpError(403, 'You do not have permission to update this webhook');
    }

    // Update the webhook
    const webhook = await prisma.sentientLoopWebhook.update({
      where: { id: validatedData.webhookId },
      data: {
        url: validatedData.url,
        description: validatedData.description,
        events: validatedData.events,
        isActive: validatedData.isActive,
        metadata: validatedData.metadata
      }
    });

    return {
      success: true,
      webhookId: webhook.id,
      url: webhook.url,
      events: webhook.events,
      isActive: webhook.isActive,
      updatedAt: webhook.updatedAt
    };
  } catch (error) {
    console.error('Error updating webhook:', error);
    LoggingService.error({
      message: 'Failed to update webhook',
      userId: user.id,
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      error
    });
    throw error;
  }
});

// Delete webhook
export const deleteWebhook = withErrorHandling(async (args, context) => {
  // Apply RBAC middleware - require 'sentient-loop:manage-webhooks' permission
  const user = await requirePermission({
    resource: 'sentient-loop',
    action: 'manage-webhooks',
    adminOverride: true,
    auditRejection: true
  })(context);

  // Validate request data
  const validatedData = validateRequest(args, deleteWebhookSchema);

  try {
    // Log the operation
    LoggingService.info({
      message: `API: Deleting webhook for Sentient Loop events`,
      userId: user.id,
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      metadata: {
        webhookId: validatedData.webhookId
      }
    });

    // Check if the webhook exists and belongs to the user
    const existingWebhook = await prisma.sentientLoopWebhook.findUnique({
      where: { id: validatedData.webhookId }
    });

    if (!existingWebhook) {
      throw new HttpError(404, 'Webhook not found');
    }

    if (existingWebhook.userId !== user.id && !user.isAdmin) {
      throw new HttpError(403, 'You do not have permission to delete this webhook');
    }

    // Delete the webhook
    await prisma.sentientLoopWebhook.delete({
      where: { id: validatedData.webhookId }
    });

    return {
      success: true,
      webhookId: validatedData.webhookId
    };
  } catch (error) {
    console.error('Error deleting webhook:', error);
    LoggingService.error({
      message: 'Failed to delete webhook',
      userId: user.id,
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      error
    });
    throw error;
  }
});

// List webhooks
export const listWebhooks = withErrorHandling(async (args, context) => {
  // Apply RBAC middleware - require 'sentient-loop:manage-webhooks' permission
  const user = await requirePermission({
    resource: 'sentient-loop',
    action: 'manage-webhooks',
    adminOverride: true,
    auditRejection: true
  })(context);

  // Validate request data
  const validatedData = validateRequest(args, listWebhooksSchema);

  try {
    // Log the operation
    LoggingService.info({
      message: `API: Listing webhooks for Sentient Loop events`,
      userId: user.id,
      module: 'arcana',
      category: 'SENTIENT_LOOP'
    });

    // Build the query
    const where: any = {
      userId: user.id
    };

    if (validatedData.isActive !== undefined) {
      where.isActive = validatedData.isActive;
    }

    // Get the total count
    const totalCount = await prisma.sentientLoopWebhook.count({ where });

    // Get the webhooks
    const webhooks = await prisma.sentientLoopWebhook.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: validatedData.offset,
      take: validatedData.limit,
      select: {
        id: true,
        url: true,
        description: true,
        events: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        metadata: true
      }
    });

    return {
      webhooks,
      pagination: {
        total: totalCount,
        limit: validatedData.limit,
        offset: validatedData.offset,
        hasMore: validatedData.offset + webhooks.length < totalCount
      }
    };
  } catch (error) {
    console.error('Error listing webhooks:', error);
    LoggingService.error({
      message: 'Failed to list webhooks',
      userId: user.id,
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      error
    });
    throw error;
  }
});
