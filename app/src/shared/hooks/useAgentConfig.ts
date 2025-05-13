/**
 * useAgentConfig Hook
 * 
 * This hook provides access to agent configuration for a specific module and agent.
 * It handles fetching, updating, and previewing agent configurations.
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import { 
  getAgentConfigOperation, 
  updateAgentConfigOperation, 
  previewAgentConfigOperation,
  resetAgentConfigOperation
} from '../api/agentConfigOperations';
import type { AgentConfig } from '../components/ai/AgentConfigPanel';
import { useToast } from './useToast';

interface UseAgentConfigOptions {
  /** Whether to fetch the configuration immediately */
  fetchImmediately?: boolean;
  /** Whether this is a user override (vs. organization default) */
  isUserOverride?: boolean;
}

interface UseAgentConfigResult {
  /** Agent configuration */
  config: AgentConfig | null;
  /** Whether the configuration is loading */
  isLoading: boolean;
  /** Whether the configuration is being updated */
  isUpdating: boolean;
  /** Whether the configuration is being previewed */
  isPreviewing: boolean;
  /** Error message if any */
  error: string | null;
  /** Preview response */
  previewResponse: string | null;
  /** Fetch the configuration */
  fetchConfig: () => Promise<void>;
  /** Update the configuration */
  updateConfig: (newConfig: AgentConfig) => Promise<void>;
  /** Preview the configuration */
  previewConfig: (prompt: string) => Promise<void>;
  /** Reset the configuration to defaults */
  resetConfig: () => Promise<void>;
}

/**
 * Hook for managing agent configuration
 * 
 * @param moduleId - Module ID
 * @param agentName - Agent name
 * @param options - Options
 * @returns Agent configuration and operations
 */
export const useAgentConfig = (
  moduleId: string,
  agentName: string,
  options: UseAgentConfigOptions = {}
): UseAgentConfigResult => {
  const { fetchImmediately = true, isUserOverride = false } = options;
  
  // State
  const [config, setConfig] = useState<AgentConfig | null>(null);
  const [isLoading, setIsLoading] = useState(fetchImmediately);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewResponse, setPreviewResponse] = useState<string | null>(null);
  
  // Toast notifications
  const { toast } = useToast();
  
  // API operations
  const getAgentConfigAction = useAction(getAgentConfigOperation);
  const updateAgentConfigAction = useAction(updateAgentConfigOperation);
  const previewAgentConfigAction = useAction(previewAgentConfigOperation);
  const resetAgentConfigAction = useAction(resetAgentConfigOperation);
  
  // Fetch configuration
  const fetchConfig = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const config = await getAgentConfigAction({
        moduleId,
        agentName,
      });
      
      setConfig(config);
    } catch (err) {
      console.error('Error fetching agent config:', err);
      setError(err.message || 'Failed to fetch agent configuration');
      toast({
        title: 'Error',
        description: 'Failed to fetch agent configuration',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [moduleId, agentName, getAgentConfigAction, toast]);
  
  // Update configuration
  const updateConfig = useCallback(async (newConfig: AgentConfig) => {
    setIsUpdating(true);
    setError(null);
    
    try {
      const updatedConfig = await updateAgentConfigAction({
        moduleId,
        agentName,
        config: newConfig,
        isUserOverride,
      });
      
      setConfig(updatedConfig);
      toast({
        title: 'Success',
        description: 'Agent configuration updated successfully',
      });
    } catch (err) {
      console.error('Error updating agent config:', err);
      setError(err.message || 'Failed to update agent configuration');
      toast({
        title: 'Error',
        description: 'Failed to update agent configuration',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  }, [moduleId, agentName, isUserOverride, updateAgentConfigAction, toast]);
  
  // Preview configuration
  const previewConfig = useCallback(async (prompt: string) => {
    if (!config) return;
    
    setIsPreviewing(true);
    setError(null);
    setPreviewResponse(null);
    
    try {
      const response = await previewAgentConfigAction({
        moduleId,
        agentName,
        config,
        prompt,
      });
      
      setPreviewResponse(response);
    } catch (err) {
      console.error('Error previewing agent config:', err);
      setError(err.message || 'Failed to preview agent configuration');
      toast({
        title: 'Error',
        description: 'Failed to preview agent configuration',
        variant: 'destructive',
      });
    } finally {
      setIsPreviewing(false);
    }
  }, [moduleId, agentName, config, previewAgentConfigAction, toast]);
  
  // Reset configuration
  const resetConfig = useCallback(async () => {
    setIsUpdating(true);
    setError(null);
    
    try {
      const defaultConfig = await resetAgentConfigAction({
        moduleId,
        agentName,
        isUserOverride,
      });
      
      setConfig(defaultConfig);
      toast({
        title: 'Success',
        description: 'Agent configuration reset to defaults',
      });
    } catch (err) {
      console.error('Error resetting agent config:', err);
      setError(err.message || 'Failed to reset agent configuration');
      toast({
        title: 'Error',
        description: 'Failed to reset agent configuration',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  }, [moduleId, agentName, isUserOverride, resetAgentConfigAction, toast]);
  
  // Fetch configuration on mount if fetchImmediately is true
  useEffect(() => {
    if (fetchImmediately) {
      fetchConfig();
    }
  }, [fetchImmediately, fetchConfig]);
  
  return {
    config,
    isLoading,
    isUpdating,
    isPreviewing,
    error,
    previewResponse,
    fetchConfig,
    updateConfig,
    previewConfig,
    resetConfig,
  };
};
