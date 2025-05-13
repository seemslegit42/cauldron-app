import { type MiddlewareConfigFn, HttpError } from 'wasp/server';
import { type PaymentsWebhook } from 'wasp/server/api';
import { type PrismaClient } from '@prisma/client';
import express from 'express';
import { Stripe } from 'stripe';
import { stripe } from './stripeClient';
import {
  paymentPlans,
  PaymentPlanId,
  SubscriptionStatus,
  PaymentPlanEffect,
  BillingInterval,
  PlanTier,
  getPlanIdByTierAndInterval,
} from '../../utils/plans';
import { updateUserStripePaymentDetails } from './paymentDetails';
import { emailSender } from 'wasp/server/email';
import { assertUnreachable } from '../../../../shared/utils';
import { requireNodeEnvVar } from '../../../../server/utils';
import { z } from 'zod';
import { 
  createSubscription, 
  updateSubscription, 
  cancelSubscription, 
  handlePaymentFailure, 
  handlePaymentSuccess,
  createInvoice,
  updateInvoice,
} from '../subscriptionService';
import { LoggingService } from '@src/shared/services/logging';

export const stripeWebhook: PaymentsWebhook = async (request, response, context) => {
  const secret = requireNodeEnvVar('STRIPE_WEBHOOK_SECRET');
  const sig = request.headers['stripe-signature'];
  if (!sig) {
    throw new HttpError(400, 'Stripe Webhook Signature Not Provided');
  }
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(request.body, sig, secret);
  } catch (err) {
    throw new HttpError(400, 'Error Constructing Stripe Webhook Event');
  }
  
  const prismaUserDelegate = context.entities.User;
  const prisma = context.entities;
  
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session, prismaUserDelegate, prisma);
        break;
      case 'invoice.paid':
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice, prismaUserDelegate, prisma);
        break;
      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(failedInvoice, prismaUserDelegate, prisma);
        break;
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent, prismaUserDelegate, prisma);
        break;
      case 'customer.subscription.created':
        const createdSubscription = event.data.object as Stripe.Subscription;
        await handleCustomerSubscriptionCreated(createdSubscription, prismaUserDelegate, prisma);
        break;
      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription;
        await handleCustomerSubscriptionUpdated(updatedSubscription, prismaUserDelegate, prisma);
        break;
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        await handleCustomerSubscriptionDeleted(deletedSubscription, prismaUserDelegate, prisma);
        break;
      default:
        // If you'd like to handle more events, you can add more cases above.
        // When deploying your app, you configure your webhook in the Stripe dashboard to only send the events that you're
        // handling above and that are necessary for the functioning of your app. See: https://docs.opensaas.sh/guides/deploying/#setting-up-your-stripe-webhook
        // In development, it is likely that you will receive other events that you are not handling, and that's fine. These can be ignored without any issues.
        console.error('Unhandled event type: ', event.type);
    }
  } catch (error) {
    LoggingService.error({
      message: `Error handling Stripe webhook: ${error}`,
      category: 'BILLING',
      error,
      metadata: {
        eventType: event.type,
        eventId: event.id,
      },
    });
    // We still return a 200 response to Stripe to acknowledge receipt of the webhook
    // This prevents Stripe from retrying the webhook, which could cause duplicate processing
  }
  
  response.json({ received: true }); // Stripe expects a 200 response to acknowledge receipt of the webhook
};

export const stripeMiddlewareConfigFn: MiddlewareConfigFn = (middlewareConfig) => {
  // We need to delete the default 'express.json' middleware and replace it with 'express.raw' middleware
  // because webhook data in the body of the request as raw JSON, not as JSON in the body of the request.
  middlewareConfig.delete('express.json');
  middlewareConfig.set('express.raw', express.raw({ type: 'application/json' }));
  return middlewareConfig;
};

