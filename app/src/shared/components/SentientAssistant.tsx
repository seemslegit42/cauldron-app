import React, { useState, useEffect, useRef } from 'react';
import { useUser } from 'wasp/client/auth';
import { sentientLoop } from '../services/sentientLoopService';
import { SENTIENT_LOOP_CONFIG } from '../config/ai-config';
import { useCauldronChat, Message } from '../ai/vercel-ai-utils';

interface SentientAssistantProps {
  module: 'arcana' | 'athena' | 'forgeflow' | 'phantom' | 'manifold' | 'sentinel' | 'cauldronPrime';
  initialPrompt?: string;
  minimized: boolean;
  onMinimize: () => void;
  onMaximize: () => void;
}

export const SentientAssistant: React.FC<SentientAssistantProps> = ({
  module,
  initialPrompt,
  minimized,
  onMinimize,
  onMaximize,
}) => {
  const user = useUser();
  const [latency, setLatency] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const startTimeRef = useRef<number>(0);

  // Get system prompt for this module
  const getSystemPrompt = () => {
    const currentTime = new Date().toLocaleString();
    const basePrompt =
      SENTIENT_LOOP_CONFIG.systemPrompts[module] ||
      "You are a helpful assistant for BitBrew's Cauldron platform.";

    return (
      basePrompt.replace('{current_time}', currentTime) +
      `\nCurrent user: ${user?.username || 'User'}`
    );
  };

  // Initialize with system message
  const initialMessages: Message[] = [
    {
      id: crypto.randomUUID(),
      role: 'system',
      content: getSystemPrompt(),
    },
  ];

  // Use the Vercel AI SDK chat hook
  const { messages, input, setInput, isLoading, sendMessage, appendMessage, reset, stop, error } =
    useCauldronChat({
      api: '/api/ai/chat',
      initialMessages,
      module,
      onFinish: (message) => {
        // Track latency
        if (startTimeRef.current > 0) {
          setLatency(Math.round(performance.now() - startTimeRef.current));
          startTimeRef.current = 0;
        }

        // Add to Sentient Loop context
        sentientLoop.addMemory({
          type: 'conversation',
          module,
          content: message.content,
          metadata: {
            role: 'assistant',
            timestamp: new Date().toISOString(),
          },
        });
      },
    });

  // Process initial prompt if provided
  useEffect(() => {
    if (initialPrompt && messages.length === 1) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when maximized
  useEffect(() => {
    if (!minimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [minimized]);

  // Handle sending a message
  const handleSendMessage = async (messageText?: string) => {
    const messageToSend = messageText || input;
    if (!messageToSend.trim() || isLoading) return;

    // Track start time for latency calculation
    startTimeRef.current = performance.now();

    // Add the user's query to the Sentient Loop context
    sentientLoop.addUserActivity(module, `query: ${messageToSend}`);

    // Send message using Vercel AI SDK
    await sendMessage(messageToSend);
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Get suggested prompts based on the module
  const getSuggestedPrompts = (): string[] => {
    switch (module) {
      case 'arcana':
        return [
          'What should I focus on today?',
          'What are my key metrics?',
          'What decisions need my attention?',
        ];
      case 'phantom':
        return [
          'Run a security scan',
          'Analyze recent security incidents',
          'Check for vulnerabilities in our system',
        ];
      case 'manifold':
        return [
          'Generate content ideas for my next podcast',
          'Analyze my audience engagement',
          'Suggest improvements for my content strategy',
        ];
      case 'forgeflow':
        return [
          'Optimize my current workflow',
          'Create a new agent workflow',
          'Analyze workflow performance',
        ];
      case 'sentinel':
        return [
          'Check for security threats',
          'Run a compliance check',
          'Generate a security report',
        ];
      case 'athena':
        return [
          'Analyze business performance',
          'Generate revenue forecast',
          'Identify growth opportunities',
        ];
      case 'cauldronPrime':
        return [
          'What should I focus on today?',
          'Why is revenue trending down?',
          'What are my biggest opportunities?',
        ];
      default:
        return [
          'How can I help you today?',
          'What would you like to know?',
          'What can I assist you with?',
        ];
    }
  };

  // If minimized, show only the header
  if (minimized) {
    return (
      <div className="overflow-hidden rounded-lg bg-gray-800 shadow-lg">
        <div
          className="flex cursor-pointer items-center justify-between bg-gray-700 p-3"
          onClick={onMaximize}
        >
          <div className="flex items-center">
            <div className="mr-2 h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
            <h3 className="text-sm font-medium text-white">
              {module.charAt(0).toUpperCase() + module.slice(1)} Assistant
              {latency !== null && <span className="ml-2 text-xs text-green-400">{latency}ms</span>}
            </h3>
          </div>
          <button
            className="text-gray-400 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              onMaximize();
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-96 flex-col overflow-hidden rounded-lg bg-gray-800 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-700 p-3">
        <div className="flex items-center">
          <div
            className={`h-2 w-2 rounded-full ${isGroqAvailable ? 'bg-green-400' : 'bg-yellow-400'} mr-2 ${isThinking ? 'animate-pulse' : ''}`}
          ></div>
          <h3 className="text-sm font-medium text-white">
            {module.charAt(0).toUpperCase() + module.slice(1)} Assistant
            {latency !== null && <span className="ml-2 text-xs text-green-400">{latency}ms</span>}
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="text-gray-400 hover:text-white"
            title={streamingEnabled ? 'Disable streaming' : 'Enable streaming'}
            onClick={toggleStreaming}
          >
            {streamingEnabled ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            )}
          </button>
          <button
            className="text-gray-400 hover:text-white"
            title="Clear conversation"
            onClick={() => {
              const systemMessage = messages.find((msg) => msg.role === 'system');
              if (systemMessage) {
                setMessages([systemMessage]);
              } else {
                setMessages([
                  {
                    id: generateId(),
                    role: 'system',
                    content: getSystemPrompt(),
                    timestamp: new Date(),
                  },
                ]);
              }
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
          <button className="text-gray-400 hover:text-white" onClick={onMinimize}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.filter((msg) => msg.role !== 'system').length > 0 ? (
          messages
            .filter((msg) => msg.role !== 'system')
            .map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-bold text-white">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-3/4 rounded-lg px-4 py-2 ${
                    message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'
                  } ${message.isStreaming ? 'border-l-4 border-green-500' : ''}`}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                    {message.isStreaming && (
                      <span className="ml-1 inline-block animate-pulse">▌</span>
                    )}
                  </p>
                  <div className="mt-1 text-xs text-gray-500">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                {message.role === 'user' && (
                  <div className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-gray-600 text-xs font-bold text-white">
                    You
                  </div>
                )}
              </div>
            ))
        ) : (
          <div className="flex h-full flex-col items-center justify-center py-8 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mb-3 h-12 w-12 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <p className="text-center">Type a message or select a suggestion to get started</p>
            <div className="mt-4 grid w-full max-w-xs grid-cols-1 gap-2">
              {getSuggestedPrompts()
                .slice(0, 3)
                .map((prompt, index) => (
                  <button
                    key={index}
                    className="rounded bg-gray-700 px-3 py-2 text-left text-sm text-gray-300 transition-colors hover:bg-gray-600"
                    onClick={() => {
                      setInput(prompt);
                      setTimeout(() => {
                        handleSendMessage();
                      }, 100);
                    }}
                  >
                    {prompt}
                  </button>
                ))}
            </div>
          </div>
        )}

        {isThinking && !messages.some((m) => m.isStreaming) && (
          <div className="flex justify-start">
            <div className="rounded-lg bg-gray-700 px-4 py-2 text-gray-200">
              <div className="flex space-x-1">
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                <div
                  className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                  style={{ animationDelay: '0.2s' }}
                ></div>
                <div
                  className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                  style={{ animationDelay: '0.4s' }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-700 p-3">
        <div className="flex items-center">
          <textarea
            ref={inputRef}
            className="flex-1 resize-none rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Type a message..."
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading || isThinking}
          />
          <button
            className={`ml-2 ${
              isLoading || isThinking
                ? 'cursor-not-allowed bg-gray-600'
                : 'bg-blue-600 hover:bg-blue-700'
            } rounded-full p-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50`}
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading || isThinking}
          >
            {isLoading || isThinking ? (
              <div className="h-5 w-5 animate-spin rounded-full border-t-2 border-white"></div>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Suggested prompts */}
        <div className="mt-2 flex flex-wrap gap-2">
          {getSuggestedPrompts()
            .slice(0, 3)
            .map((prompt, index) => (
              <button
                key={index}
                className="rounded-full bg-gray-700 px-3 py-1 text-xs text-gray-300 transition-colors hover:bg-gray-600"
                onClick={() => {
                  setInput(prompt);
                  setTimeout(() => {
                    handleSendMessage();
                  }, 100);
                }}
                disabled={isLoading || isThinking}
              >
                {prompt}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};
