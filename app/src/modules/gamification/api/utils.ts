import { prisma } from 'wasp/server';
import { type LevelData, type AchievementTrigger } from './types';

/**
 * Calculate user level and XP based on total XP
 */
export async function calculateLevel(totalXP: number): Promise<LevelData> {
  // Get all level configurations
  const levelConfigs = await prisma.levelConfig.findMany({
    orderBy: { level: 'asc' }
  });

  // Find the highest level the user has reached
  let currentLevel = 1;
  let xpForNextLevel = 100; // Default if no level configs exist

  for (let i = 0; i < levelConfigs.length; i++) {
    const config = levelConfigs[i];
    
    if (totalXP >= config.xpRequired) {
      currentLevel = config.level;
      
      // If there's a next level, get its XP requirement
      if (i < levelConfigs.length - 1) {
        xpForNextLevel = levelConfigs[i + 1].xpRequired;
      } else {
        // If this is the highest level, just add a buffer
        xpForNextLevel = config.xpRequired + 1000;
      }
    } else {
      // Found the next level
      xpForNextLevel = config.xpRequired;
      break;
    }
  }

  // Calculate current XP within the level
  const previousLevelConfig = levelConfigs.find(c => c.level === currentLevel);
  const previousLevelXP = previousLevelConfig ? previousLevelConfig.xpRequired : 0;
  const currentXP = totalXP - previousLevelXP;

  return {
    level: currentLevel,
    currentXP,
    xpForNextLevel
  };
}

/**
 * Check achievement progress for a user
 */
export async function checkAchievementProgress(userId: string): Promise<any[]> {
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
    return [];
  }

  // Get all active achievements
  const achievements = await prisma.achievement.findMany({
    where: { isActive: true }
  });

  const updatedAchievements = [];

  // Check each achievement
  for (const achievement of achievements) {
    // Skip if no trigger condition
    if (!achievement.triggerCondition) continue;

    // Parse trigger condition
    let trigger: AchievementTrigger;
    try {
      trigger = JSON.parse(achievement.triggerCondition);
    } catch (e) {
      console.error(`Invalid trigger condition for achievement ${achievement.id}:`, e);
      continue;
    }

    // Find user achievement record or create one
    let userAchievement = userXP.achievements.find(ua => ua.achievementId === achievement.id);
    
    if (!userAchievement) {
      userAchievement = await prisma.userAchievement.create({
        data: {
          userXpId: userXP.id,
          achievementId: achievement.id,
          progress: 0,
          isUnlocked: false,
          timesUnlocked: 0
        }
      });
    }

    // Skip if already unlocked and not repeatable
    if (userAchievement.isUnlocked && !achievement.isRepeatable) {
      continue;
    }

    // Check cooldown for repeatable achievements
    if (achievement.isRepeatable && achievement.cooldownHours && userAchievement.unlockedAt) {
      const cooldownMs = achievement.cooldownHours * 60 * 60 * 1000;
      const timeSinceUnlock = Date.now() - userAchievement.unlockedAt.getTime();
      
      if (timeSinceUnlock < cooldownMs) {
        continue;
      }
    }

    // Check achievement progress based on recent system events
    const progress = await calculateAchievementProgress(userId, trigger);
    
    // Update progress if changed
    if (progress !== userAchievement.progress) {
      const updatedUserAchievement = await prisma.userAchievement.update({
        where: { id: userAchievement.id },
        data: {
          progress,
          lastProgressAt: new Date()
        }
      });
      
      userAchievement = updatedUserAchievement;
    }

    // Check if achievement is completed
    if (progress >= achievement.requiredProgress && !userAchievement.isUnlocked) {
      // Unlock achievement
      const updatedUserAchievement = await prisma.userAchievement.update({
        where: { id: userAchievement.id },
        data: {
          isUnlocked: true,
          unlockedAt: new Date(),
          timesUnlocked: userAchievement.timesUnlocked + 1
        }
      });
      
      // Award XP and runes
      await prisma.userXP.update({
        where: { id: userXP.id },
        data: {
          totalXP: userXP.totalXP + achievement.xpReward,
          runes: userXP.runes + achievement.runeReward,
          xpTransactions: {
            create: {
              amount: achievement.xpReward,
              reason: 'Achievement Unlocked',
              description: `Unlocked achievement: ${achievement.name}`
            }
          },
          runeTransactions: {
            create: {
              amount: achievement.runeReward,
              reason: 'Achievement Unlocked',
              description: `Unlocked achievement: ${achievement.name}`
            }
          }
        }
      });
      
      updatedAchievements.push(updatedUserAchievement);
    }
  }

  return updatedAchievements;
}

