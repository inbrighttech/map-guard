// Utility functions for product and variant logic

export function getProductStatus(product: any): string {
  // Example: return a localized status string
  switch (product.status) {
    case 'active': return 'Active';
    case 'inactive': return 'Inactive';
    case 'pending': return 'Pending';
    default: return 'Unknown';
  }
}

export function getVariantTitle(variant: any): string {
  // Example: extract variant title
  return variant.title || '';
}
