import React, { useState, useRef, useEffect } from 'react';
import { useAction } from 'wasp/client/operations';
import { processCommand } from '../operations';
import { Message, SuggestedPrompt } from '../types';

interface PromptAssistantProps {
  module?: string;
  initialPrompts?: SuggestedPrompt[];
}

export const PromptAssistant: React.FC<PromptAssistantProps> = ({ 
  module = 'arcana',
  initialPrompts = [
    { text: "Show me today's revenue", icon: "📊", category: "business" },
    { text: "Analyze my security posture", icon: "🛡️", category: "security" },
    { text: "Generate a blog post idea", icon: "✍️", category: "content" },
    { text: "Summarize my social media performance", icon: "📱", category: "social" },
    { text: "What's my top priority today?", icon: "🎯", category: "productivity" },
  ]
}) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<SuggestedPrompt[]>(initialPrompts);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const processCommandAction = useAction(processCommand);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom of messages when new message is added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  // Get unique categories from suggested prompts
  const categories = [...new Set(suggestedPrompts.map(prompt => prompt.category))].filter(Boolean);

  // Filter suggested prompts by category
  const filteredPrompts = activeCategory === 'all'
    ? suggestedPrompts
    : suggestedPrompts.filter(prompt => prompt.category === activeCategory);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage: Message = {
      role: 'user',
      content: input,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);
    
    try {
      // Process command
      const response = await processCommandAction({
        command: input,
        module,
        messages: [...messages, userMessage],
      });
      
      // Add assistant message to chat
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.message,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Update suggested prompts if provided
      if (response.suggestedPrompts && response.suggestedPrompts.length > 0) {
        setSuggestedPrompts(response.suggestedPrompts);
      }
    } catch (error) {
      console.error('Error processing command:', error);
      
      // Add error message to chat
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle suggested prompt click
  const handlePromptClick = (promptText: string) => {
    setInput(promptText);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={`bg-gray-800 rounded-lg shadow-lg border border-gray-700 transition-all duration-300 ${
      isExpanded ? 'h-96' : 'h-auto'
    }`}>
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <div className="flex items-center">
          <div className="h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse"></div>
          <h3 className="text-lg font-medium text-white">Cauldron Prime Assistant</h3>
        </div>
        <button 
          className="p-1 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          )}
        </button>
      </div>
      
      {isExpanded && (
        <>
          {/* Messages area */}
          <div className="p-4 h-48 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                <p>Ask me anything about your business or use the suggested prompts below.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-3/4 rounded-lg px-4 py-2 ${
                      message.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-200'
                    }`}>
                      {message.content}
                    </div>
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-gray-700 text-gray-200 rounded-lg px-4 py-2">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          {/* Suggested prompts */}
          <div className="px-4 py-2 border-t border-gray-700">
            <div className="flex items-center mb-2 overflow-x-auto pb-2 space-x-2">
              <button
                className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                  activeCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                onClick={() => setActiveCategory('all')}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                    activeCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  onClick={() => setActiveCategory(category === activeCategory ? 'all' : category)}
                >
                  <span className="capitalize">{category}</span>
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {filteredPrompts.map((prompt, index) => (
                <button
                  key={index}
                  className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full transition-colors flex items-center"
                  onClick={() => handlePromptClick(prompt.text)}
                >
                  <span className="mr-1">{prompt.icon}</span>
                  {prompt.text}
                </button>
              ))}
            </div>
          </div>
          
          {/* Input area */}
          <div className="p-4 border-t border-gray-700">
            <form onSubmit={handleSubmit} className="flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 bg-gray-700 text-white rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={isProcessing}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};
