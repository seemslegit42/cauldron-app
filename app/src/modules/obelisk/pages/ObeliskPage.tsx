import React, { useState } from 'react';
import { useQuery } from 'wasp/client/operations';
import { Link, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { getOsintSources, getOsintAlerts } from '../api/operations';
import DashboardPage from './DashboardPage';
import SourcesPage from './SourcesPage';
import FindingsPage from './FindingsPage';
import AlertsPage from './AlertsPage';
import ScanJobsPage from './ScanJobsPage';
import WebhooksPage from './WebhooksPage';
import SettingsPage from './SettingsPage';
import { ObeliskLayout } from '../components';
import { GlassmorphicCard } from '@src/shared/components/branding/GlassmorphicCard';
import { ModuleHeader } from '@src/shared/components/branding/ModuleHeader';
import { CyberpunkBackground } from '@src/shared/components/branding/CyberpunkBackground';
import { SentientAssistant } from '@src/shared/components/SentientAssistant';
import { Globe, Search, AlertTriangle, Database, Clock, CheckCircle, Settings as SettingsIcon } from 'lucide-react';

/**
 * Obelisk OSINT Engine
 *
 * Your digital telescope into the vast universe of open-source intelligence.
 * This module allows users to monitor, collect, and analyze information from public sources.
 * Remember: The truth is out there, and Obelisk is watching.
 */

const ObeliskPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [assistantMinimized, setAssistantMinimized] = useState(false);

  // Fetch unread alerts count for badge
  const { data: alerts } = useQuery(getOsintAlerts, { isRead: false });
  const unreadAlertsCount = alerts?.length || 0;

  // Check if current path is a subpath
  const isActive = (path: string) => {
    return location.pathname === `/obelisk${path}`;
  };

  return (
    <>
      <ObeliskLayout
        title="Obelisk OSINT Engine"
        description="Monitor and analyze open-source intelligence"
      >
        <div className="flex h-screen overflow-hidden bg-gray-900 text-white">
          {/* Sidebar */}
          <div
            className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-gray-800 transition duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              } lg:relative lg:translate-x-0`}
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between px-4 py-6">
                <Link to="/obelisk" className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-cyan-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                  <span className="ml-2 text-xl font-bold">OBELISK</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden"
                  aria-label="Close sidebar"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <nav className="mt-8 flex-1 space-y-2 px-4">
                <Link
                  to="/obelisk"
                  className={`flex items-center rounded-lg px-4 py-2 ${isActive('') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'
                    }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                  <span className="ml-3">Dashboard</span>
                </Link>

                <Link
                  to="/obelisk/sources"
                  className={`flex items-center rounded-lg px-4 py-2 ${isActive('/sources') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'
                    }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34" />
                    <polygon points="18 2 22 6 12 16 8 16 8 12 18 2" />
                  </svg>
                  <span className="ml-3">Sources</span>
                </Link>

                <Link
                  to="/obelisk/findings"
                  className={`flex items-center rounded-lg px-4 py-2 ${isActive('/findings') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'
                    }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  <span className="ml-3">Findings</span>
                </Link>

                <Link
                  to="/obelisk/alerts"
                  className={`flex items-center rounded-lg px-4 py-2 ${isActive('/alerts') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'
                    }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  <span className="ml-3">Alerts</span>
                  {unreadAlertsCount > 0 && (
                    <span className="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
                      {unreadAlertsCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/obelisk/scan-jobs"
                  className={`flex items-center rounded-lg px-4 py-2 ${isActive('/scan-jobs')
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                    }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="6" width="20" height="12" rx="2" />
                    <line x1="6" y1="10" x2="6" y2="10" />
                    <line x1="10" y1="10" x2="10" y2="10" />
                    <line x1="14" y1="10" x2="14" y2="10" />
                    <line x1="18" y1="10" x2="18" y2="10" />
                    <line x1="6" y1="14" x2="6" y2="14" />
                    <line x1="10" y1="14" x2="10" y2="14" />
                    <line x1="14" y1="14" x2="14" y2="14" />
                    <line x1="18" y1="14" x2="18" y2="14" />
                  </svg>
                  <span className="ml-3">Scan Jobs</span>
                </Link>

                <Link
                  to="/obelisk/webhooks"
                  className={`flex items-center rounded-lg px-4 py-2 ${isActive('/webhooks') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'
                    }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  <span className="ml-3">Webhooks</span>
                </Link>

                <Link
                  to="/obelisk/settings"
                  className={`flex items-center rounded-lg px-4 py-2 ${isActive('/settings') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'
                    }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  <span className="ml-3">Settings</span>
                </Link>
              </nav>

              <div className="mt-auto p-4">
                <GlassmorphicCard moduleId="obelisk" level="medium" border shadow className="p-4">
                  <h3 className="text-sm font-medium text-obelisk-cyan-400">OSINT Status</h3>
                  <div className="mt-2 flex items-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse"></div>
                    <span className="ml-2 text-sm text-gray-300">Active</span>
                  </div>
                  <p className="mt-2 text-xs text-gray-400">
                    Obelisk is actively monitoring your configured sources. Digital eyes wide open.
                  </p>
                </GlassmorphicCard>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Top Navigation */}
            <header className="bg-gray-800/80 backdrop-blur-sm shadow-md">
              <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(true)}
                    className="text-gray-300 focus:outline-none lg:hidden"
                    aria-label="Open sidebar"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </button>
                  <h1 className="ml-4 text-xl font-bold text-obelisk-cyan-300 lg:ml-0">Obelisk OSINT Engine</h1>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    className="rounded-lg bg-obelisk-cyan-900/50 border border-obelisk-cyan-700/50 px-3 py-1 text-sm text-white hover:bg-obelisk-cyan-800/50"
                  >
                    New Scan
                  </button>
                  <button
                    type="button"
                    className="rounded-full bg-gray-700/80 p-2 text-gray-300 hover:bg-gray-600/80"
                    aria-label="Notifications"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto p-4">
              <CyberpunkBackground
                moduleId="obelisk"
                pattern="grid"
                patternOpacity={0.1}
                glowIntensity="medium"
                glowPositions={['top-right', 'bottom-left']}
                animate={true}
                className="min-h-full rounded-lg p-4"
              >
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/sources" element={<SourcesPage />} />
                  <Route path="/findings" element={<FindingsPage />} />
                  <Route path="/alerts" element={<AlertsPage />} />
                  <Route path="/scan-jobs" element={<ScanJobsPage />} />
                  <Route path="/webhooks" element={<WebhooksPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
              </CyberpunkBackground>
            </main>
          </div>
        </div>
      </ObeliskLayout>

      {/* Sentient Assistant */}
      <div className="fixed bottom-4 right-4 z-10 w-96">
        <SentientAssistant
          module="obelisk"
          initialPrompt="How can I help you analyze OSINT data today?"
          minimized={assistantMinimized}
          onMinimize={() => setAssistantMinimized(true)}
          onMaximize={() => setAssistantMinimized(false)}
        />
      </div>
    </>
  );
};

export default ObeliskPage;
