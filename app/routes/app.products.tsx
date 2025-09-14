import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useActionData, useNavigation, Form, useSubmit } from "@remix-run/react";
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
  TextField,
  Select,
  DataTable,
  Pagination,
  Filters,
  ChoiceList,
  Modal,
  FormLayout,
  Checkbox,
} from "@shopify/polaris";
import { useState, useCallback, useEffect } from "react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

interface ProductVariant {
  id: string;
  title: string;
  sku?: string;
  price: string;
  compareAtPrice?: string;
  mapPrice?: string;
  mapEnabled: boolean;
  finalPrice?: string;
  inventoryQuantity?: number;
  product: {
    id: string;
    title: string;
    handle: string;
    featuredImage?: {
      url: string;
      altText?: string;
    };
  };
}

interface LoaderData {
  variants: ProductVariant[];
  totalCount: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ActionData {
  success?: boolean;
  error?: string;
  updatedVariants?: string[];
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const { admin, session } = await authenticate.admin(request);
  const url = new URL(request.url);
  
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const limit = 25;
  const offset = (page - 1) * limit;
  const search = url.searchParams.get("search") || "";
  const mapStatus = url.searchParams.get("mapStatus") || "";

  try {
    // Build GraphQL query for products and variants
    let searchFilter = "";
    if (search) {
      searchFilter = `title:*${search}* OR sku:*${search}*`;
    }

    const productsQuery = `
      query GetProducts($first: Int!, $after: String, $query: String) {
        products(first: $first, after: $after, query: $query) {
          edges {
            node {
              id
              title
              handle
              featuredImage {
                url
                altText
              }
              variants(first: 10) {
                edges {
                  node {
                    id
                    title
                    sku
                    price
                    compareAtPrice
                    inventoryQuantity
                    metafields(first: 10, namespace: "mapguard") {
                      edges {
                        node {
                          key
                          value
                          type
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            endCursor
          }
        }
      }
    `;

    const productsResponse = await admin.graphql(productsQuery, {
      variables: {
        first: limit,
        query: searchFilter || undefined,
      },
    });

    const productsData = await productsResponse.json();
    
    if (!productsData.data?.products) {
      throw new Error("Failed to fetch products");
    }

    const variants: ProductVariant[] = [];
    
    for (const productEdge of productsData.data.products.edges) {
      const product = productEdge.node;
      
      for (const variantEdge of product.variants.edges) {
        const variant = variantEdge.node;
        
        // Extract metafields
        const metafields = variant.metafields.edges.reduce((acc: any, edge: any) => {
          acc[edge.node.key] = edge.node.value;
          return acc;
        }, {});

        const mapPrice = metafields.map_price;
        const mapEnabled = metafields.map_enabled === "true";
        const finalPrice = metafields.final_price;

        // Apply filter for MAP status
        if (mapStatus === "enabled" && !mapEnabled) continue;
        if (mapStatus === "disabled" && mapEnabled) continue;
        if (mapStatus === "has_price" && !mapPrice) continue;

        variants.push({
          id: variant.id,
          title: variant.title === "Default Title" ? product.title : `${product.title} - ${variant.title}`,
          sku: variant.sku,
          price: variant.price,
          compareAtPrice: variant.compareAtPrice,
          mapPrice,
          mapEnabled,
          finalPrice,
          inventoryQuantity: variant.inventoryQuantity,
          product: {
            id: product.id,
            title: product.title,
            handle: product.handle,
            featuredImage: product.featuredImage,
          },
        });
      }
    }

    return json<LoaderData>({
      variants,
      totalCount: variants.length,
      currentPage: page,
      hasNextPage: productsData.data.products.pageInfo.hasNextPage,
      hasPreviousPage: productsData.data.products.pageInfo.hasPreviousPage,
    });

  } catch (error) {
    console.error("Products loader error:", error);
    return json<LoaderData>({
      variants: [],
      totalCount: 0,
      currentPage: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });
  }
};

export const action: ActionFunction = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");

