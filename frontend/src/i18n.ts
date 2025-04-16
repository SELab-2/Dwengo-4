import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locales/en/translation.json';
import translationNL from './locales/nl/translation.json';

// the translations
const resources = {
  en: {
    translation: translationEN,
  },
  nl: {
    translation: translationNL,
  },
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(LanguageDetector) // detect user language
  .init({
    resources,
    supportedLngs: ['nl', 'en'],
    fallbackLng: 'nl',

    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    debug: true,
    saveMissing: true,
  });

// Om te checken welke strings in de frontend vertaald zijn
// import emoji from 'i18next-emoji-postprocessor';
// i18n
//   .use(initReactI18next) // passes i18n down to react-i18next
//   .use(emoji)
//   .init({
//     postProcess: 'emoji',
//   });

export default i18n;
