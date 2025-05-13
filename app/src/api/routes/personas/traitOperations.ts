/**
 * API operations for persona traits
 */

import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import { z } from 'zod';
import { withErrorHandling } from '@src/api/middleware/errorHandling';
import { requirePermission } from '@src/api/middleware/rbac';
import { validateAndSanitize } from '@src/api/middleware/validation';
import { LoggingService } from '@src/shared/services/loggingService';
import { applyFieldAccess } from '@src/api/middleware/fieldAccess';
import type { PersonaTrait, TraitCategory } from '@src/shared/types/entities/agentPersona';

// Schema for creating a trait
const createTraitSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  value: z.string().min(1, 'Value is required'),
  isPublic: z.boolean().optional().default(false),
});

// Schema for updating a trait
const updateTraitSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  category: z.string().min(1, 'Category is required').optional(),
  value: z.string().min(1, 'Value is required').optional(),
  isPublic: z.boolean().optional(),
});

/**
 * Get all traits
 */
export const getTraits = withErrorHandling(async (args: any, context: any) => {
  // Apply RBAC middleware - require 'personas:read' permission
  const user = await requirePermission({
    resource: 'personas',
    action: 'read',
    adminOverride: true,
    auditRejection: true,
  })(context);

  try {
    // Log the operation
    LoggingService.info({
      message: 'Fetching persona traits',
      userId: user.id,
      module: 'personas',
      category: 'AGENT_ACTION',
    });

    // Get all public traits and user's own traits
    const traits = await prisma.personaTrait.findMany({
      where: {
        OR: [
          { isPublic: true },
          { createdById: user.id },
        ],
      },
      orderBy: {
        category: 'asc',
      },
    });

    // Apply field-level access control
    const filteredTraits = await Promise.all(
      traits.map(trait => applyFieldAccess(trait, user, 'personas', 'read'))
    );

    return filteredTraits;
  } catch (error) {
    console.error('Error fetching persona traits:', error);
    LoggingService.error({
      message: 'Failed to fetch persona traits',
      userId: user.id,
      module: 'personas',
      category: 'AGENT_ACTION',
      error,
    });
    throw new HttpError(500, 'Failed to fetch persona traits');
  }
});

/**
 * Get a trait by ID
 */
