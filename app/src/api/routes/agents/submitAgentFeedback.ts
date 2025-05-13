import { HttpError } from 'wasp/server';
import { z } from 'zod';
import { SubmitAgentFeedback } from '@src/shared/types/api/agent';
import { prisma } from 'wasp/server';
import { submitFeedbackSchema } from '@src/api/validators/agentSchemas';

/**
 * Submit feedback for an agent
 * 
 * @param {Object} args - The arguments
 * @param {string} args.agentId - The agent ID
 * @param {string} args.rating - The rating (positive, neutral, negative)
 * @param {string} args.comment - Optional comment
 * @param {string} args.context - Optional context
 * @param {Object} context - The context
 * @returns {Promise<Object>} The result
 */
export const submitAgentFeedback: SubmitAgentFeedback = async (args, context) => {
  // Validate user is authenticated
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to submit feedback');
  }

  // Validate input
  const validatedInput = submitFeedbackSchema.parse(args);

  try {
    // Get agent
    const agent = await prisma.aI_Agent.findUnique({
      where: {
        id: validatedInput.agentId,
      },
    });

    // Check if agent exists
    if (!agent) {
      throw new HttpError(404, 'Agent not found');
    }

    // Create feedback
    const feedback = await prisma.agentFeedback.create({
      data: {
        agentId: validatedInput.agentId,
        userId: context.user.id,
        rating: validatedInput.rating,
        comment: validatedInput.comment,
        context: validatedInput.context,
      },
    });

    // Get trust score
    let trustScore = await prisma.agentTrustScore.findUnique({
      where: {
        agentId: validatedInput.agentId,
      },
    });

    // If trust score doesn't exist, create a new one
    if (!trustScore) {
      trustScore = await prisma.agentTrustScore.create({
        data: {
          agentId: validatedInput.agentId,
          experiencePoints: 0,
          level: 1,
          trustScore: 0,
          successfulTasks: 0,
          failedTasks: 0,
          positiveRatings: 0,
          negativeRatings: 0,
          neutralRatings: 0,
          feedbackCount: 0,
          approvalRate: 0,
          responseAccuracy: 0,
          lastLevelUpAt: new Date(),
        },
      });
    }

    // Update trust score based on feedback
    const updatedTrustScore = await prisma.agentTrustScore.update({
      where: {
        id: trustScore.id,
      },
      data: {
        positiveRatings: validatedInput.rating === 'positive' ? trustScore.positiveRatings + 1 : trustScore.positiveRatings,
        negativeRatings: validatedInput.rating === 'negative' ? trustScore.negativeRatings + 1 : trustScore.negativeRatings,
        neutralRatings: validatedInput.rating === 'neutral' ? trustScore.neutralRatings + 1 : trustScore.neutralRatings,
        feedbackCount: trustScore.feedbackCount + 1,
      },
    });

    // Calculate approval rate
    const approvalRate = updatedTrustScore.feedbackCount > 0 
      ? (updatedTrustScore.positiveRatings / updatedTrustScore.feedbackCount) * 100 
      : 0;

    // Update approval rate
    await prisma.agentTrustScore.update({
      where: {
        id: trustScore.id,
      },
      data: {
        approvalRate,
      },
    });

    // Add XP for positive feedback
    if (validatedInput.rating === 'positive') {
      // Base XP for positive feedback
      const baseXp = 5;
      
      // Record XP history
      await prisma.xpHistoryEntry.create({
        data: {
          agentId: validatedInput.agentId,
          xp: baseXp,
          actionType: 'POSITIVE_FEEDBACK',
          description: 'Received positive feedback',
        },
      });
      
      // Update trust score with XP
      await prisma.agentTrustScore.update({
        where: {
          id: trustScore.id,
        },
        data: {
          experiencePoints: updatedTrustScore.experiencePoints + baseXp,
        },
      });
    }

    return {
      success: true,
      message: 'Feedback submitted successfully',
    };
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    console.error('Error submitting agent feedback:', error);
    throw new HttpError(500, 'Failed to submit agent feedback');
  }
};
