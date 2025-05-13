/**
 * Athena Module Operations
 *
 * This file contains server-side operations for the Athena business intelligence module.
 */

import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import { z } from 'zod';
import { ensureArgsSchemaOrThrowHttpError } from '@src/server/validation';
import { LoggingService } from '@src/shared/services/logging';
import { requirePermission } from '@src/api/middleware/rbac';
import { applyFieldVisibility } from '@src/api/middleware/fieldAccess';
import {
  BusinessMetric,
  BusinessInsight,
  BusinessRecommendation,
  CampaignSuggestion,
  StrategicDecision,
  StrategicRecommendation,
  MarketData,
  ExecutiveSummary,
  NotionExportOptions,
  TimeframeOption,
  MetricCategory,
  ImpactLevel,
  ConfidenceLevel,
  CampaignStatus,
  ExecutiveAdvisorTone,
  ExecutiveAdvisorOptions,
} from '../types';
import {
  generateCampaignSuggestions,
  generateStrategicRecommendations,
  generateExecutiveSummary,
  generateInsights,
  generateRecommendations,
} from '../services/strategicAnalysisService';
import {
  generateMemoryAwareInsights,
  generateMemoryAwareRecommendations,
  generateExecutiveSummaryWithHistory,
  trackRecommendationEffectiveness,
} from '../services/memoryAwareBusinessIntelligenceService';
import { exportToNotionPage } from '../services/notionExportService';

// Schema for business metrics request
const businessMetricsSchema = z.object({
  timeframe: z.enum(['day', 'week', 'month', 'quarter', 'year']).default('week'),
  categories: z.array(z.string()).optional(),
});

// Schema for business insights request
const businessInsightsSchema = z.object({
  timeframe: z.enum(['day', 'week', 'month', 'quarter', 'year']).default('week'),
  categories: z.array(z.string()).optional(),
});

// Schema for campaign suggestions request
const campaignSuggestionsSchema = z.object({
  timeframe: z.enum(['day', 'week', 'month', 'quarter', 'year']).default('week'),
  limit: z.number().min(1).max(10).default(5),
});

// Schema for strategic decisions request
const strategicDecisionsSchema = z.object({
  timeframe: z.enum(['day', 'week', 'month', 'quarter', 'year']).default('week'),
  limit: z.number().min(1).max(10).default(5),
});

// Schema for market data request
const marketDataSchema = z.object({
  timeframe: z.enum(['day', 'week', 'month', 'quarter', 'year']).default('week'),
  categories: z.array(z.string()).optional(),
});

// Schema for strategic recommendations request
const strategicRecommendationsSchema = z.object({
  timeframe: z.enum(['day', 'week', 'month', 'quarter', 'year']).default('week'),
  limit: z.number().min(1).max(10).default(5),
});

// Schema for executive summary request
const executiveSummarySchema = z.object({
  timeframe: z.enum(['day', 'week', 'month', 'quarter', 'year']).default('week'),
});

// Schema for executive advisor request
const executiveAdvisorSchema = z.object({
  timeframe: z.enum(['day', 'week', 'month', 'quarter', 'year']).default('week'),
  communicationStyle: z.enum(['aggressive', 'conservative', 'balanced']).default('balanced'),
  focusArea: z.array(z.string()).optional(),
  includeInvestorPitch: z.boolean().default(false),
  maxSuggestions: z.number().min(1).max(10).default(5),
  maxLength: z.enum(['concise', 'standard', 'detailed']).default('standard'),
});

// Schema for Notion export request
const notionExportSchema = z.object({
  includeMetrics: z.boolean().default(true),
  includeInsights: z.boolean().default(true),
  includeRecommendations: z.boolean().default(true),
  includeExecutiveSummary: z.boolean().default(true),
  notionPageId: z.string().optional(),
  notionDatabaseId: z.string().optional(),
  exportFormat: z.enum(['page', 'database']).default('page'),
  timeframe: z.enum(['day', 'week', 'month', 'quarter', 'year']).default('week'),
  notionApiKey: z.string(),
});

// Schema for creating a market data source
const createMarketDataSourceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.enum(['financial', 'industry', 'competitor', 'news', 'social', 'api']),
  url: z.string().url().optional(),
  apiKey: z.string().optional(),
  refreshInterval: z.number().int().min(5).default(60), // in minutes
  configuration: z.record(z.any()).optional(),
});

// Schema for updating a market data source
const updateMarketDataSourceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  type: z.enum(['financial', 'industry', 'competitor', 'news', 'social', 'api']).optional(),
  url: z.string().url().optional(),
  apiKey: z.string().optional(),
  refreshInterval: z.number().int().min(5).optional(),
  isActive: z.boolean().optional(),
  configuration: z.record(z.any()).optional(),
});

// Schema for deleting a market data source
const deleteMarketDataSourceSchema = z.object({
  id: z.string().uuid(),
});

// Schema for refreshing a market data source
const refreshMarketDataSourceSchema = z.object({
  id: z.string().uuid(),
});

/**
 * Get business metrics for the current user
 */
