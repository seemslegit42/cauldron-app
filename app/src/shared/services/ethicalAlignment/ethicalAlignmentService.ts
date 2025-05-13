/**
 * Ethical Alignment Service
 * 
 * This service provides real-time ethical alignment checks for agent outputs
 * using both rule-based systems and model-based ethical filters.
 */

import { prisma } from 'wasp/server';
import { EthicalRuleType, EthicalSeverity } from '@prisma/client';
import { Telemetry } from '../telemetry';
import { LoggingService } from '../logging';
import { groqSwarm, getFastCompletion } from '../groqService';

// Types for ethical alignment checks
export interface EthicalCheckRequest {
  content: string;
  contentType: string;
  agentId: string;
  userId?: string;
  sessionId?: string;
  moduleId?: string;
  industryContext?: string;
  regulatoryContext?: string;
  metadata?: Record<string, any>;
}

export interface EthicalCheckResult {
  alignmentScore: number;
  flagged: boolean;
  matchedRules: {
    ruleId: string;
    ruleName: string;
    ruleType: EthicalRuleType;
    severity: EthicalSeverity;
    matchedPattern?: string;
  }[];
  modelAssessment?: {
    score: number;
    reasoning: string;
    categories: {
      name: string;
      score: number;
    }[];
  };
  checkId?: string;
}

/**
 * Ethical Alignment Service class
 */
