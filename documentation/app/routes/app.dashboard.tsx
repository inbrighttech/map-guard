import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  InlineStack,
  Badge,
  Icon,
} from "@shopify/polaris";
import {
  SettingsIcon,
  ProductIcon,
  ThemeIcon,
} from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";

interface LoaderData {
  store: {
    name: string;
    domain: string;
  };
  stats: {
    metafieldsSetup: boolean;
    appBlockEnabled: boolean;
    variantsWithMap: number;
  };
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  try {
    // Get shop info
    const shopResponse = await admin.graphql(`
      query GetShop {
        shop {
          name
          myshopifyDomain
        }
      }
    `);
    const shopData = await shopResponse.json();
    const shop = shopData.data?.shop;

    // Check metafield definitions
    const metafieldsResponse = await admin.graphql(`
      query GetMetafieldDefinitions {
        metafieldDefinitions(first: 10, ownerType: PRODUCTVARIANT, namespace: "mapguard") {
          nodes {
            key
            name
          }
        }
      }
    `);
    const metafieldsData = await metafieldsResponse.json();
    const metafields = metafieldsData.data?.metafieldDefinitions?.nodes || [];
    const metafieldsSetup = metafields.length >= 4; // We expect 4 metafields

    // Check app settings
    const appSettingsResponse = await admin.graphql(`
      query GetAppSettings {
        app {
          metafields(first: 5, namespace: "mapguard") {
            nodes {
              key
              value
            }
          }
        }
      }
    `);
    const appSettingsData = await appSettingsResponse.json();
    const appSettings = appSettingsData.data?.app?.metafields?.nodes || [];
    const appBlockEnabled = appSettings.find((s: any) => s.key === "app_block_enabled")?.value === "true";

    return json<LoaderData>({
      store: {
        name: shop?.name || "Your Store",
        domain: shop?.myshopifyDomain || "",
      },
      stats: {
        metafieldsSetup,
        appBlockEnabled,
        variantsWithMap: 0, // We'll implement this later
      },
    });
  } catch (error) {
    console.error("Error loading dashboard data:", error);
    return json<LoaderData>({
      store: {
        name: "Your Store",
        domain: "",
      },
      stats: {
        metafieldsSetup: false,
        appBlockEnabled: false,
        variantsWithMap: 0,
      },
    });
  }
};

export default function Index() {
  const { store, stats } = useLoaderData<typeof loader>();

  return (
    <Page
      title="MAP Guard Dashboard"
      subtitle={`Minimum Advertised Pricing for ${store.name}`}
    >
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Welcome to MAP Guard 🛡️
                </Text>
                <Text variant="bodyMd" as="p">
                  Protect your brand's minimum advertised pricing with our easy-to-use solution. 
                  Configure MAP pricing at the variant level and display custom messages to customers.
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="400">
                <Text as="h3" variant="headingMd">
                  Setup Status
                </Text>
                <BlockStack gap="200">
                  <InlineStack align="space-between">
                    <Text as="span" variant="bodyMd">
                      Metafields
                    </Text>
                    <Badge tone={stats.metafieldsSetup ? "success" : "attention"}>
                      {stats.metafieldsSetup ? "Complete" : "Pending"}
                    </Badge>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text as="span" variant="bodyMd">
                      App Block
                    </Text>
                    <Badge tone={stats.appBlockEnabled ? "success" : "info"}>
                      {stats.appBlockEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </InlineStack>
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Quick Actions
                </Text>
                <Layout>
                  <Layout.Section variant="oneThird">
                    <Card background="bg-surface-secondary">
                      <BlockStack gap="300" align="center">
                        <Icon source={SettingsIcon} />
                        <Text as="h3" variant="headingMd" alignment="center">
                          Initial Setup
                        </Text>
                        <Text variant="bodyMd" as="p" alignment="center">
                          Configure metafield definitions required for MAP pricing
                        </Text>
                        <Button
                          url="/app/setup"
                          variant="primary"
                          fullWidth
                        >
                          {stats.metafieldsSetup ? "Review Setup" : "Start Setup"}
                        </Button>
                      </BlockStack>
                    </Card>
                  </Layout.Section>

                  <Layout.Section variant="oneThird">
                    <Card background="bg-surface-secondary">
                      <BlockStack gap="300" align="center">
                        <Icon source={ThemeIcon} />
                        <Text as="h3" variant="headingMd" alignment="center">
                          App Block Settings
                        </Text>
                        <Text variant="bodyMd" as="p" alignment="center">
                          Configure message display and app block settings
                        </Text>
                        <Button
                          url="/app/settings"
                          fullWidth
                        >
                          Configure Messages
                        </Button>
                      </BlockStack>
                    </Card>
                  </Layout.Section>

                  <Layout.Section variant="oneThird">
                    <Card background="bg-surface-secondary">
                      <BlockStack gap="300" align="center">
                        <Icon source={ProductIcon} />
                        <Text as="h3" variant="headingMd" alignment="center">
                          Manage Products
                        </Text>
                        <Text variant="bodyMd" as="p" alignment="center">
                          Set MAP pricing on individual product variants
                        </Text>
                        <Button
                          url="/app/products"
                          fullWidth
                          disabled
                        >
                          Coming Soon
                        </Button>
                      </BlockStack>
                    </Card>
                  </Layout.Section>
                </Layout>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        {!stats.metafieldsSetup && (
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Getting Started
              </Text>
              <Text variant="bodyMd" as="p">
                To start using MAP Guard, you'll need to complete the initial setup:
              </Text>
              <BlockStack gap="200">
                <Text as="p">
                  <strong>1. Run Initial Setup:</strong> Create the required metafield definitions for storing MAP pricing data
                </Text>
                <Text as="p">
                  <strong>2. Configure Messages:</strong> Set up your default MAP message and styling preferences
                </Text>
                <Text as="p">
                  <strong>3. Add App Block:</strong> Go to your theme editor and add the "MAP Guard Message" block to product pages
                </Text>
                <Text as="p">
                  <strong>4. Set MAP Pricing:</strong> Configure MAP pricing on individual product variants
                </Text>
              </BlockStack>
              <InlineStack>
                <Button
                  url="/app/setup"
                  variant="primary"
                >
                  Start Setup Now
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>
        )}
      </BlockStack>
    </Page>
  );
}
