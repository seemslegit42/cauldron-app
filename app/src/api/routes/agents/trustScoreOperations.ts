/**
 * API operations for agent trust scores
 */

import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import { z } from 'zod';
import { withErrorHandling } from '@src/api/middleware/errorHandling';
import { requirePermission } from '@src/api/middleware/rbac';
import { validateAndSanitize } from '@src/api/middleware/validation';
import { LoggingService } from '@src/shared/services/logging';
import { AgentTrustService } from '@src/server/services/agentTrustService';
import { applyFieldAccess } from '@src/api/middleware/fieldAccess';
import {
  BadgeCategory,
  BadgeTier,
  BadgeRequirementType,
  XpActionType
} from '@src/shared/types/entities/agentTrust';

// Schema for creating a badge
const createBadgeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  tier: z.string().min(1, 'Tier is required'),
  iconUrl: z.string().optional(),
  requirement: z.string().min(1, 'Requirement is required'),
  requirementValue: z.number().min(1, 'Requirement value is required'),
  requirementType: z.string().min(1, 'Requirement type is required'),
  isActive: z.boolean().optional().default(true),
});

// Schema for updating a badge
const updateBadgeSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  category: z.string().min(1, 'Category is required').optional(),
  tier: z.string().min(1, 'Tier is required').optional(),
  iconUrl: z.string().optional(),
  requirement: z.string().min(1, 'Requirement is required').optional(),
  requirementValue: z.number().min(1, 'Requirement value is required').optional(),
  requirementType: z.string().min(1, 'Requirement type is required').optional(),
  isActive: z.boolean().optional(),
});

// Schema for awarding a badge
const awardBadgeSchema = z.object({
  agentId: z.string().min(1, 'Agent ID is required'),
  badgeId: z.string().min(1, 'Badge ID is required'),
});

// Schema for recording a task
const recordTaskSchema = z.object({
  agentId: z.string().min(1, 'Agent ID is required'),
  success: z.boolean().default(true),
});

// Schema for recording feedback
const recordFeedbackSchema = z.object({
  agentId: z.string().min(1, 'Agent ID is required'),
  rating: z.number().min(1).max(5),
});

// Schema for adding XP
const addXpSchema = z.object({
  agentId: z.string().min(1, 'Agent ID is required'),
  xp: z.number().min(1, 'XP is required'),
  actionType: z.string().min(1, 'Action type is required'),
  description: z.string().optional(),
});

/**
 * Get trust score for an agent
 */
export const getAgentTrustScore = withErrorHandling(async (args: { agentId: string }, context: any) => {
  // Apply RBAC middleware - require 'agents:read' permission
  const user = await requirePermission({
    resource: 'agents',
    action: 'read',
    adminOverride: true,
    auditRejection: true,
  })(context);

  try {
    // Log the operation
    LoggingService.info({
      message: `Fetching trust score for agent ${args.agentId}`,
      userId: user.id,
      agentId: args.agentId,
      category: 'AGENT_TRUST',
    });

    // Get trust score with stats
    const trustScore = await AgentTrustService.getTrustScoreWithStats(args.agentId);

    // Apply field-level access control
    const filteredTrustScore = await applyFieldAccess(trustScore, user, 'agents', 'read');

    return filteredTrustScore;
  } catch (error) {
    console.error(`Error fetching trust score for agent ${args.agentId}:`, error);
    LoggingService.error({
      message: `Failed to fetch trust score for agent ${args.agentId}`,
      userId: user.id,
      agentId: args.agentId,
      category: 'AGENT_TRUST',
      error,
    });
    throw error instanceof HttpError ? error : new HttpError(500, 'Failed to fetch trust score');
  }
});

/**
 * Get all badges
 */
export const getBadges = withErrorHandling(async (args: any, context: any) => {
  // Apply RBAC middleware - require 'agents:read' permission
  const user = await requirePermission({
    resource: 'agents',
    action: 'read',
    adminOverride: true,
    auditRejection: true,
  })(context);

  try {
    // Log the operation
    LoggingService.info({
      message: 'Fetching badges',
      userId: user.id,
      category: 'AGENT_TRUST',
    });

    // Get all badges
    const badges = await prisma.trustBadge.findMany({
      orderBy: [
        { category: 'asc' },
        { tier: 'asc' },
      ],
    });

    // Apply field-level access control
    const filteredBadges = await Promise.all(
      badges.map(badge => applyFieldAccess(badge, user, 'agents', 'read'))
    );

    return filteredBadges;
  } catch (error) {
    console.error('Error fetching badges:', error);
    LoggingService.error({
      message: 'Failed to fetch badges',
      userId: user.id,
      category: 'AGENT_TRUST',
      error,
    });
    throw new HttpError(500, 'Failed to fetch badges');
  }
});

