import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';
import { sentientCheckpoints } from '../../services/sentientLoopService';
import { AgentFeedbackButton } from '../feedback/AgentFeedbackButton';
import { useAgentFeedback } from '../../hooks/useAgentFeedback';
import { useCauldronChat, Message, AIFunction } from '../../ai/vercel-ai-utils';

export interface AgentChatWithFeedbackProps {
  agentId: string;
  agentName: string;
  module: string;
  systemPrompt?: string;
  initialMessages?: Message[];
  minimized?: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
  className?: string;
  showTypingIndicator?: boolean;
  showLatency?: boolean;
  showFeedbackButton?: boolean;
  functions?: AIFunction[];
  onFunctionCall?: (functionCall: { name: string; arguments: any }) => Promise<string | void>;
}

/**
 * AgentChatWithFeedback component for AI agent interactions with feedback capability
 */
export const AgentChatWithFeedback: React.FC<AgentChatWithFeedbackProps> = ({
  agentId,
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
  showFeedbackButton = true,
  functions,
  onFunctionCall,
}) => {
  const [isTyping, setIsTyping] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string>(`session-${Date.now()}`);
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

  const {
    submitRating,
    submitEscalationRequest,
    isSubmitting: isSubmittingFeedback,
    error: feedbackError,
    success: feedbackSuccess,
    clearMessages: clearFeedbackMessages
  } = useAgentFeedback({
    agentId,
    sessionId,
    category: module,
    onFeedbackSubmitted: (rating, feedback) => {
      console.log(`Feedback submitted: ${rating}/5 - ${feedback || 'No comment'}`);
    },
    onEscalationSubmitted: (reason, priority) => {
      console.log(`Escalation submitted: ${priority} - ${reason}`);
    }
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (input.trim() === '' || isLoading) return;

    setIsTyping(true);
    startTimeRef.current = performance.now();
    
    try {
      // Apply Sentient Loop™ checkpoint for message validation
      await sentientCheckpoints.validateUserMessage({
        message: input,
        agentId,
        module,
      });

      // Send message using Vercel AI SDK
      await sendMessage(input);
    } catch (error) {
      console.error('Error in agent chat with feedback:', error);
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
      <div className={cn('fixed bottom-4 right-4 z-50', className)}>
        <Button
          onClick={onMaximize}
          className="rounded-full p-4 shadow-lg flex items-center justify-center"
        >
          <span className="sr-only">Open Chat</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex h-[600px] w-full max-w-md flex-col rounded-lg border bg-background shadow-xl',
        className
      )}
    >
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-primary"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold">{agentName}</h3>
            <p className="text-xs text-muted-foreground">{module}</p>
          </div>
        </div>
        <div className="flex gap-1">
          {onMinimize && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMinimize}
              className="h-8 w-8"
              aria-label="Minimize"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M18 12H6" />
              </svg>
            </Button>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.filter(m => m.role !== 'system').map((message) => (
          <div
            key={message.id}
            className={cn('mb-4 flex', {
              'justify-end': message.role === 'user',
            })}
          >
            <div
              className={cn('max-w-[80%] rounded-lg px-4 py-2', {
                'bg-primary text-primary-foreground': message.role === 'user',
                'bg-muted': message.role === 'assistant',
              })}
            >
              <div className="prose prose-sm dark:prose-invert">
                {message.content}
                {isTyping && message === messages[messages.length - 1] && message.role === 'assistant' && (
                  <span className="ml-1 inline-block h-4 w-2 animate-blink bg-current"></span>
                )}
              </div>
              <div
                className={cn('mt-1 text-xs', {
                  'text-primary-foreground/70': message.role === 'user',
                  'text-muted-foreground': message.role === 'assistant',
                })}
              >
                {new Date().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        ))}
        {isTyping && showTypingIndicator && !messages.some(m => m.role === 'assistant') && (
          <div className="mb-4 flex">
            <div className="max-w-[80%] rounded-lg bg-muted px-4 py-2">
              <div className="flex space-x-1">
                <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground animation-delay-200"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground animation-delay-400"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="border-t p-4">
        {showLatency && latency > 0 && (
          <div className="mb-2 text-xs text-muted-foreground">
            Response time: {latency.toFixed(2)}ms
          </div>
        )}
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            className="flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Type your message..."
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || input.trim() === ''}
            className="shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </div>

      {/* Feedback Button */}
      {showFeedbackButton && messages.filter(m => m.role === 'assistant').length > 0 && (
        <AgentFeedbackButton
          agentId={agentId}
          sessionId={sessionId}
          category={module}
          position="bottom-right"
        />
      )}
    </div>
  );
};
