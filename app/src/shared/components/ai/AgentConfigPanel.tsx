import React, { useState, useEffect } from 'react';
import { useAction, useQuery } from 'wasp/client/operations';
import { Slider } from '@src/shared/components/ui/Slider';
import { Toggle } from '@src/shared/components/ui/Toggle';
import { Button } from '@src/shared/components/ui/Button';
import { Card } from '@src/shared/components/ui/Card';
import { Select } from '@src/shared/components/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@src/shared/components/ui/Tabs';
import { useToast } from '@src/shared/hooks/useToast';
import { AgentPreview } from './AgentPreview';

// Types for agent configuration
export interface AgentConfig {
  // Basic settings
  temperature: number;
  verbosity: 'minimal' | 'moderate' | 'detailed';
  personality: 'professional' | 'friendly' | 'technical' | 'creative';
  
  // Approval workflow settings
  requireApproval: boolean;
  approvalThreshold: 'low' | 'medium' | 'high' | 'critical';
  autoApproveLevel: 'none' | 'low' | 'medium' | 'high';
  
  // Alert settings
  alertingEnabled: boolean;
  alertThresholds: {
    latency: number; // ms
    errorRate: number; // percentage (0-100)
    tokenUsage: number; // percentage of budget (0-100)
  };
  
  // Advanced settings
  maxTokens: number;
  topP: number;
  presencePenalty: number;
  frequencyPenalty: number;
  
  // Model settings
  model: string;
  provider: 'OPENAI' | 'GROQ' | 'ANTHROPIC' | 'OTHER';
}

// Default configuration
export const defaultAgentConfig: AgentConfig = {
  temperature: 0.7,
  verbosity: 'moderate',
  personality: 'professional',
  requireApproval: true,
  approvalThreshold: 'medium',
  autoApproveLevel: 'low',
  alertingEnabled: true,
  alertThresholds: {
    latency: 3000, // 3 seconds
    errorRate: 5, // 5%
    tokenUsage: 80, // 80% of budget
  },
  maxTokens: 1000,
  topP: 0.95,
  presencePenalty: 0,
  frequencyPenalty: 0,
  model: 'llama3-70b-8192',
  provider: 'GROQ',
};