export const getBusinessMetrics = async (args: unknown, context: any) => {
  // Apply RBAC middleware - require 'business-metrics:read' permission
  const user = await requirePermission({
    resource: 'business-metrics',
    action: 'read',
    adminOverride: true,
    auditRejection: true,
    fieldVisibility: { resource: 'business-metrics', action: 'read' },
  })(context);

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(businessMetricsSchema, args);

  try {
    // Log the operation
    LoggingService.info({
      message: `Fetching business metrics for timeframe: ${validatedArgs.timeframe}`,
      userId: user.id,
      module: 'athena',
      category: 'METRICS',
      metadata: {
        timeframe: validatedArgs.timeframe,
        categories: validatedArgs.categories,
      },
    });

    // Get business metrics from the database
    const metrics = await prisma.businessMetric.findMany({
      where: {
        userId: context.user.id,
        ...(validatedArgs.categories && {
          category: { in: validatedArgs.categories },
        }),
      },
      orderBy: { date: 'desc' },
    });

    // If no metrics exist, create some sample metrics
    if (metrics.length === 0) {
      const today = new Date();

      // Create metrics for the past 30 days
      const sampleMetrics = [];

      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        // Revenue with slight growth trend
        const baseRevenue = 12500;
        const revenueGrowth = Math.random() * 0.02 - 0.005; // -0.5% to 1.5% daily change
        const revenue = baseRevenue * (1 + revenueGrowth * i);

        // Users with growth trend
        const baseUsers = 250;
        const userGrowth = Math.random() * 0.03 + 0.01; // 1% to 4% daily growth
        const users = Math.round(baseUsers * (1 + userGrowth * i));

        // Conversion rate fluctuating around 3.2%
        const conversionRate = 3.2 + (Math.random() * 0.6 - 0.3); // 2.9% to 3.5%

        // Churn rate fluctuating around 1.8%
        const churnRate = 1.8 + (Math.random() * 0.4 - 0.2); // 1.6% to 2.0%

        // Session duration fluctuating around 4.5 minutes
        const sessionDuration = 4.5 + (Math.random() * 1 - 0.5); // 4.0 to 5.0 minutes

        sampleMetrics.push(
          {
            userId: user.id,
            name: 'Revenue',
            value: Math.round(revenue),
            unit: '$',
            category: MetricCategory.REVENUE,
            date: date,
            description: 'Total revenue from all sources',
          },
          {
            userId: user.id,
            name: 'New Users',
            value: users,
            unit: '',
            category: MetricCategory.GROWTH,
            date: date,
            description: 'New user signups',
          },
          {
            userId: user.id,
            name: 'Conversion Rate',
            value: parseFloat(conversionRate.toFixed(2)),
            unit: '%',
            category: MetricCategory.CONVERSION,
            date: date,
            description: 'Percentage of visitors who convert to customers',
          },
          {
            userId: user.id,
            name: 'Churn Rate',
            value: parseFloat(churnRate.toFixed(2)),
            unit: '%',
            category: MetricCategory.RETENTION,
            date: date,
            description: "Percentage of customers who cancel or don't renew",
          },
          {
            userId: user.id,
            name: 'Average Session Duration',
            value: parseFloat(sessionDuration.toFixed(2)),
            unit: 'minutes',
            category: MetricCategory.ENGAGEMENT,
            date: date,
            description: 'Average time users spend per session',
          }
        );
      }

      await prisma.businessMetric.createMany({
        data: sampleMetrics,
      });

      return await prisma.businessMetric.findMany({
        where: { userId: user.id },
        orderBy: { date: 'desc' },
      });
    }

    // Apply field-level access control
    const filteredMetrics = applyFieldVisibility(metrics, 'business-metrics', 'read');
    return filteredMetrics;
  } catch (error) {
    console.error('Error fetching business metrics:', error);
    throw new HttpError(500, 'Failed to fetch business metrics');
  }
};

/**
 * Get business insights and recommendations
 */
export const getBusinessInsights = async (args: unknown, context: any) => {
  // Apply RBAC middleware - require 'business-metrics:analyze' permission
  const user = await requirePermission({
    resource: 'business-metrics',
    action: 'analyze',
    adminOverride: true,
    auditRejection: true,
    fieldVisibility: { resource: 'business-metrics', action: 'analyze' },
  })(context);

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(businessInsightsSchema, args);

  try {
    // Log the operation
    LoggingService.info({
      message: `Generating business insights for timeframe: ${validatedArgs.timeframe}`,
      userId: user.id,
      module: 'athena',
      category: 'INSIGHTS',
      metadata: {
        timeframe: validatedArgs.timeframe,
        categories: validatedArgs.categories,
      },
    });

    // Get metrics for the specified timeframe
    const metrics = await getBusinessMetrics({ timeframe: validatedArgs.timeframe }, context);

    // Use memory-aware insights generation
    const insights = await generateMemoryAwareInsights(
      metrics,
      validatedArgs.timeframe as TimeframeOption,
      user.id,
      context
    );

    // Use memory-aware recommendations generation
    const recommendations = await generateMemoryAwareRecommendations(
      metrics,
      insights,
      validatedArgs.timeframe as TimeframeOption,
      user.id,
      context
    );

    // Apply field-level access control
    const result = {
      insights: applyFieldVisibility(insights, 'business-metrics', 'analyze'),
      recommendations: applyFieldVisibility(recommendations, 'business-metrics', 'analyze'),
      timeframe: validatedArgs.timeframe,
      hasMemoryContext: true,
    };

    return result;
  } catch (error) {
    console.error('Error generating business insights:', error);

    // Fallback to non-memory-aware generation if memory-aware fails
    try {
      LoggingService.warn({
        message: 'Falling back to non-memory-aware insights generation',
        userId: user.id,
        module: 'athena',
        category: 'INSIGHTS',
        error,
      });

      // Get metrics for the specified timeframe
      const metrics = await getBusinessMetrics({ timeframe: validatedArgs.timeframe }, context);

      // Generate insights based on metrics (fallback)
      const insights = generateInsights(metrics, validatedArgs.timeframe, user.id);

      // Generate recommendations based on insights (fallback)
      const recommendations = generateRecommendations(insights, user.id);

      // Apply field-level access control
      const result = {
        insights: applyFieldVisibility(insights, 'business-metrics', 'analyze'),
        recommendations: applyFieldVisibility(recommendations, 'business-metrics', 'analyze'),
        timeframe: validatedArgs.timeframe,
        hasMemoryContext: false,
      };

      return result;
    } catch (fallbackError) {
      console.error('Error in fallback insights generation:', fallbackError);
      throw new HttpError(500, 'Failed to generate business insights');
    }
  }
};

/**
 * Get campaign and experiment suggestions
 */
export const getCampaignSuggestions = async (args: unknown, context: any) => {
  // Apply RBAC middleware - require 'campaign-suggestions:read' permission
  const user = await requirePermission({
    resource: 'campaign-suggestions',
    action: 'read',
    adminOverride: true,
    auditRejection: true,
    fieldVisibility: { resource: 'campaign-suggestions', action: 'read' },
  })(context);

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(campaignSuggestionsSchema, args);

  try {
    // Log the operation
    LoggingService.info({
      message: `Generating campaign suggestions`,
      userId: user.id,
      module: 'athena',
      category: 'CAMPAIGNS',
      metadata: {
        timeframe: validatedArgs.timeframe,
        limit: validatedArgs.limit,
      },
    });

    // Get insights for context
    const { insights } = await getBusinessInsights({ timeframe: validatedArgs.timeframe }, context);

    // Generate campaign suggestions based on insights
    const campaigns = generateCampaignSuggestions(insights, validatedArgs.limit, user.id);

    // Apply field-level access control
    const result = {
      campaigns: applyFieldVisibility(campaigns, 'campaign-suggestions', 'read'),
      timeframe: validatedArgs.timeframe,
    };

    return result;
  } catch (error) {
    console.error('Error generating campaign suggestions:', error);
    throw new HttpError(500, 'Failed to generate campaign suggestions');
  }
};

