// Utility functions for API/data fetch logic

export async function fetchJson(url: string, options?: RequestInit) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error('API request failed');
  return response.json();
}

export async function postJson(url: string, data: any, options?: RequestInit) {
  return fetchJson(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    ...options,
  });
}
