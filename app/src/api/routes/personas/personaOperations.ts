/**
 * API operations for agent personas
 */

import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import { z } from 'zod';
import { withErrorHandling } from '@src/api/middleware/errorHandling';
import { requirePermission } from '@src/api/middleware/rbac';
import { validateAndSanitize } from '@src/api/middleware/validation';
import { LoggingService } from '@src/shared/services/loggingService';
import { sentientCheckpoints } from '@src/shared/services/sentientCheckpoints';
import { applyFieldAccess } from '@src/api/middleware/fieldAccess';
import type {
  AgentPersona,
  PersonaTrait,
  PersonaMemoryScope,
  CreatePersonaInput,
  UpdatePersonaInput,
  ForkPersonaInput
} from '@src/shared/types/entities/agentPersona';

// Schema for creating a persona
const createPersonaSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  role: z.string().min(1, 'Role is required'),
  category: z.string().min(1, 'Category is required'),
  systemPrompt: z.string().min(1, 'System prompt is required'),
  isPublic: z.boolean().optional().default(false),
  organizationId: z.string().optional(),
  forkedFromId: z.string().optional(),
  traitIds: z.array(z.string()).optional(),
  memoryScopes: z.array(z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().min(1, 'Description is required'),
    scope: z.string().min(1, 'Scope is required'),
    retention: z.string().min(1, 'Retention is required'),
    priority: z.number().min(1).max(10).optional().default(1),
  })).optional(),
});

// Schema for updating a persona
const updatePersonaSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  role: z.string().min(1, 'Role is required').optional(),
  category: z.string().min(1, 'Category is required').optional(),
  systemPrompt: z.string().min(1, 'System prompt is required').optional(),
  isPublic: z.boolean().optional(),
  traitIds: z.array(z.string()).optional(),
  memoryScopes: z.array(z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Name is required').optional(),
    description: z.string().min(1, 'Description is required').optional(),
    scope: z.string().min(1, 'Scope is required').optional(),
    retention: z.string().min(1, 'Retention is required').optional(),
    priority: z.number().min(1).max(10).optional(),
  })).optional(),
});

