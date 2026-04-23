import i18next, { TOptions } from 'i18next';

export const hasTranslationKey = (key: string) =>
    i18next.isInitialized && i18next.exists(key);

export const translateWithFallback = (
    key: string,
    fallback: string,
    config?: TOptions,
) => {
    if (!hasTranslationKey(key)) return fallback;

    const translated = String(i18next.t(key, config)).trim();
    return translated || fallback;
};
