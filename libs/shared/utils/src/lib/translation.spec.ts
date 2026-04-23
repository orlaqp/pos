import i18next from 'i18next';
import { hasTranslationKey, translateWithFallback } from './translation';

describe('translation helpers', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns false when i18n is not initialized', () => {
        Object.defineProperty(i18next, 'isInitialized', {
            configurable: true,
            value: false,
        });

        expect(hasTranslationKey('SETTINGS_Title')).toBe(false);
        expect(
            translateWithFallback('SETTINGS_Title', 'Settings fallback'),
        ).toBe('Settings fallback');
    });

    it('returns the fallback when the key does not exist', () => {
        Object.defineProperty(i18next, 'isInitialized', {
            configurable: true,
            value: true,
        });
        jest.spyOn(i18next, 'exists').mockReturnValue(false);

        expect(
            translateWithFallback('UNKNOWN_KEY', 'Unknown fallback'),
        ).toBe('Unknown fallback');
    });

    it('returns the translated string when present', () => {
        Object.defineProperty(i18next, 'isInitialized', {
            configurable: true,
            value: true,
        });
        jest.spyOn(i18next, 'exists').mockReturnValue(true);
        jest.spyOn(i18next, 't').mockReturnValue('  Ajustes  ' as any);

        expect(translateWithFallback('SETTINGS_Title', 'Settings')).toBe(
            'Ajustes',
        );
    });

    it('falls back when the translated value is empty after trimming', () => {
        Object.defineProperty(i18next, 'isInitialized', {
            configurable: true,
            value: true,
        });
        jest.spyOn(i18next, 'exists').mockReturnValue(true);
        jest.spyOn(i18next, 't').mockReturnValue('   ' as any);

        expect(translateWithFallback('SETTINGS_Title', 'Settings')).toBe(
            'Settings',
        );
    });
});
