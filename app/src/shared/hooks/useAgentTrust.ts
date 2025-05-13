/**
 * Hook for managing agent trust scores
 */
import { useState, useCallback, useEffect } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import {
  getAgentTrustScore,
  getBadges,
  createBadge,
  updateBadge,
  awardBadge,
  recordTask,
  recordFeedback,
  addXp
} from 'wasp/client/operations';
import {
  BadgeCategory,
  BadgeTier,
  BadgeRequirementType,
  XpActionType,
  TrustLevel
} from '../types/entities/agentTrust';
import { useToast } from '../hooks/useToast';

interface UseAgentTrustProps {
  agentId?: string;
  autoFetch?: boolean;
}

/**
 * Hook for managing agent trust scores
 */
export const useAgentTrust = ({ agentId, autoFetch = true }: UseAgentTrustProps = {}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Get trust score
  const {
    data: trustScore,
    isLoading: isTrustScoreLoading,
    error: trustScoreError,
    refetch: refetchTrustScore,
  } = useQuery(
    getAgentTrustScore,
    { agentId },
    {
      enabled: !!agentId && autoFetch,
    }
  );

  // Get badges
  const {
    data: badges,
    isLoading: isBadgesLoading,
    error: badgesError,
    refetch: refetchBadges,
  } = useQuery(getBadges, {}, { enabled: autoFetch });

  // Actions
  const createBadgeAction = useAction(createBadge);
  const updateBadgeAction = useAction(updateBadge);
  const awardBadgeAction = useAction(awardBadge);
  const recordTaskAction = useAction(recordTask);
  const recordFeedbackAction = useAction(recordFeedback);
  const addXpAction = useAction(addXp);

  // Create badge
  const handleCreateBadge = useCallback(
    async (badge: {
      name: string;
      description: string;
      category: BadgeCategory | string;
      tier: BadgeTier | string;
      iconUrl?: string;
      requirement: string;
      requirementValue: number;
      requirementType: BadgeRequirementType | string;
      isActive?: boolean;
    }) => {
      setIsLoading(true);
      try {
        const result = await createBadgeAction(badge);
        toast({
          title: 'Badge created',
          description: `Badge "${badge.name}" has been created.`,
          variant: 'success',
        });
        refetchBadges();
        return result;
      } catch (error) {
        console.error('Error creating badge:', error);
        toast({
          title: 'Error creating badge',
          description: error instanceof Error ? error.message : 'An unknown error occurred',
          variant: 'destructive',
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [createBadgeAction, refetchBadges, toast]
  );

  // Update badge
  const handleUpdateBadge = useCallback(
    async (badge: {
      id: string;
      name?: string;
      description?: string;
      category?: BadgeCategory | string;
      tier?: BadgeTier | string;
      iconUrl?: string;
      requirement?: string;
      requirementValue?: number;
      requirementType?: BadgeRequirementType | string;
      isActive?: boolean;
    }) => {
      setIsLoading(true);
      try {
        const result = await updateBadgeAction(badge);
        toast({
          title: 'Badge updated',
          description: `Badge has been updated.`,
          variant: 'success',
        });
        refetchBadges();
        return result;
      } catch (error) {
        console.error('Error updating badge:', error);
        toast({
          title: 'Error updating badge',
          description: error instanceof Error ? error.message : 'An unknown error occurred',
          variant: 'destructive',
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [updateBadgeAction, refetchBadges, toast]
  );

  // Award badge
  const handleAwardBadge = useCallback(
    async (params: { agentId: string; badgeId: string }) => {
      if (!params.agentId) {
        toast({
          title: 'Error awarding badge',
          description: 'Agent ID is required',
          variant: 'destructive',
        });
        return;
      }

      setIsLoading(true);
      try {
        const result = await awardBadgeAction(params);
        toast({
          title: 'Badge awarded',
          description: `Badge has been awarded to the agent.`,
          variant: 'success',
        });
        refetchTrustScore();
        return result;
      } catch (error) {
        console.error('Error awarding badge:', error);
        toast({
          title: 'Error awarding badge',
          description: error instanceof Error ? error.message : 'An unknown error occurred',
          variant: 'destructive',
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [awardBadgeAction, refetchTrustScore, toast]
  );

  // Record task
  const handleRecordTask = useCallback(
    async (params: { agentId: string; success: boolean }) => {
      if (!params.agentId) {
        toast({
          title: 'Error recording task',
          description: 'Agent ID is required',
          variant: 'destructive',
        });
        return;
      }

      setIsLoading(true);
      try {
        const result = await recordTaskAction(params);
        toast({
          title: 'Task recorded',
          description: `${params.success ? 'Successful' : 'Failed'} task has been recorded.`,
          variant: 'success',
        });
        refetchTrustScore();
        return result;
      } catch (error) {
        console.error('Error recording task:', error);
        toast({
          title: 'Error recording task',
          description: error instanceof Error ? error.message : 'An unknown error occurred',
          variant: 'destructive',
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [recordTaskAction, refetchTrustScore, toast]
  );

  // Record feedback
  const handleRecordFeedback = useCallback(
    async (params: { agentId: string; rating: number }) => {
      if (!params.agentId) {
        toast({
          title: 'Error recording feedback',
          description: 'Agent ID is required',
          variant: 'destructive',
        });
        return;
      }

      setIsLoading(true);
      try {
        const result = await recordFeedbackAction(params);
        toast({
          title: 'Feedback recorded',
          description: `Feedback with rating ${params.rating} has been recorded.`,
          variant: 'success',
        });
        refetchTrustScore();
        return result;
      } catch (error) {
        console.error('Error recording feedback:', error);
        toast({
          title: 'Error recording feedback',
          description: error instanceof Error ? error.message : 'An unknown error occurred',
          variant: 'destructive',
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [recordFeedbackAction, refetchTrustScore, toast]
  );

  // Add XP
  const handleAddXp = useCallback(
    async (params: { agentId: string; xp: number; actionType: XpActionType | string; description?: string }) => {
      if (!params.agentId) {
        toast({
          title: 'Error adding XP',
          description: 'Agent ID is required',
          variant: 'destructive',
        });
        return;
      }

      setIsLoading(true);
      try {
        const result = await addXpAction(params);
        toast({
          title: 'XP added',
          description: `${params.xp} XP has been added to the agent.`,
          variant: 'success',
        });
        refetchTrustScore();
        return result;
      } catch (error) {
        console.error('Error adding XP:', error);
        toast({
          title: 'Error adding XP',
          description: error instanceof Error ? error.message : 'An unknown error occurred',
          variant: 'destructive',
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [addXpAction, refetchTrustScore, toast]
  );

  // Get badges by category
  const getBadgesByCategory = useCallback(
    (category: BadgeCategory | string) => {
      if (!badges) return [];
      return badges.filter((badge) => badge.category === category);
    },
    [badges]
  );

  // Get badges by tier
  const getBadgesByTier = useCallback(
    (tier: BadgeTier | string) => {
      if (!badges) return [];
      return badges.filter((badge) => badge.tier === tier);
    },
    [badges]
  );

  // Get earned badges
  const getEarnedBadges = useCallback(() => {
    if (!trustScore || !trustScore.earnedBadges) return [];
    return trustScore.earnedBadges;
  }, [trustScore]);

  // Get earned badges by category
  const getEarnedBadgesByCategory = useCallback(
    (category: BadgeCategory | string) => {
      if (!trustScore || !trustScore.earnedBadges) return [];
      return trustScore.earnedBadges.filter((eb) => eb.badge.category === category);
    },
    [trustScore]
  );

  // Get earned badges by tier
  const getEarnedBadgesByTier = useCallback(
    (tier: BadgeTier | string) => {
      if (!trustScore || !trustScore.earnedBadges) return [];
      return trustScore.earnedBadges.filter((eb) => eb.badge.tier === tier);
    },
    [trustScore]
  );

  // Get trust level color
  const getTrustLevelColor = useCallback((level: TrustLevel | string) => {
    switch (level) {
      case TrustLevel.NOVICE:
        return 'bg-gray-500 text-white';
      case TrustLevel.APPRENTICE:
        return 'bg-blue-500 text-white';
      case TrustLevel.ADEPT:
        return 'bg-green-500 text-white';
      case TrustLevel.EXPERT:
        return 'bg-yellow-500 text-black';
      case TrustLevel.MASTER:
        return 'bg-purple-500 text-white';
      case TrustLevel.GRANDMASTER:
        return 'bg-red-500 text-white';
      case TrustLevel.LEGENDARY:
        return 'bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  }, []);

  // Get badge tier color
  const getBadgeTierColor = useCallback((tier: BadgeTier | string) => {
    switch (tier) {
      case BadgeTier.BRONZE:
        return 'bg-amber-700 text-white';
      case BadgeTier.SILVER:
        return 'bg-gray-400 text-black';
      case BadgeTier.GOLD:
        return 'bg-yellow-400 text-black';
      case BadgeTier.PLATINUM:
        return 'bg-cyan-200 text-black';
      case BadgeTier.DIAMOND:
        return 'bg-blue-300 text-black';
      case BadgeTier.SPECIAL:
        return 'bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  }, []);

  // Get badge category color
  const getBadgeCategoryColor = useCallback((category: BadgeCategory | string) => {
    switch (category) {
      case BadgeCategory.PERFORMANCE:
        return 'bg-blue-500 text-white';
      case BadgeCategory.FEEDBACK:
        return 'bg-green-500 text-white';
      case BadgeCategory.ACCURACY:
        return 'bg-yellow-500 text-black';
      case BadgeCategory.RELIABILITY:
        return 'bg-purple-500 text-white';
      case BadgeCategory.EFFICIENCY:
        return 'bg-cyan-500 text-black';
      case BadgeCategory.LEARNING:
        return 'bg-pink-500 text-white';
      case BadgeCategory.COLLABORATION:
        return 'bg-indigo-500 text-white';
      case BadgeCategory.SECURITY:
        return 'bg-red-500 text-white';
      case BadgeCategory.INNOVATION:
        return 'bg-orange-500 text-white';
      case BadgeCategory.SPECIAL:
        return 'bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  }, []);

  // Refetch all data
  const refetchAll = useCallback(() => {
    if (agentId) {
      refetchTrustScore();
    }
    refetchBadges();
  }, [agentId, refetchTrustScore, refetchBadges]);

  // Return
  return {
    // Data
    trustScore,
    badges,

    // Loading states
    isLoading: isLoading || isTrustScoreLoading || isBadgesLoading,
    isTrustScoreLoading,
    isBadgesLoading,

    // Errors
    trustScoreError,
    badgesError,

    // Actions
    createBadge: handleCreateBadge,
    updateBadge: handleUpdateBadge,
    awardBadge: handleAwardBadge,
    recordTask: handleRecordTask,
    recordFeedback: handleRecordFeedback,
    addXp: handleAddXp,

    // Helpers
    getBadgesByCategory,
    getBadgesByTier,
    getEarnedBadges,
    getEarnedBadgesByCategory,
    getEarnedBadgesByTier,
    getTrustLevelColor,
    getBadgeTierColor,
    getBadgeCategoryColor,

    // Refetch
    refetchTrustScore,
    refetchBadges,
    refetchAll,
  };
};
