# Sentient Loop™ API Hooks for Developers

The Sentient Loop™ API provides a set of hooks that allow developers to integrate with the Sentient Loop™ system. These hooks enable you to submit decisions, receive escalations, listen to event streams, and contribute memory artifacts.

## Authentication

All API requests must include an API key in the `X-API-Key` header. You can obtain an API key from the Sentient Loop™ dashboard.

```
X-API-Key: your-api-key
```

## API Endpoints

### Submit Decisions

Submit a decision for a pending checkpoint.

**Endpoint:** `POST /api/sentient-loop/decisions`

**Request Body:**
```json
{
  "checkpointId": "uuid",
  "decision": "APPROVE | REJECT | MODIFY | ESCALATE",
  "reasoning": "Reason for the decision",
  "modifiedPayload": {}, // Optional, required for MODIFY decision
  "metadata": {} // Optional
}
```

**Response:**
```json
{
  "success": true,
  "checkpointId": "uuid",
  "decision": "APPROVE | REJECT | MODIFY | ESCALATE",
  "result": {
    "id": "uuid",
    "status": "APPROVED | REJECTED | MODIFIED | ESCALATED",
    "resolvedAt": "2023-06-01T12:00:00Z",
    "resolvedBy": "user-id"
  }
}
```

### Contribute Memory

Contribute a memory artifact to the Sentient Loop™ system.

**Endpoint:** `POST /api/sentient-loop/memories`

**Request Body:**
```json
{
  "type": "SHORT_TERM | LONG_TERM | EPISODIC | SEMANTIC | PROCEDURAL",
  "content": {}, // The memory content
  "context": "Context or category of the memory", // Optional
  "importance": 0.5, // Optional, 0-1 scale
  "metadata": {}, // Optional
  "expiresAt": "2023-06-01T12:00:00Z", // Optional
  "agentId": "uuid", // Optional
  "moduleId": "string", // Optional
  "sessionId": "string" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "memoryId": "uuid",
  "type": "SHORT_TERM | LONG_TERM | EPISODIC | SEMANTIC | PROCEDURAL",
  "expiresAt": "2023-06-01T12:00:00Z"
}
```

### Get Checkpoints

Retrieve checkpoints from the Sentient Loop™ system.

**Endpoint:** `GET /api/sentient-loop/checkpoints`

**Query Parameters:**
- `status` (optional): Filter by status (PENDING, APPROVED, REJECTED, MODIFIED, EXPIRED, ESCALATED)
- `moduleId` (optional): Filter by module ID
- `agentId` (optional): Filter by agent ID
- `limit` (optional): Number of results to return (default: 10)
- `offset` (optional): Offset for pagination (default: 0)
- `sortBy` (optional): Field to sort by (createdAt, updatedAt, expiresAt) (default: createdAt)
- `sortOrder` (optional): Sort order (asc, desc) (default: desc)

**Response:**
```json
{
  "checkpoints": [
    {
      "id": "uuid",
      "createdAt": "2023-06-01T12:00:00Z",
      "updatedAt": "2023-06-01T12:00:00Z",
      "type": "DECISION_REQUIRED",
      "status": "PENDING",
      "title": "Checkpoint title",
      "description": "Checkpoint description",
      "moduleId": "string",
      "agentId": "uuid",
      "originalPayload": {},
      "modifiedPayload": {},
      "metadata": {},
      "expiresAt": "2023-06-01T12:00:00Z",
      "resolvedAt": "2023-06-01T12:00:00Z",
      "resolvedBy": "user-id",
      "resolution": "string",
      "traceId": "string",
      "parentCheckpointId": "uuid"
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

### Get Escalations

Retrieve escalations from the Sentient Loop™ system.

**Endpoint:** `GET /api/sentient-loop/escalations`

**Query Parameters:**
- `status` (optional): Filter by status (PENDING, ACKNOWLEDGED, RESOLVED, REJECTED)
- `level` (optional): Filter by level (LOW, MEDIUM, HIGH, CRITICAL)
- `moduleId` (optional): Filter by module ID
- `agentId` (optional): Filter by agent ID
- `limit` (optional): Number of results to return (default: 10)
- `offset` (optional): Offset for pagination (default: 0)
- `sortBy` (optional): Field to sort by (createdAt, updatedAt) (default: createdAt)
- `sortOrder` (optional): Sort order (asc, desc) (default: desc)

**Response:**
```json
{
  "escalations": [
    {
      "id": "uuid",
      "createdAt": "2023-06-01T12:00:00Z",
      "updatedAt": "2023-06-01T12:00:00Z",
      "level": "HIGH",
      "status": "PENDING",
      "reason": "Reason for escalation",
      "moduleId": "string",
      "agentId": "uuid",
      "checkpointId": "uuid",
      "metadata": {},
      "resolvedAt": "2023-06-01T12:00:00Z",
      "resolvedBy": "user-id",
      "resolution": "string",
      "traceId": "string"
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

## Webhooks

Webhooks allow you to receive real-time notifications when events occur in the Sentient Loop™ system.

### Register Webhook

Register a webhook to receive notifications for specific events.

**Endpoint:** `POST /api/sentient-loop/webhooks`

**Request Body:**
```json
{
  "url": "https://your-webhook-endpoint.com",
  "secret": "your-webhook-secret", // Optional, will be generated if not provided
  "description": "Description of the webhook", // Optional
  "events": ["checkpoint.created", "checkpoint.resolved", "escalation.created"],
  "isActive": true, // Optional, default: true
  "metadata": {} // Optional
}
```

**Response:**
```json
{
  "success": true,
  "webhookId": "uuid",
  "secret": "your-webhook-secret",
  "events": ["checkpoint.created", "checkpoint.resolved", "escalation.created"],
  "url": "https://your-webhook-endpoint.com",
  "isActive": true,
  "createdAt": "2023-06-01T12:00:00Z"
}
```

### Webhook Payload

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
