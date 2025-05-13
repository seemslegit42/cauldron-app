/**
 * Main seed orchestrator for Cauldron App
 *
 * This file coordinates the seeding of all data groups and handles environment-specific configurations.
 * Run with: npx prisma db seed
 *
 * Environment variants:
 * - DEV: Full set of demo data for local development (default)
 * - STAGING: Reduced set of demo data for testing
 * - PRODUCTION: Only essential system data, no demo content
 *
 * Set environment with: NODE_ENV=production npx prisma db seed
 */

import type { PrismaClient } from '@prisma/client';
import { seedRolesAndPermissions } from './roles-permissions';
import { seedOrganizations } from './organizations';
import { seedDefaultAgents } from './agents';
import { seedUserTemplates } from './users';
import { seedModuleConfigs } from './module-configs';

import { seedTrustBadges } from '../seed/trustBadges';
import { seedGamification } from './gamification';

// Environment configuration
export type SeedEnvironment = 'development' | 'staging' | 'production';

export interface SeedConfig {
  environment: SeedEnvironment;
  includeTestData: boolean;
  demoDataVolume: 'none' | 'minimal' | 'moderate' | 'full';
  logLevel: 'silent' | 'minimal' | 'verbose';
}

// Get environment configuration
function getSeedConfig(): SeedConfig {
  const env = (process.env.NODE_ENV || 'development') as SeedEnvironment;

  const config: Record<SeedEnvironment, SeedConfig> = {
    development: {
      environment: 'development',
      includeTestData: true,
      demoDataVolume: 'full',
      logLevel: 'verbose'
    },
    staging: {
      environment: 'staging',
      includeTestData: true,
      demoDataVolume: 'moderate',
      logLevel: 'minimal'
    },
    production: {
      environment: 'production',
      includeTestData: false,
      demoDataVolume: 'none',
      logLevel: 'minimal'
    }
  };

  return config[env];
}

// Main seed function
export async function seedDatabase(prisma: PrismaClient) {
  const config = getSeedConfig();
  console.log(`🌱 Starting database seed in ${config.environment.toUpperCase()} environment`);

  try {
    // Always seed essential system data
    const { roles, permissions } = await seedRolesAndPermissions(prisma, config);
    const { organizations } = await seedOrganizations(prisma, config);
    const { agents } = await seedDefaultAgents(prisma, config);
    const { users } = await seedUserTemplates(prisma, config, { roles, organizations });
    const { moduleConfigs } = await seedModuleConfigs(prisma, config, { organizations });

    // Seed trust badges
    await seedTrustBadges(prisma);

    // Seed gamification data
    await seedGamification(prisma);

    console.log('✅ Database seeding completed successfully');

    // Return seeded data for potential use in tests or other operations
    return {
      roles,
      permissions,
      organizations,
      users,
      agents,
      moduleConfigs
    };
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

// Export for use in Wasp's db.seeds configuration
export default seedDatabase;
