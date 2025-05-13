/**
 * useMemory Hook
 * 
 * React hook for interacting with the memory system from the frontend.
 */

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  MemoryEntry, 
  MemoryType, 
  MemoryContentType, 
  MemoryQueryOptions,
  MemoryStats
} from '../types';
import { useAuth } from '../../../shared/hooks/useAuth';

export function useMemory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Reset error when user changes
  useEffect(() => {
    setError(null);
  }, [user]);

  // Store a new memory
  const storeMemoryMutation = useMutation(
    async (memory: Omit<MemoryEntry, 'id'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const response = await fetch('/api/memory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...memory,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to store memory');
      }

      return response.json();
    },
    {
      onError: (error: Error) => {
        setError(error.message);
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['memories', user?.id]);
        queryClient.invalidateQueries(['memoryStats', user?.id]);
      },
    }
  );

  // Retrieve memories
  const retrieveMemories = useCallback(
    async (options: Partial<MemoryQueryOptions> = {}) => {
      if (!user) throw new Error('User not authenticated');

      const response = await fetch('/api/memory/retrieve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          ...options,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to retrieve memories');
      }

      return response.json();
    },
    [user]
  );

  // Search memories
  const searchMemories = useCallback(
    async (query: string, options: Partial<MemoryQueryOptions> = {}) => {
      if (!user) throw new Error('User not authenticated');

      const response = await fetch('/api/memory/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          userId: user.id,
          ...options,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to search memories');
      }

      return response.json();
    },
    [user]
  );

  // Update a memory
  const updateMemoryMutation = useMutation(
    async ({ memoryId, updates }: { memoryId: string; updates: Partial<MemoryEntry> }) => {
      if (!user) throw new Error('User not authenticated');

      const response = await fetch(`/api/memory/${memoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update memory');
      }

      return response.json();
    },
    {
      onError: (error: Error) => {
        setError(error.message);
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['memories', user?.id]);
      },
    }
  );

  // Delete a memory
  const deleteMemoryMutation = useMutation(
    async (memoryId: string) => {
      if (!user) throw new Error('User not authenticated');

      const response = await fetch(`/api/memory/${memoryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete memory');
      }

      return response.json();
    },
    {
      onError: (error: Error) => {
        setError(error.message);
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['memories', user?.id]);
        queryClient.invalidateQueries(['memoryStats', user?.id]);
      },
    }
  );

  // Get memory stats
  const { data: memoryStats, isLoading: isLoadingStats } = useQuery<MemoryStats>(
    ['memoryStats', user?.id],
    async () => {
      if (!user) throw new Error('User not authenticated');

      const response = await fetch(`/api/memory/stats?userId=${user.id}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get memory stats');
      }

      return response.json();
    },
    {
      enabled: !!user,
      onError: (error: Error) => {
        setError(error.message);
      },
    }
  );

  // Helper function to store a conversation memory
  const storeConversationMemory = useCallback(
    (content: any, options: Partial<Omit<MemoryEntry, 'userId' | 'content' | 'contentType'>> = {}) => {
      return storeMemoryMutation.mutateAsync({
        userId: user?.id || '',
        contentType: MemoryContentType.CONVERSATION,
        content,
        type: options.type || MemoryType.SHORT_TERM,
        context: options.context || 'conversation',
        importance: options.importance || 1.0,
        agentId: options.agentId,
        sessionId: options.sessionId,
        expiresAt: options.expiresAt,
        metadata: options.metadata,
      });
    },
    [user, storeMemoryMutation]
  );

  // Helper function to store a task memory
  const storeTaskMemory = useCallback(
    (content: any, options: Partial<Omit<MemoryEntry, 'userId' | 'content' | 'contentType'>> = {}) => {
      return storeMemoryMutation.mutateAsync({
        userId: user?.id || '',
        contentType: MemoryContentType.TASK,
        content,
        type: options.type || MemoryType.LONG_TERM,
        context: options.context || 'task',
        importance: options.importance || 2.0,
        agentId: options.agentId,
        sessionId: options.sessionId,
        expiresAt: options.expiresAt,
        metadata: options.metadata,
      });
    },
    [user, storeMemoryMutation]
  );

  // Helper function to store a decision memory
  const storeDecisionMemory = useCallback(
    (content: any, options: Partial<Omit<MemoryEntry, 'userId' | 'content' | 'contentType'>> = {}) => {
      return storeMemoryMutation.mutateAsync({
        userId: user?.id || '',
        contentType: MemoryContentType.DECISION,
        content,
        type: options.type || MemoryType.LONG_TERM,
        context: options.context || 'decision',
        importance: options.importance || 3.0,
        agentId: options.agentId,
        sessionId: options.sessionId,
        expiresAt: options.expiresAt,
        metadata: options.metadata,
      });
    },
    [user, storeMemoryMutation]
  );

  return {
    // Basic operations
    storeMemory: storeMemoryMutation.mutateAsync,
    retrieveMemories,
    searchMemories,
    updateMemory: updateMemoryMutation.mutateAsync,
    deleteMemory: deleteMemoryMutation.mutateAsync,
    
    // Helper functions
    storeConversationMemory,
    storeTaskMemory,
    storeDecisionMemory,
    
    // Status
    isStoring: storeMemoryMutation.isLoading,
    isUpdating: updateMemoryMutation.isLoading,
    isDeleting: deleteMemoryMutation.isLoading,
    isLoadingStats,
    
    // Data
    memoryStats,
    error,
    clearError: () => setError(null),
  };
}