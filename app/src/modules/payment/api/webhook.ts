import { paymentProcessor } from '../services/paymentProcessor';

export const paymentsWebhook = paymentProcessor.webhook;
export const paymentsMiddlewareConfigFn = paymentProcessor.webhookMiddlewareConfigFn;
