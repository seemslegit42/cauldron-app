import { prisma } from 'wasp/server';
import { LoggingService } from '../logging';

/**
 * Default configuration for the Sentient Loop™ system
 */
const DEFAULT_CONFIG = {
  checkpointThresholds: {
    confidenceThreshold: 0.7,
    alwaysCheckHighImpact: true,
    actionRules: {
      'delete': {
        alwaysCheck: true,
        checkpointType: 'CONFIRMATION_REQUIRED',
        reason: 'Delete operations require confirmation'
      },
      'payment': {
        alwaysCheck: true,
        checkpointType: 'DECISION_REQUIRED',
        reason: 'Payment operations require approval'
      },
      'security': {
        alwaysCheck: true,
        checkpointType: 'VALIDATION_REQUIRED',
        reason: 'Security operations require validation'
      }
    }
  },
  escalationRules: {
    autoEscalateThreshold: 'HIGH',
    escalationTimeout: 24, // hours
    notifyUsers: ['admin'],
    criticalEscalationPath: ['team-lead', 'manager', 'executive']
  },
  memoryRetention: {
    shortTerm: 7, // days
    longTerm: 90, // days
    criticalDecisions: 365, // days
    auditTrail: 730 // days
  },
  auditFrequency: {
    lowImpact: 'monthly',
    mediumImpact: 'weekly',
    highImpact: 'daily',
    criticalImpact: 'immediate'
  }
};

/**
 * Service for managing configuration for the Sentient Loop™ system
 */
export class SentientLoopConfigService {
  /**
   * Gets the configuration for the Sentient Loop™ system
   * 
   * @param userId The user ID
   * @param moduleId Optional module ID to get specific configuration
   * @returns The configuration
   */
  static async getConfig(userId: string, moduleId?: string) {
    try {
      // Build the query
      const query: any = {
        where: {
          userId
        }
      };

      // Add module filter if provided
      if (moduleId) {
        query.where.moduleId = moduleId;
      } else {
        query.where.moduleId = null;
      }

      // Get the configuration
      let config = await prisma.sentientLoopConfig.findFirst(query);

      // If no configuration exists, create one with default values
      if (!config) {
        config = await prisma.sentientLoopConfig.create({
          data: {
            userId,
            moduleId,
            checkpointThresholds: DEFAULT_CONFIG.checkpointThresholds,
            escalationRules: DEFAULT_CONFIG.escalationRules,
            memoryRetention: DEFAULT_CONFIG.memoryRetention,
            auditFrequency: DEFAULT_CONFIG.auditFrequency,
            isActive: true
          }
        });

        LoggingService.info({
          message: 'Created default Sentient Loop configuration',
          userId,
          module: 'arcana',
          category: 'SENTIENT_LOOP',
          metadata: {
            moduleId
          }
        });
      }

      return config;
    } catch (error) {
      LoggingService.error({
        message: 'Error getting Sentient Loop configuration',
        userId,
        module: 'arcana',
        category: 'SENTIENT_LOOP',
        error,
        metadata: {
          moduleId
        }
      });
      throw error;
    }
  }

  /**
   * Updates the configuration for the Sentient Loop™ system
   * 
   * @param params Configuration parameters
   * @returns The updated configuration
   */
  static async updateConfig(params: {
    userId: string;
    moduleId?: string;
    checkpointThresholds?: any;
    escalationRules?: any;
    memoryRetention?: any;
    auditFrequency?: any;
    isActive?: boolean;
  }) {
    try {
      const { userId, moduleId } = params;

      // Log the operation
      LoggingService.info({
        message: 'Updating Sentient Loop configuration',
        userId,
        module: 'arcana',
        category: 'SENTIENT_LOOP',
        metadata: {
          moduleId
        }
      });

      // Build the query
      const query: any = {
        where: {
          userId_moduleId: {
            userId,
            moduleId: moduleId || null
          }
        }
      };

      // Build the update data
      const updateData: any = {};

      if (params.checkpointThresholds !== undefined) {
        updateData.checkpointThresholds = params.checkpointThresholds;
      }

      if (params.escalationRules !== undefined) {
        updateData.escalationRules = params.escalationRules;
      }

      if (params.memoryRetention !== undefined) {
        updateData.memoryRetention = params.memoryRetention;
      }

      if (params.auditFrequency !== undefined) {
        updateData.auditFrequency = params.auditFrequency;
      }

      if (params.isActive !== undefined) {
        updateData.isActive = params.isActive;
      }

      // Update the configuration
      const config = await prisma.sentientLoopConfig.upsert({
        where: query.where,
        update: updateData,
        create: {
          userId,
          moduleId: moduleId || null,
          checkpointThresholds: params.checkpointThresholds || DEFAULT_CONFIG.checkpointThresholds,
          escalationRules: params.escalationRules || DEFAULT_CONFIG.escalationRules,
          memoryRetention: params.memoryRetention || DEFAULT_CONFIG.memoryRetention,
          auditFrequency: params.auditFrequency || DEFAULT_CONFIG.auditFrequency,
          isActive: params.isActive !== undefined ? params.isActive : true
        }
      });

      return config;
    } catch (error) {
      LoggingService.error({
        message: 'Error updating Sentient Loop configuration',
        userId: params.userId,
        module: 'arcana',
        category: 'SENTIENT_LOOP',
        error,
        metadata: {
          moduleId: params.moduleId
        }
      });
      throw error;
    }
  }

  /**
   * Gets all configurations for a user
   * 
   * @param userId The user ID
   * @returns Array of configurations
   */
  static async getAllConfigs(userId: string) {
    try {
      const configs = await prisma.sentientLoopConfig.findMany({
        where: {
          userId
        }
      });

      return configs;
    } catch (error) {
      LoggingService.error({
        message: 'Error getting all Sentient Loop configurations',
        userId,
        module: 'arcana',
        category: 'SENTIENT_LOOP',
        error
      });
      throw error;
    }
  }
}