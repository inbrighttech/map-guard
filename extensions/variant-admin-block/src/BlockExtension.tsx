import {
  reactExtension,
  useApi,
  AdminBlock,
  BlockStack,
  Text,
  InlineStack,
  Badge,
  Box,
  Divider,
  Pressable,
  Icon,
  TextField,
} from '@shopify/ui-extensions-react/admin';
import { useState } from 'react';

// The target used here must match the target used in the extension's toml file (./shopify.extension.toml)
const TARGET = 'admin.product-variant-details.block.render';

export default reactExtension(TARGET, () => <App />);

function App() {
  // The useApi hook provides access to several useful APIs like i18n and data.
  const {i18n, data} = useApi(TARGET);
  console.log({data});

  // Mock variant data - will be replaced with real data from utils
  const [variant] = useState({
    id: "variant-123",
    title: "Large / Blue",
    price: "199.99",
    mapPrice: "199.99",
    finalPrice: "179.99",
    mapEnabled: true,
    compliance: "active" as "active" | "violation" | "disabled" | "not_set",
    customMessage: "This item is protected by MAP pricing.",
  });

  const [editData, setEditData] = useState({
    mapPrice: variant.mapPrice || "",
    finalPrice: variant.finalPrice || "",
    customMessage: variant.customMessage || "",
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Helper to detect changes
  const updateField = (field: string, value: string) => {
    setEditData(prev => ({...prev, [field]: value}));
    setHasChanges(true);
  };

  // Helper functions for badge styling
  const getBadgeTone = (compliance: string) => {
    switch (compliance) {
      case "active": return "success";
      case "violation": return "critical";
      case "disabled": return "warning";
      default: return "info";
    }
  };

  const getBadgeText = (compliance: string) => {
    switch (compliance) {
      case "active": return "Active";
      case "violation": return "Violation";
      case "disabled": return "Disabled";
      default: return "Not Set";
    }
  };

  // Mock handlers - will be replaced with real logic
  const handleToggleMAP = () => {
    console.log("TODO: Toggle MAP for variant", variant.id);
  };

  const handleDelete = () => {
    console.log("TODO: Remove MAP from variant", variant.id);
  };

  return (
    <AdminBlock title="MAP Guard">
      <BlockStack gap="base">
        {/* Action Buttons at Top */}
        {/* Variant Overview - Compact */}
        <Box padding="base">
          <InlineStack gap="base" blockAlignment="center" inlineAlignment="space-between">
            <Text fontWeight="bold">{variant.title}</Text>
            <InlineStack gap="base" blockAlignment="center" inlineAlignment="end">
              <Pressable onPress={handleToggleMAP} accessibilityLabel={variant.mapEnabled ? "Disable MAP" : "Enable MAP"}>
                <Icon name={variant.mapEnabled ? "ViewMinor" : "HideMinor"} />
              </Pressable>
              <Badge tone={getBadgeTone(variant.compliance)}>
                {getBadgeText(variant.compliance)}
              </Badge>
              {variant.mapPrice && (
                <Pressable onPress={handleDelete} accessibilityLabel="Delete MAP">
                  <Icon name="DeleteMinor" />
                </Pressable>
              )}
            </InlineStack>
          </InlineStack>
        </Box>

        <Divider />

        {/* Inline Edit Fields */}
        <Box padding="base">
          <BlockStack gap="base">
            <InlineStack gap="base">
              <Box minInlineSize={90}>
                <TextField
                  label="MAP"
                  value={editData.mapPrice}
                  onChange={(value) => updateField('mapPrice', value)}
                />
              </Box>
              
              <Box minInlineSize={90}>
                <TextField
                  label="Final"
                  value={editData.finalPrice}
                  onChange={(value) => updateField('finalPrice', value)}
                />
              </Box>
            </InlineStack>

            {/* Custom Message Field */}
            <TextField
              label="Custom Message"
              value={editData.customMessage}
              onChange={(value) => updateField('customMessage', value)}
            />
          </BlockStack>
        </Box>

        {/* Compliance Warning - Only if needed */}
        {variant.compliance === "violation" && (
          <>
            <Divider />
            <Box padding="base">
              <Text>⚠️ Shopify price is below MAP price</Text>
            </Box>
          </>
        )}
      </BlockStack>
    </AdminBlock>
  );
}