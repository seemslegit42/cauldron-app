# Memory Module

The Memory Module provides a persistent memory store for AI agents, enabling them to maintain context across interactions and recall relevant information when needed.

## Features

- **Vector-Based Semantic Search**: Find relevant memories based on semantic similarity
- **Temporal Memory References**: Associate memories with time periods for time-based queries
- **Memory Persistence**: Store memories in PostgreSQL for long-term retention
- **Memory Types**: Support for both short-term and long-term memories
- **Memory Importance**: Assign importance levels to memories for prioritization
- **Memory Expiration**: Set expiration dates for short-term memories

## Architecture

The Memory Module consists of the following components:

### Core Services

- **Memory Manager**: Central service for storing, retrieving, and managing memories
- **Vector Store**: Service for storing and retrieving vector embeddings
- **Embedding Service**: Service for generating embeddings from text
- **Temporal Memory Service**: Service for time-based memory queries

### Database Models

- **EnhancedMemoryEntry**: Main model for storing memory entries
- **TemporalReference**: Model for storing temporal references
- **MemoryComparison**: Model for tracking changes over time
- **MemoryQueryCache**: Model for caching query results

## Usage

### Storing a Memory

```typescript
import { storeMemory } from '@src/modules/memory/services/enhancedMemoryManager';
import { MemoryEntryType, MemoryContentType } from '@src/modules/memory/types';

// Store a memory
const memory = await storeMemory({
  userId: 'user-id',
  type: MemoryEntryType.LONG_TERM,
  contentType: MemoryContentType.FACT,
  context: 'user-preferences',
  content: {
    favoriteColor: 'blue',
    favoriteFood: 'pizza'
  },
  importance: 2.0
});
```

### Retrieving Memories

```typescript
import { retrieveMemories } from '@src/modules/memory/services/enhancedMemoryManager';

// Retrieve memories
const memories = await retrieveMemories('user-id', {
  contentType: MemoryContentType.FACT,
  context: 'user-preferences',
  limit: 10
});
```

### Searching Memories

```typescript
import { searchMemories } from '@src/modules/memory/services/enhancedMemoryManager';

// Search memories
const results = await searchMemories(
  'What is my favorite color?',
  'user-id',
  {
    contentType: MemoryContentType.FACT,
    limit: 5,
    similarityThreshold: 0.7
  }
);
```

## Integration with LangGraph

The Memory Module integrates with the LangGraph orchestration framework through memory nodes:

```typescript
import { createMemoryNode, MemoryNodeOperation } from '@src/modules/forgeflow/langGraph/nodes/memoryNode';
import { MemoryEntryType, MemoryContentType } from '@src/modules/memory/types';

// Create a memory node for retrieving memories
const retrieveMemoriesNode = createMemoryNode('retrieve-memories', {
  operation: MemoryNodeOperation.SEARCH,
  inputKey: 'query',
  outputKey: 'relevantMemories',
  queryOptions: {
    limit: 5,
    similarityThreshold: 0.7
  }
});

// Create a memory node for storing memories
const storeMemoryNode = createMemoryNode('store-memory', {
  operation: MemoryNodeOperation.STORE,
  memoryType: MemoryEntryType.LONG_TERM,
  contentType: MemoryContentType.CONVERSATION,
  context: 'conversation-history',
  importance: 2.0,
  inputKey: 'response',
  outputKey: 'storedMemoryId'
});
```

## Memory-Aware Workflow

The Memory Module includes a memory-aware workflow that demonstrates how to use the memory system in a LangGraph workflow:

1. **Retrieve Memories**: Search for relevant memories based on the user's query
2. **Generate Response**: Generate a response using the query and relevant memories
3. **Store Response**: Store the response in memory for future reference

To test the memory-aware workflow, visit the `/forgeflow/memory-workflow` page.

## Installation

To install the Memory Module, run the migration script:

```bash
node prisma/migrations/apply_memory_langgraph_schema.js
```

This will:
1. Add the memory schema to the main Prisma schema
2. Create a migration
3. Apply the migration to the database
4. Generate the Prisma client

## Future Enhancements

- **Memory Consolidation**: Automatically consolidate related memories
- **Memory Summarization**: Generate summaries of memory collections
- **Memory Pruning**: Automatically prune less important memories
- **Memory Analytics**: Analyze memory usage and patterns
- **Memory Visualization**: Visualize memory connections and relationships
