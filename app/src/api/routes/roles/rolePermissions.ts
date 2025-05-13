/**
 * API routes for role permission management
 */

import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import { withErrorHandling } from '../../middleware';
import { validateRequest } from '../../middleware/validation';
import { requirePermission } from '../../middleware/rbac';
import { z } from 'zod';

// Validation schemas
const rolePermissionSchema = z.object({
  roleId: z.string().uuid(),
  permissionId: z.string().uuid()
});

/**
 * Get all permissions
 */
export const getPermissions = withErrorHandling(async (_args, context) => {
  // Apply RBAC middleware - require 'system:admin' permission
  await requirePermission({
    resource: 'system',
    action: 'admin',
    adminOverride: true,
    auditRejection: true
  })(context);
  
  // Get all permissions
  const permissions = await prisma.permission.findMany({
    orderBy: [
      { resource: 'asc' },
      { action: 'asc' }
    ]
  });
  
  return permissions;
});

/**
 * Assign a permission to a role
 */
export const assignPermissionToRole = withErrorHandling(async (args, context) => {
  // Validate arguments
  const validatedArgs = validateRequest(args, rolePermissionSchema);
  
  // Apply RBAC middleware - require 'system:admin' permission
  await requirePermission({
    resource: 'system',
    action: 'admin',
    adminOverride: true,
    auditRejection: true
  })(context);
  
  // Get the role
  const role = await prisma.role.findUnique({
    where: { id: validatedArgs.roleId }
  });
  
  if (!role) {
    throw new HttpError(404, 'Role not found');
  }
  
  // Prevent modification of system roles
  if (role.isSystem) {
    throw new HttpError(403, 'System roles cannot be modified');
  }
  
  // Get the permission
  const permission = await prisma.permission.findUnique({
    where: { id: validatedArgs.permissionId }
  });
  
  if (!permission) {
    throw new HttpError(404, 'Permission not found');
  }
  
  // Check if permission is already assigned to role
  const existingAssignment = await prisma.rolePermission.findUnique({
    where: {
      roleId_permissionId: {
        roleId: validatedArgs.roleId,
        permissionId: validatedArgs.permissionId
      }
    }
  });
  
  if (existingAssignment) {
    // Permission already assigned, no need to do anything
    return { success: true };
  }
  
  // Assign permission to role
  await prisma.rolePermission.create({
    data: {
      roleId: validatedArgs.roleId,
      permissionId: validatedArgs.permissionId
    }
  });
  
  // Clear permission cache for users with this role
  // This would be implemented in a real system to ensure permission changes take effect immediately
  
  return { success: true };
});

/**
 * Remove a permission from a role
 */
export const removePermissionFromRole = withErrorHandling(async (args, context) => {
  // Validate arguments
  const validatedArgs = validateRequest(args, rolePermissionSchema);
  
  // Apply RBAC middleware - require 'system:admin' permission
  await requirePermission({
    resource: 'system',
    action: 'admin',
    adminOverride: true,
    auditRejection: true
  })(context);
  
  // Get the role
  const role = await prisma.role.findUnique({
    where: { id: validatedArgs.roleId }
  });
  
  if (!role) {
    throw new HttpError(404, 'Role not found');
  }
  
  // Prevent modification of system roles
  if (role.isSystem) {
    throw new HttpError(403, 'System roles cannot be modified');
  }
  
  // Check if permission is assigned to role
  const existingAssignment = await prisma.rolePermission.findUnique({
    where: {
      roleId_permissionId: {
        roleId: validatedArgs.roleId,
        permissionId: validatedArgs.permissionId
      }
    }
  });
  
  if (!existingAssignment) {
    // Permission not assigned, no need to do anything
    return { success: true };
  }
  
  // Remove permission from role
  await prisma.rolePermission.delete({
    where: {
      roleId_permissionId: {
        roleId: validatedArgs.roleId,
        permissionId: validatedArgs.permissionId
      }
    }
  });
  
  // Clear permission cache for users with this role
  // This would be implemented in a real system to ensure permission changes take effect immediately
  
  return { success: true };
});
