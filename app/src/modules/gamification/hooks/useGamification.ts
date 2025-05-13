import { useState, useEffect, useCallback } from 'react';
import { 
  getUserXP, 
  getAchievements, 
  getRewards, 
  getLeaderboard, 
  earnXP, 
  purchaseReward, 
  trackSystemEvent 
} from 'wasp/client/operations';
import { useAuth } from 'wasp/client/auth';
import { toast } from 'react-hot-toast';

export interface GamificationHook {
  // User XP data
  userXP: any;
  isLoadingXP: boolean;
  errorXP: Error | null;
  refreshXP: () => Promise<void>;
  
  // Achievements
  achievements: any[];
  isLoadingAchievements: boolean;
  errorAchievements: Error | null;
  refreshAchievements: (category?: string) => Promise<void>;
  
  // Rewards
  rewards: any[];
  isLoadingRewards: boolean;
  errorRewards: Error | null;
  refreshRewards: () => Promise<void>;
  
  // Leaderboard
  leaderboard: any[];
  currentUserRank: any;
  isLoadingLeaderboard: boolean;
  errorLeaderboard: Error | null;
  refreshLeaderboard: (limit?: number, offset?: number) => Promise<void>;
  
  // Actions
  earnXP: (amount: number, reason: string, description?: string) => Promise<any>;
  purchaseReward: (rewardId: string) => Promise<any>;
  trackEvent: (eventType: string, eventSource: string, metadata?: any) => Promise<any>;
  
  // Notifications
  showXPNotification: (amount: number, reason: string) => void;
  showAchievementNotification: (achievement: any) => void;
  showRewardNotification: (reward: any) => void;
}

/**
 * Hook for using the gamification system
 */
