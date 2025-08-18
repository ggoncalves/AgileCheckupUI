import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

const STORAGE_KEY = 'agileCheckupLanguage';

i18n
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: ['pt-BR', 'en-US'],
    fallbackLng: 'pt-BR',
    debug: false,
    
    detection: {
      order: ['localStorage'],
      caches: ['localStorage'],
      lookupLocalStorage: STORAGE_KEY,
    },
    
    lng: 'pt-BR', // Force pt-BR as initial language

    interpolation: {
      escapeValue: false,
    },

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    ns: ['common'],
    defaultNS: 'common',
  });

export default i18n;