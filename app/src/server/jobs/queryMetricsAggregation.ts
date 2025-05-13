/**
 * Query Metrics Aggregation Job
 * 
 * This job aggregates query performance metrics for different time periods.
 */

import { prisma } from 'wasp/server';
import { LoggingService } from '../../shared/services/logging';
import { QueryAnalyticsService } from '../services/queryAnalyticsService';
import { MaintenanceOperation } from '../services/maintenanceService';

/**
 * Aggregate query metrics job
 */
export const aggregateQueryMetricsJob = async () => {
  const job = new QueryMetricsAggregationJob();
  return job.execute();
};

/**
 * Query metrics aggregation job implementation
 */
class QueryMetricsAggregationJob extends MaintenanceOperation {
  constructor() {
    super('query-metrics-aggregation', 'Aggregate query performance metrics');
  }

  /**
   * Execute the job
   */
  protected async doExecute(): Promise<void> {
    try {
      // Aggregate hourly metrics
      await this.logInfo('Aggregating hourly metrics');
      await this.aggregateMetrics('hourly');
      
      // Aggregate daily metrics
      await this.logInfo('Aggregating daily metrics');
      await this.aggregateMetrics('daily');
      
      // Aggregate weekly metrics
      await this.logInfo('Aggregating weekly metrics');
      await this.aggregateMetrics('weekly');
      
      // Aggregate monthly metrics
      await this.logInfo('Aggregating monthly metrics');
      await this.aggregateMetrics('monthly');
      
      // Log completion
      await this.logInfo(`Aggregated metrics for all periods`);
    } catch (error) {
      await this.logError('Error aggregating query metrics', error);
      throw error;
    }
  }

  /**
   * Aggregate metrics for a specific period
   */
  private async aggregateMetrics(period: 'hourly' | 'daily' | 'weekly' | 'monthly'): Promise<void> {
    try {
      // Get all models with queries
      const models = await this.getModelsWithQueries();
      
      // Aggregate metrics for each model
      for (const model of models) {
        await QueryAnalyticsService.aggregateQueryMetrics({
          period,
          model
        });
        this.itemsProcessed++;
      }
      
      // Get all actions with queries
      const actions = await this.getActionsWithQueries();
      
      // Aggregate metrics for each action
      for (const action of actions) {
        await QueryAnalyticsService.aggregateQueryMetrics({
          period,
          action
        });
        this.itemsProcessed++;
      }
      
      // Get all modules with queries
      const modules = await this.getModulesWithQueries();
      
      // Aggregate metrics for each module
      for (const moduleId of modules) {
        if (moduleId) {
          await QueryAnalyticsService.aggregateQueryMetrics({
            period,
            moduleId
          });
          this.itemsProcessed++;
        }
      }
      
      // Aggregate overall metrics
      await QueryAnalyticsService.aggregateQueryMetrics({
        period
      });
      this.itemsProcessed++;
    } catch (error) {
      await this.logError(`Error aggregating ${period} metrics`, error);
      throw error;
    }
  }

  /**
   * Get all models with queries
   */
  private async getModelsWithQueries(): Promise<string[]> {
    const result = await prisma.queryLog.groupBy({
      by: ['model']
    });
    
    return result.map(item => item.model);
  }

  /**
   * Get all actions with queries
   */
  private async getActionsWithQueries(): Promise<string[]> {
    const result = await prisma.queryLog.groupBy({
      by: ['action']
    });
    
    return result.map(item => item.action);
  }

  /**
   * Get all modules with queries
   */
  private async getModulesWithQueries(): Promise<string[]> {
    const result = await prisma.queryLog.groupBy({
      by: ['moduleId']
    });
    
    return result.map(item => item.moduleId).filter(Boolean) as string[];
  }
}
