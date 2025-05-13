/**
 * Crew AI Utilities
 * 
 * This file provides utilities for creating and executing agent crews.
 * It implements a simple LangGraph-inspired orchestration system.
 */

import { z } from 'zod';
import { LoggingService } from '@src/shared/services/logging';
import { groqInference } from '@src/ai-services/groq';

// Schema for agent configuration
export const agentConfigSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.string().min(1, 'Role is required'),
  goal: z.string().min(1, 'Goal is required'),
  backstory: z.string().optional(),
  verbose: z.boolean().default(true),
  allowDelegation: z.boolean().default(false),
  memory: z.boolean().default(true),
  maxIterations: z.number().optional(),
  maxExecutionTime: z.number().optional(),
  tools: z.array(z.string()).optional(),
});

// Schema for task configuration
export const taskConfigSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  agent: z.string().min(1, 'Agent is required'),
  expectedOutput: z.string().optional(),
  dependsOn: z.array(z.string()).optional(),
});

// Schema for crew configuration
export const crewConfigSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  agents: z.array(agentConfigSchema),
  tasks: z.array(taskConfigSchema),
  process: z.array(z.string()).optional(),
});

// Types for the crew system
export interface Agent {
  name: string;
  role: string;
  goal: string;
  backstory?: string;
  verbose: boolean;
  allowDelegation: boolean;
  memory: boolean;
  maxIterations?: number;
  maxExecutionTime?: number;
  tools?: string[];
}

export interface Task {
  name: string;
  description: string;
  agent: string;
  expectedOutput?: string;
  dependsOn?: string[];
}

export interface Crew {
  name: string;
  description: string;
  agents: Agent[];
  tasks: Task[];
  process?: string[];
}

export interface CrewExecutionState {
  [key: string]: any;
}

/**
 * Creates a crew from a configuration
 */
export function createCrew(config: any): Crew {
  // Validate the configuration
  const validatedConfig = crewConfigSchema.parse(config);
  
  return {
    name: validatedConfig.name,
    description: validatedConfig.description,
    agents: validatedConfig.agents,
    tasks: validatedConfig.tasks,
    process: validatedConfig.process,
  };
}

/**
 * Executes a crew
 */
export async function executeCrew(crew: Crew, initialState: CrewExecutionState = {}): Promise<CrewExecutionState> {
  // Initialize the state
  let state: CrewExecutionState = { ...initialState };
  
  // Log the crew execution start
  LoggingService.info({
    message: `Starting crew execution: ${crew.name}`,
    module: 'forgeflow',
    category: 'CREW_EXECUTION',
    metadata: {
      crewName: crew.name,
      agentCount: crew.agents.length,
      taskCount: crew.tasks.length,
    },
  });
  
  // Execute each task in order
  for (const task of crew.tasks) {
    // Check if dependencies are satisfied
    if (task.dependsOn && task.dependsOn.length > 0) {
      for (const dependency of task.dependsOn) {
        if (!state[dependency]) {
          throw new Error(`Dependency ${dependency} not satisfied for task ${task.name}`);
        }
      }
    }
    
    // Find the agent for this task
    const agent = crew.agents.find(a => a.name === task.agent);
    if (!agent) {
      throw new Error(`Agent ${task.agent} not found for task ${task.name}`);
    }
    
    // Log the task execution start
    LoggingService.info({
      message: `Executing task: ${task.name}`,
      module: 'forgeflow',
      category: 'TASK_EXECUTION',
      metadata: {
        taskName: task.name,
        agentName: agent.name,
        state: Object.keys(state),
      },
    });
    
    // Execute the task
    try {
      const result = await executeTask(task, agent, state);
      
      // Update the state with the result
      state[task.name] = result;
      
      // Log the task execution completion
      LoggingService.info({
        message: `Task completed: ${task.name}`,
        module: 'forgeflow',
        category: 'TASK_EXECUTION',
        metadata: {
          taskName: task.name,
          agentName: agent.name,
          success: true,
        },
      });
    } catch (error) {
      // Log the task execution failure
      LoggingService.error({
        message: `Task failed: ${task.name}`,
        module: 'forgeflow',
        category: 'TASK_EXECUTION',
        error,
        metadata: {
          taskName: task.name,
          agentName: agent.name,
        },
      });
      
      throw error;
    }
  }
  
  // Log the crew execution completion
  LoggingService.info({
    message: `Crew execution completed: ${crew.name}`,
    module: 'forgeflow',
    category: 'CREW_EXECUTION',
    metadata: {
      crewName: crew.name,
      success: true,
      stateKeys: Object.keys(state),
    },
  });
  
  return state;
}

/**
 * Executes a task using the specified agent
 */
async function executeTask(task: Task, agent: Agent, state: CrewExecutionState): Promise<any> {
  // Create the prompt for the agent
  const prompt = createAgentPrompt(agent, task, state);
  
  // Execute the agent
  const result = await executeAgent(agent, prompt);
  
  return result;
}

/**
 * Creates a prompt for an agent
 */
function createAgentPrompt(agent: Agent, task: Task, state: CrewExecutionState): string {
  // Create a basic prompt
  let prompt = `You are ${agent.name}, ${agent.role}. Your goal is: ${agent.goal}.`;
  
  // Add backstory if available
  if (agent.backstory) {
    prompt += `\n\nBackstory: ${agent.backstory}`;
  }
  
  // Add task description
  prompt += `\n\nTask: ${task.description}`;
  
  // Add state information
  if (Object.keys(state).length > 0) {
    prompt += `\n\nContext:`;
    for (const [key, value] of Object.entries(state)) {
      prompt += `\n- ${key}: ${JSON.stringify(value)}`;
    }
  }
  
  // Add expected output if available
  if (task.expectedOutput) {
    prompt += `\n\nExpected output: ${task.expectedOutput}`;
  }
  
  return prompt;
}

/**
 * Executes an agent with a prompt
 */
async function executeAgent(agent: Agent, prompt: string): Promise<any> {
  try {
    // Use Groq for inference
    const response = await groqInference({
      prompt,
      model: 'llama3-8b-8192',
      temperature: 0.7,
      stream: false,
    }, {});
    
    return response;
  } catch (error) {
    console.error('Error executing agent:', error);
    throw error;
  }
}
