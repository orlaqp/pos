import { dedupeProducts } from './dedupe-products';

describe('dedupeProducts', () => {
    it('dedupes by barcode and keeps the most recently updated item', () => {
        const products = [
            {
                id: '1',
                barcode: '123',
                sku: null,
                plu: null,
                name: 'Apple',
                unitOfMeasure: 'EA',
                description: 'Fresh',
                updatedAt: '2026-03-01T10:00:00.000Z',
            },
            {
                id: '2',
                barcode: '123',
                sku: null,
                plu: null,
                name: 'Apple Duplicate',
                unitOfMeasure: 'EA',
                description: 'Fresh',
                updatedAt: '2026-03-01T11:00:00.000Z',
            },
        ] as any;

        const result = dedupeProducts(products);

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('2');
    });

    it('falls back to name+uom+description when no code exists', () => {
        const products = [
            {
                id: '1',
                barcode: '',
                sku: '',
                plu: '',
                name: 'Apple',
                unitOfMeasure: 'EA',
                description: 'Fresh',
                updatedAt: '2026-03-01T10:00:00.000Z',
            },
            {
                id: '2',
                barcode: '',
                sku: '',
                plu: '',
                name: ' apple ',
                unitOfMeasure: 'ea',
                description: ' fresh ',
                updatedAt: '2026-03-01T11:00:00.000Z',
            },
        ] as any;

        const result = dedupeProducts(products);

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('2');
    });

    it('keeps distinct products when dedupe keys are different', () => {
        const products = [
            {
                id: '1',
                barcode: '123',
                sku: '',
                plu: '',
                name: 'Apple',
                unitOfMeasure: 'EA',
                description: 'Fresh',
                updatedAt: '2026-03-01T10:00:00.000Z',
            },
            {
                id: '2',
                barcode: '456',
                sku: '',
                plu: '',
                name: 'Apple',
                unitOfMeasure: 'EA',
                description: 'Fresh',
                updatedAt: '2026-03-01T11:00:00.000Z',
            },
        ] as any;

        const result = dedupeProducts(products);

        expect(result).toHaveLength(2);
        expect(result.map((x) => x.id).sort()).toEqual(['1', '2']);
    });
});
