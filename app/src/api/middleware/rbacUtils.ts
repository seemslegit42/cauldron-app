/**
 * RBAC Utility Functions
 * 
 * This file contains utility functions for common RBAC patterns and helpers.
 */

import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import type { User } from 'wasp/entities';
import { 
  requirePermission, 
  type Resource, 
  type ResourceAction, 
  type PermissionCondition,
  type FieldVisibility,
  applyFieldVisibility
} from './rbac';

/**
 * Middleware to require permission for a specific resource and action
 */
export function requireResourcePermission(
  resource: Resource, 
  action: ResourceAction,
  options: {
    adminOverride?: boolean;
    auditRejection?: boolean;
  } = {}
) {
  return requirePermission({
    resource,
    action,
    adminOverride: options.adminOverride !== false, // Default to true
    auditRejection: options.auditRejection !== false // Default to true
  });
}

/**
 * Middleware to require organization-specific permission
 */
export function requireOrganizationPermission(
  resource: Resource,
  action: ResourceAction,
  organizationId: string,
  options: {
    adminOverride?: boolean;
    auditRejection?: boolean;
  } = {}
) {
  return requirePermission({
    resource,
    action,
    organizationId,
    adminOverride: options.adminOverride !== false,
    auditRejection: options.auditRejection !== false
  });
}

/**
 * Middleware to require permission for a resource owned by a user
 */
export function requireOwnerPermission(
  resource: Resource,
  action: ResourceAction,
  resourceOwnerId: string,
  options: {
    adminOverride?: boolean;
    auditRejection?: boolean;
  } = {}
) {
  return requirePermission({
    resource,
    action,
    resourceOwnerId,
    adminOverride: options.adminOverride !== false,
    auditRejection: options.auditRejection !== false
  });
}

/**
 * Apply field-level access control based on user permissions
 * 
 * This function filters the data based on the user's permissions
 * and the field visibility rules for each permission level.
 */
export async function applyFieldLevelAccess<T>(
  data: T,
  user: User,
  resource: Resource,
  fieldVisibilityMap: Record<ResourceAction, FieldVisibility>
): Promise<Partial<T>> {
  // If no data or no field visibility map, return the data as is
  if (!data || !fieldVisibilityMap) {
    return data;
  }
  
  // Get all possible actions for this resource
  const actions = Object.keys(fieldVisibilityMap) as ResourceAction[];
  
  // Find the highest permission level the user has
  let highestPermissionAction: ResourceAction | null = null;
  
  // Check for manage permission first (highest level)
  if (await hasPermission(user.id, resource, 'manage')) {
    highestPermissionAction = 'manage';
  } else {
    // Check each action in order of precedence
    for (const action of actions) {
      if (await hasPermission(user.id, resource, action)) {
        highestPermissionAction = action;
        // We could break here, but we want to find the highest permission
      }
    }
  }
  
  // If no permission found, return empty object
  if (!highestPermissionAction) {
    return {};
  }
  
  // If manage permission, return all data
  if (highestPermissionAction === 'manage') {
    return data;
  }
  
  // Apply field visibility based on the highest permission level
  return applyFieldVisibility(data, fieldVisibilityMap[highestPermissionAction]);
}

/**
 * Check if user has permission for a resource and action
 */
export async function hasPermission(
  userId: string,
  resource: Resource,
  action: ResourceAction
): Promise<boolean> {
  try {
    // Get user with roles and permissions
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        },
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });
    
    if (!user) {
      return false;
    }
    
    // Admin users have all permissions
    if (user.isAdmin) {
      return true;
    }
    
    // Check role permissions
    const rolePermissions = user.role?.permissions.map(rp => rp.permission) || [];
    
    // Check direct user permissions
    const userPermissions = user.permissions.map(up => up.permission);
    
    // Combine all permissions
    const allPermissions = [...rolePermissions, ...userPermissions];
    
    // Check for exact permission match
    const exactMatch = allPermissions.some(p => 
      p.resource === resource && p.action === action
    );
    
    if (exactMatch) {
      return true;
    }
    
    // Check for wildcard permissions
    const wildcardMatch = allPermissions.some(p => 
      (p.resource === resource && p.action === '*') || 
      (p.resource === '*' && p.action === action) || 
      (p.resource === '*' && p.action === '*')
    );
    
    if (wildcardMatch) {
      return true;
    }
    
    // Check for manage permission (implies all actions)
    const manageMatch = allPermissions.some(p => 
      p.resource === resource && p.action === 'manage'
    );
    
    return manageMatch;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

/**
 * Filter a list of items based on user permissions
 * 
 * This is useful for filtering lists of resources where the user
 * might have access to some items but not others.
 */
export async function filterByPermission<T extends { id: string; organizationId?: string; userId?: string }>(
  items: T[],
  user: User,
  resource: Resource,
  action: ResourceAction
): Promise<T[]> {
  // Admin users can access all items
  if (user.isAdmin) {
    return items;
  }
  
  // Check if user has global permission for this resource and action
  const hasGlobalPermission = await hasPermission(user.id, resource, action);
  
  if (hasGlobalPermission) {
    // For global permission, filter by organization if applicable
    return items.filter(item => 
      !item.organizationId || item.organizationId === user.organizationId
    );
  }
  
  // Otherwise, only return items owned by the user
  return items.filter(item => item.userId === user.id);
}

/**
 * Check if a user can access a specific organization
 */
export async function canAccessOrganization(
  userId: string,
  organizationId: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { 
      isAdmin: true,
      organizationId: true
    }
  });
  
  if (!user) {
    return false;
  }
  
  // Admin users can access all organizations
  if (user.isAdmin) {
    return true;
  }
  
  // Users can access their own organization
  return user.organizationId === organizationId;
}
