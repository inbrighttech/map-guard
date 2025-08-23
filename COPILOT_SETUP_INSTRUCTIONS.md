# MAP Guard - Complete Setup Instructions for GitHub Copilot

## Project Overview

**MAP Guard** is a Shopify App that enforces Minimum Advertised Pricing (MAP) policies. It prevents products from displaying prices below their MAP threshold on the storefront while allowing customers to see the actual (lower) price during checkout.

### Core Functionality

- **Metafield System**: Stores MAP data (map price, final price, enabled status) at the variant level
- **Theme Extension**: Displays MAP messages on product pages ("Add to cart for lower price")
- **Discount Function**: Automatically applies discounts at checkout to enforce MAP pricing
- **Admin Interface**: Allows merchants to manage MAP settings across products and variants
- **Bulk Editor Integration**: Mass edit MAP settings via Shopify's bulk editor

## Project Structure

```
MAPGUARD/
├── app/                           # Remix app (Admin interface)
│   ├── routes/
│   │   ├── app._index.tsx        # Main dashboard
│   │   ├── app.setup.tsx         # Setup metafield definitions
│   │   ├── app.dashboard.tsx     # Overview and stats
│   │   ├── app.settings.tsx      # Message configuration
│   │   └── app.products.tsx      # Product/variant management (TO BUILD)
│   ├── utils/
│   │   └── billing.server.ts     # Billing utilities
│   └── hooks/
│       └── useBilling.ts         # Billing frontend logic
├── extensions/
│   ├── map-message-display/      # Theme extension (WORKING)
│   │   ├── blocks/
│   │   │   └── map-message.liquid # Theme block for MAP messages
│   │   └── shopify.extension.toml
│   └── apply-discount/           # Discount function (IN PROGRESS)
│       ├── src/
│       │   ├── cart_lines_discounts_generate_run.ts  # MAP discount logic
│       │   └── cart_lines_discounts_generate_run.graphql # Query metafields
│       └── shopify.extension.toml
├── prisma/
│   └── schema.prisma             # Database schema
└── package.json                  # Root dependencies
```

## Required Components

### Core Pages

1. **Metafield Setup Page** (`app.setup.tsx`) - Creates required metafield definitions
2. **Theme Extension** (`map-message-display`) - Displays MAP messages on storefront
3. **Dashboard** (`app.dashboard.tsx`) - Overview and setup status
4. **Settings Page** (`app.settings.tsx`) - Message configuration
5. **Database Schema** - Models for tracking MAP variants

### Functional Extensions

1. **Discount Function** (`apply-discount`) - Automatic MAP discount application
2. **Products Management Page** (`app.products.tsx`) - Search, filter, edit MAP settings
3. **Admin Block Extensions** - Product and variant page extensions
4. **Bulk Editor Integration** - Redirect to Shopify bulk editor with MAP metafields

## Required Metafield Definitions

The app creates these metafield definitions (namespace: `mapguard`, scope: `PRODUCT_VARIANT`):

```json
{
  "mapguard.map": {
    "type": "money",
    "name": "Minimum Advertised Price",
    "description": "Minimum Advertised Price (MAP) for this variant"
  },
  "mapguard.final_price": {
    "type": "money",
    "name": "Final Price",
    "description": "Actual price customer pays (lower than MAP)"
  },
  "mapguard.enabled": {
    "type": "boolean",
    "name": "MAP Enabled",
    "description": "Whether MAP protection is enabled for this variant"
  },
  "mapguard.message": {
    "type": "single_line_text_field",
    "name": "Custom MAP Message",
    "description": "Custom message to display for this variant (optional)"
  }
}
```

## Setup Process (User Journey)

### Step 1: Initial Setup

- **Route**: `/app/setup`
- **Function**: Creates metafield definitions
- **Action**: User clicks "Create Missing Metafields" button

### Step 2: Configure Messages

- **Route**: `/app/settings`
- **Function**: Set default MAP message and styling
- **Action**: User customizes message text, colors, styling

### Step 3: Enable Theme Block

- **Extension**: `map-message-display`
- **Function**: Display MAP messages on product pages
- **Action**: User adds "MAP Guard Message" block in theme editor

### Step 4: Enable Admin Blocks

- **Extensions**: Product and variant admin blocks
- **Function**: Allow MAP editing directly on product/variant pages
- **Action**: User enables admin blocks in app settings

