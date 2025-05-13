import * as z from 'zod';
import { requireNodeEnvVar } from '../../../server/utils';

export enum SubscriptionStatus {
  PastDue = 'past_due',
  CancelAtPeriodEnd = 'cancel_at_period_end',
  Active = 'active',
  Deleted = 'deleted',
  Trialing = 'trialing',
  Incomplete = 'incomplete',
  IncompleteExpired = 'incomplete_expired',
  Unpaid = 'unpaid',
}

export enum PlanTier {
  Free = 'FREE',
  Pro = 'PRO',
  Team = 'TEAM',
  Executive = 'EXECUTIVE',
}

export enum BillingInterval {
  Monthly = 'monthly',
  Yearly = 'yearly',
}

export enum PaymentPlanId {
  Free = 'free',
  ProMonthly = 'pro_monthly',
  ProYearly = 'pro_yearly',
  TeamMonthly = 'team_monthly',
  TeamYearly = 'team_yearly',
  ExecutiveMonthly = 'executive_monthly',
  ExecutiveYearly = 'executive_yearly',
  Credits10 = 'credits10',
}

export interface PaymentPlan {
  // Returns the id under which this payment plan is identified on your payment processor.
  // E.g. this might be price id on Stripe, or variant id on LemonSqueezy.
  getPaymentProcessorPlanId: () => string;
  effect: PaymentPlanEffect;
  tier: PlanTier;
  billingInterval?: BillingInterval;
  features: PlanFeatures;
  price: number;
  maxSeats?: number;
  trialDays?: number;
}

export type PaymentPlanEffect = 
  | { kind: 'subscription'; billingInterval: BillingInterval } 
  | { kind: 'credits'; amount: number };

export interface PlanFeatures {
  // Core features
  maxAgents: number;
  maxWorkflows: number;
  maxStorage: number; // in GB
  maxRequests: number; // per month
  
  // Module access
  sentinelAccess: boolean;
  phantomAccess: boolean;
  athenaAccess: boolean;
  arcanaAccess: boolean;
  obeliskAccess: boolean;
  
  // Advanced features
  customBranding: boolean;
  prioritySupport: boolean;
  dedicatedAccount: boolean;
  advancedAnalytics: boolean;
  apiAccess: boolean;
  ssoSupport: boolean;
}

export const planFeatures: Record<PlanTier, PlanFeatures> = {
  [PlanTier.Free]: {
    maxAgents: 2,
    maxWorkflows: 3,
    maxStorage: 1,
    maxRequests: 100,
    sentinelAccess: true,
    phantomAccess: false,
    athenaAccess: false,
    arcanaAccess: false,
    obeliskAccess: false,
    customBranding: false,
    prioritySupport: false,
    dedicatedAccount: false,
    advancedAnalytics: false,
    apiAccess: false,
    ssoSupport: false,
  },
  [PlanTier.Pro]: {
    maxAgents: 10,
    maxWorkflows: 20,
    maxStorage: 10,
    maxRequests: 1000,
    sentinelAccess: true,
    phantomAccess: true,
    athenaAccess: true,
    arcanaAccess: false,
    obeliskAccess: false,
    customBranding: false,
    prioritySupport: false,
    dedicatedAccount: false,
    advancedAnalytics: false,
    apiAccess: true,
    ssoSupport: false,
  },
  [PlanTier.Team]: {
    maxAgents: 50,
    maxWorkflows: 100,
    maxStorage: 50,
    maxRequests: 10000,
    sentinelAccess: true,
    phantomAccess: true,
    athenaAccess: true,
    arcanaAccess: true,
    obeliskAccess: false,
    customBranding: true,
    prioritySupport: true,
    dedicatedAccount: false,
    advancedAnalytics: true,
    apiAccess: true,
    ssoSupport: true,
  },
  [PlanTier.Executive]: {
    maxAgents: -1, // unlimited
    maxWorkflows: -1, // unlimited
    maxStorage: 500,
    maxRequests: -1, // unlimited
    sentinelAccess: true,
    phantomAccess: true,
    athenaAccess: true,
    arcanaAccess: true,
    obeliskAccess: true,
    customBranding: true,
    prioritySupport: true,
    dedicatedAccount: true,
    advancedAnalytics: true,
    apiAccess: true,
    ssoSupport: true,
  },
};

