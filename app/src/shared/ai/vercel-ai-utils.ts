/**
 * Vercel AI SDK Utilities
 *
 * This file provides utilities and hooks for working with the Vercel AI SDK.
 * It includes wrappers around the core Vercel AI SDK functionality to make it
 * easier to use in the Cauldron application.
 */

import { useState, useCallback, useRef } from 'react';
import { useChat, useCompletion, Message as VercelMessage } from 'ai';

/**
 * Message interface compatible with Vercel AI SDK
 */
export interface Message {
  id?: string;
  role: 'user' | 'assistant' | 'system' | 'function';
  content: string;
  name?: string;
  function_call?: {
    name: string;
    arguments: string;
  };
}

/**
 * Function definition for AI function calling
 */
export interface AIFunction {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

/**
 * Options for the useCauldronChat hook
 */
export interface UseCauldronChatOptions {
  /** API endpoint for chat completions */
  api?: string;
  /** Initial messages to populate the chat */
  initialMessages?: Message[];
  /** Functions that can be called by the AI */
  functions?: AIFunction[];
  /** Module this chat is being used in */
  module?: string;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
  /** Callback when a response completes */
  onFinish?: (message: Message) => void;
  /** Callback when a function is called */
  onFunctionCall?: (functionCall: { name: string; arguments: any }) => Promise<string | void>;
}

/**
 * Return type for the useCauldronChat hook
 */
export interface UseCauldronChatReturn {
  /** All messages in the conversation */
  messages: Message[];
  /** The current input value */
  input: string;
  /** Set the input value */
  setInput: (input: string) => void;
  /** Whether a response is currently being generated */
  isLoading: boolean;
  /** Send a message and get a streaming response */
  sendMessage: (message: string) => Promise<void>;
  /** Append a user message without generating a response */
  appendMessage: (message: Message) => void;
  /** Reset the conversation */
  reset: () => void;
  /** Stop the response generation */
  stop: () => void;
  /** Error if one occurred */
  error: Error | undefined;
}

/**
 * A hook for chat interactions using the Vercel AI SDK
 *
 * @example
 * ```tsx
 * const { messages, input, setInput, sendMessage, isLoading } = useCauldronChat({
 *   api: '/api/chat',
 *   module: 'arcana',
 *   onFinish: (message) => console.log('Chat completed:', message),
 * });
 *
 * return (
 *   <div>
 *     <div className="messages">
 *       {messages.map((m) => (
 *         <div key={m.id}>{m.content}</div>
 *       ))}
 *     </div>
 *     <input value={input} onChange={(e) => setInput(e.target.value)} />
 *     <button onClick={() => sendMessage(input)} disabled={isLoading}>
 *       Send
 *     </button>
 *   </div>
 * );
 * ```
 */
export function useCauldronChat({
  api = '/api/chat',
  initialMessages = [],
  functions,
  module = 'arcana',
  onError,
  onFinish,
  onFunctionCall,
}: UseCauldronChatOptions = {}): UseCauldronChatReturn {
  // Convert our Message type to Vercel's Message type
  const initialVercelMessages: VercelMessage[] = initialMessages.map((m) => ({
    id: m.id || crypto.randomUUID(),
    role: m.role as any,
    content: m.content,
    name: m.name,
    function_call: m.function_call,
  }));

  // Use the Vercel AI SDK's useChat hook
  const {
    messages: vercelMessages,
    input,
    setInput,
    handleSubmit,
    handleInputChange,
    isLoading,
    append,
    reload,
    stop,
    error,
  } = useChat({
    api,
    initialMessages: initialVercelMessages,
    body: { module },
    onError,
    onFinish: (message) => {
      if (onFinish) {
        onFinish({
          id: message.id,
          role: message.role as any,
          content: message.content,
          name: message.name,
          function_call: message.function_call,
        });
      }
    },
    onResponse: (response) => {
      // You can add custom response handling here
      console.log('Response received:', response.status);
    },
    experimental_onFunctionCall: onFunctionCall
      ? {
          experimental_onFunctionCall: onFunctionCall,
        }
      : undefined,
  });

  // Convert Vercel messages back to our Message type
  const messages: Message[] = vercelMessages.map((m) => ({
    id: m.id,
    role: m.role as any,
    content: m.content,
    name: m.name,
    function_call: m.function_call,
  }));

  // Wrapper for sending a message
  const sendMessage = useCallback(
    async (message: string) => {
      const formEvent = new Event('submit') as any;
      formEvent.preventDefault = () => {};

      setInput(message);
      await handleSubmit(formEvent);
    },
    [handleSubmit, setInput]
  );

  // Wrapper for appending a message without generating a response
  const appendMessage = useCallback(
    (message: Message) => {
      append({
        id: message.id || crypto.randomUUID(),
        role: message.role as any,
        content: message.content,
        name: message.name,
        function_call: message.function_call,
      });
    },
    [append]
  );

  // Wrapper for resetting the conversation
  const reset = useCallback(() => {
    reload();
  }, [reload]);

  return {
    messages,
    input,
    setInput,
    isLoading,
    sendMessage,
    appendMessage,
    reset,
    stop,
    error,
  };
}

/**
 * Options for the useCauldronCompletion hook
 */
export interface UseCauldronCompletionOptions {
  /** API endpoint for completions */
  api?: string;
  /** Initial completion to display */
  initialCompletion?: string;
  /** Module this completion is being used in */
  module?: string;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
  /** Callback when a completion finishes */
  onFinish?: (completion: string) => void;
}

/**
 * Return type for the useCauldronCompletion hook
 */
export interface UseCauldronCompletionReturn {
  /** The completion text */
  completion: string;
  /** Whether a completion is currently being generated */
  isLoading: boolean;
  /** Complete a prompt and get a streaming response */
  complete: (prompt: string) => Promise<string>;
  /** Stop the completion generation */
  stop: () => void;
  /** Error if one occurred */
  error: Error | undefined;
}

/**
 * A hook for text completions using the Vercel AI SDK
 *
 * @example
 * ```tsx
 * const { completion, complete, isLoading } = useCauldronCompletion({
 *   api: '/api/completion',
 *   module: 'arcana',
 *   onFinish: (text) => console.log('Completion finished:', text),
 * });
 *
 * return (
 *   <div>
 *     <button
 *       onClick={() => complete('Write a short story about a robot')}
 *       disabled={isLoading}
 *     >
 *       Generate Story
 *     </button>
 *     <div>{completion}</div>
 *   </div>
 * );
 * ```
 */
export function useCauldronCompletion({
  api = '/api/completion',
  initialCompletion = '',
  module = 'arcana',
  onError,
  onFinish,
}: UseCauldronCompletionOptions = {}): UseCauldronCompletionReturn {
  // Use the Vercel AI SDK's useCompletion hook
  const {
    completion,
    complete: vercelComplete,
    isLoading,
    stop,
    error,
  } = useCompletion({
    api,
    initialCompletion,
    body: { module },
    onError,
    onFinish,
  });

  // Wrapper for completing a prompt
  const complete = useCallback(
    async (prompt: string) => {
      return vercelComplete(prompt);
    },
    [vercelComplete]
  );

  return {
    completion,
    isLoading,
    complete,
    stop,
    error,
  };
}

/**
 * Utility function to simulate streaming for development
 * This is useful for testing UI components without making actual API calls
 */
export function simulateStreaming(
  text: string,
  onChunk: (chunk: string) => void,
  onFinish: () => void,
  speed = 10 // ms per character
): () => void {
  let index = 0;
  const chunks = text.split(' ');

  const interval = setInterval(() => {
    if (index < chunks.length) {
      onChunk(chunks[index] + ' ');
      index++;
    } else {
      clearInterval(interval);
      onFinish();
    }
  }, speed);

  // Return a function to cancel the streaming
  return () => clearInterval(interval);
}
