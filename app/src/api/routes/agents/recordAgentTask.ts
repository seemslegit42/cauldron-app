import { HttpError } from 'wasp/server';
import { z } from 'zod';
import { RecordAgentTask } from '@src/shared/types/api/agent';
import { prisma } from 'wasp/server';
import { XpActionType } from '@src/shared/types/entities/agentTrust';
import { calculateTrustScore, checkForBadges } from '@src/api/services/trustScoreService';

// Validation schema
const recordTaskSchema = z.object({
  agentId: z.string().uuid(),
  success: z.boolean(),
  taskType: z.string().optional(),
  details: z.string().optional(),
});

/**
 * Record agent task
 * 
 * @param {Object} args - The arguments
 * @param {string} args.agentId - The agent ID
 * @param {boolean} args.success - Whether the task was successful
 * @param {string} args.taskType - The task type
 * @param {string} args.details - The task details
 * @param {Object} context - The context
 * @returns {Promise<TrustScore>} The updated trust score
 */
export const recordAgentTask: RecordAgentTask = async (args, context) => {
  // Validate user is authenticated
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to record agent tasks');
  }

  // Validate input
  const validatedInput = recordTaskSchema.parse(args);

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
      throw new HttpError(403, 'You do not have permission to record tasks for this agent');
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

    // Update trust score
    const updatedTrustScore = await prisma.agentTrustScore.update({
      where: {
        id: trustScore.id,
      },
      data: {
        successfulTasks: validatedInput.success ? trustScore.successfulTasks + 1 : trustScore.successfulTasks,
        failedTasks: !validatedInput.success ? trustScore.failedTasks + 1 : trustScore.failedTasks,
      },
      include: {
        earnedBadges: {
          include: {
            badge: true,
          },
        },
      },
    });

    // Add XP for successful task
    if (validatedInput.success) {
      // Base XP for successful task
      const baseXp = 10;
      
      // Record XP history
      await prisma.xpHistoryEntry.create({
        data: {
          agentId: validatedInput.agentId,
          xp: baseXp,
          actionType: XpActionType.TASK_COMPLETION,
          description: `Successful task completion${validatedInput.taskType ? ` (${validatedInput.taskType})` : ''}`,
        },
      });
      
      // Update trust score with XP
      const updatedWithXp = await prisma.agentTrustScore.update({
        where: {
          id: updatedTrustScore.id,
        },
        data: {
          experiencePoints: updatedTrustScore.experiencePoints + baseXp,
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
      const calculatedTrustScore = await calculateTrustScore(updatedWithXp);
      
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
    }

    // Calculate trust score
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
    console.error('Error recording agent task:', error);
    throw new HttpError(500, 'Failed to record agent task');
  }
};
