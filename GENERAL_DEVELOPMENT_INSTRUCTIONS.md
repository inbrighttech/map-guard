# MAP Guard Development Workflow & Comprehensive Instructions

This guide provides a comprehensive, step-by-step workflow for developing and testing the MAP Guard Shopify app and its extensions. Each step includes **mandatory pause points** where you must test and confirm functionality before proceeding.

⚠️ **CRITICAL**: Complete each step fully and confirm it works before moving to the next step. This prevents accumulating bugs and ensures smooth development.

---

## � Project Context & Setup

### Business Logic Recap

- **Shopify Variant Price = MAP Price** (displayed on storefront)
- **Metafield final_price = Customer Price** (what customer actually pays)
- **Discount Function** automatically applies difference at checkout

### Required Metafield Definitions (namespace: `mapguard`)

- `mapguard.map` (money) - Minimum Advertised Price
- `mapguard.final_price` (money) - Actual customer price
- `mapguard.enabled` (boolean) - MAP protection status
- `mapguard.message` (single_line_text_field) - Custom message

---

## �🟢 STEP 1: Initial Setup & Testing

### 1.1. Install Dependencies & Database Setup

**Actions:**

```powershell
# Install all dependencies
npm install

# Setup Prisma database
npm run setup

# Verify database is created
npx prisma studio
```

**Expected Results:**

- No installation errors
- Database file created in `prisma/dev.db`
- Prisma Studio opens showing Session table

**⏸️ PAUSE CHECKPOINT**: Confirm all installations completed successfully and database is accessible. **Ask me to continue to Step 1.2.**

### 1.2. Test Local App Development

**Actions:**

```powershell
# Start development server
npm run dev
```

**Expected Results:**

- Development server starts without errors
- Browser opens to local tunnel URL
- Shopify app installation page appears
- Can install app in development store
- Basic routing works (dashboard loads)

**⏸️ PAUSE CHECKPOINT**: Confirm app runs locally, installs successfully, and basic routes work. **Ask me to continue to Step 1.3.**

### 1.3. Test Extension Deployment

**Actions:**

```powershell
# Deploy all extensions to test store
shopify app deploy
```

**Expected Results:**

- Extensions build without errors
- Extensions appear in Shopify admin (if applicable)
- Theme extension available in theme editor
- No deployment failures

**Testing Each Extension:**

- **Theme Extension**: Go to theme editor → Add section → Find "MAP Guard Message" block
- **Discount Function**: Check Functions section in Shopify admin, confirm function is registered
- **Admin Blocks**: Not yet built, skip for now

**⏸️ PAUSE CHECKPOINT**: Confirm all extensions deploy successfully and appear in appropriate Shopify admin sections. **Ask me to continue to Step 2.**

---

## 🟡 STEP 2: Build UI Pages (Visual Only - No Logic)

### 2.1. Create Setup Page UI

**Actions:**

- Create `/app/routes/app.setup.tsx` with Polaris components
- Add DataTable showing metafield status (mock data for now)
- Add "Create Missing Metafields" button (no functionality yet)
- Use proper Polaris badges, cards, and layout

**Visual Requirements:**

- Professional DataTable UI with status badges
- Clear success/error states
- Responsive design
- Accessible components

**⏸️ PAUSE CHECKPOINT**: Confirm setup page renders correctly with proper UI layout. **Ask me to continue to Step 2.2.**

### 2.2. Create Dashboard Page UI

**Actions:**

- Update `/app/routes/app.dashboard.tsx` or `app._index.tsx`
- Add overview cards for setup status
- Add quick action buttons
- Add basic statistics placeholders (mock data)

**⏸️ PAUSE CHECKPOINT**: Confirm dashboard renders with proper layout and mock data. **Ask me to continue to Step 2.3.**

### 2.3. Create Settings Page UI

**Actions:**

- Create `/app/routes/app.settings.tsx`
- Add message configuration form
- Add styling options (colors, fonts, alignment)
- Add preview component
- Use Polaris form components

**⏸️ PAUSE CHECKPOINT**: Confirm settings page renders with complete form UI. **Ask me to continue to Step 2.4.**

### 2.4. Create Products Management Page UI

**Actions:**

- Create `/app/routes/app.products.tsx`
- Add search and filter components
- Add products DataTable (mock data)
- Add bulk action buttons
- Add pagination component

**Visual Requirements:**

- Search by title, handle, SKU
- Filters for MAP status, price status, product type
- Product/variant view toggle
- Bulk selection checkboxes
- Professional table layout

**⏸️ PAUSE CHECKPOINT**: Confirm products page renders with complete UI and mock data. **Ask me to continue to Step 3.**

---

## 🟡 STEP 3: Scaffold & Test Admin Block Extensions

### 3.1. Create Product Admin Block

**Actions:**

```powershell
# Generate product admin block extension
shopify app generate extension --type=admin_block --name=product-admin-block
```

**Configuration:**

