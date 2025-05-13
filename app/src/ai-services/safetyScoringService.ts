/**
 * Safety Scoring Service
 * 
 * This service provides advanced safety scoring for AI prompts and responses.
 * It uses a combination of techniques to assess the safety of content:
 * 
 * 1. Keyword/pattern matching for known problematic content
 * 2. Contextual analysis to understand intent
 * 3. Integration with content moderation APIs
 * 4. Historical analysis of similar content
 */

import { prisma } from 'wasp/server';
import { HttpError } from 'wasp/server';
import { z } from 'zod';
import { ensureArgsSchemaOrThrowHttpError } from '../server/validation';
import { trackedGroqInference } from './trackedGroqInference';

// Input schema for safety scoring
export const safetyScoringInputSchema = z.object({
  content: z.string().min(1, "Content cannot be empty"),
  contentType: z.enum(['prompt', 'response', 'reasoning']),
  module: z.string().optional(),
  userId: z.string().optional(),
  context: z.string().optional(),
});

export type SafetyScoringInput = z.infer<typeof safetyScoringInputSchema>;

// Safety categories
export enum SafetyCategory {
  HARMFUL_INSTRUCTIONS = 'harmful_instructions',
  HATE_SPEECH = 'hate_speech',
  HARASSMENT = 'harassment',
  SELF_HARM = 'self_harm',
  SEXUAL_CONTENT = 'sexual_content',
  VIOLENCE = 'violence',
  ILLEGAL_ACTIVITY = 'illegal_activity',
  PRIVATE_INFORMATION = 'private_information',
  MALWARE = 'malware',
  FRAUD = 'fraud',
  POLITICAL_CAMPAIGNING = 'political_campaigning',
  SPAM = 'spam',
  DECEPTION = 'deception',
}

// Safety scoring result
export interface SafetyScoringResult {
  overallScore: number; // 0-1, higher is safer
  categories: Record<SafetyCategory, number>; // Category-specific scores
  flaggedPatterns: string[]; // Patterns that were flagged
  moderationDecision: 'allow' | 'flag' | 'block'; // Final decision
  confidence: number; // Confidence in the scoring (0-1)
  metadata: Record<string, any>; // Additional metadata
}

/**
 * Safety Scoring Service
 */
export class SafetyScoringService {
  /**
   * Score content for safety
   */
  static async scoreContent(
    input: SafetyScoringInput,
    context: any
  ): Promise<SafetyScoringResult> {
    try {
      // Validate input
      const validatedInput = ensureArgsSchemaOrThrowHttpError(safetyScoringInputSchema, input);
      
      // Initialize result with default values
      const result: SafetyScoringResult = {
        overallScore: 1.0, // Default to safe
        categories: {
          [SafetyCategory.HARMFUL_INSTRUCTIONS]: 1.0,
          [SafetyCategory.HATE_SPEECH]: 1.0,
          [SafetyCategory.HARASSMENT]: 1.0,
          [SafetyCategory.SELF_HARM]: 1.0,
          [SafetyCategory.SEXUAL_CONTENT]: 1.0,
          [SafetyCategory.VIOLENCE]: 1.0,
          [SafetyCategory.ILLEGAL_ACTIVITY]: 1.0,
          [SafetyCategory.PRIVATE_INFORMATION]: 1.0,
          [SafetyCategory.MALWARE]: 1.0,
          [SafetyCategory.FRAUD]: 1.0,
          [SafetyCategory.POLITICAL_CAMPAIGNING]: 1.0,
          [SafetyCategory.SPAM]: 1.0,
          [SafetyCategory.DECEPTION]: 1.0,
        },
        flaggedPatterns: [],
        moderationDecision: 'allow',
        confidence: 0.8,
        metadata: {},
      };
      
      // Apply pattern-based scoring
      await this.applyPatternBasedScoring(validatedInput, result);
      
      // Apply contextual analysis if context is provided
      if (validatedInput.context) {
        await this.applyContextualAnalysis(validatedInput, result);
      }
      
      // Apply historical analysis if userId is provided
      if (validatedInput.userId) {
        await this.applyHistoricalAnalysis(validatedInput, result);
      }
      
      // Apply AI-based content moderation
      await this.applyAIContentModeration(validatedInput, result, context);
      
      // Calculate overall score as weighted average of category scores
      result.overallScore = this.calculateOverallScore(result.categories);
      
      // Determine moderation decision
      result.moderationDecision = this.determineModerationDecision(result);
      
      // Store the scoring result for future reference
      await this.storeScoreResult(validatedInput, result);
      
      return result;
    } catch (error) {
      console.error('Error scoring content:', error);
      throw new HttpError(500, 'Failed to score content');
    }
  }
  
  /**
   * Apply pattern-based scoring
   */
  private static async applyPatternBasedScoring(
    input: SafetyScoringInput,
    result: SafetyScoringResult
  ): Promise<void> {
    const content = input.content.toLowerCase();
    
    // Load patterns from database
    const patterns = await this.loadSafetyPatterns();
    
    // Check each pattern
    for (const pattern of patterns) {
      const regex = new RegExp(pattern.pattern, 'i');
      if (regex.test(content)) {
        // Add to flagged patterns
        result.flaggedPatterns.push(pattern.name);
        
        // Update category score
        if (pattern.category && pattern.category in result.categories) {
          result.categories[pattern.category as SafetyCategory] = Math.min(
            result.categories[pattern.category as SafetyCategory],
            1 - pattern.severity
          );
        }
      }
    }
  }
  
