/**
 * Authentication middleware for API routes
 */
import { HttpError } from 'wasp/server';
import { type User } from 'wasp/entities';
import { LoggingService } from '../../shared/services/logging';
import { AuthLogging, createLoggingContext } from '../../shared/services/loggingIntegration';

/**
 * Ensures the user is authenticated
 * @throws {HttpError} 401 if user is not authenticated
 */
export const authenticate = (context: { user?: User, req?: any }) => {
  if (!context.user) {
    // Log authentication failure
    LoggingService.logSystemEvent({
      message: 'Authentication failed: No user in context',
      level: 'WARN',
      category: 'AUTHENTICATION',
      source: 'auth-middleware',
      traceId: context.req?.headers?.['x-trace-id'],
      tags: ['auth', 'authentication-failed'],
      metadata: {
        ip: context.req?.ip,
        userAgent: context.req?.headers?.['user-agent'],
        path: context.req?.originalUrl || context.req?.url
      }
    }).catch(err => console.error('Failed to log authentication failure:', err));

    throw new HttpError(401, 'You must be logged in to access this resource');
  }

  // Log successful authentication if needed for sensitive operations
  // We don't log every authentication to avoid excessive logging
  return context.user;
};

/**
 * Ensures the user has admin role
 * @throws {HttpError} 403 if user is not an admin
 */
export const requireAdmin = (context: { user?: User, req?: any }) => {
  const user = authenticate(context);

  if (!user.isAdmin) {
    // Log authorization failure
    LoggingService.logSystemEvent({
      message: `Authorization failed: Admin access required for user ${user.id}`,
      level: 'WARN',
      category: 'AUTHORIZATION',
      source: 'auth-middleware',
      userId: user.id,
      organizationId: user.organizationId,
      traceId: context.req?.headers?.['x-trace-id'],
      tags: ['auth', 'authorization-failed', 'admin-required'],
      metadata: {
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin,
        path: context.req?.originalUrl || context.req?.url
      }
    }).catch(err => console.error('Failed to log authorization failure:', err));

    throw new HttpError(403, 'Admin access required');
  }

  // Log successful admin authorization for sensitive operations
  LoggingService.logSystemEvent({
    message: `Admin access granted for user ${user.id}`,
    level: 'INFO',
    category: 'AUTHORIZATION',
    source: 'auth-middleware',
    userId: user.id,
    organizationId: user.organizationId,
    traceId: context.req?.headers?.['x-trace-id'],
    tags: ['auth', 'authorization-success', 'admin-access'],
    metadata: {
      path: context.req?.originalUrl || context.req?.url
    }
  }).catch(err => console.error('Failed to log admin authorization:', err));

  return user;
};

/**
 * Ensures the user has operator role
 * @throws {HttpError} 403 if user is not an operator
 */
export const requireOperator = (context: { user?: User }) => {
  const user = authenticate(context);
  // Assuming we have a role field or can determine operator status
  // This is a placeholder - adjust based on your actual user model
  if (!(user.isAdmin || user.role === 'OPERATOR')) {
    throw new HttpError(403, 'Operator access required');
  }
  return user;
};

/**
 * Ensures the user has agent role
 * @throws {HttpError} 403 if user is not an agent
 */
export const requireAgent = (context: { user?: User }) => {
  const user = authenticate(context);
  // Assuming we have a role field or can determine agent status
  // This is a placeholder - adjust based on your actual user model
  if (!(user.isAdmin || user.role === 'OPERATOR' || user.role === 'AGENT')) {
    throw new HttpError(403, 'Agent access required');
  }
  return user;
};

/**
 * Ensures the user owns the resource or is an admin
 * @param resourceUserId The user ID associated with the resource
 * @throws {HttpError} 403 if user is not the owner or an admin
 */
export const requireOwnerOrAdmin = (context: { user?: User }, resourceUserId: string) => {
  const user = authenticate(context);
  if (user.id !== resourceUserId && !user.isAdmin) {
    throw new HttpError(403, 'You do not have permission to access this resource');
  }
  return user;
};
