import React, { useState } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import { getAgentTemplates, getWorkflowTemplates, createWorkflow, executeAgentWorkflow } from '../api/operations';
import { SentientAssistant } from '@src/shared/components/SentientAssistant';
import { ForgeflowLayout } from '../components';
import { GlassmorphicCard } from '@src/shared/components/branding';

export default function ForgeflowBuilder() {
  const { data: agentTemplates, isLoading: isLoadingAgents } = useQuery(getAgentTemplates);
  const { data: workflowTemplates, isLoading: isLoadingWorkflows } = useQuery(getWorkflowTemplates);
  const createWorkflowAction = useAction(createWorkflow);
  const executeWorkflowAction = useAction(executeAgentWorkflow);

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createdWorkflow, setCreatedWorkflow] = useState<any>(null);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [assistantMinimized, setAssistantMinimized] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const handleCreateWorkflow = async () => {
    if (!selectedTemplate || !workflowName || !workflowDescription) return;

    setIsCreating(true);
    try {
      const workflow = await createWorkflowAction({
        templateId: selectedTemplate,
        name: workflowName,
        description: workflowDescription,
      });

      setCreatedWorkflow(workflow);
      setWorkflowName('');
      setWorkflowDescription('');
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Error creating workflow:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleExecuteWorkflow = async () => {
    if (!createdWorkflow) return;

    setIsExecuting(true);
    try {
      const result = await executeWorkflowAction({
        workflowId: createdWorkflow.id,
      });

      setExecutionResult(result);
    } catch (error) {
      console.error('Error executing workflow:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  // Simulate workflow analysis
  const analyzeWorkflow = () => {
    if (!createdWorkflow) return;

    setIsAnalyzing(true);

    // Simulate analysis delay
    setTimeout(() => {
      setAnalysisResult(
        "Workflow Analysis Complete:\n\n" +
        "- Efficiency Score: 87/100\n" +
        "- Estimated Completion Time: 3-5 minutes\n" +
        "- Resource Usage: Optimal\n" +
        "- Potential Bottlenecks: None detected\n\n" +
        "Recommendations:\n" +
        "- Consider adding memory persistence for long-term learning\n" +
        "- The Coordinator Agent could benefit from delegation capabilities\n" +
        "- Add feedback loop to improve future executions"
      );
      setIsAnalyzing(false);
    }, 2500);
  };

  return (
    <ForgeflowLayout
      title="Forgeflow"
      description="Visual Agent Orchestration Platform"
    >
      {/* Featured Workflow - Sentient Loop */}
      <GlassmorphicCard moduleId="forgeflow" level="medium" border shadow className="p-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-yellow-400 mr-2 animate-pulse"></div>
              <h2 className="text-xl font-bold text-yellow-400">Sentient Loop™</h2>
            </div>
            <p className="text-gray-300 mt-2 max-w-3xl">
              The core intelligence cycle of Cauldron. This workflow creates a continuous feedback loop of
              perception, analysis, action, and learning. Deploy this workflow to enable true sentience
              across your entire system.
            </p>
            <div className="mt-4 flex space-x-4">
              <button
                type="button"
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-md"
                onClick={() => {
                  setSelectedTemplate('sentientLoop');
                  setWorkflowName('Sentient Loop');
                  setWorkflowDescription('Core intelligence cycle for Cauldron with perception, coordination, analysis, action, and feedback agents.');
                }}
              >
                Deploy Sentient Loop
              </button>
              <button
                type="button"
                className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md"
                onClick={() => setSelectedTemplate('sentientLoop')}
              >
                View Details
              </button>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="relative w-48 h-48">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-4 border-yellow-400 opacity-20 animate-ping"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border-4 border-yellow-500 opacity-40"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-yellow-600 opacity-60 flex items-center justify-center text-white font-bold">
                  AI
                </div>
              </div>
            </div>
          </div>
        </div>
      </GlassmorphicCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Workflow Templates */}
        <GlassmorphicCard moduleId="forgeflow" level="medium" border shadow className="p-6">
          <h2 className="text-xl font-bold mb-4 text-yellow-400">Workflow Templates</h2>
          {isLoadingWorkflows ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {workflowTemplates?.map((template: any) => (
                <div
                  key={template.id}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    selectedTemplate === template.id
                      ? 'bg-yellow-600 border-2 border-yellow-400'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <h3 className="font-bold">{template.name}</h3>
                  <p className="text-sm text-gray-300 mt-1">{template.description}</p>
                  <div className="flex items-center mt-2 text-xs text-gray-400">
                    <span className="mr-3">{template.agentCount} Agents</span>
                    <span>{template.taskCount} Tasks</span>
                    <span className="ml-auto px-2 py-1 rounded bg-gray-800">
                      {template.process === 'sequential' ? 'Sequential' : 'Hierarchical'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassmorphicCard>

        {/* Workflow Creation */}
        <GlassmorphicCard moduleId="forgeflow" level="medium" border shadow className="p-6">
          <h2 className="text-xl font-bold mb-4 text-yellow-400">Create Workflow</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Workflow Name
              </label>
              <input
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Enter workflow name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 h-24"
                placeholder="Describe what this workflow does"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Selected Template
              </label>
              <div className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white">
                {selectedTemplate ? (
                  workflowTemplates?.find((t: any) => t.id === selectedTemplate)?.name || selectedTemplate
                ) : (
                  <span className="text-gray-400">No template selected</span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCreateWorkflow}
              disabled={!selectedTemplate || !workflowName || !workflowDescription || isCreating}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create Workflow'
              )}
            </button>
          </div>
        </GlassmorphicCard>

        {/* Execution */}
        <GlassmorphicCard moduleId="forgeflow" level="medium" border shadow className="p-6">
          <h2 className="text-xl font-bold mb-4 text-yellow-400">Workflow Execution</h2>
          {createdWorkflow ? (
            <div className="space-y-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="font-bold">{createdWorkflow.name}</h3>
                <p className="text-sm text-gray-300 mt-1">{createdWorkflow.description}</p>
                <div className="mt-2 text-xs text-gray-400">
                  Created at: {new Date(createdWorkflow.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleExecuteWorkflow}
                  disabled={isExecuting}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExecuting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Executing...
                    </span>
                  ) : (
                    'Execute Workflow'
                  )}
                </button>

                <button
                  type="button"
                  onClick={analyzeWorkflow}
                  disabled={isAnalyzing}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                </button>
              </div>

              {executionResult && (
                <div className="mt-4">
                  <h3 className="font-bold text-sm text-gray-300 mb-2">Execution Result</h3>
                  <div className="bg-gray-700 rounded-lg p-4 overflow-auto max-h-60">
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                      {JSON.stringify(executionResult, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {analysisResult && (
                <div className="mt-4">
                  <h3 className="font-bold text-sm text-gray-300 mb-2">Workflow Analysis</h3>
                  <div className="bg-gray-700 rounded-lg p-4 overflow-auto max-h-60">
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                      {analysisResult}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p>Create a workflow to execute it</p>
            </div>
          )}
        </GlassmorphicCard>
      </div>

      {/* Sentient Assistant */}
      <div className="fixed bottom-4 right-4 z-10 w-96">
        <SentientAssistant
          module="forgeflow"
          initialPrompt="How can I help you design your agent workflows today?"
          minimized={assistantMinimized}
          onMinimize={() => setAssistantMinimized(true)}
          onMaximize={() => setAssistantMinimized(false)}
        />
      </div>
    </ForgeflowLayout>
  );
}
