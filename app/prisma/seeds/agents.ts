/**
 * Seed file for Default AI Agents
 * 
 * This file creates template AI agents for different use cases:
 * - System agents for core functionality
 * - Demo agents for different modules and capabilities
 * 
 * @tag demo-data
 * @tag ai-agents
 * @tag templates
 */

import type { PrismaClient, AI_Agent } from '@prisma/client';
import type { SeedConfig } from './index';

// Define agent templates
const agentTemplates = [
  {
    name: 'Cauldron Prime',
    description: 'Primary system orchestration agent',
    type: 'orchestration',
    configuration: {
      role: 'System Orchestrator',
      goal: 'Coordinate and manage all system agents and modules',
      capabilities: [
        'Agent coordination',
        'Task delegation',
        'System monitoring',
        'Error handling'
      ],
      backstory: 'Cauldron Prime is the central intelligence of the Cauldron system, designed to orchestrate all other agents and ensure smooth operation of the entire platform.',
      model: 'llama3-70b-8192',
      temperature: 0.7,
      maxTokens: 2000
    },
    isActive: true,
    isSystem: true
  },
  {
    name: 'Athena',
    description: 'Business intelligence and analytics agent',
    type: 'analysis',
    configuration: {
      role: 'Business Analyst',
      goal: 'Analyze business data and provide actionable insights',
      capabilities: [
        'Data analysis',
        'Trend identification',
        'Report generation',
        'Recommendation engine'
      ],
      backstory: 'Athena is designed to transform raw business data into meaningful insights, helping organizations make data-driven decisions.',
      model: 'llama3-70b-8192',
      temperature: 0.3,
      maxTokens: 1500
    },
    isActive: true,
    isSystem: false
  },
  {
    name: 'Obelisk',
    description: 'OSINT and external intelligence gathering agent',
    type: 'perception',
    configuration: {
      role: 'Intelligence Gatherer',
      goal: 'Collect and analyze external information from various sources',
      capabilities: [
        'Web scraping',
        'Social media monitoring',
        'News analysis',
        'Competitive intelligence'
      ],
      backstory: 'Obelisk constantly scans the digital landscape for relevant information, providing organizations with awareness of external factors that might impact their operations.',
      model: 'llama3-70b-8192',
      temperature: 0.5,
      maxTokens: 1800
    },
    isActive: true,
    isSystem: false
  },
  {
    name: 'Phantom',
    description: 'Cybersecurity and threat detection agent',
    type: 'security',
    configuration: {
      role: 'Security Analyst',
      goal: 'Identify and mitigate security threats',
      capabilities: [
        'Threat detection',
        'Vulnerability assessment',
        'Security monitoring',
        'Incident response'
      ],
      backstory: 'Phantom works silently in the background, constantly monitoring for security threats and vulnerabilities to protect organizational assets.',
      model: 'llama3-70b-8192',
      temperature: 0.2,
      maxTokens: 1500
    },
    isActive: true,
    isSystem: false
  },
  {
    name: 'Forge',
    description: 'Content creation and management agent',
    type: 'creation',
    configuration: {
      role: 'Content Creator',
      goal: 'Generate and optimize various types of content',
      capabilities: [
        'Text generation',
        'Image prompt creation',
        'Content optimization',
        'Multi-format adaptation'
      ],
      backstory: 'Forge transforms ideas into polished content across multiple formats, helping organizations maintain a consistent and engaging presence.',
      model: 'llama3-70b-8192',
      temperature: 0.8,
      maxTokens: 2000
    },
    isActive: true,
    isSystem: false
  }
];

export async function seedDefaultAgents(prisma: PrismaClient, config: SeedConfig) {
  console.log('🤖 Seeding default AI agents...');
  
  const agents: Record<string, AI_Agent> = {};
  
  // Find or create system user for system agents
  let systemUser = await prisma.user.findFirst({
    where: { email: 'system@cauldron.ai' }
  });
  
  if (!systemUser) {
    systemUser = await prisma.user.create({
      data: {
        email: 'system@cauldron.ai',
        username: 'system',
        firstName: 'System',
        lastName: 'User',
        isActive: true,
        isEmailVerified: true
      }
    });
    
    if (config.logLevel === 'verbose') {
      console.log('  ↳ Created system user for agent ownership');
    }
  }
  
  // Determine which agents to create based on environment
  let templatesToCreate = agentTemplates;
  
  if (config.demoDataVolume === 'none') {
    // In production, only create system agents
    templatesToCreate = agentTemplates.filter(agent => agent.isSystem);
  } else if (config.demoDataVolume === 'minimal') {
    // In minimal mode, create system agents + 1 demo agent
    templatesToCreate = agentTemplates.filter(agent => agent.isSystem || agent.name === 'Athena');
  } else if (config.demoDataVolume === 'moderate') {
    // In moderate mode, create system agents + 3 demo agents
    templatesToCreate = agentTemplates.filter(agent => 
      agent.isSystem || ['Athena', 'Obelisk', 'Phantom'].includes(agent.name)
    );
  }
  
  // Create agents
  for (const template of templatesToCreate) {
    const { isSystem, ...agentData } = template;
    
    const agent = await prisma.aI_Agent.upsert({
      where: {
        userId_name: {
          userId: systemUser.id,
          name: template.name
        }
      },
      update: {
        description: agentData.description,
        type: agentData.type,
        configuration: agentData.configuration,
        isActive: agentData.isActive
      },
      create: {
        ...agentData,
        userId: systemUser.id
      }
    });
    
    agents[template.name] = agent;
    
    if (config.logLevel === 'verbose') {
      console.log(`  ↳ Created agent: ${template.name}`);
    }
  }
  
  console.log(`✅ Created ${Object.keys(agents).length} AI agents`);
  
  return { agents };
}
