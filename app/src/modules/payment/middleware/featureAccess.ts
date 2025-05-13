import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import { LoggingService } from '@src/shared/services/logging';
import { SubscriptionStatus } from '../utils/plans';
import { hasFeature } from '../services/subscriptionService';

/**
 * Middleware to enforce feature access based on subscription plan
 */
export const requireFeatureAccess = (feature: string) => {
  return async (context: any, next: () => Promise<any>) => {
    const { user } = context;
    
    if (!user) {
      throw new HttpError(401, 'Unauthorized');
    }

    // If user is an admin, allow access
    if (user.isAdmin) {
      return next();
    }

    // If user doesn't have an organization, deny access
    if (!user.organizationId) {
      LoggingService.warn({
        message: `Feature access denied: User ${user.id} has no organization`,
        userId: user.id,
        category: 'SECURITY',
        metadata: {
          feature,
        },
      });
      throw new HttpError(403, 'Forbidden: No organization assigned');
    }

    // Check if the feature is available for the user's subscription
    const hasAccess = await hasFeature(user.organizationId, feature);
    
    if (!hasAccess) {
      LoggingService.warn({
        message: `Feature access denied: User ${user.id} attempted to access ${feature}`,
        userId: user.id,
        category: 'SECURITY',
        metadata: {
          feature,
          organizationId: user.organizationId,
        },
      });
      throw new HttpError(403, `Forbidden: Your subscription plan does not include access to this feature`);
    }

    // Continue to the next middleware or handler
    return next();
  };
};

/**
 * Middleware to enforce seat limit based on subscription plan
 */
export const requireAvailableSeat = () => {
  return async (context: any, next: () => Promise<any>) => {
    const { user } = context;
    
    if (!user) {
      throw new HttpError(401, 'Unauthorized');
    }

    // If user is an admin, allow access
    if (user.isAdmin) {
      return next();
    }

    // If user doesn't have an organization, deny access
    if (!user.organizationId) {
      LoggingService.warn({
        message: `Seat access denied: User ${user.id} has no organization`,
        userId: user.id,
        category: 'SECURITY',
      });
      throw new HttpError(403, 'Forbidden: No organization assigned');
    }

    // Check if the user has a seat in the organization's subscription
    const subscription = await prisma.subscription.findUnique({
      where: { organizationId: user.organizationId },
    });

    if (!subscription) {
      LoggingService.warn({
        message: `Seat access denied: Organization ${user.organizationId} has no subscription`,
        userId: user.id,
        category: 'SECURITY',
        metadata: {
          organizationId: user.organizationId,
        },
      });
      throw new HttpError(403, 'Forbidden: No active subscription');
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
        LoggingService.warn({
          message: `Seat access denied: Subscription ${subscription.id} is not active`,
          userId: user.id,
          category: 'SECURITY',
          metadata: {
            organizationId: user.organizationId,
            subscriptionId: subscription.id,
            status: subscription.status,
          },
        });
        throw new HttpError(403, 'Forbidden: Subscription is not active');
      }
    }

    // Check if the user has a seat assigned
    if (!user.seatAssignedAt) {
      LoggingService.warn({
        message: `Seat access denied: User ${user.id} has no seat assigned`,
        userId: user.id,
        category: 'SECURITY',
        metadata: {
          organizationId: user.organizationId,
          subscriptionId: subscription.id,
        },
      });
      throw new HttpError(403, 'Forbidden: No seat assigned');
    }

    // Continue to the next middleware or handler
    return next();
  };
};

/**
 * Check if a feature is available for the current user
 * This is a utility function for client-side use
 */
export const checkFeatureAccess = async (
  user: any,
  feature: string
): Promise<boolean> => {
  if (!user) {
    return false;
  }

  // If user is an admin, allow access
  if (user.isAdmin) {
    return true;
  }

  // If user doesn't have an organization, deny access
  if (!user.organizationId) {
    return false;
  }

  // Check if the feature is available for the user's subscription
  return await hasFeature(user.organizationId, feature);
};

/**
 * React hook for checking feature access on the client side
 */
export const useFeatureAccess = (
  user: any,
  feature: string
): boolean => {
  if (!user) {
    return false;
  }

  // If user is an admin, allow access
  if (user.isAdmin) {
    return true;
  }

  // If user doesn't have an organization, deny access
  if (!user.organizationId) {
    return false;
  }

  // For client-side, we'll use the user's subscription plan directly
  // This is a simplified version that doesn't check the actual subscription status
  const planTier = user.subscriptionPlan as any;
  
  if (!planTier) {
    return false;
  }

  // This is a simplified check - in a real app, you'd want to fetch this from the server
  // or store it in the user's session
  return true;
};