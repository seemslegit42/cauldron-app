/**
 * EnhancedArcanaPage Component
 *
 * The fully interactive Cauldron™ Sentient UI shell that powers the Sentient Loop™.
 * This is an enhanced version of the Arcana dashboard with advanced UI features.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useAction } from 'wasp/client/operations';
import { useUser } from 'wasp/client/auth';
import { Link } from 'react-router-dom';
import { cn } from '@src/shared/utils/cn';
import { getGlassmorphismClasses } from '@src/shared/utils/glassmorphism';
import { PermissionGuard } from '@src/shared/components/auth/PermissionGuard';
import { ModuleSettingsButton } from '@src/shared/components/settings/ModuleSettingsButton';
import { DarkModeToggle } from '@src/shared/components/DarkModeToggle';
import { DarkModeProvider } from '@src/shared/theme/DarkModeProvider';
import { GlassmorphicCard } from '@src/shared/components/branding/GlassmorphicCard';
import { ModuleHeader } from '@src/shared/components/branding/ModuleHeader';
import { CyberpunkBackground } from '@src/shared/components/branding/CyberpunkBackground';

// Import operations
import {
  getUserContext,
  updateUserPersona,
  getBusinessMetrics,
  getSentientRecommendations,
  getActiveWorkflows,
  getUserWidgets,
  updateUserWidgets,
  updateDecisionStatus,
  getSystemNotices,
  getRiskLevels,
  getSentientActions,
  getSentientInsights,
  getChiefOfStaffTasks,
  executeSentientAction,
} from '../api/operations';

// Import our enhanced components
import { UserPulse } from '../components/UserPulse';
import { EnhancedSentientLoopPanel } from '../components/EnhancedSentientLoopPanel';
import { OpsBriefingFeed } from '../components/OpsBriefingFeed';
import { AiPromptAssistant } from '../components/AiPromptAssistant';
import { SentinelRiskLight } from '../components/SentinelRiskLight';
import { MetricsSummary } from '../components/MetricsSummary';
import { SystemNotices } from '../components/SystemNotices';
import { RiskLevelIndicator } from '../components/RiskLevelIndicator';
import { ArcanaNav } from '../components/ArcanaNav';

// Import existing components
import { HeroPanel } from '../components/HeroPanel';
import { KeyMetricsBoard } from '../components/KeyMetricsBoard';
import { ForgeflowWidget } from '../components/ForgeflowWidget';
import { AdaptivePersonaMode } from '../components/AdaptivePersonaMode';
import { RecommendationsPanel } from '../components/RecommendationsPanel';
import { PromptAssistant } from '../components/PromptAssistant';
import { DecisionPreviewPanel } from '../components/DecisionPreviewPanel';
import { UserConfigurableWidgets } from '../components/UserConfigurableWidgets';
import { AgentUpdates } from '../components/AgentUpdates';
import { RecentActions } from '../components/RecentActions';
import { SentientInsightsPanel } from '../components/SentientInsightsPanel';
import { ChiefOfStaffPanel } from '../components/ChiefOfStaffPanel';
import { LangGraphSummaryWidget } from '../components/LangGraphSummaryWidget';

// Import Lucide icons
import {
  Zap,
  Brain,
  Shield,
  BarChart3,
  Settings,
  Menu,
  Bell,
  ChevronRight,
  ChevronDown,
  Plus,
  RefreshCw,
  Command,
  Sparkles,
  Cpu
} from 'lucide-react';

// Import permission utilities
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
 * EnhancedArcanaPage - The fully interactive Cauldron™ Sentient UI shell
 */
