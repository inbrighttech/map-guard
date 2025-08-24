# MAP Guard Theme Extension Changelog

## Version map-guard-14 (Latest)

**Released**: Current deployment
**Type**: Major Simplification

### Changes Made

- **Simplified Display**: Replaced complex MAP pricing display with simple message + icon system
- **Message Focus**: Now displays discount messages like "Configure MAP Pricing Discount Message"
- **Icon Options**: Added 4 configurable SVG icons (cart, tag, discount, info)
- **Metafield Integration**: Reads custom messages from `map_guard.discount_message` metafield
- **Modern CSS**: Responsive design with configurable styling options
- **Improved Schema**: Simplified theme editor settings for better merchant experience

### Template Structure

```liquid
{%- comment -%}
  MAP Guard Message Display Block
  Shows discount message with configurable icon
{%- endcomment -%}

<div class="map-guard-message-block">
  <div class="map-guard-icon">
    [SVG icon based on selection]
  </div>
  <div class="map-guard-message">
    [Message from metafield or default]
  </div>
</div>
```

### Schema Settings

- **Icon Settings**: Show/hide, type selection, size, color
- **Message Settings**: Default message, font size, weight, color, alignment
- **Block Styling**: Background, border, radius, padding, margin

### Metafield Structure

- **Namespace**: `map_guard`
- **Key**: `discount_message`
- **Type**: Single line text
- **Scope**: Variant level

### Fallback Logic

1. Custom variant metafield message
2. Block setting default message
3. Hard-coded fallback: "Configure MAP Pricing Discount Message"

## Previous Versions

- **map-guard-13**: Initial theme extension with complex MAP pricing display
- **Earlier**: Admin extensions only

## Technical Notes

- Compatible with all Shopify themes
- Responsive design for mobile devices
- JavaScript for variant change handling
- CSS custom properties for easy customization
- SVG icons for crisp display at any size