  if (action === "update_map_pricing") {
    try {
      const variantId = formData.get("variantId") as string;
      const mapPrice = formData.get("mapPrice") as string;
      const mapEnabled = formData.get("mapEnabled") === "true";

      if (!variantId) {
        return json<ActionData>({ success: false, error: "Variant ID is required" });
      }

      const mutations = [];

      // Update MAP price if provided
      if (mapPrice && parseFloat(mapPrice) > 0) {
        mutations.push(`
          mapPrice: metafieldsSet(metafields: [{
            ownerId: "${variantId}"
            namespace: "mapguard"
            key: "map_price"
            value: "${mapPrice}"
            type: "money"
          }]) {
            metafields {
              id
            }
            userErrors {
              field
              message
            }
          }
        `);
      }

      // Update MAP enabled status
      mutations.push(`
        mapEnabled: metafieldsSet(metafields: [{
          ownerId: "${variantId}"
          namespace: "mapguard"
          key: "map_enabled"
          value: "${mapEnabled}"
          type: "boolean"
        }]) {
          metafields {
            id
          }
          userErrors {
            field
            message
          }
        }
      `);

      // Calculate and set final price if MAP is enabled
      if (mapEnabled && mapPrice) {
        const finalPrice = mapPrice; // For now, final price equals MAP price
        mutations.push(`
          finalPrice: metafieldsSet(metafields: [{
            ownerId: "${variantId}"
            namespace: "mapguard"
            key: "final_price"
            value: "${finalPrice}"
            type: "money"
          }]) {
            metafields {
              id
            }
            userErrors {
              field
              message
            }
          }
        `);
      }

      const updateMutation = `
        mutation UpdateVariantMetafields {
          ${mutations.join('\n')}
        }
      `;

      const updateResponse = await admin.graphql(updateMutation);
      const updateData = await updateResponse.json();

      // Check for errors
      const errors = [];
      for (const [key, result] of Object.entries(updateData.data || {})) {
        if ((result as any)?.userErrors?.length > 0) {
          errors.push(...(result as any).userErrors);
        }
      }

      if (errors.length > 0) {
        return json<ActionData>({ 
          success: false, 
          error: `Update failed: ${errors.map((e: any) => e.message).join(", ")}` 
        });
      }

      // Track usage in our database
      try {
        const shop = session.shop;
        const shopifyVariantId = variantId.replace("gid://shopify/ProductVariant/", "");
        
        await prisma.product.upsert({
          where: { 
            shopifyVariantId,
          },
          create: {
            shop,
            shopifyProductId: "", // We'd need to extract this from the variant
            shopifyVariantId,
            price: 0, // Default price, will be updated later
            mapPrice: mapEnabled && mapPrice ? parseFloat(mapPrice) : 0,
            enabled: mapEnabled,
          },
          update: {
            mapPrice: mapEnabled && mapPrice ? parseFloat(mapPrice) : 0,
            enabled: mapEnabled,
            updatedAt: new Date(),
          },
        });
      } catch (dbError) {
        console.error("Database tracking error:", dbError);
        // Don't fail the main operation for tracking errors
      }

      return json<ActionData>({ 
        success: true, 
        updatedVariants: [variantId] 
      });

    } catch (error) {
      console.error("Update MAP pricing error:", error);
      return json<ActionData>({ 
        success: false, 
        error: error instanceof Error ? error.message : "Update failed" 
      });
    }
  }

  return json<ActionData>({ success: false, error: "Invalid action" });
};

