import { HttpError } from 'wasp/server';
import { z } from 'zod';
import { SubmitAgentEscalation } from '@src/shared/types/api/agent';
import { prisma } from 'wasp/server';
import { submitEscalationSchema } from '@src/api/validators/agentSchemas';

/**
 * Submit escalation for an agent
 * 
 * @param {Object} args - The arguments
 * @param {string} args.agentId - The agent ID
 * @param {string} args.reason - The reason for escalation
 * @param {string} args.severity - The severity (low, medium, high, critical)
 * @param {string} args.details - Optional details
 * @param {string} args.context - Optional context
 * @param {Object} context - The context
 * @returns {Promise<Object>} The result
 */
export const submitAgentEscalation: SubmitAgentEscalation = async (args, context) => {
  // Validate user is authenticated
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to submit escalations');
  }

  // Validate input
  const validatedInput = submitEscalationSchema.parse(args);

  try {
    // Get agent
    const agent = await prisma.aI_Agent.findUnique({
      where: {
        id: validatedInput.agentId,
      },
    });

    // Check if agent exists
    if (!agent) {
      throw new HttpError(404, 'Agent not found');
    }

    // Create escalation
    const escalation = await prisma.agentEscalation.create({
      data: {
        agentId: validatedInput.agentId,
        userId: context.user.id,
        reason: validatedInput.reason,
        severity: validatedInput.severity,
        details: validatedInput.details,
        context: validatedInput.context,
        status: 'open',
      },
    });

    // Create system log for the escalation
    await prisma.systemLog.create({
      data: {
        level: 'WARN',
        category: 'AGENT_ACTION',
        message: `Agent escalation submitted: ${validatedInput.reason}`,
        source: 'agent_escalation',
        moduleId: 'arcana',
        userId: context.user.id,
        agentId: validatedInput.agentId,
        tags: ['escalation', validatedInput.severity],
        metadata: {
          escalationId: escalation.id,
          reason: validatedInput.reason,
          severity: validatedInput.severity,
        },
      },
    });

    // Create notification for administrators
    await prisma.notification.create({
      data: {
        userId: context.user.id, // This will be updated to target admins in a real implementation
        title: `Agent Escalation: ${validatedInput.severity.toUpperCase()}`,
        message: `Agent "${agent.name}" has been escalated: ${validatedInput.reason}`,
        type: 'escalation',
        isRead: false,
        metadata: {
          escalationId: escalation.id,
          agentId: validatedInput.agentId,
          agentName: agent.name,
          severity: validatedInput.severity,
        },
      },
    });

    return {
      success: true,
      message: 'Escalation submitted successfully',
      escalationId: escalation.id,
    };
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    console.error('Error submitting agent escalation:', error);
    throw new HttpError(500, 'Failed to submit agent escalation');
  }
};
