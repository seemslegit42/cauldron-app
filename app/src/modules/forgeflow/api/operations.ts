import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import { z } from 'zod';
import { ensureArgsSchemaOrThrowHttpError } from '@src/server/validation';
import { createCrew, executeCrew, crewConfigSchema } from '../crew/crewAiUtils';
import { workflowTemplates } from '../crew/workflowTemplates';
import { predefinedAgentRoles } from '../crew/agentRoles';
import {
  initializeSentientLoop,
  processThroughSentientLoop,
  getSentientLoopStatus,
} from '../sentientLoop';
import { registerDataSource, ingestSignal, DataSourceType } from '../signal/signalIngestion';
import { storeMemory, retrieveMemories, storeFeedback, MemoryType } from '../memory/memorySystem';
import { requirePermission } from '@src/api/middleware/rbac';
import { applyFieldAccess, applyFieldAccessToArray } from '@src/api/middleware/fieldAccess';
import { LoggingService } from '@src/shared/services/logging';
import { executeThreatResearchWorkflow } from './langGraphOperations';

// Schema for creating an agent
const createAgentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.string().min(1, 'Type is required'),
  configuration: z.object({
    role: z.string().min(1, 'Role is required'),
    goal: z.string().min(1, 'Goal is required'),
    backstory: z.string().optional(),
    verbose: z.boolean().default(true),
    allowDelegation: z.boolean().default(false),
    memory: z.boolean().default(true),
    maxIterations: z.number().optional(),
    maxExecutionTime: z.number().optional(),
    tools: z.array(z.string()).optional(),
  }),
  isActive: z.boolean().default(true),
});

// Schema for executing a workflow
const executeWorkflowSchema = z.object({
  workflowId: z.string().min(1, 'Workflow ID is required'),
  input: z.record(z.any()).optional(),
});

/**
 * Creates a new agent for the user
 */
export const createAgent = async (args: unknown, context: any) => {
  // Validate arguments
  const validatedArgs = ensureArgsSchemaOrThrowHttpError(createAgentSchema, args);

  // Apply RBAC middleware - require 'agent-templates:create' permission
  const user = await requirePermission({
    resource: 'agent-templates',
    action: 'create',
    adminOverride: true,
    auditRejection: true,
  })(context);

  try {
    // Log the operation
    LoggingService.info({
      message: `Creating new agent: ${validatedArgs.name}`,
      userId: user.id,
      module: 'forgeflow',
      category: 'AGENT_MANAGEMENT',
      metadata: {
        agentName: validatedArgs.name,
        agentType: validatedArgs.type,
      },
    });

    // Create the agent in the database
    const agent = await prisma.agent.create({
      data: {
        userId: user.id,
        name: validatedArgs.name,
        description: validatedArgs.description,
        type: validatedArgs.type,
        configuration: validatedArgs.configuration,
        isActive: validatedArgs.isActive,
      },
    });

    // Apply field-level access control
    const filteredAgent = await applyFieldAccess(agent, user, 'agent-templates', 'create');

    return filteredAgent;
  } catch (error) {
    LoggingService.error({
      message: `Error creating agent: ${validatedArgs.name}`,
      userId: user.id,
      module: 'forgeflow',
      category: 'AGENT_MANAGEMENT',
      error,
    });
    console.error('Error creating agent:', error);
    throw new HttpError(500, 'Failed to create agent');
  }
};

/**
 * Executes a workflow with the specified agents
 */
