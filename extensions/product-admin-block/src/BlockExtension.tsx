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
} from '@shopify/ui-extensions-react/admin';
import { useState } from 'react';

// The target used here must match the target used in the extension's toml file (./shopify.extension.toml)
const TARGET = 'admin.product-details.block.render';

export default reactExtension(TARGET, () => <App />);

// Mock data for MAP overview - will be replaced with util functions later
const mockVariants = [
  {
    id: '1',
    title: 'Small',
    price: '$29.99',
    mapPrice: '$24.99',
    finalPrice: '$26.99',
    mapEnabled: true,
    compliance: 'active' as const
  },
  {
    id: '2',
    title: 'Medium',
    price: '$34.99',
    mapPrice: '$29.99',
    finalPrice: '$19.99',
    mapEnabled: true,
    compliance: 'violation' as const
  },
  {
    id: '3',
    title: 'Large',
    price: '$39.99',
    mapPrice: '$34.99',
    finalPrice: '$35.99',
    mapEnabled: false,
    compliance: 'disable' as const
  },
  {
    id: '4',
    title: 'X-Large',
    price: '$42.99',
    mapPrice: null,
    finalPrice: '$38.99',
    mapEnabled: false,
    compliance: 'not_set' as const
  },
  {
    id: '5',
    title: 'XX-Large',
    price: '$44.99',
    mapPrice: '$39.99',
    finalPrice: '$42.99',
    mapEnabled: true,
    compliance: 'active' as const
  },
  {
    id: '6',
    title: '3X-Large',
    price: '$46.99',
    mapPrice: '$41.99',
    finalPrice: '$30.99',
    mapEnabled: true,
    compliance: 'violation' as const
  },
];

