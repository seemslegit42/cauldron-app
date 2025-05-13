/**
 * API route for creating a new agent
 */
import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import { withErrorHandling } from '../../middleware';
import { validateAndSanitize } from '../../middleware/validation';
import { requirePermission } from '../../middleware/rbac';
import { applyFieldAccess } from '../../middleware/fieldAccess';
import { createAgentSchema, agentMetadataSchema } from '../../validators/agentSchemas';
import { sentientCheckpoints } from '../../../shared/services/sentientLoopService';

export const createAgent = withErrorHandling(async (args, context) => {
  // Apply RBAC middleware - require 'agents:create' permission
  const user = await requirePermission({
    resource: 'agents',
    action: 'create',
    adminOverride: true,
    auditRejection: true,
  })(context);

  const validatedArgs = validateAndSanitize(args, createAgentSchema);

  // Validate agent metadata
  const metadata = validateAndSanitize(
    validatedArgs.configuration.metadata || {},
    agentMetadataSchema
  );

  // Apply Sentient Loop™ checkpoint for agent creation
  // This ensures the agent meets safety and ethical standards
  await sentientCheckpoints.validateAgentCreation({
    agentConfig: validatedArgs,
    metadata,
    user,
  });

  // Create the agent
  const agent = await prisma.agent.create({
    data: {
      ...validatedArgs,
      userId: user.id,
      organizationId: user.organizationId,
    },
  });

  // Apply field-level access control
  const filteredAgent = await applyFieldAccess(agent, user, 'agents', 'create');

  return filteredAgent;
});
