/**
 * Agent Query System Tests
 * 
 * This file contains tests for the agent query system, which allows AI agents
 * to construct SQL-like queries safely using a validated schema map.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi, Mock } from 'vitest';
import { prisma } from 'wasp/server';
import { AgentQueryService } from '../server/services/agentQueryService';
import { QuerySandboxService } from '../server/services/querySandboxService';
import { PromptToQueryService } from '../server/services/promptToQueryService';
import { 
  QueryPermissionLevel, 
  QueryApprovalStatus,
} from '../shared/types/entities/agentQuery';

// Mock the prisma client
vi.mock('wasp/server', () => ({
  prisma: {
    schemaMap: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    agentQueryPermission: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    agentQueryRequest: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    queryTemplate: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    aI_Agent: {
      findUnique: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    queryLog: {
      create: vi.fn(),
    },
    userPermission: {
      findFirst: vi.fn(),
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
  },
}));

// Mock the groq completion function
vi.mock('../ai-services/groq', () => ({
  generateGroqCompletion: vi.fn(),
}));

describe('AgentQueryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createSchemaMap', () => {
    it('should create a schema map', async () => {
      const userId = 'user-123';
      const input = {
        name: 'Test Schema Map',
        description: 'A test schema map',
        schema: {
          User: {
            actions: ['findMany', 'findUnique', 'count'],
            allowedFields: ['id', 'username', 'email', 'createdAt'],
            requiredFields: [],
            fieldTypes: {
              id: 'string',
              username: 'string',
              email: 'string',
              createdAt: 'date',
            },
          },
        },
      };

      const mockSchemaMap = {
        id: 'schema-map-123',
        createdAt: new Date(),
        updatedAt: new Date(),
        name: input.name,
        description: input.description,
        version: '1.0.0',
        schema: input.schema,
        isActive: true,
        createdById: userId,
        organizationId: null,
      };

      (prisma.schemaMap.create as Mock).mockResolvedValue(mockSchemaMap);

      const result = await AgentQueryService.createSchemaMap(userId, input);

      expect(prisma.schemaMap.create).toHaveBeenCalledWith({
        data: {
          name: input.name,
          description: input.description,
          version: '1.0.0',
          schema: input.schema,
          isActive: true,
          createdById: userId,
          organizationId: undefined,
        },
      });

      expect(result).toEqual(mockSchemaMap);
    });
  });

  describe('updateSchemaMap', () => {
    it('should update a schema map if the user is the creator', async () => {
      const userId = 'user-123';
      const input = {
        id: 'schema-map-123',
        name: 'Updated Schema Map',
        description: 'An updated schema map',
        schema: {
          User: {
            actions: ['findMany', 'findUnique', 'count'],
            allowedFields: ['id', 'username', 'email', 'createdAt'],
            requiredFields: [],
            fieldTypes: {
              id: 'string',
              username: 'string',
              email: 'string',
              createdAt: 'date',
            },
          },
        },
      };

      const mockExistingSchemaMap = {
        id: input.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'Test Schema Map',
        description: 'A test schema map',
        version: '1.0.0',
        schema: {},
        isActive: true,
        createdById: userId,
        organizationId: null,
      };

      const mockUpdatedSchemaMap = {
        ...mockExistingSchemaMap,
        name: input.name,
        description: input.description,
        schema: input.schema,
      };

      (prisma.schemaMap.findUnique as Mock).mockResolvedValue(mockExistingSchemaMap);
      (prisma.schemaMap.update as Mock).mockResolvedValue(mockUpdatedSchemaMap);

      const result = await AgentQueryService.updateSchemaMap(userId, input);

      expect(prisma.schemaMap.findUnique).toHaveBeenCalledWith({
        where: { id: input.id },
      });

      expect(prisma.schemaMap.update).toHaveBeenCalledWith({
        where: { id: input.id },
        data: {
          name: input.name,
          description: input.description,
          schema: input.schema,
          isActive: undefined,
          version: '1.0.0',
        },
      });

      expect(result).toEqual(mockUpdatedSchemaMap);
    });
  });
});

describe('QuerySandboxService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateQuery', () => {
    it('should validate a query against a schema map', async () => {
      const agentId = 'agent-123';
      const targetModel = 'User';
      const action = 'findMany';
      const queryParams = {
        where: {
          email: {
            contains: 'example.com',
          },
        },
        select: {
          id: true,
          username: true,
          email: true,
        },
      };

      const mockPermissions = [
        {
          id: 'permission-123',
          agentId,
          schemaMapId: 'schema-map-123',
          permissionLevel: QueryPermissionLevel.READ_ONLY,
          allowedModels: ['User', 'Post'],
          allowedActions: ['findMany', 'findUnique', 'count'],
          maxQueriesPerDay: 100,
          requiresApproval: true,
          isActive: true,
          schemaMap: {
            id: 'schema-map-123',
            name: 'Test Schema Map',
            schema: {
              User: {
                actions: ['findMany', 'findUnique', 'count'],
                allowedFields: ['id', 'username', 'email', 'createdAt'],
                requiredFields: [],
                fieldTypes: {
                  id: 'string',
                  username: 'string',
                  email: 'string',
                  createdAt: 'date',
                },
              },
            },
          },
        },
      ];

      (prisma.agentQueryPermission.findMany as Mock).mockResolvedValue(mockPermissions);

      const result = await QuerySandboxService.validateQuery(
        agentId,
        targetModel,
        action,
        queryParams
      );

      expect(prisma.agentQueryPermission.findMany).toHaveBeenCalledWith({
        where: {
          agentId,
          isActive: true,
        },
        include: {
          schemaMap: true,
        },
      });

      expect(result.valid).toBe(true);
    });
  });
});

describe('PromptToQueryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('promptToQuery', () => {
    it('should convert a prompt to a query', async () => {
      const agentId = 'agent-123';
      const userId = 'user-123';
      const sessionId = 'session-123';
      const prompt = 'Find all users with email containing example.com';

      const mockAgent = {
        id: agentId,
        name: 'Test Agent',
        userId,
        queryPermissions: [
          {
            id: 'permission-123',
            agentId,
            schemaMapId: 'schema-map-123',
            permissionLevel: QueryPermissionLevel.READ_ONLY,
            allowedModels: ['User', 'Post'],
            allowedActions: ['findMany', 'findUnique', 'count'],
            maxQueriesPerDay: 100,
            requiresApproval: true,
            isActive: true,
            schemaMap: {
              id: 'schema-map-123',
              name: 'Test Schema Map',
              isActive: true,
              schema: {
                User: {
                  actions: ['findMany', 'findUnique', 'count'],
                  allowedFields: ['id', 'username', 'email', 'createdAt'],
                  requiredFields: [],
                  fieldTypes: {
                    id: 'string',
                    username: 'string',
                    email: 'string',
                    createdAt: 'date',
                  },
                },
              },
            },
          },
        ],
      };

      const mockQueryRequest = {
        id: 'query-request-123',
        agentId,
        userId,
        sessionId,
        prompt,
        generatedQuery: 'prisma.user.findMany({ where: { email: { contains: "example.com" } } })',
        targetModel: 'User',
        action: 'findMany',
        queryParams: {
          where: {
            email: {
              contains: 'example.com',
            },
          },
        },
        status: QueryApprovalStatus.PENDING,
      };

      (prisma.aI_Agent.findUnique as Mock).mockResolvedValue(mockAgent);
      (prisma.agentQueryRequest.count as Mock).mockResolvedValue(0);
      (prisma.agentQueryRequest.create as Mock).mockResolvedValue(mockQueryRequest);

      // Mock the AI-generated query
      vi.spyOn(PromptToQueryService as any, 'generateQueryWithAI').mockResolvedValue({
        success: true,
        query: mockQueryRequest.generatedQuery,
        targetModel: mockQueryRequest.targetModel,
        action: mockQueryRequest.action,
        params: mockQueryRequest.queryParams,
      });

      // Mock the query validation
      vi.spyOn(QuerySandboxService, 'validateQuery').mockResolvedValue({
        valid: true,
      });

      const result = await PromptToQueryService.promptToQuery(
        agentId,
        userId,
        sessionId,
        prompt,
        {
          autoApprove: false,
          useTemplates: true,
        }
      );

      expect(result.success).toBe(true);
      expect(result.queryRequestId).toBe(mockQueryRequest.id);
      expect(result.status).toBe(mockQueryRequest.status);
    });
  });
});
