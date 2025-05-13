/**
 * API routes for role management
 */

import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import { withErrorHandling } from '../../middleware';
import { validateRequest } from '../../middleware/validation';
import { requirePermission } from '../../middleware/rbac';
import { z } from 'zod';

// Validation schemas
const roleIdSchema = z.object({
  id: z.string().uuid()
});

const createRoleSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(200).optional(),
  isDefault: z.boolean().default(false)
});

const updateRoleSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(50).optional(),
  description: z.string().max(200).optional(),
  isDefault: z.boolean().optional()
});

/**
 * Get all roles
 */
export const getRoles = withErrorHandling(async (_args, context) => {
  // Apply RBAC middleware - require 'system:admin' permission
  await requirePermission({
    resource: 'system',
    action: 'admin',
    adminOverride: true,
    auditRejection: true
  })(context);
  
  // Get all roles with their permissions
  const roles = await prisma.role.findMany({
    include: {
      permissions: {
        include: {
          permission: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  });
  
  return roles;
});

/**
 * Get a single role by ID
 */
export const getRole = withErrorHandling(async (args, context) => {
  // Validate arguments
  const validatedArgs = validateRequest(args, roleIdSchema);
  
  // Apply RBAC middleware - require 'system:admin' permission
  await requirePermission({
    resource: 'system',
    action: 'admin',
    adminOverride: true,
    auditRejection: true
  })(context);
  
  // Get the role
  const role = await prisma.role.findUnique({
    where: { id: validatedArgs.id },
    include: {
      permissions: {
        include: {
          permission: true
        }
      }
    }
  });
  
  if (!role) {
    throw new HttpError(404, 'Role not found');
  }
  
  return role;
});

/**
 * Create a new role
 */
export const createRole = withErrorHandling(async (args, context) => {
  // Validate arguments
  const validatedArgs = validateRequest(args, createRoleSchema);
  
  // Apply RBAC middleware - require 'system:admin' permission
  await requirePermission({
    resource: 'system',
    action: 'admin',
    adminOverride: true,
    auditRejection: true
  })(context);
  
  // Check if role with same name already exists
  const existingRole = await prisma.role.findUnique({
    where: { name: validatedArgs.name }
  });
  
  if (existingRole) {
    throw new HttpError(400, 'A role with this name already exists');
  }
  
  // If this is set as default, unset any existing default role
  if (validatedArgs.isDefault) {
    await prisma.role.updateMany({
      where: { isDefault: true },
      data: { isDefault: false }
    });
  }
  
  // Create the role
  const role = await prisma.role.create({
    data: {
      name: validatedArgs.name,
      description: validatedArgs.description,
      isDefault: validatedArgs.isDefault,
      isSystem: false // User-created roles are never system roles
    }
  });
  
  return role;
});

/**
 * Update an existing role
 */
export const updateRole = withErrorHandling(async (args, context) => {
  // Validate arguments
  const validatedArgs = validateRequest(args, updateRoleSchema);
  
  // Apply RBAC middleware - require 'system:admin' permission
  await requirePermission({
    resource: 'system',
    action: 'admin',
    adminOverride: true,
    auditRejection: true
  })(context);
  
  // Get the role
  const role = await prisma.role.findUnique({
    where: { id: validatedArgs.id }
  });
  
  if (!role) {
    throw new HttpError(404, 'Role not found');
  }
  
  // Prevent modification of system roles
  if (role.isSystem) {
    throw new HttpError(403, 'System roles cannot be modified');
  }
  
  // Check if name is being changed and if it conflicts
  if (validatedArgs.name && validatedArgs.name !== role.name) {
    const existingRole = await prisma.role.findUnique({
      where: { name: validatedArgs.name }
    });
    
    if (existingRole) {
      throw new HttpError(400, 'A role with this name already exists');
    }
  }
  
  // If this is set as default, unset any existing default role
  if (validatedArgs.isDefault === true) {
    await prisma.role.updateMany({
      where: { 
        isDefault: true,
        id: { not: validatedArgs.id }
      },
      data: { isDefault: false }
    });
  }
  
  // Update the role
  const updatedRole = await prisma.role.update({
    where: { id: validatedArgs.id },
    data: {
      name: validatedArgs.name,
      description: validatedArgs.description,
      isDefault: validatedArgs.isDefault
    }
  });
  
  return updatedRole;
});

/**
 * Delete a role
 */
export const deleteRole = withErrorHandling(async (args, context) => {
  // Validate arguments
  const validatedArgs = validateRequest(args, roleIdSchema);
  
  // Apply RBAC middleware - require 'system:admin' permission
  await requirePermission({
    resource: 'system',
    action: 'admin',
    adminOverride: true,
    auditRejection: true
  })(context);
  
  // Get the role
  const role = await prisma.role.findUnique({
    where: { id: validatedArgs.id },
    include: {
      users: {
        select: { id: true }
      }
    }
  });
  
  if (!role) {
    throw new HttpError(404, 'Role not found');
  }
  
  // Prevent deletion of system roles
  if (role.isSystem) {
    throw new HttpError(403, 'System roles cannot be deleted');
  }
  
  // Check if role is assigned to users
  if (role.users.length > 0) {
    throw new HttpError(400, 'Cannot delete a role that is assigned to users');
  }
  
  // Delete the role
  await prisma.role.delete({
    where: { id: validatedArgs.id }
  });
  
  return { success: true };
});
