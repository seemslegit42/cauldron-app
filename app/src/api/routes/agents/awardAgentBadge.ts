import { HttpError } from 'wasp/server';
import { z } from 'zod';
import { AwardAgentBadge } from '@src/shared/types/api/agent';
import { prisma } from 'wasp/server';
import { XpActionType } from '@src/shared/types/entities/agentTrust';

// Validation schema
const awardBadgeSchema = z.object({
  agentId: z.string().uuid(),
  badgeId: z.string().uuid(),
});

/**
 * Award badge to agent
 * 
 * @param {Object} args - The arguments
 * @param {string} args.agentId - The agent ID
 * @param {string} args.badgeId - The badge ID
 * @param {Object} context - The context
 * @returns {Promise<Object>} The result
 */
export const awardAgentBadge: AwardAgentBadge = async (args, context) => {
  // Validate user is authenticated
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to award a badge to an agent');
  }

  // Validate input
  const validatedInput = awardBadgeSchema.parse(args);

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

    // Check if user has access to agent
    if (agent.userId !== context.user.id) {
      // TODO: Add organization-based access check here
      throw new HttpError(403, 'You do not have permission to award badges to this agent');
    }

    // Get badge
    const badge = await prisma.trustBadge.findUnique({
      where: {
        id: validatedInput.badgeId,
      },
    });

    // Check if badge exists
    if (!badge) {
      throw new HttpError(404, 'Badge not found');
    }

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

    // Check if badge is already earned
    const existingEarnedBadge = await prisma.earnedBadge.findFirst({
      where: {
        trustScoreId: trustScore.id,
        badgeId: validatedInput.badgeId,
      },
    });

    if (existingEarnedBadge) {
      return {
        success: false,
        message: 'Badge already earned',
      };
    }

    // Award badge
    await prisma.earnedBadge.create({
      data: {
        badgeId: validatedInput.badgeId,
        trustScoreId: trustScore.id,
        earnedAt: new Date(),
      },
    });

    // Add XP for earning badge
    const xpAmount = 25; // Base XP for earning a badge
    
    await prisma.xpHistoryEntry.create({
      data: {
        agentId: validatedInput.agentId,
        xp: xpAmount,
        actionType: XpActionType.BADGE_EARNED,
        description: `Earned badge: ${badge.name}`,
      },
    });
    
    // Update trust score with XP
    await prisma.agentTrustScore.update({
      where: {
        id: trustScore.id,
      },
      data: {
        experiencePoints: trustScore.experiencePoints + xpAmount,
      },
    });

    return {
      success: true,
      message: `Badge "${badge.name}" awarded successfully`,
    };
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    console.error('Error awarding badge to agent:', error);
    throw new HttpError(500, 'Failed to award badge to agent');
  }
};
