import { prisma } from 'wasp/server';
import { HttpError } from 'wasp/server';
import { 
  PlanTier, 
  PaymentPlanId, 
  BillingInterval, 
  SubscriptionStatus,
  calculateGracePeriodEnd,
  getPlanIdByTierAndInterval,
  paymentPlans
} from '../utils/plans';
import { LoggingService } from '@src/shared/services/logging';

/**
 * Create a new subscription for an organization
 */
export async function createSubscription(
  organizationId: string,
  planId: string,
  stripeSubscriptionId?: string
) {
  try {
    const plan = paymentPlans[planId as PaymentPlanId];
    if (!plan) {
      throw new HttpError(400, `Invalid plan ID: ${planId}`);
    }

    // Check if organization already has a subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: { organizationId },
    });

    if (existingSubscription) {
      throw new HttpError(400, 'Organization already has a subscription');
    }

    // Get the subscription plan from the database or create it if it doesn't exist
    let subscriptionPlan = await prisma.subscriptionPlan.findUnique({
      where: { tier: plan.tier },
    });

    if (!subscriptionPlan) {
      // Create the subscription plan if it doesn't exist
      subscriptionPlan = await prisma.subscriptionPlan.create({
        data: {
          name: plan.tier,
          tier: plan.tier,
          stripePriceId: plan.getPaymentProcessorPlanId(),
          monthlyPrice: plan.price,
          yearlyPrice: plan.billingInterval === BillingInterval.Yearly ? plan.price : null,
          features: plan.features,
          maxSeats: plan.maxSeats,
          isActive: true,
        },
      });
    }

    // Calculate subscription period
    const now = new Date();
    const currentPeriodStart = now;
    const currentPeriodEnd = new Date(now);
    
    // Set period end based on billing interval
    if (plan.billingInterval === BillingInterval.Yearly) {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    } else {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    }

    // Create the subscription
    const subscription = await prisma.subscription.create({
      data: {
        organizationId,
        planId: subscriptionPlan.id,
        status: plan.trialDays ? SubscriptionStatus.Trialing : SubscriptionStatus.Active,
        currentPeriodStart,
        currentPeriodEnd,
        stripeSubscriptionId,
        seats: plan.maxSeats || 1,
        usedSeats: 0,
        gracePeriodEnd: null,
        billingCycleAnchor: now,
      },
    });

    LoggingService.info({
      message: `Created subscription for organization ${organizationId}`,
      category: 'BILLING',
      metadata: {
        organizationId,
        planId: subscriptionPlan.id,
        subscriptionId: subscription.id,
      },
    });

    return subscription;
  } catch (error) {
    LoggingService.error({
      message: `Error creating subscription: ${error}`,
      category: 'BILLING',
      error,
      metadata: { organizationId, planId },
    });
    throw error;
  }
}

/**
 * Update an existing subscription
 */
export async function updateSubscription(
  subscriptionId: string,
  data: {
    planId?: string;
    status?: string;
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
    cancelAtPeriodEnd?: boolean;
    canceledAt?: Date;
    stripeSubscriptionId?: string;
    seats?: number;
    usedSeats?: number;
    gracePeriodEnd?: Date;
    billingCycleAnchor?: Date;
    metadata?: any;
  }
) {
  try {
    const subscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data,
    });

    LoggingService.info({
      message: `Updated subscription ${subscriptionId}`,
      category: 'BILLING',
      metadata: {
        subscriptionId,
        ...data,
      },
    });

    return subscription;
  } catch (error) {
    LoggingService.error({
      message: `Error updating subscription: ${error}`,
      category: 'BILLING',
      error,
      metadata: { subscriptionId, ...data },
    });
    throw error;
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  cancelImmediately: boolean = false
) {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new HttpError(404, 'Subscription not found');
    }

    if (cancelImmediately) {
      // Cancel immediately
      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: SubscriptionStatus.Deleted,
          canceledAt: new Date(),
          cancelAtPeriodEnd: false,
        },
      });
    } else {
      // Cancel at period end
      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          cancelAtPeriodEnd: true,
          canceledAt: new Date(),
        },
      });
    }

    LoggingService.info({
      message: `Canceled subscription ${subscriptionId}`,
      category: 'BILLING',
      metadata: {
        subscriptionId,
        cancelImmediately,
      },
    });

    return true;
  } catch (error) {
    LoggingService.error({
      message: `Error canceling subscription: ${error}`,
      category: 'BILLING',
      error,
      metadata: { subscriptionId, cancelImmediately },
    });
    throw error;
  }
}

