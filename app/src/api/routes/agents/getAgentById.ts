import { HttpError } from 'wasp/server';
import { getAgentSchema } from '@src/api/validators/agentSchemas';
import { GetAgentById } from '@src/shared/types/api/agent';
import { prisma } from 'wasp/server';

/**
 * Get agent by ID
 * 
 * @param {Object} args - The arguments
 * @param {string} args.id - The agent ID
 * @param {Object} context - The context
 * @returns {Promise<Agent>} The agent
 */
export const getAgentById: GetAgentById = async ({ id }, context) => {
  // Validate user is authenticated
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to get agent details');
  }

  // Validate input
  const validatedInput = getAgentSchema.parse({ agentId: id });

  try {
    // Get agent
    const agent = await prisma.aI_Agent.findUnique({
      where: {
        id: validatedInput.agentId,
      },
      include: {
        persona: true,
      },
    });

    // Check if agent exists
    if (!agent) {
      throw new HttpError(404, 'Agent not found');
    }

    // Check if user has access to agent
    if (agent.userId !== context.user.id) {
      // TODO: Add organization-based access check here
      throw new HttpError(403, 'You do not have permission to view this agent');
    }

    return agent;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    console.error('Error getting agent by ID:', error);
    throw new HttpError(500, 'Failed to get agent details');
  }
};
