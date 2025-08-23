# MAP Guard - Complete App Specification & Development Guide

## 🎯 **Core Concept**

MAP Guard enforces Minimum Advertised Pricing (MAP) policies by:

1. **Setting Shopify product prices to MAP prices** (higher, advertised price)
2. **Storing actual final prices in metafields** (lower, customer-paid price)
3. **Automatically discounting at checkout** to the final price
4. **Displaying MAP messages** instead of showing discounts upfront

### Example Flow:

- **Product Page**: Shows $99.99 (MAP price) with "Add to cart for lower price" message
- **Cart/Checkout**: Customer sees $99.99 → $79.99 (automatic discount applied)
- **Customer Pays**: $79.99 (final price)

---

## 🏗️ **Architecture Overview**

### **Metafield System** (Variant-Level Storage)

```json
{
  "mapguard.map": "$99.99", // MAP price (matches Shopify price)
  "mapguard.final_price": "$79.99", // Actual price customer pays
  "mapguard.enabled": true, // MAP protection enabled
  "mapguard.message": "Call for price" // Custom message (optional)
}
```

### **Price Management Strategy**

1. **Shopify Variant Price = MAP Price** (what shows on storefront)
2. **Metafield final_price = Customer Price** (what they actually pay)
3. **Discount Function** = MAP Price - Final Price (applied at checkout)

---

## 📋 **Complete Feature List**

### **1. Setup & Configuration**

#### **1.1 Metafield Setup Page**

- **Route**: `/app/setup`
- **Function**: Creates required metafield definitions
- **Features**:
  - One-click metafield creation
  - Status validation (shows existing vs missing)
  - Error handling with detailed messages
  - Professional DataTable UI with status badges

#### **1.2 Message Configuration**

- **Route**: `/app/settings`
- **Function**: Configure MAP message display
- **Features**:
  - Default message text ("Add to cart for lower price")
  - Message styling (colors, fonts, alignment)
  - Icon display toggle
  - Preview functionality

### **2. Frontend Display**

#### **2.1 Theme Extension**

- **Extension**: `map-message-display`
- **Type**: Theme app block
- **Location**: Product pages (added via theme editor)
- **Features**:
  - Displays MAP messages when variant has MAP enabled
  - Customizable styling from settings
  - Responsive design
  - Conditional display (only shows when MAP is active)

#### **2.2 Admin Product Extensions**

- **Extension A**: Product Admin Block
  - **Location**: Product detail pages in admin
  - **Function**: Quick MAP overview for all variants
  - **Features**:
    - Show MAP status for all variants
    - Quick enable/disable MAP protection
    - Summary of MAP vs final pricing

- **Extension B**: Variant Admin Block
  - **Location**: Variant detail pages in admin
  - **Function**: Direct MAP editing interface
  - **Features**:
    - Edit MAP price (syncs with Shopify price)
    - Edit final price (customer pays)
    - Custom message override
    - Enable/disable MAP protection
    - Price validation (final ≤ MAP)

### **3. Automatic Discount System**

#### **3.1 Discount Function**

- **Extension**: `apply-discount`
- **Type**: Shopify Function (cart.lines.discounts.generate.run)
- **Function**: Automatically discount MAP prices to final prices
- **Logic**:

```typescript
// For each cart line:
if (variant.mapguard.enabled && variant.mapguard.final_price) {
  const mapPrice = variant.price; // Shopify price
  const finalPrice = variant.mapguard.final_price;
  const discount = mapPrice - finalPrice;

  if (discount > 0) {
    applyDiscount(cartLine, discount);
  }
}
```

#### **3.2 Price Validation System**

- **Function**: Ensure Shopify prices match MAP metafields
- **Features**:
  - Webhook to detect price changes
  - Auto-sync MAP metafield when Shopify price changes
  - Alert system for price mismatches
  - Bulk price validation tool

### **4. Product Management**

#### **4.1 Products Overview Page**

- **Route**: `/app/products`
- **Function**: Main interface for managing MAP across products
- **Features**:

