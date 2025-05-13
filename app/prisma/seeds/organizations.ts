/**
 * Seed file for Organizations
 * 
 * This file creates demo organizations with different configurations:
 * - Default organization for system use
 * - Demo organizations for different industries and use cases
 * 
 * @tag demo-data
 * @tag organizations
 */

import type { PrismaClient, Organization } from '@prisma/client';
import type { SeedConfig } from './index';

// Define organization templates
const organizationTemplates = [
  {
    name: 'Cauldron System',
    description: 'System default organization',
    logoUrl: 'https://example.com/logos/cauldron.png',
    website: 'https://cauldron.ai',
    industry: 'Technology',
    size: '11-50',
    isActive: true,
    isSystem: true
  },
  {
    name: 'TechNova Solutions',
    description: 'Software development and AI consulting',
    logoUrl: 'https://example.com/logos/technova.png',
    website: 'https://technova-example.com',
    industry: 'Technology',
    size: '51-200',
    isActive: true,
    isSystem: false
  },
  {
    name: 'Global Finance Group',
    description: 'Financial services and investment management',
    logoUrl: 'https://example.com/logos/globalfinance.png',
    website: 'https://globalfinance-example.com',
    industry: 'Finance',
    size: '501-1000',
    isActive: true,
    isSystem: false
  },
  {
    name: 'HealthPlus Medical',
    description: 'Healthcare provider and medical research',
    logoUrl: 'https://example.com/logos/healthplus.png',
    website: 'https://healthplus-example.com',
    industry: 'Healthcare',
    size: '201-500',
    isActive: true,
    isSystem: false
  },
  {
    name: 'EcoSmart Energy',
    description: 'Renewable energy and sustainability solutions',
    logoUrl: 'https://example.com/logos/ecosmart.png',
    website: 'https://ecosmart-example.com',
    industry: 'Energy',
    size: '51-200',
    isActive: true,
    isSystem: false
  }
];

export async function seedOrganizations(prisma: PrismaClient, config: SeedConfig) {
  console.log('🏢 Seeding organizations...');
  
  const organizations: Record<string, Organization> = {};
  
  // Determine which organizations to create based on environment
  let templatesToCreate = organizationTemplates;
  
  if (config.demoDataVolume === 'none') {
    // In production, only create the system organization
    templatesToCreate = organizationTemplates.filter(org => org.isSystem);
  } else if (config.demoDataVolume === 'minimal') {
    // In minimal mode, create system org + 1 demo org
    templatesToCreate = organizationTemplates.slice(0, 2);
  } else if (config.demoDataVolume === 'moderate') {
    // In moderate mode, create system org + 3 demo orgs
    templatesToCreate = organizationTemplates.slice(0, 4);
  }
  
  // Create organizations
  for (const template of templatesToCreate) {
    const { isSystem, ...orgData } = template;
    
    const organization = await prisma.organization.upsert({
      where: { 
        // Use a compound unique constraint if available, or fallback to name
        // This is a simplification - in production you might want a more robust approach
        name: template.name 
      },
      update: orgData,
      create: orgData
    });
    
    organizations[template.name] = organization;
    
    if (config.logLevel === 'verbose') {
      console.log(`  ↳ Created organization: ${template.name}`);
    }
    
    // Create global settings for each organization
    await prisma.globalSettings.upsert({
      where: { 
        organizationId: organization.id 
      },
      update: {
        theme: 'system',
        language: 'en',
        notificationsEnabled: true,
        aiFeatures: {
          enabledModels: ['llama3-8b-8192', 'llama3-70b-8192'],
          defaultModel: 'llama3-8b-8192',
          maxTokensPerRequest: 2000,
          sentientLoopEnabled: true
        }
      },
      create: {
        organizationId: organization.id,
        theme: 'system',
        language: 'en',
        notificationsEnabled: true,
        aiFeatures: {
          enabledModels: ['llama3-8b-8192', 'llama3-70b-8192'],
          defaultModel: 'llama3-8b-8192',
          maxTokensPerRequest: 2000,
          sentientLoopEnabled: true
        }
      }
    });
  }
  
  console.log(`✅ Created ${Object.keys(organizations).length} organizations`);
  
  return { organizations };
}
