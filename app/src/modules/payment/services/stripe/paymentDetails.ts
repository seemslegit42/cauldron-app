import type { SubscriptionStatus } from '../../utils/plans';
import { PaymentPlanId } from '../../utils/plans';
import { PrismaClient } from '@prisma/client';

export const updateUserStripePaymentDetails = (
  { userStripeId, subscriptionPlan, subscriptionStatus, datePaid, numOfCreditsPurchased }: {
    userStripeId: string;
    subscriptionPlan?: PaymentPlanId;
    subscriptionStatus?: SubscriptionStatus;
    numOfCreditsPurchased?: number;
    datePaid?: Date;
  },
  userDelegate: PrismaClient['user']
) => {
  return userDelegate.update({
    where: {
      paymentProcessorUserId: userStripeId
    },
    data: {
      paymentProcessorUserId: userStripeId,
      subscriptionPlan,
      subscriptionStatus,
      datePaid,
      credits: numOfCreditsPurchased !== undefined ? { increment: numOfCreditsPurchased } : undefined,
    },
  });
};
