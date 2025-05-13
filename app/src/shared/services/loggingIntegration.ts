/**
 * Logging Integration Utilities
 *
 * This file provides higher-level utilities for integrating logging into
 * different parts of the application, with pre-configured defaults for
 * common scenarios.
 */

import { LoggingService, Telemetry, type LogLevel, type EventCategory } from './logging';
import { v4 as uuidv4 } from 'uuid';
import type { User } from 'wasp/entities';

/**
 * Context information for logging
 */
export interface LoggingContext {
  user?: User;
  sessionId?: string;
  traceId?: string;
  spanId?: string;
  parentSpanId?: string;
  moduleId?: string;
  organizationId?: string;
}

/**
 * Logging utilities for authentication operations
 */
export const AuthLogging = {
  /**
   * Log a user login event
   */
  logLogin: async (
    user: User,
    context: Partial<LoggingContext> = {},
    metadata: Record<string, any> = {}
  ) => {
    return LoggingService.logSystemEvent({
      message: `User logged in: ${user.email}`,
      level: 'INFO',
      category: 'AUTHENTICATION',
      source: 'auth-service',
      userId: user.id,
      organizationId: user.organizationId,
      sessionId: context.sessionId || uuidv4(),
      traceId: context.traceId,
      spanId: context.spanId,
      parentSpanId: context.parentSpanId,
      tags: ['auth', 'login', 'user-activity'],
      metadata: {
        email: user.email,
        authMethod: metadata.authMethod || 'email',
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        ...metadata,
      },
    });
  },

  /**
   * Log a user logout event
   */
  logLogout: async (
    user: User,
    context: Partial<LoggingContext> = {},
    metadata: Record<string, any> = {}
  ) => {
    return LoggingService.logSystemEvent({
      message: `User logged out: ${user.email}`,
      level: 'INFO',
      category: 'AUTHENTICATION',
      source: 'auth-service',
      userId: user.id,
      organizationId: user.organizationId,
      sessionId: context.sessionId,
      traceId: context.traceId,
      spanId: context.spanId,
      parentSpanId: context.parentSpanId,
      tags: ['auth', 'logout', 'user-activity'],
      metadata: {
        email: user.email,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        ...metadata,
      },
    });
  },

  /**
   * Log a failed login attempt
   */
  logLoginFailure: async (
    email: string,
    reason: string,
    context: Partial<LoggingContext> = {},
    metadata: Record<string, any> = {}
  ) => {
    return LoggingService.logSystemEvent({
      message: `Failed login attempt: ${email} - ${reason}`,
      level: 'WARN',
      category: 'AUTHENTICATION',
      source: 'auth-service',
      sessionId: context.sessionId || uuidv4(),
      traceId: context.traceId,
      spanId: context.spanId,
      parentSpanId: context.parentSpanId,
      tags: ['auth', 'login-failure', 'security'],
      metadata: {
        email,
        reason,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        attemptCount: metadata.attemptCount,
        ...metadata,
      },
    });
  },

  /**
   * Log a password reset request
   */
  logPasswordResetRequest: async (
    email: string,
    context: Partial<LoggingContext> = {},
    metadata: Record<string, any> = {}
  ) => {
    return LoggingService.logSystemEvent({
      message: `Password reset requested: ${email}`,
      level: 'INFO',
      category: 'AUTHENTICATION',
      source: 'auth-service',
      sessionId: context.sessionId || uuidv4(),
      traceId: context.traceId,
      spanId: context.spanId,
      parentSpanId: context.parentSpanId,
      tags: ['auth', 'password-reset', 'security'],
      metadata: {
        email,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        ...metadata,
      },
    });
  },
};

/**
 * Logging utilities for AI operations
 */
