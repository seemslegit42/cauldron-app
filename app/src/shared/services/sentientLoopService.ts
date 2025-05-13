import { groqSwarm, getFastCompletion, getStreamingCompletion, GroqMessage, GROQ_MODELS } from './groqService';

// Define the types of insights the Sentient Loop can provide
export type InsightType = 
  | 'security_alert' 
  | 'business_insight' 
  | 'content_suggestion' 
  | 'workflow_optimization'
  | 'decision_recommendation'
  | 'market_trend';

// Define the structure of an insight
export interface Insight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  confidence: number; // 0-1
  urgency: 'low' | 'medium' | 'high';
  timestamp: Date;
  source: string;
  actions?: {
    label: string;
    action: string;
  }[];
  metadata?: Record<string, any>;
}

// Define the structure of a user context
export interface UserContext {
  userId: string;
  persona: 'hacker-ceo' | 'podcast-mogul' | 'enterprise-admin';
  recentActivities: {
    module: string;
    action: string;
    timestamp: Date;
  }[];
  preferences: Record<string, any>;
  metrics: Record<string, any>;
}

// Define the structure of a completion request
export interface CompletionRequest {
  prompt: string;
  context?: UserContext;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
  onChunk?: (chunk: string) => void;
}

// SentientLoop class to manage AI interactions
export class SentientLoop {
  private static instance: SentientLoop;
  private userContext: UserContext | null = null;
  
  private constructor() {
    // Private constructor for singleton pattern
  }
  
  // Get the singleton instance
  public static getInstance(): SentientLoop {
    if (!SentientLoop.instance) {
      SentientLoop.instance = new SentientLoop();
    }
    return SentientLoop.instance;
  }
  
  // Set the user context
  public setUserContext(context: UserContext): void {
    this.userContext = context;
  }
  
  // Get the user context
  public getUserContext(): UserContext | null {
    return this.userContext;
  }
  
  // Add a user activity to the context
  public addUserActivity(module: string, action: string): void {
    if (this.userContext) {
      this.userContext.recentActivities.push({
        module,
        action,
        timestamp: new Date(),
      });
      
      // Keep only the last 20 activities
      if (this.userContext.recentActivities.length > 20) {
        this.userContext.recentActivities = this.userContext.recentActivities.slice(-20);
      }
    }
  }
  
  // Get a fast completion (sub-100ms target)
  public async getFastCompletion(request: CompletionRequest): Promise<string> {
    // Create a system prompt that includes user context
    let systemPrompt = "You are the Sentient Loop™, an advanced AI assistant for BitBrew's Cauldron platform.";
    
    if (this.userContext) {
      systemPrompt += ` The user is a ${this.userContext.persona}. Tailor your response accordingly.`;
    }
    
    return getFastCompletion(request.prompt, {
      maxTokens: request.maxTokens || 50,
      temperature: request.temperature || 0.3,
      systemPrompt,
    });
  }
  
  // Get a streaming completion
  public async getStreamingCompletion(request: CompletionRequest): Promise<string> {
    // Create a system prompt that includes user context
    let systemPrompt = "You are the Sentient Loop™, an advanced AI assistant for BitBrew's Cauldron platform.";
    
    if (this.userContext) {
      systemPrompt += ` The user is a ${this.userContext.persona}. Tailor your response accordingly.`;
      
      // Add more context based on persona
      switch (this.userContext.persona) {
        case 'hacker-ceo':
          systemPrompt += " Focus on security, technical leadership, and business strategy.";
          break;
        case 'podcast-mogul':
          systemPrompt += " Focus on content creation, audience growth, and media metrics.";
          break;
        case 'enterprise-admin':
          systemPrompt += " Focus on operational efficiency, financial metrics, and business intelligence.";
          break;
      }
    }
    
    const messages: GroqMessage[] = [
      { role: 'user', content: request.prompt }
    ];
    
    return getStreamingCompletion(messages, {
      model: GROQ_MODELS.LLAMA3_70B,
      maxTokens: request.maxTokens || 1000,
      temperature: request.temperature || 0.7,
      systemPrompt,
      onChunk: request.onChunk,
    });
  }
  
