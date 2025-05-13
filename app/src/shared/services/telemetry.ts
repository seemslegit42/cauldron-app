/**
 * Telemetry Service
 * 
 * This service provides distributed tracing capabilities for tracking operations
 * across different components of the system. It integrates with the logging system
 * to maintain a comprehensive view of system behavior and performance.
 */

import { v4 as uuidv4 } from 'uuid';
import { LoggingService } from './logging';

/**
 * Interface for span context
 */
export interface SpanContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
}

/**
 * Interface for span attributes
 */
export interface SpanAttributes {
  [key: string]: string | number | boolean | string[] | number[] | boolean[];
}

/**
 * Interface for span event
 */
export interface SpanEvent {
  name: string;
  timestamp: Date;
  attributes?: SpanAttributes;
}

/**
 * Interface for span link
 */
export interface SpanLink {
  context: SpanContext;
  attributes?: SpanAttributes;
}

/**
 * Interface for span options
 */
export interface SpanOptions {
  attributes?: SpanAttributes;
  links?: SpanLink[];
  startTime?: Date;
  userId?: string;
  agentId?: string;
  sessionId?: string;
  moduleId?: string;
  organizationId?: string;
}

/**
 * Class representing a telemetry span
 */
export class Span {
  id: string;
  name: string;
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  startTime: Date;
  endTime?: Date;
  attributes: SpanAttributes;
  events: SpanEvent[];
  links: SpanLink[];
  status: string;
  source: string;
  userId?: string;
  agentId?: string;
  sessionId?: string;
  moduleId?: string;
  organizationId?: string;
  
  constructor(
    name: string, 
    context: SpanContext, 
    source: string,
    options: SpanOptions = {}
  ) {
    this.id = '';
    this.name = name;
    this.traceId = context.traceId;
    this.spanId = context.spanId;
    this.parentSpanId = context.parentSpanId;
    this.startTime = options.startTime || new Date();
    this.attributes = options.attributes || {};
    this.events = [];
    this.links = options.links || [];
    this.status = 'OK';
    this.source = source;
    this.userId = options.userId;
    this.agentId = options.agentId;
    this.sessionId = options.sessionId;
    this.moduleId = options.moduleId;
    this.organizationId = options.organizationId;
    
    // Persist the span to the database
    this._persistSpan();
  }
  
  /**
   * Add an event to the span
   */
  addEvent(name: string, attributes?: SpanAttributes): void {
    this.events.push({
      name,
      timestamp: new Date(),
      attributes
    });
  }
  
  /**
   * Set the status of the span
   */
  setStatus(status: string): void {
    this.status = status;
  }
  
  /**
   * Set an attribute on the span
   */
  setAttribute(key: string, value: string | number | boolean | string[] | number[] | boolean[]): void {
    this.attributes[key] = value;
  }
  
  /**
   * End the span
   */
  async end(status?: string): Promise<void> {
    this.endTime = new Date();
    if (status) {
      this.status = status;
    }
    
    // Update the span in the database
    await LoggingService.endTelemetrySpan(this.id, this.status);
  }
  
  /**
   * Persist the span to the database
   */
  private async _persistSpan(): Promise<void> {
    try {
      this.id = await LoggingService.createTelemetrySpan({
        name: this.name,
        traceId: this.traceId,
        spanId: this.spanId,
        parentSpanId: this.parentSpanId,
        startTime: this.startTime,
        endTime: this.endTime,
        status: this.status,
        attributes: this.attributes,
        events: this.events,
        links: this.links,
        source: this.source,
        userId: this.userId,
        agentId: this.agentId,
        sessionId: this.sessionId,
        moduleId: this.moduleId,
        organizationId: this.organizationId
      });
    } catch (error) {
      console.error('Failed to persist span:', error);
    }
  }
}

/**
 * Telemetry service for creating and managing spans
 */
export class Telemetry {
  /**
   * Create a new trace
   */
  static createTrace(): string {
    return uuidv4();
  }
  
  /**
   * Create a new span
   */
  static createSpan(
    name: string, 
    source: string,
    options: {
      parentSpan?: Span;
      traceId?: string;
      parentSpanId?: string;
      attributes?: SpanAttributes;
      links?: SpanLink[];
      userId?: string;
      agentId?: string;
      sessionId?: string;
      moduleId?: string;
      organizationId?: string;
    } = {}
  ): Span {
    let traceId: string;
    let parentSpanId: string | undefined;
    
    if (options.parentSpan) {
      traceId = options.parentSpan.traceId;
      parentSpanId = options.parentSpan.spanId;
    } else {
      traceId = options.traceId || this.createTrace();
      parentSpanId = options.parentSpanId;
    }
    
    const spanId = uuidv4();
    
    return new Span(
      name, 
      { traceId, spanId, parentSpanId }, 
      source,
      {
        attributes: options.attributes,
        links: options.links,
        startTime: new Date(),
        userId: options.userId,
        agentId: options.agentId,
        sessionId: options.sessionId,
        moduleId: options.moduleId,
        organizationId: options.organizationId
      }
    );
  }
  
  /**
   * Create a span context from headers
   */
  static contextFromHeaders(headers: Record<string, string | string[] | undefined>): SpanContext | undefined {
    const traceId = headers['x-trace-id'];
    const spanId = headers['x-span-id'];
    const parentSpanId = headers['x-parent-span-id'];
    
    if (typeof traceId === 'string' && typeof spanId === 'string') {
      return {
        traceId,
        spanId,
        parentSpanId: typeof parentSpanId === 'string' ? parentSpanId : undefined
      };
    }
    
    return undefined;
  }
  
  /**
   * Convert a span context to headers
   */
  static contextToHeaders(context: SpanContext): Record<string, string> {
    const headers: Record<string, string> = {
      'x-trace-id': context.traceId,
      'x-span-id': context.spanId
    };
    
    if (context.parentSpanId) {
      headers['x-parent-span-id'] = context.parentSpanId;
    }
    
    return headers;
  }
}
