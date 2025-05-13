/**
 * Query Sandbox Service
 *
 * This service provides a safe environment for executing agent-generated queries.
 * It validates queries against schema maps, enforces permissions, and applies rate limits.
 */

import { prisma } from 'wasp/server';
import { HttpError } from 'wasp/server';
import { LoggingService } from '../../shared/services/logging';
import {
  QueryPermissionLevel,
  QueryApprovalStatus,
  AgentQueryRequest
} from '../../shared/types/entities/agentQuery';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { QueryPerformanceService } from './queryPerformanceService';
import { SentientQueryService } from './sentientQueryService';

// Define the schema for query parameters
const queryParamsSchema = z.record(z.any());

// Define the schema for query execution options
const queryExecutionOptionsSchema = z.object({
  timeout: z.number().optional().default(5000), // Default timeout of 5 seconds
  maxResultSize: z.number().optional().default(1000), // Default max result size of 1000 items
  dryRun: z.boolean().optional().default(false), // Whether to execute the query or just validate it
  trackPerformance: z.boolean().optional().default(true), // Whether to track query performance
  enforceRateLimit: z.boolean().optional().default(true), // Whether to enforce rate limits
  logQuery: z.boolean().optional().default(true), // Whether to log the query
  sandboxMode: z.enum(['strict', 'permissive']).optional().default('strict'), // Sandbox mode
});

// Define the type for query execution options
type QueryExecutionOptions = z.infer<typeof queryExecutionOptionsSchema>;

// Define sensitive models that require extra scrutiny
const SENSITIVE_MODELS = [
  'User',
  'Organization',
  'APIKey',
  'CredentialStore',
  'SentientLoopApiKey',
  'Subscription',
  'SubscriptionInvoice'
];

/**
 * Query Sandbox Service
 */
