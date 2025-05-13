import { prisma } from 'wasp/server';
import { analyzeSentiment, SentimentAnalysisResult, aggregateSentimentResults } from '../../../ai-services/sentimentAnalysisService';
import { logger } from '../../../shared/logger';

/**
 * Processes a new feedback entry and adds sentiment analysis
 * @param feedbackId The ID of the feedback entry to process
 */
export async function processFeedbackSentiment(feedbackId: string): Promise<void> {
  try {
    // Get the feedback entry
    const feedback = await prisma.feedbackEntry.findUnique({
      where: { id: feedbackId }
    });

    if (!feedback || !feedback.comment) {
      logger.info('No feedback comment to analyze', { feedbackId });
      return;
    }

    // Analyze the sentiment
    const sentimentResult = await analyzeSentiment(feedback.comment, 'feedback');

    // Update the feedback entry with sentiment data
    await prisma.feedbackEntry.update({
      where: { id: feedbackId },
      data: {
        sentimentScore: sentimentResult.score,
        sentimentLabel: sentimentResult.sentiment,
        emotionalTones: sentimentResult.emotionalTones,
        confusionDetected: sentimentResult.metadata.confusion,
        fatigueDetected: sentimentResult.metadata.fatigue,
        trustScore: sentimentResult.metadata.trust,
        sentimentMetadata: sentimentResult.metadata as any
      }
    });

    logger.info('Processed feedback sentiment', { 
      feedbackId, 
      sentiment: sentimentResult.sentiment,
      score: sentimentResult.score
    });
  } catch (error) {
    logger.error('Error processing feedback sentiment', { feedbackId, error });
  }
}

/**
 * Processes a new agent feedback entry and adds sentiment analysis
 * @param feedbackId The ID of the agent feedback to process
 */
export async function processAgentFeedbackSentiment(feedbackId: string): Promise<void> {
  try {
    // Get the agent feedback
    const feedback = await prisma.agentFeedback.findUnique({
      where: { id: feedbackId }
    });

    if (!feedback || !feedback.feedback) {
      logger.info('No agent feedback text to analyze', { feedbackId });
      return;
    }

    // Analyze the sentiment
    const sentimentResult = await analyzeSentiment(feedback.feedback, 'agent_feedback');

    // Update the feedback entry with sentiment data
    await prisma.agentFeedback.update({
      where: { id: feedbackId },
      data: {
        sentimentScore: sentimentResult.score,
        sentimentLabel: sentimentResult.sentiment,
        emotionalTones: sentimentResult.emotionalTones,
        confusionDetected: sentimentResult.metadata.confusion,
        fatigueDetected: sentimentResult.metadata.fatigue,
        trustScore: sentimentResult.metadata.trust,
        sentimentMetadata: sentimentResult.metadata as any
      }
    });

    logger.info('Processed agent feedback sentiment', { 
      feedbackId, 
      sentiment: sentimentResult.sentiment,
      score: sentimentResult.score
    });
  } catch (error) {
    logger.error('Error processing agent feedback sentiment', { feedbackId, error });
  }
}

/**
 * Processes a human approval and adds sentiment analysis
 * @param approvalId The ID of the human approval to process
 */
export async function processApprovalSentiment(approvalId: string): Promise<void> {
  try {
    // Get the approval
    const approval = await prisma.humanApproval.findUnique({
      where: { id: approvalId }
    });

    if (!approval || !approval.reason) {
      logger.info('No approval reason to analyze', { approvalId });
      return;
    }

    // Analyze the sentiment
    const sentimentResult = await analyzeSentiment(approval.reason, 'approval');

    // Update the approval with sentiment data
    await prisma.humanApproval.update({
      where: { id: approvalId },
      data: {
        sentimentScore: sentimentResult.score,
        sentimentLabel: sentimentResult.sentiment,
        emotionalTones: sentimentResult.emotionalTones,
        confusionDetected: sentimentResult.metadata.confusion,
        fatigueDetected: sentimentResult.metadata.fatigue,
        trustScore: sentimentResult.metadata.trust,
        sentimentMetadata: sentimentResult.metadata as any
      }
    });

    logger.info('Processed approval sentiment', { 
      approvalId, 
      sentiment: sentimentResult.sentiment,
      score: sentimentResult.score
    });
  } catch (error) {
    logger.error('Error processing approval sentiment', { approvalId, error });
  }
}

