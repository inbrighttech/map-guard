import { Page, Layout, Card, BlockStack, Text } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

export default function SettingsPage() {
  return (
    <Page>
      <TitleBar title="Settings" />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">
                MAP Guard App Settings
              </Text>
              <Text variant="bodyMd" as="p">
                <strong>There are currently no app settings to configure.</strong>
              </Text>
              <Text variant="bodyMd" as="p">
                All appearance and message options are managed in the theme block.
                This page will be updated when new global settings are available.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
