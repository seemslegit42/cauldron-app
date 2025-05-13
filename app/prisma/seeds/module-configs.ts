/**
 * Seed file for Module Configurations
 * 
 * This file creates default configurations for different modules:
 * - Athena (Business Intelligence)
 * - Obelisk (OSINT)
 * - Phantom (Security)
 * - Forge (Content Creation)
 * 
 * @tag demo-data
 * @tag module-configs
 */

import type { PrismaClient, ModuleConfig, Organization } from '@prisma/client';
import type { SeedConfig } from './index';

// Define module configuration templates
const moduleConfigTemplates = [
  {
    name: 'Athena',
    description: 'Business intelligence and analytics module',
    type: 'analysis',
    configuration: {
      enabledFeatures: [
        'revenue_tracking',
        'market_analysis',
        'competitor_monitoring',
        'performance_metrics',
        'trend_analysis'
      ],
      dashboards: [
        {
          name: 'Executive Overview',
          default: true,
          widgets: [
            { type: 'revenue_chart', position: { x: 0, y: 0, w: 6, h: 4 } },
            { type: 'key_metrics', position: { x: 6, y: 0, w: 6, h: 4 } },
            { type: 'market_trends', position: { x: 0, y: 4, w: 12, h: 4 } }
          ]
        },
        {
          name: 'Sales Performance',
          default: false,
          widgets: [
            { type: 'sales_funnel', position: { x: 0, y: 0, w: 4, h: 6 } },
            { type: 'conversion_rates', position: { x: 4, y: 0, w: 8, h: 3 } },
            { type: 'sales_by_region', position: { x: 4, y: 3, w: 8, h: 3 } }
          ]
        }
      ],
      dataConnectors: [
        { type: 'database', enabled: true },
        { type: 'api', enabled: true },
        { type: 'file_import', enabled: true }
      ],
      alertThresholds: {
        revenue_drop: 10,
        customer_churn: 5,
        market_shift: 15
      }
    },
    isActive: true
  },
  {
    name: 'Obelisk',
    description: 'OSINT and external intelligence gathering module',
    type: 'perception',
    configuration: {
      enabledFeatures: [
        'web_monitoring',
        'social_media_tracking',
        'news_analysis',
        'competitor_intelligence',
        'market_sentiment'
      ],
      monitoringSources: [
        { type: 'web', enabled: true, refreshInterval: 3600 },
        { type: 'social_media', enabled: true, refreshInterval: 1800 },
        { type: 'news', enabled: true, refreshInterval: 7200 },
        { type: 'dark_web', enabled: false, refreshInterval: 86400 }
      ],
      alertPriorities: {
        critical: { color: 'red', notificationChannels: ['email', 'dashboard'] },
        high: { color: 'orange', notificationChannels: ['dashboard'] },
        medium: { color: 'yellow', notificationChannels: ['dashboard'] },
        low: { color: 'blue', notificationChannels: ['dashboard'] }
      },
      keywordGroups: [
        {
          name: 'Brand Mentions',
          keywords: ['Cauldron', 'Cauldron AI', 'Sentient Loop'],
          priority: 'high'
        },
        {
          name: 'Competitors',
          keywords: ['CompetitorX', 'CompetitorY', 'CompetitorZ'],
          priority: 'medium'
        },
        {
          name: 'Industry Trends',
          keywords: ['AI orchestration', 'agent systems', 'business intelligence'],
          priority: 'low'
        }
      ]
    },
    isActive: true
  },
  {
    name: 'Phantom',
    description: 'Cybersecurity and threat detection module',
    type: 'security',
    configuration: {
      enabledFeatures: [
        'threat_detection',
        'vulnerability_scanning',
        'incident_response',
        'security_monitoring',
        'compliance_checks'
      ],
      scanSchedules: [
        { type: 'vulnerability', frequency: 'daily', time: '01:00' },
        { type: 'compliance', frequency: 'weekly', day: 'Monday', time: '03:00' },
        { type: 'full_system', frequency: 'monthly', day: 1, time: '02:00' }
      ],
      alertLevels: {
        critical: { autoRemediate: true, notifyChannels: ['email', 'sms', 'dashboard'] },
        high: { autoRemediate: false, notifyChannels: ['email', 'dashboard'] },
        medium: { autoRemediate: false, notifyChannels: ['dashboard'] },
        low: { autoRemediate: false, notifyChannels: ['dashboard'] }
      },
      complianceFrameworks: [
        { name: 'GDPR', enabled: true },
        { name: 'HIPAA', enabled: false },
        { name: 'SOC2', enabled: true },
        { name: 'ISO27001', enabled: false }
      ]
    },
    isActive: true
  },
  {
    name: 'Forge',
    description: 'Content creation and management module',
    type: 'creation',
    configuration: {
      enabledFeatures: [
        'text_generation',
        'image_prompting',
        'content_optimization',
        'multi_format_adaptation',
        'brand_consistency'
      ],
      contentTypes: [
        { type: 'blog_post', enabled: true, templates: ['standard', 'listicle', 'how-to'] },
        { type: 'social_media', enabled: true, templates: ['announcement', 'engagement', 'promotion'] },
        { type: 'email', enabled: true, templates: ['newsletter', 'promotional', 'transactional'] },
        { type: 'documentation', enabled: true, templates: ['user_guide', 'api_docs', 'tutorial'] }
      ],
      brandVoice: {
        tone: 'professional',
        personality: 'helpful',
        values: ['innovation', 'reliability', 'expertise']
      },
      workflowSteps: [
        'draft_creation',
        'review',
        'optimization',
        'approval',
        'scheduling',
        'publication'
      ]
    },
    isActive: true
  }
];

