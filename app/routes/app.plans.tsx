import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  Button,
  InlineStack,
  Badge,
  Banner,
  Divider,
  Grid,
  Box,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { useState } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return json({});
};

export default function PlansPage() {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const currentPlan: string = "starter";
  
  const plans = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for testing and small stores",
      popular: false,
      features: [
        "Up to 10 products",
        "Basic MAP enforcement", 
        "Theme block display",
        "Email support",
        "Basic reporting"
      ],
      buttonText: currentPlan === "free" ? "Current Plan" : "Select Plan",
      buttonVariant: currentPlan === "free" ? "plain" : "secondary",
    },
    {
      id: "starter", 
      name: "Starter",
      price: "$9.99",
      period: "month",
      description: "Great for growing businesses",
      popular: true,
      features: [
        "Up to 500 products",
        "Full MAP enforcement",
        "Advanced theme tools",
        "Priority email support",
        "Detailed analytics"
      ],
      buttonText: currentPlan === "starter" ? "Current Plan" : "Select Plan",
      buttonVariant: currentPlan === "starter" ? "plain" : "primary",
    },
    {
      id: "professional",
      name: "Professional", 
      price: "$24.99",
      period: "month",
      description: "For established stores",
      popular: false,
      features: [
        "Unlimited products",
        "Advanced analytics",
        "API access",
        "Priority support",
        "Custom integrations"
      ],
      buttonText: currentPlan === "professional" ? "Current Plan" : "Select Plan",
      buttonVariant: currentPlan === "professional" ? "plain" : "primary",
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      description: "Tailored solutions for large stores",
      popular: false,
      features: [
        "Everything in Professional",
        "Custom development",
        "24/7 phone support",
        "SLA guarantees",
        "Dedicated account manager"
      ],
      buttonText: "Contact Sales",
      buttonVariant: "secondary",
    },
  ];

  const handlePlanAction = async (planId: string) => {
    setIsProcessing(planId);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log(`Plan action for: ${planId}`);
    setIsProcessing(null);
  };

  return (
    <Page>
      <TitleBar title="Plans & Pricing" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <Banner title="Choose Your Plan" tone="info">
              <p>
                Select the plan that best fits your store's needs. You can upgrade or downgrade at any time. 
                Billing is handled through Shopify App Billing.
              </p>
            </Banner>

            <Card>
              <BlockStack gap="400">
                <div style={{ textAlign: 'center' }}>
                  <Text variant="headingLg" as="h2">
                    Plans & Pricing
                  </Text>
                  <Text variant="bodyMd" as="p" tone="subdued">
                    Choose the perfect plan for your MAP compliance needs
                  </Text>
                </div>
                
                <Grid>
                  {plans.map((plan) => (
                    <Grid.Cell 
                      key={plan.id} 
                      columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3, xl: 3 }}
                    >
                      <div style={{ height: '100%' }}>
                        <Card>
                          <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            height: '550px' 
                          }}>
                            <Box paddingBlockStart="400" paddingInline="400">
                              <BlockStack gap="300">
                                <InlineStack align="space-between">
                                  <Text variant="headingLg" as="h3">
                                    {plan.name}
                                  </Text>
                                  {plan.popular && (
                                    <Badge tone="info">Most Popular</Badge>
                                  )}
                                  {plan.id === currentPlan && (
                                    <Badge tone="success">Current</Badge>
                                  )}
                                </InlineStack>
                                
                                <InlineStack gap="100" align="start">
                                  <Text variant="heading2xl" as="p">
                                    {plan.price}
                                  </Text>
                                  <Text variant="bodyMd" as="p" tone="subdued">
                                    /{plan.period}
                                  </Text>
                                </InlineStack>
                                
                                <Text variant="bodyMd" as="p" tone="subdued">
                                  {plan.description}
                                </Text>
                              </BlockStack>
                            </Box>

                            <Divider />

                            <div style={{ flexGrow: 1, padding: '16px' }}>
                              <BlockStack gap="300">
                                <Text variant="headingSm" as="h4">
                                  What's included:
                                </Text>
                                <BlockStack gap="200">
                                  {plan.features.map((feature, index) => (
                                    <InlineStack key={index} gap="200" align="start">
                                      <Text variant="bodyMd" as="span" tone="success">
                                        ✓
                                      </Text>
                                      <Text variant="bodyMd" as="p">
                                        {feature}
                                      </Text>
                                    </InlineStack>
                                  ))}
                                </BlockStack>
                              </BlockStack>
                            </div>

                            <Box paddingInline="400" paddingBlockEnd="400">
                              <Button
                                variant={plan.buttonVariant as any}
                                size="large"
                                fullWidth
                                disabled={plan.id === currentPlan}
                                loading={isProcessing === plan.id}
                                onClick={() => handlePlanAction(plan.id)}
                              >
                                {plan.buttonText}
                              </Button>
                            </Box>
                          </div>
                        </Card>
                      </div>
                    </Grid.Cell>
                  ))}
                </Grid>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  Current Usage & Limits
                </Text>
                <Text variant="bodyMd" as="p">
                  Track your current usage against your plan limits.
                </Text>
                
                <BlockStack gap="300">
                  <InlineStack align="space-between">
                    <Text variant="bodyMd" as="p">Products with MAP settings</Text>
                    <Text variant="bodyMd" as="p">
                      <strong>47 / 500</strong>
                    </Text>
                  </InlineStack>
                  
                  <InlineStack align="space-between">
                    <Text variant="bodyMd" as="p">Admin actions (this month)</Text>
                    <Text variant="bodyMd" as="p"><strong>1,247</strong></Text>
                  </InlineStack>
                  
                  <InlineStack align="space-between">
                    <Text variant="bodyMd" as="p">Theme block displays (this month)</Text>
                    <Text variant="bodyMd" as="p"><strong>8,432</strong></Text>
                  </InlineStack>

                  <InlineStack align="space-between">
                    <Text variant="bodyMd" as="p">Current plan</Text>
                    <Badge tone="success">Starter</Badge>
                  </InlineStack>
                </BlockStack>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  Frequently Asked Questions
                </Text>
                
                <BlockStack gap="300">
                  <BlockStack gap="200">
                    <Text variant="headingSm" as="h3">
                      Can I change my plan anytime?
                    </Text>
                    <Text variant="bodyMd" as="p" tone="subdued">
                      Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, 
                      and billing is prorated through Shopify.
                    </Text>
                  </BlockStack>
                  
                  <BlockStack gap="200">
                    <Text variant="headingSm" as="h3">
                      How does billing work?
                    </Text>
                    <Text variant="bodyMd" as="p" tone="subdued">
                      All billing is handled securely through Shopify App Billing. Charges appear on your 
                      Shopify invoice alongside your other app subscriptions.
                    </Text>
                  </BlockStack>
                  
                  <BlockStack gap="200">
                    <Text variant="headingSm" as="h3">
                      What happens if I exceed my product limit?
                    </Text>
                    <Text variant="bodyMd" as="p" tone="subdued">
                      We'll notify you when you approach your limit and help you upgrade to a plan that 
                      fits your needs. Your existing MAP settings will continue to work.
                    </Text>
                  </BlockStack>
                </BlockStack>
              </BlockStack>
            </Card>

            <Banner tone="info">
              <p>
                <strong>Need help choosing?</strong> Our support team can help you select the right plan 
                based on your store size and MAP compliance requirements.
              </p>
            </Banner>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
