import { PrismaClient } from '@prisma/client';

export async function seedGamification(prisma: PrismaClient) {
  console.log('Seeding gamification data...');

  // Seed level configuration
  await seedLevelConfig(prisma);
  
  // Seed achievements
  await seedAchievements(prisma);
  
  // Seed rewards
  await seedRewards(prisma);
  
  // Initialize UserXP for existing users
  await initializeUserXP(prisma);
  
  console.log('Gamification data seeded successfully!');
}

async function seedLevelConfig(prisma: PrismaClient) {
  const levels = [
    { level: 1, xpRequired: 0, runeReward: 0, title: 'Novice', description: 'Beginning of your journey' },
    { level: 2, xpRequired: 100, runeReward: 10, title: 'Apprentice', description: 'First steps into the arcane' },
    { level: 3, xpRequired: 250, runeReward: 15, title: 'Initiate', description: 'Grasping the basics' },
    { level: 4, xpRequired: 500, runeReward: 20, title: 'Adept', description: 'Showing promise' },
    { level: 5, xpRequired: 1000, runeReward: 25, title: 'Specialist', description: 'Developing expertise' },
    { level: 6, xpRequired: 1500, runeReward: 30, title: 'Expert', description: 'Mastering the craft' },
    { level: 7, xpRequired: 2250, runeReward: 40, title: 'Veteran', description: 'Seasoned practitioner' },
    { level: 8, xpRequired: 3000, runeReward: 50, title: 'Master', description: 'Command of the arcane' },
    { level: 9, xpRequired: 4000, runeReward: 60, title: 'Grandmaster', description: 'Exceptional mastery' },
    { level: 10, xpRequired: 5000, runeReward: 75, title: 'Archmage', description: 'Pinnacle of arcane knowledge' },
    { level: 11, xpRequired: 6500, runeReward: 90, title: 'Arcane Lord', description: 'Beyond conventional mastery' },
    { level: 12, xpRequired: 8000, runeReward: 100, title: 'Arcane Sovereign', description: 'Ruler of the arcane' },
    { level: 13, xpRequired: 10000, runeReward: 125, title: 'Transcendent', description: 'Transcending mortal limits' },
    { level: 14, xpRequired: 12500, runeReward: 150, title: 'Ascendant', description: 'Ascending to new heights' },
    { level: 15, xpRequired: 15000, runeReward: 200, title: 'Legendary', description: 'Your name echoes through the ages' },
  ];

  for (const level of levels) {
    await prisma.levelConfig.upsert({
      where: { level: level.level },
      update: level,
      create: level,
    });
  }
  
  console.log(`Seeded ${levels.length} level configurations`);
}

