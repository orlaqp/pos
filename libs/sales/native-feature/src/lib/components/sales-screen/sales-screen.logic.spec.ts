import {
    getActiveProducts,
    getAutoAddQuantity,
    getCategoryFilteredProducts,
    getSelectedQuantity,
    getSingleProductFromDictionary,
    shouldBlockSelectionByInventory,
    shouldSetFilteredProducts,
} from './sales-screen.logic';
import { EACH } from '@pos/unit-of-measures/data-access';

describe('sales-screen.logic', () => {
    const products = [
        { id: '1', isActive: true, productCategoryId: 'a', unitOfMeasure: EACH },
        { id: '2', isActive: false, productCategoryId: 'a', unitOfMeasure: 'LB' },
        { id: '3', isActive: true, productCategoryId: 'b', unitOfMeasure: 'LB' },
    ] as any[];

    it('returns only active products', () => {
        expect(getActiveProducts(products).map((p) => p.id)).toEqual(['1', '3']);
    });

    it('filters by category id when provided', () => {
        expect(
            getCategoryFilteredProducts(products as any, { id: 'a' } as any).map(
                (p) => p.id
            )
        ).toEqual(['1']);
        expect(getCategoryFilteredProducts(products as any, undefined).map((p) => p.id)).toEqual(['1', '3']);
    });

    it('controls filtered-list update behavior for numeric scans', () => {
        expect(shouldSetFilteredProducts('12345', true)).toBe(false);
        expect(shouldSetFilteredProducts('123', true)).toBe(true);
        expect(shouldSetFilteredProducts('apple', false)).toBe(true);
    });

    it('computes auto-add quantity', () => {
        expect(getAutoAddQuantity(products[0] as any, 4)).toBe(4);
        expect(getAutoAddQuantity(products[0] as any, undefined)).toBe(1);
        expect(getAutoAddQuantity(products[2] as any, undefined)).toBe(0);
    });

    it('handles inventory-based selection blocking', () => {
        expect(shouldBlockSelectionByInventory(true, 0, 1)).toBe(true);
        expect(shouldBlockSelectionByInventory(true, 2, 1)).toBe(false);
        expect(shouldBlockSelectionByInventory(false, 0, 1)).toBe(false);
    });

    it('returns selected quantity by unit', () => {
        expect(getSelectedQuantity(EACH)).toBe(1);
        expect(getSelectedQuantity('LB')).toBe(0);
    });

    it('returns single product only when dictionary has one item', () => {
        expect(getSingleProductFromDictionary(undefined)).toBeUndefined();
        expect(getSingleProductFromDictionary({} as any)).toBeUndefined();
        expect(
            getSingleProductFromDictionary({
                '1': products[0],
                '2': products[1],
            } as any)
        ).toBeUndefined();
        expect(
            getSingleProductFromDictionary({
                '1': products[0],
            } as any)
        ).toEqual(products[0]);
    });
});
