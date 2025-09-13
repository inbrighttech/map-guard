# MAP Guard Extension Files - Complete Manifest

## Directory Structure
```
MAP_GUARD_EXPORT/
├── SETUP_INSTRUCTIONS.md          # Main setup guide
├── AI_ASSISTANT_CHECKLIST.md      # Quick start checklist
├── FILE_MANIFEST.md               # This file
├── package.json                   # Main app package.json
├── shopify.app.toml              # Main app configuration
├── shopify.web.toml              # Web app configuration
├── vite.config.ts                # Vite build configuration
├── tsconfig.json                 # TypeScript configuration
├── env.d.ts                      # Environment type definitions
├── app/                          # Main application code
│   ├── db.server.ts              # Database server configuration
│   ├── entry.server.tsx          # Server entry point
│   ├── globals.d.ts              # Global type definitions
│   ├── root.tsx                  # Root component
│   ├── routes.ts                 # Route definitions
│   ├── shopify.server.ts         # Shopify server configuration
│   ├── hooks/
│   │   └── useBilling.ts         # Billing React hook
│   ├── routes/                   # All route components
│   │   ├── app._index.tsx        # Main dashboard
│   │   ├── app.additional.tsx    # Additional features page
│   │   ├── app.dashboard.tsx     # Analytics dashboard
│   │   ├── app.settings.tsx     # Settings page
│   │   ├── app.setup.tsx        # Initial setup page
│   │   ├── app.tsx              # App layout
│   │   ├── auth.$.tsx           # Auth handler
│   │   ├── webhooks.*.tsx       # Webhook handlers
│   │   ├── auth.login/          # Login routes
│   │   └── _index/              # Landing page
│   └── utils/
│       └── billing.server.ts    # Server-side billing utilities
├── prisma/                      # Database schema and migrations
│   ├── schema.prisma           # Database schema
│   ├── dev.sqlite              # Development database
│   └── migrations/             # Database migrations
│       ├── migration_lock.toml
│       ├── 20240530213853_create_session_table/
│       ├── 20250818200819_create_map_billing_models/
│       └── 20250818203830_update_product_model_for_variants/
└── extensions/
    ├── apply-discount/
    │   ├── README.md
    │   ├── .gitignore
    │   ├── package.json
    │   ├── schema.graphql
    │   ├── shopify.extension.toml
    │   ├── vite.config.js
    │   ├── dist/
    │   │   ├── function.js
    │   │   └── function.wasm
    │   ├── generated/
    │   │   └── api.ts
    │   ├── locales/
    │   │   └── en.default.json
    │   └── src/
    │       ├── index.ts
    │       ├── run.graphql
    │       ├── run.test.ts
    │       └── run.ts
    ├── map-discount-function/
    │   ├── README.md
    │   ├── package.json
    │   ├── schema.graphql
    │   ├── shopify.function.extension.toml
    │   ├── tsconfig.json
    │   └── src/
    │       ├── main.ts
    │       └── run.graphql
    ├── map-guard-display/
    │   ├── README.md
    │   ├── shopify.extension.toml
    │   ├── blocks/
    │   │   ├── map-message.liquid
    │   │   └── map-message.schema.json
    │   └── locales/
    │       └── en.default.json
    └── map-message-display/
        ├── README.md
        ├── shopify.extension.toml
        ├── assets/
        │   └── map-guard-icon.svg
        ├── blocks/
        │   └── map-message.liquid
        ├── locales/
        │   └── en.default.json
        └── snippets/
            └── stars.liquid
```

## File Descriptions

### Configuration Files
- **shopify.app.toml**: Main app configuration with organization and app details
- **package.json**: Root package.json with app dependencies

### Function Extensions
#### apply-discount (Working)
- Complete discount function with MAP logic
- Includes built files and generated types
- Ready for deployment

#### map-discount-function (New)  
- Additional MAP discount function
- Custom implementation for specific MAP scenarios
- Requires building after setup

### Theme Extensions
#### map-guard-display (New)
- Simple MAP message display block
- Configurable through theme editor
- Basic MAP messaging functionality

#### map-message-display (Working)
- Advanced MAP message handling
- Complex logic for various MAP scenarios
- Includes assets and snippets

## Setup Priority Order
1. **apply-discount** - Core functionality, deploy first
2. **map-message-display** - Working theme extension
3. **map-discount-function** - Additional functionality  
4. **map-guard-display** - Supplementary display

## Important Notes
- All UIDs in configuration files should be regenerated for new app
- Function extensions require npm install and build
- Theme extensions work immediately after file copy
- Test each extension individually before full deployment

## Metafield Dependencies
All extensions rely on these ProductVariant metafields:
- `mapguard.enabled` or `mapguard.map_enabled`
- `mapguard.final_price`  
- `mapguard.display`
- `mapguard.custom_message`

Ensure these are configured in Shopify admin before testing.
