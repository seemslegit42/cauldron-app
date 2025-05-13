/**
 * Threat Research and Drafting Workflow
 *
 * This file implements a simple 2-agent graph for threat research and drafting.
 * It defines the minimal state needed (input_threat, project_name, research_result, draft_summary).
 */

import {
  createGraph,
  addNode,
  addEdge,
  executeGraph,
  createLLMNode,
  createToolNode
} from './index';
import { analyzeThreat } from '@src/modules/phantom/services/threatAnalysisService';
import { LoggingService } from '@src/shared/services/logging';
import { PersistenceOptions } from './persistence';

// Define the state interface
export interface ThreatWorkflowState {
  input_threat: string;
  project_name: string;
  research_result?: any;
  draft_summary?: string;
}

/**
 * Creates a threat research and drafting workflow
 */
export function createThreatWorkflow(
  input_threat: string,
  project_name: string,
  userId?: string,
  workflowId?: string,
  executionId?: string
) {
  // Create the initial state
  const initialState: ThreatWorkflowState = {
    input_threat,
    project_name,
  };

  // Create persistence options
  const persistenceOptions: PersistenceOptions = {
    userId,
    workflowId,
    executionId,
    expiresInDays: 30, // Store for 30 days
  };

  // Create the graph
  let graph = createGraph<ThreatWorkflowState>(
    initialState,
    `Threat Analysis: ${project_name}`,
    persistenceOptions
  );

  // Add the research node
  graph = addNode(graph, createToolNode<ThreatWorkflowState>(
    'research',
    async (state) => {
      // Log the research start
      LoggingService.info({
        message: 'Starting threat research',
        module: 'forgeflow',
        category: 'THREAT_RESEARCH',
        metadata: {
          input_threat: state.input_threat,
          project_name: state.project_name,
        },
      });

      // Call the threat analysis service
      const threatType = state.input_threat;
      const indicators = state.input_threat.split(' ').filter(word => word.length > 5);
      const result = await analyzeThreat(threatType, indicators);

      // Log the research completion
      LoggingService.info({
        message: 'Threat research completed',
        module: 'forgeflow',
        category: 'THREAT_RESEARCH',
        metadata: {
          threatType: result.threatType,
          severity: result.severity,
          confidence: result.confidence,
        },
      });

      return result;
    },
    'research_result'
  ));

  // Add the drafting node
  graph = addNode(graph, createLLMNode<ThreatWorkflowState>(
    'drafting',
    (state) => {
      // Create the prompt
      return `
You are a cybersecurity analyst working on the ${state.project_name} project.
You need to create a concise summary of a security threat based on the research results.

Research Results:
${JSON.stringify(state.research_result, null, 2)}

Please write a professional, clear, and actionable summary of this threat.
Include:
1. A brief description of the threat
2. The potential impact
3. Recommended mitigation steps
4. Any relevant references

Format your response as a well-structured report that could be presented to executives.
`;
    },
    'draft_summary'
  ));

  // Add the edge connecting research to drafting
  graph = addEdge(graph, {
    source: 'research',
    target: 'drafting',
  });

  return graph;
}

/**
 * Executes a threat research and drafting workflow
 */
export async function executeThreatWorkflow(
  input_threat: string,
  project_name: string,
  userId?: string,
  workflowId?: string,
  executionId?: string
): Promise<ThreatWorkflowState> {
  // Log the workflow start
  LoggingService.info({
    message: 'Starting threat workflow',
    module: 'forgeflow',
    category: 'THREAT_WORKFLOW',
    metadata: {
      input_threat,
      project_name,
      userId,
      workflowId,
      executionId,
    },
  });

  try {
    // Create and execute the workflow
    const graph = createThreatWorkflow(
      input_threat,
      project_name,
      userId,
      workflowId,
      executionId
    );

    const result = await executeGraph(graph);

    // Log the workflow completion
    LoggingService.info({
      message: 'Threat workflow completed',
      module: 'forgeflow',
      category: 'THREAT_WORKFLOW',
      metadata: {
        project_name,
        graphId: graph.id,
        has_research: !!result.research_result,
        has_draft: !!result.draft_summary,
      },
    });

    return result;
  } catch (error) {
    // Log the workflow failure
    LoggingService.error({
      message: 'Threat workflow failed',
      module: 'forgeflow',
      category: 'THREAT_WORKFLOW',
      error,
      metadata: {
        input_threat,
        project_name,
        userId,
        workflowId,
        executionId,
      },
    });

    throw error;
  }
}
