/**
 * Agent Trust Service
 *
 * This service handles operations related to agent trust scores, XP, levels, and badges.
 * It provides methods for updating trust scores, awarding XP, checking for level ups,
 * and awarding badges.
 */

import { prisma } from 'wasp/server';
import { HttpError } from 'wasp/server';
import { LoggingService } from '../../shared/services/logging';
import {
  XpActionType,
  TrustLevel,
  BadgeCategory,
  BadgeTier,
  BadgeRequirementType,
  TrustScoreUpdate
} from '../../shared/types/entities/agentTrust';

// XP values for different actions
const XP_VALUES = {
  [XpActionType.TASK_COMPLETION]: 10,
  [XpActionType.POSITIVE_FEEDBACK]: 15,
  [XpActionType.SUGGESTION_APPROVED]: 20,
  [XpActionType.CORRECT_RESPONSE]: 5,
  [XpActionType.STREAK_BONUS]: 25,
  [XpActionType.LEARNING_FROM_FEEDBACK]: 10,
  [XpActionType.SPECIAL_ACHIEVEMENT]: 50,
};

// Level up requirements
// Each level requires base_xp * level_multiplier XP
const BASE_XP_FOR_LEVEL_UP = 100;
const LEVEL_MULTIPLIER = 1.5;

// Maximum level
const MAX_LEVEL = 50;

// Trust level thresholds
const TRUST_LEVEL_THRESHOLDS = {
  [TrustLevel.NOVICE]: 1,
  [TrustLevel.APPRENTICE]: 6,
  [TrustLevel.ADEPT]: 11,
  [TrustLevel.EXPERT]: 16,
  [TrustLevel.MASTER]: 21,
  [TrustLevel.GRANDMASTER]: 26,
  [TrustLevel.LEGENDARY]: 31,
};

/**
 * Calculate XP required for a specific level
 * @param level Level number
 * @returns XP required for this level
 */
const calculateXpForLevel = (level: number): number => {
  if (level <= 1) return 0;
  return Math.floor(BASE_XP_FOR_LEVEL_UP * Math.pow(LEVEL_MULTIPLIER, level - 1));
};

/**
 * Calculate trust level based on level
 * @param level Level number
 * @returns Trust level
 */
const calculateTrustLevel = (level: number): TrustLevel => {
  if (level >= TRUST_LEVEL_THRESHOLDS[TrustLevel.LEGENDARY]) return TrustLevel.LEGENDARY;
  if (level >= TRUST_LEVEL_THRESHOLDS[TrustLevel.GRANDMASTER]) return TrustLevel.GRANDMASTER;
  if (level >= TRUST_LEVEL_THRESHOLDS[TrustLevel.MASTER]) return TrustLevel.MASTER;
  if (level >= TRUST_LEVEL_THRESHOLDS[TrustLevel.EXPERT]) return TrustLevel.EXPERT;
  if (level >= TRUST_LEVEL_THRESHOLDS[TrustLevel.ADEPT]) return TrustLevel.ADEPT;
  if (level >= TRUST_LEVEL_THRESHOLDS[TrustLevel.APPRENTICE]) return TrustLevel.APPRENTICE;
  return TrustLevel.NOVICE;
};

/**
 * Calculate trust score based on various metrics
 * @param trustScore Trust score object
 * @returns Trust score value (0-100)
 */
const calculateTrustScore = (trustScore: any): number => {
  // Calculate success rate
  const totalTasks = trustScore.successfulTasks + trustScore.failedTasks;
  const successRate = totalTasks > 0 ? (trustScore.successfulTasks / totalTasks) * 100 : 0;

  // Calculate feedback score
  const totalRatings = trustScore.positiveRatings + trustScore.neutralRatings + trustScore.negativeRatings;
  const feedbackScore = totalRatings > 0
    ? ((trustScore.positiveRatings * 100) + (trustScore.neutralRatings * 50)) / totalRatings
    : 0;

  // Calculate level score (max 20 points)
  const levelScore = Math.min(20, (trustScore.level / MAX_LEVEL) * 20);

  // Calculate final trust score
  // 40% success rate + 30% feedback score + 20% approval rate + 10% level
  const finalScore = (
    (successRate * 0.4) +
    (feedbackScore * 0.3) +
    (trustScore.approvalRate * 0.2) +
    levelScore
  );

  return Math.min(100, Math.max(0, finalScore));
};

