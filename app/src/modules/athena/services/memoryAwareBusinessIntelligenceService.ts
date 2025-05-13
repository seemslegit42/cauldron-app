/**
 * Memory-Aware Business Intelligence Service
 *
 * This service provides functions for generating business intelligence with memory awareness.
 * It integrates with the LangGraph workflow and memory system to provide context-aware insights.
 */

import { LoggingService } from '@src/shared/services/logging';
import { prisma } from 'wasp/server';
import { 
  BusinessMetric, 
  BusinessInsight, 
  StrategicRecommendation, 
  ExecutiveSummary,
  TimeframeOption,
  ImpactLevel,
  ConfidenceLevel
} from '../types';
import { 
  executeBusinessIntelligenceWorkflow 
} from '../langGraph/businessIntelligenceWorkflow';
import { 
  searchMemories, 
  storeMemory 
} from '@src/modules/memory/services/enhancedMemoryManager';
import { 
  MemoryEntryType, 
  MemoryContentType 
} from '@src/modules/memory/types';

/**
 * Generates business insights with memory awareness
 * 
 * @param metrics Current business metrics
 * @param timeframe The timeframe for analysis
 * @param userId The user ID
 * @param context The request context
 * @returns Generated insights
 */
export async function generateMemoryAwareInsights(
  metrics: BusinessMetric[],
  timeframe: TimeframeOption,
  userId: string,
  context: any
): Promise<BusinessInsight[]> {
  try {
    // Log the operation
    LoggingService.info({
      message: 'Generating memory-aware business insights',
      userId,
      module: 'athena',
      category: 'BUSINESS_INTELLIGENCE',
      metadata: {
        timeframe,
        metricCount: metrics.length
      }
    });
    
    // Create a search query based on metrics
    const metricCategories = [...new Set(metrics.map(m => m.category))];
    const searchQuery = `Business insights for categories: ${metricCategories.join(', ')}`;
    
    // Execute the workflow
    const result = await executeBusinessIntelligenceWorkflow({
      userId,
      timeframe,
      metrics,
      searchQuery
    });
    
    // Check for errors
    if (result.error) {
      throw new Error(`Workflow execution failed: ${result.error}`);
    }
    
    // Return the insights
    return result.finalState.insights || [];
  } catch (error) {
    LoggingService.error({
      message: 'Error generating memory-aware business insights',
      userId,
      module: 'athena',
      category: 'BUSINESS_INTELLIGENCE',
      error,
      metadata: {
        timeframe
      }
    });
    
    throw error;
  }
}

/**
 * Generates strategic recommendations with memory awareness
 * 
 * @param metrics Current business metrics
 * @param insights Business insights
 * @param timeframe The timeframe for analysis
 * @param userId The user ID
 * @param context The request context
 * @returns Generated recommendations
 */
export async function generateMemoryAwareRecommendations(
  metrics: BusinessMetric[],
  insights: BusinessInsight[],
  timeframe: TimeframeOption,
  userId: string,
  context: any
): Promise<StrategicRecommendation[]> {
  try {
    // Log the operation
    LoggingService.info({
      message: 'Generating memory-aware strategic recommendations',
      userId,
      module: 'athena',
      category: 'BUSINESS_INTELLIGENCE',
      metadata: {
        timeframe,
        metricCount: metrics.length,
        insightCount: insights.length
      }
    });
    
    // Create a search query based on insights
    const insightTitles = insights.map(i => i.title).join(', ');
    const searchQuery = `Strategic recommendations for insights: ${insightTitles}`;
    
    // Execute the workflow
    const result = await executeBusinessIntelligenceWorkflow({
      userId,
      timeframe,
      metrics,
      insightsJson: JSON.stringify(insights),
      searchQuery
    });
    
    // Check for errors
    if (result.error) {
      throw new Error(`Workflow execution failed: ${result.error}`);
    }
    
    // Return the recommendations
    return result.finalState.recommendations || [];
  } catch (error) {
    LoggingService.error({
      message: 'Error generating memory-aware strategic recommendations',
      userId,
      module: 'athena',
      category: 'BUSINESS_INTELLIGENCE',
      error,
      metadata: {
        timeframe
      }
    });
    
    throw error;
  }
}

