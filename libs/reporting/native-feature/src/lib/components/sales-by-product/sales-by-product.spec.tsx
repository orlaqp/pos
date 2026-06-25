import moment from 'moment';

import {
    normalizeSalesByProductRange,
    toSalesByProductRows,
} from './sales-by-product';

describe('SalesByProduct', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('normalizes report range to day boundaries', () => {
        const normalized = normalizeSalesByProductRange({
            startDate: moment('2026-03-10T13:00:00'),
            endDate: moment('2026-03-10T14:00:00'),
        } as any);

        expect(normalized.startDate.hour()).toBe(0);
        expect(normalized.endDate.hour()).toBe(23);
    });

    it('maps and sorts sales by product rows', () => {
        const rows = toSalesByProductRows(
            [
                { productId: 'p1', quantity: 4, sales: 12, tax: 0.9 } as any,
                { productId: 'p2', quantity: 10, sales: 25, tax: 1.5 } as any,
                { productId: 'p3', quantity: 2.345, sales: 7.5, tax: 0 } as any,
            ],
            [
                { lines: [{ productId: 'p1', productName: 'Apples' }] },
                { lines: [{ productId: 'p2', productName: 'Bread' }] },
                { lines: [{ productId: 'p3', productName: 'Flour' }] },
            ] as any
        );

        expect(rows).toEqual([
            { product: 'Bread', quantity: '10.00', sales: 25, tax: 1.5 },
            { product: 'Apples', quantity: '4.00', sales: 12, tax: 0.9 },
            { product: 'Flour', quantity: '2.35', sales: 7.5, tax: 0 },
        ]);
    });
});
