import React, { useState } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import { useUser } from 'wasp/client/auth';
import { cn } from '@src/shared/utils/cn';
import { getGlassmorphismClasses } from '@src/shared/utils/glassmorphism';
import { CauldronLayout } from '@src/shared/components/layout/CauldronLayout';
import { SentientLoopPanel } from '@src/shared/components/SentientLoop/SentientLoopPanel';
import { SentientLoopPhase } from '@src/shared/components/SentientLoop/SentientLoopIndicator';
import { Button } from '@src/shared/components/ui/Button';
import { PermissionGuard } from '@src/shared/components/auth/PermissionGuard';
import {
  getUserContext,
  getBusinessMetrics,
  getSentientRecommendations,
  getActiveWorkflows,
  getSystemNotices,
  getRiskLevels,
  getSentientActions,
  getSentientInsights,
  getChiefOfStaffTasks,
  executeSentientAction,
} from '../api/operations';

import {
  ARCANA_RESOURCE,
  SENTIENT_LOOP_RESOURCE,
  USER_CONTEXT_RESOURCE,
  DASHBOARD_WIDGETS_RESOURCE,
  AI_ASSISTANT_RESOURCE,
  CHIEF_OF_STAFF_RESOURCE,
  READ_ACTION,
  USE_ACTION,
  CONFIGURE_ACTION,
  useCanViewArcanaDashboard,
  useCanUseSentientLoop,
  useCanUseAIAssistant,
  useCanUseChiefOfStaff,
  useCanViewChiefOfStaffTasks,
} from '../utils/permissionUtils';

/**
 * ArcanaPageNew - Redesigned dashboard for the Cauldron™ DOP
 * 
 * Features:
 * - Personalized executive summary
 * - Key metrics board
 * - AI prompt assistant
 * - Sentient Loop™ interface
 * - Module widgets
 */
