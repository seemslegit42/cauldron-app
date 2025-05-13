import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import { z } from 'zod';
import { ensureArgsSchemaOrThrowHttpError } from '../../server/validation';

// Input schema for getPrompts
export const getPromptsInputSchema = z.object({
  module: z.string().optional(),
  type: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().optional(),
  page: z.number().positive().optional().default(1),
  pageSize: z.number().positive().optional().default(20),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type GetPromptsInput = z.infer<typeof getPromptsInputSchema>;

/**
 * Get prompts with filtering and pagination
 */
export const getPrompts = async (args: GetPromptsInput, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'Unauthorized');
  }
  
  // Validate input
  const validatedArgs = ensureArgsSchemaOrThrowHttpError(getPromptsInputSchema, args);
  
  // Build the query
  const where: any = {};
  
  // Filter by module
  if (validatedArgs.module) {
    where.module = validatedArgs.module;
  }
  
  // Filter by type
  if (validatedArgs.type) {
    where.type = validatedArgs.type;
  }
  
  // Filter by category
  if (validatedArgs.category) {
    where.category = validatedArgs.category;
  }
  
  // Filter by tags
  if (validatedArgs.tags && validatedArgs.tags.length > 0) {
    where.tags = {
      hasSome: validatedArgs.tags,
    };
  }
  
  // Search by content or name
  if (validatedArgs.search) {
    where.OR = [
      {
        content: {
          contains: validatedArgs.search,
          mode: 'insensitive',
        },
      },
      {
        name: {
          contains: validatedArgs.search,
          mode: 'insensitive',
        },
      },
    ];
  }
  
  // Calculate pagination
  const skip = (validatedArgs.page - 1) * validatedArgs.pageSize;
  
  // Get prompts
  try {
    const prompts = await prisma.aIPrompt.findMany({
      where,
      orderBy: {
        [validatedArgs.sortBy]: validatedArgs.sortOrder,
      },
      skip,
      take: validatedArgs.pageSize,
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
    
    // Get total count
    const totalCount = await prisma.aIPrompt.count({ where });
    
    return {
      prompts,
      pagination: {
        page: validatedArgs.page,
        pageSize: validatedArgs.pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / validatedArgs.pageSize),
      },
    };
  } catch (error) {
    console.error('Error getting prompts:', error);
    throw new HttpError(500, 'Failed to get prompts');
  }
};

// Input schema for getSystemPrompts
export const getSystemPromptsInputSchema = z.object({
  module: z.string().optional(),
  model: z.string().optional(),
  isDefault: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().positive().optional().default(1),
  pageSize: z.number().positive().optional().default(20),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type GetSystemPromptsInput = z.infer<typeof getSystemPromptsInputSchema>;

/**
 * Get system prompts with filtering and pagination
 */
export const getSystemPrompts = async (args: GetSystemPromptsInput, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'Unauthorized');
  }
  
  // Validate input
  const validatedArgs = ensureArgsSchemaOrThrowHttpError(getSystemPromptsInputSchema, args);
  
  // Build the query
  const where: any = {};
  
  // Filter by module
  if (validatedArgs.module) {
    where.module = validatedArgs.module;
  }
  
  // Filter by model
  if (validatedArgs.model) {
    where.model = validatedArgs.model;
  }
  
  // Filter by isDefault
  if (validatedArgs.isDefault !== undefined) {
    where.isDefault = validatedArgs.isDefault;
  }
  
  // Search by content or name
  if (validatedArgs.search) {
    where.OR = [
      {
        content: {
          contains: validatedArgs.search,
          mode: 'insensitive',
        },
      },
      {
        name: {
          contains: validatedArgs.search,
          mode: 'insensitive',
        },
      },
    ];
  }
  
  // Calculate pagination
  const skip = (validatedArgs.page - 1) * validatedArgs.pageSize;
  
  // Get system prompts
  try {
    const systemPrompts = await prisma.aISystemPrompt.findMany({
      where,
      orderBy: {
        [validatedArgs.sortBy]: validatedArgs.sortOrder,
      },
      skip,
      take: validatedArgs.pageSize,
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        prompt: true,
      },
    });
    
    // Get total count
    const totalCount = await prisma.aISystemPrompt.count({ where });
    
    return {
      systemPrompts,
      pagination: {
        page: validatedArgs.page,
        pageSize: validatedArgs.pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / validatedArgs.pageSize),
      },
    };
  } catch (error) {
    console.error('Error getting system prompts:', error);
    throw new HttpError(500, 'Failed to get system prompts');
  }
};