  /**
   * Apply contextual analysis
   */
  private static async applyContextualAnalysis(
    input: SafetyScoringInput,
    result: SafetyScoringResult
  ): Promise<void> {
    // In a real implementation, this would analyze the context to understand intent
    // For now, we'll just do a simple check for context that might mitigate concerns
    
    const mitigatingPhrases = [
      'for educational purposes',
      'academic research',
      'fictional scenario',
      'hypothetical',
      'cybersecurity training',
    ];
    
    // Check if any mitigating phrases are present in the context
    const context = input.context?.toLowerCase() || '';
    const hasMitigatingContext = mitigatingPhrases.some(phrase => context.includes(phrase));
    
    if (hasMitigatingContext) {
      // Slightly improve scores for all categories
      for (const category in result.categories) {
        result.categories[category as SafetyCategory] = Math.min(
          1.0,
          result.categories[category as SafetyCategory] + 0.2
        );
      }
      
      result.metadata.mitigatingContext = true;
    }
  }
  
  /**
   * Apply historical analysis
   */
  private static async applyHistoricalAnalysis(
    input: SafetyScoringInput,
    result: SafetyScoringResult
  ): Promise<void> {
    if (!input.userId) return;
    
    try {
      // Get recent prompts from this user
      const recentPrompts = await prisma.aIPrompt.findMany({
        where: {
          createdById: input.userId,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      });
      
      // Calculate average safety score
      const safetyScores = recentPrompts
        .map(prompt => prompt.safetyScore)
        .filter(score => score !== null && score !== undefined) as number[];
      
      if (safetyScores.length > 0) {
        const averageSafetyScore = safetyScores.reduce((a, b) => a + b, 0) / safetyScores.length;
        
        // If user has good history, slightly improve score
        if (averageSafetyScore > 0.8) {
          for (const category in result.categories) {
            result.categories[category as SafetyCategory] = Math.min(
              1.0,
              result.categories[category as SafetyCategory] + 0.1
            );
          }
          
          result.metadata.userHistoryScore = averageSafetyScore;
          result.metadata.userHistoryGood = true;
        }
        // If user has problematic history, slightly reduce score
        else if (averageSafetyScore < 0.5) {
          for (const category in result.categories) {
            result.categories[category as SafetyCategory] = Math.max(
              0.0,
              result.categories[category as SafetyCategory] - 0.1
            );
          }
          
          result.metadata.userHistoryScore = averageSafetyScore;
          result.metadata.userHistoryGood = false;
        }
      }
    } catch (error) {
      console.error('Error in historical analysis:', error);
      // Continue without historical analysis
    }
  }
  
  /**
   * Apply AI-based content moderation
   */
  private static async applyAIContentModeration(
    input: SafetyScoringInput,
    result: SafetyScoringResult,
    context: any
  ): Promise<void> {
    try {
      // Use AI to analyze the content
      const aiResponse = await trackedGroqInference({
        prompt: `Please analyze the following content for safety concerns. Rate each category from 0 (unsafe) to 1 (safe).
Content: "${input.content}"
Content Type: ${input.contentType}
${input.context ? `Context: ${input.context}` : ''}

Provide a JSON response with ratings for each category:
- harmful_instructions
- hate_speech
- harassment
- self_harm
- sexual_content
- violence
- illegal_activity
- private_information
- malware
- fraud
- political_campaigning
- spam
- deception

Also include an overall assessment and confidence score.`,
        model: 'llama3-8b-8192',
        temperature: 0.2,
        maxTokens: 1000,
        stream: false,
        userId: input.userId || 'system',
        module: 'safety-scoring',
        sessionType: 'content-moderation',
        promptName: 'Content Safety Analysis',
        promptCategory: 'moderation',
        promptTags: ['safety', 'moderation', 'analysis'],
      }, context);
      
      // Parse the AI response
      try {
        // Extract JSON from the response
        const jsonMatch = aiResponse.choices[0].text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const aiScores = JSON.parse(jsonMatch[0]);
          
          // Update category scores with AI analysis
          for (const category in result.categories) {
            if (category in aiScores) {
              // Blend the pattern-based score with the AI score (70% AI, 30% pattern)
              result.categories[category as SafetyCategory] = 
                0.3 * result.categories[category as SafetyCategory] + 
                0.7 * aiScores[category];
            }
          }
          
          // Update confidence if provided
          if ('confidence' in aiScores) {
            result.confidence = aiScores.confidence;
          }
          
          result.metadata.aiModeration = true;
        }
      } catch (parseError) {
        console.error('Error parsing AI moderation response:', parseError);
        // Continue with pattern-based scores
      }
    } catch (error) {
      console.error('Error in AI content moderation:', error);
      // Continue without AI moderation
    }
  }
  
