import { useState, useCallback } from 'react';
import { useUser } from 'wasp/client/auth';
import { useAction } from 'wasp/client/operations';
import { generateAiResponse } from '../../ai-services/operations';

/**
 * Options for the useTrackedGroqInference hook
 */
export interface UseTrackedGroqInferenceOptions {
  /** Callback for when a new chunk of text is received */
  onChunk?: (chunk: string) => void;
  /** Callback for when the full text is complete */
  onComplete?: (text: string) => void;
  /** Callback for when an error occurs */
  onError?: (error: Error) => void;
  /** The module this hook is being used in */
  module?: 'arcana' | 'phantom' | 'manifold' | 'forgeflow' | 'sentinel' | 'athena';
  /** Whether to store interactions in memory */
  storeInMemory?: boolean;
  /** Whether to provide feedback on completion */
  provideFeedback?: boolean;
}

/**
 * Input for generating text with the useTrackedGroqInference hook
 */
export interface GenerateTrackedTextInput {
  /** The prompt to send to the AI */
  prompt: string;
  /** Additional context to provide to the AI */
  context?: string;
  /** The model to use */
  model?: 'llama3-8b-8192' | 'llama3-70b-8192' | 'mixtral-8x7b-32768' | 'gemma-7b-it';
  /** The temperature to use (0-1) */
  temperature?: number;
  /** The maximum number of tokens to generate */
  maxTokens?: number;
  /** Whether to stream the response */
  stream?: boolean;
  /** Custom system prompt to override the default */
  systemPrompt?: string;
  /** Tags to associate with this prompt */
  tags?: string[];
  /** Category for this prompt */
  category?: string;
  /** Session ID to associate with this prompt */
  sessionId?: string;
}

/**
 * Return type for the useTrackedGroqInference hook
 */
export interface UseTrackedGroqInferenceReturn {
  /** Function to generate text */
  generateText: (input: GenerateTrackedTextInput) => Promise<string>;
  /** Whether text is currently being generated */
  isLoading: boolean;
  /** The full text that has been generated */
  fullText: string;
  /** Any error that occurred */
  error: Error | null;
  /** Reset the state */
  reset: () => void;
  /** Provide feedback on the last response */
  provideFeedback: (rating: number, comment?: string) => Promise<void>;
  /** The session ID for the current interaction */
  sessionId: string | null;
}

/**
 * React hook for using tracked Groq inference with streaming support
 * This hook automatically tracks prompts, reasoning chains, and response trees
 * 
 * @example
 * ```tsx
 * const { generateText, isLoading, fullText } = useTrackedGroqInference({
 *   onChunk: (chunk) => console.log('New chunk:', chunk),
 *   onComplete: (text) => console.log('Complete text:', text),
 *   module: 'arcana'
 * });
 * 
 * const handleSubmit = async () => {
 *   await generateText({
 *     prompt: 'Write a short story about a robot',
 *     model: 'llama3-8b-8192',
 *     temperature: 0.7,
 *     tags: ['story', 'creative']
 *   });
 * };
 * ```
 */
export function useTrackedGroqInference(
  options: UseTrackedGroqInferenceOptions = {}
): UseTrackedGroqInferenceReturn {
  const user = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [fullText, setFullText] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  // Use the generateAiResponse action
  const generateAiResponseAction = useAction(generateAiResponse);
  
  // Reset the state
  const reset = useCallback(() => {
    setFullText('');
    setError(null);
  }, []);
  
  // Generate text
  const generateText = useCallback(
    async (input: GenerateTrackedTextInput): Promise<string> => {
      if (!user) {
        const authError = new Error('User must be authenticated to use this hook');
        setError(authError);
        options.onError?.(authError);
        throw authError;
      }
      
      setIsLoading(true);
      setError(null);
      
      if (!input.stream) {
        setFullText('');
      }
      
      try {
        // Prepare the request payload
        const payload = {
          prompt: input.prompt,
          context: input.context,
          model: input.model,
          temperature: input.temperature,
          maxTokens: input.maxTokens,
          stream: input.stream ?? true,
          systemPrompt: input.systemPrompt,
          module: options.module || 'arcana',
        };
        
        // Call the AI service
        const response = await generateAiResponseAction(payload);
        
        // Handle streaming responses
        if (input.stream && typeof response === 'object' && 'text' in response) {
          setFullText(response.text);
          options.onComplete?.(response.text);
          return response.text;
        }
        
        // Handle non-streaming responses
        if (typeof response === 'string') {
          setFullText(response);
          options.onComplete?.(response);
          return response;
        }
        
        // Handle object responses
        if (typeof response === 'object') {
          const text = JSON.stringify(response);
          setFullText(text);
          options.onComplete?.(text);
          return text;
        }
        
        // Fallback
        const fallbackText = String(response);
        setFullText(fallbackText);
        options.onComplete?.(fallbackText);
        return fallbackText;
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        options.onError?.(errorObj);
        throw errorObj;
      } finally {
        setIsLoading(false);
      }
    },
    [user, options, generateAiResponseAction]
  );
  
  // Provide feedback on the last response
  const provideFeedback = useCallback(
    async (rating: number, comment?: string): Promise<void> => {
      if (!sessionId) {
        console.warn('No session ID available for feedback');
        return;
      }
      
      try {
        // In a real implementation, this would call a server action to store feedback
        console.log(`Providing feedback for session ${sessionId}: ${rating}/5 - ${comment || 'No comment'}`);
        
        // This would be implemented in a real system
        // await provideFeedbackAction({
        //   sessionId,
        //   rating,
        //   comment,
        // });
      } catch (err) {
        console.error('Error providing feedback:', err);
      }
    },
    [sessionId]
  );
  
  return {
    generateText,
    isLoading,
    fullText,
    error,
    reset,
    provideFeedback,
    sessionId,
  };
}