export default function ArcanaPageNew() {
  const { data: user } = useUser();
  const { data: userContext, isLoading: isLoadingContext } = useQuery(getUserContext);
  const { data: businessMetrics, isLoading: isLoadingMetrics } = useQuery(getBusinessMetrics);
  const { data: recommendations, isLoading: isLoadingRecommendations } = useQuery(getSentientRecommendations);
  const { data: workflows, isLoading: isLoadingWorkflows } = useQuery(getActiveWorkflows);
  const { data: systemNotices, isLoading: isLoadingNotices } = useQuery(getSystemNotices);
  const { data: riskLevels, isLoading: isLoadingRiskLevels } = useQuery(getRiskLevels);
  const { data: sentientActions, isLoading: isLoadingSentientActions } = useQuery(getSentientActions);
  const { data: sentientInsights, isLoading: isLoadingSentientInsights } = useQuery(getSentientInsights);
  const { data: chiefOfStaffTasks, isLoading: isLoadingChiefOfStaffTasks } = useQuery(getChiefOfStaffTasks);

  const executeAction = useAction(executeSentientAction);

  const [currentPhase, setCurrentPhase] = useState<SentientLoopPhase>('idle');
  const [showSentientLoop, setShowSentientLoop] = useState(false);

  // Check permissions
  const canViewDashboard = useCanViewArcanaDashboard();
  const canUseSentientLoop = useCanUseSentientLoop();
  const canUseAIAssistant = useCanUseAIAssistant();
  const canUseChiefOfStaff = useCanUseChiefOfStaff();
  const canViewChiefOfStaffTasks = useCanViewChiefOfStaffTasks();

  // Handle phase change
  const handlePhaseChange = (phase: SentientLoopPhase) => {
    setCurrentPhase(phase);
  };

  // Handle Sentient Loop completion
  const handleSentientLoopComplete = () => {
    setShowSentientLoop(false);
  };

  // Parse JSON data from userContext
  const metrics = userContext?.metrics ? JSON.parse(userContext.metrics as string) : {};
  const projects = userContext?.projects ? JSON.parse(userContext.projects as string) : [];
  const decisions = userContext?.decisions ? JSON.parse(userContext.decisions as string) : [];
  const goals = userContext?.goals ? JSON.parse(userContext.goals as string) : [];

  // If user doesn't have permission to view the dashboard, show a message
  if (!canViewDashboard) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <div className={cn(
          "max-w-md rounded-lg p-8",
          getGlassmorphismClasses({
            level: 'medium',
            border: true,
            shadow: true,
          })
        )}>
          <h1 className="mb-4 text-2xl font-bold text-blue-400">Access Restricted</h1>
          <p className="mb-6 text-gray-300">
            You don't have permission to access the Arcana Dashboard.
          </p>
          <Button
            onClick={() => window.location.href = '/'}
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <CauldronLayout activeModule="arcana">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Executive Summary */}
        <div className="lg:col-span-2">
          {/* Hero Panel */}
          <div className={cn(
            "mb-6 overflow-hidden rounded-lg",
            getGlassmorphismClasses({
              level: 'medium',
              border: true,
              shadow: true,
            })
          )}>
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Welcome back, {user?.username || 'User'}
                  </h1>
                  <p className="text-gray-400">
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <PermissionGuard
                  resource={SENTIENT_LOOP_RESOURCE}
                  action={USE_ACTION}
                  fallback={<div />}
                >
                  <Button
                    onClick={() => setShowSentientLoop(true)}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    <span className="mr-2">Run Morning Briefing</span>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </Button>
                </PermissionGuard>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {isLoadingMetrics ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="rounded-lg bg-gray-800/50 p-4">
                      <div className="h-6 w-24 animate-pulse rounded bg-gray-700"></div>
                      <div className="mt-2 h-8 w-16 animate-pulse rounded bg-gray-700"></div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="rounded-lg bg-gray-800/50 p-4">
                      <div className="mb-1 flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-400">Revenue Today</h3>
                        <span className="text-xs text-green-400">+12%</span>
                      </div>
                      <p className="text-2xl font-bold text-white">$12,486</p>
                    </div>
                    <div className="rounded-lg bg-gray-800/50 p-4">
                      <div className="mb-1 flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-400">Threat Index</h3>
                        <span className="text-xs text-yellow-400">Medium</span>
                      </div>
                      <p className="text-2xl font-bold text-white">67/100</p>
                    </div>
                    <div className="rounded-lg bg-gray-800/50 p-4">
                      <div className="mb-1 flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-400">Top Trend</h3>
                        <span className="text-xs text-blue-400">Growing</span>
                      </div>
                      <p className="text-2xl font-bold text-white">Email CTR</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sentient Loop Panel (conditionally rendered) */}
          {showSentientLoop && (
            <div className="mb-6">
              <SentientLoopPanel
                initialPhase="wake"
                onPhaseChange={handlePhaseChange}
                onComplete={handleSentientLoopComplete}
              />
            </div>
          )}

          {/* System Notices */}
          <div className={cn(
            "mb-6 overflow-hidden rounded-lg",
            getGlassmorphismClasses({
              level: 'medium',
              border: true,
              shadow: true,
            })
          )}>
            <div className="border-b border-gray-700/50 p-4">
              <h2 className="text-lg font-semibold text-white">System Notices</h2>
            </div>
            <div className="p-4">
              {isLoadingNotices ? (
                <div className="flex h-24 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
                </div>
              ) : systemNotices && systemNotices.length > 0 ? (
                <div className="space-y-4">
                  {systemNotices.slice(0, 3).map((notice: any) => (
                    <div key={notice.id} className="rounded-lg bg-gray-800/50 p-4">
                      <div className="mb-2 flex items-center space-x-2">
                        <svg className={cn(
                          "h-5 w-5",
                          notice.type === 'warning' ? "text-yellow-400" :
                            notice.type === 'error' ? "text-red-400" :
                              notice.type === 'success' ? "text-green-400" :
                                "text-blue-400"
                        )} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-sm font-medium text-white">{notice.title}</h3>
                      </div>
                      <p className="text-xs text-gray-300">{notice.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-400">
                  <p>No system notices at this time.</p>
                </div>
              )}
            </div>
          </div>

          {/* Key Metrics Board */}
          <div className={cn(
            "mb-6 overflow-hidden rounded-lg",
            getGlassmorphismClasses({
              level: 'medium',
              border: true,
              shadow: true,
            })
          )}>
            <div className="border-b border-gray-700/50 p-4">
              <h2 className="text-lg font-semibold text-white">Key Metrics</h2>
            </div>
            <div className="p-6">
              {isLoadingMetrics ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {Array(4).fill(0).map((_, i) => (
                    <div key={i} className="rounded-lg bg-gray-800/50 p-4">
                      <div className="h-6 w-32 animate-pulse rounded bg-gray-700"></div>
                      <div className="mt-2 h-8 w-24 animate-pulse rounded bg-gray-700"></div>
                      <div className="mt-4 h-32 w-full animate-pulse rounded bg-gray-700"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {/* Revenue Metric */}
                  <div className="rounded-lg bg-gray-800/50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-sm font-medium text-white">Monthly Revenue</h3>
                      <span className="rounded-full bg-green-900 px-2 py-0.5 text-xs font-medium text-green-200">+8.2%</span>
                    </div>
                    <p className="mb-4 text-2xl font-bold text-white">$284,521</p>
                    <div className="h-32 w-full bg-gray-700/50">
                      {/* Placeholder for chart */}
                      <div className="flex h-full items-center justify-center">
                        <span className="text-xs text-gray-400">Revenue Chart</span>
                      </div>
                    </div>
                  </div>

                  {/* User Engagement Metric */}
                  <div className="rounded-lg bg-gray-800/50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-sm font-medium text-white">User Engagement</h3>
                      <span className="rounded-full bg-blue-900 px-2 py-0.5 text-xs font-medium text-blue-200">+12.5%</span>
                    </div>
                    <p className="mb-4 text-2xl font-bold text-white">24.8k</p>
                    <div className="h-32 w-full bg-gray-700/50">
                      {/* Placeholder for chart */}
                      <div className="flex h-full items-center justify-center">
                        <span className="text-xs text-gray-400">Engagement Chart</span>
                      </div>
                    </div>
                  </div>

                  {/* Conversion Rate Metric */}
                  <div className="rounded-lg bg-gray-800/50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-sm font-medium text-white">Conversion Rate</h3>
                      <span className="rounded-full bg-yellow-900 px-2 py-0.5 text-xs font-medium text-yellow-200">-2.1%</span>
                    </div>
                    <p className="mb-4 text-2xl font-bold text-white">3.2%</p>
                    <div className="h-32 w-full bg-gray-700/50">
                      {/* Placeholder for chart */}
                      <div className="flex h-full items-center justify-center">
                        <span className="text-xs text-gray-400">Conversion Chart</span>
                      </div>
                    </div>
                  </div>

                  {/* Security Score Metric */}
                  <div className="rounded-lg bg-gray-800/50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-sm font-medium text-white">Security Score</h3>
                      <span className="rounded-full bg-green-900 px-2 py-0.5 text-xs font-medium text-green-200">Stable</span>
                    </div>
                    <p className="mb-4 text-2xl font-bold text-white">87/100</p>
                    <div className="h-32 w-full bg-gray-700/50">
                      {/* Placeholder for chart */}
                      <div className="flex h-full items-center justify-center">
                        <span className="text-xs text-gray-400">Security Chart</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Widgets */}
        <div>
          {/* AI Prompt Assistant */}
          <PermissionGuard
            resource={AI_ASSISTANT_RESOURCE}
            action={USE_ACTION}
            fallback={
              <div className={cn(
                "mb-6 overflow-hidden rounded-lg",
                getGlassmorphismClasses({
                  level: 'heavy',
                  border: true,
                  shadow: true,
                })
              )}>
                <div className="p-6 text-center">
                  <p className="text-gray-400">
                    You don't have permission to use the AI assistant.
                  </p>
                </div>
              </div>
            }
          >
            <div className={cn(
              "mb-6 overflow-hidden rounded-lg",
              getGlassmorphismClasses({
                level: 'heavy',
                border: true,
                shadow: true,
              })
            )}>
              <div className="border-b border-gray-700/50 p-4">
                <h2 className="text-lg font-semibold text-white">AI Assistant</h2>
              </div>
              <div className="p-4">
                <div className="mb-4 max-h-64 overflow-y-auto rounded-lg bg-gray-800/50 p-4">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="mr-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-white">
                        AI
                      </div>
                      <div className="rounded-lg bg-gray-700 p-3">
                        <p className="text-sm text-white">How can I assist you today?</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex">
                  <input
                    type="text"
                    className="flex-1 rounded-l-md border border-gray-700 bg-gray-800 px-4 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    placeholder="Ask a question or give a command..."
                  />
                  <button type="button" className="rounded-r-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </PermissionGuard>

          {/* Recommendations Panel */}
          <div className={cn(
            "mb-6 overflow-hidden rounded-lg",
            getGlassmorphismClasses({
              level: 'medium',
              border: true,
              shadow: true,
            })
          )}>
            <div className="border-b border-gray-700/50 p-4">
              <h2 className="text-lg font-semibold text-white">Recommendations</h2>
            </div>
            <div className="p-4">
              {isLoadingRecommendations ? (
                <div className="space-y-4">
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="rounded-lg bg-gray-800/50 p-4">
                      <div className="mb-2 h-6 w-48 animate-pulse rounded bg-gray-700"></div>
                      <div className="mb-3 h-4 w-full animate-pulse rounded bg-gray-700"></div>
                      <div className="flex justify-end">
                        <div className="h-8 w-16 animate-pulse rounded bg-gray-700"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recommendations && recommendations.length > 0 ? (
                <div className="space-y-4">
                  {recommendations.slice(0, 3).map((recommendation: any) => (
                    <div key={recommendation.id} className="rounded-lg bg-gray-800/50 p-4">
                      <div className="mb-2 flex items-center space-x-2">
                        <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <h3 className="text-sm font-medium text-white">{recommendation.title}</h3>
                      </div>
                      <p className="mb-3 text-xs text-gray-300">{recommendation.description}</p>
                      <div className="flex justify-end">
                        <Button size="sm" variant="outline">Apply</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-400">
                  <p>No recommendations at this time.</p>
                </div>
              )}
            </div>
          </div>

          {/* Module Status */}
          <div className={cn(
            "overflow-hidden rounded-lg",
            getGlassmorphismClasses({
              level: 'medium',
              border: true,
              shadow: true,
            })
          )}>
            <div className="border-b border-gray-700/50 p-4">
              <h2 className="text-lg font-semibold text-white">Module Status</h2>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm text-white">Phantom</span>
                  </div>
                  <span className="text-xs text-gray-400">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm text-white">Athena</span>
                  </div>
                  <span className="text-xs text-gray-400">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                    <span className="text-sm text-white">Forgeflow</span>
                  </div>
                  <span className="text-xs text-gray-400">Processing</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm text-white">Sentinel</span>
                  </div>
                  <span className="text-xs text-gray-400">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-gray-500" />
                    <span className="text-sm text-white">Manifold</span>
                  </div>
                  <span className="text-xs text-gray-400">Idle</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CauldronLayout>
  );
}
