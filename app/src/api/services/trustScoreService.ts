import { prisma } from 'wasp/server';
import { TrustLevel, BadgeRequirementType } from '@src/shared/types/entities/agentTrust';

/**
 * Calculate trust score
 * 
 * @param {Object} trustScore - The trust score
 * @returns {Promise<Object>} The updated trust score
 */
export async function calculateTrustScore(trustScore) {
  // Check for level up
  const { newLevel, didLevelUp } = checkForLevelUp(trustScore.experiencePoints, trustScore.level);
  
  // Calculate trust score value (0-100)
  const calculatedTrustScore = calculateTrustScoreValue(trustScore);
  
  // Update trust score
  const updatedTrustScore = await prisma.agentTrustScore.update({
    where: {
      id: trustScore.id,
    },
    data: {
      level: newLevel,
      trustScore: calculatedTrustScore,
      ...(didLevelUp ? { lastLevelUpAt: new Date() } : {}),
    },
    include: {
      earnedBadges: {
        include: {
          badge: true,
        },
      },
    },
  });
  
  return updatedTrustScore;
}

/**
 * Check for level up
 * 
 * @param {number} experiencePoints - The experience points
 * @param {number} currentLevel - The current level
 * @returns {Object} The new level and whether a level up occurred
 */
function checkForLevelUp(experiencePoints, currentLevel) {
  let level = currentLevel;
  let didLevelUp = false;
  
  // Check if XP is enough for next level
  while (experiencePoints >= getXpRequiredForLevel(level + 1)) {
    level++;
    didLevelUp = true;
  }
  
  return { newLevel: level, didLevelUp };
}

/**
 * Get XP required for level
 * 
 * @param {number} level - The level
 * @returns {number} The XP required
 */
function getXpRequiredForLevel(level) {
  // Simple formula: 100 * level^1.5
  return Math.round(100 * Math.pow(level, 1.5));
}

/**
 * Calculate trust score value (0-100)
 * 
 * @param {Object} trustScore - The trust score
 * @returns {number} The trust score value
 */
function calculateTrustScoreValue(trustScore) {
  // Base score from level (max 50 points)
  const levelScore = Math.min(50, trustScore.level * 1.5);
  
  // Success rate score (max 30 points)
  const totalTasks = trustScore.successfulTasks + trustScore.failedTasks;
  const successRate = totalTasks > 0 ? (trustScore.successfulTasks / totalTasks) : 0;
  const successRateScore = Math.min(30, successRate * 30);
  
  // Feedback score (max 20 points)
  const totalFeedback = trustScore.feedbackCount;
  const positiveRatio = totalFeedback > 0 ? (trustScore.positiveRatings / totalFeedback) : 0;
  const feedbackScore = Math.min(20, positiveRatio * 20);
  
  // Calculate total score
  const totalScore = Math.round(levelScore + successRateScore + feedbackScore);
  
  return Math.min(100, totalScore);
}

/**
 * Check for badges
 * 
 * @param {Object} trustScore - The trust score
 * @returns {Promise<void>}
 */
export async function checkForBadges(trustScore) {
  // Get all badges
  const badges = await prisma.trustBadge.findMany({
    where: {
      isActive: true,
    },
  });
  
  // Get earned badges
  const earnedBadges = await prisma.earnedBadge.findMany({
    where: {
      trustScoreId: trustScore.id,
    },
    select: {
      badgeId: true,
    },
  });
  
  // Create a set of earned badge IDs for quick lookup
  const earnedBadgeIds = new Set(earnedBadges.map(eb => eb.badgeId));
  
  // Check each badge
  for (const badge of badges) {
    // Skip if already earned
    if (earnedBadgeIds.has(badge.id)) {
      continue;
    }
    
    // Check if badge requirements are met
    const isEarned = checkBadgeRequirements(badge, trustScore);
    
    // Award badge if earned
    if (isEarned) {
      await prisma.earnedBadge.create({
        data: {
          badgeId: badge.id,
          trustScoreId: trustScore.id,
          earnedAt: new Date(),
        },
      });
      
      // Add XP for earning badge
      await prisma.xpHistoryEntry.create({
        data: {
          agentId: trustScore.agentId,
          xp: 25, // Base XP for earning a badge
          actionType: 'BADGE_EARNED',
          description: `Earned badge: ${badge.name}`,
        },
      });
      
      // Update trust score with XP
      await prisma.agentTrustScore.update({
        where: {
          id: trustScore.id,
        },
        data: {
          experiencePoints: trustScore.experiencePoints + 25,
        },
      });
    }
  }
}

/**
 * Check badge requirements
 * 
 * @param {Object} badge - The badge
 * @param {Object} trustScore - The trust score
 * @returns {boolean} Whether the badge requirements are met
 */
function checkBadgeRequirements(badge, trustScore) {
  switch (badge.requirementType) {
    case BadgeRequirementType.XP:
      return trustScore.experiencePoints >= badge.requirementValue;
    
    case BadgeRequirementType.LEVEL:
      return trustScore.level >= badge.requirementValue;
    
    case BadgeRequirementType.TASKS:
      return (trustScore.successfulTasks + trustScore.failedTasks) >= badge.requirementValue;
    
    case BadgeRequirementType.SUCCESSFUL_TASKS:
      return trustScore.successfulTasks >= badge.requirementValue;
    
    case BadgeRequirementType.FEEDBACK:
      return trustScore.feedbackCount >= badge.requirementValue;
    
    case BadgeRequirementType.POSITIVE_FEEDBACK:
      return trustScore.positiveRatings >= badge.requirementValue;
    
    case BadgeRequirementType.APPROVALS:
      // TODO: Implement approvals
      return false;
    
    case BadgeRequirementType.ACCURACY:
      return trustScore.responseAccuracy >= badge.requirementValue;
    
    case BadgeRequirementType.STREAK:
      // TODO: Implement streaks
      return false;
    
    case BadgeRequirementType.SPECIAL:
      // Special badges are awarded manually
      return false;
    
    default:
      return false;
  }
}

/**
 * Get trust level
 * 
 * @param {number} level - The level
 * @returns {string} The trust level
 */
export function getTrustLevel(level) {
  if (level >= 31) return TrustLevel.LEGENDARY;
  if (level >= 26) return TrustLevel.GRANDMASTER;
  if (level >= 21) return TrustLevel.MASTER;
  if (level >= 16) return TrustLevel.EXPERT;
  if (level >= 11) return TrustLevel.ADEPT;
  if (level >= 6) return TrustLevel.APPRENTICE;
  return TrustLevel.NOVICE;
}
