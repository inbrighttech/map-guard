// Utility functions for i18n and localization

export function getLocaleFromUrl(url: string): string {
  const match = url.match(/[?&]locale=([a-zA-Z-]+)/);
  return match ? match[1] : 'en';
}

export function getLocalizedString(key: string, translations: Record<string, string>, fallback: string = ''): string {
  return translations[key] || fallback || key;
}