export default function ProductsPage() {
  const { variants, totalCount, currentPage, hasNextPage, hasPreviousPage } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const isSubmitting = navigation.state === "submitting";

  // Filter and search state
  const [searchValue, setSearchValue] = useState("");
  const [mapStatusFilter, setMapStatusFilter] = useState<string[]>([]);
  
  // Modal state for editing
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [modalMapPrice, setModalMapPrice] = useState("");
  const [modalMapEnabled, setModalMapEnabled] = useState(false);

  // Handle search
  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const handleSearchSubmit = useCallback(() => {
    const url = new URL(window.location.href);
    if (searchValue) {
      url.searchParams.set("search", searchValue);
    } else {
      url.searchParams.delete("search");
    }
    url.searchParams.set("page", "1");
    window.location.href = url.toString();
  }, [searchValue]);

  // Handle filters
  const handleMapStatusChange = useCallback((value: string[]) => {
    setMapStatusFilter(value);
    const url = new URL(window.location.href);
    if (value.length > 0) {
      url.searchParams.set("mapStatus", value[0]);
    } else {
      url.searchParams.delete("mapStatus");
    }
    url.searchParams.set("page", "1");
    window.location.href = url.toString();
  }, []);

  const handleClearFilters = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("search");
    url.searchParams.delete("mapStatus");
    url.searchParams.set("page", "1");
    window.location.href = url.toString();
  }, []);

  // Handle editing
  const openEditModal = useCallback((variant: ProductVariant) => {
    setEditingVariant(variant);
    setModalMapPrice(variant.mapPrice || "");
    setModalMapEnabled(variant.mapEnabled);
  }, []);

  const closeEditModal = useCallback(() => {
    setEditingVariant(null);
    setModalMapPrice("");
    setModalMapEnabled(false);
  }, []);

  const handleSaveVariant = useCallback(() => {
    if (!editingVariant) return;

    const formData = new FormData();
    formData.set("action", "update_map_pricing");
    formData.set("variantId", editingVariant.id);
    formData.set("mapPrice", modalMapPrice);
    formData.set("mapEnabled", modalMapEnabled.toString());

    submit(formData, { method: "post" });
    closeEditModal();
  }, [editingVariant, modalMapPrice, modalMapEnabled, submit, closeEditModal]);

  // Table data
  const tableRows = variants.map((variant) => [
    <InlineStack gap="200" blockAlign="center" key={`image-${variant.id}`}>
      {variant.product.featuredImage && (
        <img 
          src={variant.product.featuredImage.url} 
          alt={variant.product.featuredImage.altText || variant.product.title}
          style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }}
        />
      )}
      <BlockStack gap="050">
        <Text variant="bodyMd" fontWeight="semibold" as="p">
          {variant.title}
        </Text>
        {variant.sku && (
          <Text variant="bodySm" tone="subdued" as="p">
            SKU: {variant.sku}
          </Text>
        )}
      </BlockStack>
    </InlineStack>,
    <Text variant="bodyMd" as="p">${variant.price}</Text>,
    <Text variant="bodyMd" as="p">
      {variant.mapPrice ? `$${variant.mapPrice}` : "—"}
    </Text>,
    <Badge tone={variant.mapEnabled ? "success" : "info"}>
      {variant.mapEnabled ? "Enabled" : "Disabled"}
    </Badge>,
    <Button 
      variant="plain" 
      onClick={() => openEditModal(variant)}
      disabled={isSubmitting}
    >
      Edit
    </Button>,
  ]);

  const filters = [
    {
      key: "mapStatus",
      label: "MAP Status",
      filter: (
        <ChoiceList
          title="MAP Status"
          titleHidden
          choices={[
            { label: "Enabled", value: "enabled" },
            { label: "Disabled", value: "disabled" },
            { label: "Has MAP Price", value: "has_price" },
          ]}
          selected={mapStatusFilter}
          onChange={handleMapStatusChange}
        />
      ),
      shortcut: true,
    },
  ];

  return (
    <Page title="Product MAP Pricing">
      <Layout>
        <Layout.Section>
          {actionData?.success && (
            <Banner tone="success" title="Success">
              <p>MAP pricing has been updated successfully.</p>
            </Banner>
          )}

          {actionData?.error && (
            <Banner tone="critical" title="Error">
              <p>{actionData.error}</p>
            </Banner>
          )}
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between" blockAlign="center">
                <Text variant="headingMd" as="h2">
                  Products & Variants ({totalCount})
                </Text>
                <Button variant="primary" url="/app/setup">
                  Setup MAP Fields
                </Button>
              </InlineStack>

              <Filters
                queryValue={searchValue}
                queryPlaceholder="Search products or SKUs"
                filters={filters}
                onQueryChange={handleSearchChange}
                onQueryClear={() => setSearchValue("")}
                onClearAll={handleClearFilters}
              />

              <DataTable
                columnContentTypes={["text", "text", "text", "text", "text"]}
                headings={["Product", "Price", "MAP Price", "Status", "Actions"]}
                rows={tableRows}
                footerContent={
                  totalCount > 0 ? `Showing ${variants.length} of ${totalCount} variants` : undefined
                }
              />

              {(hasNextPage || hasPreviousPage) && (
                <Pagination
                  hasNext={hasNextPage}
                  hasPrevious={hasPreviousPage}
                  onNext={() => {
                    const url = new URL(window.location.href);
                    url.searchParams.set("page", (currentPage + 1).toString());
                    window.location.href = url.toString();
                  }}
                  onPrevious={() => {
                    const url = new URL(window.location.href);
                    url.searchParams.set("page", Math.max(1, currentPage - 1).toString());
                    window.location.href = url.toString();
                  }}
                />
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>

      {/* Edit Modal */}
      <Modal
        open={!!editingVariant}
        onClose={closeEditModal}
        title={`Edit MAP Pricing - ${editingVariant?.title}`}
        primaryAction={{
          content: "Save",
          onAction: handleSaveVariant,
          loading: isSubmitting,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: closeEditModal,
          },
        ]}
      >
        <Modal.Section>
          {editingVariant && (
            <FormLayout>
              <TextField
                label="MAP Price"
                type="number"
                step={0.01}
                min="0"
                value={modalMapPrice}
                onChange={setModalMapPrice}
                placeholder="Enter MAP price"
                prefix="$"
                helpText="The minimum advertised price for this variant"
                autoComplete="off"
              />
              
              <Checkbox
                label="Enable MAP for this variant"
                checked={modalMapEnabled}
                onChange={setModalMapEnabled}
                helpText="When enabled, this variant will be subject to MAP pricing rules"
              />

              <BlockStack gap="200">
                <Text variant="bodyMd" as="p">Current Price: ${editingVariant.price}</Text>
                {editingVariant.compareAtPrice && (
                  <Text variant="bodyMd" as="p">
                    Compare at Price: ${editingVariant.compareAtPrice}
                  </Text>
                )}
              </BlockStack>
            </FormLayout>
          )}
        </Modal.Section>
      </Modal>
    </Page>
  );
}
