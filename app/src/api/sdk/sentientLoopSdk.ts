/**
 * Sentient Loop™ SDK
 * 
 * A TypeScript SDK for interacting with the Sentient Loop™ API.
 */

// Event types that can be emitted by the Sentient Loop
export enum SentientLoopEventType {
  CHECKPOINT_CREATED = 'checkpoint.created',
  CHECKPOINT_UPDATED = 'checkpoint.updated',
  CHECKPOINT_RESOLVED = 'checkpoint.resolved',
  ESCALATION_CREATED = 'escalation.created',
  ESCALATION_RESOLVED = 'escalation.resolved',
  MEMORY_CREATED = 'memory.created',
  MEMORY_UPDATED = 'memory.updated',
  DECISION_RECORDED = 'decision.recorded',
  AGENT_ACTION_PROCESSED = 'agent.action.processed',
  AGENT_ACTION_APPROVED = 'agent.action.approved',
  AGENT_ACTION_REJECTED = 'agent.action.rejected',
  AGENT_ACTION_MODIFIED = 'agent.action.modified',
}

// Decision types
export type DecisionType = 'APPROVE' | 'REJECT' | 'MODIFY' | 'ESCALATE';

// Memory types
export type MemoryType = 'SHORT_TERM' | 'LONG_TERM' | 'EPISODIC' | 'SEMANTIC' | 'PROCEDURAL';

// Checkpoint status
export type CheckpointStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'MODIFIED' | 'EXPIRED' | 'ESCALATED';

// Escalation level
export type EscalationLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// Escalation status
export type EscalationStatus = 'PENDING' | 'ACKNOWLEDGED' | 'RESOLVED' | 'REJECTED';

// Webhook registration options
export interface WebhookRegistrationOptions {
  url: string;
  secret?: string;
  description?: string;
  events: SentientLoopEventType[];
  isActive?: boolean;
  metadata?: Record<string, any>;
}

// Webhook verification options
export interface WebhookVerificationOptions {
  body: any;
  signature: string;
  secret: string;
}

/**
 * Sentient Loop™ SDK client
 */
export class SentientLoopClient {
  private apiKey: string;
  private baseUrl: string;

  /**
   * Create a new Sentient Loop™ SDK client
   * 
   * @param apiKey Your API key
   * @param baseUrl The base URL of the Sentient Loop™ API (default: /api/sentient-loop)
   */
  constructor(apiKey: string, baseUrl: string = '/api/sentient-loop') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Submit a decision for a checkpoint
   * 
   * @param checkpointId The ID of the checkpoint
   * @param decision The decision (APPROVE, REJECT, MODIFY, ESCALATE)
   * @param reasoning The reasoning for the decision
   * @param modifiedPayload The modified payload (required for MODIFY decision)
   * @param metadata Additional metadata
   * @returns The result of the decision
   */
  async submitDecision(
    checkpointId: string,
    decision: DecisionType,
    reasoning: string,
    modifiedPayload?: any,
    metadata?: Record<string, any>
  ) {
    const response = await this.request('/decisions', 'POST', {
      checkpointId,
      decision,
      reasoning,
      modifiedPayload,
      metadata
    });

    return response;
  }

  /**
   * Contribute a memory to the Sentient Loop™ system
   * 
   * @param type The type of memory
   * @param content The memory content
   * @param options Additional options
   * @returns The result of the memory contribution
   */
  async contributeMemory(
    type: MemoryType,
    content: any,
    options?: {
      context?: string;
      importance?: number;
      metadata?: Record<string, any>;
      expiresAt?: Date | string;
      agentId?: string;
      moduleId?: string;
      sessionId?: string;
    }
  ) {
    const response = await this.request('/memories', 'POST', {
      type,
      content,
      ...options,
      expiresAt: options?.expiresAt instanceof Date
        ? options.expiresAt.toISOString()
        : options?.expiresAt
    });

    return response;
  }

