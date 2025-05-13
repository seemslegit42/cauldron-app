/**
 * AthenaPrompt Component
 *
 * A prompt interface with preset & freeform queries for the Athena module.
 * Features:
 * - Glassmorphism styling
 * - Preset and freeform queries
 * - Animations for user interactions
 * - Connection to AI services for generating responses
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@src/shared/utils/cn';
import { getGlassmorphismClasses } from '@src/shared/utils/glassmorphism';
import { useHapticFeedback } from '@src/shared/hooks/useHapticFeedback';
import { useSoundEffects } from '@src/shared/hooks/useSoundEffects';
import {
  Search,
  Send,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BarChart,
  TrendingUp,
  PieChart,
  Calendar,
  Target,
  Zap,
  X
} from 'lucide-react';
import { Button } from '@src/shared/components/ui/Button';
import { useAction } from 'wasp/client/operations';
import { MetricCategory, TimeframeOption } from '../types';

// Define suggested prompt interface
interface SuggestedPrompt {
  text: string;
  icon: React.ReactNode;
  category: string;
}

// Define message interface
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface AthenaPromptProps {
  /** The module this prompt belongs to */
  module?: string;
  /** Initial suggested prompts */
  initialPrompts?: SuggestedPrompt[];
  /** Whether to enable haptic feedback */
  enableHaptics?: boolean;
  /** Whether to enable sound effects */
  enableSound?: boolean;
  /** Whether to enable animations */
  enableAnimations?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Callback when a response is received */
  onResponse?: (response: string) => void;
  /** Callback when a query is submitted */
  onQuerySubmit?: (query: string) => Promise<string>;
  /** Current timeframe for context */
  timeframe?: TimeframeOption;
}

