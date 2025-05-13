/**
 * Obelisk Module - Agent Hooks
 * 
 * This file contains Sentient Loop™ hooks for AI interactions in the Obelisk module.
 * These hooks provide a standardized way to integrate AI capabilities into the data processing pipeline.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAction, useQuery } from 'wasp/client/operations';
import { useUser } from 'wasp/client/auth';
import { 
  processDataSource, 
  analyzeDataSchema, 
  generateDataTransformation,
  executeDataPipeline
} from './api/operations';
import { useSentientLoop } from '@src/shared/hooks/ai/useSentientLoop';
import type { DataSource, DataSchema, DataTransformation, DataPipeline } from './types';

/**
 * Hook for using the data assistant
 */
export function useDataAssistant() {
  const { processQuery, isProcessing, lastResponse, error } = useSentientLoop({
    module: 'obelisk',
    agentName: 'DataArchitect',
    enableHumanConfirmation: true,
  });

  const processDataSourceAction = useAction(processDataSource);
  const analyzeDataSchemaAction = useAction(analyzeDataSchema);
  const generateDataTransformationAction = useAction(generateDataTransformation);
  const executeDataPipelineAction = useAction(executeDataPipeline);
  
  // Function to analyze a data source
  const analyzeDataSource = useCallback(async (dataSourceId: string) => {
    return processQuery(`Analyze the data source ${dataSourceId}`, {
      dataSourceId,
      context: 'data-source-analysis',
    });
  }, [processQuery]);
  
  // Function to suggest schema improvements
  const suggestSchemaImprovements = useCallback(async (dataSchemaId: string) => {
    return processQuery(`Suggest improvements for this data schema`, {
      dataSchemaId,
      context: 'schema-improvement',
    });
  }, [processQuery]);
  
  // Function to generate data transformations
  const generateTransformations = useCallback(async (dataSourceId: string, targetSchemaId: string) => {
    try {
      // First generate the transformation
      const transformationResult = await generateDataTransformationAction({
        dataSourceId,
        targetSchemaId,
      });
      
      // Then enhance it with AI
      return processQuery(`Optimize this data transformation for efficiency`, {
        transformation: transformationResult,
        dataSourceId,
        targetSchemaId,
        context: 'transformation-optimization',
      });
    } catch (err) {
      console.error('Error generating data transformation:', err);
      throw err;
    }
  }, [processQuery, generateDataTransformationAction]);
  
  // Function to execute and monitor a data pipeline
  const monitorPipelineExecution = useCallback(async (pipelineId: string) => {
    try {
      // First execute the pipeline
      const executionResult = await executeDataPipelineAction({
        pipelineId,
      });
      
      // Then analyze the results with AI
      return processQuery(`Analyze the pipeline execution results and suggest optimizations`, {
        executionResult,
        pipelineId,
        context: 'pipeline-execution-analysis',
      });
    } catch (err) {
      console.error('Error executing data pipeline:', err);
      throw err;
    }
  }, [processQuery, executeDataPipelineAction]);
  
  return {
    analyzeDataSource,
    suggestSchemaImprovements,
    generateTransformations,
    monitorPipelineExecution,
    isProcessing,
    lastResponse,
    error,
  };
}
