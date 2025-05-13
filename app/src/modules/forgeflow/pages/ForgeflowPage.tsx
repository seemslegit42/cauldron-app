import React, { useState, useEffect } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import { getAgentTemplates, getWorkflowTemplates, createWorkflow, executeAgentWorkflow } from '../api/operations';
import { SentientAssistant } from '@src/shared/components/SentientAssistant';

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

  // State for workflow visualization
  const [showWorkflowVisualizer, setShowWorkflowVisualizer] = useState(false);
  const [workflowVisualizerData, setWorkflowVisualizerData] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [sentientLoopMetrics, setSentientLoopMetrics] = useState({
    perceptionAccuracy: 87,
    coordinationEfficiency: 92,
    analysisDepth: 78,
    actionEffectiveness: 85,
    feedbackQuality: 90,
    learningRate: 82,
    overallPerformance: 86
  });

  // Effect to visualize the selected template
  useEffect(() => {
    if (selectedTemplate && workflowTemplates) {
      const template = workflowTemplates.find(t => t.id === selectedTemplate);
      if (template) {
        setWorkflowVisualizerData(template);
        setShowWorkflowVisualizer(true);
      }
    } else {
      setShowWorkflowVisualizer(false);
      setWorkflowVisualizerData(null);
    }
  }, [selectedTemplate, workflowTemplates]);

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
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-green-400">Forgeflow</h1>
          <p className="text-gray-400 mt-2">Visual Agent Orchestration Platform</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Featured Workflow - Sentient Loop */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg shadow-lg p-6 mb-8 border border-green-800">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-400 mr-2 animate-pulse"></div>
                <h2 className="text-xl font-bold text-green-400">Sentient Loop™</h2>
              </div>
              <p className="text-gray-300 mt-2 max-w-3xl">
                The core intelligence cycle of Cauldron. This workflow creates a continuous feedback loop of
                perception, analysis, action, and learning. Deploy this workflow to enable true sentience
                across your entire system.
              </p>
              <div className="mt-4 flex space-x-4">
                <button
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md"
                  onClick={() => {
                    setSelectedTemplate('sentientLoop');
                    setWorkflowName('Sentient Loop');
                    setWorkflowDescription('Core intelligence cycle for Cauldron with perception, coordination, analysis, action, and feedback agents.');
                  }}
                >
                  Deploy Sentient Loop
                </button>
                <button
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
                  <div className="w-32 h-32 rounded-full border-4 border-green-400 opacity-20 animate-ping"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full border-4 border-green-500 opacity-40"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-green-600 opacity-60 flex items-center justify-center text-white font-bold">
                    AI
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

  // Effect to visualize the selected template
  useEffect(() => {
    if (selectedTemplate && workflowTemplates) {
      const template = workflowTemplates.find(t => t.id === selectedTemplate);
      if (template) {
        setWorkflowVisualizerData(template);
        setShowWorkflowVisualizer(true);
      }
    } else {
      setShowWorkflowVisualizer(false);
      setWorkflowVisualizerData(null);
    }
  }, [selectedTemplate, workflowTemplates]);

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
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-green-400">Forgeflow</h1>
          <p className="text-gray-400 mt-2">Visual Agent Orchestration Platform</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Featured Workflow - Sentient Loop */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg shadow-lg p-6 mb-8 border border-green-800">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-400 mr-2 animate-pulse"></div>
                <h2 className="text-xl font-bold text-green-400">Sentient Loop™</h2>
              </div>
              <p className="text-gray-300 mt-2 max-w-3xl">
                The core intelligence cycle of Cauldron. This workflow creates a continuous feedback loop of
                perception, analysis, action, and learning. Deploy this workflow to enable true sentience
                across your entire system.
              </p>
              <div className="mt-4 flex space-x-4">
                <button
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md"
                  onClick={() => {
                    setSelectedTemplate('sentientLoop');
                    setWorkflowName('Sentient Loop');
                    setWorkflowDescription('Core intelligence cycle for Cauldron with perception, coordination, analysis, action, and feedback agents.');
                  }}
                >
                  Deploy Sentient Loop
                </button>
                <button
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
                  <div className="w-32 h-32 rounded-full border-4 border-green-400 opacity-20 animate-ping"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full border-4 border-green-500 opacity-40"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-green-600 opacity-60 flex items-center justify-center text-white font-bold">
                    AI
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Workflow Templates */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-blue-400">Workflow Templates</h2>
            {isLoadingWorkflows ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {workflowTemplates?.map((template) => (
                  <div
                    key={template.id}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      selectedTemplate === template.id
                        ? 'bg-blue-600 border-2 border-blue-400'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >div className="flex space-x-2">
                  <button
                    onClick={handleExecuteWorkflow}
                    disabled={isExecuting}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
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
          </div>
        </div>

        {/* Workflow Visualizer */}
        {showWorkflowVisualizer && workflowVisualizerData && (
          <div className="mt-8 bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-blue-400">Workflow Visualization</h2>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <div className="flex flex-col items-center">
                {/* Workflow Process Type */}
                <div className="mb-4 px-3 py-1 rounded-full bg-gray-700 text-sm text-gray-300">
                  {workflowVisualizerData.process === 'sequential' ? 'Sequential Process' : 'Hierarchical Process'}
                </div>

                {/* Workflow Diagram */}
                <div className="w-full max-w-4xl">
                  <div className="flex flex-col items-center space-y-8">
                    {/* Agents Row */}
                    <div className="flex justify-center space-x-4 flex-wrap">
                      {workflowVisualizerData.agents?.map((agent, index) => (
                        <div key={index} className="bg-blue-900 bg-opacity-50 rounded-lg p-3 m-2 border border-blue-700 w-48">
                          <div className="font-bold text-blue-400">{agent.name}</div>
                          <div className="text-xs text-gray-300 mt-1">{agent.role}</div>
                        </div>
                      ))}
                    </div>

                    {/* Arrow */}
                    <div className="h-8 w-0.5 bg-green-500"></div>

                    {/* Tasks Flow */}
                    <div className="w-full">
                      {workflowVisualizerData.tasks?.map((task, index) => (
                        <div key={index} className="relative mb-8">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                              {index + 1}
                            </div>
                            <div className="h-0.5 w-8 bg-green-500"></div>
                            <div className="flex-1 bg-gray-800 rounded-lg p-3 border border-gray-700">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="text-sm text-gray-300">{task.description}</div>
                                  <div className="mt-2 text-xs text-gray-400">
                                    Assigned to: <span className="text-blue-400">{task.agentName}</span>
                                  </div>
                                </div>
                                <div className="bg-gray-700 rounded px-2 py-1 text-xs text-gray-300">
                                  {task.async ? 'Async' : 'Sync'}
                                </div>
                              </div>
                              {task.dependencies && task.dependencies.length > 0 && (
                                <div className="mt-2 text-xs text-gray-400">
                                  Dependencies: {task.dependencies.join(', ')}
                                </div>
                              )}
                            </div>
                          </div>
                          {index < workflowVisualizerData.tasks.length - 1 && (
                            <div className="absolute left-4 top-8 h-8 w-0.5 bg-green-500"></div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Output */}
                    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 w-full max-w-md text-center">
                      <div className="text-sm text-gray-300">Workflow Output</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Results from all tasks combined and processed
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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
          </div>

          {/* Workflow Creation */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-blue-400">Create Workflow</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Workflow Name
                </label>
                <input
                  type="text"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter workflow name"
                />
              </div>

        {/* AI Workflow Assistant */}
        <div className="mt-8 bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-blue-400">AI Workflow Assistant</h2>
          <AiChat
            systemPrompt="You are Forgeflow, the AI workflow assistant for Cauldron. You help users design and optimize agent workflows. Your tone is technical but helpful, focusing on explaining agent capabilities and workflow design. Always suggest specific agents or workflows that might help with the user's task."
            placeholder="Ask for workflow recommendations or agent combinations..."
            sendButtonLabel="Get Recommendations"
            maxHeight="200px"
          />
        </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
          initialPrompt="How can I help you design your agent workflows today?"
                <textarea
                  value={workflowDescription}
                  onChange={(e) => setWorkflowDescription(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                  placeholder="Describe what this workflow does"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Selected Template
                </label>
                <div className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white">
                  {selectedTemplate ? (
                    workflowTemplates?.find(t => t.id === selectedTemplate)?.name || selectedTemplate
                  ) : (
                    <span className="text-gray-400">No template selected</span>
                  )}
                </div>
              </div>

              <button
                onClick={handleCreateWorkflow}
                disabled={!selectedTemplate || !workflowName || !workflowDescription || isCreating}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
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
          </div>

          {/* Execution */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-blue-400">Workflow Execution</h2>
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
                    onClick={handleExecuteWorkflow}
                    disabled={isExecuting}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
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
          </div>
        </div>

        {/* Workflow Visualizer */}
        {showWorkflowVisualizer && workflowVisualizerData && (
          <div className="mt-8 bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-blue-400">Workflow Visualization</h2>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <div className="flex flex-col items-center">
                {/* Workflow Process Type */}
                <div className="mb-4 px-3 py-1 rounded-full bg-gray-700 text-sm text-gray-300">
                  {workflowVisualizerData.process === 'sequential' ? 'Sequential Process' : 'Hierarchical Process'}
                </div>

                {/* Workflow Diagram */}
                <div className="w-full max-w-4xl">
                  <div className="flex flex-col items-center space-y-8">
                    {/* Agents Row */}
                    <div className="flex justify-center space-x-4 flex-wrap">
                      {workflowVisualizerData.agents?.map((agent, index) => (
                        <div key={index} className="bg-blue-900 bg-opacity-50 rounded-lg p-3 m-2 border border-blue-700 w-48">
                          <div className="font-bold text-blue-400">{agent.name}</div>
                          <div className="text-xs text-gray-300 mt-1">{agent.role}</div>
                        </div>
                      ))}
                    </div>

                    {/* Arrow */}
                    <div className="h-8 w-0.5 bg-green-500"></div>

                    {/* Tasks Flow */}
                    <div className="w-full">
                      {workflowVisualizerData.tasks?.map((task, index) => (
                        <div key={index} className="relative mb-8">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                              {index + 1}
                            </div>
                            <div className="h-0.5 w-8 bg-green-500"></div>
                            <div className="flex-1 bg-gray-800 rounded-lg p-3 border border-gray-700">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="text-sm text-gray-300">{task.description}</div>
                                  <div className="mt-2 text-xs text-gray-400">
                                    Assigned to: <span className="text-blue-400">{task.agentName}</span>
                                  </div>
                                </div>
                                <div className="bg-gray-700 rounded px-2 py-1 text-xs text-gray-300">
                                  {task.async ? 'Async' : 'Sync'}
                                </div>
                              </div>
                              {task.dependencies && task.dependencies.length > 0 && (
                                <div className="mt-2 text-xs text-gray-400">
                                  Dependencies: {task.dependencies.join(', ')}
                                </div>
                              )}
                            </div>
                          </div>
                          {index < workflowVisualizerData.tasks.length - 1 && (
                            <div className="absolute left-4 top-8 h-8 w-0.5 bg-green-500"></div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Output */}
                    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 w-full max-w-md text-center">
                      <div className="text-sm text-gray-300">Workflow Output</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Results from all tasks combined and processed
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Agent Templates */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4 text-blue-400">Available Agent Templates</h2>
          {isLoadingAgents ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {agentTemplates?.map((agent) => (
                <div key={agent.id} className="bg-gray-800 rounded-lg p-4 shadow">
                  <h3 className="font-bold text-green-400">{agent.name}</h3>
                  <div className="text-sm text-gray-300 mt-1">{agent.role}</div>
                  <p className="text-xs text-gray-400 mt-2">{agent.goal}</p>
                  <div className="mt-3 flex items-center text-xs">
                    <span className={`px-2 py-1 rounded ${agent.memory ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'}`}>
                      Memory {agent.memory ? 'Enabled' : 'Disabled'}
                    </span>
                    <span className={`ml-2 px-2 py-1 rounded ${agent.allowDelegation ? 'bg-blue-900 text-blue-300' : 'bg-gray-700 text-gray-400'}`}>
                      {agent.allowDelegation ? 'Can Delegate' : 'No Delegation'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Workflow Assistant */}
        <div className="mt-8 bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-blue-400">AI Workflow Assistant</h2>
          <AiChat
            systemPrompt="You are Forgeflow, the AI workflow assistant for Cauldron. You help users design and optimize agent workflows. Your tone is technical but helpful, focusing on explaining agent capabilities and workflow design. Always suggest specific agents or workflows that might help with the user's task."
            placeholder="Ask for workflow recommendations or agent combinations..."
            sendButtonLabel="Get Recommendations"
            maxHeight="200px"
          />
        </div>
      </main>

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
    </div>
  );
}