/**
 * Schema Map Generator Service Tests
 * 
 * This file contains unit tests for the SchemaMapGenerator service, which
 * automatically generates schema maps from Prisma models.
 */

import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { prisma } from 'wasp/server';
import { SchemaMapGenerator } from '../server/services/schemaMapGenerator';
import { LoggingService } from '../shared/services/logging';

// Mock the prisma client
vi.mock('wasp/server', () => ({
  prisma: {
    schemaMap: {
      create: vi.fn(),
    },
    $queryRaw: vi.fn(),
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

describe('SchemaMapGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateSchemaMap', () => {
    it('should generate a schema map from Prisma models', async () => {
      // Mock the Prisma metadata
      const mockMetadata = {
        models: [
          {
            name: 'User',
            fields: [
              {
                name: 'id',
                type: 'String',
                isRequired: true,
                hasDefaultValue: false,
                isGenerated: false,
                relationName: null,
                isList: false,
              },
              {
                name: 'email',
                type: 'String',
                isRequired: true,
                hasDefaultValue: false,
                isGenerated: false,
                relationName: null,
                isList: false,
              },
              {
                name: 'name',
                type: 'String',
                isRequired: false,
                hasDefaultValue: false,
                isGenerated: false,
                relationName: null,
                isList: false,
              },
              {
                name: 'posts',
                type: 'Post',
                isRequired: false,
                hasDefaultValue: false,
                isGenerated: false,
                relationName: 'UserToPost',
                isList: true,
              },
            ],
            uniqueFields: [['email']],
            uniqueIndexes: [{ name: 'User_email_key', fields: ['email'] }],
          },
          {
            name: 'Post',
            fields: [
              {
                name: 'id',
                type: 'String',
                isRequired: true,
                hasDefaultValue: false,
                isGenerated: false,
                relationName: null,
                isList: false,
              },
              {
                name: 'title',
                type: 'String',
                isRequired: true,
                hasDefaultValue: false,
                isGenerated: false,
                relationName: null,
                isList: false,
              },
              {
                name: 'content',
                type: 'String',
                isRequired: false,
                hasDefaultValue: false,
                isGenerated: false,
                relationName: null,
                isList: false,
              },
              {
                name: 'authorId',
                type: 'String',
                isRequired: true,
                hasDefaultValue: false,
                isGenerated: false,
                relationName: null,
                isList: false,
              },
              {
                name: 'author',
                type: 'User',
                isRequired: true,
                hasDefaultValue: false,
                isGenerated: false,
                relationName: 'UserToPost',
                isList: false,
              },
            ],
            uniqueFields: [],
            uniqueIndexes: [],
          },
        ],
      };

      // Mock the getPrismaMetadata method
      vi.spyOn(SchemaMapGenerator as any, 'getPrismaMetadata').mockResolvedValue(mockMetadata);

      // Call the generateSchemaMap method
      const result = await SchemaMapGenerator.generateSchemaMap({
        includeRelations: true,
        includeConstraints: true,
      });

      // Verify the result
      expect(result).toBeDefined();
      expect(result.User).toBeDefined();
      expect(result.Post).toBeDefined();

      // Verify User model schema
      expect(result.User.actions).toEqual(['findMany', 'findUnique', 'findFirst', 'count']);
      expect(result.User.allowedFields).toContain('id');
      expect(result.User.allowedFields).toContain('email');
      expect(result.User.allowedFields).toContain('name');
      expect(result.User.allowedFields).toContain('posts');
      expect(result.User.requiredFields).toContain('id');
      expect(result.User.requiredFields).toContain('email');
      expect(result.User.fieldTypes.id).toBe('String');
      expect(result.User.fieldTypes.email).toBe('String');
      expect(result.User.fieldTypes.name).toBe('String');
      expect(result.User.relations.posts.type).toBe('one-to-many');
      expect(result.User.relations.posts.model).toBe('Post');
      expect(result.User.constraints.uniqueFields).toEqual([['email']]);

      // Verify Post model schema
      expect(result.Post.actions).toEqual(['findMany', 'findUnique', 'findFirst', 'count']);
      expect(result.Post.allowedFields).toContain('id');
      expect(result.Post.allowedFields).toContain('title');
      expect(result.Post.allowedFields).toContain('content');
      expect(result.Post.allowedFields).toContain('authorId');
      expect(result.Post.allowedFields).toContain('author');
      expect(result.Post.requiredFields).toContain('id');
      expect(result.Post.requiredFields).toContain('title');
      expect(result.Post.requiredFields).toContain('authorId');
      expect(result.Post.fieldTypes.id).toBe('String');
      expect(result.Post.fieldTypes.title).toBe('String');
      expect(result.Post.relations.author.type).toBe('many-to-one');
      expect(result.Post.relations.author.model).toBe('User');
    });

    it('should filter models based on modelNames option', async () => {
      // Mock the Prisma metadata
      const mockMetadata = {
        models: [
          {
            name: 'User',
            fields: [
              {
                name: 'id',
                type: 'String',
                isRequired: true,
                hasDefaultValue: false,
                isGenerated: false,
                relationName: null,
                isList: false,
              },
            ],
            uniqueFields: [],
            uniqueIndexes: [],
          },
          {
            name: 'Post',
            fields: [
              {
                name: 'id',
                type: 'String',
                isRequired: true,
                hasDefaultValue: false,
                isGenerated: false,
                relationName: null,
                isList: false,
              },
            ],
            uniqueFields: [],
            uniqueIndexes: [],
          },
        ],
      };

      // Mock the getPrismaMetadata method
      vi.spyOn(SchemaMapGenerator as any, 'getPrismaMetadata').mockResolvedValue(mockMetadata);

      // Call the generateSchemaMap method with modelNames option
      const result = await SchemaMapGenerator.generateSchemaMap({
        modelNames: ['User'],
      });

      // Verify the result
      expect(result).toBeDefined();
      expect(result.User).toBeDefined();
      expect(result.Post).toBeUndefined();
    });

    it('should exclude fields based on excludeFields option', async () => {
      // Mock the Prisma metadata
      const mockMetadata = {
        models: [
          {
            name: 'User',
            fields: [
              {
                name: 'id',
                type: 'String',
                isRequired: true,
                hasDefaultValue: false,
                isGenerated: false,
                relationName: null,
                isList: false,
              },
              {
                name: 'email',
                type: 'String',
                isRequired: true,
                hasDefaultValue: false,
                isGenerated: false,
                relationName: null,
                isList: false,
              },
              {
                name: 'password',
                type: 'String',
                isRequired: true,
                hasDefaultValue: false,
                isGenerated: false,
                relationName: null,
                isList: false,
              },
            ],
            uniqueFields: [],
            uniqueIndexes: [],
          },
        ],
      };

      // Mock the getPrismaMetadata method
      vi.spyOn(SchemaMapGenerator as any, 'getPrismaMetadata').mockResolvedValue(mockMetadata);

      // Call the generateSchemaMap method with excludeFields option
      const result = await SchemaMapGenerator.generateSchemaMap({
        excludeFields: {
          User: ['password'],
        },
      });

      // Verify the result
      expect(result).toBeDefined();
      expect(result.User).toBeDefined();
      expect(result.User.allowedFields).toContain('id');
      expect(result.User.allowedFields).toContain('email');
      expect(result.User.allowedFields).not.toContain('password');
    });
  });

  describe('createSchemaMapInDb', () => {
    it('should create a schema map in the database', async () => {
      // Mock data
      const userId = 'user-123';
      const name = 'Test Schema Map';
      const description = 'A test schema map';
      const schema = {
        User: {
          actions: ['findMany', 'findUnique', 'count'],
          allowedFields: ['id', 'email', 'name'],
          requiredFields: ['id', 'email'],
          fieldTypes: {
            id: 'String',
            email: 'String',
            name: 'String',
          },
        },
      };

      const mockSchemaMap = {
        id: 'schema-map-123',
        createdAt: new Date(),
        updatedAt: new Date(),
        name,
        description,
        version: '1.0.0',
        schema,
        isActive: true,
        createdById: userId,
        organizationId: null,
      };

      // Mock the prisma.schemaMap.create method
      (prisma.schemaMap.create as Mock).mockResolvedValue(mockSchemaMap);

      // Call the createSchemaMapInDb method
      const result = await SchemaMapGenerator.createSchemaMapInDb(
        userId,
        name,
        description,
        schema
      );

      // Verify the result
      expect(result).toEqual(mockSchemaMap);

      // Verify that prisma.schemaMap.create was called with the correct arguments
      expect(prisma.schemaMap.create).toHaveBeenCalledWith({
        data: {
          name,
          description,
          version: '1.0.0',
          schema,
          isActive: true,
          createdById: userId,
          organizationId: undefined,
        },
      });

      // Verify that LoggingService.logSystemEvent was called
      expect(LoggingService.logSystemEvent).toHaveBeenCalled();
    });
  });
});
