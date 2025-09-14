# MAP Guard - AI-Optimized Project Summary

## PROJECT_METADATA
- **Project Name**: MAP Guard
- **Type**: Shopify App
- **Framework**: Remix + TypeScript
- **Database**: SQLite + Prisma
- **UI Library**: Shopify Polaris
- **Repository**: inbrighttech/MAPGUARD
- **Status**: Foundation Complete - Simplified Billing
- **Last Updated**: 2025-08-18

## BUSINESS_LOGIC
### Purpose
Implement Minimum Advertised Pricing (MAP) protection for Shopify stores with transparent fixed-tier billing. MAP protection is applied at the variant level for granular pricing control.

### Billing Strategy - SIMPLIFIED MODEL
- **Model**: Fixed monthly pricing per tier (no overages)
- **Tracking Method**: Enabled variants count for plan compliance
- **Philosophy**: Transparent, predictable pricing
- **Payment**: Fixed monthly subscription fees

### Pricing Tiers - SIMPLIFIED
```json
{
  "FREE": { "monthlyPrice": 0.00, "maxVariants": 1 },
  "STARTER": { "monthlyPrice": 9.99, "maxVariants": 50 },
  "PROFESSIONAL": { "monthlyPrice": 29.99, "maxVariants": 200 },
  "ENTERPRISE": { "monthlyPrice": 99.99, "maxVariants": 1000 }
}
```

## DATABASE_SCHEMA
### Models Implemented
1. **Product** - MAP-enabled variant tracking (updated for variants)
2. **Subscription** - Billing plan management  
3. **BillingPeriod** - Monthly usage tracking (simplified)

