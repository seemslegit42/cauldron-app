import { HttpError } from 'wasp/server';
import { LoopPerformanceService } from '../shared/services/sentientLoop/loopPerformanceService';
import { requirePermission } from './middleware/rbac';
import { LoggingService } from '../shared/services/logging';

/**
 * Gets performance metrics for the Sentient Loop™
 */
export const getLoopPerformanceMetrics = async (args: {
  moduleId?: string;
  startDate?: string;
  endDate?: string;
  agentId?: string;
}, context: any) => {
  // Apply RBAC middleware - require 'sentient-loop:read' permission
  const user = await requirePermission({
    resource: 'sentient-loop',
    action: 'read',
    adminOverride: true,
    auditRejection: true
  })(context);

  try {
    const { moduleId, startDate, endDate, agentId } = args;

    // Log the operation
    LoggingService.info({
      message: 'Getting Sentient Loop performance metrics',
      userId: user.id,
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      metadata: { moduleId, startDate, endDate, agentId }
    });

    // Parse dates if provided
    const parsedStartDate = startDate ? new Date(startDate) : undefined;
    const parsedEndDate = endDate ? new Date(endDate) : undefined;

    // Get the performance metrics
    const metrics = await LoopPerformanceService.getPerformanceMetrics({
      userId: user.id,
      moduleId,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      agentId
    });

    return metrics;
  } catch (error) {
    console.error('Error getting Sentient Loop performance metrics:', error);
    LoggingService.error({
      message: 'Failed to get Sentient Loop performance metrics',
      userId: user.id,
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      error
    });
    throw new HttpError(500, 'Failed to get Sentient Loop performance metrics');
  }
};

/**
 * Gets module-specific performance metrics for the Sentient Loop™
 */
export const getModulePerformanceMetrics = async (args: {
  moduleId: string;
  startDate?: string;
  endDate?: string;
}, context: any) => {
  // Apply RBAC middleware - require 'sentient-loop:read' permission
  const user = await requirePermission({
    resource: 'sentient-loop',
    action: 'read',
    adminOverride: true,
    auditRejection: true
  })(context);

  try {
    const { moduleId, startDate, endDate } = args;

    // Log the operation
    LoggingService.info({
      message: `Getting Sentient Loop performance metrics for module: ${moduleId}`,
      userId: user.id,
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      metadata: { moduleId, startDate, endDate }
    });

    // Parse dates if provided
    const parsedStartDate = startDate ? new Date(startDate) : undefined;
    const parsedEndDate = endDate ? new Date(endDate) : undefined;

    // Get the performance metrics
    const metrics = await LoopPerformanceService.getPerformanceMetrics({
      userId: user.id,
      moduleId,
      startDate: parsedStartDate,
      endDate: parsedEndDate
    });

    return metrics;
  } catch (error) {
    console.error('Error getting module performance metrics:', error);
    LoggingService.error({
      message: 'Failed to get module performance metrics',
      userId: user.id,
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      error,
      metadata: { moduleId: args.moduleId }
    });
    throw new HttpError(500, 'Failed to get module performance metrics');
  }
};

/**
 * Gets agent-specific performance metrics for the Sentient Loop™
 */
export const getAgentPerformanceMetrics = async (args: {
  agentId: string;
  startDate?: string;
  endDate?: string;
}, context: any) => {
  // Apply RBAC middleware - require 'sentient-loop:read' permission
  const user = await requirePermission({
    resource: 'sentient-loop',
    action: 'read',
    adminOverride: true,
    auditRejection: true
  })(context);

  try {
    const { agentId, startDate, endDate } = args;

    // Log the operation
    LoggingService.info({
      message: `Getting Sentient Loop performance metrics for agent: ${agentId}`,
      userId: user.id,
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      metadata: { agentId, startDate, endDate }
    });

    // Parse dates if provided
    const parsedStartDate = startDate ? new Date(startDate) : undefined;
    const parsedEndDate = endDate ? new Date(endDate) : undefined;

    // Get the performance metrics
    const metrics = await LoopPerformanceService.getPerformanceMetrics({
      userId: user.id,
      agentId,
      startDate: parsedStartDate,
      endDate: parsedEndDate
    });

    return metrics;
  } catch (error) {
    console.error('Error getting agent performance metrics:', error);
    LoggingService.error({
      message: 'Failed to get agent performance metrics',
      userId: user.id,
      module: 'arcana',
      category: 'SENTIENT_LOOP',
      error,
      metadata: { agentId: args.agentId }
    });
    throw new HttpError(500, 'Failed to get agent performance metrics');
  }
};