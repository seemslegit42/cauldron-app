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
 * Athena Module Settings Page
 *
 * Where business intelligence meets digital wisdom.
 * This page allows users to configure settings for the Athena module,
 * including agent configuration, data sources, and export preferences.
 * Remember: Even the goddess of wisdom needs proper configuration.
 */
export default function SettingsPage() {
  // Define the agents for the Athena module
  const athenaAgents: ModuleAgent[] = [
    {
      name: 'business-analyst',
      displayName: 'Business Analyst',
      description: 'Analyzes business metrics and provides insights',
      resourcePath: 'agents/business-analyst',
    },
    {
      name: 'strategic-advisor',
      displayName: 'Strategic Advisor',
      description: 'Provides strategic recommendations and decision support',
      resourcePath: 'agents/strategic-advisor',
    },
    {
      name: 'campaign-generator',
      displayName: 'Campaign Generator',
      description: 'Generates campaign suggestions and marketing ideas',
      resourcePath: 'agents/campaign-generator',
    },
    {
      name: 'executive-summarizer',
      displayName: 'Executive Summarizer',
      description: 'Creates executive summaries of business data',
      resourcePath: 'agents/executive-summarizer',
    },
  ];

  // Data source settings
  const [dataSources, setDataSources] = React.useState({
    googleAnalytics: true,
    salesforce: true,
    hubspot: false,
    stripe: true,
    quickbooks: false,
    customAPI: false,
    customAPIUrl: '',
    refreshInterval: 60, // minutes
  });

  // Export settings
  const [exportSettings, setExportSettings] = React.useState({
    notionEnabled: true,
    notionWorkspace: 'Athena Insights',
    googleDocsEnabled: false,
    googleDriveFolder: '',
    slackEnabled: false,
    slackChannel: '',
    exportFormat: 'markdown',
    includeCharts: true,
    includeRawData: false,
  });

  // Handle data source changes
  const handleDataSourceChange = (key: string, value: any) => {
    setDataSources(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handle export setting changes
  const handleExportSettingChange = (key: string, value: any) => {
    setExportSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // Save data source settings
  const saveDataSourceSettings = () => {
    // This would typically save to the backend
    alert('Data source settings saved!');
  };

  // Save export settings
  const saveExportSettings = () => {
    // This would typically save to the backend
    alert('Export settings saved!');
  };

  // Additional tabs for the settings page
  const additionalTabs = (
    <>
      <TabsTrigger value="data-sources">Data Sources</TabsTrigger>
      <TabsTrigger value="export">Export</TabsTrigger>

      <TabsContent value="data-sources" className="space-y-6">
        <GlassmorphicCard moduleId="athena" level="medium" border shadow className="p-6">
          <h2 className="text-xl font-bold mb-6 text-athena-blue-400">Data Sources</h2>

          <div className="space-y-4">
            {/* Google Analytics */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Google Analytics</h3>
                <p className="text-xs text-gray-500">Connect to Google Analytics for web metrics</p>
              </div>
              <Toggle
                isOn={dataSources.googleAnalytics}
                onChange={(value) => handleDataSourceChange('googleAnalytics', value)}
              />
            </div>

            {/* Salesforce */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Salesforce</h3>
                <p className="text-xs text-gray-500">Connect to Salesforce for CRM data</p>
              </div>
              <Toggle
                isOn={dataSources.salesforce}
                onChange={(value) => handleDataSourceChange('salesforce', value)}
              />
            </div>

            {/* HubSpot */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">HubSpot</h3>
                <p className="text-xs text-gray-500">Connect to HubSpot for marketing data</p>
              </div>
              <Toggle
                isOn={dataSources.hubspot}
                onChange={(value) => handleDataSourceChange('hubspot', value)}
              />
            </div>

            {/* Stripe */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Stripe</h3>
                <p className="text-xs text-gray-500">Connect to Stripe for payment data</p>
              </div>
              <Toggle
                isOn={dataSources.stripe}
                onChange={(value) => handleDataSourceChange('stripe', value)}
              />
            </div>

            {/* QuickBooks */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">QuickBooks</h3>
                <p className="text-xs text-gray-500">Connect to QuickBooks for financial data</p>
              </div>
              <Toggle
                isOn={dataSources.quickbooks}
                onChange={(value) => handleDataSourceChange('quickbooks', value)}
              />
            </div>

            {/* Custom API */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Custom API</h3>
                <p className="text-xs text-gray-500">Connect to a custom API endpoint</p>
              </div>
              <Toggle
                isOn={dataSources.customAPI}
                onChange={(value) => handleDataSourceChange('customAPI', value)}
              />
            </div>

            {/* Custom API URL */}
            {dataSources.customAPI && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Custom API URL</label>
                <input
                  type="text"
                  value={dataSources.customAPIUrl}
                  onChange={(e) => handleDataSourceChange('customAPIUrl', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="https://api.example.com/data"
                />
              </div>
            )}

            {/* Refresh Interval */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Refresh Interval: {dataSources.refreshInterval} minutes</label>
              </div>
              <Slider
                min={15}
                max={1440}
                step={15}
                value={[dataSources.refreshInterval]}
                onValueChange={(value) => handleDataSourceChange('refreshInterval', value[0])}
              />
            </div>

            <div className="pt-4">
              <Button onClick={saveDataSourceSettings}>
                Save Data Source Settings
              </Button>
            </div>
          </div>
        </GlassmorphicCard>
      </TabsContent>

      <TabsContent value="export" className="space-y-6">
        <GlassmorphicCard moduleId="athena" level="medium" border shadow className="p-6">
          <h2 className="text-xl font-bold mb-6 text-athena-blue-400">Export Settings</h2>

          <div className="space-y-4">
            {/* Notion */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Notion</h3>
                <p className="text-xs text-gray-500">Export to Notion workspace</p>
              </div>
              <Toggle
                isOn={exportSettings.notionEnabled}
                onChange={(value) => handleExportSettingChange('notionEnabled', value)}
              />
            </div>

            {/* Notion Workspace */}
            {exportSettings.notionEnabled && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Notion Workspace</label>
                <input
                  type="text"
                  value={exportSettings.notionWorkspace}
                  onChange={(e) => handleExportSettingChange('notionWorkspace', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Workspace Name"
                />
              </div>
            )}

            {/* Google Docs */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Google Docs</h3>
                <p className="text-xs text-gray-500">Export to Google Docs</p>
              </div>
              <Toggle
                isOn={exportSettings.googleDocsEnabled}
                onChange={(value) => handleExportSettingChange('googleDocsEnabled', value)}
              />
            </div>

            {/* Google Drive Folder */}
            {exportSettings.googleDocsEnabled && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Google Drive Folder</label>
                <input
                  type="text"
                  value={exportSettings.googleDriveFolder}
                  onChange={(e) => handleExportSettingChange('googleDriveFolder', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Folder Name"
                />
              </div>
            )}

            {/* Slack */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Slack</h3>
                <p className="text-xs text-gray-500">Export to Slack channel</p>
              </div>
              <Toggle
                isOn={exportSettings.slackEnabled}
                onChange={(value) => handleExportSettingChange('slackEnabled', value)}
              />
            </div>

            {/* Slack Channel */}
            {exportSettings.slackEnabled && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Slack Channel</label>
                <input
                  type="text"
                  value={exportSettings.slackChannel}
                  onChange={(e) => handleExportSettingChange('slackChannel', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="#channel-name"
                />
              </div>
            )}

            {/* Export Format */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Export Format</label>
              <Select
                value={exportSettings.exportFormat}
                onValueChange={(value) => handleExportSettingChange('exportFormat', value)}
              >
                <option value="markdown">Markdown</option>
                <option value="html">HTML</option>
                <option value="pdf">PDF</option>
                <option value="csv">CSV (data only)</option>
              </Select>
            </div>

            {/* Include Charts */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Include Charts</h3>
                <p className="text-xs text-gray-500">Include charts and visualizations in exports</p>
              </div>
              <Toggle
                isOn={exportSettings.includeCharts}
                onChange={(value) => handleExportSettingChange('includeCharts', value)}
              />
            </div>

            {/* Include Raw Data */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Include Raw Data</h3>
                <p className="text-xs text-gray-500">Include raw data tables in exports</p>
              </div>
              <Toggle
                isOn={exportSettings.includeRawData}
                onChange={(value) => handleExportSettingChange('includeRawData', value)}
              />
            </div>

            <div className="pt-4">
              <Button onClick={saveExportSettings}>
                Save Export Settings
              </Button>
            </div>
          </div>
        </GlassmorphicCard>
      </TabsContent>
    </>
  );

  return (
    <ModuleSettingsPage
      moduleId="athena"
      moduleName="Athena"
      moduleDescription="Configure your digital oracle. Turn business data into wisdom with a touch of divine insight."
      agents={athenaAgents}
      additionalTabs={additionalTabs}
    />
  );
}