/**
 * Get strategic decision suggestions
 */
export const getStrategicDecisions = async (args: unknown, context: any) => {
  // Apply RBAC middleware - require 'strategic-decisions:read' permission
  const user = await requirePermission({
    resource: 'strategic-decisions',
    action: 'read',
    adminOverride: true,
    auditRejection: true,
    fieldVisibility: { resource: 'strategic-decisions', action: 'read' },
  })(context);

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(strategicDecisionsSchema, args);

  try {
    // Log the operation
    LoggingService.info({
      message: `Generating strategic decisions`,
      userId: user.id,
      module: 'athena',
      category: 'DECISIONS',
      metadata: {
        timeframe: validatedArgs.timeframe,
        limit: validatedArgs.limit,
      },
    });

    // Get insights and recommendations for context
    const { insights, recommendations } = await getBusinessInsights(
      { timeframe: validatedArgs.timeframe },
      context
    );

    // Generate strategic decisions based on insights and recommendations
    const decisions = generateStrategicDecisions(
      insights,
      recommendations,
      validatedArgs.limit,
      user.id
    );

    // Apply field-level access control
    const result = {
      decisions: applyFieldVisibility(decisions, 'strategic-decisions', 'read'),
      timeframe: validatedArgs.timeframe,
    };

    return result;
  } catch (error) {
    console.error('Error generating strategic decisions:', error);
    throw new HttpError(500, 'Failed to generate strategic decisions');
  }
};

// Helper functions for generating insights, recommendations, campaigns, and decisions

/**
 * Generate insights from metrics
 */
function generateInsights(metrics: any[], timeframe: string, userId: string): BusinessInsight[] {
  // Group metrics by name
  const metricsByName = metrics.reduce(
    (acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = [];
      }
      acc[metric.name].push(metric);
      return acc;
    },
    {} as Record<string, any[]>
  );

  const insights: BusinessInsight[] = [];

  // Calculate trends for each metric
  for (const [name, values] of Object.entries(metricsByName)) {
    const sortedValues = values.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Get current and previous values based on timeframe
    const current = sortedValues[0];
    let previous;

    switch (timeframe) {
      case 'day':
        previous = sortedValues[1];
        break;
      case 'week':
        previous = sortedValues[7] || sortedValues[sortedValues.length - 1];
        break;
      case 'month':
        previous = sortedValues[30] || sortedValues[sortedValues.length - 1];
        break;
      case 'quarter':
        previous = sortedValues[90] || sortedValues[sortedValues.length - 1];
        break;
      case 'year':
        previous = sortedValues[365] || sortedValues[sortedValues.length - 1];
        break;
      default:
        previous = sortedValues[7] || sortedValues[sortedValues.length - 1];
    }

    if (current && previous) {
      const percentChange = ((current.value - previous.value) / previous.value) * 100;
      const absPercentChange = Math.abs(percentChange);

      // Determine impact level based on percent change
      let impact: ImpactLevel;
      if (absPercentChange > 15) {
        impact = ImpactLevel.CRITICAL;
      } else if (absPercentChange > 10) {
        impact = ImpactLevel.HIGH;
      } else if (absPercentChange > 5) {
        impact = ImpactLevel.MEDIUM;
      } else {
        impact = ImpactLevel.LOW;
      }

      // Determine confidence level
      let confidence: ConfidenceLevel;
      if (sortedValues.length > 20) {
        confidence = ConfidenceLevel.VERY_HIGH;
      } else if (sortedValues.length > 10) {
        confidence = ConfidenceLevel.HIGH;
      } else if (sortedValues.length > 5) {
        confidence = ConfidenceLevel.MEDIUM;
      } else {
        confidence = ConfidenceLevel.LOW;
      }

      // Generate insight title and description
      let title = '';
      let description = '';

      if (percentChange > 0) {
        title = `${name} Increased by ${absPercentChange.toFixed(1)}%`;
        description = `${name} has increased from ${previous.value} to ${current.value} (${absPercentChange.toFixed(1)}% growth) over the selected ${timeframe} period.`;
      } else if (percentChange < 0) {
        title = `${name} Decreased by ${absPercentChange.toFixed(1)}%`;
        description = `${name} has decreased from ${previous.value} to ${current.value} (${absPercentChange.toFixed(1)}% decline) over the selected ${timeframe} period.`;
      } else {
        title = `${name} Remained Stable`;
        description = `${name} has remained stable at ${current.value} over the selected ${timeframe} period.`;
      }

      insights.push({
        id: `insight-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title,
        description,
        category: current.category,
        impact,
        confidence,
        relatedMetrics: [name],
        createdAt: new Date(),
        isArchived: false,
        metadata: {
          currentValue: current.value,
          previousValue: previous.value,
          percentChange: parseFloat(percentChange.toFixed(2)),
          timeframe,
        },
      });
    }
  }

  return insights;
}

/**
 * Generate recommendations based on insights
 */
function generateRecommendations(
  insights: BusinessInsight[],
  userId: string
): BusinessRecommendation[] {
  const recommendations: BusinessRecommendation[] = [];

  // Process revenue insights
  const revenueInsights = insights.filter(
    (insight) => insight.category === MetricCategory.REVENUE && insight.impact !== ImpactLevel.LOW
  );

  if (revenueInsights.length > 0) {
    const negativeRevenueInsights = revenueInsights.filter((insight) =>
      insight.description.includes('decreased')
    );

    if (negativeRevenueInsights.length > 0) {
      recommendations.push({
        id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: 'Revenue Optimization Strategy',
        description:
          'Based on recent revenue trends, consider implementing a comprehensive revenue optimization strategy.',
        category: MetricCategory.REVENUE,
        impact: negativeRevenueInsights[0].impact,
        effort: ImpactLevel.MEDIUM,
        confidence: negativeRevenueInsights[0].confidence,
        actionItems: [
          'Review pricing strategy and consider adjustments',
          'Analyze sales funnel for conversion bottlenecks',
          'Implement targeted upselling campaigns for existing customers',
          'Explore new revenue streams or product offerings',
        ],
        expectedOutcome:
          'Stabilize revenue decline and establish growth trajectory within next quarter',
        createdAt: new Date(),
        isImplemented: false,
      });
    }
  }

  // Process growth insights
  const growthInsights = insights.filter(
    (insight) =>
      insight.category === MetricCategory.GROWTH || insight.category === MetricCategory.ACQUISITION
  );

  if (growthInsights.length > 0) {
    const negativeGrowthInsights = growthInsights.filter(
      (insight) => insight.description.includes('decreased') && insight.impact !== ImpactLevel.LOW
    );

    if (negativeGrowthInsights.length > 0) {
      recommendations.push({
        id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
        title: 'Growth Acceleration Plan',
        description: 'Address slowing growth metrics with a targeted acceleration strategy.',
        category: MetricCategory.GROWTH,
        impact: negativeGrowthInsights[0].impact,
        effort: ImpactLevel.HIGH,
        confidence: negativeGrowthInsights[0].confidence,
        actionItems: [
          'Audit current acquisition channels for performance',
          'Test new customer acquisition strategies',
          'Optimize onboarding flow to improve activation',
          'Increase marketing spend on highest-performing channels',
        ],
        expectedOutcome:
          'Reverse growth slowdown and achieve 15% improvement in acquisition metrics',
        createdAt: new Date(),
        isImplemented: false,
      });
    }
  }

  // Process retention insights
  const retentionInsights = insights.filter(
    (insight) =>
      insight.category === MetricCategory.RETENTION ||
      (insight.category === MetricCategory.ENGAGEMENT && insight.title.includes('Churn'))
  );

  if (retentionInsights.length > 0) {
    const negativeRetentionInsights = retentionInsights.filter(
      (insight) =>
        (insight.title.includes('Churn') && insight.description.includes('increased')) ||
        (insight.title.includes('Retention') && insight.description.includes('decreased'))
    );

    if (negativeRetentionInsights.length > 0) {
      recommendations.push({
        id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        title: 'Customer Retention Initiative',
        description: 'Implement a comprehensive retention strategy to address increasing churn.',
        category: MetricCategory.RETENTION,
        impact: negativeRetentionInsights[0].impact,
        effort: ImpactLevel.MEDIUM,
        confidence: negativeRetentionInsights[0].confidence,
        actionItems: [
          'Conduct customer exit surveys to identify churn reasons',
          'Implement proactive outreach to at-risk customers',
          'Enhance customer success and support processes',
          'Develop loyalty program or incentives for long-term customers',
        ],
        expectedOutcome: 'Reduce churn rate by 20% within next two quarters',
        createdAt: new Date(),
        isImplemented: false,
      });
    }
  }

  // If no specific recommendations, add a general one
  if (recommendations.length === 0) {
    recommendations.push({
      id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 12)}`,
      title: 'Business Performance Optimization',
      description:
        'Conduct a comprehensive business performance review to identify optimization opportunities.',
      category: MetricCategory.OPERATIONAL,
      impact: ImpactLevel.MEDIUM,
      effort: ImpactLevel.MEDIUM,
      confidence: ConfidenceLevel.MEDIUM,
      actionItems: [
        'Schedule quarterly business review with key stakeholders',
        'Establish updated KPI targets for next quarter',
        'Identify top 3 areas for operational improvement',
        'Develop action plan for each priority area',
      ],
      expectedOutcome: 'Improved operational efficiency and alignment on strategic priorities',
      createdAt: new Date(),
      isImplemented: false,
    });
  }

  return recommendations;
}

