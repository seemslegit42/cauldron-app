/**
 * Permission Utilities for Client-Side Code
 * 
 * These utilities help check permissions on the client side
 * to conditionally render UI elements based on user permissions.
 */

import type { User } from 'wasp/entities';

// Types
export type ResourceAction = 'create' | 'read' | 'update' | 'delete' | 'manage' | 'execute' | string;
export type Resource = 'users' | 'organizations' | 'agents' | 'modules' | 'workflows' | 'system' | string;

/**
 * Check if a user has a specific permission based on their role
 * 
 * This is a client-side approximation and should not be relied on for security.
 * All actual permission checks must happen on the server.
 */
export function hasPermission(
  user: User | null | undefined,
  resource: Resource,
  action: ResourceAction
): boolean {
  if (!user) {
    return false;
  }
  
  // Admin users have all permissions
  if (user.isAdmin) {
    return true;
  }
  
  // Check role-based permissions
  if (user.role) {
    const roleName = user.role.name;
    
    // This is a simplified version - in a real app, you would fetch
    // the actual permissions from the server or include them in the user object
    
    // Admin role has all permissions
    if (roleName === 'Admin') {
      return true;
    }
    
    // Operator role permissions
    if (roleName === 'Operator') {
      // Operators can read most resources
      if (action === 'read') {
        return true;
      }
      
      // Operators can create, read, update, and execute agents
      if (resource === 'agents' && ['create', 'read', 'update', 'execute'].includes(action)) {
        return true;
      }
      
      // Operators can use modules
      if (resource === 'modules' && action === 'use') {
        return true;
      }
      
      // Operators can read system logs
      if (resource === 'system' && action === 'read_logs') {
        return true;
      }
    }
    
    // Agent role permissions
    if (roleName === 'Agent') {
      // Agents can read some resources
      if (action === 'read' && ['agents', 'modules'].includes(resource)) {
        return true;
      }
      
      // Agents can execute workflows
      if (resource === 'workflows' && action === 'execute') {
        return true;
      }
    }
  }
  
  // Default to false for any other case
  return false;
}

/**
 * Check if a user can access a specific organization
 */
export function canAccessOrganization(
  user: User | null | undefined,
  organizationId: string
): boolean {
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

/**
 * Check if a user owns a resource
 */
export function isResourceOwner(
  user: User | null | undefined,
  resourceUserId: string
): boolean {
  if (!user) {
    return false;
  }
  
  return user.id === resourceUserId;
}

/**
 * Check if a user can access a specific resource
 * 
 * This combines permission checking with ownership and organization access.
 */
export function canAccessResource(
  user: User | null | undefined,
  resource: Resource,
  action: ResourceAction,
  options?: {
    resourceUserId?: string;
    organizationId?: string;
  }
): boolean {
  if (!user) {
    return false;
  }
  
  // Admin users have full access
  if (user.isAdmin) {
    return true;
  }
  
  // Check basic permission first
  if (!hasPermission(user, resource, action)) {
    return false;
  }
  
  // If resource has an owner, check ownership
  if (options?.resourceUserId && options.resourceUserId !== user.id) {
    // Non-owners need specific permissions
    if (!hasPermission(user, resource, 'manage')) {
      return false;
    }
  }
  
  // If resource belongs to an organization, check organization access
  if (options?.organizationId && !canAccessOrganization(user, options.organizationId)) {
    return false;
  }
  
  return true;
}

/**
 * React hook to check permissions
 * 
 * Usage:
 * const canCreateUser = usePermission('users', 'create');
 * if (canCreateUser) {
 *   // Render create user button
 * }
 */
export function usePermission(
  resource: Resource,
  action: ResourceAction,
  options?: {
    resourceUserId?: string;
    organizationId?: string;
  }
): boolean {
  // In a real app, you would use a hook to get the current user
  // For example: const { data: user } = useAuth();
  const user = null; // Replace with actual user from auth context
  
  return canAccessResource(user, resource, action, options);
}
