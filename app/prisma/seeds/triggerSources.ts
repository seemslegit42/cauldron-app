/**
 * Seed data for trigger sources
 */
import { prisma } from 'wasp/server';
import { TriggerSourceType } from '@prisma/client';

/**
 * Seed trigger sources
 */
export const seedTriggerSources = async () => {
  console.log('Seeding trigger sources...');

  // Define the trigger sources
  const triggerSources = [
    // Scheduled Jobs
    {
      name: 'OSINT Scan Job',
      description: 'Scheduled OSINT scanning job that runs every 6 hours',
      type: TriggerSourceType.SCHEDULED_JOB,
      moduleId: 'obelisk',
      configuration: {
        schedule: '0 */6 * * *',
        jobName: 'osintScanJob',
      },
    },
    {
      name: 'Alert Rules Evaluation',
      description: 'Scheduled job that evaluates alert rules every 15 minutes',
      type: TriggerSourceType.SCHEDULED_JOB,
      moduleId: 'sentinel',
      configuration: {
        schedule: '*/15 * * * *',
        jobName: 'evaluateAlertRulesJob',
      },
    },
    {
      name: 'Log Rotation',
      description: 'Scheduled job that rotates logs daily at midnight',
      type: TriggerSourceType.SCHEDULED_JOB,
      moduleId: 'system',
      configuration: {
        schedule: '0 0 * * *',
        jobName: 'logRotationJob',
      },
    },
    {
      name: 'Metrics Regeneration',
      description: 'Scheduled job that regenerates metrics daily at 5 AM',
      type: TriggerSourceType.SCHEDULED_JOB,
      moduleId: 'athena',
      configuration: {
        schedule: '0 5 * * *',
        jobName: 'metricsRegenerationJob',
      },
    },

    // OSINT Scans
    {
      name: 'Domain Monitoring Scan',
      description: 'OSINT scan for monitoring domains',
      type: TriggerSourceType.OSINT_SCAN,
      moduleId: 'obelisk',
      configuration: {
        scanType: 'domain',
      },
    },
    {
      name: 'Social Media Monitoring',
      description: 'OSINT scan for monitoring social media',
      type: TriggerSourceType.OSINT_SCAN,
      moduleId: 'obelisk',
      configuration: {
        scanType: 'social_media',
      },
    },
    {
      name: 'Dark Web Monitoring',
      description: 'OSINT scan for monitoring dark web',
      type: TriggerSourceType.OSINT_SCAN,
      moduleId: 'obelisk',
      configuration: {
        scanType: 'dark_web',
      },
    },

    // Webhooks
    {
      name: 'OSINT Webhook',
      description: 'Webhook for OSINT findings',
      type: TriggerSourceType.WEBHOOK,
      moduleId: 'obelisk',
      configuration: {
        events: ['new_finding', 'new_alert'],
      },
    },
    {
      name: 'Payment Webhook',
      description: 'Webhook for payment events',
      type: TriggerSourceType.WEBHOOK,
      moduleId: 'payment',
      configuration: {
        events: ['subscription_created', 'subscription_updated', 'subscription_cancelled'],
      },
    },

    // User Inputs
    {
      name: 'Arcana Command',
      description: 'User command input in Arcana',
      type: TriggerSourceType.USER_INPUT,
      moduleId: 'arcana',
      configuration: {
        inputType: 'command',
      },
    },
    {
      name: 'Cauldron Prime Question',
      description: 'User question to Cauldron Prime',
      type: TriggerSourceType.USER_INPUT,
      moduleId: 'cauldron-prime',
      configuration: {
        inputType: 'question',
      },
    },
    {
      name: 'Forgeflow Workflow Execution',
      description: 'User-initiated workflow execution in Forgeflow',
      type: TriggerSourceType.USER_INPUT,
      moduleId: 'forgeflow',
      configuration: {
        inputType: 'workflow_execution',
      },
    },

    // System Events
    {
      name: 'Security Alert',
      description: 'Security alert from Sentinel',
      type: TriggerSourceType.SYSTEM_EVENT,
      moduleId: 'sentinel',
      configuration: {
        eventType: 'security_alert',
      },
    },
    {
      name: 'Business Insight',
      description: 'Business insight from Athena',
      type: TriggerSourceType.SYSTEM_EVENT,
      moduleId: 'athena',
      configuration: {
        eventType: 'business_insight',
      },
    },

    // API Calls
    {
      name: 'External API Integration',
      description: 'Integration with external APIs',
      type: TriggerSourceType.API_CALL,
      moduleId: 'system',
      configuration: {
        apiType: 'external',
      },
    },

    // Agent Actions
    {
      name: 'Agent Escalation',
      description: 'Escalation from an agent',
      type: TriggerSourceType.AGENT_ACTION,
      moduleId: 'system',
      configuration: {
        actionType: 'escalation',
      },
    },

    // Alert Rules
    {
      name: 'Log Alert Rule',
      description: 'Alert rule for logs',
      type: TriggerSourceType.ALERT_RULE,
      moduleId: 'system',
      configuration: {
        ruleType: 'log',
      },
    },
    {
      name: 'Security Alert Rule',
      description: 'Alert rule for security events',
      type: TriggerSourceType.ALERT_RULE,
      moduleId: 'sentinel',
      configuration: {
        ruleType: 'security',
      },
    },
  ];

  // Create the trigger sources
  for (const source of triggerSources) {
    await prisma.triggerSource.upsert({
      where: {
        name_type: {
          name: source.name,
          type: source.type,
        },
      },
      update: {
        description: source.description,
        moduleId: source.moduleId,
        configuration: source.configuration,
        isActive: true,
      },
      create: {
        name: source.name,
        description: source.description,
        type: source.type,
        moduleId: source.moduleId,
        configuration: source.configuration,
        isActive: true,
      },
    });
  }

  console.log(`Seeded ${triggerSources.length} trigger sources`);
};
