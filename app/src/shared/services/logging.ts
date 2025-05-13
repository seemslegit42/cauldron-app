/**
 * Comprehensive Logging Service
 *
 * This service provides a unified interface for logging agent actions, human approvals,
 * API interactions, and system events. It supports distributed tracing, event categorization,
 * and detailed metadata tracking.
 */

import { prisma } from 'wasp/server';
import { v4 as uuidv4 } from 'uuid';
import type { User } from 'wasp/entities';

// Types from Prisma schema
export type LogLevel = 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';

export type EventCategory =
  | 'AGENT_ACTION'
  | 'HUMAN_APPROVAL'
  | 'API_INTERACTION'
  | 'SYSTEM_EVENT'
  | 'SECURITY'
  | 'PERFORMANCE'
  | 'DATA_ACCESS'
  | 'AUTHENTICATION'
  | 'AUTHORIZATION'
  | 'BUSINESS_LOGIC'
  | 'INTEGRATION'
  | 'SCHEDULED_TASK';

export type ApprovalStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'MODIFIED';

export type ApiStatus =
  | 'SUCCESS'
  | 'ERROR'
  | 'TIMEOUT'
  | 'RATE_LIMITED'
  | 'INVALID_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'SERVER_ERROR';

export type QueryStatus = 'success' | 'error';

// Base log interface
interface BaseLogParams {
  message: string;
  level?: LogLevel;
  source: string;
  moduleId?: string;
  organizationId?: string;
  userId?: string;
  agentId?: string;
  sessionId?: string;
  traceId?: string;
  spanId?: string;
  parentSpanId?: string;
  duration?: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

// System log interface
export interface SystemLogParams extends BaseLogParams {
  category: EventCategory;
  affectedEntities?: Record<string, any>;
  stackTrace?: string;
}

// Agent log interface
export interface AgentLogParams extends BaseLogParams {
  agentId: string;
  userId: string;
  category?: EventCategory;
  affectedEntities?: Record<string, any>;
}

// API interaction interface
export interface ApiInteractionParams {
  endpoint: string;
  method: string;
  status: ApiStatus;
  statusCode?: number;
  duration: number;
  requestSize?: number;
  responseSize?: number;
  requestPayload?: Record<string, any>;
  responsePayload?: Record<string, any>;
  headers?: Record<string, any>;
  source: string;
  moduleId?: string;
  organizationId?: string;
  userId?: string;
  agentId?: string;
  sessionId?: string;
  traceId?: string;
  spanId?: string;
  parentSpanId?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  errorMessage?: string;
}

// Human approval interface
export interface HumanApprovalParams {
  requestedAction: string;
  requestedBy: string;
  approvedBy?: string;
  reason?: string;
  originalPayload: Record<string, any>;
  modifiedPayload?: Record<string, any>;
  status?: ApprovalStatus;
  moduleId?: string;
  organizationId?: string;
  userId?: string;
  agentId?: string;
  sessionId?: string;
  traceId?: string;
  spanId?: string;
  parentSpanId?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  expiresAt?: Date;
}

// Telemetry span interface
export interface TelemetrySpanParams {
  name: string;
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status?: string;
  attributes?: Record<string, any>;
  events?: Record<string, any>[];
  links?: Record<string, any>[];
  moduleId?: string;
  organizationId?: string;
  userId?: string;
  agentId?: string;
  sessionId?: string;
  source: string;
}

// Query execution interface
export interface QueryExecutionParams {
  queryId: string;
  timestamp?: Date;
  model: string;
  action: string;
  params?: string;
  duration: number;
  status: QueryStatus;
  isSlow: boolean;
  resultSize?: number;
  errorMessage?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  moduleId?: string;
  organizationId?: string;
  userId?: string;
}

/**
 * Logging Service
 * Provides methods for logging different types of events
 */
export class LoggingService {
  /**
   * Create a system log entry
   */
  static async logSystemEvent(params: SystemLogParams): Promise<string> {
    try {
      const log = await prisma.systemLog.create({
        data: {
          timestamp: new Date(),
          level: params.level || 'INFO',
          category: params.category,
          message: params.message,
          source: params.source,
          moduleId: params.moduleId,
          organizationId: params.organizationId,
          userId: params.userId,
          agentId: params.agentId,
          sessionId: params.sessionId,
          traceId: params.traceId || uuidv4(),
          spanId: params.spanId || uuidv4(),
          parentSpanId: params.parentSpanId,
          duration: params.duration,
          tags: params.tags || [],
          metadata: params.metadata || {},
          affectedEntities: params.affectedEntities || {},
          stackTrace: params.stackTrace,
        },
      });

      return log.id;
    } catch (error) {
      console.error('Failed to create system log:', error);
      // Fallback to console logging if database logging fails
      console.log(`[${params.level || 'INFO'}] ${params.message}`);
      return '';
    }
  }

  /**
   * Create an agent log entry
   */
  static async logAgentAction(params: AgentLogParams): Promise<string> {
    try {
      const log = await prisma.agentLog.create({
        data: {
          timestamp: new Date(),
          level: params.level || 'INFO',
          category: params.category || 'AGENT_ACTION',
          message: params.message,
          source: params.source,
          moduleId: params.moduleId,
          organizationId: params.organizationId,
          agentId: params.agentId,
          userId: params.userId,
          sessionId: params.sessionId,
          traceId: params.traceId || uuidv4(),
          spanId: params.spanId || uuidv4(),
          parentSpanId: params.parentSpanId,
          duration: params.duration,
          tags: params.tags || [],
          metadata: params.metadata || {},
          affectedEntities: params.affectedEntities || {},
        },
      });

      return log.id;
    } catch (error) {
      console.error('Failed to create agent log:', error);
      console.log(`[AGENT][${params.level || 'INFO'}] ${params.message}`);
      return '';
    }
  }

