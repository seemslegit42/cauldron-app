import { useState, useCallback } from 'react';
import { useUser } from 'wasp/client/auth';
import { useAction } from 'wasp/client/operations';
import { generateAiResponse } from '../../../ai-services/operations';

/**
 * Options for the useSentientLoop hook
 */
export interface UseSentientLoopOptions {
  /** The module this hook is being used in */
  module: string;
  /** The agent name to use for the Sentient Loop */
  agentName?: string;
  /** Whether to enable human confirmation for certain operations */
  enableHumanConfirmation?: boolean;
  /** Whether to store interactions in memory */
  storeInMemory?: boolean;
}

/**
 * Return type for the useSentientLoop hook
 */
export interface UseSentientLoopReturn {
  /** Whether the Sentient Loop is processing */
  isProcessing: boolean;
  /** The last response from the Sentient Loop */
  lastResponse: string | null;
  /** Error message if any */
  error: string | null;
  /** Function to process a query through the Sentient Loop */
  processQuery: (query: string, context?: Record<string, any>) => Promise<string>;
  /** Function to reset the state */
  reset: () => void;
}

/**
 * A hook for interacting with the Sentient Loop™
 * 
 * @example
 * ```tsx
 * const { processQuery, isProcessing, lastResponse, error } = useSentientLoop({
 *   module: 'arcana',
 *   agentName: 'BusinessAnalyst'
 * });
 * 
 * const handleSubmit = async () => {
 *   const response = await processQuery('Analyze our Q2 revenue trends', {
 *     businessUnit: 'sales',
 *     timeframe: 'Q2'
 *   });
 *   console.log(response);
 * };
 * ```
 */
export function useSentientLoop({
  module,
  agentName = 'SentientAssistant',
  enableHumanConfirmation = true,
  storeInMemory = true,
}: UseSentientLoopOptions): UseSentientLoopReturn {
  const user = useUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResponse, setLastResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const generateAiResponseAction = useAction(generateAiResponse);

  const processQuery = useCallback(
    async (query: string, context: Record<string, any> = {}): Promise<string> => {
      setIsProcessing(true);
      setError(null);
      
      try {
        // Prepare the request payload
        const payload = {
          query,
          module,
          agentName,
          context: {
            ...context,
            userId: user?.id,
            enableHumanConfirmation,
            storeInMemory,
          },
        };
        
        // Call the AI service
        const response = await generateAiResponseAction(payload);
        
        // Update state
        setLastResponse(response.content);
        setIsProcessing(false);
        
        return response.content;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        setIsProcessing(false);
        throw err;
      }
    },
    [user, module, agentName, enableHumanConfirmation, storeInMemory, generateAiResponseAction]
  );

  const reset = useCallback(() => {
    setLastResponse(null);
    setError(null);
  }, []);

  return {
    isProcessing,
    lastResponse,
    error,
    processQuery,
    reset,
  };
}
