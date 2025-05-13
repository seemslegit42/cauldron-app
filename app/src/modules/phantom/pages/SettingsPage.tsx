import React, { useState } from 'react';
import {
  ModuleSettingsPage,
  ModuleAgent
} from '@src/shared/components/settings/ModuleSettingsPage';
import { TabsContent, TabsTrigger } from '@src/shared/components/ui/Tabs';
import { Card } from '@src/shared/components/ui/Card';
import { Button } from '@src/shared/components/ui/Button';
import { Toggle } from '@src/shared/components/ui/Toggle';
import { Slider } from '@src/shared/components/ui/Slider';
import { Select } from '@src/shared/components/ui/Select';
import { GlassmorphicCard } from '@src/shared/components/branding/GlassmorphicCard';

/**
 * Phantom Module Settings Page
 *
 * Where digital paranoia meets user-friendly configuration.
 * This page allows users to configure settings for the Phantom security module,
 * including agent behavior, security scans, and alert thresholds.
 * Remember: Just because you're paranoid doesn't mean they aren't after your data.
 */
export const SettingsPage: React.FC = () => {
  // Define the agents for the Phantom module
  const phantomAgents: ModuleAgent[] = [
    {
      name: 'threat-detector',
      displayName: 'Threat Detector',
      description: 'Analyzes security data to detect potential threats',
      resourcePath: 'agents/threat-detector',
    },
    {
      name: 'domain-clone-monitor',
      displayName: 'Domain Clone Monitor',
      description: 'Monitors for domain clones and phishing attempts',
      resourcePath: 'agents/domain-clone-monitor',
    },
    {
      name: 'osint-scanner',
      displayName: 'OSINT Scanner',
      description: 'Scans open-source intelligence for security insights',
      resourcePath: 'agents/osint-scanner',
    },
    {
      name: 'vulnerability-analyzer',
      displayName: 'Vulnerability Analyzer',
      description: 'Analyzes vulnerabilities and suggests mitigations',
      resourcePath: 'agents/vulnerability-analyzer',
    },
  ];

  // Security scan settings
  const [scanSettings, setScanSettings] = useState({
    scanFrequency: 'daily',
    scanDepth: 'medium',
    enableAutomaticScans: true,
    scanTimeWindow: '00:00-06:00',
    includeExternalAssets: true,
    retainScanHistory: 90, // days
  });

  // Alert threshold settings
  const [alertThresholds, setAlertThresholds] = useState({
    criticalThreshold: 80,
    highThreshold: 60,
    mediumThreshold: 40,
    lowThreshold: 20,
    autoResolveThreshold: 10,
    alertNotifications: true,
    emailAlerts: true,
    slackAlerts: false,
    slackWebhook: '',
  });

  // Handle scan setting changes
  const handleScanSettingChange = (key: string, value: any) => {
    setScanSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handle alert threshold changes
  const handleAlertThresholdChange = (key: string, value: any) => {
    setAlertThresholds(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // Save scan settings
  const saveScanSettings = () => {
    // This would typically save to the backend
    alert('Scan settings saved!');
  };

  // Save alert thresholds
  const saveAlertThresholds = () => {
    // This would typically save to the backend
    alert('Alert thresholds saved!');
  };

  // Additional tabs for the settings page
  const additionalTabs = (
    <>
      <TabsTrigger value="scans">Security Scans</TabsTrigger>
      <TabsTrigger value="alerts">Alert Thresholds</TabsTrigger>

      <TabsContent value="scans" className="space-y-6">
        <GlassmorphicCard moduleId="phantom" level="medium" border shadow className="p-6">
          <h2 className="text-xl font-bold mb-6 text-phantom-red-400">Security Scan Settings</h2>

          <div className="space-y-4">
            {/* Scan frequency */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Scan Frequency</label>
              <Select
                value={scanSettings.scanFrequency}
                onValueChange={(value) => handleScanSettingChange('scanFrequency', value)}
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </Select>
            </div>

            {/* Scan depth */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Scan Depth</label>
              <Select
                value={scanSettings.scanDepth}
                onValueChange={(value) => handleScanSettingChange('scanDepth', value)}
              >
                <option value="quick">Quick (Surface level)</option>
                <option value="medium">Medium (Standard depth)</option>
                <option value="deep">Deep (Comprehensive)</option>
                <option value="forensic">Forensic (Maximum depth)</option>
              </Select>
            </div>

            {/* Automatic scans */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Enable Automatic Scans</h3>
                <p className="text-xs text-gray-500">Run scans automatically on schedule</p>
              </div>
              <Toggle
                isOn={scanSettings.enableAutomaticScans}
                onChange={(value) => handleScanSettingChange('enableAutomaticScans', value)}
              />
            </div>

            {/* Scan time window */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Scan Time Window</label>
              <Select
                value={scanSettings.scanTimeWindow}
                onValueChange={(value) => handleScanSettingChange('scanTimeWindow', value)}
                disabled={!scanSettings.enableAutomaticScans}
              >
                <option value="00:00-06:00">12 AM - 6 AM</option>
                <option value="06:00-12:00">6 AM - 12 PM</option>
                <option value="12:00-18:00">12 PM - 6 PM</option>
                <option value="18:00-00:00">6 PM - 12 AM</option>
                <option value="anytime">Anytime</option>
              </Select>
            </div>

            {/* Include external assets */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Include External Assets</h3>
                <p className="text-xs text-gray-500">Scan external assets and dependencies</p>
              </div>
              <Toggle
                isOn={scanSettings.includeExternalAssets}
                onChange={(value) => handleScanSettingChange('includeExternalAssets', value)}
              />
            </div>

            {/* Retain scan history */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Retain Scan History: {scanSettings.retainScanHistory} days</label>
              </div>
              <Slider
                min={30}
                max={365}
                step={30}
                value={[scanSettings.retainScanHistory]}
                onValueChange={(value) => handleScanSettingChange('retainScanHistory', value[0])}
              />
            </div>

            <div className="pt-4">
              <Button onClick={saveScanSettings}>
                Save Scan Settings
              </Button>
            </div>
          </div>
        </GlassmorphicCard>
      </TabsContent>

      <TabsContent value="alerts" className="space-y-6">
        <GlassmorphicCard moduleId="phantom" level="medium" border shadow className="p-6">
          <h2 className="text-xl font-bold mb-6 text-phantom-red-400">Alert Threshold Settings</h2>

          <div className="space-y-4">
            {/* Critical threshold */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Critical Threshold: {alertThresholds.criticalThreshold}</label>
              </div>
              <Slider
                min={50}
                max={100}
                step={5}
                value={[alertThresholds.criticalThreshold]}
                onValueChange={(value) => handleAlertThresholdChange('criticalThreshold', value[0])}
              />
            </div>

            {/* High threshold */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">High Threshold: {alertThresholds.highThreshold}</label>
              </div>
              <Slider
                min={30}
                max={80}
                step={5}
                value={[alertThresholds.highThreshold]}
                onValueChange={(value) => handleAlertThresholdChange('highThreshold', value[0])}
              />
            </div>

            {/* Medium threshold */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Medium Threshold: {alertThresholds.mediumThreshold}</label>
              </div>
              <Slider
                min={20}
                max={60}
                step={5}
                value={[alertThresholds.mediumThreshold]}
                onValueChange={(value) => handleAlertThresholdChange('mediumThreshold', value[0])}
              />
            </div>

            {/* Low threshold */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Low Threshold: {alertThresholds.lowThreshold}</label>
              </div>
              <Slider
                min={5}
                max={40}
                step={5}
                value={[alertThresholds.lowThreshold]}
                onValueChange={(value) => handleAlertThresholdChange('lowThreshold', value[0])}
              />
            </div>

            {/* Auto-resolve threshold */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Auto-resolve Threshold: {alertThresholds.autoResolveThreshold}</label>
              </div>
              <Slider
                min={0}
                max={30}
                step={5}
                value={[alertThresholds.autoResolveThreshold]}
                onValueChange={(value) => handleAlertThresholdChange('autoResolveThreshold', value[0])}
              />
            </div>

            <div className="border-t border-gray-200 my-4 pt-4">
              <h3 className="text-sm font-medium mb-2">Alert Notifications</h3>

              {/* Alert notifications */}
              <div className="flex items-center justify-between mt-2">
                <div>
                  <h4 className="text-sm">Enable Alert Notifications</h4>
                  <p className="text-xs text-gray-500">Send notifications for alerts</p>
                </div>
                <Toggle
                  isOn={alertThresholds.alertNotifications}
                  onChange={(value) => handleAlertThresholdChange('alertNotifications', value)}
                />
              </div>

              {/* Email alerts */}
              <div className="flex items-center justify-between mt-2">
                <div>
                  <h4 className="text-sm">Email Alerts</h4>
                  <p className="text-xs text-gray-500">Send alerts via email</p>
                </div>
                <Toggle
                  isOn={alertThresholds.emailAlerts}
                  onChange={(value) => handleAlertThresholdChange('emailAlerts', value)}
                  disabled={!alertThresholds.alertNotifications}
                />
              </div>

              {/* Slack alerts */}
              <div className="flex items-center justify-between mt-2">
                <div>
                  <h4 className="text-sm">Slack Alerts</h4>
                  <p className="text-xs text-gray-500">Send alerts to Slack</p>
                </div>
                <Toggle
                  isOn={alertThresholds.slackAlerts}
                  onChange={(value) => handleAlertThresholdChange('slackAlerts', value)}
                  disabled={!alertThresholds.alertNotifications}
                />
              </div>

              {/* Slack webhook */}
              {alertThresholds.slackAlerts && (
                <div className="mt-2">
                  <label className="text-sm font-medium">Slack Webhook URL</label>
                  <input
                    type="text"
                    value={alertThresholds.slackWebhook}
                    onChange={(e) => handleAlertThresholdChange('slackWebhook', e.target.value)}
                    className="w-full p-2 mt-1 border border-gray-300 rounded-md"
                    placeholder="https://hooks.slack.com/services/..."
                    disabled={!alertThresholds.alertNotifications || !alertThresholds.slackAlerts}
                  />
                </div>
              )}
            </div>

            <div className="pt-4">
              <Button onClick={saveAlertThresholds}>
                Save Alert Thresholds
              </Button>
            </div>
          </div>
        </GlassmorphicCard>
      </TabsContent>
    </>
  );

  return (
    <ModuleSettingsPage
      moduleId="phantom"
      moduleName="Phantom"
      moduleDescription="Configure your digital bodyguards and threat detection systems. Paranoia as a service."
      agents={phantomAgents}
      additionalTabs={additionalTabs}
    />
  );
};
