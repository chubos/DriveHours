import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './locales/en.json';
import pl from './locales/pl.json';
import fr from './locales/fr.json';
import cs from './locales/cs.json';
import da from './locales/da.json';
import fi from './locales/fi.json';
import ar from './locales/ar.json';
import zhCN from './locales/zh-CN.json';
import he from './locales/he.json';
import hi from './locales/hi.json';
import es419 from './locales/es-419.json';
import esES from './locales/es-ES.json';
import id from './locales/id.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import nl from './locales/nl.json';
import de from './locales/de.json';
import no from './locales/no.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';
import ro from './locales/ro.json';
import sv from './locales/sv.json';
import sk from './locales/sk.json';
import th from './locales/th.json';
import tr from './locales/tr.json';
import uk from './locales/uk.json';

const resources = {
  en: { translation: en },
  pl: { translation: pl },
  fr: { translation: fr },
  cs: { translation: cs },
  da: { translation: da },
  fi: { translation: fi },
  ar: { translation: ar },
  'zh-CN': { translation: zhCN },
  he: { translation: he },
  hi: { translation: hi },
  'es-419': { translation: es419 },
  'es-ES': { translation: esES },
  id: { translation: id },
  ja: { translation: ja },
  ko: { translation: ko },
  nl: { translation: nl },
  de: { translation: de },
  no: { translation: no },
  pt: { translation: pt },
  ru: { translation: ru },
  ro: { translation: ro },
  sv: { translation: sv },
  sk: { translation: sk },
  th: { translation: th },
  tr: { translation: tr },
  uk: { translation: uk },
};

// List of supported languages (matching resource keys)
const supportedLanguages = [
  'en', 'pl', 'fr', 'cs', 'da', 'fi', 'ar', 'zh-CN', 'he', 'hi',
  'es-419', 'es-ES', 'id', 'ja', 'ko', 'nl', 'de', 'no', 'pt',
  'ru', 'ro', 'sv', 'sk', 'th', 'tr', 'uk'
] as const;

// Detect system language
const deviceLocale = Localization.getLocales()[0];
const deviceLanguage = deviceLocale?.languageCode || 'en';
const deviceRegion = deviceLocale?.regionCode;

// Map device language to supported language
let mappedLanguage = deviceLanguage;

// Handle Chinese variants
if (deviceLanguage === 'zh') {
  mappedLanguage = 'zh-CN'; // Default to simplified Chinese
}
// Handle Spanish variants
else if (deviceLanguage === 'es') {
  // Use regional Spanish for Spain, Latin American Spanish for others
  mappedLanguage = (deviceRegion === 'ES') ? 'es-ES' : 'es-419';
}

// Check if mapped language is supported, otherwise fallback to English
const supportedLanguage = supportedLanguages.includes(mappedLanguage as any) ? mappedLanguage : 'en';

// eslint-disable-next-line import/no-named-as-default-member
i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources,
    lng: supportedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

// Type for supported languages
export type SupportedLanguage = typeof supportedLanguages[number];

// Helper for dev/testing: temporarily switch language at runtime
export function setLanguage(lang: SupportedLanguage): void {
  if (supportedLanguages.includes(lang)) {
    // eslint-disable-next-line import/no-named-as-default-member
    void i18n.changeLanguage(lang);
  }
}

export default i18n;
