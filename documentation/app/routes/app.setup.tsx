import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData, useNavigation, Form } from "@remix-run/react";
import {
  Page,
  Card,
  Button,
  Text,
  BlockStack,
  InlineStack,
  Badge,
  Banner,
  List,
  Icon,
  DataTable,
  Layout,
  Tooltip,
} from "@shopify/polaris";
import { CheckIcon, AlertTriangleIcon } from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";

interface MetafieldDefinition {
  key: string;
  name: string;
  type: string;
  description: string;
  namespace: string;
}

const REQUIRED_METAFIELDS: MetafieldDefinition[] = [
  {
    key: "map",
    name: "Minimum Advertised Price",
    type: "money",
    description: "Minimum Advertised Price (MAP) for this variant",
    namespace: "mapguard",
  },
  {
    key: "final_price",
    name: "Final Price",
    type: "money",
    description: "Final discounted price displayed to customers for this variant",
    namespace: "mapguard",
  },
  {
    key: "enabled",
    name: "MAP Enabled",
    type: "boolean",
    description: "Whether MAP pricing is enabled for this variant",
    namespace: "mapguard",
  },
  {
    key: "display",
    name: "Show Message",
    type: "boolean",
    description: "Whether to show custom message instead of price for this variant",
    namespace: "mapguard",
  },
  {
    key: "custom_message",
    name: "Custom Message",
    type: "single_line_text_field",
    description: "Custom message to display when MAP pricing is active for this variant",
    namespace: "mapguard",
  },
];

interface LoaderData {
  existingMetafields: Array<{
    key: string;
    name: string;
    namespace: string;
    id: string;
  }>;
  missingMetafields: MetafieldDefinition[];
  allSetup: boolean;
  shopDomain: string;
  debugInfo?: {
    queryExecuted: boolean;
    responseReceived: boolean;
    dataStructure: any;
  };
}

interface ActionData {
  success?: boolean;
  error?: string;
  createdCount?: number;
  errors?: Array<{ field: string; message: string }>;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    console.log("🔍 Starting authentication...");
    const { admin } = await authenticate.admin(request);
    console.log("✅ Authentication successful");

    console.log("🔍 Starting metafield definitions query...");
    
    // Test basic GraphQL connectivity first
    const testResponse = await admin.graphql(`
      query TestConnection {
        shop {
          id
          name
          myshopifyDomain
        }
      }
    `);

    console.log("📡 Test GraphQL response received, parsing...");
    const testData = await testResponse.json() as any;
    console.log("📊 Test data:", JSON.stringify(testData, null, 2));

    if (testData.errors && testData.errors.length > 0) {
      console.error("❌ Test GraphQL errors:", testData.errors);
      throw new Error(`Test GraphQL errors: ${JSON.stringify(testData.errors)}`);
    }

    console.log("✅ Basic GraphQL connectivity confirmed");

    // Extract shop domain from test data
    const shopDomain = testData.data?.shop?.myshopifyDomain || 'your-shop.myshopify.com';
    console.log("🏪 Shop domain:", shopDomain);

    // Now try the metafield definitions query
    const response = await admin.graphql(`
      query GetMetafieldDefinitions {
        metafieldDefinitions(first: 50, ownerType: PRODUCTVARIANT) {
          nodes {
            id
            key
            name
            namespace
            type {
              name
            }
          }
        }
      }
    `);

    console.log("📡 Metafield GraphQL response received, parsing...");
    const data = await response.json() as any;
    console.log("📊 Metafield data:", JSON.stringify(data, null, 2));

