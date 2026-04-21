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
                { productId: 'p1', quantity: 4 } as any,
                { productId: 'p2', quantity: 10 } as any,
                { productId: 'p3', quantity: 2.345 } as any,
            ],
            [
                { lines: [{ productId: 'p1', productName: 'Apples' }] },
                { lines: [{ productId: 'p2', productName: 'Bread' }] },
                { lines: [{ productId: 'p3', productName: 'Flour' }] },
            ] as any
        );

        expect(rows).toEqual([
            { product: 'Bread', amount: '10.00' },
            { product: 'Apples', amount: '4.00' },
            { product: 'Flour', amount: '2.35' },
        ]);
    });
});
