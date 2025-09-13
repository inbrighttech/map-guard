# Map Discount Function Extension - File Documentation

## Purpose
Additional MAP discount function with specialized logic for MAP pricing enforcement.

## Key Files

### `src/main.ts`
- MAP-specific discount logic
- Handles variant-level MAP pricing
- Calculates discounts based on MAP metafields

### `src/run.graphql`
- GraphQL query for cart and product data
- Focuses on MAP-specific metafields

### `package.json`
- Function dependencies and build configuration
- Includes TypeScript and GraphQL codegen

### `shopify.function.extension.toml`
- Function configuration with unique UID
- Targeting: `purchase.product-discount.run`
- Build command: `npm run build`

### `schema.graphql`
- Shopify Functions API schema (copied from apply-discount)

## Setup Instructions

1. Generate function extension: `shopify app generate extension --type=function --name=map-discount-function --template=product-discount`
2. Replace generated files with these implementations
3. Run `npm install` in extension directory
4. Build with `npm run build`

## Metafields Used
- `mapguard.enabled` - Boolean for MAP activation
- `mapguard.final_price` - Target price for calculations
