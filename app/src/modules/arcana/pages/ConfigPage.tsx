import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSentientLoop } from '../hooks/useSentientLoop';
import SentientLoopConfig from '../components/SentientLoopConfig';

const ConfigPage: React.FC = () => {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const {
    loopConfig,
    isLoadingConfig,
    updateConfig
  } = useSentientLoop(activeModule);

  // Sample modules - in a real implementation, this would come from an API
  const modules = [
    { id: null, name: 'Global', description: 'Default configuration for all modules' },
    { id: 'arcana', name: 'Arcana', description: 'Command center UI configuration' },
    { id: 'phantom', name: 'Phantom', description: 'Cybersecurity module configuration' },
    { id: 'athena', name: 'Athena', description: 'Business intelligence module configuration' },
    { id: 'forgeflow', name: 'Forgeflow', description: 'Workflow automation module configuration' },
    { id: 'obelisk', name: 'Obelisk', description: 'OSINT engine module configuration' },
    { id: 'manifold', name: 'Manifold', description: 'Revenue intelligence module configuration' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-purple-500">Sentient Loop™ Configuration</h1>
          <p className="text-gray-400">Configure the cognitive feedback system</p>
        </div>
        <Link
          to="/arcana/sentient-loop"
          className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600"
        >
          Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">Modules</h2>
            <div className="space-y-2">
              {modules.map((module) => (
                <button
                  key={module.id || 'global'}
                  className={`w-full rounded-lg p-3 text-left transition-colors ${
                    activeModule === module.id
                      ? 'bg-purple-900 text-purple-100'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  onClick={() => setActiveModule(module.id)}
                >
                  <div className="font-medium">{module.name}</div>
                  <div className="mt-1 text-xs opacity-80">{module.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-gray-700 bg-gray-800 p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">Configuration Help</h2>
            <div className="space-y-4 text-sm text-gray-300">
              <div>
                <h3 className="font-medium text-purple-400">Confidence Threshold</h3>
                <p className="mt-1">Sets the minimum confidence level required for AI actions to proceed without human approval.</p>
              </div>
              <div>
                <h3 className="font-medium text-purple-400">Always Check High Impact</h3>
                <p className="mt-1">When enabled, all high and critical impact actions require human approval regardless of confidence.</p>
              </div>
              <div>
                <h3 className="font-medium text-purple-400">Auto-Escalate Threshold</h3>
                <p className="mt-1">Sets the impact level at which actions are automatically escalated for review.</p>
              </div>
              <div>
                <h3 className="font-medium text-purple-400">Memory Retention</h3>
                <p className="mt-1">Controls how long different types of memory are retained in the system.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
            <h2 className="mb-6 text-xl font-semibold text-white">
              {activeModule ? `${modules.find(m => m.id === activeModule)?.name} Configuration` : 'Global Configuration'}
            </h2>
            
            {isLoadingConfig ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
              </div>
            ) : (
              <SentientLoopConfig config={loopConfig} onUpdate={updateConfig} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigPage;