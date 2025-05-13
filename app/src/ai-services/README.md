# AI Services

This directory contains integrations with various AI providers.

## Groq Integration

The Groq integration provides a high-performance, low-latency inference service using Groq's API and the Swarm Groq client for optimal performance.

### Features

- Sub-100ms latency for streaming completions
- Support for multiple Groq models (Llama 3, Mixtral, Gemma)
- Streaming and non-streaming response modes
- Error handling and retry mechanisms
- React hook for easy frontend integration

### Usage

#### Backend

```typescript
import { groqInference } from '../ai-services/groq';

// In your server operation
const response = await groqInference({
  prompt: "Write a short story about a robot",
  model: "llama3-8b-8192",
  temperature: 0.7,
  stream: true
}, context);
```

#### Frontend

```tsx
import { useGroqInference } from '../shared/hooks/useGroqInference';

function MyComponent() {
  const { generateText, isLoading, fullText } = useGroqInference({
    onChunk: (chunk) => console.log('New chunk:', chunk),
    onComplete: (text) => console.log('Complete text:', text)
  });

  const handleSubmit = async () => {
    await generateText({
      prompt: 'Write a short story about a robot',
      model: 'llama3-8b-8192',
      temperature: 0.7
    });
  };

  return (
    <div>
      <button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Generate Text'}
      </button>
      {fullText && <div>{fullText}</div>}
    </div>
  );
}
```

### Configuration

The Groq API key is configured in the `.env` file:

```
GROQ_API_KEY=your_groq_api_key_here
```

### Models

The following models are supported:

- `llama3-8b-8192`: Llama 3 8B (default)
- `llama3-70b-8192`: Llama 3 70B
- `mixtral-8x7b-32768`: Mixtral 8x7B
- `gemma-7b-it`: Gemma 7B

### Dependencies

- `@groq/groq-sdk`: Official Groq SDK
- `swarm-groq`: High-performance client for Groq API with swarm capabilities# AI Services

This directory contains integrations with various AI providers.

## Groq Integration

The Groq integration provides a high-performance, low-latency inference service using Groq's API and the Swarm Groq client for optimal performance.

### Features

- Sub-100ms latency for streaming completions
- Support for multiple Groq models (Llama 3, Mixtral, Gemma)
- Streaming and non-streaming response modes
- Error handling and retry mechanisms
- React hook for easy frontend integration

### Usage

#### Backend

```typescript
import { groqInference } from '../ai-services/groq';

// In your server operation
const response = await groqInference({
  prompt: "Write a short story about a robot",
  model: "llama3-8b-8192",
  temperature: 0.7,
  stream: true
}, context);
```

#### Frontend

```tsx
import { useGroqInference } from '../shared/hooks/useGroqInference';

function MyComponent() {
  const { generateText, isLoading, fullText } = useGroqInference({
    onChunk: (chunk) => console.log('New chunk:', chunk),
    onComplete: (text) => console.log('Complete text:', text)
  });

  const handleSubmit = async () => {
    await generateText({
      prompt: 'Write a short story about a robot',
      model: 'llama3-8b-8192',
      temperature: 0.7
    });
  };

  return (
    <div>
      <button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Generate Text'}
      </button>
      {fullText && <div>{fullText}</div>}
    </div>
  );
}
```

### Configuration

The Groq API key is configured in the `.env` file:

```
GROQ_API_KEY=your_groq_api_key_here
```

### Models

The following models are supported:

- `llama3-8b-8192`: Llama 3 8B (default)
- `llama3-70b-8192`: Llama 3 70B
- `mixtral-8x7b-32768`: Mixtral 8x7B
- `gemma-7b-it`: Gemma 7B

### Dependencies

- `@groq/groq-sdk`: Official Groq SDK
- `swarm-groq`: High-performance client for Groq API with swarm capabilities# AI Services

This directory contains integrations with various AI providers.

## Groq Integration

The Groq integration provides a high-performance, low-latency inference service using Groq's API and the Swarm Groq client for optimal performance.

### Features

- Sub-100ms latency for streaming completions
- Support for multiple Groq models (Llama 3, Mixtral, Gemma)
- Streaming and non-streaming response modes
- Error handling and retry mechanisms
- React hook for easy frontend integration