/**
 * Change a subscription's plan
 */
export async function changeSubscriptionPlan(
  subscriptionId: string,
  newPlanTier: PlanTier,
  billingInterval: BillingInterval = BillingInterval.Monthly
) {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new HttpError(404, 'Subscription not found');
    }

    // Get the new plan ID
    const newPlanId = getPlanIdByTierAndInterval(newPlanTier, billingInterval);
    if (!newPlanId) {
      throw new HttpError(400, `Invalid plan tier or billing interval: ${newPlanTier}, ${billingInterval}`);
    }

    const plan = paymentPlans[newPlanId];

    // Get or create the subscription plan
    let subscriptionPlan = await prisma.subscriptionPlan.findUnique({
      where: { tier: plan.tier },
    });

    if (!subscriptionPlan) {
      // Create the subscription plan if it doesn't exist
      subscriptionPlan = await prisma.subscriptionPlan.create({
        data: {
          name: plan.tier,
          tier: plan.tier,
          stripePriceId: plan.getPaymentProcessorPlanId(),
          monthlyPrice: plan.price,
          yearlyPrice: plan.billingInterval === BillingInterval.Yearly ? plan.price : null,
          features: plan.features,
          maxSeats: plan.maxSeats,
          isActive: true,
        },
      });
    }

    // Update the subscription
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        planId: subscriptionPlan.id,
        seats: plan.maxSeats || 1,
      },
    });

    LoggingService.info({
      message: `Changed subscription plan for ${subscriptionId}`,
      category: 'BILLING',
      metadata: {
        subscriptionId,
        oldPlanId: subscription.planId,
        newPlanId: subscriptionPlan.id,
        billingInterval,
      },
    });

    return updatedSubscription;
  } catch (error) {
    LoggingService.error({
      message: `Error changing subscription plan: ${error}`,
      category: 'BILLING',
      error,
      metadata: { subscriptionId, newPlanTier, billingInterval },
    });
    throw error;
  }
}

/**
 * Add a seat to a subscription
 */
export async function addSubscriptionSeat(
  subscriptionId: string,
  count: number = 1
) {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new HttpError(404, 'Subscription not found');
    }

    // Check if adding seats would exceed the maximum
    if (
      subscription.plan.maxSeats !== null &&
      subscription.seats + count > subscription.plan.maxSeats
    ) {
      throw new HttpError(400, `Cannot add ${count} seats. Maximum seats allowed: ${subscription.plan.maxSeats}`);
    }

    // Update the subscription
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        seats: subscription.seats + count,
      },
    });

    LoggingService.info({
      message: `Added ${count} seat(s) to subscription ${subscriptionId}`,
      category: 'BILLING',
      metadata: {
        subscriptionId,
        previousSeats: subscription.seats,
        newSeats: updatedSubscription.seats,
      },
    });

    return updatedSubscription;
  } catch (error) {
    LoggingService.error({
      message: `Error adding subscription seat: ${error}`,
      category: 'BILLING',
      error,
      metadata: { subscriptionId, count },
    });
    throw error;
  }
}

/**
 * Remove a seat from a subscription
 */
export async function removeSubscriptionSeat(
  subscriptionId: string,
  count: number = 1
) {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new HttpError(404, 'Subscription not found');
    }

    // Check if removing seats would go below the used seats
    if (subscription.seats - count < subscription.usedSeats) {
      throw new HttpError(400, `Cannot remove ${count} seats. Currently using ${subscription.usedSeats} seats.`);
    }

    // Update the subscription
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        seats: subscription.seats - count,
      },
    });

    LoggingService.info({
      message: `Removed ${count} seat(s) from subscription ${subscriptionId}`,
      category: 'BILLING',
      metadata: {
        subscriptionId,
        previousSeats: subscription.seats,
        newSeats: updatedSubscription.seats,
      },
    });

    return updatedSubscription;
  } catch (error) {
    LoggingService.error({
      message: `Error removing subscription seat: ${error}`,
      category: 'BILLING',
      error,
      metadata: { subscriptionId, count },
    });
    throw error;
  }
}

