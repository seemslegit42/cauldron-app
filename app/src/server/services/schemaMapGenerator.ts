/**
 * Schema Map Generator Service
 * 
 * This service provides utilities for automatically generating schema maps from Prisma models.
 * Schema maps define what database tables and fields agents can access through queries.
 */

import { prisma } from 'wasp/server';
import { HttpError } from 'wasp/server';
import { LoggingService } from '../../shared/services/logging';
import { SchemaMap } from '../../shared/types/entities/agentQuery';

// Define the structure of a model schema
interface ModelSchema {
  actions: string[];
  allowedFields: string[];
  requiredFields: string[];
  fieldTypes: Record<string, string>;
  relations?: Record<string, RelationSchema>;
  constraints?: Record<string, any>;
}

// Define the structure of a relation schema
interface RelationSchema {
  type: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
  model: string;
  foreignKey: string;
}

// Define the structure of a schema map
interface GeneratedSchemaMap {
  [modelName: string]: ModelSchema;
}

/**
 * Schema Map Generator Service
 */
export class SchemaMapGenerator {
  /**
   * Generate a schema map from Prisma models
   * 
   * @param options Options for generating the schema map
   * @returns Generated schema map
   */
  static async generateSchemaMap(options: {
    modelNames?: string[];
    includeRelations?: boolean;
    includeConstraints?: boolean;
    includeVirtualFields?: boolean;
    excludeFields?: Record<string, string[]>;
    customActions?: Record<string, string[]>;
  } = {}): Promise<GeneratedSchemaMap> {
    try {
      const {
        modelNames,
        includeRelations = true,
        includeConstraints = true,
        includeVirtualFields = false,
        excludeFields = {},
        customActions = {},
      } = options;

      // Get the Prisma client metadata
      const metadata = await this.getPrismaMetadata();
      
      // Generate the schema map
      const schemaMap: GeneratedSchemaMap = {};
      
      // Filter models if modelNames is provided
      const modelsToInclude = modelNames 
        ? metadata.models.filter(model => modelNames.includes(model.name))
        : metadata.models;
      
      // Process each model
      for (const model of modelsToInclude) {
        const modelSchema: ModelSchema = {
          actions: customActions[model.name] || ['findMany', 'findUnique', 'findFirst', 'count'],
          allowedFields: [],
          requiredFields: [],
          fieldTypes: {},
        };
        
        // Process fields
        for (const field of model.fields) {
          // Skip excluded fields
          if (excludeFields[model.name]?.includes(field.name)) {
            continue;
          }
          
          // Skip virtual fields unless includeVirtualFields is true
          if (field.isGenerated && !includeVirtualFields) {
            continue;
          }
          
          // Add field to allowedFields
          modelSchema.allowedFields.push(field.name);
          
          // Add required fields
          if (field.isRequired && !field.hasDefaultValue) {
            modelSchema.requiredFields.push(field.name);
          }
          
          // Add field type
          modelSchema.fieldTypes[field.name] = field.type;
        }
        
        // Add relations if includeRelations is true
        if (includeRelations) {
          modelSchema.relations = {};
          
          for (const field of model.fields) {
            if (field.relationName) {
              const relatedModel = metadata.models.find(m => 
                m.fields.some(f => f.relationName === field.relationName && f.name !== field.name)
              );
              
              if (relatedModel) {
                const relatedField = relatedModel.fields.find(f => 
                  f.relationName === field.relationName && f.name !== field.name
                );
                
                if (relatedField) {
                  let relationType: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
                  
                  if (field.isList && relatedField.isList) {
                    relationType = 'many-to-many';
                  } else if (field.isList) {
                    relationType = 'one-to-many';
                  } else if (relatedField.isList) {
                    relationType = 'many-to-one';
                  } else {
                    relationType = 'one-to-one';
                  }
                  
                  modelSchema.relations[field.name] = {
                    type: relationType,
                    model: relatedModel.name,
                    foreignKey: relatedField.name,
                  };
                }
              }
            }
          }
        }
        
        // Add constraints if includeConstraints is true
        if (includeConstraints) {
          modelSchema.constraints = {
            uniqueFields: model.uniqueFields,
            uniqueIndexes: model.uniqueIndexes,
          };
        }
        
        // Add model schema to schema map
        schemaMap[model.name] = modelSchema;
      }
      
      return schemaMap;
    } catch (error) {
      console.error('Error generating schema map:', error);
      throw new HttpError(500, 'Failed to generate schema map');
    }
  }
  
  /**
   * Get Prisma metadata
   * 
   * @returns Prisma metadata
   */
  private static async getPrismaMetadata(): Promise<any> {
    try {
      // Use Prisma's internal _getConfig method to get metadata
      // Note: This is not part of the public API and may change in future versions
      const dmmf = (prisma as any)._baseDmmf;
      
      if (!dmmf) {
        throw new Error('Failed to get Prisma metadata');
      }
      
      return dmmf;
    } catch (error) {
      console.error('Error getting Prisma metadata:', error);
      throw new HttpError(500, 'Failed to get Prisma metadata');
    }
  }
  
  /**
   * Create a schema map in the database
   * 
   * @param userId User ID
   * @param name Schema map name
   * @param description Schema map description
   * @param schema Generated schema map
   * @param organizationId Optional organization ID
   * @returns Created schema map
   */
  static async createSchemaMapInDb(
    userId: string,
    name: string,
    description: string,
    schema: GeneratedSchemaMap,
    organizationId?: string
  ): Promise<SchemaMap> {
    try {
      const schemaMap = await prisma.schemaMap.create({
        data: {
          name,
          description,
          version: '1.0.0',
          schema,
          isActive: true,
          createdById: userId,
          organizationId,
        },
      });
      
      // Log the schema map creation
      await LoggingService.logSystemEvent({
        message: `Schema map generated and created: ${name}`,
        level: 'INFO',
        category: 'DATA_ACCESS',
        source: 'schema-map-generator',
        userId,
        tags: ['agent-query', 'schema-map', 'create', 'auto-generated'],
        metadata: {
          schemaMapId: schemaMap.id,
          schemaMapName: schemaMap.name,
          modelCount: Object.keys(schema).length,
        },
      });
      
      return schemaMap;
    } catch (error) {
      console.error('Error creating schema map in database:', error);
      throw new HttpError(500, 'Failed to create schema map in database');
    }
  }
}