  // Generate insights based on user context and data
  public async generateInsights(count: number = 3): Promise<Insight[]> {
    if (!this.userContext) {
      return [];
    }
    
    // Create a prompt to generate insights
    const prompt = `Generate ${count} insights for a ${this.userContext.persona} based on their recent activities and metrics. Format as JSON array with fields: type, title, description, confidence (0-1), urgency (low/medium/high), source, and actions (array of objects with label and action).`;
    
    try {
      const completion = await this.getStreamingCompletion({
        prompt,
        maxTokens: 1000,
        temperature: 0.7,
      });
      
      // Parse the JSON response
      const jsonMatch = completion.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const insights = JSON.parse(jsonMatch[0]) as Omit<Insight, 'id' | 'timestamp'>[];
        
        // Add id and timestamp to each insight
        return insights.map(insight => ({
          ...insight,
          id: Math.random().toString(36).substring(2, 15),
          timestamp: new Date(),
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error generating insights:', error);
      return [];
    }
  }
  
  // Generate a response to a user query
  public async generateResponse(query: string): Promise<string> {
    if (!this.userContext) {
      return "I don't have enough context to provide a meaningful response.";
    }
    
    // Add the query to user activities
    this.addUserActivity('assistant', `query: ${query}`);
    
    // Create a prompt that includes user context
    const prompt = `The user is a ${this.userContext.persona} and has asked: "${query}". Provide a helpful response.`;
    
    return this.getStreamingCompletion({
      prompt,
      maxTokens: 1000,
      temperature: 0.7,
    });
  }
  
  // Generate suggested actions based on user context
  public async generateSuggestedActions(count: number = 3): Promise<{ label: string; action: string }[]> {
    if (!this.userContext) {
      return [];
    }
    
    // Create a prompt to generate suggested actions
    const prompt = `Generate ${count} suggested actions for a ${this.userContext.persona}. Format as JSON array with fields: label and action.`;
    
    try {
      const completion = await this.getStreamingCompletion({
        prompt,
        maxTokens: 500,
        temperature: 0.7,
      });
      
      // Parse the JSON response
      const jsonMatch = completion.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return [];
    } catch (error) {
      console.error('Error generating suggested actions:', error);
      return [];
    }
  }
  
  // Generate a completion for the AI prompt assistant
  public async generatePromptCompletion(prompt: string, module: string): Promise<string> {
    // Create a system prompt based on the module
    let systemPrompt = "You are the Sentient Loop™, an advanced AI assistant for BitBrew's Cauldron platform.";
    
    switch (module) {
      case 'arcana':
        systemPrompt += " You're helping with the Arcana command dashboard module.";
        break;
      case 'phantom':
        systemPrompt += " You're helping with the Phantom cybersecurity module.";
        break;
      case 'manifold':
        systemPrompt += " You're helping with the Manifold content creation module.";
        break;
      case 'forgeflow':
        systemPrompt += " You're helping with the Forgeflow agent orchestration module.";
        break;
      case 'sentinel':
        systemPrompt += " You're helping with the Sentinel security posture module.";
        break;
      case 'athena':
        systemPrompt += " You're helping with the Athena business intelligence module.";
        break;
    }
    
    if (this.userContext) {
      systemPrompt += ` The user is a ${this.userContext.persona}. Tailor your response accordingly.`;
    }
    
    const messages: GroqMessage[] = [
      { role: 'user', content: prompt }
    ];
    
    return getStreamingCompletion(messages, {
      model: GROQ_MODELS.LLAMA3_70B,
      maxTokens: 1000,
      temperature: 0.7,
      systemPrompt,
    });
  }
  
  // Generate a risk assessment for the Sentinel Risk Light
  public async generateRiskAssessment(): Promise<{ level: 'green' | 'yellow' | 'red'; description: string; metrics: Record<string, any> }> {
    if (!this.userContext) {
      return { level: 'yellow', description: 'Unable to assess risk without user context', metrics: {} };
    }
    
    // Create a prompt to generate a risk assessment
    const prompt = `Generate a security risk assessment for a ${this.userContext.persona}. Format as JSON with fields: level (green/yellow/red), description, and metrics (object with numeric values).`;
    
    try {
      const completion = await this.getStreamingCompletion({
        prompt,
        maxTokens: 500,
        temperature: 0.5,
      });
      
      // Parse the JSON response
      const jsonMatch = completion.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return { level: 'yellow', description: 'Unable to parse risk assessment', metrics: {} };
    } catch (error) {
      console.error('Error generating risk assessment:', error);
      return { level: 'yellow', description: 'Error generating risk assessment', metrics: {} };
    }
  }
}

// Export the singleton instance
export const sentientLoop = SentientLoop.getInstance();