/**
 * Service for logging events and errors
 */
export class LoggingService {
  /**
   * Logs an informational message
   * @param params Log parameters
   */
  static info(params: {
    message: string;
    userId?: string;
    module?: string;
    category?: string;
    metadata?: any;
  }) {
    console.info(`[INFO] [${params.module || 'unknown'}] [${params.category || 'general'}] ${params.message}`, {
      userId: params.userId,
      metadata: params.metadata,
      timestamp: new Date().toISOString(),
    });

    // In a real implementation, this would send the log to a logging service
  }

  /**
   * Logs an error message
   * @param params Log parameters
   */
  static error(params: {
    message: string;
    userId?: string;
    module?: string;
    category?: string;
    metadata?: any;
    error?: any;
  }) {
    console.error(`[ERROR] [${params.module || 'unknown'}] [${params.category || 'general'}] ${params.message}`, {
      userId: params.userId,
      metadata: params.metadata,
      error: params.error,
      timestamp: new Date().toISOString(),
    });

    // In a real implementation, this would send the log to a logging service
  }

  /**
   * Logs a warning message
   * @param params Log parameters
   */
  static warn(params: {
    message: string;
    userId?: string;
    module?: string;
    category?: string;
    metadata?: any;
  }) {
    console.warn(`[WARN] [${params.module || 'unknown'}] [${params.category || 'general'}] ${params.message}`, {
      userId: params.userId,
      metadata: params.metadata,
      timestamp: new Date().toISOString(),
    });

    // In a real implementation, this would send the log to a logging service
  }

  /**
   * Logs a debug message
   * @param params Log parameters
   */
  static debug(params: {
    message: string;
    userId?: string;
    module?: string;
    category?: string;
    metadata?: any;
  }) {
    console.debug(`[DEBUG] [${params.module || 'unknown'}] [${params.category || 'general'}] ${params.message}`, {
      userId: params.userId,
      metadata: params.metadata,
      timestamp: new Date().toISOString(),
    });

    // In a real implementation, this would send the log to a logging service
  }
}