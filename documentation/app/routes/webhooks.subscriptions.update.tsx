import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const { payload, shop } = await authenticate.webhook(request);

    console.log("Received subscription webhook for shop:", shop);

    const subscriptionData = payload as {
      id: string;
      name: string;
      status: string;
      current_period_end: string;
      trial_ends_on?: string;
      test: boolean;
    };

    // Update subscription in database
    await prisma.subscription.upsert({
      where: { shop },
      update: {
        shopifyChargeId: subscriptionData.id,
        status: subscriptionData.status.toLowerCase(),
        currentPeriodEnd: new Date(subscriptionData.current_period_end),
        trialEndsAt: subscriptionData.trial_ends_on 
          ? new Date(subscriptionData.trial_ends_on) 
          : null,
        updatedAt: new Date(),
      },
      create: {
        shop,
        shopifyChargeId: subscriptionData.id,
        planName: "FREE", // Default to free plan
        status: subscriptionData.status.toLowerCase(),
        includedProducts: 1,
        overageRate: 0.25,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(subscriptionData.current_period_end),
        trialEndsAt: subscriptionData.trial_ends_on 
          ? new Date(subscriptionData.trial_ends_on) 
          : null,
        lastBillingAmount: 0,
        lastUsageCheck: new Date(),
      },
    });

    console.log(`Updated subscription for shop: ${shop}`);

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Subscription webhook error:", error);
    return new Response("Error processing webhook", { status: 500 });
  }
};