export class AgentTrustService {
  /**
   * Initialize trust score for an agent
   * @param agentId Agent ID
   * @returns Created trust score
   */
  static async initializeTrustScore(agentId: string) {
    try {
      // Check if agent exists
      const agent = await prisma.aI_Agent.findUnique({
        where: { id: agentId },
      });

      if (!agent) {
        throw new HttpError(404, 'Agent not found');
      }

      // Check if trust score already exists
      const existingTrustScore = await prisma.agentTrustScore.findUnique({
        where: { agentId },
      });

      if (existingTrustScore) {
        return existingTrustScore;
      }

      // Create trust score
      const trustScore = await prisma.agentTrustScore.create({
        data: {
          agentId,
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
        },
      });

      // Log the initialization
      await LoggingService.log({
        level: 'INFO',
        category: 'AGENT_TRUST',
        message: `Initialized trust score for agent ${agentId}`,
        agentId,
        metadata: {
          trustScoreId: trustScore.id,
        },
      });

      return trustScore;
    } catch (error) {
      console.error('Error initializing trust score:', error);
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, 'Failed to initialize trust score');
    }
  }

  /**
   * Update agent trust score
   * @param update Trust score update
   * @returns Updated trust score
   */
  static async updateTrustScore(update: TrustScoreUpdate) {
    try {
      const { agentId, xpToAdd, actionType, description, checkForLevelUp = true, checkForBadges = true } = update;

      // Get or create trust score
      let trustScore = await prisma.agentTrustScore.findUnique({
        where: { agentId },
        include: { earnedBadges: { include: { badge: true } } },
      });

      if (!trustScore) {
        trustScore = await this.initializeTrustScore(agentId);
      }

      // Calculate new XP
      const newXp = trustScore.experiencePoints + xpToAdd;

      // Update trust score
      const updatedTrustScore = await prisma.agentTrustScore.update({
        where: { id: trustScore.id },
        data: {
          experiencePoints: newXp,
        },
        include: { earnedBadges: { include: { badge: true } } },
      });

      // Log the XP update
      await LoggingService.log({
        level: 'INFO',
        category: 'AGENT_TRUST',
        message: `Added ${xpToAdd} XP to agent ${agentId} for ${actionType}`,
        agentId,
        metadata: {
          trustScoreId: trustScore.id,
          xpAdded: xpToAdd,
          actionType,
          description,
          newXp,
        },
      });

      // Check for level up
      if (checkForLevelUp) {
        await this.checkForLevelUp(updatedTrustScore);
      }

      // Check for badges
      if (checkForBadges) {
        await this.checkForBadges(updatedTrustScore);
      }

      // Get the final updated trust score
      const finalTrustScore = await prisma.agentTrustScore.findUnique({
        where: { id: trustScore.id },
        include: { earnedBadges: { include: { badge: true } } },
      });

      return finalTrustScore;
    } catch (error) {
      console.error('Error updating trust score:', error);
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, 'Failed to update trust score');
    }
  }

  /**
   * Check if agent should level up
   * @param trustScore Trust score object
   * @returns Updated trust score if leveled up, null otherwise
   */
  static async checkForLevelUp(trustScore: any) {
    try {
      const currentLevel = trustScore.level;
      const currentXp = trustScore.experiencePoints;

      // Calculate XP required for next level
      const xpForNextLevel = calculateXpForLevel(currentLevel + 1);

      // Check if agent has enough XP to level up
      if (currentXp >= xpForNextLevel && currentLevel < MAX_LEVEL) {
        // Level up
        const newLevel = currentLevel + 1;

        // Update trust score
        const updatedTrustScore = await prisma.agentTrustScore.update({
          where: { id: trustScore.id },
          data: {
            level: newLevel,
            lastLevelUpAt: new Date(),
          },
        });

        // Calculate new trust level
        const newTrustLevel = calculateTrustLevel(newLevel);

        // Log the level up
        await LoggingService.log({
          level: 'INFO',
          category: 'AGENT_TRUST',
          message: `Agent ${trustScore.agentId} leveled up to level ${newLevel} (${newTrustLevel})`,
          agentId: trustScore.agentId,
          metadata: {
            trustScoreId: trustScore.id,
            oldLevel: currentLevel,
            newLevel,
            newTrustLevel,
          },
        });

        return updatedTrustScore;
      }

      return null;
    } catch (error) {
      console.error('Error checking for level up:', error);
      return null;
    }
  }

  /**
   * Check if agent has earned any badges
   * @param trustScore Trust score object
   * @returns Array of newly earned badges
   */
  static async checkForBadges(trustScore: any) {
    try {
      // Get all active badges
      const allBadges = await prisma.trustBadge.findMany({
        where: { isActive: true },
      });

      // Get already earned badges
      const earnedBadgeIds = trustScore.earnedBadges.map((eb: any) => eb.badgeId);

      // Filter badges that haven't been earned yet
      const unearnedBadges = allBadges.filter(badge => !earnedBadgeIds.includes(badge.id));

      // Check each badge to see if it's been earned
      const newlyEarnedBadges = [];

      for (const badge of unearnedBadges) {
        let isEarned = false;

        // Check if badge requirements are met
        switch (badge.requirementType) {
          case BadgeRequirementType.XP:
            isEarned = trustScore.experiencePoints >= badge.requirementValue;
            break;
          case BadgeRequirementType.LEVEL:
            isEarned = trustScore.level >= badge.requirementValue;
            break;
          case BadgeRequirementType.TASKS:
            isEarned = (trustScore.successfulTasks + trustScore.failedTasks) >= badge.requirementValue;
            break;
          case BadgeRequirementType.SUCCESSFUL_TASKS:
            isEarned = trustScore.successfulTasks >= badge.requirementValue;
            break;
          case BadgeRequirementType.FEEDBACK:
            isEarned = trustScore.feedbackCount >= badge.requirementValue;
            break;
          case BadgeRequirementType.POSITIVE_FEEDBACK:
            isEarned = trustScore.positiveRatings >= badge.requirementValue;
            break;
          case BadgeRequirementType.APPROVALS:
            isEarned = trustScore.approvalRate >= badge.requirementValue;
            break;
          case BadgeRequirementType.ACCURACY:
            isEarned = trustScore.responseAccuracy >= badge.requirementValue;
            break;
          // Special badges are awarded manually
          case BadgeRequirementType.SPECIAL:
            isEarned = false;
            break;
          default:
            isEarned = false;
        }

        // Award badge if earned
        if (isEarned) {
          const earnedBadge = await prisma.earnedBadge.create({
            data: {
              badgeId: badge.id,
              trustScoreId: trustScore.id,
            },
            include: { badge: true },
          });

          newlyEarnedBadges.push(earnedBadge);

          // Log the badge award
          await LoggingService.log({
            level: 'INFO',
            category: 'AGENT_TRUST',
            message: `Agent ${trustScore.agentId} earned badge: ${badge.name}`,
            agentId: trustScore.agentId,
            metadata: {
              trustScoreId: trustScore.id,
              badgeId: badge.id,
              badgeName: badge.name,
              badgeCategory: badge.category,
              badgeTier: badge.tier,
            },
          });
        }
      }

      return newlyEarnedBadges;
    } catch (error) {
      console.error('Error checking for badges:', error);
      return [];
    }
  }

  /**
   * Award a special badge to an agent
   * @param agentId Agent ID
   * @param badgeId Badge ID
   * @returns Earned badge
   */
  static async awardSpecialBadge(agentId: string, badgeId: string) {
    try {
      // Get trust score
      let trustScore = await prisma.agentTrustScore.findUnique({
        where: { agentId },
      });

      if (!trustScore) {
        trustScore = await this.initializeTrustScore(agentId);
      }

      // Check if badge exists
      const badge = await prisma.trustBadge.findUnique({
        where: { id: badgeId },
      });

      if (!badge) {
        throw new HttpError(404, 'Badge not found');
      }

      // Check if badge is already earned
      const existingBadge = await prisma.earnedBadge.findUnique({
        where: {
          badgeId_trustScoreId: {
            badgeId,
            trustScoreId: trustScore.id,
          },
        },
      });

      if (existingBadge) {
        throw new HttpError(400, 'Badge already earned');
      }

      // Award badge
      const earnedBadge = await prisma.earnedBadge.create({
        data: {
          badgeId,
          trustScoreId: trustScore.id,
        },
        include: { badge: true },
      });

      // Log the badge award
      await LoggingService.log({
        level: 'INFO',
        category: 'AGENT_TRUST',
        message: `Agent ${agentId} was awarded special badge: ${badge.name}`,
        agentId,
        metadata: {
          trustScoreId: trustScore.id,
          badgeId,
          badgeName: badge.name,
          badgeCategory: badge.category,
          badgeTier: badge.tier,
          isSpecial: true,
        },
      });

      return earnedBadge;
    } catch (error) {
      console.error('Error awarding special badge:', error);
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, 'Failed to award special badge');
    }
  }

  /**
   * Record a successful task for an agent
   * @param agentId Agent ID
   * @returns Updated trust score
   */
  static async recordSuccessfulTask(agentId: string) {
    try {
      // Get trust score
      let trustScore = await prisma.agentTrustScore.findUnique({
        where: { agentId },
      });

      if (!trustScore) {
        trustScore = await this.initializeTrustScore(agentId);
      }

      // Update trust score
      const updatedTrustScore = await prisma.agentTrustScore.update({
        where: { id: trustScore.id },
        data: {
          successfulTasks: { increment: 1 },
        },
      });

      // Recalculate trust score
      const newTrustScore = calculateTrustScore(updatedTrustScore);

      // Update trust score value
      const finalTrustScore = await prisma.agentTrustScore.update({
        where: { id: trustScore.id },
        data: {
          trustScore: newTrustScore,
        },
      });

      // Award XP
      await this.updateTrustScore({
        agentId,
        xpToAdd: XP_VALUES[XpActionType.TASK_COMPLETION],
        actionType: XpActionType.TASK_COMPLETION,
        description: 'Successful task completion',
      });

      return finalTrustScore;
    } catch (error) {
      console.error('Error recording successful task:', error);
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, 'Failed to record successful task');
    }
  }

  /**
   * Record a failed task for an agent
   * @param agentId Agent ID
   * @returns Updated trust score
   */
  static async recordFailedTask(agentId: string) {
    try {
      // Get trust score
      let trustScore = await prisma.agentTrustScore.findUnique({
        where: { agentId },
      });

      if (!trustScore) {
        trustScore = await this.initializeTrustScore(agentId);
      }

      // Update trust score
      const updatedTrustScore = await prisma.agentTrustScore.update({
        where: { id: trustScore.id },
        data: {
          failedTasks: { increment: 1 },
        },
      });

      // Recalculate trust score
      const newTrustScore = calculateTrustScore(updatedTrustScore);

      // Update trust score value
      const finalTrustScore = await prisma.agentTrustScore.update({
        where: { id: trustScore.id },
        data: {
          trustScore: newTrustScore,
        },
      });

      return finalTrustScore;
    } catch (error) {
      console.error('Error recording failed task:', error);
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, 'Failed to record failed task');
    }
  }

  /**
   * Record feedback for an agent
   * @param agentId Agent ID
   * @param rating Rating (1-5)
   * @returns Updated trust score
   */
  static async recordFeedback(agentId: string, rating: number) {
    try {
      // Get trust score
      let trustScore = await prisma.agentTrustScore.findUnique({
        where: { agentId },
      });

      if (!trustScore) {
        trustScore = await this.initializeTrustScore(agentId);
      }

      // Determine rating type
      const updateData: any = {
        feedbackCount: { increment: 1 },
      };

      if (rating >= 4) {
        updateData.positiveRatings = { increment: 1 };
      } else if (rating <= 2) {
        updateData.negativeRatings = { increment: 1 };
      } else {
        updateData.neutralRatings = { increment: 1 };
      }

      // Update trust score
      const updatedTrustScore = await prisma.agentTrustScore.update({
        where: { id: trustScore.id },
        data: updateData,
      });

      // Recalculate trust score
      const newTrustScore = calculateTrustScore(updatedTrustScore);

      // Update trust score value
      const finalTrustScore = await prisma.agentTrustScore.update({
        where: { id: trustScore.id },
        data: {
          trustScore: newTrustScore,
        },
      });

      // Award XP for positive feedback
      if (rating >= 4) {
        await this.updateTrustScore({
          agentId,
          xpToAdd: XP_VALUES[XpActionType.POSITIVE_FEEDBACK],
          actionType: XpActionType.POSITIVE_FEEDBACK,
          description: 'Positive feedback received',
        });
      }

      return finalTrustScore;
    } catch (error) {
      console.error('Error recording feedback:', error);
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, 'Failed to record feedback');
    }
  }

  /**
   * Get trust score for an agent with calculated stats
   * @param agentId Agent ID
   * @returns Trust score with stats
   */
  static async getTrustScoreWithStats(agentId: string) {
    try {
      // Get trust score
      let trustScore = await prisma.agentTrustScore.findUnique({
        where: { agentId },
        include: { earnedBadges: { include: { badge: true } } },
      });

      if (!trustScore) {
        trustScore = await this.initializeTrustScore(agentId);
      }

      // Calculate additional stats
      const totalTasks = trustScore.successfulTasks + trustScore.failedTasks;
      const successRate = totalTasks > 0 ? (trustScore.successfulTasks / totalTasks) * 100 : 0;
      const trustLevel = calculateTrustLevel(trustScore.level);
      const xpForNextLevel = calculateXpForLevel(trustScore.level + 1);
      const levelProgress = xpForNextLevel > 0
        ? ((trustScore.experiencePoints - calculateXpForLevel(trustScore.level)) /
           (xpForNextLevel - calculateXpForLevel(trustScore.level))) * 100
        : 100;

      // Count badges by category and tier
      const badgesByCategory: Record<string, number> = {};
      const badgesByTier: Record<string, number> = {};

      trustScore.earnedBadges.forEach((eb: any) => {
        const category = eb.badge.category;
        const tier = eb.badge.tier;

        badgesByCategory[category] = (badgesByCategory[category] || 0) + 1;
        badgesByTier[tier] = (badgesByTier[tier] || 0) + 1;
      });

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
    } catch (error) {
      console.error('Error getting trust score with stats:', error);
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, 'Failed to get trust score with stats');
    }
  }
