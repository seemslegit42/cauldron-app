/**
 * Alert Rules Job
 * 
 * This job is responsible for evaluating alert rules against logs.
 */

import { prisma } from 'wasp/server';
import { LogAlertsService } from '../../shared/services/logAlerts';
import { LoggingService } from '../../shared/services/logging';

/**
 * Evaluate alert rules job
 */
export const evaluateAlertRulesJob = async () => {
  try {
    console.log('Starting alert rules evaluation job');

    // Log the job start
    await LoggingService.logSystemEvent({
      message: 'Starting alert rules evaluation job',
      level: 'INFO',
      category: 'SYSTEM_EVENT',
      source: 'alert-rules-job',
      tags: ['job', 'alert-rules'],
    });

    // Evaluate alert rules
    await LogAlertsService.evaluateAlertRules();

    // Log the job completion
    await LoggingService.logSystemEvent({
      message: 'Alert rules evaluation job completed successfully',
      level: 'INFO',
      category: 'SYSTEM_EVENT',
      source: 'alert-rules-job',
      tags: ['job', 'alert-rules'],
    });

    console.log('Alert rules evaluation job completed successfully');
  } catch (error) {
    console.error('Error in alert rules evaluation job:', error);

    // Log the error
    await LoggingService.logSystemEvent({
      message: `Error in alert rules evaluation job: ${error.message}`,
      level: 'ERROR',
      category: 'SYSTEM_EVENT',
      source: 'alert-rules-job',
      tags: ['job', 'alert-rules', 'error'],
      metadata: {
        error: error.message,
        stack: error.stack,
      },
    });

    throw error;
  }
};