export class QuerySandboxService {
  /**
   * Validate a query against a schema map
   */
  static async validateQuery(
    agentId: string,
    targetModel: string,
    action: string,
    queryParams: Record<string, any>,
    options: { sandboxMode?: 'strict' | 'permissive' } = {}
  ): Promise<{ valid: boolean; errors?: string[]; warnings?: string[] }> {
    try {
      const { sandboxMode = 'strict' } = options;
      const errors: string[] = [];
      const warnings: string[] = [];

      // Get the agent's query permissions
      const permissions = await prisma.agentQueryPermission.findMany({
        where: {
          agentId,
          isActive: true,
        },
        include: {
          schemaMap: true,
        },
      });

      if (permissions.length === 0) {
        return { valid: false, errors: ['Agent has no query permissions'] };
      }

      // Check if the agent has permission to query the target model with the specified action
      const hasPermission = permissions.some(permission => {
        return (
          permission.allowedModels.includes(targetModel) &&
          permission.allowedActions.includes(action)
        );
      });

      if (!hasPermission) {
        return {
          valid: false,
          errors: [`Agent does not have permission to ${action} on ${targetModel}`]
        };
      }

      // Get the schema map for the target model
      const permission = permissions.find(p => p.allowedModels.includes(targetModel));
      const schemaMap = permission?.schemaMap;

      if (!schemaMap) {
        return { valid: false, errors: ['No schema map found for the target model'] };
      }

      // Check permission level for the action
      const permissionLevel = permission?.permissionLevel;
      if (
        (permissionLevel === 'READ_ONLY' && ['create', 'update', 'delete', 'upsert'].includes(action)) ||
        (permissionLevel === 'READ_WRITE' && ['delete'].includes(action))
      ) {
        return {
          valid: false,
          errors: [`Action ${action} not allowed with permission level ${permissionLevel}`]
        };
      }

      // Extra validation for sensitive models
      if (SENSITIVE_MODELS.includes(targetModel)) {
        // For sensitive models, only allow specific actions
        if (['delete', 'deleteMany', 'update', 'updateMany', 'upsert'].includes(action)) {
          return {
            valid: false,
            errors: [`Action ${action} not allowed on sensitive model ${targetModel}`]
          };
        }

        // For sensitive models, always require a where clause to limit results
        if (['findMany', 'count'].includes(action) && (!queryParams.where || Object.keys(queryParams.where).length === 0)) {
          errors.push(`Where clause is required for ${action} on sensitive model ${targetModel}`);
        }

        // For sensitive models, always limit the number of results
        if (['findMany'].includes(action) && !queryParams.take) {
          if (sandboxMode === 'strict') {
            errors.push(`Take parameter is required for ${action} on sensitive model ${targetModel}`);
          } else {
            warnings.push(`Take parameter is recommended for ${action} on sensitive model ${targetModel}`);
            // Auto-add a reasonable limit in permissive mode
            queryParams.take = 50;
          }
        }
      }

      // Validate the query parameters against the schema map
      const modelSchema = schemaMap.schema[targetModel];
      if (!modelSchema) {
        return { valid: false, errors: [`Model ${targetModel} not found in schema map`] };
      }

      // Validate the action is allowed for the model
      if (!modelSchema.actions || !modelSchema.actions.includes(action)) {
        return { valid: false, errors: [`Action ${action} not allowed for model ${targetModel}`] };
      }

      // Check for required fields
      if (modelSchema.requiredFields && action === 'create') {
        for (const field of modelSchema.requiredFields) {
          if (!(field in queryParams.data)) {
            errors.push(`Required field ${field} is missing in create data`);
          }
        }
      }

      // Check for allowed fields in different parameter objects
      if (modelSchema.allowedFields) {
        // Check fields in the main query params
        this.validateAllowedFields(queryParams, modelSchema.allowedFields, errors, '', sandboxMode);

        // Check fields in the where clause
        if (queryParams.where) {
          this.validateAllowedFields(queryParams.where, modelSchema.allowedFields, errors, 'where.', sandboxMode);
        }

        // Check fields in the data object (for create/update)
        if (queryParams.data) {
          this.validateAllowedFields(queryParams.data, modelSchema.allowedFields, errors, 'data.', sandboxMode);
        }

        // Check fields in the select object
        if (queryParams.select) {
          this.validateAllowedFields(queryParams.select, modelSchema.allowedFields, errors, 'select.', sandboxMode);
        }

        // Check fields in the include object
        if (queryParams.include) {
          // For include, we need to check if the relations are allowed
          if (modelSchema.relations) {
            for (const field in queryParams.include) {
              if (!(field in modelSchema.relations)) {
                errors.push(`Relation ${field} in include is not allowed`);
              }
            }
          } else {
            errors.push(`Include not allowed as no relations are defined in the schema`);
          }
        }
      }

      // Check for field types
      if (modelSchema.fieldTypes) {
        // Check types in the main query params
        this.validateFieldTypes(queryParams, modelSchema.fieldTypes, errors, '');

        // Check types in the where clause
        if (queryParams.where) {
          this.validateFieldTypes(queryParams.where, modelSchema.fieldTypes, errors, 'where.');
        }

        // Check types in the data object (for create/update)
        if (queryParams.data) {
          this.validateFieldTypes(queryParams.data, modelSchema.fieldTypes, errors, 'data.');
        }
      }

      // Check for potential SQL injection in string values
      this.checkForSqlInjection(queryParams, errors);

      // Check for reasonable limits on findMany operations
      if (action === 'findMany' && !queryParams.take && !queryParams.first) {
        if (sandboxMode === 'strict') {
          errors.push('Limit (take) parameter is required for findMany operations');
        } else {
          warnings.push('Limit (take) parameter is recommended for findMany operations');
          // Auto-add a reasonable limit in permissive mode
          queryParams.take = 100;
        }
      }

      // Check for excessive take values
      if (queryParams.take && queryParams.take > 1000) {
        if (sandboxMode === 'strict') {
          errors.push(`Take value (${queryParams.take}) exceeds maximum allowed (1000)`);
        } else {
          warnings.push(`Take value (${queryParams.take}) exceeds recommended maximum (1000)`);
          // Auto-limit in permissive mode
          queryParams.take = 1000;
        }
      }

      // Log validation results
      LoggingService.debug({
        message: 'Query validation results',
        category: 'AGENT_QUERY',
        metadata: {
          agentId,
          targetModel,
          action,
          valid: errors.length === 0,
          errors,
          warnings
        }
      });

      return {
        valid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined
      };
    } catch (error) {
      console.error('Error validating query:', error);
      return { valid: false, errors: ['Internal error validating query'] };
    }
  }

