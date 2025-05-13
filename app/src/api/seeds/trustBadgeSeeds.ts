import { prisma } from 'wasp/server';
import { BadgeCategory, BadgeTier, BadgeRequirementType } from '@src/shared/types/entities/agentTrust';

/**
 * Seed trust badges
 */
export async function seedTrustBadges() {
  console.log('Seeding trust badges...');
  
  // Check if badges already exist
  const existingBadges = await prisma.trustBadge.count();
  
  if (existingBadges > 0) {
    console.log(`Found ${existingBadges} existing badges, skipping seed.`);
    return;
  }
  
  // Create badges
  const badges = [
    // Performance badges
    {
      name: 'First Steps',
      description: 'Completed first successful task',
      category: BadgeCategory.PERFORMANCE,
      tier: BadgeTier.BRONZE,
      requirement: 'Complete 1 successful task',
      requirementType: BadgeRequirementType.SUCCESSFUL_TASKS,
      requirementValue: 1,
      isActive: true,
    },
    {
      name: 'Task Master',
      description: 'Completed 10 successful tasks',
      category: BadgeCategory.PERFORMANCE,
      tier: BadgeTier.SILVER,
      requirement: 'Complete 10 successful tasks',
      requirementType: BadgeRequirementType.SUCCESSFUL_TASKS,
      requirementValue: 10,
      isActive: true,
    },
    {
      name: 'Productivity Champion',
      description: 'Completed 50 successful tasks',
      category: BadgeCategory.PERFORMANCE,
      tier: BadgeTier.GOLD,
      requirement: 'Complete 50 successful tasks',
      requirementType: BadgeRequirementType.SUCCESSFUL_TASKS,
      requirementValue: 50,
      isActive: true,
    },
    {
      name: 'Efficiency Expert',
      description: 'Completed 100 successful tasks',
      category: BadgeCategory.PERFORMANCE,
      tier: BadgeTier.PLATINUM,
      requirement: 'Complete 100 successful tasks',
      requirementType: BadgeRequirementType.SUCCESSFUL_TASKS,
      requirementValue: 100,
      isActive: true,
    },
    {
      name: 'Legendary Performer',
      description: 'Completed 500 successful tasks',
      category: BadgeCategory.PERFORMANCE,
      tier: BadgeTier.DIAMOND,
      requirement: 'Complete 500 successful tasks',
      requirementType: BadgeRequirementType.SUCCESSFUL_TASKS,
      requirementValue: 500,
      isActive: true,
    },
    
    // Feedback badges
    {
      name: 'First Feedback',
      description: 'Received first piece of feedback',
      category: BadgeCategory.FEEDBACK,
      tier: BadgeTier.BRONZE,
      requirement: 'Receive 1 piece of feedback',
      requirementType: BadgeRequirementType.FEEDBACK,
      requirementValue: 1,
      isActive: true,
    },
    {
      name: 'Feedback Collector',
      description: 'Received 10 pieces of feedback',
      category: BadgeCategory.FEEDBACK,
      tier: BadgeTier.SILVER,
      requirement: 'Receive 10 pieces of feedback',
      requirementType: BadgeRequirementType.FEEDBACK,
      requirementValue: 10,
      isActive: true,
    },
    {
      name: 'Feedback Maven',
      description: 'Received 50 pieces of feedback',
      category: BadgeCategory.FEEDBACK,
      tier: BadgeTier.GOLD,
      requirement: 'Receive 50 pieces of feedback',
      requirementType: BadgeRequirementType.FEEDBACK,
      requirementValue: 50,
      isActive: true,
    },
    {
      name: 'Positive Reinforcement',
      description: 'Received 10 positive ratings',
      category: BadgeCategory.FEEDBACK,
      tier: BadgeTier.SILVER,
      requirement: 'Receive 10 positive ratings',
      requirementType: BadgeRequirementType.POSITIVE_FEEDBACK,
      requirementValue: 10,
      isActive: true,
    },
    {
      name: 'Highly Rated',
      description: 'Received 50 positive ratings',
      category: BadgeCategory.FEEDBACK,
      tier: BadgeTier.GOLD,
      requirement: 'Receive 50 positive ratings',
      requirementType: BadgeRequirementType.POSITIVE_FEEDBACK,
      requirementValue: 50,
      isActive: true,
    },
    
    // Level badges
    {
      name: 'Level 5',
      description: 'Reached level 5',
      category: BadgeCategory.LEARNING,
      tier: BadgeTier.BRONZE,
      requirement: 'Reach level 5',
      requirementType: BadgeRequirementType.LEVEL,
      requirementValue: 5,
      isActive: true,
    },
    {
      name: 'Level 10',
      description: 'Reached level 10',
      category: BadgeCategory.LEARNING,
      tier: BadgeTier.SILVER,
      requirement: 'Reach level 10',
      requirementType: BadgeRequirementType.LEVEL,
      requirementValue: 10,
      isActive: true,
    },
    {
      name: 'Level 20',
      description: 'Reached level 20',
      category: BadgeCategory.LEARNING,
      tier: BadgeTier.GOLD,
      requirement: 'Reach level 20',
      requirementType: BadgeRequirementType.LEVEL,
      requirementValue: 20,
      isActive: true,
    },
    {
      name: 'Level 30',
      description: 'Reached level 30',
      category: BadgeCategory.LEARNING,
      tier: BadgeTier.PLATINUM,
      requirement: 'Reach level 30',
      requirementType: BadgeRequirementType.LEVEL,
      requirementValue: 30,
      isActive: true,
    },
    {
      name: 'Level 50',
      description: 'Reached level 50',
      category: BadgeCategory.LEARNING,
      tier: BadgeTier.DIAMOND,
      requirement: 'Reach level 50',
      requirementType: BadgeRequirementType.LEVEL,
      requirementValue: 50,
      isActive: true,
    },
    
    // XP badges
    {
      name: 'XP Starter',
      description: 'Earned 100 XP',
      category: BadgeCategory.LEARNING,
      tier: BadgeTier.BRONZE,
      requirement: 'Earn 100 XP',
      requirementType: BadgeRequirementType.XP,
      requirementValue: 100,
      isActive: true,
    },
    {
      name: 'XP Collector',
      description: 'Earned 500 XP',
      category: BadgeCategory.LEARNING,
      tier: BadgeTier.SILVER,
      requirement: 'Earn 500 XP',
      requirementType: BadgeRequirementType.XP,
      requirementValue: 500,
      isActive: true,
    },
    {
      name: 'XP Hoarder',
      description: 'Earned 1,000 XP',
      category: BadgeCategory.LEARNING,
      tier: BadgeTier.GOLD,
      requirement: 'Earn 1,000 XP',
      requirementType: BadgeRequirementType.XP,
      requirementValue: 1000,
      isActive: true,
    },
    {
      name: 'XP Master',
      description: 'Earned 5,000 XP',
      category: BadgeCategory.LEARNING,
      tier: BadgeTier.PLATINUM,
      requirement: 'Earn 5,000 XP',
      requirementType: BadgeRequirementType.XP,
      requirementValue: 5000,
      isActive: true,
    },
    {
      name: 'XP Legend',
      description: 'Earned 10,000 XP',
      category: BadgeCategory.LEARNING,
      tier: BadgeTier.DIAMOND,
      requirement: 'Earn 10,000 XP',
      requirementType: BadgeRequirementType.XP,
      requirementValue: 10000,
      isActive: true,
    },
    
    // Special badges
    {
      name: 'Early Adopter',
      description: 'One of the first agents to join the platform',
      category: BadgeCategory.SPECIAL,
      tier: BadgeTier.SPECIAL,
      requirement: 'Special award for early adopters',
      requirementType: BadgeRequirementType.SPECIAL,
      requirementValue: 1,
      isActive: true,
    },
    {
      name: 'Innovator',
      description: 'Recognized for innovative solutions',
      category: BadgeCategory.INNOVATION,
      tier: BadgeTier.SPECIAL,
      requirement: 'Special award for innovation',
      requirementType: BadgeRequirementType.SPECIAL,
      requirementValue: 1,
      isActive: true,
    },
    {
      name: 'Security Champion',
      description: 'Demonstrated exceptional security practices',
      category: BadgeCategory.SECURITY,
      tier: BadgeTier.SPECIAL,
      requirement: 'Special award for security excellence',
      requirementType: BadgeRequirementType.SPECIAL,
      requirementValue: 1,
      isActive: true,
    },
  ];
  
  // Create badges in database
  for (const badge of badges) {
    await prisma.trustBadge.create({
      data: badge,
    });
  }
  
  console.log(`Created ${badges.length} trust badges.`);
}
