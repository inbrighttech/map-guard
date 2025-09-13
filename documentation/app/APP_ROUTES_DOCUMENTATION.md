# MAP Guard App Routes Documentation

## Main Application Pages

### `app._index.tsx` - Main Dashboard
- Primary landing page for the app
- Overview of MAP settings and statistics
- Quick access to key features

### `app.dashboard.tsx` - Analytics Dashboard  
- Detailed analytics and reporting
- MAP pricing performance metrics
- Sales data and discount statistics

### `app.settings.tsx` - Settings Page
- App configuration settings
- MAP pricing rules configuration
- User preferences and options

### `app.setup.tsx` - Initial Setup
- First-time app setup wizard
- Onboarding flow for new installations
- Configuration guidance

### `app.additional.tsx` - Additional Features
- Extra functionality and tools
- Advanced MAP management features
- Bulk operations and utilities

### `app.tsx` - App Layout
- Main app wrapper and navigation
- Common UI elements and layout
- Authentication and session handling

## Authentication Routes

### `auth.$.tsx` - Auth Handler
- Handles Shopify OAuth flow
- Session management
- Authentication redirects

### `auth.login/` Directory
- `route.tsx` - Login page component
- `error.server.tsx` - Login error handling

## Webhook Handlers

### `webhooks.app.scopes_update.tsx`
- Handles app scope changes
- Updates app permissions
- Manages scope-related data

### `webhooks.app.uninstalled.tsx`
- Cleanup when app is uninstalled
- Data removal and cleanup tasks
- Uninstall tracking

### `webhooks.subscriptions.update.tsx`
- Handles subscription changes
- Billing event processing
- Plan updates and modifications

## Landing Page

### `_index/` Directory
- `route.tsx` - Public landing page
- `styles.module.css` - Landing page styles

## Server Configuration

### `db.server.ts` - Database Configuration
- Prisma client setup
- Database connection management
- Query utilities

### `shopify.server.ts` - Shopify Server Setup
- Shopify API configuration
- GraphQL client setup
- App authentication

### `entry.server.tsx` - Server Entry Point
- Server-side rendering setup
- Request/response handling
- Server initialization

### `root.tsx` - Root Component
- HTML document structure
- Global styles and meta tags
- Error boundaries

### `routes.ts` - Route Definitions
- Route mapping and configuration
- Route parameters and handlers
- Navigation structure

## Utilities and Hooks

### `utils/billing.server.ts`
- Server-side billing operations
- Subscription management
- Payment processing utilities

### `hooks/useBilling.ts`
- Client-side billing React hook
- Subscription state management
- Billing UI interactions

## Key Features

1. **Complete Admin Interface** - Full-featured admin dashboard
2. **Billing Integration** - Shopify billing API integration
3. **Analytics Dashboard** - Performance metrics and reporting
4. **Setup Wizard** - Guided onboarding experience
5. **Webhook Processing** - Real-time event handling
6. **Authentication Flow** - Secure OAuth implementation

## Setup Notes

- All routes follow Remix.js conventions
- Server-side utilities handle Shopify API interactions
- Client-side hooks manage UI state
- Database operations use Prisma ORM
- Billing integration uses Shopify Billing API