**Search & Filtering**:

```typescript
interface SearchFilters {
  search: {
    productTitle: string;
    productHandle: string;
    variantSKU: string;
    vendor: string;
  };
  filters: {
    mapStatus: "enabled" | "disabled" | "all";
    priceStatus: "has_map" | "no_map" | "price_mismatch";
    productType: string[];
    availability: "available" | "draft" | "archived" | "all";
    collections: string[];
  };
  view: "products" | "variants";
  sort: "title" | "created" | "price" | "map_status";
}
```

**Product List Display**:

```typescript
interface ProductListItem {
  id: string;
  title: string;
  handle: string;
  image: string;
  vendor: string;
  productType: string;
  status: "active" | "draft" | "archived";
  variantCount: number;
  mapVariantCount: number;
  variants: VariantListItem[];
}

interface VariantListItem {
  id: string;
  title: string;
  sku: string;
  shopifyPrice: string; // Current Shopify price
  mapPrice: string; // MAP metafield value
  finalPrice: string; // Final price metafield
  mapEnabled: boolean; // MAP protection status
  priceMatch: boolean; // Shopify price = MAP price?
  discountAmount: string; // MAP - Final price
}
```

**Bulk Operations**:

- Select multiple products/variants
- Bulk enable/disable MAP
- Bulk set MAP prices
- Bulk set final prices
- Export to CSV
- Redirect to Shopify bulk editor

#### **4.2 Single Product/Variant Editor**

- **Route**: `/app/products/:id` and `/app/variants/:id`
- **Function**: Detailed editing for individual items
- **Features**:
  - Comprehensive MAP settings
  - Price history and analytics
  - Custom message per variant
  - Preview MAP display
  - Price validation and warnings

### **5. Bulk Editing Integration**

#### **5.1 Shopify Bulk Editor Links**

- **Function**: Generate URLs to Shopify's bulk editor with MAP metafields
- **Implementation**:

