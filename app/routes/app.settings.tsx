import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Button,
  BlockStack,
  Text,
  TextField,
  Select,
  Checkbox,
  InlineStack,
  Banner,
  Divider,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { useState } from "react";

// Mock settings data - will replace with real data later
const mockSettings = {
  defaultMessage: "Add to cart for lower price",
  messageColor: "#1a1a1a",
  backgroundColor: "#f6f6f7",
  fontSize: "medium",
  alignment: "left",
  showIcon: true,
  iconType: "cart",
  customCss: "",
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  
  // TODO: Add real settings fetching logic here
  return json({
    settings: mockSettings
  });
};

export default function SettingsPage() {
  const { settings } = useLoaderData<typeof loader>();
  
  const [message, setMessage] = useState(settings.defaultMessage);
  const [messageColor, setMessageColor] = useState(settings.messageColor);
  const [backgroundColor, setBackgroundColor] = useState(settings.backgroundColor);
  const [fontSize, setFontSize] = useState(settings.fontSize);
  const [alignment, setAlignment] = useState(settings.alignment);
  const [showIcon, setShowIcon] = useState(settings.showIcon);
  const [iconType, setIconType] = useState(settings.iconType);
  const [customCss, setCustomCss] = useState(settings.customCss);

  const fontSizeOptions = [
    { label: "Small", value: "small" },
    { label: "Medium", value: "medium" },
    { label: "Large", value: "large" },
  ];

  const alignmentOptions = [
    { label: "Left", value: "left" },
    { label: "Center", value: "center" },
    { label: "Right", value: "right" },
  ];

  const iconOptions = [
    { label: "Shopping Cart", value: "cart" },
    { label: "Price Tag", value: "price" },
    { label: "Lock", value: "lock" },
    { label: "None", value: "none" },
  ];

  const handleSaveSettings = () => {
    // TODO: Implement settings save logic
    console.log("Saving settings...", {
      message,
      messageColor,
      backgroundColor,
      fontSize,
      alignment,
      showIcon,
      iconType,
      customCss,
    });
  };

  return (
    <Page>
      <TitleBar title="Settings" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <Banner
              title="Message Configuration"
              tone="info"
            >
              <p>
                Configure how MAP messages appear on your product pages. 
                Changes will apply to all products with MAP protection enabled.
              </p>
            </Banner>

            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  Message Content
                </Text>

                <TextField
                  label="Default MAP Message"
                  value={message}
                  onChange={setMessage}
                  placeholder="Add to cart for lower price"
                  helpText="This message will be displayed instead of showing the discount amount."
                  autoComplete="off"
                />

                <TextField
                  label="Custom CSS (Optional)"
                  value={customCss}
                  onChange={setCustomCss}
                  multiline={4}
                  placeholder=".map-message { /* Your custom styles */ }"
                  helpText="Add custom CSS to further customize the appearance."
                  autoComplete="off"
                />
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  Visual Styling
                </Text>

                <Layout>
                  <Layout.Section>
                    <BlockStack gap="400">
                      <TextField
                        label="Text Color"
                        value={messageColor}
                        onChange={setMessageColor}
                        helpText="Choose the text color for MAP messages."
                        autoComplete="off"
                      />

                      <TextField
                        label="Background Color"
                        value={backgroundColor}
                        onChange={setBackgroundColor}
                        helpText="Choose the background color for MAP messages."
                        autoComplete="off"
                      />
                    </BlockStack>
                  </Layout.Section>

                  <Layout.Section>
                    <BlockStack gap="400">
                      <Select
                        label="Font Size"
                        options={fontSizeOptions}
                        value={fontSize}
                        onChange={setFontSize}
                      />

                      <Select
                        label="Text Alignment"
                        options={alignmentOptions}
                        value={alignment}
                        onChange={setAlignment}
                      />
                    </BlockStack>
                  </Layout.Section>
                </Layout>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  Icon Settings
                </Text>

                <Checkbox
                  label="Show icon with message"
                  checked={showIcon}
                  onChange={setShowIcon}
                />

                {showIcon && (
                  <Select
                    label="Icon Type"
                    options={iconOptions}
                    value={iconType}
                    onChange={setIconType}
                    helpText="Choose an icon to display alongside the MAP message."
                  />
                )}
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  Preview
                </Text>
                
                <div 
                  style={{
                    backgroundColor: backgroundColor,
                    color: messageColor,
                    padding: "12px 16px",
                    borderRadius: "6px",
                    textAlign: alignment as any,
                    fontSize: fontSize === "small" ? "14px" : fontSize === "large" ? "18px" : "16px",
                    border: "1px solid #e1e3e5",
                  }}
                >
                  {showIcon && iconType !== "none" && (
                    <span style={{ marginRight: "8px" }}>
                      {iconType === "cart" && "🛒"}
                      {iconType === "price" && "🏷️"}
                      {iconType === "lock" && "🔒"}
                    </span>
                  )}
                  {message || "Add to cart for lower price"}
                </div>

                <Text variant="bodyMd" as="p" tone="subdued">
                  This is how your MAP message will appear on product pages.
                </Text>
              </BlockStack>
            </Card>

            <InlineStack gap="300">
              <Button
                variant="primary"
                onClick={handleSaveSettings}
              >
                Save Settings
              </Button>
              <Button
                variant="secondary"
                url="/app"
              >
                Back to Dashboard
              </Button>
            </InlineStack>
          </BlockStack>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <BlockStack gap="500">
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  Usage Tips
                </Text>
                
                <BlockStack gap="200">
                  <Text variant="bodyMd" as="p">
                    • Keep messages short and clear
                  </Text>
                  <Text variant="bodyMd" as="p">
                    • Use action-oriented language like "Add to cart"
                  </Text>
                  <Text variant="bodyMd" as="p">
                    • Test different styles to match your theme
                  </Text>
                  <Text variant="bodyMd" as="p">
                    • Consider your brand colors and fonts
                  </Text>
                </BlockStack>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  Common Messages
                </Text>
                
                <BlockStack gap="200">
                  <Button
                    variant="tertiary"
                    fullWidth
                    onClick={() => setMessage("Add to cart for lower price")}
                  >
                    "Add to cart for lower price"
                  </Button>
                  
                  <Button
                    variant="tertiary"
                    fullWidth
                    onClick={() => setMessage("Call for price")}
                  >
                    "Call for price"
                  </Button>
                  
                  <Button
                    variant="tertiary"
                    fullWidth
                    onClick={() => setMessage("Special pricing available")}
                  >
                    "Special pricing available"
                  </Button>
                  
                  <Button
                    variant="tertiary"
                    fullWidth
                    onClick={() => setMessage("Contact us for better pricing")}
                  >
                    "Contact us for better pricing"
                  </Button>
                </BlockStack>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