export const AthenaPrompt: React.FC<AthenaPromptProps> = ({
  module = 'athena',
  initialPrompts = [
    { text: "Analyze our revenue growth trend", icon: <TrendingUp size={16} />, category: "revenue" },
    { text: "Show customer acquisition metrics", icon: <BarChart size={16} />, category: "acquisition" },
    { text: "Forecast next quarter sales", icon: <PieChart size={16} />, category: "forecast" },
    { text: "Compare performance to last year", icon: <Calendar size={16} />, category: "comparison" },
    { text: "Identify underperforming segments", icon: <Target size={16} />, category: "analysis" },
  ],
  enableHaptics = false,
  enableSound = false,
  enableAnimations = true,
  className,
  onResponse,
  onQuerySubmit,
  timeframe = TimeframeOption.WEEK,
}) => {
  // State
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<SuggestedPrompt[]>(initialPrompts);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Hooks
  const { triggerHaptic } = useHapticFeedback({ enabled: enableHaptics });
  const { playSound } = useSoundEffects({ enabled: enableSound });

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
  const categories = ['all', ...new Set(suggestedPrompts.map(prompt => prompt.category))];

  // Filter suggested prompts by category
  const filteredPrompts = activeCategory === 'all'
    ? suggestedPrompts
    : suggestedPrompts.filter(prompt => prompt.category === activeCategory);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Add haptic feedback
    if (enableHaptics) {
      triggerHaptic('click');
    }

    // Add sound effect
    if (enableSound) {
      playSound('click');
    }

    // Add user message to chat
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      // Process query
      let response = '';

      if (onQuerySubmit) {
        response = await onQuerySubmit(input);
      } else {
        // Default response if no query handler is provided
        response = `I've analyzed your request: "${input}". This is a placeholder response since no query handler was provided.`;
      }

      // Add assistant message to chat
      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Call onResponse callback if provided
      if (onResponse) {
        onResponse(response);
      }

      // Add haptic feedback for response
      if (enableHaptics) {
        triggerHaptic('success', 'subtle');
      }

      // Add sound effect for response
      if (enableSound) {
        playSound('success', 'subtle');
      }
    } catch (error) {
      console.error('Error processing query:', error);

      // Add error message to chat
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);

      // Add haptic feedback for error
      if (enableHaptics) {
        triggerHaptic('error', 'subtle');
      }

      // Add sound effect for error
      if (enableSound) {
        playSound('error', 'subtle');
      }
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

    // Add haptic feedback
    if (enableHaptics) {
      triggerHaptic('click');
    }

    // Add sound effect
    if (enableSound) {
      playSound('click');
    }
  };

  // Clear chat messages
  const handleClearChat = () => {
    setMessages([]);

    // Add haptic feedback
    if (enableHaptics) {
      triggerHaptic('click');
    }

    // Add sound effect
    if (enableSound) {
      playSound('click');
    }
  };

  return (
    <motion.div
      className={cn(
        "overflow-hidden rounded-lg transition-all duration-300",
        getGlassmorphismClasses({
          level: 'heavy',
          border: true,
          shadow: true,
          hover: true
        }),
        isExpanded ? 'h-96' : 'h-auto',
        className
      )}
      whileHover={{ scale: 1.005 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between border-b border-gray-700/50 p-4 bg-gradient-to-r from-gray-900/50 to-gray-800/30">
        <div className="flex items-center">
          <div className="mr-3 h-3 w-3 animate-pulse rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/20"></div>
          <motion.h3
            className="text-lg font-medium text-white"
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
          >
            Athena Business Intelligence
          </motion.h3>
        </div>
        <motion.button
          className="p-2 rounded-full hover:bg-yellow-600/20 text-gray-300 hover:text-yellow-400 transition-colors"
          onClick={() => {
            setIsExpanded(!isExpanded);

            // Add haptic feedback
            if (enableHaptics) {
              triggerHaptic('click');
            }

            // Add sound effect
            if (enableSound) {
              playSound('click');
            }
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </motion.button>
      </div>

      {isExpanded && (
        <AnimatePresence>
          <motion.div
            initial={enableAnimations ? { opacity: 0, height: 0 } : { opacity: 1 }}
            animate={enableAnimations ? { opacity: 1, height: 'auto' } : { opacity: 1 }}
            exit={enableAnimations ? { opacity: 0, height: 0 } : { opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            {/* Messages area */}
            <div className="h-48 overflow-y-auto p-4 bg-gradient-to-b from-gray-900/30 to-transparent">
              {messages.length === 0 ? (
                <motion.div
                  className="flex flex-col items-center justify-center h-full text-center text-gray-400 py-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <motion.div
                    animate={{
                      y: [0, -5, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    <Sparkles className="h-10 w-10 mb-3 text-yellow-500" />
                  </motion.div>
                  <p className="max-w-xs">Ask Athena about your business metrics or use the suggested prompts below.</p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={cn(
                        "max-w-3/4 rounded-lg px-4 py-2 shadow-lg",
                        message.role === 'user'
                          ? "bg-gradient-to-r from-yellow-600 to-yellow-700 text-white"
                          : getGlassmorphismClasses({
                            level: 'medium',
                            border: true,
                            shadow: true,
                          }) + " text-gray-200"
                      )}>
                        {message.content}
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Category tabs */}
            <div className="border-t border-gray-700/50 p-4 bg-gray-900/20">
              <div className="mb-3 flex space-x-2 overflow-x-auto pb-2">
                {categories.map((category) => (
                  <motion.button
                    key={category}
                    className={cn(
                      "whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors",
                      activeCategory === category
                        ? "bg-gradient-to-r from-yellow-600 to-yellow-700 text-white shadow-md shadow-yellow-600/20"
                        : "bg-gray-800/70 text-gray-300 hover:bg-gray-700/70 hover:text-white"
                    )}
                    onClick={() => {
                      setActiveCategory(category);

                      // Add haptic feedback
                      if (enableHaptics) {
                        triggerHaptic('click');
                      }

                      // Add sound effect
                      if (enableSound) {
                        playSound('click');
                      }
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </motion.button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {filteredPrompts.map((prompt, index) => (
                  <motion.button
                    key={index}
                    className={cn(
                      "flex items-center rounded-full px-3 py-1 text-sm transition-all",
                      getGlassmorphismClasses({
                        level: 'light',
                        border: true,
                        shadow: true,
                        hover: true
                      }),
                      "text-gray-200 hover:text-yellow-400"
                    )}
                    onClick={() => handlePromptClick(prompt.text)}
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                  >
                    <span className="mr-2 text-yellow-500">{prompt.icon}</span>
                    {prompt.text}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Input area */}
            <div className="border-t border-gray-700/50 p-4 bg-gradient-to-b from-transparent to-gray-900/30">
              <form onSubmit={handleSubmit} className="flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Athena about your business metrics..."
                  className={cn(
                    "flex-1 rounded-l-lg px-4 py-2 text-white focus:outline-none",
                    getGlassmorphismClasses({
                      level: 'light',
                      border: true,
                      shadow: false
                    }),
                    "focus:ring-2 focus:ring-yellow-500/50"
                  )}
                  disabled={isProcessing}
                />
                <motion.button
                  type="submit"
                  disabled={isProcessing || !input.trim()}
                  className="rounded-r-lg bg-gradient-to-r from-yellow-600 to-yellow-700 px-4 py-2 text-white transition-colors hover:from-yellow-500 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-yellow-600/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isProcessing ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Send size={20} />
                  )}
                </motion.button>
              </form>

              {messages.length > 0 && (
                <motion.div
                  className="mt-2 flex justify-end"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.button
                    onClick={handleClearChat}
                    className="flex items-center text-xs text-gray-400 hover:text-yellow-400 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X size={12} className="mr-1" />
                    Clear chat
                  </motion.button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default AthenaPrompt;
