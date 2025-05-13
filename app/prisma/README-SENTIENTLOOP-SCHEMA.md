# Sentient Loop™ AI Reasoning Chain and Prompt History Schema

This schema extension enhances the existing AI tracking models to provide more comprehensive tracking of raw prompts, reasoning chains, and response trees for transparency, auditing, and supervised fine-tuning.

## Overview

The schema adds the following models:

1. **AIReasoningStep**: Tracks individual steps in the reasoning process
2. **AIPromptTemplate**: Stores reusable prompt templates
3. **AIFeedbackAnnotation**: Allows for annotating reasoning chains for supervised fine-tuning
4. **AIEvaluationMetric**: Tracks the quality of AI responses
5. **AIReasoningContext**: Stores context used in reasoning
6. **AIModelVersion**: Tracks model versions used
7. **AIPromptSafetyCheck**: Tracks safety checks on prompts

It also extends the existing `AIPrompt` and `AIReasoning` models with additional fields and relationships.

## Integration

To integrate this schema extension:

1. Ensure the `schema.sentientloop.append` file is in the `prisma` directory
2. Run the Prisma migration command to apply the changes:

```bash
npx prisma migrate dev --name add-sentientloop-schema
```

## Usage

### Tracking Reasoning Steps

```typescript
import { prisma } from 'wasp/server';

// Create a reasoning step
await prisma.aIReasoningStep.create({
  data: {
    reasoningId: 'existing-reasoning-id',
    stepNumber: 1,
    stepType: 'thought',
    content: 'I need to analyze the user query first...',
    tokens: 15,
    duration: 50, // milliseconds
    metadata: {
      confidence: 0.95,
      alternatives: ['Option A', 'Option B']
    }
  }
});
```

### Using Prompt Templates

```typescript
import { prisma } from 'wasp/server';

// Create a prompt template
const template = await prisma.aIPromptTemplate.create({
  data: {
    name: 'Market Analysis Template',
    description: 'Template for analyzing market trends',
    version: '1.0.0',
    content: 'Analyze the market trends for {{industry}} in {{region}} over the past {{timeframe}}.',
    placeholders: ['industry', 'region', 'timeframe'],
    exampleValues: {
      industry: 'technology',
      region: 'North America',
      timeframe: '6 months'
    },
    module: 'athena',
    category: 'market_analysis',
    tags: ['market', 'trends', 'analysis'],
    createdById: 'user-id',
    organizationId: 'org-id'
  }
});

// Create a prompt from a template
await prisma.aIPrompt.create({
  data: {
    content: 'Analyze the market trends for healthcare in Europe over the past 12 months.',
    name: 'Healthcare Market Analysis',
    version: '1.0.0',
    type: 'analysis',
    module: 'athena',
    category: 'market_analysis',
    tags: ['healthcare', 'europe', 'market'],
    templateId: template.id,
    templateValues: {
      industry: 'healthcare',
      region: 'Europe',
      timeframe: '12 months'
    },
    createdById: 'user-id'
  }
});
```

### Annotating Reasoning Chains

```typescript
import { prisma } from 'wasp/server';

// Create a feedback annotation
await prisma.aIFeedbackAnnotation.create({
  data: {
    reasoningId: 'existing-reasoning-id',
    responseNodeId: 'existing-response-node-id',
    annotationType: 'improvement',
    content: 'This response could be more concise and focused on the key points.',
    suggestedOutput: 'A more concise version of the response...',
    annotatedBy: 'user-id',
    status: 'pending',
    metadata: {
      priority: 'medium',
      category: 'clarity'
    }
  }
});
```

### Evaluating AI Responses

```typescript
import { prisma } from 'wasp/server';

// Create an evaluation metric
await prisma.aIEvaluationMetric.create({
  data: {
    reasoningId: 'existing-reasoning-id',
    metricType: 'relevance',
    score: 0.85,
    evaluatedBy: 'user-id',
    evaluationMethod: 'human',
    notes: 'The response was mostly relevant but missed some key aspects of the query.'
  }
});
```

### Tracking Context Used in Reasoning

```typescript
import { prisma } from 'wasp/server';

// Create a reasoning context
await prisma.aIReasoningContext.create({
  data: {
    reasoningId: 'existing-reasoning-id',
    contextType: 'conversation_history',
    content: 'Previous messages in the conversation...',
    source: 'chat_session',
    relevanceScore: 0.75,
    metadata: {
      messageCount: 5,
      timespan: '10 minutes'
    }
  }
});
```

### Tracking Model Versions

```typescript
import { prisma } from 'wasp/server';

// Create a model version
const modelVersion = await prisma.aIModelVersion.create({
  data: {
    modelName: 'llama3-70b-8192',
    provider: 'groq',
    version: '2023-06-01',
    capabilities: ['text_generation', 'summarization', 'classification'],
    parameters: {
      contextWindow: 8192,
      parameters: '70 billion'
    },
    benchmarks: {
      mmlu: 0.78,
      hellaswag: 0.83,
      truthfulqa: 0.62
    },
    isActive: true
  }
});

// Associate a reasoning with a model version
await prisma.aIReasoning.update({
  where: { id: 'existing-reasoning-id' },
  data: {
    modelVersionId: modelVersion.id
  }
});
```

### Checking Prompt Safety

```typescript
import { prisma } from 'wasp/server';

// Create a prompt safety check
await prisma.aIPromptSafetyCheck.create({
  data: {
    promptId: 'existing-prompt-id',
    checkType: 'toxicity',
    score: 0.02,
    passed: true,
    details: {
      categories: {
        hate: 0.01,
        harassment: 0.02,
        self_harm: 0.00,
        sexual: 0.00,
        violence: 0.01
      }
    }
  }
});
```

## Benefits

This enhanced schema provides several benefits:

1. **Transparency**: Track every step of the AI reasoning process
2. **Auditability**: Maintain a complete record of AI operations for compliance and review
3. **Fine-tuning**: Collect annotated data for supervised fine-tuning
4. **Safety**: Monitor and evaluate prompt safety
5. **Quality Assurance**: Track and improve AI response quality
6. **Template Management**: Reuse and standardize prompts across the application

## Integration with Sentient Loop™

This schema extension integrates with the existing Sentient Loop™ system to provide a comprehensive view of AI operations, from raw prompts to final responses, with detailed tracking of the reasoning process in between.