export const AiLogging = {
  /**
   * Log an AI inference request
   */
  logInference: async (
    model: string,
    prompt: string,
    context: Partial<LoggingContext> = {},
    metadata: Record<string, any> = {}
  ) => {
    const startTime = Date.now();
    const traceId = context.traceId || uuidv4();
    const spanId = context.spanId || uuidv4();

    return {
      logStart: async () => {
        return LoggingService.logSystemEvent({
          message: `AI inference started: ${model}`,
          level: 'INFO',
          category: 'AI_INTERACTION',
          source: 'ai-service',
          userId: context.user?.id,
          organizationId: context.organizationId || context.user?.organizationId,
          sessionId: context.sessionId,
          traceId,
          spanId,
          parentSpanId: context.parentSpanId,
          tags: ['ai', 'inference', model],
          metadata: {
            model,
            promptLength: prompt.length,
            temperature: metadata.temperature,
            maxTokens: metadata.maxTokens,
            module: metadata.module,
            ...metadata,
          },
        });
      },

      logCompletion: async (response: any, error?: Error) => {
        const duration = Date.now() - startTime;

        if (error) {
          return LoggingService.logSystemEvent({
            message: `AI inference failed: ${model} - ${error.message}`,
            level: 'ERROR',
            category: 'AI_INTERACTION',
            source: 'ai-service',
            userId: context.user?.id,
            organizationId: context.organizationId || context.user?.organizationId,
            sessionId: context.sessionId,
            traceId,
            spanId,
            parentSpanId: context.parentSpanId,
            duration,
            tags: ['ai', 'inference', 'error', model],
            metadata: {
              model,
              promptLength: prompt.length,
              error: error.message,
              stack: error.stack,
              ...metadata,
            },
          });
        }

        return LoggingService.logSystemEvent({
          message: `AI inference completed: ${model}`,
          level: 'INFO',
          category: 'AI_INTERACTION',
          source: 'ai-service',
          userId: context.user?.id,
          organizationId: context.organizationId || context.user?.organizationId,
          sessionId: context.sessionId,
          traceId,
          spanId,
          parentSpanId: context.parentSpanId,
          duration,
          tags: ['ai', 'inference', 'success', model],
          metadata: {
            model,
            promptLength: prompt.length,
            responseLength:
              typeof response === 'string' ? response.length : JSON.stringify(response).length,
            tokensUsed: metadata.tokensUsed,
            ...metadata,
          },
        });
      },
    };
  },

  /**
   * Log an agent action
   */
  logAgentAction: async (
    agentId: string,
    action: string,
    context: Partial<LoggingContext> & { userId: string },
    metadata: Record<string, any> = {}
  ) => {
    return LoggingService.logAgentAction({
      message: `Agent action: ${action}`,
      level: 'INFO',
      source: 'agent-service',
      agentId,
      userId: context.userId,
      organizationId: context.organizationId || context.user?.organizationId,
      sessionId: context.sessionId,
      traceId: context.traceId,
      spanId: context.spanId,
      parentSpanId: context.parentSpanId,
      tags: ['agent', 'action', metadata.category || ''],
      metadata: {
        action,
        inputs: metadata.inputs,
        outputs: metadata.outputs,
        ...metadata,
      },
    });
  },
};

/**
 * Logging utilities for Sentient Loop operations
 */
export const SentientLoopLogging = {
  /**
   * Log a Sentient Loop checkpoint
   */
  logCheckpoint: async (
    checkpointName: string,
    status: 'started' | 'completed' | 'failed',
    context: Partial<LoggingContext> = {},
    metadata: Record<string, any> = {}
  ) => {
    const level: LogLevel = status === 'failed' ? 'ERROR' : 'INFO';

    return LoggingService.logSystemEvent({
      message: `Sentient Loop checkpoint ${status}: ${checkpointName}`,
      level,
      category: 'BUSINESS_LOGIC',
      source: 'sentient-loop',
      userId: context.user?.id,
      organizationId: context.organizationId || context.user?.organizationId,
      sessionId: context.sessionId,
      traceId: context.traceId,
      spanId: context.spanId,
      parentSpanId: context.parentSpanId,
      tags: ['sentient-loop', 'checkpoint', status, checkpointName],
      metadata: {
        checkpointName,
        status,
        ...metadata,
      },
    });
  },

  /**
   * Create a Sentient Loop span for distributed tracing
   */
  createSpan: (name: string, context: Partial<LoggingContext> = {}) => {
    return Telemetry.createSpan(name, 'sentient-loop', {
      traceId: context.traceId,
      parentSpanId: context.spanId,
      userId: context.user?.id,
      organizationId: context.organizationId || context.user?.organizationId,
      sessionId: context.sessionId,
      moduleId: context.moduleId,
    });
  },
};

