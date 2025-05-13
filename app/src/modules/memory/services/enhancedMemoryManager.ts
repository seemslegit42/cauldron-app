/**
 * Enhanced Memory Manager Service
 * 
 * Provides a comprehensive interface for working with the enhanced memory system.
 * Supports vector-based semantic search, temporal querying, and memory persistence.
 */

import { prisma } from 'wasp/server';
import { 
  MemoryEntryType, 
  TemporalReferenceType,
  EnhancedMemoryEntry,
  TemporalReference,
  MemoryQueryOptions,
  VectorSearchResult
} from '../types';
import { generateEmbedding, calculateCosineSimilarity } from './embeddingService';
import { extractTemporalReferences } from './temporalMemoryService';
import { LoggingService } from '@src/shared/services/logging';

/**
 * Store a new memory entry
 * 
 * @param memoryEntry The memory entry to store
 * @returns The stored memory entry with its ID
 */
export async function storeMemory(memoryEntry: Omit<EnhancedMemoryEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<EnhancedMemoryEntry> {
  try {
    // Set default values
    const entry = {
      ...memoryEntry,
      importance: memoryEntry.importance || 1.0,
      metadata: memoryEntry.metadata || {},
    };

    // Set expiration for short-term memories if not provided
    if (entry.type === MemoryEntryType.SHORT_TERM && !entry.expiresAt) {
      const expirationHours = 24; // Default 24-hour expiration for short-term memories
      entry.expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000);
    }

    // Generate text for embedding
    const textToEmbed = prepareTextForEmbedding(entry.content);
    
    // Extract temporal references if not already provided
    if (!entry.temporalReferences || entry.temporalReferences.length === 0) {
      const extractedReferences = await extractTemporalReferences(textToEmbed, entry.userId);
      entry.temporalReferences = extractedReferences.map(ref => ({
        type: ref.type,
        value: ref.value,
        startDate: ref.startDate,
        endDate: ref.endDate,
        recurrencePattern: ref.recurrencePattern,
        milestone: ref.milestone
      }));
    }
    
    // Generate embedding
    const embedding = await generateEmbedding({
      text: textToEmbed,
      userId: entry.userId,
      metadata: {
        memoryType: entry.type,
        contentType: entry.contentType,
        context: entry.context,
      },
    });

    // Store the memory entry
    const storedEntry = await prisma.enhancedMemoryEntry.create({
      data: {
        userId: entry.userId,
        agentId: entry.agentId,
        sessionId: entry.sessionId,
        type: entry.type,
        contentType: entry.contentType,
        context: entry.context,
        content: entry.content,
        embedding,
        importance: entry.importance,
        expiresAt: entry.expiresAt,
        metadata: entry.metadata,
        temporalReferences: {
          create: entry.temporalReferences.map(ref => ({
            type: ref.type,
            value: ref.value,
            startDate: ref.startDate,
            endDate: ref.endDate,
            recurrencePattern: ref.recurrencePattern,
            milestone: ref.milestone
          }))
        }
      },
      include: {
        temporalReferences: true
      }
    });

    LoggingService.info({
      message: `Stored memory: ${storedEntry.id}`,
      module: 'memory',
      category: 'MEMORY_MANAGER',
      metadata: {
        memoryId: storedEntry.id,
        userId: entry.userId,
        agentId: entry.agentId,
        type: entry.type,
        contentType: entry.contentType,
        context: entry.context
      }
    });

    return storedEntry;
  } catch (error) {
    LoggingService.error({
      message: 'Error storing memory',
      module: 'memory',
      category: 'MEMORY_MANAGER',
      error,
      metadata: {
        userId: memoryEntry.userId,
        agentId: memoryEntry.agentId,
        type: memoryEntry.type,
        contentType: memoryEntry.contentType,
        context: memoryEntry.context
      }
    });
    throw error;
  }
}

/**
 * Retrieve memories based on query options
 * 
 * @param userId The user ID to retrieve memories for
 * @param options Query options
 * @returns Array of memory entries
 */
export async function retrieveMemories(
  userId: string,
  options: MemoryQueryOptions = {}
): Promise<EnhancedMemoryEntry[]> {
  try {
    const {
      agentId,
      sessionId,
      type,
      contentType,
      context,
      limit = 10,
      offset = 0,
      sortBy = 'createdAt',
      sortDirection = 'desc',
      includeExpired = false,
      startDate,
      endDate
    } = options;

    // Build the where clause
    const where: any = {
      userId,
      ...(agentId && { agentId }),
      ...(sessionId && { sessionId }),
      ...(type && { type }),
      ...(contentType && { contentType }),
      ...(context && { context }),
      ...(!includeExpired && { 
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      }),
      ...(startDate && endDate && {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      })
    };

    // Execute the query
    const memories = await prisma.enhancedMemoryEntry.findMany({
      where,
      include: {
        temporalReferences: true
      },
      orderBy: {
        [sortBy]: sortDirection
      },
      skip: offset,
      take: limit
    });

    return memories;
  } catch (error) {
    LoggingService.error({
      message: 'Error retrieving memories',
      module: 'memory',
      category: 'MEMORY_MANAGER',
      error,
      metadata: {
        userId,
        ...options
      }
    });
    return [];
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
export async function searchMemories(
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
      ...(contentType && { contentType }),
      ...(!includeExpired && { 
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      }),
    };

    const memories = await prisma.enhancedMemoryEntry.findMany({
      where: whereClause,
      orderBy: { importance: 'desc' },
      take: limit * 3, // Fetch more than needed to filter by similarity
      include: {
        temporalReferences: true
      }
    });

    // Calculate similarity scores and filter by threshold
    const results = memories
      .filter(memory => memory.embedding && memory.embedding.length > 0)
      .map(memory => {
        const similarity = calculateCosineSimilarity(queryEmbedding, memory.embedding);
        return {
          id: memory.id,
          content: memory.content,
          context: memory.context,
          contentType: memory.contentType,
          similarity,
          createdAt: memory.createdAt,
          temporalReferences: memory.temporalReferences
        };
      })
      .filter(result => result.similarity >= similarityThreshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return results;
  } catch (error) {
    LoggingService.error({
      message: 'Error performing semantic search',
      module: 'memory',
      category: 'MEMORY_MANAGER',
      error,
      metadata: {
        userId,
        query,
        ...options
      }
    });
    return [];
  }
}

/**
 * Helper function to prepare text for embedding
 */
function prepareTextForEmbedding(content: any): string {
  if (typeof content === 'string') {
    return content;
  }
  
  if (typeof content === 'object') {
    // If it's a memory object with specific fields we care about
    if (content.text) return content.text;
    if (content.summary) return content.summary;
    if (content.description) return content.description;
    if (content.title) return content.title;
    
    // For decision or task memories
    if (content.decision) return `${content.decision} ${content.reasoning || ''}`;
    if (content.task) return `${content.task} ${content.outcome || ''}`;
    
    // For conversation memories
    if (content.messages && Array.isArray(content.messages)) {
      return content.messages.map((msg: any) => 
        typeof msg === 'string' ? msg : msg.content || ''
      ).join(' ');
    }
    
    // Fallback to JSON stringification
    return JSON.stringify(content);
  }
  
  return String(content);
}
