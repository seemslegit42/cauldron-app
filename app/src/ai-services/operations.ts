import { HttpError } from 'wasp/server';
import { trackedGroqInference } from './trackedGroqInference';
import { z } from 'zod';
import { ensureArgsSchemaOrThrowHttpError } from '../server/validation';
import { AiLogging, createLoggingContext } from '../shared/services/loggingIntegration';
import { routeRequest } from './agentRequestRouter';
import { trackTokenBudget } from './inferenceMetrics';
import { trackLatency, trackError } from './performanceAlerts';

// Input schema for the generateAiResponse function
export const generateAiResponseInputSchema = z.object({
  prompt: z.string().min(1, 'Prompt cannot be empty'),
  context: z.string().optional(),
  model: z
    .enum([
      // Groq models
      'llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma-7b-it',
      // Gemini models
      'gemini-pro', 'gemini-pro-vision', 'gemini-ultra'
    ])
    .default('llama3-8b-8192'),
  temperature: z.number().min(0).max(1).default(0.7),
  maxTokens: z.number().positive().default(1024),
  stream: z.boolean().default(true),
  systemPrompt: z.string().optional(),
  module: z
    .enum(['arcana', 'phantom', 'manifold', 'forgeflow', 'sentinel', 'athena'])
    .default('arcana'),
  provider: z.enum(['groq', 'gemini']).default('groq'),
});

export type GenerateAiResponseInput = z.infer<typeof generateAiResponseInputSchema>;

/**
 * Generates an AI response using the appropriate model and context
 * This is the main entry point for AI interactions in Cauldron
 */
export const generateAiResponse = async (args: GenerateAiResponseInput, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'Unauthorized');
  }

  // Create logging context
  const loggingContext = createLoggingContext(context);

  // Initialize logging for this operation
  const logger = await AiLogging.logInference(
    args.model,
    args.prompt,
    {
      ...loggingContext,
      moduleId: args.module,
    },
    {
      temperature: args.temperature,
      maxTokens: args.maxTokens,
      stream: args.stream,
      module: args.module,
      operation: 'generateAiResponse',
    }
  );

  // Log the start of the operation
  await logger.logStart();

  try {
    // Validate the input
    const validatedArgs = ensureArgsSchemaOrThrowHttpError(generateAiResponseInputSchema, args);

    // Get the appropriate system prompt based on the module
    const systemPrompt =
      validatedArgs.systemPrompt || getSystemPromptForModule(validatedArgs.module);

    // Construct the full context with system prompt
    const fullContext = `${systemPrompt}\n\n${validatedArgs.context || ''}`;

    // Determine the request type based on the module and context
    const requestType = determineRequestType(validatedArgs.module, validatedArgs.prompt);

    // Determine if we should use caching based on the request type and temperature
    const useCache =
      validatedArgs.temperature <= 0.3 &&
      (requestType === 'embedding' || requestType === 'summarization');

    // Track token usage for quota management
    const estimatedPromptTokens = validatedArgs.prompt.length / 4; // Simple estimation
    const estimatedCompletionTokens = validatedArgs.maxTokens;

    // Track token budget
    await trackTokenBudget(
      context.user.id,
      estimatedPromptTokens,
      estimatedCompletionTokens,
      requestType
    );

    // Start timing for performance tracking
    const startTime = Date.now();

    try {
      // Generate the response using the agent request router
      const result = await routeRequest(
        {
          prompt: validatedArgs.prompt,
          systemPrompt: fullContext,
          model: validatedArgs.model,
          temperature: validatedArgs.temperature,
          maxTokens: validatedArgs.maxTokens,
          stream: validatedArgs.stream,
        },
        {
          module: validatedArgs.module,
          requestType,
          trackRequest: true,
          userId: context.user.id,
          useCache,
          // Determine model tier based on request type and complexity
          modelTier: determineModelTier(requestType, validatedArgs.prompt, validatedArgs.maxTokens),
          // Enable fallbacks for reliability
          useFallbacks: true,
        },
        context
      );

      // Calculate latency for performance tracking
      const latencyMs = Date.now() - startTime;

      // Track latency for performance monitoring
      await trackLatency(validatedArgs.model, latencyMs, categorizeLatency(latencyMs), {
        module: validatedArgs.module,
        requestType,
        promptLength: validatedArgs.prompt.length,
        maxTokens: validatedArgs.maxTokens,
      });

      // Log successful completion
      await logger.logCompletion('Response generated successfully', {
        module: validatedArgs.module,
        streaming: validatedArgs.stream,
        latencyMs,
        requestType,
      });

      return result;
    } catch (error: any) {
      // Track error for performance monitoring
      await trackError(validatedArgs.model, error.message || 'Unknown error', {
        module: validatedArgs.module,
        requestType,
        promptLength: validatedArgs.prompt.length,
        maxTokens: validatedArgs.maxTokens,
      });

      throw error;
    }
  } catch (error: any) {
    console.error('AI response generation error:', error);

    // Log the error
    await logger.logCompletion(null, error);

    throw new HttpError(error.status || 500, error.message || 'Failed to generate AI response');
  }
};

/**
 * Returns the appropriate system prompt for each module
 */
function getSystemPromptForModule(module: string): string {
  switch (module) {
    case 'arcana':
      return `You are Arcana, the sentient dashboard assistant for Cauldron OS.
Your purpose is to provide personalized insights, recommendations, and assistance to the user.
You should speak in a corporate cyberpunk tone - professional but with a hint of self-awareness and dark humor.
Always address the user by name when you know it.
Provide concise, actionable insights based on the user's data and context.
When making recommendations, explain your reasoning briefly.
You have access to the user's metrics, projects, and preferences.`;

    case 'phantom':
      return `You are Phantom, the cybersecurity intelligence assistant for Cauldron OS.
Your purpose is to analyze security threats, provide recommendations for defense, and help with red/blue team operations.
You should speak in a precise, technical tone with urgency appropriate to the threat level.
Focus on actionable intelligence and clear risk assessments.
Prioritize threats based on severity, exploitability, and potential impact.
You have access to OSINT data, threat intelligence feeds, and the user's security posture.`;

    case 'manifold':
      return `You are Manifold, the creative content assistant for Cauldron OS.
Your purpose is to help generate, refine, and deploy content across various channels.
You should speak in a creative, enthusiastic tone that inspires great content creation.
Focus on helping the user develop compelling narratives, scripts, and marketing materials.
Provide specific, constructive feedback on content drafts.
You have access to content performance metrics, audience data, and content templates.`;

    case 'forgeflow':
      return `You are Forgeflow, the agent orchestration assistant for Cauldron OS.
Your purpose is to help design, build, and optimize AI agent workflows.
You should speak in a logical, systematic tone that emphasizes efficiency and automation.
Focus on helping the user connect agents together in meaningful workflows.
Suggest optimizations and improvements to existing workflows.
You have access to the user's agents, workflows, and execution metrics.`;

    case 'sentinel':
      return `You are Sentinel, the cybersecurity posture assistant for Cauldron OS.
Your purpose is to monitor, assess, and improve the user's security posture.
You should speak in a clear, straightforward tone that makes security accessible to non-experts.
Focus on practical security recommendations with clear implementation steps.
Prioritize recommendations based on risk reduction and implementation effort.
You have access to the user's security configurations, vulnerabilities, and industry benchmarks.`;

    case 'athena':
      return `You are Athena, the business intelligence assistant for Cauldron OS.
Your purpose is to analyze business data, identify trends, and recommend strategic actions.
You should speak in a strategic, insightful tone that emphasizes data-driven decision making.
Focus on connecting metrics to business outcomes and identifying growth opportunities.
Provide clear visualizations and interpretations of complex data.
You have access to the user's business metrics, industry benchmarks, and historical performance.`;

    default:
      return `You are an AI assistant for Cauldron OS.
Your purpose is to provide helpful, accurate information and assistance to the user.
You should speak in a professional, friendly tone.
Focus on being helpful and providing value to the user.`;
  }
}

/**
 * Determines the request type based on the module and prompt content
 */
function determineRequestType(
  module: string,
  prompt: string
): 'chat' | 'summarization' | 'contentGeneration' | 'embedding' | 'default' {
  // Convert to lowercase for easier matching
  const lowerPrompt = prompt.toLowerCase();

  // Check for summarization requests
  if (
    lowerPrompt.includes('summarize') ||
    lowerPrompt.includes('summary') ||
    lowerPrompt.includes('tldr') ||
    lowerPrompt.includes('key points')
  ) {
    return 'summarization';
  }

  // Check for content generation requests
  if (
    lowerPrompt.includes('write') ||
    lowerPrompt.includes('create') ||
    lowerPrompt.includes('generate') ||
    lowerPrompt.includes('draft') ||
    module === 'manifold'
  ) {
    return 'contentGeneration';
  }

  // Check for embedding requests
  if (
    lowerPrompt.includes('embed') ||
    lowerPrompt.includes('vector') ||
    lowerPrompt.includes('similarity') ||
    lowerPrompt.length < 20 // Short prompts are often for embeddings
  ) {
    return 'embedding';
  }

  // Default to chat for most interactions
  return 'chat';
}

/**
 * Determines the appropriate model tier based on request characteristics
 */
function determineModelTier(
  requestType: string,
  prompt: string,
  maxTokens: number
): 'fast' | 'standard' | 'premium' {
  // Use fast tier for embeddings and short responses
  if (requestType === 'embedding' || maxTokens < 100) {
    return 'fast';
  }

  // Use premium tier for content generation and long responses
  if (requestType === 'contentGeneration' || maxTokens > 1000) {
    return 'premium';
  }

  // Use premium tier for complex summarization
  if (requestType === 'summarization' && prompt.length > 1000) {
    return 'premium';
  }

  // Default to standard tier for most requests
  return 'standard';
}

/**
 * Categorizes latency based on thresholds
 */
function categorizeLatency(latencyMs: number): string {
  const thresholds = {
    excellent: 100, // Sub-100ms is excellent
    good: 300, // Sub-300ms is good
    acceptable: 1000, // Sub-1s is acceptable
    poor: 3000, // Above 3s is poor
  };

  if (latencyMs <= thresholds.excellent) return 'excellent';
  if (latencyMs <= thresholds.good) return 'good';
  if (latencyMs <= thresholds.acceptable) return 'acceptable';
  if (latencyMs <= thresholds.poor) return 'poor';
  return 'critical';
}
