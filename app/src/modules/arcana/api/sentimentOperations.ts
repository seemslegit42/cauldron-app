import { HttpError } from 'wasp/server';
import { 
  processFeedbackSentiment, 
  processAgentFeedbackSentiment, 
  processApprovalSentiment,
  getUserSentimentTrends,
  getOverallSentimentTrends
} from '../services/sentimentTrackingService';

export const processFeedbackSentimentOp = async ({ feedbackId }: { feedbackId: string }, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to process feedback sentiment');
  }

  // Check if user has permission to process this feedback
  // This would depend on your permission system
  
  return processFeedbackSentiment(feedbackId);
};

export const processAgentFeedbackSentimentOp = async ({ feedbackId }: { feedbackId: string }, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to process agent feedback sentiment');
  }

  // Check if user has permission to process this feedback
  // This would depend on your permission system
  
  return processAgentFeedbackSentiment(feedbackId);
};

export const processApprovalSentimentOp = async ({ approvalId }: { approvalId: string }, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to process approval sentiment');
  }

  // Check if user has permission to process this approval
  // This would depend on your permission system
  
  return processApprovalSentiment(approvalId);
};

export const getUserSentimentTrendsOp = async ({ userId, days }: { userId: string, days?: number }, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to get user sentiment trends');
  }

  // Check if user has permission to view this user's sentiment trends
  // This would depend on your permission system
  
  return getUserSentimentTrends(userId, days);
};

export const getOverallSentimentTrendsOp = async ({ days }: { days?: number }, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to get overall sentiment trends');
  }

  // Check if user has permission to view overall sentiment trends
  // This would depend on your permission system
  
  return getOverallSentimentTrends(days);
};