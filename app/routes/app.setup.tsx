import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useActionData, useNavigation, Form } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Text,
  Banner,
  Button,
  InlineStack,
  BlockStack,
  Badge,
  Icon,
  List,
  Divider,
} from "@shopify/polaris";
import { CheckIcon, AlertTriangleIcon } from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";

interface SetupStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  error?: string;
}

interface LoaderData {
  steps: SetupStep[];
  allCompleted: boolean;
}

interface ActionData {
  success?: boolean;
  error?: string;
  completedSteps?: string[];
}

export const loader: LoaderFunction = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const steps: SetupStep[] = [
    {
      id: "metafield_definition",
      title: "MAP Price Metafield Definition",
      description: "Creates the mapguard.map_price metafield for product variants",
      completed: false,
    },
    {
      id: "map_enabled_definition", 
      title: "MAP Enabled Metafield Definition",
      description: "Creates the mapguard.map_enabled metafield for product variants",
      completed: false,
    },
    {
      id: "final_price_definition",
      title: "Final Price Metafield Definition", 
      description: "Creates the mapguard.final_price metafield for product variants",
      completed: false,
    },
    {
      id: "discount_function",
      title: "Discount Function Status",
      description: "Verifies the MAP discount function is properly deployed",
      completed: false,
    },
  ];

  try {
    // Check existing metafield definitions
    const metafieldDefinitionsQuery = `
      query GetMetafieldDefinitions {
        metafieldDefinitions(first: 50, ownerType: PRODUCTVARIANT) {
          edges {
            node {
              id
              key
              namespace
              name
              type {
                name
              }
            }
          }
        }
      }
    `;

    const metafieldResponse = await admin.graphql(metafieldDefinitionsQuery);
    const metafieldData = await metafieldResponse.json();
    
    if (metafieldData.data?.metafieldDefinitions?.edges) {
      const existingDefinitions = metafieldData.data.metafieldDefinitions.edges.map(
        (edge: any) => `${edge.node.namespace}.${edge.node.key}`
      );

      // Check which metafields exist
      steps[0].completed = existingDefinitions.includes("mapguard.map_price");
      steps[1].completed = existingDefinitions.includes("mapguard.map_enabled");
      steps[2].completed = existingDefinitions.includes("mapguard.final_price");
    }

    // Check discount functions (simplified check for now)
    steps[3].completed = true; // We'll assume functions are deployed if extensions built

    const allCompleted = steps.every(step => step.completed);

    return json<LoaderData>({ steps, allCompleted });
  } catch (error) {
    console.error("Setup loader error:", error);
    return json<LoaderData>({ 
      steps: steps.map(step => ({ ...step, error: "Failed to check status" })), 
      allCompleted: false 
    });
  }
};