// Because a checkout session completed could potentially result in a failed payment,
// we can update the user's payment details here, but confirm credits or a subscription
// if the payment succeeds in other, more specific, webhooks.
export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  prismaUserDelegate: PrismaClient['user'],
  prisma: PrismaClient
) {
  const userStripeId = validateUserStripeIdOrThrow(session.customer);
  const { line_items } = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ['line_items'],
  });
  const lineItemPriceId = extractPriceId(line_items);
  const planId = getPlanIdByPriceId(lineItemPriceId);
  const plan = paymentPlans[planId];
  
  // Find the user by Stripe customer ID
  const user = await prismaUserDelegate.findFirst({
    where: { paymentProcessorUserId: userStripeId },
  });
  
  if (!user) {
    throw new HttpError(404, `User not found for Stripe customer ID: ${userStripeId}`);
  }
  
  // Handle credits purchase
  if (plan.effect.kind === 'credits') {
    const { numOfCreditsPurchased } = getPlanEffectPaymentDetails({ planId, planEffect: plan.effect });
    
    if (numOfCreditsPurchased) {
      await prismaUserDelegate.update({
        where: { id: user.id },
        data: {
          credits: { increment: numOfCreditsPurchased },
          datePaid: new Date(),
        },
      });
      
      LoggingService.info({
        message: `Added ${numOfCreditsPurchased} credits to user ${user.id}`,
        category: 'BILLING',
        metadata: {
          userId: user.id,
          credits: numOfCreditsPurchased,
          planId,
        },
      });
    }
    
    return;
  }
  
  // Handle subscription purchase
  const { subscriptionPlan } = getPlanEffectPaymentDetails({ planId, planEffect: plan.effect });
  
  // Update user's subscription details
  await updateUserStripePaymentDetails({ 
    userStripeId, 
    subscriptionPlan, 
    subscriptionStatus: SubscriptionStatus.Active 
  }, prismaUserDelegate);
  
  // If the user has an organization, create or update the subscription
  if (user.organizationId) {
    // Check if the organization already has a subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: { organizationId: user.organizationId },
    });
    
    if (existingSubscription) {
      // Update existing subscription
      await updateSubscription(existingSubscription.id, {
        status: SubscriptionStatus.Active,
        cancelAtPeriodEnd: false,
        canceledAt: null,
      });
    } else {
      // Create new subscription
      await createSubscription(
        user.organizationId,
        planId,
        session.subscription as string
      );
    }
  }
}

// This is called when a subscription is purchased or renewed and payment succeeds.
export async function handleInvoicePaid(
  invoice: Stripe.Invoice,
  prismaUserDelegate: PrismaClient['user'],
  prisma: PrismaClient
) {
  const userStripeId = validateUserStripeIdOrThrow(invoice.customer);
  const datePaid = new Date(invoice.period_start * 1000);
  
  // Find the user by Stripe customer ID
  const user = await prismaUserDelegate.findFirst({
    where: { paymentProcessorUserId: userStripeId },
  });
  
  if (!user) {
    throw new HttpError(404, `User not found for Stripe customer ID: ${userStripeId}`);
  }
  
  // Update user's payment details
  await updateUserStripePaymentDetails({ 
    userStripeId, 
    datePaid,
    subscriptionStatus: SubscriptionStatus.Active
  }, prismaUserDelegate);
  
  // If the user has an organization and the invoice is for a subscription
  if (user.organizationId && invoice.subscription) {
    // Find the subscription by Stripe subscription ID
    const subscription = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: invoice.subscription as string },
    });
    
    if (subscription) {
      // Handle payment success
      await handlePaymentSuccess(subscription.id);
      
      // Create an invoice record
      await createInvoice(
        subscription.id,
        invoice.amount_paid / 100, // Convert from cents to dollars
        new Date(invoice.due_date * 1000),
        invoice.id
      );
      
      // Update subscription period
      await updateSubscription(subscription.id, {
        currentPeriodStart: new Date(invoice.period_start * 1000),
        currentPeriodEnd: new Date(invoice.period_end * 1000),
        status: SubscriptionStatus.Active,
        gracePeriodEnd: null,
      });
    }
  }
}

// Handle invoice payment failure
export async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice,
  prismaUserDelegate: PrismaClient['user'],
  prisma: PrismaClient
) {
  const userStripeId = validateUserStripeIdOrThrow(invoice.customer);
  
  // Find the user by Stripe customer ID
  const user = await prismaUserDelegate.findFirst({
    where: { paymentProcessorUserId: userStripeId },
  });
  
  if (!user) {
    throw new HttpError(404, `User not found for Stripe customer ID: ${userStripeId}`);
  }
  
  // Update user's subscription status
  await updateUserStripePaymentDetails({ 
    userStripeId, 
    subscriptionStatus: SubscriptionStatus.PastDue 
  }, prismaUserDelegate);
  
  // If the user has an organization and the invoice is for a subscription
  if (user.organizationId && invoice.subscription) {
    // Find the subscription by Stripe subscription ID
    const subscription = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: invoice.subscription as string },
    });
    
    if (subscription) {
      // Handle payment failure with a 7-day grace period
      await handlePaymentFailure(subscription.id, 7);
      
      // Create an invoice record
      await createInvoice(
        subscription.id,
        invoice.amount_due / 100, // Convert from cents to dollars
        new Date(invoice.due_date * 1000),
        invoice.id
      );
      
      // Send an email to the user
      if (user.email) {
        await emailSender.send({
          to: user.email,
          subject: 'Payment Failed - Action Required',
          text: 'Your payment has failed. Please update your payment method to avoid service interruption.',
          html: `
            <h1>Payment Failed - Action Required</h1>
            <p>Your payment for the subscription has failed. Please update your payment method to avoid service interruption.</p>
            <p>Your subscription will remain active for 7 days, after which it will be suspended if payment is not received.</p>
            <p><a href="${process.env.APP_URL}/settings/billing">Update Payment Method</a></p>
          `,
        });
      }
    }
  }
}