async function seedAchievements(prisma: PrismaClient) {
  const achievements = [
    // Uptime Achievements
    {
      name: '24-Hour Uptime',
      description: 'Maintain 100% uptime for all services for 24 hours',
      category: 'uptime',
      icon: 'Clock',
      xpReward: 50,
      runeReward: 5,
      isRepeatable: false,
      requiredProgress: 100,
      triggerCondition: JSON.stringify({
        type: 'uptime',
        duration: 24,
        threshold: 100
      })
    },
    {
      name: '7-Day Uptime Streak',
      description: 'Maintain 100% uptime for all services for 7 consecutive days',
      category: 'uptime',
      icon: 'Clock',
      xpReward: 200,
      runeReward: 25,
      isRepeatable: false,
      requiredProgress: 100,
      triggerCondition: JSON.stringify({
        type: 'uptime',
        duration: 168,
        threshold: 100
      })
    },
    {
      name: '30-Day Uptime Champion',
      description: 'Maintain 99.9% uptime for all services for 30 consecutive days',
      category: 'uptime',
      icon: 'Award',
      xpReward: 500,
      runeReward: 100,
      isRepeatable: false,
      requiredProgress: 100,
      triggerCondition: JSON.stringify({
        type: 'uptime',
        duration: 720,
        threshold: 99.9
      })
    },
    
    // Security Achievements
    {
      name: 'Security Sentinel',
      description: 'Run a complete security scan on all services',
      category: 'security',
      icon: 'Shield',
      xpReward: 75,
      runeReward: 15,
      isRepeatable: true,
      cooldownHours: 168, // Weekly
      requiredProgress: 100,
      triggerCondition: JSON.stringify({
        type: 'security_scan',
        scanType: 'complete'
      })
    },
    {
      name: 'Threat Neutralizer',
      description: 'Successfully mitigate 5 security threats',
      category: 'security',
      icon: 'Shield',
      xpReward: 150,
      runeReward: 30,
      isRepeatable: false,
      requiredProgress: 5,
      triggerCondition: JSON.stringify({
        type: 'threat_mitigation',
        count: 5
      })
    },
    {
      name: 'Fortress Builder',
      description: 'Achieve a security score of 90% or higher',
      category: 'security',
      icon: 'Lock',
      xpReward: 300,
      runeReward: 50,
      isRepeatable: false,
      requiredProgress: 100,
      triggerCondition: JSON.stringify({
        type: 'security_score',
        threshold: 90
      })
    },
    
    // Performance Achievements
    {
      name: 'Performance Wizard',
      description: 'Optimize system performance by 20%',
      category: 'performance',
      icon: 'Zap',
      xpReward: 150,
      runeReward: 30,
      isRepeatable: false,
      requiredProgress: 100,
      triggerCondition: JSON.stringify({
        type: 'performance_improvement',
        threshold: 20
      })
    },
    {
      name: 'Speed Demon',
      description: 'Reduce average response time to under 50ms',
      category: 'performance',
      icon: 'Zap',
      xpReward: 200,
      runeReward: 40,
      isRepeatable: false,
      requiredProgress: 100,
      triggerCondition: JSON.stringify({
        type: 'response_time',
        threshold: 50
      })
    },
    {
      name: 'Resource Guardian',
      description: 'Keep CPU and memory usage below 50% for 24 hours under load',
      category: 'performance',
      icon: 'Activity',
      xpReward: 100,
      runeReward: 20,
      isRepeatable: true,
      cooldownHours: 168, // Weekly
      requiredProgress: 100,
      triggerCondition: JSON.stringify({
        type: 'resource_usage',
        cpu_threshold: 50,
        memory_threshold: 50,
        duration: 24
      })
    },
    
    // System Achievements
    {
      name: 'System Architect',
      description: 'Successfully upgrade all microservices to the latest version',
      category: 'system',
      icon: 'Server',
      xpReward: 200,
      runeReward: 50,
      isRepeatable: true,
      cooldownHours: 720, // Monthly
      requiredProgress: 100,
      triggerCondition: JSON.stringify({
        type: 'system_upgrade',
        scope: 'all'
      })
    },
    {
      name: 'Data Guardian',
      description: 'Set up automated database backups',
      category: 'system',
      icon: 'Database',
      xpReward: 50,
      runeReward: 10,
      isRepeatable: false,
      requiredProgress: 100,
      triggerCondition: JSON.stringify({
        type: 'backup_setup',
        automated: true
      })
    },
    {
      name: 'User Warden',
      description: 'Manage 50+ user accounts',
      category: 'system',
      icon: 'Users',
      xpReward: 100,
      runeReward: 20,
      isRepeatable: false,
      requiredProgress: 100,
      triggerCondition: JSON.stringify({
        type: 'user_management',
        count: 50
      })
    }
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: achievement,
      create: achievement,
    });
  }
  
  console.log(`Seeded ${achievements.length} achievements`);
}

