/**
 * API operations for the ethical alignment service
 */

import { ethicalAlignmentService } from '../services/ethicalAlignment/ethicalAlignmentService';
import { prisma } from 'wasp/server';
import { HttpError } from 'wasp/server';
import { EthicalRuleType, EthicalSeverity } from '@prisma/client';

/**
 * Check content for ethical alignment
 */
export const checkEthicalAlignment = async (args: {
  content: string;
  contentType: string;
  agentId: string;
  userId?: string;
  sessionId?: string;
  moduleId?: string;
  industryContext?: string;
  regulatoryContext?: string;
  metadata?: Record<string, any>;
}, context: any) => {
  // Ensure user is authenticated
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to check ethical alignment');
  }

  // Ensure agent exists
  const agent = await prisma.aI_Agent.findUnique({
    where: { id: args.agentId },
  });

  if (!agent) {
    throw new HttpError(404, 'Agent not found');
  }

  // Check if user has permission to access this agent
  if (agent.userId !== context.user.id) {
    // Check if user is in the same organization as the agent owner
    const agentOwner = await prisma.user.findUnique({
      where: { id: agent.userId },
      select: { organizationId: true },
    });

    if (!agentOwner?.organizationId || agentOwner.organizationId !== context.user.organizationId) {
      throw new HttpError(403, 'You do not have permission to access this agent');
    }
  }

  // Check ethical alignment
  return ethicalAlignmentService.checkAlignment({
    ...args,
    userId: context.user.id,
  });
};

/**
 * Get ethical rules
 */
export const getEthicalRules = async (_args: any, context: any) => {
  // Ensure user is authenticated
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to get ethical rules');
  }

  // Get organization ID
  const organizationId = context.user.organizationId;

  // Get rules for the organization and global rules
  const rules = await prisma.ethicalRule.findMany({
    where: {
      OR: [
        { organizationId: organizationId },
        { organizationId: null }, // Global rules
      ],
    },
    orderBy: { createdAt: 'desc' },
  });

  return rules;
};

/**
 * Create a new ethical rule
 */
export const createEthicalRule = async (args: {
  name: string;
  description: string;
  type: EthicalRuleType;
  ruleDefinition: any;
  severity?: EthicalSeverity;
  industryContext?: string;
  regulatoryContext?: string;
  metadata?: Record<string, any>;
}, context: any) => {
  // Ensure user is authenticated
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to create ethical rules');
  }

  // Check if user has permission to create rules
  // TODO: Add proper permission check

  // Create the rule
  const rule = await prisma.ethicalRule.create({
    data: {
      name: args.name,
      description: args.description,
      type: args.type,
      ruleDefinition: args.ruleDefinition,
      severity: args.severity || 'MEDIUM',
      organizationId: context.user.organizationId,
      industryContext: args.industryContext,
      regulatoryContext: args.regulatoryContext,
      metadata: args.metadata,
    },
  });

  return rule;
};

/**
 * Update an existing ethical rule
 */
export const updateEthicalRule = async (args: {
  id: string;
  name?: string;
  description?: string;
  type?: EthicalRuleType;
  ruleDefinition?: any;
  severity?: EthicalSeverity;
  isActive?: boolean;
  industryContext?: string;
  regulatoryContext?: string;
  metadata?: Record<string, any>;
}, context: any) => {
  // Ensure user is authenticated
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to update ethical rules');
  }

  // Get the rule
  const rule = await prisma.ethicalRule.findUnique({
    where: { id: args.id },
  });

  if (!rule) {
    throw new HttpError(404, 'Rule not found');
  }

  // Check if user has permission to update this rule
  if (rule.organizationId && rule.organizationId !== context.user.organizationId) {
    throw new HttpError(403, 'You do not have permission to update this rule');
  }

  // Update the rule
  const updatedRule = await prisma.ethicalRule.update({
    where: { id: args.id },
    data: {
      ...(args.name && { name: args.name }),
      ...(args.description && { description: args.description }),
      ...(args.type && { type: args.type }),
      ...(args.ruleDefinition && { ruleDefinition: args.ruleDefinition }),
      ...(args.severity && { severity: args.severity }),
      ...(args.isActive !== undefined && { isActive: args.isActive }),
      ...(args.industryContext && { industryContext: args.industryContext }),
      ...(args.regulatoryContext && { regulatoryContext: args.regulatoryContext }),
      ...(args.metadata && { metadata: args.metadata }),
    },
  });

  return updatedRule;
};

/**
 * Get alignment checks
 */
export const getAlignmentChecks = async (args: {
  agentId?: string;
  status?: string;
  severity?: EthicalSeverity;
  limit?: number;
  offset?: number;
}, context: any) => {
  // Ensure user is authenticated
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to get alignment checks');
  }

  // Build the query
  const query: any = {
    where: {
      userId: context.user.id,
    },
    orderBy: { timestamp: 'desc' },
    include: {
      agent: {
        select: {
          name: true,
          type: true,
        },
      },
      rule: {
        select: {
          name: true,
          type: true,
          description: true,
        },
      },
    },
  };

  // Add filters
  if (args.agentId) {
    query.where.agentId = args.agentId;
  }

  if (args.status) {
    query.where.status = args.status;
  }

  if (args.severity) {
    query.where.severity = args.severity;
  }

  // Add pagination
  if (args.limit) {
    query.take = args.limit;
  }

  if (args.offset) {
    query.skip = args.offset;
  }

  // Get the checks
  const checks = await prisma.alignmentCheck.findMany(query);

  // Get the total count
  const totalCount = await prisma.alignmentCheck.count({
    where: query.where,
  });

  return {
    checks,
    totalCount,
  };
};

/**
 * Review an alignment check
 */
export const reviewAlignmentCheck = async (args: {
  checkId: string;
  status: 'approved' | 'rejected';
  reviewNotes?: string;
}, context: any) => {
  // Ensure user is authenticated
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to review alignment checks');
  }

  // Get the check
  const check = await prisma.alignmentCheck.findUnique({
    where: { id: args.checkId },
  });

  if (!check) {
    throw new HttpError(404, 'Alignment check not found');
  }

  // Check if user has permission to review this check
  // TODO: Add proper permission check

  // Update the check
  const updatedCheck = await prisma.alignmentCheck.update({
    where: { id: args.checkId },
    data: {
      status: args.status,
      reviewedBy: context.user.id,
      reviewedAt: new Date(),
      reviewNotes: args.reviewNotes,
    },
  });

  return updatedCheck;
};