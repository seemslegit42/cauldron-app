# AI Prompt and Reasoning Chain System

This system provides comprehensive tracking and storage of AI prompts, reasoning chains, and response trees. It's designed to support transparency, auditing, and supervised fine-tuning of AI models within the Cauldron platform.

## Schema Overview

The system uses the following database models:

### AIPrompt

Stores raw prompts with metadata:

- `id`: Unique identifier
- `content`: The actual prompt text
- `name`: Optional name for the prompt
- `description`: Optional description
- `version`: Version of the prompt (e.g., "1.0.0")
- `type`: Type of prompt (e.g., "user", "system", "few-shot", "template")
- `module`: Module this prompt is associated with (e.g., "arcana", "phantom", "forgeflow")
- `category`: Category for organization (e.g., "analysis", "decision", "action")
- `tags`: Tags for filtering and organization
- `templateVariables`: Variables used in template prompts
- `isActive`: Whether the prompt is active
- `safetyScore`: Safety score (0-1) for prompt risk assessment
- `estimatedTokens`: Estimated token count

### AISystemPrompt

Stores system prompts used for different modules:

- `id`: Unique identifier
- `content`: The system prompt text
- `name`: Name of the system prompt
- `description`: Description of the system prompt
- `version`: Version of the system prompt
- `module`: Module this system prompt is for
- `model`: AI model this system prompt is designed for
- `isDefault`: Whether this is the default system prompt for the module/model
- `isActive`: Whether the system prompt is active
- `promptId`: Optional reference to the base prompt

### AIReasoning

Stores reasoning chains and thought processes:

- `id`: Unique identifier
- `sessionId`: Reference to the AI session
- `promptId`: Reference to the prompt used
- `systemPromptId`: Optional reference to the system prompt used
- `agentId`: Optional reference to the agent
- `userId`: Reference to the user
- `steps`: Array of reasoning steps
- `rawOutput`: Raw output from the AI
- `parsedOutput`: Parsed structured output (if applicable)
- `model`: AI model used
- `temperature`: Temperature setting used
- `maxTokens`: Max tokens setting used
- `totalTokens`: Total tokens used
- `promptTokens`: Tokens used in the prompt
- `completionTokens`: Tokens used in the completion
- `latencyMs`: Latency in milliseconds
- `success`: Whether the reasoning was successful
- `error`: Error message if failed
- `metadata`: Additional metadata

### AIResponseNode

Stores response tree nodes in a hierarchical structure:

- `id`: Unique identifier
- `reasoningId`: Reference to the reasoning chain
- `parentId`: Optional reference to the parent node
- `content`: The content of this response node
- `type`: Type of node (e.g., "thought", "action", "observation", "decision")
- `order`: Order in the sequence
- `metadata`: Additional metadata
- `confidence`: Confidence score (0-1) if applicable

### AISession

Tracks complete interaction sessions:

- `id`: Unique identifier
- `userId`: Reference to the user
- `agentId`: Optional reference to the agent
- `module`: Module this session is associated with
- `sessionType`: Type of session (e.g., "chat", "workflow", "analysis")
- `status`: Status of the session (e.g., "active", "completed", "failed")
- `startedAt`: When the session started
- `completedAt`: When the session completed
- `metadata`: Additional metadata
- `feedback`: User feedback on the session
- `totalTokens`: Total tokens used in the session
- `totalLatencyMs`: Total latency in milliseconds

## Usage

### Tracking AI Operations

The system provides utilities for tracking AI operations:

```typescript
import { trackedGroqInference } from '../ai-services/trackedGroqInference';

// In your server operation
const response = await trackedGroqInference({
  prompt: "Write a short story about a robot",
  model: "llama3-8b-8192",
  temperature: 0.7,
  stream: true,
  userId: user.id,
  module: "arcana",
  sessionType: "story-generation",
  promptName: "Robot Story Generator",
  promptCategory: "creative",
  promptTags: ["story", "robot", "creative"],
}, context);
```

### Completing Sessions

When an AI session is complete, you can mark it as such:

```typescript
import { completeTrackedGroqSession } from '../ai-services/trackedGroqInference';

// Complete the session with feedback
await completeTrackedGroqSession(
  sessionId,
  { rating: 4, comment: "Good response" },
  totalTokens,
  totalLatencyMs
);
```

### Retrieving Reasoning Chains

You can retrieve reasoning chains for analysis:

```typescript
import { PromptReasoningService } from '../ai-services/promptReasoningService';

// Get reasoning chains for a session
const reasoningChains = await PromptReasoningService.getReasoningChainsBySession(sessionId);
```

## Benefits

This system provides several benefits:

1. **Transparency**: All AI operations are tracked and can be audited.
2. **Debugging**: Reasoning chains help debug AI behavior.
3. **Fine-tuning**: Collected data can be used for supervised fine-tuning.
4. **Performance Monitoring**: Track token usage and latency.
5. **Safety**: Monitor and score prompts for safety concerns.

## Integration with Sentient Loop™

This system integrates with the Sentient Loop™ to provide a comprehensive view of AI operations:

- **Perception**: Track how the AI perceives user inputs
- **Analysis**: Store reasoning chains for analysis steps
- **Decision**: Record decision-making processes
- **Action**: Track actions taken by the AI
- **Feedback**: Store user feedback for continuous improvement

## Security Considerations

- All stored prompts and reasoning chains should be treated as sensitive data
- Access to this data should be restricted based on user roles
- Consider implementing data retention policies for prompt and reasoning data
- Ensure that safety scoring is regularly updated to catch potential issues
