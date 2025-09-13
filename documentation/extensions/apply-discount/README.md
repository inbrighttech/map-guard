# Apply Discount Extension - File Documentation

## Purpose
Main discount function that handles MAP (Minimum Advertised Pricing) product discounts.

## Key Files

### `src/run.ts`
- Main discount logic
- Processes cart items and applies MAP-based discounts
- Handles metafield data for MAP settings

### `src/run.graphql` 
- GraphQL query to fetch cart data and metafields
- Queries product variants and MAP-specific metafields

### `package.json`
- Dependencies for function development
- Build scripts and codegen configuration

### `shopify.extension.toml`
- Extension configuration
- Targeting: `purchase.product-discount.run`
- Build settings and UI paths

### `schema.graphql`
- Complete Shopify Functions API schema
- Required for TypeScript code generation

## Usage Instructions

1. CLI will generate basic structure
2. Replace generated files with these custom implementations
3. Run `npm install` in extension directory
4. Deploy with `shopify app deploy`

## Metafields Used
- `mapguard.map_enabled` - Boolean to enable MAP
- `mapguard.final_price` - Target price for discount calculation
