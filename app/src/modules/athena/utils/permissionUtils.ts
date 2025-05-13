/**
 * Athena Module Permission Utilities
 *
 * This file contains constants and helper functions for Athena module permissions.
 */

import { useAuth } from 'wasp/client/auth';
import { usePermission } from '../../shared/components/auth/PermissionGuard';
import type { Resource, ResourceAction } from '../../api/middleware/rbac';

// Resource constants
export const ATHENA_RESOURCE: Resource = 'athena';
export const BUSINESS_METRICS_RESOURCE: Resource = 'business-metrics';
export const REVENUE_STREAMS_RESOURCE: Resource = 'revenue-streams';
export const ANALYTICS_REPORTS_RESOURCE: Resource = 'analytics-reports';
export const CAMPAIGN_SUGGESTIONS_RESOURCE: Resource = 'campaign-suggestions';
export const STRATEGIC_DECISIONS_RESOURCE: Resource = 'strategic-decisions';
export const MARKET_DATA_RESOURCE: Resource = 'market-data';
export const STRATEGIC_RECOMMENDATIONS_RESOURCE: Resource = 'strategic-recommendations';
export const EXECUTIVE_SUMMARY_RESOURCE: Resource = 'executive-summary';
export const EXECUTIVE_ADVISOR_RESOURCE: Resource = 'executive-advisor';
export const NOTION_EXPORT_RESOURCE: Resource = 'notion-export';

// Action constants
export const READ_ACTION: ResourceAction = 'read';
export const ANALYZE_ACTION: ResourceAction = 'analyze';
export const CONFIGURE_ACTION: ResourceAction = 'configure';
export const MANAGE_ACTION: ResourceAction = 'manage';
export const CREATE_ACTION: ResourceAction = 'create';
export const UPDATE_ACTION: ResourceAction = 'update';
export const DELETE_ACTION: ResourceAction = 'delete';
export const EXECUTE_ACTION: ResourceAction = 'execute';

/**
 * Hook to check if user can view the Athena dashboard
 */
export function useCanViewAthenaDashboard(): boolean {
  return usePermission(ATHENA_RESOURCE, READ_ACTION);
}

/**
 * Hook to check if user can analyze business metrics
 */
export function useCanAnalyzeBusinessMetrics(): boolean {
  return usePermission(BUSINESS_METRICS_RESOURCE, ANALYZE_ACTION);
}

/**
 * Hook to check if user can view business metrics
 */
export function useCanViewBusinessMetrics(): boolean {
  return usePermission(BUSINESS_METRICS_RESOURCE, READ_ACTION);
}

/**
 * Hook to check if user can configure Athena settings
 */
export function useCanConfigureAthena(): boolean {
  return usePermission(ATHENA_RESOURCE, CONFIGURE_ACTION);
}

/**
 * Hook to check if user can manage Athena
 */
export function useCanManageAthena(): boolean {
  return usePermission(ATHENA_RESOURCE, MANAGE_ACTION);
}

/**
 * Hook to check if user can view revenue streams
 */
export function useCanViewRevenueStreams(): boolean {
  return usePermission(REVENUE_STREAMS_RESOURCE, READ_ACTION);
}

/**
 * Hook to check if user can view analytics reports
 */
export function useCanViewAnalyticsReports(): boolean {
  return usePermission(ANALYTICS_REPORTS_RESOURCE, READ_ACTION);
}

/**
 * Hook to check if user can create analytics reports
 */
export function useCanCreateAnalyticsReports(): boolean {
  return usePermission(ANALYTICS_REPORTS_RESOURCE, CREATE_ACTION);
}

/**
 * Hook to check if user can view campaign suggestions
 */
export function useCanViewCampaignSuggestions(): boolean {
  return usePermission(CAMPAIGN_SUGGESTIONS_RESOURCE, READ_ACTION);
}

/**
 * Hook to check if user can execute campaign suggestions
 */
export function useCanExecuteCampaignSuggestions(): boolean {
  return usePermission(CAMPAIGN_SUGGESTIONS_RESOURCE, EXECUTE_ACTION);
}

/**
 * Hook to check if user can view strategic decisions
 */
export function useCanViewStrategicDecisions(): boolean {
  return usePermission(STRATEGIC_DECISIONS_RESOURCE, READ_ACTION);
}

/**
 * Hook to check if user can execute strategic decisions
 */
export function useCanExecuteStrategicDecisions(): boolean {
  return usePermission(STRATEGIC_DECISIONS_RESOURCE, EXECUTE_ACTION);
}

/**
 * Hook to check if user can view market data
 */
