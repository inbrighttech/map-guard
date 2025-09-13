import { useLoaderData } from "@remix-run/react";
import { useMemo } from "react";
import type { Subscription, BillingPeriod } from "@prisma/client";

// Define types locally to match simplified billing
export const PRICING_TIERS = {
  FREE: {
    name: "FREE",
    monthlyPrice: 0,
    maxVariants: 1,
  },
  STARTER: {
    name: "STARTER", 
    monthlyPrice: 9.99,
    maxVariants: 50,
  },
  PROFESSIONAL: {
    name: "PROFESSIONAL",
    monthlyPrice: 29.99,
    maxVariants: 200,
  },
  ENTERPRISE: {
    name: "ENTERPRISE",
    monthlyPrice: 99.99,
    maxVariants: 1000,
  },
} as const;

export type PlanName = keyof typeof PRICING_TIERS;

// Client-side billing calculation
function calculateBillingAmount(
  planName: PlanName,
  peakUsage: number
): {
  monthlyPrice: number;
  totalAmount: number;
  maxVariants: number;
} {
  const tier = PRICING_TIERS[planName];
  
  return {
    monthlyPrice: tier.monthlyPrice,
    totalAmount: tier.monthlyPrice,
    maxVariants: tier.maxVariants,
  };
}

function calculateUpgradeSavings(
  currentPlan: PlanName,
  targetPlan: PlanName,
  peakUsage: number
): {
  currentCost: number;
  targetCost: number;
  monthlySavings: number;
} {
  const currentBilling = calculateBillingAmount(currentPlan, peakUsage);
  const targetBilling = calculateBillingAmount(targetPlan, peakUsage);

  return {
    currentCost: currentBilling.totalAmount,
    targetCost: targetBilling.totalAmount,
    monthlySavings: currentBilling.totalAmount - targetBilling.totalAmount,
  };
}

export interface BillingData {
  enabledVariants: number;
  subscription: Subscription | null;
  currentBillingPeriod: BillingPeriod | null;
  projectedCost: ReturnType<typeof calculateBillingAmount> | null;
}

/**
 * Hook for billing-related calculations and state
 */
export function useBilling(billingData?: BillingData) {
  const data = billingData || useLoaderData<BillingData>();
  
  const {
    enabledVariants,
    subscription,
    currentBillingPeriod,
    projectedCost,
  } = data;

  const calculations = useMemo(() => {
    if (!subscription || !currentBillingPeriod || !projectedCost) {
      return {
        currentUsage: enabledVariants,
        peakUsage: 0,
        isOverPlan: false,
        overageProducts: 0,
        currentMonthlyEstimate: 0,
        projectedMonthlyEstimate: 0,
        upgradeSavings: null,
        planLimits: PRICING_TIERS.FREE,
      };
    }

    const planName = subscription.planName as keyof typeof PRICING_TIERS;
    const planLimits = PRICING_TIERS[planName];
    const peakUsage = Math.max(enabledVariants, currentBillingPeriod.maxEnabledProducts);
    const isOverPlan = enabledVariants > planLimits.maxVariants;
    const overageVariants = Math.max(0, enabledVariants - planLimits.maxVariants);

    // Current month estimate - just the fixed monthly price
    const currentMonthlyEstimate = currentBillingPeriod.totalAmount;

    // Projected monthly estimate - just the fixed monthly price
    const projectedMonthlyEstimate = projectedCost.monthlyPrice;

    // Calculate potential savings by upgrading
    let upgradeSavings = null;
    if (overageVariants > 0) {
      const planNames = Object.keys(PRICING_TIERS) as Array<keyof typeof PRICING_TIERS>;
      const currentPlanIndex = planNames.indexOf(planName);
      
      // Check next tier up
      if (currentPlanIndex < planNames.length - 1) {
        const nextPlan = planNames[currentPlanIndex + 1];
        const savings = calculateUpgradeSavings(planName, nextPlan, peakUsage);
        
        if (savings.monthlySavings > 0) {
          upgradeSavings = {
            targetPlan: nextPlan,
            ...savings,
          };
        }
      }
    }

    return {
      currentUsage: enabledVariants,
      peakUsage,
      isOverPlan,
      overageVariants,
      currentMonthlyEstimate,
      projectedMonthlyEstimate,
      upgradeSavings,
      planLimits,
    };
  }, [enabledVariants, subscription, currentBillingPeriod, projectedCost]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getUsagePercentage = (): number => {
    if (!calculations.planLimits) return 0;
    return Math.min(100, (calculations.currentUsage / calculations.planLimits.maxVariants) * 100);
  };

  const getUsageStatus = (): 'safe' | 'warning' | 'over' => {
    const percentage = getUsagePercentage();
    if (percentage > 100) return 'over';
    if (percentage > 80) return 'warning';
    return 'safe';
  };

  const getAllPlans = () => {
    return Object.entries(PRICING_TIERS).map(([key, plan]) => ({
      planName: key as keyof typeof PRICING_TIERS,
      name: plan.name,
      maxVariants: plan.maxVariants,
      monthlyPrice: plan.monthlyPrice,
      isCurrent: subscription?.planName === key,
    }));
  };

  return {
    // Raw data
    subscription,
    currentBillingPeriod,
    
    // Calculated values
    ...calculations,
    
    // Utility functions
    formatCurrency,
    getUsagePercentage,
    getUsageStatus,
    getAllPlans,
    
    // State helpers
    isLoading: !data,
    hasSubscription: !!subscription,
    isFreePlan: subscription?.planName === 'FREE',
  };
}

/**
 * Hook for getting upgrade recommendations
 */
export function useUpgradeRecommendations(billingData?: BillingData) {
  const billing = useBilling(billingData);
  
  const recommendations = useMemo(() => {
    if (!billing.hasSubscription || !billing.subscription) return [];

    const currentPlan = billing.subscription.planName as keyof typeof PRICING_TIERS;
    const planNames = Object.keys(PRICING_TIERS) as Array<keyof typeof PRICING_TIERS>;
    const currentIndex = planNames.indexOf(currentPlan);
    
    const recs = [];
    
    // If over current plan limits, recommend upgrade
    if (billing.isOverPlan && billing.upgradeSavings) {
      recs.push({
        type: 'overage' as const,
        title: 'Upgrade to Save on Overages',
        description: `You're using ${billing.overageProducts} products over your ${String(currentPlan)} plan limit.`,
        savings: billing.upgradeSavings.monthlySavings,
        targetPlan: billing.upgradeSavings.targetPlan,
        priority: 'high' as const,
      });
    }
    
    // If approaching limits, recommend preemptive upgrade
    const usagePercentage = billing.getUsagePercentage();
    if (usagePercentage > 80 && usagePercentage <= 100 && currentIndex < planNames.length - 1) {
      const nextPlan = planNames[currentIndex + 1];
      recs.push({
        type: 'approaching' as const,
        title: 'Consider Upgrading Soon',
        description: `You're using ${Math.round(usagePercentage)}% of your ${String(currentPlan)} plan limit.`,
        targetPlan: nextPlan,
        priority: 'medium' as const,
      });
    }
    
    return recs;
  }, [billing]);

  return recommendations;
}
