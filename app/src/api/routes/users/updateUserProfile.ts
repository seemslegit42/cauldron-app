/**
 * API route for updating a user's profile
 */
import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import { withErrorHandling } from '../../middleware';
import { validateAndSanitize } from '../../middleware/validation';
import { requirePermission } from '../../middleware/rbac';
import { applyFieldAccess } from '../../middleware/fieldAccess';
import { updateUserProfileSchema } from '../../validators/userSchemas';

export const updateUserProfile = withErrorHandling(async (args, context) => {
  // Validate and sanitize request arguments
  const validatedArgs = validateAndSanitize(args, updateUserProfileSchema);

  // Extract fields to update
  const { userId, ...updateData } = validatedArgs;

  // Check if user exists and get organization info
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      organization: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!existingUser) {
    throw new HttpError(404, 'User not found');
  }

  // Apply RBAC middleware - require 'users:update' permission
  // Allow users to update their own profile
  const user = await requirePermission({
    resource: 'users',
    action: 'update',
    resourceOwnerId: userId,
    organizationId: existingUser.organization?.id,
    adminOverride: true,
    auditRejection: true,
  })(context);

  // Update user profile
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
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

  // Apply field-level access control
  const filteredUser = await applyFieldAccess(updatedUser, user, 'users', 'update');

  return filteredUser;
});