### Product Model - VARIANT-FOCUSED
```typescript
interface Product {
  id: string; // UUID primary key
  shopifyVariantId: string; // Unique Shopify variant ID (NEW)
  shopifyProductId: string; // Parent product ID (indexed)
  shop: string; // Shop domain (indexed)
  enabled: boolean; // MAP protection enabled (default: false)
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

### Subscription Model - SIMPLIFIED
```typescript
interface Subscription {
  id: string; // UUID primary key
  shop: string; // Unique shop identifier
  shopifyChargeId?: string; // Shopify billing charge ID
  planName: "FREE" | "STARTER" | "PROFESSIONAL" | "ENTERPRISE";
  status: "active" | "cancelled" | "expired" | "trial";
  currentPeriodStart: DateTime;
  currentPeriodEnd: DateTime;
  trialEndsAt?: DateTime;
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

### BillingPeriod Model - FIXED PRICING
```typescript
interface BillingPeriod {
  id: string; // UUID primary key
  shop: string; // Shop domain (indexed)
  subscriptionId: string; // Foreign key to Subscription
  periodStart: DateTime;
  periodEnd: DateTime;
  maxEnabledProducts: number; // Peak usage during period (for compliance)
  baseAmount: Decimal; // Fixed monthly fee
  overageAmount: Decimal; // Always 0 (simplified model)
  totalAmount: Decimal; // Same as baseAmount
  processed: boolean; // Billing processed flag (default: false)
}
```

### Database Indexes
```sql
-- Product indexes
CREATE INDEX idx_product_shop ON Product(shop);
CREATE INDEX idx_product_parent ON Product(shopifyProductId);
CREATE INDEX idx_product_variant ON Product(shopifyVariantId);

-- BillingPeriod indexes  
CREATE INDEX idx_billing_shop ON BillingPeriod(shop);
CREATE INDEX idx_billing_period ON BillingPeriod(shop, periodStart, periodEnd);
```

## METAFIELD_DEFINITIONS
### Namespace Configuration
- **Value**: "mapguard"
- **Scope**: `PRODUCT_VARIANT` (variant-level metafields)
- **Purpose**: Store MAP pricing data at variant level

### Required Metafield Schema
```json
{
  "mapguard.map_price": {
    "type": "money",
    "name": "Minimum Advertised Price",
    "description": "Minimum Advertised Price (MAP) for this variant",
    "scope": "PRODUCT_VARIANT"
  }
}
```

### Setup System Features
- **Automated Creation**: One-click metafield definition setup
- **Status Validation**: Check existing vs required metafields
- **Error Handling**: Detailed field-specific error messages
- **Professional UI**: DataTable with status badges

## SIMPLIFIED_BILLING_SYSTEM
### Server-Side Components
- **File**: `app/utils/billing.server.ts`
- **Key Functions**: 
  - `getBillingAmount(planName): BillingInfo` - Returns fixed pricing
  - `getCurrentBillingPeriod(shop, subscriptionId)` - Get/create billing period
  - `trackPeakUsage(shop, enabledVariants)` - Track for compliance only
  - `getCurrentUsage(shop)` - Current usage statistics

### Client-Side Components  
- **File**: `app/hooks/useBilling.ts`
- **Main Hook**: `useBilling(billingData)` - Billing calculations and state
- **Features**:
  - Fixed monthly pricing calculations
  - Plan limit compliance checking
  - Usage percentage tracking
  - Plan comparison utilities

### Billing Calculation Logic - SIMPLIFIED
```typescript
// Fixed pricing - no complex calculations
export function getBillingAmount(planName: PlanName): BillingInfo {
  return PRICING_TIERS[planName]; // Just return fixed price
}

// Track usage for plan compliance only
export async function trackPeakUsage(shop: string, enabledVariants: number): Promise<void> {
  // 1. Get subscription and billing period
  // 2. Update max usage if current > existing  
  // 3. Set totalAmount to fixed monthly price
  // 4. No overage calculations
}
```

## FILE_STRUCTURE
### Core Implementation Files
```
├── prisma/
│   ├── schema.prisma (Database models + indexes)
│   └── migrations/
│       ├── 20250818200819_create_map_billing_models/
│       └── 20250818203830_update_product_model_for_variants/
├── app/
│   ├── utils/billing.server.ts (Simplified server-side billing)
│   ├── hooks/useBilling.ts (React billing hooks - simplified)
│   ├── routes/
│   │   ├── app.setup.tsx (Variant metafield setup page)
│   │   ├── app.tsx (Navigation with setup link)
│   │   └── webhooks.subscriptions.update.tsx (Billing webhooks)
│   └── shopify.server.ts (Usage tracking integration)
├── shopify.app.toml (App config - simplified scopes)
└── README.md (Comprehensive project documentation)
```

## SHOPIFY_CONFIGURATION
### Access Scopes Required - SIMPLIFIED
```toml
scopes = "write_products"
# Removed: read_own_subscription_contracts (caused deployment issues)
```

### Webhook Subscriptions
```toml
[[webhooks.subscriptions]]
topics = ["app_subscriptions/update"]
uri = "/webhooks/subscriptions/update"
```

## SETUP_SYSTEM
### Setup Page Features
- **Route**: `/app/setup`
- **File**: `app/routes/app.setup.tsx`
- **Purpose**: Automated variant-level metafield creation

### Setup Process Flow
1. Check existing variant metafield definitions
2. Display status table for required metafields
3. Create missing metafields via GraphQL mutations
4. Show success feedback with creation counts
5. Enable variant-level MAP pricing configuration

### UI Components
- DataTable with status indicators
- Creation button with loading states
- Success/error toast notifications
- Professional Polaris styling

## TECHNICAL_ARCHITECTURE
### Simplified Billing Benefits
```json
{
  "deployment": {
    "benefit": "No complex billing scopes required",
    "impact": "Easier Shopify app store approval"
  },
  "maintenance": {
    "benefit": "Fixed pricing is simpler to manage",
    "impact": "Reduced complexity and bugs"
  },
  "user_experience": {
    "benefit": "Predictable monthly costs",
    "impact": "Better merchant satisfaction"
  },
  "calculations": {
    "benefit": "No peak usage billing complexity",
    "impact": "Faster billing operations"
  }
}
```

### Database Optimization
- Indexed shop and variant fields for fast queries
- Composite indexes for billing period queries
- UUID primary keys for scalability
- Variant-level tracking for granular control

## IMPLEMENTATION_STATUS
### ✅ Completed Features
- [x] Simplified fixed-tier billing system
- [x] Variant-level database schema
- [x] Automated metafield setup page
- [x] Navigation integration
- [x] TypeScript compilation success
- [x] Build process working
- [x] Professional UI with Polaris components
- [x] Usage tracking for plan compliance

### 🔄 Next Implementation Phase
- [ ] Product management interface for MAP configuration
- [ ] Variant-level MAP price setting UI
- [ ] Billing dashboard with usage visualization
- [ ] Storefront price override logic
- [ ] Subscription management pages
- [ ] Analytics and reporting features

## ERROR_HANDLING_STRATEGY
### Simplified Error Handling
- **Billing Operations**: Log errors, continue with defaults
- **Usage Tracking**: Non-blocking with graceful degradation
- **Metafield Creation**: Individual field error tracking
- **GraphQL Operations**: Detailed error messages with retry logic

### Deployment Simplification
- Removed complex billing scope requirements
- Fixed pricing avoids overage calculation errors
- Simplified webhook handling
- Reduced API surface area

## PERFORMANCE_CONSIDERATIONS
### Optimizations Applied
```json
{
  "database": {
    "indexes": "Optimized for shop + variant queries",
    "relations": "Minimal joins for billing calculations"
  },
  "billing": {
    "calculations": "Simple fixed pricing lookup",
    "caching": "Reduced need for complex caching"
  },
  "metafields": {
    "scope": "Variant-level for granular control",
    "creation": "Batch operations for setup efficiency"
  }
}
```

## DEVELOPMENT_WORKFLOW
### Required Commands
```bash
# Database operations
npx prisma migrate dev              # Apply database migrations
npx prisma generate                 # Generate Prisma client

# Development (Always use Shopify CLI)
shopify app dev                     # Start development server
shopify app deploy                  # Deploy to Shopify

# Build verification
npm run build                       # Verify TypeScript compilation
```

### Key Files Modified for Simplification
1. **`app/utils/billing.server.ts`** - Removed overage calculations
2. **`app/hooks/useBilling.ts`** - Simplified client-side billing
3. **`prisma/schema.prisma`** - Added variant tracking
4. **`app/routes/app.setup.tsx`** - Variant-focused metafield setup

## DEPLOYMENT_READINESS
### ✅ Simplified for Deployment
- **No complex billing scopes** - Avoids Shopify approval issues
- **Fixed pricing model** - Transparent and predictable
- **TypeScript compilation** - All errors resolved
- **Build process** - Successfully completes
- **Variant-level control** - Granular MAP pricing management

### 🎯 Business Value
- **Transparent billing** - Fixed monthly prices per tier
- **Variant-level MAP** - Precise pricing control
- **Easy setup** - Automated metafield creation
- **Shopify native** - Professional UI with Polaris
- **Scalable architecture** - Ready for feature expansion

---

**AI_PARSING_METADATA**
- Structure: Hierarchical with clear sections for AI parsing
- Update_Type: Simplified billing model implementation
- Key_Changes: Fixed pricing, variant-level tracking, simplified architecture
- Status: Foundation complete, ready for feature expansion
- AI_Optimized: Yes - structured for machine understanding and context preservation
