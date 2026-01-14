/**
 * i18n Configuration
 * Supports: English (en), Swedish (sv)
 * Add more languages by creating new translation files
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

// Import translations
import en from './locales/en';
import sv from './locales/sv';

// Available languages
export const resources = {
  en: { translation: en },
  sv: { translation: sv },
};

// Supported languages list (for UI)
export const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
];

// Get device language
const getDeviceLanguage = (): string => {
  const deviceLang = Localization.locale.split('-')[0];
  return Object.keys(resources).includes(deviceLang) ? deviceLang : 'en';
};

// Initialize i18n
i18n.use(initReactI18next).init({
  resources,
  lng: getDeviceLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: 'v3',
});

export default i18n;
