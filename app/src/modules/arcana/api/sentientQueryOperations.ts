/**
 * Sentient Query Operations
 * 
 * This file contains the API operations for the Sentient Query Approval system.
 */

import { HttpError } from 'wasp/server';
import { useQuery as useWaspQuery, useAction as useWaspAction } from 'wasp/client/operations';
import { QueryApprovalStatus } from '@src/shared/types/entities/agentQuery';

// ==================== Server Operations ====================

/**
 * Get pending query requests
 * 
 * This query returns all pending query requests that require human approval.
 */
export const getPendingQueryRequests = async (_args: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authenticated');
  }

  try {
    const pendingQueries = await context.entities.AgentQueryRequest.findMany({
      where: {
        status: QueryApprovalStatus.PENDING,
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return pendingQueries;
  } catch (error) {
    console.error('Error getting pending query requests:', error);
    throw new HttpError(500, 'Failed to get pending query requests');
  }
};

/**
 * Get query request details
 * 
 * This query returns the details of a specific query request.
 */
export const getQueryRequestDetails = async (args: { queryId: string }, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authenticated');
  }

  if (!args.queryId) {
    throw new HttpError(400, 'Query ID is required');
  }

  try {
    const queryRequest = await context.entities.AgentQueryRequest.findUnique({
      where: {
        id: args.queryId,
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            moduleId: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            email: true,
          },
        },
        queryLog: true,
      },
    });

    if (!queryRequest) {
      throw new HttpError(404, 'Query request not found');
    }

    return queryRequest;
  } catch (error) {
    console.error('Error getting query request details:', error);
    throw new HttpError(500, 'Failed to get query request details');
  }
};

/**
 * Approve a query request
 * 
 * This action approves a query request and executes it.
 */
export const approveQueryRequest = async (args: { queryId: string; comment?: string }, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authenticated');
  }

  if (!args.queryId) {
    throw new HttpError(400, 'Query ID is required');
  }

  try {
    // Get the query request
    const queryRequest = await context.entities.AgentQueryRequest.findUnique({
      where: {
        id: args.queryId,
      },
      include: {
        agent: true,
      },
    });

    if (!queryRequest) {
      throw new HttpError(404, 'Query request not found');
    }

    // Check if the query is already approved or rejected
    if (queryRequest.status !== QueryApprovalStatus.PENDING) {
      throw new HttpError(400, `Query request is already ${queryRequest.status.toLowerCase()}`);
    }

    // Import the SentientQueryService
    const { SentientQueryService } = await import('@src/server/services/sentientQueryService');

    // Get the checkpoint ID from the metadata
    const metadata = queryRequest.metadata as any || {};
    const checkpointId = metadata.sentientCheckpointId;

    if (checkpointId) {
      // Process the checkpoint resolution
      await SentientQueryService.processSentientCheckpointResolution(
        checkpointId,
        'APPROVED',
        undefined,
        args.comment
      );
    } else {
      // Update the query request status
      await context.entities.AgentQueryRequest.update({
        where: {
          id: args.queryId,
        },
        data: {
          status: QueryApprovalStatus.APPROVED,
          approvedById: context.user.id,
          approvedAt: new Date(),
          metadata: {
            ...metadata,
            approvalComment: args.comment,
          },
        },
      });

      // Import the QuerySandboxService
      const { QuerySandboxService } = await import('@src/server/services/querySandboxService');

      // Execute the query
      await QuerySandboxService.executeQuery(args.queryId);
    }

    return { success: true };
  } catch (error) {
    console.error('Error approving query request:', error);
    throw new HttpError(500, 'Failed to approve query request');
  }
};

/**
 * Reject a query request
 * 
 * This action rejects a query request.
 */
