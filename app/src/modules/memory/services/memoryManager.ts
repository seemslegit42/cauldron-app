/**
 * Memory Manager Service
 * 
 * Core service for storing, retrieving, and managing AI task memory and context.
 * Provides a unified interface for working with both short-term and long-term memories.
 * Supports temporal awareness and memory recall across time periods.
 */

import { prisma } from '../../../../prisma/client';
import { 
  MemoryEntry, 
  MemoryType, 
  MemoryContentType, 
  MemoryQueryOptions,
  MemoryStats,
  VectorSearchResult,
  TemporalReference
} from '../types';
import { semanticSearch, storeVectorEmbedding, updateEmbedding } from './vectorStore';
import { generateEmbedding, prepareTextForEmbedding } from './embeddingService';
import { extractTemporalReferences } from './temporalMemoryService';
import { logger } from '../../../shared/logger';

/**
 * Store a new memory entry
 * 
 * @param memoryEntry The memory entry to store
 * @returns The stored memory entry with its ID
 */
export async function storeMemory(memoryEntry: MemoryEntry): Promise<MemoryEntry> {
  try {
    // Set default values
    const entry: MemoryEntry = {
      ...memoryEntry,
      importance: memoryEntry.importance || 1.0,
      metadata: memoryEntry.metadata || {},
    };

    // Set expiration for short-term memories if not provided
    if (entry.type === MemoryType.SHORT_TERM && !entry.expiresAt) {
      const expirationHours = 24; // Default 24-hour expiration for short-term memories
      entry.expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000);
    }

    // Generate text for embedding
    const textToEmbed = prepareTextForEmbedding(entry.content);
    
    // Extract temporal references if not already provided
    if (!entry.temporalReferences) {
      entry.temporalReferences = await extractTemporalReferences(textToEmbed, entry.userId);
    }
    
    // Add temporal references to metadata
    if (entry.temporalReferences && entry.temporalReferences.length > 0) {
      entry.metadata = {
        ...entry.metadata,
        temporalReferences: entry.temporalReferences,
      };
    }
    
    // Generate embedding
    entry.embedding = await generateEmbedding({
      text: textToEmbed,
      userId: entry.userId,
      metadata: {
        memoryType: entry.type,
        contentType: entry.contentType,
        context: entry.context,
        temporalReferences: entry.temporalReferences,
      },
    });

    // Store in database
    const storedMemory = await prisma.interactionMemory.create({
      data: {
        userId: entry.userId,
        agentId: entry.agentId || '',
        sessionId: entry.sessionId,
        type: entry.contentType,
        content: entry.content,
        importance: entry.importance,
        expiresAt: entry.expiresAt,
        embedding: entry.embedding,
        metadata: entry.metadata || {},
      },
    });

    return {
      ...entry,
      id: storedMemory.id,
      createdAt: storedMemory.createdAt,
      updatedAt: storedMemory.updatedAt,
    };
  } catch (error) {
    logger.error('Error storing memory:', { error, userId: memoryEntry.userId });
    throw new Error(`Failed to store memory: ${error.message}`);
  }
}

/**
 * Retrieve memories based on query options
 * 
 * @param options Query options for retrieving memories
 * @returns Array of memory entries matching the query
 */
