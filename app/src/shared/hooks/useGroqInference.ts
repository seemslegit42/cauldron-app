import { useState, useCallback } from 'react';
import { groqInference } from 'wasp/client/operations';
import type { GroqInferenceInput } from '../../ai-services/groq';

interface UseGroqInferenceOptions {
  onStart?: () => void;
  onChunk?: (chunk: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

interface UseGroqInferenceReturn {
  isLoading: boolean;
  error: Error | null;
  fullText: string;
  generateText: (input: Omit<GroqInferenceInput, 'stream'>) => Promise<string>;
  reset: () => void;
}

/**
 * React hook for using Groq inference with streaming support
 * 
 * @example
 * ```tsx
 * const { generateText, isLoading, fullText } = useGroqInference({
 *   onChunk: (chunk) => console.log('New chunk:', chunk),
 *   onComplete: (text) => console.log('Complete text:', text)
 * });
 * 
 * const handleSubmit = async () => {
 *   await generateText({
 *     prompt: 'Write a short story about a robot',
 *     model: 'llama3-8b-8192',
 *     temperature: 0.7
 *   });
 * };
 * ```
 */
export function useGroqInference(options: UseGroqInferenceOptions = {}): UseGroqInferenceReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [fullText, setFullText] = useState('');

  const reset = useCallback(() => {
    setFullText('');
    setError(null);
  }, []);

  const generateText = useCallback(
    async (input: Omit<GroqInferenceInput, 'stream'>): Promise<string> => {
      try {
        reset();
        setIsLoading(true);
        
        if (options.onStart) {
          options.onStart();
        }

        // Always use streaming for low latency
        const stream = await groqInference({
          ...input,
          stream: true,
        });

        let completeText = '';

        // Process the stream
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            completeText += content;
            setFullText(prev => prev + content);
            
            if (options.onChunk) {
              options.onChunk(content);
            }
          }
        }

        if (options.onComplete) {
          options.onComplete(completeText);
        }

        return completeText;
      } catch (err: any) {
        const error = new Error(err.message || 'Failed to generate text');
        setError(error);
        
        if (options.onError) {
          options.onError(error);
        }
        
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [options, reset]
  );

  return {
    isLoading,
    error,
    fullText,
    generateText,
    reset,
  };
}import { useState, useCallback } from 'react';
import { groqInference } from 'wasp/client/operations';
import type { GroqInferenceInput } from '../../ai-services/groq';

interface UseGroqInferenceOptions {
  onStart?: () => void;
  onChunk?: (chunk: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

interface UseGroqInferenceReturn {
  isLoading: boolean;
  error: Error | null;
  fullText: string;
  generateText: (input: Omit<GroqInferenceInput, 'stream'>) => Promise<string>;
  reset: () => void;
}

/**
 * React hook for using Groq inference with streaming support
 * 
 * @example
 * ```tsx
 * const { generateText, isLoading, fullText } = useGroqInference({
 *   onChunk: (chunk) => console.log('New chunk:', chunk),
 *   onComplete: (text) => console.log('Complete text:', text)
 * });
 * 
 * const handleSubmit = async () => {
 *   await generateText({
 *     prompt: 'Write a short story about a robot',
 *     model: 'llama3-8b-8192',
 *     temperature: 0.7
 *   });
 * };
 * ```
 */
export function useGroqInference(options: UseGroqInferenceOptions = {}): UseGroqInferenceReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [fullText, setFullText] = useState('');

  const reset = useCallback(() => {
    setFullText('');
    setError(null);
  }, []);

  const generateText = useCallback(
    async (input: Omit<GroqInferenceInput, 'stream'>): Promise<string> => {
      try {
        reset();
        setIsLoading(true);
        
        if (options.onStart) {
          options.onStart();
        }

        // Always use streaming for low latency
        const stream = await groqInference({
          ...input,
          stream: true,
        });

        let completeText = '';

        // Process the stream
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            completeText += content;
            setFullText(prev => prev + content);
            
            if (options.onChunk) {
              options.onChunk(content);
            }
          }
        }

        if (options.onComplete) {
          options.onComplete(completeText);
        }

        return completeText;
      } catch (err: any) {
        const error = new Error(err.message || 'Failed to generate text');
        setError(error);
        
        if (options.onError) {
          options.onError(error);
        }
        
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [options, reset]
  );

  return {
    isLoading,
    error,
    fullText,
    generateText,
    reset,
  };
}import { useState, useCallback } from 'react';
import { groqInference } from 'wasp/client/operations';
import type { GroqInferenceInput } from '../../ai-services/groq';

interface UseGroqInferenceOptions {
  onStart?: () => void;
  onChunk?: (chunk: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

interface UseGroqInferenceReturn {
  isLoading: boolean;
  error: Error | null;
  fullText: string;
  generateText: (input: Omit<GroqInferenceInput, 'stream'>) => Promise<string>;
  reset: () => void;
}

/**
 * React hook for using Groq inference with streaming support
 * 
 * @example
 * ```tsx
 * const { generateText, isLoading, fullText } = useGroqInference({
 *   onChunk: (chunk) => console.log('New chunk:', chunk),
 *   onComplete: (text) => console.log('Complete text:', text)
 * });
 * 
 * const handleSubmit = async () => {
 *   await generateText({
 *     prompt: 'Write a short story about a robot',
 *     model: 'llama3-8b-8192',
 *     temperature: 0.7
 *   });
 * };
 * ```
 */
export function useGroqInference(options: UseGroqInferenceOptions = {}): UseGroqInferenceReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [fullText, setFullText] = useState('');

  const reset = useCallback(() => {
    setFullText('');
    setError(null);
  }, []);

  const generateText = useCallback(
    async (input: Omit<GroqInferenceInput, 'stream'>): Promise<string> => {
      try {
        reset();
        setIsLoading(true);
        
        if (options.onStart) {
          options.onStart();
        }

        // Always use streaming for low latency
        const stream = await groqInference({
          ...input,
          stream: true,
        });

        let completeText = '';

        // Process the stream
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            completeText += content;
            setFullText(prev => prev + content);
            
            if (options.onChunk) {
              options.onChunk(content);
            }
          }
        }

        if (options.onComplete) {
          options.onComplete(completeText);
        }

        return completeText;
      } catch (err: any) {
        const error = new Error(err.message || 'Failed to generate text');
        setError(error);
        
        if (options.onError) {
          options.onError(error);
        }
        
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [options, reset]
  );

  return {
    isLoading,
    error,
    fullText,
    generateText,
    reset,
  };
}import { useState, useCallback } from 'react';
import { groqInference } from 'wasp/client/operations';
import type { GroqInferenceInput } from '../../ai-services/groq';

interface UseGroqInferenceOptions {
  onStart?: () => void;
  onChunk?: (chunk: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

interface UseGroqInferenceReturn {
  isLoading: boolean;
  error: Error | null;
  fullText: string;
  generateText: (input: Omit<GroqInferenceInput, 'stream'>) => Promise<string>;
  reset: () => void;
}

/**
 * React hook for using Groq inference with streaming support
 * 
 * @example
 * ```tsx
 * const { generateText, isLoading, fullText } = useGroqInference({
 *   onChunk: (chunk) => console.log('New chunk:', chunk),
 *   onComplete: (text) => console.log('Complete text:', text)
 * });
 * 
 * const handleSubmit = async () => {
 *   await generateText({
 *     prompt: 'Write a short story about a robot',
 *     model: 'llama3-8b-8192',
 *     temperature: 0.7
 *   });
 * };
 * ```
 */
export function useGroqInference(options: UseGroqInferenceOptions = {}): UseGroqInferenceReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [fullText, setFullText] = useState('');

  const reset = useCallback(() => {
    setFullText('');
    setError(null);
  }, []);

  const generateText = useCallback(
    async (input: Omit<GroqInferenceInput, 'stream'>): Promise<string> => {
      try {
        reset();
        setIsLoading(true);
        
        if (options.onStart) {
          options.onStart();
        }

        // Always use streaming for low latency
        const stream = await groqInference({
          ...input,
          stream: true,
        });

        let completeText = '';

        // Process the stream
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            completeText += content;
            setFullText(prev => prev + content);
            
            if (options.onChunk) {
              options.onChunk(content);
            }
          }
        }

        if (options.onComplete) {
          options.onComplete(completeText);
        }

        return completeText;
      } catch (err: any) {
        const error = new Error(err.message || 'Failed to generate text');
        setError(error);
        
        if (options.onError) {
          options.onError(error);
        }
        
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [options, reset]
  );

  return {
    isLoading,
    error,
    fullText,
    generateText,
    reset,
  };
}import { useState, useCallback } from 'react';
import { groqInference } from 'wasp/client/operations';
import type { GroqInferenceInput } from '../../ai-services/groq';

interface UseGroqInferenceOptions {
  onStart?: () => void;
  onChunk?: (chunk: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

interface UseGroqInferenceReturn {
  isLoading: boolean;
  error: Error | null;
  fullText: string;
  generateText: (input: Omit<GroqInferenceInput, 'stream'>) => Promise<string>;
  reset: () => void;
}

/**
 * React hook for using Groq inference with streaming support
 * 
 * @example
 * ```tsx
 * const { generateText, isLoading, fullText } = useGroqInference({
 *   onChunk: (chunk) => console.log('New chunk:', chunk),
 *   onComplete: (text) => console.log('Complete text:', text)
 * });
 * 
 * const handleSubmit = async () => {
 *   await generateText({
 *     prompt: 'Write a short story about a robot',
 *     model: 'llama3-8b-8192',
 *     temperature: 0.7
 *   });
 * };
 * ```
 */
export function useGroqInference(options: UseGroqInferenceOptions = {}): UseGroqInferenceReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [fullText, setFullText] = useState('');

  const reset = useCallback(() => {
    setFullText('');
    setError(null);
  }, []);

  const generateText = useCallback(
    async (input: Omit<GroqInferenceInput, 'stream'>): Promise<string> => {
      try {
        reset();
        setIsLoading(true);
        
        if (options.onStart) {
          options.onStart();
        }

        // Always use streaming for low latency
        const stream = await groqInference({
          ...input,
          stream: true,
        });

        let completeText = '';

        // Process the stream
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            completeText += content;
            setFullText(prev => prev + content);
            
            if (options.onChunk) {
              options.onChunk(content);
            }
          }
        }

        if (options.onComplete) {
          options.onComplete(completeText);
        }

        return completeText;
      } catch (err: any) {
        const error = new Error(err.message || 'Failed to generate text');
        setError(error);
        
        if (options.onError) {
          options.onError(error);
        }
        
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [options, reset]
  );

  return {
    isLoading,
    error,
    fullText,
    generateText,
    reset,
  };
}import { useState, useCallback } from 'react';
import { groqInference } from 'wasp/client/operations';
import type { GroqInferenceInput } from '../../ai-services/groq';

interface UseGroqInferenceOptions {
  onStart?: () => void;
  onChunk?: (chunk: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

interface UseGroqInferenceReturn {
  isLoading: boolean;
  error: Error | null;
  fullText: string;
  generateText: (input: Omit<GroqInferenceInput, 'stream'>) => Promise<string>;
  reset: () => void;
}

/**
 * React hook for using Groq inference with streaming support
 * 
 * @example
 * ```tsx
 * const { generateText, isLoading, fullText } = useGroqInference({
 *   onChunk: (chunk) => console.log('New chunk:', chunk),
 *   onComplete: (text) => console.log('Complete text:', text)
 * });
 * 
 * const handleSubmit = async () => {
 *   await generateText({
 *     prompt: 'Write a short story about a robot',
 *     model: 'llama3-8b-8192',
 *     temperature: 0.7
 *   });
 * };
 * ```
 */
export function useGroqInference(options: UseGroqInferenceOptions = {}): UseGroqInferenceReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [fullText, setFullText] = useState('');

  const reset = useCallback(() => {
    setFullText('');
    setError(null);
  }, []);

  const generateText = useCallback(
    async (input: Omit<GroqInferenceInput, 'stream'>): Promise<string> => {
      try {
        reset();
        setIsLoading(true);
        
        if (options.onStart) {
          options.onStart();
        }

        // Always use streaming for low latency
        const stream = await groqInference({
          ...input,
          stream: true,
        });

        let completeText = '';

        // Process the stream
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            completeText += content;
            setFullText(prev => prev + content);
            
            if (options.onChunk) {
              options.onChunk(content);
            }
          }
        }

        if (options.onComplete) {
          options.onComplete(completeText);
        }

        return completeText;
      } catch (err: any) {
        const error = new Error(err.message || 'Failed to generate text');
        setError(error);
        
        if (options.onError) {
          options.onError(error);
        }
        
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [options, reset]
  );

  return {
    isLoading,
    error,
    fullText,
    generateText,
    reset,
  };
}import { useState, useCallback } from 'react';
import { groqInference } from 'wasp/client/operations';
import type { GroqInferenceInput } from '../../ai-services/groq';

interface UseGroqInferenceOptions {
  onStart?: () => void;
  onChunk?: (chunk: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

interface UseGroqInferenceReturn {
  isLoading: boolean;
  error: Error | null;
  fullText: string;
  generateText: (input: Omit<GroqInferenceInput, 'stream'>) => Promise<string>;
  reset: () => void;
}

/**
 * React hook for using Groq inference with streaming support
 * 
 * @example
 * ```tsx
 * const { generateText, isLoading, fullText } = useGroqInference({
 *   onChunk: (chunk) => console.log('New chunk:', chunk),
 *   onComplete: (text) => console.log('Complete text:', text)
 * });
 * 
 * const handleSubmit = async () => {
 *   await generateText({
 *     prompt: 'Write a short story about a robot',
 *     model: 'llama3-8b-8192',
 *     temperature: 0.7
 *   });
 * };
 * ```
 */
export function useGroqInference(options: UseGroqInferenceOptions = {}): UseGroqInferenceReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [fullText, setFullText] = useState('');

  const reset = useCallback(() => {
    setFullText('');
    setError(null);
  }, []);

  const generateText = useCallback(
    async (input: Omit<GroqInferenceInput, 'stream'>): Promise<string> => {
      try {
        reset();
        setIsLoading(true);
        
        if (options.onStart) {
          options.onStart();
        }

        // Always use streaming for low latency
        const stream = await groqInference({
          ...input,
          stream: true,
        });

        let completeText = '';

        // Process the stream
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            completeText += content;
            setFullText(prev => prev + content);
            
            if (options.onChunk) {
              options.onChunk(content);
            }
          }
        }

        if (options.onComplete) {
          options.onComplete(completeText);
        }

        return completeText;
      } catch (err: any) {
        const error = new Error(err.message || 'Failed to generate text');
        setError(error);
        
        if (options.onError) {
          options.onError(error);
        }
        
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [options, reset]
  );

  return {
    isLoading,
    error,
    fullText,
    generateText,
    reset,
  };
}import { useState, useCallback } from 'react';
import { groqInference } from 'wasp/client/operations';
import type { GroqInferenceInput } from '../../ai-services/groq';

interface UseGroqInferenceOptions {
  onStart?: () => void;
  onChunk?: (chunk: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

interface UseGroqInferenceReturn {
  isLoading: boolean;
  error: Error | null;
  fullText: string;
  generateText: (input: Omit<GroqInferenceInput, 'stream'>) => Promise<string>;
  reset: () => void;
}

/**
 * React hook for using Groq inference with streaming support
 * 
 * @example
 * ```tsx
 * const { generateText, isLoading, fullText } = useGroqInference({
 *   onChunk: (chunk) => console.log('New chunk:', chunk),
 *   onComplete: (text) => console.log('Complete text:', text)
 * });
 * 
 * const handleSubmit = async () => {
 *   await generateText({
 *     prompt: 'Write a short story about a robot',
 *     model: 'llama3-8b-8192',
 *     temperature: 0.7
 *   });
 * };
 * ```
 */
export function useGroqInference(options: UseGroqInferenceOptions = {}): UseGroqInferenceReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [fullText, setFullText] = useState('');

  const reset = useCallback(() => {
    setFullText('');
    setError(null);
  }, []);

  const generateText = useCallback(
    async (input: Omit<GroqInferenceInput, 'stream'>): Promise<string> => {
      try {
        reset();
        setIsLoading(true);
        
        if (options.onStart) {
          options.onStart();
        }

        // Always use streaming for low latency
        const stream = await groqInference({
          ...input,
          stream: true,
        });

        let completeText = '';

        // Process the stream
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            completeText += content;
            setFullText(prev => prev + content);
            
            if (options.onChunk) {
              options.onChunk(content);
            }
          }
        }

        if (options.onComplete) {
          options.onComplete(completeText);
        }

        return completeText;
      } catch (err: any) {
        const error = new Error(err.message || 'Failed to generate text');
        setError(error);
        
        if (options.onError) {
          options.onError(error);
        }
        
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [options, reset]
  );

  return {
    isLoading,
    error,
    fullText,
    generateText,
    reset,
  };
}import { useState, useCallback } from 'react';
import { groqInference } from 'wasp/client/operations';
import type { GroqInferenceInput } from '../../ai-services/groq';

interface UseGroqInferenceOptions {
  onStart?: () => void;
  onChunk?: (chunk: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

interface UseGroqInferenceReturn {
  isLoading: boolean;
  error: Error | null;
  fullText: string;
  generateText: (input: Omit<GroqInferenceInput, 'stream'>) => Promise<string>;
  reset: () => void;
}

/**
 * React hook for using Groq inference with streaming support
 * 
 * @example
 * ```tsx
 * const { generateText, isLoading, fullText } = useGroqInference({
 *   onChunk: (chunk) => console.log('New chunk:', chunk),
 *   onComplete: (text) => console.log('Complete text:', text)
 * });
 * 
 * const handleSubmit = async () => {
 *   await generateText({
 *     prompt: 'Write a short story about a robot',
 *     model: 'llama3-8b-8192',
 *     temperature: 0.7
 *   });
 * };
 * ```
 */
export function useGroqInference(options: UseGroqInferenceOptions = {}): UseGroqInferenceReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [fullText, setFullText] = useState('');

  const reset = useCallback(() => {
    setFullText('');
    setError(null);
  }, []);

  const generateText = useCallback(
    async (input: Omit<GroqInferenceInput, 'stream'>): Promise<string> => {
      try {
        reset();
        setIsLoading(true);
        
        if (options.onStart) {
          options.onStart();
        }

        // Always use streaming for low latency
        const stream = await groqInference({
          ...input,
          stream: true,
        });

        let completeText = '';

        // Process the stream
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            completeText += content;
            setFullText(prev => prev + content);
            
            if (options.onChunk) {
              options.onChunk(content);
            }
          }
        }

        if (options.onComplete) {
          options.onComplete(completeText);
        }

        return completeText;
      } catch (err: any) {
        const error = new Error(err.message || 'Failed to generate text');
        setError(error);
        
        if (options.onError) {
          options.onError(error);
        }
        
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [options, reset]
  );

  return {
    isLoading,
    error,
    fullText,
    generateText,
    reset,
  };
}import { useState, useCallback } from 'react';
import { groqInference } from 'wasp/client/operations';
import type { GroqInferenceInput } from '../../ai-services/groq';

interface UseGroqInferenceOptions {
  onStart?: () => void;
  onChunk?: (chunk: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

interface UseGroqInferenceReturn {
  isLoading: boolean;
  error: Error | null;
  fullText: string;
  generateText: (input: Omit<GroqInferenceInput, 'stream'>) => Promise<string>;
  reset: () => void;
}

/**
 * React hook for using Groq inference with streaming support
 * 
 * @example
 * ```tsx
 * const { generateText, isLoading, fullText } = useGroqInference({
 *   onChunk: (chunk) => console.log('New chunk:', chunk),
 *   onComplete: (text) => console.log('Complete text:', text)
 * });
 * 
 * const handleSubmit = async () => {
 *   await generateText({
 *     prompt: 'Write a short story about a robot',
 *     model: 'llama3-8b-8192',
 *     temperature: 0.7
 *   });
 * };
 * ```
 */
export function useGroqInference(options: UseGroqInferenceOptions = {}): UseGroqInferenceReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [fullText, setFullText] = useState('');

  const reset = useCallback(() => {
    setFullText('');
    setError(null);
  }, []);

  const generateText = useCallback(
    async (input: Omit<GroqInferenceInput, 'stream'>): Promise<string> => {
      try {
        reset();
        setIsLoading(true);
        
        if (options.onStart) {
          options.onStart();
        }

        // Always use streaming for low latency
        const stream = await groqInference({
          ...input,
          stream: true,
        });

        let completeText = '';

        // Process the stream
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            completeText += content;
            setFullText(prev => prev + content);
            
            if (options.onChunk) {
              options.onChunk(content);
            }
          }
        }

        if (options.onComplete) {
          options.onComplete(completeText);
        }

        return completeText;
      } catch (err: any) {
        const error = new Error(err.message || 'Failed to generate text');
        setError(error);
        
        if (options.onError) {
          options.onError(error);
        }
        
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [options, reset]
  );

  return {
    isLoading,
    error,
    fullText,
    generateText,
    reset,
  };
}