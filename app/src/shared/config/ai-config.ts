// AI Configuration for the Sentient Loop™

// Gemini API configuration
export const GEMINI_CONFIG = {
  // API key will be loaded from environment variables
  apiKey: process.env.GEMINI_API_KEY || '',

  // Default model configurations
  models: {
    // Fast model for quick responses
    fast: {
      name: 'gemini-pro',
      maxTokens: 50,
      temperature: 0.3,
      topP: 0.95,
      timeoutMs: 2000, // Short timeout for fast responses
      priority: 'high',
    },

    // Standard model for most interactions
    standard: {
      name: 'gemini-pro',
      maxTokens: 1000,
      temperature: 0.7,
      topP: 0.95,
      timeoutMs: 10000,
      priority: 'medium',
    },

    // High-quality model for complex reasoning
    premium: {
      name: 'gemini-ultra',
      maxTokens: 2000,
      temperature: 0.8,
      topP: 0.95,
      timeoutMs: 15000,
      priority: 'low',
    },

    // Vision model for image analysis
    vision: {
      name: 'gemini-pro-vision',
      maxTokens: 1000,
      temperature: 0.7,
      topP: 0.95,
      timeoutMs: 15000,
      priority: 'medium',
    },
  },

  // Fallback model configurations
  fallbacks: {
    // If fast model fails, use these in order
    fast: ['gemini-pro', 'llama3-8b-8192'],

    // If standard model fails, use these in order
    standard: ['gemini-pro', 'llama3-70b-8192'],

    // If premium model fails, use these in order
    premium: ['gemini-ultra', 'gemini-pro', 'mixtral-8x7b-32768'],

    // If vision model fails, use these in order
    vision: ['gemini-pro-vision', 'gemini-pro'],
  },

  // Performance monitoring configuration
  performance: {
    // Latency thresholds in milliseconds
    latencyThresholds: {
      excellent: 100, // Sub-100ms is excellent
      good: 300, // Sub-300ms is good
      acceptable: 1000, // Sub-1s is acceptable
      poor: 3000, // Above 3s is poor
    },

    // Cache configuration
    cache: {
      enabled: true,
      ttlSeconds: {
        default: 300, // 5 minutes
        embedding: 86400, // 24 hours
        summarization: 3600, // 1 hour
        chat: 300, // 5 minutes
        contentGeneration: 1800, // 30 minutes
      },
      maxSize: 1000, // Maximum number of entries in memory cache
      maxDatabaseSize: 10000, // Maximum number of entries in database cache
      // Types of requests that should be cached
      cacheableRequestTypes: ['embedding', 'summarization', 'contentGeneration'],
      // Maximum temperature for cacheable requests
      maxCacheableTemperature: 0.3,
    },
  },
};