/**
 * Generates an executive summary with historical context
 * 
 * @param metrics Current business metrics
 * @param insights Business insights
 * @param recommendations Strategic recommendations
 * @param timeframe The timeframe for analysis
 * @param userId The user ID
 * @param context The request context
 * @returns Generated executive summary
 */
export async function generateExecutiveSummaryWithHistory(
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
      message: 'Generating executive summary with historical context',
      userId,
      module: 'athena',
      category: 'BUSINESS_INTELLIGENCE',
      metadata: {
        timeframe,
        metricCount: metrics.length,
        insightCount: insights.length,
        recommendationCount: recommendations.length
      }
    });
    
    // Create a search query for historical context
    const searchQuery = `Executive summary for timeframe: ${timeframe}`;
    
    // Execute the workflow
    const result = await executeBusinessIntelligenceWorkflow({
      userId,
      timeframe,
      metrics,
      insightsJson: JSON.stringify(insights),
      recommendationsJson: JSON.stringify(recommendations),
      searchQuery
    });
    
    // Check for errors
    if (result.error) {
      throw new Error(`Workflow execution failed: ${result.error}`);
    }
    
    // Get the executive summary
    const executiveSummary = result.finalState.executiveSummary;
    
    if (!executiveSummary) {
      throw new Error('No executive summary generated');
    }
    
    // Add metadata
    executiveSummary.createdAt = new Date();
    executiveSummary.timeframe = timeframe;
    executiveSummary.metadata = {
      generatedBy: 'memory-aware-business-intelligence-service',
      aiModel: 'llama3-70b-8192',
      workflowId: result.graphStateId
    };
    
    // Store the executive summary in the database
    const dbExecutiveSummary = await prisma.executiveSummary.create({
      data: {
        title: executiveSummary.title,
        summary: executiveSummary.summary,
        keyMetrics: executiveSummary.keyMetrics,
        keyInsights: executiveSummary.keyInsights,
        topRecommendations: executiveSummary.topRecommendations,
        riskFactors: executiveSummary.riskFactors,
        opportunities: executiveSummary.opportunities,
        timeframe,
        userId,
        metadata: executiveSummary.metadata
      }
    });
    
    // Return the executive summary
    return {
      ...executiveSummary,
      id: dbExecutiveSummary.id
    };
  } catch (error) {
    LoggingService.error({
      message: 'Error generating executive summary with historical context',
      userId,
      module: 'athena',
      category: 'BUSINESS_INTELLIGENCE',
      error,
      metadata: {
        timeframe
      }
    });
    
    throw error;
  }
}

/**
 * Tracks the effectiveness of a recommendation
 * 
 * @param recommendationId The recommendation ID
 * @param effectiveness The effectiveness rating (0-100)
 * @param feedback Optional feedback
 * @param userId The user ID
 * @returns Success status
 */
export async function trackRecommendationEffectiveness(
  recommendationId: string,
  effectiveness: number,
  feedback: string | null,
  userId: string
): Promise<boolean> {
  try {
    // Log the operation
    LoggingService.info({
      message: 'Tracking recommendation effectiveness',
      userId,
      module: 'athena',
      category: 'BUSINESS_INTELLIGENCE',
      metadata: {
        recommendationId,
        effectiveness,
        hasFeedback: !!feedback
      }
    });
    
    // Update the recommendation in the database
    await prisma.strategicRecommendation.update({
      where: { id: recommendationId },
      data: {
        effectiveness,
        feedback,
        updatedAt: new Date()
      }
    });
    
    // Store the effectiveness in memory
    await storeMemory({
      userId,
      type: MemoryEntryType.LONG_TERM,
      contentType: MemoryContentType.RECOMMENDATION_FEEDBACK,
      context: 'recommendation-effectiveness',
      content: {
        recommendationId,
        effectiveness,
        feedback
      },
      importance: 2.0,
      metadata: {
        recommendationId
      },
      embedding: []
    });
    
    return true;
  } catch (error) {
    LoggingService.error({
      message: 'Error tracking recommendation effectiveness',
      userId,
      module: 'athena',
      category: 'BUSINESS_INTELLIGENCE',
      error,
      metadata: {
        recommendationId
      }
    });
    
    return false;
  }
}