// Schema for forking a persona
const forkPersonaSchema = z.object({
  personaId: z.string().min(1, 'Persona ID is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  isPublic: z.boolean().optional().default(false),
  organizationId: z.string().optional(),
});

/**
 * Get all personas
 */
export const getPersonas = withErrorHandling(async (args: any, context: any) => {
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
      message: 'Fetching personas',
      userId: user.id,
      module: 'personas',
      category: 'AGENT_ACTION',
    });

    // Get all public personas and user's own personas
    const personas = await prisma.agentPersona.findMany({
      where: {
        OR: [
          { isPublic: true },
          { createdById: user.id },
          { organizationId: user.organizationId },
        ],
      },
      include: {
        traits: true,
        memoryScopes: true,
        forkedFrom: {
          select: {
            id: true,
            name: true,
            createdById: true,
          },
        },
        _count: {
          select: {
            forks: true,
            agents: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Apply field-level access control
    const filteredPersonas = await Promise.all(
      personas.map(persona => applyFieldAccess(persona, user, 'personas', 'read'))
    );

    return filteredPersonas;
  } catch (error) {
    console.error('Error fetching personas:', error);
    LoggingService.error({
      message: 'Failed to fetch personas',
      userId: user.id,
      module: 'personas',
      category: 'AGENT_ACTION',
      error,
    });
    throw new HttpError(500, 'Failed to fetch personas');
  }
});

/**
 * Get a persona by ID
 */
export const getPersonaById = withErrorHandling(async (args: { id: string }, context: any) => {
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
      message: `Fetching persona with ID: ${args.id}`,
      userId: user.id,
      module: 'personas',
      category: 'AGENT_ACTION',
    });

    // Get the persona
    const persona = await prisma.agentPersona.findUnique({
      where: {
        id: args.id,
      },
      include: {
        traits: true,
        memoryScopes: true,
        forkedFrom: {
          select: {
            id: true,
            name: true,
            createdById: true,
          },
        },
        forks: {
          select: {
            id: true,
            name: true,
            createdById: true,
          },
        },
        agents: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!persona) {
      throw new HttpError(404, 'Persona not found');
    }

    // Check if user has access to the persona
    if (!persona.isPublic && persona.createdById !== user.id && persona.organizationId !== user.organizationId) {
      throw new HttpError(403, 'You do not have permission to access this persona');
    }

    // Apply field-level access control
    const filteredPersona = await applyFieldAccess(persona, user, 'personas', 'read');

    return filteredPersona;
  } catch (error) {
    console.error(`Error fetching persona with ID ${args.id}:`, error);
    LoggingService.error({
      message: `Failed to fetch persona with ID: ${args.id}`,
      userId: user.id,
      module: 'personas',
      category: 'AGENT_ACTION',
      error,
    });
    throw error instanceof HttpError ? error : new HttpError(500, 'Failed to fetch persona');
  }
});

/**
 * Create a new persona
 */
export const createPersona = withErrorHandling(async (args: CreatePersonaInput, context: any) => {
  // Apply RBAC middleware - require 'personas:create' permission
  const user = await requirePermission({
    resource: 'personas',
    action: 'create',
    adminOverride: true,
    auditRejection: true,
  })(context);

  // Validate input
  const validatedArgs = validateAndSanitize(args, createPersonaSchema);

  try {
    // Log the operation
    LoggingService.info({
      message: 'Creating new persona',
      userId: user.id,
      module: 'personas',
      category: 'AGENT_ACTION',
      metadata: { personaName: validatedArgs.name },
    });

    // Apply Sentient Loop™ checkpoint for persona creation
    await sentientCheckpoints.validateAgentCreation({
      agentConfig: validatedArgs,
      metadata: {
        scope: 'persona',
        module: 'personas',
        owner: user.id,
      },
      user,
    });

    // Create the persona
    const persona = await prisma.agentPersona.create({
      data: {
        name: validatedArgs.name,
        description: validatedArgs.description,
        role: validatedArgs.role,
        category: validatedArgs.category,
        systemPrompt: validatedArgs.systemPrompt,
        isPublic: validatedArgs.isPublic || false,
        createdBy: {
          connect: { id: user.id },
        },
        ...(validatedArgs.organizationId && {
          organization: {
            connect: { id: validatedArgs.organizationId },
          },
        }),
        ...(validatedArgs.forkedFromId && {
          forkedFrom: {
            connect: { id: validatedArgs.forkedFromId },
          },
        }),
        ...(validatedArgs.traitIds && validatedArgs.traitIds.length > 0 && {
          traits: {
            connect: validatedArgs.traitIds.map(id => ({ id })),
          },
        }),
      },
    });

    // Create memory scopes if provided
    if (validatedArgs.memoryScopes && validatedArgs.memoryScopes.length > 0) {
      await prisma.personaMemoryScope.createMany({
        data: validatedArgs.memoryScopes.map(scope => ({
          name: scope.name,
          description: scope.description,
          scope: scope.scope,
          retention: scope.retention,
          priority: scope.priority || 1,
          personaId: persona.id,
        })),
      });
    }

    // Get the created persona with all relations
    const createdPersona = await prisma.agentPersona.findUnique({
      where: {
        id: persona.id,
      },
      include: {
        traits: true,
        memoryScopes: true,
        forkedFrom: {
          select: {
            id: true,
            name: true,
            createdById: true,
          },
        },
      },
    });

    // Apply field-level access control
    const filteredPersona = await applyFieldAccess(createdPersona, user, 'personas', 'create');

    // Log successful creation
    LoggingService.info({
      message: 'Persona created successfully',
      userId: user.id,
      module: 'personas',
      category: 'AGENT_ACTION',
      metadata: { personaId: persona.id, personaName: persona.name },
    });

    return filteredPersona;
  } catch (error) {
    console.error('Error creating persona:', error);
    LoggingService.error({
      message: 'Failed to create persona',
      userId: user.id,
      module: 'personas',
      category: 'AGENT_ACTION',
      error,
    });
    throw error instanceof HttpError ? error : new HttpError(500, 'Failed to create persona');
  }
});

/**
 * Update a persona
 */
export const updatePersona = withErrorHandling(async (args: UpdatePersonaInput, context: any) => {
  // Apply RBAC middleware - require 'personas:update' permission
  const user = await requirePermission({
    resource: 'personas',
    action: 'update',
    adminOverride: true,
    auditRejection: true,
  })(context);

  // Validate input
  const validatedArgs = validateAndSanitize(args, updatePersonaSchema);

  try {
    // Check if the persona exists and user has permission to update it
    const existingPersona = await prisma.agentPersona.findUnique({
      where: {
        id: validatedArgs.id,
      },
    });

    if (!existingPersona) {
      throw new HttpError(404, 'Persona not found');
    }

    // Check if user has permission to update the persona
    if (existingPersona.createdById !== user.id && user.role?.name !== 'admin') {
      throw new HttpError(403, 'You do not have permission to update this persona');
    }

    // Log the operation
    LoggingService.info({
      message: `Updating persona with ID: ${validatedArgs.id}`,
      userId: user.id,
      module: 'personas',
      category: 'AGENT_ACTION',
      metadata: { personaId: validatedArgs.id },
    });

    // Update the persona
    const updatedPersona = await prisma.agentPersona.update({
      where: {
        id: validatedArgs.id,
      },
      data: {
        ...(validatedArgs.name && { name: validatedArgs.name }),
        ...(validatedArgs.description && { description: validatedArgs.description }),
        ...(validatedArgs.role && { role: validatedArgs.role }),
        ...(validatedArgs.category && { category: validatedArgs.category }),
        ...(validatedArgs.systemPrompt && { systemPrompt: validatedArgs.systemPrompt }),
        ...(validatedArgs.isPublic !== undefined && { isPublic: validatedArgs.isPublic }),
        ...(validatedArgs.traitIds && {
          traits: {
            set: validatedArgs.traitIds.map(id => ({ id })),
          },
        }),
      },
    });

    // Update memory scopes if provided
    if (validatedArgs.memoryScopes && validatedArgs.memoryScopes.length > 0) {
      // Handle each memory scope
      for (const scope of validatedArgs.memoryScopes) {
        if (scope.id) {
          // Update existing memory scope
          await prisma.personaMemoryScope.update({
            where: {
              id: scope.id,
            },
            data: {
              ...(scope.name && { name: scope.name }),
              ...(scope.description && { description: scope.description }),
              ...(scope.scope && { scope: scope.scope }),
              ...(scope.retention && { retention: scope.retention }),
              ...(scope.priority && { priority: scope.priority }),
            },
          });
        } else {
          // Create new memory scope
          await prisma.personaMemoryScope.create({
            data: {
              name: scope.name,
              description: scope.description,
              scope: scope.scope,
              retention: scope.retention,
              priority: scope.priority || 1,
              personaId: validatedArgs.id,
            },
          });
        }
      }
    }

    // Get the updated persona with all relations
    const persona = await prisma.agentPersona.findUnique({
      where: {
        id: validatedArgs.id,
      },
      include: {
        traits: true,
        memoryScopes: true,
        forkedFrom: {
          select: {
            id: true,
            name: true,
            createdById: true,
          },
        },
      },
    });

    // Apply field-level access control
    const filteredPersona = await applyFieldAccess(persona, user, 'personas', 'update');

    // Log successful update
    LoggingService.info({
      message: 'Persona updated successfully',
      userId: user.id,
      module: 'personas',
      category: 'AGENT_ACTION',
      metadata: { personaId: validatedArgs.id },
    });

    return filteredPersona;
  } catch (error) {
    console.error(`Error updating persona with ID ${validatedArgs.id}:`, error);
    LoggingService.error({
      message: `Failed to update persona with ID: ${validatedArgs.id}`,
      userId: user.id,
      module: 'personas',
      category: 'AGENT_ACTION',
      error,
    });
    throw error instanceof HttpError ? error : new HttpError(500, 'Failed to update persona');
  }
});

/**
 * Fork a persona
 */
export const forkPersona = withErrorHandling(async (args: ForkPersonaInput, context: any) => {
  // Apply RBAC middleware - require 'personas:create' permission
  const user = await requirePermission({
    resource: 'personas',
    action: 'create',
    adminOverride: true,
    auditRejection: true,
  })(context);

  // Validate input
  const validatedArgs = validateAndSanitize(args, forkPersonaSchema);

  try {
    // Check if the source persona exists
    const sourcePersona = await prisma.agentPersona.findUnique({
      where: {
        id: validatedArgs.personaId,
      },
      include: {
        traits: true,
        memoryScopes: true,
      },
    });

    if (!sourcePersona) {
      throw new HttpError(404, 'Source persona not found');
    }

    // Check if user has permission to fork the persona
    if (!sourcePersona.isPublic && sourcePersona.createdById !== user.id && sourcePersona.organizationId !== user.organizationId) {
      throw new HttpError(403, 'You do not have permission to fork this persona');
    }

    // Log the operation
    LoggingService.info({
      message: `Forking persona with ID: ${validatedArgs.personaId}`,
      userId: user.id,
      module: 'personas',
      category: 'AGENT_ACTION',
      metadata: { sourcePersonaId: validatedArgs.personaId, newName: validatedArgs.name },
    });

    // Create the forked persona
    const forkedPersona = await prisma.agentPersona.create({
      data: {
        name: validatedArgs.name,
        description: validatedArgs.description || `Fork of ${sourcePersona.name}`,
        role: sourcePersona.role,
        category: sourcePersona.category,
        systemPrompt: sourcePersona.systemPrompt,
        isPublic: validatedArgs.isPublic || false,
        createdBy: {
          connect: { id: user.id },
        },
        forkedFrom: {
          connect: { id: sourcePersona.id },
        },
        ...(validatedArgs.organizationId && {
          organization: {
            connect: { id: validatedArgs.organizationId },
          },
        }),
        traits: {
          connect: sourcePersona.traits.map(trait => ({ id: trait.id })),
        },
      },
    });

    // Copy memory scopes
    if (sourcePersona.memoryScopes.length > 0) {
      await prisma.personaMemoryScope.createMany({
        data: sourcePersona.memoryScopes.map(scope => ({
          name: scope.name,
          description: scope.description,
          scope: scope.scope,
          retention: scope.retention,
          priority: scope.priority,
          personaId: forkedPersona.id,
        })),
      });
    }

    // Get the forked persona with all relations
    const persona = await prisma.agentPersona.findUnique({
      where: {
        id: forkedPersona.id,
      },
      include: {
        traits: true,
        memoryScopes: true,
        forkedFrom: {
          select: {
            id: true,
            name: true,
            createdById: true,
          },
        },
      },
    });

    // Apply field-level access control
    const filteredPersona = await applyFieldAccess(persona, user, 'personas', 'create');

    // Log successful fork
    LoggingService.info({
      message: 'Persona forked successfully',
      userId: user.id,
      module: 'personas',
      category: 'AGENT_ACTION',
      metadata: { sourcePersonaId: validatedArgs.personaId, newPersonaId: forkedPersona.id },
    });

    return filteredPersona;
  } catch (error) {
    console.error(`Error forking persona with ID ${validatedArgs.personaId}:`, error);
    LoggingService.error({
      message: `Failed to fork persona with ID: ${validatedArgs.personaId}`,
      userId: user.id,
      module: 'personas',
      category: 'AGENT_ACTION',
      error,
    });
    throw error instanceof HttpError ? error : new HttpError(500, 'Failed to fork persona');
  }
});