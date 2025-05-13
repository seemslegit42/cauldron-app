/**
 * Prompt Reasoning Service
 * 
 * This service provides functionality for storing and retrieving AI prompts,
 * reasoning chains, and response trees. It supports transparency, auditing,
 * and supervised fine-tuning.
 */

import { prisma } from 'wasp/server';
import { HttpError } from 'wasp/server';
import { z } from 'zod';

// Input validation schemas
export const createPromptSchema = z.object({
  content: z.string().min(1, "Prompt content cannot be empty"),
  name: z.string().optional(),
  description: z.string().optional(),
  version: z.string().default("1.0.0"),
  type: z.string(),
  module: z.string(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  templateVariables: z.record(z.any()).optional(),
  safetyScore: z.number().min(0).max(1).optional(),
  estimatedTokens: z.number().positive().optional(),
  organizationId: z.string().optional(),
});

export const createSystemPromptSchema = z.object({
  content: z.string().min(1, "System prompt content cannot be empty"),
  name: z.string(),
  description: z.string().optional(),
  version: z.string().default("1.0.0"),
  module: z.string(),
  model: z.string(),
  isDefault: z.boolean().default(false),
  promptId: z.string().optional(),
  organizationId: z.string().optional(),
});

export const createReasoningSchema = z.object({
  sessionId: z.string(),
  promptId: z.string(),
  systemPromptId: z.string().optional(),
  agentId: z.string().optional(),
  steps: z.array(z.record(z.any())),
  rawOutput: z.string(),
  parsedOutput: z.record(z.any()).optional(),
  model: z.string(),
  temperature: z.number().min(0).max(1),
  maxTokens: z.number().positive().optional(),
  totalTokens: z.number().positive().optional(),
  promptTokens: z.number().positive().optional(),
  completionTokens: z.number().positive().optional(),
  latencyMs: z.number().positive().optional(),
  success: z.boolean().default(true),
  error: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const createResponseNodeSchema = z.object({
  reasoningId: z.string(),
  parentId: z.string().optional(),
  content: z.string(),
  type: z.string(),
  order: z.number().int(),
  metadata: z.record(z.any()).optional(),
  confidence: z.number().min(0).max(1).optional(),
});

export const createSessionSchema = z.object({
  userId: z.string(),
  agentId: z.string().optional(),
  module: z.string(),
  sessionType: z.string(),
  status: z.string().default("active"),
  metadata: z.record(z.any()).optional(),
});

// Type definitions
export type CreatePromptInput = z.infer<typeof createPromptSchema>;
export type CreateSystemPromptInput = z.infer<typeof createSystemPromptSchema>;
export type CreateReasoningInput = z.infer<typeof createReasoningSchema>;
export type CreateResponseNodeInput = z.infer<typeof createResponseNodeSchema>;
export type CreateSessionInput = z.infer<typeof createSessionSchema>;

/**
 * PromptReasoningService class for managing AI prompts, reasoning chains, and response trees
 */
export class PromptReasoningService {
  /**
   * Create a new AI prompt
   */
  static async createPrompt(userId: string, input: CreatePromptInput) {
    try {
      const validatedInput = createPromptSchema.parse(input);
      
      const prompt = await prisma.aIPrompt.create({
        data: {
          ...validatedInput,
          createdById: userId,
        },
      });
      
      return prompt;
    } catch (error) {
      console.error('Error creating AI prompt:', error);
      throw new HttpError(500, 'Failed to create AI prompt');
    }
  }
  
  /**
   * Create a new system prompt
   */
  static async createSystemPrompt(userId: string, input: CreateSystemPromptInput) {
    try {
      const validatedInput = createSystemPromptSchema.parse(input);
      
      const systemPrompt = await prisma.aISystemPrompt.create({
        data: {
          ...validatedInput,
          createdById: userId,
        },
      });
      
      return systemPrompt;
    } catch (error) {
      console.error('Error creating system prompt:', error);
      throw new HttpError(500, 'Failed to create system prompt');
    }
  }
  
  /**
   * Create a new AI session
   */
  static async createSession(input: CreateSessionInput) {
    try {
      const validatedInput = createSessionSchema.parse(input);
      
      const session = await prisma.aISession.create({
        data: validatedInput,
      });
      
      return session;
    } catch (error) {
      console.error('Error creating AI session:', error);
      throw new HttpError(500, 'Failed to create AI session');
    }
  }
  
  /**
   * Store AI reasoning chain
   */
  static async storeReasoning(userId: string, input: CreateReasoningInput) {
    try {
      const validatedInput = createReasoningSchema.parse(input);
      
      const reasoning = await prisma.aIReasoning.create({
        data: {
          ...validatedInput,
          userId,
        },
      });
      
      return reasoning;
    } catch (error) {
      console.error('Error storing AI reasoning:', error);
      throw new HttpError(500, 'Failed to store AI reasoning');
    }
  }
  
  /**
   * Store AI response node
   */
  static async storeResponseNode(input: CreateResponseNodeInput) {
    try {
      const validatedInput = createResponseNodeSchema.parse(input);
      
      const responseNode = await prisma.aIResponseNode.create({
        data: validatedInput,
      });
      
      return responseNode;
    } catch (error) {
      console.error('Error storing AI response node:', error);
      throw new HttpError(500, 'Failed to store AI response node');
    }
  }
  
  /**
   * Complete a session
   */
  static async completeSession(sessionId: string, feedback?: any, totalTokens?: number, totalLatencyMs?: number) {
    try {
      const session = await prisma.aISession.update({
        where: { id: sessionId },
        data: {
          status: 'completed',
          completedAt: new Date(),
          feedback: feedback || undefined,
          totalTokens: totalTokens || undefined,
          totalLatencyMs: totalLatencyMs || undefined,
        },
      });
      
      return session;
    } catch (error) {
      console.error('Error completing AI session:', error);
      throw new HttpError(500, 'Failed to complete AI session');
    }
  }
  
  /**
   * Get prompts by module
   */
  static async getPromptsByModule(module: string, limit: number = 100) {
    try {
      const prompts = await prisma.aIPrompt.findMany({
        where: {
          module,
          isActive: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
      });
      
      return prompts;
    } catch (error) {
      console.error('Error getting prompts by module:', error);
      throw new HttpError(500, 'Failed to get prompts by module');
    }
  }
  
  /**
   * Get system prompts by module and model
   */
  static async getSystemPromptsByModuleAndModel(module: string, model: string) {
    try {
      const systemPrompts = await prisma.aISystemPrompt.findMany({
        where: {
          module,
          model,
          isActive: true,
        },
        orderBy: {
          isDefault: 'desc',
        },
      });
      
      return systemPrompts;
    } catch (error) {
      console.error('Error getting system prompts:', error);
      throw new HttpError(500, 'Failed to get system prompts');
    }
  }
  
  /**
   * Get reasoning chains by session
   */
  static async getReasoningChainsBySession(sessionId: string) {
    try {
      const reasoningChains = await prisma.aIReasoning.findMany({
        where: {
          sessionId,
        },
        include: {
          responseNodes: {
            orderBy: {
              order: 'asc',
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
      
      return reasoningChains;
    } catch (error) {
      console.error('Error getting reasoning chains:', error);
      throw new HttpError(500, 'Failed to get reasoning chains');
    }
  }
}
