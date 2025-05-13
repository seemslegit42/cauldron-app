/**
 * Webhook service for the Sentient Loop™ system
 *
 * This service handles the delivery of events to registered webhooks.
 */
import { prisma } from 'wasp/server';
import { LoggingService } from '../../../../../shared/services/logging';
import { SentientLoopEventType } from '../../../../../api/types/sentientLoopApi';
import { createHmacSignature } from '../../../../../shared/utils/security';
import axios from 'axios';
import crypto from 'crypto';

/**
 * Delivers an event to all registered webhooks
 *
 * @param event The event to deliver
 * @returns A promise that resolves when all webhooks have been notified
 */
export async function deliverEventToWebhooks(event: {
  type: SentientLoopEventType;
  data: any;
  userId?: string;
  organizationId?: string;
  moduleId?: string;
  agentId?: string;
  sessionId?: string;
  traceId?: string;
  spanId?: string;
}) {
  try {
    // Create the event payload
    const eventPayload = {
      id: crypto.randomUUID(),
      type: event.type,
      timestamp: new Date().toISOString(),
      organizationId: event.organizationId,
      userId: event.userId,
      moduleId: event.moduleId,
      agentId: event.agentId,
      sessionId: event.sessionId,
      traceId: event.traceId,
      spanId: event.spanId,
      version: '1.0',
      data: event.data
    };

    // Find all active webhooks that are subscribed to this event type
    const webhooks = await prisma.sentientLoopWebhook.findMany({
      where: {
        isActive: true,
        events: {
          has: event.type
        }
      }
    });

    if (webhooks.length === 0) {
      // No webhooks to deliver to
      return;
    }

    // Log the operation
    LoggingService.info({
      message: `Delivering ${event.type} event to ${webhooks.length} webhooks`,
      userId: event.userId,
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      metadata: {
        eventType: event.type,
        webhookCount: webhooks.length
      }
    });

    // Deliver the event to each webhook
    const deliveryPromises = webhooks.map(async (webhook) => {
      try {
        // Create a signature for the webhook
        const signature = createHmacSignature(eventPayload, webhook.secret);

        // Send the webhook request
        const response = await axios.post(webhook.url, eventPayload, {
          headers: {
            'Content-Type': 'application/json',
            'X-Sentient-Loop-Signature': signature,
            'X-Sentient-Loop-Event': event.type,
            'X-Sentient-Loop-Delivery': crypto.randomUUID()
          },
          timeout: 5000 // 5 second timeout
        });

        // Log the successful delivery
        await prisma.webhookDelivery.create({
          data: {
            webhookId: webhook.id,
            eventType: event.type,
            payload: eventPayload,
            status: 'SUCCESS',
            statusCode: response.status,
            responseBody: response.data,
            deliveredAt: new Date()
          }
        });

        // Update the webhook's last delivery time and reset failure count if it was previously failing
        await prisma.sentientLoopWebhook.update({
          where: { id: webhook.id },
          data: {
            lastDeliveryAt: new Date(),
            failureCount: 0
          }
        });

        return {
          webhookId: webhook.id,
          success: true,
          statusCode: response.status
        };
      } catch (error) {
        // Log the failed delivery
        await prisma.webhookDelivery.create({
          data: {
            webhookId: webhook.id,
            eventType: event.type,
            payload: eventPayload,
            status: 'FAILED',
            statusCode: error.response?.status || 0,
            responseBody: error.response?.data || error.message,
            deliveredAt: new Date()
          }
        });

        // Increment the webhook's failure count
        await prisma.sentientLoopWebhook.update({
          where: { id: webhook.id },
          data: {
            lastDeliveryAt: new Date(),
            failureCount: {
              increment: 1
            }
          }
        });

        LoggingService.error({
          message: `Failed to deliver ${event.type} event to webhook ${webhook.url}`,
          userId: event.userId,
          module: 'arcana',
          category: 'SENTIENT_LOOP',
          error,
          metadata: {
            webhookId: webhook.id,
            eventType: event.type,
            statusCode: error.response?.status
          }
        });

        return {
          webhookId: webhook.id,
          success: false,
          statusCode: error.response?.status || 0,
          error: error.message
        };
      }
    });

    // Wait for all deliveries to complete
    return Promise.all(deliveryPromises);
  } catch (error) {
    console.error('Error delivering event to webhooks:', error);
    LoggingService.error({
      message: 'Failed to deliver event to webhooks',
      userId: event.userId,
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      error,
      metadata: {
        eventType: event.type
      }
    });
    throw error;
  }
}
