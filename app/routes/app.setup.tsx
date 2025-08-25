import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSubmit, Link } from "@remix-run/react";
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
  Toast,
  Frame,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { useState, useCallback } from "react";

// GraphQL query to check existing metafield definitions
const CHECK_METAFIELDS_QUERY = `
  query metafieldDefinitions($namespace: String!) {
    metafieldDefinitions(first: 10, namespace: $namespace, ownerType: PRODUCTVARIANT) {
      edges {
        node {
          id
          key
          name
          type {
            name
          }
          namespace
          description
        }
      }
    }
  }
`;

// GraphQL mutation to create metafield definitions
const CREATE_METAFIELD_DEFINITION = `
  mutation metafieldDefinitionCreate($definition: MetafieldDefinitionInput!) {
    metafieldDefinitionCreate(definition: $definition) {
      createdDefinition {
        id
        key
        name
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// Required metafield definitions for MAP Guard
const REQUIRED_METAFIELDS = [
  {
    key: "map",
    name: "Minimum Advertised Price",
    type: "money",
    description: "Minimum Advertised Price (MAP) for this variant"
  },
  {
    key: "final_price", 
    name: "Final Price",
    type: "money",
    description: "Actual price customer pays (lower than MAP)"
  },
  {
    key: "enabled",
    name: "MAP Enabled",
    type: "boolean",
    description: "Whether MAP protection is enabled for this variant"
  },
  {
    key: "message",
    name: "Custom MAP Message",
    type: "single_line_text_field",
    description: "Custom message to display for this variant (optional)"
  }
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  
  try {
    // Check existing metafield definitions
    const response = await admin.graphql(CHECK_METAFIELDS_QUERY, {
      variables: {
        namespace: "mapguard"
      }
    });
    
    const data = await response.json();
    const existingMetafields = data?.data?.metafieldDefinitions?.edges || [];
    
    // Map existing metafields by key
    const existingKeys = new Set(
      existingMetafields.map((edge: any) => edge.node.key)
    );
    
    // Check status of each required metafield
    const metafieldStatus = REQUIRED_METAFIELDS.map(metafield => {
      const exists = existingKeys.has(metafield.key);
      const existingData = existingMetafields.find(
        (edge: any) => edge.node.key === metafield.key
      )?.node;
      
      return {
        ...metafield,
        status: exists ? "created" : "missing",
        id: existingData?.id || null
      };
    });
    
    return json({
      metafields: metafieldStatus,
      allCreated: metafieldStatus.every(m => m.status === "created")
    });
    
  } catch (error) {
    console.error("Error checking metafields:", error);
    return json({
      metafields: REQUIRED_METAFIELDS.map(m => ({ ...m, status: "error" })),
      allCreated: false,
      error: "Failed to check metafield status"
    });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");
  
  if (action === "create_all") {
    try {
      const results = [];
      
      // Create each metafield definition
      for (const metafield of REQUIRED_METAFIELDS) {
        const response = await admin.graphql(CREATE_METAFIELD_DEFINITION, {
          variables: {
            definition: {
              name: metafield.name,
              namespace: "mapguard",
              key: metafield.key,
              description: metafield.description,
              type: metafield.type,
              ownerType: "PRODUCTVARIANT"
            }
          }
        });
        
        const data = await response.json();
        results.push({
          key: metafield.key,
          success: !data?.data?.metafieldDefinitionCreate?.userErrors?.length,
          data: data?.data?.metafieldDefinitionCreate
        });
      }
      
      const allSuccess = results.every(r => r.success);
      
      return json({
        success: allSuccess,
        results,
        message: allSuccess 
          ? "All metafield definitions created successfully!"
          : "Some metafield definitions failed to create"
      });
      
    } catch (error) {
      console.error("Error creating metafields:", error);
      return json({
        success: false,
        error: "Failed to create metafield definitions"
      });
    }
  }
  
  return json({ success: false, error: "Invalid action" });
};

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

export default function SetupPage() {
  const loaderData = useLoaderData<typeof loader>();
  const { metafields, allCreated } = loaderData;
  const error = 'error' in loaderData ? loaderData.error : undefined;
  
  const submit = useSubmit();
  const [isCreating, setIsCreating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  
  const missingCount = metafields.filter(m => m.status === "missing").length;

  const handleCreateMetafields = useCallback(() => {
    setIsCreating(true);
    const formData = new FormData();
    formData.append("action", "create_all");
    submit(formData, { method: "post" });
  }, [submit]);

  const rows = metafields.map((field) => [
    field.key,
    field.name,
    field.type,
    field.description,
    field.status === "created" ? (
      <Badge tone="success">Created</Badge>
    ) : field.status === "error" ? (
      <Badge tone="critical">Error</Badge>
    ) : (
      <Badge tone="attention">Missing</Badge>
    ),
  ]);

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
                  Admin Block Configuration
                </Text>
                <Text variant="bodyMd" as="p">
                  The MAP Guard admin block will appear on product detail pages in your Shopify admin. 
                  This block provides quick access to MAP settings for each product variant.
                </Text>
                
                <BlockStack gap="300">
                  <Text variant="headingSm" as="h3">
                    Admin Block Features:
                  </Text>
                  <ul>
                    <li><strong>Variant Overview:</strong> See all variants with their MAP status at a glance</li>
                    <li><strong>Quick Actions:</strong> Edit MAP prices, toggle MAP protection, and set new MAP values</li>
                    <li><strong>Status Badges:</strong> Visual indicators for Active, Violation, Disabled, and Not Set states</li>
                    <li><strong>Compact Design:</strong> Table-like interface with pagination for products with many variants</li>
                  </ul>
                </BlockStack>

                <BlockStack gap="300">
                  <Text variant="headingSm" as="h3">
                    How to Access:
                  </Text>
                  <ol>
                    <li>Go to any product in your Shopify admin</li>
                    <li>Scroll down to find the "MAP Guard" block in the sidebar</li>
                    <li>Use the block to manage MAP settings for all product variants</li>
                  </ol>
                </BlockStack>

                {!allCreated && (
                  <Banner tone="info">
                    <p>
                      <strong>Note:</strong> The admin block will only display MAP data after the metafield definitions are created. 
                      Create the metafields above to enable full functionality.
                    </p>
                  </Banner>
                )}

                {allCreated && (
                  <Banner tone="success">
                    <p>
                      <strong>Ready!</strong> The admin block is now fully configured and ready to use. 
                      Visit any product page in your admin to start managing MAP settings.
                    </p>
                  </Banner>
                )}
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  Variant Admin Block Configuration
                </Text>
                <Text variant="bodyMd" as="p">
                  The Variant Admin Block provides MAP management for individual product variants. 
                  This block appears on product variant detail pages in the Shopify admin.
                </Text>

                <InlineStack gap="400">
                  <div style={{ flex: 1 }}>
                    <Text variant="headingXs" as="h3">Block Features:</Text>
                    <ul>
                      <li><strong>Toggle Control:</strong> Enable/disable MAP enforcement per variant</li>
                      <li><strong>Status Badge:</strong> Visual compliance indicator (Compliant/Violation/Not Set)</li>
                      <li><strong>Inline Editing:</strong> Direct MAP and Final price editing</li>
                      <li><strong>Custom Messages:</strong> Editable MAP enforcement messages</li>
                      <li><strong>Delete Function:</strong> Remove MAP settings when needed</li>
                    </ul>
                  </div>
                  <div style={{ flex: 1 }}>
                    <Text variant="headingXs" as="h3">Location:</Text>
                    <p><code>admin.product-variant-details.block.render</code></p>
                    <Text variant="headingXs" as="h3">Extension ID:</Text>
                    <p><code>variant-admin-block</code></p>
                    <Text variant="headingXs" as="h3">File Location:</Text>
                    <p><code>extensions/variant-admin-block/src/BlockExtension.tsx</code></p>
                  </div>
                </InlineStack>

                {!allCreated && (
                  <Banner tone="info">
                    <p>
                      <strong>Note:</strong> The variant admin block will only display MAP data after the metafield definitions are created. 
                      Create the metafields above to enable full functionality.
                    </p>
                  </Banner>
                )}

                {allCreated && (
                  <Banner tone="success">
                    <p>
                      <strong>Ready!</strong> The variant admin block is now fully configured and ready to use. 
                      Visit any product variant page in your admin to start managing individual variant MAP settings.
                    </p>
                  </Banner>
                )}
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  Theme Block Configuration
                </Text>
                <Text variant="bodyMd" as="p">
                  The MAP Guard Theme Block displays discount messages on your storefront product pages. 
                  This block allows customers to see MAP-related messaging and automatically strikes through prices below MAP.
                </Text>

                <BlockStack gap="300">
                  <Text variant="headingSm" as="h3">
                    Installation Steps:
                  </Text>
                  <ol>
                    <li><strong>Access Theme Editor:</strong> Go to Online Store → Themes → Customize</li>
                    <li><strong>Navigate to Product Page:</strong> Select "Product pages" from the template dropdown</li>
                    <li><strong>Add Block:</strong> Click "Add block" or "Add section" and look for "MAP Guard Message"</li>
                    <li><strong>Position Block:</strong> Place it near the product price area for best visibility</li>
                    <li><strong>Configure Settings:</strong> Customize the message, icon, and styling options</li>
                    <li><strong>Save Theme:</strong> Publish your changes</li>
                  </ol>
                </BlockStack>

                <InlineStack gap="400">
                  <div style={{ flex: 1 }}>
                    <Text variant="headingXs" as="h3">Block Features:</Text>
                    <ul>
                      <li><strong>Configurable Icons:</strong> Choose from cart, tag, discount, or info icons</li>
                      <li><strong>Custom Messages:</strong> Display default or variant-specific discount messages</li>
                      <li><strong>Price Strike-Through:</strong> Automatically strikes through prices below MAP</li>
                      <li><strong>Responsive Design:</strong> Works on desktop and mobile devices</li>
                      <li><strong>Theme Integration:</strong> Matches your store's design seamlessly</li>
                    </ul>
                  </div>
                  <div style={{ flex: 1 }}>
                    <Text variant="headingXs" as="h3">Customization Options:</Text>
                    <ul>
                      <li><strong>Message Settings:</strong> Default text, font size, weight, and color</li>
                      <li><strong>Icon Settings:</strong> Show/hide, type selection, size, and color</li>
                      <li><strong>Block Styling:</strong> Background, border, radius, padding, and margin</li>
                      <li><strong>Strike-Through:</strong> Enable/disable automatic price striking</li>
                      <li><strong>Testing:</strong> Fallback MAP price for development</li>
                    </ul>
                  </div>
                </InlineStack>

                <BlockStack gap="300">
                  <Text variant="headingSm" as="h3">
                    Message Priority (How Messages Are Selected):
                  </Text>
                  <ol>
                    <li><strong>Custom Variant Message:</strong> From variant metafield <code>map_guard.discount_message</code></li>
                    <li><strong>Block Default Message:</strong> Set in theme editor (default: "Add to cart for lower price")</li>
                    <li><strong>Fallback Message:</strong> Hard-coded backup if nothing is configured</li>
                  </ol>
                </BlockStack>

                <BlockStack gap="300">
                  <Text variant="headingSm" as="h3">
                    Price Strike-Through Feature:
                  </Text>
                  <Text variant="bodyMd" as="p">
                    When enabled, this feature automatically detects price elements on the page and strikes through 
                    prices that are below the MAP price. It works with most Shopify themes and handles:
                  </Text>
                  <ul>
                    <li>Variant price changes</li>
                    <li>Dynamic content loading</li>
                    <li>Multiple price formats</li>
                    <li>Responsive design</li>
                  </ul>
                </BlockStack>

                {!allCreated && (
                  <Banner tone="info">
                    <p>
                      <strong>Note:</strong> For the theme block to display variant-specific messages and MAP data, 
                      create the metafield definitions above first. The block will work with default messages even without metafields.
                    </p>
                  </Banner>
                )}

                {allCreated && (
                  <Banner tone="success">
                    <p>
                      <strong>Ready!</strong> The theme block can now access metafield data. 
                      Install it in your theme editor and start customizing the storefront experience.
                    </p>
                  </Banner>
                )}
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
                  <li><strong>Install Theme Block:</strong> Add the MAP Guard Message block to your product pages in the theme editor</li>
                  <li><strong>Configure Theme Block:</strong> Customize the message, icon, styling, and enable price strike-through</li>
                  <li><strong>Test Admin Blocks:</strong> Visit product and variant pages to test the MAP Guard admin blocks</li>
                  <li><strong>Set MAP Prices:</strong> Start configuring MAP settings for your products and variants</li>
                  <li><strong>Configure Messages:</strong> Set up custom discount messages in Settings or per-variant</li>
                  <li><strong>Monitor Compliance:</strong> Use the Products page to track MAP compliance across your catalog</li>
                </ol>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Banner title="Need Help?" tone="info">
                  <p>
                    Having trouble with setup or configuration? Check out our comprehensive{" "}
                    <Link to="/app/faq" style={{ textDecoration: 'underline' }}>
                      FAQ page
                    </Link>{" "}
                    for answers to common questions about metafields, admin blocks, theme configuration, and troubleshooting.
                  </p>
                </Banner>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
