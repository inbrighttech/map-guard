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

export default function DashboardPage() {
  const { store, stats } = useLoaderData<typeof loader>();

  return (
    <Page
      title="MAP Guard Dashboard"
      subtitle={`Manage MAP pricing for ${store.name}`}
      primaryAction={{
        content: "Settings",
        icon: SettingsIcon,
        url: "/app/settings",
      }}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Setup Status
                </Text>
                <InlineStack gap="400">
                  <InlineStack gap="200" align="center">
                    <Icon source={ProductIcon} />
                    <Text>Metafields Setup:</Text>
                    <Badge tone={stats.metafieldsSetup ? "success" : "warning"}>
                      {stats.metafieldsSetup ? "Complete" : "Incomplete"}
                    </Badge>
                  </InlineStack>
                  <InlineStack gap="200" align="center">
                    <Icon source={ThemeIcon} />
                    <Text>Theme Block:</Text>
                    <Badge tone={stats.appBlockEnabled ? "success" : "info"}>
                      {stats.appBlockEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </InlineStack>
                </InlineStack>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Quick Stats
                </Text>
                <InlineStack gap="400">
                  <BlockStack gap="100">
                    <Text variant="headingLg">{stats.variantsWithMap}</Text>
                    <Text>Variants with MAP</Text>
                  </BlockStack>
                </InlineStack>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Quick Actions
                </Text>
                <InlineStack gap="300">
                  <Button url="/app/setup">Setup Wizard</Button>
                  <Button url="/app/settings" variant="primary">
                    Configure Settings
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
