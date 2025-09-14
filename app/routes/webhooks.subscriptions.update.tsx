import type { ActionFunction } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { trackPeakUsage } from "../utils/billing.server";

export const action: ActionFunction = async ({ request }) => {
  try {
    const { topic, shop, payload } = await authenticate.webhook(request);

    if (topic !== "APP_SUBSCRIPTIONS_UPDATE") {
      return new Response("Webhook topic not handled", { status: 200 });
    }

    console.log(`Processing subscription update for shop: ${shop}`);

    // Handle subscription lifecycle events
    if (payload.app_subscription) {
      const subscription = payload.app_subscription;
      const subscriptionId = subscription.id.toString();
      const status = subscription.status;

      // Update or create subscription record
      await prisma.subscription.upsert({
        where: { shop },
        update: {
          shopifyChargeId: subscriptionId,
          status,
          updatedAt: new Date(),
        },
        create: {
          shop,
          shopifyChargeId: subscriptionId,
          planName: "FREE", // Default to free plan
          status,
          includedProducts: 1,
          overageRate: 0.0,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          lastBillingAmount: 0.0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // If subscription is active, track current usage
      if (status === "ACTIVE") {
        // Count current enabled variants
        const enabledVariants = await prisma.product.count({
          where: {
            shop,
            enabled: true,
          },
        });

        // Track peak usage for billing
        await trackPeakUsage(shop, enabledVariants);
      }

      console.log(`Updated subscription for ${shop}: ${status}`);
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Subscription webhook error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
