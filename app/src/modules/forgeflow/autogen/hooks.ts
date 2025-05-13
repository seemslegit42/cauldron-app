/**
 * AutoGen Studio Hooks
 * 
 * This file provides React hooks for AutoGen Studio integration.
 */

import { useState, useEffect } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import { 
  getAutoGenAgentTemplates, 
  getAutoGenWorkflowTemplates, 
  createAutoGenWorkflow, 
  executeAutoGenWorkflow 
} from './operations';

/**
 * Hook for managing AutoGen agent templates
 */
export const useAutoGenAgentTemplates = () => {
  const { data: templates, isLoading, error } = useQuery(getAutoGenAgentTemplates);
  
  return {
    templates,
    isLoading,
    error
  };
};

/**
 * Hook for managing AutoGen workflow templates
 */
export const useAutoGenWorkflowTemplates = () => {
  const { data: templates, isLoading, error } = useQuery(getAutoGenWorkflowTemplates);
  
  return {
    templates,
    isLoading,
    error
  };
};

/**
 * Hook for creating an AutoGen workflow
 */
export const useCreateAutoGenWorkflow = () => {
  const createWorkflowAction = useAction(createAutoGenWorkflow);
  const [isCreating, setIsCreating] = useState(false);
  
  const createWorkflow = async (workflowData: any) => {
    setIsCreating(true);
    try {
      const result = await createWorkflowAction(workflowData);
      return result;
    } catch (error) {
      console.error('Error creating AutoGen workflow:', error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };
  
  return {
    createWorkflow,
    isCreating
  };
};

/**
 * Hook for executing an AutoGen workflow
 */
export const useExecuteAutoGenWorkflow = () => {
  const executeWorkflowAction = useAction(executeAutoGenWorkflow);
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);
  
  const executeWorkflow = async (workflowId: string, input: string, options?: any) => {
    setIsExecuting(true);
    setError(null);
    try {
      const executionResult = await executeWorkflowAction({
        workflowId,
        input,
        options
      });
      setResult(executionResult);
      return executionResult;
    } catch (err) {
      console.error('Error executing AutoGen workflow:', err);
      setError(err as Error);
      throw err;
    } finally {
      setIsExecuting(false);
    }
  };
  
  return {
    executeWorkflow,
    isExecuting,
    result,
    error,
    reset: () => {
      setResult(null);
      setError(null);
    }
  };
};

/**
 * Hook for managing an AutoGen workflow design
 */
export const useAutoGenWorkflowDesign = () => {
  const [workflow, setWorkflow] = useState<any>({
    name: '',
    description: '',
    agents: [],
    config: {
      maxRounds: 10,
      maxMessages: 100,
      memoryType: 'basic',
      humanInTheLoop: true,
    },
    tasks: [],
    visualization: {
      layout: 'circular',
      showMessages: true,
      showAgentStatus: true,
    },
  });
  
  const { createWorkflow, isCreating } = useCreateAutoGenWorkflow();
  
  const updateWorkflow = (updates: Partial<typeof workflow>) => {
    setWorkflow(prev => ({
      ...prev,
      ...updates,
    }));
  };
  
  const addAgent = (agent: any) => {
    setWorkflow(prev => ({
      ...prev,
      agents: [...prev.agents, agent],
    }));
  };
  
  const updateAgent = (agentId: string, updates: Partial<any>) => {
    setWorkflow(prev => ({
      ...prev,
      agents: prev.agents.map(agent => 
        agent.id === agentId ? { ...agent, ...updates } : agent
      ),
    }));
  };
  
  const removeAgent = (agentId: string) => {
    setWorkflow(prev => ({
      ...prev,
      agents: prev.agents.filter(agent => agent.id !== agentId),
      tasks: prev.tasks.filter(task => task.agentId !== agentId),
    }));
  };
  
  const addTask = (task: any) => {
    setWorkflow(prev => ({
      ...prev,
      tasks: [...prev.tasks, task],
    }));
  };
  
  const updateTask = (taskId: string, updates: Partial<any>) => {
    setWorkflow(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      ),
    }));
  };
  
  const removeTask = (taskId: string) => {
    setWorkflow(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task.id !== taskId),
      // Update dependsOn arrays to remove references to this task
      tasks: prev.tasks.map(task => ({
        ...task,
        dependsOn: task.dependsOn?.filter(id => id !== taskId) || [],
      })),
    }));
  };
  
  const saveWorkflow = async () => {
    try {
      return await createWorkflow(workflow);
    } catch (error) {
      console.error('Error saving workflow:', error);
      throw error;
    }
  };
  
  return {
    workflow,
    updateWorkflow,
    addAgent,
    updateAgent,
    removeAgent,
    addTask,
    updateTask,
    removeTask,
    saveWorkflow,
    isSaving: isCreating,
  };
};

/**
 * Hook for managing AutoGen workflow execution
 */
export const useAutoGenWorkflowExecution = (workflowId: string) => {
  const { executeWorkflow, isExecuting, result, error, reset } = useExecuteAutoGenWorkflow();
  const [messages, setMessages] = useState<any[]>([]);
  const [status, setStatus] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');
  
  // Reset messages when workflowId changes
  useEffect(() => {
    setMessages([]);
    setStatus('idle');
    reset();
  }, [workflowId, reset]);
  
  // Update messages when result changes
  useEffect(() => {
    if (result) {
      setMessages(result.result.messages || []);
      setStatus('completed');
    }
  }, [result]);
  
  // Update status when error occurs
  useEffect(() => {
    if (error) {
      setStatus('failed');
    }
  }, [error]);
  
  const execute = async (input: string, options?: any) => {
    setStatus('running');
    setMessages([]);
    try {
      const result = await executeWorkflow(workflowId, input, options);
      return result;
    } catch (error) {
      console.error('Error executing workflow:', error);
      throw error;
    }
  };
  
  return {
    execute,
    isExecuting,
    messages,
    status,
    result,
    error,
    reset: () => {
      reset();
      setMessages([]);
      setStatus('idle');
    },
  };
};
