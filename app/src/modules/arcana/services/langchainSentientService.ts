/**
 * LangChain Sentient Service for Arcana Module
 * 
 * This service provides integration between LangChain and the Sentient Loop system.
 */

import { LoggingService } from '@src/shared/services/logging';
import { 
  createDefaultChatModel,
  createBufferMemory,
  createAgent,
  createSimpleChain,
  CauldronMemory
} from '@src/ai-services/langchain';
import { BaseChatModel } from 'langchain/chat_models/base';
import { BufferMemory } from 'langchain/memory';
import { AgentExecutor } from 'langchain/agents';
import { LLMChain } from 'langchain/chains';

/**
 * Interface for Sentient Loop checkpoint
 */
export interface SentientCheckpoint {
  id: string;
  type: 'validation' | 'decision' | 'information';
  description: string;
  data: Record<string, any>;
  humanDecision?: boolean;
  humanFeedback?: string;
  timestamp: Date;
}

/**
 * Creates a LangChain agent with Sentient Loop integration
 */
export async function createSentientAgent(
  systemMessage: string,
  userId: string,
  sessionId: string,
  moduleId: string = 'arcana',
  model?: BaseChatModel
): Promise<{
  agent: AgentExecutor;
  checkpoints: SentientCheckpoint[];
  addCheckpoint: (checkpoint: Omit<SentientCheckpoint, 'id' | 'timestamp'>) => void;
}> {
  try {
    // Create the model if not provided
    const llm = model || createDefaultChatModel();
    
    // Create memory with session tracking
    const memory = new CauldronMemory({
      sessionId,
      userId,
      moduleId,
      returnMessages: true,
    });
    
    // Create the agent
    const agent = await createAgent(
      undefined, // Use default tools
      llm,
      memory as unknown as BufferMemory, // Type cast for compatibility
      systemMessage
    );
    
    // Initialize checkpoints array
    const checkpoints: SentientCheckpoint[] = [];
    
    // Function to add a checkpoint
    const addCheckpoint = (checkpoint: Omit<SentientCheckpoint, 'id' | 'timestamp'>) => {
      const newCheckpoint: SentientCheckpoint = {
        ...checkpoint,
        id: `cp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        timestamp: new Date(),
      };
      
      checkpoints.push(newCheckpoint);
      
      LoggingService.info({
        message: 'Added Sentient Loop checkpoint',
        module: 'arcana',
        category: 'SENTIENT_LOOP',
        metadata: {
          checkpointId: newCheckpoint.id,
          checkpointType: newCheckpoint.type,
          userId,
          sessionId,
          moduleId,
        },
      });
      
      return newCheckpoint;
    };
    
    LoggingService.info({
      message: 'Created Sentient Agent with LangChain',
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      metadata: {
        userId,
        sessionId,
        moduleId,
        modelName: (llm as any).modelName,
      },
    });
    
    return {
      agent,
      checkpoints,
      addCheckpoint,
    };
  } catch (error) {
    LoggingService.error({
      message: 'Error creating Sentient Agent with LangChain',
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      error,
      metadata: {
        userId,
        sessionId,
        moduleId,
      },
    });
    
    throw error;
  }
}

/**
 * Creates a LangChain chain with Sentient Loop validation
 */
export function createSentientChain(
  promptTemplate: string,
  inputVariables: string[],
  validationCriteria: Array<{
    name: string;
    description: string;
    validationFn: (output: string) => boolean;
  }>,
  userId: string,
  sessionId: string,
  moduleId: string = 'arcana',
  model?: BaseChatModel
): {
  chain: LLMChain;
  executeWithValidation: (input: Record<string, any>) => Promise<{
    output: Record<string, any>;
    validationResults: Array<{
      name: string;
      passed: boolean;
    }>;
    requiresHumanReview: boolean;
  }>;
} {
  try {
    // Create the model if not provided
    const llm = model || createDefaultChatModel();
    
    // Create memory with session tracking
    const memory = new CauldronMemory({
      sessionId,
      userId,
      moduleId,
      returnMessages: true,
    });
    
    // Create the chain
    const chain = createSimpleChain(
      promptTemplate,
      inputVariables,
      llm,
      memory as unknown as BufferMemory // Type cast for compatibility
    );
    
    // Function to execute the chain with validation
    const executeWithValidation = async (input: Record<string, any>) => {
      // Execute the chain
      const output = await chain.invoke(input);
      
      // Validate the output
      const validationResults = validationCriteria.map(criterion => ({
        name: criterion.name,
        passed: criterion.validationFn(output.text),
      }));
      
      // Check if human review is required
      const requiresHumanReview = validationResults.some(result => !result.passed);
      
      LoggingService.info({
        message: 'Executed Sentient Chain with validation',
        module: 'arcana',
        category: 'SENTIENT_LOOP',
        metadata: {
          userId,
          sessionId,
          moduleId,
          inputKeys: Object.keys(input),
          validationResults,
          requiresHumanReview,
        },
      });
      
      return {
        output,
        validationResults,
        requiresHumanReview,
      };
    };
    
    LoggingService.info({
      message: 'Created Sentient Chain with LangChain',
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      metadata: {
        userId,
        sessionId,
        moduleId,
        inputVariables,
        validationCriteriaCount: validationCriteria.length,
        modelName: (llm as any).modelName,
      },
    });
    
    return {
      chain,
      executeWithValidation,
    };
  } catch (error) {
    LoggingService.error({
      message: 'Error creating Sentient Chain with LangChain',
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      error,
      metadata: {
        userId,
        sessionId,
        moduleId,
        inputVariables,
      },
    });
    
    throw error;
  }
}

/**
 * Executes a Sentient Loop workflow with human-in-the-loop validation
 */
export async function executeSentientWorkflow(
  input: Record<string, any>,
  steps: Array<{
    name: string;
    description: string;
    promptTemplate: string;
    inputVariables: string[];
    outputVariable: string;
    requiresHumanValidation: boolean;
  }>,
  userId: string,
  sessionId: string,
  moduleId: string = 'arcana',
  model?: BaseChatModel
): Promise<{
  output: Record<string, any>;
  checkpoints: SentientCheckpoint[];
  requiresHumanReview: boolean;
}> {
  try {
    // Create the model if not provided
    const llm = model || createDefaultChatModel();
    
    // Initialize state and checkpoints
    let state = { ...input };
    const checkpoints: SentientCheckpoint[] = [];
    let requiresHumanReview = false;
    
    // Execute each step
    for (const step of steps) {
      // Create memory with session tracking
      const memory = new CauldronMemory({
        sessionId: `${sessionId}-${step.name}`,
        userId,
        moduleId,
        returnMessages: true,
      });
      
      // Create the chain
      const chain = createSimpleChain(
        step.promptTemplate,
        step.inputVariables,
        llm,
        memory as unknown as BufferMemory // Type cast for compatibility
      );
      
      // Execute the chain
      const stepInput = {};
      for (const variable of step.inputVariables) {
        if (variable in state) {
          stepInput[variable] = state[variable];
        }
      }
      
      const stepOutput = await chain.invoke(stepInput);
      
      // Update state
      state[step.outputVariable] = stepOutput.text;
      
      // Add checkpoint
      const checkpoint: SentientCheckpoint = {
        id: `cp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        type: step.requiresHumanValidation ? 'validation' : 'information',
        description: step.description,
        data: {
          input: stepInput,
          output: stepOutput,
          step: step.name,
        },
        timestamp: new Date(),
      };
      
      checkpoints.push(checkpoint);
      
      // Check if human validation is required
      if (step.requiresHumanValidation) {
        requiresHumanReview = true;
        
        LoggingService.info({
          message: 'Sentient workflow step requires human validation',
          module: 'arcana',
          category: 'SENTIENT_LOOP',
          metadata: {
            userId,
            sessionId,
            moduleId,
            stepName: step.name,
            checkpointId: checkpoint.id,
          },
        });
      }
    }
    
    LoggingService.info({
      message: 'Executed Sentient workflow',
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      metadata: {
        userId,
        sessionId,
        moduleId,
        stepCount: steps.length,
        checkpointCount: checkpoints.length,
        requiresHumanReview,
        outputKeys: Object.keys(state),
      },
    });
    
    return {
      output: state,
      checkpoints,
      requiresHumanReview,
    };
  } catch (error) {
    LoggingService.error({
      message: 'Error executing Sentient workflow',
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      error,
      metadata: {
        userId,
        sessionId,
        moduleId,
        inputKeys: Object.keys(input),
        stepCount: steps.length,
      },
    });
    
    throw error;
  }
}