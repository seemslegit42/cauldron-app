/**
 * Hook for using the ethical alignment service in the frontend
 */

import { useState, useCallback } from 'react';
import { useAction, useQuery } from 'wasp/client/operations';
import { checkEthicalAlignment, getEthicalRules, createEthicalRule, updateEthicalRule } from 'wasp/client/operations';

export interface EthicalCheckOptions {
  contentType?: string;
  moduleId?: string;
  industryContext?: string;
  regulatoryContext?: string;
  alwaysStore?: boolean;
}

export function useEthicalAlignment() {
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckResult, setLastCheckResult] = useState<any>(null);
  const checkAlignmentFn = useAction(checkEthicalAlignment);

  // Function to check content for ethical alignment
  const checkAlignment = useCallback(async (
    content: string,
    agentId: string,
    options: EthicalCheckOptions = {}
  ) => {
    setIsChecking(true);
    try {
      const result = await checkAlignmentFn({
        content,
        contentType: options.contentType || 'agent_output',
        agentId,
        moduleId: options.moduleId,
        industryContext: options.industryContext,
        regulatoryContext: options.regulatoryContext,
        metadata: {
          alwaysStore: options.alwaysStore,
        },
      });
      
      setLastCheckResult(result);
      return result;
    } catch (error) {
      console.error('Error checking ethical alignment:', error);
      throw error;
    } finally {
      setIsChecking(false);
    }
  }, [checkAlignmentFn]);

  // Function to get alignment status text
  const getAlignmentStatusText = useCallback((alignmentScore: number) => {
    if (alignmentScore >= 0.9) return 'Excellent';
    if (alignmentScore >= 0.8) return 'Good';
    if (alignmentScore >= 0.7) return 'Acceptable';
    if (alignmentScore >= 0.5) return 'Questionable';
    return 'Problematic';
  }, []);

  // Function to get alignment status color
  const getAlignmentStatusColor = useCallback((alignmentScore: number) => {
    if (alignmentScore >= 0.9) return 'green';
    if (alignmentScore >= 0.8) return 'teal';
    if (alignmentScore >= 0.7) return 'blue';
    if (alignmentScore >= 0.5) return 'yellow';
    return 'red';
  }, []);

  return {
    checkAlignment,
    isChecking,
    lastCheckResult,
    getAlignmentStatusText,
    getAlignmentStatusColor,
  };
}

export function useEthicalRules() {
  const { data: rules = [], isLoading, error, refetch } = useQuery(getEthicalRules);
  const createRuleFn = useAction(createEthicalRule);
  const updateRuleFn = useAction(updateEthicalRule);

  // Function to create a new ethical rule
  const createRule = useCallback(async (ruleData: any) => {
    try {
      const result = await createRuleFn(ruleData);
      refetch();
      return result;
    } catch (error) {
      console.error('Error creating ethical rule:', error);
      throw error;
    }
  }, [createRuleFn, refetch]);

  // Function to update an existing ethical rule
  const updateRule = useCallback(async (ruleId: string, ruleData: any) => {
    try {
      const result = await updateRuleFn({ id: ruleId, ...ruleData });
      refetch();
      return result;
    } catch (error) {
      console.error('Error updating ethical rule:', error);
      throw error;
    }
  }, [updateRuleFn, refetch]);

  return {
    rules,
    isLoading,
    error,
    refetch,
    createRule,
    updateRule,
    contentFilterRules: rules.filter(rule => rule.type === 'CONTENT_FILTER'),
    biasCheckRules: rules.filter(rule => rule.type === 'BIAS_CHECK'),
    regulatoryRules: rules.filter(rule => rule.type === 'REGULATORY'),
    industryRules: rules.filter(rule => rule.type === 'INDUSTRY_SPECIFIC'),
    customRules: rules.filter(rule => rule.type === 'CUSTOM'),
  };
}