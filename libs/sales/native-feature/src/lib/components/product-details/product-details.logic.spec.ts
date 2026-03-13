import {
    buildCartUpsertItem,
    calculateLinePrice,
    hasEnoughInventory,
    isQuantityInputValid,
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
    });

    it('validates quantity input', () => {
        expect(isQuantityInputValid('')).toBe(true);
        expect(isQuantityInputValid('2')).toBe(true);
        expect(isQuantityInputValid('2.5')).toBe(true);
        expect(isQuantityInputValid('abc')).toBe(false);
        expect(isQuantityInputValid('2..5')).toBe(false);
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
            product: { id: 'p-1' },
        } as any;

        expect(buildCartUpsertItem(item, '3')).toEqual({
            identifier: 'i-1',
            product: { id: 'p-1' },
            quantity: 3,
        });
    });
});
