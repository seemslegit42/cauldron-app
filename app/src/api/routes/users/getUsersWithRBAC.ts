/**
 * API route for getting users with RBAC
 * 
 * This is an example of how to use the RBAC middleware in an API route.
 */

import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import { withErrorHandling } from '../../middleware/error';
import { validateRequest } from '../../middleware/validation';
import { requirePermission } from '../../middleware/rbac';
import { applyFieldAccess, applyFieldAccessToArray } from '../../middleware/fieldAccess';
import { z } from 'zod';

// Validation schema for request arguments
const getUsersSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(10),
  organizationId: z.string().uuid().optional(),
  search: z.string().optional(),
});

/**
 * Get users with RBAC
 * 
 * This route demonstrates:
 * 1. Permission checking for resource access
 * 2. Organization-specific access control
 * 3. Field-level visibility based on permissions
 */
export const getUsersWithRBAC = withErrorHandling(async (args, context) => {
  // Validate request arguments
  const validatedArgs = validateRequest(args, getUsersSchema);
  
  // Apply RBAC middleware - require 'users:read' permission
  const user = await requirePermission({
    resource: 'users',
    action: 'read',
    organizationId: validatedArgs.organizationId,
    adminOverride: true,
    auditRejection: true
  })(context);
  
  // Build query
  const query: any = {};
  
  // If not admin, restrict to same organization
  if (!user.isAdmin && user.organizationId) {
    query.organizationId = user.organizationId;
  } else if (validatedArgs.organizationId) {
    query.organizationId = validatedArgs.organizationId;
  }
  
  // Add search filter if provided
  if (validatedArgs.search) {
    query.OR = [
      { email: { contains: validatedArgs.search, mode: 'insensitive' } },
      { username: { contains: validatedArgs.search, mode: 'insensitive' } },
      { firstName: { contains: validatedArgs.search, mode: 'insensitive' } },
      { lastName: { contains: validatedArgs.search, mode: 'insensitive' } },
    ];
  }
  
  // Calculate pagination
  const skip = (validatedArgs.page - 1) * validatedArgs.pageSize;
  
  // Get users
  const users = await prisma.user.findMany({
    where: query,
    skip,
    take: validatedArgs.pageSize,
    orderBy: { createdAt: 'desc' },
    include: {
      role: {
        select: {
          id: true,
          name: true,
          description: true
        }
      },
      organization: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
  
  // Get total count for pagination
  const totalCount = await prisma.user.count({ where: query });
  
  // Apply field-level access control to each user
  const filteredUsers = await applyFieldAccessToArray(users, user, 'users', 'read');
  
  return {
    users: filteredUsers,
    pagination: {
      page: validatedArgs.page,
      pageSize: validatedArgs.pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / validatedArgs.pageSize)
    }
  };
});

/**
 * Get a single user by ID with RBAC
 */
export const getUserByIdWithRBAC = withErrorHandling(async (args: { userId: string }, context) => {
  if (!args.userId) {
    throw new HttpError(400, 'User ID is required');
  }
  
  // Get the user
  const targetUser = await prisma.user.findUnique({
    where: { id: args.userId },
    include: {
      role: {
        select: {
          id: true,
          name: true,
          description: true
        }
      },
      organization: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
  
  if (!targetUser) {
    throw new HttpError(404, 'User not found');
  }
  
  // Apply RBAC middleware
  const user = await requirePermission({
    resource: 'users',
    action: 'read',
    organizationId: targetUser.organizationId,
    resourceOwnerId: args.userId, // Allow users to access their own data
    adminOverride: true,
    auditRejection: true
  })(context);
  
  // Apply field-level access control
  const filteredUser = await applyFieldAccess(targetUser, user, 'users', 'read');
  
  return filteredUser;
});