### Step 5: Manage Products

- **Route**: `/app/products`
- **Function**: Search, filter, and edit MAP settings
- **Features Needed**:
  - Product search with filters
  - Variant-level MAP settings
  - Single product editing
  - Bulk selection for mass editing

### Step 6: Bulk Editing

- **Function**: Redirect to Shopify bulk editor with MAP metafields
- **URL Format**: `/admin/bulk?resource_name=ProductVariant&edit=metafields.mapguard.map,metafields.mapguard.final_price,metafields.mapguard.enabled`

## Pages to Build

### 1. Products Management Page (`app.products.tsx`)

**Purpose**: Main interface for managing MAP settings across all products/variants

**Features Needed**:

```tsx
interface ProductsPageFeatures {
  search: {
    byTitle: string;
    byHandle: string;
    bySKU: string;
  };
  filters: {
    mapEnabled: boolean;
    hasMapPrice: boolean;
    productType: string;
    vendor: string;
    availability: "available" | "unavailable" | "all";
  };
  display: {
    view: "products" | "variants";
    pagination: true;
    bulkSelection: true;
  };
  actions: {
    editSingle: "Navigate to product/variant page";
    bulkEdit: "Redirect to Shopify bulk editor";
    enableMAP: "Bulk enable MAP protection";
    disableMAP: "Bulk disable MAP protection";
  };
}
```

**GraphQL Queries Needed**:

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
      variants(first: 10) {
        nodes {
          id
          title
          sku
          price
          metafields(namespace: "mapguard", first: 10) {
            nodes {
              key
              value
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

### 2. Admin Block Extensions

**Product Admin Block** (`extensions/product-admin-block/`):

- Display on product pages in admin
- Show MAP settings for all variants
- Allow quick enable/disable

**Variant Admin Block** (`extensions/variant-admin-block/`):

- Display on variant pages in admin
- Edit MAP price, final price, custom message
- Toggle MAP protection

**Configuration**:

```toml
# extensions/product-admin-block/shopify.extension.toml
api_version = "2025-04"

[[extensions]]
name = "MAP Guard - Product Settings"
handle = "map-guard-product-admin"
type = "admin_action"

  [[extensions.targeting]]
  target = "admin.product-details.action.render"
```

### 3. Bulk Editor Integration

**Function**: Create URLs that open Shopify's bulk editor with MAP metafields pre-selected

**Implementation**:

```tsx
// In app.products.tsx
const bulkEditUrl = (selectedVariantIds: string[]) => {
  const baseUrl = `https://${shopDomain}/admin/bulk`;
  const params = new URLSearchParams({
    resource_name: "ProductVariant",
    edit: [
      "metafields.mapguard.map",
      "metafields.mapguard.final_price",
      "metafields.mapguard.enabled",
      "metafields.mapguard.message",
    ].join(","),
  });

  if (selectedVariantIds.length > 0) {
    params.append("ids", selectedVariantIds.join(","));
  }

  return `${baseUrl}?${params.toString()}`;
};
```

## Development Commands

```bash
# Start development server
npm run dev

# Build all extensions
shopify app deploy

# Build specific extension
cd extensions/apply-discount
npm run build

# Database operations
npm run setup                # Migrate database
npx prisma studio           # View database
npx prisma migrate reset    # Reset database
```

## Key Files for Copilot to Understand

1. **`app/routes/app.setup.tsx`** - Metafield setup logic
2. **`app/routes/app.dashboard.tsx`** - Main dashboard
3. **`extensions/map-message-display/blocks/map-message.liquid`** - Theme block
4. **`extensions/apply-discount/src/cart_lines_discounts_generate_run.ts`** - Discount logic
5. **`prisma/schema.prisma`** - Database models
6. **`PROJECT_SUMMARY.md`** - Business logic and billing

## Development Phases

1. **Discount function** - Automatic MAP discount application
2. **Products page** - Main management interface
3. **Admin blocks** - Product/variant page extensions
4. **Bulk editor integration** - Mass editing functionality
5. **Advanced filtering** - Search and filtering capabilities
6. **Testing and refinement** - End-to-end MAP enforcement testing

This provides GitHub Copilot with a complete understanding of the MAP Guard project structure and development requirements.
