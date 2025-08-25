// Utility functions for MAP price logic, formatting, and calculations

/**
 * Returns true if the actual price is below the MAP price.
 */
export function isBelowMap(actual: number, map: number): boolean {
  return actual < map;
}

/**
 * Formats a price using Intl.NumberFormat (currency).
 */
export function formatPrice(amount: number, currency: string = 'USD', locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Calculates the discount percent between MAP and actual price.
 */
export function getDiscountPercent(map: number, actual: number): number {
  if (map <= 0) return 0;
  return Math.round(((map - actual) / map) * 100);
}

// Add more MAP-related logic here as needed
