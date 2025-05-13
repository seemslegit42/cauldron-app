import { type User } from 'wasp/entities';
import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import { type GetUserXP, type GetAchievements, type GetRewards, type GetLeaderboard, type EarnXP, type PurchaseReward, type TrackSystemEvent } from './types';
import { calculateLevel, checkAchievementProgress } from './utils';
import { updateLeaderboard } from './leaderboard';
import { processSystemEvent } from './events';

/**
 * Get user XP and level information
 */
export const getUserXP: GetUserXP = async ({ userId }, context) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to access XP data');
  }

  // Check if user has permission to view this user's XP
  if (userId !== context.user.id && !context.user.isAdmin) {
    throw new HttpError(403, 'You do not have permission to view this user\'s XP data');
  }

  // Get user XP record
  const userXP = await prisma.userXP.findUnique({
    where: { userId },
    include: {
      xpTransactions: {
        orderBy: { createdAt: 'desc' },
        take: 10
      },
      runeTransactions: {
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  });

  if (!userXP) {
    // Create new user XP record if it doesn't exist
    const newUserXP = await prisma.userXP.create({
      data: {
        userId,
        level: 1,
        currentXP: 0,
        totalXP: 0,
        runes: 50, // Starting runes
      },
      include: {
        xpTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        runeTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });
    return newUserXP;
  }

  return userXP;
};

/**
 * Get user achievements
 */
export const getAchievements: GetAchievements = async ({ userId, category }, context) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to access achievement data');
  }

  // Check if user has permission to view this user's achievements
  if (userId !== context.user.id && !context.user.isAdmin) {
    throw new HttpError(403, 'You do not have permission to view this user\'s achievements');
  }

  // Get user XP record
  const userXP = await prisma.userXP.findUnique({
    where: { userId },
    include: {
      achievements: {
        include: {
          achievement: true
        }
      }
    }
  });

  if (!userXP) {
    throw new HttpError(404, 'User XP record not found');
  }

  // Get all achievements
  const allAchievements = await prisma.achievement.findMany({
    where: category ? { category, isActive: true } : { isActive: true }
  });

  // Map achievements to include progress
  const achievements = allAchievements.map(achievement => {
    const userAchievement = userXP.achievements.find(ua => ua.achievementId === achievement.id);
    return {
      ...achievement,
      progress: userAchievement?.progress || 0,
      isUnlocked: userAchievement?.isUnlocked || false,
      unlockedAt: userAchievement?.unlockedAt || null,
      timesUnlocked: userAchievement?.timesUnlocked || 0
    };
  });

  return achievements;
};

/**
 * Get available rewards
 */
export const getRewards: GetRewards = async ({ userId }, context) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to access reward data');
  }

  // Get user XP record to check level
  const userXP = await prisma.userXP.findUnique({
    where: { userId },
    include: {
      rewards: {
        include: {
          reward: true
        }
      }
    }
  });

  if (!userXP) {
    throw new HttpError(404, 'User XP record not found');
  }

  // Get all rewards
  const allRewards = await prisma.reward.findMany({
    where: { 
      isActive: true,
      OR: [
        { requiredLevel: null },
        { requiredLevel: { lte: userXP.level } }
      ]
    }
  });

  // Map rewards to include ownership status
  const rewards = allRewards.map(reward => {
    const userReward = userXP.rewards.find(ur => ur.rewardId === reward.id && ur.isActive);
    return {
      ...reward,
      isOwned: !!userReward,
      activatedAt: userReward?.activatedAt || null,
      expiresAt: userReward?.expiresAt || null,
      canPurchase: userXP.runes >= reward.cost && !userReward
    };
  });

  return rewards;
};

/**
 * Get leaderboard data
 */
export const getLeaderboard: GetLeaderboard = async ({ limit = 10, offset = 0 }, context) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to access leaderboard data');
  }

  // Get latest leaderboard snapshot
  const leaderboard = await prisma.leaderboardSnapshot.findMany({
    orderBy: { rank: 'asc' },
    take: limit,
    skip: offset
  });

  // Get current user's rank if not in the results
  const currentUserRank = await prisma.leaderboardSnapshot.findFirst({
    where: { userId: context.user.id }
  });

  return {
    leaderboard,
    currentUserRank
  };
};

/**
 * Award XP to a user
 */
