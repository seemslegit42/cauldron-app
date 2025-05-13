/**
 * Memory Module Types
 */

// Legacy enum - keep for backward compatibility
export enum MemoryType {
  SHORT_TERM = 'SHORT_TERM',
  LONG_TERM = 'LONG_TERM',
}

// Enhanced enum for new memory system
export enum MemoryEntryType {
  SHORT_TERM = 'SHORT_TERM',
  LONG_TERM = 'LONG_TERM',
}

export enum MemoryContentType {
  CONVERSATION = 'conversation',
  FACT = 'fact',
  PREFERENCE = 'preference',
  TASK = 'task',
  DECISION = 'decision',
  OUTCOME = 'outcome',
  FEEDBACK = 'feedback',
  EVENT = 'event',        // For time-based events
  COMPARISON = 'comparison', // For comparative analysis
}

export enum TemporalReferenceType {
  ABSOLUTE = 'ABSOLUTE',  // Specific date/time
  RELATIVE = 'RELATIVE',  // "3 days ago", "last week"
  RECURRING = 'RECURRING', // "every Monday", "monthly"
  SEASONAL = 'SEASONAL',  // "summer 2023", "Q4"
  MILESTONE = 'MILESTONE', // "product launch", "version 2.0 release"
}

export interface TemporalReference {
  id?: string;
  memoryEntryId?: string;
  type: TemporalReferenceType;
  value: string;
  startDate?: Date;
  endDate?: Date;
  recurrencePattern?: string;
  milestone?: string;
  createdAt?: Date;
}

// Legacy interface - keep for backward compatibility
export interface MemoryEntry {
  id?: string;
  userId: string;
  agentId?: string;
  sessionId?: string;
  type: MemoryType;
  contentType: MemoryContentType;
  context: string;
  content: any;
  importance: number;
  expiresAt?: Date;
  metadata?: Record<string, any>;
  embedding?: number[];
  temporalReferences?: TemporalReference[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Enhanced interface for new memory system
export interface EnhancedMemoryEntry {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  agentId?: string;
  sessionId?: string;
  type: MemoryEntryType;
  contentType: string;
  context: string;
  content: any;
  embedding: number[];
  importance: number;
  expiresAt?: Date;
  metadata?: Record<string, any>;
  temporalReferences: TemporalReference[];
}

export interface MemoryQueryOptions {
  userId: string;
  agentId?: string;
  sessionId?: string;
  context?: string;
  contentType?: MemoryContentType;
  type?: MemoryType;
  limit?: number;
  minImportance?: number;
  query?: string;
  similarityThreshold?: number;
  includeExpired?: boolean;
  temporalQuery?: string;
  startDate?: Date;
  endDate?: Date;
  timeframe?: string;
  compareTo?: string;
}

export interface VectorSearchResult {
  id: string;
  content: any;
  context: string;
  contentType: MemoryContentType;
  similarity: number;
  createdAt: Date;
  temporalReferences?: TemporalReference[];
}

export interface EmbeddingVector {
  id: string;
  vector: number[];
  metadata: Record<string, any>;
}

export interface EmbeddingRequest {
  text: string;
  userId: string;
  metadata?: Record<string, any>;
}

export interface MemoryStats {
  totalEntries: number;
  shortTermCount: number;
  longTermCount: number;
  byContentType: Record<MemoryContentType, number>;
  averageImportance: number;
  oldestEntry: Date;
  newestEntry: Date;
  temporalDistribution?: Record<string, number>; // Distribution by time periods
}

export interface TemporalQueryResult {
  memories: MemoryEntry[];
  timeframe: {
    description: string;
    startDate?: Date;
    endDate?: Date;
  };
  summary?: string;
}

export interface MemoryComparison {
  period1: {
    description: string;
    startDate: Date;
    endDate: Date;
    memories: MemoryEntry[];
    summary?: string;
  };
  period2: {
    description: string;
    startDate: Date;
    endDate: Date;
    memories: MemoryEntry[];
    summary?: string;
  };
  differences?: string[];
  similarities?: string[];
}