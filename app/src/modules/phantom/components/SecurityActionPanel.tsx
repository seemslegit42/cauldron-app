import React, { useState } from 'react';
import {
  useCanRunSecurityScans,
  useCanScanDomainClones,
  useCanMonitorThreats,
  useCanAnalyzeThreatIntelligence,
} from '../utils/permissionUtils';
import { PermissionGuard } from '../../shared/components/auth/PermissionGuard';

export const SecurityActionPanel: React.FC = () => {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  // Check permissions
  const canRunScans = useCanRunSecurityScans();
  const canMonitorDomains = useCanScanDomainClones();
  const canMonitorThreats = useCanMonitorThreats();
  const canAccessThreatIntel = useCanAnalyzeThreatIntelligence();

  // Quick actions
  const quickActions = [
    {
      id: 'run_scan',
      name: 'Run Security Scan',
      description: 'Perform a comprehensive security scan',
      icon: '🔍',
      color: 'bg-blue-900/30 border-blue-700 text-blue-400',
      requiredPermission: 'phantom:scan',
    },
    {
      id: 'domain_monitor',
      name: 'Monitor Domain',
      description: 'Add a domain to monitoring',
      icon: '🌐',
      color: 'bg-green-900/30 border-green-700 text-green-400',
      requiredPermission: 'domain-clones:scan',
    },
    {
      id: 'phishing_sim',
      name: 'Phishing Simulation',
      description: 'Run a phishing awareness campaign',
      icon: '🎣',
      color: 'bg-yellow-900/30 border-yellow-700 text-yellow-400',
      requiredPermission: 'phantom:scan',
    },
    {
      id: 'threat_intel',
      name: 'Threat Intelligence',
      description: 'Get latest threat intelligence',
      icon: '🛡️',
      color: 'bg-purple-900/30 border-purple-700 text-purple-400',
      requiredPermission: 'threat-intelligence:analyze',
    },
    {
      id: 'security_report',
      name: 'Security Report',
      description: 'Generate a security posture report',
      icon: '📊',
      color: 'bg-red-900/30 border-red-700 text-red-400',
      requiredPermission: 'phantom:read',
    },
  ];

  // Handle action click
  const handleActionClick = (actionId: string) => {
    setSelectedAction(actionId);

    // In a real implementation, this would trigger the appropriate action
    alert(`Action triggered: ${actionId}`);
  };

  return (
    <div className="rounded-lg bg-gray-800 p-6 shadow-lg">
      <h2 className="mb-4 text-xl font-bold text-white">Security Actions</h2>

      <div className="space-y-3">
        {quickActions.map((action) => {
          // Split the permission string into resource and action
          const [resource, actionPerm] = action.requiredPermission.split(':');

          return (
            <PermissionGuard
              key={action.id}
              resource={resource}
              action={actionPerm}
              renderNothing={false}
              fallback={
                <div
                  className={`w-full rounded-lg border border-gray-700 bg-gray-800 p-4 text-left opacity-50`}
                >
                  <div className="flex items-center">
                    <div className="mr-3 text-2xl">{action.icon}</div>
                    <div>
                      <h3 className="font-medium text-gray-500">{action.name}</h3>
                      <p className="text-sm text-gray-500">{action.description}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        <span className="rounded bg-gray-700 px-2 py-0.5 text-gray-400">
                          Permission required
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              }
            >
              <button
                className={`w-full rounded-lg border p-4 ${action.color} hover:bg-opacity-50 text-left transition-colors`}
                onClick={() => handleActionClick(action.id)}
              >
                <div className="flex items-center">
                  <div className="mr-3 text-2xl">{action.icon}</div>
                  <div>
                    <h3 className="font-medium">{action.name}</h3>
                    <p className="text-sm text-gray-300">{action.description}</p>
                  </div>
                </div>
              </button>
            </PermissionGuard>
          );
        })}
      </div>

      <div className="mt-6 border-t border-gray-700 pt-6">
        <h3 className="mb-3 text-sm font-medium text-gray-400">Recent Security Activities</h3>
        <div className="space-y-3">
          <div className="flex items-start">
            <div className="mt-1.5 mr-2 h-2 w-2 rounded-full bg-green-500"></div>
            <div>
              <p className="text-sm text-gray-300">Security scan completed</p>
              <p className="text-xs text-gray-500">Today, 10:45 AM</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="mt-1.5 mr-2 h-2 w-2 rounded-full bg-yellow-500"></div>
            <div>
              <p className="text-sm text-gray-300">New domain added to monitoring</p>
              <p className="text-xs text-gray-500">Yesterday, 3:20 PM</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="mt-1.5 mr-2 h-2 w-2 rounded-full bg-red-500"></div>
            <div>
              <p className="text-sm text-gray-300">Critical threat mitigated</p>
              <p className="text-xs text-gray-500">Yesterday, 11:15 AM</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-gray-700 pt-6">
        <h3 className="mb-3 text-sm font-medium text-gray-400">Security Tips</h3>
        <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-4">
          <p className="text-sm text-gray-300">
            Regular security scans help identify vulnerabilities before they can be exploited.
            Consider scheduling automated scans on a weekly basis.
          </p>
        </div>
      </div>
    </div>
  );
};
