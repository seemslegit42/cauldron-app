/**
 * Enhanced Reasoning Service
 *
 * This service provides utilities for working with the enhanced AI reasoning chain
 * and prompt history schema. It extends the existing PromptReasoningService with
 * additional functionality for tracking detailed reasoning steps, managing prompt
 * templates, and annotating reasoning chains.
 */

import { prisma } from 'wasp/server';
import { HttpError } from 'wasp/server';
import { z } from 'zod';
import { PromptReasoningService } from './promptReasoningService';
import { LoggingService } from '../shared/services/logging';

// Input validation schemas
export const createReasoningStepSchema = z.object({
  reasoningId: z.string(),
  stepNumber: z.number().int().positive(),
  stepType: z.string(),
  content: z.string(),
  tokens: z.number().int().optional(),
  duration: z.number().int().optional(),
  metadata: z.record(z.any()).optional(),
});

export const createPromptTemplateSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  version: z.string().default("1.0.0"),
  content: z.string(),
  placeholders: z.array(z.string()),
  exampleValues: z.record(z.any()).optional(),
  module: z.string(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  safetyScore: z.number().min(0).max(1).optional(),
  estimatedTokens: z.number().int().positive().optional(),
  organizationId: z.string().optional(),
});

export const createFeedbackAnnotationSchema = z.object({
  reasoningId: z.string(),
  responseNodeId: z.string().optional(),
  annotationType: z.string(),
  content: z.string(),
  suggestedOutput: z.string().optional(),
  status: z.string().default("pending"),
  metadata: z.record(z.any()).optional(),
});

