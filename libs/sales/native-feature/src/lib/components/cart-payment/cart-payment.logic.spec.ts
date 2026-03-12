import {
    getAutoFillAmount,
    getRestoredValue,
    shouldRestoreValue,
    toNumber,
} from './cart-payment.logic';

describe('cart-payment.logic', () => {
    it('caps EBT auto-fill to ebtEligibleTotal', () => {
        const amount = getAutoFillAmount(
            'ebt',
            { cash: 0, cc: 0, ebt: 0 },
            ['cash', 'cc', 'ebt'],
            89.9,
            24.9
        );

        expect(amount).toBe(24.9);
    });

    it('fills remaining amount for non-EBT methods', () => {
        const amount = getAutoFillAmount(
            'cash',
            { ebt: 24.9, cc: 0, cash: 0 },
            ['cash', 'cc', 'ebt'],
            89.9,
            24.9
        );

        expect(amount).toBe(65);
    });

    it('returns 0 when remaining is negative', () => {
        const amount = getAutoFillAmount(
            'cash',
            { ebt: 100, cc: 0, cash: 0 },
            ['cash', 'cc', 'ebt'],
            89.9,
            24.9
        );

        expect(amount).toBe(0);
    });

    it('detects empty values for restore-on-blur', () => {
        expect(shouldRestoreValue('')).toBeTruthy();
        expect(shouldRestoreValue('   ')).toBeTruthy();
        expect(shouldRestoreValue(undefined)).toBeTruthy();
        expect(shouldRestoreValue('12')).toBeFalsy();
    });

    it('restores previous value rounded to cents', () => {
        expect(getRestoredValue(12.345)).toBe(12.35);
        expect(getRestoredValue(undefined)).toBe(0);
    });

    it('converts invalid values to 0', () => {
        expect(toNumber('')).toBe(0);
        expect(toNumber('abc')).toBe(0);
        expect(toNumber('12.5')).toBe(12.5);
    });
});
