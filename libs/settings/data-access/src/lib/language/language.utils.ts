import * as RNLocalize from "react-native-localize";
import memoize from "lodash/memoize";
import i18next, { TOptions } from "i18next";
import { I18nManager } from 'react-native';

const translationGetters = {
  // lazy requires
  en: () => require("./en.json"),
  es: () => require("./es.json"),
};

const resources = {
    en: { translation: translationGetters.en() },
    es: { translation: translationGetters.es() },
};

const ensureI18nInitialized = (lng: AvailableLanguage) => {
    if (i18next.isInitialized) return;

    i18next.init({
        resources,
        lng,
        fallbackLng: 'en',
        showSupportNotice: false,
        interpolation: { escapeValue: false },
        initImmediate: false,
    });
};

export const translate = memoize(
    (key: string, config?: TOptions) => i18next.t(key, config),
    (key, config) => (config ? key + JSON.stringify(config) : key),
);

export type AvailableLanguage = 'en' | 'es';

// fallback if no available language fits
const fallback = { languageTag: "en", isRTL: false };

export const { languageTag, isRTL } =
    RNLocalize.findBestLanguageTag(Object.keys(translationGetters)) ||
    fallback;

export const setI18nConfig = (languageTag: string) => {
  // clear translation cache
  translate.cache.clear();
  // update layout direction
  I18nManager.forceRTL(isRTL);
  const normalized = (languageTag === 'es' ? 'es' : 'en') as AvailableLanguage;
  ensureI18nInitialized(normalized);
  i18next.changeLanguage(normalized);
};

ensureI18nInitialized(languageTag as AvailableLanguage);