- Target: `admin.product-details.action.render`
- Create basic UI showing MAP overview for all variants
- Use mock data for now

**⏸️ PAUSE CHECKPOINT**: Confirm product admin block generates and appears on product pages in admin. **Ask me to continue to Step 3.2.**

### 3.2. Create Variant Admin Block

**Actions:**

```powershell
# Generate variant admin block extension
shopify app generate extension --type=admin_block --name=variant-admin-block
```

**Configuration:**

- Target: `admin.product-variant-details.action.render`
- Create UI for editing MAP settings
- Use mock data for now

**⏸️ PAUSE CHECKPOINT**: Confirm variant admin block generates and appears on variant pages in admin. **Ask me to continue to Step 4.**

---

## 🟡 STEP 4: Implement Setup Page Logic

### 4.1. Add Metafield Creation Logic

**Actions:**

- Implement GraphQL mutations to create metafield definitions
- Add error handling and user feedback
- Add status validation (detect existing vs missing metafields)
- Test with real Shopify API calls

**Required GraphQL:**

```graphql
mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
  metafieldDefinitionCreate(definition: $definition) {
    createdDefinition {
      id
      name
      key
      namespace
      type {
        name
      }
    }
    userErrors {
      field
      message
    }
  }
}
```

**⏸️ PAUSE CHECKPOINT**: Test setup page thoroughly. Confirm it creates metafield definitions and handles errors properly. **Ask me to continue to Step 5.**

---

## 🟡 STEP 5: Incremental Feature Development

### 5.1. Add Logic One Feature at a Time

**Actions (in order):**

1. **Discount Function**: Implement automatic discounting at checkout.
2. **Products Page**: Add search, filtering, bulk editing, and variant-level MAP management.
3. **Admin Blocks**: Enable direct editing from product/variant admin pages.
4. **Bulk Editor Integration**: Generate URLs for Shopify bulk editor with MAP metafields.
5. **Automation**: Add webhooks for price sync, inventory changes, and compliance monitoring.

### 5.2. Test After Each Feature

**Actions:**

- Test new logic in local and test stores.
- Use GraphQL queries/mutations to verify data flow.
- Check for build/runtime errors and fix immediately.

**⏸️ PAUSE**: After EACH feature above, confirm it works before moving to the next. Ask me to continue to the next feature.

### 5.3. Commit & Branching Strategy

**Actions:**

- Use feature branches for new functionality (`feature/[name]`).
- Commit after every major milestone (UI, logic, bugfix).
- Use clear commit messages (feat, fix, refactor, docs).

---

## 🟢 STEP 6: Testing & Deployment Pipeline

### 6.1. Local Testing

**Commands:**

- Use `npm run dev` for app development.
- Use `shopify app deploy` for extension testing.
- Use `npm run setup` and `npx prisma studio` for database operations.

### 6.2. Staging & Production

**Actions:**

- Test in a staging Shopify store before production.
- Deploy to Shopify App Store when ready.

**⏸️ PAUSE**: After each deployment, confirm everything works in staging before production.

---

## 🟢 STEP 7: Documentation & Updates

**Actions:**

- Update `README.md` for installation and setup instructions.
- Update `PROJECT_SUMMARY.md` for business logic and current status.
- Update `CHANGELOG.md` for version history and feature additions.

**⏸️ PAUSE**: Confirm documentation is updated and accurate.

---

## 🔧 Code Quality & Best Practices

- Use TypeScript strict mode.
- Implement proper error handling and user-friendly messages.
- Ensure responsive design and accessibility (Shopify guidelines).
- Optimize for performance with large product catalogs.
- Keep commits small and focused.
- Test frequently to avoid accumulating bugs.
- Document changes and update instructions as needed.

---

## 🎯 User Stories & Experience

- Merchants can set up MAP protection in under 5 minutes.
- Bulk-enable MAP on 100+ products quickly.
- Ensure Shopify prices always match MAP prices.
- Search for products and quickly see MAP status.
- Edit MAP prices directly from product/variant pages.
- Export MAP data for external analysis.
- Customers see MAP prices and messages on product pages.
- Discounts are automatically applied at checkout.
- The experience is seamless and professional.

---

## ⚡ Quick Reference: Common Commands

- `npm install` — Install dependencies
- `npm run dev` — Start development server
- `shopify app deploy` — Build/deploy extensions
- `npm run setup` — Migrate database
- `npx prisma studio` — View database
- `npx prisma migrate reset` — Reset database

---

## 🚨 IMPORTANT TESTING STRATEGY

**After EACH step above:**

1. Test locally first
2. Deploy to test store
3. Verify functionality works as expected
4. Fix any issues immediately
5. Ask me to continue to the next step

This ensures we catch problems early and don't accumulate bugs!

---

This workflow ensures a smooth, testable development process and helps you meet Shopify's build for Shopify badge requirements. Follow each step in order, test frequently, and document your progress for best results.
