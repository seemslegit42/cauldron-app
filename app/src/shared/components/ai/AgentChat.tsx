import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';
import { sentientCheckpoints } from '../../services/sentientLoopService';
import { useCauldronChat, Message, AIFunction } from '../../ai/vercel-ai-utils';

export interface AgentChatProps {
  /** The name of the agent */
  agentName: string;
  /** The module this agent belongs to */
  module: string;
  /** Initial system prompt for the agent */
  systemPrompt?: string;
  /** Initial messages to populate the chat */
  initialMessages?: Message[];
  /** Whether the chat is minimized */
  minimized?: boolean;
  /** Callback when the chat is minimized */
  onMinimize?: () => void;
  /** Callback when the chat is maximized */
  onMaximize?: () => void;
  /** Additional class name */
  className?: string;
  /** Whether to show the agent's typing indicator */
  showTypingIndicator?: boolean;
  /** Whether to show the latency of responses */
  showLatency?: boolean;
  /** Functions that can be called by the AI */
  functions?: AIFunction[];
  /** Callback when a function is called */
  onFunctionCall?: (functionCall: { name: string; arguments: any }) => Promise<string | void>;
}

/**
 * AgentChat component for AI agent interactions
 */
export const AgentChat: React.FC<AgentChatProps> = ({
  agentName,
  module,
  systemPrompt = '',
  initialMessages = [],
  minimized = false,
  onMinimize,
  onMaximize,
  className,
  showTypingIndicator = true,
  showLatency = true,
  functions,
  onFunctionCall,
}) => {
  const [isTyping, setIsTyping] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const startTimeRef = useRef<number>(0);
  
  // Initialize with system message if not already provided
  const systemMessage: Message = {
    id: crypto.randomUUID(),
    role: 'system',
    content: systemPrompt || `You are ${agentName}, an AI assistant for the ${module} module.`,
  };
  
  const initialMessagesWithSystem = [
    ...initialMessages.filter(msg => msg.role !== 'system'),
  ];
  
  if (!initialMessages.some(msg => msg.role === 'system')) {
    initialMessagesWithSystem.unshift(systemMessage);
  }
  
  // Use the Vercel AI SDK chat hook
  const {
    messages,
    input,
    setInput,
    isLoading,
    sendMessage,
    error,
    stop
  } = useCauldronChat({
    api: '/api/ai/chat',
    initialMessages: initialMessagesWithSystem,
    module,
    functions,
    onFinish: (message) => {
      // Track latency
      if (startTimeRef.current > 0) {
        setLatency(Math.round(performance.now() - startTimeRef.current));
        startTimeRef.current = 0;
      }
      setIsTyping(false);
    },
    onFunctionCall: onFunctionCall,
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when component mounts
  useEffect(() => {
    if (!minimized) {
      inputRef.current?.focus();
    }
  }, [minimized]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    setIsTyping(true);
    startTimeRef.current = performance.now();
    
    try {
      // Apply Sentient Loop™ checkpoint for message validation
      const validationResult = await sentientCheckpoints.validateUserMessage({
        message: input,
        module,
        agentName,
      });
      
      if (!validationResult.isValid) {
        // Handle invalid message
        setIsTyping(false);
        return;
      }
      
      // Send message using Vercel AI SDK
      await sendMessage(input);
    } catch (error) {
      console.error('Error in agent chat:', error);
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (minimized) {
    return (
      <div 
        className={cn(
          'fixed bottom-4 right-4 bg-primary text-white p-3 rounded-full shadow-lg cursor-pointer',
          className
        )}
        onClick={onMaximize}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        'flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden',
        'border border-gray-200 dark:border-gray-700',
        'h-[500px] w-[400px]',
        className
      )}
    >
      {/* Header */}
      <div className="bg-gray-100 dark:bg-gray-700 p-3 flex justify-between items-center border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center">
          <div className={`h-2 w-2 rounded-full bg-green-400 mr-2 ${isTyping ? 'animate-pulse' : ''}`}></div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            {agentName}
            {showLatency && latency !== null && (
              <span className="ml-2 text-xs text-green-500 dark:text-green-400">{latency}ms</span>
            )}
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => stop()}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            title="Stop generating"
            disabled={!isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={onMinimize}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            title="Minimize"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.filter(msg => msg.role !== 'system').map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                'max-w-[80%] rounded-lg px-4 py-2',
                message.role === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
              )}
            >
              <div className="whitespace-pre-wrap break-words">
                {message.content}
                {isTyping && message === messages[messages.length - 1] && message.role === 'assistant' && (
                  <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse"></span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-3">
        <div className="flex items-end space-x-2">
          <textarea
            ref={inputRef}
            className="flex-1 min-h-[40px] max-h-[120px] p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isLoading}
          />
          <Button
            variant="primary"
            size="sm"
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
};