export class EthicalAlignmentService {
  private static instance: EthicalAlignmentService;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): EthicalAlignmentService {
    if (!EthicalAlignmentService.instance) {
      EthicalAlignmentService.instance = new EthicalAlignmentService();
    }
    return EthicalAlignmentService.instance;
  }

  /**
   * Check content for ethical alignment
   */
  public async checkAlignment(request: EthicalCheckRequest): Promise<EthicalCheckResult> {
    // Create a telemetry span for this operation
    const span = Telemetry.createSpan(
      'ethical_alignment_check',
      'ethical_alignment_service',
      {
        attributes: {
          contentType: request.contentType,
          agentId: request.agentId,
          userId: request.userId || 'anonymous',
          moduleId: request.moduleId || 'unknown',
        },
        userId: request.userId,
        agentId: request.agentId,
        sessionId: request.sessionId,
        moduleId: request.moduleId,
      }
    );

    try {
      // 1. Get applicable rules based on context
      const rules = await this.getApplicableRules(request);
      span.setAttribute('rulesCount', rules.length);

      // 2. Apply rule-based checks
      const ruleResults = await this.applyRuleBasedChecks(request.content, rules);
      span.setAttribute('ruleMatchesCount', ruleResults.matchedRules.length);

      // 3. Apply model-based ethical filter if needed
      let modelAssessment;
      if (request.contentType === 'agent_output' || request.contentType === 'decision') {
        modelAssessment = await this.applyModelBasedFilter(request.content, request.industryContext);
        span.setAttribute('modelAssessmentScore', modelAssessment.score);
      }

      // 4. Combine results and calculate overall alignment score
      const alignmentScore = this.calculateAlignmentScore(ruleResults, modelAssessment);
      span.setAttribute('alignmentScore', alignmentScore);

      // 5. Determine if content should be flagged
      const flagged = this.shouldFlagContent(alignmentScore, ruleResults.matchedRules);
      span.setAttribute('flagged', flagged);

      // 6. Store the check result in the database if flagged or for audit purposes
      let checkId;
      if (flagged || request.metadata?.alwaysStore) {
        checkId = await this.storeAlignmentCheck({
          ...request,
          alignmentScore,
          matchedRules: ruleResults.matchedRules,
          modelAssessment,
        });
        span.setAttribute('checkId', checkId);
      }

      // 7. Return the result
      const result: EthicalCheckResult = {
        alignmentScore,
        flagged,
        matchedRules: ruleResults.matchedRules,
        modelAssessment,
        checkId,
      };

      span.setStatus('OK');
      await span.end();
      return result;
    } catch (error) {
      span.setStatus('ERROR');
      span.setAttribute('error', error.message);
      await span.end();
      
      // Log the error
      await LoggingService.logError('ethical_alignment_service', error.message, {
        agentId: request.agentId,
        userId: request.userId,
        moduleId: request.moduleId,
      });
      
      throw error;
    }
  }

  /**
   * Get applicable rules based on context
   */
  private async getApplicableRules(request: EthicalCheckRequest) {
    // Get organization ID from the user
    let organizationId;
    if (request.userId) {
      const user = await prisma.user.findUnique({
        where: { id: request.userId },
        select: { organizationId: true },
      });
      organizationId = user?.organizationId;
    }

    // Query for applicable rules
    const rules = await prisma.ethicalRule.findMany({
      where: {
        isActive: true,
        OR: [
          { organizationId: organizationId },
          { organizationId: null }, // Global rules
        ],
        ...(request.industryContext ? { industryContext: request.industryContext } : {}),
        ...(request.regulatoryContext ? { regulatoryContext: request.regulatoryContext } : {}),
      },
    });

    return rules;
  }

  /**
   * Apply rule-based checks to content
   */
  private async applyRuleBasedChecks(content: string, rules: any[]) {
    const matchedRules = [];

    for (const rule of rules) {
      const ruleDefinition = rule.ruleDefinition as any;
      
      // Check for regex patterns
      if (ruleDefinition.patterns && Array.isArray(ruleDefinition.patterns)) {
        for (const patternStr of ruleDefinition.patterns) {
          try {
            const pattern = new RegExp(patternStr, 'i');
            if (pattern.test(content)) {
              matchedRules.push({
                ruleId: rule.id,
                ruleName: rule.name,
                ruleType: rule.type,
                severity: rule.severity,
                matchedPattern: patternStr,
              });
              break; // Only match once per rule
            }
          } catch (error) {
            console.error(`Invalid regex pattern in rule ${rule.id}: ${patternStr}`);
          }
        }
      }
      
      // Check for keywords
      if (ruleDefinition.keywords && Array.isArray(ruleDefinition.keywords)) {
        for (const keyword of ruleDefinition.keywords) {
          if (content.toLowerCase().includes(keyword.toLowerCase())) {
            matchedRules.push({
              ruleId: rule.id,
              ruleName: rule.name,
              ruleType: rule.type,
              severity: rule.severity,
              matchedPattern: keyword,
            });
            break; // Only match once per rule
          }
        }
      }
    }

    return {
      matchedRules,
    };
  }

  /**
   * Apply model-based ethical filter
   */
  private async applyModelBasedFilter(content: string, industryContext?: string) {
    // Create a prompt for the model to assess ethical alignment
    let prompt = `Assess the following content for ethical alignment. Consider potential harm, bias, fairness, and appropriateness.
Content: "${content}"

Provide a JSON response with:
1. An overall alignment score from 0 to 1 (where 1 is perfectly aligned)
2. Brief reasoning for your assessment
3. Category scores for: harm, bias, fairness, appropriateness (each 0-1)`;

    if (industryContext) {
      prompt += `\nIndustry context: ${industryContext}`;
    }

    try {
      // Get completion from the model
      const completion = await getFastCompletion(prompt, {
        maxTokens: 500,
        temperature: 0.2,
        systemPrompt: "You are an ethical alignment evaluation system. Your job is to assess content for ethical concerns and provide structured feedback.",
      });

      // Parse the JSON response
      const jsonMatch = completion.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const assessment = JSON.parse(jsonMatch[0]);
        return {
          score: assessment.alignmentScore || assessment.score || 0.5,
          reasoning: assessment.reasoning || "No reasoning provided",
          categories: assessment.categories || [],
        };
      }

      // If JSON parsing fails, return a default assessment
      return {
        score: 0.5,
        reasoning: "Unable to parse model response",
        categories: [],
      };
    } catch (error) {
      console.error('Error in model-based ethical filter:', error);
      return {
        score: 0.5,
        reasoning: "Error in model assessment",
        categories: [],
      };
    }
  }

  /**
   * Calculate overall alignment score
   */
  private calculateAlignmentScore(
    ruleResults: { matchedRules: any[] },
    modelAssessment?: { score: number; reasoning: string; categories: any[] }
  ): number {
    // Start with a perfect score
    let score = 1.0;
    
    // Reduce score based on rule matches and their severity
    for (const rule of ruleResults.matchedRules) {
      switch (rule.severity) {
        case 'CRITICAL':
          score -= 0.4;
          break;
        case 'HIGH':
          score -= 0.2;
          break;
        case 'MEDIUM':
          score -= 0.1;
          break;
        case 'LOW':
          score -= 0.05;
          break;
      }
    }
    
    // Incorporate model assessment if available
    if (modelAssessment) {
      // Weight the model score at 40% of the total
      score = score * 0.6 + modelAssessment.score * 0.4;
    }
    
    // Ensure score is between 0 and 1
    return Math.max(0, Math.min(1, score));
  }

  /**
   * Determine if content should be flagged
   */
  private shouldFlagContent(alignmentScore: number, matchedRules: any[]): boolean {
    // Flag if alignment score is below threshold
    if (alignmentScore < 0.7) {
      return true;
    }
    
    // Flag if any critical or high severity rules matched
    if (matchedRules.some(rule => rule.severity === 'CRITICAL' || rule.severity === 'HIGH')) {
      return true;
    }
    
    // Flag if multiple medium severity rules matched
    const mediumRules = matchedRules.filter(rule => rule.severity === 'MEDIUM');
    if (mediumRules.length >= 2) {
      return true;
    }
    
    return false;
  }

  /**
   * Store alignment check in the database
   */
  private async storeAlignmentCheck(data: {
    content: string;
    contentType: string;
    agentId: string;
    userId?: string;
    sessionId?: string;
    moduleId?: string;
    alignmentScore: number;
    matchedRules: any[];
    modelAssessment?: any;
    metadata?: Record<string, any>;
  }): Promise<string> {
    // If no rules matched, use the first one for reference
    const ruleId = data.matchedRules.length > 0 
      ? data.matchedRules[0].ruleId 
      : (await prisma.ethicalRule.findFirst({ where: { type: 'CONTENT_FILTER' } }))?.id;
    
    if (!ruleId) {
      throw new Error('No ethical rules found in the database');
    }
    
    // Determine severity based on matched rules or alignment score
    let severity: EthicalSeverity = 'LOW';
    if (data.matchedRules.some(rule => rule.severity === 'CRITICAL')) {
      severity = 'CRITICAL';
    } else if (data.matchedRules.some(rule => rule.severity === 'HIGH')) {
      severity = 'HIGH';
    } else if (data.matchedRules.some(rule => rule.severity === 'MEDIUM')) {
      severity = 'MEDIUM';
    } else if (data.alignmentScore < 0.5) {
      severity = 'HIGH';
    } else if (data.alignmentScore < 0.7) {
      severity = 'MEDIUM';
    }
    
    // Store the check in the database
    const check = await prisma.alignmentCheck.create({
      data: {
        agentId: data.agentId,
        userId: data.userId,
        sessionId: data.sessionId,
        moduleId: data.moduleId,
        content: data.content,
        contentType: data.contentType,
        alignmentScore: data.alignmentScore,
        ruleId: ruleId,
        matchedPattern: data.matchedRules.length > 0 ? data.matchedRules[0].matchedPattern : null,
        severity: severity,
        status: 'flagged',
        metadata: {
          ...data.metadata,
          modelAssessment: data.modelAssessment,
          allMatchedRules: data.matchedRules,
        },
      },
    });
    
    return check.id;
  }
}

// Export the singleton instance
export const ethicalAlignmentService = EthicalAlignmentService.getInstance();