export const executeAgentWorkflow = async (args: unknown, context: any) => {
  // Validate arguments
  const validatedArgs = ensureArgsSchemaOrThrowHttpError(executeWorkflowSchema, args);

  // Apply RBAC middleware - require 'forgeflow:execute' permission
  const user = await requirePermission({
    resource: 'forgeflow',
    action: 'execute',
    adminOverride: true,
    auditRejection: true,
  })(context);

  try {
    // Log the operation start
    LoggingService.info({
      message: `Executing workflow: ${validatedArgs.workflowId}`,
      userId: user.id,
      module: 'forgeflow',
      category: 'WORKFLOW_EXECUTION',
      metadata: {
        workflowId: validatedArgs.workflowId,
        input: validatedArgs.input,
      },
    });

    // Get the workflow from the database
    const workflow = await prisma.workflow.findUnique({
      where: {
        id: validatedArgs.workflowId,
        userId: user.id,
      },
      include: {
        agents: true,
      },
    });

    if (!workflow) {
      throw new HttpError(404, 'Workflow not found');
    }

    // Create a workflow execution record
    const workflowExecution = await prisma.workflowExecution.create({
      data: {
        workflowId: workflow.id,
        status: 'running',
      },
    });

    try {
      // Parse the workflow steps
      const workflowConfig = workflow.steps as any;

      // Create the crew
      const crew = createCrew(workflowConfig);

      // Execute the crew
      const result = await executeCrew(crew);

      // Update the workflow execution record
      await prisma.workflowExecution.update({
        where: {
          id: workflowExecution.id,
        },
        data: {
          status: 'completed',
          completedAt: new Date(),
          results: result,
        },
      });

      // Log successful execution
      LoggingService.info({
        message: `Workflow execution completed: ${validatedArgs.workflowId}`,
        userId: user.id,
        module: 'forgeflow',
        category: 'WORKFLOW_EXECUTION',
        metadata: {
          workflowId: validatedArgs.workflowId,
          executionId: workflowExecution.id,
          status: 'completed',
        },
      });

      // Apply field-level access control
      const filteredResult = await applyFieldAccess(
        { executionId: workflowExecution.id, status: 'completed', result },
        user,
        'forgeflow',
        'execute'
      );

      return filteredResult;
    } catch (error) {
      // Update the workflow execution record with the error
      await prisma.workflowExecution.update({
        where: {
          id: workflowExecution.id,
        },
        data: {
          status: 'failed',
          completedAt: new Date(),
          error: error.message || 'Unknown error',
        },
      });

      // Log execution failure
      LoggingService.error({
        message: `Workflow execution failed: ${validatedArgs.workflowId}`,
        userId: user.id,
        module: 'forgeflow',
        category: 'WORKFLOW_EXECUTION',
        error,
        metadata: {
          workflowId: validatedArgs.workflowId,
          executionId: workflowExecution.id,
          status: 'failed',
        },
      });

      throw error;
    }
  } catch (error) {
    LoggingService.error({
      message: `Error executing workflow: ${validatedArgs.workflowId}`,
      userId: user.id,
      module: 'forgeflow',
      category: 'WORKFLOW_EXECUTION',
      error,
    });
    console.error('Error executing workflow:', error);
    throw new HttpError(500, 'Failed to execute workflow: ' + error.message);
  }
};

/**
 * Creates a new workflow from a template or custom configuration
 */
export const createWorkflow = async (args: any, context: any) => {
  // Apply RBAC middleware - require 'forgeflow:create' permission
  const user = await requirePermission({
    resource: 'forgeflow',
    action: 'create',
    adminOverride: true,
    auditRejection: true,
  })(context);

  try {
    // Log the operation start
    LoggingService.info({
      message: `Creating workflow: ${args.name}`,
      userId: user.id,
      module: 'forgeflow',
      category: 'WORKFLOW_MANAGEMENT',
      metadata: {
        workflowName: args.name,
        templateId: args.templateId,
        hasCustomConfig: !!args.configuration,
      },
    });

    let workflowConfig;

    // If using a template
    if (args.templateId) {
      workflowConfig = workflowTemplates[args.templateId];
      if (!workflowConfig) {
        throw new HttpError(404, 'Workflow template not found');
      }
    }
    // If using a custom configuration
    else if (args.configuration) {
      workflowConfig = ensureArgsSchemaOrThrowHttpError(crewConfigSchema, args.configuration);
    } else {
      throw new HttpError(400, 'Either templateId or configuration must be provided');
    }

    // Create agents if they don't exist
    const agentIds = [];
    for (const agentConfig of workflowConfig.agents) {
      // Check if agent already exists
      let agent = await prisma.agent.findFirst({
        where: {
          userId: user.id,
          name: agentConfig.name,
        },
      });

      // Create agent if it doesn't exist
      if (!agent) {
        agent = await prisma.agent.create({
          data: {
            userId: user.id,
            name: agentConfig.name,
            description: agentConfig.role,
            type: 'workflow',
            configuration: agentConfig,
            isActive: true,
          },
        });
      }

      agentIds.push(agent.id);
    }

    // Create the workflow
    const workflow = await prisma.workflow.create({
      data: {
        userId: user.id,
        name: args.name,
        description: args.description,
        steps: workflowConfig,
        triggers: args.triggers || {},
        isActive: true,
        agents: {
          connect: agentIds.map((id) => ({ id })),
        },
      },
    });

    // Log successful creation
    LoggingService.info({
      message: `Workflow created: ${args.name}`,
      userId: user.id,
      module: 'forgeflow',
      category: 'WORKFLOW_MANAGEMENT',
      metadata: {
        workflowId: workflow.id,
        workflowName: workflow.name,
        agentCount: agentIds.length,
      },
    });

    // Apply field-level access control
    const filteredWorkflow = await applyFieldAccess(workflow, user, 'forgeflow', 'create');

    return filteredWorkflow;
  } catch (error) {
    LoggingService.error({
      message: `Error creating workflow: ${args.name}`,
      userId: user.id,
      module: 'forgeflow',
      category: 'WORKFLOW_MANAGEMENT',
      error,
    });
    console.error('Error creating workflow:', error);
    throw new HttpError(500, 'Failed to create workflow: ' + error.message);
  }
};

