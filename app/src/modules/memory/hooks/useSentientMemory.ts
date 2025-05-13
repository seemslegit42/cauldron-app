/**
 * useSentientMemory Hook
 * 
 * React hook for integrating the memory system with the Sentient Loop.
 * Provides memory persistence and retrieval for AI agents.
 */

import { useCallback } from 'react';
import { useMemory } from './useMemory';
import { MemoryContentType, MemoryType } from '../types';
import { useAuth } from '../../../shared/hooks/useAuth';

export interface SentientMemoryOptions {
  agentId?: string;
  sessionId?: string;
  module?: string;
  importance?: number;
  expiresInHours?: number;
}

export function useSentientMemory() {
  const { user } = useAuth();
  const { 
    storeMemory, 
    retrieveMemories, 
    searchMemories, 
    updateMemory, 
    deleteMemory,
    isStoring,
    error
  } = useMemory();

  /**
   * Store a memory in the Sentient Loop context
   */
  const rememberInLoop = useCallback(
    async (
      content: any,
      contentType: MemoryContentType,
      context: string,
      options: SentientMemoryOptions = {}
    ) => {
      if (!user) return null;

      const {
        agentId,
        sessionId,
        module,
        importance = 1.0,
        expiresInHours,
      } = options;

      // Calculate expiration date if provided
      let expiresAt: Date | undefined;
      if (expiresInHours) {
        expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + expiresInHours);
      }

      // Determine memory type based on importance and expiration
      const type = expiresInHours ? MemoryType.SHORT_TERM : MemoryType.LONG_TERM;

      // Store the memory
      return storeMemory({
        userId: user.id,
        agentId,
        sessionId,
        type,
        contentType,
        context,
        content,
        importance,
        expiresAt,
        metadata: {
          module,
          timestamp: new Date().toISOString(),
          source: 'sentient-loop',
        },
      });
    },
    [user, storeMemory]
  );

  /**
   * Retrieve memories relevant to the current context
   */
  const recallFromLoop = useCallback(
    async (
      context: string,
      options: {
        contentType?: MemoryContentType;
        agentId?: string;
        sessionId?: string;
        limit?: number;
        minImportance?: number;
      } = {}
    ) => {
      if (!user) return [];

      return retrieveMemories({
        userId: user.id,
        context,
        ...options,
      });
    },
    [user, retrieveMemories]
  );

  /**
   * Search for memories semantically related to a query
   */
  const searchInLoop = useCallback(
    async (
      query: string,
      options: {
        contentType?: MemoryContentType;
        agentId?: string;
        sessionId?: string;
        context?: string;
        limit?: number;
        minImportance?: number;
        similarityThreshold?: number;
      } = {}
    ) => {
      if (!user) return [];

      return searchMemories(query, {
        userId: user.id,
        ...options,
      });
    },
    [user, searchMemories]
  );

  /**
   * Store a conversation memory
   */
  const rememberConversation = useCallback(
    (content: any, context: string, options: SentientMemoryOptions = {}) => {
      return rememberInLoop(content, MemoryContentType.CONVERSATION, context, {
        importance: 1.0,
        expiresInHours: 24,
        ...options,
      });
    },
    [rememberInLoop]
  );

  /**
   * Store a task memory
   */
  const rememberTask = useCallback(
    (content: any, context: string, options: SentientMemoryOptions = {}) => {
      return rememberInLoop(content, MemoryContentType.TASK, context, {
        importance: 2.0,
        ...options,
      });
    },
    [rememberInLoop]
  );

  /**
   * Store a decision memory
   */
  const rememberDecision = useCallback(
    (content: any, context: string, options: SentientMemoryOptions = {}) => {
      return rememberInLoop(content, MemoryContentType.DECISION, context, {
        importance: 3.0,
        ...options,
      });
    },
    [rememberInLoop]
  );

  /**
   * Store an outcome memory
   */
  const rememberOutcome = useCallback(
    (content: any, context: string, options: SentientMemoryOptions = {}) => {
      return rememberInLoop(content, MemoryContentType.OUTCOME, context, {
        importance: 3.0,
        ...options,
      });
    },
    [rememberInLoop]
  );

  /**
   * Store a preference memory
   */
  const rememberPreference = useCallback(
    (content: any, context: string, options: SentientMemoryOptions = {}) => {
      return rememberInLoop(content, MemoryContentType.PREFERENCE, context, {
        importance: 2.5,
        ...options,
      });
    },
    [rememberInLoop]
  );

  /**
   * Store a fact memory
   */
  const rememberFact = useCallback(
    (content: any, context: string, options: SentientMemoryOptions = {}) => {
      return rememberInLoop(content, MemoryContentType.FACT, context, {
        importance: 2.0,
        ...options,
      });
    },
    [rememberInLoop]
  );

  /**
   * Store feedback memory
   */
  const rememberFeedback = useCallback(
    (content: any, context: string, options: SentientMemoryOptions = {}) => {
      return rememberInLoop(content, MemoryContentType.FEEDBACK, context, {
        importance: 2.5,
        ...options,
      });
    },
    [rememberInLoop]
  );

  return {
    // Core operations
    rememberInLoop,
    recallFromLoop,
    searchInLoop,
    updateMemory,
    deleteMemory,
    
    // Specialized memory functions
    rememberConversation,
    rememberTask,
    rememberDecision,
    rememberOutcome,
    rememberPreference,
    rememberFact,
    rememberFeedback,
    
    // Status
    isStoring,
    error,
  };
}