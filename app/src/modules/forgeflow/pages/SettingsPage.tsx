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

/**
 * Forgeflow Module Settings Page
 * 
 * This page allows users to configure settings for the Forgeflow module,
 * including agent configuration, workflow settings, and execution preferences.
 */
export default function SettingsPage() {
  // Define the agents for the Forgeflow module
  const forgeflowAgents: ModuleAgent[] = [
    {
      name: 'workflow-orchestrator',
      displayName: 'Workflow Orchestrator',
      description: 'Orchestrates and manages agent workflows',
      resourcePath: 'agents/workflow-orchestrator',
    },
    {
      name: 'agent-builder',
      displayName: 'Agent Builder',
      description: 'Helps create and configure new agents',
      resourcePath: 'agents/agent-builder',
    },
    {
      name: 'workflow-debugger',
      displayName: 'Workflow Debugger',
      description: 'Analyzes and debugs workflow issues',
      resourcePath: 'agents/workflow-debugger',
    },
    {
      name: 'workflow-optimizer',
      displayName: 'Workflow Optimizer',
      description: 'Optimizes workflows for efficiency and performance',
      resourcePath: 'agents/workflow-optimizer',
    },
  ];
  
  // Workflow settings
  const [workflowSettings, setWorkflowSettings] = React.useState({
    maxConcurrentWorkflows: 5,
    maxStepsPerWorkflow: 20,
    defaultExecutionTimeout: 300, // seconds
    enableParallelExecution: true,
    enableWorkflowHistory: true,
    workflowHistoryRetention: 30, // days
    enableAutoRetry: true,
    maxRetryAttempts: 3,
    retryDelaySeconds: 5,
  });
  
  // Execution preferences
  const [executionPreferences, setExecutionPreferences] = React.useState({
    defaultExecutionMode: 'automatic',
    requireApprovalForActions: true,
    logExecutionDetails: true,
    notifyOnCompletion: true,
    notifyOnError: true,
    notificationEmail: '',
    enableExecutionMetrics: true,
    enableResourceMonitoring: true,
    resourceLimitCPU: 80, // percentage
    resourceLimitMemory: 70, // percentage
  });
  
  // Handle workflow setting changes
  const handleWorkflowSettingChange = (key: string, value: any) => {
    setWorkflowSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };
  
  // Handle execution preference changes
  const handleExecutionPreferenceChange = (key: string, value: any) => {
    setExecutionPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };
  
  // Save workflow settings
  const saveWorkflowSettings = () => {
    // This would typically save to the backend
    alert('Workflow settings saved!');
  };
  
  // Save execution preferences
  const saveExecutionPreferences = () => {
    // This would typically save to the backend
    alert('Execution preferences saved!');
  };
  
  // Additional tabs for the settings page
  const additionalTabs = (
    <>
      <TabsTrigger value="workflow">Workflow Settings</TabsTrigger>
      <TabsTrigger value="execution">Execution Preferences</TabsTrigger>
      
      <TabsContent value="workflow" className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6">Workflow Settings</h2>
          
          <div className="space-y-4">
            {/* Max Concurrent Workflows */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Max Concurrent Workflows: {workflowSettings.maxConcurrentWorkflows}</label>
              </div>
              <Slider
                min={1}
                max={20}
                step={1}
                value={[workflowSettings.maxConcurrentWorkflows]}
                onValueChange={(value) => handleWorkflowSettingChange('maxConcurrentWorkflows', value[0])}
              />
            </div>
            
            {/* Max Steps Per Workflow */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Max Steps Per Workflow: {workflowSettings.maxStepsPerWorkflow}</label>
              </div>
              <Slider
                min={5}
                max={50}
                step={5}
                value={[workflowSettings.maxStepsPerWorkflow]}
                onValueChange={(value) => handleWorkflowSettingChange('maxStepsPerWorkflow', value[0])}
              />
            </div>
            
            {/* Default Execution Timeout */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Default Execution Timeout: {workflowSettings.defaultExecutionTimeout} seconds</label>
              </div>
              <Slider
                min={60}
                max={1800}
                step={60}
                value={[workflowSettings.defaultExecutionTimeout]}
                onValueChange={(value) => handleWorkflowSettingChange('defaultExecutionTimeout', value[0])}
              />
            </div>
            
            {/* Enable Parallel Execution */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Enable Parallel Execution</h3>
                <p className="text-xs text-gray-500">Allow workflow steps to execute in parallel when possible</p>
              </div>
              <Toggle
                isOn={workflowSettings.enableParallelExecution}
                onChange={(value) => handleWorkflowSettingChange('enableParallelExecution', value)}
              />
            </div>
            
            {/* Enable Workflow History */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Enable Workflow History</h3>
                <p className="text-xs text-gray-500">Store execution history for workflows</p>
              </div>
              <Toggle
                isOn={workflowSettings.enableWorkflowHistory}
                onChange={(value) => handleWorkflowSettingChange('enableWorkflowHistory', value)}
              />
            </div>
            
            {/* Workflow History Retention */}
            {workflowSettings.enableWorkflowHistory && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">History Retention: {workflowSettings.workflowHistoryRetention} days</label>
                </div>
                <Slider
                  min={7}
                  max={90}
                  step={7}
                  value={[workflowSettings.workflowHistoryRetention]}
                  onValueChange={(value) => handleWorkflowSettingChange('workflowHistoryRetention', value[0])}
                />
              </div>
            )}
            
            {/* Enable Auto Retry */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Enable Auto Retry</h3>
                <p className="text-xs text-gray-500">Automatically retry failed workflow steps</p>
              </div>
              <Toggle
                isOn={workflowSettings.enableAutoRetry}
                onChange={(value) => handleWorkflowSettingChange('enableAutoRetry', value)}
              />
            </div>
            
            {/* Max Retry Attempts */}
            {workflowSettings.enableAutoRetry && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Max Retry Attempts: {workflowSettings.maxRetryAttempts}</label>
                </div>
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  value={[workflowSettings.maxRetryAttempts]}
                  onValueChange={(value) => handleWorkflowSettingChange('maxRetryAttempts', value[0])}
                />
              </div>
            )}
            
            {/* Retry Delay */}
            {workflowSettings.enableAutoRetry && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Retry Delay: {workflowSettings.retryDelaySeconds} seconds</label>
                </div>
                <Slider
                  min={1}
                  max={60}
                  step={1}
                  value={[workflowSettings.retryDelaySeconds]}
                  onValueChange={(value) => handleWorkflowSettingChange('retryDelaySeconds', value[0])}
                />
              </div>
            )}
            
            <div className="pt-4">
              <Button onClick={saveWorkflowSettings}>
                Save Workflow Settings
              </Button>
            </div>
          </div>
        </Card>
      </TabsContent>
      
      <TabsContent value="execution" className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6">Execution Preferences</h2>
          
          <div className="space-y-4">
            {/* Default Execution Mode */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Default Execution Mode</label>
              <Select
                value={executionPreferences.defaultExecutionMode}
                onValueChange={(value) => handleExecutionPreferenceChange('defaultExecutionMode', value)}
              >
                <option value="automatic">Automatic (No Confirmation)</option>
                <option value="semi-automatic">Semi-Automatic (Confirm Actions)</option>
                <option value="manual">Manual (Step-by-Step)</option>
              </Select>
            </div>
            
            {/* Require Approval For Actions */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Require Approval For Actions</h3>
                <p className="text-xs text-gray-500">Require human approval for workflow actions</p>
              </div>
              <Toggle
                isOn={executionPreferences.requireApprovalForActions}
                onChange={(value) => handleExecutionPreferenceChange('requireApprovalForActions', value)}
              />
            </div>
            
            {/* Log Execution Details */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Log Execution Details</h3>
                <p className="text-xs text-gray-500">Store detailed logs of workflow execution</p>
              </div>
              <Toggle
                isOn={executionPreferences.logExecutionDetails}
                onChange={(value) => handleExecutionPreferenceChange('logExecutionDetails', value)}
              />
            </div>
            
            {/* Notify On Completion */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Notify On Completion</h3>
                <p className="text-xs text-gray-500">Send notification when workflow completes</p>
              </div>
              <Toggle
                isOn={executionPreferences.notifyOnCompletion}
                onChange={(value) => handleExecutionPreferenceChange('notifyOnCompletion', value)}
              />
            </div>
            
            {/* Notify On Error */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Notify On Error</h3>
                <p className="text-xs text-gray-500">Send notification when workflow encounters an error</p>
              </div>
              <Toggle
                isOn={executionPreferences.notifyOnError}
                onChange={(value) => handleExecutionPreferenceChange('notifyOnError', value)}
              />
            </div>
            
            {/* Notification Email */}
            {(executionPreferences.notifyOnCompletion || executionPreferences.notifyOnError) && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Notification Email</label>
                <input
                  type="email"
                  value={executionPreferences.notificationEmail}
                  onChange={(e) => handleExecutionPreferenceChange('notificationEmail', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="email@example.com"
                />
              </div>
            )}
            
            {/* Enable Execution Metrics */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Enable Execution Metrics</h3>
                <p className="text-xs text-gray-500">Collect metrics on workflow execution</p>
              </div>
              <Toggle
                isOn={executionPreferences.enableExecutionMetrics}
                onChange={(value) => handleExecutionPreferenceChange('enableExecutionMetrics', value)}
              />
            </div>
            
            {/* Enable Resource Monitoring */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Enable Resource Monitoring</h3>
                <p className="text-xs text-gray-500">Monitor resource usage during workflow execution</p>
              </div>
              <Toggle
                isOn={executionPreferences.enableResourceMonitoring}
                onChange={(value) => handleExecutionPreferenceChange('enableResourceMonitoring', value)}
              />
            </div>
            
            {/* Resource Limits */}
            {executionPreferences.enableResourceMonitoring && (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">CPU Limit: {executionPreferences.resourceLimitCPU}%</label>
                  </div>
                  <Slider
                    min={10}
                    max={100}
                    step={5}
                    value={[executionPreferences.resourceLimitCPU]}
                    onValueChange={(value) => handleExecutionPreferenceChange('resourceLimitCPU', value[0])}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">Memory Limit: {executionPreferences.resourceLimitMemory}%</label>
                  </div>
                  <Slider
                    min={10}
                    max={100}
                    step={5}
                    value={[executionPreferences.resourceLimitMemory]}
                    onValueChange={(value) => handleExecutionPreferenceChange('resourceLimitMemory', value[0])}
                  />
                </div>
              </>
            )}
            
            <div className="pt-4">
              <Button onClick={saveExecutionPreferences}>
                Save Execution Preferences
              </Button>
            </div>
          </div>
        </Card>
      </TabsContent>
    </>
  );
  
  return (
    <ModuleSettingsPage
      moduleId="forgeflow"
      moduleName="Forgeflow"
      moduleDescription="Configure settings for the Forgeflow agent builder module, including agent behavior, workflow settings, and execution preferences."
      agents={forgeflowAgents}
      additionalTabs={additionalTabs}
    />
  );
}
