# LangChain Integration for CauldronOS

This directory contains the LangChain integration for the CauldronOS application. LangChain is a framework for developing applications powered by language models, providing tools for working with LLMs, chains, agents, memory, and more.

## Overview

The LangChain integration is designed to work seamlessly with CauldronOS's existing AI services and module structure. It provides a unified interface for working with different LLM providers (OpenAI, Groq) and offers utilities for building AI-powered features across different modules.

## Core Components

- **Models**: Integrations with various LLM providers through LangChain
- **Memory**: Memory implementations that integrate with CauldronOS's memory systems
- **Chains**: Chain implementations for common tasks like summarization and content generation
- **Tools**: Tool implementations for CauldronOS-specific functionality
- **Vector Stores**: Vector store implementations for semantic search
- **Agents**: Agent implementations that can use tools to accomplish tasks

## Usage Examples

### Creating a Chat Model

```typescript
import { createChatModel, ModelConfig } from '@src/ai-services/langchain';

// Create a chat model with custom configuration
const config: ModelConfig = {
  provider: 'groq',
  model: 'llama3-70b-8192',
  temperature: 0.7,
};

const model = createChatModel(config);

// Or use a default model
import { createDefaultChatModel } from '@src/ai-services/langchain';

const defaultModel = createDefaultChatModel('gpt-4o');
```

### Using Memory

```typescript
import { createBufferMemory, CauldronMemory } from '@src/ai-services/langchain';

// Create a simple buffer memory
const memory = createBufferMemory();

// Or use CauldronOS-specific memory
const cauldronMemory = new CauldronMemory({
  sessionId: 'session-123',
  userId: 'user-456',
  moduleId: 'arcana',
});
```

### Creating Chains

```typescript
import { 
  createSimpleChain, 
  createSummarizationChain,
  createContentGenerationChain
} from '@src/ai-services/langchain';

// Create a summarization chain
const summarizationChain = createSummarizationChain();

// Run the chain
const result = await summarizationChain.invoke({
  text: 'Long text to summarize...',
});

console.log(result);
```

### Using Tools and Agents

```typescript
import { 
  createAgent, 
  createSecurityAgent,
  createDefaultTools
} from '@src/ai-services/langchain';

// Create a default agent with tools
const agent = await createAgent();

// Run the agent
const result = await agent.invoke({
  input: 'Analyze the security of this system',
});

console.log(result);
```

## Integration with CauldronOS Modules

The LangChain integration is designed to be used across different CauldronOS modules:

- **Arcana**: For agent orchestration and sentient loop integration
- **Phantom**: For security analysis and threat detection
- **Athena**: For business intelligence and data analysis
- **Forgeflow**: For workflow automation and LangGraph integration
- **Sentinel**: For security monitoring and compliance

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