import en from './en.json';
import es from './es.json';
import { setI18nConfig, translateWithFallback } from './language.utils';

describe('language resources', () => {
    afterEach(() => {
        setI18nConfig('en');
    });

    it('keeps English and Spanish translation keys aligned', () => {
        expect(Object.keys(es).sort()).toEqual(Object.keys(en).sort());
    });

    it('translates known keys in the active language', () => {
        setI18nConfig('es');

        expect(translateWithFallback('SETTINGS_Title', 'Settings')).toBe(
            'Configuración',
        );
    });

    it('returns the provided fallback for missing keys', () => {
        expect(
            translateWithFallback('MISSING_PHASE_8_TEST_KEY', 'Fallback copy'),
        ).toBe('Fallback copy');
    });
});
