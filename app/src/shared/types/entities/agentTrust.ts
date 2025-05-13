/**
 * Agent Trust System Types
 */

// Badge category
export enum BadgeCategory {
  PERFORMANCE = 'performance',
  FEEDBACK = 'feedback',
  ACCURACY = 'accuracy',
  RELIABILITY = 'reliability',
  EFFICIENCY = 'efficiency',
  LEARNING = 'learning',
  COLLABORATION = 'collaboration',
  SECURITY = 'security',
  INNOVATION = 'innovation',
  SPECIAL = 'special',
}

// Badge tier
export enum BadgeTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond',
  SPECIAL = 'special',
}

// Badge requirement type
export enum BadgeRequirementType {
  XP = 'XP',
  LEVEL = 'LEVEL',
  TASKS = 'TASKS',
  SUCCESSFUL_TASKS = 'SUCCESSFUL_TASKS',
  FEEDBACK = 'FEEDBACK',
  POSITIVE_FEEDBACK = 'POSITIVE_FEEDBACK',
  APPROVALS = 'APPROVALS',
  ACCURACY = 'ACCURACY',
  STREAK = 'STREAK',
  SPECIAL = 'SPECIAL',
}

// Trust level
export enum TrustLevel {
  NOVICE = 'novice',           // Level 1-5
  APPRENTICE = 'apprentice',   // Level 6-10
  ADEPT = 'adept',             // Level 11-15
  EXPERT = 'expert',           // Level 16-20
  MASTER = 'master',           // Level 21-25
  GRANDMASTER = 'grandmaster', // Level 26-30
  LEGENDARY = 'legendary',     // Level 31+
}

// Trust score
export interface AgentTrustScore {
  /** Unique identifier for the trust score */
  id: string;
  /** When the trust score was created */
  createdAt: Date;
  /** When the trust score was last updated */
  updatedAt: Date;
  /** Agent ID */
  agentId: string;
  /** Experience points */
  experiencePoints: number;
  /** Current level */
  level: number;
  /** Trust score (0-100) */
  trustScore: number;
  /** Number of successful tasks */
  successfulTasks: number;
  /** Number of failed tasks */
  failedTasks: number;
  /** Number of positive ratings */
  positiveRatings: number;
  /** Number of negative ratings */
  negativeRatings: number;
  /** Number of neutral ratings */
  neutralRatings: number;
  /** Total feedback count */
  feedbackCount: number;
  /** Approval rate (0-100) */
  approvalRate: number;
  /** Response accuracy (0-100) */
  responseAccuracy: number;
  /** When the agent last leveled up */
  lastLevelUpAt: Date;
  /** Additional metadata */
  metadata?: Record<string, any>;
  /** Earned badges */
  earnedBadges?: EarnedBadge[];
}

// Trust badge
export interface TrustBadge {
  /** Unique identifier for the badge */
  id: string;
  /** When the badge was created */
  createdAt: Date;
  /** When the badge was last updated */
  updatedAt: Date;
  /** Badge name */
  name: string;
  /** Badge description */
  description: string;
  /** Badge category */
  category: BadgeCategory | string;
  /** Badge tier */
  tier: BadgeTier | string;
  /** URL to badge icon */
  iconUrl?: string;
  /** Description of how to earn the badge */
  requirement: string;
  /** Numeric value required to earn the badge */
  requirementValue: number;
  /** Type of requirement */
  requirementType: BadgeRequirementType | string;
  /** Whether the badge is active */
  isActive: boolean;
}

// Earned badge
export interface EarnedBadge {
  /** Unique identifier for the earned badge */
  id: string;
  /** When the badge was earned */
  createdAt: Date;
  /** Badge ID */
  badgeId: string;
  /** Trust score ID */
  trustScoreId: string;
  /** When the badge was earned */
  earnedAt: Date;
  /** Badge details */
  badge?: TrustBadge;
}

// Level up requirements
export interface LevelUpRequirement {
  /** Level number */
  level: number;
  /** XP required to reach this level */
  xpRequired: number;
  /** Trust level for this level */
  trustLevel: TrustLevel;
  /** Perks unlocked at this level */
  perks?: string[];
}

// XP action types
export enum XpActionType {
  TASK_COMPLETION = 'task_completion',
  POSITIVE_FEEDBACK = 'positive_feedback',
  SUGGESTION_APPROVED = 'suggestion_approved',
  CORRECT_RESPONSE = 'correct_response',
  STREAK_BONUS = 'streak_bonus',
  LEARNING_FROM_FEEDBACK = 'learning_from_feedback',
  SPECIAL_ACHIEVEMENT = 'special_achievement',
}

// XP action
export interface XpAction {
  /** Action type */
  type: XpActionType;
  /** Base XP value */
  baseXp: number;
  /** Multiplier (optional) */
  multiplier?: number;
  /** Description */
  description: string;
}

// Trust score update
export interface TrustScoreUpdate {
  /** Agent ID */
  agentId: string;
  /** XP to add */
  xpToAdd: number;
  /** Action type */
  actionType: XpActionType;
  /** Description of the update */
  description?: string;
  /** Whether to check for level up */
  checkForLevelUp?: boolean;
  /** Whether to check for badges */
  checkForBadges?: boolean;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

// Trust score with calculated properties
export interface AgentTrustScoreWithStats extends AgentTrustScore {
  /** Trust level */
  trustLevel: TrustLevel;
  /** XP needed for next level */
  xpForNextLevel: number;
  /** Progress to next level (0-100) */
  levelProgress: number;
  /** Success rate (0-100) */
  successRate: number;
  /** Total tasks */
  totalTasks: number;
  /** Badge count by category */
  badgesByCategory: Record<string, number>;
  /** Badge count by tier */
  badgesByTier: Record<string, number>;
}
