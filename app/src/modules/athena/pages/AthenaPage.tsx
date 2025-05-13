/**
 * Athena Module - Business Intelligence Dashboard
 *
 * This is the main page for the Athena business intelligence module.
 * It displays analytics, growth metrics, and AI-generated business insights.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SentientAssistant } from '@src/shared/components/SentientAssistant';
import { PermissionGuard } from '@src/shared/components/auth/PermissionGuard';
import { useAthenaDashboard } from '../agentHooks';
import { TimeframeOption } from '../types';
import {
  AnalyticsDashboard,
  InsightsPanel,
  RecommendationsPanel,
  CampaignSuggestionsPanel,
  StrategicDecisionsPanel,
  ExecutiveSummaryPanel,
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

export default function AthenaDashboard() {
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

  // If user doesn't have permission to view the dashboard, show a message
  if (!canViewDashboard) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <div className="max-w-md rounded-lg bg-gray-800 p-8 shadow-lg">
          <h1 className="mb-4 text-2xl font-bold text-yellow-400">Access Restricted</h1>
          <p className="mb-6 text-gray-300">
            You don't have permission to access the Athena Business Intelligence Dashboard.
          </p>
          <Link
            to="/arcana"
            className="rounded-md bg-gray-700 px-4 py-2 font-medium text-white hover:bg-gray-600"
          >
            Return to Arcana Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 p-6 shadow-lg">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold text-yellow-400">Athena</h1>
          <p className="mt-2 text-gray-400">Business Intelligence & Decision Support</p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">
        {/* Timeframe Selector */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Business Intelligence Dashboard</h2>
          <div className="flex space-x-2">
            {Object.values(TimeframeOption).map((tf) => (
              <button
                type="button"
                key={tf}
                className={`rounded-md px-3 py-1 text-sm font-medium ${timeframe === tf
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                onClick={() => setTimeframe(tf as TimeframeOption)}
              >
                {tf.charAt(0).toUpperCase() + tf.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <div className="mb-6 rounded-lg bg-red-900 p-4 text-white">
            <h3 className="text-lg font-bold">Error</h3>
            <p>{error.message || 'An error occurred while loading data'}</p>
          </div>
        ) : (
          <>
            {/* Business Intelligence View - Wrapped with permission guard */}
            <PermissionGuard
              resource={BUSINESS_METRICS_RESOURCE}
              action={READ_ACTION}
              fallback={
                <div className="mb-6 rounded-lg bg-gray-800 p-4">
                  <p className="text-gray-400">
                    You don't have permission to view business metrics.
                  </p>
                </div>
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

            {/* Legacy Components (can be hidden or removed once BIView is fully implemented) */}
            {/* Analytics Dashboard */}
            <div className="hidden">
              <AnalyticsDashboard
                metrics={metrics || []}
                timeframe={timeframe}
                isLoading={isLoading}
                enableGlassmorphism={true}
                enableHaptics={true}
                onRefresh={() => console.log('Refreshing data...')}
              />
            </div>

            {/* Insights Panel */}
            <InsightsPanel insights={insights || []} isLoading={isLoading} />

            {/* Recommendations Panel */}
            <RecommendationsPanel
              recommendations={recommendations || []}
              isLoading={isLoading}
              onImplement={(id) => console.log('Implement recommendation:', id)}
            />

            {/* Campaign Suggestions Panel - Wrapped with permission guard */}
            <PermissionGuard
              resource={CAMPAIGN_SUGGESTIONS_RESOURCE}
              action={READ_ACTION}
              fallback={
                <div className="mb-6 rounded-lg bg-gray-800 p-4">
                  <p className="text-gray-400">
                    You don't have permission to view campaign suggestions.
                  </p>
                </div>
              }
            >
              <CampaignSuggestionsPanel
                campaigns={campaigns || []}
                isLoading={isLoading}
                onPlanCampaign={(id) => {
                  if (canExecuteCampaigns) {
                    console.log('Plan campaign:', id);
                  } else {
                    alert('You do not have permission to execute campaign suggestions.');
                  }
                }}
                canExecute={canExecuteCampaigns}
              />
            </PermissionGuard>

            {/* Strategic Decisions Panel - Wrapped with permission guard */}
            <PermissionGuard
              resource={STRATEGIC_DECISIONS_RESOURCE}
              action={READ_ACTION}
              fallback={
                <div className="mb-6 rounded-lg bg-gray-800 p-4">
                  <p className="text-gray-400">
                    You don't have permission to view strategic decisions.
                  </p>
                </div>
              }
            >
              <StrategicDecisionsPanel
                decisions={decisions || []}
                isLoading={isLoading}
                onResolveDecision={(decisionId, optionId) => {
                  if (canExecuteDecisions) {
                    console.log('Resolve decision:', decisionId, 'with option:', optionId);
                  } else {
                    alert('You do not have permission to execute strategic decisions.');
                  }
                }}
                canExecute={canExecuteDecisions}
              />
            </PermissionGuard>

            {/* Executive Summary Panel - Wrapped with permission guard */}
            <PermissionGuard
              resource={EXECUTIVE_SUMMARY_RESOURCE}
              action={READ_ACTION}
              fallback={
                <div className="mb-6 rounded-lg bg-gray-800 p-4">
                  <p className="text-gray-400">
                    You don't have permission to view executive summaries.
                  </p>
                </div>
              }
            >
              <ExecutiveSummaryPanel
                executiveSummary={executiveSummary}
                isLoading={isLoading}
                timeframe={timeframe}
                onRefresh={() => {
                  // Refresh the executive summary
                  console.log('Refreshing executive summary');
                }}
                onExportToNotion={(options) => {
                  if (canExecuteNotionExport) {
                    return exportToNotion(options);
                  }
                  return Promise.resolve({ success: false, error: 'Export not permitted' });
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
                className="rounded-md bg-yellow-600 px-4 py-2 font-medium text-white hover:bg-yellow-700"
              >
                Create Workflow from Insights
              </Link>
            </div>
          </>
        )}
      </main>

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
    </div>
  );
}
