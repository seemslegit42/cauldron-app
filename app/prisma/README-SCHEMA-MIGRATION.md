# Schema Migration Guide

This guide provides instructions for applying the schema enhancements to your database.

## Overview

The schema enhancements extend existing models and add new ones to improve the functionality of the application. The enhancements focus on:

1. **Agent Sessions**: Enhanced tracking of session context, metrics, and hierarchies
2. **Module States**: Improved state management with history tracking and transitions
3. **Agent Versioning**: Tracking agent versions and performance over time
4. **Memory Management**: Enhanced memory tracking with access patterns and annotations
5. **Performance Metrics**: Detailed metrics for agents and sessions

## Migration Steps

Follow these steps to apply the schema enhancements:

### 1. Review the Migration File

The migration file is located at `prisma/migrations/20240620_enhance_schema.prisma`. Review this file to understand the changes that will be applied to your database.

### 2. Apply the Prisma Migration

Run the following command to apply the Prisma migration:

```bash
npx prisma migrate dev --name enhance_schema
```

This will create a new migration file in the `prisma/migrations` directory and apply it to your database.

### 3. Run the Migration Script

After the Prisma migration has been applied, run the migration script to update existing data:

```bash
npx ts-node src/scripts/applySchemaEnhancements.ts
```

This script will:

- Migrate existing agent sessions to the enhanced schema
- Migrate existing module states to the enhanced schema
- Migrate existing AI agents to the enhanced schema
- Migrate existing interaction memories to the enhanced schema
- Update agent session counts

### 4. Verify the Migration

After the migration has been applied, verify that the new models and fields are available in your database. You can use the Prisma Studio to inspect the database:

```bash
npx prisma studio
```

## Using the Enhanced Schema

The enhanced schema provides new functionality that can be accessed through the `EnhancedSchemaService`. Here are some examples of how to use the enhanced schema:

### Creating a Session Hierarchy

```typescript
import { EnhancedSchemaService } from '../services/enhancedSchemaService';

// Create a parent session
const parentSession = await EnhancedSchemaService.createSession({
  sessionId: 'parent-session-id',
  userId: 'user-id',
  agentId: 'agent-id',
  status: 'active',
  sessionPurpose: 'Parent task',
  sessionTags: ['important', 'complex']
});

// Create a child session
const childSession = await EnhancedSchemaService.createSession({
  sessionId: 'child-session-id',
  userId: 'user-id',
  agentId: 'agent-id',
  status: 'active',
  sessionPurpose: 'Subtask',
  parentSessionId: parentSession.id
});
```

### Tracking Module State Changes

```typescript
import { EnhancedSchemaService } from '../services/enhancedSchemaService';

// Create a module state
const moduleState = await EnhancedSchemaService.upsertModuleState({
  moduleId: 'module-id',
  state: { /* initial state */ },
  version: '1.0.0',
  stateType: 'workflow_progress'
});

// Record a state transition
await EnhancedSchemaService.recordStateTransition({
  stateId: moduleState.id,
  triggerType: 'user_action',
  transitionData: { /* what changed */ },
  previousValues: { /* old values */ },
  newValues: { /* new values */ }
});
```

### Creating and Versioning an Agent

```typescript
import { EnhancedSchemaService } from '../services/enhancedSchemaService';

// Create a new agent version
await EnhancedSchemaService.createAgentVersion({
  agentId: 'agent-id',
  versionNumber: '1.1.0',
  changes: {
    systemPrompt: 'Updated for better response quality',
    configuration: 'Adjusted temperature parameter'
  },
  createdById: 'user-id',
  isActive: true
});
```

### Creating and Accessing Memories

```typescript
import { EnhancedSchemaService } from '../services/enhancedSchemaService';

// Create a memory
const memory = await EnhancedSchemaService.createMemory({
  userId: 'user-id',
  agentId: 'agent-id',
  sessionId: 'session-id',
  type: 'fact',
  memoryType: 'user_preference',
  content: {
    preference: 'dark_mode',
    value: true
  },
  importance: 0.8,
  confidence: 0.9,
  sourceType: 'user_input'
});

// Record memory access
await EnhancedSchemaService.recordMemoryAccess({
  memoryId: memory.id,
  accessType: 'read',
  accessedBy: 'agent-id',
  accessorType: 'agent',
  context: 'Determining UI preferences',
  usefulness: 0.9
});
```

## Example Workflows

For more examples of how to use the enhanced schema, see the `src/services/examples/enhancedSchemaExample.ts` file.

## Troubleshooting

If you encounter any issues during the migration, try the following:

1. **Reset the Database**: If you're in development, you can reset the database and apply all migrations from scratch:

```bash
npx prisma migrate reset
```

2. **Manual Migration**: If the automatic migration fails, you can manually update the database schema and then run the migration script.

3. **Check Logs**: Check the logs for any errors during the migration process.

## Conclusion

The schema enhancements provide a more robust foundation for tracking agent sessions, module states, agent versions, and memory management. By using the `EnhancedSchemaService`, you can take advantage of these enhancements to build more sophisticated agent-based workflows.
