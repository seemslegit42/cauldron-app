/**
 * Agent Query System Integration Tests
 * 
 * This file contains integration tests for the agent query system, testing
 * the full flow from prompt to query execution.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { prisma } from 'wasp/server';
import { AgentQueryService } from '../server/services/agentQueryService';
import { QuerySandboxService } from '../server/services/querySandboxService';
import { PromptToQueryService } from '../server/services/promptToQueryService';
import { 
  QueryPermissionLevel, 
  QueryApprovalStatus,
} from '../shared/types/entities/agentQuery';

// These tests require a test database to be set up
// They are disabled by default to prevent accidental runs against production
// To run these tests, remove the .skip from the describe block
describe.skip('Agent Query System Integration', () => {
  // Test data
  const testUser = {
    id: '',
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
  };

  const testAgent = {
    id: '',
    name: 'Test Agent',
    type: 'assistant',
    description: 'A test agent for integration tests',
  };

  const testSchemaMap = {
    id: '',
    name: 'Test Schema Map',
    description: 'A test schema map for integration tests',
    version: '1.0.0',
    schema: {
      User: {
        actions: ['findMany', 'findUnique', 'count'],
        allowedFields: ['id', 'username', 'email', 'createdAt', 'isActive'],
        requiredFields: [],
        fieldTypes: {
          id: 'string',
          username: 'string',
          email: 'string',
          createdAt: 'date',
          isActive: 'boolean',
        },
      },
    },
    isActive: true,
  };

  // Setup and teardown
  beforeAll(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        username: testUser.username,
        email: testUser.email,
        passwordHash: 'hashed_password', // In a real test, use a proper hash
        isActive: true,
      },
    });
    testUser.id = user.id;

    // Create test agent
    const agent = await prisma.aI_Agent.create({
      data: {
        name: testAgent.name,
        type: testAgent.type,
        description: testAgent.description,
        userId: testUser.id,
        isActive: true,
      },
    });
    testAgent.id = agent.id;

    // Create test schema map
    const schemaMap = await prisma.schemaMap.create({
      data: {
        name: testSchemaMap.name,
        description: testSchemaMap.description,
        version: testSchemaMap.version,
        schema: testSchemaMap.schema,
        isActive: testSchemaMap.isActive,
        createdById: testUser.id,
      },
    });
    testSchemaMap.id = schemaMap.id;

    // Create agent query permission
    await prisma.agentQueryPermission.create({
      data: {
        agentId: testAgent.id,
        schemaMapId: testSchemaMap.id,
        permissionLevel: QueryPermissionLevel.READ_ONLY,
        allowedModels: ['User'],
        allowedActions: ['findMany', 'findUnique', 'count'],
        maxQueriesPerDay: 100,
        requiresApproval: true,
        isActive: true,
      },
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.agentQueryPermission.deleteMany({
      where: {
        agentId: testAgent.id,
      },
    });

    await prisma.agentQueryRequest.deleteMany({
      where: {
        agentId: testAgent.id,
      },
    });

    await prisma.schemaMap.delete({
      where: {
        id: testSchemaMap.id,
      },
    });

    await prisma.aI_Agent.delete({
      where: {
        id: testAgent.id,
      },
    });

    await prisma.user.delete({
      where: {
        id: testUser.id,
      },
    });
  });

  describe('End-to-End Query Flow', () => {
    it('should create a query request from a prompt', async () => {
      // Create a query request
      const result = await AgentQueryService.createQueryRequest(testUser.id, {
        agentId: testAgent.id,
        prompt: 'Find all active users',
      });

      // Verify the result
      expect(result).toBeDefined();
      expect(result.queryRequestId).toBeDefined();
      expect(result.status).toBe(QueryApprovalStatus.PENDING);
      expect(result.requiresApproval).toBe(true);

      // Get the query request
      const queryRequest = await prisma.agentQueryRequest.findUnique({
        where: {
          id: result.queryRequestId,
        },
      });

      // Verify the query request
      expect(queryRequest).toBeDefined();
      expect(queryRequest?.agentId).toBe(testAgent.id);
      expect(queryRequest?.userId).toBe(testUser.id);
      expect(queryRequest?.prompt).toBe('Find all active users');
      expect(queryRequest?.status).toBe(QueryApprovalStatus.PENDING);

      // Approve the query request
      const approvedRequest = await AgentQueryService.processQueryRequest(testUser.id, {
        id: result.queryRequestId,
        approved: true,
      });

      // Verify the approved request
      expect(approvedRequest).toBeDefined();
      expect(approvedRequest.status).toBe(QueryApprovalStatus.APPROVED);
      expect(approvedRequest.approvedById).toBe(testUser.id);
      expect(approvedRequest.approvedAt).toBeDefined();

      // Wait for the query to execute
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get the updated query request
      const executedRequest = await prisma.agentQueryRequest.findUnique({
        where: {
          id: result.queryRequestId,
        },
      });

      // Verify the executed request
      expect(executedRequest).toBeDefined();
      expect(executedRequest?.executedAt).toBeDefined();
      expect(executedRequest?.executionResult).toBeDefined();
      expect(executedRequest?.executionError).toBeNull();
    });

    it('should reject an invalid query request', async () => {
      // Create a query request with an invalid prompt
      const result = await AgentQueryService.createQueryRequest(testUser.id, {
        agentId: testAgent.id,
        prompt: 'Delete all users', // This should be rejected
      });

      // Verify the result
      expect(result).toBeDefined();
      expect(result.queryRequestId).toBeDefined();
      expect(result.status).toBe(QueryApprovalStatus.PENDING);

      // Reject the query request
      const rejectedRequest = await AgentQueryService.processQueryRequest(testUser.id, {
        id: result.queryRequestId,
        approved: false,
        rejectionReason: 'This query is not allowed',
      });

      // Verify the rejected request
      expect(rejectedRequest).toBeDefined();
      expect(rejectedRequest.status).toBe(QueryApprovalStatus.REJECTED);
      expect(rejectedRequest.approvedById).toBe(testUser.id);
      expect(rejectedRequest.approvedAt).toBeDefined();
      expect(rejectedRequest.rejectionReason).toBe('This query is not allowed');
      expect(rejectedRequest.executedAt).toBeNull();
      expect(rejectedRequest.executionResult).toBeNull();
    });
  });
});
