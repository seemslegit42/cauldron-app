/**
 * Strategic Analysis Service
 *
 * This service provides functions for analyzing business metrics and generating strategic insights.
 */

import {
  BusinessMetric,
  BusinessInsight,
  BusinessRecommendation,
  StrategicRecommendation,
  MarketData,
  ExecutiveSummary,
  MetricCategory,
  TimeframeOption,
  ImpactLevel,
  ConfidenceLevel
} from '../types';
import { LoggingService } from '@src/shared/services/logging';
import { prisma } from 'wasp/server';
import { groqInference } from '@src/ai-services/groq';

/**
 * Analyzes business metrics and generates strategic insights
 */
export async function analyzeBusinessMetrics(
  metrics: BusinessMetric[],
  userId: string,
  context: any
): Promise<BusinessInsight[]> {
  try {
    // Log the operation
    LoggingService.info({
      message: 'Analyzing business metrics for strategic insights',
      userId,
      module: 'athena',
      category: 'STRATEGIC_ANALYSIS',
      metadata: {
        metricCount: metrics.length,
      },
    });

    // Prepare metrics for AI analysis
    const metricsForAnalysis = metrics.map(metric => ({
      name: metric.name,
      category: metric.category,
      value: metric.value,
      previousValue: metric.previousValue,
      percentChange: metric.percentChange,
      target: metric.target,
      unit: metric.unit,
    }));

    // Use AI to analyze metrics
    const prompt = `
      You are a strategic business analyst with expertise in data analysis and business intelligence.

      # TASK
      Analyze the following business metrics and identify strategic insights that can drive business decisions.

      # BUSINESS METRICS
      ${JSON.stringify(metricsForAnalysis, null, 2)}

      # CONTEXT
      - These metrics represent key performance indicators for the business
      - Look for patterns, anomalies, correlations, and trends in the data
      - Consider both positive and negative indicators
      - Prioritize insights that have actionable implications
      - Focus on insights that could lead to strategic business decisions

      # OUTPUT REQUIREMENTS
      Generate 3-5 strategic insights based on these metrics. Each insight must include:
      1. title: A clear, concise title (5-10 words)
      2. description: A detailed explanation of the insight (100-150 words) that includes:
         - What the data shows
         - Why it matters
         - Potential business implications
      3. category: The business category it belongs to (must be one of: revenue, growth, engagement, conversion, retention, acquisition, performance, marketing, sales, customer, financial, operational, market, product, hiring, partnership)
      4. impact: Impact level (must be one of: low, medium, high, critical)
      5. confidence: Confidence level in the insight (must be one of: low, medium, high, very_high)
      6. relatedMetrics: Array of metric names from the input data that support this insight

      # REASONING APPROACH
      1. First, identify the most significant metrics by looking at:
         - Metrics with large percentage changes
         - Metrics far from their targets
         - Metrics in critical business areas
      2. Look for relationships between metrics
      3. Consider the business implications of the patterns you observe
      4. Assess the confidence level based on the data quality and consistency
      5. Determine the potential impact on business outcomes

      # FORMAT
      Return your response as a JSON object with an "insights" array containing the insight objects.
      Example format:
      {
        "insights": [
          {
            "title": "Insight title here",
            "description": "Detailed description here...",
            "category": "revenue",
            "impact": "high",
            "confidence": "medium",
            "relatedMetrics": ["Metric 1", "Metric 2"]
          }
        ]
      }
    `;

    const response = await groqInference({
      prompt,
      model: "llama3-70b-8192",
      temperature: 0.2,
      responseFormat: { type: 'json_object' }
    }, context);

    // Parse the response
    const insights: BusinessInsight[] = JSON.parse(response.content).insights.map((insight: any) => ({
      id: `insight-${Date.now()}-${Math.random().toString(36).substring(2, 12)}`,
      title: insight.title,
      description: insight.description,
      category: insight.category,
      impact: insight.impact,
      confidence: insight.confidence,
      relatedMetrics: insight.relatedMetrics,
      createdAt: new Date(),
      isArchived: false,
      metadata: {
        generatedBy: 'strategic-analysis-service',
        aiModel: 'llama3-70b-8192',
      }
    }));

    // Store insights in the database
    for (const insight of insights) {
      await prisma.businessInsight.create({
        data: {
          ...insight,
          userId,
        },
      });
    }

    return insights;
  } catch (error) {
    console.error('Error analyzing business metrics:', error);
    LoggingService.error({
      message: 'Error analyzing business metrics',
      userId,
      module: 'athena',
      category: 'STRATEGIC_ANALYSIS',
      error: error as Error,
    });
    return [];
  }
}

/**
 * Generates strategic recommendations based on business insights and market data
 */