    if (data.errors && data.errors.length > 0) {
      console.error("❌ Metafield GraphQL errors:", data.errors);
      throw new Error(`Metafield GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    const existingDefinitions = data.data?.metafieldDefinitions?.nodes || [];
    console.log("✅ Found existing definitions:", existingDefinitions.length);

    // Check which metafields exist in mapguard namespace
    const existingMetafields = existingDefinitions
      .filter((def: any) => def.namespace === "mapguard")
      .map((def: any) => ({
        id: def.id,
        key: def.key,
        name: def.name,
        namespace: def.namespace,
      }));

    console.log("🎯 Mapguard metafields found:", existingMetafields);

    const existingKeys = existingMetafields.map((m: any) => m.key);
    const missingMetafields = REQUIRED_METAFIELDS.filter(
      (required) => !existingKeys.includes(required.key)
    );

    const allSetup = missingMetafields.length === 0;

    console.log("📋 Missing metafields:", missingMetafields.map(m => `${m.namespace}.${m.key}`));
    console.log("✅ All setup complete:", allSetup);

    return json<LoaderData>({
      existingMetafields,
      missingMetafields,
      allSetup,
      shopDomain,
      debugInfo: {
        queryExecuted: true,
        responseReceived: true,
        dataStructure: {
          totalDefinitions: existingDefinitions.length,
          mapguardDefinitions: existingMetafields.length,
          requiredFields: REQUIRED_METAFIELDS.length,
          testConnectionSuccessful: true,
        },
      },
    });
  } catch (error) {
    console.error("💥 Error in loader:", error);
    console.error("📍 Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    console.error("🔍 Error type:", typeof error);
    console.error("🔍 Error message:", error instanceof Error ? error.message : String(error));
    
    // Return a more informative error response
    return json<LoaderData>({
      existingMetafields: [],
      missingMetafields: REQUIRED_METAFIELDS,
      allSetup: false,
      shopDomain: 'your-shop.myshopify.com',
      debugInfo: {
        queryExecuted: false,
        responseReceived: false,
        dataStructure: {
          error: error instanceof Error ? error.message : String(error),
          errorType: typeof error,
          authenticationAttempted: true,
        },
      },
    }, { status: 500 });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  try {
    const formData = await request.formData();
    const action = formData.get("action");

    if (action !== "create-metafields") {
      return json<ActionData>({ error: "Invalid action" }, { status: 400 });
    }

    // Get current metafields to avoid duplicates
    const currentResponse = await admin.graphql(`
      query GetMetafieldDefinitions {
        metafieldDefinitions(first: 50, ownerType: PRODUCTVARIANT) {
          nodes {
            key
            namespace
          }
        }
      }
    `);

    const currentData = await currentResponse.json();
    const existingKeys = (currentData.data?.metafieldDefinitions?.nodes || [])
      .filter((def: any) => def.namespace === "mapguard")
      .map((def: any) => def.key);

    const metafieldsToCreate = REQUIRED_METAFIELDS.filter(
      (metafield) => !existingKeys.includes(metafield.key)
    );

    if (metafieldsToCreate.length === 0) {
      return json<ActionData>({
        success: true,
        createdCount: 0,
      });
    }

    const errors: Array<{ field: string; message: string }> = [];
    let createdCount = 0;

    // Create each metafield definition
    for (const metafield of metafieldsToCreate) {
      try {
        const mutation = `
          mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
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

        const variables = {
          definition: {
            key: metafield.key,
            name: metafield.name,
            namespace: metafield.namespace,
            description: metafield.description,
            type: metafield.type,
            ownerType: "PRODUCTVARIANT",
          },
        };

        const response = await admin.graphql(mutation, { variables });
        const result = await response.json();

        if (result.data?.metafieldDefinitionCreate?.userErrors?.length > 0) {
          const userErrors = result.data.metafieldDefinitionCreate.userErrors;
          userErrors.forEach((error: any) => {
            errors.push({
              field: metafield.key,
              message: error.message,
            });
          });
        } else if (result.data?.metafieldDefinitionCreate?.createdDefinition) {
          createdCount++;
        }
      } catch (error) {
        console.error(`Error creating metafield ${metafield.key}:`, error);
        errors.push({
          field: metafield.key,
          message: `Failed to create metafield: ${error}`,
        });
      }
    }

    if (errors.length > 0) {
      return json<ActionData>({
        success: false,
        error: `Failed to create ${errors.length} metafield(s)`,
        errors,
        createdCount,
      });
    }

