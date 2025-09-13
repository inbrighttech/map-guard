import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import {
  Page,
  Card,
  BlockStack,
  Text,
  TextField,
  Button,
  Banner,
  InlineStack,
  Checkbox,
  Select,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";

interface LoaderData {
  appBlockEnabled: boolean;
  defaultMessage: string;
  messageSettings: {
    showIcon: boolean;
    backgroundColor: string;
    textColor: string;
    fontWeight: string;
    textAlign: string;
  };
}

interface ActionData {
  success?: boolean;
  error?: string;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  try {
    // Get app metafields for configuration
    const response = await admin.graphql(`
      query GetAppMetafields {
        app {
          metafields(first: 10, namespace: "mapguard") {
            nodes {
              key
              value
              type
            }
          }
        }
      }
    `);

    const data = await response.json();
    const metafields = data.data?.app?.metafields?.nodes || [];

    // Extract settings from metafields
    const appBlockEnabled = metafields.find((m: any) => m.key === "app_block_enabled")?.value === "true" || false;
    const defaultMessage = metafields.find((m: any) => m.key === "default_message")?.value || "Add to cart for lower price";
    
    const messageSettings = {
      showIcon: metafields.find((m: any) => m.key === "show_icon")?.value === "true" || true,
      backgroundColor: metafields.find((m: any) => m.key === "background_color")?.value || "#f8f9fa",
      textColor: metafields.find((m: any) => m.key === "text_color")?.value || "#495057",
      fontWeight: metafields.find((m: any) => m.key === "font_weight")?.value || "normal",
      textAlign: metafields.find((m: any) => m.key === "text_align")?.value || "left",
    };

    return json<LoaderData>({
      appBlockEnabled,
      defaultMessage,
      messageSettings,
    });
  } catch (error) {
    console.error("Error loading settings:", error);
    return json<LoaderData>({
      appBlockEnabled: false,
      defaultMessage: "Add to cart for lower price",
      messageSettings: {
        showIcon: true,
        backgroundColor: "#f8f9fa",
        textColor: "#495057",
        fontWeight: "normal",
        textAlign: "left",
      },
    });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  try {
    const formData = await request.formData();
    const appBlockEnabled = formData.get("appBlockEnabled") === "on";
    const defaultMessage = formData.get("defaultMessage") as string;
    const showIcon = formData.get("showIcon") === "on";
    const backgroundColor = formData.get("backgroundColor") as string;
    const textColor = formData.get("textColor") as string;
    const fontWeight = formData.get("fontWeight") as string;
    const textAlign = formData.get("textAlign") as string;

    // Save settings as app metafields
    const mutations = [
      {
        key: "app_block_enabled",
        value: appBlockEnabled.toString(),
        type: "boolean",
      },
      {
        key: "default_message",
        value: defaultMessage,
        type: "single_line_text_field",
      },
      {
        key: "show_icon",
        value: showIcon.toString(),
        type: "boolean",
      },
      {
        key: "background_color",
        value: backgroundColor,
        type: "color",
      },
      {
        key: "text_color",
        value: textColor,
        type: "color",
      },
      {
        key: "font_weight",
        value: fontWeight,
        type: "single_line_text_field",
      },
      {
        key: "text_align",
        value: textAlign,
        type: "single_line_text_field",
      },
    ];

    for (const metafield of mutations) {
      const mutation = `
        mutation CreateAppMetafield($metafield: MetafieldsSetInput!) {
          metafieldsSet(metafields: [$metafield]) {
            metafields {
              id
              key
              value
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      await admin.graphql(mutation, {
        variables: {
          metafield: {
            ownerId: "gid://shopify/App/" + process.env.SHOPIFY_APP_ID,
            namespace: "mapguard",
            key: metafield.key,
            value: metafield.value,
            type: metafield.type,
          },
        },
      });
    }

    return json<ActionData>({ success: true });
  } catch (error) {
    console.error("Error saving settings:", error);
    return json<ActionData>({ error: "Failed to save settings" }, { status: 500 });
  }
};

export default function SettingsPage() {
  const { appBlockEnabled, defaultMessage, messageSettings } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === "submitting";

  const fontWeightOptions = [
    { label: "Normal", value: "normal" },
    { label: "Bold", value: "bold" },
    { label: "Semi Bold", value: "600" },
    { label: "Light", value: "300" },
  ];

  const textAlignOptions = [
    { label: "Left", value: "left" },
    { label: "Center", value: "center" },
    { label: "Right", value: "right" },
  ];

  return (
    <Page
      title="MAP Guard Settings"
      subtitle="Configure app block and message display settings"
      backAction={{ content: "Back", url: "/app" }}
    >
      <BlockStack gap="500">
        {actionData?.success && (
          <Banner tone="success" title="Settings saved successfully">
            <p>Your MAP Guard settings have been updated.</p>
          </Banner>
        )}

        {actionData?.error && (
          <Banner tone="critical" title="Failed to save settings">
            <p>{actionData.error}</p>
          </Banner>
        )}

        <Form method="post">
          <BlockStack gap="500">
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  App Block Configuration
                </Text>
                
                <Checkbox
                  label="Enable MAP Guard app block"
                  helpText="Allow merchants to add the MAP Guard message block to their theme"
                  checked={appBlockEnabled}
                  name="appBlockEnabled"
                />

                <Text as="p" tone="subdued">
                  When enabled, merchants can add the "MAP Guard Message" block to their product pages 
                  through the theme editor. This block will display your custom message when MAP pricing is active.
                </Text>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  Default Message Settings
                </Text>
                
                <TextField
                  label="Default Message"
                  name="defaultMessage"
                  value={defaultMessage}
                  helpText="This message will be displayed when no custom message is set for a variant"
                  autoComplete="off"
                />

                <Checkbox
                  label="Show icon next to message"
                  checked={messageSettings.showIcon}
                  name="showIcon"
                />
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  Message Styling
                </Text>
                
                <InlineStack gap="400">
                  <TextField
                    label="Background Color"
                    name="backgroundColor"
                    value={messageSettings.backgroundColor}
                    placeholder="#f8f9fa"
                    autoComplete="off"
                  />
                  
                  <TextField
                    label="Text Color"
                    name="textColor"
                    value={messageSettings.textColor}
                    placeholder="#495057"
                    autoComplete="off"
                  />
                </InlineStack>

                <InlineStack gap="400">
                  <Select
                    label="Font Weight"
                    name="fontWeight"
                    options={fontWeightOptions}
                    value={messageSettings.fontWeight}
                  />
                  
                  <Select
                    label="Text Alignment"
                    name="textAlign"
                    options={textAlignOptions}
                    value={messageSettings.textAlign}
                  />
                </InlineStack>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  Next Steps
                </Text>
                
                <Text as="p">
                  After saving these settings:
                </Text>
                
                <BlockStack gap="200">
                  <Text as="p">
                    1. Go to your store's theme editor (Online Store → Themes → Customize)
                  </Text>
                  <Text as="p">
                    2. Navigate to a product page
                  </Text>
                  <Text as="p">
                    3. Click "Add block" and look for "MAP Guard Message" in the app blocks section
                  </Text>
                  <Text as="p">
                    4. Add the block to your product page where you want the MAP message to appear
                  </Text>
                  <Text as="p">
                    5. Configure additional styling options directly in the theme editor
                  </Text>
                </BlockStack>
              </BlockStack>
            </Card>

            <InlineStack align="end">
              <Button
                submit
                loading={isSubmitting}
                variant="primary"
              >
                {isSubmitting ? "Saving..." : "Save Settings"}
              </Button>
            </InlineStack>
          </BlockStack>
        </Form>
      </BlockStack>
    </Page>
  );
}