/**
 * Generate campaign suggestions based on insights
 */
function generateCampaignSuggestions(
  insights: BusinessInsight[],
  limit: number,
  userId: string
): CampaignSuggestion[] {
  const campaigns: CampaignSuggestion[] = [];

  // Campaign ideas based on revenue insights
  const revenueInsights = insights.filter((insight) => insight.category === MetricCategory.REVENUE);

  if (revenueInsights.length > 0) {
    campaigns.push({
      id: `campaign-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: 'Revenue Acceleration Campaign',
      description: 'A targeted campaign to boost revenue through existing customer base.',
      objective: 'Increase average revenue per user by 15% within 60 days',
      targetAudience: 'Current customers who have been active for at least 30 days',
      estimatedImpact: ImpactLevel.HIGH,
      estimatedCost: 5000,
      estimatedDuration: 60,
      kpis: ['Revenue per user', 'Upgrade rate', 'Campaign ROI'],
      status: CampaignStatus.DRAFT,
      createdAt: new Date(),
    });
  }

  // Campaign ideas based on acquisition insights
  const acquisitionInsights = insights.filter(
    (insight) =>
      insight.category === MetricCategory.ACQUISITION || insight.category === MetricCategory.GROWTH
  );

  if (acquisitionInsights.length > 0) {
    campaigns.push({
      id: `campaign-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
      title: 'New Market Expansion Test',
      description: 'Experimental campaign to test product-market fit in a new vertical.',
      objective: 'Validate market fit and acquisition strategy for healthcare sector',
      targetAudience: 'Healthcare professionals and administrators',
      estimatedImpact: ImpactLevel.MEDIUM,
      estimatedCost: 7500,
      estimatedDuration: 45,
      kpis: [
        'Leads generated',
        'Conversion rate',
        'Customer acquisition cost',
        'Time to first value',
      ],
      status: CampaignStatus.DRAFT,
      createdAt: new Date(),
    });
  }

  // Campaign ideas based on engagement insights
  const engagementInsights = insights.filter(
    (insight) => insight.category === MetricCategory.ENGAGEMENT
  );

  if (engagementInsights.length > 0) {
    campaigns.push({
      id: `campaign-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      title: 'User Engagement Boost',
      description: 'A multi-channel campaign to increase user engagement and product usage.',
      objective: 'Increase daily active users by 25% and session duration by 15%',
      targetAudience: 'Users who have been inactive for 14+ days',
      estimatedImpact: ImpactLevel.MEDIUM,
      estimatedCost: 3000,
      estimatedDuration: 30,
      kpis: ['Daily active users', 'Session duration', 'Feature adoption', 'Retention rate'],
      status: CampaignStatus.DRAFT,
      createdAt: new Date(),
    });
  }

  // Add a retention campaign
  campaigns.push({
    id: `campaign-${Date.now()}-${Math.random().toString(36).substring(2, 12)}`,
    title: 'Customer Loyalty Program',
    description: 'Implement a tiered loyalty program to improve retention and lifetime value.',
    objective: 'Reduce churn by 20% and increase customer lifetime value by 30%',
    targetAudience: 'All current customers',
    estimatedImpact: ImpactLevel.HIGH,
    estimatedCost: 10000,
    estimatedDuration: 90,
    kpis: ['Churn rate', 'Customer lifetime value', 'Net promoter score', 'Referral rate'],
    status: CampaignStatus.DRAFT,
    createdAt: new Date(),
  });

  // Add an experimental campaign
  campaigns.push({
    id: `campaign-${Date.now()}-${Math.random().toString(36).substring(2, 13)}`,
    title: 'A/B Pricing Experiment',
    description: 'Test different pricing tiers and structures to optimize conversion and revenue.',
    objective: 'Identify optimal pricing structure to maximize conversion and revenue',
    targetAudience: 'New visitors and trial users',
    estimatedImpact: ImpactLevel.CRITICAL,
    estimatedCost: 2000,
    estimatedDuration: 30,
    kpis: ['Conversion rate', 'Average revenue per user', 'Trial-to-paid conversion', 'Churn rate'],
    status: CampaignStatus.DRAFT,
    createdAt: new Date(),
  });

  // Return limited number of campaigns
  return campaigns.slice(0, limit);
}

/**
 * Generate strategic decisions based on insights and recommendations
 */
function generateStrategicDecisions(
  insights: BusinessInsight[],
  recommendations: BusinessRecommendation[],
  limit: number,
  userId: string
): StrategicDecision[] {
  const decisions: StrategicDecision[] = [];

  // Pricing strategy decision
  decisions.push({
    id: `decision-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    title: 'Pricing Strategy Optimization',
    description: 'Determine the optimal pricing strategy to maximize growth and revenue.',
    category: 'pricing',
    impact: ImpactLevel.HIGH,
    risk: ImpactLevel.MEDIUM,
    options: [
      {
        id: 'option-1',
        title: 'Value-Based Pricing Increase',
        description: 'Increase prices based on demonstrated value, focusing on enterprise tiers.',
        pros: [
          'Immediate revenue increase from existing customers',
          'Positions product as premium solution',
          'Can fund additional feature development',
        ],
        cons: [
          'May increase churn among price-sensitive customers',
          'Could slow acquisition of new customers',
          'Requires strong value justification',
        ],
        estimatedImpact: ImpactLevel.HIGH,
        estimatedRisk: ImpactLevel.MEDIUM,
      },
      {
        id: 'option-2',
        title: 'Freemium Model Expansion',
        description:
          'Expand free tier capabilities to increase top-of-funnel, with optimized conversion path to paid.',
        pros: [
          'Increases market penetration and user base',
          'Reduces friction for new customer acquisition',
          'Creates viral growth potential',
        ],
        cons: [
          'May cannibalize existing paid customers',
          'Increases costs to serve non-paying users',
          'Could devalue product perception',
        ],
        estimatedImpact: ImpactLevel.MEDIUM,
        estimatedRisk: ImpactLevel.MEDIUM,
      },
      {
        id: 'option-3',
        title: 'Usage-Based Pricing Model',
        description:
          'Transition to a usage-based pricing model that scales with customer value received.',
        pros: [
          'Aligns pricing with value delivered',
          'Reduces barrier to entry for new customers',
          'Creates natural expansion revenue',
        ],
        cons: [
          'More complex to implement technically',
          'May create revenue unpredictability',
          'Requires customer education',
        ],
        estimatedImpact: ImpactLevel.HIGH,
        estimatedRisk: ImpactLevel.HIGH,
      },
    ],
    recommendedOptionId: 'option-3',
    createdAt: new Date(),
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    isResolved: false,
  });

  // Market expansion decision
  decisions.push({
    id: `decision-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
    title: 'Market Expansion Strategy',
    description: 'Determine which new market segment to prioritize for expansion.',
    category: 'growth',
    impact: ImpactLevel.CRITICAL,
    risk: ImpactLevel.HIGH,
    options: [
      {
        id: 'option-1',
        title: 'Enterprise Segment Focus',
        description:
          'Prioritize moving upmarket to enterprise customers with dedicated sales team and customized solutions.',
        pros: [
          'Higher contract values and predictable revenue',
          'Lower customer acquisition costs at scale',
          'Potential for strategic partnerships',
        ],
        cons: [
          'Longer sales cycles',
          'Requires significant product enhancements',
          'More complex implementation and support',
        ],
        estimatedImpact: ImpactLevel.HIGH,
        estimatedRisk: ImpactLevel.MEDIUM,
      },
      {
        id: 'option-2',
        title: 'International Expansion',
        description:
          'Expand to new geographic markets, starting with Western Europe and Asia-Pacific regions.',
        pros: [
          'Taps into new customer bases',
          'Diversifies revenue streams',
          'First-mover advantage in some regions',
        ],
        cons: [
          'Regulatory and compliance challenges',
          'Localization requirements',
          'Higher operational complexity',
        ],
        estimatedImpact: ImpactLevel.HIGH,
        estimatedRisk: ImpactLevel.HIGH,
      },
      {
        id: 'option-3',
        title: 'Adjacent Industry Vertical',
        description: 'Adapt product for a closely related industry vertical with similar needs.',
        pros: [
          'Leverages existing product capabilities',
          'Shorter time to market',
          'Cross-selling opportunities',
        ],
        cons: [
          'May require industry-specific features',
          'New competitive landscape',
          'Potential brand dilution',
        ],
        estimatedImpact: ImpactLevel.MEDIUM,
        estimatedRisk: ImpactLevel.MEDIUM,
      },
    ],
    recommendedOptionId: 'option-3',
    createdAt: new Date(),
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    isResolved: false,
  });

  // Return limited number of decisions
  return decisions.slice(0, limit);
}

/**
 * Get market data for strategic analysis
 */
export const getMarketData = async (args: unknown, context: any) => {
  // Apply RBAC middleware - require 'market-data:read' permission
  const user = await requirePermission({
    resource: 'market-data',
    action: 'read',
    adminOverride: true,
    auditRejection: true,
    fieldVisibility: { resource: 'market-data', action: 'read' },
  })(context);

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(marketDataSchema, args);

  try {
    // Log the operation
    LoggingService.info({
      message: `Fetching market data for timeframe: ${validatedArgs.timeframe}`,
      userId: user.id,
      module: 'athena',
      category: 'MARKET_DATA',
      metadata: {
        timeframe: validatedArgs.timeframe,
        categories: validatedArgs.categories,
      },
    });

    // Import the market data service
    const { fetchAllMarketData } = await import('../services/marketDataService');

    // Fetch market data from external sources
    let marketData = await fetchAllMarketData(user.id);

    // If no market data is available from external sources, use database
    if (marketData.length === 0) {
      // Try to get market data from the database
      const dbMarketData = await prisma.marketData.findMany({
        where: {
          userId: user.id,
          ...(validatedArgs.categories ? { category: { in: validatedArgs.categories } } : {}),
        },
        orderBy: { date: 'desc' },
        take: 10,
      });

      if (dbMarketData.length > 0) {
        marketData = dbMarketData;
      } else {
        // If still no data, generate sample data
        marketData = [
          {
            id: `market-${Date.now()}-1`,
            name: 'Industry Growth Rate',
            category: 'market',
            value: 7.2,
            source: 'Industry Reports',
            date: new Date(),
            trend: 0.5,
            impact: ImpactLevel.MEDIUM,
            relevance: ConfidenceLevel.HIGH,
            description: 'Annual growth rate for the industry sector',
            metadata: {
              region: 'Global',
              segment: 'SaaS',
            },
          },
          {
            id: `market-${Date.now()}-2`,
            name: 'Competitor Pricing',
            category: 'market',
            value: 89,
            source: 'Competitive Analysis',
            date: new Date(),
            trend: -2.1,
            impact: ImpactLevel.HIGH,
            relevance: ConfidenceLevel.MEDIUM,
            description: 'Average competitor pricing for similar products',
            metadata: {
              unit: 'USD/month',
              sample_size: 12,
            },
          },
          {
            id: `market-${Date.now()}-3`,
            name: 'Market Saturation',
            category: 'market',
            value: 68,
            source: 'Market Research',
            date: new Date(),
            trend: 3.2,
            impact: ImpactLevel.MEDIUM,
            relevance: ConfidenceLevel.HIGH,
            description: 'Percentage of addressable market currently using similar solutions',
            metadata: {
              unit: '%',
              region: 'North America',
            },
          },
        ];

        // Save sample data to database for future use
        for (const data of marketData) {
          await prisma.marketData.create({
            data: {
              ...data,
              userId: user.id,
            },
          });
        }
      }
    }

    // Apply field-level access control
    const filteredMarketData = applyFieldVisibility(marketData, 'market-data', 'read');
    return filteredMarketData;
  } catch (error) {
    console.error('Error fetching market data:', error);
    throw new HttpError(500, 'Failed to fetch market data');
  }
};

/**
 * Generate strategic recommendations based on business insights and market data
 */
export const getStrategicRecommendations = async (args: unknown, context: any) => {
  // Apply RBAC middleware - require 'strategic-recommendations:read' permission
  const user = await requirePermission({
    resource: 'strategic-recommendations',
    action: 'read',
    adminOverride: true,
    auditRejection: true,
    fieldVisibility: { resource: 'strategic-recommendations', action: 'read' },
  })(context);

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(strategicRecommendationsSchema, args);

  try {
    // Log the operation
    LoggingService.info({
      message: `Generating strategic recommendations`,
      userId: user.id,
      module: 'athena',
      category: 'STRATEGIC_RECOMMENDATIONS',
      metadata: {
        timeframe: validatedArgs.timeframe,
        limit: validatedArgs.limit,
      },
    });

    // Get insights for context
    const { insights } = await getBusinessInsights({ timeframe: validatedArgs.timeframe }, context);

    // Get market data for context
    const marketData = await getMarketData({ timeframe: validatedArgs.timeframe }, context);

    // Generate strategic recommendations
    const recommendations = await generateStrategicRecommendations(
      insights,
      marketData,
      user.id,
      context
    );

    // Save recommendations to database
    for (const recommendation of recommendations) {
      try {
        await prisma.strategicRecommendation.create({
          data: {
            id: recommendation.id,
            title: recommendation.title,
            description: recommendation.description,
            category: recommendation.category,
            impact: recommendation.impact,
            timeframe: validatedArgs.timeframe,
            actionItems: recommendation.actionItems,
            expectedOutcome: recommendation.expectedOutcome,
            supportingData: recommendation.supportingData,
            isImplemented: false,
            metadata: recommendation.metadata,
            userId: user.id,
          },
        });
      } catch (error) {
        // Log error but continue with other recommendations
        console.error('Error saving strategic recommendation:', error);
        LoggingService.error({
          message: 'Error saving strategic recommendation',
          userId: user.id,
          module: 'athena',
          category: 'STRATEGIC_RECOMMENDATIONS',
          error: error as Error,
        });
      }
    }

    // Apply field-level access control
    const result = {
      recommendations: applyFieldVisibility(recommendations, 'strategic-recommendations', 'read'),
      timeframe: validatedArgs.timeframe,
    };

    return result;
  } catch (error) {
    console.error('Error generating strategic recommendations:', error);
    throw new HttpError(500, 'Failed to generate strategic recommendations');
  }
};

/**
 * Generate an executive summary
 */
export const getExecutiveSummary = async (args: unknown, context: any) => {
  // Apply RBAC middleware - require 'executive-summary:read' permission
  const user = await requirePermission({
    resource: 'executive-summary',
    action: 'read',
    adminOverride: true,
    auditRejection: true,
    fieldVisibility: { resource: 'executive-summary', action: 'read' },
  })(context);

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(executiveSummarySchema, args);

  try {
    // Log the operation
    LoggingService.info({
      message: `Generating executive summary`,
      userId: user.id,
      module: 'athena',
      category: 'EXECUTIVE_SUMMARY',
      metadata: {
        timeframe: validatedArgs.timeframe,
      },
    });

    // Get metrics for the specified timeframe
    const metrics = await getBusinessMetrics({ timeframe: validatedArgs.timeframe }, context);

    // Get insights and recommendations
    const { insights, recommendations } = await getBusinessInsights(
      { timeframe: validatedArgs.timeframe },
      context
    );

    // Get strategic recommendations
    const { recommendations: strategicRecommendations } = await getStrategicRecommendations(
      { timeframe: validatedArgs.timeframe },
      context
    );

    // Generate executive summary with historical context
    let executiveSummary;
    try {
      executiveSummary = await generateExecutiveSummaryWithHistory(
        metrics,
        insights,
        strategicRecommendations,
        validatedArgs.timeframe as TimeframeOption,
        user.id,
        context
      );

      // The summary is already saved to the database in the service
      LoggingService.info({
        message: 'Generated executive summary with historical context',
        userId: user.id,
        module: 'athena',
        category: 'EXECUTIVE_SUMMARY',
        metadata: {
          summaryId: executiveSummary.id,
          timeframe: validatedArgs.timeframe,
        },
      });
    } catch (error) {
      // Log error and fall back to non-memory-aware generation
      console.error('Error generating memory-aware executive summary:', error);
      LoggingService.warn({
        message: 'Falling back to standard executive summary generation',
        userId: user.id,
        module: 'athena',
        category: 'EXECUTIVE_SUMMARY',
        error: error as Error,
      });

      // Fall back to standard generation
      executiveSummary = await generateExecutiveSummary(
        metrics,
        insights,
        strategicRecommendations,
        validatedArgs.timeframe,
        user.id,
        context
      );

      // Save executive summary to database
      try {
        await prisma.executiveSummary.create({
          data: {
            id: executiveSummary.id,
            title: executiveSummary.title,
            summary: executiveSummary.summary,
            timeframe: validatedArgs.timeframe,
            keyMetrics: executiveSummary.keyMetrics,
            keyInsights: executiveSummary.keyInsights,
            topRecommendations: executiveSummary.topRecommendations,
            riskFactors: executiveSummary.riskFactors,
            opportunities: executiveSummary.opportunities,
            metadata: {
              ...executiveSummary.metadata,
              hasHistoricalContext: false,
            },
            userId: user.id,
          },
        });
      } catch (dbError) {
        // Log error but continue
        console.error('Error saving executive summary:', dbError);
        LoggingService.error({
          message: 'Error saving executive summary',
          userId: user.id,
          module: 'athena',
          category: 'EXECUTIVE_SUMMARY',
          error: dbError as Error,
        });
      }
    }

    // Apply field-level access control
    const result = {
      executiveSummary: applyFieldVisibility(executiveSummary, 'executive-summary', 'read'),
      timeframe: validatedArgs.timeframe,
    };

    return result;
  } catch (error) {
    console.error('Error generating executive summary:', error);
    throw new HttpError(500, 'Failed to generate executive summary');
  }
};

/**
 * Export data to Notion
 */
export const exportToNotion = async (args: unknown, context: any) => {
  // Apply RBAC middleware - require 'notion-export:execute' permission
  const user = await requirePermission({
    resource: 'notion-export',
    action: 'execute',
    adminOverride: true,
    auditRejection: true,
  })(context);

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(notionExportSchema, args);

  try {
    // Log the operation
    LoggingService.info({
      message: `Exporting data to Notion`,
      userId: user.id,
      module: 'athena',
      category: 'NOTION_EXPORT',
      metadata: {
        timeframe: validatedArgs.timeframe,
        includeMetrics: validatedArgs.includeMetrics,
        includeInsights: validatedArgs.includeInsights,
        includeRecommendations: validatedArgs.includeRecommendations,
        includeExecutiveSummary: validatedArgs.includeExecutiveSummary,
        exportFormat: validatedArgs.exportFormat,
      },
    });

    // Get data to export
    const metrics = validatedArgs.includeMetrics
      ? await getBusinessMetrics({ timeframe: validatedArgs.timeframe }, context)
      : [];

    const { insights } = validatedArgs.includeInsights
      ? await getBusinessInsights({ timeframe: validatedArgs.timeframe }, context)
      : { insights: [] };

    const { recommendations: strategicRecommendations } = validatedArgs.includeRecommendations
      ? await getStrategicRecommendations({ timeframe: validatedArgs.timeframe }, context)
      : { recommendations: [] };

    const { executiveSummary } = validatedArgs.includeExecutiveSummary
      ? await getExecutiveSummary({ timeframe: validatedArgs.timeframe }, context)
      : { executiveSummary: null };

    // Export to Notion
    const result = await exportToNotionPage(
      {
        includeMetrics: validatedArgs.includeMetrics,
        includeInsights: validatedArgs.includeInsights,
        includeRecommendations: validatedArgs.includeRecommendations,
        includeExecutiveSummary: validatedArgs.includeExecutiveSummary,
        notionPageId: validatedArgs.notionPageId,
        notionDatabaseId: validatedArgs.notionDatabaseId,
        exportFormat: validatedArgs.exportFormat,
        timeframe: validatedArgs.timeframe,
      },
      metrics,
      insights,
      strategicRecommendations,
      executiveSummary,
      validatedArgs.notionApiKey,
      user.id
    );

    return result;
  } catch (error) {
    console.error('Error exporting to Notion:', error);
    throw new HttpError(500, 'Failed to export to Notion');
  }
};

/**
 * Get all market data sources
 */
export const getMarketDataSources = async (args: unknown, context: any) => {
  // Apply RBAC middleware - require 'market-data-source:read' permission
  const user = await requirePermission({
    resource: 'market-data-source',
    action: 'read',
    adminOverride: true,
    auditRejection: true,
  })(context);

  try {
    // Log the operation
    LoggingService.info({
      message: 'Fetching market data sources',
      userId: user.id,
      module: 'athena',
      category: 'MARKET_DATA_SOURCE',
    });

    // Import the market data source service
    const { getMarketDataSources: fetchMarketDataSources } = await import('../services/marketDataSourceService');

    // Get all market data sources
    const sources = await fetchMarketDataSources();

    return sources;
  } catch (error) {
    console.error('Error fetching market data sources:', error);
    throw new HttpError(500, 'Failed to fetch market data sources');
  }
};

/**
 * Get a market data source by ID
 */
export const getMarketDataSourceById = async (args: unknown, context: any) => {
  // Apply RBAC middleware - require 'market-data-source:read' permission
  const user = await requirePermission({
    resource: 'market-data-source',
    action: 'read',
    adminOverride: true,
    auditRejection: true,
  })(context);

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(deleteMarketDataSourceSchema, args);

  try {
    // Log the operation
    LoggingService.info({
      message: `Fetching market data source: ${validatedArgs.id}`,
      userId: user.id,
      module: 'athena',
      category: 'MARKET_DATA_SOURCE',
      metadata: {
        sourceId: validatedArgs.id,
      },
    });

    // Import the market data source service
    const { getMarketDataSourceById: fetchMarketDataSourceById } = await import('../services/marketDataSourceService');

    // Get the market data source
    const source = await fetchMarketDataSourceById({ id: validatedArgs.id });

    return source;
  } catch (error) {
    console.error('Error fetching market data source:', error);
    throw new HttpError(500, 'Failed to fetch market data source');
  }
};

/**
 * Create a new market data source
 */
export const createMarketDataSource = async (args: unknown, context: any) => {
  // Apply RBAC middleware - require 'market-data-source:create' permission
  const user = await requirePermission({
    resource: 'market-data-source',
    action: 'create',
    adminOverride: true,
    auditRejection: true,
  })(context);

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(createMarketDataSourceSchema, args);

  try {
    // Log the operation
    LoggingService.info({
      message: `Creating market data source: ${validatedArgs.name}`,
      userId: user.id,
      module: 'athena',
      category: 'MARKET_DATA_SOURCE',
      metadata: {
        sourceName: validatedArgs.name,
        sourceType: validatedArgs.type,
      },
    });

    // Import the market data source service
    const { createMarketDataSource: createSource } = await import('../services/marketDataSourceService');

    // Create the market data source
    const source = await createSource(validatedArgs);

    return source;
  } catch (error) {
    console.error('Error creating market data source:', error);
    throw new HttpError(500, 'Failed to create market data source');
  }
};

/**
 * Update a market data source
 */
export const updateMarketDataSource = async (args: unknown, context: any) => {
  // Apply RBAC middleware - require 'market-data-source:update' permission
  const user = await requirePermission({
    resource: 'market-data-source',
    action: 'update',
    adminOverride: true,
    auditRejection: true,
  })(context);

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(updateMarketDataSourceSchema, args);

  try {
    // Log the operation
    LoggingService.info({
      message: `Updating market data source: ${validatedArgs.id}`,
      userId: user.id,
      module: 'athena',
      category: 'MARKET_DATA_SOURCE',
      metadata: {
        sourceId: validatedArgs.id,
      },
    });

    // Import the market data source service
    const { updateMarketDataSource: updateSource } = await import('../services/marketDataSourceService');

    // Update the market data source
    const source = await updateSource(validatedArgs);

    return source;
  } catch (error) {
    console.error('Error updating market data source:', error);
    throw new HttpError(500, 'Failed to update market data source');
  }
};

/**
 * Delete a market data source
 */
export const deleteMarketDataSource = async (args: unknown, context: any) => {
  // Apply RBAC middleware - require 'market-data-source:delete' permission
  const user = await requirePermission({
    resource: 'market-data-source',
    action: 'delete',
    adminOverride: true,
    auditRejection: true,
  })(context);

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(deleteMarketDataSourceSchema, args);

  try {
    // Log the operation
    LoggingService.info({
      message: `Deleting market data source: ${validatedArgs.id}`,
      userId: user.id,
      module: 'athena',
      category: 'MARKET_DATA_SOURCE',
      metadata: {
        sourceId: validatedArgs.id,
      },
    });

    // Import the market data source service
    const { deleteMarketDataSource: deleteSource } = await import('../services/marketDataSourceService');

    // Delete the market data source
    const result = await deleteSource({ id: validatedArgs.id });

    return result;
  } catch (error) {
    console.error('Error deleting market data source:', error);
    throw new HttpError(500, 'Failed to delete market data source');
  }
};

/**
 * Refresh a market data source
 */
export const refreshMarketDataSource = async (args: unknown, context: any) => {
  // Apply RBAC middleware - require 'market-data-source:update' permission
  const user = await requirePermission({
    resource: 'market-data-source',
    action: 'update',
    adminOverride: true,
    auditRejection: true,
  })(context);

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(refreshMarketDataSourceSchema, args);

  try {
    // Log the operation
    LoggingService.info({
      message: `Refreshing market data source: ${validatedArgs.id}`,
      userId: user.id,
      module: 'athena',
      category: 'MARKET_DATA_SOURCE',
      metadata: {
        sourceId: validatedArgs.id,
      },
    });

    // Import the market data source service
    const { refreshMarketDataSource: refreshSource } = await import('../services/marketDataSourceService');

    // Refresh the market data source
    const result = await refreshSource({ id: validatedArgs.id, userId: user.id });

    return result;
  } catch (error) {
    console.error('Error refreshing market data source:', error);
    throw new HttpError(500, 'Failed to refresh market data source');
  }
};

/**
 * Generate executive advisor output
 */
export const getExecutiveAdvice = async (args: unknown, context: any) => {
  // Apply RBAC middleware - require 'executive-advisor:read' permission
  const user = await requirePermission({
    resource: 'executive-advisor',
    action: 'read',
    adminOverride: true,
    auditRejection: true,
    fieldVisibility: { resource: 'executive-advisor', action: 'read' },
  })(context);

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(executiveAdvisorSchema, args);

  try {
    // Log the operation
    LoggingService.info({
      message: `Generating executive advice with ${validatedArgs.communicationStyle} style`,
      userId: user.id,
      module: 'athena',
      category: 'EXECUTIVE_ADVISOR',
      metadata: {
        timeframe: validatedArgs.timeframe,
        communicationStyle: validatedArgs.communicationStyle,
        includeInvestorPitch: validatedArgs.includeInvestorPitch,
      },
    });

    // Get metrics, insights, recommendations, and executive summary
    const metrics = await getBusinessMetrics({ timeframe: validatedArgs.timeframe }, context);

    const { insights, recommendations } = await getBusinessInsights(
      { timeframe: validatedArgs.timeframe },
      context
    );

    const { recommendations: strategicRecommendations } = await getStrategicRecommendations(
      { timeframe: validatedArgs.timeframe },
      context
    );

    const { executiveSummary } = await getExecutiveSummary(
      { timeframe: validatedArgs.timeframe },
      context
    );

    // Import the executive advisor service
    const { generateExecutiveAdvice } = await import('../services/executiveAdvisorService');

    // Generate executive advice
    const executiveAdvice = await generateExecutiveAdvice(
      metrics,
      insights,
      strategicRecommendations,
      executiveSummary,
      {
        timeframe: validatedArgs.timeframe,
        communicationStyle: validatedArgs.communicationStyle as ExecutiveAdvisorTone,
        focusArea: validatedArgs.focusArea,
        includeInvestorPitch: validatedArgs.includeInvestorPitch,
        maxSuggestions: validatedArgs.maxSuggestions,
        maxLength: validatedArgs.maxLength,
      },
      user.id,
      context
    );

    // Apply field-level access control
    const result = {
      executiveAdvice: applyFieldVisibility(executiveAdvice, 'executive-advisor', 'read'),
      timeframe: validatedArgs.timeframe,
    };

    return result;
  } catch (error) {
    console.error('Error generating executive advice:', error);
    throw new HttpError(500, 'Failed to generate executive advice');
  }
};
