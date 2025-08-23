# MAP Guard - Project Summary

## Project Overview

**MAP Guard** is a Shopify App that enforces Minimum Advertised Pricing (MAP) policies for merchants. The app prevents products from displaying prices below their MAP threshold on the storefront while allowing customers to see the actual (lower) price during checkout.

### Business Logic

- **Shopify Variant Price = MAP Price** (what shows on storefront)
- **Metafield final_price = Customer Price** (what they actually pay)
- **Discount Function** = MAP Price - Final Price (applied at checkout)

### Example Flow

- **Product Page**: Shows $99.99 (MAP price) with "Add to cart for lower price" message
- **Cart/Checkout**: Customer sees $99.99 → $79.99 (automatic discount applied)
- **Customer Pays**: $79.99 (final price)

---

## Core Architecture

### Metafield System (Variant-Level Storage)

```json
{
  "mapguard.map": "$99.99", // MAP price (matches Shopify price)
  "mapguard.final_price": "$79.99", // Actual price customer pays
  "mapguard.enabled": true, // MAP protection enabled
  "mapguard.message": "Call for price" // Custom message (optional)
}
```

### Extensions

1. **Theme Extension** (`map-message-display`): Displays MAP messages on product pages
2. **Discount Function** (`apply-discount`): Automatically applies discounts at checkout
3. **Product Admin Block**: MAP settings on product admin pages
4. **Variant Admin Block**: MAP settings on variant admin pages

### Pages & Routes

- `/app/setup` - Metafield creation and validation
- `/app/dashboard` - Overview, setup status, quick actions
- `/app/settings` - Configure MAP message, styling, preview
- `/app/products` - Search, filter, edit MAP settings

---

## Current Status

### ✅ Completed

- Basic Shopify app scaffolding
- Theme extension structure
- Discount function structure
- Database schema (Prisma)
- Basic routing setup

### 🔄 In Progress

- Fixing discount function build issues
- Setting up metafield definitions

### 📋 To Build

1. **Setup Page Logic** - Metafield creation and validation
2. **Products Management Page** - Main interface for MAP management
3. **Admin Block Extensions** - Product/variant page extensions
4. **Bulk Editor Integration** - Mass editing functionality
5. **Automation** - Webhooks for price sync and monitoring

---

## Implementation Phases

### Phase 1: Core Functionality

1. Fix discount function build issues
2. Implement setup page with metafield creation
3. Build products management page
4. Create admin block extensions

### Phase 2: Enhanced Management

1. Bulk editing integration with Shopify bulk editor
2. Price validation system
3. CSV export/import functionality

### Phase 3: Automation

1. Price sync webhooks
2. Enhanced analytics dashboard
3. Automated compliance monitoring

---

## Technical Stack

- **Framework**: Remix + TypeScript
- **Database**: SQLite + Prisma
- **UI**: Shopify Polaris
- **Extensions**: Shopify Functions + Theme Blocks
- **APIs**: Shopify Admin GraphQL API

---

## Development Commands

```bash
# App Development
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production

# Database
npm run setup        # Migrate database
npx prisma studio    # View database
npx prisma migrate reset  # Reset database

# Extensions
shopify app deploy   # Build/deploy all extensions
```

---

## User Journey

1. **Install App** → OAuth and permissions
2. **Setup Metafields** → `/app/setup` creates required metafield definitions
3. **Configure Messages** → `/app/settings` customize MAP messages and styling
4. **Enable Theme Block** → Add MAP message block to product pages
5. **Manage Products** → `/app/products` search, filter, and edit MAP settings
6. **Bulk Operations** → Mass edit via Shopify bulk editor integration

---

## Key Files

### App Routes

- `app/routes/app._index.tsx` - Main dashboard
- `app/routes/app.setup.tsx` - Metafield setup
- `app/routes/app.products.tsx` - Products management (TO BUILD)
- `app/routes/app.settings.tsx` - Message configuration

### Extensions

- `extensions/map-message-display/blocks/map-message.liquid` - Theme block
- `extensions/apply-discount/src/cart_lines_discounts_generate_run.ts` - Discount logic
- `extensions/product-admin-block/` - Product admin extension (TO BUILD)
- `extensions/variant-admin-block/` - Variant admin extension (TO BUILD)

### Core Files

- `app/shopify.server.ts` - Shopify app configuration
- `prisma/schema.prisma` - Database models
- `app/db.server.ts` - Database connection

---

## Next Immediate Steps

1. Test scaffolded app locally (`npm run dev`)
2. Fix any build errors in discount function
3. Implement setup page metafield creation logic
4. Test extension deployment (`shopify app deploy`)
5. Build products management page UI (no logic first)

This project summary provides a complete overview of the MAP Guard app's business logic, technical architecture, and development roadmap.