/**
 * Assign a user to a seat in a subscription
 */
export async function assignUserToSeat(
  subscriptionId: string,
  userId: string
) {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new HttpError(404, 'Subscription not found');
    }

    // Check if the user is already assigned to the organization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true, seatAssignedAt: true },
    });

    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    // Check if the user is already assigned to this organization
    if (user.organizationId === subscription.organizationId && user.seatAssignedAt) {
      // User is already assigned to this organization
      return true;
    }

    // Check if adding a user would exceed the available seats
    if (subscription.usedSeats >= subscription.seats) {
      throw new HttpError(400, 'No available seats in the subscription');
    }

    // Update the user
    await prisma.user.update({
      where: { id: userId },
      data: {
        organizationId: subscription.organizationId,
        seatAssignedAt: new Date(),
      },
    });

    // Update the subscription's used seats
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        usedSeats: subscription.usedSeats + 1,
      },
    });

    LoggingService.info({
      message: `Assigned user ${userId} to a seat in subscription ${subscriptionId}`,
      category: 'BILLING',
      metadata: {
        subscriptionId,
        userId,
        organizationId: subscription.organizationId,
      },
    });

    return true;
  } catch (error) {
    LoggingService.error({
      message: `Error assigning user to seat: ${error}`,
      category: 'BILLING',
      error,
      metadata: { subscriptionId, userId },
    });
    throw error;
  }
}

/**
 * Unassign a user from a seat in a subscription
 */
export async function unassignUserFromSeat(
  subscriptionId: string,
  userId: string
) {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new HttpError(404, 'Subscription not found');
    }

    // Check if the user is assigned to the organization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true, seatAssignedAt: true },
    });

    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    // Check if the user is assigned to this organization
    if (user.organizationId !== subscription.organizationId || !user.seatAssignedAt) {
      // User is not assigned to this organization
      return true;
    }

    // Update the user
    await prisma.user.update({
      where: { id: userId },
      data: {
        organizationId: null,
        seatAssignedAt: null,
      },
    });

    // Update the subscription's used seats
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        usedSeats: Math.max(0, subscription.usedSeats - 1),
      },
    });

    LoggingService.info({
      message: `Unassigned user ${userId} from a seat in subscription ${subscriptionId}`,
      category: 'BILLING',
      metadata: {
        subscriptionId,
        userId,
        organizationId: subscription.organizationId,
      },
    });

    return true;
  } catch (error) {
    LoggingService.error({
      message: `Error unassigning user from seat: ${error}`,
      category: 'BILLING',
      error,
      metadata: { subscriptionId, userId },
    });
    throw error;
  }
}

/**
 * Check if a feature is available for a subscription
 */
export async function hasFeature(
  organizationId: string,
  feature: string
): Promise<boolean> {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { organizationId },
      include: { plan: true },
    });

    if (!subscription) {
      return false;
    }

    // Check if the subscription is active
    if (
      subscription.status !== SubscriptionStatus.Active &&
      subscription.status !== SubscriptionStatus.Trialing
    ) {
      // Check if the subscription is in grace period
      if (
        subscription.status === SubscriptionStatus.PastDue &&
        subscription.gracePeriodEnd &&
        new Date() < subscription.gracePeriodEnd
      ) {
        // In grace period, allow access
      } else {
        // Not active and not in grace period
        return false;
      }
    }

    // Check if the feature is available in the plan
    const features = subscription.plan.features as any;
    return !!features[feature];
  } catch (error) {
    LoggingService.error({
      message: `Error checking feature availability: ${error}`,
      category: 'BILLING',
      error,
      metadata: { organizationId, feature },
    });
    return false;
  }
}

/**
 * Create a subscription invoice
 */
