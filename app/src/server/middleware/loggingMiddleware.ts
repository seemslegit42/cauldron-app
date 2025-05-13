/**
 * Logging Middleware
 * 
 * This middleware automatically logs API interactions and provides
 * distributed tracing capabilities for all API routes.
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { LoggingService, ApiStatus } from '../../shared/services/logging';

// Interface for the enhanced request with timing information
interface TimedRequest extends Request {
  _startTime?: number;
  _traceId?: string;
  _spanId?: string;
  _parentSpanId?: string;
}

/**
 * Middleware configuration options
 */
export interface LoggingMiddlewareOptions {
  // Whether to log request bodies (defaults to false for security)
  logRequestBody?: boolean;
  // Whether to log response bodies (defaults to false for performance)
  logResponseBody?: boolean;
  // Maximum size of request/response bodies to log (in bytes)
  maxBodySize?: number;
  // List of paths to exclude from logging
  excludePaths?: string[];
  // List of headers to redact from logs
  sensitiveHeaders?: string[];
  // Source identifier for the logs
  source?: string;
}

/**
 * Default middleware options
 */
const defaultOptions: LoggingMiddlewareOptions = {
  logRequestBody: false,
  logResponseBody: false,
  maxBodySize: 10240, // 10KB
  excludePaths: ['/health', '/metrics'],
  sensitiveHeaders: ['authorization', 'cookie', 'x-api-key'],
  source: 'api-server'
};

/**
 * Create a logging middleware with the specified options
 */
export function createLoggingMiddleware(options: LoggingMiddlewareOptions = {}) {
  const config = { ...defaultOptions, ...options };
  
  return async function loggingMiddleware(req: TimedRequest, res: Response, next: NextFunction) {
    // Skip excluded paths
    if (config.excludePaths?.some(path => req.path.startsWith(path))) {
      return next();
    }
    
    // Start timing
    req._startTime = Date.now();
    
    // Set up distributed tracing
    req._traceId = req.headers['x-trace-id'] as string || uuidv4();
    req._spanId = req.headers['x-span-id'] as string || uuidv4();
    req._parentSpanId = req.headers['x-parent-span-id'] as string;
    
    // Add trace headers to response
    res.setHeader('x-trace-id', req._traceId);
    res.setHeader('x-span-id', req._spanId);
    
    // Capture the original end method
    const originalEnd = res.end;
    let responseBody: Buffer[] = [];
    
    // Override the end method to capture the response
    // @ts-ignore - We're monkey patching the end method
    res.end = function(chunk: any, encoding: BufferEncoding) {
      if (chunk && config.logResponseBody) {
        responseBody.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
      }
      
      // Calculate duration
      const duration = Date.now() - (req._startTime || Date.now());
      
      // Determine API status
      let status: ApiStatus = 'SUCCESS';
      if (res.statusCode >= 500) status = 'SERVER_ERROR';
      else if (res.statusCode === 404) status = 'NOT_FOUND';
      else if (res.statusCode === 403) status = 'FORBIDDEN';
      else if (res.statusCode === 401) status = 'UNAUTHORIZED';
      else if (res.statusCode >= 400) status = 'INVALID_REQUEST';
      else if (res.statusCode >= 300) status = 'SUCCESS'; // Redirects are considered success
      
      // Prepare headers (filtering sensitive ones)
      const headers: Record<string, any> = {};
      const reqHeaders = { ...req.headers };
      const resHeaders = res.getHeaders();
      
      // Filter sensitive headers
      for (const header in reqHeaders) {
        if (!config.sensitiveHeaders?.includes(header.toLowerCase())) {
          headers[`req_${header}`] = reqHeaders[header];
        } else {
          headers[`req_${header}`] = '[REDACTED]';
        }
      }
      
      for (const header in resHeaders) {
        if (!config.sensitiveHeaders?.includes(header.toLowerCase())) {
          headers[`res_${header}`] = resHeaders[header];
        } else {
          headers[`res_${header}`] = '[REDACTED]';
        }
      }
      
      // Prepare request and response bodies
      let requestPayload: any = undefined;
      let responsePayload: any = undefined;
      
      if (config.logRequestBody && req.body) {
        try {
          requestPayload = typeof req.body === 'string' 
            ? JSON.parse(req.body) 
            : req.body;
            
          // Truncate if too large
          if (JSON.stringify(requestPayload).length > (config.maxBodySize || 10240)) {
            requestPayload = { 
              _truncated: true, 
              _size: JSON.stringify(requestPayload).length 
            };
          }
        } catch (e) {
          requestPayload = { _error: 'Could not parse request body' };
        }
      }
      
      if (config.logResponseBody && responseBody.length > 0) {
        try {
          const responseBodyBuffer = Buffer.concat(responseBody);
          if (responseBodyBuffer.length > 0) {
            const responseBodyString = responseBodyBuffer.toString('utf8');
            
            try {
              responsePayload = JSON.parse(responseBodyString);
            } catch (e) {
              // Not JSON, store as string
              responsePayload = responseBodyString;
            }
            
            // Truncate if too large
            if (JSON.stringify(responsePayload).length > (config.maxBodySize || 10240)) {
              responsePayload = { 
                _truncated: true, 
                _size: responseBodyBuffer.length 
              };
            }
          }
        } catch (e) {
          responsePayload = { _error: 'Could not parse response body' };
        }
      }
      
      // Log the API interaction
      LoggingService.logApiInteraction({
        endpoint: req.originalUrl || req.url,
        method: req.method,
        status,
        statusCode: res.statusCode,
        duration,
        requestSize: req.headers['content-length'] ? parseInt(req.headers['content-length'] as string) : undefined,
        responseSize: responseBody.length > 0 ? Buffer.concat(responseBody).length : undefined,
        requestPayload,
        responsePayload,
        headers,
        source: config.source || 'api-server',
        traceId: req._traceId,
        spanId: req._spanId,
        parentSpanId: req._parentSpanId,
        userId: (req as any).user?.id,
        tags: [
          `method:${req.method}`,
          `status:${res.statusCode}`,
          `path:${req.path}`
        ],
        metadata: {
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          referer: req.headers.referer
        }
      }).catch(err => console.error('Failed to log API interaction:', err));
      
      // Call the original end method
      return originalEnd.apply(res, arguments as any);
    };
    
    next();
  };
}

/**
 * Default logging middleware with standard options
 */
export const loggingMiddleware = createLoggingMiddleware();