/**
 * Create a new badge
 */
export const createBadge = withErrorHandling(async (args: any, context: any) => {
  // Apply RBAC middleware - require 'agents:create' permission
  const user = await requirePermission({
    resource: 'agents',
    action: 'create',
    adminOverride: true,
    auditRejection: true,
  })(context);

  // Validate input
  const validatedArgs = validateAndSanitize(args, createBadgeSchema);

  try {
    // Log the operation
    LoggingService.info({
      message: 'Creating new badge',
      userId: user.id,
      category: 'AGENT_TRUST',
      metadata: { badgeName: validatedArgs.name },
    });

    // Create badge
    const badge = await prisma.trustBadge.create({
      data: {
        name: validatedArgs.name,
        description: validatedArgs.description,
        category: validatedArgs.category,
        tier: validatedArgs.tier,
        iconUrl: validatedArgs.iconUrl,
        requirement: validatedArgs.requirement,
        requirementValue: validatedArgs.requirementValue,
        requirementType: validatedArgs.requirementType,
        isActive: validatedArgs.isActive ?? true,
      },
    });

    // Apply field-level access control
    const filteredBadge = await applyFieldAccess(badge, user, 'agents', 'create');

    return filteredBadge;
  } catch (error) {
    console.error('Error creating badge:', error);
    LoggingService.error({
      message: 'Failed to create badge',
      userId: user.id,
      category: 'AGENT_TRUST',
      error,
    });
    throw error instanceof HttpError ? error : new HttpError(500, 'Failed to create badge');
  }
});

/**
 * Update a badge
 */
export const updateBadge = withErrorHandling(async (args: any, context: any) => {
  // Apply RBAC middleware - require 'agents:update' permission
  const user = await requirePermission({
    resource: 'agents',
    action: 'update',
    adminOverride: true,
    auditRejection: true,
  })(context);

  // Validate input
  const validatedArgs = validateAndSanitize(args, updateBadgeSchema);

  try {
    // Check if badge exists
    const existingBadge = await prisma.trustBadge.findUnique({
      where: { id: validatedArgs.id },
    });

    if (!existingBadge) {
      throw new HttpError(404, 'Badge not found');
    }

    // Log the operation
    LoggingService.info({
      message: `Updating badge ${validatedArgs.id}`,
      userId: user.id,
      category: 'AGENT_TRUST',
      metadata: { badgeId: validatedArgs.id },
    });

    // Update badge
    const badge = await prisma.trustBadge.update({
      where: { id: validatedArgs.id },
      data: {
        name: validatedArgs.name ?? existingBadge.name,
        description: validatedArgs.description ?? existingBadge.description,
        category: validatedArgs.category ?? existingBadge.category,
        tier: validatedArgs.tier ?? existingBadge.tier,
        iconUrl: validatedArgs.iconUrl ?? existingBadge.iconUrl,
        requirement: validatedArgs.requirement ?? existingBadge.requirement,
        requirementValue: validatedArgs.requirementValue ?? existingBadge.requirementValue,
        requirementType: validatedArgs.requirementType ?? existingBadge.requirementType,
        isActive: validatedArgs.isActive ?? existingBadge.isActive,
      },
    });

    // Apply field-level access control
    const filteredBadge = await applyFieldAccess(badge, user, 'agents', 'update');

    return filteredBadge;
  } catch (error) {
    console.error('Error updating badge:', error);
    LoggingService.error({
      message: 'Failed to update badge',
      userId: user.id,
      category: 'AGENT_TRUST',
      error,
    });
    throw error instanceof HttpError ? error : new HttpError(500, 'Failed to update badge');
  }
});

/**
 * Award a badge to an agent
 */
export const awardBadge = withErrorHandling(async (args: any, context: any) => {
  // Apply RBAC middleware - require 'agents:update' permission
  const user = await requirePermission({
    resource: 'agents',
    action: 'update',
    adminOverride: true,
    auditRejection: true,
  })(context);

  // Validate input
  const validatedArgs = validateAndSanitize(args, awardBadgeSchema);

  try {
    // Log the operation
    LoggingService.info({
      message: `Awarding badge ${validatedArgs.badgeId} to agent ${validatedArgs.agentId}`,
      userId: user.id,
      category: 'AGENT_TRUST',
      metadata: {
        badgeId: validatedArgs.badgeId,
        agentId: validatedArgs.agentId,
      },
    });

    // Award badge
    const earnedBadge = await AgentTrustService.awardSpecialBadge(
      validatedArgs.agentId,
      validatedArgs.badgeId
    );

    // Apply field-level access control
    const filteredEarnedBadge = await applyFieldAccess(earnedBadge, user, 'agents', 'update');

    return filteredEarnedBadge;
  } catch (error) {
    console.error('Error awarding badge:', error);
    LoggingService.error({
      message: 'Failed to award badge',
      userId: user.id,
      category: 'AGENT_TRUST',
      error,
    });
    throw error instanceof HttpError ? error : new HttpError(500, 'Failed to award badge');
  }
});