/**
 * Gets sentiment trends for a specific user over time
 * @param userId The user ID to get trends for
 * @param days Number of days to look back
 */
export async function getUserSentimentTrends(userId: string, days: number = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all feedback from this user in the time period
    const feedbackEntries = await prisma.feedbackEntry.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
        sentimentScore: { not: null }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Get all agent feedback from this user in the time period
    const agentFeedback = await prisma.agentFeedback.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
        sentimentScore: { not: null }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Get all approvals from this user in the time period
    const approvals = await prisma.humanApproval.findMany({
      where: {
        userId,
        responseTimestamp: { gte: startDate },
        sentimentScore: { not: null }
      },
      orderBy: { responseTimestamp: 'asc' }
    });

    // Convert to sentiment results for aggregation
    const feedbackSentiment: SentimentAnalysisResult[] = feedbackEntries.map(entry => ({
      sentiment: entry.sentimentLabel as any,
      score: entry.sentimentScore || 0,
      emotionalTones: entry.emotionalTones || [],
      confidence: 1,
      keyPhrases: [],
      metadata: {
        fatigue: entry.fatigueDetected,
        confusion: entry.confusionDetected,
        trust: entry.trustScore,
        ...(entry.sentimentMetadata as any || {})
      }
    }));

    const agentFeedbackSentiment: SentimentAnalysisResult[] = agentFeedback.map(entry => ({
      sentiment: entry.sentimentLabel as any,
      score: entry.sentimentScore || 0,
      emotionalTones: entry.emotionalTones || [],
      confidence: 1,
      keyPhrases: [],
      metadata: {
        fatigue: entry.fatigueDetected,
        confusion: entry.confusionDetected,
        trust: entry.trustScore,
        ...(entry.sentimentMetadata as any || {})
      }
    }));

    const approvalSentiment: SentimentAnalysisResult[] = approvals.map(entry => ({
      sentiment: entry.sentimentLabel as any,
      score: entry.sentimentScore || 0,
      emotionalTones: entry.emotionalTones || [],
      confidence: 1,
      keyPhrases: [],
      metadata: {
        fatigue: entry.fatigueDetected,
        confusion: entry.confusionDetected,
        trust: entry.trustScore,
        ...(entry.sentimentMetadata as any || {})
      }
    }));

    // Aggregate all sentiment data
    const allSentiment = [...feedbackSentiment, ...agentFeedbackSentiment, ...approvalSentiment];
    const aggregatedResults = aggregateSentimentResults(allSentiment);

    // Create time series data for trends
    const timeSeriesData = createTimeSeriesData(
      feedbackEntries, 
      agentFeedback, 
      approvals, 
      days
    );

    return {
      aggregated: aggregatedResults,
      timeSeries: timeSeriesData,
      feedbackCount: feedbackEntries.length,
      agentFeedbackCount: agentFeedback.length,
      approvalCount: approvals.length
    };
  } catch (error) {
    logger.error('Error getting user sentiment trends', { userId, error });
    throw error;
  }
}

/**
 * Gets sentiment trends for all users
 * @param days Number of days to look back
 */