export const createEvaluationMetricSchema = z.object({
  reasoningId: z.string(),
  metricType: z.string(),
  score: z.number().min(0).max(1),
  evaluationMethod: z.string(),
  notes: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const createReasoningContextSchema = z.object({
  reasoningId: z.string(),
  contextType: z.string(),
  content: z.string(),
  source: z.string(),
  relevanceScore: z.number().min(0).max(1).optional(),
  metadata: z.record(z.any()).optional(),
});

export const createModelVersionSchema = z.object({
  modelName: z.string(),
  provider: z.string(),
  version: z.string(),
  capabilities: z.array(z.string()).default([]),
  parameters: z.record(z.any()).optional(),
  benchmarks: z.record(z.any()).optional(),
  isActive: z.boolean().default(true),
});

export const createPromptSafetyCheckSchema = z.object({
  promptId: z.string(),
  checkType: z.string(),
  score: z.number().min(0).max(1),
  passed: z.boolean(),
  details: z.record(z.any()).optional(),
});

// Input types
export type CreateReasoningStepInput = z.infer<typeof createReasoningStepSchema>;
export type CreatePromptTemplateInput = z.infer<typeof createPromptTemplateSchema>;
export type CreateFeedbackAnnotationInput = z.infer<typeof createFeedbackAnnotationSchema>;
export type CreateEvaluationMetricInput = z.infer<typeof createEvaluationMetricSchema>;
export type CreateReasoningContextInput = z.infer<typeof createReasoningContextSchema>;
export type CreateModelVersionInput = z.infer<typeof createModelVersionSchema>;
export type CreatePromptSafetyCheckInput = z.infer<typeof createPromptSafetyCheckSchema>;

/**
 * EnhancedReasoningService class for working with the enhanced AI reasoning chain
 * and prompt history schema
 */
export class EnhancedReasoningService extends PromptReasoningService {
  /**
   * Create a new reasoning step
   */
  static async createReasoningStep(userId: string, input: CreateReasoningStepInput) {
    try {
      const validatedInput = createReasoningStepSchema.parse(input);

      // Verify the reasoning exists and belongs to the user
      const reasoning = await prisma.aIReasoning.findFirst({
        where: {
          id: validatedInput.reasoningId,
          userId,
        },
      });

      if (!reasoning) {
        throw new HttpError(404, 'Reasoning not found or access denied');
      }

      const reasoningStep = await prisma.aIReasoningStep.create({
        data: validatedInput,
      });

      return reasoningStep;
    } catch (error) {
      LoggingService.error({
        message: 'Error creating reasoning step',
        module: 'ai-services',
        category: 'REASONING',
        error,
      });
      throw error;
    }
  }

  /**
   * Create a new prompt template
   */
  static async createPromptTemplate(userId: string, input: CreatePromptTemplateInput) {
    try {
      const validatedInput = createPromptTemplateSchema.parse(input);

      const promptTemplate = await prisma.aIPromptTemplate.create({
        data: {
          ...validatedInput,
          createdById: userId,
        },
      });

      return promptTemplate;
    } catch (error) {
      LoggingService.error({
        message: 'Error creating prompt template',
        module: 'ai-services',
        category: 'PROMPT_TEMPLATE',
        error,
      });
      throw error;
    }
  }

  /**
   * Create a prompt from a template
   */
  static async createPromptFromTemplate(
    userId: string,
    templateId: string,
    templateValues: Record<string, any>,
    options: {
      name?: string;
      description?: string;
      category?: string;
      tags?: string[];
      organizationId?: string;
    } = {}
  ) {
    try {
      // Get the template
      const template = await prisma.aIPromptTemplate.findUnique({
        where: { id: templateId },
      });

      if (!template) {
        throw new HttpError(404, 'Prompt template not found');
      }

      // Replace placeholders in the template content
      let content = template.content;
      for (const placeholder of template.placeholders) {
        const value = templateValues[placeholder];
        if (value) {
          content = content.replace(`{{${placeholder}}}`, value);
        }
      }

      // Create the prompt
      const prompt = await prisma.aIPrompt.create({
        data: {
          content,
          name: options.name || template.name,
          description: options.description || template.description,
          version: template.version,
          type: 'template_instance',
          module: template.module,
          category: options.category || template.category,
          tags: options.tags || template.tags,
          templateId: template.id,
          templateValues: templateValues,
          createdById: userId,
          organizationId: options.organizationId || template.organizationId,
        },
      });

      // Update template usage count
      await prisma.aIPromptTemplate.update({
        where: { id: templateId },
        data: {
          usageCount: { increment: 1 },
          lastUsedAt: new Date(),
        },
      });

      return prompt;
    } catch (error) {
      LoggingService.error({
        message: 'Error creating prompt from template',
        module: 'ai-services',
        category: 'PROMPT_TEMPLATE',
        error,
      });
      throw error;
    }
  }

  /**
   * Create a feedback annotation
   */
  static async createFeedbackAnnotation(
    userId: string,
    input: CreateFeedbackAnnotationInput
  ) {
    try {
      const validatedInput = createFeedbackAnnotationSchema.parse(input);

      const feedbackAnnotation = await prisma.aIFeedbackAnnotation.create({
        data: {
          ...validatedInput,
          annotatedBy: userId,
        },
      });

      return feedbackAnnotation;
    } catch (error) {
      LoggingService.error({
        message: 'Error creating feedback annotation',
        module: 'ai-services',
        category: 'FEEDBACK_ANNOTATION',
        error,
      });
      throw error;
    }
  }

  /**
   * Create an evaluation metric
   */
  static async createEvaluationMetric(
    userId: string,
    input: CreateEvaluationMetricInput
  ) {
    try {
      const validatedInput = createEvaluationMetricSchema.parse(input);

      const evaluationMetric = await prisma.aIEvaluationMetric.create({
        data: {
          ...validatedInput,
          evaluatedBy: userId,
        },
      });

      return evaluationMetric;
    } catch (error) {
      LoggingService.error({
        message: 'Error creating evaluation metric',
        module: 'ai-services',
        category: 'EVALUATION_METRIC',
        error,
      });
      throw error;
    }
  }

  /**
   * Create a reasoning context
   */
  static async createReasoningContext(input: CreateReasoningContextInput) {
    try {
      const validatedInput = createReasoningContextSchema.parse(input);

      const reasoningContext = await prisma.aIReasoningContext.create({
        data: validatedInput,
      });

      return reasoningContext;
    } catch (error) {
      LoggingService.error({
        message: 'Error creating reasoning context',
        module: 'ai-services',
        category: 'REASONING_CONTEXT',
        error,
      });
      throw error;
    }
  }

  /**
   * Create a model version
   */
  static async createModelVersion(input: CreateModelVersionInput) {
    try {
      const validatedInput = createModelVersionSchema.parse(input);

      const modelVersion = await prisma.aIModelVersion.create({
        data: validatedInput,
      });

      return modelVersion;
    } catch (error) {
      LoggingService.error({
        message: 'Error creating model version',
        module: 'ai-services',
        category: 'MODEL_VERSION',
        error,
      });
      throw error;
    }
  }

  /**
   * Create a prompt safety check
   */
  static async createPromptSafetyCheck(input: CreatePromptSafetyCheckInput) {
    try {
      const validatedInput = createPromptSafetyCheckSchema.parse(input);

      const promptSafetyCheck = await prisma.aIPromptSafetyCheck.create({
        data: validatedInput,
      });

      return promptSafetyCheck;
    } catch (error) {
      LoggingService.error({
        message: 'Error creating prompt safety check',
        module: 'ai-services',
        category: 'PROMPT_SAFETY',
        error,
      });
      throw error;
    }
  }

  /**
   * Get or create a model version
   */
  static async getOrCreateModelVersion(input: CreateModelVersionInput) {
    try {
      const validatedInput = createModelVersionSchema.parse(input);

      // Try to find existing model version
      let modelVersion = await prisma.aIModelVersion.findFirst({
        where: {
          modelName: validatedInput.modelName,
          provider: validatedInput.provider,
          version: validatedInput.version,
        },
      });

      // Create if not exists
      if (!modelVersion) {
        modelVersion = await prisma.aIModelVersion.create({
          data: validatedInput,
        });
      }

      return modelVersion;
    } catch (error) {
      LoggingService.error({
        message: 'Error getting or creating model version',
        module: 'ai-services',
        category: 'MODEL_VERSION',
        error,
      });
      throw error;
    }
  }

  /**
   * Track a reasoning chain with enhanced details
   */
  static async trackReasoningChain(
    userId: string,
    sessionId: string,
    promptId: string,
    model: string,
    temperature: number,
    rawOutput: string,
    options: {
      agentId?: string;
      systemPromptId?: string;
      steps?: any[];
      contextItems?: CreateReasoningContextInput[];
      reasoningChain?: any;
      confidenceScore?: number;
      parsedOutput?: any;
      maxTokens?: number;
      totalTokens?: number;
      promptTokens?: number;
      completionTokens?: number;
      latencyMs?: number;
      metadata?: any;
    } = {}
  ) {
    try {
      // Get or create model version
      const modelParts = model.split('-');
      const modelName = modelParts[0];
      const modelVersion = await EnhancedReasoningService.getOrCreateModelVersion({
        modelName: modelName,
        provider: 'groq', // Default provider, can be overridden
        version: model,
        capabilities: [],
        isActive: true
      });

      // Create the reasoning record
      const reasoning = await PromptReasoningService.storeReasoning(userId, {
        sessionId,
        promptId,
        systemPromptId: options.systemPromptId,
        agentId: options.agentId,
        steps: options.steps || [],
        rawOutput,
        parsedOutput: options.parsedOutput,
        model,
        temperature,
        maxTokens: options.maxTokens,
        totalTokens: options.totalTokens,
        promptTokens: options.promptTokens,
        completionTokens: options.completionTokens,
        latencyMs: options.latencyMs,
        success: true,
        metadata: {
          ...options.metadata,
          confidenceScore: options.confidenceScore,
          reasoningChain: options.reasoningChain,
        },
      });

      // Update with model version
      await prisma.aIReasoning.update({
        where: { id: reasoning.id },
        data: { modelVersionId: modelVersion.id },
      });

      // Store reasoning steps if provided
      if (options.steps && options.steps.length > 0) {
        for (let i = 0; i < options.steps.length; i++) {
          const step = options.steps[i];
          await EnhancedReasoningService.createReasoningStep(userId, {
            reasoningId: reasoning.id,
            stepNumber: i + 1,
            stepType: step.type || 'thought',
            content: step.content,
            tokens: step.tokens,
            duration: step.duration,
            metadata: step.metadata,
          });
        }
      }

      // Store context items if provided
      if (options.contextItems && options.contextItems.length > 0) {
        for (const contextItem of options.contextItems) {
          await EnhancedReasoningService.createReasoningContext({
            reasoningId: reasoning.id,
            ...contextItem,
          });
        }
      }

      return reasoning;
    } catch (error) {
      LoggingService.error({
        message: 'Error tracking reasoning chain',
        module: 'ai-services',
        category: 'REASONING_CHAIN',
        error,
      });
      throw error;
    }
  }
}