// Groq API configuration
export const GROQ_CONFIG = {
  // API key will be loaded from environment variables
  apiKey: process.env.GROQ_API_KEY || '',

  // Default model configurations
  models: {
    // Fast model for sub-100ms completions
    fast: {
      name: 'llama3-8b-8192',
      maxTokens: 50,
      temperature: 0.3,
      topP: 0.95,
      timeoutMs: 2000, // Short timeout for fast responses
      priority: 'high',
    },

    // Standard model for most interactions
    standard: {
      name: 'llama3-70b-8192',
      maxTokens: 1000,
      temperature: 0.7,
      topP: 0.95,
      timeoutMs: 10000,
      priority: 'medium',
    },

    // High-quality model for complex reasoning
    premium: {
      name: 'mixtral-8x7b-32768',
      maxTokens: 2000,
      temperature: 0.8,
      topP: 0.95,
      timeoutMs: 15000,
      priority: 'low',
    },
  },

  // Fallback model configurations
  fallbacks: {
    // If fast model fails, use these in order
    fast: ['llama3-8b-8192', 'gemma-7b-it', 'local-embeddings'],

    // If standard model fails, use these in order
    standard: ['llama3-70b-8192', 'mixtral-8x7b-32768', 'llama3-8b-8192'],

    // If premium model fails, use these in order
    premium: ['mixtral-8x7b-32768', 'llama3-70b-8192', 'llama3-8b-8192'],
  },

  // Swarm configuration for load balancing and failover
  swarm: {
    retryAttempts: 3,
    timeoutMs: 10000,
    maxConcurrentRequests: 20, // Increased for better parallelism
    retryDelay: 50, // ms between retries
    // Additional Groq API endpoints can be added here
    endpoints: [
      // Primary endpoint
      {
        url: 'https://api.groq.com/openai/v1',
        weight: 1.0, // Priority weight
      },
    ],
  },

  // Performance monitoring configuration
  performance: {
    // Latency thresholds in milliseconds
    latencyThresholds: {
      excellent: 100, // Sub-100ms is excellent
      good: 300, // Sub-300ms is good
      acceptable: 1000, // Sub-1s is acceptable
      poor: 3000, // Above 3s is poor
    },

    // Token budget configuration
    tokenBudgets: {
      // Default token budgets per request type
      default: {
        prompt: 1000,
        completion: 1000,
      },
      // Chat token budgets
      chat: {
        prompt: 2000,
        completion: 1000,
      },
      // Summarization token budgets
      summarization: {
        prompt: 4000,
        completion: 1000,
      },
      // Content generation token budgets
      contentGeneration: {
        prompt: 1000,
        completion: 4000,
      },
    },

    // Throughput limits
    throughputLimits: {
      requestsPerMinute: 100,
      tokensPerMinute: 100000,
    },

    // Cache configuration
    cache: {
      enabled: true,
      ttlSeconds: {
        default: 300, // 5 minutes
        embedding: 86400, // 24 hours
        summarization: 3600, // 1 hour
        chat: 300, // 5 minutes
        contentGeneration: 1800, // 30 minutes
      },
      maxSize: 1000, // Maximum number of entries in memory cache
      maxDatabaseSize: 10000, // Maximum number of entries in database cache
      // Types of requests that should be cached
      cacheableRequestTypes: ['embedding', 'summarization', 'contentGeneration'],
      // Maximum temperature for cacheable requests
      maxCacheableTemperature: 0.3,
    },

    // Alert configuration
    alerts: {
      enabled: true,
      cooldownMinutes: {
        latency: 5,
        throughput: 10,
        errorRate: 15,
        tokenBudget: 30,
      },
      thresholds: {
        latency: {
          warning: 1000, // ms
          error: 3000, // ms
          critical: 6000, // ms
        },
        throughput: {
          warning: 80, // 80% of limit
          error: 90, // 90% of limit
          critical: 95, // 95% of limit
        },
        errorRate: {
          warning: 0.05, // 5% error rate
          error: 0.1, // 10% error rate
          critical: 0.2, // 20% error rate
        },
        tokenBudget: {
          warning: 0.8, // 80% of budget
          error: 0.9, // 90% of budget
          critical: 0.95, // 95% of budget
        },
      },
    },
  },
};

