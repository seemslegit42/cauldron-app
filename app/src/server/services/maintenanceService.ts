/**
 * Maintenance Service
 * 
 * Provides utilities for system maintenance tasks including:
 * - Stale log cleanup
 * - Data archiving
 * - Audit snapshot rotation
 * - Metrics regeneration
 */

import { prisma } from 'wasp/server';
import { LoggingService } from '../../shared/services/logging';
import { LogArchivingService } from '../../shared/services/logArchiving';
import { v4 as uuidv4 } from 'uuid';

// Types for maintenance operations
export interface MaintenanceJobResult {
  jobId: string;
  jobType: string;
  startTime: Date;
  endTime: Date;
  status: 'success' | 'partial' | 'failed';
  itemsProcessed: number;
  errors?: Error[];
  details?: Record<string, any>;
}

export interface MaintenanceConfig {
  batchSize: number;
  dryRun: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

const defaultConfig: MaintenanceConfig = {
  batchSize: 1000,
  dryRun: false,
  logLevel: 'info',
};

/**
 * Base class for maintenance operations
 */
export abstract class MaintenanceOperation {
  protected config: MaintenanceConfig;
  protected jobId: string;
  protected startTime: Date;
  protected itemsProcessed: number = 0;
  protected errors: Error[] = [];

  constructor(config: Partial<MaintenanceConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.jobId = uuidv4();
    this.startTime = new Date();
  }

  /**
   * Execute the maintenance operation
   */
  public async execute(): Promise<MaintenanceJobResult> {
    try {
      // Log start of operation
      await this.logOperation('start');
      
      // Execute the operation
      await this.doExecute();
      
      // Log completion
      return await this.logOperation('complete');
    } catch (error) {
      this.errors.push(error as Error);
      return await this.logOperation('failed');
    }
  }

  /**
   * Implementation of the maintenance operation
   */
  protected abstract doExecute(): Promise<void>;

  /**
   * Log the operation status
   */
  protected async logOperation(
    stage: 'start' | 'complete' | 'failed'
  ): Promise<MaintenanceJobResult> {
    const endTime = new Date();
    const duration = endTime.getTime() - this.startTime.getTime();
    
    const status: 'success' | 'partial' | 'failed' = 
      stage === 'failed' ? 'failed' : 
      this.errors.length > 0 ? 'partial' : 'success';
    
    const result: MaintenanceJobResult = {
      jobId: this.jobId,
      jobType: this.constructor.name,
      startTime: this.startTime,
      endTime,
      status,
      itemsProcessed: this.itemsProcessed,
      errors: this.errors.length > 0 ? this.errors : undefined,
      details: {
        duration,
        config: this.config,
      },
    };

    // Log to system logs
    const message = 
      stage === 'start' ? `Starting maintenance job: ${this.constructor.name}` :
      stage === 'complete' ? `Completed maintenance job: ${this.constructor.name}` :
      `Failed maintenance job: ${this.constructor.name}`;

    const level = stage === 'failed' ? 'ERROR' : 'INFO';

    await LoggingService.logSystemEvent({
      message,
      level,
      category: 'MAINTENANCE',
      source: 'maintenance-service',
      traceId: this.jobId,
      tags: ['maintenance', this.constructor.name, stage],
      metadata: result,
    });

    // Store maintenance job result in database
    await prisma.maintenanceJob.create({
      data: {
        id: this.jobId,
        jobType: this.constructor.name,
        startTime: this.startTime,
        endTime,
        status,
        itemsProcessed: this.itemsProcessed,
        errors: this.errors.length > 0 ? JSON.stringify(this.errors.map(e => e.message)) : null,
        details: result.details,
      },
    });

    return result;
  }

  /**
   * Log a debug message
   */
  protected async logDebug(message: string, metadata: Record<string, any> = {}): Promise<void> {
    if (this.config.logLevel === 'debug') {
      await LoggingService.logSystemEvent({
        message,
        level: 'DEBUG',
        category: 'MAINTENANCE',
        source: 'maintenance-service',
        traceId: this.jobId,
        tags: ['maintenance', this.constructor.name, 'debug'],
        metadata,
      });
    }
  }
}

/**
 * Maintenance Service
 */
export const MaintenanceService = {
  /**
   * Execute a maintenance operation
   */
  executeOperation: async (
    operation: MaintenanceOperation
  ): Promise<MaintenanceJobResult> => {
    return operation.execute();
  },

  /**
   * Get recent maintenance jobs
   */
  getRecentJobs: async (limit: number = 10): Promise<any[]> => {
    return prisma.maintenanceJob.findMany({
      orderBy: {
        startTime: 'desc',
      },
      take: limit,
    });
  },
};