// Available models by provider
const availableModels = {
  GROQ: [
    { id: 'llama3-8b-8192', name: 'Llama 3 8B' },
    { id: 'llama3-70b-8192', name: 'Llama 3 70B' },
    { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B' },
    { id: 'gemma-7b-it', name: 'Gemma 7B' },
  ],
  ANTHROPIC: [
    { id: 'claude-3-opus', name: 'Claude 3 Opus' },
    { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet' },
    { id: 'claude-3-haiku', name: 'Claude 3 Haiku' },
  ],
  OPENAI: [
    { id: 'gpt-4o', name: 'GPT-4o' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
  ],
  OTHER: [
    { id: 'custom', name: 'Custom Model' },
  ],
};

// Sample prompts for preview
const samplePrompts = [
  "Summarize the latest business metrics for me",
  "Analyze the security threats detected in the last 24 hours",
  "Generate a blog post about our new product features",
  "What strategic decisions should I consider for Q3?",
];

export interface AgentConfigPanelProps {
  /** Module this configuration is for */
  module: string;
  /** Agent name */
  agentName: string;
  /** Initial configuration */
  initialConfig?: Partial<AgentConfig>;
  /** Whether this is a user override (vs. organization default) */
  isUserOverride?: boolean;
  /** Callback when configuration is saved */
  onSave?: (config: AgentConfig) => void;
  /** Additional class name */
  className?: string;
}

/**
 * Agent Configuration Panel component
 * 
 * Allows configuring agent settings like temperature, verbosity, personality,
 * approval workflows, and alerting thresholds with real-time previews.
 */
export const AgentConfigPanel: React.FC<AgentConfigPanelProps> = ({
  module,
  agentName,
  initialConfig = {},
  isUserOverride = false,
  onSave,
  className = '',
}) => {
  // Merge initial config with defaults
  const [config, setConfig] = useState<AgentConfig>({
    ...defaultAgentConfig,
    ...initialConfig,
  });
  
  // Preview state
  const [previewPrompt, setPreviewPrompt] = useState(samplePrompts[0]);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [previewResponse, setPreviewResponse] = useState<string | null>(null);
  
  // Toast notifications
  const { toast } = useToast();
  
  // Handle config changes
  const handleConfigChange = <K extends keyof AgentConfig>(key: K, value: AgentConfig[K]) => {
    setConfig(prev => ({
      ...prev,
      [key]: value,
    }));
  };
  
  // Handle alert threshold changes
  const handleAlertThresholdChange = (key: keyof AgentConfig['alertThresholds'], value: number) => {
    setConfig(prev => ({
      ...prev,
      alertThresholds: {
        ...prev.alertThresholds,
        [key]: value,
      },
    }));
  };
  
  // Generate preview
  const generatePreview = async () => {
    setIsGeneratingPreview(true);
    setPreviewResponse(null);
    
    try {
      // This would be replaced with an actual API call
      // For now, simulate a response based on configuration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let response = `[Preview of ${agentName} with temperature=${config.temperature}, verbosity=${config.verbosity}]\n\n`;
      
      // Adjust response based on personality
      switch (config.personality) {
        case 'professional':
          response += "I've analyzed the data and prepared a concise summary for your review.";
          break;
        case 'friendly':
          response += "Hey there! I took a look at this and thought you might find these insights helpful!";
          break;
        case 'technical':
          response += "Analysis complete. The following data points indicate significant patterns that warrant attention.";
          break;
        case 'creative':
          response += "Imagine your business as a ship navigating through changing waters. Here's what I see on the horizon...";
          break;
      }
      
      // Adjust response based on verbosity
      if (config.verbosity === 'minimal') {
        response += "\n\n• Key point 1\n• Key point 2\n• Key point 3";
      } else if (config.verbosity === 'moderate') {
        response += "\n\n1. First insight with brief explanation\n2. Second insight with context\n3. Third insight with recommendations";
      } else {
        response += "\n\n## Detailed Analysis\n\nThe data shows several important trends:\n\n1. First trend with comprehensive explanation and supporting evidence\n2. Second trend with historical context and future implications\n3. Third trend with multiple action items and strategic considerations";
      }
      
      setPreviewResponse(response);
    } catch (error) {
      console.error('Error generating preview:', error);
      toast({
        title: 'Preview generation failed',
        description: 'Could not generate a preview with the current settings.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingPreview(false);
    }
  };
  
  // Save configuration
  const saveConfiguration = async () => {
    try {
      // This would be replaced with an actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: 'Configuration saved',
        description: `${agentName} settings have been updated successfully.`,
        variant: 'default',
      });
      
      if (onSave) {
        onSave(config);
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: 'Save failed',
        description: 'Could not save the configuration. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{agentName} Configuration</h2>
        <div className="flex items-center space-x-2">
          {isUserOverride && (
            <span className="text-sm text-blue-500 bg-blue-500/10 px-2 py-1 rounded">
              User Override
            </span>
          )}
          <Button onClick={saveConfiguration}>
            Save Configuration
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="basic">
        <TabsList>
          <TabsTrigger value="basic">Basic Settings</TabsTrigger>
          <TabsTrigger value="approval">Approval Workflow</TabsTrigger>
          <TabsTrigger value="alerting">Alerting</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4 pt-4">
          {/* Temperature */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Temperature: {config.temperature.toFixed(2)}</label>
              <span className="text-xs text-gray-500">
                {config.temperature < 0.3 ? 'More deterministic' : 
                 config.temperature > 0.7 ? 'More creative' : 'Balanced'}
              </span>
            </div>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={[config.temperature]}
              onValueChange={(value) => handleConfigChange('temperature', value[0])}
            />
          </div>
          
          {/* Verbosity */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Verbosity</label>
            <Select
              value={config.verbosity}
              onValueChange={(value) => handleConfigChange('verbosity', value as AgentConfig['verbosity'])}
            >
              <option value="minimal">Minimal - Concise responses</option>
              <option value="moderate">Moderate - Balanced detail</option>
              <option value="detailed">Detailed - Comprehensive responses</option>
            </Select>
          </div>
          
          {/* Personality */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Personality</label>
            <Select
              value={config.personality}
              onValueChange={(value) => handleConfigChange('personality', value as AgentConfig['personality'])}
            >
              <option value="professional">Professional - Formal and business-oriented</option>
              <option value="friendly">Friendly - Conversational and approachable</option>
              <option value="technical">Technical - Precise and data-focused</option>
              <option value="creative">Creative - Imaginative and metaphorical</option>
            </Select>
          </div>
          
          {/* Model Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Model Provider</label>
            <Select
              value={config.provider}
              onValueChange={(value) => handleConfigChange('provider', value as AgentConfig['provider'])}
            >
              <option value="GROQ">Groq</option>
              <option value="ANTHROPIC">Anthropic</option>
              <option value="OPENAI">OpenAI</option>
              <option value="OTHER">Other</option>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Model</label>
            <Select
              value={config.model}
              onValueChange={(value) => handleConfigChange('model', value)}
            >
              {availableModels[config.provider].map((model) => (
                <option key={model.id} value={model.id}>{model.name}</option>
              ))}
            </Select>
          </div>
        </TabsContent>
        
        <TabsContent value="approval" className="space-y-4 pt-4">
          {/* Require Approval */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">Require Human Approval</h3>
              <p className="text-xs text-gray-500">Require human approval before executing certain actions</p>
            </div>
            <Toggle
              isOn={config.requireApproval}
              onChange={(value) => handleConfigChange('requireApproval', value)}
            />
          </div>
          
          {/* Approval Threshold */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Approval Threshold</label>
            <Select
              value={config.approvalThreshold}
              onValueChange={(value) => handleConfigChange('approvalThreshold', value as AgentConfig['approvalThreshold'])}
              disabled={!config.requireApproval}
            >
              <option value="low">Low - Only approve high-risk actions</option>
              <option value="medium">Medium - Approve moderate to high-risk actions</option>
              <option value="high">High - Approve most actions except trivial ones</option>
              <option value="critical">Critical - Approve all actions</option>
            </Select>
          </div>
          
          {/* Auto-approve Level */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Auto-approve Level</label>
            <Select
              value={config.autoApproveLevel}
              onValueChange={(value) => handleConfigChange('autoApproveLevel', value as AgentConfig['autoApproveLevel'])}
              disabled={!config.requireApproval}
            >
              <option value="none">None - No auto-approvals</option>
              <option value="low">Low - Auto-approve trivial actions</option>
              <option value="medium">Medium - Auto-approve low-risk actions</option>
              <option value="high">High - Auto-approve all but high-risk actions</option>
            </Select>
          </div>
        </TabsContent>
        
        <TabsContent value="alerting" className="space-y-4 pt-4">
          {/* Alerting Enabled */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">Enable Alerting</h3>
              <p className="text-xs text-gray-500">Send alerts when thresholds are exceeded</p>
            </div>
            <Toggle
              isOn={config.alertingEnabled}
              onChange={(value) => handleConfigChange('alertingEnabled', value)}
            />
          </div>
          
          {/* Latency Threshold */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Latency Threshold: {config.alertThresholds.latency}ms</label>
            </div>
            <Slider
              min={500}
              max={10000}
              step={100}
              value={[config.alertThresholds.latency]}
              onValueChange={(value) => handleAlertThresholdChange('latency', value[0])}
              disabled={!config.alertingEnabled}
            />
          </div>
          
          {/* Error Rate Threshold */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Error Rate Threshold: {config.alertThresholds.errorRate}%</label>
            </div>
            <Slider
              min={1}
              max={20}
              step={1}
              value={[config.alertThresholds.errorRate]}
              onValueChange={(value) => handleAlertThresholdChange('errorRate', value[0])}
              disabled={!config.alertingEnabled}
            />
          </div>
          
          {/* Token Usage Threshold */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Token Usage Threshold: {config.alertThresholds.tokenUsage}%</label>
            </div>
            <Slider
              min={50}
              max={95}
              step={5}
              value={[config.alertThresholds.tokenUsage]}
              onValueChange={(value) => handleAlertThresholdChange('tokenUsage', value[0])}
              disabled={!config.alertingEnabled}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-4 pt-4">
          {/* Max Tokens */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Max Tokens: {config.maxTokens}</label>
            </div>
            <Slider
              min={100}
              max={4000}
              step={100}
              value={[config.maxTokens]}
              onValueChange={(value) => handleConfigChange('maxTokens', value[0])}
            />
          </div>
          
          {/* Top P */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Top P: {config.topP.toFixed(2)}</label>
            </div>
            <Slider
              min={0.1}
              max={1}
              step={0.01}
              value={[config.topP]}
              onValueChange={(value) => handleConfigChange('topP', value[0])}
            />
          </div>
          
          {/* Presence Penalty */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Presence Penalty: {config.presencePenalty.toFixed(1)}</label>
            </div>
            <Slider
              min={-2}
              max={2}
              step={0.1}
              value={[config.presencePenalty]}
              onValueChange={(value) => handleConfigChange('presencePenalty', value[0])}
            />
          </div>
          
          {/* Frequency Penalty */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Frequency Penalty: {config.frequencyPenalty.toFixed(1)}</label>
            </div>
            <Slider
              min={-2}
              max={2}
              step={0.1}
              value={[config.frequencyPenalty]}
              onValueChange={(value) => handleConfigChange('frequencyPenalty', value[0])}
            />
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Preview Section */}
      <Card className="p-4 mt-6">
        <h3 className="text-lg font-medium mb-4">Response Preview</h3>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Select
              value={previewPrompt}
              onValueChange={setPreviewPrompt}
              className="flex-1"
            >
              {samplePrompts.map((prompt, index) => (
                <option key={index} value={prompt}>{prompt}</option>
              ))}
            </Select>
            <Button 
              onClick={generatePreview}
              isLoading={isGeneratingPreview}
              disabled={isGeneratingPreview}
            >
              Generate Preview
            </Button>
          </div>
          
          <div className="border rounded-md p-4 min-h-[200px] bg-gray-50 dark:bg-gray-900">
            {isGeneratingPreview ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : previewResponse ? (
              <div className="whitespace-pre-wrap">{previewResponse}</div>
            ) : (
              <div className="text-gray-500 flex items-center justify-center h-full">
                Click "Generate Preview" to see how the agent would respond with current settings
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