export async function createInvoice(
  subscriptionId: string,
  amount: number,
  dueDate: Date,
  stripeInvoiceId?: string
) {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new HttpError(404, 'Subscription not found');
    }

    const invoice = await prisma.subscriptionInvoice.create({
      data: {
        subscriptionId,
        organizationId: subscription.organizationId,
        amount,
        status: 'open',
        dueDate,
        stripeInvoiceId,
      },
    });

    LoggingService.info({
      message: `Created invoice for subscription ${subscriptionId}`,
      category: 'BILLING',
      metadata: {
        subscriptionId,
        invoiceId: invoice.id,
        amount,
        dueDate,
      },
    });

    return invoice;
  } catch (error) {
    LoggingService.error({
      message: `Error creating invoice: ${error}`,
      category: 'BILLING',
      error,
      metadata: { subscriptionId, amount, dueDate },
    });
    throw error;
  }
}

/**
 * Update a subscription invoice
 */
export async function updateInvoice(
  invoiceId: string,
  data: {
    status?: string;
    paidAt?: Date;
    stripePaymentIntentId?: string;
    metadata?: any;
  }
) {
  try {
    const invoice = await prisma.subscriptionInvoice.update({
      where: { id: invoiceId },
      data,
    });

    LoggingService.info({
      message: `Updated invoice ${invoiceId}`,
      category: 'BILLING',
      metadata: {
        invoiceId,
        ...data,
      },
    });

    return invoice;
  } catch (error) {
    LoggingService.error({
      message: `Error updating invoice: ${error}`,
      category: 'BILLING',
      error,
      metadata: { invoiceId, ...data },
    });
    throw error;
  }
}

/**
 * Handle subscription payment failure
 */
export async function handlePaymentFailure(
  subscriptionId: string,
  gracePeriodDays: number = 7
) {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new HttpError(404, 'Subscription not found');
    }

    // Calculate grace period end date
    const gracePeriodEnd = calculateGracePeriodEnd(
      subscription.currentPeriodEnd,
      gracePeriodDays
    );

    // Update the subscription
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: SubscriptionStatus.PastDue,
        gracePeriodEnd,
      },
    });

    LoggingService.info({
      message: `Handled payment failure for subscription ${subscriptionId}`,
      category: 'BILLING',
      metadata: {
        subscriptionId,
        gracePeriodEnd,
        gracePeriodDays,
      },
    });

    return true;
  } catch (error) {
    LoggingService.error({
      message: `Error handling payment failure: ${error}`,
      category: 'BILLING',
      error,
      metadata: { subscriptionId, gracePeriodDays },
    });
    throw error;
  }
}

/**
 * Handle subscription payment success
 */
export async function handlePaymentSuccess(
  subscriptionId: string,
  invoiceId?: string
) {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new HttpError(404, 'Subscription not found');
    }

    // Update the subscription
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: SubscriptionStatus.Active,
        gracePeriodEnd: null,
      },
    });

    // Update the invoice if provided
    if (invoiceId) {
      await prisma.subscriptionInvoice.update({
        where: { id: invoiceId },
        data: {
          status: 'paid',
          paidAt: new Date(),
        },
      });
    }

    LoggingService.info({
      message: `Handled payment success for subscription ${subscriptionId}`,
      category: 'BILLING',
      metadata: {
        subscriptionId,
        invoiceId,
      },
    });

    return true;
  } catch (error) {
    LoggingService.error({
      message: `Error handling payment success: ${error}`,
      category: 'BILLING',
      error,
      metadata: { subscriptionId, invoiceId },
    });
    throw error;
  }
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string) {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        plan: true,
        organization: {
          select: {
            id: true,
            name: true,
            users: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                seatAssignedAt: true,
              },
            },
          },
        },
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!subscription) {
      throw new HttpError(404, 'Subscription not found');
    }

    return subscription;
  } catch (error) {
    LoggingService.error({
      message: `Error getting subscription: ${error}`,
      category: 'BILLING',
      error,
      metadata: { subscriptionId },
    });
    throw error;
  }
}

/**
 * Get subscription by organization ID
 */
export async function getSubscriptionByOrganization(organizationId: string) {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { organizationId },
      include: {
        plan: true,
        organization: {
          select: {
            id: true,
            name: true,
            users: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                seatAssignedAt: true,
              },
            },
          },
        },
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    return subscription;
  } catch (error) {
    LoggingService.error({
      message: `Error getting subscription by organization: ${error}`,
      category: 'BILLING',
      error,
      metadata: { organizationId },
    });
    throw error;
  }
}