export const paymentPlans: Record<PaymentPlanId, PaymentPlan> = {
  [PaymentPlanId.Free]: {
    getPaymentProcessorPlanId: () => 'free_plan', // No payment processor ID needed for free plan
    effect: { kind: 'subscription', billingInterval: BillingInterval.Monthly },
    tier: PlanTier.Free,
    features: planFeatures[PlanTier.Free],
    price: 0,
    maxSeats: 1,
  },
  [PaymentPlanId.ProMonthly]: {
    getPaymentProcessorPlanId: () => requireNodeEnvVar('PAYMENTS_PRO_MONTHLY_PLAN_ID'),
    effect: { kind: 'subscription', billingInterval: BillingInterval.Monthly },
    tier: PlanTier.Pro,
    billingInterval: BillingInterval.Monthly,
    features: planFeatures[PlanTier.Pro],
    price: 19.99,
    maxSeats: 1,
    trialDays: 14,
  },
  [PaymentPlanId.ProYearly]: {
    getPaymentProcessorPlanId: () => requireNodeEnvVar('PAYMENTS_PRO_YEARLY_PLAN_ID'),
    effect: { kind: 'subscription', billingInterval: BillingInterval.Yearly },
    tier: PlanTier.Pro,
    billingInterval: BillingInterval.Yearly,
    features: planFeatures[PlanTier.Pro],
    price: 199.99, // ~16.67/month, save ~17%
    maxSeats: 1,
    trialDays: 14,
  },
  [PaymentPlanId.TeamMonthly]: {
    getPaymentProcessorPlanId: () => requireNodeEnvVar('PAYMENTS_TEAM_MONTHLY_PLAN_ID'),
    effect: { kind: 'subscription', billingInterval: BillingInterval.Monthly },
    tier: PlanTier.Team,
    billingInterval: BillingInterval.Monthly,
    features: planFeatures[PlanTier.Team],
    price: 49.99,
    maxSeats: 5,
    trialDays: 14,
  },
  [PaymentPlanId.TeamYearly]: {
    getPaymentProcessorPlanId: () => requireNodeEnvVar('PAYMENTS_TEAM_YEARLY_PLAN_ID'),
    effect: { kind: 'subscription', billingInterval: BillingInterval.Yearly },
    tier: PlanTier.Team,
    billingInterval: BillingInterval.Yearly,
    features: planFeatures[PlanTier.Team],
    price: 499.99, // ~41.67/month, save ~17%
    maxSeats: 5,
    trialDays: 14,
  },
  [PaymentPlanId.ExecutiveMonthly]: {
    getPaymentProcessorPlanId: () => requireNodeEnvVar('PAYMENTS_EXECUTIVE_MONTHLY_PLAN_ID'),
    effect: { kind: 'subscription', billingInterval: BillingInterval.Monthly },
    tier: PlanTier.Executive,
    billingInterval: BillingInterval.Monthly,
    features: planFeatures[PlanTier.Executive],
    price: 199.99,
    maxSeats: 20,
    trialDays: 14,
  },
  [PaymentPlanId.ExecutiveYearly]: {
    getPaymentProcessorPlanId: () => requireNodeEnvVar('PAYMENTS_EXECUTIVE_YEARLY_PLAN_ID'),
    effect: { kind: 'subscription', billingInterval: BillingInterval.Yearly },
    tier: PlanTier.Executive,
    billingInterval: BillingInterval.Yearly,
    features: planFeatures[PlanTier.Executive],
    price: 1999.99, // ~166.67/month, save ~17%
    maxSeats: 20,
    trialDays: 14,
  },
  [PaymentPlanId.Credits10]: {
    getPaymentProcessorPlanId: () => requireNodeEnvVar('PAYMENTS_CREDITS_10_PLAN_ID'),
    effect: { kind: 'credits', amount: 10 },
    tier: PlanTier.Free, // Credits can be purchased on any plan
    features: planFeatures[PlanTier.Free], // Not relevant for credits
    price: 9.99,
  },
};

export function prettyPaymentPlanName(planId: PaymentPlanId): string {
  const planToName: Record<PaymentPlanId, string> = {
    [PaymentPlanId.Free]: 'Free',
    [PaymentPlanId.ProMonthly]: 'Pro (Monthly)',
    [PaymentPlanId.ProYearly]: 'Pro (Yearly)',
    [PaymentPlanId.TeamMonthly]: 'Team (Monthly)',
    [PaymentPlanId.TeamYearly]: 'Team (Yearly)',
    [PaymentPlanId.ExecutiveMonthly]: 'Executive (Monthly)',
    [PaymentPlanId.ExecutiveYearly]: 'Executive (Yearly)',
    [PaymentPlanId.Credits10]: '10 Credits',
  };
  return planToName[planId];
}

export function parsePaymentPlanId(planId: string): PaymentPlanId {
  if ((Object.values(PaymentPlanId) as string[]).includes(planId)) {
    return planId as PaymentPlanId;
  } else {
    throw new Error(`Invalid PaymentPlanId: ${planId}`);
  }
}

export function getSubscriptionPaymentPlanIds(): PaymentPlanId[] {
  return Object.values(PaymentPlanId).filter(
    (planId) => 
      paymentPlans[planId].effect.kind === 'subscription' && 
      planId !== PaymentPlanId.Free
  );
}

export function getYearlyPaymentPlanIds(): PaymentPlanId[] {
  return Object.values(PaymentPlanId).filter(
    (planId) => 
      paymentPlans[planId].effect.kind === 'subscription' && 
      paymentPlans[planId].billingInterval === BillingInterval.Yearly
  );
}

export function getMonthlyPaymentPlanIds(): PaymentPlanId[] {
  return Object.values(PaymentPlanId).filter(
    (planId) => 
      paymentPlans[planId].effect.kind === 'subscription' && 
      paymentPlans[planId].billingInterval === BillingInterval.Monthly &&
      planId !== PaymentPlanId.Free
  );
}

export function getPlanIdByTierAndInterval(
  tier: PlanTier, 
  interval: BillingInterval
): PaymentPlanId | null {
  const planId = Object.keys(paymentPlans).find(key => {
    const plan = paymentPlans[key as PaymentPlanId];
    return plan.tier === tier && 
           plan.effect.kind === 'subscription' && 
           (plan.effect as any).billingInterval === interval;
  });
  
  return planId ? planId as PaymentPlanId : null;
}

// Feature access control
export function hasFeatureAccess(
  planTier: PlanTier | null | undefined,
  feature: keyof PlanFeatures
): boolean {
  if (!planTier) return false;
  return planFeatures[planTier][feature];
}

// Grace period calculation (default 7 days)
export function calculateGracePeriodEnd(
  subscriptionEndDate: Date,
  gracePeriodDays: number = 7
): Date {
  const gracePeriodEnd = new Date(subscriptionEndDate);
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() + gracePeriodDays);
  return gracePeriodEnd;
}
