import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from 'wasp/client/auth';
import { SentientFeedbackGraph } from '../components/SentientFeedbackGraph';
import { DarkModeProvider } from '@src/shared/theme/DarkModeProvider';
import { useCanViewArcanaDashboard } from '../utils/permissionUtils';

export default function FeedbackGraphPage() {
  const user = useUser();
  const canViewDashboard = useCanViewArcanaDashboard();
  const [selectedModule, setSelectedModule] = useState<string | undefined>(undefined);
  const [graphHeight, setGraphHeight] = useState('calc(100vh - 180px)');

  // If user doesn't have permission to view the dashboard, show a message
  if (!canViewDashboard) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <div className="max-w-md rounded-lg bg-gray-800 p-8 shadow-lg">
          <h1 className="mb-4 text-2xl font-bold text-blue-400">Access Restricted</h1>
          <p className="mb-6 text-gray-300">
            You don't have permission to access the Arcana Dashboard.
          </p>
          <Link
            to="/"
            className="rounded-md bg-gray-700 px-4 py-2 font-medium text-white hover:bg-gray-600"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <DarkModeProvider initialDarkMode={true}>
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Header */}
        <header className="bg-gradient-to-r from-gray-900 to-purple-900 p-6 shadow-lg">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center">
                <div className="mr-3 flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-purple-500 to-blue-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-purple-400">Sentient Feedback Graph</h1>
                  <p className="mt-1 text-gray-400">Visualizing agent tasks, approvals, and escalation chains</p>
                </div>
              </div>
              <div className="mt-4 flex space-x-3 md:mt-0">
                <Link
                  to="/arcana"
                  className="flex items-center rounded-md bg-gray-800 px-3 py-1 text-white hover:bg-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-1 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Back to Arcana
                </Link>
                <Link
                  to="/arcana/sentient-loop"
                  className="flex items-center rounded-md bg-purple-600 px-3 py-1 text-white hover:bg-purple-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-1 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Sentient Loop Dashboard
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="mx-auto max-w-7xl p-6">
          {/* Module selector */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="text-sm font-medium text-gray-400">Filter by Module:</div>
            <button
              className={`rounded-md px-3 py-1 text-sm ${
                selectedModule === undefined
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setSelectedModule(undefined)}
            >
              All Modules
            </button>
            <button
              className={`rounded-md px-3 py-1 text-sm ${
                selectedModule === 'Arcana'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setSelectedModule('Arcana')}
            >
              Arcana
            </button>
            <button
              className={`rounded-md px-3 py-1 text-sm ${
                selectedModule === 'Phantom'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setSelectedModule('Phantom')}
            >
              Phantom
            </button>
            <button
              className={`rounded-md px-3 py-1 text-sm ${
                selectedModule === 'Athena'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setSelectedModule('Athena')}
            >
              Athena
            </button>
            <button
              className={`rounded-md px-3 py-1 text-sm ${
                selectedModule === 'Forgeflow'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setSelectedModule('Forgeflow')}
            >
              Forgeflow
            </button>
            <button
              className={`rounded-md px-3 py-1 text-sm ${
                selectedModule === 'ChiefOfStaff'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setSelectedModule('ChiefOfStaff')}
            >
              Chief of Staff
            </button>
            
            <div className="ml-auto">
              <select
                className="rounded-md border border-gray-600 bg-gray-700 px-3 py-1 text-sm text-white"
                value={graphHeight}
                onChange={(e) => setGraphHeight(e.target.value)}
              >
                <option value="calc(100vh - 180px)">Full Height</option>
                <option value="600px">Medium (600px)</option>
                <option value="400px">Small (400px)</option>
              </select>
            </div>
          </div>

          {/* Graph component */}
          <div style={{ height: graphHeight }}>
            <SentientFeedbackGraph 
              className="h-full" 
              moduleFilter={selectedModule}
              onNodeSelect={(node) => {
                console.log('Selected node:', node);
                // You can add additional handling here if needed
              }}
            />
          </div>

          {/* Information section */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-lg">
              <h3 className="mb-2 text-lg font-medium text-purple-400">About the Feedback Graph</h3>
              <p className="text-sm text-gray-300">
                The Sentient Feedback Graph visualizes all current agent tasks, user interactions, pending approvals, and escalation chains in a single interactive view. Nodes are color-coded by urgency and confidence levels.
              </p>
            </div>
            
            <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-lg">
              <h3 className="mb-2 text-lg font-medium text-purple-400">Navigation Tips</h3>
              <ul className="list-inside list-disc space-y-1 text-sm text-gray-300">
                <li>Click and drag to pan the graph</li>
                <li>Use the zoom controls to zoom in/out</li>
                <li>Click on any node to view detailed information</li>
                <li>Use filters to focus on specific node types or modules</li>
              </ul>
            </div>
            
            <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-lg">
              <h3 className="mb-2 text-lg font-medium text-purple-400">Intervention Actions</h3>
              <p className="text-sm text-gray-300">
                From the node detail view, you can approve, reject, or escalate checkpoints, execute recommended actions, and view detailed logs and intervention history for each node in the system.
              </p>
            </div>
          </div>
        </main>
      </div>
    </DarkModeProvider>
  );
}