  /**
   * Create an API interaction log entry
   */
  static async logApiInteraction(
    params: ApiInteractionParams,
    systemLogId?: string
  ): Promise<string> {
    try {
      const log = await prisma.apiInteraction.create({
        data: {
          timestamp: new Date(),
          endpoint: params.endpoint,
          method: params.method,
          status: params.status,
          statusCode: params.statusCode,
          duration: params.duration,
          requestSize: params.requestSize,
          responseSize: params.responseSize,
          requestPayload: params.requestPayload || {},
          responsePayload: params.responsePayload || {},
          headers: params.headers || {},
          source: params.source,
          moduleId: params.moduleId,
          organizationId: params.organizationId,
          userId: params.userId,
          agentId: params.agentId,
          sessionId: params.sessionId,
          traceId: params.traceId || uuidv4(),
          spanId: params.spanId || uuidv4(),
          parentSpanId: params.parentSpanId,
          tags: params.tags || [],
          metadata: params.metadata || {},
          errorMessage: params.errorMessage,
          systemLogId,
        },
      });

      return log.id;
    } catch (error) {
      console.error('Failed to create API interaction log:', error);
      console.log(`[API][${params.status}] ${params.method} ${params.endpoint}`);
      return '';
    }
  }

  /**
   * Create a human approval log entry
   */
  static async logHumanApproval(
    params: HumanApprovalParams,
    systemLogId?: string
  ): Promise<string> {
    try {
      const log = await prisma.humanApproval.create({
        data: {
          timestamp: new Date(),
          requestTimestamp: new Date(),
          status: params.status || 'PENDING',
          requestedAction: params.requestedAction,
          requestedBy: params.requestedBy,
          approvedBy: params.approvedBy,
          reason: params.reason,
          originalPayload: params.originalPayload,
          modifiedPayload: params.modifiedPayload,
          moduleId: params.moduleId,
          organizationId: params.organizationId,
          userId: params.userId,
          agentId: params.agentId,
          sessionId: params.sessionId,
          traceId: params.traceId || uuidv4(),
          spanId: params.spanId || uuidv4(),
          parentSpanId: params.parentSpanId,
          tags: params.tags || [],
          metadata: params.metadata || {},
          expiresAt: params.expiresAt,
          systemLogId,
        },
      });

      return log.id;
    } catch (error) {
      console.error('Failed to create human approval log:', error);
      console.log(`[APPROVAL][${params.status || 'PENDING'}] ${params.requestedAction}`);
      return '';
    }
  }

  /**
   * Update a human approval status
   */
  static async updateHumanApproval(
    approvalId: string,
    status: ApprovalStatus,
    approvedBy?: string,
    reason?: string,
    modifiedPayload?: Record<string, any>
  ): Promise<boolean> {
    try {
      await prisma.humanApproval.update({
        where: { id: approvalId },
        data: {
          status,
          approvedBy,
          reason,
          modifiedPayload,
          responseTimestamp: new Date(),
        },
      });

      return true;
    } catch (error) {
      console.error('Failed to update human approval:', error);
      return false;
    }
  }

  /**
   * Create a telemetry span
   */
  static async createTelemetrySpan(params: TelemetrySpanParams): Promise<string> {
    try {
      const span = await prisma.telemetrySpan.create({
        data: {
          traceId: params.traceId,
          spanId: params.spanId,
          parentSpanId: params.parentSpanId,
          name: params.name,
          startTime: params.startTime,
          endTime: params.endTime,
          duration: params.duration,
          status: params.status || 'OK',
          attributes: params.attributes || {},
          events: params.events || [],
          links: params.links || [],
          moduleId: params.moduleId,
          organizationId: params.organizationId,
          userId: params.userId,
          agentId: params.agentId,
          sessionId: params.sessionId,
          source: params.source,
        },
      });

      return span.id;
    } catch (error) {
      console.error('Failed to create telemetry span:', error);
      return '';
    }
  }

  /**
   * End a telemetry span
   */
  static async endTelemetrySpan(spanId: string, status: string = 'OK'): Promise<boolean> {
    try {
      const span = await prisma.telemetrySpan.findUnique({
        where: { id: spanId },
      });

      if (!span) return false;

      const endTime = new Date();
      const duration = endTime.getTime() - span.startTime.getTime();

      await prisma.telemetrySpan.update({
        where: { id: spanId },
        data: {
          endTime,
          duration,
          status,
        },
      });

      return true;
    } catch (error) {
      console.error('Failed to end telemetry span:', error);
      return false;
    }
  }

  /**
   * Log a database query execution
   */
  static async logQueryExecution(params: QueryExecutionParams): Promise<string> {
    try {
      const log = await prisma.queryLog.create({
        data: {
          timestamp: params.timestamp || new Date(),
          queryId: params.queryId,
          model: params.model,
          action: params.action,
          params: params.params,
          duration: params.duration,
          status: params.status,
          isSlow: params.isSlow,
          resultSize: params.resultSize,
          errorMessage: params.errorMessage,
          tags: params.tags || [],
          metadata: params.metadata || {},
          moduleId: params.moduleId,
          organizationId: params.organizationId,
          userId: params.userId,
        },
      });

      return log.id;
    } catch (error) {
      console.error('Failed to log query execution:', error);
      // Fallback to console logging if database logging fails
      console.log(
        `[QUERY] ${params.model}.${params.action} (${params.duration}ms, ${params.status})`
      );
      return '';
    }
  }
}
