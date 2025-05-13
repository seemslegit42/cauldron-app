/**
 * Agent Feedback Service
 * 
 * This service handles operations related to agent feedback and escalations.
 * It provides methods for submitting, retrieving, and analyzing agent feedback,
 * as well as handling agent escalations.
 */

import { prisma } from 'wasp/server';
import { HttpError } from 'wasp/server';
import { LoggingService } from '../../shared/services/logging';
import { sentientCheckpoints } from '../../shared/services/sentientLoopService';

// Types for feedback operations
export interface SubmitFeedbackInput {
  userId: string;
  agentId: string;
  sessionId?: string;
  rating: number; // 1-5 scale (1-2 negative, 3 neutral, 4-5 positive)
  feedback?: string;
  category?: string;
  metadata?: Record<string, any>;
}

export interface SubmitEscalationInput {
  userId: string;
  agentId: string;
  sessionId?: string;
  reason: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

export interface GetFeedbackInput {
  agentId?: string;
  userId?: string;
  sessionId?: string;
  minRating?: number;
  maxRating?: number;
  category?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface GetEscalationsInput {
  agentId?: string;
  userId?: string;
  sessionId?: string;
  status?: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface ModerateFeedbackInput {
  feedbackId: string;
  isApproved: boolean;
  moderationReason?: string;
  moderatedBy: string;
}

export class AgentFeedbackService {
  /**
   * Submit feedback for an agent interaction
   */
  static async submitFeedback(input: SubmitFeedbackInput) {
    try {
      // Validate input
      if (input.rating < 1 || input.rating > 5) {
        throw new HttpError(400, 'Rating must be between 1 and 5');
      }

      // Check if the agent exists
      const agent = await prisma.aI_Agent.findUnique({
        where: { id: input.agentId },
      });

      if (!agent) {
        throw new HttpError(404, 'Agent not found');
      }

      // Apply Sentient Loop™ checkpoint for feedback validation
      // This helps prevent abuse and ensures feedback quality
      await sentientCheckpoints.validateFeedbackSubmission({
        userId: input.userId,
        agentId: input.agentId,
        rating: input.rating,
        feedback: input.feedback,
      });

      // Create feedback entry
      const feedback = await prisma.agentFeedback.create({
        data: {
          userId: input.userId,
          agentId: input.agentId,
          sessionId: input.sessionId,
          rating: input.rating,
          feedback: input.feedback,
          category: input.category,
          metadata: input.metadata || {},
        },
      });

      // Log the feedback submission
      await LoggingService.log({
        level: 'INFO',
        category: 'AGENT_FEEDBACK',
        message: `User ${input.userId} submitted feedback for agent ${input.agentId}`,
        userId: input.userId,
        agentId: input.agentId,
        sessionId: input.sessionId,
        metadata: {
          rating: input.rating,
          feedbackId: feedback.id,
        },
      });

      // If negative feedback (rating 1-2), create an escalation if there's feedback text
      if (input.rating <= 2 && input.feedback) {
        await this.submitEscalation({
          userId: input.userId,
          agentId: input.agentId,
          sessionId: input.sessionId,
          reason: `Negative feedback: ${input.feedback}`,
          priority: input.rating === 1 ? 'high' : 'medium',
          metadata: {
            feedbackId: feedback.id,
            rating: input.rating,
            ...input.metadata,
          },
        });
      }

      return feedback;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, 'Failed to submit feedback');
    }
  }

  /**
   * Submit an escalation for an agent interaction
   */
  static async submitEscalation(input: SubmitEscalationInput) {
    try {
      // Check if the agent exists
      const agent = await prisma.aI_Agent.findUnique({
        where: { id: input.agentId },
      });

      if (!agent) {
        throw new HttpError(404, 'Agent not found');
      }

      // Apply Sentient Loop™ checkpoint for escalation validation
      await sentientCheckpoints.validateEscalationSubmission({
        userId: input.userId,
        agentId: input.agentId,
        reason: input.reason,
        priority: input.priority,
      });

      // Create escalation entry
      const escalation = await prisma.agentEscalation.create({
        data: {
          userId: input.userId,
          agentId: input.agentId,
          sessionId: input.sessionId,
          reason: input.reason,
          status: 'pending',
          priority: input.priority,
          metadata: input.metadata || {},
        },
      });

      // Log the escalation
      await LoggingService.log({
        level: 'WARN',
        category: 'AGENT_ESCALATION',
        message: `User ${input.userId} escalated an issue with agent ${input.agentId}`,
        userId: input.userId,
        agentId: input.agentId,
        sessionId: input.sessionId,
        metadata: {
          reason: input.reason,
          priority: input.priority,
          escalationId: escalation.id,
        },
      });

      return escalation;
    } catch (error) {
      console.error('Error submitting escalation:', error);
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, 'Failed to submit escalation');
    }
  }

  /**
   * Get feedback entries with filtering options
   */
  static async getFeedback(input: GetFeedbackInput) {
    try {
      const {
        agentId,
        userId,
        sessionId,
        minRating,
        maxRating,
        category,
        startDate,
        endDate,
        page = 1,
        limit = 20,
      } = input;

      // Build the where clause
      const where: any = {};

      if (agentId) where.agentId = agentId;
      if (userId) where.userId = userId;
      if (sessionId) where.sessionId = sessionId;
      if (category) where.category = category;

      // Handle rating range
      if (minRating !== undefined || maxRating !== undefined) {
        where.rating = {};
        if (minRating !== undefined) where.rating.gte = minRating;
        if (maxRating !== undefined) where.rating.lte = maxRating;
      }

      // Handle date range
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
      }

      // Get total count
      const total = await prisma.agentFeedback.count({ where });

      // Get paginated results
      const feedback = await prisma.agentFeedback.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          agent: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
      });

      return {
        data: feedback,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error getting feedback:', error);
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, 'Failed to get feedback');
    }
  }

  /**
   * Get escalation entries with filtering options
   */
  static async getEscalations(input: GetEscalationsInput) {
    try {
      const {
        agentId,
        userId,
        sessionId,
        status,
        priority,
        startDate,
        endDate,
        page = 1,
        limit = 20,
      } = input;

      // Build the where clause
      const where: any = {};

      if (agentId) where.agentId = agentId;
      if (userId) where.userId = userId;
      if (sessionId) where.sessionId = sessionId;
      if (status) where.status = status;
      if (priority) where.priority = priority;

      // Handle date range
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
      }

      // Get total count
      const total = await prisma.agentEscalation.count({ where });

      // Get paginated results
      const escalations = await prisma.agentEscalation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          agent: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
      });

      return {
        data: escalations,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error getting escalations:', error);
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, 'Failed to get escalations');
    }
  }
}
