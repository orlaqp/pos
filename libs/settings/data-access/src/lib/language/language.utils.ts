import * as RNLocalize from "react-native-localize";
import memoize from "lodash/memoize";
import i18n from "i18n-js";
import { I18nManager } from 'react-native';

const translationGetters = {
  // lazy requires
  en: () => require("./en.json"),
  es: () => require("./es.json"),
};

export const translate = memoize(
  (key: i18n.Scope, config?: i18n.TranslateOptions) => i18n.t(key, config),
  (key, config) => (config ? key + JSON.stringify(config) : key),
);

export type AvailableLanguage = 'en' | 'es';

// fallback if no available language fits
const fallback = { languageTag: "en", isRTL: false };

export const { languageTag, isRTL } =
    RNLocalize.findBestAvailableLanguage(Object.keys(translationGetters)) ||
    fallback;

export const setI18nConfig = (languageTag: string) => {
  // clear translation cache
  translate.cache.clear();
  // update layout direction
  I18nManager.forceRTL(isRTL);

  // set i18n-js config
  i18n.translations = {
    [languageTag]: translationGetters[languageTag](),
  };

  i18n.locale = languageTag;
};