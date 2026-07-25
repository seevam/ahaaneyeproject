import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './translations/en';
import hi from './translations/hi';
import ta from './translations/ta';

export type SupportedLanguage = 'en' | 'hi' | 'ta';

export const LANGUAGES: { code: SupportedLanguage; label: string; nativeLabel: string }[] = [
  { code: 'en', label: 'English', nativeLabel: 'EN' },
  { code: 'hi', label: 'Hindi',   nativeLabel: 'हि' },
  { code: 'ta', label: 'Tamil',   nativeLabel: 'த' },
];

// Pick the closest supported language from the device locale, fallback to 'en'.
function detectLanguage(): SupportedLanguage {
  const deviceLocale = Localization.getLocales()[0]?.languageCode ?? 'en';
  const match = LANGUAGES.find((l) => l.code === deviceLocale);
  return match ? match.code : 'en';
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    ta: { translation: ta },
  },
  lng: detectLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // React Native handles XSS
  },
  compatibilityJSON: 'v4',
});

export default i18n;