export async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
  prismaUserDelegate: PrismaClient['user'],
  prisma: PrismaClient
) {
  // We handle invoices in the invoice.paid webhook. Invoices exist for subscription payments,
  // but not for one-time payment/credits products which use the Stripe `payment` mode on checkout sessions.
  if (paymentIntent.invoice) {
    return;
  }

  const userStripeId = validateUserStripeIdOrThrow(paymentIntent.customer);
  const datePaid = new Date(paymentIntent.created * 1000);

  // We capture the price id from the payment intent metadata
  // that we passed in when creating the checkout session in checkoutUtils.ts.
  const { metadata } = paymentIntent;

  if (!metadata.priceId) {
    throw new HttpError(400, 'No price id found in payment intent');
  }

  const planId = getPlanIdByPriceId(metadata.priceId);
  const plan = paymentPlans[planId];
  
  // Find the user by Stripe customer ID
  const user = await prismaUserDelegate.findFirst({
    where: { paymentProcessorUserId: userStripeId },
  });
  
  if (!user) {
    throw new HttpError(404, `User not found for Stripe customer ID: ${userStripeId}`);
  }
  
  // Handle subscription payment
  if (plan.effect.kind === 'subscription') {
    return;
  }

  // Handle credits purchase
  const { numOfCreditsPurchased } = getPlanEffectPaymentDetails({
    planId,
    planEffect: plan.effect,
  });

  if (numOfCreditsPurchased) {
    await prismaUserDelegate.update({
      where: { id: user.id },
      data: {
        credits: { increment: numOfCreditsPurchased },
        datePaid,
      },
    });
    
    LoggingService.info({
      message: `Added ${numOfCreditsPurchased} credits to user ${user.id}`,
      category: 'BILLING',
      metadata: {
        userId: user.id,
        credits: numOfCreditsPurchased,
        planId,
      },
    });
  }
}

// Handle subscription creation
export async function handleCustomerSubscriptionCreated(
  subscription: Stripe.Subscription,
  prismaUserDelegate: PrismaClient['user'],
  prisma: PrismaClient
) {
  const userStripeId = validateUserStripeIdOrThrow(subscription.customer);
  
  // Find the user by Stripe customer ID
  const user = await prismaUserDelegate.findFirst({
    where: { paymentProcessorUserId: userStripeId },
  });
  
  if (!user) {
    throw new HttpError(404, `User not found for Stripe customer ID: ${userStripeId}`);
  }
  
  // Extract the price ID and get the plan
  const priceId = extractPriceId(subscription.items);
  const planId = getPlanIdByPriceId(priceId);
  const plan = paymentPlans[planId];
  
  // Update user's subscription details
  await updateUserStripePaymentDetails({ 
    userStripeId, 
    subscriptionPlan: planId,
    subscriptionStatus: mapStripeStatusToSubscriptionStatus(subscription.status),
  }, prismaUserDelegate);
  
  // If the user has an organization, create a subscription
  if (user.organizationId) {
    // Check if the organization already has a subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: { organizationId: user.organizationId },
    });
    
    if (!existingSubscription) {
      // Create new subscription
      await createSubscription(
        user.organizationId,
        planId,
        subscription.id
      );
    }
  }
}

