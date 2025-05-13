import { HttpError } from 'wasp/server';
import { getAgentSchema } from '@src/api/validators/agentSchemas';
import { GetAgentTrustScore } from '@src/shared/types/api/agent';
import { prisma } from 'wasp/server';
import { TrustLevel } from '@src/shared/types/entities/agentTrust';

/**
 * Get agent trust score
 * 
 * @param {Object} args - The arguments
 * @param {string} args.agentId - The agent ID
 * @param {Object} context - The context
 * @returns {Promise<TrustScore>} The trust score
 */
export const getAgentTrustScore: GetAgentTrustScore = async ({ agentId }, context) => {
  // Validate user is authenticated
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to get agent trust score');
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

    // Get trust score
    const trustScore = await prisma.agentTrustScore.findUnique({
      where: {
        agentId: validatedInput.agentId,
      },
      include: {
        earnedBadges: {
          include: {
            badge: true,
          },
        },
      },
    });

    // If trust score doesn't exist, create a new one
    if (!trustScore) {
      const newTrustScore = await prisma.agentTrustScore.create({
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
        include: {
          earnedBadges: {
            include: {
              badge: true,
            },
          },
        },
      });

      // Calculate derived properties
      return calculateDerivedProperties(newTrustScore);
    }

    // Calculate derived properties
    return calculateDerivedProperties(trustScore);
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    console.error('Error getting agent trust score:', error);
    throw new HttpError(500, 'Failed to get agent trust score');
  }
};

/**
 * Calculate derived properties for trust score
 * 
 * @param {Object} trustScore - The trust score
 * @returns {Object} The trust score with derived properties
 */
function calculateDerivedProperties(trustScore) {
  // Calculate trust level
  const trustLevel = calculateTrustLevel(trustScore.level);
  
  // Calculate XP for next level
  const xpForNextLevel = calculateXpForNextLevel(trustScore.level);
  
  // Calculate level progress
  const levelProgress = calculateLevelProgress(trustScore.experiencePoints, trustScore.level);
  
  // Calculate success rate
  const totalTasks = trustScore.successfulTasks + trustScore.failedTasks;
  const successRate = totalTasks > 0 ? (trustScore.successfulTasks / totalTasks) * 100 : 0;
  
  // Calculate badge counts
  const badgesByCategory = {};
  const badgesByTier = {};
  
  if (trustScore.earnedBadges) {
    trustScore.earnedBadges.forEach(earnedBadge => {
      // Count by category
      const category = earnedBadge.badge.category;
      badgesByCategory[category] = (badgesByCategory[category] || 0) + 1;
      
      // Count by tier
      const tier = earnedBadge.badge.tier;
      badgesByTier[tier] = (badgesByTier[tier] || 0) + 1;
    });
  }
  
  return {
    ...trustScore,
    trustLevel,
    xpForNextLevel,
    levelProgress,
    successRate,
    totalTasks,
    badgesByCategory,
    badgesByTier,
  };
}

/**
 * Calculate trust level based on level
 * 
 * @param {number} level - The level
 * @returns {string} The trust level
 */
function calculateTrustLevel(level: number): TrustLevel {
  if (level >= 31) return TrustLevel.LEGENDARY;
  if (level >= 26) return TrustLevel.GRANDMASTER;
  if (level >= 21) return TrustLevel.MASTER;
  if (level >= 16) return TrustLevel.EXPERT;
  if (level >= 11) return TrustLevel.ADEPT;
  if (level >= 6) return TrustLevel.APPRENTICE;
  return TrustLevel.NOVICE;
}

/**
 * Calculate XP required for next level
 * 
 * @param {number} currentLevel - The current level
 * @returns {number} The XP required for next level
 */
function calculateXpForNextLevel(currentLevel: number): number {
  // Simple formula: 100 * level^1.5
  return Math.round(100 * Math.pow(currentLevel, 1.5));
}

/**
 * Calculate level progress
 * 
 * @param {number} totalXp - The total XP
 * @param {number} currentLevel - The current level
 * @returns {number} The level progress (0-100)
 */
function calculateLevelProgress(totalXp: number, currentLevel: number): number {
  // Calculate XP required for current level
  const xpForCurrentLevel = currentLevel === 1 ? 0 : calculateXpForNextLevel(currentLevel - 1);
  
  // Calculate XP required for next level
  const xpForNextLevel = calculateXpForNextLevel(currentLevel);
  
  // Calculate XP in current level
  const xpInCurrentLevel = totalXp - xpForCurrentLevel;
  
  // Calculate XP needed to level up
  const xpNeededToLevelUp = xpForNextLevel - xpForCurrentLevel;
  
  // Calculate progress
  return (xpInCurrentLevel / xpNeededToLevelUp) * 100;
}