export function useGamification(): GamificationHook {
  const { data: user } = useAuth();
  
  // User XP state
  const [userXP, setUserXP] = useState<any>(null);
  const [isLoadingXP, setIsLoadingXP] = useState<boolean>(true);
  const [errorXP, setErrorXP] = useState<Error | null>(null);
  
  // Achievements state
  const [achievements, setAchievements] = useState<any[]>([]);
  const [isLoadingAchievements, setIsLoadingAchievements] = useState<boolean>(true);
  const [errorAchievements, setErrorAchievements] = useState<Error | null>(null);
  
  // Rewards state
  const [rewards, setRewards] = useState<any[]>([]);
  const [isLoadingRewards, setIsLoadingRewards] = useState<boolean>(true);
  const [errorRewards, setErrorRewards] = useState<Error | null>(null);
  
  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<any>(null);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState<boolean>(true);
  const [errorLeaderboard, setErrorLeaderboard] = useState<Error | null>(null);
  
  // Fetch user XP data
  const fetchUserXP = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoadingXP(true);
      setErrorXP(null);
      
      const data = await getUserXP({ userId: user.id });
      setUserXP(data);
    } catch (error) {
      console.error('Error fetching user XP:', error);
      setErrorXP(error as Error);
    } finally {
      setIsLoadingXP(false);
    }
  }, [user]);
  
  // Fetch achievements
  const fetchAchievements = useCallback(async (category?: string) => {
    if (!user) return;
    
    try {
      setIsLoadingAchievements(true);
      setErrorAchievements(null);
      
      const data = await getAchievements({ userId: user.id, category });
      setAchievements(data);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      setErrorAchievements(error as Error);
    } finally {
      setIsLoadingAchievements(false);
    }
  }, [user]);
  
  // Fetch rewards
  const fetchRewards = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoadingRewards(true);
      setErrorRewards(null);
      
      const data = await getRewards({ userId: user.id });
      setRewards(data);
    } catch (error) {
      console.error('Error fetching rewards:', error);
      setErrorRewards(error as Error);
    } finally {
      setIsLoadingRewards(false);
    }
  }, [user]);
  
  // Fetch leaderboard
  const fetchLeaderboard = useCallback(async (limit = 10, offset = 0) => {
    if (!user) return;
    
    try {
      setIsLoadingLeaderboard(true);
      setErrorLeaderboard(null);
      
      const data = await getLeaderboard({ limit, offset });
      setLeaderboard(data.leaderboard);
      setCurrentUserRank(data.currentUserRank);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setErrorLeaderboard(error as Error);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  }, [user]);
  
  // Earn XP
  const earnXPAction = useCallback(async (amount: number, reason: string, description?: string) => {
    if (!user) return null;
    
    try {
      const result = await earnXP({ 
        userId: user.id, 
        amount, 
        reason, 
        description 
      });
      
      // Update local state
      setUserXP(result.userXP);
      
      // Show notification
      showXPNotification(amount, reason);
      
      // If leveled up, show special notification
      if (result.didLevelUp) {
        toast.success(`Level Up! You are now level ${result.userXP.level}`, {
          icon: '🎉',
          duration: 5000,
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error earning XP:', error);
      toast.error('Failed to earn XP');
      return null;
    }
  }, [user]);
  
  // Purchase reward
  const purchaseRewardAction = useCallback(async (rewardId: string) => {
    if (!user) return null;
    
    try {
      const result = await purchaseReward({ 
        userId: user.id, 
        rewardId 
      });
      
      // Update local state
      fetchUserXP();
      fetchRewards();
      
      // Show notification
      showRewardNotification(result.reward);
      
      return result;
    } catch (error) {
      console.error('Error purchasing reward:', error);
      toast.error('Failed to purchase reward');
      return null;
    }
  }, [user, fetchUserXP, fetchRewards]);
  
  // Track system event
  const trackEventAction = useCallback(async (eventType: string, eventSource: string, metadata?: any) => {
    if (!user) return null;
    
    try {
      const result = await trackSystemEvent({ 
        userId: user.id, 
        eventType, 
        eventSource, 
        metadata 
      });
      
      // If achievements were updated, refresh achievements
      if (result.achievementsUpdated && result.achievementsUpdated.length > 0) {
        fetchAchievements();
        
        // Show achievement notifications
        result.achievementsUpdated.forEach(async (userAchievement: any) => {
          const achievement = achievements.find(a => a.id === userAchievement.achievementId);
          if (achievement) {
            showAchievementNotification(achievement);
          }
        });
      }
      
      // If XP was awarded, refresh XP
      if (result.xpAwarded) {
        fetchUserXP();
      }
      
      return result;
    } catch (error) {
      console.error('Error tracking system event:', error);
      return null;
    }
  }, [user, achievements, fetchAchievements, fetchUserXP]);
  
  // Show XP notification
  const showXPNotification = useCallback((amount: number, reason: string) => {
    toast.success(`+${amount} XP: ${reason}`, {
      icon: '⚡',
      duration: 3000,
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
  }, []);
  
  // Show achievement notification
  const showAchievementNotification = useCallback((achievement: any) => {
    toast.success(`Achievement Unlocked: ${achievement.name}`, {
      icon: '🏆',
      duration: 5000,
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
  }, []);
  
  // Show reward notification
  const showRewardNotification = useCallback((reward: any) => {
    toast.success(`Reward Purchased: ${reward.name}`, {
      icon: '🎁',
      duration: 3000,
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
  }, []);
  
  // Initial data loading
  useEffect(() => {
    if (user) {
      fetchUserXP();
      fetchAchievements();
      fetchRewards();
      fetchLeaderboard();
    }
  }, [user, fetchUserXP, fetchAchievements, fetchRewards, fetchLeaderboard]);
  
  return {
    // User XP
    userXP,
    isLoadingXP,
    errorXP,
    refreshXP: fetchUserXP,
    
    // Achievements
    achievements,
    isLoadingAchievements,
    errorAchievements,
    refreshAchievements: fetchAchievements,
    
    // Rewards
    rewards,
    isLoadingRewards,
    errorRewards,
    refreshRewards: fetchRewards,
    
    // Leaderboard
    leaderboard,
    currentUserRank,
    isLoadingLeaderboard,
    errorLeaderboard,
    refreshLeaderboard: fetchLeaderboard,
    
    // Actions
    earnXP: earnXPAction,
    purchaseReward: purchaseRewardAction,
    trackEvent: trackEventAction,
    
    // Notifications
    showXPNotification,
    showAchievementNotification,
    showRewardNotification
  };
}
