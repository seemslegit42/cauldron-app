import { HttpError } from 'wasp/server';
import { getAgentSchema } from '@src/api/validators/agentSchemas';
import { GetAgentBadges } from '@src/shared/types/api/agent';
import { prisma } from 'wasp/server';

/**
 * Get agent badges
 * 
 * @param {Object} args - The arguments
 * @param {string} args.agentId - The agent ID
 * @param {Object} context - The context
 * @returns {Promise<Badge[]>} The badges
 */
export const getAgentBadges: GetAgentBadges = async ({ agentId }, context) => {
  // Validate user is authenticated
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to get agent badges');
  }

  // Validate input
  const validatedInput = getAgentSchema.parse({ agentId });

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
      throw new HttpError(403, 'You do not have permission to view this agent');
    }

    // Get all badges
    const badges = await prisma.trustBadge.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        {
          tier: 'asc',
        },
        {
          category: 'asc',
        },
        {
          name: 'asc',
        },
      ],
    });

    // Get earned badges for this agent
    const earnedBadges = await prisma.earnedBadge.findMany({
      where: {
        trustScore: {
          agentId: validatedInput.agentId,
        },
      },
      select: {
        badgeId: true,
      },
    });

    // Create a set of earned badge IDs for quick lookup
    const earnedBadgeIds = new Set(earnedBadges.map(eb => eb.badgeId));

    // Mark badges as earned
    const badgesWithEarnedStatus = badges.map(badge => ({
      ...badge,
      isEarned: earnedBadgeIds.has(badge.id),
    }));

    return badgesWithEarnedStatus;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    console.error('Error getting agent badges:', error);
    throw new HttpError(500, 'Failed to get agent badges');
  }
};
