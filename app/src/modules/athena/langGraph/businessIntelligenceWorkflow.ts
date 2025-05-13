/**
 * Business Intelligence Workflow
 *
 * This file implements a LangGraph workflow for business intelligence in the Athena module.
 * It defines a graph for analyzing business metrics, generating insights, and creating executive summaries.
 */

import {
  createGraph,
  addNode,
  addEdge,
  executeGraph
} from '@src/modules/forgeflow/langGraph/enhancedLangGraph';
import { createLLMNode } from '@src/modules/forgeflow/langGraph/nodes/llmNode';
import { createMemoryNode, MemoryNodeOperation } from '@src/modules/forgeflow/langGraph/nodes/memoryNode';
import { createToolNode } from '@src/modules/forgeflow/langGraph/nodes/toolNode';
import { MemoryEntryType, MemoryContentType } from '@src/modules/memory/types';
import { LoggingService } from '@src/shared/services/logging';
import { 
  GraphDefinition, 
  GraphExecutionOptions, 
  GraphExecutionResult 
} from '@src/modules/forgeflow/types/langgraph';
import {
  BusinessMetric,
  BusinessInsight,
  StrategicRecommendation,
  ExecutiveSummary,
  TimeframeOption
} from '../types';

// Define the state interface for the business intelligence workflow
export interface BusinessIntelligenceWorkflowState {
  userId: string;
  timeframe: TimeframeOption;
  metrics?: BusinessMetric[];
  historicalMetrics?: BusinessMetric[];
  relevantMemories?: any[];
  metricAnalysis?: string;
  insights?: BusinessInsight[];
  recommendations?: StrategicRecommendation[];
  executiveSummary?: ExecutiveSummary;
  error?: string;
}

/**
 * Creates a business intelligence workflow graph
 * 
 * @param initialState The initial state
 * @returns A graph definition
 */
