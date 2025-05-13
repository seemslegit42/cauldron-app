/**
 * API route for submitting decisions to the Sentient Loop™
 */
import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import { withErrorHandling } from '../../middleware';
import { validateRequest } from '../../middleware/validation';
import { requirePermission } from '../../middleware/rbac';
import { submitDecisionSchema } from '../../types/sentientLoopApi';
import { LoggingService } from '../../../shared/services/logging';
import { SentientLoopService } from '../../../modules/arcana/shared/services/sentientLoop';

export const submitDecision = withErrorHandling(async (args, context) => {
  // Apply RBAC middleware - require 'sentient-loop:submit-decision' permission
  const user = await requirePermission({
    resource: 'sentient-loop',
    action: 'submit-decision',
    adminOverride: true,
    auditRejection: true
  })(context);

  // Validate request data
  const validatedData = validateRequest(args, submitDecisionSchema);

  try {
    // Log the operation
    LoggingService.info({
      message: `API: Submitting decision for checkpoint ${validatedData.checkpointId}`,
      userId: user.id,
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      metadata: {
        checkpointId: validatedData.checkpointId,
        decision: validatedData.decision
      }
    });

    // Check if the checkpoint exists and is still pending
    const checkpoint = await prisma.sentientCheckpoint.findUnique({
      where: { id: validatedData.checkpointId }
    });

    if (!checkpoint) {
      throw new HttpError(404, 'Checkpoint not found');
    }

    if (checkpoint.status !== 'PENDING') {
      throw new HttpError(400, `Checkpoint is already ${checkpoint.status.toLowerCase()}`);
    }

    // Process the decision based on the type
    let result;
    switch (validatedData.decision) {
      case 'APPROVE':
        result = await SentientLoopService.resolveCheckpoint({
          checkpointId: validatedData.checkpointId,
          userId: user.id,
          resolution: 'APPROVED',
          reasoning: validatedData.reasoning,
          metadata: validatedData.metadata
        });
        break;
      case 'REJECT':
        result = await SentientLoopService.resolveCheckpoint({
          checkpointId: validatedData.checkpointId,
          userId: user.id,
          resolution: 'REJECTED',
          reasoning: validatedData.reasoning,
          metadata: validatedData.metadata
        });
        break;
      case 'MODIFY':
        if (!validatedData.modifiedPayload) {
          throw new HttpError(400, 'Modified payload is required for MODIFY decision');
        }
        result = await SentientLoopService.resolveCheckpoint({
          checkpointId: validatedData.checkpointId,
          userId: user.id,
          resolution: 'MODIFIED',
          reasoning: validatedData.reasoning,
          modifiedPayload: validatedData.modifiedPayload,
          metadata: validatedData.metadata
        });
        break;
      case 'ESCALATE':
        result = await SentientLoopService.escalateCheckpoint({
          checkpointId: validatedData.checkpointId,
          userId: user.id,
          reason: validatedData.reasoning,
          metadata: validatedData.metadata
        });
        break;
      default:
        throw new HttpError(400, 'Invalid decision type');
    }

    return {
      success: true,
      checkpointId: validatedData.checkpointId,
      decision: validatedData.decision,
      result
    };
  } catch (error) {
    console.error('Error submitting decision:', error);
    LoggingService.error({
      message: 'Failed to submit decision',
      userId: user.id,
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      error
    });
    throw error;
  }
});