/**
 * Calculate achievement progress based on trigger condition
 */
async function calculateAchievementProgress(userId: string, trigger: AchievementTrigger): Promise<number> {
  // Different calculation based on trigger type
  switch (trigger.type) {
    case 'uptime':
      return calculateUptimeProgress(userId, trigger);
    
    case 'security_scan':
      return calculateSecurityScanProgress(userId, trigger);
    
    case 'threat_mitigation':
      return calculateThreatMitigationProgress(userId, trigger);
    
    case 'security_score':
      return calculateSecurityScoreProgress(userId, trigger);
    
    case 'performance_improvement':
      return calculatePerformanceImprovementProgress(userId, trigger);
    
    case 'response_time':
      return calculateResponseTimeProgress(userId, trigger);
    
    case 'resource_usage':
      return calculateResourceUsageProgress(userId, trigger);
    
    case 'system_upgrade':
      return calculateSystemUpgradeProgress(userId, trigger);
    
    case 'backup_setup':
      return calculateBackupSetupProgress(userId, trigger);
    
    case 'user_management':
      return calculateUserManagementProgress(userId, trigger);
    
    default:
      return 0;
  }
}

// Placeholder implementations for different achievement progress calculations
// In a real implementation, these would query relevant system metrics and events

async function calculateUptimeProgress(userId: string, trigger: AchievementTrigger): Promise<number> {
  // Mock implementation - would check actual uptime metrics in production
  return 100; // Assume 100% uptime for demo
}

async function calculateSecurityScanProgress(userId: string, trigger: AchievementTrigger): Promise<number> {
  // Check if user has run security scans
  const securityScans = await prisma.securityScan.findMany({
    where: { 
      userId,
      type: trigger.scanType || 'complete',
      status: 'completed'
    }
  });
  
  return securityScans.length > 0 ? 100 : 0;
}

async function calculateThreatMitigationProgress(userId: string, trigger: AchievementTrigger): Promise<number> {
  // Count mitigated threats
  const mitigatedThreats = await prisma.securityAlert.count({
    where: {
      userId,
      status: 'resolved'
    }
  });
  
  const targetCount = trigger.count || 5;
  return Math.min(100, Math.floor((mitigatedThreats / targetCount) * 100));
}

async function calculateSecurityScoreProgress(userId: string, trigger: AchievementTrigger): Promise<number> {
  // Get latest security scan with score
  const latestScan = await prisma.securityScan.findFirst({
    where: {
      userId,
      score: { not: null }
    },
    orderBy: { completedAt: 'desc' }
  });
  
  if (!latestScan || !latestScan.score) return 0;
  
  const threshold = trigger.threshold || 90;
  return latestScan.score >= threshold ? 100 : Math.floor((latestScan.score / threshold) * 100);
}

// Implement other progress calculation functions similarly
// These would be replaced with actual metrics in a production system

async function calculatePerformanceImprovementProgress(userId: string, trigger: AchievementTrigger): Promise<number> {
  return 65; // Mock implementation
}

async function calculateResponseTimeProgress(userId: string, trigger: AchievementTrigger): Promise<number> {
  return 80; // Mock implementation
}

async function calculateResourceUsageProgress(userId: string, trigger: AchievementTrigger): Promise<number> {
  return 50; // Mock implementation
}

async function calculateSystemUpgradeProgress(userId: string, trigger: AchievementTrigger): Promise<number> {
  return 40; // Mock implementation
}

async function calculateBackupSetupProgress(userId: string, trigger: AchievementTrigger): Promise<number> {
  return 100; // Mock implementation
}

async function calculateUserManagementProgress(userId: string, trigger: AchievementTrigger): Promise<number> {
  // Count users managed by this user
  const userCount = await prisma.user.count({
    where: { organizationId: { not: null } }
  });
  
  const targetCount = trigger.count || 50;
  return Math.min(100, Math.floor((userCount / targetCount) * 100));
}
