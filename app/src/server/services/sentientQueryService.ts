/**
 * Sentient Query Service
 * 
 * This service integrates the agent query system with the Sentient Loop™ for
 * human-in-the-loop validation and escalation of complex queries.
 */

import { prisma } from 'wasp/server';
import { HttpError } from 'wasp/server';
import { LoggingService } from '../../shared/services/logging';
import { QuerySandboxService } from './querySandboxService';
import { PromptToQueryService } from './promptToQueryService';
import { SentientLoopCore } from '../../modules/arcana/shared/services/sentientLoop/sentientLoopCore';
import { SentientCheckpointService } from '../../modules/arcana/shared/services/sentientLoop/sentientCheckpointService';
import { SentientEscalationService } from '../../modules/arcana/shared/services/sentientLoop/sentientEscalationService';
import {
  QueryPermissionLevel,
  QueryApprovalStatus,
  AgentQueryRequest,
} from '../../shared/types/entities/agentQuery';

/**
 * Sentient Query Service
 * 
 * This service provides integration between the agent query system and the Sentient Loop™
 * for human-in-the-loop validation and escalation of complex queries.
 */
export class SentientQueryService {
  /**
   * Process a query request through the Sentient Loop™
   * 
   * This method creates a Sentient Loop™ checkpoint for a query request that requires
   * human validation, allowing for a more sophisticated approval workflow with
   * escalation capabilities.
   * 
   * @param queryRequestId The ID of the query request to process
   * @returns The result of the Sentient Loop™ processing
   */
  static async processQueryThroughSentientLoop(
    queryRequestId: string
  ): Promise<{
    success: boolean;
    checkpointId?: string;
    status?: string;
    error?: string;
  }> {
    try {
      // Get the query request
      const queryRequest = await prisma.agentQueryRequest.findUnique({
        where: { id: queryRequestId },
        include: {
          agent: true,
          user: true,
        },
      });

      if (!queryRequest) {
        return { success: false, error: 'Query request not found' };
      }

      // Only process pending queries
      if (queryRequest.status !== QueryApprovalStatus.PENDING) {
        return { 
          success: false, 
          error: `Query request is already ${queryRequest.status.toLowerCase()}` 
        };
      }

      // Validate the query to get confidence score
      const validation = await QuerySandboxService.validateQuery(
        queryRequest.agentId,
        queryRequest.targetModel,
        queryRequest.action,
        queryRequest.queryParams as Record<string, any> || {},
        { sandboxMode: 'strict' }
      );

      // Calculate confidence score based on validation results
      const confidence = this.calculateConfidenceScore(validation, queryRequest);
      
      // Determine impact level based on query characteristics
      const impact = this.determineImpactLevel(queryRequest);

      // Create a Sentient Loop™ checkpoint
      const checkpoint = await SentientCheckpointService.createCheckpoint({
        userId: queryRequest.userId,
        agentId: queryRequest.agentId,
        moduleId: 'agent-query',
        title: `Query Approval: ${queryRequest.targetModel}.${queryRequest.action}`,
        description: `Agent generated query from prompt: "${queryRequest.prompt}"`,
        checkpointType: 'QUERY_APPROVAL',
        payload: {
          queryRequestId: queryRequest.id,
          targetModel: queryRequest.targetModel,
          action: queryRequest.action,
          queryParams: queryRequest.queryParams,
          generatedQuery: queryRequest.generatedQuery,
          prompt: queryRequest.prompt,
          validationResults: validation,
        },
        confidence,
        impact,
        context: {
          agentName: queryRequest.agent?.name || 'Unknown Agent',
          sessionId: queryRequest.sessionId,
          validationWarnings: validation.warnings || [],
          validationErrors: validation.errors || [],
        },
        metadata: {
          queryRequestId: queryRequest.id,
          targetModel: queryRequest.targetModel,
          action: queryRequest.action,
        },
      });

      // Update the query request with the checkpoint ID
      await prisma.agentQueryRequest.update({
        where: { id: queryRequest.id },
        data: {
          metadata: {
            ...(queryRequest.metadata as any || {}),
            sentientCheckpointId: checkpoint.id,
          },
        },
      });

      // If the impact is HIGH or CRITICAL, create an escalation
      if (impact === 'HIGH' || impact === 'CRITICAL') {
        await SentientEscalationService.createEscalation({
          checkpointId: checkpoint.id,
          level: impact,
          reason: `${impact.toLowerCase()} impact query requires attention: ${queryRequest.targetModel}.${queryRequest.action}`,
          metadata: {
            queryRequestId: queryRequest.id,
            targetModel: queryRequest.targetModel,
            action: queryRequest.action,
            confidence,
          },
        });
      }

      return {
        success: true,
        checkpointId: checkpoint.id,
        status: 'PENDING',
      };
    } catch (error) {
      console.error('Error processing query through Sentient Loop:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Calculate confidence score based on validation results
   * 
   * @param validation The validation results
   * @param queryRequest The query request
   * @returns Confidence score between 0 and 1
   */
  private static calculateConfidenceScore(
    validation: { valid: boolean; errors?: string[]; warnings?: string[] },
    queryRequest: AgentQueryRequest
  ): number {
    // If validation failed, confidence is 0
    if (!validation.valid) {
      return 0;
    }

    // Start with base confidence of 0.8
    let confidence = 0.8;

    // Reduce confidence for each warning
    if (validation.warnings && validation.warnings.length > 0) {
      confidence -= validation.warnings.length * 0.05;
    }

    // Reduce confidence for sensitive operations
    if (['create', 'update', 'delete', 'upsert'].includes(queryRequest.action)) {
      confidence -= 0.2;
    }

    // Reduce confidence for complex queries
    const queryParams = queryRequest.queryParams as Record<string, any> || {};
    if (queryParams.include && Object.keys(queryParams.include).length > 2) {
      confidence -= 0.1;
    }

    // Ensure confidence is between 0 and 1
    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Determine impact level based on query characteristics
   * 
   * @param queryRequest The query request
   * @returns Impact level (LOW, MEDIUM, HIGH, CRITICAL)
   */
  private static determineImpactLevel(
    queryRequest: AgentQueryRequest
  ): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const { targetModel, action, queryParams } = queryRequest;
    const params = queryParams as Record<string, any> || {};

    // Critical impact for delete operations on sensitive models
    const sensitiveModels = [
      'User', 'Organization', 'APIKey', 'CredentialStore', 'SentientLoopApiKey',
      'Subscription', 'SubscriptionInvoice'
    ];
    
    if (
      ['delete', 'deleteMany'].includes(action) && 
      sensitiveModels.includes(targetModel)
    ) {
      return 'CRITICAL';
    }

    // High impact for update operations on sensitive models
    if (
      ['update', 'updateMany', 'upsert'].includes(action) && 
      sensitiveModels.includes(targetModel)
    ) {
      return 'HIGH';
    }

    // High impact for bulk operations
    if (['updateMany', 'deleteMany'].includes(action)) {
      return 'HIGH';
    }

    // Medium impact for create operations
    if (['create', 'createMany'].includes(action)) {
      return 'MEDIUM';
    }

    // Medium impact for update operations
    if (['update', 'upsert'].includes(action)) {
      return 'MEDIUM';
    }

    // Low impact for read operations
    return 'LOW';
  }

  /**
   * Process a Sentient Loop™ checkpoint resolution for a query request
   * 
   * @param checkpointId The ID of the checkpoint
   * @param resolution The resolution (APPROVED, REJECTED, MODIFIED)
   * @param modifiedParams Modified query parameters (if resolution is MODIFIED)
   * @param comment Optional comment
   * @returns The result of the resolution processing
   */
  static async processSentientCheckpointResolution(
    checkpointId: string,
    resolution: 'APPROVED' | 'REJECTED' | 'MODIFIED',
    modifiedParams?: Record<string, any>,
    comment?: string
  ): Promise<{
    success: boolean;
    queryRequestId?: string;
    error?: string;
  }> {
    try {
      // Get the checkpoint
      const checkpoint = await prisma.sentientCheckpoint.findUnique({
        where: { id: checkpointId },
        include: {
          agent: true,
          user: true,
        },
      });

      if (!checkpoint) {
        return { success: false, error: 'Checkpoint not found' };
      }

      // Extract the query request ID from the payload
      const payload = checkpoint.payload as any;
      if (!payload || !payload.queryRequestId) {
        return { success: false, error: 'Invalid checkpoint payload' };
      }

      const queryRequestId = payload.queryRequestId;

      // Get the query request
      const queryRequest = await prisma.agentQueryRequest.findUnique({
        where: { id: queryRequestId },
      });

      if (!queryRequest) {
        return { success: false, error: 'Query request not found' };
      }

      // Process the resolution
      if (resolution === 'APPROVED') {
        // Update the query request status to APPROVED
        await prisma.agentQueryRequest.update({
          where: { id: queryRequestId },
          data: {
            status: QueryApprovalStatus.APPROVED,
            approvedById: checkpoint.userId,
            approvedAt: new Date(),
            metadata: {
              ...(queryRequest.metadata as any || {}),
              sentientCheckpointResolution: 'APPROVED',
              sentientCheckpointComment: comment,
            },
          },
        });

        // Execute the query
        await QuerySandboxService.executeQuery(queryRequestId);
      } else if (resolution === 'REJECTED') {
        // Update the query request status to REJECTED
        await prisma.agentQueryRequest.update({
          where: { id: queryRequestId },
          data: {
            status: QueryApprovalStatus.REJECTED,
            rejectionReason: comment || 'Rejected via Sentient Loop™',
            metadata: {
              ...(queryRequest.metadata as any || {}),
              sentientCheckpointResolution: 'REJECTED',
              sentientCheckpointComment: comment,
            },
          },
        });
      } else if (resolution === 'MODIFIED') {
        if (!modifiedParams) {
          return { success: false, error: 'Modified parameters are required for MODIFIED resolution' };
        }

        // Update the query request with modified parameters
        await prisma.agentQueryRequest.update({
          where: { id: queryRequestId },
          data: {
            status: QueryApprovalStatus.APPROVED,
            approvedById: checkpoint.userId,
            approvedAt: new Date(),
            queryParams: modifiedParams,
            metadata: {
              ...(queryRequest.metadata as any || {}),
              sentientCheckpointResolution: 'MODIFIED',
              sentientCheckpointComment: comment,
              originalQueryParams: queryRequest.queryParams,
            },
          },
        });

        // Execute the query with modified parameters
        await QuerySandboxService.executeQuery(queryRequestId);
      }

      return {
        success: true,
        queryRequestId,
      };
    } catch (error) {
      console.error('Error processing Sentient checkpoint resolution:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}
