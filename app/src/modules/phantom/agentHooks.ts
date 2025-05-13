/**
 * Phantom Module - Agent Hooks
 * 
 * This file contains Sentient Loop™ hooks for AI interactions in the Phantom module.
 * These hooks provide a standardized way to integrate AI capabilities into the security dashboard.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAction, useQuery } from 'wasp/client/operations';
import { useUser } from 'wasp/client/auth';
import { runSecurityScan } from './api/operations';
import { useSentientLoop } from '../../shared/hooks/ai/useSentientLoop';
import { ThreatSeverity, SecurityScanType } from './types';

/**
 * Hook for using the security assistant
 */
export function useSecurityAssistant() {
  const { processQuery, isProcessing, lastResponse, error } = useSentientLoop({
    module: 'phantom',
    agentName: 'SecurityAnalyst',
    enableHumanConfirmation: true,
  });

  const runSecurityScanAction = useAction(runSecurityScan);
  
  // Function to analyze a security threat
  const analyzeThreat = useCallback(async (threatId: string, description: string) => {
    return processQuery(`Analyze the following security threat: ${description}`, {
      threatId,
      context: 'threat-analysis',
    });
  }, [processQuery]);
  
  // Function to recommend security actions
  const recommendSecurityActions = useCallback(async (securityScore: number, vulnerabilities: string[]) => {
    return processQuery(`Recommend security actions based on a security score of ${securityScore} and the following vulnerabilities: ${vulnerabilities.join(', ')}`, {
      context: 'security-recommendations',
    });
  }, [processQuery]);
  
  // Function to scan a domain for security issues
  const scanDomain = useCallback(async (domain: string, scanType: SecurityScanType) => {
    try {
      // First run the actual scan
      const scanResult = await runSecurityScanAction({
        target: domain,
        scanType,
      });
      
      // Then analyze the results with AI
      return processQuery(`Analyze the security scan results for domain ${domain}`, {
        scanResult,
        scanType,
        context: 'domain-scan-analysis',
      });
    } catch (err) {
      console.error('Error scanning domain:', err);
      throw err;
    }
  }, [processQuery, runSecurityScanAction]);
  
  return {
    analyzeThreat,
    recommendSecurityActions,
    scanDomain,
    isProcessing,
    lastResponse,
    error,
  };
}
