/**
 * Memory API Operations
 * 
 * API endpoints for interacting with the memory system.
 */

import { z } from 'zod';
import { 
  storeMemory, 
  retrieveMemories, 
  searchMemories, 
  updateMemory, 
  deleteMemory,
  getMemoryStats
} from '../services/memoryManager';
import { MemoryContentType, MemoryType } from '../types';
import { logger } from '../../../shared/logger';

/**
 * Store a new memory entry
 */
export const storeMemoryOperation = async (args: any, context: any) => {
  try {
    // Validate input
    const schema = z.object({
      userId: z.string(),
      agentId: z.string().optional(),
      sessionId: z.string().optional(),
      type: z.enum([MemoryType.SHORT_TERM, MemoryType.LONG_TERM]),
      contentType: z.enum([
        MemoryContentType.CONVERSATION,
        MemoryContentType.FACT,
        MemoryContentType.PREFERENCE,
        MemoryContentType.TASK,
        MemoryContentType.DECISION,
        MemoryContentType.OUTCOME,
        MemoryContentType.FEEDBACK,
      ]),
      context: z.string(),
      content: z.any(),
      importance: z.number().min(0).max(5).default(1.0),
      expiresAt: z.date().optional(),
      metadata: z.record(z.any()).optional(),
    });

    const validatedArgs = schema.parse(args);

    // Ensure the user has permission
    if (context.user?.id !== validatedArgs.userId && !context.user?.isAdmin) {
      throw new Error('Unauthorized: Cannot store memory for another user');
    }

    // Store the memory
    const result = await storeMemory(validatedArgs);
    return result;
  } catch (error) {
    logger.error('Error in storeMemoryOperation:', { error, args });
    throw new Error(`Failed to store memory: ${error.message}`);
  }
};

/**
 * Retrieve memories based on query options
 */
export const retrieveMemoriesOperation = async (args: any, context: any) => {
  try {
    // Validate input
    const schema = z.object({
      userId: z.string(),
      agentId: z.string().optional(),
      sessionId: z.string().optional(),
      context: z.string().optional(),
      contentType: z.enum([
        MemoryContentType.CONVERSATION,
        MemoryContentType.FACT,
        MemoryContentType.PREFERENCE,
        MemoryContentType.TASK,
        MemoryContentType.DECISION,
        MemoryContentType.OUTCOME,
        MemoryContentType.FEEDBACK,
      ]).optional(),
      type: z.enum([MemoryType.SHORT_TERM, MemoryType.LONG_TERM]).optional(),
      limit: z.number().positive().default(10),
      minImportance: z.number().min(0).max(5).default(0),
      includeExpired: z.boolean().default(false),
    });

    const validatedArgs = schema.parse(args);

    // Ensure the user has permission
    if (context.user?.id !== validatedArgs.userId && !context.user?.isAdmin) {
      throw new Error('Unauthorized: Cannot retrieve memories for another user');
    }

    // Retrieve the memories
    const result = await retrieveMemories(validatedArgs);
    return result;
  } catch (error) {
    logger.error('Error in retrieveMemoriesOperation:', { error, args });
    throw new Error(`Failed to retrieve memories: ${error.message}`);
  }
};

/**
 * Search for memories using semantic similarity
 */
export const searchMemoriesOperation = async (args: any, context: any) => {
  try {
    // Validate input
    const schema = z.object({
      query: z.string(),
      userId: z.string(),
      agentId: z.string().optional(),
      sessionId: z.string().optional(),
      contentType: z.enum([
        MemoryContentType.CONVERSATION,
        MemoryContentType.FACT,
        MemoryContentType.PREFERENCE,
        MemoryContentType.TASK,
        MemoryContentType.DECISION,
        MemoryContentType.OUTCOME,
        MemoryContentType.FEEDBACK,
      ]).optional(),
      limit: z.number().positive().default(5),
      minImportance: z.number().min(0).max(5).default(0),
      similarityThreshold: z.number().min(0).max(1).default(0.7),
      includeExpired: z.boolean().default(false),
    });

    const validatedArgs = schema.parse(args);

    // Ensure the user has permission
    if (context.user?.id !== validatedArgs.userId && !context.user?.isAdmin) {
      throw new Error('Unauthorized: Cannot search memories for another user');
    }

    // Search the memories
    const { query, userId, ...options } = validatedArgs;
    const result = await searchMemories(query, userId, options);
    return result;
  } catch (error) {
    logger.error('Error in searchMemoriesOperation:', { error, args });
    throw new Error(`Failed to search memories: ${error.message}`);
  }
};

