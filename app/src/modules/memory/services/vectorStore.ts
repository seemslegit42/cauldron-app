/**
 * Vector Store Service
 * 
 * Manages the storage and retrieval of vector embeddings for memory entries.
 * Provides semantic search capabilities using vector similarity.
 */

import { prisma } from '../../../../prisma/client';
import { EmbeddingVector, MemoryEntry, VectorSearchResult } from '../types';
import { calculateCosineSimilarity, generateEmbedding, prepareTextForEmbedding } from './embeddingService';
import { logger } from '../../../shared/logger';

/**
 * Store a vector embedding in the database
 * 
 * @param memoryEntry The memory entry to store
 * @returns The stored memory entry with its embedding
 */
export async function storeVectorEmbedding(memoryEntry: MemoryEntry): Promise<MemoryEntry> {
  try {
    // Generate embedding if not already provided
    if (!memoryEntry.embedding) {
      const textToEmbed = prepareTextForEmbedding(memoryEntry.content);
      memoryEntry.embedding = await generateEmbedding({
        text: textToEmbed,
        userId: memoryEntry.userId,
        metadata: {
          memoryType: memoryEntry.type,
          contentType: memoryEntry.contentType,
          context: memoryEntry.context,
        },
      });
    }

    // Store the embedding in the database
    await prisma.interactionMemory.create({
      data: {
        userId: memoryEntry.userId,
        agentId: memoryEntry.agentId || '',
        sessionId: memoryEntry.sessionId,
        type: memoryEntry.contentType,
        content: memoryEntry.content,
        importance: memoryEntry.importance,
        expiresAt: memoryEntry.expiresAt,
        embedding: memoryEntry.embedding,
        metadata: memoryEntry.metadata || {},
      },
    });

    return memoryEntry;
  } catch (error) {
    logger.error('Error storing vector embedding:', { error, userId: memoryEntry.userId });
    throw new Error(`Failed to store vector embedding: ${error.message}`);
  }
}

/**
 * Perform a semantic search using vector similarity
 * 
 * @param query The query text to search for
 * @param userId The user ID to search within
 * @param options Additional search options
 * @returns Array of search results sorted by similarity
 */
export async function semanticSearch(
  query: string,
  userId: string,
  options: {
    agentId?: string;
    sessionId?: string;
    contentType?: string;
    limit?: number;
    similarityThreshold?: number;
    includeExpired?: boolean;
  } = {}
): Promise<VectorSearchResult[]> {
  try {
    const {
      agentId,
      sessionId,
      contentType,
      limit = 5,
      similarityThreshold = 0.7,
      includeExpired = false,
    } = options;

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding({
      text: query,
      userId,
      metadata: { operation: 'semantic-search' },
    });

    // Fetch all relevant memory entries
    const whereClause: any = {
      userId,
      ...(agentId && { agentId }),
      ...(sessionId && { sessionId }),
      ...(contentType && { type: contentType }),
      ...(!includeExpired && { 
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      }),
    };

    const memories = await prisma.interactionMemory.findMany({
      where: whereClause,
      orderBy: { importance: 'desc' },
      take: limit * 3, // Fetch more than needed to filter by similarity
    });

    // Calculate similarity scores and filter by threshold
    const results = memories
      .filter(memory => memory.embedding)
      .map(memory => {
        const similarity = calculateCosineSimilarity(queryEmbedding, memory.embedding);
        return {
          id: memory.id,
          content: memory.content,
          context: memory.type,
          contentType: memory.type,
          similarity,
          createdAt: memory.createdAt,
        };
      })
      .filter(result => result.similarity >= similarityThreshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return results;
  } catch (error) {
    logger.error('Error performing semantic search:', { error, userId, query });
    return [];
  }
}

/**
 * Update the embedding for an existing memory entry
 * 
 * @param memoryId The ID of the memory entry to update
 * @param content The new content to generate an embedding for
 * @returns The updated memory entry
 */
export async function updateEmbedding(memoryId: string, content: any): Promise<void> {
  try {
    const memory = await prisma.interactionMemory.findUnique({
      where: { id: memoryId },
    });

    if (!memory) {
      throw new Error(`Memory entry not found: ${memoryId}`);
    }

    const textToEmbed = prepareTextForEmbedding(content);
    const embedding = await generateEmbedding({
      text: textToEmbed,
      userId: memory.userId,
      metadata: {
        memoryId,
        operation: 'update-embedding',
      },
    });

    await prisma.interactionMemory.update({
      where: { id: memoryId },
      data: {
        content,
        embedding,
      },
    });
  } catch (error) {
    logger.error('Error updating embedding:', { error, memoryId });
    throw new Error(`Failed to update embedding: ${error.message}`);
  }
}