/**
 * Logging utilities for data operations
 */
export const DataLogging = {
  /**
   * Log a data access event
   */
  logDataAccess: async (
    entity: string,
    operation: 'read' | 'create' | 'update' | 'delete',
    context: Partial<LoggingContext> = {},
    metadata: Record<string, any> = {}
  ) => {
    return LoggingService.logSystemEvent({
      message: `Data ${operation}: ${entity}`,
      level: 'INFO',
      category: 'DATA_ACCESS',
      source: 'data-service',
      userId: context.user?.id,
      organizationId: context.organizationId || context.user?.organizationId,
      sessionId: context.sessionId,
      traceId: context.traceId,
      spanId: context.spanId,
      parentSpanId: context.parentSpanId,
      tags: ['data', operation, entity],
      metadata: {
        entity,
        operation,
        entityId: metadata.entityId,
        changes: metadata.changes,
      },
    });
  },

  /**
   * Log a database query
   */
  logQuery: async (
    model: string,
    action: string,
    duration: number,
    context: Partial<LoggingContext> = {},
    options: {
      params?: any;
      result?: any;
      error?: any;
      isSlow?: boolean;
      resultSize?: number;
      tags?: string[];
    } = {}
  ) => {
    const queryId = uuidv4();
    const isSlow = options.isSlow || false;
    const status = options.error ? 'error' : 'success';

    // Prepare tags
    const tags = [
      'query',
      `model:${model}`,
      `action:${action}`,
      status,
      ...(isSlow ? ['slow'] : []),
      ...(options.tags || []),
    ];

    // Prepare metadata
    const metadata: Record<string, any> = {
      model,
      action,
      duration,
      resultSize: options.resultSize,
      ...(options.params ? { params: JSON.stringify(options.params).substring(0, 1000) } : {}),
      ...(options.result ? { result: JSON.stringify(options.result).substring(0, 1000) } : {}),
      ...(options.error
        ? {
            error: {
              message: options.error.message,
              code: options.error.code,
              meta: options.error.meta,
            },
          }
        : {}),
    };

    return LoggingService.logQueryExecution({
      queryId,
      model,
      action,
      params: options.params ? JSON.stringify(options.params).substring(0, 10000) : undefined,
      duration,
      status,
      isSlow,
      resultSize: options.resultSize,
      errorMessage: options.error?.message,
      tags,
      metadata,
      moduleId: context.moduleId,
      organizationId: context.organizationId || context.user?.organizationId,
      userId: context.user?.id,
    });
  },

  /**
   * Log a data validation error
   */
  logValidationError: async (
    entity: string,
    errors: Record<string, any>,
    context: Partial<LoggingContext> = {},
    metadata: Record<string, any> = {}
  ) => {
    return LoggingService.logSystemEvent({
      message: `Data validation error: ${entity}`,
      level: 'WARN',
      category: 'DATA_ACCESS',
      source: 'data-service',
      userId: context.user?.id,
      organizationId: context.organizationId || context.user?.organizationId,
      sessionId: context.sessionId,
      traceId: context.traceId,
      spanId: context.spanId,
      parentSpanId: context.parentSpanId,
      tags: ['data', 'validation', 'error', entity],
      metadata: {
        entity,
        errors,
        ...metadata,
      },
    });
  },
};

/**
 * Create a logging context from a request context
 */
export function createLoggingContext(requestContext: any): LoggingContext {
  return {
    user: requestContext.user,
    sessionId: requestContext.sessionId,
    traceId: requestContext.traceId,
    spanId: requestContext.spanId,
    parentSpanId: requestContext.parentSpanId,
    moduleId: requestContext.moduleId,
    organizationId: requestContext.user?.organizationId,
  };
}
