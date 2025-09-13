# Map Message Display Extension - File Documentation

## Purpose
Theme extension for displaying MAP messages and pricing information (existing working extension).

## Key Files

### `blocks/map-message.liquid`
- Complex Liquid template with full MAP logic
- Handles multiple metafield values and display conditions
- Includes comprehensive MAP message handling

### `locales/en.default.json`
- Localization file for the extension

### `shopify.extension.toml`
- Theme extension configuration
- Already configured and working

### `assets/map-guard-icon.svg`
- Icon asset for the extension

### `snippets/stars.liquid`
- Additional Liquid snippet for ratings/reviews

## Setup Instructions

1. Generate theme extension: `shopify app generate extension --type=theme --name=map-message-display`
2. Replace generated files with these working implementations
3. This extension is already functional and tested

## Features
- Advanced MAP message display logic
- Multiple metafield handling
- Custom message support
- Boolean value conversion
- Responsive design elements

## Metafields Used
- `mapguard.enabled` - MAP activation flag
- `mapguard.final_price` - Final pricing
- `mapguard.display` - Display message flag  
- `mapguard.custom_message` - Custom message text
