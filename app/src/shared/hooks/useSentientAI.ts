import { useState, useCallback, useEffect } from 'react';
import { sentientLoop } from '../services/sentientLoopService';
import { groqSwarm, GROQ_MODELS, GroqMessage } from '../services/groqService';
import { SENTIENT_LOOP_CONFIG } from '../config/ai-config';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Memory storage for conversation context
const conversationMemory: Record<string, any> = {};

// Fallback responses in case the Groq API is unavailable
const fallbackResponses: Record<string, string[]> = {
  arcana: [
    "I've analyzed your dashboard metrics, and I notice your growth rate has increased by 3.4% since yesterday. The Phantom project is showing strong progress at 65% completion.",
    "Based on your current metrics, I recommend focusing on the Solar Development project today. It's at 40% completion and has the highest potential impact on your revenue goals.",
    "I've detected a potential opportunity in your content strategy. Your engagement metrics suggest that increasing podcast production could drive significant growth.",
  ],
  phantom: [
    "I've detected 3 new potential phishing attempts targeting your domain. I've already implemented countermeasures, but you should review the details.",
    "Your security posture has improved by 8% since last week. The implementation of multi-factor authentication has significantly reduced unauthorized access attempts.",
    "I'm tracking a new threat vector that's affecting companies in your industry. I recommend updating your firewall rules - I've prepared the necessary changes for your review.",
  ],
  manifold: [
    "I've analyzed trending topics in your industry and prepared 5 new content ideas for your podcast. The most promising one focuses on AI-driven business intelligence.",
    "Your latest blog post is performing 32% better than average. I've identified the key factors: comprehensive examples, actionable advice, and effective use of headers.",
    "Based on audience engagement metrics, I recommend focusing more on technical deep-dives in your content strategy. These posts receive 2.3x more shares and comments.",
  ],
  generic: [
    "I've analyzed your request and prepared some insights that might be helpful for your current goals.",
    "Based on the available data, I can offer several recommendations to improve your current situation.",
    "I've processed your query and have some interesting findings to share with you.",
  ]
};

