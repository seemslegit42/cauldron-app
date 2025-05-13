/**
 * Notion Export Service
 * 
 * This service provides functions for exporting data to Notion.
 */

import { 
  BusinessMetric, 
  BusinessInsight, 
  StrategicRecommendation,
  ExecutiveSummary,
  NotionExportOptions,
  TimeframeOption
} from '../types';
import { LoggingService } from '@src/shared/services/logging';
import { Client } from '@notionhq/client';

// Initialize Notion client
const initNotionClient = (notionApiKey: string) => {
  return new Client({ auth: notionApiKey });
};

/**
 * Exports data to Notion as a page
 */
export async function exportToNotionPage(
  options: NotionExportOptions,
  metrics: BusinessMetric[],
  insights: BusinessInsight[],
  recommendations: StrategicRecommendation[],
  executiveSummary: ExecutiveSummary,
  notionApiKey: string,
  userId: string
): Promise<{ success: boolean; pageUrl?: string; error?: string }> {
  try {
    // Log the operation
    LoggingService.info({
      message: 'Exporting data to Notion page',
      userId,
      module: 'athena',
      category: 'NOTION_EXPORT',
      metadata: {
        options,
        metricCount: metrics.length,
        insightCount: insights.length,
        recommendationCount: recommendations.length,
      },
    });

    // Initialize Notion client
    const notion = initNotionClient(notionApiKey);

    // Create page content
    const pageContent: any = {
      parent: {
        type: 'page_id',
        page_id: options.notionPageId || '',
      },
      properties: {
        title: {
          title: [
            {
              text: {
                content: `Business Intelligence Report - ${formatTimeframe(options.timeframe)}`,
              },
            },
          ],
        },
      },
      children: [],
    };

    // Add executive summary if requested
    if (options.includeExecutiveSummary && executiveSummary) {
      pageContent.children.push(
        {
          object: 'block',
          type: 'heading_1',
          heading_1: {
            rich_text: [{ type: 'text', text: { content: executiveSummary.title } }],
          },
        },
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{ type: 'text', text: { content: executiveSummary.summary } }],
          },
        },
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [{ type: 'text', text: { content: 'Key Metrics' } }],
          },
        }
      );

      // Add key metrics
      executiveSummary.keyMetrics.forEach(metric => {
        const trendIcon = metric.trend > 0 ? '↑' : metric.trend < 0 ? '↓' : '→';
        pageContent.children.push({
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: `${metric.name}: ${metric.value} ${trendIcon} (${metric.trend}%)`,
                },
              },
            ],
          },
        });
      });

      // Add key insights
      pageContent.children.push({
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: 'Key Insights' } }],
        },
      });

      executiveSummary.keyInsights.forEach(insight => {
        pageContent.children.push({
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [{ type: 'text', text: { content: insight } }],
          },
        });
      });

      // Add top recommendations
      pageContent.children.push({
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: 'Top Recommendations' } }],
        },
      });

      executiveSummary.topRecommendations.forEach(recommendation => {
        pageContent.children.push({
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [{ type: 'text', text: { content: recommendation } }],
          },
        });
      });
    }

    // Add metrics if requested
    if (options.includeMetrics && metrics.length > 0) {
      pageContent.children.push({
        object: 'block',
        type: 'heading_1',
        heading_1: {
          rich_text: [{ type: 'text', text: { content: 'Business Metrics' } }],
        },
      });

      // Group metrics by category
      const metricsByCategory = metrics.reduce((acc, metric) => {
        if (!acc[metric.category]) {
          acc[metric.category] = [];
        }
        acc[metric.category].push(metric);
        return acc;
      }, {} as Record<string, BusinessMetric[]>);

      // Add metrics by category
      for (const [category, categoryMetrics] of Object.entries(metricsByCategory)) {
        pageContent.children.push({
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [{ type: 'text', text: { content: formatCategory(category) } }],
          },
        });

        categoryMetrics.forEach(metric => {
          const percentChange = metric.percentChange
            ? ` (${metric.percentChange > 0 ? '+' : ''}${metric.percentChange.toFixed(2)}%)`
            : '';
          
          pageContent.children.push({
            object: 'block',
            type: 'bulleted_list_item',
            bulleted_list_item: {
              rich_text: [
                {
                  type: 'text',
                  text: {
                    content: `${metric.name}: ${metric.value} ${metric.unit}${percentChange}`,
                  },
                },
              ],
            },
          });
        });
      }
    }

    // Add insights if requested
    if (options.includeInsights && insights.length > 0) {
      pageContent.children.push({
        object: 'block',
        type: 'heading_1',
        heading_1: {
          rich_text: [{ type: 'text', text: { content: 'Business Insights' } }],
        },
      });

      insights.forEach(insight => {
        pageContent.children.push(
          {
            object: 'block',
            type: 'heading_3',
            heading_3: {
              rich_text: [
                {
                  type: 'text',
                  text: {
                    content: `${insight.title} (${formatImpactLevel(insight.impact)})`,
                  },
                },
              ],
            },
          },
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ type: 'text', text: { content: insight.description } }],
            },
          }
        );
      });
    }

    // Add recommendations if requested
    if (options.includeRecommendations && recommendations.length > 0) {
      pageContent.children.push({
        object: 'block',
        type: 'heading_1',
        heading_1: {
          rich_text: [{ type: 'text', text: { content: 'Strategic Recommendations' } }],
        },
      });

      recommendations.forEach(recommendation => {
        pageContent.children.push(
          {
            object: 'block',
            type: 'heading_3',
            heading_3: {
              rich_text: [
                {
                  type: 'text',
                  text: {
                    content: `${recommendation.title} (${formatImpactLevel(recommendation.impact)})`,
                  },
                },
              ],
            },
          },
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ type: 'text', text: { content: recommendation.description } }],
            },
          },
          {
            object: 'block',
            type: 'heading_3',
            heading_3: {
              rich_text: [{ type: 'text', text: { content: 'Action Items' } }],
            },
          }
        );

        // Add action items
        recommendation.actionItems.forEach(item => {
          pageContent.children.push({
            object: 'block',
            type: 'bulleted_list_item',
            bulleted_list_item: {
              rich_text: [{ type: 'text', text: { content: item } }],
            },
          });
        });

        // Add expected outcome
        pageContent.children.push(
          {
            object: 'block',
            type: 'heading_3',
            heading_3: {
              rich_text: [{ type: 'text', text: { content: 'Expected Outcome' } }],
            },
          },
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ type: 'text', text: { content: recommendation.expectedOutcome } }],
            },
          }
        );
      });
    }

    // Create the page in Notion
    const response = await notion.pages.create(pageContent);

    return {
      success: true,
      pageUrl: response.url,
    };
  } catch (error) {
    console.error('Error exporting to Notion:', error);
    LoggingService.error({
      message: 'Error exporting to Notion',
      userId,
      module: 'athena',
      category: 'NOTION_EXPORT',
      error: error as Error,
    });
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}

// Helper functions
function formatTimeframe(timeframe: TimeframeOption): string {
  const now = new Date();
  switch (timeframe) {
    case TimeframeOption.DAY:
      return `Daily Report - ${now.toLocaleDateString()}`;
    case TimeframeOption.WEEK:
      return `Weekly Report - ${now.toLocaleDateString()}`;
    case TimeframeOption.MONTH:
      return `Monthly Report - ${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
    case TimeframeOption.QUARTER:
      const quarter = Math.floor(now.getMonth() / 3) + 1;
      return `Q${quarter} Report - ${now.getFullYear()}`;
    case TimeframeOption.YEAR:
      return `Annual Report - ${now.getFullYear()}`;
    default:
      return `Business Report - ${now.toLocaleDateString()}`;
  }
}

function formatCategory(category: string): string {
  return category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' ');
}

function formatImpactLevel(impact: string): string {
  switch (impact) {
    case 'low':
      return 'Low Impact';
    case 'medium':
      return 'Medium Impact';
    case 'high':
      return 'High Impact';
    case 'critical':
      return 'Critical Impact';
    default:
      return impact;
  }
}
