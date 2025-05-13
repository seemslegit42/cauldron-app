import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import { z } from 'zod';
import { ensureArgsSchemaOrThrowHttpError } from '../../server/validation';

// Input schema for getReasoningChains
export const getReasoningChainsInputSchema = z.object({
  module: z.string().optional(),
  model: z.string().optional(),
  agentId: z.string().optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  success: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().positive().optional().default(1),
  pageSize: z.number().positive().optional().default(20),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type GetReasoningChainsInput = z.infer<typeof getReasoningChainsInputSchema>;

/**
 * Get reasoning chains with filtering and pagination
 */
export const getReasoningChains = async (args: GetReasoningChainsInput, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'Unauthorized');
  }
  
  // Validate input
  const validatedArgs = ensureArgsSchemaOrThrowHttpError(getReasoningChainsInputSchema, args);
  
  // Build the query
  const where: any = {};
  
  // Filter by module
  if (validatedArgs.module) {
    where.session = {
      module: validatedArgs.module,
    };
  }
  
  // Filter by model
  if (validatedArgs.model) {
    where.model = validatedArgs.model;
  }
  
  // Filter by agentId
  if (validatedArgs.agentId) {
    where.agentId = validatedArgs.agentId;
  }
  
  // Filter by userId
  if (validatedArgs.userId) {
    where.userId = validatedArgs.userId;
  }
  
  // Filter by sessionId
  if (validatedArgs.sessionId) {
    where.sessionId = validatedArgs.sessionId;
  }
  
  // Filter by success
  if (validatedArgs.success !== undefined) {
    where.success = validatedArgs.success;
  }
  
  // Search by rawOutput
  if (validatedArgs.search) {
    where.rawOutput = {
      contains: validatedArgs.search,
      mode: 'insensitive',
    };
  }
  
  // Calculate pagination
  const skip = (validatedArgs.page - 1) * validatedArgs.pageSize;
  
  // Get reasoning chains
  try {
    const reasoningChains = await prisma.aIReasoning.findMany({
      where,
      orderBy: {
        [validatedArgs.sortBy]: validatedArgs.sortOrder,
      },
      skip,
      take: validatedArgs.pageSize,
      include: {
        session: {
          select: {
            id: true,
            module: true,
            sessionType: true,
            status: true,
          },
        },
        prompt: {
          select: {
            id: true,
            name: true,
            type: true,
            module: true,
          },
        },
        systemPrompt: {
          select: {
            id: true,
            name: true,
            module: true,
            model: true,
          },
        },
        agent: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        responseNodes: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
    
    // Get total count
    const totalCount = await prisma.aIReasoning.count({ where });
    
    return {
      reasoningChains,
      pagination: {
        page: validatedArgs.page,
        pageSize: validatedArgs.pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / validatedArgs.pageSize),
      },
    };
  } catch (error) {
    console.error('Error getting reasoning chains:', error);
    throw new HttpError(500, 'Failed to get reasoning chains');
  }
};

// Input schema for getReasoningChainById
export const getReasoningChainByIdInputSchema = z.object({
  id: z.string(),
});

export type GetReasoningChainByIdInput = z.infer<typeof getReasoningChainByIdInputSchema>;

/**
 * Get a reasoning chain by ID
 */
export const getReasoningChainById = async (args: GetReasoningChainByIdInput, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'Unauthorized');
  }
  
  // Validate input
  const validatedArgs = ensureArgsSchemaOrThrowHttpError(getReasoningChainByIdInputSchema, args);
  
  // Get reasoning chain
  try {
    const reasoningChain = await prisma.aIReasoning.findUnique({
      where: {
        id: validatedArgs.id,
      },
      include: {
        session: true,
        prompt: true,
        systemPrompt: true,
        agent: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        responseNodes: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
    
    if (!reasoningChain) {
      throw new HttpError(404, 'Reasoning chain not found');
    }
    
    return reasoningChain;
  } catch (error) {
    console.error('Error getting reasoning chain:', error);
    throw new HttpError(500, 'Failed to get reasoning chain');
  }
};

// Input schema for getResponseNodesByReasoningId
export const getResponseNodesByReasoningIdInputSchema = z.object({
  reasoningId: z.string(),
});

export type GetResponseNodesByReasoningIdInput = z.infer<typeof getResponseNodesByReasoningIdInputSchema>;

/**
 * Get response nodes for a reasoning chain
 */
export const getResponseNodesByReasoningId = async (args: GetResponseNodesByReasoningIdInput, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'Unauthorized');
  }
  
  // Validate input
  const validatedArgs = ensureArgsSchemaOrThrowHttpError(getResponseNodesByReasoningIdInputSchema, args);
  
  // Get response nodes
  try {
    const responseNodes = await prisma.aIResponseNode.findMany({
      where: {
        reasoningId: validatedArgs.reasoningId,
      },
      orderBy: {
        order: 'asc',
      },
    });
    
    return responseNodes;
  } catch (error) {
    console.error('Error getting response nodes:', error);
    throw new HttpError(500, 'Failed to get response nodes');
  }
};
