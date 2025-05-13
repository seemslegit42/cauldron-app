/**
 * API route for executing an agent workflow
 */
import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import { withErrorHandling } from '../../middleware';
import { validateRequest } from '../../middleware/validation';
import { requirePermission } from '../../middleware/rbac';
import { applyFieldAccess } from '../../middleware/fieldAccess';
import { executeAgentSchema } from '../../validators/agentSchemas';
import { executeCrew } from '../../../forgeflow/crew/crewAiUtils';
import { humanConfirmation } from '../../../shared/services/sentientLoopService';

export const executeAgentWorkflow = withErrorHandling(async (args, context) => {
  // Validate request arguments
  const validatedArgs = validateRequest(args, executeAgentSchema);

  // Get the agent
  const agent = await prisma.agent.findUnique({
    where: { id: validatedArgs.agentId },
    include: {
      workflows: true,
      user: {
        select: {
          id: true,
          organizationId: true,
        },
      },
    },
  });

  if (!agent) {
    throw new HttpError(404, 'Agent not found');
  }

  // Apply RBAC middleware - require 'agents:execute' permission
  // Allow agent owners to execute their own agents
  const user = await requirePermission({
    resource: 'agents',
    action: 'execute',
    resourceOwnerId: agent.userId,
    organizationId: agent.user?.organizationId,
    adminOverride: true,
    auditRejection: true,
  })(context);

  // For high-risk operations, require human confirmation
  if (agent.configuration.riskLevel === 'HIGH') {
    const confirmed = await humanConfirmation({
      user,
      action: 'execute_agent',
      details: {
        agentId: agent.id,
        agentName: agent.name,
        input: validatedArgs.input,
      },
    });

    if (!confirmed) {
      throw new HttpError(403, 'Operation not confirmed by user');
    }
  }

  // Create workflow execution record
  const workflowExecution = await prisma.workflowExecution.create({
    data: {
      userId: user.id,
      workflowId: agent.workflows[0]?.id, // Assuming the first workflow
      status: 'RUNNING',
      input: validatedArgs.input,
      context: validatedArgs.context || {},
    },
  });

  // Execute the agent workflow
  const result = await executeCrew({
    agentId: agent.id,
    input: validatedArgs.input,
    context: {
      ...validatedArgs.context,
      userId: user.id,
      executionId: workflowExecution.id,
    },
  });

  // Update workflow execution record
  const updatedExecution = await prisma.workflowExecution.update({
    where: { id: workflowExecution.id },
    data: {
      status: 'COMPLETED',
      output: result,
      completedAt: new Date(),
    },
    include: {
      workflow: true,
      user: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
    },
  });

  // Apply field-level access control
  const filteredExecution = await applyFieldAccess(updatedExecution, user, 'workflows', 'read');

  return {
    executionId: workflowExecution.id,
    result,
    execution: filteredExecution,
  };
});