/**
 * Update an existing memory entry
 */
export const updateMemoryOperation = async (args: any, context: any) => {
  try {
    // Validate input
    const schema = z.object({
      memoryId: z.string(),
      updates: z.object({
        agentId: z.string().optional(),
        sessionId: z.string().optional(),
        contentType: z.enum([
          MemoryContentType.CONVERSATION,
          MemoryContentType.FACT,
          MemoryContentType.PREFERENCE,
          MemoryContentType.TASK,
          MemoryContentType.DECISION,
          MemoryContentType.OUTCOME,
          MemoryContentType.FEEDBACK,
        ]).optional(),
        context: z.string().optional(),
        content: z.any().optional(),
        importance: z.number().min(0).max(5).optional(),
        expiresAt: z.date().optional(),
        metadata: z.record(z.any()).optional(),
      }),
    });

    const validatedArgs = schema.parse(args);

    // Check if the memory exists and belongs to the user
    const memory = await context.entities.InteractionMemory.findUnique({
      where: { id: validatedArgs.memoryId },
    });

    if (!memory) {
      throw new Error(`Memory not found: ${validatedArgs.memoryId}`);
    }

    // Ensure the user has permission
    if (context.user?.id !== memory.userId && !context.user?.isAdmin) {
      throw new Error('Unauthorized: Cannot update memory for another user');
    }

    // Update the memory
    const result = await updateMemory(validatedArgs.memoryId, validatedArgs.updates);
    return result;
  } catch (error) {
    logger.error('Error in updateMemoryOperation:', { error, args });
    throw new Error(`Failed to update memory: ${error.message}`);
  }
};

/**
 * Delete a memory entry
 */
export const deleteMemoryOperation = async (args: any, context: any) => {
  try {
    // Validate input
    const schema = z.object({
      memoryId: z.string(),
    });

    const validatedArgs = schema.parse(args);

    // Check if the memory exists and belongs to the user
    const memory = await context.entities.InteractionMemory.findUnique({
      where: { id: validatedArgs.memoryId },
    });

    if (!memory) {
      throw new Error(`Memory not found: ${validatedArgs.memoryId}`);
    }

    // Ensure the user has permission
    if (context.user?.id !== memory.userId && !context.user?.isAdmin) {
      throw new Error('Unauthorized: Cannot delete memory for another user');
    }

    // Delete the memory
    await deleteMemory(validatedArgs.memoryId);
    return { success: true };
  } catch (error) {
    logger.error('Error in deleteMemoryOperation:', { error, args });
    throw new Error(`Failed to delete memory: ${error.message}`);
  }
};

/**
 * Get memory statistics for a user
 */
export const getMemoryStatsOperation = async (args: any, context: any) => {
  try {
    // Validate input
    const schema = z.object({
      userId: z.string(),
    });

    const validatedArgs = schema.parse(args);

    // Ensure the user has permission
    if (context.user?.id !== validatedArgs.userId && !context.user?.isAdmin) {
      throw new Error('Unauthorized: Cannot get memory stats for another user');
    }

    // Get the memory stats
    const result = await getMemoryStats(validatedArgs.userId);
    return result;
  } catch (error) {
    logger.error('Error in getMemoryStatsOperation:', { error, args });
    throw new Error(`Failed to get memory stats: ${error.message}`);
  }
};