# Map Guard Display Extension - File Documentation

## Purpose
Theme extension that displays MAP-related messaging and information on product pages.

## Key Files

### `blocks/map-message.liquid`
- Liquid template for MAP message display
- Includes schema definition for customization
- Shows MAP information when enabled

### `blocks/map-message.schema.json`
- Schema definition for block settings
- Configurable heading, message, and display options

### `locales/en.default.json`
- Translation/localization file
- Default English text for the extension

### `shopify.extension.toml`
- Theme extension configuration
- Type: `theme`
- Unique UID for identification

## Setup Instructions

1. Generate theme extension: `shopify app generate extension --type=theme --name=map-guard-display`
2. Replace generated files with these implementations
3. No build process required for theme extensions

## Block Features
- Customizable heading and message
- Shows/hides based on MAP metafield values
- Integrates with existing theme structure

## Metafields Used
- `mapguard.enabled` - Controls display visibility
- `mapguard.custom_message` - Custom message override
