import { prisma } from 'wasp/server';
import { updateLeaderboard } from './leaderboard';
import { processSystemEvent } from './events';

/**
 * Job to update the leaderboard
 * Runs hourly to keep the leaderboard up to date
 */
export const updateLeaderboardJob = async () => {
  try {
    console.log('Running updateLeaderboardJob...');
    await updateLeaderboard();
    console.log('Leaderboard updated successfully');
    return { success: true };
  } catch (error) {
    console.error('Error updating leaderboard:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Job to expire rewards
 * Runs daily to check for expired rewards and deactivate them
 */
export const expireRewardsJob = async () => {
  try {
    console.log('Running expireRewardsJob...');
    
    // Find expired rewards
    const now = new Date();
    const expiredRewards = await prisma.userReward.findMany({
      where: {
        isActive: true,
        expiresAt: {
          lt: now
        }
      },
      include: {
        reward: true,
        userXp: true
      }
    });
    
    console.log(`Found ${expiredRewards.length} expired rewards`);
    
    // Deactivate expired rewards
    for (const userReward of expiredRewards) {
      await prisma.userReward.update({
        where: { id: userReward.id },
        data: { isActive: false }
      });
      
      // Create transaction record
      await prisma.runeTransaction.create({
        data: {
          userXpId: userReward.userXpId,
          amount: 0,
          reason: 'Reward Expired',
          description: `Reward expired: ${userReward.reward.name}`
        }
      });
      
      console.log(`Deactivated expired reward: ${userReward.reward.name} for user ${userReward.userXp.userId}`);
    }
    
    return { success: true, expiredCount: expiredRewards.length };
  } catch (error) {
    console.error('Error expiring rewards:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Job to process system events
 * Runs every 15 minutes to process unprocessed system events
 */
export const processSystemEventsJob = async () => {
  try {
    console.log('Running processSystemEventsJob...');
    
    // Find unprocessed system events
    const unprocessedEvents = await prisma.systemEvent.findMany({
      where: {
        processed: false
      },
      orderBy: {
        createdAt: 'asc'
      },
      take: 100 // Process in batches to avoid timeouts
    });
    
    console.log(`Found ${unprocessedEvents.length} unprocessed system events`);
    
    // Process each event
    const results = [];
    for (const event of unprocessedEvents) {
      try {
        const result = await processSystemEvent(event);
        results.push({
          eventId: event.id,
          success: true,
          result
        });
      } catch (error) {
        console.error(`Error processing system event ${event.id}:`, error);
        results.push({
          eventId: event.id,
          success: false,
          error: String(error)
        });
        
        // Mark as processed even if there was an error to avoid reprocessing
        await prisma.systemEvent.update({
          where: { id: event.id },
          data: { processed: true }
        });
      }
    }
    
    return { 
      success: true, 
      processedCount: unprocessedEvents.length,
      results
    };
  } catch (error) {
    console.error('Error processing system events:', error);
    return { success: false, error: String(error) };
  }
};