/**
 * Gets all available agent templates
 */
export const getAgentTemplates = async (args: any, context: any) => {
  // Apply RBAC middleware - require 'agent-templates:read' permission
  const user = await requirePermission({
    resource: 'agent-templates',
    action: 'read',
    adminOverride: true,
    auditRejection: true,
  })(context);

  try {
    // Log the operation
    LoggingService.info({
      message: 'Retrieving agent templates',
      userId: user.id,
      module: 'forgeflow',
      category: 'AGENT_MANAGEMENT',
    });

    const templates = Object.entries(predefinedAgentRoles).map(([id, role]) => ({
      id,
      ...role,
    }));

    // Apply field-level access control
    const filteredTemplates = await applyFieldAccessToArray(
      templates,
      user,
      'agent-templates',
      'read'
    );

    return filteredTemplates;
  } catch (error) {
    LoggingService.error({
      message: 'Error getting agent templates',
      userId: user.id,
      module: 'forgeflow',
      category: 'AGENT_MANAGEMENT',
      error,
    });
    console.error('Error getting agent templates:', error);
    throw new HttpError(500, 'Failed to get agent templates');
  }
};

/**
 * Gets all available workflow templates
 */
export const getWorkflowTemplates = async (args: any, context: any) => {
  // Apply RBAC middleware - require 'workflow-templates:read' permission
  const user = await requirePermission({
    resource: 'workflow-templates',
    action: 'read',
    adminOverride: true,
    auditRejection: true,
  })(context);

  try {
    // Log the operation
    LoggingService.info({
      message: 'Retrieving workflow templates',
      userId: user.id,
      module: 'forgeflow',
      category: 'WORKFLOW_MANAGEMENT',
    });

    const templates = Object.entries(workflowTemplates).map(([id, template]) => ({
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1).replace(/([A-Z])/g, ' $1'),
      description: `${template.tasks.length}-step workflow for ${id.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
      agentCount: template.agents.length,
      taskCount: template.tasks.length,
      process: template.process,
    }));

    // Apply field-level access control
    const filteredTemplates = await applyFieldAccessToArray(
      templates,
      user,
      'workflow-templates',
      'read'
    );

    return filteredTemplates;
  } catch (error) {
    LoggingService.error({
      message: 'Error getting workflow templates',
      userId: user.id,
      module: 'forgeflow',
      category: 'WORKFLOW_MANAGEMENT',
      error,
    });
    console.error('Error getting workflow templates:', error);
    throw new HttpError(500, 'Failed to get workflow templates');
  }
};

/**
 * Initializes the Sentient Loop™ for the current user
 */
export const initializeSentientLoopForUser = async (args: any, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to initialize the Sentient Loop™');
  }

  try {
    await initializeSentientLoop(context.user.id);
    return { success: true };
  } catch (error) {
    console.error('Error initializing Sentient Loop™:', error);
    throw new HttpError(500, 'Failed to initialize Sentient Loop™');
  }
};

/**
 * Gets the status and insights from the Sentient Loop™
 */
export const getSentientLoopStatusForUser = async (args: any, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to get Sentient Loop™ status');
  }

  try {
    return await getSentientLoopStatus(context.user.id);
  } catch (error) {
    console.error('Error getting Sentient Loop™ status:', error);
    throw new HttpError(500, 'Failed to get Sentient Loop™ status');
  }
};

/**
 * Registers a new data source for signal ingestion
 */
export const registerDataSourceForUser = async (args: any, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to register a data source');
  }

  const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    type: z.enum([
      DataSourceType.INTERNAL_SYSTEM,
      DataSourceType.EXTERNAL_API,
      DataSourceType.REAL_TIME_FEED,
      DataSourceType.USER_INTERACTION,
      DataSourceType.BUSINESS_METRICS,
    ]),
    config: z.record(z.any()),
  });

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(schema, args);

  try {
    return await registerDataSource(
      validatedArgs.name,
      validatedArgs.type,
      validatedArgs.config,
      context.user.id
    );
  } catch (error) {
    console.error('Error registering data source:', error);
    throw new HttpError(500, 'Failed to register data source');
  }
};

/**
 * Ingests a signal and processes it through the Sentient Loop™
 */
export const ingestSignalForUser = async (args: any, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to ingest a signal');
  }

  const schema = z.object({
    sourceId: z.string().min(1, 'Source ID is required'),
    data: z.record(z.any()),
  });

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(schema, args);

  try {
    return await processThroughSentientLoop(
      context.user.id,
      validatedArgs.sourceId,
      validatedArgs.data
    );
  } catch (error) {
    console.error('Error ingesting signal:', error);
    throw new HttpError(500, 'Failed to ingest signal');
  }
};

/**
 * Stores a memory in the Sentient Loop™ memory system
 */
export const storeMemoryForUser = async (args: any, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to store a memory');
  }

  const schema = z.object({
    type: z.enum([MemoryType.SHORT_TERM, MemoryType.LONG_TERM]),
    context: z.string().min(1, 'Context is required'),
    content: z.record(z.any()),
    importance: z.number().min(0).max(5).optional(),
    expiresAt: z.date().optional(),
  });

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(schema, args);

  try {
    return await storeMemory(
      context.user.id,
      validatedArgs.type,
      validatedArgs.context,
      validatedArgs.content,
      validatedArgs.importance,
      validatedArgs.expiresAt
    );
  } catch (error) {
    console.error('Error storing memory:', error);
    throw new HttpError(500, 'Failed to store memory');
  }
};

/**
 * Retrieves memories from the Sentient Loop™ memory system
 */
export const retrieveMemoriesForUser = async (args: any, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to retrieve memories');
  }

  const schema = z.object({
    context: z.string().min(1, 'Context is required'),
    limit: z.number().min(1).max(100).optional(),
  });

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(schema, args);

  try {
    return await retrieveMemories(context.user.id, validatedArgs.context, validatedArgs.limit);
  } catch (error) {
    console.error('Error retrieving memories:', error);
    throw new HttpError(500, 'Failed to retrieve memories');
  }
};

/**
 * Stores feedback in the Sentient Loop™ feedback system
 */
export const storeFeedbackForUser = async (args: any, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to store feedback');
  }

  const schema = z.object({
    rating: z.number().min(1).max(5),
    comment: z.string().optional(),
    memoryId: z.string().optional(),
    workflowExecutionId: z.string().optional(),
  });

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(schema, args);

  try {
    return await storeFeedback(
      context.user.id,
      validatedArgs.rating,
      validatedArgs.comment,
      validatedArgs.memoryId,
      validatedArgs.workflowExecutionId
    );
  } catch (error) {
    console.error('Error storing feedback:', error);
    throw new HttpError(500, 'Failed to store feedback');
  }
};

/**
 * Saves a workflow design created with the visual designer
 */
export const saveWorkflowDesign = async (args: any, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to save a workflow design');
  }

  const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().min(1, 'Description is required'),
    nodes: z.array(z.any()),
    edges: z.array(z.any()),
  });

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(schema, args);

  try {
    // Create or update the workflow
    const workflow = await prisma.workflow.upsert({
      where: {
        userId_name: {
          userId: context.user.id,
          name: validatedArgs.name,
        },
      },
      update: {
        description: validatedArgs.description,
        isVisual: true,
      },
      create: {
        userId: context.user.id,
        name: validatedArgs.name,
        description: validatedArgs.description,
        steps: {},
        triggers: {},
        isActive: true,
        isVisual: true,
      },
    });

    // Create or update the workflow design
    const workflowDesign = await prisma.workflowDesign.upsert({
      where: {
        workflowId: workflow.id,
      },
      update: {
        version: {
          increment: 1,
        },
      },
      create: {
        workflowId: workflow.id,
        version: 1,
      },
    });

    // Delete existing nodes and connections
    await prisma.workflowConnection.deleteMany({
      where: {
        designId: workflowDesign.id,
      },
    });

    await prisma.workflowNode.deleteMany({
      where: {
        designId: workflowDesign.id,
      },
    });

    // Create new nodes
    const createdNodes = await Promise.all(
      validatedArgs.nodes.map(async (node: any) => {
        return await prisma.workflowNode.create({
          data: {
            designId: workflowDesign.id,
            type: node.type,
            positionX: node.position.x,
            positionY: node.position.y,
            data: node.data,
          },
        });
      })
    );

    // Create node ID mapping
    const nodeIdMap = validatedArgs.nodes.reduce((map: any, node: any, index: number) => {
      map[node.id] = createdNodes[index].id;
      return map;
    }, {});

    // Create connections
    await Promise.all(
      validatedArgs.edges.map(async (edge: any) => {
        return await prisma.workflowConnection.create({
          data: {
            designId: workflowDesign.id,
            sourceId: nodeIdMap[edge.source],
            targetId: nodeIdMap[edge.target],
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle,
            label: edge.data?.label,
          },
        });
      })
    );

    return {
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      designId: workflowDesign.id,
      version: workflowDesign.version,
    };
  } catch (error) {
    console.error('Error saving workflow design:', error);
    throw new HttpError(500, 'Failed to save workflow design: ' + error.message);
  }
};

/**
 * Export the LangGraph operations
 */
export { executeThreatResearchWorkflow };

/**
 * Gets a workflow design by ID
 */
export const getWorkflowDesign = async (args: any, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to get a workflow design');
  }

  const schema = z.object({
    workflowId: z.string().min(1, 'Workflow ID is required'),
  });

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(schema, args);

  try {
    // Get the workflow
    const workflow = await prisma.workflow.findUnique({
      where: {
        id: validatedArgs.workflowId,
        userId: context.user.id,
      },
      include: {
        visualDesign: {
          include: {
            nodes: true,
            connections: true,
          },
        },
      },
    });

    if (!workflow) {
      throw new HttpError(404, 'Workflow not found');
    }

    if (!workflow.isVisual || !workflow.visualDesign) {
      throw new HttpError(400, 'Workflow is not a visual workflow');
    }

    // Convert database nodes and connections to ReactFlow format
    const nodes = workflow.visualDesign.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: {
        x: node.positionX,
        y: node.positionY,
      },
      data: node.data,
    }));

    const edges = workflow.visualDesign.connections.map((connection) => ({
      id: connection.id,
      source: connection.sourceId,
      target: connection.targetId,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
      data: {
        label: connection.label,
      },
    }));

    return {
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      designId: workflow.visualDesign.id,
      version: workflow.visualDesign.version,
      nodes,
      edges,
    };
  } catch (error) {
    console.error('Error getting workflow design:', error);
    throw new HttpError(500, 'Failed to get workflow design: ' + error.message);
  }
};

/**
 * Gets all visual workflows for the current user
 */
export const getVisualWorkflows = async (args: any, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to get visual workflows');
  }

  try {
    const workflows = await prisma.workflow.findMany({
      where: {
        userId: context.user.id,
        isVisual: true,
      },
      include: {
        visualDesign: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return workflows.map((workflow) => ({
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
      isActive: workflow.isActive,
      designId: workflow.visualDesign?.id,
      version: workflow.visualDesign?.version,
    }));
  } catch (error) {
    console.error('Error getting visual workflows:', error);
    throw new HttpError(500, 'Failed to get visual workflows');
  }
};
