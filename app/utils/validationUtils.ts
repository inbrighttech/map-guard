// Utility functions for form and data validation

export function isValidPrice(price: any): boolean {
  return typeof price === 'number' && price >= 0;
}

export function isNonEmptyString(value: any): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}
