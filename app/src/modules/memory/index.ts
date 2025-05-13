/**
 * Memory Module - Provides task history, interaction logs, and context persistence
 * 
 * This module enables agents to maintain context across interactions by:
 * 1. Storing recent task history, decisions, and outcomes
 * 2. Providing vector-based retrieval of relevant past interactions
 * 3. Supporting long-horizon coherence and personalization
 */

export * from './services/memoryManager';
export * from './services/vectorStore';
export * from './services/embeddingService';
export * from './types';