export async function getOverallSentimentTrends(days: number = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all feedback in the time period
    const feedbackEntries = await prisma.feedbackEntry.findMany({
      where: {
        createdAt: { gte: startDate },
        sentimentScore: { not: null }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Get all agent feedback in the time period
    const agentFeedback = await prisma.agentFeedback.findMany({
      where: {
        createdAt: { gte: startDate },
        sentimentScore: { not: null }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Get all approvals in the time period
    const approvals = await prisma.humanApproval.findMany({
      where: {
        responseTimestamp: { gte: startDate },
        sentimentScore: { not: null }
      },
      orderBy: { responseTimestamp: 'asc' }
    });

    // Convert to sentiment results for aggregation
    const feedbackSentiment: SentimentAnalysisResult[] = feedbackEntries.map(entry => ({
      sentiment: entry.sentimentLabel as any,
      score: entry.sentimentScore || 0,
      emotionalTones: entry.emotionalTones || [],
      confidence: 1,
      keyPhrases: [],
      metadata: {
        fatigue: entry.fatigueDetected,
        confusion: entry.confusionDetected,
        trust: entry.trustScore,
        ...(entry.sentimentMetadata as any || {})
      }
    }));

    const agentFeedbackSentiment: SentimentAnalysisResult[] = agentFeedback.map(entry => ({
      sentiment: entry.sentimentLabel as any,
      score: entry.sentimentScore || 0,
      emotionalTones: entry.emotionalTones || [],
      confidence: 1,
      keyPhrases: [],
      metadata: {
        fatigue: entry.fatigueDetected,
        confusion: entry.confusionDetected,
        trust: entry.trustScore,
        ...(entry.sentimentMetadata as any || {})
      }
    }));

    const approvalSentiment: SentimentAnalysisResult[] = approvals.map(entry => ({
      sentiment: entry.sentimentLabel as any,
      score: entry.sentimentScore || 0,
      emotionalTones: entry.emotionalTones || [],
      confidence: 1,
      keyPhrases: [],
      metadata: {
        fatigue: entry.fatigueDetected,
        confusion: entry.confusionDetected,
        trust: entry.trustScore,
        ...(entry.sentimentMetadata as any || {})
      }
    }));

    // Aggregate all sentiment data
    const allSentiment = [...feedbackSentiment, ...agentFeedbackSentiment, ...approvalSentiment];
    const aggregatedResults = aggregateSentimentResults(allSentiment);

    // Create time series data for trends
    const timeSeriesData = createTimeSeriesData(
      feedbackEntries, 
      agentFeedback, 
      approvals, 
      days
    );

    // Get per-user aggregations
    const userIds = new Set([
      ...feedbackEntries.map(f => f.userId),
      ...agentFeedback.map(f => f.userId),
      ...approvals.filter(a => a.userId).map(a => a.userId as string)
    ]);

    const userSentimentMap: Record<string, any> = {};
    for (const userId of userIds) {
      const userFeedback = feedbackEntries.filter(f => f.userId === userId);
      const userAgentFeedback = agentFeedback.filter(f => f.userId === userId);
      const userApprovals = approvals.filter(a => a.userId === userId);
      
      const userSentiment = [
        ...userFeedback.map(entry => ({
          sentiment: entry.sentimentLabel as any,
          score: entry.sentimentScore || 0,
          emotionalTones: entry.emotionalTones || [],
          confidence: 1,
          keyPhrases: [],
          metadata: {
            fatigue: entry.fatigueDetected,
            confusion: entry.confusionDetected,
            trust: entry.trustScore,
            ...(entry.sentimentMetadata as any || {})
          }
        })),
        ...userAgentFeedback.map(entry => ({
          sentiment: entry.sentimentLabel as any,
          score: entry.sentimentScore || 0,
          emotionalTones: entry.emotionalTones || [],
          confidence: 1,
          keyPhrases: [],
          metadata: {
            fatigue: entry.fatigueDetected,
            confusion: entry.confusionDetected,
            trust: entry.trustScore,
            ...(entry.sentimentMetadata as any || {})
          }
        })),
        ...userApprovals.map(entry => ({
          sentiment: entry.sentimentLabel as any,
          score: entry.sentimentScore || 0,
          emotionalTones: entry.emotionalTones || [],
          confidence: 1,
          keyPhrases: [],
          metadata: {
            fatigue: entry.fatigueDetected,
            confusion: entry.confusionDetected,
            trust: entry.trustScore,
            ...(entry.sentimentMetadata as any || {})
          }
        }))
      ];
      
      userSentimentMap[userId] = {
        aggregated: aggregateSentimentResults(userSentiment),
        feedbackCount: userFeedback.length,
        agentFeedbackCount: userAgentFeedback.length,
        approvalCount: userApprovals.length,
        totalInteractions: userFeedback.length + userAgentFeedback.length + userApprovals.length
      };
    }

    return {
      aggregated: aggregatedResults,
      timeSeries: timeSeriesData,
      feedbackCount: feedbackEntries.length,
      agentFeedbackCount: agentFeedback.length,
      approvalCount: approvals.length,
      userSentiment: userSentimentMap
    };
  } catch (error) {
    logger.error('Error getting overall sentiment trends', { error });
    throw error;
  }
}

/**
 * Creates time series data for sentiment trends
 */
function createTimeSeriesData(
  feedbackEntries: any[],
  agentFeedback: any[],
  approvals: any[],
  days: number
) {
  // Create date buckets (daily)
  const dateBuckets: Record<string, {
    date: string;
    sentimentScore: number[];
    confusionCount: number;
    fatigueCount: number;
    trustScores: number[];
    count: number;
  }> = {};

  // Initialize buckets for each day
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    dateBuckets[dateStr] = {
      date: dateStr,
      sentimentScore: [],
      confusionCount: 0,
      fatigueCount: 0,
      trustScores: [],
      count: 0
    };
  }

  // Add feedback entries to buckets
  feedbackEntries.forEach(entry => {
    const dateStr = new Date(entry.createdAt).toISOString().split('T')[0];
    if (dateBuckets[dateStr]) {
      if (entry.sentimentScore !== null) dateBuckets[dateStr].sentimentScore.push(entry.sentimentScore);
      if (entry.confusionDetected) dateBuckets[dateStr].confusionCount++;
      if (entry.fatigueDetected) dateBuckets[dateStr].fatigueCount++;
      if (entry.trustScore !== null) dateBuckets[dateStr].trustScores.push(entry.trustScore);
      dateBuckets[dateStr].count++;
    }
  });

  // Add agent feedback to buckets
  agentFeedback.forEach(entry => {
    const dateStr = new Date(entry.createdAt).toISOString().split('T')[0];
    if (dateBuckets[dateStr]) {
      if (entry.sentimentScore !== null) dateBuckets[dateStr].sentimentScore.push(entry.sentimentScore);
      if (entry.confusionDetected) dateBuckets[dateStr].confusionCount++;
      if (entry.fatigueDetected) dateBuckets[dateStr].fatigueCount++;
      if (entry.trustScore !== null) dateBuckets[dateStr].trustScores.push(entry.trustScore);
      dateBuckets[dateStr].count++;
    }
  });

  // Add approvals to buckets
  approvals.forEach(entry => {
    if (!entry.responseTimestamp) return;
    const dateStr = new Date(entry.responseTimestamp).toISOString().split('T')[0];
    if (dateBuckets[dateStr]) {
      if (entry.sentimentScore !== null) dateBuckets[dateStr].sentimentScore.push(entry.sentimentScore);
      if (entry.confusionDetected) dateBuckets[dateStr].confusionCount++;
      if (entry.fatigueDetected) dateBuckets[dateStr].fatigueCount++;
      if (entry.trustScore !== null) dateBuckets[dateStr].trustScores.push(entry.trustScore);
      dateBuckets[dateStr].count++;
    }
  });

  // Convert buckets to array and calculate averages
  return Object.values(dateBuckets)
    .map(bucket => ({
      date: bucket.date,
      averageSentiment: bucket.sentimentScore.length > 0 
        ? bucket.sentimentScore.reduce((sum, score) => sum + score, 0) / bucket.sentimentScore.length 
        : null,
      confusionRate: bucket.count > 0 ? bucket.confusionCount / bucket.count : 0,
      fatigueRate: bucket.count > 0 ? bucket.fatigueCount / bucket.count : 0,
      averageTrust: bucket.trustScores.length > 0
        ? bucket.trustScores.reduce((sum, score) => sum + score, 0) / bucket.trustScores.length
        : null,
      interactionCount: bucket.count
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}