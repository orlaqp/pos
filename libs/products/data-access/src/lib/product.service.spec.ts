jest.mock('react-native', () => ({
    Alert: { alert: jest.fn() },
}));

import { ProductService } from './product.service';

describe('ProductService.search barcode handling', () => {
    const products = [
        {
            id: 'p1',
            name: 'Apple Fixture',
            description: 'fixture',
            barcode: '123456789012',
            sku: 'FIX-APPLE',
            plu: '1111',
            price: 2.49,
            quantity: 100,
            unitOfMeasure: 'EA',
            isActive: true,
        },
    ] as any;

    it('matches numeric barcode with trailing scanner newline', () => {
        const res = ProductService.search(products, {
            text: '123456789012\n',
            onlyActive: true,
        });

        expect(res.items).toHaveLength(1);
        expect(res.items[0].id).toBe('p1');
        expect(res.allNumbers).toBe(true);
    });

    it('matches numeric barcode when scanner sends prefixed mixed text', () => {
        const res = ProductService.search(products, {
            text: ']C1123456789012',
            onlyActive: true,
        });

        expect(res.items).toHaveLength(1);
        expect(res.items[0].id).toBe('p1');
        expect(res.allNumbers).toBe(true);
    });

    it('matches numeric barcode when scanner sends long prefix/suffix noise', () => {
        const res = ProductService.search(products, {
            text: 'SCAN:A1-XYZ-123456789012-END',
            onlyActive: true,
        });

        expect(res.items).toHaveLength(1);
        expect(res.items[0].id).toBe('p1');
        expect(res.allNumbers).toBe(true);
    });
});
