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
  Button,
  Image,
  Icon,
} from '@shopify/ui-extensions-react/admin';
import { useState } from 'react';

// The target used here must match the target used in the extension's toml file (./shopify.extension.toml)
const TARGET = 'admin.product-details.block.render';

export default reactExtension(TARGET, () => <App />);

// Mock data for MAP overview with more compact structure
const mockVariants = [
  {
    id: '1',
    title: 'Small',
    price: '$29.99',
    mapPrice: '$24.99',
    actualPrice: '$26.99',
    mapEnabled: true,
    compliance: 'active',
    image: 'https://via.placeholder.com/32x32/007bff/ffffff?text=S'
  },
  {
    id: '2',
    title: 'Medium',
    price: '$34.99',
    mapPrice: '$29.99',
    actualPrice: '$19.99',
    mapEnabled: true,
    compliance: 'violation',
    image: 'https://via.placeholder.com/32x32/dc3545/ffffff?text=M'
  },
  {
    id: '3',
    title: 'Large',
    price: '$39.99',
    mapPrice: '$34.99',
    actualPrice: '$35.99',
    mapEnabled: false,
    compliance: 'disable',
    image: 'https://via.placeholder.com/32x32/ffc107/000000?text=L'
  },
  {
    id: '4',
    title: 'X-Large',
    price: '$42.99',
    mapPrice: null,
    actualPrice: '$38.99',
    mapEnabled: false,
    compliance: 'not_set',
    image: 'https://via.placeholder.com/32x32/6c757d/ffffff?text=XL'
  },
  {
    id: '5',
    title: 'XX-Large',
    price: '$44.99',
    mapPrice: '$39.99',
    actualPrice: '$42.99',
    mapEnabled: true,
    compliance: 'active',
    image: 'https://via.placeholder.com/32x32/28a745/ffffff?text=XXL'
  },
  {
    id: '6',
    title: '3X-Large',
    price: '$46.99',
    mapPrice: '$41.99',
    actualPrice: '$30.99',
    mapEnabled: true,
    compliance: 'violation',
    image: 'https://via.placeholder.com/32x32/17a2b8/ffffff?text=3XL'
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

  const handleEditMAP = (variantId: string) => {
    console.log('Edit MAP for variant:', variantId);
  };

  const handleToggleMAP = (variantId: string, currentState: boolean) => {
    console.log('Toggle MAP for variant:', variantId, 'from', currentState, 'to', !currentState);
  };

  const handleSetMAP = (variantId: string) => {
    console.log('Set MAP for variant:', variantId);
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
            <Button onPress={() => console.log('Settings')}>
              <Icon name="SettingsMinor" />
            </Button>
          </InlineStack>
        </Box>

        <Divider />

        {/* Header Row */}
        <Box paddingInline="base" paddingBlock="base">
          <InlineStack gap="base" blockAlignment="center" inlineAlignment="space-between">
            <Text fontWeight="bold">Variant</Text>
            <InlineStack gap="base" blockAlignment="center">
              <Text fontWeight="bold">Status</Text>
              <Text fontWeight="bold">Actions</Text>
            </InlineStack>
          </InlineStack>
        </Box>

        <Divider />

        {/* Compact List */}
        <BlockStack gap="none">
          {currentVariants.map((variant, index) => (
            <Box key={variant.id}>
              <Box paddingInline="base" paddingBlock="none">
                <InlineStack gap="base" blockAlignment="center" inlineAlignment="space-between">
                  {/* Variant Info */}
                  <BlockStack gap="none">
                    <Text fontWeight="bold">{variant.title}</Text>
                    <InlineStack gap="base">
                      <Text>MAP: {variant.mapPrice || '—'}</Text>
                      <Text>Actual: {variant.actualPrice}</Text>
                    </InlineStack>
                  </BlockStack>

                  {/* Status & Actions */}
                  <InlineStack gap="base" blockAlignment="center">
                    <Badge tone={getBadgeTone(variant.compliance)}>
                      {getBadgeText(variant.compliance)}
                    </Badge>
                    
                    <InlineStack gap="base">
                      {variant.mapPrice ? (
                        <>
                          <Button onPress={() => handleEditMAP(variant.id)}>
                            <Icon name="EditMinor" />
                          </Button>
                          <Button onPress={() => handleToggleMAP(variant.id, variant.mapEnabled)}>
                            <Icon name={variant.mapEnabled ? "HideMinor" : "ViewMinor"} />
                          </Button>
                        </>
                      ) : (
                        <Button onPress={() => handleSetMAP(variant.id)}>
                          <Icon name="PlusMinor" />
                        </Button>
                      )}
                    </InlineStack>
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
                <Button
                  disabled={currentPage === 0}
                  onPress={() => setCurrentPage(currentPage - 1)}
                >
                  <Icon name="ChevronLeftMinor" />
                </Button>
                <Text>
                  {currentPage + 1} of {totalPages}
                </Text>
                <Button
                  disabled={currentPage === totalPages - 1}
                  onPress={() => setCurrentPage(currentPage + 1)}
                >
                  <Icon name="ChevronRightMinor" />
                </Button>
              </InlineStack>
            </Box>
          </>
        )}
      </BlockStack>
    </AdminBlock>
  );
}