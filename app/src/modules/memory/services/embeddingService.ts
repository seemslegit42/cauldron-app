/**
 * Embedding Service
 * 
 * Handles the generation of vector embeddings for memory entries
 * to enable semantic search and retrieval.
 */

import { EmbeddingRequest } from '../types';
import { trackedGroqInference } from '../../../ai-services/trackedGroqInference';
import { logger } from '../../../shared/logger';

/**
 * Generate embeddings for text using Groq's embedding model
 * 
 * @param text The text to generate embeddings for
 * @param userId The user ID for tracking
 * @param metadata Additional metadata for tracking
 * @returns A vector embedding as an array of numbers
 */
export async function generateEmbedding(
  { text, userId, metadata = {} }: EmbeddingRequest
): Promise<number[]> {
  try {
    // Normalize the text by removing extra whitespace
    const normalizedText = text.trim().replace(/\s+/g, ' ');
    
    // Use Groq's embedding model to generate the embedding
    const response = await trackedGroqInference({
      model: 'llama3-embedding-v1',
      input: normalizedText,
      userId,
      purpose: 'memory-embedding',
      metadata: {
        ...metadata,
        textLength: normalizedText.length,
        operation: 'generate-embedding',
      },
    });

    if (!response || !response.embedding) {
      throw new Error('Failed to generate embedding: No embedding returned');
    }

    return response.embedding;
  } catch (error) {
    logger.error('Error generating embedding:', { error, textLength: text.length, userId });
    // Return a zero vector as fallback (not ideal but prevents system failure)
    return new Array(1536).fill(0);
  }
}

/**
 * Calculate cosine similarity between two vectors
 * 
 * @param vecA First vector
 * @param vecB Second vector
 * @returns Similarity score between 0 and 1
 */
export function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same dimensions');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Prepare text for embedding by extracting the most relevant content
 * 
 * @param content The content to prepare for embedding
 * @returns A string ready for embedding
 */
export function prepareTextForEmbedding(content: any): string {
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