  /**
   * Get checkpoints from the Sentient Loop™ system
   * 
   * @param options Query options
   * @returns The checkpoints
   */
  async getCheckpoints(options?: {
    status?: CheckpointStatus;
    moduleId?: string;
    agentId?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'createdAt' | 'updatedAt' | 'expiresAt';
    sortOrder?: 'asc' | 'desc';
  }) {
    const queryParams = new URLSearchParams();
    
    if (options?.status) queryParams.append('status', options.status);
    if (options?.moduleId) queryParams.append('moduleId', options.moduleId);
    if (options?.agentId) queryParams.append('agentId', options.agentId);
    if (options?.limit) queryParams.append('limit', options.limit.toString());
    if (options?.offset) queryParams.append('offset', options.offset.toString());
    if (options?.sortBy) queryParams.append('sortBy', options.sortBy);
    if (options?.sortOrder) queryParams.append('sortOrder', options.sortOrder);

    const response = await this.request(
      `/checkpoints?${queryParams.toString()}`,
      'GET'
    );

    return response;
  }

  /**
   * Get escalations from the Sentient Loop™ system
   * 
   * @param options Query options
   * @returns The escalations
   */
  async getEscalations(options?: {
    status?: EscalationStatus;
    level?: EscalationLevel;
    moduleId?: string;
    agentId?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
  }) {
    const queryParams = new URLSearchParams();
    
    if (options?.status) queryParams.append('status', options.status);
    if (options?.level) queryParams.append('level', options.level);
    if (options?.moduleId) queryParams.append('moduleId', options.moduleId);
    if (options?.agentId) queryParams.append('agentId', options.agentId);
    if (options?.limit) queryParams.append('limit', options.limit.toString());
    if (options?.offset) queryParams.append('offset', options.offset.toString());
    if (options?.sortBy) queryParams.append('sortBy', options.sortBy);
    if (options?.sortOrder) queryParams.append('sortOrder', options.sortOrder);

    const response = await this.request(
      `/escalations?${queryParams.toString()}`,
      'GET'
    );

    return response;
  }

  /**
   * Register a webhook
   * 
   * @param options Webhook registration options
   * @returns The registered webhook
   */
  async registerWebhook(options: WebhookRegistrationOptions) {
    const response = await this.request('/webhooks', 'POST', options);
    return response;
  }

  /**
   * Update a webhook
   * 
   * @param webhookId The ID of the webhook
   * @param options Webhook update options
   * @returns The updated webhook
   */
  async updateWebhook(
    webhookId: string,
    options: Partial<WebhookRegistrationOptions>
  ) {
    const response = await this.request('/webhooks/update', 'POST', {
      webhookId,
      ...options
    });
    return response;
  }

  /**
   * Delete a webhook
   * 
   * @param webhookId The ID of the webhook
   * @returns The result of the deletion
   */
  async deleteWebhook(webhookId: string) {
    const response = await this.request('/webhooks/delete', 'POST', {
      webhookId
    });
    return response;
  }

  /**
   * List webhooks
   * 
   * @param options Query options
   * @returns The webhooks
   */
  async listWebhooks(options?: {
    limit?: number;
    offset?: number;
    isActive?: boolean;
  }) {
    const queryParams = new URLSearchParams();
    
    if (options?.limit) queryParams.append('limit', options.limit.toString());
    if (options?.offset) queryParams.append('offset', options.offset.toString());
    if (options?.isActive !== undefined) queryParams.append('isActive', options.isActive.toString());

    const response = await this.request(
      `/webhooks?${queryParams.toString()}`,
      'GET'
    );

    return response;
  }

  /**
   * Verify a webhook signature
   * 
   * @param options Webhook verification options
   * @returns Whether the signature is valid
   */
  static verifyWebhookSignature(options: WebhookVerificationOptions): boolean {
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', options.secret);
    const payload = typeof options.body === 'string'
      ? options.body
      : JSON.stringify(options.body);
    const expectedSignature = hmac.update(payload).digest('hex');
    
    try {
      return crypto.timingSafeEqual(
        Buffer.from(options.signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Make a request to the Sentient Loop™ API
   * 
   * @param path The API path
   * @param method The HTTP method
   * @param body The request body
   * @returns The response
   */
  private async request(path: string, method: string, body?: any) {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-API-Key': this.apiKey
    };

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'An error occurred');
    }

    return response.json();
  }
}
