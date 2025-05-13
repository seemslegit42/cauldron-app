/**
 * API Key middleware for the Sentient Loop™ API
 * 
 * This middleware validates API keys for API requests.
 */
import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import { LoggingService } from '../../shared/services/logging';

/**
 * Middleware to validate API keys
 * 
 * @param requiredPermissions The permissions required for the API operation
 * @returns A middleware function that validates the API key
 */
export function requireApiKey(requiredPermissions: string[] = []) {
  return async (req: any, res: any, next: any) => {
    try {
      // Get the API key from the request header
      const apiKey = req.headers['x-api-key'];

      if (!apiKey) {
        throw new HttpError(401, 'API key is required');
      }

      // Find the API key in the database
      const apiKeyRecord = await prisma.sentientLoopApiKey.findUnique({
        where: { key: apiKey },
        include: { user: true }
      });

      if (!apiKeyRecord) {
        LoggingService.warn({
          message: 'Invalid API key used',
          category: 'SECURITY',
          metadata: {
            ip: req.ip,
            path: req.path,
            method: req.method
          }
        });
        throw new HttpError(401, 'Invalid API key');
      }

      if (!apiKeyRecord.isActive) {
        LoggingService.warn({
          message: 'Inactive API key used',
          userId: apiKeyRecord.userId,
          category: 'SECURITY',
          metadata: {
            ip: req.ip,
            path: req.path,
            method: req.method,
            apiKeyId: apiKeyRecord.id
          }
        });
        throw new HttpError(401, 'API key is inactive');
      }

      if (apiKeyRecord.expiresAt && new Date(apiKeyRecord.expiresAt) < new Date()) {
        LoggingService.warn({
          message: 'Expired API key used',
          userId: apiKeyRecord.userId,
          category: 'SECURITY',
          metadata: {
            ip: req.ip,
            path: req.path,
            method: req.method,
            apiKeyId: apiKeyRecord.id,
            expiresAt: apiKeyRecord.expiresAt
          }
        });
        throw new HttpError(401, 'API key has expired');
      }

      // Check if the API key has the required permissions
      if (requiredPermissions.length > 0) {
        const hasAllPermissions = requiredPermissions.every(permission =>
          apiKeyRecord.permissions.includes(permission)
        );

        if (!hasAllPermissions) {
          LoggingService.warn({
            message: 'API key missing required permissions',
            userId: apiKeyRecord.userId,
            category: 'SECURITY',
            metadata: {
              ip: req.ip,
              path: req.path,
              method: req.method,
              apiKeyId: apiKeyRecord.id,
              requiredPermissions,
              keyPermissions: apiKeyRecord.permissions
            }
          });
          throw new HttpError(403, 'API key does not have the required permissions');
        }
      }

      // Update the last used timestamp
      await prisma.sentientLoopApiKey.update({
        where: { id: apiKeyRecord.id },
        data: { lastUsedAt: new Date() }
      });

      // Add the user to the request context
      req.user = apiKeyRecord.user;

      // Log the API key usage
      LoggingService.info({
        message: 'API key used',
        userId: apiKeyRecord.userId,
        category: 'API',
        metadata: {
          ip: req.ip,
          path: req.path,
          method: req.method,
          apiKeyId: apiKeyRecord.id
        }
      });

      next();
    } catch (error) {
      next(error);
    }
  };
}
