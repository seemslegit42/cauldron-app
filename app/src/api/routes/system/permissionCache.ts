/**
 * API routes for permission cache management
 */

import { HttpError } from 'wasp/server';
import { withErrorHandling } from '../../middleware';
import { requirePermission } from '../../middleware/rbac';
import { 
  clearPermissionCache, 
  clearAllPermissionCache, 
  getCacheStats 
} from '../../middleware/rbac';
import { z } from 'zod';
import { validateRequest } from '../../middleware/validation';

// Validation schema
const clearCacheSchema = z.object({
  userId: z.string().uuid().optional()
});

/**
 * Get permission cache statistics
 */
export const getPermissionCacheStats = withErrorHandling(async (_args, context) => {
  // Apply RBAC middleware - require 'system:admin' permission
  await requirePermission({
    resource: 'system',
    action: 'admin',
    adminOverride: true,
    auditRejection: true
  })(context);
  
  // Get cache statistics
  const stats = getCacheStats();
  
  return {
    ...stats,
    hitRatePercentage: Math.round(stats.hitRate * 100)
  };
});

/**
 * Clear permission cache for a user or all users
 */
export const clearPermissionCacheAction = withErrorHandling(async (args, context) => {
  // Validate arguments
  const validatedArgs = validateRequest(args, clearCacheSchema);
  
  // Apply RBAC middleware - require 'system:admin' permission
  await requirePermission({
    resource: 'system',
    action: 'admin',
    adminOverride: true,
    auditRejection: true
  })(context);
  
  // Clear cache for specific user or all users
  if (validatedArgs.userId) {
    clearPermissionCache(validatedArgs.userId);
    return { 
      success: true, 
      message: `Permission cache cleared for user ${validatedArgs.userId}` 
    };
  } else {
    clearAllPermissionCache();
    return { 
      success: true, 
      message: 'Permission cache cleared for all users' 
    };
  }
});
