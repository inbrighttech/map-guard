import prisma from "../db.server";
import type { Subscription, BillingPeriod } from "@prisma/client";

export type PlanName = "FREE" | "STARTER" | "PROFESSIONAL" | "ENTERPRISE";

export interface BillingInfo {
  name: string;
  monthlyPrice: number;
  maxVariants: number;
}

// Pricing tier constants - simplified fixed pricing
export const PRICING_TIERS: Record<PlanName, BillingInfo> = {
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
};

/**
 * Get billing amount for a plan (simplified - just the fixed monthly price)
 */
export function getBillingAmount(planName: PlanName): BillingInfo {
  return PRICING_TIERS[planName];
}

/**
 * Get or create the current billing period for a shop
 */
export async function getCurrentBillingPeriod(
  shop: string,
  subscriptionId: string
): Promise<BillingPeriod> {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  let billingPeriod = await prisma.billingPeriod.findFirst({
    where: {
      shop,
      subscriptionId,
      periodStart: {
        gte: periodStart,
      },
      periodEnd: {
        lte: periodEnd,
      },
    },
  });

  if (!billingPeriod) {
    // Create new billing period
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new Error(`Subscription not found: ${subscriptionId}`);
    }

    const billing = getBillingAmount(subscription.planName as PlanName);

    billingPeriod = await prisma.billingPeriod.create({
      data: {
        shop,
        subscriptionId,
        periodStart,
        periodEnd,
        maxEnabledProducts: 0,
        baseAmount: billing.monthlyPrice,
        overageAmount: 0,
        totalAmount: billing.monthlyPrice,
        processed: false,
      },
    });
  }

  return billingPeriod;
}

/**
 * Track peak usage for a billing period
 */
export async function trackPeakUsage(
  shop: string,
  currentEnabledVariants: number
): Promise<void> {
  try {
    // Get the subscription for this shop
    const subscription = await prisma.subscription.findUnique({
      where: { shop },
    });

    if (!subscription) {
      console.warn(`No subscription found for shop: ${shop}`);
      return;
    }

    // Get or create current billing period
    const billingPeriod = await getCurrentBillingPeriod(shop, subscription.id);

    // Update peak usage if current usage is higher
    if (currentEnabledVariants > billingPeriod.maxEnabledProducts) {
      const billing = getBillingAmount(subscription.planName as PlanName);

      await prisma.billingPeriod.update({
        where: { id: billingPeriod.id },
        data: {
          maxEnabledProducts: currentEnabledVariants,
          baseAmount: billing.monthlyPrice,
          overageAmount: 0,
          totalAmount: billing.monthlyPrice,
        },
      });
    }
  } catch (error) {
    console.error("Error tracking peak usage:", error);
    // Don't throw - billing tracking should not block product operations
  }
}

/**
 * Get current usage statistics for a shop
 */
export async function getCurrentUsage(shop: string): Promise<{
  enabledVariants: number;
  subscription: Subscription | null;
  currentBillingPeriod: BillingPeriod | null;
  projectedCost: BillingInfo | null;
}> {
  // Count currently enabled variants
  const enabledVariants = await prisma.product.count({
    where: {
      shop,
      enabled: true,
    },
  });

  // Get subscription
  const subscription = await prisma.subscription.findUnique({
    where: { shop },
  });

  if (!subscription) {
    return {
      enabledVariants,
      subscription: null,
      currentBillingPeriod: null,
      projectedCost: null,
    };
  }

  // Get current billing period
  const currentBillingPeriod = await getCurrentBillingPeriod(shop, subscription.id);

  // Calculate projected cost based on current usage
  const projectedCost = getBillingAmount(subscription.planName as PlanName);

  return {
    enabledVariants,
    subscription,
    currentBillingPeriod,
    projectedCost,
  };
}

/**
 * Calculate savings by upgrading to a higher tier
 */
export function calculateUpgradeSavings(
  currentPlan: PlanName,
  targetPlan: PlanName,
  peakUsage: number
): {
  currentCost: number;
  targetCost: number;
  monthlySavings: number;
} {
  const currentBilling = getBillingAmount(currentPlan);
  const targetBilling = getBillingAmount(targetPlan);

  return {
    currentCost: currentBilling.monthlyPrice,
    targetCost: targetBilling.monthlyPrice,
    monthlySavings: currentBilling.monthlyPrice - targetBilling.monthlyPrice,
  };
}

/**
 * Get billing history for a shop
 */
export async function getBillingHistory(
  shop: string,
  limit: number = 12
): Promise<BillingPeriod[]> {
  return await prisma.billingPeriod.findMany({
    where: { shop },
    orderBy: { periodStart: "desc" },
    take: limit,
  });
}
