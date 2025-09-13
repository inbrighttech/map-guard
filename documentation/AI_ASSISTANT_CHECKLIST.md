# AI Assistant Quick Start Checklist

## For AI Assistant: MAP Guard Shopify App Recreation Steps

### Phase 1: Project Initialization
- [ ] Run `shopify app init [app-name]`
- [ ] Navigate to project directory
- [ ] Verify Shopify CLI is latest version

### Phase 2: Extension Generation (Use Shopify CLI)
- [ ] `shopify app generate extension --type=function --name=apply-discount --template=product-discount`
- [ ] `shopify app generate extension --type=function --name=map-discount-function --template=product-discount`  
- [ ] `shopify app generate extension --type=theme --name=map-guard-display`
- [ ] `shopify app generate extension --type=theme --name=map-message-display`

### Phase 3: File Replacement
- [ ] Replace all generated files with provided custom implementations
- [ ] Copy exact directory structures from MAP_GUARD_EXPORT
- [ ] Copy all app routes from `MAP_GUARD_EXPORT/app/routes/`
- [ ] Copy utility functions from `MAP_GUARD_EXPORT/app/utils/`
- [ ] Copy React hooks from `MAP_GUARD_EXPORT/app/hooks/`
- [ ] Copy main app files (`db.server.ts`, `shopify.server.ts`, etc.)
- [ ] Ensure all file paths match exactly

### Phase 4: Database Setup
- [ ] Copy Prisma schema from `MAP_GUARD_EXPORT/prisma/schema.prisma`
- [ ] Copy migration files from `MAP_GUARD_EXPORT/prisma/migrations/`
- [ ] Run `npm install prisma @prisma/client`
- [ ] Run `npx prisma generate`
- [ ] Run `npx prisma migrate dev`

### Phase 5: Configuration
- [ ] Update main shopify.app.toml with provided configuration
- [ ] Copy shopify.web.toml for web app configuration
- [ ] Copy vite.config.ts and tsconfig.json
- [ ] Copy env.d.ts for TypeScript definitions
- [ ] Regenerate UIDs in extension configuration files
- [ ] Verify all metafield references are correct

### Phase 6: Dependencies
- [ ] Run `npm install` in root directory
- [ ] Run `npm install` in each function extension directory
- [ ] Verify all packages install without errors
- [ ] Install Prisma dependencies: `npm install prisma @prisma/client`

### Phase 7: Build & Deploy
- [ ] Test build for each function: `npm run build`
- [ ] Deploy extensions: `shopify app deploy`
- [ ] Start development server: `shopify app dev`

### Phase 8: Testing
- [ ] Install app on development store
- [ ] Configure metafields on test products
- [ ] Test discount functions in cart
- [ ] Verify theme extensions display correctly
- [ ] Test admin dashboard pages
- [ ] Verify billing integration works
- [ ] Test webhook handlers
- [ ] Verify database operations

### Critical Files to Replace
1. **Function Extensions**: src/*.ts, src/*.graphql, package.json, *.toml
2. **Theme Extensions**: blocks/*.liquid, blocks/*.json, locales/*.json, *.toml
3. **Main App**: shopify.app.toml, shopify.web.toml, package.json
4. **App Routes**: app/routes/*.tsx (all route files)
5. **Database**: prisma/schema.prisma, prisma/migrations/*
6. **Configuration**: vite.config.ts, tsconfig.json, env.d.ts
7. **Utilities**: app/utils/*.ts, app/hooks/*.ts
8. **Core App**: app/*.ts, app/*.tsx

### Common Issues & Solutions
- Empty package.json → Use provided complete package.json files
- Missing schema → Copy schema.graphql from apply-discount to other functions
- UID conflicts → Regenerate UIDs with `--reset` flag
- Build failures → Ensure all dependencies installed correctly

### Metafields Required
Set up these metafields in Shopify admin:
- Namespace: `mapguard`
- Keys: `enabled`, `final_price`, `display`, `custom_message`
- Owner: ProductVariant

### Success Criteria
- [ ] All 4 extensions deploy without errors
- [ ] Discount functions activate on eligible products
- [ ] Theme extensions appear in theme editor
- [ ] MAP pricing logic works correctly
- [ ] Custom messages display properly

**Note**: Follow SETUP_INSTRUCTIONS.md for detailed steps. This checklist ensures nothing is missed during recreation.
