# Groq Integration for High-Performance Inference

This document provides comprehensive information about the Groq integration in the Cauldron platform, including configuration, usage, performance characteristics, and best practices.

## Table of Contents

1. [Overview](#overview)
2. [Configuration](#configuration)
3. [Usage](#usage)
4. [Performance Characteristics](#performance-characteristics)
5. [Benchmarking](#benchmarking)
6. [Fallback Mechanisms](#fallback-mechanisms)
7. [Token Budgets](#token-budgets)
8. [Throughput Limits](#throughput-limits)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

## Overview

Groq is a high-performance inference engine that provides extremely low-latency responses for AI operations. The Cauldron platform integrates Groq to power its AI capabilities, with a focus on:

- **Sub-100ms latency** for fast completions
- **High throughput** for parallel processing
- **Efficient load balancing** between models
- **Robust fallback mechanisms** for reliability

The integration is designed to be flexible, scalable, and resilient, with comprehensive monitoring and benchmarking capabilities.

## Configuration

The Groq integration is configured in `app/src/shared/config/ai-config.ts`. The configuration includes:

### Model Tiers

- **Fast**: `llama3-8b-8192` - Optimized for sub-100ms responses with small token limits
- **Standard**: `llama3-70b-8192` - Balanced performance and quality for most interactions
- **Premium**: `mixtral-8x7b-32768` - High-quality model for complex reasoning tasks

### Fallback Models

Each tier has a list of fallback models that are used if the primary model fails:

- **Fast**: `llama3-8b-8192` → `gemma-7b-it` → `local-embeddings`
- **Standard**: `llama3-70b-8192` → `mixtral-8x7b-32768` → `llama3-8b-8192`
- **Premium**: `mixtral-8x7b-32768` → `llama3-70b-8192` → `llama3-8b-8192`

### Performance Settings

- **Latency Thresholds**: Categorization of response times (excellent, good, acceptable, poor, critical)
- **Token Budgets**: Maximum tokens allowed for different request types
- **Throughput Limits**: Maximum requests and tokens per minute

## Usage

### Basic Usage

```typescript
import { routeRequest } from '../ai-services/agentRequestRouter';

// In your server operation
const response = await routeRequest(
  {
    prompt: "Write a short story about a robot",
    temperature: 0.7,
  },
  {
    module: "arcana",
    requestType: "contentGeneration",
    trackRequest: true,
    userId: user.id,
  },
  context
);
```

### Request Routing

The `routeRequest` function automatically selects the appropriate model based on the request characteristics:

```typescript
// For a fast response (sub-100ms)
const response = await routeRequest(
  { prompt: "Quick summary" },
  { 
    module: "sentinel", 
    requestType: "chat",
    maxLatencyMs: 100,
  },
  context
);

// For high-quality content generation
const response = await routeRequest(
  { prompt: "Generate a blog post about AI" },
  { 
    module: "manifold", 
    requestType: "contentGeneration",
    modelTier: "premium",
  },
  context
);
```

### Parallel Processing

For high-throughput scenarios, you can enable parallel processing:

```typescript
const response = await routeRequest(
  { prompt: "Process multiple requests" },
  { 
    module: "athena", 
    useParallelProcessing: true,
  },
  context
);
```

## Performance Characteristics

### Latency

| Model Tier | Average Latency | 95th Percentile | Use Case |
|------------|-----------------|-----------------|----------|
| Fast       | 50-100ms        | 150ms           | UI completions, embeddings |
| Standard   | 300-500ms       | 800ms           | Chat, analysis |
| Premium    | 800-1200ms      | 2000ms          | Content generation, complex reasoning |

### Token Throughput

| Model Tier | Tokens/Second | Max Parallel Requests | Use Case |
|------------|---------------|------------------------|----------|
| Fast       | 500-1000      | 20                     | High-volume, simple tasks |
| Standard   | 200-400       | 10                     | Balanced performance |
| Premium    | 100-200       | 5                      | Complex, quality-focused tasks |

## Benchmarking

The platform includes built-in benchmarking capabilities to measure and monitor performance:

```typescript
import { benchmarkLatency } from '../ai-services/inferenceMetrics';

// Run a benchmark
const result = await benchmarkLatency(
  'llama3-8b-8192',
  'Write a short story about a robot',
  {
    maxTokens: 100,
    temperature: 0.7,
    runs: 3,
  }
);

console.log(`Average latency: ${result.latencyMs}ms`);
console.log(`Tokens per second: ${result.tokensPerSecond}`);
```

You can also use the benchmarking API endpoint:

```typescript
const benchmark = await benchmarkInference({
  modelName: 'llama3-70b-8192',
  prompt: 'Analyze this business data and provide insights',
  maxTokens: 500,
  runs: 5,
});
```

## Fallback Mechanisms

The integration includes robust fallback mechanisms to handle failures:

1. If a model fails, the system automatically tries the next model in the fallback list
2. Each fallback attempt is logged for monitoring and analysis
3. If all fallbacks fail, a clear error is returned with details

Example of fallback configuration:

```typescript
fallbacks: {
  fast: ['llama3-8b-8192', 'gemma-7b-it', 'local-embeddings'],
  standard: ['llama3-70b-8192', 'mixtral-8x7b-32768', 'llama3-8b-8192'],
  premium: ['mixtral-8x7b-32768', 'llama3-70b-8192', 'llama3-8b-8192'],
}
```

## Token Budgets

Token budgets help control costs and ensure efficient resource usage:

```typescript
tokenBudgets: {
  default: {
    prompt: 1000,
    completion: 1000,
  },
  chat: {
    prompt: 2000,
    completion: 1000,
  },
  summarization: {
    prompt: 4000,
    completion: 1000,
  },
  contentGeneration: {
    prompt: 1000,
    completion: 4000,
  },
}
```

You can track token usage against budgets:

```typescript
import { trackTokenBudget } from '../ai-services/inferenceMetrics';

const status = await trackTokenBudget(
  user.id,
  promptTokens,
  completionTokens,
  'contentGeneration'
);

if (!status.isWithinBudget) {
  console.warn(`Token budget exceeded: ${status.totalUsagePercent}% of budget`);
}
```

## Throughput Limits

The system enforces throughput limits to prevent overloading:

```typescript
throughputLimits: {
  requestsPerMinute: 100,
  tokensPerMinute: 100000,
}
```

You can track throughput against limits:

```typescript
import { trackThroughput } from '../ai-services/inferenceMetrics';

const metrics = await trackThroughput(totalTokens);

if (!metrics.isWithinLimits) {
  console.warn(`Throughput limits exceeded: ${metrics.requestUsagePercent}% of request limit, ${metrics.tokenUsagePercent}% of token limit`);
}
```

## Best Practices

1. **Match the model to the task**:
   - Use fast models for UI completions and simple tasks
   - Use standard models for most interactions
   - Use premium models for complex reasoning and content generation

2. **Optimize prompts for efficiency**:
   - Keep prompts concise and focused
   - Use system prompts to set context
   - Structure prompts for the specific model

3. **Implement proper error handling**:
   - Always handle potential failures
   - Use fallbacks appropriately
   - Provide clear error messages to users

4. **Monitor performance**:
   - Regularly benchmark models
   - Track token usage and throughput
   - Set up alerts for performance degradation

5. **Cache responses when appropriate**:
   - Use caching for frequently requested content
   - Implement proper cache invalidation
   - Consider user-specific vs. global caching

## Troubleshooting

### Common Issues

1. **High Latency**:
   - Check network connectivity
   - Verify prompt length (shorter prompts are faster)
   - Consider using a faster model tier
   - Check for Groq API status issues

2. **Model Failures**:
   - Verify API key is valid
   - Check for rate limiting
   - Ensure prompt follows guidelines
   - Verify fallback configuration

3. **Token Budget Exceeded**:
   - Optimize prompts to use fewer tokens
   - Adjust token budgets if necessary
   - Implement chunking for large content

4. **Throughput Limits Reached**:
   - Implement request batching
   - Add rate limiting at the application level
   - Consider upgrading Groq plan for higher limits
   - Optimize token usage per request