  /**
   * Validate allowed fields recursively
   */
  private static validateAllowedFields(
    params: Record<string, any>,
    allowedFields: string[],
    errors: string[],
    prefix: string = '',
    sandboxMode: 'strict' | 'permissive' = 'strict'
  ): void {
    for (const field in params) {
      // Skip special Prisma operators
      if (field.startsWith('_')) continue;

      // Handle nested objects in where clauses (e.g., where: { name: { contains: 'value' } })
      if (typeof params[field] === 'object' && params[field] !== null && !Array.isArray(params[field])) {
        // Check if this is a Prisma operator object
        const isPrismaOperator = Object.keys(params[field]).some(key =>
          ['equals', 'not', 'in', 'notIn', 'lt', 'lte', 'gt', 'gte', 'contains', 'startsWith', 'endsWith'].includes(key)
        );

        if (isPrismaOperator) {
          // This is a Prisma operator object, so check if the field is allowed
          if (!allowedFields.includes(field)) {
            errors.push(`Field ${prefix}${field} is not allowed`);
          }
        } else {
          // This is a nested object, so recurse
          this.validateAllowedFields(params[field], allowedFields, errors, `${prefix}${field}.`, sandboxMode);
        }
      } else {
        // This is a regular field, so check if it's allowed
        if (!allowedFields.includes(field)) {
          if (sandboxMode === 'strict') {
            errors.push(`Field ${prefix}${field} is not allowed`);
          } else {
            // In permissive mode, just remove the field
            delete params[field];
          }
        }
      }
    }
  }

  /**
   * Validate field types recursively
   */
  private static validateFieldTypes(
    params: Record<string, any>,
    fieldTypes: Record<string, string>,
    errors: string[],
    prefix: string = ''
  ): void {
    for (const field in params) {
      // Skip special Prisma operators
      if (field.startsWith('_')) continue;

      // Handle nested objects
      if (typeof params[field] === 'object' && params[field] !== null && !Array.isArray(params[field])) {
        // Check if this is a Prisma operator object
        const isPrismaOperator = Object.keys(params[field]).some(key =>
          ['equals', 'not', 'in', 'notIn', 'lt', 'lte', 'gt', 'gte', 'contains', 'startsWith', 'endsWith'].includes(key)
        );

        if (isPrismaOperator) {
          // This is a Prisma operator object, so check the field type
          if (field in fieldTypes) {
            // Check the type of the operator values
            for (const op in params[field]) {
              const value = params[field][op];
              if (value !== null && value !== undefined) {
                const expectedType = fieldTypes[field];
                const actualType = typeof value;

                // Special handling for dates
                if (expectedType === 'date' && (actualType === 'string' || actualType === 'object')) {
                  // Allow string dates or Date objects
                  if (actualType === 'string') {
                    const isValidDate = !isNaN(Date.parse(value));
                    if (!isValidDate) {
                      errors.push(`Field ${prefix}${field}.${op} should be a valid date string, but got ${value}`);
                    }
                  }
                } else if (expectedType !== actualType && !(expectedType === 'number' && actualType === 'bigint')) {
                  errors.push(`Field ${prefix}${field}.${op} should be of type ${expectedType}, but got ${actualType}`);
                }
              }
            }
          }
        } else {
          // This is a nested object, so recurse
          this.validateFieldTypes(params[field], fieldTypes, errors, `${prefix}${field}.`);
        }
      } else if (field in fieldTypes) {
        // This is a regular field with a defined type
        const expectedType = fieldTypes[field];
        const actualType = typeof params[field];

        // Special handling for dates
        if (expectedType === 'date' && (actualType === 'string' || actualType === 'object')) {
          // Allow string dates or Date objects
          if (actualType === 'string') {
            const isValidDate = !isNaN(Date.parse(params[field]));
            if (!isValidDate) {
              errors.push(`Field ${prefix}${field} should be a valid date string, but got ${params[field]}`);
            }
          }
        } else if (expectedType !== actualType && !(expectedType === 'number' && actualType === 'bigint')) {
          errors.push(`Field ${prefix}${field} should be of type ${expectedType}, but got ${actualType}`);
        }
      }
    }
  }

