# AI Reasoning Schema

This document describes the enhanced AI reasoning schema that enables storing raw prompts, AI reasoning chains, and response trees for transparency, auditing, and supervised fine-tuning.

## Overview

The enhanced AI reasoning schema provides a comprehensive way to track and analyze AI operations within the application. It captures detailed information about:

- Raw prompts and their templates
- AI reasoning chains and steps
- Response trees and their hierarchical structure
- Model versions and their capabilities
- Feedback annotations and evaluations
- Safety checks and their results
- Context used in reasoning

## Schema Models

### AIPrompt

The `AIPrompt` model represents a prompt sent to an AI model. It has been enhanced with:

- `templateId`: Reference to a template this prompt is based on
- `templateValues`: Values used for template placeholders
- `template`: Relation to the template
- `safetyChecks`: Relation to safety checks performed on this prompt

### AIReasoning

The `AIReasoning` model represents a reasoning process performed by an AI model. It has been enhanced with:

- `modelVersionId`: Reference to the model version used
- `modelVersion`: Relation to the model version
- `reasoningSteps`: Relation to detailed reasoning steps
- `feedbackAnnotations`: Relation to feedback annotations
- `evaluationMetrics`: Relation to evaluation metrics
- `contexts`: Relation to reasoning contexts

### AIResponseNode

The `AIResponseNode` model represents a node in a response tree. It has been enhanced with:

- `feedbackAnnotations`: Relation to feedback annotations

### New Models

#### AIReasoningStep

The `AIReasoningStep` model represents a single step in the reasoning process:

- `reasoningId`: Reference to the reasoning
- `stepNumber`: Order of the step
- `stepType`: Type of the step (thought, observation, action, decision)
- `content`: Content of the step
- `tokens`: Token count for this step
- `duration`: Duration in milliseconds
- `metadata`: Additional metadata

#### AIPromptTemplate

The `AIPromptTemplate` model represents a reusable prompt template:

- `name`: Name of the template
- `description`: Description of the template
- `version`: Version of the template
- `content`: Template content with placeholders
- `placeholders`: Array of placeholder names
- `exampleValues`: Example values for placeholders
- `instances`: Relation to prompts based on this template

#### AIFeedbackAnnotation

The `AIFeedbackAnnotation` model represents feedback on a reasoning or response:

- `reasoningId`: Reference to the reasoning
- `responseNodeId`: Reference to the response node
- `annotationType`: Type of annotation (correction, improvement, error, bias)
- `content`: Content of the annotation
- `suggestedOutput`: Suggested alternative output
- `annotatedBy`: User who created the annotation
- `status`: Status of the annotation (pending, approved, rejected)

#### AIEvaluationMetric

The `AIEvaluationMetric` model represents a quality metric for an AI response:

- `reasoningId`: Reference to the reasoning
- `metricType`: Type of metric (relevance, accuracy, helpfulness, safety)
- `score`: Score from 0 to 1
- `evaluatedBy`: User or system ID
- `evaluationMethod`: Method of evaluation (human, automated, model-based)

#### AIReasoningContext

The `AIReasoningContext` model represents context used in reasoning:

- `reasoningId`: Reference to the reasoning
- `contextType`: Type of context (user_history, conversation_history, document, database)
- `content`: Content of the context
- `source`: Source of the context
- `relevanceScore`: How relevant this context was (0-1)

#### AIModelVersion

The `AIModelVersion` model represents a version of an AI model:

- `modelName`: Name of the model
- `provider`: Provider of the model
- `version`: Version identifier
- `capabilities`: Array of capabilities
- `parameters`: Model parameters
- `benchmarks`: Benchmark results
- `isActive`: Whether this model version is active

#### AIPromptSafetyCheck

The `AIPromptSafetyCheck` model represents a safety check on a prompt:

- `promptId`: Reference to the prompt
- `checkType`: Type of check (toxicity, bias, harmful_instructions, pii_detection)
- `score`: Score from 0 to 1
- `passed`: Whether the check passed
- `details`: Detailed check results

## Usage

### Tracking Reasoning Chains

The `EnhancedReasoningService` provides methods for tracking reasoning chains:

```typescript
import { EnhancedReasoningService } from '../ai-services/enhancedReasoningService';

// Track a reasoning chain
const reasoning = await EnhancedReasoningService.trackReasoningChain(
  userId,
  sessionId,
  promptId,
  model,
  temperature,
  rawOutput,
  {
    agentId,
    systemPromptId,
    steps: [
      { type: 'thought', content: 'I need to analyze this data' },
      { type: 'action', content: 'Retrieving relevant information' },
      { type: 'observation', content: 'The data shows a pattern' },
      { type: 'decision', content: 'Based on the analysis, I recommend...' }
    ],
    contextItems: [
      { contextType: 'user_history', content: '...', source: 'database' },
      { contextType: 'document', content: '...', source: 'knowledge_base' }
    ],
    reasoningChain: 'Detailed reasoning process...',
    confidenceScore: 0.85,
    metadata: { purpose: 'data_analysis' }
  }
);
```

### Enhanced Tracked Groq Inference

The `enhancedTrackedGroqInference` function provides a convenient way to use Groq with enhanced tracking:

```typescript
import { enhancedTrackedGroqInference } from '../ai-services/enhancedTrackedGroqInference';

// Use Groq with enhanced tracking
const result = await enhancedTrackedGroqInference({
  userId,
  module: 'arcana',
  prompt: 'Analyze this data...',
  model: 'llama3-70b-8192',
  temperature: 0.7,
  systemPrompt: 'You are a helpful assistant...',
  promptName: 'Data Analysis',
  promptCategory: 'analysis',
  promptTags: ['data', 'analysis'],
  trackContext: true,
  contextItems: [
    { contextType: 'user_data', content: '...', source: 'database' }
  ],
  extractReasoningChain: true,
  metadata: { purpose: 'data_analysis' }
});
```

## Migration

To apply the schema enhancements to your database:

1. Run the Prisma migration:
   ```
   npx prisma migrate dev --name enhance_ai_reasoning_schema
   ```

2. Run the schema enhancement script:
   ```
   npx ts-node src/scripts/applySchemaEnhancements.ts
   ```

This will:
- Apply the schema changes to your database
- Migrate existing data to the new schema
- Create model versions for existing reasonings
- Migrate AI prompts to use templates where applicable

## Benefits

The enhanced AI reasoning schema provides several benefits:

- **Transparency**: Track the entire reasoning process from prompt to response
- **Auditing**: Review and analyze AI operations for compliance and quality
- **Supervised Fine-Tuning**: Collect annotated data for model improvement
- **Quality Metrics**: Measure and track AI performance over time
- **Safety**: Ensure prompts and responses meet safety standards
- **Context Awareness**: Understand what context influenced AI decisions
- **Template Management**: Reuse and standardize prompts across the application
