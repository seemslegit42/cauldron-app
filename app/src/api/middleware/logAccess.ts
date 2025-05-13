/**
 * Log Access Middleware
 * 
 * This middleware provides role-based access control for the logging system.
 */

import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import { LoggingService } from '../../shared/services/logging';

// Log access levels
export enum LogAccessLevel {
  NONE = 'none',
  READ_BASIC = 'read_basic',
  READ_DETAILED = 'read_detailed',
  READ_ALL = 'read_all',
  MANAGE = 'manage',
  ADMIN = 'admin',
}

// Log type permissions
export interface LogTypePermissions {
  system: LogAccessLevel;
  agent: LogAccessLevel;
  api: LogAccessLevel;
  approval: LogAccessLevel;
  analytics: LogAccessLevel;
  alerts: LogAccessLevel;
}

// Default permissions by role
const defaultPermissionsByRole: Record<string, LogTypePermissions> = {
  ADMIN: {
    system: LogAccessLevel.ADMIN,
    agent: LogAccessLevel.ADMIN,
    api: LogAccessLevel.ADMIN,
    approval: LogAccessLevel.ADMIN,
    analytics: LogAccessLevel.ADMIN,
    alerts: LogAccessLevel.ADMIN,
  },
  OPERATOR: {
    system: LogAccessLevel.READ_DETAILED,
    agent: LogAccessLevel.READ_DETAILED,
    api: LogAccessLevel.READ_DETAILED,
    approval: LogAccessLevel.READ_DETAILED,
    analytics: LogAccessLevel.READ_DETAILED,
    alerts: LogAccessLevel.MANAGE,
  },
  AGENT: {
    system: LogAccessLevel.READ_BASIC,
    agent: LogAccessLevel.READ_BASIC,
    api: LogAccessLevel.NONE,
    approval: LogAccessLevel.READ_BASIC,
    analytics: LogAccessLevel.NONE,
    alerts: LogAccessLevel.NONE,
  },
  USER: {
    system: LogAccessLevel.NONE,
    agent: LogAccessLevel.NONE,
    api: LogAccessLevel.NONE,
    approval: LogAccessLevel.READ_BASIC,
    analytics: LogAccessLevel.NONE,
    alerts: LogAccessLevel.NONE,
  },
};

/**
 * Get user's log permissions
 */
export async function getUserLogPermissions(userId: string): Promise<LogTypePermissions> {
  try {
    // Get the user with their roles
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: true,
      },
    });

    if (!user) {
      return defaultPermissionsByRole.USER;
    }

    // Get the highest permission level for each log type
    const permissions: LogTypePermissions = {
      system: LogAccessLevel.NONE,
      agent: LogAccessLevel.NONE,
      api: LogAccessLevel.NONE,
      approval: LogAccessLevel.NONE,
      analytics: LogAccessLevel.NONE,
      alerts: LogAccessLevel.NONE,
    };

    // Check if user has custom permissions
    const customPermissions = await prisma.userPermission.findFirst({
      where: { userId: user.id, permissionType: 'LOG_ACCESS' },
    });

    if (customPermissions?.permissionData) {
      return customPermissions.permissionData as LogTypePermissions;
    }

    // Apply role-based permissions
    for (const role of user.roles) {
      const rolePermissions = defaultPermissionsByRole[role.name] || defaultPermissionsByRole.USER;

      // For each log type, use the highest permission level
      for (const logType of Object.keys(permissions) as Array<keyof LogTypePermissions>) {
        const currentLevel = getAccessLevelValue(permissions[logType]);
        const roleLevel = getAccessLevelValue(rolePermissions[logType]);

        if (roleLevel > currentLevel) {
          permissions[logType] = rolePermissions[logType];
        }
      }
    }

    return permissions;
  } catch (error) {
    console.error('Error getting user log permissions:', error);
    return defaultPermissionsByRole.USER;
  }
}

/**
 * Get numeric value for access level (for comparison)
 */
function getAccessLevelValue(level: LogAccessLevel): number {
  switch (level) {
    case LogAccessLevel.NONE:
      return 0;
    case LogAccessLevel.READ_BASIC:
      return 1;
    case LogAccessLevel.READ_DETAILED:
      return 2;
    case LogAccessLevel.READ_ALL:
      return 3;
    case LogAccessLevel.MANAGE:
      return 4;
    case LogAccessLevel.ADMIN:
      return 5;
    default:
      return 0;
  }
}

/**
 * Check if user has required access level for a log type
 */
export function hasLogAccess(
  userPermissions: LogTypePermissions,
  logType: keyof LogTypePermissions,
  requiredLevel: LogAccessLevel
): boolean {
  const userLevel = getAccessLevelValue(userPermissions[logType]);
  const required = getAccessLevelValue(requiredLevel);

  return userLevel >= required;
}

/**
 * Middleware to require specific log access level
 */
export function requireLogAccess(
  logType: keyof LogTypePermissions,
  requiredLevel: LogAccessLevel
) {
  return async (req: any, res: any, context: any) => {
    if (!context.user) {
      throw new HttpError(401, 'Authentication required');
    }

    const permissions = await getUserLogPermissions(context.user.id);

    if (!hasLogAccess(permissions, logType, requiredLevel)) {
      // Log the access attempt
      await LoggingService.logSystemEvent({
        message: `Unauthorized log access attempt: ${logType} (${requiredLevel})`,
        level: 'WARN',
        category: 'SECURITY',
        source: 'log-access',
        userId: context.user.id,
        tags: ['access-control', 'unauthorized', logType],
        metadata: {
          logType,
          requiredLevel,
          userPermissions: permissions,
        },
      });

      throw new HttpError(403, `You don't have sufficient permissions to access ${logType} logs`);
    }

    return context;
  };
}

/**
 * Apply field-level access control to log data
 */
export function applyLogFieldAccess<T>(
  data: T,
  permissions: LogTypePermissions,
  logType: keyof LogTypePermissions
): Partial<T> {
  const accessLevel = permissions[logType];

  // If no access, return empty object
  if (accessLevel === LogAccessLevel.NONE) {
    return {};
  }

  // If admin access, return all data
  if (accessLevel === LogAccessLevel.ADMIN) {
    return data;
  }

  // Create a copy of the data
  const result = { ...data } as any;

  // Apply field-level access control based on access level
  switch (accessLevel) {
    case LogAccessLevel.READ_BASIC:
      // Remove sensitive fields
      delete result.metadata;
      delete result.payload;
      delete result.requestBody;
      delete result.responseBody;
      delete result.headers;
      delete result.traceId;
      delete result.spanId;
      break;

    case LogAccessLevel.READ_DETAILED:
      // Remove very sensitive fields
      if (result.metadata) {
        delete result.metadata.credentials;
        delete result.metadata.tokens;
        delete result.metadata.secrets;
      }
      if (result.requestBody) {
        delete result.requestBody.password;
        delete result.requestBody.token;
        delete result.requestBody.secret;
      }
      break;

    case LogAccessLevel.READ_ALL:
    case LogAccessLevel.MANAGE:
      // All fields are accessible
      break;
  }

  return result;
}

/**
 * Apply log access control to a collection of logs
 */
export function applyLogCollectionAccess<T>(
  logs: T[],
  permissions: LogTypePermissions,
  logType: keyof LogTypePermissions
): Partial<T>[] {
  return logs.map((log) => applyLogFieldAccess(log, permissions, logType));
}
