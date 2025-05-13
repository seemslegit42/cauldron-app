/**
 * Enhanced Athena Module - Business Intelligence Dashboard
 *
 * This is the enhanced version of the Athena business intelligence module with cyberpunk styling.
 * It displays analytics, growth metrics, and AI-generated business insights.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SentientAssistant } from '@src/shared/components/SentientAssistant';
import { PermissionGuard } from '@src/shared/components/auth/PermissionGuard';
import { ModuleLayout } from '@src/shared/components/layout/ModuleLayout';
import { ModuleHeader } from '@src/shared/components/branding/ModuleHeader';
import { ModuleCard } from '@src/shared/components/branding/ModuleCard';
import { ModuleNavigation } from '@src/shared/components/branding/ModuleNavigation';
import { Button } from '@src/shared/components/ui/Button';
import { useAthenaDashboard } from '../agentHooks';
import { TimeframeOption } from '../types';
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  Lightbulb,
  Megaphone,
  Briefcase,
  FileText,
  Settings,
} from 'lucide-react';
import {
  BIView,
} from '../components';
import {
  ATHENA_RESOURCE,
  BUSINESS_METRICS_RESOURCE,
  CAMPAIGN_SUGGESTIONS_RESOURCE,
  STRATEGIC_DECISIONS_RESOURCE,
  MARKET_DATA_RESOURCE,
  STRATEGIC_RECOMMENDATIONS_RESOURCE,
  EXECUTIVE_SUMMARY_RESOURCE,
  EXECUTIVE_ADVISOR_RESOURCE,
  NOTION_EXPORT_RESOURCE,
  READ_ACTION,
  EXECUTE_ACTION,
  useCanViewAthenaDashboard,
  useCanViewBusinessMetrics,
  useCanViewCampaignSuggestions,
  useCanExecuteCampaignSuggestions,
  useCanViewStrategicDecisions,
  useCanExecuteStrategicDecisions,
  useCanViewMarketData,
  useCanViewStrategicRecommendations,
  useCanViewExecutiveSummary,
  useCanViewExecutiveAdvisor,
  useCanExecuteNotionExport,
} from '../utils/permissionUtils';

export default function EnhancedAthenaDashboard() {
  const [assistantMinimized, setAssistantMinimized] = useState(false);

  // Check permissions
  const canViewDashboard = useCanViewAthenaDashboard();
  const canViewMetrics = useCanViewBusinessMetrics();
  const canViewCampaigns = useCanViewCampaignSuggestions();
  const canExecuteCampaigns = useCanExecuteCampaignSuggestions();
  const canViewDecisions = useCanViewStrategicDecisions();
  const canExecuteDecisions = useCanExecuteStrategicDecisions();
  const canViewMarketData = useCanViewMarketData();
  const canViewStrategicRecommendations = useCanViewStrategicRecommendations();
  const canViewExecutiveSummary = useCanViewExecutiveSummary();
  const canViewExecutiveAdvisor = useCanViewExecutiveAdvisor();
  const canExecuteNotionExport = useCanExecuteNotionExport();

  // Use the Athena dashboard hook to get all data
  const {
    metrics,
    insights,
    recommendations,
    campaigns,
    decisions,
    marketData,
    strategicRecommendations,
    executiveSummary,
    timeframe,
    setTimeframe,
    isLoading,
    error,
    exportToNotion,
    isExporting,
    exportResult,
  } = useAthenaDashboard();

  // Navigation items
  const navigationItems = [
    { 
      label: 'Dashboard', 
      path: '/athena',
      icon: <BarChart3 className="h-5 w-5" />
    },
    { 
      label: 'Metrics', 
      path: '/athena/metrics',
      icon: <LineChart className="h-5 w-5" />
    },
    { 
      label: 'Market Data', 
      path: '/athena/market-data',
      icon: <PieChart className="h-5 w-5" />
    },
    { 
      label: 'Insights', 
      path: '/athena/insights',
      icon: <Lightbulb className="h-5 w-5" />
    },
    { 
      label: 'Campaigns', 
      path: '/athena/campaigns',
      icon: <Megaphone className="h-5 w-5" />
    },
    { 
      label: 'Strategic', 
      path: '/athena/strategic',
      icon: <Briefcase className="h-5 w-5" />
    },
    { 
      label: 'Executive', 
      path: '/athena/executive',
      icon: <FileText className="h-5 w-5" />
    },
    { 
      label: 'Settings', 
      path: '/athena/settings',
      icon: <Settings className="h-5 w-5" />
    },
  ];

  // If user doesn't have permission to view the dashboard, show a message
  if (!canViewDashboard) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <ModuleCard
          moduleId="athena"
          title="Access Restricted"
          className="max-w-md"
        >
          <p className="mb-6 text-gray-300">
            You don't have permission to access the Athena Business Intelligence Dashboard.
          </p>
          <Link
            to="/arcana"
            className="rounded-md bg-gray-700 px-4 py-2 font-medium text-white hover:bg-gray-600"
          >
            Return to Arcana Dashboard
          </Link>
        </ModuleCard>
      </div>
    );
  }

  // Header with timeframe selector
  const header = (
    <ModuleHeader
      moduleId="athena"
      title="Athena"
      description="Business Intelligence & Decision Support"
      icon={<BarChart3 />}
      actions={
        <div className="flex space-x-2">
          {Object.values(TimeframeOption).map((tf) => (
            <button
              type="button"
              key={tf}
              className={`rounded-md px-3 py-1 text-sm font-medium ${timeframe === tf
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              onClick={() => setTimeframe(tf as TimeframeOption)}
            >
              {tf.charAt(0).toUpperCase() + tf.slice(1)}
            </button>
          ))}
        </div>
      }
    />
  );

  // Sidebar with navigation
  const sidebar = (
    <div className="h-full p-4">
      <div className="mb-8 flex items-center justify-center">
        <h2 className="text-xl font-bold text-blue-400">Athena</h2>
      </div>
      <ModuleNavigation
        moduleId="athena"
        items={navigationItems}
      />
    </div>
  );

  return (
    <ModuleLayout
      moduleId="athena"
      title="Athena"
      header={header}
      sidebar={sidebar}
      pattern="dots"
      patternOpacity={0.1}
      glowIntensity="medium"
      glowPositions={['top-right', 'bottom-left']}
      animate={true}
    >
      {error ? (
        <ModuleCard
          moduleId="athena"
          title="Error"
          className="mb-6"
        >
          <p>{error.message || 'An error occurred while loading data'}</p>
        </ModuleCard>
      ) : (
        <>
          {/* Business Intelligence View - Wrapped with permission guard */}
          <PermissionGuard
            resource={BUSINESS_METRICS_RESOURCE}
            action={READ_ACTION}
            fallback={
              <ModuleCard
                moduleId="athena"
                title="Access Restricted"
                className="mb-6"
              >
                <p className="text-gray-400">
                  You don't have permission to view business metrics.
                </p>
              </ModuleCard>
            }
          >
            <BIView
              metrics={metrics || []}
              insights={insights || []}
              recommendations={recommendations || []}
              timeframe={timeframe}
              isLoading={isLoading}
              error={error}
              onTimeframeChange={setTimeframe}
              onRefresh={() => console.log('Refreshing data...')}
              onInsightAccept={(id) => console.log('Accepting insight:', id)}
              onInsightSnooze={(id) => console.log('Snoozing insight:', id)}
              onQuerySubmit={async (query) => {
                console.log('Query submitted:', query);
                return `This is a placeholder response for your query: "${query}". In a real implementation, this would connect to the AI service.`;
              }}
            />
          </PermissionGuard>

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            <div className="flex space-x-2">
              <Link
                to="/arcana"
                className="rounded-md bg-gray-700 px-4 py-2 font-medium text-white hover:bg-gray-600"
              >
                Return to Arcana Dashboard
              </Link>
              {canViewExecutiveAdvisor && (
                <Link
                  to="/athena/executive-advisor"
                  className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                >
                  Executive Advisor
                </Link>
              )}
            </div>
            <Link
              to="/forgeflow"
              className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
            >
              Create Workflow from Insights
            </Link>
          </div>
        </>
      )}

      {/* Sentient Assistant */}
      <div className="fixed right-4 bottom-4 z-10 w-96">
        <SentientAssistant
          module="athena"
          initialPrompt="What insights can you provide about my business performance this week?"
          minimized={assistantMinimized}
          onMinimize={() => setAssistantMinimized(true)}
          onMaximize={() => setAssistantMinimized(false)}
        />
      </div>
    </ModuleLayout>
  );
}
