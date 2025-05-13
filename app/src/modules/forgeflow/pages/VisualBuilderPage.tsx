import React, { useState, useCallback, useEffect } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import {
  getAgentTemplates,
  getWorkflowTemplates,
  saveWorkflowDesign,
  getWorkflowDesign,
  getVisualWorkflows
} from '../api/operations';
import { Node, Edge } from 'reactflow';
import { SentientAssistant } from '@src/shared/components/SentientAssistant';
import { WorkflowCanvasWithProvider } from '../components/WorkflowCanvas';
import { NodePalette } from '../components/NodePalette';
import { PropertyPanel } from '../components/PropertyPanel';
import { ForgeflowNav } from '../components/ForgeflowNav';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@src/shared/components/ui/tabs';
import { Button } from '@src/shared/components/ui/button';
import { Loader2 } from 'lucide-react';

/**
 * VisualBuilderPage Component
 *
 * A visual no-code agent builder that allows users to drag and drop components
 * to create custom workflows and automation sequences.
 */
export default function VisualBuilderPage() {
  const navigate = useNavigate();
  const { workflowId } = useParams<{ workflowId: string }>();

  // Fetch agent and task templates
  const { data: agentTemplates, isLoading: isLoadingAgents } = useQuery(getAgentTemplates);
  const { data: taskTemplates, isLoading: isLoadingTasks } = useQuery(getWorkflowTemplates);
  const { data: workflows, isLoading: isLoadingWorkflows } = useQuery(getVisualWorkflows);

  // Actions
  const saveDesignAction = useAction(saveWorkflowDesign);

  // State for the workflow canvas
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedWorkflowId, setSavedWorkflowId] = useState<string | null>(null);
  const [assistantMinimized, setAssistantMinimized] = useState(true);
  const [activeTab, setActiveTab] = useState('editor');

  // Load workflow if workflowId is provided
  useEffect(() => {
    if (workflowId) {
      // Fetch workflow design
      const fetchWorkflowDesign = async () => {
        try {
          const result = await getWorkflowDesign({ workflowId });
          if (result) {
            setWorkflowName(result.name);
            setWorkflowDescription(result.description);
            setNodes(result.nodes);
            setEdges(result.edges);
            setSavedWorkflowId(result.id);
          }
        } catch (error) {
          console.error('Error fetching workflow design:', error);
          alert('Error loading workflow. Please try again.');
        }
      };

      fetchWorkflowDesign();
    }
  }, [workflowId]);

  // Handle node selection
  const handleNodeSelect = useCallback((node: Node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  }, []);

  // Handle edge selection
  const handleEdgeSelect = useCallback((edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, []);

  // Handle node changes
  const handleNodeChange = useCallback((node: Node) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === node.id) {
          return node;
        }
        return n;
      })
    );
  }, []);

  // Handle edge changes
  const handleEdgeChange = useCallback((edge: Edge) => {
    setEdges((eds) =>
      eds.map((e) => {
        if (e.id === edge.id) {
          return edge;
        }
        return e;
      })
    );
  }, []);

  // Handle saving the workflow design
  const handleSaveWorkflow = async () => {
    if (!workflowName || !workflowDescription) {
      alert('Please provide a name and description for your workflow');
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveDesignAction({
        name: workflowName,
        description: workflowDescription,
        nodes,
        edges,
        workflowId: savedWorkflowId,
      });

      setSavedWorkflowId(result.id);
      alert('Workflow saved successfully!');
    } catch (error) {
      console.error('Error saving workflow:', error);
      alert('Error saving workflow. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle creating a new workflow
  const handleNewWorkflow = () => {
    setWorkflowName('');
    setWorkflowDescription('');
    setNodes([]);
    setEdges([]);
    setSavedWorkflowId(null);
    setSelectedNode(null);
    setSelectedEdge(null);
    navigate('/forgeflow/visual-builder');
  };

  // Handle loading a workflow
  const handleLoadWorkflow = (id: string) => {
    navigate(`/forgeflow/visual-builder/${id}`);
  };

  // Loading state
  if (isLoadingAgents || isLoadingTasks) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col">
        <ForgeflowNav />
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-green-400 animate-spin mb-4" />
            <p className="text-lg text-gray-300">Loading Forgeflow Visual Builder...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <ForgeflowNav />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center">
              <TabsList className="bg-gray-700">
                <TabsTrigger value="editor" className="data-[state=active]:bg-green-600">Editor</TabsTrigger>
                <TabsTrigger value="workflows" className="data-[state=active]:bg-green-600">My Workflows</TabsTrigger>
              </TabsList>
            </div>

            {activeTab === 'editor' && (
              <div className="flex space-x-4">
                <div>
                  <input
                    type="text"
                    value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)}
                    placeholder="Workflow Name"
                    className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
                  />
                  <input
                    type="text"
                    value={workflowDescription}
                    onChange={(e) => setWorkflowDescription(e.target.value)}
                    placeholder="Description"
                    className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Button
                  onClick={handleSaveWorkflow}
                  disabled={isSaving || !workflowName || !workflowDescription}
                  className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Workflow'
                  )}
                </Button>
                <Button
                  onClick={handleNewWorkflow}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  New Workflow
                </Button>
              </div>
            )}
          </div>
        </div>

        <TabsContent value="editor" className="flex-grow flex flex-col">
          <div className="flex flex-grow">
            {/* Node Palette */}
            <NodePalette
              agentTemplates={agentTemplates || []}
              taskTemplates={taskTemplates || []}
            />

            {/* Workflow Canvas */}
            <div className="flex-grow">
              <WorkflowCanvasWithProvider
                initialNodes={nodes}
                initialEdges={edges}
                onNodesChange={setNodes}
                onEdgesChange={setEdges}
                onSave={(nodes, edges) => {
                  setNodes(nodes);
                  setEdges(edges);
                }}
              />
            </div>

            {/* Property Panel */}
            <PropertyPanel
              selectedNode={selectedNode}
              selectedEdge={selectedEdge}
              onNodeChange={handleNodeChange}
              onEdgeChange={handleEdgeChange}
            />
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="flex-grow p-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">My Workflows</h2>

            {isLoadingWorkflows ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 text-green-400 animate-spin" />
              </div>
            ) : workflows && workflows.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workflows.map((workflow) => (
                  <div
                    key={workflow.id}
                    className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-green-500 transition-colors"
                  >
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-white mb-1">{workflow.name}</h3>
                      <p className="text-gray-400 text-sm mb-4">{workflow.description}</p>
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-500">
                          Last updated: {new Date(workflow.updatedAt).toLocaleDateString()}
                        </div>
                        <Button
                          onClick={() => handleLoadWorkflow(workflow.id)}
                          className="bg-green-600 hover:bg-green-700 text-white text-sm"
                        >
                          Open
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-lg font-semibold text-white mb-2">No workflows yet</h3>
                <p className="text-gray-400 mb-4">Create your first workflow using the visual builder</p>
                <Button
                  onClick={() => {
                    setActiveTab('editor');
                    handleNewWorkflow();
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Create Workflow
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

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