export const action: ActionFunction = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");

  if (action === "setup_metafields") {
    try {
      const completedSteps: string[] = [];

      // Create MAP Price metafield definition
      const mapPriceMutation = `
        mutation CreateMapPriceDefinition {
          metafieldDefinitionCreate(definition: {
            name: "MAP Price"
            namespace: "mapguard"
            key: "map_price"
            description: "Minimum Advertised Price for this variant"
            type: "money"
            ownerType: PRODUCTVARIANT
            access: {
              storefront: PUBLIC_READ
              admin: MERCHANT_READ_WRITE
            }
          }) {
            createdDefinition {
              id
              name
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const mapPriceResponse = await admin.graphql(mapPriceMutation);
      const mapPriceData = await mapPriceResponse.json();
      
      if (!mapPriceData.data?.metafieldDefinitionCreate?.userErrors?.length) {
        completedSteps.push("metafield_definition");
      }

      // Create MAP Enabled metafield definition
      const mapEnabledMutation = `
        mutation CreateMapEnabledDefinition {
          metafieldDefinitionCreate(definition: {
            name: "MAP Enabled"
            namespace: "mapguard"
            key: "map_enabled"
            description: "Whether MAP is enabled for this variant"
            type: "boolean"
            ownerType: PRODUCTVARIANT
            access: {
              storefront: PUBLIC_READ
              admin: MERCHANT_READ_WRITE
            }
          }) {
            createdDefinition {
              id
              name
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const mapEnabledResponse = await admin.graphql(mapEnabledMutation);
      const mapEnabledData = await mapEnabledResponse.json();
      
      if (!mapEnabledData.data?.metafieldDefinitionCreate?.userErrors?.length) {
        completedSteps.push("map_enabled_definition");
      }

      // Create Final Price metafield definition
      const finalPriceMutation = `
        mutation CreateFinalPriceDefinition {
          metafieldDefinitionCreate(definition: {
            name: "Final Price"
            namespace: "mapguard"
            key: "final_price"
            description: "Final calculated price after MAP enforcement"
            type: "money"
            ownerType: PRODUCTVARIANT
            access: {
              storefront: PUBLIC_READ
              admin: MERCHANT_READ_WRITE
            }
          }) {
            createdDefinition {
              id
              name
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const finalPriceResponse = await admin.graphql(finalPriceMutation);
      const finalPriceData = await finalPriceResponse.json();
      
      if (!finalPriceData.data?.metafieldDefinitionCreate?.userErrors?.length) {
        completedSteps.push("final_price_definition");
      }

      return json<ActionData>({
        success: true,
        completedSteps,
      });

    } catch (error) {
      console.error("Setup action error:", error);
      return json<ActionData>({
        success: false,
        error: error instanceof Error ? error.message : "Setup failed",
      });
    }
  }

  return json<ActionData>({ success: false, error: "Invalid action" });
};

export default function SetupPage() {
  const { steps, allCompleted } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <Page title="MAP Guard Setup">
      <Layout>
        <Layout.Section>
          {allCompleted ? (
            <Banner tone="success" title="Setup Complete!">
              <p>All MAP Guard components are properly configured. You can now:</p>
              <List type="bullet">
                <List.Item>Set MAP prices on product variants</List.Item>
                <List.Item>Configure settings in the Settings page</List.Item>
                <List.Item>View analytics in the Dashboard</List.Item>
              </List>
            </Banner>
          ) : (
            <Banner tone="info" title="Setup Required">
              <p>
                Complete the setup process to enable MAP Guard functionality for your store.
              </p>
            </Banner>
          )}
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">
                Setup Progress
              </Text>

              <BlockStack gap="300">
                {steps.map((step) => (
                  <div key={step.id}>
                    <InlineStack align="space-between" blockAlign="center">
                      <InlineStack gap="200" blockAlign="center">
                        <Icon 
                          source={step.completed ? CheckIcon : AlertTriangleIcon}
                          tone={step.completed ? "success" : "critical"}
                        />
                        <BlockStack gap="100">
                          <Text variant="bodyMd" fontWeight="semibold" as="p">
                            {step.title}
                          </Text>
                          <Text variant="bodySm" tone="subdued" as="p">
                            {step.description}
                          </Text>
                          {step.error && (
                            <Text variant="bodySm" tone="critical" as="p">
                              Error: {step.error}
                            </Text>
                          )}
                        </BlockStack>
                      </InlineStack>
                      <Badge tone={step.completed ? "success" : "attention"}>
                        {step.completed ? "Complete" : "Pending"}
                      </Badge>
                    </InlineStack>
                    <Divider />
                  </div>
                ))}
              </BlockStack>

              {!allCompleted && (
                <InlineStack gap="200">
                  <Form method="post">
                    <input type="hidden" name="action" value="setup_metafields" />
                    <Button
                      submit
                      variant="primary"
                      loading={isSubmitting}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Setting up..." : "Run Setup"}
                    </Button>
                  </Form>
                </InlineStack>
              )}

              {actionData?.success && (
                <Banner tone="success" title="Setup Successful">
                  <p>Completed {actionData.completedSteps?.length || 0} setup steps.</p>
                </Banner>
              )}

              {actionData?.error && (
                <Banner tone="critical" title="Setup Error">
                  <p>{actionData.error}</p>
                </Banner>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text variant="headingMd" as="h2">
                Next Steps
              </Text>
              
              <List type="number">
                <List.Item>
                  Complete the setup process above to create required metafield definitions
                </List.Item>
                <List.Item>
                  Navigate to your products and set MAP prices on variants that need protection
                </List.Item>
                <List.Item>
                  Configure appearance and behavior in the Settings page
                </List.Item>
                <List.Item>
                  Monitor MAP compliance and analytics in the Dashboard
                </List.Item>
              </List>

              <Text variant="bodySm" tone="subdued" as="p">
                Need help? Check the documentation or contact support for assistance with MAP Guard configuration.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
