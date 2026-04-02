/* eslint-disable import/first */
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
        {
            id: 'p2',
            name: 'Bulk Bananas',
            description: 'weighed produce',
            barcode: null,
            sku: 'BAN-WEIGH',
            plu: '4015',
            price: 1.99,
            quantity: 50,
            unitOfMeasure: 'LB',
            isActive: true,
        },
        {
            id: 'p3',
            name: 'Weighted Test Item',
            description: 'weighted regression item',
            barcode: null,
            sku: 'WEIGHT-6165',
            plu: '6165',
            price: 2.99,
            quantity: 25,
            unitOfMeasure: 'LB',
            isActive: true,
        },
        {
            id: 'p4',
            name: 'Weighted EAN13 Item',
            description: 'weighted ean13 regression item',
            barcode: null,
            sku: 'WEIGHT-6245',
            plu: '6245',
            price: 4.25,
            quantity: 30,
            unitOfMeasure: 'LB',
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

    it('matches a weighted barcode by plu and derives quantity', () => {
        const res = ProductService.search(products, {
            text: '204015001990',
            onlyActive: true,
        });

        expect(res.items).toHaveLength(1);
        expect(res.items[0].id).toBe('p2');
        expect(res.allNumbers).toBe(true);
        expect(res.price).toBe(199);
        expect(res.quantity).toBeCloseTo(1, 5);
    });

    it('matches a weighted barcode when scanner sends prefixed mixed text', () => {
        const res = ProductService.search(products, {
            text: ']C1204015001990',
            onlyActive: true,
        });

        expect(res.items).toHaveLength(1);
        expect(res.items[0].id).toBe('p2');
        expect(res.allNumbers).toBe(true);
        expect(res.price).toBe(199);
        expect(res.quantity).toBeCloseTo(1, 5);
    });

    it('matches the weighed barcode regression sample 206165226181', () => {
        const res = ProductService.search(products, {
            text: '206165226181',
            onlyActive: true,
        });

        expect(res.items).toHaveLength(1);
        expect(res.items[0].id).toBe('p3');
        expect(res.items[0].plu).toBe('6165');
        expect(res.allNumbers).toBe(true);
        expect(res.price).toBe(2618);
        expect(res.quantity).toBeCloseTo(2618 / 100 / 2.99, 5);
    });

    it('matches the weighed barcode regression sample 0206245212998', () => {
        const res = ProductService.search(products, {
            text: '0206245212998',
            onlyActive: true,
        });

        expect(res.items).toHaveLength(1);
        expect(res.items[0].id).toBe('p4');
        expect(res.items[0].plu).toBe('6245');
        expect(res.allNumbers).toBe(true);
        expect(res.price).toBe(21299);
        expect(res.quantity).toBeCloseTo(21299 / 100 / 4.25, 5);
    });

    it('matches a product by direct plu search', () => {
        const res = ProductService.search(products, {
            text: '6165',
            onlyActive: true,
        });

        expect(res.items).toHaveLength(1);
        expect(res.items[0].id).toBe('p3');
        expect(res.allNumbers).toBe(true);
    });

    it('matches a product by partial plu text search', () => {
        const res = ProductService.search(products, {
            text: '616',
            onlyActive: true,
        });

        expect(res.items).toHaveLength(1);
        expect(res.items[0].id).toBe('p3');
        expect(res.allNumbers).toBe(false);
    });
});
