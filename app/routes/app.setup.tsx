import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  DataTable,
  Badge,
  Button,
  BlockStack,
  Text,
  InlineStack,
  Banner,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

// Mock data for now - will replace with real GraphQL queries later
const mockMetafieldStatus = [
  {
    key: "mapguard.map",
    name: "Minimum Advertised Price",
    type: "money",
    status: "missing",
    description: "Minimum Advertised Price (MAP) for this variant"
  },
  {
    key: "mapguard.final_price",
    name: "Final Price", 
    type: "money",
    status: "missing",
    description: "Actual price customer pays (lower than MAP)"
  },
  {
    key: "mapguard.enabled",
    name: "MAP Enabled",
    type: "boolean", 
    status: "missing",
    description: "Whether MAP protection is enabled for this variant"
  },
  {
    key: "mapguard.message",
    name: "Custom MAP Message",
    type: "single_line_text_field",
    status: "missing", 
    description: "Custom message to display for this variant (optional)"
  }
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  
  // TODO: Add real metafield status checking logic here
  return json({
    metafields: mockMetafieldStatus
  });
};

export default function SetupPage() {
  const { metafields } = useLoaderData<typeof loader>();
  
  const missingCount = metafields.filter(m => m.status === "missing").length;
  const allCreated = missingCount === 0;

  const rows = metafields.map((field) => [
    field.key,
    field.name,
    field.type,
    field.description,
    field.status === "created" ? (
      <Badge tone="success">Created</Badge>
    ) : (
      <Badge tone="critical">Missing</Badge>
    ),
  ]);

  const handleCreateMetafields = () => {
    // TODO: Implement metafield creation logic
    console.log("Creating metafields...");
  };

  return (
    <Page>
      <TitleBar title="Setup" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {!allCreated && (
              <Banner
                title="Metafield Setup Required"
                tone="warning"
              >
                <p>
                  {missingCount} metafield definition{missingCount !== 1 ? 's' : ''} need to be created 
                  before you can use MAP Guard. Click the button below to create them automatically.
                </p>
              </Banner>
            )}

            {allCreated && (
              <Banner
                title="Setup Complete!"
                tone="success"
              >
                <p>All required metafield definitions have been created. You can now configure MAP settings for your products.</p>
              </Banner>
            )}

            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text variant="headingMd" as="h2">
                    Metafield Definitions
                  </Text>
                  {!allCreated && (
                    <Button
                      variant="primary"
                      onClick={handleCreateMetafields}
                    >
                      Create Missing Metafields
                    </Button>
                  )}
                </InlineStack>

                <DataTable
                  columnContentTypes={[
                    'text',
                    'text', 
                    'text',
                    'text',
                    'text',
                  ]}
                  headings={[
                    'Key',
                    'Name',
                    'Type',
                    'Description',
                    'Status',
                  ]}
                  rows={rows}
                />
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  Next Steps
                </Text>
                <Text variant="bodyMd" as="p">
                  After creating the metafield definitions:
                </Text>
                <ol>
                  <li>Configure your MAP messages in Settings</li>
                  <li>Add the MAP message block to your theme</li>
                  <li>Start managing MAP settings for your products</li>
                </ol>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