export function useCanViewMarketData(): boolean {
  return usePermission(MARKET_DATA_RESOURCE, READ_ACTION);
}

/**
 * Hook to check if user can view strategic recommendations
 */
export function useCanViewStrategicRecommendations(): boolean {
  return usePermission(STRATEGIC_RECOMMENDATIONS_RESOURCE, READ_ACTION);
}

/**
 * Hook to check if user can execute strategic recommendations
 */
export function useCanExecuteStrategicRecommendations(): boolean {
  return usePermission(STRATEGIC_RECOMMENDATIONS_RESOURCE, EXECUTE_ACTION);
}

/**
 * Hook to check if user can view executive summary
 */
export function useCanViewExecutiveSummary(): boolean {
  return usePermission(EXECUTIVE_SUMMARY_RESOURCE, READ_ACTION);
}

/**
 * Hook to check if user can view executive advisor
 */
export function useCanViewExecutiveAdvisor(): boolean {
  return usePermission(EXECUTIVE_ADVISOR_RESOURCE, READ_ACTION);
}

/**
 * Hook to check if user can execute Notion export
 */
export function useCanExecuteNotionExport(): boolean {
  return usePermission(NOTION_EXPORT_RESOURCE, EXECUTE_ACTION);
}

/**
 * Get permission requirements for Athena module features
 *
 * This is useful for displaying permission requirements in the UI
 */
export const ATHENA_PERMISSION_REQUIREMENTS = {
  viewDashboard: {
    resource: ATHENA_RESOURCE,
    action: READ_ACTION,
    description: 'View the Athena business intelligence dashboard'
  },
  analyzeMetrics: {
    resource: BUSINESS_METRICS_RESOURCE,
    action: ANALYZE_ACTION,
    description: 'Analyze business metrics and trends'
  },
  viewMetrics: {
    resource: BUSINESS_METRICS_RESOURCE,
    action: READ_ACTION,
    description: 'View business metrics'
  },
  configureAthena: {
    resource: ATHENA_RESOURCE,
    action: CONFIGURE_ACTION,
    description: 'Configure Athena settings and preferences'
  },
  manageAthena: {
    resource: ATHENA_RESOURCE,
    action: MANAGE_ACTION,
    description: 'Manage all Athena aspects'
  },
  viewRevenueStreams: {
    resource: REVENUE_STREAMS_RESOURCE,
    action: READ_ACTION,
    description: 'View revenue stream data'
  },
  viewAnalyticsReports: {
    resource: ANALYTICS_REPORTS_RESOURCE,
    action: READ_ACTION,
    description: 'View analytics reports'
  },
  createAnalyticsReports: {
    resource: ANALYTICS_REPORTS_RESOURCE,
    action: CREATE_ACTION,
    description: 'Create new analytics reports'
  },
  viewCampaignSuggestions: {
    resource: CAMPAIGN_SUGGESTIONS_RESOURCE,
    action: READ_ACTION,
    description: 'View campaign suggestions'
  },
  executeCampaignSuggestions: {
    resource: CAMPAIGN_SUGGESTIONS_RESOURCE,
    action: EXECUTE_ACTION,
    description: 'Execute campaign suggestions'
  },
  viewStrategicDecisions: {
    resource: STRATEGIC_DECISIONS_RESOURCE,
    action: READ_ACTION,
    description: 'View strategic decisions'
  },
  executeStrategicDecisions: {
    resource: STRATEGIC_DECISIONS_RESOURCE,
    action: EXECUTE_ACTION,
    description: 'Execute strategic decisions'
  },
  viewMarketData: {
    resource: MARKET_DATA_RESOURCE,
    action: READ_ACTION,
    description: 'View market data'
  },
  viewStrategicRecommendations: {
    resource: STRATEGIC_RECOMMENDATIONS_RESOURCE,
    action: READ_ACTION,
    description: 'View strategic recommendations'
  },
  executeStrategicRecommendations: {
    resource: STRATEGIC_RECOMMENDATIONS_RESOURCE,
    action: EXECUTE_ACTION,
    description: 'Execute strategic recommendations'
  },
  viewExecutiveSummary: {
    resource: EXECUTIVE_SUMMARY_RESOURCE,
    action: READ_ACTION,
    description: 'View executive summary'
  },
  viewExecutiveAdvisor: {
    resource: EXECUTIVE_ADVISOR_RESOURCE,
    action: READ_ACTION,
    description: 'View executive advisor'
  },
  executeNotionExport: {
    resource: NOTION_EXPORT_RESOURCE,
    action: EXECUTE_ACTION,
    description: 'Export data to Notion'
  }
};