export function createBusinessIntelligenceWorkflow(
  initialState: BusinessIntelligenceWorkflowState
): GraphDefinition {
  // Create the graph
  let graph = createGraph(
    initialState,
    'Business Intelligence Workflow',
    {
      description: 'A workflow for analyzing business metrics, generating insights, and creating executive summaries',
      module: 'athena'
    }
  );
  
  // Add nodes
  
  // 1. Retrieve historical metrics from memory
  graph = addNode(graph, createMemoryNode('retrieve-historical-metrics', {
    operation: MemoryNodeOperation.RETRIEVE,
    memoryType: MemoryEntryType.LONG_TERM,
    contentType: MemoryContentType.BUSINESS_METRIC,
    context: 'historical-metrics',
    outputKey: 'historicalMetrics',
    queryOptions: {
      limit: 50,
      includeExpired: true
    }
  }));
  
  // 2. Retrieve relevant business decisions and insights from memory
  graph = addNode(graph, createMemoryNode('retrieve-business-memories', {
    operation: MemoryNodeOperation.SEARCH,
    inputKey: 'searchQuery',
    outputKey: 'relevantMemories',
    queryOptions: {
      limit: 10,
      minImportance: 0.5
    }
  }));
  
  // 3. Analyze metrics with historical context
  graph = addNode(graph, createLLMNode('analyze-metrics', {
    model: 'llama3-70b-8192',
    temperature: 0.2,
    promptTemplate: (state: BusinessIntelligenceWorkflowState) => `
      You are a business intelligence analyst tasked with analyzing business metrics.
      
      Current Timeframe: ${state.timeframe}
      
      Current Metrics:
      ${state.metrics ? JSON.stringify(state.metrics, null, 2) : 'No metrics available'}
      
      Historical Metrics:
      ${state.historicalMetrics && state.historicalMetrics.length > 0 
        ? JSON.stringify(state.historicalMetrics, null, 2) 
        : 'No historical metrics available'}
      
      Relevant Business Context:
      ${state.relevantMemories && state.relevantMemories.length > 0
        ? state.relevantMemories.map((memory: any) => 
            `- ${memory.context}: ${JSON.stringify(memory.content)}`
          ).join('\n')
        : 'No relevant business context available'}
      
      Analyze the metrics and provide a detailed analysis including:
      1. Key trends and patterns
      2. Significant changes from historical data
      3. Correlations between different metrics
      4. Potential areas of concern
      5. Positive developments
      
      Provide your analysis in a clear, structured format.
    `,
    outputKey: 'metricAnalysis'
  }));
  
  // 4. Generate insights based on analysis
  graph = addNode(graph, createLLMNode('generate-insights', {
    model: 'llama3-70b-8192',
    temperature: 0.3,
    promptTemplate: (state: BusinessIntelligenceWorkflowState) => `
      You are a business intelligence analyst tasked with generating insights from metric analysis.
      
      Metric Analysis:
      ${state.metricAnalysis || 'No analysis available'}
      
      Generate 3-5 key business insights based on this analysis. Each insight should include:
      - A clear title
      - A detailed description
      - The category it belongs to
      - Impact level (HIGH, MEDIUM, LOW)
      - Confidence level (HIGH, MEDIUM, LOW)
      - Related metrics
      
      Format your response as a JSON array of insight objects with the following structure:
      [
        {
          "title": "string",
          "description": "string",
          "category": "string",
          "impact": "HIGH|MEDIUM|LOW",
          "confidence": "HIGH|MEDIUM|LOW",
          "relatedMetrics": ["string"]
        }
      ]
    `,
    outputKey: 'insightsJson'
  }));
  
  // 5. Generate strategic recommendations
  graph = addNode(graph, createLLMNode('generate-recommendations', {
    model: 'llama3-70b-8192',
    temperature: 0.4,
    promptTemplate: (state: BusinessIntelligenceWorkflowState) => `
      You are a strategic business advisor tasked with generating recommendations based on business insights.
      
      Metric Analysis:
      ${state.metricAnalysis || 'No analysis available'}
      
      Business Insights:
      ${state.insightsJson || 'No insights available'}
      
      Generate 3-5 strategic recommendations based on these insights. Each recommendation should include:
      - A clear title
      - A detailed description
      - The category it belongs to
      - Impact level (HIGH, MEDIUM, LOW)
      - Timeframe (IMMEDIATE, SHORT_TERM, MEDIUM_TERM, LONG_TERM)
      - Specific action items
      - Expected outcome
      - Supporting data points
      
      Format your response as a JSON array of recommendation objects with the following structure:
      [
        {
          "title": "string",
          "description": "string",
          "category": "string",
          "impact": "HIGH|MEDIUM|LOW",
          "timeframe": "IMMEDIATE|SHORT_TERM|MEDIUM_TERM|LONG_TERM",
          "actionItems": ["string"],
          "expectedOutcome": "string",
          "supportingData": ["string"]
        }
      ]
    `,
    outputKey: 'recommendationsJson'
  }));
  
  // 6. Generate executive summary
  graph = addNode(graph, createLLMNode('generate-executive-summary', {
    model: 'llama3-70b-8192',
    temperature: 0.3,
    promptTemplate: (state: BusinessIntelligenceWorkflowState) => `
      You are an executive business advisor tasked with creating a concise executive summary.
      
      Metric Analysis:
      ${state.metricAnalysis || 'No analysis available'}
      
      Business Insights:
      ${state.insightsJson || 'No insights available'}
      
      Strategic Recommendations:
      ${state.recommendationsJson || 'No recommendations available'}
      
      Create a comprehensive executive summary that includes:
      - A clear title
      - A concise summary paragraph
      - 3-5 key metrics with values and trends
      - 3-5 key insights
      - 3-5 top recommendations
      - 2-3 risk factors
      - 2-3 opportunities
      
      Format your response as a JSON object with the following structure:
      {
        "title": "string",
        "summary": "string",
        "keyMetrics": [
          {
            "name": "string",
            "value": "string",
            "trend": number
          }
        ],
        "keyInsights": ["string"],
        "topRecommendations": ["string"],
        "riskFactors": ["string"],
        "opportunities": ["string"]
      }
    `,
    outputKey: 'executiveSummaryJson'
  }));
  
  // 7. Store insights in memory
  graph = addNode(graph, createMemoryNode('store-insights', {
    operation: MemoryNodeOperation.STORE,
    memoryType: MemoryEntryType.LONG_TERM,
    contentType: MemoryContentType.BUSINESS_INSIGHT,
    context: 'business-insights',
    importance: 2.0,
    inputKey: 'insightsJson',
    outputKey: 'storedInsightsId',
    expiresInHours: 8760 // 1 year
  }));
  
  // 8. Store recommendations in memory
  graph = addNode(graph, createMemoryNode('store-recommendations', {
    operation: MemoryNodeOperation.STORE,
    memoryType: MemoryEntryType.LONG_TERM,
    contentType: MemoryContentType.BUSINESS_RECOMMENDATION,
    context: 'strategic-recommendations',
    importance: 2.0,
    inputKey: 'recommendationsJson',
    outputKey: 'storedRecommendationsId',
    expiresInHours: 8760 // 1 year
  }));
  
  // 9. Store executive summary in memory
  graph = addNode(graph, createMemoryNode('store-executive-summary', {
    operation: MemoryNodeOperation.STORE,
    memoryType: MemoryEntryType.LONG_TERM,
    contentType: MemoryContentType.EXECUTIVE_SUMMARY,
    context: 'executive-summaries',
    importance: 3.0,
    inputKey: 'executiveSummaryJson',
    outputKey: 'storedExecutiveSummaryId',
    expiresInHours: 8760 // 1 year
  }));
  
  // Add edges
  
  // Connect the nodes
  graph = addEdge(graph, { source: 'retrieve-historical-metrics', target: 'retrieve-business-memories' });
  graph = addEdge(graph, { source: 'retrieve-business-memories', target: 'analyze-metrics' });
  graph = addEdge(graph, { source: 'analyze-metrics', target: 'generate-insights' });
  graph = addEdge(graph, { source: 'generate-insights', target: 'generate-recommendations' });
  graph = addEdge(graph, { source: 'generate-recommendations', target: 'generate-executive-summary' });
  graph = addEdge(graph, { source: 'generate-executive-summary', target: 'store-insights' });
  graph = addEdge(graph, { source: 'store-insights', target: 'store-recommendations' });
  graph = addEdge(graph, { source: 'store-recommendations', target: 'store-executive-summary' });
  
  return graph;
}

