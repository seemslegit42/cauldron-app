/**
 * Role-Based Access Control (RBAC) Middleware
 *
 * This middleware provides dynamic permission checking based on user roles and permissions.
 * It supports:
 * - Resource-level permissions
 * - Action-level permissions
 * - Field-level visibility control
 * - Organization/multi-tenancy aware permissions
 * - Admin overrides
 * - Audit logging for rejections
 */

import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import type { User } from 'wasp/entities';
import { LoggingService } from '../../shared/services/logging';
import { authenticate } from './auth';

// Types
export type ResourceAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'manage'
  | 'execute'
  | 'use'
  | 'view'
  | 'configure'
  | 'analyze'
  | 'scan'
  | 'monitor'
  | 'design'
  | 'deploy'
  | 'admin'
  | string;
export type Resource =
  | 'users'
  | 'organizations'
  | 'agents'
  | 'modules'
  | 'workflows'
  | 'system'
  // Module-specific resources
  | 'arcana'
  | 'phantom'
  | 'forgeflow'
  | 'obelisk'
  | 'athena'
  | 'sentinel'
  | 'manifold'
  | 'cauldron-prime'
  // Sub-resources for modules
  | 'security-scans'
  | 'threat-intelligence'
  | 'domain-clones'
  | 'osint-sources'
  | 'osint-findings'
  | 'workflow-templates'
  | 'agent-templates'
  | 'business-metrics'
  | 'revenue-streams'
  | 'analytics-reports'
  | string;

export interface PermissionCondition {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'exists';
  value: any;
}

export interface FieldVisibility {
  include?: string[]; // Fields to include (if empty, include all except excluded)
  exclude?: string[]; // Fields to exclude
}

export interface RBACOptions {
  resource: Resource;
  action: ResourceAction;
  conditions?: PermissionCondition[];
  organizationId?: string;
  resourceOwnerId?: string;
  fieldVisibility?: FieldVisibility;
  adminOverride?: boolean;
  auditRejection?: boolean;
}

/**
 * Permission Cache Implementation
 *
 * This cache reduces database queries by storing user permissions in memory.
 * It includes TTL (time-to-live) functionality to ensure permissions are refreshed periodically.
 */

interface CacheEntry {
  permissions: Record<string, boolean>;
  timestamp: number;
  expiresAt: number;
}

/**
 * Cache for user permissions to reduce database queries
 * Format: { userId: { permissions: { permissionName: true }, timestamp: number, expiresAt: number } }
 */
const permissionCache: Record<string, CacheEntry> = {};

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
const CACHE_CLEANUP_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds

/**
 * Clear permission cache for a user
 */
export function clearPermissionCache(userId: string): void {
  delete permissionCache[userId];
}

/**
 * Clear all expired cache entries
 */
function cleanupExpiredCache(): void {
  const now = Date.now();

  for (const userId in permissionCache) {
    if (permissionCache[userId].expiresAt < now) {
      delete permissionCache[userId];
    }
  }
}

/**
 * Clear permission cache for all users
 */