/**
 * Record a task for an agent
 */
export const recordTask = withErrorHandling(async (args: any, context: any) => {
  // Apply RBAC middleware - require 'agents:update' permission
  const user = await requirePermission({
    resource: 'agents',
    action: 'update',
    adminOverride: true,
    auditRejection: true,
  })(context);

  // Validate input
  const validatedArgs = validateAndSanitize(args, recordTaskSchema);

  try {
    // Log the operation
    LoggingService.info({
      message: `Recording ${validatedArgs.success ? 'successful' : 'failed'} task for agent ${validatedArgs.agentId}`,
      userId: user.id,
      category: 'AGENT_TRUST',
      metadata: {
        agentId: validatedArgs.agentId,
        success: validatedArgs.success,
      },
    });

    // Record task
    const trustScore = validatedArgs.success
      ? await AgentTrustService.recordSuccessfulTask(validatedArgs.agentId)
      : await AgentTrustService.recordFailedTask(validatedArgs.agentId);

    // Apply field-level access control
    const filteredTrustScore = await applyFieldAccess(trustScore, user, 'agents', 'update');

    return filteredTrustScore;
  } catch (error) {
    console.error('Error recording task:', error);
    LoggingService.error({
      message: 'Failed to record task',
      userId: user.id,
      category: 'AGENT_TRUST',
      error,
    });
    throw error instanceof HttpError ? error : new HttpError(500, 'Failed to record task');
  }
});

/**
 * Record feedback for an agent
 */
export const recordFeedback = withErrorHandling(async (args: any, context: any) => {
  // Apply RBAC middleware - require 'agents:update' permission
  const user = await requirePermission({
    resource: 'agents',
    action: 'update',
    adminOverride: true,
    auditRejection: true,
  })(context);

  // Validate input
  const validatedArgs = validateAndSanitize(args, recordFeedbackSchema);

  try {
    // Log the operation
    LoggingService.info({
      message: `Recording feedback for agent ${validatedArgs.agentId} with rating ${validatedArgs.rating}`,
      userId: user.id,
      category: 'AGENT_TRUST',
      metadata: {
        agentId: validatedArgs.agentId,
        rating: validatedArgs.rating,
      },
    });

    // Record feedback
    const trustScore = await AgentTrustService.recordFeedback(
      validatedArgs.agentId,
      validatedArgs.rating
    );

    // Apply field-level access control
    const filteredTrustScore = await applyFieldAccess(trustScore, user, 'agents', 'update');

    return filteredTrustScore;
  } catch (error) {
    console.error('Error recording feedback:', error);
    LoggingService.error({
      message: 'Failed to record feedback',
      userId: user.id,
      category: 'AGENT_TRUST',
      error,
    });
    throw error instanceof HttpError ? error : new HttpError(500, 'Failed to record feedback');
  }
});

/**
 * Add XP to an agent
 */
export const addXp = withErrorHandling(async (args: any, context: any) => {
  // Apply RBAC middleware - require 'agents:update' permission
  const user = await requirePermission({
    resource: 'agents',
    action: 'update',
    adminOverride: true,
    auditRejection: true,
  })(context);

  // Validate input
  const validatedArgs = validateAndSanitize(args, addXpSchema);

  try {
    // Log the operation
    LoggingService.info({
      message: `Adding ${validatedArgs.xp} XP to agent ${validatedArgs.agentId}`,
      userId: user.id,
      category: 'AGENT_TRUST',
      metadata: {
        agentId: validatedArgs.agentId,
        xp: validatedArgs.xp,
        actionType: validatedArgs.actionType,
      },
    });

    // Add XP
    const trustScore = await AgentTrustService.updateTrustScore({
      agentId: validatedArgs.agentId,
      xpToAdd: validatedArgs.xp,
      actionType: validatedArgs.actionType as XpActionType,
      description: validatedArgs.description,
    });

    // Apply field-level access control
    const filteredTrustScore = await applyFieldAccess(trustScore, user, 'agents', 'update');

    return filteredTrustScore;
  } catch (error) {
    console.error('Error adding XP:', error);
    LoggingService.error({
      message: 'Failed to add XP',
      userId: user.id,
      category: 'AGENT_TRUST',
      error,
    });
    throw error instanceof HttpError ? error : new HttpError(500, 'Failed to add XP');
  }
});
