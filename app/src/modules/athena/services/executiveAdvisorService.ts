/**
 * Executive Advisor Service
 *
 * This service provides functions for generating executive-level business advice,
 * summaries, and strategic suggestions with configurable communication styles.
 */

import {
  BusinessMetric,
  BusinessInsight,
  BusinessRecommendation,
  StrategicRecommendation,
  ExecutiveSummary,
  ExecutiveAdvisorOutput,
  ExecutiveAdvisorOptions,
  ExecutiveAdvisorTone,
  TimeframeOption,
  ImpactLevel
} from '../types';
import { LoggingService } from '@src/shared/services/logging';
import { prisma } from 'wasp/server';
import { groqInference } from '@src/ai-services/groq';

/**
 * Generates executive advisor output based on business data and specified communication style
 */
export async function generateExecutiveAdvice(
  metrics: BusinessMetric[],
  insights: BusinessInsight[],
  recommendations: StrategicRecommendation[],
  executiveSummary: ExecutiveSummary | null,
  options: ExecutiveAdvisorOptions,
  userId: string,
  context: any
): Promise<ExecutiveAdvisorOutput> {
  try {
    // Log the operation
    LoggingService.info({
      message: 'Generating executive advisor output',
      userId,
      module: 'athena',
      category: 'EXECUTIVE_ADVISOR',
      metadata: {
        timeframe: options.timeframe,
        communicationStyle: options.communicationStyle,
        focusArea: options.focusArea,
        includeInvestorPitch: options.includeInvestorPitch,
      },
    });

    // Prepare data for AI analysis
    const dataForAnalysis = {
      metrics: metrics.map(metric => ({
        name: metric.name,
        category: metric.category,
        value: metric.value,
        previousValue: metric.previousValue,
        percentChange: metric.percentChange,
        unit: metric.unit,
      })),
      insights: insights.map(insight => ({
        title: insight.title,
        description: insight.description,
        category: insight.category,
        impact: insight.impact,
      })),
      recommendations: recommendations.map(rec => ({
        title: rec.title,
        description: rec.description,
        category: rec.category,
        impact: rec.impact,
        actionItems: rec.actionItems,
        expectedOutcome: rec.expectedOutcome,
      })),
      executiveSummary: executiveSummary ? {
        title: executiveSummary.title,
        summary: executiveSummary.summary,
        keyMetrics: executiveSummary.keyMetrics,
        keyInsights: executiveSummary.keyInsights,
        topRecommendations: executiveSummary.topRecommendations,
        riskFactors: executiveSummary.riskFactors,
        opportunities: executiveSummary.opportunities,
      } : null,
    };

    // Determine the communication style instructions
    let styleInstructions = '';
    switch (options.communicationStyle) {
      case ExecutiveAdvisorTone.AGGRESSIVE:
        styleInstructions = `
          Use an aggressive, growth-focused communication style:
          - Emphasize bold, high-impact opportunities
          - Focus on market disruption and competitive advantages
          - Highlight ambitious growth targets
          - Use confident, assertive language
          - Prioritize speed and market capture over caution
          - Frame risks as opportunities for differentiation
          - Use phrases like "dominate the market," "aggressive expansion," "outpace competitors"
        `;
        break;
      case ExecutiveAdvisorTone.CONSERVATIVE:
        styleInstructions = `
          Use a conservative, risk-aware communication style:
          - Emphasize sustainable, measured growth
          - Focus on risk mitigation and stability
          - Highlight proven strategies with established ROI
          - Use careful, precise language
          - Prioritize due diligence and thorough analysis
          - Frame opportunities in terms of long-term stability
          - Use phrases like "sustainable growth," "risk-adjusted returns," "proven approach"
        `;
        break;
      default: // BALANCED
        styleInstructions = `
          Use a balanced, strategic communication style:
          - Balance growth opportunities with risk awareness
          - Focus on strategic positioning and competitive advantage
          - Highlight both short-term wins and long-term vision
          - Use clear, direct language
          - Prioritize data-driven decisions with strategic context
          - Frame recommendations as part of a cohesive strategy
          - Use phrases like "strategic advantage," "balanced approach," "informed decision-making"
        `;
    }

    // Determine focus area instructions
    const focusAreaInstructions = options.focusArea && options.focusArea.length > 0
      ? `Focus particularly on these business areas: ${options.focusArea.join(', ')}.`
      : 'Consider all relevant business areas in your analysis.';

    // Determine investor pitch instructions
    const investorPitchInstructions = options.includeInvestorPitch
      ? `Include a section with 5-7 key investor pitch points that highlight the most compelling aspects of the business for potential investors.`
      : 'Do not include investor pitch points.';

    // Determine length instructions
    let lengthInstructions = '';
    switch (options.maxLength) {
      case 'concise':
        lengthInstructions = 'Keep all outputs concise and to the point. Summary should be 100-150 words.';
        break;
      case 'detailed':
        lengthInstructions = 'Provide detailed explanations and context. Summary can be 250-300 words.';
        break;
      default: // standard
        lengthInstructions = 'Use a standard level of detail. Summary should be 150-200 words.';
    }

    // Use AI to generate executive advisor output
    const prompt = `
      You are an Executive Advisor with expertise in strategic business communication and executive-level guidance.

      # TASK
      Generate executive-level business advice and strategic suggestions based on the provided business data.

      # INPUT DATA
      ## Timeframe: ${options.timeframe}

      ## Business Metrics:
      ${JSON.stringify(dataForAnalysis.metrics, null, 2)}

      ## Business Insights:
      ${JSON.stringify(dataForAnalysis.insights, null, 2)}

      ## Strategic Recommendations:
      ${JSON.stringify(dataForAnalysis.recommendations, null, 2)}

      ## Executive Summary:
      ${dataForAnalysis.executiveSummary ? JSON.stringify(dataForAnalysis.executiveSummary, null, 2) : 'Not available'}

      # COMMUNICATION STYLE
      ${styleInstructions}

      # FOCUS AREAS
      ${focusAreaInstructions}

      # ADDITIONAL INSTRUCTIONS
      ${investorPitchInstructions}
      ${lengthInstructions}
      Limit to ${options.maxSuggestions || 5} strategic suggestions.

      # OUTPUT REQUIREMENTS
      Generate executive advisor output that includes:
      1. title: A clear, impactful title for the executive advice (10-15 words)
      2. summary: A strategic summary paragraph that captures the essence of the business situation and key strategic direction
      3. keyPoints: Array of 3-5 key points that executives should focus on (one sentence each)
      4. strategicSuggestions: Array of ${options.maxSuggestions || 5} strategic suggestions (2-3 sentences each)
      5. growthOpportunities: Array of 3-4 specific growth opportunities, each with:
         - title: Short, descriptive title
         - description: Detailed explanation (2-3 sentences)
         - impact: Expected impact level (must be one of: low, medium, high, critical)
         - timeframe: Implementation timeframe (must be one of: day, week, month, quarter, year)
      ${options.includeInvestorPitch ? '6. investorPitchPoints: Array of 5-7 compelling points for investor pitches (one sentence each)' : ''}

      # REASONING APPROACH
      1. First, analyze the data holistically to understand the overall business situation
      2. Identify the most strategic opportunities aligned with the specified communication style
      3. Craft advice that balances short-term actions with long-term strategic positioning
      4. Ensure all suggestions are actionable and specific
      5. Tailor the language and emphasis according to the specified communication style
      6. Focus on executive-level concerns rather than operational details

      # FORMAT
      Return your response as a JSON object with the fields described in the output requirements.
      Example format:
      {
        "title": "Strategic Growth Acceleration: Q3 Executive Roadmap",
        "summary": "Detailed summary paragraph here...",
        "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
        "strategicSuggestions": ["Strategic suggestion 1", "Strategic suggestion 2"],
        "growthOpportunities": [
          {
            "title": "Enterprise Client Expansion",
            "description": "Detailed description here...",
            "impact": "high",
            "timeframe": "quarter"
          }
        ],
        ${options.includeInvestorPitch ? '"investorPitchPoints": ["Investor pitch point 1", "Investor pitch point 2"],' : ''}
        "communicationStyle": "${options.communicationStyle}"
      }
    `;

    const response = await groqInference({
      prompt,
      model: "llama3-70b-8192",
      temperature: 0.3,
      responseFormat: { type: 'json_object' }
    }, context);

    // Parse the response
    const adviceData = JSON.parse(response.content);

    const executiveAdvice: ExecutiveAdvisorOutput = {
      id: `exec-advice-${Date.now()}-${Math.random().toString(36).substring(2, 12)}`,
      title: adviceData.title,
      summary: adviceData.summary,
      keyPoints: adviceData.keyPoints,
      strategicSuggestions: adviceData.strategicSuggestions,
      investorPitchPoints: adviceData.investorPitchPoints || undefined,
      growthOpportunities: adviceData.growthOpportunities,
      communicationStyle: options.communicationStyle,
      createdAt: new Date(),
      metadata: {
        generatedBy: 'executive-advisor-service',
        aiModel: 'llama3-70b-8192',
        timeframe: options.timeframe,
        focusArea: options.focusArea,
      }
    };

    // Store in database if needed
    // This could be implemented later if persistence is required

    return executiveAdvice;
  } catch (error) {
    console.error('Error generating executive advice:', error);
    LoggingService.error({
      message: 'Error generating executive advice',
      userId,
      module: 'athena',
      category: 'EXECUTIVE_ADVISOR',
      error: error as Error,
    });

    // Return a basic advice in case of error
    return {
      id: `exec-advice-${Date.now()}-${Math.random().toString(36).substring(2, 12)}`,
      title: 'Executive Advice (Error Recovery)',
      summary: 'An error occurred while generating executive advice. Please try again later.',
      keyPoints: ['Unable to generate key points due to processing error'],
      strategicSuggestions: [],
      growthOpportunities: [],
      communicationStyle: options.communicationStyle,
      createdAt: new Date(),
      metadata: {
        error: true,
        errorMessage: (error as Error).message,
      }
    };
  }
}