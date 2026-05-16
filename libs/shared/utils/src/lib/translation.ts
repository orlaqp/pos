import i18next, { TOptions } from 'i18next';

export const hasTranslationKey = (key: string) =>
    i18next.isInitialized && i18next.exists(key);

const interpolateFallback = (fallback: string, config?: TOptions) => {
    if (!config) return fallback;

    return fallback.replace(/\{\{(\w+)\}\}/g, (match, token) => {
        const value = (config as Record<string, unknown>)[token];
        return value === undefined || value === null ? match : String(value);
    });
};

export const translateWithFallback = (
    key: string,
    fallback: string,
    config?: TOptions,
) => {
    if (!hasTranslationKey(key)) return interpolateFallback(fallback, config);

    const translated = String(i18next.t(key, config)).trim();
    return translated || interpolateFallback(fallback, config);
};
