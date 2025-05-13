/**
 * Example webhook handler for Sentient Loop™ events
 * 
 * This is a sample Express.js server that handles webhook events from the Sentient Loop™ API.
 */
const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Your webhook secret from the Sentient Loop™ dashboard
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-webhook-secret';

// Parse JSON request bodies
app.use(bodyParser.json());

/**
 * Verify the webhook signature
 * 
 * @param {string} signature The signature from the X-Sentient-Loop-Signature header
 * @param {object|string} payload The request body
 * @param {string} secret The webhook secret
 * @returns {boolean} Whether the signature is valid
 */
function verifySignature(signature, payload, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const body = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const expectedSignature = hmac.update(body).digest('hex');
  
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

/**
 * Webhook endpoint for Sentient Loop™ events
 */
app.post('/webhook', (req, res) => {
  // Get the signature from the headers
  const signature = req.headers['x-sentient-loop-signature'];
  
  // Verify the signature
  if (!signature || !verifySignature(signature, req.body, WEBHOOK_SECRET)) {
    console.error('Invalid signature');
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Get the event type
  const eventType = req.headers['x-sentient-loop-event'];
  
  // Log the event
  console.log(`Received ${eventType} event:`, JSON.stringify(req.body, null, 2));
  
  // Handle different event types
  switch (req.body.type) {
    case 'checkpoint.created':
      handleCheckpointCreated(req.body);
      break;
    case 'checkpoint.resolved':
      handleCheckpointResolved(req.body);
      break;
    case 'escalation.created':
      handleEscalationCreated(req.body);
      break;
    case 'memory.created':
      handleMemoryCreated(req.body);
      break;
    case 'decision.recorded':
      handleDecisionRecorded(req.body);
      break;
    case 'agent.action.processed':
      handleAgentActionProcessed(req.body);
      break;
    default:
      console.log(`Unhandled event type: ${req.body.type}`);
  }
  
  // Acknowledge receipt of the webhook
  res.status(200).json({ received: true });
});

/**
 * Handle checkpoint.created events
 * 
 * @param {object} event The event payload
 */
function handleCheckpointCreated(event) {
  const { checkpointId, type, title, description, status } = event.data;
  
  console.log(`New checkpoint created: ${checkpointId}`);
  console.log(`Type: ${type}`);
  console.log(`Title: ${title}`);
  console.log(`Description: ${description}`);
  console.log(`Status: ${status}`);
  
  // TODO: Implement your business logic here
  // For example, you might want to:
  // - Send a notification to your team
  // - Create a ticket in your issue tracker
  // - Update your dashboard
}

/**
 * Handle checkpoint.resolved events
 * 
 * @param {object} event The event payload
 */
function handleCheckpointResolved(event) {
  const { checkpointId, status, resolution, resolvedAt, resolvedBy } = event.data;
  
  console.log(`Checkpoint resolved: ${checkpointId}`);
  console.log(`Status: ${status}`);
  console.log(`Resolution: ${resolution}`);
  console.log(`Resolved at: ${resolvedAt}`);
  console.log(`Resolved by: ${resolvedBy}`);
  
  // TODO: Implement your business logic here
}

/**
 * Handle escalation.created events
 * 
 * @param {object} event The event payload
 */
function handleEscalationCreated(event) {
  const { escalationId, checkpointId, level, reason, status } = event.data;
  
  console.log(`New escalation created: ${escalationId}`);
  console.log(`Checkpoint ID: ${checkpointId}`);
  console.log(`Level: ${level}`);
  console.log(`Reason: ${reason}`);
  console.log(`Status: ${status}`);
  
  // TODO: Implement your business logic here
  // For critical escalations, you might want to:
  // - Send an urgent notification to your team
  // - Trigger an alert in your monitoring system
  // - Create a high-priority ticket in your issue tracker
}

/**
 * Handle memory.created events
 * 
 * @param {object} event The event payload
 */
function handleMemoryCreated(event) {
  const { memoryId, type, content, importance } = event.data;
  
  console.log(`New memory created: ${memoryId}`);
  console.log(`Type: ${type}`);
  console.log(`Content: ${JSON.stringify(content)}`);
  console.log(`Importance: ${importance}`);
  
  // TODO: Implement your business logic here
}

/**
 * Handle decision.recorded events
 * 
 * @param {object} event The event payload
 */
function handleDecisionRecorded(event) {
  const { decisionId, checkpointId, decisionMaker, reasoning } = event.data;
  
  console.log(`Decision recorded: ${decisionId}`);
  console.log(`Checkpoint ID: ${checkpointId}`);
  console.log(`Decision maker: ${decisionMaker}`);
  console.log(`Reasoning: ${reasoning}`);
  
  // TODO: Implement your business logic here
}

/**
 * Handle agent.action.processed events
 * 
 * @param {object} event The event payload
 */
function handleAgentActionProcessed(event) {
  const { actionId, checkpointId, actionType, title, status } = event.data;
  
  console.log(`Agent action processed: ${actionId || 'N/A'}`);
  console.log(`Checkpoint ID: ${checkpointId || 'N/A'}`);
  console.log(`Action type: ${actionType}`);
  console.log(`Title: ${title}`);
  console.log(`Status: ${status}`);
  
  // TODO: Implement your business logic here
}

// Start the server
app.listen(port, () => {
  console.log(`Webhook server listening at http://localhost:${port}`);
});