export function clearAllPermissionCache(): void {
  for (const userId in permissionCache) {
    delete permissionCache[userId];
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
} {
  return {
    size: Object.keys(permissionCache).length,
    hits: cacheHits,
    misses: cacheMisses,
    hitRate: cacheHits / (cacheHits + cacheMisses || 1),
  };
}

// Set up periodic cache cleanup
setInterval(cleanupExpiredCache, CACHE_CLEANUP_INTERVAL);

// Cache metrics
let cacheHits = 0;
let cacheMisses = 0;

/**
 * Get user's permissions from database or cache
 */
async function getUserPermissions(userId: string): Promise<string[]> {
  const now = Date.now();

  // Check cache first
  if (permissionCache[userId] && permissionCache[userId].expiresAt > now) {
    cacheHits++;
    return Object.keys(permissionCache[userId].permissions);
  }

  cacheMisses++;

  try {
    // Get user with roles and direct permissions
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!user) {
      return [];
    }

    // Collect permissions from roles
    const rolePermissions = user.role?.permissions.map((rp: any) => rp.permission.name) || [];

    // Collect direct user permissions
    const userPermissions = user.permissions.map((up: any) => up.permission.name);

    // Combine and deduplicate permissions
    const allPermissions = [...new Set([...rolePermissions, ...userPermissions])];

    // Cache the permissions with TTL
    const permissionsObj = allPermissions.reduce(
      (acc, perm) => {
        acc[perm] = true;
        return acc;
      },
      {} as Record<string, boolean>
    );

    permissionCache[userId] = {
      permissions: permissionsObj,
      timestamp: now,
      expiresAt: now + CACHE_TTL,
    };

    return allPermissions;
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
}

/**
 * Check if user has a specific permission
 */
export async function hasPermission(
  userId: string,
  resource: Resource,
  action: ResourceAction
): Promise<boolean> {
  const permissionName = `${resource}:${action}`;
  const now = Date.now();

  // Check cache first
  if (permissionCache[userId] && permissionCache[userId].expiresAt > now) {
    cacheHits++;
    return (
      !!permissionCache[userId].permissions[permissionName] ||
      !!permissionCache[userId].permissions[`${resource}:*`] ||
      !!permissionCache[userId].permissions[`*:${action}`] ||
      !!permissionCache[userId].permissions['*:*'] ||
      !!permissionCache[userId].permissions[`${resource}:manage`]
    );
  }

  cacheMisses++;

  const permissions = await getUserPermissions(userId);

  // Check for exact permission match
  const hasExactPermission = permissions.includes(permissionName);

  // Check for wildcard permissions (resource:* or *:action)
  const hasResourceWildcard = permissions.includes(`${resource}:*`);
  const hasActionWildcard = permissions.includes(`*:${action}`);
  const hasFullWildcard = permissions.includes('*:*');

  // Check for manage permission (implies all actions on resource)
  const hasManagePermission = permissions.includes(`${resource}:manage`);

  return (
    hasExactPermission ||
    hasResourceWildcard ||
    hasActionWildcard ||
    hasFullWildcard ||
    hasManagePermission
  );
}

/**
 * Check if conditions are met for a permission
 */
function checkConditions(conditions: PermissionCondition[], data: any): boolean {
  if (!conditions || conditions.length === 0) {
    return true;
  }

  return conditions.every((condition) => {
    const { field, operator, value } = condition;
    const fieldValue = field.split('.').reduce((obj, key) => obj && obj[key], data);

    switch (operator) {
      case 'eq':
        return fieldValue === value;
      case 'neq':
        return fieldValue !== value;
      case 'gt':
        return fieldValue > value;
      case 'gte':
        return fieldValue >= value;
      case 'lt':
        return fieldValue < value;
      case 'lte':
        return fieldValue <= value;
      case 'in':
        return Array.isArray(value) && value.includes(fieldValue);
      case 'nin':
        return Array.isArray(value) && !value.includes(fieldValue);
      case 'exists':
        return value ? fieldValue !== undefined : fieldValue === undefined;
      default:
        return false;
    }
  });
}

/**
 * Check if user belongs to an organization
 */
async function isUserInOrganization(userId: string, organizationId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { organizationId: true },
  });

  return user?.organizationId === organizationId;
}

/**
 * Apply field-level visibility to data
 */
export function applyFieldVisibility<T>(data: T, fieldVisibility?: FieldVisibility): Partial<T> {
  if (!fieldVisibility || (!fieldVisibility.include && !fieldVisibility.exclude)) {
    return data;
  }

  const result = { ...data } as any;

  if (fieldVisibility.exclude && fieldVisibility.exclude.length > 0) {
    for (const field of fieldVisibility.exclude) {
      delete result[field];
    }
  }

  if (fieldVisibility.include && fieldVisibility.include.length > 0) {
    for (const key of Object.keys(result)) {
      if (!fieldVisibility.include.includes(key)) {
        delete result[key];
      }
    }
  }

  return result;
}

/**
 * Log permission rejection
 */
async function logPermissionRejection(user: User, options: RBACOptions, req?: any): Promise<void> {
  try {
    await LoggingService.logSystemEvent({
      message: `Permission denied: ${options.resource}:${options.action}`,
      level: 'WARN',
      category: 'AUTHORIZATION',
      source: 'rbac-middleware',
      userId: user.id,
      organizationId: user.organizationId,
      traceId: req?.headers?.['x-trace-id'],
      tags: ['rbac', 'permission-denied', options.resource, options.action],
      metadata: {
        resource: options.resource,
        action: options.action,
        conditions: options.conditions,
        organizationId: options.organizationId,
        resourceOwnerId: options.resourceOwnerId,
        userRole: user.role?.name,
        path: req?.originalUrl || req?.url,
      },
    });
  } catch (error) {
    console.error('Failed to log permission rejection:', error);
  }
}

/**
 * Main RBAC middleware function
 */
export function requirePermission(options: RBACOptions) {
  return async (context: { user?: User; req?: any }) => {
    const user = authenticate(context);

    // Admin override check
    if (options.adminOverride && user.isAdmin) {
      return user;
    }

    // Organization check
    if (options.organizationId && user.organizationId !== options.organizationId) {
      const isInOrg = await isUserInOrganization(user.id, options.organizationId);
      if (!isInOrg) {
        if (options.auditRejection) {
          await logPermissionRejection(user, options, context.req);
        }
        throw new HttpError(403, 'You do not have access to this organization');
      }
    }

    // Resource owner check
    if (options.resourceOwnerId && options.resourceOwnerId !== user.id && !user.isAdmin) {
      if (options.auditRejection) {
        await logPermissionRejection(user, options, context.req);
      }
      throw new HttpError(403, 'You do not have permission to access this resource');
    }

    // Permission check
    const hasRequiredPermission = await hasPermission(user.id, options.resource, options.action);

    if (!hasRequiredPermission) {
      if (options.auditRejection) {
        await logPermissionRejection(user, options, context.req);
      }
      throw new HttpError(
        403,
        `You do not have the required permission: ${options.resource}:${options.action}`
      );
    }

    return user;
  };
}