export async function handleCustomerSubscriptionUpdated(
  subscription: Stripe.Subscription,
  prismaUserDelegate: PrismaClient['user'],
  prisma: PrismaClient
) {
  const userStripeId = validateUserStripeIdOrThrow(subscription.customer);
  
  // Find the user by Stripe customer ID
  const user = await prismaUserDelegate.findFirst({
    where: { paymentProcessorUserId: userStripeId },
  });
  
  if (!user) {
    throw new HttpError(404, `User not found for Stripe customer ID: ${userStripeId}`);
  }
  
  // Extract the price ID and get the plan
  const priceId = extractPriceId(subscription.items);
  const planId = getPlanIdByPriceId(priceId);
  
  // Map Stripe status to our subscription status
  const subscriptionStatus = mapStripeStatusToSubscriptionStatus(subscription.status);
  
  // Update user's subscription details
  await updateUserStripePaymentDetails({ 
    userStripeId, 
    subscriptionPlan: planId,
    subscriptionStatus,
  }, prismaUserDelegate);
  
  // If the user has an organization, update the subscription
  if (user.organizationId) {
    // Find the subscription by Stripe subscription ID
    const existingSubscription = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });
    
    if (existingSubscription) {
      // Update subscription
      await updateSubscription(existingSubscription.id, {
        status: subscriptionStatus,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      });
      
      // If the subscription is being canceled at period end, send an email
      if (subscription.cancel_at_period_end && user.email) {
        await emailSender.send({
          to: user.email,
          subject: 'We hate to see you go :(',
          text: 'We hate to see you go. Here is a sweet offer...',
          html: 'We hate to see you go. Here is a sweet offer...',
        });
      }
    }
  }
}

export async function handleCustomerSubscriptionDeleted(
  subscription: Stripe.Subscription,
  prismaUserDelegate: PrismaClient['user'],
  prisma: PrismaClient
) {
  const userStripeId = validateUserStripeIdOrThrow(subscription.customer);
  
  // Find the user by Stripe customer ID
  const user = await prismaUserDelegate.findFirst({
    where: { paymentProcessorUserId: userStripeId },
  });
  
  if (!user) {
    throw new HttpError(404, `User not found for Stripe customer ID: ${userStripeId}`);
  }
  
  // Update user's subscription status
  await updateUserStripePaymentDetails({ 
    userStripeId, 
    subscriptionStatus: SubscriptionStatus.Deleted 
  }, prismaUserDelegate);
  
  // If the user has an organization, cancel the subscription
  if (user.organizationId) {
    // Find the subscription by Stripe subscription ID
    const existingSubscription = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });
    
    if (existingSubscription) {
      // Cancel subscription immediately
      await cancelSubscription(existingSubscription.id, true);
    }
  }
}

function validateUserStripeIdOrThrow(userStripeId: Stripe.Checkout.Session['customer']): string {
  if (!userStripeId) throw new HttpError(400, 'No customer id');
  if (typeof userStripeId !== 'string') throw new HttpError(400, 'Customer id is not a string');
  return userStripeId;
}

const LineItemsPriceSchema = z.object({
  data: z.array(
    z.object({
      price: z.object({
        id: z.string(),
      }),
    })
  ),
});

function extractPriceId(
  items: Stripe.Checkout.Session['line_items'] | Stripe.Subscription['items']
) {
  const result = LineItemsPriceSchema.safeParse(items);
  if (!result.success) {
    throw new HttpError(400, 'No price id in stripe event object');
  }
  if (result.data.data.length > 1) {
    throw new HttpError(400, 'More than one item in stripe event object');
  }
  return result.data.data[0].price.id;
}

function getPlanIdByPriceId(priceId: string): PaymentPlanId {
  const planId = Object.values(PaymentPlanId).find(
    (planId) => paymentPlans[planId].getPaymentProcessorPlanId() === priceId
  );
  if (!planId) {
    throw new Error(`No plan with Stripe price id ${priceId}`);
  }
  return planId;
}

function getPlanEffectPaymentDetails({
  planId,
  planEffect,
}: {
  planId: PaymentPlanId;
  planEffect: PaymentPlanEffect;
}): {
  subscriptionPlan: PaymentPlanId | undefined;
  numOfCreditsPurchased: number | undefined;
} {
  switch (planEffect.kind) {
    case 'subscription':
      return { subscriptionPlan: planId, numOfCreditsPurchased: undefined };
    case 'credits':
      return { subscriptionPlan: undefined, numOfCreditsPurchased: planEffect.amount };
    default:
      assertUnreachable(planEffect);
  }
}

// Map Stripe subscription status to our subscription status
function mapStripeStatusToSubscriptionStatus(stripeStatus: string): SubscriptionStatus {
  switch (stripeStatus) {
    case 'active':
      return SubscriptionStatus.Active;
    case 'past_due':
      return SubscriptionStatus.PastDue;
    case 'canceled':
      return SubscriptionStatus.Deleted;
    case 'unpaid':
      return SubscriptionStatus.Unpaid;
    case 'trialing':
      return SubscriptionStatus.Trialing;
    case 'incomplete':
      return SubscriptionStatus.Incomplete;
    case 'incomplete_expired':
      return SubscriptionStatus.IncompleteExpired;
    default:
      return SubscriptionStatus.Active;
  }
}