/**
 * API route for getting a user's profile
 */
import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import { withErrorHandling } from '../../middleware';
import { validateRequest } from '../../middleware/validation';
import { requirePermission } from '../../middleware/rbac';
import { applyFieldAccess } from '../../middleware/fieldAccess';
import { userProfileSchema } from '../../validators/userSchemas';

export const getUserProfile = withErrorHandling(async (args, context) => {
  // Validate request arguments
  const validatedArgs = validateRequest(args, userProfileSchema);

  // Route handler logic
  const { userId } = validatedArgs;

  // Get the user data
  const userData = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!userData) {
    throw new HttpError(404, 'User not found');
  }

  // Apply RBAC middleware - require 'users:read' permission
  // Allow users to access their own profile
  const user = await requirePermission({
    resource: 'users',
    action: 'read',
    resourceOwnerId: userId,
    organizationId: userData.organizationId,
    adminOverride: true,
    auditRejection: true,
  })(context);

  // Apply field-level access control
  // Users can see more fields of their own profile
  const isOwnProfile = user.id === userId;
  const action = isOwnProfile ? 'update' : 'read';

  const filteredUser = await applyFieldAccess(userData, user, 'users', action);

  return filteredUser;
});