export default function EnhancedArcanaPage() {
  // User and context
  const { data: user, isLoading: isLoadingUser } = useUser();
  const { data: userContext, isLoading: isLoadingContext } = useQuery(getUserContext);

  // Queries
  const { data: businessMetrics, isLoading: isLoadingMetrics } = useQuery(getBusinessMetrics);
  const { data: recommendations, isLoading: isLoadingRecommendations } = useQuery(getSentientRecommendations);
  const { data: workflows, isLoading: isLoadingWorkflows } = useQuery(getActiveWorkflows);
  const { data: systemNotices, isLoading: isLoadingNotices } = useQuery(getSystemNotices);
  const { data: riskLevels, isLoading: isLoadingRiskLevels } = useQuery(getRiskLevels);
  const { data: sentientActions, isLoading: isLoadingSentientActions } = useQuery(getSentientActions);
  const { data: sentientInsights, isLoading: isLoadingSentientInsights } = useQuery(getSentientInsights);
  const { data: chiefOfStaffTasks, isLoading: isLoadingChiefOfStaffTasks } = useQuery(getChiefOfStaffTasks);

  // Actions
  const updatePersona = useAction(updateUserPersona);
  const executeAction = useAction(executeSentientAction);

  // State
  const [activePersona, setActivePersona] = useState<'hacker-ceo' | 'podcast-mogul' | 'enterprise-admin' | 'ai-researcher'>('hacker-ceo');
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentSentientPhase, setCurrentSentientPhase] = useState<'wake' | 'detect' | 'decide' | 'act' | 'reflect'>('wake');
  const [enableHaptics, setEnableHaptics] = useState(true);
  const [enableSound, setEnableSound] = useState(true);
  const [enableAnimations, setEnableAnimations] = useState(true);

  // Check permissions
  const canViewDashboard = useCanViewArcanaDashboard();
  const canUseSentientLoop = useCanUseSentientLoop();
  const canUseAIAssistant = useCanUseAIAssistant();
  const canUseChiefOfStaff = useCanUseChiefOfStaff();

  // Update persona when userContext changes
  useEffect(() => {
    if (userContext?.persona) {
      setActivePersona(userContext.persona as any);
    }
  }, [userContext]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command palette: Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle persona change
  const handlePersonaChange = (persona: 'hacker-ceo' | 'podcast-mogul' | 'enterprise-admin' | 'ai-researcher') => {
    setActivePersona(persona);
    updatePersona({ persona });
  };

  // Get persona-specific styles
  const getPersonaStyles = () => {
    switch (activePersona) {
      case 'hacker-ceo':
        return {
          headerBg: 'bg-gradient-to-r from-gray-900 to-blue-900',
          accentColor: 'text-blue-400',
          borderAccent: 'border-blue-500',
          buttonBg: 'bg-blue-600 hover:bg-blue-700',
          glow: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]',
        };
      case 'podcast-mogul':
        return {
          headerBg: 'bg-gradient-to-r from-gray-900 to-pink-900',
          accentColor: 'text-pink-400',
          borderAccent: 'border-pink-500',
          buttonBg: 'bg-pink-600 hover:bg-pink-700',
          glow: 'shadow-[0_0_15px_rgba(236,72,153,0.3)]',
        };
      case 'enterprise-admin':
        return {
          headerBg: 'bg-gradient-to-r from-gray-900 to-green-900',
          accentColor: 'text-green-400',
          borderAccent: 'border-green-500',
          buttonBg: 'bg-green-600 hover:bg-green-700',
          glow: 'shadow-[0_0_15px_rgba(34,197,94,0.3)]',
        };
      case 'ai-researcher':
        return {
          headerBg: 'bg-gradient-to-r from-gray-900 to-purple-900',
          accentColor: 'text-purple-400',
          borderAccent: 'border-purple-500',
          buttonBg: 'bg-purple-600 hover:bg-purple-700',
          glow: 'shadow-[0_0_15px_rgba(147,51,234,0.3)]',
        };
      default:
        return {
          headerBg: 'bg-gray-800',
          accentColor: 'text-blue-400',
          borderAccent: 'border-blue-500',
          buttonBg: 'bg-blue-600 hover:bg-blue-700',
          glow: '',
        };
    }
  };

  const personaStyles = getPersonaStyles();

  // If user doesn't have permission to view the dashboard, show a message
  if (!canViewDashboard) {
    return (
      <CyberpunkBackground moduleId="arcana" pattern="grid" glowIntensity="low" className="flex min-h-screen items-center justify-center text-white">
        <GlassmorphicCard moduleId="arcana" level="medium" border shadow glow className="max-w-md p-8">
          <h1 className="mb-4 text-2xl font-bold text-arcana-purple-400">Access Restricted</h1>
          <p className="mb-6 text-gray-300">
            You don't have permission to access the Arcana Dashboard. Your neural interface requires additional clearance.
          </p>
          <Link
            to="/"
            className="rounded-md bg-arcana-purple-600 px-4 py-2 font-medium text-white hover:bg-arcana-purple-700"
          >
            Return to Home
          </Link>
        </GlassmorphicCard>
      </CyberpunkBackground>
    );
  }

  // Loading state
  if (isLoadingUser || isLoadingContext) {
    return (
      <CyberpunkBackground moduleId="arcana" pattern="grid" glowIntensity="low" className="flex min-h-screen items-center justify-center">
        <GlassmorphicCard moduleId="arcana" level="light" border shadow glow className="p-8 flex items-center justify-center">
          <motion.div
            className="h-16 w-16 rounded-full border-4 border-arcana-purple-500 border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          <p className="ml-4 text-arcana-purple-300">Initializing neural interface...</p>
        </GlassmorphicCard>
      </CyberpunkBackground>
    );
  }

  return (
    <DarkModeProvider initialDarkMode={true}>
      <CyberpunkBackground
        moduleId="arcana"
        pattern="grid"
        patternOpacity={0.1}
        glowIntensity="medium"
        glowPositions={['top-right', 'bottom-left']}
        animate={enableAnimations}
        className="min-h-screen text-white relative"
      >

        {/* Header */}
        <header className={`sticky top-0 z-10 border-b border-gray-800 backdrop-blur-md ${personaStyles.headerBg}`}>
          <div className="mx-auto max-w-7xl px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Logo and Title */}
              <div className="flex items-center">
                <motion.div
                  className={`mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white ${personaStyles.glow}`}
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 2, 0, -2, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    repeatType: "loop"
                  }}
                >
                  <Cpu className="h-6 w-6" />
                </motion.div>
                <div>
                  <h1 className={`text-2xl font-bold ${personaStyles.accentColor}`}>Arcana</h1>
                  <p className="text-xs text-gray-400">Cauldron™ Sentient UI</p>
                </div>
              </div>

              {/* Command Palette Trigger */}
              <button type="button"
                className="hidden md:flex items-center rounded-md border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-gray-400 hover:bg-gray-700"
                onClick={() => setShowCommandPalette(true)}
              >
                <Command className="mr-2 h-4 w-4" />
                <span>Command</span>
                <span className="ml-2 rounded bg-gray-700 px-1.5 py-0.5 text-xs">⌘K</span>
              </button>

              {/* Actions */}
              <div className="flex items-center space-x-3">
                {/* Notifications */}
                <button type="button" title="Notifications"
                  className="relative rounded-full bg-gray-800 p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-gray-900"></span>
                </button>

                {/* Dark Mode Toggle */}
                <DarkModeToggle />

                {/* Module Settings */}
                <ModuleSettingsButton
                  moduleId="arcana"
                  variant="icon"
                  position="inline"
                />
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl p-4 md:p-6">
          {/* User Pulse - Adaptive header with identity-aware data */}
          <div className="mb-6">
            <UserPulse
              enableHaptics={enableHaptics}
              enableSound={enableSound}
              enableAnimations={enableAnimations}
              onPersonaChange={handlePersonaChange}
            />
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Left Column - Navigation and Sentient Loop */}
            <div className="space-y-6">
              {/* Arcana Navigation */}
              <ArcanaNav />

              {/* Sentient Loop Panel - The core of the Sentient Loop™ experience */}
              <PermissionGuard
                resource={SENTIENT_LOOP_RESOURCE}
                action={USE_ACTION}
                fallback={
                  <GlassmorphicCard moduleId="arcana" level="medium" border shadow className="p-4">
                    <p className="text-gray-400">
                      You don't have permission to use the Sentient Loop™. Please contact your administrator for access.
                    </p>
                  </GlassmorphicCard>
                }
              >
                <EnhancedSentientLoopPanel
                  initialPhase={currentSentientPhase}
                  onPhaseChange={setCurrentSentientPhase}
                  enableHaptics={enableHaptics}
                  enableSound={enableSound}
                />
              </PermissionGuard>

              {/* Risk Level Indicator */}
              <RiskLevelIndicator
                riskLevels={riskLevels || { overall: 'medium', security: 'medium', operations: 'low' }}
                loading={isLoadingRiskLevels}
              />
            </div>

            {/* Middle Column - Main Content */}
            <div className="space-y-6 md:col-span-2">
              {/* AI Prompt Assistant */}
              <PermissionGuard
                resource={AI_ASSISTANT_RESOURCE}
                action={USE_ACTION}
                fallback={
                  <GlassmorphicCard moduleId="arcana" level="medium" border shadow className="p-4">
                    <p className="text-gray-400">
                      You don't have permission to use the AI assistant. Your digital companion awaits approval.
                    </p>
                  </GlassmorphicCard>
                }
              >
                <PromptAssistant module="arcana" />
              </PermissionGuard>

              {/* Ops Briefing Feed - Aggregated intelligence from Athena, Phantom, and Sentinel */}
              <OpsBriefingFeed />

              {/* Metrics Summary */}
              <MetricsSummary metrics={businessMetrics || []} loading={isLoadingMetrics} />

              {/* System Notices & Alerts */}
              <SystemNotices
                notices={systemNotices || []}
                loading={isLoadingNotices}
              />

              {/* Chief of Staff Panel */}
              <PermissionGuard
                resource={CHIEF_OF_STAFF_RESOURCE}
                action={READ_ACTION}
                fallback={
                  <GlassmorphicCard moduleId="arcana" level="medium" border shadow className="p-4">
                    <p className="text-gray-400">
                      You don't have permission to use the Chief of Staff. Your executive AI is on vacation in the digital Bahamas.
                    </p>
                  </GlassmorphicCard>
                }
              >
                <ChiefOfStaffPanel
                  tasks={chiefOfStaffTasks || []}
                  loading={isLoadingChiefOfStaffTasks}
                />
              </PermissionGuard>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-800 bg-gray-900 py-4">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex flex-col items-center justify-between space-y-2 md:flex-row md:space-y-0">
              <div className="flex items-center">
                <Sparkles className="mr-2 h-4 w-4 text-purple-400" />
                <span className="text-sm text-gray-400">Powered by Cauldron™ Sentient Loop</span>
              </div>

              <div className="flex items-center space-x-4">
                <Link to="/docs" className="text-sm text-gray-400 hover:text-white">Documentation</Link>
                <Link to="/settings" className="text-sm text-gray-400 hover:text-white">Settings</Link>
                <Link to="/help" className="text-sm text-gray-400 hover:text-white">Help</Link>
              </div>
            </div>
          </div>
        </footer>

        {/* Command Palette (Cmd+K) */}
        <AnimatePresence>
          {showCommandPalette && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                onClick={() => setShowCommandPalette(false)}
              />

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed left-1/2 top-1/4 z-50 w-full max-w-lg -translate-x-1/2 rounded-lg border border-gray-700 bg-gray-800 shadow-xl"
              >
                <div className="p-4">
                  <div className="flex items-center border-b border-gray-700 pb-2">
                    <Command className="mr-2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search commands..."
                      className="w-full bg-transparent text-white focus:outline-none"
                      autoFocus
                    />
                  </div>

                  <div className="mt-2 max-h-80 overflow-y-auto">
                    {/* Command groups would go here */}
                    <div className="py-2">
                      <div className="px-2 py-1 text-xs font-semibold text-gray-400">Navigation</div>
                      <div className="mt-1 space-y-1">
                        <button type="button" className="flex w-full items-center justify-between rounded px-2 py-1.5 text-sm text-white hover:bg-gray-700">
                          <div className="flex items-center">
                            <Zap className="mr-2 h-4 w-4 text-blue-400" />
                            <span>Go to Dashboard</span>
                          </div>
                          <span className="text-xs text-gray-400">⌘D</span>
                        </button>
                        <button type="button" className="flex w-full items-center justify-between rounded px-2 py-1.5 text-sm text-white hover:bg-gray-700">
                          <div className="flex items-center">
                            <Shield className="mr-2 h-4 w-4 text-red-400" />
                            <span>Go to Phantom</span>
                          </div>
                          <span className="text-xs text-gray-400">⌘P</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </CyberpunkBackground>
    </DarkModeProvider>
  );
}
