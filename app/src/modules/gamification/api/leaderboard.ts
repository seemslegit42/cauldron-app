import { prisma } from 'wasp/server';

/**
 * Update the leaderboard with current user XP data
 */
export async function updateLeaderboard(): Promise<void> {
  // Get all users with XP data
  const usersWithXP = await prisma.userXP.findMany({
    include: {
      user: {
        select: {
          id: true,
          username: true
        }
      },
      achievements: {
        where: {
          isUnlocked: true
        }
      }
    }
  });

  // Sort users by XP
  const sortedUsers = usersWithXP.sort((a, b) => b.totalXP - a.totalXP);

  // Get previous leaderboard snapshot for change calculation
  const previousSnapshots = await prisma.leaderboardSnapshot.findMany();
  const previousSnapshotMap = new Map(
    previousSnapshots.map(snapshot => [snapshot.userId, snapshot])
  );

  // Create new snapshots
  const snapshots = [];
  for (let i = 0; i < sortedUsers.length; i++) {
    const userXP = sortedUsers[i];
    const rank = i + 1;
    
    // Calculate rank change
    const previousSnapshot = previousSnapshotMap.get(userXP.userId);
    const previousRank = previousSnapshot?.rank || rank;
    const change = previousRank - rank; // Positive means improvement
    
    snapshots.push({
      userId: userXP.userId,
      username: userXP.user.username || `User-${userXP.userId.substring(0, 8)}`,
      level: userXP.level,
      xp: userXP.totalXP,
      runes: userXP.runes,
      achievements: userXP.achievements.length,
      rank,
      change
    });
  }

  // Delete previous snapshots and create new ones
  await prisma.$transaction([
    prisma.leaderboardSnapshot.deleteMany({}),
    prisma.leaderboardSnapshot.createMany({
      data: snapshots
    })
  ]);
}

/**
 * Schedule regular leaderboard updates
 */
export function scheduleLeaderboardUpdates(): void {
  // Update leaderboard every hour
  setInterval(async () => {
    try {
      await updateLeaderboard();
      console.log('Leaderboard updated successfully');
    } catch (error) {
      console.error('Error updating leaderboard:', error);
    }
  }, 60 * 60 * 1000); // 1 hour
}

/**
 * Initialize leaderboard on server start
 */
export async function initializeLeaderboard(): Promise<void> {
  try {
    // Check if leaderboard exists
    const existingSnapshots = await prisma.leaderboardSnapshot.count();
    
    if (existingSnapshots === 0) {
      // Create initial leaderboard
      await updateLeaderboard();
      console.log('Leaderboard initialized successfully');
    }
    
    // Schedule regular updates
    scheduleLeaderboardUpdates();
  } catch (error) {
    console.error('Error initializing leaderboard:', error);
  }
}
