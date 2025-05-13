import { HttpError } from 'wasp/server';
import { z } from 'zod';
import { AddAgentXp } from '@src/shared/types/api/agent';
import { prisma } from 'wasp/server';
import { calculateTrustScore, checkForBadges } from '@src/api/services/trustScoreService';

// Validation schema
const addXpSchema = z.object({
  agentId: z.string().uuid(),
  xp: z.number().positive(),
  actionType: z.string(),
  description: z.string().optional(),
});

/**
 * Add XP to agent
 * 
 * @param {Object} args - The arguments
 * @param {string} args.agentId - The agent ID
 * @param {number} args.xp - The amount of XP to add
 * @param {string} args.actionType - The action type
 * @param {string} args.description - The description
 * @param {Object} context - The context
 * @returns {Promise<TrustScore>} The updated trust score
 */
export const addAgentXp: AddAgentXp = async (args, context) => {
  // Validate user is authenticated
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to add XP to an agent');
  }

  // Validate input
  const validatedInput = addXpSchema.parse(args);

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
      throw new HttpError(403, 'You do not have permission to add XP to this agent');
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

    // Record XP history
    await prisma.xpHistoryEntry.create({
      data: {
        agentId: validatedInput.agentId,
        xp: validatedInput.xp,
        actionType: validatedInput.actionType,
        description: validatedInput.description,
      },
    });

    // Update trust score with XP
    const updatedTrustScore = await prisma.agentTrustScore.update({
      where: {
        id: trustScore.id,
      },
      data: {
        experiencePoints: trustScore.experiencePoints + validatedInput.xp,
      },
      include: {
        earnedBadges: {
          include: {
            badge: true,
          },
        },
      },
    });

    // Calculate new trust score
    const calculatedTrustScore = await calculateTrustScore(updatedTrustScore);
    
    // Check for badges
    await checkForBadges(calculatedTrustScore);
    
    // Get final trust score with badges
    const finalTrustScore = await prisma.agentTrustScore.findUnique({
      where: {
        id: updatedTrustScore.id,
      },
      include: {
        earnedBadges: {
          include: {
            badge: true,
          },
        },
      },
    });
    
    return finalTrustScore;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    console.error('Error adding XP to agent:', error);
    throw new HttpError(500, 'Failed to add XP to agent');
  }
};