export async function retrieveMemories(options: MemoryQueryOptions): Promise<MemoryEntry[]> {
  try {
    const {
      userId,
      agentId,
      sessionId,
      context,
      contentType,
      type,
      limit = 10,
      minImportance = 0,
      includeExpired = false,
    } = options;

    // Build the where clause
    const whereClause: any = {
      userId,
      ...(agentId && { agentId }),
      ...(sessionId && { sessionId }),
      ...(context && { metadata: { path: ['context'], equals: context } }),
      ...(contentType && { type: contentType }),
      importance: { gte: minImportance },
      ...(!includeExpired && { 
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      }),
    };

    // Retrieve memories from database
    const memories = await prisma.interactionMemory.findMany({
      where: whereClause,
      orderBy: [
        { importance: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    });

    // Map to MemoryEntry format
    return memories.map(memory => ({
      id: memory.id,
      userId: memory.userId,
      agentId: memory.agentId,
      sessionId: memory.sessionId || undefined,
      type: memory.type.includes('SHORT_TERM') ? MemoryType.SHORT_TERM : MemoryType.LONG_TERM,
      contentType: memory.type as MemoryContentType,
      context: memory.metadata?.context || '',
      content: memory.content,
      importance: memory.importance,
      expiresAt: memory.expiresAt || undefined,
      metadata: memory.metadata || {},
      embedding: memory.embedding,
    }));
  } catch (error) {
    logger.error('Error retrieving memories:', { error, userId: options.userId });
    return [];
  }
}

/**
 * Search for memories using semantic similarity
 * 
 * @param query The query text to search for
 * @param userId The user ID to search within
 * @param options Additional search options
 * @returns Array of memory entries matching the query
 */
export async function searchMemories(
  query: string,
  userId: string,
  options: Partial<MemoryQueryOptions> = {}
): Promise<MemoryEntry[]> {
  try {
    const {
      agentId,
      sessionId,
      contentType,
      limit = 5,
      minImportance = 0,
      similarityThreshold = 0.7,
      includeExpired = false,
    } = options;

    // Perform semantic search
    const searchResults = await semanticSearch(query, userId, {
      agentId,
      sessionId,
      contentType,
      limit,
      similarityThreshold,
      includeExpired,
    });

    // Fetch full memory entries for the search results
    const memoryIds = searchResults.map(result => result.id);
    
    if (memoryIds.length === 0) {
      return [];
    }

    const memories = await prisma.interactionMemory.findMany({
      where: {
        id: { in: memoryIds },
        importance: { gte: minImportance },
      },
    });

    // Map to MemoryEntry format and sort by similarity
    const memoryMap = new Map(memories.map(memory => [memory.id, memory]));
    
    return searchResults
      .filter(result => memoryMap.has(result.id))
      .map(result => {
        const memory = memoryMap.get(result.id)!;
        return {
          id: memory.id,
          userId: memory.userId,
          agentId: memory.agentId,
          sessionId: memory.sessionId || undefined,
          type: memory.type.includes('SHORT_TERM') ? MemoryType.SHORT_TERM : MemoryType.LONG_TERM,
          contentType: memory.type as MemoryContentType,
          context: memory.metadata?.context || '',
          content: memory.content,
          importance: memory.importance,
          expiresAt: memory.expiresAt || undefined,
          metadata: {
            ...memory.metadata,
            similarity: result.similarity,
          },
          embedding: memory.embedding,
        };
      });
  } catch (error) {
    logger.error('Error searching memories:', { error, userId, query });
    return [];
  }
}

/**
 * Update an existing memory entry
 * 
 * @param memoryId The ID of the memory to update
 * @param updates The fields to update
 * @returns The updated memory entry
 */
export async function updateMemory(
  memoryId: string,
  updates: Partial<MemoryEntry>
): Promise<MemoryEntry> {
  try {
    const memory = await prisma.interactionMemory.findUnique({
      where: { id: memoryId },
    });

    if (!memory) {
      throw new Error(`Memory not found: ${memoryId}`);
    }

    // Check if content is being updated
    const contentUpdated = updates.content !== undefined && 
      JSON.stringify(updates.content) !== JSON.stringify(memory.content);

    // If content is updated, generate new embedding
    let embedding = memory.embedding;
    if (contentUpdated && updates.content) {
      const textToEmbed = prepareTextForEmbedding(updates.content);
      embedding = await generateEmbedding({
        text: textToEmbed,
        userId: memory.userId,
        metadata: {
          memoryId,
          operation: 'update-memory',
        },
      });
    }

    // Update the memory
    const updatedMemory = await prisma.interactionMemory.update({
      where: { id: memoryId },
      data: {
        ...(updates.agentId !== undefined && { agentId: updates.agentId }),
        ...(updates.sessionId !== undefined && { sessionId: updates.sessionId }),
        ...(updates.contentType !== undefined && { type: updates.contentType }),
        ...(updates.content !== undefined && { content: updates.content }),
        ...(updates.importance !== undefined && { importance: updates.importance }),
        ...(updates.expiresAt !== undefined && { expiresAt: updates.expiresAt }),
        ...(updates.metadata !== undefined && { metadata: updates.metadata }),
        ...(contentUpdated && { embedding }),
      },
    });

    // Map to MemoryEntry format
    return {
      id: updatedMemory.id,
      userId: updatedMemory.userId,
      agentId: updatedMemory.agentId,
      sessionId: updatedMemory.sessionId || undefined,
      type: updatedMemory.type.includes('SHORT_TERM') ? MemoryType.SHORT_TERM : MemoryType.LONG_TERM,
      contentType: updatedMemory.type as MemoryContentType,
      context: updatedMemory.metadata?.context || '',
      content: updatedMemory.content,
      importance: updatedMemory.importance,
      expiresAt: updatedMemory.expiresAt || undefined,
      metadata: updatedMemory.metadata || {},
      embedding: updatedMemory.embedding,
    };
  } catch (error) {
    logger.error('Error updating memory:', { error, memoryId });
    throw new Error(`Failed to update memory: ${error.message}`);
  }
}

/**
 * Delete a memory entry
 * 
 * @param memoryId The ID of the memory to delete
 */
export async function deleteMemory(memoryId: string): Promise<void> {
  try {
    await prisma.interactionMemory.delete({
      where: { id: memoryId },
    });
  } catch (error) {
    logger.error('Error deleting memory:', { error, memoryId });
    throw new Error(`Failed to delete memory: ${error.message}`);
  }
}

/**
 * Get memory statistics for a user
 * 
 * @param userId The user ID to get statistics for
 * @returns Memory statistics
 */
export async function getMemoryStats(userId: string): Promise<MemoryStats> {
  try {
    // Get total count
    const totalCount = await prisma.interactionMemory.count({
      where: { userId },
    });

    // Get counts by type
    const shortTermCount = await prisma.interactionMemory.count({
      where: {
        userId,
        type: { contains: 'SHORT_TERM' },
      },
    });

    const longTermCount = totalCount - shortTermCount;

    // Get counts by content type
    const contentTypeCounts = await prisma.$queryRaw<Array<{ type: string; count: number }>>`
      SELECT type, COUNT(*) as count
      FROM "InteractionMemory"
      WHERE "userId" = ${userId}
      GROUP BY type
    `;

    const byContentType = contentTypeCounts.reduce((acc, { type, count }) => {
      acc[type as MemoryContentType] = Number(count);
      return acc;
    }, {} as Record<MemoryContentType, number>);

    // Get average importance
    const importanceResult = await prisma.$queryRaw<Array<{ avg: number }>>`
      SELECT AVG(importance) as avg
      FROM "InteractionMemory"
      WHERE "userId" = ${userId}
    `;
    const averageImportance = Number(importanceResult[0]?.avg || 0);

    // Get oldest and newest entries
    const oldestEntry = await prisma.interactionMemory.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true },
    });

    const newestEntry = await prisma.interactionMemory.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    return {
      totalEntries: totalCount,
      shortTermCount,
      longTermCount,
      byContentType,
      averageImportance,
      oldestEntry: oldestEntry?.createdAt || new Date(),
      newestEntry: newestEntry?.createdAt || new Date(),
    };
  } catch (error) {
    logger.error('Error getting memory stats:', { error, userId });
    return {
      totalEntries: 0,
      shortTermCount: 0,
      longTermCount: 0,
      byContentType: {} as Record<MemoryContentType, number>,
      averageImportance: 0,
      oldestEntry: new Date(),
      newestEntry: new Date(),
    };
  }
}

/**
 * Clean up expired memories
 * 
 * @returns Number of memories deleted
 */
export async function cleanupExpiredMemories(): Promise<number> {
  try {
    const result = await prisma.interactionMemory.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
    
    return result.count;
  } catch (error) {
    logger.error('Error cleaning up expired memories:', { error });
    return 0;
  }
}