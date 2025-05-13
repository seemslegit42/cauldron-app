/**
 * Scheduled Jobs
 * 
 * This file exports all scheduled jobs for the application.
 */

import { dataRetentionCleanup } from './dataRetentionCleanup';

/**
 * Run the data retention cleanup job
 * This job runs daily at 2:00 AM
 */
export const runDataRetentionCleanup = {
  name: 'runDataRetentionCleanup',
  fn: dataRetentionCleanup,
  schedule: '0 2 * * *', // Cron expression: At 02:00 every day
};

/**
 * Export all jobs
 */
export const jobs = {
  runDataRetentionCleanup,
};

export default jobs;