export function useGroqInference() {
  const [isLoading, setIsLoading] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isGroqAvailable, setIsGroqAvailable] = useState(true);
  const [streamingEnabled, setStreamingEnabled] = useState(true);

  // Check if Groq is available on component mount
  useEffect(() => {
    const checkGroqAvailability = async () => {
      try {
        // Simple ping to check if Groq is responsive
        const response = await groqSwarm.complete(
          [{ role: 'user', content: 'ping' }],
          {
            model: GROQ_MODELS.LLAMA3_8B,
            maxTokens: 5,
            temperature: 0.1,
          }
        );
        setIsGroqAvailable(true);
        console.log('Groq API is available and responding');
      } catch (err) {
        console.warn('Groq API not available, using fallback responses:', err);
        setIsGroqAvailable(false);
      }
    };

    checkGroqAvailability();
  }, []);

  // Function to store conversation context
  const storeConversationContext = useCallback((userId: string, module: string, context: any) => {
    const key = `${userId}-${module}`;
    conversationMemory[key] = {
      ...conversationMemory[key],
      ...context,
      lastUpdated: new Date().toISOString(),
    };
    
    // Also update the Sentient Loop context if available
    if (sentientLoop.getUserContext()) {
      sentientLoop.addUserActivity(module, `context_update: ${JSON.stringify(context)}`);
    }
  }, []);

  // Function to retrieve conversation context
  const getConversationContext = useCallback((userId: string, module: string) => {
    const key = `${userId}-${module}`;
    return conversationMemory[key] || {};
  }, []);

  // Generate a response using the Groq API
  const generateResponse = useCallback(async (messages: Message[]): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const startTime = performance.now();
      
      // Extract the system message if present
      const systemMessage = messages.find(msg => msg.role === 'system');
      const userMessages = messages.filter(msg => msg.role !== 'system');
      
      // Get the last user message
      const lastUserMessage = userMessages.filter(msg => msg.role === 'user').pop();
      
      if (!lastUserMessage) {
        throw new Error('No user message found');
      }
      
      // Determine which module we're in based on the system message
      let module = 'generic';
      let userId = 'anonymous';
      let persona = 'hacker-ceo'; // Default persona
      
      if (systemMessage) {
        const moduleMatch = systemMessage.content.match(/You are (\w+),/);
        if (moduleMatch && moduleMatch[1]) {
          module = moduleMatch[1].toLowerCase();
        }
        
        const userMatch = systemMessage.content.match(/Current user: ([^\n]+)/);
        if (userMatch && userMatch[1]) {
          userId = userMatch[1].trim();
        }
        
        // Check for persona information
        if (systemMessage.content.includes('hacker-ceo')) {
          persona = 'hacker-ceo';
        } else if (systemMessage.content.includes('podcast-mogul')) {
          persona = 'podcast-mogul';
        } else if (systemMessage.content.includes('enterprise-admin')) {
          persona = 'enterprise-admin';
        }
      }
      
      // Get conversation context
      const context = getConversationContext(userId, module);
      
      // If Groq is available, use it for response generation
      if (isGroqAvailable) {
        // Convert our messages to Groq format
        const groqMessages: GroqMessage[] = messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        
        // Use streaming for better UX
        let fullResponse = '';
        
        try {
          // First try a fast completion for immediate feedback (sub-100ms target)
          const fastResponse = await sentientLoop.getFastCompletion({
            prompt: lastUserMessage.content,
            maxTokens: 30,
            temperature: 0.3,
            systemPrompt: systemMessage?.content,
          });
          
          if (fastResponse) {
            // This will be shown immediately while the full response is being generated
            fullResponse = fastResponse;
          }
          
          // Then get the full streaming response
          fullResponse = await sentientLoop.getStreamingCompletion({
            prompt: lastUserMessage.content,
            context: {
              userId,
              persona: persona as any,
              recentActivities: [],
              preferences: {},
              metrics: {}
            },
            maxTokens: 1000,
            temperature: 0.7,
            systemPrompt: systemMessage?.content,
          });
          
          // Store context about the interaction
          storeConversationContext(userId, module, { 
            lastInteraction: new Date().toISOString(),
            lastQuery: lastUserMessage.content
          });
          
          // Add the user's query to the Sentient Loop context
          sentientLoop.addUserActivity(module, `query: ${lastUserMessage.content}`);
          
        } catch (groqError) {
          console.error('Error with Groq API, falling back to local responses:', groqError);
          
          // Fall back to local responses
          const responses = fallbackResponses[module] || fallbackResponses.generic;
          fullResponse = responses[Math.floor(Math.random() * responses.length)];
          
          // Add context-aware additions
          if (context.userGreeted) {
            fullResponse += " As we discussed earlier, I'm here to help you achieve your business goals.";
          }
        }
        
        const endTime = performance.now();
        setLatency(Math.round(endTime - startTime));
        
        return fullResponse;
      } else {
        // If Groq is not available, use fallback responses
        const responses = fallbackResponses[module] || fallbackResponses.generic;
        let response = responses[Math.floor(Math.random() * responses.length)];
        
        // Add some personalization based on the user's message and context
        const userMessage = lastUserMessage.content.toLowerCase();
        
        if (userMessage.includes('hello') || userMessage.includes('hi ')) {
          const userName = systemMessage?.content.includes('Current user:') 
            ? systemMessage.content.split('Current user:')[1].trim().split(' ')[0]
            : 'there';
          response = `Hello ${userName}! How can I assist you today with your ${module} needs?`;
          
          // Store context about greeting
          storeConversationContext(userId, module, { 
            lastGreeting: new Date().toISOString(),
            userGreeted: true 
          });
        }
        else if (userMessage.includes('what can you do') || userMessage.includes('help me')) {
          switch (module) {
            case 'arcana':
              response = "As Arcana, I can help you understand your dashboard metrics, track project progress, identify growth opportunities, and make strategic recommendations based on your business data. I can also help you navigate to other Cauldron modules when needed. The enhanced Sentient Loop™ now powers all my insights, making them more accurate and contextually relevant.";
              break;
            case 'phantom':
              response = "As Phantom, I monitor your cybersecurity posture, detect threats, analyze vulnerabilities, and provide defensive recommendations. I can help you understand your security risks and implement effective countermeasures. The enhanced Sentient Loop™ now powers my threat detection, making it more accurate and proactive.";
              break;
            case 'manifold':
              response = "As Manifold, I assist with content creation and distribution. I can generate content ideas, analyze audience engagement, optimize your content strategy, and help you create compelling podcasts, blog posts, and other content formats. The enhanced Sentient Loop™ now helps me better understand your audience and predict content performance.";
              break;
            default:
              response = "I can help you analyze data, generate insights, make recommendations, and execute workflows to achieve your business goals. Just let me know what you're trying to accomplish, and I'll assist you. The enhanced Sentient Loop™ now powers all my capabilities, making them more effective and personalized.";
          }
          
          // Store context about capabilities question
          storeConversationContext(userId, module, { 
            explainedCapabilities: true,
            lastCapabilitiesExplanation: new Date().toISOString() 
          });
        }
        else if (userMessage.includes('sentient loop') || userMessage.includes('how do you work')) {
          response = "The Sentient Loop™ is the core intelligence cycle that powers Cauldron. It creates a continuous feedback loop of perception, coordination, analysis, action, feedback, and learning. The enhanced version now includes a dedicated LearningAgent that accumulates knowledge over time, making each execution more effective than the last. This allows me to provide more accurate, contextual, and personalized insights based on your specific needs and historical interactions.";
          
          // Store context about Sentient Loop explanation
          storeConversationContext(userId, module, { 
            explainedSentientLoop: true,
            interestedInTechnology: true 
          });
        }
        
        const endTime = performance.now();
        setLatency(Math.round(endTime - startTime));
        
        return response;
      }
    } catch (error) {
      setError(error as Error);
      console.error('Error generating response:', error);
      return 'Sorry, I encountered an error while processing your request. Please try again in a moment.';
    } finally {
      setIsLoading(false);
    }
  }, [isGroqAvailable, getConversationContext, storeConversationContext]);

  // Generate a response with streaming updates
  const generateStreamingResponse = useCallback(async (
    messages: Message[],
    onChunk: (chunk: string) => void
  ): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const startTime = performance.now();
      
      // Extract the system message if present
      const systemMessage = messages.find(msg => msg.role === 'system');
      const userMessages = messages.filter(msg => msg.role !== 'system');
      
      // Get the last user message
      const lastUserMessage = userMessages.filter(msg => msg.role === 'user').pop();
      
      if (!lastUserMessage) {
        throw new Error('No user message found');
      }
      
      // Determine which module we're in based on the system message
      let module = 'generic';
      let userId = 'anonymous';
      
      if (systemMessage) {
        const moduleMatch = systemMessage.content.match(/You are (\w+),/);
        if (moduleMatch && moduleMatch[1]) {
          module = moduleMatch[1].toLowerCase();
        }
        
        const userMatch = systemMessage.content.match(/Current user: ([^\n]+)/);
        if (userMatch && userMatch[1]) {
          userId = userMatch[1].trim();
        }
      }
      
      // If Groq is available, use it for response generation
      if (isGroqAvailable) {
        let fullResponse = '';
        
        try {
          // Use streaming completion for better UX
          fullResponse = await sentientLoop.getStreamingCompletion({
            prompt: lastUserMessage.content,
            stream: true,
            onChunk: (chunk) => {
              fullResponse += chunk;
              onChunk(chunk);
            }
          });
          
          // Store context about the interaction
          storeConversationContext(userId, module, { 
            lastInteraction: new Date().toISOString(),
            lastQuery: lastUserMessage.content
          });
          
        } catch (groqError) {
          console.error('Error with Groq streaming API:', groqError);
          
          // Fall back to non-streaming response
          const response = await generateResponse(messages);
          onChunk(response);
          fullResponse = response;
        }
        
        const endTime = performance.now();
        setLatency(Math.round(endTime - startTime));
        
        return fullResponse;
      } else {
        // If Groq is not available, use fallback responses
        const response = await generateResponse(messages);
        onChunk(response);
        
        const endTime = performance.now();
        setLatency(Math.round(endTime - startTime));
        
        return response;
      }
    } catch (error) {
      setError(error as Error);
      console.error('Error generating streaming response:', error);
      const errorMessage = 'Sorry, I encountered an error while processing your request. Please try again in a moment.';
      onChunk(errorMessage);
      return errorMessage;
    } finally {
      setIsLoading(false);
    }
  }, [isGroqAvailable, generateResponse, storeConversationContext]);

  // Generate a fast completion (sub-100ms target)
  const generateFastCompletion = useCallback(async (prompt: string): Promise<string> => {
    if (!isGroqAvailable) {
      return '';
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const startTime = performance.now();
      
      const response = await sentientLoop.getFastCompletion({
        prompt,
        maxTokens: SENTIENT_LOOP_CONFIG.performance.fastCompletionTargetMs || 50,
        temperature: 0.3,
      });
      
      const endTime = performance.now();
      setLatency(Math.round(endTime - startTime));
      
      return response;
    } catch (err) {
      setError(err as Error);
      console.error('Error generating fast completion:', err);
      return '';
    } finally {
      setIsLoading(false);
    }
  }, [isGroqAvailable]);

  // Generate insights based on user context
  const generateInsights = useCallback(async (count: number = 3) => {
    if (!isGroqAvailable) {
      return [];
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const insights = await sentientLoop.generateInsights(count);
      return insights;
    } catch (err) {
      setError(err as Error);
      console.error('Error generating insights:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [isGroqAvailable]);

  // Toggle streaming mode
  const toggleStreaming = useCallback(() => {
    setStreamingEnabled(prev => !prev);
  }, []);

  return {
    generateResponse,
    generateStreamingResponse,
    generateFastCompletion,
    generateInsights,
    isLoading,
    error,
    latency,
    storeConversationContext,
    getConversationContext,
    isGroqAvailable,
    streamingEnabled,
    toggleStreaming
  };
}
  athena: [
    "I've analyzed your business metrics for the past week. Revenue is up 3.4%, but I'm seeing a concerning trend in customer churn. Would you like me to investigate further?",
    "Based on current data, your customer acquisition cost has decreased by 12% this month, while lifetime value has increased by 8%. This is an excellent trend for profitability.",
    "I've identified a potential revenue opportunity in your enterprise segment. Customers in this tier have 22% higher retention and 35% higher expansion revenue.",
    "Your marketing campaign performance shows that email sequences are outperforming social media ads by 3.2x in terms of ROI. Consider reallocating budget accordingly.",
    "I've completed a cohort analysis of your user base. Users who engage with your podcast content show 40% higher retention rates after 60 days.",
  ],
  forgeflow: [
    "I've analyzed your workflow needs. For content creation, I recommend a sequence using the ContentStrategist, ResearchAnalyst, ContentWriter, and ContentEditor agents.",
    "Based on your business goals, the Sentient Loop workflow would be most effective. It uses perception, coordination, analysis, action, and feedback agents to create a complete intelligence cycle.",
    "I notice you're interested in market analysis. I can set up a workflow with MarketIntelligence, ResearchAnalyst, DataAnalyst, and BusinessStrategist agents working in sequence.",
    "For your security assessment needs, I recommend a workflow with SecurityAuditor, ThreatAnalyst, and IncidentResponder agents. This will provide comprehensive security insights.",
    "I've analyzed your previous workflows and noticed that the BusinessStrategy template has been most effective for your goals. Would you like to create a new instance with customized parameters?",
  ],
  phantom: [
    "I've detected 3 new potential phishing attempts targeting your domain. I've already implemented countermeasures, but you should review the details.",
    "Your security posture has improved by 8% since last week. The implementation of multi-factor authentication has significantly reduced unauthorized access attempts.",
    "I'm tracking a new threat vector that's affecting companies in your industry. I recommend updating your firewall rules - I've prepared the necessary changes for your review.",
    "Based on recent attack patterns, I've identified a vulnerability in your current setup. I recommend implementing additional security controls for your API endpoints.",
    "Good news! Your security training program has resulted in a 45% decrease in employee susceptibility to social engineering attacks.",
  ],
  manifold: [
    "I've analyzed trending topics in your industry and prepared 5 new content ideas for your podcast. The most promising one focuses on AI-driven business intelligence.",
    "Your latest blog post is performing 32% better than average. I've identified the key factors: comprehensive examples, actionable advice, and effective use of headers.",
    "Based on audience engagement metrics, I recommend focusing more on technical deep-dives in your content strategy. These posts receive 2.3x more shares and comments.",
    "I've drafted an outline for your next podcast episode on 'The Future of AI in Business'. Would you like me to expand it into a full script?",
    "Your content distribution strategy could be optimized. I recommend scheduling posts at 9am and 2pm on Tuesdays and Thursdays for maximum engagement based on your audience data.",
  ],
  sentinel: [
    "I've completed a security audit of your systems. Overall posture is good, but I've identified 3 medium-risk vulnerabilities that should be addressed within the next week.",
    "Your encryption protocols are up to date, but I recommend implementing additional access controls for your cloud storage to prevent potential data leakage.",
    "I've detected unusual login patterns from IP addresses in Eastern Europe. While not definitively malicious, I recommend reviewing these access attempts.",
    "Your current backup strategy meets basic requirements, but I recommend implementing an additional off-site backup solution for critical data.",
    "Based on recent cyber threat intelligence, I've updated your security rule set to protect against emerging ransomware variants targeting your industry.",
  ],
};

// Generic responses for when module-specific ones aren't available
const genericResponses = [
  "I've analyzed your request and prepared some insights that might be helpful for your current goals.",
  "Based on the available data, I can offer several recommendations to improve your current situation.",
  "I've processed your query and have some interesting findings to share with you.",
  "After analyzing the relevant information, I've identified some potential opportunities worth exploring.",
  "I've completed my analysis and have prepared some actionable insights for you to consider.",
];

export function useGroqInference() {
  const [isLoading, setIsLoading] = useState(false);

  const generateResponse = async (messages: Message[]): Promise<string> => {
    setIsLoading(true);
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const lastMessage = messages[messages.length - 1];
      const systemMessage = messages.find(msg => msg.role === 'system');
      
      // Determine which module we're in based on the system message
      let module = 'generic';
      if (systemMessage) {
        const moduleMatch = systemMessage.content.match(/You are (\w+),/);
        if (moduleMatch && moduleMatch[1]) {
          module = moduleMatch[1].toLowerCase();
        }
      }
      
      let response = '';
      
      if (lastMessage.role === 'user') {
        // Check if we have a direct question that we can answer specifically
        const userMessage = lastMessage.content.toLowerCase();
        
        if (userMessage.includes('hello') || userMessage.includes('hi ')) {
          const userName = systemMessage?.content.includes('Current user:') 
            ? systemMessage.content.split('Current user:')[1].trim().split(' ')[0]
            : 'there';
          response = `Hello ${userName}! How can I assist you today with your ${module} needs?`;
        }
        else if (userMessage.includes('what can you do') || userMessage.includes('help me')) {
          switch (module) {
            case 'arcana':
              response = "As Arcana, I can help you understand your dashboard metrics, track project progress, identify growth opportunities, and make strategic recommendations based on your business data. I can also help you navigate to other Cauldron modules when needed.";
              break;
            case 'athena':
              response = "As Athena, I specialize in business intelligence and decision support. I can analyze your metrics, identify trends, generate insights, provide strategic recommendations, and help you make data-driven decisions to grow your business.";
              break;
            case 'forgeflow':
              response = "As Forgeflow, I help you create and manage AI agent workflows. I can recommend workflow templates, help you customize agent configurations, execute workflows, and analyze the results to continuously improve your automated processes.";
              break;
            case 'phantom':
              response = "As Phantom, I monitor your cybersecurity posture, detect threats, analyze vulnerabilities, and provide defensive recommendations. I can help you understand your security risks and implement effective countermeasures.";
              break;
            case 'manifold':
              response = "As Manifold, I assist with content creation and distribution. I can generate content ideas, analyze audience engagement, optimize your content strategy, and help you create compelling podcasts, blog posts, and other content formats.";
              break;
            case 'sentinel':
              response = "As Sentinel, I manage your security posture. I can conduct security audits, identify vulnerabilities, recommend security controls, monitor for threats, and help you implement best practices to protect your digital assets.";
              break;
            default:
              response = "I can help you analyze data, generate insights, make recommendations, and execute workflows to achieve your business goals. Just let me know what you're trying to accomplish, and I'll assist you.";
          }
        }
        else {
          // Get module-specific responses or fall back to generic ones
          const responses = moduleResponses[module] || genericResponses;
          response = responses[Math.floor(Math.random() * responses.length)];
          
          // Add some personalization based on the user's message
          if (userMessage.includes('project') || userMessage.includes('progress')) {
            response += " I can provide more detailed project analytics if you'd like to dive deeper into a specific initiative.";
          } else if (userMessage.includes('security') || userMessage.includes('threat')) {
            response += " Security is a critical priority, and I'm continuously monitoring for potential threats to your systems.";
          } else if (userMessage.includes('content') || userMessage.includes('podcast')) {
            response += " Your content strategy is showing promising results, and I can help you optimize it further based on audience engagement data.";
          } else if (userMessage.includes('revenue') || userMessage.includes('growth')) {
            response += " I'm tracking your growth metrics closely and can provide more granular analysis of revenue drivers if needed.";
          }
        }
      }
      
      return response;
    } catch (error) {
      console.error('Error generating response:', error);
      return 'Sorry, I encountered an error while processing your request. Please try again in a moment.';
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateResponse,
    isLoading,
  };
}