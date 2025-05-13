# Enhanced AI Reasoning Chain and Prompt History

This document explains how to use the enhanced AI reasoning chain and prompt history schema for tracking raw prompts, AI reasoning chains, and response trees. This system is designed for transparency, auditing, and supervised fine-tuning.

## Schema Overview

The enhanced schema builds upon the existing AI tracking models with additional fields and relationships:

### Enhanced AIReasoning Model

The `AIReasoning` model has been enhanced with:

- `reasoningChain`: Structured chain-of-thought reasoning
- `confidenceScore`: Overall confidence score (0-1)
- `executionGraph`: Execution graph for complex reasoning
- `contextSources`: Sources of context used in reasoning
- `alternativePaths`: Alternative reasoning paths considered
- Relations to new models: `reasoningSteps`, `contextItems`, `evaluations`

### New Models

- **AIReasoningStep**: Tracks individual steps in the reasoning process
- **AIContextItem**: Tracks context used in reasoning
- **AIEvaluation**: Tracks quality metrics for reasoning
- **AIPromptSafetyCheck**: Tracks safety evaluations for prompts
- **AIResponseAnnotation**: Allows for feedback and corrections on responses

### Enhanced AIPrompt Model

The `AIPrompt` model has been enhanced with:

- `promptVersion`: Version tracking for prompt evolution
- `promptHash`: Hash for deduplication and reference
- `parentPromptId`: For tracking prompt evolution
- `derivedFromId`: For tracking prompt derivation
- `usageStats`: Statistics on prompt usage
- Relations to new models: `parentPrompt`, `childPrompts`, `derivedFrom`, `derivatives`, `safetyChecks`

### Enhanced AIResponseNode Model

The `AIResponseNode` model has been enhanced with:

- `sourceReasoningStep`: Reference to the reasoning step that generated this
- `confidenceScore`: Confidence score for this specific node
- `alternativeResponses`: Alternative responses considered
- Relations to new models: `annotations`

### Enhanced AISession Model

The `AISession` model has been enhanced with:

- `sessionPurpose`: Purpose of this session
- `businessContext`: Business context for this session
- `sessionTags`: Tags for categorizing sessions
- `qualityScore`: Overall quality score for the session
- `userSatisfaction`: User satisfaction score
- `learningOutcomes`: What was learned from this session

## Usage Examples

### Tracking a Complete Reasoning Chain

```typescript
import { EnhancedReasoningService } from '../ai-services/enhancedReasoningService';

// Track a complete reasoning chain
const reasoning = await EnhancedReasoningService.trackReasoningChain(
  userId,
  sessionId,
  promptId,
  'llama3-70b-8192',
  0.7,
  rawOutput,
  {
    agentId: agentId,
    systemPromptId: systemPromptId,
    steps: [
      {
        stepNumber: 1,
        stepType: 'thought',
        content: 'I need to analyze the user query first...',
        tokens: 15,
        duration: 50, // milliseconds
      },
      {
        stepNumber: 2,
        stepType: 'observation',
        content: 'The user is asking about market trends in healthcare...',
        tokens: 20,
        duration: 30,
      },
      {
        stepNumber: 3,
        stepType: 'action',
        content: 'I will retrieve relevant market data...',
        tokens: 12,
        duration: 200,
      },
      {
        stepNumber: 4,
        stepType: 'decision',
        content: 'Based on the data, I will recommend focusing on telehealth...',
        tokens: 25,
        duration: 100,
      }
    ],
    contextItems: [
      {
        contextType: 'user_history',
        content: 'Previous conversations about healthcare investments',
        source: 'chat_history',
        relevanceScore: 0.8,
      },
      {
        contextType: 'database_record',
        content: 'Healthcare market data from the last 6 months',
        source: 'market_database',
        relevanceScore: 0.95,
      }
    ],
    reasoningChain: {
      initialThought: 'Need to understand the healthcare market trends',
      analysis: 'Telehealth is growing rapidly due to pandemic effects',
      conclusion: 'Recommend investment in telehealth technologies'
    },
    confidenceScore: 0.85,
    executionGraph: {
      nodes: ['query_analysis', 'data_retrieval', 'trend_analysis', 'recommendation'],
      edges: [
        { from: 'query_analysis', to: 'data_retrieval' },
        { from: 'data_retrieval', to: 'trend_analysis' },
        { from: 'trend_analysis', to: 'recommendation' }
      ]
    },
    parsedOutput: {
      recommendation: 'Invest in telehealth',
      confidence: 'high',
      timeframe: '6-12 months'
    },
    totalTokens: 150,
    promptTokens: 50,
    completionTokens: 100,
    latencyMs: 450,
    metadata: {
      priority: 'high',
      businessUnit: 'healthcare',
      requestType: 'market_analysis'
    }
  }
);
```

### Creating a Prompt Safety Check

```typescript
import { EnhancedReasoningService } from '../ai-services/enhancedReasoningService';

// Create a prompt safety check
const safetyCheck = await EnhancedReasoningService.createPromptSafetyCheck({
  promptId: promptId,
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
});
```

### Creating a Response Annotation

```typescript
import { EnhancedReasoningService } from '../ai-services/enhancedReasoningService';

// Create a response annotation
const annotation = await EnhancedReasoningService.createResponseAnnotation(
  userId,
  {
    responseNodeId: responseNodeId,
    annotationType: 'improvement',
    content: 'This response could be more concise and focused on the key points.',
    suggestedOutput: 'A more concise version of the response...',
    status: 'pending',
    metadata: {
      priority: 'medium',
      category: 'clarity'
    }
  }
);
```

### Getting a Complete Reasoning Chain

```typescript
import { EnhancedReasoningService } from '../ai-services/enhancedReasoningService';

// Get a complete reasoning chain with all related data
const completeReasoning = await EnhancedReasoningService.getCompleteReasoningChain(reasoningId);

// Access the reasoning steps
const steps = completeReasoning.reasoningSteps;

// Access the context items
const contextItems = completeReasoning.contextItems;

// Access the evaluations
const evaluations = completeReasoning.evaluations;

// Access the response nodes
const responseNodes = completeReasoning.responseNodes;
```

## Benefits

This enhanced schema provides several benefits:

1. **Transparency**: Track every step of the AI reasoning process
2. **Auditability**: Maintain a complete record of AI operations for compliance and review
3. **Fine-tuning**: Collect annotated data for supervised fine-tuning
4. **Safety**: Monitor and evaluate prompt safety
5. **Quality Assurance**: Track and improve AI response quality
6. **Evolution Tracking**: Track the evolution of prompts and their derivatives

## Integration with Existing Systems

This enhanced schema integrates with the existing Sentient Loop™ system and other modules:

- **Arcana**: Use reasoning chains for dashboard insights
- **Phantom**: Track security-related reasoning for threat analysis
- **Athena**: Store business intelligence reasoning for strategic decisions
- **Forgeflow**: Track workflow creation reasoning
- **Sentinel**: Monitor reasoning for security compliance

## Implementation Steps

To implement this enhanced schema:

1. Apply the migration in `prisma/migrations/20240601_enhance_ai_reasoning_schema.prisma`
2. Use the `EnhancedReasoningService` for working with the enhanced schema
3. Update existing AI operations to track detailed reasoning chains
4. Implement UI components for visualizing reasoning chains
5. Set up automated evaluations for reasoning quality

## Conclusion

This enhanced schema provides a comprehensive system for tracking AI reasoning chains and prompt history, enabling transparency, auditing, and supervised fine-tuning. By tracking every step of the reasoning process, you can gain insights into how AI makes decisions and improve the quality of AI responses over time.