export const getTraitById = withErrorHandling(async (args: { id: string }, context: any) => {
  // Apply RBAC middleware - require 'personas:read' permission
  const user = await requirePermission({
    resource: 'personas',
    action: 'read',
    adminOverride: true,
    auditRejection: true,
  })(context);

  try {
    // Log the operation
    LoggingService.info({
      message: `Fetching persona trait with ID: ${args.id}`,
      userId: user.id,
      module: 'personas',
      category: 'AGENT_ACTION',
    });

    // Get the trait
    const trait = await prisma.personaTrait.findUnique({
      where: {
        id: args.id,
      },
      include: {
        personas: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!trait) {
      throw new HttpError(404, 'Trait not found');
    }

    // Check if user has access to the trait
    if (!trait.isPublic && trait.createdById !== user.id) {
      throw new HttpError(403, 'You do not have permission to access this trait');
    }

    // Apply field-level access control
    const filteredTrait = await applyFieldAccess(trait, user, 'personas', 'read');

    return filteredTrait;
  } catch (error) {
    console.error(`Error fetching persona trait with ID ${args.id}:`, error);
    LoggingService.error({
      message: `Failed to fetch persona trait with ID: ${args.id}`,
      userId: user.id,
      module: 'personas',
      category: 'AGENT_ACTION',
      error,
    });
    throw error instanceof HttpError ? error : new HttpError(500, 'Failed to fetch persona trait');
  }
});

/**
 * Create a new trait
 */
export const createTrait = withErrorHandling(async (args: Omit<PersonaTrait, 'id' | 'createdAt' | 'updatedAt' | 'createdById'>, context: any) => {
  // Apply RBAC middleware - require 'personas:create' permission
  const user = await requirePermission({
    resource: 'personas',
    action: 'create',
    adminOverride: true,
    auditRejection: true,
  })(context);

  // Validate input
  const validatedArgs = validateAndSanitize(args, createTraitSchema);

  try {
    // Log the operation
    LoggingService.info({
      message: 'Creating new persona trait',
      userId: user.id,
      module: 'personas',
      category: 'AGENT_ACTION',
      metadata: { traitName: validatedArgs.name },
    });

    // Create the trait
    const trait = await prisma.personaTrait.create({
      data: {
        name: validatedArgs.name,
        description: validatedArgs.description,
        category: validatedArgs.category,
        value: validatedArgs.value,
        isPublic: validatedArgs.isPublic || false,
        createdBy: {
          connect: { id: user.id },
        },
      },
    });

    // Apply field-level access control
    const filteredTrait = await applyFieldAccess(trait, user, 'personas', 'create');

    // Log successful creation
    LoggingService.info({
      message: 'Persona trait created successfully',
      userId: user.id,
      module: 'personas',
      category: 'AGENT_ACTION',
      metadata: { traitId: trait.id, traitName: trait.name },
    });

    return filteredTrait;
  } catch (error) {
    console.error('Error creating persona trait:', error);
    LoggingService.error({
      message: 'Failed to create persona trait',
      userId: user.id,
      module: 'personas',
      category: 'AGENT_ACTION',
      error,
    });
    throw error instanceof HttpError ? error : new HttpError(500, 'Failed to create persona trait');
  }
});

/**
 * Update a trait
 */
export const updateTrait = withErrorHandling(async (args: Partial<PersonaTrait> & { id: string }, context: any) => {
  // Apply RBAC middleware - require 'personas:update' permission
  const user = await requirePermission({
    resource: 'personas',
    action: 'update',
    adminOverride: true,
    auditRejection: true,
  })(context);

  // Validate input
  const validatedArgs = validateAndSanitize(args, updateTraitSchema);

  try {
    // Check if the trait exists and user has permission to update it
    const existingTrait = await prisma.personaTrait.findUnique({
      where: {
        id: validatedArgs.id,
      },
    });

    if (!existingTrait) {
      throw new HttpError(404, 'Trait not found');
    }

    // Check if user has permission to update the trait
    if (existingTrait.createdById !== user.id && user.role?.name !== 'admin') {
      throw new HttpError(403, 'You do not have permission to update this trait');
    }

    // Log the operation
    LoggingService.info({
      message: `Updating persona trait with ID: ${validatedArgs.id}`,
      userId: user.id,
      module: 'personas',
      category: 'AGENT_ACTION',
      metadata: { traitId: validatedArgs.id },
    });

    // Update the trait
    const trait = await prisma.personaTrait.update({
      where: {
        id: validatedArgs.id,
      },
      data: {
        ...(validatedArgs.name && { name: validatedArgs.name }),
        ...(validatedArgs.description && { description: validatedArgs.description }),
        ...(validatedArgs.category && { category: validatedArgs.category }),
        ...(validatedArgs.value && { value: validatedArgs.value }),
        ...(validatedArgs.isPublic !== undefined && { isPublic: validatedArgs.isPublic }),
      },
    });

    // Apply field-level access control
    const filteredTrait = await applyFieldAccess(trait, user, 'personas', 'update');

    // Log successful update
    LoggingService.info({
      message: 'Persona trait updated successfully',
      userId: user.id,
      module: 'personas',
      category: 'AGENT_ACTION',
      metadata: { traitId: validatedArgs.id },
    });

    return filteredTrait;
  } catch (error) {
    console.error(`Error updating persona trait with ID ${validatedArgs.id}:`, error);
    LoggingService.error({
      message: `Failed to update persona trait with ID: ${validatedArgs.id}`,
      userId: user.id,
      module: 'personas',
      category: 'AGENT_ACTION',
      error,
    });
    throw error instanceof HttpError ? error : new HttpError(500, 'Failed to update persona trait');
  }
});

/**
 * Delete a trait
 */
export const deleteTrait = withErrorHandling(async (args: { id: string }, context: any) => {
  // Apply RBAC middleware - require 'personas:delete' permission
  const user = await requirePermission({
    resource: 'personas',
    action: 'delete',
    adminOverride: true,
    auditRejection: true,
  })(context);

  try {
    // Check if the trait exists and user has permission to delete it
    const existingTrait = await prisma.personaTrait.findUnique({
      where: {
        id: args.id,
      },
      include: {
        personas: true,
      },
    });

    if (!existingTrait) {
      throw new HttpError(404, 'Trait not found');
    }

    // Check if user has permission to delete the trait
    if (existingTrait.createdById !== user.id && user.role?.name !== 'admin') {
      throw new HttpError(403, 'You do not have permission to delete this trait');
    }

    // Check if the trait is used by any personas
    if (existingTrait.personas.length > 0) {
      throw new HttpError(400, 'Cannot delete trait that is used by personas');
    }

    // Log the operation
    LoggingService.info({
      message: `Deleting persona trait with ID: ${args.id}`,
      userId: user.id,
      module: 'personas',
      category: 'AGENT_ACTION',
      metadata: { traitId: args.id },
    });

    // Delete the trait
    await prisma.personaTrait.delete({
      where: {
        id: args.id,
      },
    });

    // Log successful deletion
    LoggingService.info({
      message: 'Persona trait deleted successfully',
      userId: user.id,
      module: 'personas',
      category: 'AGENT_ACTION',
      metadata: { traitId: args.id },
    });

    return { success: true, id: args.id };
  } catch (error) {
    console.error(`Error deleting persona trait with ID ${args.id}:`, error);
    LoggingService.error({
      message: `Failed to delete persona trait with ID: ${args.id}`,
      userId: user.id,
      module: 'personas',
      category: 'AGENT_ACTION',
      error,
    });
    throw error instanceof HttpError ? error : new HttpError(500, 'Failed to delete persona trait');
  }
});