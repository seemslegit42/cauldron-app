/**
 * Prompt-to-Query Service Tests
 * 
 * This file contains unit tests for the PromptToQueryService, which
 * converts natural language prompts to safe Prisma queries.
 */

import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { prisma } from 'wasp/server';
import { PromptToQueryService } from '../server/services/promptToQueryService';
import { QuerySandboxService } from '../server/services/querySandboxService';
import { LoggingService } from '../shared/services/logging';
import { generateGroqCompletion } from '../ai-services/groq';
import { QueryApprovalStatus } from '../shared/types/entities/agentQuery';

// Mock the prisma client
vi.mock('wasp/server', () => ({
  prisma: {
    aI_Agent: {
      findUnique: vi.fn(),
    },
    agentQueryRequest: {
      create: vi.fn(),
      count: vi.fn(),
    },
    schemaMap: {
      findMany: vi.fn(),
    },
    queryTemplate: {
      findMany: vi.fn(),
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

// Mock the QuerySandboxService
vi.mock('../server/services/querySandboxService', () => ({
  QuerySandboxService: {
    validateQuery: vi.fn(),
    executeQuery: vi.fn(),
  },
}));

// Mock the groq completion function
vi.mock('../ai-services/groq', () => ({
  generateGroqCompletion: vi.fn(),
}));

describe('PromptToQueryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('promptToQuery', () => {
    it('should convert a prompt to a query and create a query request', async () => {
      // Mock data
      const agentId = 'agent-123';
      const userId = 'user-123';
      const sessionId = 'session-123';
      const prompt = 'Find all active users';

      // Mock the agent
      const mockAgent = {
        id: agentId,
        name: 'Test Agent',
        queryPermissions: [
          {
            id: 'permission-123',
            schemaMapId: 'schema-map-123',
            allowedModels: ['User'],
            requiresApproval: true,
          },
        ],
      };

      // Mock the schema maps
      const mockSchemaMaps = [
        {
          id: 'schema-map-123',
          name: 'Test Schema Map',
          isActive: true,
          schema: {
            User: {
              actions: ['findMany', 'findUnique', 'count'],
              allowedFields: ['id', 'email', 'name', 'isActive'],
              requiredFields: ['id', 'email'],
              fieldTypes: {
                id: 'String',
                email: 'String',
                name: 'String',
                isActive: 'Boolean',
              },
            },
          },
        },
      ];

      // Mock the query request
      const mockQueryRequest = {
        id: 'query-request-123',
        agentId,
        userId,
        sessionId,
        prompt,
        generatedQuery: 'prisma.user.findMany({ where: { isActive: true } })',
        targetModel: 'User',
        action: 'findMany',
        queryParams: {
          where: {
            isActive: true,
          },
        },
        status: QueryApprovalStatus.PENDING,
      };

      // Mock the AI-generated query
      const mockAIResponse = {
        success: true,
        query: mockQueryRequest.generatedQuery,
        targetModel: mockQueryRequest.targetModel,
        action: mockQueryRequest.action,
        params: mockQueryRequest.queryParams,
      };

      // Mock the validation result
      const mockValidationResult = {
        valid: true,
      };

      // Set up mocks
      (prisma.aI_Agent.findUnique as Mock).mockResolvedValue(mockAgent);
      (prisma.schemaMap.findMany as Mock).mockResolvedValue(mockSchemaMaps);
      (prisma.agentQueryRequest.count as Mock).mockResolvedValue(0);
      (prisma.agentQueryRequest.create as Mock).mockResolvedValue(mockQueryRequest);
      vi.spyOn(PromptToQueryService as any, 'generateQueryWithAI').mockResolvedValue(mockAIResponse);
      (QuerySandboxService.validateQuery as Mock).mockResolvedValue(mockValidationResult);

      // Call the promptToQuery method
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

      // Verify the result
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.queryRequestId).toBe(mockQueryRequest.id);
      expect(result.status).toBe(mockQueryRequest.status);
      expect(result.requiresApproval).toBe(true);

      // Verify that the agent was fetched
      expect(prisma.aI_Agent.findUnique).toHaveBeenCalledWith({
        where: { id: agentId },
        include: {
          queryPermissions: true,
        },
      });

      // Verify that the schema maps were fetched
      expect(prisma.schemaMap.findMany).toHaveBeenCalledWith({
        where: {
          id: {
            in: ['schema-map-123'],
          },
        },
      });

      // Verify that the query request was created
      expect(prisma.agentQueryRequest.create).toHaveBeenCalledWith({
        data: {
          agentId,
          userId,
          sessionId,
          prompt,
          generatedQuery: mockQueryRequest.generatedQuery,
          targetModel: mockQueryRequest.targetModel,
          action: mockQueryRequest.action,
          queryParams: mockQueryRequest.queryParams,
          status: QueryApprovalStatus.PENDING,
        },
      });

      // Verify that the query was validated
      expect(QuerySandboxService.validateQuery).toHaveBeenCalledWith(
        agentId,
        mockQueryRequest.targetModel,
        mockQueryRequest.action,
        mockQueryRequest.queryParams
      );
    });

    it('should auto-approve a query if autoApprove is true and the query does not require approval', async () => {
      // Mock data
      const agentId = 'agent-123';
      const userId = 'user-123';
      const sessionId = 'session-123';
      const prompt = 'Count active users';

      // Mock the agent
      const mockAgent = {
        id: agentId,
        name: 'Test Agent',
        queryPermissions: [
          {
            id: 'permission-123',
            schemaMapId: 'schema-map-123',
            allowedModels: ['User'],
            requiresApproval: false,
          },
        ],
      };

      // Mock the schema maps
      const mockSchemaMaps = [
        {
          id: 'schema-map-123',
          name: 'Test Schema Map',
          isActive: true,
          schema: {
            User: {
              actions: ['findMany', 'findUnique', 'count'],
              allowedFields: ['id', 'email', 'name', 'isActive'],
              requiredFields: ['id', 'email'],
              fieldTypes: {
                id: 'String',
                email: 'String',
                name: 'String',
                isActive: 'Boolean',
              },
            },
          },
        },
      ];

      // Mock the query request
      const mockQueryRequest = {
        id: 'query-request-123',
        agentId,
        userId,
        sessionId,
        prompt,
        generatedQuery: 'prisma.user.count({ where: { isActive: true } })',
        targetModel: 'User',
        action: 'count',
        queryParams: {
          where: {
            isActive: true,
          },
        },
        status: QueryApprovalStatus.AUTO_APPROVED,
      };

      // Mock the AI-generated query
      const mockAIResponse = {
        success: true,
        query: mockQueryRequest.generatedQuery,
        targetModel: mockQueryRequest.targetModel,
        action: mockQueryRequest.action,
        params: mockQueryRequest.queryParams,
      };

      // Mock the validation result
      const mockValidationResult = {
        valid: true,
      };

      // Set up mocks
      (prisma.aI_Agent.findUnique as Mock).mockResolvedValue(mockAgent);
      (prisma.schemaMap.findMany as Mock).mockResolvedValue(mockSchemaMaps);
      (prisma.agentQueryRequest.count as Mock).mockResolvedValue(0);
      (prisma.agentQueryRequest.create as Mock).mockResolvedValue(mockQueryRequest);
      vi.spyOn(PromptToQueryService as any, 'generateQueryWithAI').mockResolvedValue(mockAIResponse);
      (QuerySandboxService.validateQuery as Mock).mockResolvedValue(mockValidationResult);
      (QuerySandboxService.executeQuery as Mock).mockResolvedValue({ success: true });

      // Call the promptToQuery method
      const result = await PromptToQueryService.promptToQuery(
        agentId,
        userId,
        sessionId,
        prompt,
        {
          autoApprove: true,
          useTemplates: true,
        }
      );

      // Verify the result
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.queryRequestId).toBe(mockQueryRequest.id);
      expect(result.status).toBe(mockQueryRequest.status);
      expect(result.requiresApproval).toBe(false);

      // Verify that the query request was created with AUTO_APPROVED status
      expect(prisma.agentQueryRequest.create).toHaveBeenCalledWith({
        data: {
          agentId,
          userId,
          sessionId,
          prompt,
          generatedQuery: mockQueryRequest.generatedQuery,
          targetModel: mockQueryRequest.targetModel,
          action: mockQueryRequest.action,
          queryParams: mockQueryRequest.queryParams,
          status: QueryApprovalStatus.AUTO_APPROVED,
        },
      });

      // Verify that the query was executed
      expect(QuerySandboxService.executeQuery).toHaveBeenCalledWith(mockQueryRequest.id);
    });

    it('should use a query template if one matches the prompt', async () => {
      // Mock data
      const agentId = 'agent-123';
      const userId = 'user-123';
      const sessionId = 'session-123';
      const prompt = 'Show me the latest 5 users';

      // Mock the agent
      const mockAgent = {
        id: agentId,
        name: 'Test Agent',
        queryPermissions: [
          {
            id: 'permission-123',
            schemaMapId: 'schema-map-123',
            allowedModels: ['User'],
            requiresApproval: true,
          },
        ],
      };

      // Mock the schema maps
      const mockSchemaMaps = [
        {
          id: 'schema-map-123',
          name: 'Test Schema Map',
          isActive: true,
          schema: {
            User: {
              actions: ['findMany', 'findUnique', 'count'],
              allowedFields: ['id', 'email', 'name', 'createdAt'],
              requiredFields: ['id', 'email'],
              fieldTypes: {
                id: 'String',
                email: 'String',
                name: 'String',
                createdAt: 'Date',
              },
            },
          },
        },
      ];

      // Mock the query templates
      const mockTemplates = [
        {
          id: 'template-123',
          name: 'Latest Users',
          template: 'prisma.user.findMany({ take: {{count}}, orderBy: { createdAt: "desc" } })',
          targetModel: 'User',
          action: 'findMany',
          parameterSchema: {
            type: 'object',
            properties: {
              count: {
                type: 'number',
              },
            },
          },
          isAutoApproved: true,
        },
      ];

      // Mock the query request
      const mockQueryRequest = {
        id: 'query-request-123',
        agentId,
        userId,
        sessionId,
        prompt,
        generatedQuery: 'prisma.user.findMany({ take: 5, orderBy: { createdAt: "desc" } })',
        targetModel: 'User',
        action: 'findMany',
        queryParams: {
          take: 5,
          orderBy: {
            createdAt: 'desc',
          },
        },
        status: QueryApprovalStatus.AUTO_APPROVED,
      };

      // Mock the template match
      const mockTemplateMatch = {
        success: true,
        query: mockQueryRequest.generatedQuery,
        targetModel: mockQueryRequest.targetModel,
        action: mockQueryRequest.action,
        params: mockQueryRequest.queryParams,
        templateId: 'template-123',
      };

      // Mock the validation result
      const mockValidationResult = {
        valid: true,
      };

      // Set up mocks
      (prisma.aI_Agent.findUnique as Mock).mockResolvedValue(mockAgent);
      (prisma.schemaMap.findMany as Mock).mockResolvedValue(mockSchemaMaps);
      (prisma.queryTemplate.findMany as Mock).mockResolvedValue(mockTemplates);
      (prisma.agentQueryRequest.count as Mock).mockResolvedValue(0);
      (prisma.agentQueryRequest.create as Mock).mockResolvedValue(mockQueryRequest);
      vi.spyOn(PromptToQueryService as any, 'matchPromptToTemplate').mockResolvedValue(mockTemplateMatch);
      (QuerySandboxService.validateQuery as Mock).mockResolvedValue(mockValidationResult);
      (QuerySandboxService.executeQuery as Mock).mockResolvedValue({ success: true });

      // Call the promptToQuery method
      const result = await PromptToQueryService.promptToQuery(
        agentId,
        userId,
        sessionId,
        prompt,
        {
          autoApprove: true,
          useTemplates: true,
        }
      );

      // Verify the result
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.queryRequestId).toBe(mockQueryRequest.id);
      expect(result.status).toBe(mockQueryRequest.status);
      expect(result.requiresApproval).toBe(false);

      // Verify that the query templates were fetched
      expect(prisma.queryTemplate.findMany).toHaveBeenCalled();

      // Verify that the query request was created with AUTO_APPROVED status
      expect(prisma.agentQueryRequest.create).toHaveBeenCalledWith({
        data: {
          agentId,
          userId,
          sessionId,
          prompt,
          generatedQuery: mockQueryRequest.generatedQuery,
          targetModel: mockQueryRequest.targetModel,
          action: mockQueryRequest.action,
          queryParams: mockQueryRequest.queryParams,
          status: QueryApprovalStatus.AUTO_APPROVED,
        },
      });

      // Verify that the query was executed
      expect(QuerySandboxService.executeQuery).toHaveBeenCalledWith(mockQueryRequest.id);
    });
  });

  describe('generateQueryWithAI', () => {
    it('should generate a query using AI', async () => {
      // Mock data
      const prompt = 'Find all active users';
      const schemaMaps = [
        {
          id: 'schema-map-123',
          name: 'Test Schema Map',
          isActive: true,
          schema: {
            User: {
              actions: ['findMany', 'findUnique', 'count'],
              allowedFields: ['id', 'email', 'name', 'isActive'],
              requiredFields: ['id', 'email'],
              fieldTypes: {
                id: 'String',
                email: 'String',
                name: 'String',
                isActive: 'Boolean',
              },
            },
          },
        },
      ];

      // Mock the AI response
      const mockAIResponse = `
      {
        "targetModel": "User",
        "action": "findMany",
        "params": {
          "where": {
            "isActive": true
          }
        }
      }
      `;

      // Mock the generateGroqCompletion function
      (generateGroqCompletion as Mock).mockResolvedValue(mockAIResponse);

      // Call the generateQueryWithAI method
      const result = await (PromptToQueryService as any).generateQueryWithAI(
        prompt,
        schemaMaps,
        {
          maxTokens: 1000,
          temperature: 0.2,
        }
      );

      // Verify the result
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.query).toBe('prisma.user.findMany({\n  "where": {\n    "isActive": true\n  }\n})');
      expect(result.targetModel).toBe('User');
      expect(result.action).toBe('findMany');
      expect(result.params).toEqual({
        where: {
          isActive: true,
        },
      });

      // Verify that generateGroqCompletion was called with the correct arguments
      expect(generateGroqCompletion).toHaveBeenCalledWith({
        systemPrompt: expect.any(String),
        prompt,
        maxTokens: 1000,
        temperature: 0.2,
        model: 'llama3-70b-8192',
      });
    });
  });
});
