import { prisma } from 'wasp/server';
import { type SystemEvent, type UserAchievement } from '@prisma/client';
import { checkAchievementProgress } from './utils';

/**
 * Process a system event for achievement tracking
 */
export async function processSystemEvent(event: SystemEvent): Promise<{
  systemEvent: SystemEvent;
  achievementsUpdated?: UserAchievement[];
  xpAwarded?: number;
}> {
  // Mark event as processed
  const updatedEvent = await prisma.systemEvent.update({
    where: { id: event.id },
    data: { processed: true }
  });

  // Award XP based on event type
  let xpAwarded = 0;
  
  switch (event.eventType) {
    case 'login':
      // Award XP for daily login
      xpAwarded = await processLoginEvent(event);
      break;
    
    case 'security_scan':
      // Award XP for security scans
      xpAwarded = await processSecurityScanEvent(event);
      break;
    
    case 'threat_mitigation':
      // Award XP for threat mitigation
      xpAwarded = await processThreatMitigationEvent(event);
      break;
    
    case 'system_upgrade':
      // Award XP for system upgrades
      xpAwarded = await processSystemUpgradeEvent(event);
      break;
    
    case 'backup_creation':
      // Award XP for backups
      xpAwarded = await processBackupEvent(event);
      break;
    
    case 'user_management':
      // Award XP for user management
      xpAwarded = await processUserManagementEvent(event);
      break;
    
    // Add more event types as needed
  }

  // Check achievement progress
  const achievementsUpdated = await checkAchievementProgress(event.userId);

  return {
    systemEvent: updatedEvent,
    achievementsUpdated,
    xpAwarded
  };
}

/**
 * Process login event
 * - Award XP for daily logins
 * - Track login streaks
 */
async function processLoginEvent(event: SystemEvent): Promise<number> {
  // Get user XP record
  const userXP = await prisma.userXP.findUnique({
    where: { userId: event.userId }
  });

  if (!userXP) return 0;

  // Check if this is a new day login
  const now = new Date();
  const lastLogin = userXP.lastXPGainAt;
  
  if (!lastLogin) {
    // First login, award XP
    await awardXP(userXP.id, 10, 'First Login', 'Logged in for the first time');
    return 10;
  }

  // Check if last login was on a different day
  const isNewDay = 
    lastLogin.getDate() !== now.getDate() ||
    lastLogin.getMonth() !== now.getMonth() ||
    lastLogin.getFullYear() !== now.getFullYear();

  if (!isNewDay) {
    return 0; // Already logged in today
  }

  // Check if this is a consecutive day (streak)
  const isConsecutiveDay = 
    (now.getTime() - lastLogin.getTime()) < (36 * 60 * 60 * 1000); // Within 36 hours

  let streakDays = userXP.streakDays || 0;
  let xpAmount = 10; // Base XP for daily login
  
  if (isConsecutiveDay) {
    // Increment streak
    streakDays++;
    
    // Bonus XP for streaks
    if (streakDays >= 7) {
      xpAmount = 25; // Weekly streak
    } else if (streakDays >= 3) {
      xpAmount = 15; // 3-day streak
    }
  } else {
    // Reset streak
    streakDays = 1;
  }

  // Update streak
  await prisma.userXP.update({
    where: { id: userXP.id },
    data: {
      streakDays,
      streakLastUpdated: now
    }
  });

  // Award XP
  const streakText = streakDays > 1 ? ` (${streakDays}-day streak)` : '';
  await awardXP(
    userXP.id, 
    xpAmount, 
    'Daily Login', 
    `Logged in for the day${streakText}`
  );

  return xpAmount;
}

/**
 * Process security scan event
 */