    return json<ActionData>({
      success: true,
      createdCount,
    });
  } catch (error) {
    console.error("Setup action error:", error);
    return json<ActionData>(
      { error: "Failed to create metafield definitions" },
      { status: 500 }
    );
  }
};

export default function SetupPage() {
  const { existingMetafields, missingMetafields, allSetup, shopDomain, debugInfo } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === "submitting";

  return (
    <Page
      title="MAP Guard Setup"
      subtitle="Configure metafield definitions for MAP pricing"
      backAction={{ content: "Back", url: "/app" }}
    >
      <BlockStack gap="500">
        {/* Debug Information Card - Hidden
        {debugInfo && (
          <Card>
            <BlockStack gap="300">
              <Text variant="headingMd" as="h3">
                Debug Information
              </Text>
              <Text as="p">
                Query executed: {debugInfo.queryExecuted ? "✅ Yes" : "❌ No"}
              </Text>
              <Text as="p">
                Response received: {debugInfo.responseReceived ? "✅ Yes" : "❌ No"}
              </Text>
              {debugInfo.dataStructure && (
                <BlockStack gap="200">
                  {debugInfo.dataStructure.error && (
                    <Text as="p" tone="critical">
                      Error: {debugInfo.dataStructure.error}
                    </Text>
                  )}
                  {debugInfo.dataStructure.testConnectionSuccessful && (
                    <Text as="p" tone="success">
                      ✅ Basic GraphQL connection successful
                    </Text>
                  )}
                  <Text as="p">
                    Data details: {JSON.stringify(debugInfo.dataStructure, null, 2)}
                  </Text>
                </BlockStack>
              )}
            </BlockStack>
          </Card>
        )}
        */}

        {actionData?.success && (
          <Banner tone="success" title="Setup completed successfully">
            {(actionData.createdCount ?? 0) > 0 ? (
              <p>Created {actionData.createdCount} metafield definition(s).</p>
            ) : (
              <p>All metafield definitions already exist.</p>
            )}
          </Banner>
        )}

        {actionData?.error && (
          <Banner tone="critical" title="Setup failed">
            <p>{actionData.error}</p>
            {actionData.errors && actionData.errors.length > 0 && (
              <List type="bullet">
                {actionData.errors.map((error, index) => (
                  <List.Item key={index}>
                    <strong>{error.field}:</strong> {error.message}
                  </List.Item>
                ))}
              </List>
            )}
          </Banner>
        )}

        <Layout.AnnotatedSection
          id="metafieldSetup"
          title="Metafield Definitions Setup"
          description="MAP Guard requires specific metafield definitions to store variant pricing and display information. This setup will create the necessary metafields for product variants in your store."
        >
          <Card>
            <BlockStack gap="400">
              <DataTable
                columnContentTypes={['text', 'text']}
                headings={['Name', 'Status']}
                rows={REQUIRED_METAFIELDS.map((metafield) => {
                  const exists = existingMetafields.some((existing) => existing.key === metafield.key);
                  return [
                    <Tooltip 
                      key={metafield.key}
                      content={
                        <BlockStack gap="100">
                          <Text variant="bodySm" as="p">
                            <strong>Metafield:</strong> {metafield.namespace}.{metafield.key}
                          </Text>
                          <Text variant="bodySm" as="p">
                            <strong>Description:</strong> {metafield.description}
                          </Text>
                        </BlockStack>
                      }
                      preferredPosition="above"
                    >
                      <Text as="span" variant="bodyMd">
                        {metafield.name}
                      </Text>
                    </Tooltip>,
                    <InlineStack key={`${metafield.key}-status`} gap="200" blockAlign="center">
                      <Badge tone={exists ? "success" : "attention"}>
                        {exists ? "Exists" : "Missing"}
                      </Badge>
                      <Icon source={exists ? CheckIcon : AlertTriangleIcon} />
                    </InlineStack>
                  ];
                })}
              />

              {allSetup ? (
                <Banner tone="success" title="Setup Complete">
                  <p>All required metafield definitions are already configured.</p>
                </Banner>
              ) : (
                <Form method="post">
                  <input type="hidden" name="action" value="create-metafields" />
                  <InlineStack align="start">
                    <Button
                      variant="primary"
                      submit
                      loading={isSubmitting}
                      disabled={allSetup}
                    >
                      {isSubmitting 
                        ? "Creating Metafields..." 
                        : `Create ${missingMetafields.length} Missing Metafield${missingMetafields.length !== 1 ? 's' : ''}`
                      }
                    </Button>
                  </InlineStack>
                </Form>
              )}
            </BlockStack>
          </Card>
        </Layout.AnnotatedSection>

        <Layout.AnnotatedSection
          id="discountFunction"
          title="Automatic MAP Pricing"
          description="MAP Guard includes an automatic discount function that applies MAP pricing to products when customers add them to their cart. This ensures customers always get the lowest advertised price without manual intervention."
        >
          <Card>
            <BlockStack gap="400">
              <Banner tone="info" title="Automatic Discount Function Active">
                <p>The MAP Guard Auto-Discount function has been deployed and will automatically:</p>
                <List type="bullet">
                  <List.Item>Check each cart item for MAP configuration</List.Item>
                  <List.Item>Apply discounts from regular price to MAP final_price</List.Item>
                  <List.Item>Only apply discounts when MAP pricing is enabled for the variant</List.Item>
                  <List.Item>Work seamlessly with your existing checkout process</List.Item>
                </List>
              </Banner>
              
              <BlockStack gap="300">
                <Text variant="headingSm" as="h3">
                  How It Works
                </Text>
                <List type="number">
                  <List.Item>
                    Customer adds a product with MAP pricing to cart
                  </List.Item>
                  <List.Item>
                    Function checks if MAP is enabled (mapguard.enabled = true)
                  </List.Item>
                  <List.Item>
                    If regular price &gt; final_price, discount is automatically applied
                  </List.Item>
                  <List.Item>
                    Customer sees the final MAP price at checkout
                  </List.Item>
                </List>
                
                <Banner tone="success">
                  <p><strong>No additional setup required!</strong> The discount function works automatically once you configure MAP pricing on your products.</p>
                </Banner>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.AnnotatedSection>

        <Layout.AnnotatedSection
          id="displayMapMessage"
          title="Display MAP Messages on Product Pages"
          description="Add the MAP Guard message block to your product pages. This block will automatically show pricing messages when MAP is enabled for a product variant."
        >
          <Card>
            <BlockStack gap="400">
              <BlockStack gap="300">
                <Text variant="headingSm" as="h3">
                  Setup Guide
                </Text>
                
                <div style={{ 
                  minHeight: '200px', 
                  border: '2px dashed #E1E3E5', 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#F6F6F7',
                  padding: '20px',
                  textAlign: 'center'
                }}>
                  <BlockStack gap="200" align="center">
                    <Text variant="headingMd" as="h4" tone="subdued">
                      📹 Theme Editor Setup
                    </Text>
                    <Text as="p" tone="subdued">
                      Step-by-step visual guide
                    </Text>
                  </BlockStack>
                </div>

                <List type="number">
                  <List.Item>
                    Open theme editor → Go to "Product information" section
                  </List.Item>
                  <List.Item>
                    Add block → App blocks → "MAP Guard Message"
                  </List.Item>
                  <List.Item>
                    Position near price or "Add to cart" button → Save
                  </List.Item>
                </List>

                <InlineStack gap="300" align="start">
                  <Button 
                    url={`https://${shopDomain.replace('.myshopify.com', '')}.myshopify.com/admin/themes/current/editor?template=product`}
                    target="_blank"
                    variant="primary"
                    size="large"
                  >
                    Open Theme Editor
                  </Button>
                </InlineStack>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.AnnotatedSection>
      </BlockStack>
    </Page>
  );
}