function App() {
  const {i18n, data} = useApi(TARGET);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3;

  // Calculate pagination
  const totalPages = Math.ceil(mockVariants.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const currentVariants = mockVariants.slice(startIndex, startIndex + itemsPerPage);

  // Status counts
  const violationCount = mockVariants.filter(v => v.compliance === 'violation').length;

  // TODO: Replace with util functions for MAP management
  const handleEditMAP = (variantId: string) => {
    console.log('Edit MAP for variant:', variantId);
    // Will be replaced with: mapUtils.editMAP(variantId)
  };

  const handleToggleMAP = (variantId: string, currentState: boolean) => {
    console.log('Toggle MAP for variant:', variantId, 'from', currentState, 'to', !currentState);
    // Will be replaced with: mapUtils.toggleMAP(variantId, !currentState)
  };

  const handleSetMAP = (variantId: string) => {
    console.log('Set MAP for variant:', variantId);
    // Will be replaced with: mapUtils.setMAP(variantId)
  };

  const getBadgeTone = (compliance: string) => {
    switch (compliance) {
      case 'active': return 'success';
      case 'violation': return 'critical';
      case 'disable': return 'warning';
      default: return undefined;
    }
  };

  const getBadgeText = (compliance: string) => {
    switch (compliance) {
      case 'active': return 'Active';
      case 'violation': return 'Violation';
      case 'disable': return 'Disabled';
      default: return 'Not Set';
    }
  };

  return (
    <AdminBlock title="MAP Guard">
      <BlockStack gap="none">
        {/* Header */}
        <Box padding="base">
          <InlineStack gap="base" inlineAlignment="space-between" blockAlignment="center">
            <InlineStack gap="base" blockAlignment="center">
              {violationCount > 0 && (
                <Badge tone="critical">
                  {violationCount} violation{violationCount !== 1 ? 's' : ''}
                </Badge>
              )}
              <Text fontWeight="bold">
                {mockVariants.length} variant{mockVariants.length !== 1 ? 's' : ''}
              </Text>
            </InlineStack>
            <Pressable onPress={() => console.log('Settings')} accessibilityLabel="Settings">
              <Icon name="SettingsMinor" />
            </Pressable>
          </InlineStack>
        </Box>

        <Divider />

        {/* Header Row */}
        <Box paddingInline="base" paddingBlock="base">
          <InlineStack gap="base" blockAlignment="center" inlineAlignment="space-between">
            {/* Left side - Variant column header */}
            <Box minInlineSize={120}>
              <Text fontWeight="bold">Variant</Text>
            </Box>
            
            {/* Middle - Price columns */}
            <InlineStack gap="base" blockAlignment="center">
              <Box minInlineSize={80}>
                <Text fontWeight="bold">MAP Price</Text>
              </Box>
              <Box minInlineSize={80}>
                <Text fontWeight="bold">Final Price</Text>
              </Box>
            </InlineStack>
            
            {/* Right side - Status and Actions headers */}
            <InlineStack gap="base" blockAlignment="center">
              <Box minInlineSize={120}>
                <Text fontWeight="bold">Status</Text>
              </Box>
              <Box minInlineSize={80}>
                {/* No header for actions column */}
              </Box>
            </InlineStack>
          </InlineStack>
        </Box>

        <Divider />

        {/* Compact List */}
        <BlockStack gap="none">
          {currentVariants.map((variant, index) => (
            <Box key={variant.id}>
              <Box paddingInline="base" paddingBlock="base">
                <InlineStack gap="base" blockAlignment="center" inlineAlignment="space-between">
                  {/* Variant Info - Fixed width for alignment */}
                  <Box minInlineSize={120}>
                    <Text fontWeight="bold">{variant.title}</Text>
                  </Box>

                  {/* Price columns */}
                  <InlineStack gap="base" blockAlignment="center">
                    <Box minInlineSize={80}>
                      <Text>{variant.mapPrice || '—'}</Text>
                    </Box>
                    <Box minInlineSize={80}>
                      <Text>{variant.finalPrice || '—'}</Text>
                    </Box>
                  </InlineStack>

                  {/* Status & Actions - Right aligned */}
                  <InlineStack gap="base" blockAlignment="center">
                    <Box minInlineSize={120}>
                      <InlineStack gap="base" blockAlignment="center">
                        <Icon name={variant.mapEnabled ? "ViewMinor" : "HideMinor"} />
                        <Badge tone={getBadgeTone(variant.compliance)}>
                          {getBadgeText(variant.compliance)}
                        </Badge>
                      </InlineStack>
                    </Box>
                    
                    <Box minInlineSize={80}>
                      <InlineStack gap="base">
                        {variant.mapPrice ? (
                          <Pressable
                            onPress={() => handleEditMAP(variant.id)}
                            accessibilityLabel="Edit MAP"
                          >
                            <Icon name="EditMinor" />
                          </Pressable>
                        ) : (
                          <Pressable
                            onPress={() => handleSetMAP(variant.id)}
                            accessibilityLabel="Set MAP"
                          >
                            <Icon name="PlusMinor" />
                          </Pressable>
                        )}
                      </InlineStack>
                    </Box>
                  </InlineStack>
                </InlineStack>
              </Box>
              {index < currentVariants.length - 1 && <Divider />}
            </Box>
          ))}
        </BlockStack>

        {/* Pagination */}
        {totalPages > 1 && (
          <>
            <Divider />
            <Box padding="base">
              <InlineStack gap="base" inlineAlignment="center" blockAlignment="center">
                <Pressable
                  onPress={currentPage === 0 ? undefined : () => setCurrentPage(currentPage - 1)}
                  accessibilityLabel="Previous page"
                >
                  <Icon name="ChevronLeftMinor" />
                </Pressable>
                <Text>
                  {currentPage + 1} of {totalPages}
                </Text>
                <Pressable
                  onPress={currentPage === totalPages - 1 ? undefined : () => setCurrentPage(currentPage + 1)}
                  accessibilityLabel="Next page"
                >
                  <Icon name="ChevronRightMinor" />
                </Pressable>
              </InlineStack>
            </Box>
          </>
        )}
      </BlockStack>
    </AdminBlock>
  );
}