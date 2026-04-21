import { EACH } from '@pos/unit-of-measures/data-access';

import {
    buildCartUpsertItem,
    calculateLinePrice,
    hasEnoughInventory,
    isQuantityInputValid,
    isQuantityInputValidForUnit,
    toSanitizedQuantityNumber,
    toQuantityNumber,
} from './product-details.logic';

describe('product-details.logic', () => {
    it('parses quantity text', () => {
        expect(toQuantityNumber('')).toBe(0);
        expect(toQuantityNumber('3')).toBe(3);
        expect(toQuantityNumber('2.5')).toBe(2.5);
    });

    it('calculates line price', () => {
        expect(calculateLinePrice('', 2.5)).toBe(0);
        expect(calculateLinePrice('4', 2.5)).toBe(10);
        expect(calculateLinePrice('2.9', 3, true)).toBe(6);
    });

    it('validates quantity input', () => {
        expect(isQuantityInputValid('')).toBe(true);
        expect(isQuantityInputValid('2')).toBe(true);
        expect(isQuantityInputValid('2.5')).toBe(true);
        expect(isQuantityInputValid('abc')).toBe(false);
        expect(isQuantityInputValid('2..5')).toBe(false);
    });

    it('rejects decimal input for EACH units', () => {
        expect(isQuantityInputValidForUnit('', true)).toBe(true);
        expect(isQuantityInputValidForUnit('2', true)).toBe(true);
        expect(isQuantityInputValidForUnit('2.5', true)).toBe(false);
        expect(toSanitizedQuantityNumber('2.9', true)).toBe(2);
    });

    it('validates inventory constraints', () => {
        expect(hasEnoughInventory(false, 1, '9')).toBe(true);
        expect(hasEnoughInventory(true, undefined, '9')).toBe(true);
        expect(hasEnoughInventory(true, 10, '10')).toBe(true);
        expect(hasEnoughInventory(true, 9, '10')).toBe(false);
    });

    it('builds upsert item', () => {
        const item = {
            identifier: 'i-1',
            quantity: 1,
            product: { id: 'p-1', unitOfMeasure: 'LB' },
        } as any;

        expect(buildCartUpsertItem(item, '3')).toEqual({
            identifier: 'i-1',
            product: { id: 'p-1', unitOfMeasure: 'LB' },
            quantity: 3,
        });
    });

    it('truncates EACH quantity when building cart items', () => {
        const item = {
            identifier: 'i-2',
            quantity: 1,
            product: { id: 'p-2', unitOfMeasure: EACH },
        } as any;

        expect(buildCartUpsertItem(item, '4.7')).toEqual({
            identifier: 'i-2',
            product: { id: 'p-2', unitOfMeasure: EACH },
            quantity: 4,
        });
    });
});
