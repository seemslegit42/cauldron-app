import { useQuery, useAction } from 'wasp/client/operations';
import { 
  getSentientSnapshot, 
  getExecutiveStack, 
  getCEOPreferencesForUser,
  updateCEOPreferencesForUser,
  executeDecisionAction,
  askCEOQuestion
} from '../../cauldron-prime/operations';
import { 
  BusinessUnit, 
  PriorityLevel, 
  DecisionStatus, 
  SentientSnapshot, 
  ExecutiveDecision, 
  ExecutiveStack,
  CEOPreferences
} from '../../cauldron-prime/types';
import { useState } from 'react';

/**
 * Hook for using Cauldron Prime AI CEO services
 */
export const useCauldronPrime = () => {
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  
  // Queries
  const { 
    data: snapshot, 
    isLoading: isLoadingSnapshot,
    error: snapshotError,
    refetch: refetchSnapshot
  } = useQuery(getSentientSnapshot);
  
  const { 
    data: executiveStack, 
    isLoading: isLoadingStack,
    error: stackError,
    refetch: refetchStack
  } = useQuery(getExecutiveStack);
  
  const { 
    data: preferences, 
    isLoading: isLoadingPreferences,
    error: preferencesError,
    refetch: refetchPreferences
  } = useQuery(getCEOPreferencesForUser);
  
  // Actions
  const executeDecision = useAction(executeDecisionAction);
  const updatePreferences = useAction(updateCEOPreferencesForUser);
  const askQuestion = useAction(askCEOQuestion);
  
  // Handle asking a question to the AI CEO
  const askCEO = async (question: string) => {
    if (!question.trim()) return null;
    
    setIsAskingQuestion(true);
    
    try {
      const response = await askQuestion({
        question
      });
      
      return response;
    } catch (error) {
      console.error('Error asking question to Cauldron Prime:', error);
      throw error;
    } finally {
      setIsAskingQuestion(false);
    }
  };
  
  // Handle executing a decision
  const executeExecutiveDecision = async (decisionId: string) => {
    try {
      const result = await executeDecision({
        decisionId
      });
      
      // Refetch data
      refetchStack();
      refetchSnapshot();
      
      return result;
    } catch (error) {
      console.error('Error executing decision:', error);
      throw error;
    }
  };
  
  // Handle updating CEO preferences
  const updateCEOPreferences = async (newPreferences: Partial<CEOPreferences>) => {
    try {
      const result = await updatePreferences(newPreferences);
      
      // Refetch data
      refetchPreferences();
      refetchStack();
      
      return result;
    } catch (error) {
      console.error('Error updating CEO preferences:', error);
      throw error;
    }
  };
  
  return {
    // Data
    snapshot,
    executiveStack,
    preferences,
    
    // Loading states
    isLoadingSnapshot,
    isLoadingStack,
    isLoadingPreferences,
    isAskingQuestion,
    
    // Errors
    snapshotError,
    stackError,
    preferencesError,
    
    // Refetch functions
    refetchSnapshot,
    refetchStack,
    refetchPreferences,
    
    // Action functions
    askCEO,
    executeExecutiveDecision,
    updateCEOPreferences,
  };
};