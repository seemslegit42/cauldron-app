/**
 * Human Input Node for LangGraph
 * 
 * This file provides a human input node implementation for LangGraph.
 * It allows for human-in-the-loop validation and input within a graph execution.
 */

import { LoggingService } from '@src/shared/services/logging';
import { LangGraphNodeType, LangGraphExecutionStatus } from '../../types/langgraph';
import { prisma } from 'wasp/server';

// Interface for human input node configuration
export interface HumanInputNodeConfig {
  prompt: string | ((state: any) => string);
  options?: string[] | ((state: any) => string[]);
  timeoutSeconds?: number;
  defaultValue?: any;
  outputKey?: string;
  metadata?: any;
}

/**
 * Create a human input node for LangGraph
 * 
 * @param id The node ID
 * @param config The node configuration
 * @returns A graph node definition
 */
export function createHumanInputNode(
  id: string,
  config: HumanInputNodeConfig
) {
  return {
    id,
    type: LangGraphNodeType.HUMAN_INPUT,
    config,
    execute: async (state: any) => {
      try {
        const { 
          prompt, 
          options, 
          timeoutSeconds = 300, // 5 minutes default
          defaultValue,
          outputKey = 'humanInput',
          metadata = {}
        } = config;
        
        // Get the user ID from the state
        const userId = state.userId || state.user?.id;
        
        if (!userId) {
          throw new Error('User ID not found in state');
        }
        
        // Generate the prompt
        const promptText = typeof prompt === 'function'
          ? prompt(state)
          : prompt;
        
        // Generate the options
        const promptOptions = typeof options === 'function'
          ? options(state)
          : options;
        
        // Create a human approval record
        const approval = await prisma.humanApproval.create({
          data: {
            userId,
            prompt: promptText,
            options: promptOptions ? JSON.stringify(promptOptions) : null,
            state: state,
            status: 'PENDING',
            expiresAt: new Date(Date.now() + timeoutSeconds * 1000),
            metadata: {
              ...metadata,
              graphId: state.graphId,
              graphStateId: state.graphStateId,
              nodeId: id,
            }
          }
        });
        
        // Log the human input request
        LoggingService.info({
          message: 'Human input requested',
          module: 'forgeflow',
          category: 'LANGGRAPH_HUMAN_INPUT',
          metadata: {
            approvalId: approval.id,
            userId,
            nodeId: id,
            prompt: promptText,
            options: promptOptions,
            expiresAt: approval.expiresAt
          }
        });
        
        // Wait for the human input
        const startTime = Date.now();
        let result;
        
        while (Date.now() - startTime < timeoutSeconds * 1000) {
          // Check if the approval has been processed
          const updatedApproval = await prisma.humanApproval.findUnique({
            where: { id: approval.id }
          });
          
          if (!updatedApproval) {
            throw new Error(`Approval not found: ${approval.id}`);
          }
          
          if (updatedApproval.status !== 'PENDING') {
            // Approval has been processed
            result = updatedApproval.response;
            break;
          }
          
          // Wait for a bit before checking again
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // If no result, use default value or throw error
        if (!result) {
          if (defaultValue !== undefined) {
            // Use default value
            result = defaultValue;
            
            // Update the approval
            await prisma.humanApproval.update({
              where: { id: approval.id },
              data: {
                status: 'TIMEOUT',
                response: defaultValue,
                processedAt: new Date()
              }
            });
            
            LoggingService.warn({
              message: 'Human input timed out, using default value',
              module: 'forgeflow',
              category: 'LANGGRAPH_HUMAN_INPUT',
              metadata: {
                approvalId: approval.id,
                userId,
                nodeId: id,
                defaultValue
              }
            });
          } else {
            // Update the approval
            await prisma.humanApproval.update({
              where: { id: approval.id },
              data: {
                status: 'TIMEOUT',
                processedAt: new Date()
              }
            });
            
            throw new Error(`Human input timed out after ${timeoutSeconds} seconds`);
          }
        }
        
        // Update the state
        return {
          ...state,
          [outputKey]: result,
          humanApprovalId: approval.id
        };
      } catch (error) {
        LoggingService.error({
          message: 'Error executing human input node',
          module: 'forgeflow',
          category: 'LANGGRAPH_HUMAN_INPUT',
          error,
          metadata: {
            nodeId: id
          }
        });
        
        throw error;
      }
    }
  };
}
