/**
 * Seed file for User Templates
 * 
 * This file creates template users with different roles:
 * - Admin users for system management
 * - Operator users for standard operations
 * - Agent users for AI agent operations
 * 
 * @tag demo-data
 * @tag users
 * @tag templates
 */

import type { PrismaClient, User, Role, Organization } from '@prisma/client';
import type { SeedConfig } from './index';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcryptjs';

// Define user templates
const userTemplates = [
  {
    email: 'admin@cauldron.ai',
    username: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    roleName: 'Admin',
    organizationName: 'Cauldron System',
    password: 'Admin123!', // Will be hashed before storage
    isEmailVerified: true,
    isActive: true
  },
  {
    email: 'operator@cauldron.ai',
    username: 'operator',
    firstName: 'Operator',
    lastName: 'User',
    roleName: 'Operator',
    organizationName: 'Cauldron System',
    password: 'Operator123!', // Will be hashed before storage
    isEmailVerified: true,
    isActive: true
  },
  {
    email: 'agent@cauldron.ai',
    username: 'agent',
    firstName: 'Agent',
    lastName: 'User',
    roleName: 'Agent',
    organizationName: 'Cauldron System',
    password: 'Agent123!', // Will be hashed before storage
    isEmailVerified: true,
    isActive: true
  },
  {
    email: 'demo@technova-example.com',
    username: 'technova_demo',
    firstName: 'Alex',
    lastName: 'Chen',
    roleName: 'Operator',
    organizationName: 'TechNova Solutions',
    password: 'Demo123!', // Will be hashed before storage
    isEmailVerified: true,
    isActive: true
  },
  {
    email: 'demo@globalfinance-example.com',
    username: 'finance_demo',
    firstName: 'Morgan',
    lastName: 'Stanley',
    roleName: 'Operator',
    organizationName: 'Global Finance Group',
    password: 'Demo123!', // Will be hashed before storage
    isEmailVerified: true,
    isActive: true
  },
  {
    email: 'demo@healthplus-example.com',
    username: 'health_demo',
    firstName: 'Dana',
    lastName: 'Medina',
    roleName: 'Operator',
    organizationName: 'HealthPlus Medical',
    password: 'Demo123!', // Will be hashed before storage
    isEmailVerified: true,
    isActive: true
  },
  {
    email: 'demo@ecosmart-example.com',
    username: 'eco_demo',
    firstName: 'Jordan',
    lastName: 'Green',
    roleName: 'Operator',
    organizationName: 'EcoSmart Energy',
    password: 'Demo123!', // Will be hashed before storage
    isEmailVerified: true,
    isActive: true
  }
];

interface SeedUserDependencies {
  roles: Record<string, Role>;
  organizations: Record<string, Organization>;
}

export async function seedUserTemplates(
  prisma: PrismaClient, 
  config: SeedConfig,
  dependencies: SeedUserDependencies
) {
  console.log('👤 Seeding user templates...');
  
  const users: Record<string, User> = {};
  
  // Determine which users to create based on environment
  let templatesToCreate = userTemplates;
  
  if (config.demoDataVolume === 'none') {
    // In production, only create system users
    templatesToCreate = userTemplates.slice(0, 3); // Admin, Operator, Agent
  } else if (config.demoDataVolume === 'minimal') {
    // In minimal mode, create system users + 1 demo user
    templatesToCreate = userTemplates.slice(0, 4);
  } else if (config.demoDataVolume === 'moderate') {
    // In moderate mode, create system users + 3 demo users
    templatesToCreate = userTemplates.slice(0, 6);
  }
  
  // Create users
  for (const template of templatesToCreate) {
    // Skip if organization doesn't exist (environment-specific)
    if (!dependencies.organizations[template.organizationName]) {
      if (config.logLevel === 'verbose') {
        console.log(`  ↳ Skipping user ${template.email} - organization ${template.organizationName} not found`);
      }
      continue;
    }
    
    // Skip if role doesn't exist (should never happen)
    if (!dependencies.roles[template.roleName]) {
      if (config.logLevel === 'verbose') {
        console.log(`  ↳ Skipping user ${template.email} - role ${template.roleName} not found`);
      }
      continue;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(template.password, 10);
    
    const user = await prisma.user.upsert({
      where: { email: template.email },
      update: {
        username: template.username,
        firstName: template.firstName,
        lastName: template.lastName,
        roleId: dependencies.roles[template.roleName].id,
        organizationId: dependencies.organizations[template.organizationName].id,
        isEmailVerified: template.isEmailVerified,
        isActive: template.isActive
      },
      create: {
        email: template.email,
        username: template.username,
        firstName: template.firstName,
        lastName: template.lastName,
        password: hashedPassword,
        roleId: dependencies.roles[template.roleName].id,
        organizationId: dependencies.organizations[template.organizationName].id,
        isEmailVerified: template.isEmailVerified,
        isActive: template.isActive
      }
    });
    
    users[template.email] = user;
    
    if (config.logLevel === 'verbose') {
      console.log(`  ↳ Created user: ${template.email} (${template.roleName})`);
    }
  }
  
  // Generate additional random users if needed for development
  if (config.environment === 'development' && config.demoDataVolume === 'full') {
    const randomUserCount = 10;
    console.log(`  ↳ Generating ${randomUserCount} additional random users for development`);
    
    const randomUsers = await generateRandomUsers(
      prisma, 
      randomUserCount, 
      dependencies.roles['Operator'].id,
      Object.values(dependencies.organizations).map(org => org.id)
    );
    
    for (const user of randomUsers) {
      users[user.email!] = user;
    }
  }
  
  console.log(`✅ Created ${Object.keys(users).length} users`);
  
  return { users };
}

// Helper function to generate random users for development
async function generateRandomUsers(
  prisma: PrismaClient, 
  count: number, 
  defaultRoleId: string,
  organizationIds: string[]
): Promise<User[]> {
  const users: User[] = [];
  
  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName, provider: 'example.com' });
    const username = faker.internet.userName({ firstName, lastName });
    
    // Randomly select an organization
    const organizationId = faker.helpers.arrayElement(organizationIds);
    
    const user = await prisma.user.create({
      data: {
        email,
        username,
        firstName,
        lastName,
        password: await bcrypt.hash('Password123!', 10),
        roleId: defaultRoleId,
        organizationId,
        isEmailVerified: true,
        isActive: true,
        avatarUrl: faker.image.avatar()
      }
    });
    
    users.push(user);
  }
  
  return users;
}
