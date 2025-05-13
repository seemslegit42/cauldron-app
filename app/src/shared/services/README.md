# Cauldron Logging and Telemetry System

This directory contains the core services for Cauldron's comprehensive logging and telemetry system. The system is designed to track all agent actions, human approvals, API interactions, and system events with detailed metadata and distributed tracing capabilities.

## Overview

The logging system consists of several components:

1. **Database Schema**: Prisma models for storing logs, API interactions, human approvals, and telemetry spans
2. **Logging Service**: Core service for creating and querying logs
3. **Telemetry Service**: Distributed tracing capabilities
4. **Middleware**: Express middleware for automatically logging API interactions
5. **Human Approval Module**: Integration with the Sentient Loop™ for human-in-the-loop approvals

## Database Schema

The schema includes the following models:

- **SystemLog**: Core logging model for all system events
- **AgentLog**: Detailed tracking of agent actions
- **ApiInteraction**: Tracking of API calls with request/response data
- **HumanApproval**: Tracking of human approvals in the Sentient Loop
- **TelemetrySpan**: Support for distributed tracing

Each model includes:
- Timestamps
- Event categorization
- Severity levels
- Tags for filtering
- Metadata for additional context
- Trace and span IDs for distributed tracing
- References to affected entities (users, agents, organizations)

## Usage

### Logging Service

The `LoggingService` provides methods for creating different types of logs:

```typescript
import { LoggingService } from '../shared/services/logging';

// Log a system event
await LoggingService.logSystemEvent({
  message: 'System started successfully',
  level: 'INFO',
  category: 'SYSTEM_EVENT',
  source: 'system-service',
  tags: ['startup', 'system']
});

// Log an agent action
await LoggingService.logAgentAction({
  message: 'Agent processed user request',
  level: 'INFO',
  source: 'agent-service',
  agentId: 'agent-123',
  userId: 'user-456',
  sessionId: 'session-789',
  tags: ['user-request', 'processing']
});

// Log an API interaction
await LoggingService.logApiInteraction({
  endpoint: '/api/data',
  method: 'GET',
  status: 'SUCCESS',
  statusCode: 200,
  duration: 150, // ms
  source: 'api-service'
});

// Log a human approval
await LoggingService.logHumanApproval({
  requestedAction: 'Delete user account',
  requestedBy: 'agent-123',
  originalPayload: { userId: 'user-456' },
  status: 'PENDING'
});
```

### Telemetry Service

The `Telemetry` service provides distributed tracing capabilities:

```typescript
import { Telemetry } from '../shared/services/telemetry';

// Create a root span
const rootSpan = Telemetry.createSpan('process-request', 'api-service', {
  userId: 'user-123',
  attributes: {
    'http.method': 'POST',
    'http.url': '/api/data'
  }
});

// Add events to the span
rootSpan.addEvent('request-received');

// Create a child span
const childSpan = Telemetry.createSpan('database-query', 'database-service', {
  parentSpan: rootSpan,
  attributes: {
    'db.system': 'postgresql',
    'db.operation': 'SELECT'
  }
});

// End spans when operations complete
await childSpan.end();
await rootSpan.end();
```

### API Logging Middleware

The logging middleware automatically logs all API interactions:

```typescript
import { createLoggingMiddleware } from '../server/middleware/loggingMiddleware';

// Create middleware with custom options
const loggingMiddleware = createLoggingMiddleware({
  logRequestBody: true,
  logResponseBody: true,
  excludePaths: ['/health', '/metrics'],
  source: 'api-server'
});

// Apply middleware to Express app
app.use(loggingMiddleware);
```

### Human Approval Module

The human approval module integrates with the Sentient Loop™:

```typescript
import { requestHumanApproval, processHumanApproval } from '../forgeflow/sentientLoop/humanApproval';

// Request human approval
const approval = await requestHumanApproval({
  requestedAction: 'Execute high-risk operation',
  requestedBy: 'agent-123',
  originalPayload: { operation: 'delete-all-data' },
  userId: 'user-456',
  expiresInMinutes: 60
});

// Process human approval
await processHumanApproval(
  approval.approvalId,
  'APPROVED',
  'user-456',
  'Approved after verification'
);
```

## Event Categories

The system supports the following event categories:

- `AGENT_ACTION`: Actions performed by AI agents
- `HUMAN_APPROVAL`: Human approval requests and decisions
- `API_INTERACTION`: API calls and responses
- `SYSTEM_EVENT`: System-level events
- `SECURITY`: Security-related events
- `PERFORMANCE`: Performance metrics and issues
- `DATA_ACCESS`: Database and data access operations
- `AUTHENTICATION`: User authentication events
- `AUTHORIZATION`: Permission checks and access control
- `BUSINESS_LOGIC`: Business rule processing
- `INTEGRATION`: External system integrations
- `SCHEDULED_TASK`: Scheduled job execution

## Log Levels

The system supports the following log levels:

- `TRACE`: Fine-grained debugging information
- `DEBUG`: Debugging information
- `INFO`: Normal operational information
- `WARN`: Warning conditions
- `ERROR`: Error conditions
- `CRITICAL`: Critical conditions requiring immediate attention

## Querying Logs

Logs can be queried using Prisma:

```typescript
// Get all critical system logs
const criticalLogs = await prisma.systemLog.findMany({
  where: {
    level: 'CRITICAL'
  },
  orderBy: {
    timestamp: 'desc'
  }
});

// Get all logs for a specific trace
const traceId = '123e4567-e89b-12d3-a456-426614174000';
const traceEvents = await prisma.systemLog.findMany({
  where: {
    traceId
  },
  orderBy: {
    timestamp: 'asc'
  }
});

// Get all human approvals pending for a user
const pendingApprovals = await prisma.humanApproval.findMany({
  where: {
    userId: 'user-123',
    status: 'PENDING'
  }
});
```

## Exporting Logs

Logs can be exported for analysis or compliance purposes:

```typescript
// Export logs for a specific date range
const logs = await prisma.systemLog.findMany({
  where: {
    timestamp: {
      gte: new Date('2023-01-01'),
      lte: new Date('2023-01-31')
    }
  },
  include: {
    apiInteractions: true,
    humanApprovals: true
  }
});

// Format as JSON
const jsonLogs = JSON.stringify(logs, null, 2);
```

## Best Practices

1. **Use appropriate log levels**: Reserve ERROR and CRITICAL for actual errors
2. **Include context**: Always include relevant IDs (user, agent, session)
3. **Use tags**: Add tags for easier filtering and searching
4. **Distributed tracing**: Use trace and span IDs for tracking operations across components
5. **Sensitive data**: Never log sensitive data (passwords, tokens, PII)
6. **Performance**: Be mindful of log volume in high-traffic systems
