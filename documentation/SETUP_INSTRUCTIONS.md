# MAP Guard Shopify App - Setup Instructions

## Overview
MAP Guard is a Shopify app that manages Minimum Advertised Pricing (MAP) for products. It includes multiple extensions for discount functions and theme displays.

## Project Structure
This app consists of:
1. **apply-discount** - Main discount function (existing, working)
2. **map-discount-function** - Additional MAP discount function
3. **map-guard-display** - Theme extension for MAP messaging
4. **map-message-display** - Theme extension for MAP messages (existing, working)

## Prerequisites
- Node.js (latest LTS version)
- Shopify CLI (latest version)
- Shopify Partner account
- Development store

## Step-by-Step Setup Instructions

### 1. Initialize Shopify App Project
```bash
# Create new Shopify app
shopify app init your-app-name

# Navigate to project directory
cd your-app-name
```

### 2. Create Extensions Using Shopify CLI

#### Create Apply Discount Function
```bash
shopify app generate extension --type=function --name=apply-discount --template=product-discount
```

#### Create Map Discount Function
```bash
shopify app generate extension --type=function --name=map-discount-function --template=product-discount
```

#### Create Map Guard Display Theme Extension
```bash
shopify app generate extension --type=theme --name=map-guard-display
```

#### Create Map Message Display Theme Extension
```bash
shopify app generate extension --type=theme --name=map-message-display
```

### 3. Replace Generated Files with Custom Code

After the CLI creates the basic structure, replace the generated files with the custom code provided in this export package:

#### For each extension directory:
1. Copy the contents from `MAP_GUARD_EXPORT/extensions/[extension-name]/` 
2. Replace the corresponding files in your generated project
3. Ensure all file paths and directory structures match exactly

### 4. Configuration Files

#### Main App Configuration
- Copy `shopify.app.toml` content to your main app configuration
- Update app name and organization as needed

#### Extension Configuration Files
- `shopify.extension.toml` files contain the extension configurations
- `shopify.function.extension.toml` files contain function-specific configurations
- Make sure UIDs are unique - regenerate if needed

### 5. Key Files to Replace/Update

#### Apply Discount Function
- `src/run.ts` - Main discount logic
- `src/run.graphql` - GraphQL query for cart data
- `package.json` - Dependencies and scripts
- `shopify.extension.toml` - Extension configuration

#### Map Discount Function  
- `src/main.ts` - MAP-specific discount logic
- `src/run.graphql` - GraphQL query
- `package.json` - Dependencies and scripts
- `shopify.function.extension.toml` - Function configuration

#### Theme Extensions (map-guard-display, map-message-display)
- `blocks/*.liquid` - Liquid templates for theme blocks
- `blocks/*.schema.json` - Schema definitions for blocks
- `locales/en.default.json` - Translation files
- `shopify.extension.toml` - Extension configuration

### 6. Install Dependencies

For each function extension:
```bash
cd extensions/apply-discount
npm install

cd ../map-discount-function  
npm install
```

### 7. Deploy and Test

#### Deploy Extensions
```bash
# From root directory
shopify app deploy
```

#### Start Development Server
```bash
shopify app dev
```

### 8. Important Notes

#### Metafields Setup
The app uses these metafields on ProductVariant:
- `mapguard.enabled` - Boolean to enable/disable MAP
- `mapguard.final_price` - Final price to apply
- `mapguard.display` - Whether to show message
- `mapguard.custom_message` - Custom message text

#### Function Targeting
Both discount functions target `purchase.product-discount.run`

#### Theme Integration
Theme extensions can be added to product pages and checkout flows.

### 9. Troubleshooting

#### Common Issues:
1. **Empty package.json**: Ensure all package.json files have valid JSON content
2. **Missing schema files**: Theme extensions need schema.json files for blocks
3. **Missing locales**: Theme extensions need locales/en.default.json
4. **UID conflicts**: Each extension needs unique UID in configuration

#### Regenerating UIDs:
If you encounter UID conflicts, generate new ones:
```bash
shopify app deploy --reset
```

### 10. Database Setup

#### Prisma Configuration
```bash
# Install Prisma dependencies
npm install prisma @prisma/client

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

### 11. Main App Development

#### Copy App Structure
After CLI generates the basic app, replace/add these files:
- `app/routes/*.tsx` - All route components
- `app/utils/*.ts` - Utility functions including billing
- `app/hooks/*.ts` - React hooks for billing and state management
- `app/*.tsx` and `app/*.ts` - Main app configuration files

#### Configuration Files
- `vite.config.ts` - Vite build configuration
- `tsconfig.json` - TypeScript configuration
- `env.d.ts` - Environment type definitions
- `shopify.web.toml` - Web app configuration

### 12. Testing the App

1. Install app on development store
2. Set up metafields on products/variants
3. Test discount functions in cart
4. Verify theme extensions display correctly
5. Test various MAP pricing scenarios
6. Test admin dashboard functionality
7. Verify billing integration works

## Complete File Structure

The export includes:
- **Extensions** (4 different Shopify extensions)
- **App Routes** (Dashboard, settings, setup pages)
- **Database Schema** (Prisma models and migrations)
- **Utility Functions** (Billing, authentication)
- **Configuration Files** (TypeScript, Vite, Shopify configs)

## Support

For issues with setup:
1. Check Shopify CLI documentation
2. Verify all dependencies are installed
3. Ensure metafields are configured correctly
4. Check browser console for theme extension issues

---

*This setup guide ensures the AI assistant has complete instructions for recreating the MAP Guard Shopify app from scratch using the Shopify CLI and the provided custom code.*
