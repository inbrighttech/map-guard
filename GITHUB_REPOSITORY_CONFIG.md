# GitHub Repository Configuration for MAP Guard

## Repository Information

- **Repository Name**: MAPGUARD
- **Owner**: inbrighttech
- **Full Repository Path**: `inbrighttech/MAPGUARD`
- **Current Branch**: main
- **Repository URL**: https://github.com/inbrighttech/MAPGUARD

## Development Instructions for GitHub Copilot

### Project Overwrite Policy

**IMPORTANT**: This project is being rebuilt from scratch. When developing new features:

1. **Overwrite existing files** when implementing new functionality
2. **Replace current implementations** with improved versions
3. **Don't preserve legacy code** that doesn't meet specifications
4. **Start fresh** with clean, modern implementations

### Repository Sync Guidelines

#### When to Commit:

- After completing each major feature (discount function, products page, admin blocks)
- After fixing critical bugs or build issues
- After successful testing of new functionality
- Before starting major refactoring

#### Commit Message Format:

```
feat: implement [feature name]
fix: resolve [issue description]
refactor: improve [component name]
docs: update [documentation type]
```

#### Branch Strategy:

- **main**: Production-ready code
- **feature/[feature-name]**: New feature development
- **fix/[issue-name]**: Bug fixes
- **refactor/[component-name]**: Code improvements

### File Structure to Maintain

```
MAPGUARD/
├── app/                              # Remix admin interface
│   ├── routes/
│   │   ├── app._index.tsx           # Dashboard
│   │   ├── app.setup.tsx            # Metafield setup
│   │   ├── app.products.tsx         # Products management (BUILD)
│   │   ├── app.settings.tsx         # Message configuration
│   │   └── app.dashboard.tsx        # Overview
│   ├── utils/
│   │   └── billing.server.ts        # Billing utilities
│   └── hooks/
│       └── useBilling.ts            # Billing frontend logic
├── extensions/
│   ├── map-message-display/         # Theme extension
│   ├── apply-discount/              # Discount function
│   ├── product-admin-block/         # Product admin extension (BUILD)
│   └── variant-admin-block/         # Variant admin extension (BUILD)
├── prisma/
│   └── schema.prisma                # Database schema
├── docs/
│   ├── COPILOT_SETUP_INSTRUCTIONS.md
│   ├── COMPLETE_APP_SPECIFICATION.md
│   └── GITHUB_REPOSITORY_CONFIG.md  # This file
└── package.json
```

### Key Development Targets

#### Immediate Priorities:

1. **Fix discount function build** - Resolve GraphQL conflicts in `extensions/apply-discount/`
2. **Implement products page** - Create `/app/products` route with full MAP management
3. **Build admin blocks** - Create product and variant admin extensions

#### Core Functionality Requirements:

- **MAP Price Logic**: Shopify price = MAP price (displayed), Final price = customer pays (lower)
- **Automatic Discounting**: Discount function applies difference at checkout
- **Metafield Management**: Store MAP data at variant level
- **Bulk Operations**: Mass editing via Shopify bulk editor integration

### Testing Strategy

- **Local Development**: Use `npm run dev` for Shopify app development
- **Extension Testing**: Use `shopify app deploy` for testing extensions
- **Database Testing**: Use `npm run setup` for Prisma migrations

### Documentation Updates

When implementing features, update:

- **README.md** - Installation and setup instructions
- **PROJECT_SUMMARY.md** - Business logic and current status
- **CHANGELOG.md** - Version history and feature additions

### Deployment Pipeline

1. **Development**: Local testing with dev store
2. **Staging**: Test with staging Shopify store
3. **Production**: Deploy to Shopify App Store (future)

## Copilot Integration Notes

### Project Context:

- This is a **Shopify App** built with **Remix + TypeScript**
- Uses **Shopify Functions** for automatic discounting
- Implements **MAP (Minimum Advertised Pricing)** enforcement
- Database: **SQLite + Prisma**
- UI Framework: **Shopify Polaris**

### Development Approach:

- **Clean slate development** - overwrite existing implementations
- **Follow Shopify best practices** for app development
- **Use Shopify CLI** for extension generation and deployment
- **Implement modern patterns** - TypeScript, proper error handling, responsive UI

### Code Quality Standards:

- **TypeScript strict mode** enabled
- **Proper error handling** with user-friendly messages
- **Responsive design** using Shopify Polaris components
- **Performance optimization** for large product catalogs
- **Accessibility compliance** following Shopify guidelines

This configuration ensures GitHub Copilot understands the project scope, repository structure, and development approach for the MAP Guard Shopify app.
