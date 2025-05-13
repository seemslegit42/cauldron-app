import { GroqChat } from 'groq-sdk';

// Define types for Groq responses
export interface GroqCompletionResponse {
  id: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface GroqStreamResponse {
  id: string;
  choices: {
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }[];
}

// Define message type
export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Configuration for different models
export const GROQ_MODELS = {
  LLAMA3_8B: 'llama3-8b-8192',
  LLAMA3_70B: 'llama3-70b-8192',
  MIXTRAL_8X7B: 'mixtral-8x7b-32768',
  GEMMA_7B: 'gemma-7b-it',
} as const;

export type GroqModel = typeof GROQ_MODELS[keyof typeof GROQ_MODELS];

// Groq client configuration
interface GroqClientConfig {
  apiKey: string;
  model: GroqModel;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
}

// Swarm configuration for load balancing and failover
interface GroqSwarmConfig {
  clients: GroqClientConfig[];
  retryAttempts?: number;
  timeoutMs?: number;
}

class GroqSwarm {
  private clients: GroqChat[] = [];
  private retryAttempts: number;
  private timeoutMs: number;
  private lastClientIndex = 0;

  constructor(config: GroqSwarmConfig) {
    this.retryAttempts = config.retryAttempts || 3;
    this.timeoutMs = config.timeoutMs || 5000;
    
    // Initialize clients
    config.clients.forEach(clientConfig => {
      const client = new GroqChat({
        apiKey: clientConfig.apiKey,
      });
      this.clients.push(client);
    });
  }

  // Get the next client in round-robin fashion
  private getNextClient(): GroqChat {
    const client = this.clients[this.lastClientIndex];
    this.lastClientIndex = (this.lastClientIndex + 1) % this.clients.length;
    return client;
  }

  // Complete a prompt with the Groq API
  async complete(
    messages: GroqMessage[],
    options: {
      model: GroqModel;
      maxTokens?: number;
      temperature?: number;
      topP?: number;
      stream?: boolean;
      systemPrompt?: string;
    }
  ): Promise<GroqCompletionResponse> {
    let lastError: Error | null = null;
    
    // Add system prompt if provided
    if (options.systemPrompt && !messages.some(m => m.role === 'system')) {
      messages = [{ role: 'system', content: options.systemPrompt }, ...messages];
    }

    // Try each client with retries
    for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
      try {
        const client = this.getNextClient();
        
        // Create a promise that will reject after timeout
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Request timed out')), this.timeoutMs);
        });
        
        // Create the completion request
        const completionPromise = client.chat.completions.create({
          messages: messages as any,
          model: options.model,
          max_tokens: options.maxTokens,
          temperature: options.temperature,
          top_p: options.topP,
          stream: options.stream,
        });
        
        // Race the completion against the timeout
        const response = await Promise.race([completionPromise, timeoutPromise]);
        return response as GroqCompletionResponse;
      } catch (error) {
        lastError = error as Error;
        console.error(`Groq API error (attempt ${attempt + 1}/${this.retryAttempts}):`, error);
        // Continue to next attempt or client
      }
    }
    
    // If we get here, all attempts failed
    throw lastError || new Error('Failed to complete request after all retry attempts');
  }

  // Stream a completion from the Groq API
  async streamComplete(
    messages: GroqMessage[],
    options: {
      model: GroqModel;
      maxTokens?: number;
      temperature?: number;
      topP?: number;
      systemPrompt?: string;
      onChunk?: (chunk: GroqStreamResponse) => void;
    }
  ): Promise<string> {
    let lastError: Error | null = null;
    
    // Add system prompt if provided
    if (options.systemPrompt && !messages.some(m => m.role === 'system')) {
      messages = [{ role: 'system', content: options.systemPrompt }, ...messages];
    }

    // Try each client with retries
    for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
      try {
        const client = this.getNextClient();
        
        const stream = await client.chat.completions.create({
          messages: messages as any,
          model: options.model,
          max_tokens: options.maxTokens,
          temperature: options.temperature,
          top_p: options.topP,
          stream: true,
        });

        let fullResponse = '';
        
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          fullResponse += content;
          
          if (options.onChunk) {
            options.onChunk(chunk as unknown as GroqStreamResponse);
          }
        }
        
        return fullResponse;
      } catch (error) {
        lastError = error as Error;
        console.error(`Groq API streaming error (attempt ${attempt + 1}/${this.retryAttempts}):`, error);
        // Continue to next attempt or client
      }
    }
    
    // If we get here, all attempts failed
    throw lastError || new Error('Failed to stream completion after all retry attempts');
  }
}

// Create and export the Groq swarm instance
export const groqSwarm = new GroqSwarm({
  clients: [
    {
      apiKey: process.env.GROQ_API_KEY || '',
      model: GROQ_MODELS.LLAMA3_8B,
    },
    // Add additional clients for redundancy if needed
  ],
  retryAttempts: 3,
  timeoutMs: 10000,
});

// Utility function for fast completions (sub-100ms target)
export async function getFastCompletion(
  prompt: string,
  options: {
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
  } = {}
): Promise<string> {
  try {
    const startTime = performance.now();
    
    const response = await groqSwarm.complete(
      [{ role: 'user', content: prompt }],
      {
        model: GROQ_MODELS.LLAMA3_8B, // Use the fastest model for sub-100ms completions
        maxTokens: options.maxTokens || 50, // Keep token count low for speed
        temperature: options.temperature || 0.3, // Lower temperature for more deterministic results
        systemPrompt: options.systemPrompt,
      }
    );
    
    const endTime = performance.now();
    console.log(`Groq completion time: ${endTime - startTime}ms`);
    
    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error getting fast completion:', error);
    return '';
  }
}

// Utility function for streaming completions
export async function getStreamingCompletion(
  messages: GroqMessage[],
  options: {
    model?: GroqModel;
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
    onChunk?: (chunk: string) => void;
  } = {}
): Promise<string> {
  try {
    return await groqSwarm.streamComplete(
      messages,
      {
        model: options.model || GROQ_MODELS.LLAMA3_70B,
        maxTokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7,
        systemPrompt: options.systemPrompt,
        onChunk: options.onChunk ? (chunk) => {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content && options.onChunk) {
            options.onChunk(content);
          }
        } : undefined,
      }
    );
  } catch (error) {
    console.error('Error getting streaming completion:', error);
    return '';
  }
}