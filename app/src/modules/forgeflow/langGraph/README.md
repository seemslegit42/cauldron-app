# LangGraph Implementation

The LangGraph implementation provides a graph-based orchestration framework for AI agents, enabling complex workflows with multiple steps and decision points.

## Features

- **Graph-Based Workflows**: Define workflows as directed graphs with nodes and edges
- **Node Types**: Support for LLM, tool, condition, memory, and human input nodes
- **Persistence**: Store graph state and execution history in PostgreSQL
- **Visualization**: Visualize graph execution with React Flow
- **Human-in-the-Loop**: Integrate human validation and input into workflows
- **Memory Integration**: Seamless integration with the Memory Module

## Architecture

The LangGraph implementation consists of the following components:

### Core Components

- **Graph Definition**: Define graphs with nodes and edges
- **Graph Execution**: Execute graphs with state management
- **Node Types**: Different types of nodes for different operations
- **Persistence**: Store graph state and execution history

### Database Models

- **EnhancedLangGraphState**: Main model for storing graph state
- **EnhancedLangGraphNode**: Model for storing graph nodes
- **EnhancedLangGraphEdge**: Model for storing graph edges
- **EnhancedLangGraphNodeExecution**: Model for storing node execution history

## Usage

### Creating a Graph

```typescript
import { 
  createGraph, 
  addNode, 
  addEdge 
} from '@src/modules/forgeflow/langGraph/enhancedLangGraph';
import { createLLMNode } from '@src/modules/forgeflow/langGraph/nodes/llmNode';

// Create a graph
const graph = createGraph(
  { userId: 'user-id', query: 'What is the capital of France?' },
  'Simple Question Answering'
);

// Add an LLM node
const graph = addNode(graph, createLLMNode('answer-question', {
  model: 'llama3-8b-8192',
  promptTemplate: (state) => `Answer the following question: ${state.query}`,
  outputKey: 'answer'
}));
```

### Executing a Graph

```typescript
import { executeGraph } from '@src/modules/forgeflow/langGraph/enhancedLangGraph';

// Execute the graph
const result = await executeGraph(graph, {
  userId: 'user-id',
  expiresInDays: 7
});

console.log(result.finalState.answer);
```

### Creating a Memory-Aware Workflow

```typescript
import { 
  createGraph, 
  addNode, 
  addEdge 
} from '@src/modules/forgeflow/langGraph/enhancedLangGraph';
import { createLLMNode } from '@src/modules/forgeflow/langGraph/nodes/llmNode';
import { createMemoryNode, MemoryNodeOperation } from '@src/modules/forgeflow/langGraph/nodes/memoryNode';
import { MemoryEntryType, MemoryContentType } from '@src/modules/memory/types';

// Create a graph
const graph = createGraph(
  { userId: 'user-id', query: 'What is my favorite color?' },
  'Memory-Aware Question Answering'
);

// Add a memory retrieval node
const graph = addNode(graph, createMemoryNode('retrieve-memories', {
  operation: MemoryNodeOperation.SEARCH,
  inputKey: 'query',
  outputKey: 'relevantMemories',
  queryOptions: {
    limit: 5,
    similarityThreshold: 0.7
  }
}));

// Add an LLM node
const graph = addNode(graph, createLLMNode('answer-question', {
  model: 'llama3-8b-8192',
  promptTemplate: (state) => `
    Answer the following question based on the user's memories:
    
    Question: ${state.query}
    
    Relevant memories:
    ${state.relevantMemories.map(memory => 
      `- ${memory.context}: ${JSON.stringify(memory.content)}`
    ).join('\n')}
  `,
  outputKey: 'answer'
}));

// Add a memory storage node
const graph = addNode(graph, createMemoryNode('store-answer', {
  operation: MemoryNodeOperation.STORE,
  memoryType: MemoryEntryType.LONG_TERM,
  contentType: MemoryContentType.CONVERSATION,
  context: 'question-answering',
  importance: 2.0,
  inputKey: 'answer',
  outputKey: 'storedMemoryId'
}));

// Add edges
const graph = addEdge(graph, { source: 'retrieve-memories', target: 'answer-question' });
const graph = addEdge(graph, { source: 'answer-question', target: 'store-answer' });
```

## Node Types

### LLM Node

The LLM node generates text using a language model:

```typescript
createLLMNode('generate-text', {
  model: 'llama3-8b-8192',
  temperature: 0.7,
  promptTemplate: 'Generate a story about a robot',
  outputKey: 'story'
})
```

### Memory Node

The memory node interacts with the Memory Module:

```typescript
createMemoryNode('store-memory', {
  operation: MemoryNodeOperation.STORE,
  memoryType: MemoryEntryType.LONG_TERM,
  contentType: MemoryContentType.FACT,
  context: 'user-preferences',
  importance: 2.0,
  inputKey: 'preferences',
  outputKey: 'storedMemoryId'
})
```

### Tool Node

The tool node executes a function:

```typescript
createToolNode('fetch-weather', {
  tool: async (input) => {
    // Fetch weather data
    return { temperature: 72, conditions: 'sunny' };
  },
  inputKey: 'location',
  outputKey: 'weather'
})
```

### Human Input Node

The human input node requests input from a human:

```typescript
createHumanInputNode('get-approval', {
  prompt: 'Do you approve this action?',
  options: ['Yes', 'No'],
  timeoutSeconds: 300,
  defaultValue: 'No',
  outputKey: 'approval'
})
```

## Installation

To install the LangGraph implementation, run the migration script:

```bash
node prisma/migrations/apply_memory_langgraph_schema.js
```

This will:
1. Add the LangGraph schema to the main Prisma schema
2. Create a migration
3. Apply the migration to the database
4. Generate the Prisma client

## Future Enhancements

- **Parallel Execution**: Support for parallel execution of nodes
- **Conditional Routing**: More advanced conditional routing
- **Graph Templates**: Reusable graph templates
- **Graph Versioning**: Version control for graphs
- **Graph Monitoring**: Real-time monitoring of graph execution
- **Graph Analytics**: Analytics for graph performance and usage