export const earnXP: EarnXP = async ({ userId, amount, reason, description }, context) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to award XP');
  }

  // Only admins or the system can award XP to others
  if (userId !== context.user.id && !context.user.isAdmin) {
    throw new HttpError(403, 'You do not have permission to award XP to other users');
  }

  // Get user XP record
  let userXP = await prisma.userXP.findUnique({
    where: { userId }
  });

  if (!userXP) {
    // Create new user XP record if it doesn't exist
    userXP = await prisma.userXP.create({
      data: {
        userId,
        level: 1,
        currentXP: 0,
        totalXP: 0,
        runes: 50, // Starting runes
      }
    });
  }

  // Calculate new XP and level
  const newTotalXP = userXP.totalXP + amount;
  const { level, currentXP } = await calculateLevel(newTotalXP);

  // Check if user leveled up
  const didLevelUp = level > userXP.level;
  let runeReward = 0;

  // Award runes for level up
  if (didLevelUp) {
    // Get level config for the new level
    const levelConfig = await prisma.levelConfig.findUnique({
      where: { level }
    });

    if (levelConfig) {
      runeReward = levelConfig.runeReward;
    }
  }

  // Update user XP
  const updatedUserXP = await prisma.userXP.update({
    where: { id: userXP.id },
    data: {
      level,
      currentXP,
      totalXP: newTotalXP,
      runes: userXP.runes + runeReward,
      lastXPGainAt: new Date(),
      xpTransactions: {
        create: {
          amount,
          reason,
          description
        }
      },
      ...(runeReward > 0 ? {
        runeTransactions: {
          create: {
            amount: runeReward,
            reason: 'Level Up Reward',
            description: `Reward for reaching level ${level}`
          }
        }
      } : {})
    }
  });

  // Check achievements
  await checkAchievementProgress(userId);

  // Update leaderboard
  await updateLeaderboard();

  return {
    userXP: updatedUserXP,
    didLevelUp,
    runeReward
  };
};

/**
 * Purchase a reward with runes
 */
export const purchaseReward: PurchaseReward = async ({ userId, rewardId }, context) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to purchase rewards');
  }

  // Only the user or an admin can purchase rewards
  if (userId !== context.user.id && !context.user.isAdmin) {
    throw new HttpError(403, 'You do not have permission to purchase rewards for other users');
  }

  // Get user XP record
  const userXP = await prisma.userXP.findUnique({
    where: { userId },
    include: {
      rewards: {
        where: {
          rewardId,
          isActive: true
        }
      }
    }
  });

  if (!userXP) {
    throw new HttpError(404, 'User XP record not found');
  }

  // Get reward
  const reward = await prisma.reward.findUnique({
    where: { id: rewardId }
  });

  if (!reward) {
    throw new HttpError(404, 'Reward not found');
  }

  // Check if user already owns this reward
  if (userXP.rewards.length > 0) {
    throw new HttpError(400, 'You already own this reward');
  }

  // Check if user has enough runes
  if (userXP.runes < reward.cost) {
    throw new HttpError(400, 'Not enough runes to purchase this reward');
  }

  // Check if user meets level requirement
  if (reward.requiredLevel && userXP.level < reward.requiredLevel) {
    throw new HttpError(400, `You need to be level ${reward.requiredLevel} to purchase this reward`);
  }

  // Calculate expiration date if applicable
  let expiresAt = null;
  if (reward.duration) {
    expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + reward.duration);
  }

  // Purchase reward
  const userReward = await prisma.userReward.create({
    data: {
      userXpId: userXP.id,
      rewardId: reward.id,
      isActive: true,
      activatedAt: new Date(),
      expiresAt,
      metadata: {}
    }
  });

  // Deduct runes
  await prisma.userXP.update({
    where: { id: userXP.id },
    data: {
      runes: userXP.runes - reward.cost,
      runeTransactions: {
        create: {
          amount: -reward.cost,
          reason: 'Reward Purchase',
          description: `Purchased reward: ${reward.name}`
        }
      }
    }
  });

  return {
    userReward,
    reward
  };
};

/**
 * Track a system event for achievement progress
 */
export const trackSystemEvent: TrackSystemEvent = async ({ userId, eventType, eventSource, metadata }, context) => {
  // Create system event record
  const systemEvent = await prisma.systemEvent.create({
    data: {
      userId,
      eventType,
      eventSource,
      metadata,
      processed: false
    }
  });

  // Process the event
  const result = await processSystemEvent(systemEvent);

  return result;
};