```typescript
function generateBulkEditUrl(selectedIds: string[], shopDomain: string) {
  const baseUrl = `https://${shopDomain}/admin/bulk`;
  const params = new URLSearchParams({
    resource_name: "ProductVariant",
    edit: [
      "price", // Shopify price (MAP)
      "metafields.mapguard.map", // MAP metafield
      "metafields.mapguard.final_price", // Final price
      "metafields.mapguard.enabled", // MAP enabled status
      "metafields.mapguard.message", // Custom message
    ].join(","),
  });

  if (selectedIds.length > 0) {
    params.append("ids", selectedIds.join(","));
  }

  return `${baseUrl}?${params.toString()}`;
}
```

#### **5.2 CSV Export/Import**

- **Export**: Download current MAP settings as CSV
- **Import**: Bulk upload MAP settings via CSV
- **Template**: Provide CSV template for easy bulk editing

### **6. Analytics & Monitoring**

#### **6.1 Dashboard**

- **Route**: `/app/dashboard`
- **Features**:
  - Setup status overview
  - Basic statistics
  - Quick action buttons

#### **6.2 Enhanced Analytics**

- **Metrics to Track**:
  - Total products with MAP enabled
  - Average discount amount applied
  - Revenue protected by MAP
  - Price compliance issues
  - Most common MAP messages

#### **6.3 Price Monitoring**

- **Features**:
  - Detect when Shopify prices change
  - Alert on MAP/price mismatches
  - Automatic price sync options
  - Price change history

### **7. Automation & Webhooks**

#### **7.1 Price Sync Webhooks**

- **Webhook**: Product price updates
- **Function**: Keep MAP metafields in sync with Shopify prices
- **Logic**:

```typescript
// When Shopify price changes:
if (newPrice !== oldPrice) {
  // Update MAP metafield to match new Shopify price
  updateMetafield("mapguard.map", newPrice);

  // Optionally adjust final price proportionally
  if (maintainDiscountRatio) {
    const discountRatio = (oldMapPrice - finalPrice) / oldMapPrice;
    const newFinalPrice = newPrice * (1 - discountRatio);
    updateMetafield("mapguard.final_price", newFinalPrice);
  }
}
```

#### **7.2 Inventory Webhooks**

- **Function**: Handle new products/variants
- **Features**:
  - Auto-enable MAP for new variants (optional)
  - Apply default MAP pricing rules
  - Notification system for new products

---

## 🛠️ **Implementation Phases**

### **Phase 1: Core Functionality**

1. **Discount function** - Fix build issues and implement automatic discounting
2. **Products management page** - Build main interface (`/app/products`)
3. **Admin block extensions** - Create product/variant page extensions

### **Phase 2: Enhanced Management**

4. **Bulk editing integration** - Connect to Shopify bulk editor
5. **Price validation system** - Ensure price consistency
6. **CSV export/import** - Bulk data management

### **Phase 3: Automation**

7. **Price sync webhooks** - Automatic price synchronization
8. **Enhanced analytics dashboard** - Advanced reporting
9. **Automated compliance monitoring** - Price monitoring system

---

## 🔧 **Technical Implementation Details**

### **GraphQL Queries Needed**

#### **Products with MAP Data**:

```graphql
query GetProductsWithMAP($first: Int!, $after: String, $query: String) {
  products(first: $first, after: $after, query: $query) {
    nodes {
      id
      title
      handle
      productType
      vendor
      status
      featuredImage {
        url
        altText
      }
      variants(first: 50) {
        nodes {
          id
          title
          sku
          price
          inventoryItem {
            tracked
          }
          metafields(namespace: "mapguard", first: 5) {
            nodes {
              key
              value
              type
            }
          }
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

#### **Metafield Updates**:

```graphql
mutation UpdateVariantMetafields($metafields: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafields) {
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
```

### **Database Models** (Already Built)

```typescript
// Prisma schema for tracking MAP-enabled variants
model Product {
  id               String   @id @default(uuid())
  shopifyVariantId String   @unique
  shopifyProductId String
  shop             String
  enabled          Boolean  @default(false)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

### **Component Architecture**

#### **Products Page Components**:

```tsx
// Main products page
<ProductsPage>
  <ProductsHeader />
  <ProductsFilters />
  <ProductsToolbar />
  <ProductsList />
  <ProductsPagination />
</ProductsPage>

// Individual components
<ProductCard product={product} />
<VariantRow variant={variant} />
<BulkActions selectedIds={selectedIds} />
<MapPriceEditor variant={variant} />
```

#### **Admin Block Components**:

```tsx
// Product admin block
<ProductMapOverview>
  <MapStatusSummary />
  <VariantMapList />
  <QuickActions />
</ProductMapOverview>

// Variant admin block
<VariantMapEditor>
  <PriceInputs />
  <MapToggle />
  <MessageEditor />
  <PreviewDisplay />
</VariantMapEditor>
```

---

## 🚀 **Development Workflow**

### **1. Start with Discount Function**

Fix the current build issues and get automatic discounting working.

### **2. Build Products Management**

Create the main interface for MAP management.

### **3. Add Admin Blocks**

Enable direct editing from product/variant pages.

### **4. Integrate Bulk Operations**

Connect to Shopify's bulk editor and add CSV support.

### **5. Enhance with Automation**

Add webhooks, monitoring, and advanced analytics.

---

## 📝 **User Stories**

### **Merchant Setup**:

1. "As a merchant, I want to set up MAP protection in under 5 minutes"
2. "I want to bulk-enable MAP on 100+ products quickly"
3. "I need to ensure my Shopify prices always match my MAP prices"

### **Daily Management**:

1. "I want to search for products and quickly see their MAP status"
2. "I need to edit MAP prices directly from product pages"
3. "I want to export MAP data for external analysis"

### **Customer Experience**:

1. "Customers see MAP prices on product pages with helpful messages"
2. "Discounts are automatically applied at checkout"
3. "The experience feels seamless and professional"

This comprehensive specification should give GitHub Copilot complete context to help you build all the remaining features of the MAP Guard app.
