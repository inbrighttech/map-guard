import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { useI18n } from "../hooks/useI18n";
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
  const { t } = useI18n();
  return (
    <Page>
      <TitleBar title={t('dashboard.title')} />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {/* Welcome Banner */}
            <Banner title={t('dashboard.welcome.title')} tone="info">
              <p>
                {t('dashboard.welcome.description', { setupLink: <Link to="/app/setup">{t('app.navigation.setup')}</Link> })}
              </p>
            </Banner>

            {/* Quick Stats */}
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  {t('dashboard.overview.title')}
                </Text>
                <InlineStack gap="800" wrap={false}>
                  <BlockStack gap="200">
                    <InlineStack gap="200" blockAlign="center">
                      <Icon source={ProductIcon} tone="base" />
                      <Text variant="bodyMd" tone="subdued" as="p">
                        {t('dashboard.overview.total_products')}
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
                        {t('dashboard.overview.map_enabled')}
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
                        {t('dashboard.overview.violations')}
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
                  {t('dashboard.quick_actions.title')}
                </Text>
                <InlineStack gap="400">
                  <Button
                    variant="primary"
                    icon={SettingsIcon}
                    url="/app/setup"
                  >
                    {t('dashboard.quick_actions.setup_map_guard')}
                  </Button>
                  <Button
                    icon={ProductIcon}
                    url="/app/products"
                  >
                    {t('dashboard.quick_actions.manage_products')}
                  </Button>
                  <Button
                    url="/app/settings"
                  >
                    {t('dashboard.quick_actions.app_settings')}
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>

            {/* Getting Started */}
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  {t('dashboard.getting_started.title')}
                </Text>
                <BlockStack gap="300">
                  <Text variant="bodyMd" as="p">
                    {t('dashboard.getting_started.description')}
                  </Text>
                  <BlockStack gap="200">
                    <Text variant="bodyMd" as="p">
                      <strong>1.</strong> {t('dashboard.getting_started.step_1')}
                    </Text>
                    <Text variant="bodyMd" as="p">
                      <strong>2.</strong> {t('dashboard.getting_started.step_2')}
                    </Text>
                    <Text variant="bodyMd" as="p">
                      <strong>3.</strong> {t('dashboard.getting_started.step_3')}
                    </Text>
                    <Text variant="bodyMd" as="p">
                      <strong>4.</strong> {t('dashboard.getting_started.step_4')}
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
