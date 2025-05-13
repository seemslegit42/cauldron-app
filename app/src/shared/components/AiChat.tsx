import React, { useState, useEffect, useRef } from 'react';
import { useCauldronChat, Message } from '../ai/vercel-ai-utils';
import { sentientLoop } from '../services/sentientLoopService';

interface AiChatProps {
  systemPrompt: string;
  initialMessages?: Message[];
  onResponse?: (response: string) => void;
  className?: string;
  placeholder?: string;
  sendButtonLabel?: string;
  maxHeight?: string;
  module?: string;
}

export const AiChat: React.FC<AiChatProps> = ({
  systemPrompt,
  initialMessages = [],
  onResponse,
  className = '',
  placeholder = 'Type a message...',
  sendButtonLabel = 'Send',
  maxHeight = '400px',
  module = 'arcana',
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(0);
  const [isTyping, setIsTyping] = useState(false);
  
  // Initialize with system message
  const systemMessage: Message = {
    id: crypto.randomUUID(),
    role: 'system',
    content: systemPrompt,
  };
  
  const initialMessagesWithSystem = [
    systemMessage,
    ...initialMessages.map(msg => ({
      ...msg,
      id: msg.id || crypto.randomUUID()
    }))
  ];
  
  // Use the Vercel AI SDK chat hook
  const {
    messages,
    input,
    setInput,
    isLoading,
    sendMessage,
    error
  } = useCauldronChat({
    api: '/api/ai/chat',
    initialMessages: initialMessagesWithSystem,
    module,
    onFinish: (message) => {
      setIsTyping(false);
      
      if (onResponse) {
        onResponse(message.content);
      }
      
      // Add to Sentient Loop context
      sentientLoop.addMemory({
        type: 'conversation',
        module,
        content: message.content,
        metadata: {
          role: 'assistant',
          timestamp: new Date().toISOString()
        }
      });
    }
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    // Set typing indicator
    setIsTyping(true);
    
    // Track start time for latency calculation
    startTimeRef.current = performance.now();
    
    // Add the user's query to the Sentient Loop context
    sentientLoop.addUserActivity(module, `query: ${input}`);
    
    // Send message using Vercel AI SDK
    await sendMessage(input);
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`flex flex-col bg-gray-800 rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ maxHeight }}
      >
        {messages.filter(msg => msg.role !== 'system').map((message) => (
          <div 
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-3/4 rounded-lg px-4 py-2 ${
                message.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-200'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-700 rounded-lg px-4 py-2 text-gray-200">
              <div className="flex space-x-1">
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
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
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder={placeholder}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <button
            className="ml-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : (
              sendButtonLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiChat;
