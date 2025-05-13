import React, { useState, useCallback } from 'react';
import { AgentChat } from '../../shared/components/ai/AgentChat';
import { AIFunction } from '../../shared/ai/vercel-ai-utils';
import { useToast } from '../../shared/hooks/useToast';
import { runSecurityScan } from '../services/securityScanService';
import { analyzeThreat } from '../services/threatAnalysisService';
import { checkVulnerability } from '../services/vulnerabilityService';

interface SecurityAssistantProps {
  minimized?: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
  className?: string;
}

/**
 * SecurityAssistant component for the Phantom module
 * Provides security-focused AI assistance with function calling capabilities
 */
export const SecurityAssistant: React.FC<SecurityAssistantProps> = ({
  minimized = false,
  onMinimize,
  onMaximize,
  className,
}) => {
  const { toast } = useToast();
  const [scanResults, setScanResults] = useState<any>(null);
  const [threatAnalysis, setThreatAnalysis] = useState<any>(null);
  const [vulnerabilityCheck, setVulnerabilityCheck] = useState<any>(null);

  // Define security-focused functions that the AI can call
  const securityFunctions: AIFunction[] = [
    {
      name: 'runSecurityScan',
      description: 'Run a security scan on a specified target or system',
      parameters: {
        type: 'object',
        properties: {
          target: {
            type: 'string',
            description: 'The target to scan (e.g., "network", "website", "application", "system")',
          },
          scanType: {
            type: 'string',
            description: 'The type of scan to run (e.g., "quick", "deep", "vulnerability", "malware")',
          },
          options: {
            type: 'object',
            description: 'Additional scan options',
            properties: {
              timeout: { type: 'number', description: 'Scan timeout in seconds' },
              includePorts: { type: 'boolean', description: 'Whether to include port scanning' },
              includeVulnerabilities: { type: 'boolean', description: 'Whether to include vulnerability scanning' },
            },
          },
        },
        required: ['target', 'scanType'],
      },
    },
    {
      name: 'analyzeThreat',
      description: 'Analyze a potential security threat',
      parameters: {
        type: 'object',
        properties: {
          threatType: {
            type: 'string',
            description: 'The type of threat to analyze (e.g., "malware", "phishing", "ransomware", "ddos")',
          },
          indicators: {
            type: 'array',
            description: 'List of threat indicators',
            items: {
              type: 'string',
            },
          },
          severity: {
            type: 'string',
            description: 'Estimated severity of the threat (e.g., "low", "medium", "high", "critical")',
          },
        },
        required: ['threatType'],
      },
    },
    {
      name: 'checkVulnerability',
      description: 'Check if a system is vulnerable to a specific vulnerability',
      parameters: {
        type: 'object',
        properties: {
          system: {
            type: 'string',
            description: 'The system to check (e.g., "web server", "database", "application")',
          },
          vulnerabilityId: {
            type: 'string',
            description: 'The vulnerability ID (e.g., "CVE-2021-44228", "log4shell")',
          },
          details: {
            type: 'boolean',
            description: 'Whether to include detailed information about the vulnerability',
          },
        },
        required: ['system', 'vulnerabilityId'],
      },
    },
  ];

  // Handle function calls from the AI
  const handleFunctionCall = useCallback(async (functionCall: { name: string; arguments: any }) => {
    const { name, arguments: args } = functionCall;
    
    try {
      switch (name) {
        case 'runSecurityScan': {
          toast({
            title: 'Running Security Scan',
            description: `Scanning ${args.target} with ${args.scanType} scan...`,
            variant: 'default',
          });
          
          const results = await runSecurityScan(args.target, args.scanType, args.options);
          setScanResults(results);
          
          return JSON.stringify({
            status: 'success',
            results: {
              summary: results.summary,
              threatCount: results.threats.length,
              vulnerabilityCount: results.vulnerabilities.length,
              highSeverityCount: results.highSeverityCount,
              scanDuration: results.scanDuration,
            },
          });
        }
        
        case 'analyzeThreat': {
          toast({
            title: 'Analyzing Threat',
            description: `Analyzing ${args.threatType} threat...`,
            variant: 'default',
          });
          
          const analysis = await analyzeThreat(args.threatType, args.indicators, args.severity);
          setThreatAnalysis(analysis);
          
          return JSON.stringify({
            status: 'success',
            analysis: {
              threatType: analysis.threatType,
              severity: analysis.severity,
              confidence: analysis.confidence,
              recommendation: analysis.recommendation,
              mitigationSteps: analysis.mitigationSteps,
            },
          });
        }
        
        case 'checkVulnerability': {
          toast({
            title: 'Checking Vulnerability',
            description: `Checking ${args.system} for ${args.vulnerabilityId}...`,
            variant: 'default',
          });
          
          const result = await checkVulnerability(args.system, args.vulnerabilityId, args.details);
          setVulnerabilityCheck(result);
          
          return JSON.stringify({
            status: 'success',
            vulnerability: {
              isVulnerable: result.isVulnerable,
              vulnerabilityId: result.vulnerabilityId,
              severity: result.severity,
              description: result.description,
              remediation: result.remediation,
            },
          });
        }
        
        default:
          return JSON.stringify({
            status: 'error',
            message: `Unknown function: ${name}`,
          });
      }
    } catch (error) {
      console.error(`Error executing function ${name}:`, error);
      return JSON.stringify({
        status: 'error',
        message: error.message || 'An error occurred',
      });
    }
  }, [toast]);

  return (
    <AgentChat
      agentName="Security Assistant"
      module="phantom"
      systemPrompt={`You are the Phantom Security Assistant, a cybersecurity expert for the Cauldron platform.
You help users understand security threats, analyze vulnerabilities, and recommend defensive actions.
Your tone is precise, technical when needed, but always accessible.
Focus on actionable security insights and clear explanations of complex security concepts.

You have access to security tools through function calling:
1. runSecurityScan - Run security scans on specified targets
2. analyzeThreat - Analyze potential security threats
3. checkVulnerability - Check if systems are vulnerable to specific vulnerabilities

Always provide clear explanations of security concepts and actionable recommendations.
When appropriate, offer to run security tools to provide more specific insights.`}
      minimized={minimized}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className={className}
      functions={securityFunctions}
      onFunctionCall={handleFunctionCall}
      showLatency={true}
    />
  );
};

export default SecurityAssistant;
