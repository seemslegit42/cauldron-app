/**
 * Query Sandbox Service Tests
 * 
 * This file contains unit tests for the QuerySandboxService, which
 * provides a safe environment for executing agent-generated queries.
 */

import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { prisma } from 'wasp/server';
import { QuerySandboxService } from '../server/services/querySandboxService';
import { LoggingService } from '../shared/services/logging';
import { QueryApprovalStatus } from '../shared/types/entities/agentQuery';

// Mock the prisma client
vi.mock('wasp/server', () => ({
  prisma: {
    agentQueryPermission: {
      findMany: vi.fn(),
    },
    agentQueryRequest: {
      findUnique: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    queryLog: {
      create: vi.fn(),
    },
    queryPerformanceMetric: {
      upsert: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    raw: {
      // Mock for prisma.raw
    },
  },
  HttpError: class HttpError extends Error {
    statusCode: number;
    constructor(statusCode: number, message: string) {
      super(message);
      this.statusCode = statusCode;
    }
  },
}));

// Mock the logging service
vi.mock('../shared/services/logging', () => ({
  LoggingService: {
    logSystemEvent: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock uuid
vi.mock('uuid', () => ({
  v4: () => 'mock-uuid',
}));

describe('QuerySandboxService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateQuery', () => {
    it('should validate a query against a schema map', async () => {
      // Mock data
      const agentId = 'agent-123';
      const targetModel = 'User';
      const action = 'findMany';
      const queryParams = {
        where: {
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      };

      // Mock the agent's query permissions
      const mockPermissions = [
        {
          id: 'permission-123',
          agentId,
          schemaMapId: 'schema-map-123',
          permissionLevel: 'READ_ONLY',
          allowedModels: ['User', 'Post'],
          allowedActions: ['findMany', 'findUnique', 'count'],
          requiresApproval: true,
          isActive: true,
          schemaMap: {
            id: 'schema-map-123',
            name: 'Test Schema Map',
            schema: {
              User: {
                actions: ['findMany', 'findUnique', 'count'],
                allowedFields: ['id', 'email', 'name', 'isActive'],
                requiredFields: ['id', 'email'],
                fieldTypes: {
                  id: 'string',
                  email: 'string',
                  name: 'string',
                  isActive: 'boolean',
                },
              },
            },
          },
        },
      ];

      // Set up mocks
      (prisma.agentQueryPermission.findMany as Mock).mockResolvedValue(mockPermissions);

      // Call the validateQuery method
      const result = await QuerySandboxService.validateQuery(
        agentId,
        targetModel,
        action,
        queryParams
      );

      // Verify the result
      expect(result).toBeDefined();
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();

      // Verify that the agent's query permissions were fetched
      expect(prisma.agentQueryPermission.findMany).toHaveBeenCalledWith({
        where: {
          agentId,
          isActive: true,
        },
        include: {
          schemaMap: true,
        },
      });
    });

    it('should return validation errors for invalid queries', async () => {
      // Mock data
      const agentId = 'agent-123';
      const targetModel = 'User';
      const action = 'update'; // Not allowed for READ_ONLY permission
      const queryParams = {
        where: {
          id: 'user-123',
        },
        data: {
          isActive: false,
        },
      };

      // Mock the agent's query permissions
      const mockPermissions = [
        {
          id: 'permission-123',
          agentId,
          schemaMapId: 'schema-map-123',
          permissionLevel: 'READ_ONLY',
          allowedModels: ['User', 'Post'],
          allowedActions: ['findMany', 'findUnique', 'count'],
          requiresApproval: true,
          isActive: true,
          schemaMap: {
            id: 'schema-map-123',
            name: 'Test Schema Map',
            schema: {
              User: {
                actions: ['findMany', 'findUnique', 'count'],
                allowedFields: ['id', 'email', 'name', 'isActive'],
                requiredFields: ['id', 'email'],
                fieldTypes: {
                  id: 'string',
                  email: 'string',
                  name: 'string',
                  isActive: 'boolean',
                },
              },
            },
          },
        },
      ];

      // Set up mocks
      (prisma.agentQueryPermission.findMany as Mock).mockResolvedValue(mockPermissions);

      // Call the validateQuery method
      const result = await QuerySandboxService.validateQuery(
        agentId,
        targetModel,
        action,
        queryParams
      );

      // Verify the result
      expect(result).toBeDefined();
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors).toContain(`Action ${action} not allowed with permission level READ_ONLY`);
    });

    it('should validate field types', async () => {
      // Mock data
      const agentId = 'agent-123';
      const targetModel = 'User';
      const action = 'findMany';
      const queryParams = {
        where: {
          isActive: 'true', // Should be boolean, not string
        },
      };

      // Mock the agent's query permissions
      const mockPermissions = [
        {
          id: 'permission-123',
          agentId,
          schemaMapId: 'schema-map-123',
          permissionLevel: 'READ_ONLY',
          allowedModels: ['User', 'Post'],
          allowedActions: ['findMany', 'findUnique', 'count'],
          requiresApproval: true,
          isActive: true,
          schemaMap: {
            id: 'schema-map-123',
            name: 'Test Schema Map',
            schema: {
              User: {
                actions: ['findMany', 'findUnique', 'count'],
                allowedFields: ['id', 'email', 'name', 'isActive'],
                requiredFields: ['id', 'email'],
                fieldTypes: {
                  id: 'string',
                  email: 'string',
                  name: 'string',
                  isActive: 'boolean',
                },
              },
            },
          },
        },
      ];

      // Set up mocks
      (prisma.agentQueryPermission.findMany as Mock).mockResolvedValue(mockPermissions);

      // Call the validateQuery method
      const result = await QuerySandboxService.validateQuery(
        agentId,
        targetModel,
        action,
        queryParams,
        { sandboxMode: 'strict' }
      );

      // Verify the result
      expect(result).toBeDefined();
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors.some(error => error.includes('should be of type boolean'))).toBe(true);
    });

    it('should add warnings in permissive mode', async () => {
      // Mock data
      const agentId = 'agent-123';
      const targetModel = 'User';
      const action = 'findMany';
      const queryParams = {
        // Missing take parameter
      };

      // Mock the agent's query permissions
      const mockPermissions = [
        {
          id: 'permission-123',
          agentId,
          schemaMapId: 'schema-map-123',
          permissionLevel: 'READ_ONLY',
          allowedModels: ['User', 'Post'],
          allowedActions: ['findMany', 'findUnique', 'count'],
          requiresApproval: true,
          isActive: true,
          schemaMap: {
            id: 'schema-map-123',
            name: 'Test Schema Map',
            schema: {
              User: {
                actions: ['findMany', 'findUnique', 'count'],
                allowedFields: ['id', 'email', 'name', 'isActive'],
                requiredFields: ['id', 'email'],
                fieldTypes: {
                  id: 'string',
                  email: 'string',
                  name: 'string',
                  isActive: 'boolean',
                },
              },
            },
          },
        },
      ];

      // Set up mocks
      (prisma.agentQueryPermission.findMany as Mock).mockResolvedValue(mockPermissions);

      // Call the validateQuery method
      const result = await QuerySandboxService.validateQuery(
        agentId,
        targetModel,
        action,
        queryParams,
        { sandboxMode: 'permissive' }
      );

      // Verify the result
      expect(result).toBeDefined();
      expect(result.valid).toBe(true); // Valid in permissive mode
      expect(result.warnings).toBeDefined();
      expect(result.warnings).toContain('Limit (take) parameter is recommended for findMany operations');
    });
  });

  describe('executeQuery', () => {
    it('should execute a query successfully', async () => {
      // Mock data
      const queryRequestId = 'query-request-123';
      const mockQueryRequest = {
        id: queryRequestId,
        agentId: 'agent-123',
        userId: 'user-123',
        sessionId: 'session-123',
        prompt: 'Find all active users',
        generatedQuery: 'prisma.user.findMany({ where: { isActive: true } })',
        targetModel: 'User',
        action: 'findMany',
        queryParams: {
          where: {
            isActive: true,
          },
        },
        status: QueryApprovalStatus.APPROVED,
      };

      // Mock the query result
      const mockQueryResult = [
        { id: 'user-1', email: 'user1@example.com', name: 'User 1', isActive: true },
        { id: 'user-2', email: 'user2@example.com', name: 'User 2', isActive: true },
      ];

      // Mock the query log
      const mockQueryLog = {
        queryId: 'mock-uuid',
        model: 'User',
        action: 'findMany',
        params: JSON.stringify(mockQueryRequest.queryParams),
        duration: 100,
        status: 'success',
        isSlow: false,
        resultSize: JSON.stringify(mockQueryResult).length,
        errorMessage: null,
        tags: ['agent-generated', 'agent:agent-123'],
        metadata: {
          agentId: 'agent-123',
          userId: 'user-123',
          sessionId: 'session-123',
          queryRequestId,
        },
        userId: 'user-123',
      };

      // Set up mocks
      (prisma.agentQueryRequest.findUnique as Mock).mockResolvedValue(mockQueryRequest);
      vi.spyOn(QuerySandboxService, 'validateQuery').mockResolvedValue({ valid: true });
      vi.spyOn(Date, 'now')
        .mockReturnValueOnce(1000) // Start time
        .mockReturnValueOnce(1100); // End time (100ms later)
      
      // Mock the dynamic method invocation
      const mockPrismaModel = {
        findMany: vi.fn().mockResolvedValue(mockQueryResult),
      };
      (prisma as any).user = mockPrismaModel;
      
      (prisma.queryLog.create as Mock).mockResolvedValue(mockQueryLog);
      (prisma.agentQueryRequest.update as Mock).mockResolvedValue({
        ...mockQueryRequest,
        executedAt: new Date(),
        executionResult: mockQueryResult,
        queryLogId: 'mock-uuid',
      });

      // Call the executeQuery method
      const result = await QuerySandboxService.executeQuery(queryRequestId);

      // Verify the result
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.result).toEqual(mockQueryResult);
      expect(result.error).toBeUndefined();

      // Verify that the query request was fetched
      expect(prisma.agentQueryRequest.findUnique).toHaveBeenCalledWith({
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

      // Verify that the query was validated
      expect(QuerySandboxService.validateQuery).toHaveBeenCalled();

      // Verify that the query was executed
      expect(mockPrismaModel.findMany).toHaveBeenCalledWith(mockQueryRequest.queryParams);

      // Verify that the query log was created
      expect(prisma.queryLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          queryId: 'mock-uuid',
          model: 'User',
          action: 'findMany',
          params: JSON.stringify(mockQueryRequest.queryParams),
          status: 'success',
        }),
      });

      // Verify that the query request was updated
      expect(prisma.agentQueryRequest.update).toHaveBeenCalledWith({
        where: { id: queryRequestId },
        data: expect.objectContaining({
          executedAt: expect.any(Date),
          executionResult: mockQueryResult,
          queryLogId: 'mock-uuid',
        }),
      });
    });

    it('should handle query execution errors', async () => {
      // Mock data
      const queryRequestId = 'query-request-123';
      const mockQueryRequest = {
        id: queryRequestId,
        agentId: 'agent-123',
        userId: 'user-123',
        sessionId: 'session-123',
        prompt: 'Find user by invalid ID',
        generatedQuery: 'prisma.user.findUnique({ where: { id: "invalid-id" } })',
        targetModel: 'User',
        action: 'findUnique',
        queryParams: {
          where: {
            id: 'invalid-id',
          },
        },
        status: QueryApprovalStatus.APPROVED,
      };

      // Mock the error
      const mockError = new Error('User not found');

      // Set up mocks
      (prisma.agentQueryRequest.findUnique as Mock).mockResolvedValue(mockQueryRequest);
      vi.spyOn(QuerySandboxService, 'validateQuery').mockResolvedValue({ valid: true });
      
      // Mock the dynamic method invocation to throw an error
      const mockPrismaModel = {
        findUnique: vi.fn().mockRejectedValue(mockError),
      };
      (prisma as any).user = mockPrismaModel;
      
      (prisma.queryLog.create as Mock).mockResolvedValue({
        queryId: 'mock-uuid',
        status: 'error',
        errorMessage: mockError.message,
      });
      (prisma.agentQueryRequest.update as Mock).mockResolvedValue({
        ...mockQueryRequest,
        executedAt: new Date(),
        executionError: mockError.message,
        queryLogId: 'mock-uuid',
      });

      // Call the executeQuery method
      const result = await QuerySandboxService.executeQuery(queryRequestId);

      // Verify the result
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.result).toBeUndefined();
      expect(result.error).toBe(mockError.message);

      // Verify that the query log was created with error status
      expect(prisma.queryLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'error',
          errorMessage: mockError.message,
        }),
      });

      // Verify that the query request was updated with the error
      expect(prisma.agentQueryRequest.update).toHaveBeenCalledWith({
        where: { id: queryRequestId },
        data: expect.objectContaining({
          executionError: mockError.message,
        }),
      });
    });

    it('should enforce rate limits', async () => {
      // Mock data
      const queryRequestId = 'query-request-123';
      const mockQueryRequest = {
        id: queryRequestId,
        agentId: 'agent-123',
        userId: 'user-123',
        sessionId: 'session-123',
        prompt: 'Find all active users',
        generatedQuery: 'prisma.user.findMany({ where: { isActive: true } })',
        targetModel: 'User',
        action: 'findMany',
        queryParams: {
          where: {
            isActive: true,
          },
        },
        status: QueryApprovalStatus.APPROVED,
      };

      // Set up mocks
      (prisma.agentQueryRequest.findUnique as Mock).mockResolvedValue(mockQueryRequest);
      
      // Mock rate limit check to fail
      vi.spyOn(QuerySandboxService as any, 'checkRateLimits').mockResolvedValue({
        allowed: false,
        reason: 'Daily query limit reached (100/100)',
      });

      // Call the executeQuery method
      const result = await QuerySandboxService.executeQuery(queryRequestId, {
        enforceRateLimit: true,
      });

      // Verify the result
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Daily query limit reached (100/100)');

      // Verify that the query was not executed
      expect(prisma.queryLog.create).not.toHaveBeenCalled();
      expect(prisma.agentQueryRequest.update).not.toHaveBeenCalled();
    });
  });

  describe('checkRateLimits', () => {
    it('should allow queries when under the limit', async () => {
      // Mock data
      const agentId = 'agent-123';
      const userId = 'user-123';

      // Mock the agent's query permissions
      const mockPermissions = [
        {
          id: 'permission-123',
          maxQueriesPerDay: 100,
        },
        {
          id: 'permission-456',
          maxQueriesPerDay: 50,
        },
      ];

      // Mock the query count
      const mockQueryCount = 10; // Well under the limit

      // Set up mocks
      (prisma.agentQueryPermission.findMany as Mock).mockResolvedValue(mockPermissions);
      (prisma.agentQueryRequest.count as Mock).mockResolvedValue(mockQueryCount);

      // Call the checkRateLimits method
      const result = await (QuerySandboxService as any).checkRateLimits(agentId, userId);

      // Verify the result
      expect(result).toBeDefined();
      expect(result.allowed).toBe(true);
      expect(result.reason).toBeUndefined();
      expect(result.warning).toBeUndefined();
    });

    it('should deny queries when over the limit', async () => {
      // Mock data
      const agentId = 'agent-123';
      const userId = 'user-123';

      // Mock the agent's query permissions
      const mockPermissions = [
        {
          id: 'permission-123',
          maxQueriesPerDay: 100,
        },
        {
          id: 'permission-456',
          maxQueriesPerDay: 50, // This is the minimum
        },
      ];

      // Mock the query count
      const mockQueryCount = 50; // Equal to the limit

      // Set up mocks
      (prisma.agentQueryPermission.findMany as Mock).mockResolvedValue(mockPermissions);
      (prisma.agentQueryRequest.count as Mock).mockResolvedValue(mockQueryCount);

      // Call the checkRateLimits method
      const result = await (QuerySandboxService as any).checkRateLimits(agentId, userId);

      // Verify the result
      expect(result).toBeDefined();
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('Daily query limit reached (50/50)');
    });

    it('should warn when approaching the limit', async () => {
      // Mock data
      const agentId = 'agent-123';
      const userId = 'user-123';

      // Mock the agent's query permissions
      const mockPermissions = [
        {
          id: 'permission-123',
          maxQueriesPerDay: 100,
        },
      ];

      // Mock the query count
      const mockQueryCount = 85; // 85% of the limit

      // Set up mocks
      (prisma.agentQueryPermission.findMany as Mock).mockResolvedValue(mockPermissions);
      (prisma.agentQueryRequest.count as Mock).mockResolvedValue(mockQueryCount);

      // Call the checkRateLimits method
      const result = await (QuerySandboxService as any).checkRateLimits(agentId, userId);

      // Verify the result
      expect(result).toBeDefined();
      expect(result.allowed).toBe(true);
      expect(result.warning).toBe('Approaching daily query limit (85/100)');
    });
  });
});
