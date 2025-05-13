/**
 * Field-Level Access Control
 *
 * This file contains utilities for controlling access to specific fields
 * in API responses based on user permissions.
 */

import type { User } from 'wasp/entities';
import { type Resource, type ResourceAction, type FieldVisibility } from './rbac';
import { hasPermission } from './rbacUtils';

/**
 * Field visibility definitions for different resources and permission levels
 */
export const fieldVisibilityMap: Record<Resource, Record<ResourceAction, FieldVisibility>> = {
  // User resource field visibility
  users: {
    read: {
      include: [
        'id',
        'username',
        'email',
        'firstName',
        'lastName',
        'avatarUrl',
        'createdAt',
        'organizationId',
      ],
    },
    update: {
      include: [
        'id',
        'username',
        'email',
        'firstName',
        'lastName',
        'avatarUrl',
        'phoneNumber',
        'organizationId',
      ],
    },
    manage: {
      // No restrictions for manage permission
    },
  },

  // Organization resource field visibility
  organizations: {
    read: {
      include: ['id', 'name', 'description', 'logoUrl', 'website', 'industry', 'size', 'createdAt'],
    },
    update: {
      include: ['id', 'name', 'description', 'logoUrl', 'website', 'industry', 'size'],
    },
    manage: {
      // No restrictions for manage permission
    },
  },

  // Agent resource field visibility
  agents: {
    read: {
      include: ['id', 'name', 'description', 'type', 'isActive', 'createdAt', 'updatedAt'],
    },
    update: {
      include: ['id', 'name', 'description', 'type', 'configuration', 'isActive'],
    },
    execute: {
      include: ['id', 'name', 'description', 'type', 'isActive'],
    },
    manage: {
      // No restrictions for manage permission
    },
  },

  // Module resource field visibility
  modules: {
    read: {
      include: ['id', 'name', 'description', 'type', 'isActive', 'createdAt', 'updatedAt'],
    },
    use: {
      include: ['id', 'name', 'description', 'type', 'configuration', 'isActive'],
    },
    manage: {
      // No restrictions for manage permission
    },
  },

  // System resource field visibility
  system: {
    read_logs: {
      include: ['id', 'timestamp', 'level', 'message', 'category', 'source'],
    },
    read_detailed: {
      include: [
        'id',
        'timestamp',
        'level',
        'message',
        'category',
        'source',
        'userId',
        'organizationId',
        'tags',
      ],
    },
    admin: {
      // No restrictions for admin permission
    },
  },

  // File resource field visibility
  files: {
    read: {
      include: ['id', 'name', 'type', 'createdAt', 'user'],
    },
    read_limited: {
      include: ['id', 'name', 'type', 'createdAt'],
    },
    download: {
      include: ['id', 'name', 'type', 'key', 'createdAt', 'user'],
    },
    update: {
      include: ['id', 'name', 'type', 'key', 'user'],
    },
    manage: {
      // No restrictions for manage permission
    },
  },

  // Workflow resource field visibility
  workflows: {
    read: {
      include: ['id', 'name', 'description', 'status', 'createdAt', 'completedAt', 'user'],
    },
    read_limited: {
      include: ['id', 'name', 'status', 'createdAt', 'completedAt'],
    },
    execute: {
      include: [
        'id',
        'name',
        'description',
        'status',
        'input',
        'output',
        'createdAt',
        'completedAt',
        'user',
      ],
    },
    manage: {
      // No restrictions for manage permission
    },
  },

  // Arcana module field visibility
  arcana: {
    read: {
      include: ['id', 'name', 'metrics', 'projects', 'goals', 'createdAt', 'updatedAt'],
    },
    use: {
      include: [
        'id',
        'name',
        'metrics',
        'projects',
        'goals',
        'decisions',
        'persona',
        'createdAt',
        'updatedAt',
      ],
    },
    manage: {
      // No restrictions for manage permission
    },
  },

  // Phantom module field visibility
  phantom: {
    read: {
      include: [
        'id',
        'name',
        'description',
        'severity',
        'status',
        'type',
        'source',
        'createdAt',
        'updatedAt',
      ],
    },
    scan: {
      include: [
        'id',
        'name',
        'description',
        'severity',
        'status',
        'type',
        'source',
        'targets',
        'results',
        'createdAt',
        'updatedAt',
      ],
    },
    manage: {
      // No restrictions for manage permission
    },
  },

  // Obelisk module field visibility
  obelisk: {
    read: {
      include: ['id', 'name', 'description', 'type', 'status', 'createdAt', 'updatedAt'],
    },
    create: {
      include: [
        'id',
        'name',
        'description',
        'type',
        'configuration',
        'status',
        'createdAt',
        'updatedAt',
      ],
    },
    scan: {
      include: [
        'id',
        'name',
        'description',
        'type',
        'configuration',
        'status',
        'results',
        'createdAt',
        'updatedAt',
      ],
    },
    manage: {
      // No restrictions for manage permission
    },
  },

  // Manifold module field visibility
  manifold: {
    read: {
      include: [
        'id',
        'name',
        'description',
        'amount',
        'currency',
        'category',
        'createdAt',
        'updatedAt',
      ],
    },
    create: {
      include: [
        'id',
        'name',
        'description',
        'amount',
        'currency',
        'category',
        'source',
        'createdAt',
        'updatedAt',
      ],
    },
    manage: {
      // No restrictions for manage permission
    },
  },

  // Forgeflow module field visibility
  forgeflow: {
    read: {
      include: ['id', 'name', 'description', 'status', 'createdAt', 'updatedAt'],
    },
    create: {
      include: [
        'id',
        'name',
        'description',
        'steps',
        'triggers',
        'status',
        'createdAt',
        'updatedAt',
      ],
    },
    execute: {
      include: [
        'id',
        'name',
        'description',
        'steps',
        'triggers',
        'status',
        'input',
        'output',
        'createdAt',
        'updatedAt',
      ],
    },
    manage: {
      // No restrictions for manage permission
    },
  },

  // Sentinel module field visibility
  sentinel: {
    read: {
      include: [
        'id',
        'name',
        'description',
        'severity',
        'status',
        'type',
        'createdAt',
        'updatedAt',
      ],
    },
    acknowledge: {
      include: [
        'id',
        'name',
        'description',
        'severity',
        'status',
        'type',
        'details',
        'createdAt',
        'updatedAt',
      ],
    },
    manage: {
      // No restrictions for manage permission
    },
  },

  // Athena module field visibility
  athena: {
    read: {
      include: [
        'id',
        'name',
        'description',
        'category',
        'value',
        'timeframe',
        'createdAt',
        'updatedAt',
      ],
    },
    analyze: {
      include: [
        'id',
        'name',
        'description',
        'category',
        'value',
        'timeframe',
        'insights',
        'recommendations',
        'createdAt',
        'updatedAt',
      ],
    },
    manage: {
      // No restrictions for manage permission
    },
  },

  // Cauldron Prime module field visibility
  cauldron_prime: {
    read: {
      include: ['id', 'name', 'description', 'metrics', 'decisions', 'createdAt', 'updatedAt'],
    },
    interact: {
      include: [
        'id',
        'name',
        'description',
        'metrics',
        'decisions',
        'preferences',
        'createdAt',
        'updatedAt',
      ],
    },
    manage: {
      // No restrictions for manage permission
    },
  },

  // Sub-resources field visibility
  'security-scans': {
    read: {
      include: ['id', 'name', 'description', 'type', 'status', 'createdAt', 'updatedAt'],
    },
    create: {
      include: [
        'id',
        'name',
        'description',
        'type',
        'configuration',
        'targets',
        'status',
        'createdAt',
        'updatedAt',
      ],
    },
    manage: {
      // No restrictions for manage permission
    },
  },

  'threat-intelligence': {
    read: {
      include: [
        'id',
        'name',
        'description',
        'severity',
        'type',
        'source',
        'createdAt',
        'updatedAt',
      ],
    },
    analyze: {
      include: [
        'id',
        'name',
        'description',
        'severity',
        'type',
        'source',
        'details',
        'indicators',
        'createdAt',
        'updatedAt',
      ],
    },
    manage: {
      // No restrictions for manage permission
    },
  },

  'domain-clones': {
    read: {
      include: [
        'id',
        'originalDomain',
        'cloneDomain',
        'similarity',
        'threatLevel',
        'status',
        'createdAt',
        'updatedAt',
      ],
    },
    scan: {
      include: [
        'id',
        'originalDomain',
        'cloneDomain',
        'similarity',
        'threatLevel',
        'status',
        'details',
        'screenshot',
        'createdAt',
        'updatedAt',
      ],
    },
    manage: {
      // No restrictions for manage permission
    },
  },

  'osint-sources': {
    read: {
      include: ['id', 'name', 'description', 'type', 'isActive', 'createdAt', 'updatedAt'],
    },
    create: {
      include: [
        'id',
        'name',
        'description',
        'type',
        'configuration',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
    },
    manage: {
      // No restrictions for manage permission
    },
  },

  'osint-findings': {
    read: {
      include: ['id', 'title', 'description', 'severity', 'sourceId', 'createdAt', 'updatedAt'],
    },
    create: {
      include: [
        'id',
        'title',
        'description',
        'severity',
        'sourceId',
        'data',
        'createdAt',
        'updatedAt',
      ],
    },
    manage: {
      // No restrictions for manage permission
    },
  },

  'workflow-templates': {
    read: {
      include: ['id', 'name', 'description', 'category', 'createdAt', 'updatedAt'],
    },
    create: {
      include: [
        'id',
        'name',
        'description',
        'category',
        'steps',
        'triggers',
        'createdAt',
        'updatedAt',
      ],
    },
    manage: {
      // No restrictions for manage permission
    },
  },

  'agent-templates': {
    read: {
      include: ['id', 'name', 'description', 'role', 'category', 'createdAt', 'updatedAt'],
    },
    create: {
      include: [
        'id',
        'name',
        'description',
        'role',
        'goal',
        'backstory',
        'category',
        'tools',
        'createdAt',
        'updatedAt',
      ],
    },
    manage: {
      // No restrictions for manage permission
    },
  },

  'business-metrics': {
    read: {
      include: ['id', 'name', 'description', 'value', 'unit', 'category', 'createdAt', 'updatedAt'],
    },
    analyze: {
      include: [
        'id',
        'name',
        'description',
        'value',
        'unit',
        'category',
        'trend',
        'insights',
        'createdAt',
        'updatedAt',
      ],
    },
    manage: {
      // No restrictions for manage permission
    },
  },

  'revenue-streams': {
    read: {
      include: [
        'id',
        'name',
        'description',
        'amount',
        'currency',
        'category',
        'createdAt',
        'updatedAt',
      ],
    },
    create: {
      include: [
        'id',
        'name',
        'description',
        'amount',
        'currency',
        'category',
        'source',
        'frequency',
        'createdAt',
        'updatedAt',
      ],
    },
    manage: {
      // No restrictions for manage permission
    },
  },

  'analytics-reports': {
    read: {
      include: ['id', 'name', 'description', 'type', 'createdAt', 'updatedAt'],
    },
    create: {
      include: ['id', 'name', 'description', 'type', 'data', 'insights', 'createdAt', 'updatedAt'],
    },
    manage: {
      // No restrictions for manage permission
    },
  },

  // Default field visibility for any other resource
  default: {
    read: {
      exclude: ['password', 'secret', 'key', 'token', 'apiKey'],
    },
    update: {
      exclude: ['password', 'secret', 'key', 'token', 'apiKey', 'createdAt', 'updatedAt'],
    },
    manage: {
      // No restrictions for manage permission
    },
  },
};

/**
 * Apply field-level access control to a data object
 *
 * @param data The data object to filter
 * @param user The user requesting the data
 * @param resource The resource type
 * @param action The action being performed
 * @returns Filtered data object with only accessible fields
 */
export async function applyFieldAccess<T>(
  data: T,
  user: User,
  resource: Resource,
  action: ResourceAction = 'read'
): Promise<Partial<T>> {
  // Admin users get full access
  if (user.isAdmin) {
    return data;
  }

  // Get the field visibility map for this resource
  const resourceMap = fieldVisibilityMap[resource] || fieldVisibilityMap.default;

  // Determine the highest permission level the user has
  let highestAction: ResourceAction = action;

  // Check for higher permission levels in order of precedence
  const permissionHierarchy: ResourceAction[] = ['read', 'update', 'manage'];

  for (const permAction of permissionHierarchy) {
    if (permAction === action) {
      continue; // Skip the current action
    }

    if (await hasPermission(user.id, resource, permAction)) {
      // If this is a higher permission level, use it
      if (permissionHierarchy.indexOf(permAction) > permissionHierarchy.indexOf(highestAction)) {
        highestAction = permAction;
      }
    }
  }

  // Special case for 'manage' permission - full access
  if (highestAction === 'manage' || (await hasPermission(user.id, resource, 'manage'))) {
    return data;
  }

  // Get the field visibility for the highest permission level
  const fieldVisibility = resourceMap[highestAction];

  if (!fieldVisibility) {
    // If no field visibility defined, use default read visibility
    return applyFieldVisibilityFilter(
      data,
      resourceMap.read || { exclude: ['password', 'secret', 'key', 'token', 'apiKey'] }
    );
  }

  return applyFieldVisibilityFilter(data, fieldVisibility);
}

/**
 * Apply field visibility filter to a data object
 */
function applyFieldVisibilityFilter<T>(data: T, fieldVisibility: FieldVisibility): Partial<T> {
  if (!data) {
    return data;
  }

  // Create a copy of the data
  const result = { ...data } as any;

  // If include is specified, only keep those fields
  if (fieldVisibility.include && fieldVisibility.include.length > 0) {
    Object.keys(result).forEach((key) => {
      if (!fieldVisibility.include!.includes(key)) {
        delete result[key];
      }
    });
  }

  // If exclude is specified, remove those fields
  if (fieldVisibility.exclude && fieldVisibility.exclude.length > 0) {
    fieldVisibility.exclude.forEach((field) => {
      delete result[field];
    });
  }

  return result;
}

/**
 * Apply field-level access control to an array of data objects
 */
export async function applyFieldAccessToArray<T>(
  dataArray: T[],
  user: User,
  resource: Resource,
  action: ResourceAction = 'read'
): Promise<Partial<T>[]> {
  if (!dataArray || !Array.isArray(dataArray)) {
    return dataArray;
  }

  const results: Partial<T>[] = [];

  for (const item of dataArray) {
    results.push(await applyFieldAccess(item, user, resource, action));
  }

  return results;
}
