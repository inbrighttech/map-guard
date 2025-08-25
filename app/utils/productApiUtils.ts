// Utility functions for fetching products (list, filter, paginate)

/**
 * Fetches a paginated, filtered list of products from the API.
 */
export async function fetchProducts({ page = 1, pageSize = 20, filters = {} } = {}) {
  // TODO: Replace with actual API call
  // Example: return mock data
  return {
    products: [], // Array of product objects
    total: 0,
    page,
    pageSize,
    filters,
  };
}
