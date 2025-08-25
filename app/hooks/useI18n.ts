import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

/**
 * Custom hook for translations following Shopify best practices
 * Provides formatted translation functions for common use cases
 */
export function useI18n() {
  const { t, i18n } = useTranslation();
  
  // Get current locale for formatting
  const locale = i18n.language;
  
  // Memoized formatting functions to avoid recreation on each render
  const formatters = useMemo(() => ({
    // Format currency values using Intl API
    currency: (amount: number, currency = 'USD') => {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency
      }).format(amount);
    },
    
    // Format numbers with locale-specific separators
    number: (value: number) => {
      return new Intl.NumberFormat(locale).format(value);
    },
    
    // Format dates
    date: (date: Date | string) => {
      return new Intl.DateTimeFormat(locale).format(new Date(date));
    },
    
    // Format datetime with time
    datetime: (date: Date | string) => {
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(date));
    },
    
    // Format lists with proper conjunctions
    list: (items: string[], type: 'conjunction' | 'disjunction' = 'conjunction') => {
      if (!items.length) return '';
      if (items.length === 1) return items[0];
      
      return new Intl.ListFormat(locale, {
        style: 'long',
        type: type
      }).format(items);
    },
    
    // Format relative time (e.g., "2 days ago")
    relativeTime: (date: Date | string) => {
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
      const now = new Date();
      const target = new Date(date);
      const diffInSeconds = (target.getTime() - now.getTime()) / 1000;
      
      if (Math.abs(diffInSeconds) < 60) {
        return rtf.format(Math.round(diffInSeconds), 'second');
      } else if (Math.abs(diffInSeconds) < 3600) {
        return rtf.format(Math.round(diffInSeconds / 60), 'minute');
      } else if (Math.abs(diffInSeconds) < 86400) {
        return rtf.format(Math.round(diffInSeconds / 3600), 'hour');
      } else {
        return rtf.format(Math.round(diffInSeconds / 86400), 'day');
      }
    }
  }), [locale]);
  
  return {
    t,
    locale,
    ...formatters,
    // Change language function
    changeLanguage: i18n.changeLanguage,
    // Check if language is loaded
    isReady: i18n.isInitialized
  };
}

/**
 * Hook specifically for navigation translations
 */
export function useNavigation() {
  const { t } = useI18n();
  
  return {
    dashboard: t('app.navigation.dashboard'),
    setup: t('app.navigation.setup'),
    products: t('app.navigation.products'),
    settings: t('app.navigation.settings'),
    plans: t('app.navigation.plans'),
    faq: t('app.navigation.faq')
  };
}

/**
 * Hook for general UI translations
 */
export function useGeneral() {
  const { t } = useI18n();
  
  return {
    save: t('app.general.save'),
    cancel: t('app.general.cancel'),
    delete: t('app.general.delete'),
    edit: t('app.general.edit'),
    loading: t('app.general.loading'),
    error: t('app.general.error'),
    success: t('app.general.success'),
    back: t('app.general.back'),
    next: t('app.general.next'),
    previous: t('app.general.previous'),
    search: t('app.general.search'),
    select: t('app.general.select'),
    none: t('app.general.none'),
    all: t('app.general.all'),
    yes: t('app.general.yes'),
    no: t('app.general.no')
  };
}
