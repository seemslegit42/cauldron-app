import { useAuth } from 'wasp/client/auth';
import { generateCheckoutSession, getCustomerPortalUrl, useQuery } from 'wasp/client/operations';
import {
  PaymentPlanId,
  paymentPlans,
  prettyPaymentPlanName,
  SubscriptionStatus,
  BillingInterval,
  PlanTier,
  getMonthlyPaymentPlanIds,
  getYearlyPaymentPlanIds,
  hasFeatureAccess,
} from '../utils/plans';
import { AiFillCheckCircle, AiOutlineClose } from 'react-icons/ai';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../../shared/utils/cn';

// Define the best deal plan for highlighting
const bestDealPaymentPlanId: PaymentPlanId = PaymentPlanId.TeamYearly;

// Define feature groups for display
const featureGroups = [
  {
    title: 'Core Features',
    features: [
      { key: 'maxAgents', label: 'AI Agents', valueFormatter: (val: number) => val === -1 ? 'Unlimited' : val.toString() },
      { key: 'maxWorkflows', label: 'Workflows', valueFormatter: (val: number) => val === -1 ? 'Unlimited' : val.toString() },
      { key: 'maxStorage', label: 'Storage', valueFormatter: (val: number) => `${val} GB` },
      { key: 'maxRequests', label: 'API Requests', valueFormatter: (val: number) => val === -1 ? 'Unlimited' : `${val.toLocaleString()} / month` },
    ]
  },
  {
    title: 'Module Access',
    features: [
      { key: 'sentinelAccess', label: 'Sentinel Module', valueFormatter: (val: boolean) => val ? 'Yes' : 'No' },
      { key: 'phantomAccess', label: 'Phantom Module', valueFormatter: (val: boolean) => val ? 'Yes' : 'No' },
      { key: 'athenaAccess', label: 'Athena Module', valueFormatter: (val: boolean) => val ? 'Yes' : 'No' },
      { key: 'arcanaAccess', label: 'Arcana Module', valueFormatter: (val: boolean) => val ? 'Yes' : 'No' },
      { key: 'obeliskAccess', label: 'Obelisk Module', valueFormatter: (val: boolean) => val ? 'Yes' : 'No' },
    ]
  },
  {
    title: 'Advanced Features',
    features: [
      { key: 'customBranding', label: 'Custom Branding', valueFormatter: (val: boolean) => val ? 'Yes' : 'No' },
      { key: 'prioritySupport', label: 'Priority Support', valueFormatter: (val: boolean) => val ? 'Yes' : 'No' },
      { key: 'dedicatedAccount', label: 'Dedicated Account Manager', valueFormatter: (val: boolean) => val ? 'Yes' : 'No' },
      { key: 'advancedAnalytics', label: 'Advanced Analytics', valueFormatter: (val: boolean) => val ? 'Yes' : 'No' },
      { key: 'apiAccess', label: 'API Access', valueFormatter: (val: boolean) => val ? 'Yes' : 'No' },
      { key: 'ssoSupport', label: 'SSO Support', valueFormatter: (val: boolean) => val ? 'Yes' : 'No' },
    ]
  }
];

// Define plan descriptions
const planDescriptions = {
  [PlanTier.Free]: 'Get started with basic features',
  [PlanTier.Pro]: 'Perfect for individuals and small teams',
  [PlanTier.Team]: 'Ideal for growing teams with advanced needs',
  [PlanTier.Executive]: 'Enterprise-grade features for large organizations',
};