async function seedRewards(prisma: PrismaClient) {
  const rewards = [
    // Boost Rewards
    {
      name: 'Performance Boost',
      description: 'Boost system performance by 15% for 24 hours',
      category: 'boost',
      icon: 'Zap',
      cost: 50,
      duration: 24,
      requiredLevel: 2,
      effectData: {
        type: 'performance_boost',
        percentage: 15
      }
    },
    {
      name: 'Security Shield',
      description: 'Enhance security measures by 20% for 48 hours',
      category: 'boost',
      icon: 'Shield',
      cost: 75,
      duration: 48,
      requiredLevel: 3,
      effectData: {
        type: 'security_boost',
        percentage: 20
      }
    },
    {
      name: 'Resource Optimizer',
      description: 'Reduce resource consumption by 25% for 24 hours',
      category: 'boost',
      icon: 'Activity',
      cost: 100,
      duration: 24,
      requiredLevel: 4,
      effectData: {
        type: 'resource_optimization',
        percentage: 25
      }
    },
    
    // Unlock Rewards
    {
      name: 'Advanced Analytics',
      description: 'Unlock advanced analytics dashboard',
      category: 'unlock',
      icon: 'BarChart',
      cost: 200,
      requiredLevel: 5,
      effectData: {
        type: 'feature_unlock',
        feature: 'advanced_analytics'
      }
    },
    {
      name: 'AI Assistant Pro',
      description: 'Unlock premium AI assistant features',
      category: 'unlock',
      icon: 'Brain',
      cost: 250,
      requiredLevel: 7,
      effectData: {
        type: 'feature_unlock',
        feature: 'ai_assistant_pro'
      }
    },
    {
      name: 'Custom Workflows',
      description: 'Unlock custom workflow creation',
      category: 'unlock',
      icon: 'GitBranch',
      cost: 300,
      requiredLevel: 8,
      effectData: {
        type: 'feature_unlock',
        feature: 'custom_workflows'
      }
    },
    
    // Cosmetic Rewards
    {
      name: 'Neon Interface',
      description: 'Apply neon cyberpunk theme to your interface',
      category: 'cosmetic',
      icon: 'Sparkles',
      cost: 100,
      requiredLevel: 3,
      effectData: {
        type: 'theme',
        theme: 'neon_cyberpunk'
      }
    },
    {
      name: 'Holographic Projections',
      description: 'Add holographic effects to your dashboard',
      category: 'cosmetic',
      icon: 'Sparkles',
      cost: 150,
      requiredLevel: 5,
      effectData: {
        type: 'visual_effect',
        effect: 'holographic'
      }
    },
    {
      name: 'Custom Avatar Frame',
      description: 'Unique animated frame for your profile avatar',
      category: 'cosmetic',
      icon: 'User',
      cost: 125,
      requiredLevel: 4,
      effectData: {
        type: 'avatar_frame',
        frame: 'animated_arcane'
      }
    },
    
    // System Rewards
    {
      name: 'Auto-Recovery',
      description: 'Enable automatic system recovery for failed services',
      category: 'system',
      icon: 'RefreshCw',
      cost: 300,
      requiredLevel: 6,
      effectData: {
        type: 'system_feature',
        feature: 'auto_recovery'
      }
    },
    {
      name: 'Priority Processing',
      description: 'Your operations get priority in the processing queue',
      category: 'system',
      icon: 'Zap',
      cost: 200,
      duration: 168, // 1 week
      requiredLevel: 5,
      effectData: {
        type: 'queue_priority',
        level: 'high'
      }
    },
    {
      name: 'Extended Logging',
      description: 'Access to extended system logs and analytics',
      category: 'system',
      icon: 'FileText',
      cost: 150,
      requiredLevel: 4,
      effectData: {
        type: 'logging',
        retention: 'extended',
        detail: 'high'
      }
    }
  ];

  for (const reward of rewards) {
    await prisma.reward.upsert({
      where: { name: reward.name },
      update: reward,
      create: reward,
    });
  }
  
  console.log(`Seeded ${rewards.length} rewards`);
}

async function initializeUserXP(prisma: PrismaClient) {
  // Get all users
  const users = await prisma.user.findMany({
    where: {
      userXP: null // Only users without XP records
    }
  });
  
  // Create UserXP records for each user
  for (const user of users) {
    await prisma.userXP.create({
      data: {
        userId: user.id,
        level: 1,
        currentXP: 0,
        totalXP: 0,
        runes: 50, // Starting runes
        streakDays: 0
      }
    });
  }
  
  console.log(`Initialized UserXP for ${users.length} users`);
}
