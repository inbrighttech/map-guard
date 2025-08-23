import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Card,
  IndexTable,
  useIndexResourceState,
  Text,
  Badge,
  Button,
  IndexFilters,
  useSetIndexFiltersMode,
  ChoiceList,
  InlineStack,
  BlockStack,
  Thumbnail,
  ButtonGroup,
  Tooltip,
  Modal,
  TextContainer,
  SkeletonThumbnail,
} from "@shopify/polaris";
import {
  EditIcon,
  ViewIcon,
  ExportIcon,
  ImportIcon,
  ToggleOnIcon,
  ToggleOffIcon,
  DeleteIcon,
} from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";
import { useState, useCallback, Fragment } from "react";

// Mock products data with variants
const mockProducts = [
  {
    id: "1",
    title: "Premium Wireless Headphones",
    vendor: "AudioTech",
    status: "active",
    variants: [
      {
        id: "1-1",
        sku: "PWH-001-BLK",
        title: "Premium Wireless Headphones - Black",
        productType: "Electronics",
        mapEnabled: true,
        mapPrice: 199.99,
        actualPrice: 179.99,
        finalPrice: 159.99,
        cost: 89.50,
        discountPercentage: 20.0,
        profitMargin: 35.2,
        inventory: 25,
        image: null,
        mapCompliance: "active",
      },
      {
        id: "1-2",
        sku: "PWH-001-WHT",
        title: "Premium Wireless Headphones - White",
        productType: "Electronics",
        mapEnabled: true,
        mapPrice: 199.99,
        actualPrice: 149.99,
        finalPrice: 159.99,
        cost: 89.50,
        discountPercentage: 20.0,
        profitMargin: 35.2,
        inventory: 20,
        image: null,
        mapCompliance: "violation",
      },
    ],
  },
  {
    id: "2",
    title: "Smart Fitness Watch",
    vendor: "TechCorp",
    status: "active",
    variants: [
      {
        id: "2-1",
        sku: "SFW-002-SM",
        title: "Smart Fitness Watch - Small",
        productType: "Wearables",
        mapEnabled: true,
        mapPrice: 299.99,
        actualPrice: 279.99,
        finalPrice: 249.99,
        cost: 125.00,
        discountPercentage: 16.7,
        profitMargin: 41.7,
        inventory: 15,
        image: null,
        mapCompliance: "active",
      },
      {
        id: "2-2",
        sku: "SFW-002-LG",
        title: "Smart Fitness Watch - Large",
        productType: "Wearables",
        mapEnabled: true,
        mapPrice: 299.99,
        actualPrice: 199.99,
        finalPrice: 249.99,
        cost: 125.00,
        discountPercentage: 16.7,
        profitMargin: 41.7,
        inventory: 17,
        image: null,
        mapCompliance: "violation",
      },
    ],
  },
  {
    id: "3",
    title: "Organic Cotton T-Shirt",
    vendor: "EcoWear",
    status: "active",
    variants: [
      {
        id: "3-1",
        sku: "OCT-003-S",
        title: "Organic Cotton T-Shirt - Small",
        productType: "Apparel",
        mapEnabled: false,
        mapPrice: 29.99,
        actualPrice: 19.99,
        finalPrice: 24.99,
        cost: 12.50,
        discountPercentage: 16.7,
        profitMargin: 41.6,
        inventory: 40,
        image: null,
        mapCompliance: "not_set",
      },
      {
        id: "3-2",
        sku: "OCT-003-M",
        title: "Organic Cotton T-Shirt - Medium",
        productType: "Apparel",
        mapEnabled: false,
        mapPrice: 29.99,
        actualPrice: 24.99,
        finalPrice: 24.99,
        cost: 12.50,
        discountPercentage: 16.7,
        profitMargin: 41.6,
        inventory: 45,
        image: null,
        mapCompliance: "disable",
      },
      {
        id: "3-3",
        sku: "OCT-003-L",
        title: "Organic Cotton T-Shirt - Large",
        productType: "Apparel",
        mapEnabled: false,
        mapPrice: 29.99,
        actualPrice: 27.99,
        finalPrice: 24.99,
        cost: 12.50,
        discountPercentage: 16.7,
        profitMargin: 41.6,
        inventory: 43,
        image: null,
        mapCompliance: "not_set",
      },
    ],
  },
  {
    id: "4",
    title: "Professional Camera Lens",
    vendor: "LensMaster",
    status: "active",
    variants: [
      {
        id: "4-1",
        sku: "PCL-004-50MM",
        title: "Professional Camera Lens - 50mm",
        productType: "Photography",
        mapEnabled: true,
        mapPrice: 899.99,
        actualPrice: 799.99,
        finalPrice: 749.99,
        cost: 425.00,
        discountPercentage: 16.7,
        profitMargin: 36.1,
        inventory: 8,
        image: null,
        mapCompliance: "active",
      },
      {
        id: "4-2",
        sku: "PCL-004-85MM",
        title: "Professional Camera Lens - 85mm",
        productType: "Photography",
        mapEnabled: true,
        mapPrice: 1099.99,
        actualPrice: 799.99,
        finalPrice: 899.99,
        cost: 525.00,
        discountPercentage: 18.2,
        profitMargin: 34.8,
        inventory: 4,
        image: null,
        mapCompliance: "violation",
      },
    ],
  },
];