/**
 * Executes the business intelligence workflow
 * 
 * @param initialState The initial state
 * @param options Execution options
 * @returns The execution result
 */
export async function executeBusinessIntelligenceWorkflow(
  initialState: BusinessIntelligenceWorkflowState,
  options: GraphExecutionOptions = {}
): Promise<GraphExecutionResult> {
  try {
    // Create the workflow
    const workflow = createBusinessIntelligenceWorkflow(initialState);
    
    // Execute the workflow
    const result = await executeGraph(workflow, {
      userId: initialState.userId,
      expiresInDays: 30,
      ...options
    });
    
    // Parse the JSON outputs
    if (result.finalState) {
      try {
        if (result.finalState.insightsJson) {
          result.finalState.insights = JSON.parse(result.finalState.insightsJson);
        }
        
        if (result.finalState.recommendationsJson) {
          result.finalState.recommendations = JSON.parse(result.finalState.recommendationsJson);
        }
        
        if (result.finalState.executiveSummaryJson) {
          result.finalState.executiveSummary = JSON.parse(result.finalState.executiveSummaryJson);
        }
      } catch (error) {
        LoggingService.error({
          message: 'Error parsing JSON outputs',
          module: 'athena',
          category: 'BUSINESS_INTELLIGENCE_WORKFLOW',
          error
        });
      }
    }
    
    return result;
  } catch (error) {
    LoggingService.error({
      message: 'Error executing business intelligence workflow',
      module: 'athena',
      category: 'BUSINESS_INTELLIGENCE_WORKFLOW',
      error
    });
    
    throw error;
  }
}
