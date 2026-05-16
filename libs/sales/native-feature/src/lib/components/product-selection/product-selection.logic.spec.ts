import {
    chunkProducts,
    getNextRowsToShow,
    getProductCardState,
    getProductStockBadgeTone,
    getProductStockLabel,
    isProductOutOfStock,
} from './product-selection.logic';

describe('product-selection.logic', () => {
    it('chunks products into rows of three by default', () => {
        const products = [
            { id: '1' },
            { id: '2' },
            { id: '3' },
            { id: '4' },
        ] as any[];
        const rows = chunkProducts(products as any);
        expect(rows).toHaveLength(2);
        expect(rows[0]).toHaveLength(3);
        expect(rows[1]).toHaveLength(1);
    });

    it('increments rowsToShow by default and custom increment', () => {
        expect(getNextRowsToShow(6)).toBe(12);
        expect(getNextRowsToShow(6, 3)).toBe(9);
    });

    it('returns card state for danger/warning/default', () => {
        expect(getProductCardState({ quantity: 0 } as any)).toBe('danger');
        expect(
            getProductCardState({ quantity: 1, reorderPoint: 2 } as any)
        ).toBe('warning');
        expect(
            getProductCardState({ quantity: 5, reorderPoint: 2 } as any)
        ).toBe('default');
    });

    it('marks products below the sale threshold as out of stock', () => {
        expect(isProductOutOfStock({ quantity: 0 } as any)).toBe(true);
        expect(isProductOutOfStock({ quantity: 1 } as any)).toBe(false);
    });

    it('builds badge tones and stock labels for premium card states', () => {
        expect(getProductStockBadgeTone({ quantity: 5 } as any)).toBe('neutral');
        expect(getProductStockBadgeTone({ quantity: 1, reorderPoint: 2 } as any)).toBe(
            'warning'
        );
        expect(getProductStockBadgeTone({ quantity: 0 } as any)).toBe('danger');

        expect(getProductStockLabel({ quantity: 5, unitOfMeasure: 'EA' } as any)).toBe(
            'In stock • 5'
        );
        expect(
            getProductStockLabel({
                quantity: 1.25,
                reorderPoint: 2,
                unitOfMeasure: 'LB',
            } as any)
        ).toBe('Low stock • 1.25 left');
        expect(getProductStockLabel({ quantity: 0, unitOfMeasure: 'EA' } as any)).toBe(
            'Out of stock'
        );
    });
});
