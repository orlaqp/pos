import React from 'react';
import moment from 'moment';
import { render } from '@testing-library/react-native';

import {
    normalizeSalesByProductRange,
    SalesByProduct,
    toSalesByProductRows,
} from './sales-by-product';

describe('SalesByProduct', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render successfully', () => {
        const { container } = render(<SalesByProduct />);
        expect(container).toBeTruthy();
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
            {
                products: [
                    { productName: 'Apples', unitOfMeasure: 'ea', quantity: 4 } as any,
                    { productName: 'Bread', unitOfMeasure: 'EA', quantity: 10 } as any,
                    { productName: 'Flour', unitOfMeasure: 'LB', quantity: 2.345 } as any,
                ],
            } as any
        );

        expect(rows).toEqual([
            { product: 'Bread', amount: '10.00' },
            { product: 'Apples', amount: '4.00' },
            { product: 'Flour', amount: '2.35' },
        ]);
    });
});