  /**
   * Check for potential SQL injection in string values
   */
  private static checkForSqlInjection(params: Record<string, any>, errors: string[]): void {
    const sqlInjectionPatterns = [
      /'\s*OR\s*'1'\s*=\s*'1/i,
      /'\s*OR\s*1\s*=\s*1/i,
      /'\s*;\s*DROP\s+TABLE/i,
      /'\s*;\s*DELETE\s+FROM/i,
      /'\s*UNION\s+SELECT/i,
      /'\s*;\s*INSERT\s+INTO/i,
      /'\s*;\s*UPDATE\s+/i,
      /'\s*--/i,
      /\/\*/i,
      /xp_cmdshell/i
    ];

    const checkValue = (value: any, path: string) => {
      if (typeof value === 'string') {
        for (const pattern of sqlInjectionPatterns) {
          if (pattern.test(value)) {
            errors.push(`Potential SQL injection detected in ${path}: ${value}`);
            break;
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        for (const key in value) {
          checkValue(value[key], `${path}.${key}`);
        }
      }
    };

    for (const key in params) {
      checkValue(params[key], key);
    }
  }

  /**
   * Execute a query in the sandbox
   */
  static async executeQuery(
    queryRequestId: string,
    options: QueryExecutionOptions = {}
  ): Promise<{ success: boolean; result?: any; error?: string; warnings?: string[] }> {
    try {
      // Merge options with defaults
      const mergedOptions = queryExecutionOptionsSchema.parse(options);
      const warnings: string[] = [];

      // Get the query request
      const queryRequest = await prisma.agentQueryRequest.findUnique({
        where: { id: queryRequestId },
        include: {
          agent: {
            include: {
              queryPermissions: {
                include: {
                  schemaMap: true,
                },
              },
            },
          },
        },
      });

      if (!queryRequest) {
        return { success: false, error: 'Query request not found' };
      }

      // Check if the query is approved
      if (queryRequest.status !== QueryApprovalStatus.APPROVED &&
          queryRequest.status !== QueryApprovalStatus.AUTO_APPROVED) {
        return { success: false, error: 'Query request is not approved' };
      }

      // Check rate limits if enabled
      if (mergedOptions.enforceRateLimit) {
        const rateCheckResult = await this.checkRateLimits(queryRequest.agentId, queryRequest.userId);
        if (!rateCheckResult.allowed) {
          return { success: false, error: rateCheckResult.reason };
        }
        if (rateCheckResult.warning) {
          warnings.push(rateCheckResult.warning);
        }
      }

      // Validate the query again to ensure it's still valid
      const validation = await this.validateQuery(
        queryRequest.agentId,
        queryRequest.targetModel,
        queryRequest.action,
        queryRequest.queryParams as Record<string, any> || {},
        { sandboxMode: mergedOptions.sandboxMode }
      );

      if (!validation.valid) {
        return {
          success: false,
          error: `Query validation failed: ${validation.errors?.join(', ')}`
        };
      }

      // Add any validation warnings
      if (validation.warnings && validation.warnings.length > 0) {
        warnings.push(...validation.warnings);
      }

      // If this is a dry run, return success without executing
      if (mergedOptions.dryRun) {
        return {
          success: true,
          result: { dryRun: true },
          warnings: warnings.length > 0 ? warnings : undefined
        };
      }

      // Generate a unique query ID
      const queryId = uuidv4();

      // Check if the query result is cached
      const model = queryRequest.targetModel.toLowerCase();
      const action = queryRequest.action;
      const params = queryRequest.queryParams as Record<string, any> || {};

      // Only use cache for read operations
      const isCacheable = ['findMany', 'findUnique', 'findFirst', 'count', 'aggregate'].includes(action);

      if (isCacheable) {
        // Generate cache key
        const cacheKey = QueryPerformanceService.generateCacheKey(
          queryRequest.targetModel,
          queryRequest.action,
          params,
          {
            userId: queryRequest.userId,
            agentId: queryRequest.agentId,
          }
        );

        // Try to get from cache
        const cachedResult = await QueryPerformanceService.getCachedQueryResult(cacheKey);

        if (cachedResult) {
          // Log cache hit
          LoggingService.debug({
            message: 'Query cache hit',
            category: 'AGENT_QUERY',
            metadata: {
              queryRequestId,
              targetModel: queryRequest.targetModel,
              action: queryRequest.action,
              cacheKey,
            }
          });

          // Update the query request with the cached result
          await prisma.agentQueryRequest.update({
            where: { id: queryRequest.id },
            data: {
              executedAt: new Date(),
              executionResult: cachedResult,
              metadata: {
                ...(queryRequest.metadata as any || {}),
                fromCache: true,
              },
            },
          });

          return {
            success: true,
            result: cachedResult,
            warnings: warnings.length > 0 ? warnings : undefined
          };
        }
      }

      // Execute the query
      let result;
      let error;
      const startTime = Date.now();

      try {
        // Apply additional safety measures for sensitive models
        if (SENSITIVE_MODELS.includes(queryRequest.targetModel)) {
          // For sensitive models, always limit the number of results
          if (['findMany'].includes(action) && !params.take) {
            params.take = 50;
            warnings.push(`Automatically limited result size to 50 for sensitive model ${queryRequest.targetModel}`);
          }

          // For sensitive models, always require a where clause
          if (['findMany', 'count'].includes(action) && (!params.where || Object.keys(params.where).length === 0)) {
            return {
              success: false,
              error: `Where clause is required for ${action} on sensitive model ${queryRequest.targetModel}`
            };
          }
        }

        // Set a timeout for the query execution
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Query execution timed out after ${mergedOptions.timeout}ms`));
          }, mergedOptions.timeout);
        });

        // Execute the query with a timeout
        result = await Promise.race([
          prisma[model][action](params),
          timeoutPromise
        ]);

        // Limit the result size if needed
        if (Array.isArray(result) && result.length > mergedOptions.maxResultSize) {
          const originalLength = result.length;
          result = result.slice(0, mergedOptions.maxResultSize);
          warnings.push(`Result truncated from ${originalLength} to ${mergedOptions.maxResultSize} items`);
        }

        // Sanitize sensitive data if present
        result = this.sanitizeSensitiveData(result, queryRequest.targetModel);

        // Cache the result if cacheable
        if (isCacheable && result) {
          const cacheKey = QueryPerformanceService.generateCacheKey(
            queryRequest.targetModel,
            queryRequest.action,
            params,
            {
              userId: queryRequest.userId,
              agentId: queryRequest.agentId,
            }
          );

          await QueryPerformanceService.cacheQueryResult(
            cacheKey,
            result,
            {
              model: queryRequest.targetModel,
              action: queryRequest.action,
              params,
              userId: queryRequest.userId,
              agentId: queryRequest.agentId,
            }
          );
        }
      } catch (err) {
        error = err instanceof Error ? err.message : String(err);

        // Log detailed error information
        LoggingService.error({
          message: `Error executing agent query: ${error}`,
          category: 'AGENT_QUERY',
          metadata: {
            queryRequestId,
            targetModel: queryRequest.targetModel,
            action: queryRequest.action,
            error
          }
        });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Store query execution plan for slow queries
      if (!error && duration > 500 && ['findMany', 'findFirst'].includes(action)) {
        await QueryPerformanceService.storeQueryExecutionPlan(
          queryId,
          queryRequest.targetModel,
          queryRequest.action,
          params
        );
      }

      // Log the query execution if enabled
      if (mergedOptions.logQuery) {
        const queryLog = await prisma.queryLog.create({
          data: {
            queryId,
            model: queryRequest.targetModel,
            action: queryRequest.action,
            params: JSON.stringify(queryRequest.queryParams),
            duration,
            status: error ? 'error' : 'success',
            isSlow: duration > 500, // Mark as slow if it takes more than 500ms
            resultSize: result ? JSON.stringify(result).length : 0,
            errorMessage: error,
            tags: ['agent-generated', `agent:${queryRequest.agentId}`],
            metadata: {
              agentId: queryRequest.agentId,
              userId: queryRequest.userId,
              sessionId: queryRequest.sessionId,
              queryRequestId: queryRequest.id,
              warnings: warnings.length > 0 ? warnings : undefined
            },
            userId: queryRequest.userId,
          },
        });

        // Update the query request with the execution result
        await prisma.agentQueryRequest.update({
          where: { id: queryRequest.id },
          data: {
            executedAt: new Date(),
            executionResult: result ? result : undefined,
            executionError: error,
            queryLogId: queryLog.queryId,
          },
        });
      } else {
        // Just update the query request without creating a log
        await prisma.agentQueryRequest.update({
          where: { id: queryRequest.id },
          data: {
            executedAt: new Date(),
            executionResult: result ? result : undefined,
            executionError: error,
          },
        });
      }

      // Track performance metrics if enabled
      if (mergedOptions.trackPerformance && !error) {
        await QueryPerformanceService.trackQueryPerformance(
          queryRequest.targetModel,
          queryRequest.action,
          duration,
          result ? JSON.stringify(result).length : 0,
          queryRequest.agent?.moduleId
        );
      }

      return {
        success: !error,
        result: result,
        error: error,
        warnings: warnings.length > 0 ? warnings : undefined
      };
    } catch (error) {
      console.error('Error executing query:', error);
      return { success: false, error: 'Internal error executing query' };
    }
  }

  /**
   * Check rate limits for an agent
   */
  private static async checkRateLimits(
    agentId: string,
    userId: string
  ): Promise<{ allowed: boolean; reason?: string; warning?: string }> {
    try {
      // Get the agent's query permissions
      const permissions = await prisma.agentQueryPermission.findMany({
        where: {
          agentId,
          isActive: true,
        },
      });

      if (permissions.length === 0) {
        return { allowed: false, reason: 'Agent has no query permissions' };
      }

      // Get the minimum max queries per day from all permissions
      const maxQueriesPerDay = Math.min(
        ...permissions.map(permission => permission.maxQueriesPerDay)
      );

      // Count queries made today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const queryCount = await prisma.agentQueryRequest.count({
        where: {
          agentId,
          createdAt: {
            gte: today,
          },
        },
      });

      // Check if the agent has reached the daily query limit
      if (queryCount >= maxQueriesPerDay) {
        return {
          allowed: false,
          reason: `Daily query limit reached (${queryCount}/${maxQueriesPerDay})`
        };
      }

      // Check if the agent is approaching the daily query limit
      if (queryCount >= maxQueriesPerDay * 0.8) {
        return {
          allowed: true,
          warning: `Approaching daily query limit (${queryCount}/${maxQueriesPerDay})`
        };
      }

      // Check for burst rate limiting (too many queries in a short time)
      const lastFiveMinutes = new Date(Date.now() - 5 * 60 * 1000);
      const recentQueryCount = await prisma.agentQueryRequest.count({
        where: {
          agentId,
          createdAt: {
            gte: lastFiveMinutes,
          },
        },
      });

      // If more than 20 queries in the last 5 minutes, apply burst rate limiting
      const burstLimit = 20;
      if (recentQueryCount >= burstLimit) {
        return {
          allowed: false,
          reason: `Burst rate limit reached (${recentQueryCount} queries in the last 5 minutes)`
        };
      }

      return { allowed: true };
    } catch (error) {
      console.error('Error checking rate limits:', error);
      return { allowed: false, reason: 'Internal error checking rate limits' };
    }
  }

  /**
   * Track query performance metrics
   */
  private static async trackQueryPerformance(
    model: string,
    action: string,
    duration: number,
    result: any
  ): Promise<void> {
    try {
      // Calculate result size
      const resultSize = result ? JSON.stringify(result).length : 0;

      // Determine if the query is slow
      const isSlow = duration > 500;

      // Store performance metrics
      await prisma.queryPerformanceMetric.upsert({
        where: {
          modelAction: `${model}:${action}`
        },
        update: {
          totalExecutions: { increment: 1 },
          totalDuration: { increment: duration },
          totalResultSize: { increment: resultSize },
          slowExecutions: isSlow ? { increment: 1 } : undefined,
          lastExecutionAt: new Date(),
          averageDuration: {
            set: prisma.raw(`(total_duration + ${duration}) / (total_executions + 1)`)
          },
          averageResultSize: {
            set: prisma.raw(`(total_result_size + ${resultSize}) / (total_executions + 1)`)
          }
        },
        create: {
          modelAction: `${model}:${action}`,
          model,
          action,
          totalExecutions: 1,
          totalDuration: duration,
          totalResultSize: resultSize,
          slowExecutions: isSlow ? 1 : 0,
          lastExecutionAt: new Date(),
          averageDuration: duration,
          averageResultSize: resultSize
        }
      });
    } catch (error) {
      console.error('Error tracking query performance:', error);
      // Don't throw, just log the error
    }
  }

  /**
   * Sanitize sensitive data from query results
   */
  private static sanitizeSensitiveData(result: any, model: string): any {
    // If not a sensitive model, return as is
    if (!SENSITIVE_MODELS.includes(model)) {
      return result;
    }

    // Define fields to redact for each sensitive model
    const sensitiveFields: Record<string, string[]> = {
      'User': ['password', 'passwordHash', 'passwordSalt', 'resetToken', 'verificationToken', 'twoFactorSecret'],
      'Organization': ['apiKey', 'secretKey'],
      'APIKey': ['key', 'secret'],
      'CredentialStore': ['value', 'encryptedValue'],
      'SentientLoopApiKey': ['key', 'secret'],
      'Subscription': ['stripeCustomerId', 'stripeSubscriptionId'],
      'SubscriptionInvoice': ['stripeInvoiceId', 'stripePaymentIntentId']
    };

    // Get the fields to redact for this model
    const fieldsToRedact = sensitiveFields[model] || [];

    // If no fields to redact, return as is
    if (fieldsToRedact.length === 0) {
      return result;
    }

    // Sanitize the result
    if (Array.isArray(result)) {
      // Sanitize each item in the array
      return result.map(item => this.sanitizeObject(item, fieldsToRedact));
    } else if (result && typeof result === 'object') {
      // Sanitize a single object
      return this.sanitizeObject(result, fieldsToRedact);
    }

    // Return as is if not an array or object
    return result;
  }

  /**
   * Sanitize sensitive fields in an object
   */
  private static sanitizeObject(obj: Record<string, any>, sensitiveFields: string[]): Record<string, any> {
    // Create a copy of the object
    const sanitized = { ...obj };

    // Redact sensitive fields
    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}