export async function generateStrategicRecommendations(
  insights: BusinessInsight[],
  marketData: MarketData[],
  userId: string,
  context: any
): Promise<StrategicRecommendation[]> {
  try {
    // Log the operation
    LoggingService.info({
      message: 'Generating strategic recommendations',
      userId,
      module: 'athena',
      category: 'STRATEGIC_ANALYSIS',
      metadata: {
        insightCount: insights.length,
        marketDataCount: marketData.length,
      },
    });

    // Prepare data for AI analysis
    const dataForAnalysis = {
      insights: insights.map(insight => ({
        title: insight.title,
        description: insight.description,
        category: insight.category,
        impact: insight.impact,
        confidence: insight.confidence,
      })),
      marketData: marketData.map(data => ({
        name: data.name,
        category: data.category,
        value: data.value,
        trend: data.trend,
        impact: data.impact,
        description: data.description,
      })),
    };

    // Use AI to generate recommendations
    const prompt = `
      You are a strategic business consultant with expertise in developing actionable business strategies based on data analysis.

      # TASK
      Generate strategic recommendations based on the provided business insights and market data.

      # INPUT DATA
      ## Business Insights:
      ${JSON.stringify(dataForAnalysis.insights, null, 2)}

      ## Market Data:
      ${JSON.stringify(dataForAnalysis.marketData, null, 2)}

      # CONTEXT
      - These insights and market data represent the current business situation
      - Your recommendations should address key challenges and opportunities
      - Focus on actionable strategies that can drive measurable business outcomes
      - Consider both short-term wins and long-term strategic advantages
      - Balance risk and reward in your recommendations

      # OUTPUT REQUIREMENTS
      Generate 3-5 strategic recommendations. Each recommendation must include:
      1. title: A clear, action-oriented title (5-10 words)
      2. description: A detailed explanation of the recommendation (150-200 words) that includes:
         - The strategic rationale
         - How it addresses specific insights or market conditions
         - The expected business impact
      3. category: The business category it belongs to (must be one of: revenue, growth, engagement, conversion, retention, acquisition, performance, marketing, sales, customer, financial, operational, market, product, hiring, partnership)
      4. impact: Expected impact level (must be one of: low, medium, high, critical)
      5. timeframe: Implementation timeframe (must be one of: day, week, month, quarter, year)
      6. actionItems: Array of 3-7 specific, concrete actions to implement this recommendation
      7. expectedOutcome: Detailed description of the expected outcome if implemented successfully
      8. supportingData: Array of specific data points from the insights or market data that support this recommendation

      # REASONING APPROACH
      1. First, identify the most critical insights and market trends by looking at:
         - High-impact insights
         - Market data showing significant trends or opportunities
         - Areas where business performance is below target
      2. Develop recommendations that directly address these critical areas
      3. Ensure each recommendation is specific, measurable, achievable, relevant, and time-bound (SMART)
      4. Prioritize recommendations based on potential impact and feasibility
      5. For each recommendation, develop concrete action items that can be implemented

      # FORMAT
      Return your response as a JSON object with a "recommendations" array containing the recommendation objects.
      Example format:
      {
        "recommendations": [
          {
            "title": "Recommendation title here",
            "description": "Detailed description here...",
            "category": "product",
            "impact": "high",
            "timeframe": "quarter",
            "actionItems": ["Action 1", "Action 2", "Action 3"],
            "expectedOutcome": "Expected outcome description here...",
            "supportingData": ["Data point 1", "Data point 2"]
          }
        ]
      }
    `;

    const response = await groqInference({
      prompt,
      model: "llama3-70b-8192",
      temperature: 0.3,
      responseFormat: { type: 'json_object' }
    }, context);

    // Parse the response
    const recommendations: StrategicRecommendation[] = JSON.parse(response.content).recommendations.map((rec: any) => ({
      id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 12)}`,
      title: rec.title,
      description: rec.description,
      category: rec.category,
      impact: rec.impact,
      timeframe: rec.timeframe,
      actionItems: rec.actionItems,
      expectedOutcome: rec.expectedOutcome,
      supportingData: rec.supportingData,
      createdAt: new Date(),
      isImplemented: false,
      metadata: {
        generatedBy: 'strategic-analysis-service',
        aiModel: 'llama3-70b-8192',
      }
    }));

    return recommendations;
  } catch (error) {
    console.error('Error generating strategic recommendations:', error);
    LoggingService.error({
      message: 'Error generating strategic recommendations',
      userId,
      module: 'athena',
      category: 'STRATEGIC_ANALYSIS',
      error: error as Error,
    });
    return [];
  }
}

/**
 * Generates an executive summary based on business metrics, insights, and recommendations
 */
export async function generateExecutiveSummary(
  metrics: BusinessMetric[],
  insights: BusinessInsight[],
  recommendations: StrategicRecommendation[],
  timeframe: TimeframeOption,
  userId: string,
  context: any
): Promise<ExecutiveSummary> {
  try {
    // Log the operation
    LoggingService.info({
      message: 'Generating executive summary',
      userId,
      module: 'athena',
      category: 'EXECUTIVE_SUMMARY',
      metadata: {
        timeframe,
        metricCount: metrics.length,
        insightCount: insights.length,
        recommendationCount: recommendations.length,
      },
    });

    // Prepare data for AI analysis
    const dataForAnalysis = {
      timeframe,
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
    };

    // Use AI to generate executive summary
    const prompt = `
      You are a C-level executive with expertise in strategic business analysis and communication.

      # TASK
      Generate a comprehensive executive summary based on the provided business data.

      # INPUT DATA
      ## Timeframe: ${timeframe}

      ## Business Metrics:
      ${JSON.stringify(dataForAnalysis.metrics, null, 2)}

      ## Business Insights:
      ${JSON.stringify(dataForAnalysis.insights, null, 2)}

      ## Strategic Recommendations:
      ${JSON.stringify(dataForAnalysis.recommendations, null, 2)}

      # CONTEXT
      - This executive summary will be presented to senior leadership and board members
      - It should provide a clear, concise overview of the business situation
      - Focus on the most important metrics, insights, and recommendations
      - Highlight both risks and opportunities
      - The summary should enable strategic decision-making

      # OUTPUT REQUIREMENTS
      Generate an executive summary that includes:
      1. title: A clear, descriptive title for the summary (10-15 words)
      2. summary: A concise overall summary paragraph (150-200 words) that captures:
         - The current business situation
         - Major trends and developments
         - Critical challenges and opportunities
         - Strategic direction
      3. keyMetrics: Array of 5-7 objects containing the most important metrics with:
         - name: Name of the metric
         - value: Current value with appropriate formatting
         - trend: Percentage change (positive or negative number)
      4. keyInsights: Array of 3-5 most important business insights (one sentence each)
      5. topRecommendations: Array of 3-5 most critical recommendations (one sentence each)
      6. riskFactors: Array of 3-5 key risk factors the business should be aware of (one sentence each)
      7. opportunities: Array of 3-5 key opportunities the business should capitalize on (one sentence each)

      # REASONING APPROACH
      1. First, analyze the data holistically to understand the overall business situation
      2. Identify the most critical metrics that tell the business story:
         - Focus on metrics with significant changes or that are far from targets
         - Include a mix of financial, operational, and customer metrics
      3. Extract the highest-impact insights and recommendations
      4. Identify both internal and external risk factors
      5. Highlight both immediate and long-term opportunities
      6. Ensure the summary tells a coherent story about the business

      # FORMAT
      Return your response as a JSON object with the fields described in the output requirements.
      Example format:
      {
        "title": "Executive Summary title here",
        "summary": "Overall summary paragraph here...",
        "keyMetrics": [
          {
            "name": "Metric Name",
            "value": "Metric Value",
            "trend": 5.2
          }
        ],
        "keyInsights": ["Insight 1", "Insight 2", "Insight 3"],
        "topRecommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
        "riskFactors": ["Risk 1", "Risk 2", "Risk 3"],
        "opportunities": ["Opportunity 1", "Opportunity 2", "Opportunity 3"]
      }
    `;

    const response = await groqInference({
      prompt,
      model: "llama3-70b-8192",
      temperature: 0.2,
      responseFormat: { type: 'json_object' }
    }, context);

    // Parse the response
    const summaryData = JSON.parse(response.content);

    const executiveSummary: ExecutiveSummary = {
      id: `summary-${Date.now()}-${Math.random().toString(36).substring(2, 12)}`,
      title: summaryData.title,
      summary: summaryData.summary,
      keyMetrics: summaryData.keyMetrics,
      keyInsights: summaryData.keyInsights,
      topRecommendations: summaryData.topRecommendations,
      riskFactors: summaryData.riskFactors,
      opportunities: summaryData.opportunities,
      createdAt: new Date(),
      timeframe,
      metadata: {
        generatedBy: 'strategic-analysis-service',
        aiModel: 'llama3-70b-8192',
      }
    };

    return executiveSummary;
  } catch (error) {
    console.error('Error generating executive summary:', error);
    LoggingService.error({
      message: 'Error generating executive summary',
      userId,
      module: 'athena',
      category: 'EXECUTIVE_SUMMARY',
      error: error as Error,
    });

    // Return a basic summary in case of error
    return {
      id: `summary-${Date.now()}-${Math.random().toString(36).substring(2, 12)}`,
      title: 'Executive Summary (Error Recovery)',
      summary: 'An error occurred while generating the executive summary. Please try again later.',
      keyMetrics: [],
      keyInsights: [],
      topRecommendations: [],
      riskFactors: ['Unable to analyze risks due to processing error'],
      opportunities: [],
      createdAt: new Date(),
      timeframe,
      metadata: {
        error: true,
        errorMessage: (error as Error).message,
      }
    };
  }
}