  /**
   * Calculate overall score as weighted average of category scores
   */
  private static calculateOverallScore(
    categories: Record<SafetyCategory, number>
  ): number {
    // Define weights for each category
    const weights: Record<SafetyCategory, number> = {
      [SafetyCategory.HARMFUL_INSTRUCTIONS]: 1.0,
      [SafetyCategory.HATE_SPEECH]: 1.0,
      [SafetyCategory.HARASSMENT]: 1.0,
      [SafetyCategory.SELF_HARM]: 1.0,
      [SafetyCategory.SEXUAL_CONTENT]: 0.8,
      [SafetyCategory.VIOLENCE]: 0.9,
      [SafetyCategory.ILLEGAL_ACTIVITY]: 1.0,
      [SafetyCategory.PRIVATE_INFORMATION]: 1.0,
      [SafetyCategory.MALWARE]: 1.0,
      [SafetyCategory.FRAUD]: 1.0,
      [SafetyCategory.POLITICAL_CAMPAIGNING]: 0.6,
      [SafetyCategory.SPAM]: 0.5,
      [SafetyCategory.DECEPTION]: 0.7,
    };
    
    let weightedSum = 0;
    let totalWeight = 0;
    
    for (const category in categories) {
      const weight = weights[category as SafetyCategory] || 1.0;
      weightedSum += categories[category as SafetyCategory] * weight;
      totalWeight += weight;
    }
    
    return weightedSum / totalWeight;
  }
  
  /**
   * Determine moderation decision based on scores
   */
  private static determineModerationDecision(
    result: SafetyScoringResult
  ): 'allow' | 'flag' | 'block' {
    // Block if overall score is very low
    if (result.overallScore < 0.3) {
      return 'block';
    }
    
    // Block if any critical category has a very low score
    const criticalCategories = [
      SafetyCategory.HARMFUL_INSTRUCTIONS,
      SafetyCategory.HATE_SPEECH,
      SafetyCategory.SELF_HARM,
      SafetyCategory.ILLEGAL_ACTIVITY,
    ];
    
    for (const category of criticalCategories) {
      if (result.categories[category] < 0.2) {
        return 'block';
      }
    }
    
    // Flag if overall score is moderate
    if (result.overallScore < 0.7) {
      return 'flag';
    }
    
    // Flag if any category has a low score
    for (const category in result.categories) {
      if (result.categories[category as SafetyCategory] < 0.5) {
        return 'flag';
      }
    }
    
    // Otherwise allow
    return 'allow';
  }
  
  /**
   * Store the scoring result for future reference
   */
  private static async storeScoreResult(
    input: SafetyScoringInput,
    result: SafetyScoringResult
  ): Promise<void> {
    try {
      // In a real implementation, this would store the result in the database
      // For now, we'll just log it
      console.log('Safety scoring result:', {
        contentType: input.contentType,
        module: input.module,
        userId: input.userId,
        overallScore: result.overallScore,
        moderationDecision: result.moderationDecision,
        flaggedPatterns: result.flaggedPatterns,
      });
    } catch (error) {
      console.error('Error storing safety score result:', error);
      // Continue without storing
    }
  }
  
  /**
   * Load safety patterns from database
   */
  private static async loadSafetyPatterns(): Promise<any[]> {
    // In a real implementation, this would load patterns from the database
    // For now, we'll return a hardcoded list
    return [
      {
        name: 'SQL Injection',
        pattern: '(SELECT|INSERT|UPDATE|DELETE|DROP).*FROM',
        category: SafetyCategory.MALWARE,
        severity: 0.7,
      },
      {
        name: 'XSS Attack',
        pattern: '<script>.*</script>',
        category: SafetyCategory.MALWARE,
        severity: 0.8,
      },
      {
        name: 'Harmful Instructions',
        pattern: '(how to|instructions for|steps to).*(hack|steal|attack|exploit)',
        category: SafetyCategory.HARMFUL_INSTRUCTIONS,
        severity: 0.6,
      },
      {
        name: 'Hate Speech',
        pattern: '(hate|racial slur|racist)',
        category: SafetyCategory.HATE_SPEECH,
        severity: 0.7,
      },
      {
        name: 'Self Harm',
        pattern: '(suicide|self.harm|kill myself)',
        category: SafetyCategory.SELF_HARM,
        severity: 0.9,
      },
      {
        name: 'Violence',
        pattern: '(kill|murder|attack|hurt|injure)',
        category: SafetyCategory.VIOLENCE,
        severity: 0.6,
      },
      {
        name: 'Illegal Activity',
        pattern: '(illegal|crime|criminal|law|drugs|weapon)',
        category: SafetyCategory.ILLEGAL_ACTIVITY,
        severity: 0.5,
      },
      {
        name: 'Private Information',
        pattern: '(password|credit card|social security|address|phone number)',
        category: SafetyCategory.PRIVATE_INFORMATION,
        severity: 0.8,
      },
      {
        name: 'Fraud',
        pattern: '(scam|fraud|fake|counterfeit|phishing)',
        category: SafetyCategory.FRAUD,
        severity: 0.7,
      },
    ];
  }
}
