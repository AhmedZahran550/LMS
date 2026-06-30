import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from '../i18n/en.json';
import ar from '../i18n/ar.json';

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    fallbackLng: 'ar',
    detection: {
      order: ['cookie', 'querystring', 'localStorage', 'navigator'],
      caches: ['cookie', 'localStorage'],
    },
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    interpolation: {
      escapeValue: false,
    },
    returnNull: false,
  });

export default i18n;