// Transform products to flat list for IndexTable
const transformedProducts = mockProducts.flatMap(product => {
  return product.variants.map(variant => ({
    ...variant,
    productId: product.id,
    productTitle: product.title,
    vendor: product.vendor,
    status: product.status,
  }));
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  
  return json({
    products: mockProducts,
  });
};

export default function ProductsPage() {
  const { products } = useLoaderData<typeof loader>();
  
  // IndexFilters state
  const [queryValue, setQueryValue] = useState("");
  const [selected, setSelected] = useState(0);
  const [sortSelected, setSortSelected] = useState(["title asc"]);
  const [accountStatus, setAccountStatus] = useState<string[] | undefined>(undefined);
  const [mapStatus, setMapStatus] = useState<string[] | undefined>(undefined);
  const [vendor, setVendor] = useState<string[] | undefined>(undefined);
  const [productType, setProductType] = useState<string[] | undefined>(undefined);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  const { mode, setMode } = useSetIndexFiltersMode();

  // Sort options (following Shopify example pattern)
  const sortOptions = [
    { label: "Product title A-Z", value: "title asc" as const, directionLabel: "A-Z" },
    { label: "Product title Z-A", value: "title desc" as const, directionLabel: "Z-A" },
    { label: "MAP Price (highest first)", value: "mapPrice desc" as const, directionLabel: "Highest first" },
    { label: "MAP Price (lowest first)", value: "mapPrice asc" as const, directionLabel: "Lowest first" },
    { label: "Inventory (highest first)", value: "inventory desc" as const, directionLabel: "Highest first" },
    { label: "Inventory (lowest first)", value: "inventory asc" as const, directionLabel: "Lowest first" },
  ];

  // Filter handlers
  const handleAccountStatusChange = useCallback((value: string[]) => setAccountStatus(value), []);
  const handleMapStatusChange = useCallback((value: string[]) => setMapStatus(value), []);
  const handleVendorChange = useCallback((value: string[]) => setVendor(value), []);
  const handleProductTypeChange = useCallback((value: string[]) => setProductType(value), []);
  const handleFiltersQueryChange = useCallback((value: string) => setQueryValue(value), []);

  // Clear filters
  const handleQueryValueRemove = useCallback(() => setQueryValue(""), []);
  const handleAccountStatusRemove = useCallback(() => setAccountStatus(undefined), []);
  const handleMapStatusRemove = useCallback(() => setMapStatus(undefined), []);
  const handleVendorRemove = useCallback(() => setVendor(undefined), []);
  const handleProductTypeRemove = useCallback(() => setProductType(undefined), []);
  const handleFiltersClearAll = useCallback(() => {
    handleQueryValueRemove();
    handleAccountStatusRemove();
    handleMapStatusRemove();
    handleVendorRemove();
    handleProductTypeRemove();
  }, [
    handleQueryValueRemove,
    handleAccountStatusRemove,
    handleMapStatusRemove,
    handleVendorRemove,
    handleProductTypeRemove,
  ]);

  // Filters configuration (following Shopify example)
  const filters = [
    {
      key: "accountStatus",
      label: "Product status",
      filter: (
        <ChoiceList
          title="Product status"
          titleHidden
          choices={[
            { label: "Active", value: "active" },
            { label: "Draft", value: "draft" },
            { label: "Archived", value: "archived" },
          ]}
          selected={accountStatus || []}
          onChange={handleAccountStatusChange}
          allowMultiple
        />
      ),
      shortcut: true,
    },
    {
      key: "mapStatus",
      label: "MAP status",
      filter: (
        <ChoiceList
          title="MAP Status"
          titleHidden
          choices={[
            { label: "Active", value: "active" },
            { label: "Disabled", value: "disable" },
            { label: "Violation", value: "violation" },
            { label: "Not Set", value: "not_set" },
          ]}
          selected={mapStatus || []}
          onChange={handleMapStatusChange}
          allowMultiple
        />
      ),
      shortcut: true,
    },
    {
      key: "vendor",
      label: "Vendor",
      filter: (
        <ChoiceList
          title="Vendor"
          titleHidden
          choices={[
            { label: "AudioTech", value: "AudioTech" },
            { label: "TechCorp", value: "TechCorp" },
            { label: "EcoWear", value: "EcoWear" },
            { label: "LensMaster", value: "LensMaster" },
            { label: "SoundWave", value: "SoundWave" },
            { label: "ComfortSeating", value: "ComfortSeating" },
            { label: "HydroLife", value: "HydroLife" },
            { label: "GameTech", value: "GameTech" },
          ]}
          selected={vendor || []}
          onChange={handleVendorChange}
          allowMultiple
        />
      ),
    },
    {
      key: "productType",
      label: "Product type",
      filter: (
        <ChoiceList
          title="Product type"
          titleHidden
          choices={[
            { label: "Electronics", value: "Electronics" },
            { label: "Wearables", value: "Wearables" },
            { label: "Apparel", value: "Apparel" },
            { label: "Photography", value: "Photography" },
            { label: "Furniture", value: "Furniture" },
            { label: "Accessories", value: "Accessories" },
          ]}
          selected={productType || []}
          onChange={handleProductTypeChange}
          allowMultiple
        />
      ),
    },
  ];

  // Applied filters
  const appliedFilters = [];
  if (queryValue && queryValue.length > 0) {
    appliedFilters.push({
      key: "queryValue",
      label: `Searching: ${queryValue}`,
      onRemove: handleQueryValueRemove,
    });
  }
  if (accountStatus && accountStatus.length > 0) {
    appliedFilters.push({
      key: "accountStatus",
      label: `Status: ${accountStatus.join(", ")}`,
      onRemove: handleAccountStatusRemove,
    });
  }
  if (mapStatus && mapStatus.length > 0) {
    appliedFilters.push({
      key: "mapStatus",
      label: `MAP status: ${mapStatus.join(", ")}`,
      onRemove: handleMapStatusRemove,
    });
  }
  if (vendor && vendor.length > 0) {
    appliedFilters.push({
      key: "vendor",
      label: `Vendor: ${vendor.join(", ")}`,
      onRemove: handleVendorRemove,
    });
  }
  if (productType && productType.length > 0) {
    appliedFilters.push({
      key: "productType",
      label: `Product type: ${productType.join(", ")}`,
      onRemove: handleProductTypeRemove,
    });
  }

  // Action handlers for App Bridge integration
  const handleEditVariant = useCallback((variantId: string) => {
    console.log(`Edit variant ${variantId}`);
  }, []);

  const handleViewVariant = useCallback((variantId: string) => {
    console.log(`View variant ${variantId}`);
  }, []);

  const handleToggleMAP = useCallback((variantId: string, currentStatus: boolean) => {
    console.log(`Toggle MAP for variant ${variantId} from ${currentStatus} to ${!currentStatus}`);
    // In a real app, this would make an API call to update the variant's MAP status
    // Example:
    // await fetch(`/api/variants/${variantId}/map`, {
    //   method: 'PATCH',
    //   body: JSON.stringify({ mapEnabled: !currentStatus })
    // });
    // Then refetch or update local state
  }, []);

  // Resource name
  const resourceName = {
    singular: 'variant',
    plural: 'variants',
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Flatten all variants for IndexTable state
  const allVariants = products.flatMap(product => 
    product.variants.map(variant => ({
      ...variant,
      productId: product.id,
      productTitle: product.title,
      vendor: product.vendor,
      status: product.status,
    }))
  );

  // IndexTable state
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(allVariants);

  // Group variants by product for nested rows
  const groupedProducts = products.map((product, index) => ({
    ...product,
    position: index,
    variants: product.variants.map((variant, variantIndex) => ({
      ...variant,
      productId: product.id,
      productTitle: product.title,
      vendor: product.vendor,
      status: product.status,
      position: index + variantIndex + 1,
    }))
  }));

  // Row markup following Shopify's official nested pattern
  const rowMarkup = groupedProducts.map((product, index) => {
    const { variants, position, id: productId } = product;
    let selected: any = false;

    const someVariantsSelected = variants.some(({id}) =>
      selectedResources.includes(id),
    );

    const allVariantsSelected = variants.every(({id}) =>
      selectedResources.includes(id),
    );

    if (allVariantsSelected) {
      selected = true;
    } else if (someVariantsSelected) {
      selected = 'indeterminate';
    }

    const selectableVariants = allVariants;
    const rowRange: any = [
      selectableVariants.findIndex((variant) => variant.id === variants[0].id),
      selectableVariants.findIndex(
        (variant) => variant.id === variants[variants.length - 1].id,
      ),
    ];

    return (
      <Fragment key={productId}>
        <IndexTable.Row
          rowType="data"
          selectionRange={rowRange}
          id={`Parent-${index}`}
          position={position}
          selected={selected}
          accessibilityLabel={`Select all variants for ${product.title}`}
        >
          <IndexTable.Cell scope="col" id={productId}>
            <Text variant="bodyMd" fontWeight="semibold" as="span">
              {product.title}
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell />
          <IndexTable.Cell>
            <Text as="span" variant="bodyMd">
              {product.vendor}
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Badge
              tone={product.status === "active" ? "success" : product.status === "draft" ? "attention" : "critical"}
            >
              {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
            </Badge>
          </IndexTable.Cell>
          <IndexTable.Cell />
          <IndexTable.Cell />
          <IndexTable.Cell />
          <IndexTable.Cell />
          <IndexTable.Cell />
          <IndexTable.Cell />
          <IndexTable.Cell />
          <IndexTable.Cell />
          <IndexTable.Cell />
        </IndexTable.Row>
        {variants.map((variant) => (
          <IndexTable.Row
            rowType="child"
            key={variant.id}
            id={variant.id}
            position={variant.position}
            selected={selectedResources.includes(variant.id)}
          >
            <IndexTable.Cell
              scope="row"
              headers={`column-header--product ${productId}`}
            >
              <InlineStack gap="300" blockAlign="center">
                <SkeletonThumbnail size="extraSmall" />
                <BlockStack gap="100">
                  <Text variant="bodyMd" as="span">
                    {variant.title.split(' - ').slice(1).join(' - ')}
                  </Text>
                </BlockStack>
              </InlineStack>
            </IndexTable.Cell>
            <IndexTable.Cell>
              <Text as="span" variant="bodyMd">
                {variant.sku}
              </Text>
            </IndexTable.Cell>
            <IndexTable.Cell />
            <IndexTable.Cell />
            <IndexTable.Cell>
              <InlineStack gap="200" blockAlign="center">
                <Badge 
                  tone={
                    variant.mapCompliance === "active" ? "success" :
                    variant.mapCompliance === "violation" ? "critical" :
                    variant.mapCompliance === "disable" ? "attention" :
                    undefined
                  }
                >
                  {
                    variant.mapCompliance === "active" ? "Active" :
                    variant.mapCompliance === "violation" ? "Violation" :
                    variant.mapCompliance === "disable" ? "Disabled" :
                    "Not Set"
                  }
                </Badge>
                <Tooltip content={variant.mapEnabled ? "Disable MAP" : "Enable MAP"}>
                  <Button
                    icon={variant.mapEnabled ? ToggleOnIcon : ToggleOffIcon}
                    variant="tertiary"
                    size="micro"
                    onClick={() => handleToggleMAP(variant.id, variant.mapEnabled)}
                  />
                </Tooltip>
              </InlineStack>
            </IndexTable.Cell>
            <IndexTable.Cell>
              <Text as="span" variant="bodyMd" fontWeight="semibold">
                {formatCurrency(variant.mapPrice)}
              </Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
              <Text 
                as="span" 
                variant="bodyMd" 
                fontWeight="semibold"
                tone={variant.actualPrice < variant.mapPrice ? "critical" : undefined}
              >
                {formatCurrency(variant.actualPrice)}
              </Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
              <Text as="span" variant="bodyMd">
                {formatCurrency(variant.finalPrice)}
              </Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
              <Text as="span" variant="bodyMd">
                {variant.discountPercentage.toFixed(1)}%
              </Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
              <Text as="span" variant="bodyMd">
                {formatCurrency(variant.cost)}
              </Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
              <Text as="span" variant="bodyMd">
                {variant.profitMargin.toFixed(1)}%
              </Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
              <Text as="span" variant="bodyMd">
                {variant.inventory}
              </Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
              <ButtonGroup>
                <Tooltip content="Edit variant">
                  <Button
                    icon={EditIcon}
                    variant="tertiary"
                    onClick={() => handleEditVariant(variant.id)}
                  />
                </Tooltip>
                <Tooltip content="View variant">
                  <Button
                    icon={ViewIcon}
                    variant="tertiary"
                    onClick={() => handleViewVariant(variant.id)}
                  />
                </Tooltip>
              </ButtonGroup>
            </IndexTable.Cell>
          </IndexTable.Row>
        ))}
      </Fragment>
    );
  });

  // Bulk actions
  const promotedBulkActions = [
    {
      content: "Bulk edit",
      onAction: () => console.log("Bulk edit selected variants"),
    },
    {
      content: "Enable MAP",
      onAction: () => console.log("Enable MAP for selected variants"),
    },
    {
      content: "Disable MAP",
      onAction: () => console.log("Disable MAP for selected variants"),
    },
  ];

  return (
    <Page
      fullWidth
      title="Products"
      secondaryActions={[
        {
          content: "Export",
          icon: ExportIcon,
          onAction: () => console.log("Export products"),
        },
        {
          content: "Import",
          icon: ImportIcon,
          onAction: () => console.log("Import products"),
        },
      ]}
    >
      <Card padding="0">
        <IndexFilters
          sortOptions={sortOptions}
          sortSelected={sortSelected}
          queryValue={queryValue}
          queryPlaceholder="Searching in all products"
          onQueryChange={handleFiltersQueryChange}
          onQueryClear={() => setQueryValue("")}
          onSort={setSortSelected}
          primaryAction={{
            type: "save-as",
            onAction: async () => {
              console.log("Save view");
              return true;
            },
            disabled: false,
            loading: false,
          }}
          cancelAction={{
            onAction: () => console.log("Cancel"),
            disabled: false,
            loading: false,
          }}
          tabs={[]}
          selected={selected}
          onSelect={setSelected}
          canCreateNewView
          onCreateNewView={async (value) => {
            console.log("Create new view", value);
            return true;
          }}
          filters={filters}
          appliedFilters={appliedFilters}
          onClearAll={handleFiltersClearAll}
          mode={mode}
          setMode={setMode}
        />
        <IndexTable
          resourceName={resourceName}
          itemCount={allVariants.length}
          selectedItemsCount={
            allResourcesSelected ? "All" : selectedResources.length
          }
          onSelectionChange={handleSelectionChange}
          promotedBulkActions={promotedBulkActions}
          bulkActions={[
            {
              content: "Delete MAP settings",
              onAction: () => setDeleteModalOpen(true),
            },
          ]}
          headings={[
            { title: "Product", id: "column-header--product" },
            { title: "SKU", id: "column-header--sku" },
            { title: "Vendor", id: "column-header--vendor" },
            { title: "Status", id: "column-header--status" },
            { title: "MAP status", id: "column-header--map-status" },
            { title: "MAP price", id: "column-header--map-price" },
            { title: "Actual price", id: "column-header--actual-price" },
            { title: "Final price", id: "column-header--final-price" },
            { title: "Discount %", id: "column-header--discount" },
            { title: "Cost", id: "column-header--cost" },
            { title: "Profit margin", id: "column-header--profit-margin" },
            { title: "Inventory", id: "column-header--inventory" },
            { title: "Actions", id: "column-header--actions" },
          ]}
          sortable={[true, true, true, false, false, true, true, true, true, true, true, true, false]}
          pagination={{
            hasNext: true,
            hasPrevious: false,
            onNext: () => {
              console.log("Navigate to next page");
              // TODO: Implement actual pagination logic
            },
            onPrevious: () => {
              console.log("Navigate to previous page");
              // TODO: Implement actual pagination logic
            },
          }}
        >
          {rowMarkup}
        </IndexTable>
      </Card>
      
      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete MAP settings"
        primaryAction={{
          content: "Delete",
          destructive: true,
          onAction: () => {
            console.log("Delete MAP settings for selected variants");
            setDeleteModalOpen(false);
          },
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setDeleteModalOpen(false),
          },
        ]}
      >
        <Modal.Section>
          <TextContainer>
            <p>
              Are you sure you want to delete MAP settings for the selected variants? 
              This action cannot be undone.
            </p>
          </TextContainer>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