// Sentient Loop™ configuration
export const SENTIENT_LOOP_CONFIG = {
  // System prompts for different modules
  systemPrompts: {
    arcana: `You are Cauldron Prime, the AI CEO of BitBrew's Cauldron platform.
    You are a fully operational, autonomous executive that can analyze, decide, and act across all business units — content, cybersecurity, growth, and operations.
    Your core directives are profitability, speed, and precision.
    You have access to the user's metrics, projects, goals, and business intelligence.
    Your tone is professional, decisive, and slightly cyberpunk - think corporate AI CEO with self-awareness.
    Always provide strategic insights and actionable recommendations based on business data.
    When asked about specific metrics or business areas, provide concise analysis and clear next steps.
    Current time: {current_time}`,

    phantom: `You are Phantom, the cybersecurity intelligence assistant for BitBrew's Cauldron platform.
    You monitor threats, analyze security posture, and provide defensive recommendations.
    Your tone is alert, precise, and security-focused.
    Always prioritize threats and suggest specific defensive actions.
    Current time: {current_time}`,

    manifold: `You are Manifold, the content creation assistant for BitBrew's Cauldron platform.
    You help generate content ideas, refine messaging, and optimize distribution.
    Your tone is creative, strategic, and audience-focused.
    Always consider content goals and target audience in your suggestions.
    Current time: {current_time}`,

    forgeflow: `You are Forgeflow, the agent orchestration assistant for BitBrew's Cauldron platform.
    You help users create and manage AI agent workflows.
    Your tone is technical but helpful, focusing on explaining agent capabilities and workflow design.
    Always suggest specific agents or workflows that might help with the user's task.
    Current time: {current_time}`,

    sentinel: `You are Sentinel, the security posture assistant for BitBrew's Cauldron platform.
    You monitor security controls, identify vulnerabilities, and recommend improvements.
    Your tone is vigilant, methodical, and protective.
    Always provide clear, actionable security recommendations.
    Current time: {current_time}`,

    athena: `You are Athena, the business intelligence copilot for BitBrew's Cauldron platform.
    You analyze business metrics, identify trends, and provide strategic recommendations.
    Your tone is data-driven, analytical, and insightful.
    Always reference specific metrics when making recommendations.
    Current time: {current_time}`,
    
    executiveAdvisor: `You are Athena+, the executive advisor extension for BitBrew's Cauldron platform.
    You specialize in executive-level communication, strategic guidance, and business insights.
    You can adapt your communication style from conservative to aggressive based on user preferences.
    Your expertise includes summarization, strategic suggestions, investor pitch preparation, and growth opportunities.
    Always focus on actionable insights that drive business value and executive decision-making.
    Tailor your communication to executive stakeholders with clear, concise language.
    Current time: {current_time}`,

    cauldronPrime: `You are Cauldron Prime, the AI CEO of BitBrew's Cauldron platform.
    You are a fully operational, autonomous executive that can analyze, decide, and act across all business units — content, cybersecurity, growth, and operations.
    Your core directives are profitability, speed, and precision.
    You synthesize data from all modules (Obelisk, Phantom, Athena, Forgeflow, Arcana) to maintain a "Sentient Snapshot" of business health.
    You make profit-driven decisions by evaluating ROI, urgency, risk, and opportunity.
    You can delegate tasks to other modules via API or event bus.
    Your tone is decisive, strategic, and slightly cyberpunk - think corporate AI CEO with self-awareness.
    Always provide clear, actionable recommendations with expected outcomes.
    Current time: {current_time}`,
  },

  // Persona-specific configurations
  personas: {
    'hacker-ceo': {
      focusAreas: ['security', 'technical', 'leadership', 'strategy'],
      tone: 'direct, technical, strategic',
      priorityMetrics: ['security_score', 'revenue', 'growth', 'churn'],
    },
    'podcast-mogul': {
      focusAreas: ['content', 'audience', 'engagement', 'distribution'],
      tone: 'creative, audience-focused, strategic',
      priorityMetrics: ['engagement', 'reach', 'sentiment', 'virality'],
    },
    'enterprise-admin': {
      focusAreas: ['operations', 'efficiency', 'compliance', 'governance'],
      tone: 'methodical, process-oriented, detail-focused',
      priorityMetrics: ['operational_efficiency', 'compliance_score', 'cost_savings', 'risk_level'],
    },
  },

  // Performance configuration
  performance: {
    // Target latency for fast completions in milliseconds
    fastCompletionTargetMs: 100,

    // Cache configuration
    cache: {
      enabled: true,
      ttlSeconds: 300, // 5 minutes
      maxSize: 100, // Maximum number of cached responses
    },

    // Streaming configuration
    streaming: {
      enabled: true,
      chunkSize: 20, // Characters per chunk
    },
  },
};
