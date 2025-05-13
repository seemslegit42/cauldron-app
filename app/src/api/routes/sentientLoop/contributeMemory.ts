/**
 * API route for contributing memory artifacts to the Sentient Loop™
 */
import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import { withErrorHandling } from '../../middleware';
import { validateRequest } from '../../middleware/validation';
import { requirePermission } from '../../middleware/rbac';
import { contributeMemorySchema } from '../../types/sentientLoopApi';
import { LoggingService } from '../../../shared/services/logging';
import { SentientLoopService } from '../../../modules/arcana/shared/services/sentientLoop';

export const contributeMemory = withErrorHandling(async (args, context) => {
  // Apply RBAC middleware - require 'sentient-loop:contribute-memory' permission
  const user = await requirePermission({
    resource: 'sentient-loop',
    action: 'contribute-memory',
    adminOverride: true,
    auditRejection: true
  })(context);

  // Validate request data
  const validatedData = validateRequest(args, contributeMemorySchema);

  try {
    // Log the operation
    LoggingService.info({
      message: `API: Contributing memory to Sentient Loop`,
      userId: user.id,
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      metadata: {
        memoryType: validatedData.type,
        context: validatedData.context,
        agentId: validatedData.agentId,
        moduleId: validatedData.moduleId
      }
    });

    // Create the memory snapshot
    const memorySnapshot = await SentientLoopService.createMemorySnapshot({
      userId: user.id,
      agentId: validatedData.agentId,
      moduleId: validatedData.moduleId || 'api',
      sessionId: validatedData.sessionId,
      type: validatedData.type,
      content: validatedData.content,
      context: validatedData.context || 'API_CONTRIBUTED',
      importance: validatedData.importance,
      metadata: validatedData.metadata,
      expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : undefined
    });

    return {
      success: true,
      memoryId: memorySnapshot.id,
      type: validatedData.type,
      expiresAt: memorySnapshot.expiresAt
    };
  } catch (error) {
    console.error('Error contributing memory:', error);
    LoggingService.error({
      message: 'Failed to contribute memory',
      userId: user.id,
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      error
    });
    throw error;
  }
});