### Usage

#### Backend

```typescript
import { groqInference } from '../ai-services/groq';

// In your server operation
const response = await groqInference({
  prompt: "Write a short story about a robot",
  model: "llama3-8b-8192",
  temperature: 0.7,
  stream: true
}, context);
```

#### Frontend

```tsx
import { useGroqInference } from '../shared/hooks/useGroqInference';

function MyComponent() {
  const { generateText, isLoading, fullText } = useGroqInference({
    onChunk: (chunk) => console.log('New chunk:', chunk),
    onComplete: (text) => console.log('Complete text:', text)
  });

  const handleSubmit = async () => {
    await generateText({
      prompt: 'Write a short story about a robot',
      model: 'llama3-8b-8192',
      temperature: 0.7
    });
  };

  return (
    <div>
      <button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Generate Text'}
      </button>
      {fullText && <div>{fullText}</div>}
    </div>
  );
}
```

### Configuration

The Groq API key is configured in the `.env` file:

```
GROQ_API_KEY=your_groq_api_key_here
```

### Models

The following models are supported:

- `llama3-8b-8192`: Llama 3 8B (default)
- `llama3-70b-8192`: Llama 3 70B
- `mixtral-8x7b-32768`: Mixtral 8x7B
- `gemma-7b-it`: Gemma 7B

### Dependencies

- `@groq/groq-sdk`: Official Groq SDK
- `swarm-groq`: High-performance client for Groq API with swarm capabilities# AI Services

This directory contains integrations with various AI providers.

## Groq Integration

The Groq integration provides a high-performance, low-latency inference service using Groq's API and the Swarm Groq client for optimal performance.

### Features

- Sub-100ms latency for streaming completions
- Support for multiple Groq models (Llama 3, Mixtral, Gemma)
- Streaming and non-streaming response modes
- Error handling and retry mechanisms
- React hook for easy frontend integration

### Usage

#### Backend

```typescript
import { groqInference } from '../ai-services/groq';

// In your server operation
const response = await groqInference({
  prompt: "Write a short story about a robot",
  model: "llama3-8b-8192",
  temperature: 0.7,
  stream: true
}, context);
```

#### Frontend

```tsx
import { useGroqInference } from '../shared/hooks/useGroqInference';

function MyComponent() {
  const { generateText, isLoading, fullText } = useGroqInference({
    onChunk: (chunk) => console.log('New chunk:', chunk),
    onComplete: (text) => console.log('Complete text:', text)
  });

  const handleSubmit = async () => {
    await generateText({
      prompt: 'Write a short story about a robot',
      model: 'llama3-8b-8192',
      temperature: 0.7
    });
  };

  return (
    <div>
      <button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Generate Text'}
      </button>
      {fullText && <div>{fullText}</div>}
    </div>
  );
}
```

### Configuration

The Groq API key is configured in the `.env` file:

```
GROQ_API_KEY=your_groq_api_key_here
```

### Models

The following models are supported:

- `llama3-8b-8192`: Llama 3 8B (default)
- `llama3-70b-8192`: Llama 3 70B
- `mixtral-8x7b-32768`: Mixtral 8x7B
- `gemma-7b-it`: Gemma 7B

### Dependencies

- `@groq/groq-sdk`: Official Groq SDK
- `swarm-groq`: High-performance client for Groq API with swarm capabilities# AI Services

This directory contains integrations with various AI providers.

## Groq Integration

The Groq integration provides a high-performance, low-latency inference service using Groq's API and the Swarm Groq client for optimal performance.

### Features

- Sub-100ms latency for streaming completions
- Support for multiple Groq models (Llama 3, Mixtral, Gemma)
- Streaming and non-streaming response modes
- Error handling and retry mechanisms
- React hook for easy frontend integration

### Usage

#### Backend

```typescript
import { groqInference } from '../ai-services/groq';

// In your server operation
const response = await groqInference({
  prompt: "Write a short story about a robot",
  model: "llama3-8b-8192",
  temperature: 0.7,
  stream: true
}, context);
```

#### Frontend

