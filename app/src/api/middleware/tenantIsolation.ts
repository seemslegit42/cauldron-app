import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import { LoggingService } from '@src/shared/services/logging';
import { canAccessOrganization } from '@src/shared/utils/permissionUtils';

/**
 * Middleware to enforce tenant isolation
 * This ensures that users can only access data from their own organization
 */
export const requireTenantIsolation = (options: {
  resource: string;
  action: string;
  adminOverride?: boolean;
  auditRejection?: boolean;
}) => {
  return async (context: any, next: () => Promise<any>) => {
    const { user } = context;
    
    if (!user) {
      throw new HttpError(401, 'Unauthorized');
    }

    // If user is an admin and adminOverride is enabled, skip tenant isolation check
    if (options.adminOverride && user.isAdmin) {
      return next();
    }

    // Ensure user has an organization
    if (!user.organizationId) {
      if (options.auditRejection) {
        LoggingService.warn({
          message: `Tenant isolation failed: User ${user.id} has no organization`,
          userId: user.id,
          category: 'SECURITY',
          metadata: {
            resource: options.resource,
            action: options.action,
          },
        });
      }
      throw new HttpError(403, 'Forbidden: No organization assigned');
    }

    // Store the organization ID in the context for downstream use
    context.organizationId = user.organizationId;
    
    // Continue to the next middleware or handler
    return next();
  };
};

/**
 * Middleware to enforce tenant data isolation
 * This ensures that queries automatically filter by the user's organization
 */
export const withTenantIsolation = (options: {
  resource: string;
  adminOverride?: boolean;
  auditAccess?: boolean;
}) => {
  return async (args: any, context: any) => {
    const { user } = context;
    
    if (!user) {
      throw new HttpError(401, 'Unauthorized');
    }

    // If user is an admin and adminOverride is enabled, return unmodified args
    if (options.adminOverride && user.isAdmin) {
      return args;
    }

    // Ensure user has an organization
    if (!user.organizationId) {
      throw new HttpError(403, 'Forbidden: No organization assigned');
    }

    // Add organization filter to the query
    const modifiedArgs = {
      ...args,
      where: {
        ...args.where,
        organizationId: user.organizationId,
      },
    };

    if (options.auditAccess) {
      LoggingService.info({
        message: `Tenant isolation applied: User ${user.id} accessing ${options.resource}`,
        userId: user.id,
        category: 'SECURITY',
        metadata: {
          resource: options.resource,
          organizationId: user.organizationId,
        },
      });
    }

    return modifiedArgs;
  };
};

/**
 * Utility function to check if a resource belongs to the user's organization
 */
export const isSameTenant = async (
  userId: string,
  resourceId: string,
  resourceType: string
): Promise<boolean> => {
  try {
    // Get the user's organization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true, isAdmin: true },
    });

    if (!user || !user.organizationId) {
      return false;
    }

    // If user is admin, they can access any resource
    if (user.isAdmin) {
      return true;
    }

    // Get the resource's organization
    let resource: any;
    
    switch (resourceType) {
      case 'user':
        resource = await prisma.user.findUnique({
          where: { id: resourceId },
          select: { organizationId: true },
        });
        break;
      case 'agent':
        resource = await prisma.agent.findUnique({
          where: { id: resourceId },
          select: { userId: true },
        });
        if (resource) {
          const resourceUser = await prisma.user.findUnique({
            where: { id: resource.userId },
            select: { organizationId: true },
          });
          resource = resourceUser;
        }
        break;
      case 'workflow':
        resource = await prisma.workflow.findUnique({
          where: { id: resourceId },
          select: { userId: true },
        });
        if (resource) {
          const resourceUser = await prisma.user.findUnique({
            where: { id: resource.userId },
            select: { organizationId: true },
          });
          resource = resourceUser;
        }
        break;
      // Add more resource types as needed
      default:
        return false;
    }

    if (!resource || !resource.organizationId) {
      return false;
    }

    // Check if the resource belongs to the user's organization
    return resource.organizationId === user.organizationId;
  } catch (error) {
    console.error('Error checking tenant isolation:', error);
    return false;
  }
};

/**
 * Utility function to get the tenant ID from a user ID
 */
export const getTenantIdFromUserId = async (userId: string): Promise<string | null> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });

    return user?.organizationId || null;
  } catch (error) {
    console.error('Error getting tenant ID:', error);
    return null;
  }
};