const PricingPage = () => {
  const [isPaymentLoading, setIsPaymentLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] = useState<BillingInterval>(BillingInterval.Monthly);
  const [showFeatureComparison, setShowFeatureComparison] = useState<boolean>(false);

  const { data: user } = useAuth();
  const isUserSubscribed =
    !!user && !!user.subscriptionStatus && user.subscriptionStatus !== SubscriptionStatus.Deleted;

  const {
    data: customerPortalUrl,
    isLoading: isCustomerPortalUrlLoading,
    error: customerPortalUrlError,
  } = useQuery(getCustomerPortalUrl, { enabled: isUserSubscribed });

  const navigate = useNavigate();

  // Get plan IDs based on billing interval
  const planIds = billingInterval === BillingInterval.Monthly 
    ? [PaymentPlanId.Free, ...getMonthlyPaymentPlanIds()]
    : [PaymentPlanId.Free, ...getYearlyPaymentPlanIds()];

  async function handleBuyNowClick(paymentPlanId: PaymentPlanId) {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Don't process payment for free plan
    if (paymentPlanId === PaymentPlanId.Free) {
      navigate('/dashboard');
      return;
    }
    
    try {
      setIsPaymentLoading(true);

      const checkoutResults = await generateCheckoutSession(paymentPlanId);

      if (checkoutResults?.sessionUrl) {
        window.open(checkoutResults.sessionUrl, '_self');
      } else {
        throw new Error('Error generating checkout session URL');
      }
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Error processing payment. Please try again later.');
      }
      setIsPaymentLoading(false); // We only set this to false here and not in the try block because we redirect to the checkout url within the same window
    }
  }

  const handleCustomerPortalClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (customerPortalUrlError) {
      setErrorMessage('Error fetching Customer Portal URL');
      return;
    }

    if (!customerPortalUrl) {
      setErrorMessage(`Customer Portal does not exist for user ${user.id}`);
      return;
    }

    window.open(customerPortalUrl, '_blank');
  };

  return (
    <div className="py-10 lg:mt-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div id="pricing" className="mx-auto max-w-4xl text-center">
          <h2 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
            Choose your <span className="text-yellow-500">plan</span>
          </h2>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600 dark:text-white">
          Select the plan that best fits your needs. All plans include a 14-day free trial.
        </p>
        
        {/* Billing interval toggle */}
        <div className="flex justify-center mt-8 mb-12">
          <div className="relative flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setBillingInterval(BillingInterval.Monthly)}
              className={cn(
                "relative w-32 py-2 text-sm font-medium rounded-md transition-colors",
                billingInterval === BillingInterval.Monthly
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval(BillingInterval.Yearly)}
              className={cn(
                "relative w-32 py-2 text-sm font-medium rounded-md transition-colors",
                billingInterval === BillingInterval.Yearly
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              Yearly <span className="text-yellow-500 font-semibold">Save 17%</span>
            </button>
          </div>
        </div>
        
        {errorMessage && (
          <div className="mt-8 rounded-md bg-red-100 p-4 text-red-600 dark:bg-red-200 dark:text-red-800">
            {errorMessage}
          </div>
        )}
        
        {/* Pricing cards */}
        <div className="isolate mx-auto mt-8 grid max-w-md grid-cols-1 gap-y-8 sm:mt-12 lg:mx-0 lg:max-w-none lg:grid-cols-4 lg:gap-x-8">
          {planIds.map((planId) => {
            const plan = paymentPlans[planId];
            const isBestDeal = planId === bestDealPaymentPlanId;
            const isFreePlan = planId === PaymentPlanId.Free;
            
            return (
              <div
                key={planId}
                className={cn(
                  "relative flex grow flex-col justify-between overflow-hidden rounded-3xl p-8 ring-gray-900/10 xl:p-10 dark:ring-gray-100/10",
                  {
                    "ring-2 ring-yellow-500": isBestDeal,
                    "ring-1": !isBestDeal,
                    "lg:mt-8": !isBestDeal && !isFreePlan,
                  }
                )}
              >
                {isBestDeal && (
                  <div
                    className="absolute top-0 right-0 -z-10 h-full w-full transform-gpu blur-3xl"
                    aria-hidden="true"
                  >
                    <div
                      className="absolute h-full w-full bg-gradient-to-br from-amber-400 to-purple-300 opacity-30 dark:opacity-50"
                      style={{
                        clipPath: 'circle(670% at 50% 50%)',
                      }}
                    />
                  </div>
                )}
                
                {isBestDeal && (
                  <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 rounded-full bg-yellow-500 px-3 py-1 text-sm font-semibold text-white">
                    Most Popular
                  </div>
                )}
                
                <div className="mb-8">
                  <div className="flex items-center justify-between gap-x-4">
                    <h3
                      id={planId}
                      className="text-xl leading-8 font-semibold text-gray-900 dark:text-white"
                    >
                      {prettyPaymentPlanName(planId)}
                    </h3>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-white">
                    {planDescriptions[plan.tier]}
                  </p>
                  <p className="mt-6 flex items-baseline gap-x-1 dark:text-white">
                    <span className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                      {isFreePlan ? 'Free' : `$${plan.price.toFixed(2)}`}
                    </span>
                    {!isFreePlan && (
                      <span className="text-sm leading-6 font-semibold text-gray-600 dark:text-white">
                        {billingInterval === BillingInterval.Monthly ? '/month' : '/year'}
                      </span>
                    )}
                  </p>
                  
                  {/* Seats information */}
                  {plan.maxSeats && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {plan.maxSeats === 1 
                        ? 'Single user' 
                        : `Up to ${plan.maxSeats} users`}
                    </p>
                  )}
                  
                  {/* Key features */}
                  <ul
                    role="list"
                    className="mt-8 space-y-3 text-sm leading-6 text-gray-600 dark:text-white"
                  >
                    {/* Show only core features in the card */}
                    {featureGroups[0].features.map((feature) => (
                      <li key={feature.key} className="flex gap-x-3">
                        <AiFillCheckCircle
                          className="h-6 w-5 flex-none text-yellow-500"
                          aria-hidden="true"
                        />
                        {feature.label}: {feature.valueFormatter(plan.features[feature.key as keyof typeof plan.features])}
                      </li>
                    ))}
                    
                    {/* Show a few module access features */}
                    {plan.features.sentinelAccess && (
                      <li className="flex gap-x-3">
                        <AiFillCheckCircle
                          className="h-6 w-5 flex-none text-yellow-500"
                          aria-hidden="true"
                        />
                        Sentinel Module
                      </li>
                    )}
                    
                    {plan.features.phantomAccess && (
                      <li className="flex gap-x-3">
                        <AiFillCheckCircle
                          className="h-6 w-5 flex-none text-yellow-500"
                          aria-hidden="true"
                        />
                        Phantom Module
                      </li>
                    )}
                    
                    {plan.features.athenaAccess && (
                      <li className="flex gap-x-3">
                        <AiFillCheckCircle
                          className="h-6 w-5 flex-none text-yellow-500"
                          aria-hidden="true"
                        />
                        Athena Module
                      </li>
                    )}
                    
                    {/* Show a few advanced features for higher tiers */}
                    {plan.features.customBranding && (
                      <li className="flex gap-x-3">
                        <AiFillCheckCircle
                          className="h-6 w-5 flex-none text-yellow-500"
                          aria-hidden="true"
                        />
                        Custom Branding
                      </li>
                    )}
                    
                    {plan.features.prioritySupport && (
                      <li className="flex gap-x-3">
                        <AiFillCheckCircle
                          className="h-6 w-5 flex-none text-yellow-500"
                          aria-hidden="true"
                        />
                        Priority Support
                      </li>
                    )}
                  </ul>
                </div>
                
                {isUserSubscribed ? (
                  <button
                    onClick={handleCustomerPortalClick}
                    disabled={isCustomerPortalUrlLoading}
                    aria-describedby="manage-subscription"
                    className={cn(
                      'mt-8 block rounded-md px-3 py-2 text-center text-sm leading-6 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400',
                      {
                        'bg-yellow-500 text-white shadow-sm hover:bg-yellow-400 hover:text-white':
                          isBestDeal,
                        'text-gray-600 ring-1 ring-purple-200 ring-inset hover:ring-purple-400':
                          !isBestDeal,
                      }
                    )}
                  >
                    Manage Subscription
                  </button>
                ) : (
                  <button
                    onClick={() => handleBuyNowClick(planId)}
                    aria-describedby={planId}
                    className={cn(
                      {
                        'bg-yellow-500 text-white shadow-sm hover:bg-yellow-400 hover:text-white':
                          isBestDeal,
                        'text-gray-600 ring-1 ring-purple-200 ring-inset hover:ring-purple-400':
                          !isBestDeal,
                      },
                      {
                        'cursor-wait opacity-50': isPaymentLoading,
                      },
                      'mt-8 block rounded-md px-3 py-2 text-center text-sm leading-6 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400 dark:text-white w-full'
                    )}
                    disabled={isPaymentLoading}
                  >
                    {isFreePlan 
                      ? 'Get Started' 
                      : !!user 
                        ? `Start ${plan.trialDays}-day free trial` 
                        : 'Log in to start trial'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Feature comparison toggle */}
        <div className="mt-16 text-center">
          <button
            onClick={() => setShowFeatureComparison(!showFeatureComparison)}
            className="text-yellow-500 hover:text-yellow-600 font-medium"
          >
            {showFeatureComparison ? 'Hide feature comparison' : 'Show full feature comparison'}
          </button>
        </div>
        
        {/* Feature comparison table */}
        {showFeatureComparison && (
          <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">
                    Features
                  </th>
                  {[PlanTier.Free, PlanTier.Pro, PlanTier.Team, PlanTier.Executive].map((tier) => (
                    <th 
                      key={tier} 
                      scope="col" 
                      className={cn(
                        "px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-white",
                        {
                          "bg-yellow-50 dark:bg-yellow-900/20": tier === PlanTier.Team
                        }
                      )}
                    >
                      {tier}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                {featureGroups.map((group) => (
                  <>
                    <tr key={group.title} className="bg-gray-100 dark:bg-gray-800">
                      <th
                        colSpan={5}
                        scope="colgroup"
                        className="py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6"
                      >
                        {group.title}
                      </th>
                    </tr>
                    {group.features.map((feature) => (
                      <tr key={feature.key}>
                        <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                          {feature.label}
                        </td>
                        {[PlanTier.Free, PlanTier.Pro, PlanTier.Team, PlanTier.Executive].map((tier) => {
                          const value = paymentPlans[
                            tier === PlanTier.Free 
                              ? PaymentPlanId.Free 
                              : tier === PlanTier.Pro 
                                ? PaymentPlanId.ProMonthly 
                                : tier === PlanTier.Team 
                                  ? PaymentPlanId.TeamMonthly 
                                  : PaymentPlanId.ExecutiveMonthly
                          ].features[feature.key as keyof typeof paymentPlans[PaymentPlanId.Free]['features']];
                          
                          const formattedValue = feature.valueFormatter(value);
                          
                          return (
                            <td 
                              key={`${feature.key}-${tier}`} 
                              className={cn(
                                "px-3 py-4 text-sm text-center text-gray-500 dark:text-gray-400",
                                {
                                  "bg-yellow-50 dark:bg-yellow-900/20": tier === PlanTier.Team
                                }
                              )}
                            >
                              {typeof value === 'boolean' ? (
                                value ? (
                                  <AiFillCheckCircle className="mx-auto h-5 w-5 text-green-500" />
                                ) : (
                                  <AiOutlineClose className="mx-auto h-5 w-5 text-gray-300 dark:text-gray-600" />
                                )
                              ) : (
                                formattedValue
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Test card info */}
        <p className="mx-auto mt-12 max-w-2xl text-center text-sm text-gray-500 dark:text-gray-400">
          For testing, use credit card number <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">4242 4242 4242 4242</span> with any future expiration date and any CVC.
        </p>
      </div>
    </div>
  );
};

export default PricingPage;
