# LangChain Integration for CauldronOS

This document provides an overview of the LangChain integration for CauldronOS. LangChain is a framework for developing applications powered by language models, providing tools for working with LLMs, chains, agents, memory, and more.

## Overview

The LangChain integration is designed to work seamlessly with CauldronOS's existing AI services and module structure. It provides a unified interface for working with different LLM providers (OpenAI, Groq) and offers utilities for building AI-powered features across different modules.

## Integration Architecture

The LangChain integration is structured as follows:

```
app/src/ai-services/langchain/
├── index.ts              # Main entry point
├── models.ts             # LLM model integrations
├── memory.ts             # Memory implementations
├── chains.ts             # Chain implementations
├── tools.ts              # Tool implementations
├── vectorStores.ts       # Vector store implementations
├── agents.ts             # Agent implementations
└── README.md             # Documentation
```

## Module Integrations

The LangChain integration is used across different CauldronOS modules:

### Phantom Module

The Phantom module uses LangChain for security analysis and threat detection:

```
app/src/modules/phantom/services/langchainSecurityService.ts
```

This service provides:
- Threat analysis using LangChain chains
- Security scanning using LangChain agents
- Structured output for security findings

### Athena Module

The Athena module uses LangChain for business intelligence and data analysis:

```
app/src/modules/athena/services/langchainBusinessIntelligenceService.ts
```

This service provides:
- Business data analysis using LangChain chains
- Strategic report generation using LangChain agents
- Semantic search on business documents using vector stores

### Forgeflow Module

The Forgeflow module integrates LangChain with LangGraph for workflow automation:

```
app/src/modules/forgeflow/langGraph/langchainIntegration.ts
```

This integration provides:
- LangChain nodes for LangGraph
- LangChain tool nodes for LangGraph
- Workflow creation and execution with LangChain components

### Arcana Module

The Arcana module uses LangChain with the Sentient Loop system:

```
app/src/modules/arcana/services/langchainSentientService.ts
```

This service provides:
- Sentient agents using LangChain
- Sentient chains with validation
- Sentient workflows with human-in-the-loop validation

## Usage Examples

### Basic Usage

```typescript
import { 
  createDefaultChatModel,
  createBufferMemory,
  createSimpleChain
} from '@src/ai-services/langchain';

// Create a model
const model = createDefaultChatModel('gpt-4o');

// Create memory
const memory = createBufferMemory();

// Create a chain
const chain = createSimpleChain(
  'Answer the following question: {question}',
  ['question'],
  model,
  memory
);

// Run the chain
const result = await chain.invoke({
  question: 'What is LangChain?',
});

console.log(result.text);
```

### Using Agents

```typescript
import { createAgent } from '@src/ai-services/langchain';

// Create an agent
const agent = await createAgent();

// Run the agent
const result = await agent.invoke({
  input: 'Analyze the security of this system',
});

console.log(result.output);
```

### Using Vector Stores

```typescript
import { 
  createMemoryVectorStore,
  createDocuments,
  performSimilaritySearch
} from '@src/ai-services/langchain';

// Create documents
const docs = createDocuments([
  'LangChain is a framework for developing applications powered by language models.',
  'LangChain provides tools for working with LLMs, chains, agents, memory, and more.',
  'LangChain can be used for various applications like chatbots, summarization, and more.',
]);

// Create a vector store
const vectorStore = await createMemoryVectorStore(docs);

// Perform similarity search
const results = await performSimilaritySearch(vectorStore, 'What is LangChain?', 2);

console.log(results);
```

## Dependencies

- `langchain`: Core LangChain library
- `langchain-core`: Core abstractions for LangChain
- `@langchain/openai`: OpenAI integration for LangChain
- `@langchain/groq`: Groq integration for LangChain

## Future Enhancements

- Integration with CauldronOS's existing memory systems
- Custom tools for each module
- Enhanced vector store implementations
- LangGraph integration for complex workflows
- Sentient Loop integration for human-in-the-loop workflows

## References

- [LangChain Documentation](https://js.langchain.com/docs/)
- [LangChain GitHub Repository](https://github.com/langchain-ai/langchainjs)
- [LangGraph Documentation](https://langchain-ai.github.io/langgraphjs/)