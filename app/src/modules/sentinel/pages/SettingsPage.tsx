import React from 'react';
import {
  ModuleSettingsPage,
  ModuleAgent
} from '@src/shared/components/settings/ModuleSettingsPage';
import { TabsContent, TabsTrigger } from '@src/shared/components/ui/Tabs';
import { Card } from '@src/shared/components/ui/Card';
import { Button } from '@src/shared/components/ui/Button';
import { Toggle } from '@src/shared/components/ui/Toggle';
import { Select } from '@src/shared/components/ui/Select';
import { Slider } from '@src/shared/components/ui/Slider';
import { GlassmorphicCard } from '@src/shared/components/branding/GlassmorphicCard';

/**
 * Sentinel Module Settings Page
 *
 * Where paranoia meets productivity in the digital realm.
 * This page allows users to configure settings for the Sentinel security module,
 * including agent configuration, security scan settings, and alert thresholds.
 * Remember: It's not paranoia if they're really out to get your data.
 */
export default function SettingsPage() {
  // Define the agents for the Sentinel module
  const sentinelAgents: ModuleAgent[] = [
    {
      name: 'security-monitor',
      displayName: 'Security Monitor',
      description: 'Monitors system security and detects threats',
      resourcePath: 'agents/security-monitor',
    },
    {
      name: 'log-analyzer',
      displayName: 'Log Analyzer',
      description: 'Analyzes logs for security issues and anomalies',
      resourcePath: 'agents/log-analyzer',
    },
    {
      name: 'credential-scanner',
      displayName: 'Credential Scanner',
      description: 'Scans for exposed credentials and security risks',
      resourcePath: 'agents/credential-scanner',
    },
    {
      name: 'incident-responder',
      displayName: 'Incident Responder',
      description: 'Responds to security incidents and provides remediation steps',
      resourcePath: 'agents/incident-responder',
    },
  ];

  // Security scan settings
  const [securitySettings, setSecuritySettings] = React.useState({
    scanFrequency: 'daily',
    scanTime: '02:00',
    enableRealTimeMonitoring: true,
    monitoredResources: ['api', 'database', 'storage', 'network'],
    enableVulnerabilityScanning: true,
    vulnerabilityScanDepth: 'medium',
    enableCredentialScanning: true,
    credentialScanLocations: ['code', 'config', 'logs'],
    enableAnomalyDetection: true,
    anomalyDetectionSensitivity: 'medium',
  });

  // Alert settings
  const [alertSettings, setAlertSettings] = React.useState({
    enableAlerts: true,
    criticalAlertChannels: ['email', 'dashboard', 'slack'],
    highAlertChannels: ['email', 'dashboard'],
    mediumAlertChannels: ['dashboard'],
    lowAlertChannels: ['dashboard'],
    alertEmail: '',
    slackWebhook: '',
    alertThrottling: true,
    maxAlertsPerHour: 10,
    alertGrouping: true,
    autoResolveAlerts: false,
  });

  // Handle security setting changes
  const handleSecuritySettingChange = (key: string, value: any) => {
    setSecuritySettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handle alert setting changes
  const handleAlertSettingChange = (key: string, value: any) => {
    setAlertSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // Toggle monitored resource
  const toggleMonitoredResource = (resource: string) => {
    setSecuritySettings(prev => {
      const resources = [...prev.monitoredResources];
      if (resources.includes(resource)) {
        return {
          ...prev,
          monitoredResources: resources.filter(r => r !== resource),
        };
      } else {
        return {
          ...prev,
          monitoredResources: [...resources, resource],
        };
      }
    });
  };

  // Toggle credential scan location
  const toggleCredentialScanLocation = (location: string) => {
    setSecuritySettings(prev => {
      const locations = [...prev.credentialScanLocations];
      if (locations.includes(location)) {
        return {
          ...prev,
          credentialScanLocations: locations.filter(l => l !== location),
        };
      } else {
        return {
          ...prev,
          credentialScanLocations: [...locations, location],
        };
      }
    });
  };

  // Toggle alert channel
  const toggleAlertChannel = (severity: 'critical' | 'high' | 'medium' | 'low', channel: string) => {
    setAlertSettings(prev => {
      const channelKey = `${severity}AlertChannels` as keyof typeof alertSettings;
      const channels = [...prev[channelKey] as string[]];
      if (channels.includes(channel)) {
        return {
          ...prev,
          [channelKey]: channels.filter(c => c !== channel),
        };
      } else {
        return {
          ...prev,
          [channelKey]: [...channels, channel],
        };
      }
    });
  };

  // Save security settings
  const saveSecuritySettings = () => {
    // This would typically save to the backend
    alert('Security settings saved!');
  };

  // Save alert settings
  const saveAlertSettings = () => {
    // This would typically save to the backend
    alert('Alert settings saved!');
  };

  // Additional tabs for the settings page
  const additionalTabs = (
    <>
      <TabsTrigger value="security">Security Scans</TabsTrigger>
      <TabsTrigger value="alerts">Alert Settings</TabsTrigger>

      <TabsContent value="security" className="space-y-6">
        <GlassmorphicCard moduleId="sentinel" level="medium" border shadow className="p-6">
          <h2 className="text-xl font-bold mb-6 text-sentinel-blue-400">Security Scan Settings</h2>

          <div className="space-y-4">
            {/* Scan Frequency */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Scan Frequency</label>
              <Select
                value={securitySettings.scanFrequency}
                onValueChange={(value) => handleSecuritySettingChange('scanFrequency', value)}
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </Select>
            </div>

            {/* Scan Time */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Scan Time</label>
              <input
                type="time"
                value={securitySettings.scanTime}
                onChange={(e) => handleSecuritySettingChange('scanTime', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Real-Time Monitoring */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Enable Real-Time Monitoring</h3>
                <p className="text-xs text-gray-500">Monitor security events in real-time</p>
              </div>
              <Toggle
                isOn={securitySettings.enableRealTimeMonitoring}
                onChange={(value) => handleSecuritySettingChange('enableRealTimeMonitoring', value)}
              />
            </div>

            {/* Monitored Resources */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Monitored Resources</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="monitor-api"
                    checked={securitySettings.monitoredResources.includes('api')}
                    onChange={() => toggleMonitoredResource('api')}
                    className="rounded"
                  />
                  <label htmlFor="monitor-api" className="text-sm">API</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="monitor-database"
                    checked={securitySettings.monitoredResources.includes('database')}
                    onChange={() => toggleMonitoredResource('database')}
                    className="rounded"
                  />
                  <label htmlFor="monitor-database" className="text-sm">Database</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="monitor-storage"
                    checked={securitySettings.monitoredResources.includes('storage')}
                    onChange={() => toggleMonitoredResource('storage')}
                    className="rounded"
                  />
                  <label htmlFor="monitor-storage" className="text-sm">Storage</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="monitor-network"
                    checked={securitySettings.monitoredResources.includes('network')}
                    onChange={() => toggleMonitoredResource('network')}
                    className="rounded"
                  />
                  <label htmlFor="monitor-network" className="text-sm">Network</label>
                </div>
              </div>
            </div>

            {/* Vulnerability Scanning */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Enable Vulnerability Scanning</h3>
                <p className="text-xs text-gray-500">Scan for known vulnerabilities</p>
              </div>
              <Toggle
                isOn={securitySettings.enableVulnerabilityScanning}
                onChange={(value) => handleSecuritySettingChange('enableVulnerabilityScanning', value)}
              />
            </div>

            {/* Vulnerability Scan Depth */}
            {securitySettings.enableVulnerabilityScanning && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Vulnerability Scan Depth</label>
                <Select
                  value={securitySettings.vulnerabilityScanDepth}
                  onValueChange={(value) => handleSecuritySettingChange('vulnerabilityScanDepth', value)}
                >
                  <option value="low">Low (Fast, Basic Checks)</option>
                  <option value="medium">Medium (Balanced)</option>
                  <option value="high">High (Thorough, Slower)</option>
                </Select>
              </div>
            )}

            {/* Credential Scanning */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Enable Credential Scanning</h3>
                <p className="text-xs text-gray-500">Scan for exposed credentials</p>
              </div>
              <Toggle
                isOn={securitySettings.enableCredentialScanning}
                onChange={(value) => handleSecuritySettingChange('enableCredentialScanning', value)}
              />
            </div>

            {/* Credential Scan Locations */}
            {securitySettings.enableCredentialScanning && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Credential Scan Locations</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="scan-code"
                      checked={securitySettings.credentialScanLocations.includes('code')}
                      onChange={() => toggleCredentialScanLocation('code')}
                      className="rounded"
                    />
                    <label htmlFor="scan-code" className="text-sm">Code</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="scan-config"
                      checked={securitySettings.credentialScanLocations.includes('config')}
                      onChange={() => toggleCredentialScanLocation('config')}
                      className="rounded"
                    />
                    <label htmlFor="scan-config" className="text-sm">Config Files</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="scan-logs"
                      checked={securitySettings.credentialScanLocations.includes('logs')}
                      onChange={() => toggleCredentialScanLocation('logs')}
                      className="rounded"
                    />
                    <label htmlFor="scan-logs" className="text-sm">Logs</label>
                  </div>
                </div>
              </div>
            )}

            {/* Anomaly Detection */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Enable Anomaly Detection</h3>
                <p className="text-xs text-gray-500">Detect unusual security patterns</p>
              </div>
              <Toggle
                isOn={securitySettings.enableAnomalyDetection}
                onChange={(value) => handleSecuritySettingChange('enableAnomalyDetection', value)}
              />
            </div>

            {/* Anomaly Detection Sensitivity */}
            {securitySettings.enableAnomalyDetection && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Anomaly Detection Sensitivity</label>
                <Select
                  value={securitySettings.anomalyDetectionSensitivity}
                  onValueChange={(value) => handleSecuritySettingChange('anomalyDetectionSensitivity', value)}
                >
                  <option value="low">Low (Fewer Alerts)</option>
                  <option value="medium">Medium (Balanced)</option>
                  <option value="high">High (More Alerts)</option>
                </Select>
              </div>
            )}

            <div className="pt-4">
              <Button onClick={saveSecuritySettings}>
                Save Security Settings
              </Button>
            </div>
          </div>
        </GlassmorphicCard>
      </TabsContent>

      <TabsContent value="alerts" className="space-y-6">
        <GlassmorphicCard moduleId="sentinel" level="medium" border shadow className="p-6">
          <h2 className="text-xl font-bold mb-6 text-sentinel-blue-400">Alert Settings</h2>

          <div className="space-y-4">
            {/* Enable Alerts */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Enable Alerts</h3>
                <p className="text-xs text-gray-500">Send alerts for security issues</p>
              </div>
              <Toggle
                isOn={alertSettings.enableAlerts}
                onChange={(value) => handleAlertSettingChange('enableAlerts', value)}
              />
            </div>

            {/* Alert Channels */}
            {alertSettings.enableAlerts && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Critical Alert Channels</label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="critical-email"
                        checked={alertSettings.criticalAlertChannels.includes('email')}
                        onChange={() => toggleAlertChannel('critical', 'email')}
                        className="rounded"
                      />
                      <label htmlFor="critical-email" className="text-sm">Email</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="critical-dashboard"
                        checked={alertSettings.criticalAlertChannels.includes('dashboard')}
                        onChange={() => toggleAlertChannel('critical', 'dashboard')}
                        className="rounded"
                      />
                      <label htmlFor="critical-dashboard" className="text-sm">Dashboard</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="critical-slack"
                        checked={alertSettings.criticalAlertChannels.includes('slack')}
                        onChange={() => toggleAlertChannel('critical', 'slack')}
                        className="rounded"
                      />
                      <label htmlFor="critical-slack" className="text-sm">Slack</label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">High Alert Channels</label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="high-email"
                        checked={alertSettings.highAlertChannels.includes('email')}
                        onChange={() => toggleAlertChannel('high', 'email')}
                        className="rounded"
                      />
                      <label htmlFor="high-email" className="text-sm">Email</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="high-dashboard"
                        checked={alertSettings.highAlertChannels.includes('dashboard')}
                        onChange={() => toggleAlertChannel('high', 'dashboard')}
                        className="rounded"
                      />
                      <label htmlFor="high-dashboard" className="text-sm">Dashboard</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="high-slack"
                        checked={alertSettings.highAlertChannels.includes('slack')}
                        onChange={() => toggleAlertChannel('high', 'slack')}
                        className="rounded"
                      />
                      <label htmlFor="high-slack" className="text-sm">Slack</label>
                    </div>
                  </div>
                </div>

                {/* Alert Email */}
                {(alertSettings.criticalAlertChannels.includes('email') ||
                  alertSettings.highAlertChannels.includes('email') ||
                  alertSettings.mediumAlertChannels.includes('email') ||
                  alertSettings.lowAlertChannels.includes('email')) && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Alert Email</label>
                      <input
                        type="email"
                        value={alertSettings.alertEmail}
                        onChange={(e) => handleAlertSettingChange('alertEmail', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="email@example.com"
                      />
                    </div>
                  )}

                {/* Slack Webhook */}
                {(alertSettings.criticalAlertChannels.includes('slack') ||
                  alertSettings.highAlertChannels.includes('slack') ||
                  alertSettings.mediumAlertChannels.includes('slack') ||
                  alertSettings.lowAlertChannels.includes('slack')) && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Slack Webhook URL</label>
                      <input
                        type="text"
                        value={alertSettings.slackWebhook}
                        onChange={(e) => handleAlertSettingChange('slackWebhook', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="https://hooks.slack.com/services/..."
                      />
                    </div>
                  )}

                {/* Alert Throttling */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Enable Alert Throttling</h3>
                    <p className="text-xs text-gray-500">Limit the number of alerts sent</p>
                  </div>
                  <Toggle
                    isOn={alertSettings.alertThrottling}
                    onChange={(value) => handleAlertSettingChange('alertThrottling', value)}
                  />
                </div>

                {/* Max Alerts Per Hour */}
                {alertSettings.alertThrottling && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium">Max Alerts Per Hour: {alertSettings.maxAlertsPerHour}</label>
                    </div>
                    <Slider
                      min={1}
                      max={50}
                      step={1}
                      value={[alertSettings.maxAlertsPerHour]}
                      onValueChange={(value) => handleAlertSettingChange('maxAlertsPerHour', value[0])}
                    />
                  </div>
                )}

                {/* Alert Grouping */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Enable Alert Grouping</h3>
                    <p className="text-xs text-gray-500">Group similar alerts together</p>
                  </div>
                  <Toggle
                    isOn={alertSettings.alertGrouping}
                    onChange={(value) => handleAlertSettingChange('alertGrouping', value)}
                  />
                </div>

                {/* Auto-Resolve Alerts */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Auto-Resolve Alerts</h3>
                    <p className="text-xs text-gray-500">Automatically resolve alerts when issue is fixed</p>
                  </div>
                  <Toggle
                    isOn={alertSettings.autoResolveAlerts}
                    onChange={(value) => handleAlertSettingChange('autoResolveAlerts', value)}
                  />
                </div>
              </>
            )}

            <div className="pt-4">
              <Button onClick={saveAlertSettings}>
                Save Alert Settings
              </Button>
            </div>
          </div>
        </GlassmorphicCard>
      </TabsContent>
    </>
  );

  return (
    <ModuleSettingsPage
      moduleId="sentinel"
      moduleName="Sentinel"
      moduleDescription="Configure your digital watchtower. Protect your kingdom from threats with vigilant security agents."
      agents={sentinelAgents}
      additionalTabs={additionalTabs}
    />
  );
}