interface SeedModuleConfigDependencies {
  organizations: Record<string, Organization>;
}

export async function seedModuleConfigs(
  prisma: PrismaClient, 
  config: SeedConfig,
  dependencies: SeedModuleConfigDependencies
) {
  console.log('⚙️ Seeding module configurations...');
  
  const moduleConfigs: Record<string, ModuleConfig> = {};
  
  // Get the default organization
  const defaultOrg = dependencies.organizations['Cauldron System'];
  
  if (!defaultOrg) {
    console.warn('⚠️ Default organization not found, skipping module configurations');
    return { moduleConfigs };
  }
  
  // Determine which module configs to create based on environment
  let templatesToCreate = moduleConfigTemplates;
  
  if (config.demoDataVolume === 'none') {
    // In production, only create essential modules
    templatesToCreate = moduleConfigTemplates.filter(m => ['Athena', 'Phantom'].includes(m.name));
  } else if (config.demoDataVolume === 'minimal') {
    // In minimal mode, create only Athena
    templatesToCreate = moduleConfigTemplates.filter(m => m.name === 'Athena');
  } else if (config.demoDataVolume === 'moderate') {
    // In moderate mode, create 3 modules
    templatesToCreate = moduleConfigTemplates.filter(m => 
      ['Athena', 'Obelisk', 'Phantom'].includes(m.name)
    );
  }
  
  // Create module configurations for the default organization
  for (const template of templatesToCreate) {
    const moduleConfig = await prisma.moduleConfig.upsert({
      where: {
        organizationId_name: {
          organizationId: defaultOrg.id,
          name: template.name
        }
      },
      update: {
        description: template.description,
        type: template.type,
        configuration: template.configuration,
        isActive: template.isActive
      },
      create: {
        ...template,
        organizationId: defaultOrg.id
      }
    });
    
    moduleConfigs[template.name] = moduleConfig;
    
    if (config.logLevel === 'verbose') {
      console.log(`  ↳ Created module config: ${template.name}`);
    }
  }
  
  // For demo organizations in development/staging, create some module configs
  if (config.demoDataVolume !== 'none') {
    for (const [orgName, org] of Object.entries(dependencies.organizations)) {
      // Skip the default organization (already handled)
      if (orgName === 'Cauldron System') continue;
      
      // Create Athena module for all organizations
      if (dependencies.organizations[orgName]) {
        const athenaTemplate = moduleConfigTemplates.find(m => m.name === 'Athena');
        
        if (athenaTemplate) {
          const moduleConfig = await prisma.moduleConfig.upsert({
            where: {
              organizationId_name: {
                organizationId: org.id,
                name: athenaTemplate.name
              }
            },
            update: {
              description: athenaTemplate.description,
              type: athenaTemplate.type,
              configuration: athenaTemplate.configuration,
              isActive: athenaTemplate.isActive
            },
            create: {
              ...athenaTemplate,
              organizationId: org.id
            }
          });
          
          moduleConfigs[`${orgName}-${athenaTemplate.name}`] = moduleConfig;
          
          if (config.logLevel === 'verbose') {
            console.log(`  ↳ Created module config: ${athenaTemplate.name} for ${orgName}`);
          }
        }
      }
    }
  }
  
  console.log(`✅ Created ${Object.keys(moduleConfigs).length} module configurations`);
  
  return { moduleConfigs };
}