```tsx
import { useGroqInference } from '../shared/hooks/useGroqInference';

function MyComponent() {
  const { generateText, isLoading, fullText } = useGroqInference({
    onChunk: (chunk) => console.log('New chunk:', chunk),
    onComplete: (text) => console.log('Complete text:', text)
  });

  const handleSubmit = async () => {
    await generateText({
      prompt: 'Write a short story about a robot',
      model: 'llama3-8b-8192',
      temperature: 0.7
    });
  };

  return (
    <div>
      <button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Generate Text'}
      </button>
      {fullText && <div>{fullText}</div>}
    </div>
  );
}
```

### Configuration

The Groq API key is configured in the `.env` file:

```
GROQ_API_KEY=your_groq_api_key_here
```

### Models

The following models are supported:

- `llama3-8b-8192`: Llama 3 8B (default)
- `llama3-70b-8192`: Llama 3 70B
- `mixtral-8x7b-32768`: Mixtral 8x7B
- `gemma-7b-it`: Gemma 7B

### Dependencies

- `@groq/groq-sdk`: Official Groq SDK
- `swarm-groq`: High-performance client for Groq API with swarm capabilities# AI Services

This directory contains integrations with various AI providers.

## Groq Integration

The Groq integration provides a high-performance, low-latency inference service using Groq's API and the Swarm Groq client for optimal performance.

### Features

- Sub-100ms latency for streaming completions
- Support for multiple Groq models (Llama 3, Mixtral, Gemma)
- Streaming and non-streaming response modes
- Error handling and retry mechanisms
- React hook for easy frontend integration

### Usage

#### Backend

```typescript
import { groqInference } from '../ai-services/groq';

// In your server operation
const response = await groqInference({
  prompt: "Write a short story about a robot",
  model: "llama3-8b-8192",
  temperature: 0.7,
  stream: true
}, context);
```

#### Frontend

```tsx
import { useGroqInference } from '../shared/hooks/useGroqInference';

function MyComponent() {
  const { generateText, isLoading, fullText } = useGroqInference({
    onChunk: (chunk) => console.log('New chunk:', chunk),
    onComplete: (text) => console.log('Complete text:', text)
  });

  const handleSubmit = async () => {
    await generateText({
      prompt: 'Write a short story about a robot',
      model: 'llama3-8b-8192',
      temperature: 0.7
    });
  };

  return (
    <div>
      <button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Generate Text'}
      </button>
      {fullText && <div>{fullText}</div>}
    </div>
  );
}
```

### Configuration

The Groq API key is configured in the `.env` file:

```
GROQ_API_KEY=your_groq_api_key_here
```

### Models

The following models are supported:

- `llama3-8b-8192`: Llama 3 8B (default)
- `llama3-70b-8192`: Llama 3 70B
- `mixtral-8x7b-32768`: Mixtral 8x7B
- `gemma-7b-it`: Gemma 7B

### Dependencies

- `@groq/groq-sdk`: Official Groq SDK
- `swarm-groq`: High-performance client for Groq API with swarm capabilities# AI Services

This directory contains integrations with various AI providers.

## Groq Integration

The Groq integration provides a high-performance, low-latency inference service using Groq's API and the Swarm Groq client for optimal performance.

### Features

- Sub-100ms latency for streaming completions
- Support for multiple Groq models (Llama 3, Mixtral, Gemma)
- Streaming and non-streaming response modes
- Error handling and retry mechanisms
- React hook for easy frontend integration

### Usage

#### Backend

```typescript
import { groqInference } from '../ai-services/groq';

// In your server operation
const response = await groqInference({
  prompt: "Write a short story about a robot",
  model: "llama3-8b-8192",
  temperature: 0.7,
  stream: true
}, context);
```

#### Frontend

```tsx
import { useGroqInference } from '../shared/hooks/useGroqInference';

function MyComponent() {
  const { generateText, isLoading, fullText } = useGroqInference({
    onChunk: (chunk) => console.log('New chunk:', chunk),
    onComplete: (text) => console.log('Complete text:', text)
  });

  const handleSubmit = async () => {
    await generateText({
      prompt: 'Write a short story about a robot',
      model: 'llama3-8b-8192',
      temperature: 0.7
    });
  };

  return (
    <div>
      <button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Generate Text'}
      </button>
      {fullText && <div>{fullText}</div>}
    </div>
  );
}
```

### Configuration

The Groq API key is configured in the `.env` file:

