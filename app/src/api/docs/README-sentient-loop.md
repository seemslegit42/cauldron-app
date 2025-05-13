# Sentient Loop™ API Hooks for Developers

This document provides an overview of the Sentient Loop™ API hooks, allowing developers to integrate with the system programmatically.

## Overview

The Sentient Loop™ API provides a set of hooks that allow developers to:

- Submit decisions to the Sentient Loop™ system
- Receive escalations from the Sentient Loop™ system
- Listen to event streams from the Sentient Loop™ system
- Contribute memory artifacts to the Sentient Loop™ system

## Getting Started

### Authentication

All API requests must include an API key in the `X-API-Key` header. You can obtain an API key from the Sentient Loop™ dashboard.

```
X-API-Key: your-api-key
```

### Using the SDK

The Sentient Loop™ SDK provides a convenient way to interact with the API:

```typescript
import { SentientLoopClient } from '@cauldron/sentient-loop-sdk';

// Create a client
const client = new SentientLoopClient('your-api-key');

// Submit a decision
const result = await client.submitDecision(
  'checkpoint-id',
  'APPROVE',
  'This action is safe and appropriate'
);

// Contribute a memory
const memory = await client.contributeMemory(
  'SEMANTIC',
  { key: 'value', context: 'important information' },
  { importance: 0.8 }
);

// Get checkpoints
const checkpoints = await client.getCheckpoints({
  status: 'PENDING',
  limit: 10
});

// Register a webhook
const webhook = await client.registerWebhook({
  url: 'https://your-webhook-endpoint.com',
  events: ['checkpoint.created', 'checkpoint.resolved']
});
```

### Setting Up Webhooks

Webhooks allow you to receive real-time notifications when events occur in the Sentient Loop™ system. To set up a webhook:

1. Register a webhook endpoint with the API
2. Implement a webhook handler to process incoming events
3. Verify webhook signatures to ensure the requests are coming from the Sentient Loop™ system

See the [example webhook handler](../examples/webhookHandler.js) for a complete implementation.

## API Documentation

For detailed API documentation, see the [API docs](sentientLoopApi.md).

## Event Types

The Sentient Loop™ system emits the following event types:

- `checkpoint.created`: A new checkpoint has been created
- `checkpoint.updated`: A checkpoint has been updated
- `checkpoint.resolved`: A checkpoint has been resolved
- `escalation.created`: A new escalation has been created
- `escalation.resolved`: An escalation has been resolved
- `memory.created`: A new memory has been created
- `memory.updated`: A memory has been updated
- `decision.recorded`: A decision has been recorded
- `agent.action.processed`: An agent action has been processed
- `agent.action.approved`: An agent action has been approved
- `agent.action.rejected`: An agent action has been rejected
- `agent.action.modified`: An agent action has been modified

## Security Considerations

- Always verify webhook signatures to ensure the requests are coming from the Sentient Loop™ system
- Store your API key securely and never expose it in client-side code
- Use HTTPS for all API requests
- Implement rate limiting and monitoring for your webhook endpoints
- Validate and sanitize all input data before processing

## Webhook Payload

When an event occurs, the Sentient Loop™ system will send a POST request to your webhook URL with the following payload:

```json
{
  "id": "uuid", // Event ID
  "type": "checkpoint.created", // Event type
  "timestamp": "2023-06-01T12:00:00Z", // Event timestamp
  "organizationId": "uuid", // Optional
  "userId": "uuid", // Optional
  "moduleId": "string", // Optional
  "agentId": "uuid", // Optional
  "sessionId": "string", // Optional
  "traceId": "string", // Optional
  "spanId": "string", // Optional
  "version": "1.0", // API version
  "data": {} // Event-specific data
}
```

### Webhook Signature

To verify that the webhook request came from the Sentient Loop™ system, you can check the signature in the `X-Sentient-Loop-Signature` header. The signature is an HMAC-SHA256 hash of the request body using your webhook secret as the key.

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(body, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const expectedSignature = hmac.update(JSON.stringify(body)).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}
```

## Support

If you have any questions or issues with the Sentient Loop™ API, please contact support at support@cauldron.ai.