async function processSecurityScanEvent(event: SystemEvent): Promise<number> {
  // Get user XP record
  const userXP = await prisma.userXP.findUnique({
    where: { userId: event.userId }
  });

  if (!userXP) return 0;

  // Award XP based on scan type
  const metadata = event.metadata as any || {};
  const scanType = metadata.scanType || 'basic';
  
  let xpAmount = 0;
  let reason = 'Security Scan';
  let description = 'Completed a security scan';
  
  switch (scanType) {
    case 'quick':
      xpAmount = 15;
      description = 'Completed a quick security scan';
      break;
    
    case 'complete':
      xpAmount = 30;
      description = 'Completed a comprehensive security scan';
      break;
    
    case 'vulnerability':
      xpAmount = 25;
      description = 'Completed a vulnerability assessment';
      break;
    
    default:
      xpAmount = 10;
      description = 'Completed a basic security scan';
  }

  // Award XP
  await awardXP(userXP.id, xpAmount, reason, description);

  return xpAmount;
}

/**
 * Process threat mitigation event
 */
async function processThreatMitigationEvent(event: SystemEvent): Promise<number> {
  // Get user XP record
  const userXP = await prisma.userXP.findUnique({
    where: { userId: event.userId }
  });

  if (!userXP) return 0;

  // Award XP based on threat severity
  const metadata = event.metadata as any || {};
  const severity = metadata.severity || 'low';
  
  let xpAmount = 0;
  let reason = 'Threat Mitigation';
  let description = 'Mitigated a security threat';
  
  switch (severity) {
    case 'critical':
      xpAmount = 50;
      description = 'Mitigated a critical security threat';
      break;
    
    case 'high':
      xpAmount = 35;
      description = 'Mitigated a high-severity security threat';
      break;
    
    case 'medium':
      xpAmount = 20;
      description = 'Mitigated a medium-severity security threat';
      break;
    
    default:
      xpAmount = 10;
      description = 'Mitigated a low-severity security threat';
  }

  // Award XP
  await awardXP(userXP.id, xpAmount, reason, description);

  return xpAmount;
}

/**
 * Process system upgrade event
 */
async function processSystemUpgradeEvent(event: SystemEvent): Promise<number> {
  // Get user XP record
  const userXP = await prisma.userXP.findUnique({
    where: { userId: event.userId }
  });

  if (!userXP) return 0;

  // Award XP
  const xpAmount = 40;
  await awardXP(
    userXP.id, 
    xpAmount, 
    'System Upgrade', 
    'Successfully upgraded system components'
  );

  return xpAmount;
}

/**
 * Process backup event
 */
async function processBackupEvent(event: SystemEvent): Promise<number> {
  // Get user XP record
  const userXP = await prisma.userXP.findUnique({
    where: { userId: event.userId }
  });

  if (!userXP) return 0;

  // Award XP
  const xpAmount = 15;
  await awardXP(
    userXP.id, 
    xpAmount, 
    'Backup Creation', 
    'Successfully created a system backup'
  );

  return xpAmount;
}

/**
 * Process user management event
 */
async function processUserManagementEvent(event: SystemEvent): Promise<number> {
  // Get user XP record
  const userXP = await prisma.userXP.findUnique({
    where: { userId: event.userId }
  });

  if (!userXP) return 0;

  // Award XP based on action
  const metadata = event.metadata as any || {};
  const action = metadata.action || 'view';
  
  let xpAmount = 0;
  let reason = 'User Management';
  let description = 'Managed user accounts';
  
  switch (action) {
    case 'create':
      xpAmount = 20;
      description = 'Created a new user account';
      break;
    
    case 'update':
      xpAmount = 10;
      description = 'Updated a user account';
      break;
    
    case 'delete':
      xpAmount = 15;
      description = 'Removed a user account';
      break;
    
    default:
      xpAmount = 5;
      description = 'Viewed user accounts';
  }

  // Award XP
  await awardXP(userXP.id, xpAmount, reason, description);

  return xpAmount;
}

/**
 * Helper function to award XP
 */
async function awardXP(
  userXpId: string, 
  amount: number, 
  reason: string, 
  description: string
): Promise<void> {
  // Get current user XP
  const userXP = await prisma.userXP.findUnique({
    where: { id: userXpId }
  });

  if (!userXP) return;

  // Update XP
  await prisma.userXP.update({
    where: { id: userXpId },
    data: {
      totalXP: userXP.totalXP + amount,
      lastXPGainAt: new Date(),
      xpTransactions: {
        create: {
          amount,
          reason,
          description
        }
      }
    }
  });
}
