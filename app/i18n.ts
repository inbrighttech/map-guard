import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import en from './locales/en.json';

// Configure i18n following Shopify best practices
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // Default language
    fallbackLng: 'en',
    
    // Available languages
    supportedLngs: ['en'],
    
    // Translation resources
    resources: {
      en: {
        translation: en
      }
    },
    
    // Detection options for Shopify apps
    detection: {
      // Order of detection methods
      order: ['querystring', 'localStorage', 'navigator'],
      
      // Use 'locale' parameter from Shopify admin
      lookupQuerystring: 'locale',
      
      // Cache user language preference
      caches: ['localStorage']
    },
    
    // Interpolation settings
    interpolation: {
      escapeValue: false, // React already escapes values
      
      // Format functions for Shopify-specific formatting
      format: function (value, format, lng) {
        if (format === 'currency') {
          return new Intl.NumberFormat(lng, {
            style: 'currency',
            currency: 'USD' // Default currency, should be dynamic based on store
          }).format(value);
        }
        
        if (format === 'number') {
          return new Intl.NumberFormat(lng).format(value);
        }
        
        if (format === 'date') {
          return new Intl.DateTimeFormat(lng).format(new Date(value));
        }
        
        if (format === 'datetime') {
          return new Intl.DateTimeFormat(lng, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }).format(new Date(value));
        }
        
        return value;
      }
    },
    
    // Namespace settings
    ns: ['translation'],
    defaultNS: 'translation',
    
    // Debug in development
    debug: process.env.NODE_ENV === 'development',
    
    // React-specific options
    react: {
      useSuspense: false
    }
  });

export default i18n;
