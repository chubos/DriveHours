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

// Detect system language; prefer Polish if available, otherwise use device language if supported
const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'en';
const supportedLanguages = ['en', 'pl', 'fr', 'cs', 'da', 'fi', 'ar', 'zh-CN', 'zh', 'he', 'hi', 'es-419', 'es-ES', 'es', 'id', 'ja', 'ko', 'nl', 'de', 'no', 'pt', 'ru', 'ro', 'sv', 'sk', 'th', 'tr', 'uk'];

// Map 'zh' to 'zh-CN' for simplified Chinese and 'es' to 'es-419' for Latin American Spanish
let mappedLanguage = deviceLanguage;
if (deviceLanguage === 'zh') {
    mappedLanguage = 'zh-CN';
} else if (deviceLanguage === 'es') {
    mappedLanguage = 'es-419';
}

const supportedLanguage = supportedLanguages.includes(mappedLanguage) ? mappedLanguage : 'en';

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

// Helper for dev/testing: temporarily switch language at runtime
export function setLanguage(lang: 'en' | 'pl' | 'fr' | 'cs' | 'da' | 'fi' | 'ar' | 'zh-CN' | 'he' | 'hi' | 'es-419' | 'es-ES' | 'id' | 'ja' | 'ko' | 'nl' | 'de' | 'no' | 'pt' | 'ru' | 'ro' | 'sv' | 'sk' | 'th' | 'tr' | 'uk') {
  if (supportedLanguages.includes(lang)) {
    i18n.changeLanguage(lang);
  }
}

export default i18n;
