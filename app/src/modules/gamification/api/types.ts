import { type User } from 'wasp/entities';
import { type Achievement, type Reward, type UserXP, type UserAchievement, type UserReward, type XPTransaction, type RuneTransaction, type LeaderboardSnapshot, type SystemEvent } from '@prisma/client';

// Query Types
export type GetUserXP = (
  args: { userId: string },
  context: { user?: User }
) => Promise<UserXP & {
  xpTransactions: XPTransaction[];
  runeTransactions: RuneTransaction[];
}>;

export type GetAchievements = (
  args: { userId: string; category?: string },
  context: { user?: User }
) => Promise<(Achievement & {
  progress: number;
  isUnlocked: boolean;
  unlockedAt: Date | null;
  timesUnlocked: number;
})[]>;

export type GetRewards = (
  args: { userId: string },
  context: { user?: User }
) => Promise<(Reward & {
  isOwned: boolean;
  activatedAt: Date | null;
  expiresAt: Date | null;
  canPurchase: boolean;
})[]>;

export type GetLeaderboard = (
  args: { limit?: number; offset?: number },
  context: { user?: User }
) => Promise<{
  leaderboard: LeaderboardSnapshot[];
  currentUserRank: LeaderboardSnapshot | null;
}>;

// Action Types
export type EarnXP = (
  args: {
    userId: string;
    amount: number;
    reason: string;
    description?: string;
  },
  context: { user?: User }
) => Promise<{
  userXP: UserXP;
  didLevelUp: boolean;
  runeReward: number;
}>;

export type PurchaseReward = (
  args: {
    userId: string;
    rewardId: string;
  },
  context: { user?: User }
) => Promise<{
  userReward: UserReward;
  reward: Reward;
}>;

export type TrackSystemEvent = (
  args: {
    userId: string;
    eventType: string;
    eventSource: string;
    metadata?: any;
  },
  context: { user?: User }
) => Promise<{
  systemEvent: SystemEvent;
  achievementsUpdated?: UserAchievement[];
  xpAwarded?: number;
}>;

// Event Types
export interface SystemEventData {
  userId: string;
  eventType: string;
  eventSource: string;
  metadata?: any;
}

export interface AchievementTrigger {
  type: string;
  [key: string]: any;
}

export interface LevelData {
  level: number;
  currentXP: number;
  xpForNextLevel: number;
}

// Notification Types
export interface XPNotification {
  type: 'xp_gain';
  amount: number;
  reason: string;
  newTotal: number;
}

export interface LevelUpNotification {
  type: 'level_up';
  newLevel: number;
  runeReward: number;
}

export interface AchievementNotification {
  type: 'achievement';
  achievementId: string;
  achievementName: string;
  xpReward: number;
  runeReward: number;
}

export type GamificationNotification = 
  | XPNotification 
  | LevelUpNotification 
  | AchievementNotification;
