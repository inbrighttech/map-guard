# Database Schema Documentation

## Prisma Schema Overview

The MAP Guard app uses Prisma ORM with SQLite for development and PostgreSQL for production.

## Models

### Session Model
Handles Shopify app session management and authentication.

### MAP Billing Models  
Custom models for managing MAP-related billing and subscription data.

### Product Models
Enhanced product and variant models with MAP-specific fields and relationships.

## Migrations

### `20240530213853_create_session_table`
- Initial session table creation
- Basic Shopify app authentication setup

### `20250818200819_create_map_billing_models`
- MAP-specific billing models
- Subscription tracking
- Payment history

### `20250818203830_update_product_model_for_variants`
- Product variant enhancements
- MAP pricing fields
- Metafield relationships

## Setup Instructions

1. **Install Prisma**:
   ```bash
   npm install prisma @prisma/client
   ```

2. **Generate Client**:
   ```bash
   npx prisma generate
   ```

3. **Run Migrations**:
   ```bash
   npx prisma migrate dev
   ```

4. **Seed Database** (if applicable):
   ```bash
   npx prisma db seed
   ```

## Configuration

- Development: Uses SQLite (`dev.sqlite`)
- Production: Configure PostgreSQL connection string
- Schema file: `schema.prisma` contains all model definitions

## Important Notes

- Migration files should not be modified manually
- Always run migrations in development before production
- Database schema supports MAP-specific metafields and pricing logic
- Session management integrates with Shopify OAuth flow