```
GROQ_API_KEY=your_groq_api_key_here
```

### Models

The following models are supported:

- `llama3-8b-8192`: Llama 3 8B (default)
- `llama3-70b-8192`: Llama 3 70B
- `mixtral-8x7b-32768`: Mixtral 8x7B
- `gemma-7b-it`: Gemma 7B

### Dependencies

- `@groq/groq-sdk`: Official Groq SDK
- `swarm-groq`: High-performance client for Groq API with swarm capabilities# AI Services

This directory contains integrations with various AI providers.

## Groq Integration

The Groq integration provides a high-performance, low-latency inference service using Groq's API and the Swarm Groq client for optimal performance.

### Features

- Sub-100ms latency for streaming completions
- Support for multiple Groq models (Llama 3, Mixtral, Gemma)
- Streaming and non-streaming response modes
- Error handling and retry mechanisms
- React hook for easy frontend integration

### Usage

#### Backend

```typescript
import { groqInference } from '../ai-services/groq';

// In your server operation
const response = await groqInference({
  prompt: "Write a short story about a robot",
  model: "llama3-8b-8192",
  temperature: 0.7,
  stream: true
}, context);
```

#### Frontend

```tsx
import { useGroqInference } from '../shared/hooks/useGroqInference';

function MyComponent() {
  const { generateText, isLoading, fullText } = useGroqInference({
    onChunk: (chunk) => console.log('New chunk:', chunk),
    onComplete: (text) => console.log('Complete text:', text)
  });

  const handleSubmit = async () => {
    await generateText({
      prompt: 'Write a short story about a robot',
      model: 'llama3-8b-8192',
      temperature: 0.7
    });
  };

  return (
    <div>
      <button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Generate Text'}
      </button>
      {fullText && <div>{fullText}</div>}
    </div>
  );
}
```

### Configuration

The Groq API key is configured in the `.env` file:

```
GROQ_API_KEY=your_groq_api_key_here
```

### Models

The following models are supported:

- `llama3-8b-8192`: Llama 3 8B (default)
- `llama3-70b-8192`: Llama 3 70B
- `mixtral-8x7b-32768`: Mixtral 8x7B
- `gemma-7b-it`: Gemma 7B

### Dependencies

- `@groq/groq-sdk`: Official Groq SDK
- `swarm-groq`: High-performance client for Groq API with swarm capabilities# AI Services

This directory contains integrations with various AI providers.

## Groq Integration

The Groq integration provides a high-performance, low-latency inference service using Groq's API and the Swarm Groq client for optimal performance.

### Features

- Sub-100ms latency for streaming completions
- Support for multiple Groq models (Llama 3, Mixtral, Gemma)
- Streaming and non-streaming response modes
- Error handling and retry mechanisms
- React hook for easy frontend integration

### Usage

#### Backend

```typescript
import { groqInference } from '../ai-services/groq';

// In your server operation
const response = await groqInference({
  prompt: "Write a short story about a robot",
  model: "llama3-8b-8192",
  temperature: 0.7,
  stream: true
}, context);
```

#### Frontend

```tsx
import { useGroqInference } from '../shared/hooks/useGroqInference';

function MyComponent() {
  const { generateText, isLoading, fullText } = useGroqInference({
    onChunk: (chunk) => console.log('New chunk:', chunk),
    onComplete: (text) => console.log('Complete text:', text)
  });

  const handleSubmit = async () => {
    await generateText({
      prompt: 'Write a short story about a robot',
      model: 'llama3-8b-8192',
      temperature: 0.7
    });
  };

  return (
    <div>
      <button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Generate Text'}
      </button>
      {fullText && <div>{fullText}</div>}
    </div>
  );
}
```

### Configuration

The Groq API key is configured in the `.env` file:

```
GROQ_API_KEY=your_groq_api_key_here
```

### Models

The following models are supported:

- `llama3-8b-8192`: Llama 3 8B (default)
- `llama3-70b-8192`: Llama 3 70B
- `mixtral-8x7b-32768`: Mixtral 8x7B
- `gemma-7b-it`: Gemma 7B

### Dependencies

- `@groq/groq-sdk`: Official Groq SDK
- `swarm-groq`: High-performance client for Groq API with swarm capabilities