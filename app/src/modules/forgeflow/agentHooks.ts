/**
 * Hooks for agent-based workflows in the Forgeflow module
 */

import { useState, useEffect } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import { 
  getAgentTemplates, 
  getWorkflowTemplates, 
  createWorkflow, 
  executeAgentWorkflow,
  saveWorkflowDesign,
  getWorkflowDesign,
  getVisualWorkflows
} from './operations';

/**
 * Hook for managing workflow templates
 */
export const useWorkflowTemplates = () => {
  const { data: templates, isLoading, error } = useQuery(getWorkflowTemplates);
  
  return {
    templates,
    isLoading,
    error
  };
};

/**
 * Hook for managing agent templates
 */
export const useAgentTemplates = () => {
  const { data: templates, isLoading, error } = useQuery(getAgentTemplates);
  
  return {
    templates,
    isLoading,
    error
  };
};

/**
 * Hook for managing visual workflows
 */
export const useVisualWorkflows = () => {
  const { data: workflows, isLoading, error } = useQuery(getVisualWorkflows);
  
  return {
    workflows,
    isLoading,
    error
  };
};

/**
 * Hook for managing a workflow design
 */
export const useWorkflowDesign = (workflowId: string) => {
  const { data: design, isLoading, error } = useQuery(getWorkflowDesign, { workflowId });
  const saveDesignAction = useAction(saveWorkflowDesign);
  const executeWorkflowAction = useAction(executeAgentWorkflow);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  
  const saveDesign = async (name: string, description: string, nodes: any[], edges: any[]) => {
    setIsSaving(true);
    try {
      const result = await saveDesignAction({
        name,
        description,
        nodes,
        edges
      });
      return result;
    } catch (error) {
      console.error('Error saving workflow design:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };
  
  const executeWorkflow = async () => {
    if (!design) return;
    
    setIsExecuting(true);
    try {
      const result = await executeWorkflowAction({
        workflowId: design.id
      });
      return result;
    } catch (error) {
      console.error('Error executing workflow:', error);
      throw error;
    } finally {
      setIsExecuting(false);
    }
  };
  
  return {
    design,
    isLoading,
    error,
    saveDesign,
    isSaving,
    executeWorkflow,
    isExecuting
  };
};

/**
 * Hook for creating a new workflow
 */
export const useCreateWorkflow = () => {
  const createWorkflowAction = useAction(createWorkflow);
  const [isCreating, setIsCreating] = useState(false);
  
  const createNewWorkflow = async (templateId: string, name: string, description: string) => {
    setIsCreating(true);
    try {
      const result = await createWorkflowAction({
        templateId,
        name,
        description
      });
      return result;
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };
  
  return {
    createWorkflow: createNewWorkflow,
    isCreating
  };
};
