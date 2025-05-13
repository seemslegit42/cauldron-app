import React, { useState, useEffect } from 'react';
import { Card } from '@src/shared/components/ui/Card';
import { Button } from '@src/shared/components/ui/Button';
import { Select } from '@src/shared/components/ui/Select';
import { AgentConfig } from './AgentConfigPanel';

export interface AgentPreviewProps {
  /** Agent name */
  agentName: string;
  /** Module this agent belongs to */
  module: string;
  /** Agent configuration */
  config: AgentConfig;
  /** Sample prompts to choose from */
  samplePrompts?: string[];
  /** Additional class name */
  className?: string;
  /** Whether to auto-generate on config change */
  autoGenerate?: boolean;
}

/**
 * Agent Preview component
 * 
 * Shows a preview of how an agent would respond with the current configuration
 */
export const AgentPreview: React.FC<AgentPreviewProps> = ({
  agentName,
  module,
  config,
  samplePrompts = [
    "Summarize the latest business metrics for me",
    "Analyze the security threats detected in the last 24 hours",
    "Generate a blog post about our new product features",
    "What strategic decisions should I consider for Q3?",
  ],
  className = '',
  autoGenerate = false,
}) => {
  const [selectedPrompt, setSelectedPrompt] = useState(samplePrompts[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  
  // Generate a preview response based on the configuration
  const generatePreview = async () => {
    setIsGenerating(true);
    setResponse(null);
    
    try {
      // This would be replaced with an actual API call
      // For now, simulate a response based on configuration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let previewResponse = `[Preview of ${agentName} with temperature=${config.temperature}, verbosity=${config.verbosity}]\n\n`;
      
      // Adjust response based on personality
      switch (config.personality) {
        case 'professional':
          previewResponse += "I've analyzed the data and prepared a concise summary for your review.";
          break;
        case 'friendly':
          previewResponse += "Hey there! I took a look at this and thought you might find these insights helpful!";
          break;
        case 'technical':
          previewResponse += "Analysis complete. The following data points indicate significant patterns that warrant attention.";
          break;
        case 'creative':
          previewResponse += "Imagine your business as a ship navigating through changing waters. Here's what I see on the horizon...";
          break;
      }
      
      // Adjust response based on verbosity
      if (config.verbosity === 'minimal') {
        previewResponse += "\n\n• Key point 1\n• Key point 2\n• Key point 3";
      } else if (config.verbosity === 'moderate') {
        previewResponse += "\n\n1. First insight with brief explanation\n2. Second insight with context\n3. Third insight with recommendations";
      } else {
        previewResponse += "\n\n## Detailed Analysis\n\nThe data shows several important trends:\n\n1. First trend with comprehensive explanation and supporting evidence\n2. Second trend with historical context and future implications\n3. Third trend with multiple action items and strategic considerations";
      }
      
      setResponse(previewResponse);
    } catch (error) {
      console.error('Error generating preview:', error);
      setResponse('Error generating preview. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Generate preview when config changes if autoGenerate is true
  useEffect(() => {
    if (autoGenerate) {
      generatePreview();
    }
  }, [config, autoGenerate]);
  
  return (
    <Card className={`p-4 ${className}`}>
      <h3 className="text-lg font-medium mb-4">Response Preview</h3>
      <div className="space-y-4">
        <div className="flex space-x-2">
          <Select
            value={selectedPrompt}
            onValueChange={setSelectedPrompt}
            className="flex-1"
          >
            {samplePrompts.map((prompt, index) => (
              <option key={index} value={prompt}>{prompt}</option>
            ))}
          </Select>
          <Button 
            onClick={generatePreview}
            isLoading={isGenerating}
            disabled={isGenerating}
          >
            Generate Preview
          </Button>
        </div>
        
        <div className="border rounded-md p-4 min-h-[200px] bg-gray-50 dark:bg-gray-900">
          {isGenerating ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : response ? (
            <div className="whitespace-pre-wrap">{response}</div>
          ) : (
            <div className="text-gray-500 flex items-center justify-center h-full">
              Click "Generate Preview" to see how the agent would respond with current settings
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
