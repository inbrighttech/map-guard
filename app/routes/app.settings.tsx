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

    // Update app metafields
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

    for (const mutation of mutations) {
      await admin.graphql(`
        mutation CreateAppMetafield($metafield: AppMetafieldSetInput!) {
          appMetafieldSet(metafield: $metafield) {
            appMetafield {
              id
            }
            userErrors {
              field
              message
            }
          }
        }
      `, {
        variables: {
          metafield: {
            namespace: "mapguard",
            key: mutation.key,
            value: mutation.value,
            type: mutation.type,
          },
        },
      });
    }

    return json<ActionData>({ success: true });
  } catch (error) {
    console.error("Error saving settings:", error);
    return json<ActionData>({ error: "Failed to save settings" });
  }
};

export default function SettingsPage() {
  const { appBlockEnabled, defaultMessage, messageSettings } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isLoading = navigation.state === "submitting";

  const fontWeightOptions = [
    { label: "Normal", value: "normal" },
    { label: "Bold", value: "bold" },
    { label: "Light", value: "300" },
  ];

  const textAlignOptions = [
    { label: "Left", value: "left" },
    { label: "Center", value: "center" },
    { label: "Right", value: "right" },
  ];

  return (
    <Page
      title="Settings"
      subtitle="Configure MAP Guard appearance and behavior"
      backAction={{ url: "/app" }}
    >
      <Form method="post">
        <BlockStack gap="500">
          {actionData?.success && (
            <Banner tone="success">Settings saved successfully!</Banner>
          )}
          {actionData?.error && (
            <Banner tone="critical">Error: {actionData.error}</Banner>
          )}

          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                General Settings
              </Text>
              <Checkbox
                label="Enable app block in theme"
                checked={appBlockEnabled}
                name="appBlockEnabled"
              />
              <TextField
                label="Default MAP message"
                value={defaultMessage}
                name="defaultMessage"
                helpText="This message will be shown when MAP pricing is active"
                autoComplete="off"
              />
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Message Appearance
              </Text>
              <Checkbox
                label="Show icon with message"
                checked={messageSettings.showIcon}
                name="showIcon"
              />
              <InlineStack gap="400">
                <TextField
                  label="Background color"
                  value={messageSettings.backgroundColor}
                  name="backgroundColor"
                  helpText="Hex color code (e.g., #f8f9fa)"
                  autoComplete="off"
                />
                <TextField
                  label="Text color"
                  value={messageSettings.textColor}
                  name="textColor"
                  helpText="Hex color code (e.g., #495057)"
                  autoComplete="off"
                />
              </InlineStack>
              <InlineStack gap="400">
                <Select
                  label="Font weight"
                  options={fontWeightOptions}
                  value={messageSettings.fontWeight}
                  name="fontWeight"
                />
                <Select
                  label="Text alignment"
                  options={textAlignOptions}
                  value={messageSettings.textAlign}
                  name="textAlign"
                />
              </InlineStack>
            </BlockStack>
          </Card>

          <InlineStack align="end">
            <Button submit variant="primary" loading={isLoading}>
              Save Settings
            </Button>
          </InlineStack>
        </BlockStack>
      </Form>
    </Page>
  );
}
