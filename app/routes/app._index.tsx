import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Text,
  Button,
  BlockStack,
  InlineStack,
  Badge,
  Icon,
  Banner,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { ShieldCheckMarkIcon, SettingsIcon, ProductIcon } from "@shopify/polaris-icons";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // For now, just return mock data without making API calls
  // This prevents fetch errors during development
  const stats = {
    totalProducts: 0,
    mapEnabledProducts: 0,
    complianceViolations: 0,
    lastCheck: null,
  };

  return json({ stats });
};

export default function Index() {
  const { stats } = useLoaderData<typeof loader>();

  return (
    <Page>
      <TitleBar title="MAP Guard Dashboard" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {/* Welcome Banner */}
            <Banner title="Welcome to MAP Guard" tone="info">
              <p>
                Get started by configuring your MAP policies and admin blocks in the{" "}
                <Link to="/app/setup">Setup page</Link>.
              </p>
            </Banner>

            {/* Quick Stats */}
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  Quick Overview
                </Text>
                <InlineStack gap="800" wrap={false}>
                  <BlockStack gap="200">
                    <InlineStack gap="200" blockAlign="center">
                      <Icon source={ProductIcon} tone="base" />
                      <Text variant="bodyMd" tone="subdued" as="p">
                        Total Products
                      </Text>
                    </InlineStack>
                    <Text variant="heading2xl" as="p">
                      {stats.totalProducts}
                    </Text>
                  </BlockStack>

                  <BlockStack gap="200">
                    <InlineStack gap="200" blockAlign="center">
                      <Icon source={ShieldCheckMarkIcon} tone="success" />
                      <Text variant="bodyMd" tone="subdued" as="p">
                        MAP Enabled
                      </Text>
                    </InlineStack>
                    <Text variant="heading2xl" as="p">
                      {stats.mapEnabledProducts}
                    </Text>
                  </BlockStack>

                  <BlockStack gap="200">
                    <InlineStack gap="200" blockAlign="center">
                      <Badge tone="critical">⚠️</Badge>
                      <Text variant="bodyMd" tone="subdued" as="p">
                        Violations
                      </Text>
                    </InlineStack>
                    <Text variant="heading2xl" as="p">
                      {stats.complianceViolations}
                    </Text>
                  </BlockStack>
                </InlineStack>
              </BlockStack>
            </Card>

            {/* Quick Actions */}
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  Quick Actions
                </Text>
                <InlineStack gap="400">
                  <Button
                    variant="primary"
                    icon={SettingsIcon}
                    url="/app/setup"
                  >
                    Setup MAP Guard
                  </Button>
                  <Button
                    icon={ProductIcon}
                    url="/app/products"
                  >
                    Manage Products
                  </Button>
                  <Button
                    url="/app/settings"
                  >
                    App Settings
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>

            {/* Getting Started */}
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  Getting Started
                </Text>
                <BlockStack gap="300">
                  <Text variant="bodyMd" as="p">
                    MAP Guard helps you maintain minimum advertised price policies across your Shopify store. 
                    Here's how to get started:
                  </Text>
                  <BlockStack gap="200">
                    <Text variant="bodyMd" as="p">
                      <strong>1. Setup Metafields:</strong> Configure the required metafields for storing MAP data
                    </Text>
                    <Text variant="bodyMd" as="p">
                      <strong>2. Configure Admin Blocks:</strong> Enable the product and variant admin blocks in your theme
                    </Text>
                    <Text variant="bodyMd" as="p">
                      <strong>3. Set MAP Prices:</strong> Use the admin blocks or products page to set MAP prices for your variants
                    </Text>
                    <Text variant="bodyMd" as="p">
                      <strong>4. Monitor Compliance:</strong> Track compliance status and manage violations from the dashboard
                    </Text>
                  </BlockStack>
                </BlockStack>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
