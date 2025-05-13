/**
 * useTemporalMemory Hook
 * 
 * React hook for working with time-based memory queries and temporal awareness.
 * Enables natural language queries about past events and comparisons across time periods.
 */

import { useState, useCallback } from 'react';
import { useMutation, useQuery } from 'react-query';
import { 
  MemoryContentType,
  TemporalQueryResult,
  MemoryComparison
} from '../types';
import { useAuth } from '../../../shared/hooks/useAuth';

export function useTemporalMemory() {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  /**
   * Query memories using natural language with temporal references
   */
  const queryByTimeMutation = useMutation(
    async ({ 
      query, 
      agentId, 
      contentType, 
      limit 
    }: { 
      query: string; 
      agentId?: string; 
      contentType?: MemoryContentType; 
      limit?: number; 
    }): Promise<TemporalQueryResult> => {
      if (!user) throw new Error('User not authenticated');

      const response = await fetch('/api/memory/temporal/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          userId: user.id,
          agentId,
          contentType,
          limit: limit || 10,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to query memories by time');
      }

      return response.json();
    },
    {
      onError: (error: Error) => {
        setError(error.message);
      },
    }
  );

  /**
   * Compare memories across different time periods
   */
  const compareTimesMutation = useMutation(
    async ({ 
      period1, 
      period2, 
      agentId, 
      contentType, 
      context, 
      limit 
    }: { 
      period1: string; 
      period2: string; 
      agentId?: string; 
      contentType?: MemoryContentType; 
      context?: string; 
      limit?: number; 
    }): Promise<MemoryComparison> => {
      if (!user) throw new Error('User not authenticated');

      const response = await fetch('/api/memory/temporal/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          period1,
          period2,
          agentId,
          contentType,
          context,
          limit: limit || 20,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to compare time periods');
      }

      return response.json();
    },
    {
      onError: (error: Error) => {
        setError(error.message);
      },
    }
  );

  /**
   * Remember when something happened using natural language
   */
  const rememberWhen = useCallback(
    (query: string, options: { agentId?: string; contentType?: MemoryContentType; limit?: number } = {}) => {
      return queryByTimeMutation.mutateAsync({
        query,
        ...options,
      });
    },
    [queryByTimeMutation]
  );

  /**
   * Compare two time periods
   */
  const compareTimes = useCallback(
    (period1: string, period2: string, options: { agentId?: string; contentType?: MemoryContentType; context?: string; limit?: number } = {}) => {
      return compareTimesMutation.mutateAsync({
        period1,
        period2,
        ...options,
      });
    },
    [compareTimesMutation]
  );

  /**
   * Get temporal distribution of memories
   */
  const useTemporalDistribution = (options: { agentId?: string; contentType?: MemoryContentType } = {}) => {
    return useQuery(
      ['memoryTemporalDistribution', user?.id, options.agentId, options.contentType],
      async () => {
        if (!user) throw new Error('User not authenticated');

        const response = await fetch('/api/memory/temporal/distribution', {
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
          throw new Error(errorData.message || 'Failed to get temporal distribution');
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
  };

  return {
    // Core operations
    rememberWhen,
    compareTimes,
    useTemporalDistribution,
    
    // Status
    isQuerying: queryByTimeMutation.isLoading,
    isComparing: compareTimesMutation.isLoading,
    error,
    clearError: () => setError(null),
  };
}