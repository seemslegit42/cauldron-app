import React, { useState } from 'react';
import { useUser } from 'wasp/client/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@src/shared/components/ui/Tabs';
import { Card } from '@src/shared/components/ui/Card';
import { Button } from '@src/shared/components/ui/Button';
import { Toggle } from '@src/shared/components/ui/Toggle';
import { AgentConfigPanel } from '@src/shared/components/ai/AgentConfigPanel';
import { useAgentConfig } from '@src/shared/hooks/useAgentConfig';
import { PermissionGuard } from '@src/shared/components/auth/PermissionGuard';
import { 
  ARCANA_RESOURCE, 
  AGENT_CONFIG_RESOURCE, 
  READ_ACTION, 
  UPDATE_ACTION 
} from '@src/shared/utils/permissions';

/**
 * Arcana Module Settings Page
 * 
 * This page allows users to configure settings for the Arcana module,
 * including agent configuration, dashboard preferences, and notifications.
 */
export const SettingsPage: React.FC = () => {
  const user = useUser();
  const [activeTab, setActiveTab] = useState('agents');
  const [isUserOverride, setIsUserOverride] = useState(false);
  
  // Dashboard preferences
  const [dashboardPreferences, setDashboardPreferences] = useState({
    autoRefresh: true,
    refreshInterval: 5, // minutes
    showWelcomeMessage: true,
    defaultView: 'metrics',
  });
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    enableNotifications: true,
    emailNotifications: true,
    desktopNotifications: true,
    notifyOnMetricChanges: true,
    notifyOnSecurityAlerts: true,
    notifyOnRecommendations: true,
  });
  
  // Handle dashboard preference changes
  const handleDashboardPreferenceChange = (key: string, value: any) => {
    setDashboardPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };
  
  // Handle notification setting changes
  const handleNotificationSettingChange = (key: string, value: any) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };
  
  // Save dashboard preferences
  const saveDashboardPreferences = () => {
    // This would typically save to the backend
    alert('Dashboard preferences saved!');
  };
  
  // Save notification settings
  const saveNotificationSettings = () => {
    // This would typically save to the backend
    alert('Notification settings saved!');
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Arcana Settings</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="agents">Agent Configuration</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="agents" className="space-y-6">
          <PermissionGuard
            resource={AGENT_CONFIG_RESOURCE}
            action={READ_ACTION}
            fallback={<div>You don't have permission to view agent configurations.</div>}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Agent Configuration</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Use Organization Defaults</span>
                  <Toggle
                    isOn={!isUserOverride}
                    onChange={(value) => setIsUserOverride(!value)}
                  />
                  <span className="text-sm">Personal Override</span>
                </div>
              </div>
              
              <div className="space-y-8">
                {/* Arcana Prime Agent */}
                <PermissionGuard
                  resource={`${ARCANA_RESOURCE}/agents/arcana-prime`}
                  action={UPDATE_ACTION}
                  fallback={
                    <div className="text-yellow-500 mb-4">
                      You can view but not modify the Arcana Prime agent configuration.
                    </div>
                  }
                >
                  <AgentConfigPanel
                    module="arcana"
                    agentName="arcana-prime"
                    isUserOverride={isUserOverride}
                  />
                </PermissionGuard>
                
                {/* Metrics Analyst Agent */}
                <PermissionGuard
                  resource={`${ARCANA_RESOURCE}/agents/metrics-analyst`}
                  action={UPDATE_ACTION}
                  fallback={
                    <div className="text-yellow-500 mb-4">
                      You can view but not modify the Metrics Analyst agent configuration.
                    </div>
                  }
                >
                  <AgentConfigPanel
                    module="arcana"
                    agentName="metrics-analyst"
                    isUserOverride={isUserOverride}
                  />
                </PermissionGuard>
                
                {/* Recommendations Agent */}
                <PermissionGuard
                  resource={`${ARCANA_RESOURCE}/agents/recommendations`}
                  action={UPDATE_ACTION}
                  fallback={
                    <div className="text-yellow-500 mb-4">
                      You can view but not modify the Recommendations agent configuration.
                    </div>
                  }
                >
                  <AgentConfigPanel
                    module="arcana"
                    agentName="recommendations"
                    isUserOverride={isUserOverride}
                  />
                </PermissionGuard>
              </div>
            </Card>
          </PermissionGuard>
        </TabsContent>
        
        <TabsContent value="dashboard" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">Dashboard Preferences</h2>
            
            <div className="space-y-4">
              {/* Auto-refresh */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Auto-refresh Dashboard</h3>
                  <p className="text-xs text-gray-500">Automatically refresh dashboard data</p>
                </div>
                <Toggle
                  isOn={dashboardPreferences.autoRefresh}
                  onChange={(value) => handleDashboardPreferenceChange('autoRefresh', value)}
                />
              </div>
              
              {/* Refresh interval */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Refresh Interval (minutes)</label>
                <select
                  value={dashboardPreferences.refreshInterval}
                  onChange={(e) => handleDashboardPreferenceChange('refreshInterval', parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  disabled={!dashboardPreferences.autoRefresh}
                >
                  <option value={1}>1 minute</option>
                  <option value={5}>5 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                </select>
              </div>
              
              {/* Welcome message */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Show Welcome Message</h3>
                  <p className="text-xs text-gray-500">Display welcome message on dashboard</p>
                </div>
                <Toggle
                  isOn={dashboardPreferences.showWelcomeMessage}
                  onChange={(value) => handleDashboardPreferenceChange('showWelcomeMessage', value)}
                />
              </div>
              
              {/* Default view */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Default Dashboard View</label>
                <select
                  value={dashboardPreferences.defaultView}
                  onChange={(e) => handleDashboardPreferenceChange('defaultView', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="metrics">Metrics</option>
                  <option value="recommendations">Recommendations</option>
                  <option value="security">Security</option>
                  <option value="decisions">Decisions</option>
                </select>
              </div>
              
              <div className="pt-4">
                <Button onClick={saveDashboardPreferences}>
                  Save Dashboard Preferences
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">Notification Settings</h2>
            
            <div className="space-y-4">
              {/* Enable notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Enable Notifications</h3>
                  <p className="text-xs text-gray-500">Receive notifications from Arcana</p>
                </div>
                <Toggle
                  isOn={notificationSettings.enableNotifications}
                  onChange={(value) => handleNotificationSettingChange('enableNotifications', value)}
                />
              </div>
              
              {/* Email notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Email Notifications</h3>
                  <p className="text-xs text-gray-500">Receive notifications via email</p>
                </div>
                <Toggle
                  isOn={notificationSettings.emailNotifications}
                  onChange={(value) => handleNotificationSettingChange('emailNotifications', value)}
                  disabled={!notificationSettings.enableNotifications}
                />
              </div>
              
              {/* Desktop notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Desktop Notifications</h3>
                  <p className="text-xs text-gray-500">Receive browser notifications</p>
                </div>
                <Toggle
                  isOn={notificationSettings.desktopNotifications}
                  onChange={(value) => handleNotificationSettingChange('desktopNotifications', value)}
                  disabled={!notificationSettings.enableNotifications}
                />
              </div>
              
              <div className="border-t border-gray-200 my-4 pt-4">
                <h3 className="text-sm font-medium mb-2">Notification Types</h3>
                
                {/* Metric changes */}
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <h4 className="text-sm">Metric Changes</h4>
                    <p className="text-xs text-gray-500">Notify when metrics change significantly</p>
                  </div>
                  <Toggle
                    isOn={notificationSettings.notifyOnMetricChanges}
                    onChange={(value) => handleNotificationSettingChange('notifyOnMetricChanges', value)}
                    disabled={!notificationSettings.enableNotifications}
                  />
                </div>
                
                {/* Security alerts */}
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <h4 className="text-sm">Security Alerts</h4>
                    <p className="text-xs text-gray-500">Notify about security issues</p>
                  </div>
                  <Toggle
                    isOn={notificationSettings.notifyOnSecurityAlerts}
                    onChange={(value) => handleNotificationSettingChange('notifyOnSecurityAlerts', value)}
                    disabled={!notificationSettings.enableNotifications}
                  />
                </div>
                
                {/* Recommendations */}
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <h4 className="text-sm">Recommendations</h4>
                    <p className="text-xs text-gray-500">Notify about new AI recommendations</p>
                  </div>
                  <Toggle
                    isOn={notificationSettings.notifyOnRecommendations}
                    onChange={(value) => handleNotificationSettingChange('notifyOnRecommendations', value)}
                    disabled={!notificationSettings.enableNotifications}
                  />
                </div>
              </div>
              
              <div className="pt-4">
                <Button onClick={saveNotificationSettings}>
                  Save Notification Settings
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
