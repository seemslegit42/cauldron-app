import { PrismaClient } from '@prisma/client';
import { 
  PlanTier, 
  planFeatures, 
  BillingInterval,
  PaymentPlanId,
  paymentPlans
} from '../../src/modules/payment/utils/plans';

const prisma = new PrismaClient();

async function seedSubscriptionPlans() {
  console.log('Seeding subscription plans...');
  
  // Create subscription plans
  const plans = [
    {
      name: 'Free',
      tier: PlanTier.Free,
      stripePriceId: 'free_plan',
      monthlyPrice: 0,
      yearlyPrice: null,
      features: planFeatures[PlanTier.Free],
      maxSeats: 1,
      isActive: true,
    },
    {
      name: 'Pro (Monthly)',
      tier: PlanTier.Pro,
      stripePriceId: process.env.PAYMENTS_PRO_MONTHLY_PLAN_ID || 'price_pro_monthly',
      monthlyPrice: 19.99,
      yearlyPrice: null,
      features: planFeatures[PlanTier.Pro],
      maxSeats: 1,
      isActive: true,
    },
    {
      name: 'Pro (Yearly)',
      tier: PlanTier.Pro,
      stripePriceId: process.env.PAYMENTS_PRO_YEARLY_PLAN_ID || 'price_pro_yearly',
      monthlyPrice: 19.99,
      yearlyPrice: 199.99,
      features: planFeatures[PlanTier.Pro],
      maxSeats: 1,
      isActive: true,
    },
    {
      name: 'Team (Monthly)',
      tier: PlanTier.Team,
      stripePriceId: process.env.PAYMENTS_TEAM_MONTHLY_PLAN_ID || 'price_team_monthly',
      monthlyPrice: 49.99,
      yearlyPrice: null,
      features: planFeatures[PlanTier.Team],
      maxSeats: 5,
      isActive: true,
    },
    {
      name: 'Team (Yearly)',
      tier: PlanTier.Team,
      stripePriceId: process.env.PAYMENTS_TEAM_YEARLY_PLAN_ID || 'price_team_yearly',
      monthlyPrice: 49.99,
      yearlyPrice: 499.99,
      features: planFeatures[PlanTier.Team],
      maxSeats: 5,
      isActive: true,
    },
    {
      name: 'Executive (Monthly)',
      tier: PlanTier.Executive,
      stripePriceId: process.env.PAYMENTS_EXECUTIVE_MONTHLY_PLAN_ID || 'price_executive_monthly',
      monthlyPrice: 199.99,
      yearlyPrice: null,
      features: planFeatures[PlanTier.Executive],
      maxSeats: 20,
      isActive: true,
    },
    {
      name: 'Executive (Yearly)',
      tier: PlanTier.Executive,
      stripePriceId: process.env.PAYMENTS_EXECUTIVE_YEARLY_PLAN_ID || 'price_executive_yearly',
      monthlyPrice: 199.99,
      yearlyPrice: 1999.99,
      features: planFeatures[PlanTier.Executive],
      maxSeats: 20,
      isActive: true,
    },
  ];
  
  // Create or update each plan
  for (const plan of plans) {
    const existingPlan = await prisma.subscriptionPlan.findFirst({
      where: {
        OR: [
          { tier: plan.tier, name: plan.name },
          { stripePriceId: plan.stripePriceId },
        ],
      },
    });
    
    if (existingPlan) {
      console.log(`Updating plan: ${plan.name}`);
      await prisma.subscriptionPlan.update({
        where: { id: existingPlan.id },
        data: {
          name: plan.name,
          tier: plan.tier,
          stripePriceId: plan.stripePriceId,
          monthlyPrice: plan.monthlyPrice,
          yearlyPrice: plan.yearlyPrice,
          features: plan.features,
          maxSeats: plan.maxSeats,
          isActive: plan.isActive,
        },
      });
    } else {
      console.log(`Creating plan: ${plan.name}`);
      await prisma.subscriptionPlan.create({
        data: {
          name: plan.name,
          tier: plan.tier,
          stripePriceId: plan.stripePriceId,
          monthlyPrice: plan.monthlyPrice,
          yearlyPrice: plan.yearlyPrice,
          features: plan.features,
          maxSeats: plan.maxSeats,
          isActive: plan.isActive,
        },
      });
    }
  }
  
  console.log('Subscription plans seeded successfully!');
}

async function main() {
  try {
    await seedSubscriptionPlans();
  } catch (error) {
    console.error('Error seeding subscription plans:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();