/**
 * Memory System
 * 
 * This file provides functionality for storing and retrieving memories.
 */

import { LoggingService } from '@src/shared/services/logging';

// Memory types
export enum MemoryType {
  SHORT_TERM = 'short_term',
  LONG_TERM = 'long_term',
}

// Memory interface
export interface Memory {
  id: string;
  userId: string;
  type: MemoryType;
  context: string;
  content: any;
  importance: number;
  createdAt: Date;
  expiresAt?: Date;
}

// Feedback interface
export interface Feedback {
  id: string;
  userId: string;
  rating: number;
  comment?: string;
  memoryId?: string;
  workflowExecutionId?: string;
  createdAt: Date;
}

// In-memory storage for memories (in a real implementation, this would be in a database)
const memories: Memory[] = [];

// In-memory storage for feedback (in a real implementation, this would be in a database)
const feedbacks: Feedback[] = [];

/**
 * Stores a memory
 */
export async function storeMemory(
  userId: string,
  type: MemoryType,
  context: string,
  content: any,
  importance: number = 3,
  expiresAt?: Date
): Promise<Memory> {
  // Log the storage
  LoggingService.info({
    message: `Storing ${type} memory for context: ${context}`,
    userId,
    module: 'forgeflow',
    category: 'MEMORY_SYSTEM',
    metadata: {
      memoryType: type,
      context,
      importance,
      contentKeys: Object.keys(content),
    },
  });
  
  // Create the memory
  const memory: Memory = {
    id: `mem-${Date.now()}`,
    userId,
    type,
    context,
    content,
    importance,
    createdAt: new Date(),
    expiresAt,
  };
  
  // Store the memory
  memories.push(memory);
  
  return memory;
}

/**
 * Retrieves memories for a context
 */
export async function retrieveMemories(
  userId: string,
  context: string,
  limit: number = 10
): Promise<Memory[]> {
  // Log the retrieval
  LoggingService.info({
    message: `Retrieving memories for context: ${context}`,
    userId,
    module: 'forgeflow',
    category: 'MEMORY_SYSTEM',
    metadata: {
      context,
      limit,
    },
  });
  
  // Find memories for the context
  const contextMemories = memories
    .filter(m => m.userId === userId && m.context === context)
    .sort((a, b) => {
      // Sort by importance (descending) and then by creation date (descending)
      if (a.importance !== b.importance) {
        return b.importance - a.importance;
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    })
    .slice(0, limit);
  
  return contextMemories;
}

/**
 * Stores feedback
 */
export async function storeFeedback(
  userId: string,
  rating: number,
  comment?: string,
  memoryId?: string,
  workflowExecutionId?: string
): Promise<Feedback> {
  // Log the feedback
  LoggingService.info({
    message: `Storing feedback with rating: ${rating}`,
    userId,
    module: 'forgeflow',
    category: 'MEMORY_SYSTEM',
    metadata: {
      rating,
      hasComment: !!comment,
      memoryId,
      workflowExecutionId,
    },
  });
  
  // Create the feedback
  const feedback: Feedback = {
    id: `fb-${Date.now()}`,
    userId,
    rating,
    comment,
    memoryId,
    workflowExecutionId,
    createdAt: new Date(),
  };
  
  // Store the feedback
  feedbacks.push(feedback);
  
  return feedback;
}