export const rejectQueryRequest = async (args: { queryId: string; reason: string }, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authenticated');
  }

  if (!args.queryId) {
    throw new HttpError(400, 'Query ID is required');
  }

  if (!args.reason) {
    throw new HttpError(400, 'Rejection reason is required');
  }

  try {
    // Get the query request
    const queryRequest = await context.entities.AgentQueryRequest.findUnique({
      where: {
        id: args.queryId,
      },
    });

    if (!queryRequest) {
      throw new HttpError(404, 'Query request not found');
    }

    // Check if the query is already approved or rejected
    if (queryRequest.status !== QueryApprovalStatus.PENDING) {
      throw new HttpError(400, `Query request is already ${queryRequest.status.toLowerCase()}`);
    }

    // Import the SentientQueryService
    const { SentientQueryService } = await import('@src/server/services/sentientQueryService');

    // Get the checkpoint ID from the metadata
    const metadata = queryRequest.metadata as any || {};
    const checkpointId = metadata.sentientCheckpointId;

    if (checkpointId) {
      // Process the checkpoint resolution
      await SentientQueryService.processSentientCheckpointResolution(
        checkpointId,
        'REJECTED',
        undefined,
        args.reason
      );
    } else {
      // Update the query request status
      await context.entities.AgentQueryRequest.update({
        where: {
          id: args.queryId,
        },
        data: {
          status: QueryApprovalStatus.REJECTED,
          rejectionReason: args.reason,
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error rejecting query request:', error);
    throw new HttpError(500, 'Failed to reject query request');
  }
};

/**
 * Modify a query request
 * 
 * This action modifies a query request and executes it.
 */
export const modifyQueryRequest = async (
  args: { 
    queryId: string; 
    modifiedParams: Record<string, any>; 
    comment?: string 
  }, 
  context: any
) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authenticated');
  }

  if (!args.queryId) {
    throw new HttpError(400, 'Query ID is required');
  }

  if (!args.modifiedParams) {
    throw new HttpError(400, 'Modified parameters are required');
  }

  try {
    // Get the query request
    const queryRequest = await context.entities.AgentQueryRequest.findUnique({
      where: {
        id: args.queryId,
      },
    });

    if (!queryRequest) {
      throw new HttpError(404, 'Query request not found');
    }

    // Check if the query is already approved or rejected
    if (queryRequest.status !== QueryApprovalStatus.PENDING) {
      throw new HttpError(400, `Query request is already ${queryRequest.status.toLowerCase()}`);
    }

    // Import the SentientQueryService
    const { SentientQueryService } = await import('@src/server/services/sentientQueryService');

    // Get the checkpoint ID from the metadata
    const metadata = queryRequest.metadata as any || {};
    const checkpointId = metadata.sentientCheckpointId;

    if (checkpointId) {
      // Process the checkpoint resolution
      await SentientQueryService.processSentientCheckpointResolution(
        checkpointId,
        'MODIFIED',
        args.modifiedParams,
        args.comment
      );
    } else {
      // Update the query request
      await context.entities.AgentQueryRequest.update({
        where: {
          id: args.queryId,
        },
        data: {
          status: QueryApprovalStatus.APPROVED,
          approvedById: context.user.id,
          approvedAt: new Date(),
          queryParams: args.modifiedParams,
          metadata: {
            ...metadata,
            modificationComment: args.comment,
            originalQueryParams: queryRequest.queryParams,
          },
        },
      });

      // Import the QuerySandboxService
      const { QuerySandboxService } = await import('@src/server/services/querySandboxService');

      // Execute the query
      await QuerySandboxService.executeQuery(args.queryId);
    }

    return { success: true };
  } catch (error) {
    console.error('Error modifying query request:', error);
    throw new HttpError(500, 'Failed to modify query request');
  }
};

// ==================== Client Hooks ====================

/**
 * Hook for getting pending query requests
 */
export function usePendingQueryRequests() {
  return useWaspQuery(getPendingQueryRequests);
}

/**
 * Hook for getting query request details
 */
export function useQueryRequestDetails(queryId: string) {
  return useWaspQuery(getQueryRequestDetails, { queryId });
}

/**
 * Hook for approving a query request
 */
export function useApproveQueryRequest() {
  return useWaspAction(approveQueryRequest);
}

/**
 * Hook for rejecting a query request
 */
export function useRejectQueryRequest() {
  return useWaspAction(rejectQueryRequest);
}

/**
 * Hook for modifying a query request
 */
export function useModifyQueryRequest() {
  return useWaspAction(modifyQueryRequest);
}
